import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Users,
  PartyPopper,
  Briefcase,
  Sparkles,
  X,
  User,
  Mail,
  Phone,
  Send,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { getEventsUpdated, getGroupBookings } from "@/Api/Api";
import {
  createGroupBookingEnquiry,
  getEventsHeaderByProperty,
} from "@/Api/RestaurantApi";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PropertyProps {
  propertyId: number | string;
}

interface EventImage {
  url?: string;
  type?: string;
  width?: number;
  height?: number;
}

interface ApiEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  locationName?: string;
  ctaText?: string;
  ctaLink?: string;
  active: boolean;
  status: string;
  propertyId: number | string;
  image?: EventImage;
}

interface GroupBooking {
  id: number;
  title: string;
  propertyId: number | string;
  media?: { mediaId: number; type: string; url: string }[];
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  persons: string;
  customQuery: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COLOR_PALETTE = [
  { color: "bg-[#F5E6FF] text-[#8E44AD]", border: "border-[#D7BDE2]" },
  { color: "bg-[#E3F2FD] text-[#1976D2]", border: "border-[#BBDEFB]" },
  { color: "bg-[#FFF3E0] text-[#E67E22]", border: "border-[#FFE0B2]" },
  { color: "bg-[#E8F5E9] text-[#2E7D32]", border: "border-[#C8E6C9]" },
];

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  persons: "",
  customQuery: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const isVideoUrl = (url = ""): boolean =>
  /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

const getBookingIcon = (title = ""): JSX.Element => {
  const t = title.toLowerCase();
  if (t.includes("birthday") || t.includes("party"))
    return <PartyPopper size={18} />;
  if (t.includes("corporate") || t.includes("meeting") || t.includes("office"))
    return <Briefcase size={18} />;
  if (t.includes("wedding") || t.includes("reception"))
    return <Sparkles size={18} />;
  return <Calendar size={18} />;
};

const normalizeEvent = (apiEvent: ApiEvent): ApiEvent => {
  const rawImage = apiEvent.image ?? {};
  const resolvedType =
    rawImage.type === "VIDEO" || isVideoUrl(rawImage.url) ? "VIDEO" : "IMAGE";
  return { ...apiEvent, image: { ...rawImage, type: resolvedType } };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ResturantpageEvents({ propertyId }: PropertyProps) {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [eventsHeader, setEventsHeader] = useState<{
    header1: string;
    header2: string;
    description: string;
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  // Modal / form state
  const [showModal, setShowModal] = useState(false);
  const [bookingType, setBookingType] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // ── Manual Navigation Logic ──────────────────────────────────────────
  const nextEvent = () => {
    setCurrentIndex((prev) => {
      const nextIdx = prev + 2;
      return nextIdx >= events.length ? 0 : nextIdx;
    });
  };

  const prevEvent = () => {
    setCurrentIndex((prev) => {
      const prevIdx = prev - 2;
      if (prevIdx < 0) {
        return Math.max(0, events.length - (events.length % 2 || 2));
      }
      return prevIdx;
    });
  };

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, bookingRes, headerRes] = await Promise.all([
          getEventsUpdated(),
          getGroupBookings(),
          getEventsHeaderByProperty(propertyId),
        ]);

        const allEvents: ApiEvent[] = Array.isArray(eventRes)
          ? eventRes
          : (eventRes?.data ?? []);
        const now = new Date();

        setEvents(
          allEvents
            .filter((ev) => {
              const eventDate = new Date(ev.eventDate);

              return (
                ev.active &&
                ev.status === "ACTIVE" &&
                eventDate >= now && // ✅ remove expired events
                (propertyId ? ev.propertyId === propertyId : true)
              );
            })
            .map(normalizeEvent),
        );

        const allBookings: GroupBooking[] = Array.isArray(bookingRes)
          ? bookingRes
          : (bookingRes?.data ?? []);
        setGroupBookings(
          allBookings
            .filter(
              (b) =>
                b?.isActive !== false &&
                (propertyId ? b.propertyId === propertyId : true),
            )
            .sort((a, b) => b.id - a.id),
        );
        const headerData = headerRes?.data;
        const header = Array.isArray(headerData) ? headerData[0] : headerData;
        if (header?.isActive) setEventsHeader(header);
      } catch {
        toast.error("Error loading events data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId]);

  // ── Auto-carousel ────────────────────────────────────────────────────────
  useEffect(() => {
    if (events.length <= 2 || isPaused) return;
    const timer = setInterval(() => {
      nextEvent();
    }, 5000);
    return () => clearInterval(timer);
  }, [events, isPaused]);

  const openInquiry = (type: string, id?: number) => {
    setBookingType(type);
    setSelectedBookingId(id ?? null);
    setStep(1);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      setFormError("Email address is required.");
      return;
    }
    if (!emailRegex.test(formData.email.trim())) {
      setFormError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    try {
      const queriesText = [
        `Booking Type: ${bookingType}`,
        formData.persons ? `No. of Persons: ${formData.persons}` : null,
        formData.customQuery
          ? `Additional Info: ${formData.customQuery}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      await createGroupBookingEnquiry({
        name: formData.name,
        phoneNumber: formData.phone,
        emailAddress: formData.email,
        queries: queriesText,
        enquiryDate: new Date().toISOString().split("T")[0],
        propertyId: Number(propertyId),
        ...(selectedBookingId ? { groupBookingId: selectedBookingId } : {}),
      });

      setStep(3);
    } catch {
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

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );

  const displayedEvents = events.slice(currentIndex, currentIndex + 2);

  return (
    <section id="events" className="py-12 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* ── HEADER SECTION WITH ARROWS ── */}
        <div className="flex flex-row items-end justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
              {eventsHeader?.header1 || "Events"}{" "}
              <span className="italic text-primary">
                {eventsHeader?.header2
                  ? ` ${eventsHeader.header2}`
                  : " Celebrations"}
              </span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light tracking-wide">
              {eventsHeader?.description ||
                "Explore international delicacies curated for every event."}
            </p>
          </div>

          {/* ARROWS CONTAINER - Positioned exactly as marked in red */}
          {events.length > 2 && (
            <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 p-1.5 rounded-full border border-border/40 backdrop-blur-sm shadow-sm">
              <button
                onClick={prevEvent}
                className="p-2 rounded-full transition-all hover:bg-primary hover:text-white active:scale-90 text-zinc-600 dark:text-zinc-400"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
              <div className="w-[1px] h-4 bg-border/50" />
              <button
                onClick={nextEvent}
                className="p-2 rounded-full transition-all hover:bg-primary hover:text-white active:scale-90 text-zinc-600 dark:text-zinc-400"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Events Cards Container */}
          <div
            className="lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              {displayedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </AnimatePresence>
          </div>

          {/* Group Booking Section */}
          <div className="lg:w-[40%]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="h-full bg-background border border-border/50 rounded-3xl p-8 shadow-sm flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Users size={22} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-foreground">
                    Group Booking
                  </h3>
                </div>
                {totalPages > 1 && (
                  <div className="flex gap-1">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="p-1 rounded-md hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="p-1 rounded-md hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4 flex-grow">
                {paginatedBookings.map((item, index) => {
                  const style = COLOR_PALETTE[index % COLOR_PALETTE.length];

                  return (
                    <button
                      key={item.id}
                      onClick={() => openInquiry(item.title, item.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border ${style.border} ${style.color} transition-transform hover:scale-[1.02] text-left group`}
                    >
                      {/* IMAGE AVATAR */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/40 shrink-0">
                        {item.media?.[0]?.url ? (
                          <img
                            src={item.media[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getBookingIcon(item.title)}
                          </div>
                        )}
                      </div>

                      {/* TEXT */}
                      <span className="font-bold text-sm md:text-base tracking-tight">
                        {item.title}
                      </span>

                      <ArrowRight
                        size={16}
                        className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 pt-8 border-t border-dashed border-border text-center">
                {/* <p className="text-xs text-muted-foreground mb-4 italic">
                  Planning a large gathering? Let our experts handle the
                  details.
                </p> */}
                <button
                  onClick={() => openInquiry("General Celebration")}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Inquire Now
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-zinc-100 dark:border-white/5"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl dark:text-white">
                      {step === 3
                        ? "Inquiry Submitted"
                        : `Inquiry: ${bookingType}`}
                    </h3>
                    {step !== 3 && (
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                        Step {step} of 2
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                {step === 3 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-4 space-y-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Send size={28} className="text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl text-zinc-800 dark:text-white">
                        Thank You, {formData.name || "there"}!
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Your inquiry for{" "}
                        <span className="font-semibold text-primary">
                          {bookingType}
                        </span>{" "}
                        has been received.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowModal(false)}
                      className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px]"
                    >
                      Close
                    </Button>
                  </motion.div>
                ) : step === 1 ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Full Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") });
                          setFormError("");
                        }}
                        placeholder="Your Name"
                        className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Phone Number
                      </label>
                      <Input
                        inputMode="numeric"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") });
                          setFormError("");
                        }}
                        placeholder="10-digit number"
                        maxLength={10}
                        className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        No. of Persons
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.persons}
                        onChange={(e) =>
                          setFormData({ ...formData, persons: e.target.value })
                        }
                        placeholder="e.g. 10"
                        className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                      />
                    </div>
                    {formError && (
                      <p className="text-xs text-red-500 font-medium">{formError}</p>
                    )}
                    <Button
                      disabled={!formData.name || !formData.phone}
                      onClick={() => {
                        if (!formData.name.trim()) {
                          setFormError("Full name is required.");
                          return;
                        }
                        if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
                          setFormError("Name must contain only letters and spaces.");
                          return;
                        }
                        if (!/^\d{10}$/.test(formData.phone.trim())) {
                          setFormError("Phone number must be exactly 10 digits.");
                          return;
                        }
                        setFormError("");
                        setStep(2);
                      }}
                      className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px]"
                    >
                      Next Step <ChevronRight size={14} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Email Address
                      </label>
                      <Input
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setFormError("");
                        }}
                        placeholder="email@example.com"
                        className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.customQuery}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customQuery: e.target.value,
                          })
                        }
                        placeholder="Special requirements..."
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl text-sm outline-none resize-none"
                      />
                    </div>
                    {formError && (
                      <p className="text-xs text-red-500 font-medium">{formError}</p>
                    )}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => { setStep(1); setFormError(""); }}
                        className="h-14 rounded-xl px-8"
                      >
                        Back
                      </Button>
                      <Button
                        disabled={isSubmitting || !formData.email}
                        onClick={handleFinalSubmit}
                        className="flex-1 h-14 bg-primary text-white rounded-xl font-bold uppercase text-[10px] shadow-lg shadow-primary/20"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            Submit Inquiry <Send size={14} className="ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── EVENT CARD COMPONENT ──────────────────────────────────────────────────
function EventCard({ event }: { event: ApiEvent }) {
  const navigate = useNavigate();
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo =
    event.image?.type === "VIDEO" ||
    Boolean(event.image?.url?.match(/\.(mp4|webm|ogg|mov)$/i));

  const analyzeMediaSize = (w: number, h: number) => {
    if (!w || !h) return;
    setIsBanner(w / h <= 0.85);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const dateObj = new Date(event.eventDate);
  const day = dateObj.getDate();
  const month = dateObj
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      onClick={() => navigate(buildEventDetailPath(event))}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="group h-[520px] bg-card border rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
    >
      <div
        className={`relative overflow-hidden transition-all duration-500 ${isBanner ? "h-full" : "h-[280px]"}`}
      >
        {event.image?.url ? (
          isVideo ? (
            <>
              <video
                ref={videoRef}
                src={event.image.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                onLoadedMetadata={(e) =>
                  analyzeMediaSize(
                    e.currentTarget.videoWidth,
                    e.currentTarget.videoHeight,
                  )
                }
              />
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 z-30 bg-black/60 text-white rounded-full p-2 backdrop-blur-sm"
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            </>
          ) : (
            <img
              src={event.image.url}
              alt={event.title}
              className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
              onLoad={(e) =>
                analyzeMediaSize(
                  e.currentTarget.naturalWidth,
                  e.currentTarget.naturalHeight,
                )
              }
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted" />
        )}

        <div className="absolute top-5 left-5 z-30 flex flex-col items-center bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl border border-white/10">
          <span className="text-xl font-black leading-none">{day}</span>
          <span className="text-[10px] font-bold tracking-tighter opacity-80">
            {month}
          </span>
        </div>

        <div className="absolute top-5 right-5 z-30 bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1.5">
          <MapPin size={10} /> {event.locationName}
        </div>

        {isBanner && (
          <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <h3 className="text-white font-serif font-bold text-2xl">
              {event.title}
            </h3>
            <p className="text-white/70 text-xs italic line-clamp-2 mt-1">
              {event.description}
            </p>
            {event.ctaText && (
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  if (event.ctaLink) {
                    window.open(event.ctaLink, "_blank");
                  } else {
                    navigate(buildEventDetailPath(event));
                  }
                }}
                className="mt-4 py-3 rounded-xl text-[10px] font-bold uppercase bg-primary text-white"
              >
                {event.ctaText}
              </button>
            )}
          </div>
        )}
      </div>

      {!isBanner && (
        <div className="p-6 flex flex-col flex-1 bg-card text-left">
          <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3 mt-2">
            {event.description}
          </p>
          {event.ctaText && (
            <div className="mt-auto pt-4 border-t border-dashed border-border">
              <button
                onClick={() => window.open(event.ctaLink, "_blank")}
                className="w-full py-3 rounded-xl text-[10px] font-bold uppercase bg-primary text-white"
              >
                {event.ctaText}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
