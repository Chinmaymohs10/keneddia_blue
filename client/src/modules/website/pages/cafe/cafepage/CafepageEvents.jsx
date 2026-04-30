import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coffee,
  ExternalLink,
  Gift,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getPropertyTypes, getEventsUpdated, getDailyOffers, getGroupBookings } from "@/Api/Api";
import { getGroupBookingHeaderByPropertyType, createGroupBookingEnquiry } from "@/Api/RestaurantApi";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import UiCalendar from "@/components/ui/calendar";
import { toast } from "react-hot-toast";
import { validateGroupBookingForm } from "@/lib/validation/reservationValidation";

import "swiper/css";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  persons: "",
  customQuery: "",
};

const normalizeHeaderRecords = (payload) => {
  const list = Array.isArray(payload) ? payload : payload ? [payload] : [];
  return [...list].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
};

const getMediaSrc = (media) => {
  if (!media) return "";
  if (typeof media === "string") return media;
  return media.url || media.src || "";
};

const getMediaType = (media) => {
  if (!media) return "IMAGE";
  if (typeof media === "string") {
    const clean = media.split("?")[0].toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v)$/.test(clean) ? "VIDEO" : "IMAGE";
  }
  return (media.type || "IMAGE").toUpperCase();
};

const normalizeCtaUrl = (url = "") => {
  const clean = String(url || "").trim();
  if (!clean) return "";
  if (/^(https?:|mailto:|tel:)/i.test(clean)) return clean;
  if (clean.startsWith("//")) return `https:${clean}`;
  if (/^(www\.)?(instagram\.com|youtube\.com|youtu\.be|facebook\.com)\//i.test(clean)) {
    return `https://${clean.replace(/^https?:\/\//i, "")}`;
  }
  return clean;
};

// ── Shared Card ───────────────────────────────────────────────────────────────

function ShowcaseCard({ item }) {
  const navigate = useNavigate();
  const linkPath = item.type === "Offer" || item.type === "Event"
    ? (item.detailPath || `/cafe/${item.slug}`)
    : `/cafe/${item.slug}`;
  const rawCtaHref =
    item?.type === "Event"
      ? item?.detailPath || item?.ctaLink || item?.ctaUrl || (item?.slug ? `/events/${item.slug}` : null)
      : item?.ctaLink || item?.ctaUrl || linkPath;
  const ctaHref = normalizeCtaUrl(rawCtaHref);
  const isExternalCta =
    typeof ctaHref === "string" &&
    (/^(https?:|mailto:|tel:)/i.test(ctaHref) || /^(www\.)?(instagram\.com|youtube\.com|youtu\.be|facebook\.com)\//i.test(ctaHref));
  const mediaSrc = getMediaSrc(item?.image);
  const mediaType = getMediaType(item?.image);
  const isEventCard = item?.type === "Event";

  const handleCardClick = () => {
    if (!isEventCard || !ctaHref) return;
    if (isExternalCta) {
      window.open(ctaHref, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(ctaHref);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative mx-auto flex w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] aspect-[9/16] cursor-pointer flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-full w-full overflow-hidden">
        {mediaType === "VIDEO" ? (
          <video
            src={mediaSrc}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={mediaSrc}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      <div className="absolute left-3 top-3 z-10 rounded bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {item.type}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
        <div className="flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          <span>{item.location}</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-4">
        <h3 className="font-serif text-base font-bold leading-snug text-white line-clamp-2">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-white/70">
          <Calendar size={11} className="text-primary" />
          <span className="text-[11px] font-medium italic uppercase">{item.date}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[11px] italic text-white/65">
          {item.description}
        </p>
        {item.ctaText && (
          <Link
            to={ctaHref || linkPath}
            className="mt-4"
            {...(isExternalCta ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={(event) => event.stopPropagation()}
          >
            <Button className="h-auto w-full cursor-pointer rounded-lg bg-white/15 py-2.5 text-xs font-bold text-white shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-black border border-white/20">
              {item.ctaText} <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Carousel Column ────────────────────────────────────────────────────────────

function CarouselColumn({ title, icon: Icon, items }) {
  const [swiper, setSwiper] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </h3>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No {title.toLowerCase()} available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => swiper?.slidePrev()}
            className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => swiper?.slideNext()}
            className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSwiper={setSwiper}
        className="w-full flex-1"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <ShowcaseCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// ── Group Booking Column ───────────────────────────────────────────────────────

function GroupBookingColumn({ items = [], openGroupBookingForm }) {
  const [groupBookingHeader, setGroupBookingHeader] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGroupBookingHeader = async () => {
      try {
        const typesResponse = await getPropertyTypes();
        const propertyTypes = typesResponse?.data || typesResponse || [];
        const cafeType = Array.isArray(propertyTypes)
          ? propertyTypes.find(
            (type) => type?.isActive && type?.typeName?.toLowerCase() === "cafe",
          )
          : null;

        if (!cafeType?.id) return;

        const headerResponse = await getGroupBookingHeaderByPropertyType(
          Number(cafeType.id),
        );
        const latestActiveRecord =
          normalizeHeaderRecords(headerResponse?.data).find(
            (item) => item?.active === true,
          ) || null;

        if (isMounted) {
          setGroupBookingHeader(latestActiveRecord);
        }
      } catch {
        if (isMounted) {
          setGroupBookingHeader(null);
        }
      }
    };

    fetchGroupBookingHeader();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
      <div className="mb-5 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold">Group Booking</h3>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group overflow-hidden rounded-xl border border-border bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/30 bg-muted shadow-sm flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full cursor-pointer"
                  onClick={() => openGroupBookingForm(item)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No group bookings available.
          </div>
        )}
      </div>

      {/* Glassmorphism CTA */}
      <div className="relative mt-4 flex-1 overflow-hidden rounded-2xl border border-[#DCDCD8] bg-linear-to-br from-[#ECECE8] via-white to-[#F7F7F5] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-white/55 via-white/20 to-[#E8E8E4]/55" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
        <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-[#E1E1DD]/70 blur-3xl" />
        <div className="absolute right-[-18px] top-8 h-32 w-32 rounded-full bg-[#D8D8D4]/35 blur-3xl" />
        <div className="absolute -bottom-4 right-8 h-32 w-32 rounded-full bg-[#E8E8E4]/70 blur-3xl" />
        <div className="absolute bottom-8 left-6 h-20 w-20 rounded-full bg-[#F5F5F3]/85 blur-3xl" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <Users className="h-8 w-8 text-primary/60" />
          <p className="font-serif text-sm font-semibold text-[#2F2F2B]">
            {groupBookingHeader?.header || "Planning something bigger?"}
          </p>
          <p className="text-[11px] text-[#5A5A56]">
            {groupBookingHeader?.description ||
              "Reach out for bespoke group experiences, private dining, and exclusive cafe takeovers."}
          </p>
          <Button
            onClick={() =>
              openGroupBookingForm({
                id: null,
                title: groupBookingHeader?.header || "Cafe Group Booking",
              })
            }
            className="mt-1 h-auto rounded-full px-5 py-2 text-xs font-bold cursor-pointer"
          >
            {groupBookingHeader?.ctaText || "Enquire Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export default function CafepageEvents({
  initialEvents = [],
  initialOffers = [],
  initialGroupBookings = [],
  initialCafeTypeId,
}) {
  const ssrEvents = Array.isArray(initialEvents) && initialEvents.length > 0;
  const ssrOffers = Array.isArray(initialOffers) && initialOffers.length > 0;
  const ssrBookings = Array.isArray(initialGroupBookings) && initialGroupBookings.length > 0;

  const [events, setEvents] = useState(ssrEvents ? initialEvents : []);
  const [offers, setOffers] = useState(ssrOffers ? initialOffers : []);
  const [groupBookings, setGroupBookings] = useState(ssrBookings ? initialGroupBookings : []);
  const [loading, setLoading] = useState(!(ssrEvents || ssrOffers || ssrBookings));

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: null }));
  };

  const openGroupBookingForm = (item) => {
    setSelectedOffer(item);
    setStep(1);
    setDateRange(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const closeGroupBookingForm = () => {
    setSelectedOffer(null);
    setStep(1);
    setDateRange(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleFinalSubmit = async () => {
    const errs = validateGroupBookingForm(formData);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    setIsSubmitting(true);
    try {
      const formattedDates =
        Array.isArray(dateRange) && dateRange[0]
          ? `${dateRange[0].toLocaleDateString("en-IN")}${dateRange[1]
            ? ` to ${dateRange[1].toLocaleDateString("en-IN")}`
            : ""
          }`
          : null;

      const queriesText = [
        `Guest Name: ${formData.name.trim()}`,
        `Phone Number: ${formData.phone.trim()}`,
        `Email Address: ${formData.email.trim()}`,
        selectedOffer?.title ? `Booking Package: ${selectedOffer.title}` : null,
        formattedDates ? `Preferred Dates: ${formattedDates}` : null,
        formData.persons ? `No. of Persons: ${formData.persons}` : null,
        formData.customQuery
          ? `Additional Info: ${formData.customQuery}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      await createGroupBookingEnquiry({
        name: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        emailAddress: formData.email.trim(),
        queries: queriesText || null,
        enquiryDate: new Date().toISOString().split("T")[0],
        propertyTypeId: initialCafeTypeId ? Number(initialCafeTypeId) : undefined,
        ...(selectedOffer?.id ? { groupBookingId: selectedOffer.id } : {}),
        ...(selectedOffer?.propertyId
          ? { propertyId: Number(selectedOffer.propertyId) }
          : {}),
      });

      setStep(3);
    } catch (error) {
      console.error("Cafe group booking enquiry failed:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (ssrEvents && ssrOffers && ssrBookings) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        let cafeTypeId = initialCafeTypeId;
        if (!cafeTypeId) {
          const typesRes = await getPropertyTypes();
          const propertyTypes = typesRes?.data || typesRes || [];
          const cafeType = Array.isArray(propertyTypes)
            ? propertyTypes.find((t) => t?.isActive && t?.typeName?.toLowerCase().trim() === "cafe")
            : null;
          cafeTypeId = cafeType?.id ? Number(cafeType.id) : null;
        }

        const [eventsRes, offersRes, bookingsRes] = await Promise.all([
          getEventsUpdated(),
          getDailyOffers({ page: 0, size: 50 }),
          getGroupBookings(),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rawEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : Array.isArray(eventsRes) ? eventsRes : [];
        const mappedEvents = rawEvents.filter((item) => {
          const eventDate = new Date(item?.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          const byTypeName = (item?.typeName || "").toLowerCase().trim() === "cafe";
          const byTypeId = cafeTypeId != null && Number(item?.propertyTypeId) === cafeTypeId;
          return item?.active && item?.status?.toLowerCase() === "active" && (byTypeName || byTypeId) && eventDate >= today;
        }).sort((a, b) => new Date(a?.eventDate) - new Date(b?.eventDate)).slice(0, 8).map(item => ({
          id: item?.id,
          type: "Event",
          title: item?.title || "Event",
          description: item?.description || "",
          image: item?.image?.url
            ? { url: item.image.url, type: item?.image?.type || "IMAGE" }
            : item?.media?.[0]?.url
              ? { url: item.media[0].url, type: item?.media?.[0]?.type || "IMAGE" }
              : null,
          date: item?.eventDate ? new Date(item.eventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Upcoming",
          location: item?.locationName || "Cafe Venue",
          detailPath: (() => {
            try {
              return buildEventDetailPath(item);
            } catch {
              return item?.slug ? `/events/${item.slug}` : `/events/${item?.id || ""}`;
            }
          })(),
          ctaText: item?.ctaText || "",
          ctaLink: item?.ctaLink || "",
        })).filter(i => getMediaSrc(i.image));

        const now = Date.now();
        const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const todayName = days[new Date().getDay()];

        const rawOffers = offersRes?.data?.data || offersRes?.data || [];
        const offersList = Array.isArray(rawOffers) ? rawOffers : rawOffers.content || [];
        const mappedOffers = offersList.filter(offer => {
          let notExpired = true;
          if (offer.expiresAt) {
            const expiry = new Date(offer.expiresAt);
            expiry.setHours(23, 59, 59, 999);
            notExpired = expiry.getTime() > now;
          }
          const isDayActive = !offer.activeDays?.length || offer.activeDays.includes(todayName);
          const byTypeName = (offer.propertyTypeName || "").toLowerCase().trim() === "cafe";
          const byTypeId = cafeTypeId != null && Number(offer.propertyTypeId) === cafeTypeId;
          return offer.isActive && offer.showOnHomepage && isDayActive && notExpired && (byTypeName || byTypeId);
        }).map(offer => ({
          id: offer.id,
          type: "Offer",
          title: offer.title || "Special Offer",
          description: offer.description || "",
          image: offer.image?.url
            ? { url: offer.image.url, type: offer?.image?.type || "IMAGE" }
            : null,
          date: offer.expiresAt ? `Valid until ${new Date(offer.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : "Limited Time",
          location: offer.locationName || "All Outlets",
          slug: offer.slug || `offer-${offer.id}`,
          ctaText: offer.ctaText || "",
          ctaLink: offer.ctaLink || "",
        })).filter(i => getMediaSrc(i.image));

        const rawBookings = bookingsRes?.data || bookingsRes || [];
        const mappedBookings = (Array.isArray(rawBookings) ? rawBookings : []).filter(item => {
          if (item?.isActive === false) return false;
          const byTypeName = (item?.propertyTypeName || "").toLowerCase().trim() === "cafe";
          const byTypeId = cafeTypeId != null && Number(item?.propertyTypeId) === cafeTypeId;
          return byTypeName || byTypeId;
        }).sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0)).slice(0, 3).map(item => ({
          id: item?.id,
          title: item?.title || "Group Booking",
          description: item?.description || "",
          image: item?.media?.[0]?.url || "",
          ctaLink: item?.ctaLink || "",
          slug: item?.slug || `group-${item?.id}`,
        })).filter(i => i.image);

        setEvents(mappedEvents);
        setOffers(mappedOffers);
        setGroupBookings(mappedBookings);
      } catch (err) {
        console.error("Failed fetching for CafepageEvents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ssrEvents, ssrOffers, ssrBookings, initialCafeTypeId]);

  return (
    <section id="events" className="bg-[#ECECE8] py-10 dark:bg-muted">
      <div className="mx-auto w-[92%] max-w-7xl">
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl">Offers, Events & Group Booking</h2>
          <div className="mt-3 h-0.5 w-16 bg-primary" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CarouselColumn title="Offers" icon={Gift} items={offers} />
          <CarouselColumn title="Events" icon={Sparkles} items={events} />
          <GroupBookingColumn items={groupBookings} openGroupBookingForm={openGroupBookingForm} />
        </div>
      </div>

      <Dialog
        open={!!selectedOffer}
        onOpenChange={(open) => {
          if (!open) closeGroupBookingForm();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selectedOffer?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedOffer?.propertyName
                ? `Booking at ${selectedOffer.propertyName} — share your preferred dates and contact details.`
                : "Share your preferred dates and contact details for this booking."}
            </DialogDescription>
          </DialogHeader>
          {step === 1 ? (
            <div className="space-y-4">
              <UiCalendar
                selectRange
                value={dateRange}
                onChange={setDateRange}
              />
              <Button
                className="w-full cursor-pointer"
                onClick={() => setStep(2)}
                disabled={!Array.isArray(dateRange) || !dateRange[0]}
              >
                Confirm Dates
              </Button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-3">
              {selectedOffer?.propertyName && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Cafe
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {selectedOffer.propertyName}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Fields marked{" "}
                <span className="font-semibold text-red-500">*</span> are
                required.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Full Name <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                    (letters only)
                  </span>
                </label>
                <Input
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={
                    formErrors.name
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  }
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Phone Number <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                    (10 digits)
                  </span>
                </label>
                <Input
                  placeholder="10-digit mobile number"
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) =>
                    setField("phone", e.target.value.replace(/\D/g, ""))
                  }
                  className={
                    formErrors.phone
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  }
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="name@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className={
                    formErrors.email
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  }
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  No. of Persons
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  placeholder="e.g. 50"
                  type="number"
                  min="1"
                  value={formData.persons}
                  onChange={(e) => setField("persons", e.target.value)}
                  className={
                    formErrors.persons
                      ? "border-red-500 focus-visible:ring-red-400"
                      : ""
                  }
                />
                {formErrors.persons && (
                  <p className="text-xs text-red-500">{formErrors.persons}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Additional Requirements
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Textarea
                  placeholder="Any special requirements or notes..."
                  value={formData.customQuery}
                  onChange={(e) => setField("customQuery", e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full cursor-pointer"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Send Enquiry"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2 py-8 text-center">
              <p className="text-lg font-semibold text-green-600">
                Enquiry Sent!
              </p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll get back to you shortly.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
