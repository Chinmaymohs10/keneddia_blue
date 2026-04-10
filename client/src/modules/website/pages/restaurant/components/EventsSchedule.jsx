import { useEffect, useState } from "react";
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
import { getEventsUpdated, getGroupBookings, getPropertyTypes } from "@/Api/Api";
import { createGroupBookingEnquiry } from "@/Api/RestaurantApi";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";
import { toast } from "react-hot-toast";

import "swiper/css";
import "swiper/css/pagination";

const FALLBACK_GROUP_BOOKING_ITEMS = [
  {
    id: 1,
    title: "Private Dining Celebrations",
    description: "Birthdays, anniversaries and private celebration dining.",
    ctaLink: "",
  },
  {
    id: 2,
    title: "Corporate Lunch Packages",
    description: "Team lunches, client meets and executive dining setups.",
    ctaLink: "",
  },
  {
    id: 3,
    title: "Festive Group Reservations",
    description: "Seasonal group reservations with customizable menus.",
    ctaLink: "",
  },
];

const FALLBACK_EVENTS = [
  {
    id: "fallback-event-1",
    title: "Weekend Chef Special Tasting",
    description:
      "A curated tasting experience with signature seasonal courses.",
    date: "Upcoming",
    location: "Restaurant Venue",
    detailPath: "/events",
    media: {
      type: "IMAGE",
      src: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
      alt: "Restaurant event",
      width: null,
      height: null,
    },
  },
  {
    id: "fallback-event-2",
    title: "Live Kitchen Showcase",
    description:
      "Interactive service and chef table showcase for evening guests.",
    date: "Upcoming",
    location: "Restaurant Venue",
    detailPath: "/events",
    media: {
      type: "IMAGE",
      src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
      alt: "Live kitchen event",
      width: null,
      height: null,
    },
  },
];

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

function EventCard({ event, index }) {
  const media = event.media;
  const isVideo = media?.type === "VIDEO";
  const isReel =
    !!media?.width && !!media?.height && media.width / media.height <= 0.85;
  const showFullMedia = isVideo || isReel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative flex h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <div
        className={`relative overflow-hidden bg-card ${showFullMedia ? "h-full" : "h-[280px]"}`}
      >
        {isVideo ? (
          <video
            src={media?.src}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
              isReel ? "object-cover" : "object-cover"
            }`}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={media?.src}
            alt={media?.alt || event.title}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
              showFullMedia ? "object-cover" : "object-cover object-center"
            }`}
          />
        )}

        <div className="absolute left-3 top-3 z-10 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {isVideo ? "Reel" : "Event"}
        </div>

        <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {showFullMedia ? (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="mb-3">
            <h3 className="line-clamp-2 text-sm font-bold text-white">
              {event.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[10px] text-white/80">
              {event.description}
            </p>
          </div>
          <Link to={event.detailPath}>
            <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-primary/90">
              View Event <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
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
            <Link to={event.detailPath}>
              <Button className="h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-primary/90">
                View Event <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function EventsSchedule({ initialEvents, initialGroupBookings, initialRestaurantTypeId }) {
  const ssrEvents = Array.isArray(initialEvents) && initialEvents.length > 0;
  const ssrBookings = Array.isArray(initialGroupBookings) && initialGroupBookings.length > 0;
  const [swiper, setSwiper] = useState(null);
  const [events, setEvents] = useState(ssrEvents ? initialEvents : FALLBACK_EVENTS);
  const [groupBookingItems, setGroupBookingItems] = useState(
    ssrBookings ? initialGroupBookings : FALLBACK_GROUP_BOOKING_ITEMS,
  );
  const [loading, setLoading] = useState(!(ssrEvents || ssrBookings));
  const [restaurantTypeId, setRestaurantTypeId] = useState(initialRestaurantTypeId ?? null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            (a, b) => new Date(a?.eventDate).getTime() - new Date(b?.eventDate).getTime(),
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
            description: item?.description || "Custom group dining experience.",
            ctaLink: item?.ctaLink || "",
          }));

        setEvents(mappedEvents.length > 0 ? mappedEvents : FALLBACK_EVENTS);
        setGroupBookingItems(
          mappedBookings.length > 0
            ? mappedBookings
            : FALLBACK_GROUP_BOOKING_ITEMS,
        );
      } catch (error) {
        console.error("Failed to load restaurant events/group bookings", error);
        setEvents(FALLBACK_EVENTS);
        setGroupBookingItems(FALLBACK_GROUP_BOOKING_ITEMS);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, []);

  const openGroupBookingForm = (item) => {
    setSelectedOffer(item);
    setStep(1);
    setDateRange(null);
    setFormData(EMPTY_FORM);
  };

  const closeGroupBookingForm = () => {
    setSelectedOffer(null);
    setStep(1);
    setDateRange(null);
    setFormData(EMPTY_FORM);
  };

  const handleFinalSubmit = async () => {
    if (!restaurantTypeId) {
      toast.error("Restaurant type is not available. Please try again.");
      return;
    }
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast.error("Please fill in name, phone, and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDates =
        Array.isArray(dateRange) && dateRange[0]
          ? `${dateRange[0].toLocaleDateString("en-IN")}${
              dateRange[1] ? ` to ${dateRange[1].toLocaleDateString("en-IN")}` : ""
            }`
          : null;

      const queriesText = [
        `Guest Name: ${formData.name.trim()}`,
        `Phone Number: ${formData.phone.trim()}`,
        `Email Address: ${formData.email.trim()}`,
        selectedOffer?.title ? `Booking Package: ${selectedOffer.title}` : null,
        formattedDates ? `Preferred Dates: ${formattedDates}` : null,
        formData.persons ? `No. of Persons: ${formData.persons}` : null,
        formData.customQuery ? `Additional Info: ${formData.customQuery}` : null,
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
            ) : (
              <Swiper
                modules={[Navigation, Autoplay]}
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 2.2 },
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
              {groupBookingItems.map((item, index) => {
                const Icon = getGroupBookingIcon(index);
                return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group overflow-hidden rounded-xl border border-border bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start gap-3 p-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                        {item.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                        {item.description || "Multi-purpose group booking support."}
                      </p>
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
              })}
            </div>

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
                  Planning something bigger?
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Reach out for private dining, festive reservations, and custom
                  group experiences tailored to your event.
                </p>
                <Button
                  className="mt-1 h-auto rounded-full px-5 py-2 text-xs font-bold"
                  onClick={() =>
                    openGroupBookingForm({
                      id: null,
                      title: "Restaurant Group Booking",
                    })
                  }
                >
                  Enquire Now
                </Button>
              </div>
            </div>
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
              Share your preferred dates and contact details for this booking.
            </DialogDescription>
          </DialogHeader>
          {step === 1 ? (
            <div className="space-y-4">
              <UiCalendar selectRange value={dateRange} onChange={setDateRange} />
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!Array.isArray(dateRange) || !dateRange[0]}
              >
                Confirm Dates
              </Button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              <Input
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Phone number"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <Input
                placeholder="Email address"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <Input
                placeholder="No. of persons"
                type="number"
                min="1"
                value={formData.persons}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, persons: e.target.value }))
                }
              />
              <Textarea
                placeholder="Additional requirements"
                value={formData.customQuery}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customQuery: e.target.value,
                  }))
                }
                rows={4}
              />
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
              <p className="text-lg font-semibold text-green-600">Enquiry Sent!</p>
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
