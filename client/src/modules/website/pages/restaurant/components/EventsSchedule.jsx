import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
  Loader2,
  BriefcaseBusiness,
  PartyPopper,
  HandPlatter,
  CalendarCheck2,
  Volume2,
  VolumeX,
  Image as ImageIcon,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
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
import {
  getEventsUpdated,
  getGroupBookings,
  getPropertyTypes,
} from "@/Api/Api";
import {
  createGroupBookingEnquiry,
  getGroupBookingHeaderByPropertyType,
} from "@/Api/RestaurantApi";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";
import { toast } from "react-hot-toast";
import { validateGroupBookingForm } from "@/lib/validation/reservationValidation";

import "swiper/css";
import "swiper/css/pagination";

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");
const isRestaurantType = (value = "") =>
  ["restaurant", "resturant"].includes(normalize(value));
const GROUP_BOOKING_ICONS = [
  PartyPopper,
  BriefcaseBusiness,
  CalendarCheck2,
  HandPlatter,
];
const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  persons: "",
  customQuery: "",
};

function formatDate(value) {
  if (!value) return "Upcoming";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Upcoming";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getGroupBookingIcon(index) {
  return GROUP_BOOKING_ICONS[index % GROUP_BOOKING_ICONS.length];
}

function normalizeHeaderRecords(payload) {
  const list = Array.isArray(payload) ? payload : payload ? [payload] : [];

  return [...list].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
}

function EventCard({ event, index }) {
  const media = event.media;
  const isVideo = media?.type === "VIDEO";
  const [isMuted, setIsMuted] = useState(true);
  const [naturalRatio, setNaturalRatio] = useState(
    media?.width && media?.height ? media.width / media.height : null,
  );
  const videoRef = useRef(null);
  const TARGET_RATIO = 1080 / 1920;
  const showFullMedia =
    naturalRatio === null || naturalRatio <= TARGET_RATIO + 0.1;
  const ctaLabel = event.ctaText?.trim() || "";
  const ctaTarget = event.ctaLink?.trim() || event.detailPath;
  const ctaExternal = Boolean(event.ctaLink?.trim());

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > 0) setNaturalRatio(naturalWidth / naturalHeight);
  };

  const handleVideoMeta = (e) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    if (videoHeight > 0) setNaturalRatio(videoWidth / videoHeight);
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative flex w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] 
aspect-[9/16] cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      {showFullMedia ? (
        <div className="relative h-full w-full">
          {media?.src ? (
            <>
              <img
                src={media.src}
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover"
                style={{ filter: "blur(18px)", opacity: 0.55 }}
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : null}

          {media?.src ? (
            isVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={media.src}
                  className="absolute inset-0 z-10 h-full w-full object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={handleVideoMeta}
                />
                <button
                  onClick={toggleMute}
                  className="absolute bottom-3 right-3 z-30 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </>
            ) : (
              <img
                src={media.src}
                alt={media?.alt || event.title}
                className="absolute inset-0 z-10 h-full w-full object-contain"
                onLoad={handleImageLoad}
              />
            )
          ) : (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-white/20" />
            </div>
          )}

          <div className="absolute left-3 top-3 z-20 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {isVideo ? "Reel" : "Event"}
          </div>

          <div className="absolute right-3 top-3 z-20 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <span>{event.location}</span>
            </div>
          </div>

          <div className="absolute inset-0 z-20 flex translate-y-2 flex-col justify-end bg-gradient-to-t from-black via-black/50 to-transparent p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="mb-3">
              <h3 className="line-clamp-2 text-sm font-bold text-white">
                {event.title}
              </h3>
              {event.description ? (
                <p className="mt-1 line-clamp-2 text-[10px] text-white/80">
                  {event.description}
                </p>
              ) : null}
            </div>
            {ctaLabel && (
              <Link
                to={ctaTarget}
                {...(ctaExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-primary/90 cursor-pointer">
                  {ctaLabel} <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-[280px] overflow-hidden bg-black">
            {media?.src ? (
              <>
                <img
                  src={media.src}
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover"
                  style={{ filter: "blur(14px)", opacity: 0.5 }}
                />
                <div className="absolute inset-0 bg-black/20" />
              </>
            ) : null}

            {isVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={media?.src}
                  className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={handleVideoMeta}
                />
                <button
                  onClick={toggleMute}
                  className="absolute bottom-3 right-3 z-30 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              </>
            ) : (
              <img
                src={media?.src}
                alt={media?.alt || event.title}
                className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                onLoad={handleImageLoad}
              />
            )}

            <div className="absolute left-3 top-3 z-20 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {isVideo ? "Reel" : "Event"}
            </div>

            <div className="absolute right-3 top-3 z-20 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-2 font-serif text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
              {event.title}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              <Calendar size={12} className="text-primary" />
              <span className="text-[11px] font-medium italic uppercase">
                {event.date}
              </span>
            </div>

            <p className="mt-3 line-clamp-3 text-[11px] italic text-muted-foreground">
              {event.description}
            </p>

            <div className="mt-auto border-t border-muted pt-4">
              {ctaLabel && (
                <Link
                  to={ctaTarget}
                  {...(ctaExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-primary/90">
                    {ctaLabel} <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function EventsSchedule({
  initialEvents,
  initialGroupBookings,
  initialRestaurantTypeId,
}) {
  const ssrEvents = Array.isArray(initialEvents) && initialEvents.length > 0;
  const ssrBookings =
    Array.isArray(initialGroupBookings) && initialGroupBookings.length > 0;
  const [swiper, setSwiper] = useState(null);
  const [events, setEvents] = useState(ssrEvents ? initialEvents : []);
  const [groupBookingItems, setGroupBookingItems] = useState(
    ssrBookings ? initialGroupBookings : [],
  );
  const [loading, setLoading] = useState(!(ssrEvents || ssrBookings));
  const [restaurantTypeId, setRestaurantTypeId] = useState(
    initialRestaurantTypeId ?? null,
  );
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupBookingHeader, setGroupBookingHeader] = useState(null);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: null }));
  };

  useEffect(() => {
    if (ssrEvents || ssrBookings) return;
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);

        const [typesResponse, eventsResponse, bookingsResponse] =
          await Promise.all([
            getPropertyTypes(),
            getEventsUpdated(),
            getGroupBookings(),
          ]);

        const propertyTypes = typesResponse?.data || typesResponse || [];
        const restaurantType = Array.isArray(propertyTypes)
          ? propertyTypes.find(
              (type) => type?.isActive && isRestaurantType(type?.typeName),
            )
          : null;
        const restaurantTypeId = restaurantType?.id
          ? Number(restaurantType.id)
          : null;
        setRestaurantTypeId(restaurantTypeId);

        const rawEvents = Array.isArray(eventsResponse?.data)
          ? eventsResponse.data
          : Array.isArray(eventsResponse)
            ? eventsResponse
            : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const mappedEvents = rawEvents
          .filter((item) => {
            const eventDate = new Date(item?.eventDate);
            eventDate.setHours(0, 0, 0, 0);
            const byTypeName = isRestaurantType(item?.typeName);
            const byTypeId =
              restaurantTypeId !== null &&
              Number(item?.propertyTypeId) === restaurantTypeId;

            return (
              item?.active === true &&
              normalize(item?.status) === "active" &&
              (byTypeName || byTypeId) &&
              !Number.isNaN(eventDate.getTime()) &&
              eventDate >= today
            );
          })
          .sort(
            (a, b) =>
              new Date(a?.eventDate).getTime() -
              new Date(b?.eventDate).getTime(),
          )
          .slice(0, 8)
          .map((item) => {
            const media = item?.image || item?.media?.[0] || null;
            let detailPath = "/events";
            try {
              detailPath = buildEventDetailPath(item);
            } catch (error) {
              detailPath = item?.slug ? `/events/${item.slug}` : "/events";
            }

            return {
              id: item?.id,
              title: item?.title || "Event",
              description: item?.description || "",
              date: formatDate(item?.eventDate),
              location: item?.locationName || "Restaurant Venue",
              detailPath,
              ctaText: item?.ctaText || "",
              ctaLink: item?.ctaLink || "",
              media: {
                type: media?.type || "IMAGE",
                src: media?.url || "",
                alt: media?.alt || item?.title || "Event media",
                width: media?.width ?? null,
                height: media?.height ?? null,
              },
            };
          })
          .filter((item) => item?.media?.src);

        const rawBookings = bookingsResponse?.data || bookingsResponse || [];
        const mappedBookings = (Array.isArray(rawBookings) ? rawBookings : [])
          .filter((item) => {
            if (item?.isActive === false) return false;
            if (item?.showOnHomepage !== true) return false;
            const byTypeName = isRestaurantType(item?.propertyTypeName);
            const byTypeId =
              restaurantTypeId !== null &&
              Number(item?.propertyTypeId) === restaurantTypeId;
            return byTypeName || byTypeId;
          })
          .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
          .slice(0, 4)
          .map((item) => ({
            id: item?.id,
            title: item?.title || "Group Booking",
            description: item?.description || null,
            ctaLink: item?.ctaLink || "",
            imageUrl: item?.media?.[0]?.url || null,
            propertyId: item?.propertyId || null,
            propertyName: item?.propertyName || null,
          }));

        setEvents(mappedEvents);
        setGroupBookingItems(mappedBookings);
      } catch (error) {
        console.error("Failed to load restaurant events/group bookings", error);
        setEvents([]);
        setGroupBookingItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, []);

  useEffect(() => {
    if (!restaurantTypeId) return;
    getGroupBookingHeaderByPropertyType(restaurantTypeId)
      .then((res) => {
        const latestActiveRecord =
          normalizeHeaderRecords(res?.data).find(
            (item) => item?.active === true,
          ) || null;
        setGroupBookingHeader(latestActiveRecord);
      })
      .catch(() => {
        setGroupBookingHeader(null);
      });
  }, [restaurantTypeId]);

  if (
    !loading &&
    events.length === 0 &&
    groupBookingItems.length === 0 &&
    !groupBookingHeader
  ) {
    return null;
  }

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

    if (!restaurantTypeId) {
      toast.error("Restaurant type is not available. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDates =
        Array.isArray(dateRange) && dateRange[0]
          ? `${dateRange[0].toLocaleDateString("en-IN")}${
              dateRange[1]
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
        propertyTypeId: Number(restaurantTypeId),
        ...(selectedOffer?.id ? { groupBookingId: selectedOffer.id } : {}),
        ...(selectedOffer?.propertyId
          ? { propertyId: Number(selectedOffer.propertyId) }
          : {}),
      });

      setStep(3);
    } catch (error) {
      console.error("Restaurant group booking enquiry failed:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="events" className="bg-muted py-10">
      <div className="mx-auto w-[92%] max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-serif md:text-3xl">
            Events & Group Bookings
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-primary" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-serif font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Upcoming Restaurant Events
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => swiper?.slidePrev()}
                  className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => swiper?.slideNext()}
                  className="rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex h-[420px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length > 0 ? (
              <Swiper
                modules={[Navigation, Autoplay]}
                slidesPerView={1.2}
                spaceBetween={20}
                breakpoints={{
                  640: { slidesPerView: 1.6 },
                  768: { slidesPerView: 2.2 },
                  1024: { slidesPerView: 2.4 },
                  1200: { slidesPerView: 2.5 }, // 👈 key line
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                onSwiper={setSwiper}
                className="!pb-2"
              >
                {events.map((event, index) => (
                  <SwiperSlide key={event.id || `${event.title}-${index}`}>
                    <EventCard event={event} index={index} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                No upcoming restaurant events available.
              </div>
            )}
          </div>

          <div className="flex h-full flex-col rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-serif font-semibold">
                Group Booking
              </h3>
            </div>

            <div className="space-y-3">
              {groupBookingItems.length > 0 ? (
                groupBookingItems.map((item, index) => {
                  const Icon = getGroupBookingIcon(index);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group overflow-hidden rounded-xl border border-border bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                    >
                      <div
                        className={`flex gap-3 p-3 ${item.description ? "items-start" : "items-center"}`}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          className="h-10 w-10 shrink-0 rounded-full"
                          onClick={() => openGroupBookingForm(item)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                  Group booking packages are not available right now.
                </div>
              )}
            </div>

            {groupBookingHeader && (
              <div className="relative mt-4 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900/10 via-white/55 to-amber-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-slate-900/5" />
                <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
                <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-rose-200/35 blur-3xl" />
                <div className="absolute right-[-20px] top-10 h-36 w-36 rounded-full bg-slate-400/20 blur-3xl" />
                <div className="absolute bottom-[-18px] right-8 h-36 w-36 rounded-full bg-amber-200/35 blur-3xl" />
                <div className="absolute bottom-10 left-8 h-24 w-24 rounded-full bg-sky-200/25 blur-3xl" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />

                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <Users className="h-8 w-8 text-primary/60" />
                  <p className="font-serif text-sm font-semibold text-foreground/80">
                    {groupBookingHeader.header}
                  </p>
                  {groupBookingHeader.description && (
                    <p className="text-[11px] text-muted-foreground">
                      {groupBookingHeader.description}
                    </p>
                  )}
                  {groupBookingHeader.ctaText && (
                    <Button
                      className="mt-1 h-auto rounded-full px-5 py-2 text-xs font-bold cursor-pointer"
                      onClick={() =>
                        openGroupBookingForm({
                          id: null,
                          title: "Restaurant Group Booking",
                        })
                      }
                    >
                      {groupBookingHeader.ctaText}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
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
                className="w-full"
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
                    Restaurant
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {selectedOffer.propertyName}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Fields marked{" "}
                <span className="text-red-500 font-semibold">*</span> are
                required.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Full Name <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">
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
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">
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
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">
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
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">
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
                className="w-full"
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
