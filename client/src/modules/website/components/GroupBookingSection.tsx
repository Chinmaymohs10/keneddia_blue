import { useState, useEffect, useRef } from "react";
import {
  Users,
  Sparkles,
  MapPin,
  ExternalLink,
  Image as ImageIcon,
  ArrowRight,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import Calendar from "@/components/ui/calendar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { getEventsUpdated, getGroupBookings, getPropertyTypes } from "@/Api/Api";
import {
  createGroupBookingEnquiry,
  getGroupBookingHeaderByPropertyType,
} from "@/Api/RestaurantApi";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";
import { toast } from "react-hot-toast";
import { validateGroupBookingForm } from "@/lib/validation/reservationValidation";

/* ================= TYPES ================= */
type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  id: number;
  title: string;
  locationName: string;
  eventDate: string;
  description: string;
  status: "ACTIVE" | "COMING_SOON" | "SOLD_OUT";
  ctaText: string;
  ctaLink: string | null;
  image?: {
    type?: "IMAGE" | "VIDEO";
    url: string;
    width?: number | null;
    height?: number | null;
    fileName?: string | null;
    alt?: string | null;
  } | null;
  typeName: string;
  active: boolean;
}

interface GroupBooking {
  id: number;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  propertyTypeName: string | null;
  media: { mediaId: number; type: string; url: string }[];
}

interface GroupBookingSectionProps {
  propertyTypeId?: number | null;
  initialEvents?: Event[];
  initialGroupBookings?: GroupBooking[];
  variant?: "standalone" | "showcase";
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  persons: "",
  customQuery: "",
};

/* ================= HELPERS ================= */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
};

const ICON_COLORS = [
  "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800/60",
  "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60",
  "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60",
  "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60",
  "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/60",
];

const normalizeHeaderRecords = (payload: any) => {
  const list = Array.isArray(payload) ? payload : payload ? [payload] : [];
  return [...list].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
};

/* ================= EVENT CARD ================= */
function EventCard({ event, index }: { event: Event; index: number }) {
  const navigate = useNavigate();
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo =
    event.image?.type === "VIDEO" || event.image?.url?.includes(".mp4");

  const analyzeMediaSize = (w: number, h: number) => {
    if (w / h <= 0.85) setIsBanner(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const { day, month } = formatDate(event.eventDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      onClick={() => navigate(buildEventDetailPath(event))}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group h-[520px] bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl cursor-pointer"
    >
      <div
        className={`relative overflow-hidden transition-all duration-500 ${
          isBanner ? "h-full" : "h-[220px]"
        } flex items-start justify-center bg-card`}
      >
        {event.image?.url ? (
          isVideo ? (
            <>
              <video
                ref={videoRef}
                src={event.image.url}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                autoPlay
                loop
                muted
                playsInline
                onLoadedMetadata={(e) =>
                  analyzeMediaSize(
                    e.currentTarget.videoWidth,
                    e.currentTarget.videoHeight,
                  )
                }
              />
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </>
          ) : (
            <img
              src={event.image.url}
              alt={event.image.alt || event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onLoad={(e) =>
                analyzeMediaSize(
                  e.currentTarget.naturalWidth,
                  e.currentTarget.naturalHeight,
                )
              }
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}

        <div className="absolute top-4 left-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/10">
          <span className="text-lg font-black leading-none">{day}</span>
          <span className="text-[9px] font-bold tracking-tighter">{month}</span>
        </div>

        <div className="absolute top-4 right-4 z-20 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1">
          <MapPin size={10} /> {event.locationName}
        </div>

        {isBanner && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <h3 className="text-white font-serif font-bold text-xl mb-2">
              {event.title}
            </h3>
            <p className="text-white/80 text-xs mb-6 line-clamp-2 italic">
              {event.description}
            </p>
            {event.ctaText?.trim() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  // If external link exists → open it
                  if (event.ctaLink) {
                    window.open(event.ctaLink, "_blank");
                  } else {
                    // Otherwise navigate internally
                    navigate(buildEventDetailPath(event));
                  }
                }}
                className="w-full bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform hover:opacity-90"
              >
                {event.ctaText} <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {!isBanner && (
        <div className="p-6 flex flex-col flex-1 bg-card">
          <h3 className="text-lg font-serif font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-2 mb-3">
            <MapPin size={12} className="text-primary" />
            <span className="text-[11px] font-medium italic uppercase">
              {event.locationName}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {event.description}
          </p>
          {event.ctaText?.trim() && (
            <div className="mt-auto pt-4 border-t border-dashed border-border">
              <a
                href={event.ctaLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform hover:opacity-90"
              >
                {event.ctaText} <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function GroupBookingSection({
  propertyTypeId: initialPropertyTypeId = null,
  initialEvents = [],
  initialGroupBookings = [],
  variant = "standalone",
}: GroupBookingSectionProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [groupBookings, setGroupBookings] =
    useState<GroupBooking[]>(initialGroupBookings);
  const [loading, setLoading] = useState(
    initialEvents.length === 0 && initialGroupBookings.length === 0,
  );
  const [selectedOffer, setSelectedOffer] = useState<GroupBooking | null>(null);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<CalendarValue>(null);
  const [propertyTypeId, setPropertyTypeId] = useState<number | null>(
    initialPropertyTypeId,
  );
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupBookingHeader, setGroupBookingHeader] = useState<any>(null);

  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: null }));
  };

  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: null }));
  };

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    setPropertyTypeId(initialPropertyTypeId);
  }, [initialPropertyTypeId]);

  useEffect(() => {
    if (propertyTypeId) return;

    const resolveHotelTypeId = async () => {
      try {
        const response = await getPropertyTypes();
        const types = response?.data || response || [];
        const hotelType = Array.isArray(types)
          ? types.find(
              (type: any) =>
                type?.isActive && type?.typeName?.toLowerCase() === "hotel",
            )
          : null;

        if (hotelType?.id) {
          setPropertyTypeId(Number(hotelType.id));
        }
      } catch (error) {
        console.error("Failed to resolve hotel property type:", error);
      }
    };

    resolveHotelTypeId();
  }, [propertyTypeId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventResponse, bookingResponse] = await Promise.all([
          getEventsUpdated(),
          getGroupBookings(),
        ]);

        const rawEvents = Array.isArray(eventResponse?.data)
          ? eventResponse.data
          : Array.isArray(eventResponse)
            ? eventResponse
            : [];
        const rawBookings = bookingResponse?.data || bookingResponse || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setEvents(
          rawEvents
            .filter((e: Event) => {
              const eventDate = new Date(e.eventDate);
              eventDate.setHours(0, 0, 0, 0);

              return (
                e.typeName === "Hotel" &&
                e.status === "ACTIVE" &&
                e.active === true &&
                eventDate >= today // ✅ remove expired events
              );
            })
            .sort(
              (a: Event, b: Event) =>
                new Date(a.eventDate).getTime() -
                new Date(b.eventDate).getTime(), // upcoming first
            ),
        );

        // Filter: Exclude "Restaurant", include everything else (including null)
        // Sort: latest first (ID descending)
        const filteredBookings = (Array.isArray(rawBookings) ? rawBookings : [])
          .filter((b: GroupBooking) =>
            (b as any)?.isActive !== false &&
            (propertyTypeId
              ? b.propertyTypeName === "Restaurant"
                ? false
                : (b as any).propertyTypeId == null ||
                  Number((b as any).propertyTypeId) === Number(propertyTypeId)
              : b.propertyTypeName !== "Restaurant"),
          )
          .sort((a, b) => b.id - a.id);

        setGroupBookings(filteredBookings);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyTypeId]);

  useEffect(() => {
    if (!propertyTypeId) return;

    getGroupBookingHeaderByPropertyType(propertyTypeId)
      .then((res) => {
        const latestActiveRecord =
          normalizeHeaderRecords(res?.data).find((item) => item?.active === true) ||
          null;
        setGroupBookingHeader(latestActiveRecord);
      })
      .catch(() => {
        setGroupBookingHeader(null);
      });
  }, [propertyTypeId]);

  const handleFinalSubmit = async () => {
    if (!propertyTypeId) {
      toast.error("Hotel type is not available. Please try again.");
      return;
    }

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
        propertyTypeId: Number(propertyTypeId),
        ...(selectedOffer?.id ? { groupBookingId: selectedOffer.id } : {}),
      });

      setStep(3);
    } catch (error) {
      console.error("Group booking enquiry failed:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(groupBookings.length / itemsPerPage);
  const paginatedBookings = groupBookings.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );
  const showcaseBookings = groupBookings.slice(0, 3);
  const visibleBookings =
    variant === "showcase" ? showcaseBookings : paginatedBookings;

  return (
    <section
      className={variant === "showcase" ? "contents" : "py-10 bg-background"}
    >
      <div
        className={
          variant === "showcase" ? "contents" : "w-[92%] max-w-7xl mx-auto"
        }
      >
        <div className={variant === "showcase" ? "hidden" : "text-center mb-8"}>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-2">
            Events & Celebrations
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mb-3" />
        </div>

        <div
          className={
            variant === "showcase"
              ? "contents"
              : "grid grid-cols-1 lg:grid-cols-12 gap-6"
          }
        >
          {/* LEFT: EVENTS */}
          <div className={variant === "showcase" ? "min-w-0" : "lg:col-span-8"}>
            <div className="bg-card border rounded-2xl p-5 h-full min-w-0 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Upcoming Events
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => swiper?.slidePrev()}
                    className="p-2 rounded-full border border-border bg-background hover:bg-muted shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => swiper?.slideNext()}
                    className="p-2 rounded-full border border-border bg-background hover:bg-muted shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-primary w-7 h-7" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No upcoming hotel events available.
                </div>
              ) : (
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={16}
                  slidesPerView={1}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  pagination={{ clickable: true }}
                  onSwiper={setSwiper}
                  breakpoints={
                    variant === "showcase"
                      ? undefined
                      : {
                          640: { slidesPerView: 2 },
                          1024: { slidesPerView: 2.4 }, // slightly wider cards
                        }
                  }
                  className="!pb-10 w-full min-w-0"
                >
                  {events.map((event, index) => (
                    <SwiperSlide key={event.id} className="min-w-0">
                      <EventCard event={event} index={index} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>

          {/* RIGHT: GROUP BOOKINGS */}
          <div className={variant === "showcase" ? "min-w-0" : "lg:col-span-4"}>
            <div className="bg-card border rounded-2xl p-5 h-full min-w-0 flex flex-col overflow-hidden">
              <div
                className={
                  variant === "showcase"
                    ? "mb-5 flex items-center gap-2"
                    : "flex justify-between items-center mb-4"
                }
              >
                <h3
                  className={
                    variant === "showcase"
                      ? "flex items-center gap-2 font-serif text-lg font-semibold"
                      : "text-xl font-serif font-semibold flex gap-2"
                  }
                >
                  <Users className="w-5 h-5 text-primary" /> Group Booking
                </h3>
                {variant !== "showcase" && totalPages > 1 && (
                  <div className="flex gap-1">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="p-1 rounded bg-muted disabled:opacity-30"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="p-1 rounded bg-muted disabled:opacity-30"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {groupBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm flex-1">
                  No group booking packages available.
                </div>
              ) : (
                <div
                  className={
                    variant === "showcase" ? "space-y-3" : "space-y-3 flex-1"
                  }
                >
                  {visibleBookings.map((booking, index) => {
                    const iconColorCls = ICON_COLORS[index % ICON_COLORS.length];

                    return variant === "showcase" ? (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.07 }}
                        onClick={() => {
                          setSelectedOffer(booking);
                          setStep(1);
                          setDateRange(null);
                          setFormData(EMPTY_FORM);
                        }}
                        className="group overflow-hidden rounded-xl border border-border bg-background cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/30 bg-muted shadow-sm">
                            {booking.media?.[0]?.url ? (
                              <img
                                src={booking.media[0].url}
                                alt={booking.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div
                                className={`flex h-full w-full items-center justify-center ${iconColorCls}`}
                              >
                                <ImageIcon className="h-5 w-5 opacity-60" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                              {booking.title}
                            </p>

                            {booking.description && (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                                {booking.description}
                              </p>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-full"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div
                        key={booking.id}
                        onClick={() => {
                          setSelectedOffer(booking);
                          setStep(1);
                          setDateRange(null);
                          setFormData(EMPTY_FORM);
                        }}
                        className="group overflow-hidden rounded-xl border border-border bg-background cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div
                            className={`w-12 h-12 shrink-0 rounded-full border overflow-hidden flex items-center justify-center shadow-sm ${iconColorCls}`}
                          >
                            {booking.media?.[0]?.url ? (
                              <img
                                src={booking.media[0].url}
                                alt={booking.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 opacity-60" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-1 transition-colors group-hover:text-primary">
                              {booking.title}
                            </p>

                            {booking.description && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                {booking.description}
                              </p>
                            )}

                            {booking.ctaLink && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-1.5 uppercase tracking-tight">
                                {booking.ctaText || "Details"}{" "}
                                <ExternalLink size={9} />
                              </span>
                            )}
                          </div>

                          <ArrowRight
                            size={14}
                            className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {variant === "showcase" && groupBookings.length > 0 && (
                <div className="relative mt-4 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900/10 via-white/55 to-amber-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-slate-900/5" />
                  <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
                  <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-rose-200/40 blur-3xl" />
                  <div className="absolute right-[-18px] top-8 h-32 w-32 rounded-full bg-slate-400/20 blur-3xl" />
                  <div className="absolute bottom-[-16px] right-8 h-32 w-32 rounded-full bg-amber-200/35 blur-3xl" />
                  <div className="absolute bottom-8 left-6 h-20 w-20 rounded-full bg-sky-200/30 blur-3xl" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />

                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <Users className="h-8 w-8 text-primary/60" />
                    <p className="font-serif text-sm font-semibold text-foreground/80">
                      {groupBookingHeader?.header || "Planning something bigger?"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {groupBookingHeader?.description ||
                        "Reach out for tailored celebrations, corporate stays, and exclusive hotel gathering packages."}
                    </p>
                    <Button
                      type="button"
                      className="mt-1 h-auto rounded-full px-5 py-2 text-xs font-bold"
                      onClick={() => {
                        setSelectedOffer(showcaseBookings[0] ?? groupBookings[0] ?? null);
                        setStep(1);
                        setDateRange(null);
                        setFormData(EMPTY_FORM);
                      }}
                    >
                      {groupBookingHeader?.ctaText || "Enquire Now"}
                    </Button>
                  </div>
                </div>
              )}
              {variant !== "showcase" && totalPages > 1 && (
                <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase">
                  Page {currentPage + 1} of {totalPages}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedOffer}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOffer(null);
            setStep(1);
            setDateRange(null);
            setFormData(EMPTY_FORM);
          }
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
              <Calendar selectRange value={dateRange} onChange={setDateRange} />
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
              <p className="text-[11px] text-muted-foreground">
                Fields marked <span className="text-red-500 font-semibold">*</span> are required.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Full Name <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">(letters only)</span>
                </label>
                <Input
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={formErrors.name ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Phone Number <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">(10 digits)</span>
                </label>
                <Input
                  placeholder="10-digit mobile number"
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setField("phone", e.target.value.replace(/\D/g, ""))}
                  className={formErrors.phone ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
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
                  className={formErrors.email ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  No. of Persons
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. 50"
                  type="number"
                  min="1"
                  value={formData.persons}
                  onChange={(e) => setField("persons", e.target.value)}
                  className={formErrors.persons ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {formErrors.persons && <p className="text-xs text-red-500">{formErrors.persons}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">
                  Additional Requirements
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">(optional)</span>
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
            <div className="py-8 text-center space-y-2">
              <p className="text-lg font-semibold text-green-600">
                Enquiry Sent!
              </p>
              <p className="text-sm text-muted-foreground">
                We'll get back to you shortly.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
