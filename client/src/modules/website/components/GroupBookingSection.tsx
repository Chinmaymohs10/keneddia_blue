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
import { createGroupBookingEnquiry } from "@/Api/RestaurantApi";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";
import { toast } from "react-hot-toast";

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

const CARD_COLORS = [
  "bg-pink-50 border-pink-200 hover:border-pink-300 dark:bg-pink-950/25 dark:border-pink-900/60 dark:hover:border-pink-700/70",
  "bg-blue-50 border-blue-200 hover:border-blue-300 dark:bg-blue-950/25 dark:border-blue-900/60 dark:hover:border-blue-700/70",
  "bg-orange-50 border-orange-200 hover:border-orange-300 dark:bg-orange-950/25 dark:border-orange-900/60 dark:hover:border-orange-700/70",
  "bg-purple-50 border-purple-200 hover:border-purple-300 dark:bg-purple-950/25 dark:border-purple-900/60 dark:hover:border-purple-700/70",
  "bg-green-50 border-green-200 hover:border-green-300 dark:bg-green-950/25 dark:border-green-900/60 dark:hover:border-green-700/70",
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            propertyTypeId
              ? b.propertyTypeName === "Restaurant"
                ? false
                : (b as any).propertyTypeId == null ||
                  Number((b as any).propertyTypeId) === Number(propertyTypeId)
              : b.propertyTypeName !== "Restaurant",
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

  const handleFinalSubmit = async () => {
    if (!propertyTypeId) {
      toast.error("Hotel type is not available. Please try again.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      toast.error("Please fill in name, phone, and email.");
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-semibold flex gap-2">
                  <Users className="w-5 h-5 text-primary" /> Group Booking
                </h3>
                {totalPages > 1 && (
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
                <div className="space-y-3 flex-1">
                  {paginatedBookings.map((booking, index) => {
                    const colorCls = CARD_COLORS[index % CARD_COLORS.length];

                    return (
                      <div
                        key={booking.id}
                        onClick={() => {
                          setSelectedOffer(booking);
                          setStep(1);
                          setDateRange(null);
                          setFormData(EMPTY_FORM);
                        }}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all group ${colorCls}`}
                      >
                        {/* IMAGE */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          {booking.media?.[0]?.url ? (
                            <img
                              src={booking.media[0].url}
                              alt={booking.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground/40 m-auto" />
                          )}
                        </div>

                        {/* TEXT */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary">
                            {booking.title}
                          </p>

                          {booking.description && (
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground dark:text-foreground/80">
                              {booking.description}
                            </p>
                          )}

                          {booking.ctaLink && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-2 uppercase tracking-tight">
                              {booking.ctaText || "Details"}{" "}
                              <ExternalLink size={9} />
                            </span>
                          )}
                        </div>

                        <ArrowRight
                          size={14}
                          className="text-muted-foreground/40 group-hover:text-primary transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {totalPages > 1 && (
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
