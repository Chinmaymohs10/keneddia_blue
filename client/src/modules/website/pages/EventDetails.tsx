import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Share2,
  Loader2,
  Clock,
  Users,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Ticket,
  Info,
  MessageCircle,
  Facebook,
  Linkedin,
  Twitter,
  X,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import {
  getEventsUpdated,
  getEventDetailInfoById,
  getEventFilesByUploadedId,
  addEventInterest,
  addEventBooking,
  getEventInterestByEventId,
} from "@/Api/Api";
import NotFound from "./not-found";
import EventImageCarousel from "@/modules/website/components/eventDetail/Eventimagecarousel";
import PastEventGallery from "@/modules/website/components/eventDetail/Pasteventgallery";
import { UpcomingPropertyEvents } from "@/modules/website/components/eventDetail/Eventcards";
import {
  buildEventDetailPath,
  getEventIdFromSlug,
} from "@/modules/website/utils/eventSlug";
import { useSsrData } from "@/ssr/SsrDataContext";

// ============================================================================
// FALLBACK CONSTANTS
// ============================================================================
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200";

// ── API response shapes ──
interface MediaItem {
  mediaId: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface EventFileGroup {
  id: number;
  propertyId: number;
  propertyTypeId: number;
  eventId: number;
  eventName: string;
  category: "hero_slider" | "past_event" | null;
  medias: MediaItem[];
}

interface MediaResponseDTO {
  mediaId: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface EventDetailInfo {
  id: number;
  propertyId: number;
  propertyTypeId: number;
  eventId: number;
  card1Title: string;
  card2Title: string;
  card1textField1: string;
  card1textField2: string;
  card2textField1: string;
  card2textField2: string;
  startTime: string | null;
  endTime: string | null;
  locationName: string | null;
  locationUrl: string | null;
  price: number | null;
  textField: string | null;
  mediaId: number | null;
  mediaResponseDTO: MediaResponseDTO | null;
}

interface ApiEvent {
  id: number | string;
  title: string;
  propertyName?: string;
  propertyId?: number | string;
  propertyTypeId?: number | string | null;
  locationName: string;
  eventDate: string;
  description: string;
  longDesc: string | null;
  image: { url: string };
  ctaText: string;
  ctaLink: string | null;
  typeName?: string;
  time?: string;
  price?: number | string | null;
}

// ── Interest/Booking API response entry ──
interface InterestEntry {
  id: number;
  propertyId: number;
  propertyTypeId: number;
  eventId: number;
  interactionType: "INTERESTED" | "BOOK";
  interestCount: number | null;
  bookCount: number | null;
  name: string;
  phoneNumber: number;
  emailId: string;
  guestNumber: number | null;
  bookingDate?: string | null;
  date?: string | null;
  selectedDate?: string | null;
  createdAt?: string | null;
}

type ModalMode = "book" | "interest";

// ── Time formatter: "HH:MM:SS" → "12:17 PM" ──
function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const min = minStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${ampm}`;
}

// ============================================================================
// SIDEBAR BOOKING CARD
// ============================================================================
interface SidebarBookingCardProps {
  event: ApiEvent;
  detailInfo: EventDetailInfo | null;
  displayPropertyName: string;
  formattedDay: string;
  formattedDate: string;
  showShareReactions: boolean;
  setShowShareReactions: (v: boolean) => void;
  socialPlatforms: {
    name: string;
    icon: React.ReactNode;
    color: string;
    link: string;
  }[];
  setBookingModal: () => void;
}

function SidebarBookingCard({
  event,
  detailInfo,
  displayPropertyName,
  formattedDay,
  formattedDate,
  showShareReactions,
  setShowShareReactions,
  socialPlatforms,
  setBookingModal,
}: SidebarBookingCardProps) {
  const locationName = detailInfo?.locationName || event.locationName;
  const locationUrl =
    detailInfo?.locationUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

  const timeDisplay =
    detailInfo?.startTime && detailInfo?.endTime
      ? `${formatTime(detailInfo.startTime)} – ${formatTime(detailInfo.endTime)}`
      : event.time || "7:00 PM onwards";

  const price = detailInfo?.price ?? event.price;
  const priceLabel = detailInfo?.textField || "onwards";

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Property name + type badge */}
      <div className="space-y-1.5">
        {event.typeName && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.35em] text-[#E33E33] bg-[#E33E33]/8 border border-[#E33E33]/20 px-2.5 py-0.5 rounded-full">
            {event.typeName}
          </span>
        )}
        <p className="text-base font-bold leading-snug">
          {displayPropertyName}
        </p>
      </div>

      {/* Event info */}
      <div className="space-y-4 pt-1 border-t border-border/50">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#E33E33] shrink-0" />
          <div>
            <p className="text-sm font-bold">{formattedDay}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#E33E33] shrink-0" />
          <p className="text-sm font-bold">{timeDisplay}</p>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#E33E33] shrink-0 mt-0.5" />
          <a
            href={locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold hover:text-[#E33E33] hover:underline underline-offset-2 transition-colors leading-snug"
          >
            {locationName}
          </a>
        </div>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-border/50 space-y-2">
        {!price || Number(price) === 0 ? (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tighter text-green-600">
              Free Entry
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <IndianRupee className="w-4 h-4" />
            <span className="text-3xl font-black tracking-tighter">
              {price}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">
              {priceLabel}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={setBookingModal}
          className="w-full py-3.5 bg-[#E33E33] text-white font-black rounded-xl hover:shadow-lg transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
        >
          Book Now
        </button>

        {/* Share button with popover */}
        <div
          className="relative w-full"
          onMouseEnter={() => setShowShareReactions(true)}
          onMouseLeave={() => setShowShareReactions(false)}
        >
          <AnimatePresence>
            {showShareReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: -60, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 shadow-2xl rounded-full px-2.5 py-2 flex gap-2.5 z-50 backdrop-blur-md"
              >
                {socialPlatforms.map((platform, index) => (
                  <motion.a
                    key={platform.name}
                    href={platform.link}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ scale: 1.2, y: -3 }}
                    className={`${platform.color} text-white p-2.5 rounded-full shadow-lg transition-transform flex items-center justify-center`}
                  >
                    {platform.icon}
                    <span className="sr-only">{platform.name}</span>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button className="w-full py-3 border border-border hover:bg-secondary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UNIFIED BOOKING / INTEREST MODAL
// ============================================================================
interface BookingModalProps {
  isOpen: boolean;
  mode: ModalMode;
  event: ApiEvent;
  onClose: () => void;
  onSuccess: () => void;
}

function BookingModal({
  isOpen,
  mode,
  event,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    totalGuest: "2",
    bookingDate: event.eventDate?.slice(0, 10) || "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset form whenever modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        phone: "",
        email: "",
        totalGuest: "2",
        bookingDate: event.eventDate?.slice(0, 10) || "",
      });
      setFormErrors({ name: "", phone: "" });
      setSubmitted(false);
    }
  }, [event.eventDate, isOpen, mode]);

  const handleNameChange = (value: string) => {
    const sanitized = value.replace(/[0-9]/g, "");
    setForm((f) => ({ ...f, name: sanitized }));
    setFormErrors((errors) => ({
      ...errors,
      name:
        sanitized.trim().length === 0
          ? "Name is required."
          : value !== sanitized
            ? "Numbers are not allowed in the name."
            : "",
    }));
  };

  const handlePhoneChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: sanitized }));
    setFormErrors((errors) => ({
      ...errors,
      phone:
        sanitized.length === 0
          ? "Phone number is required."
          : sanitized.length < 10
            ? "Enter a 10 digit phone number."
            : "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      name: "",
      phone: "",
    };

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (/[0-9]/.test(form.name)) {
      nextErrors.name = "Numbers are not allowed in the name.";
    }

    if (!form.phone) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(form.phone)) {
      nextErrors.phone = "Enter a 10 digit phone number.";
    }

    setFormErrors(nextErrors);
    return !nextErrors.name && !nextErrors.phone;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const base = {
        propertyId: event.propertyId ? Number(event.propertyId) : undefined,
        propertyTypeId: event.propertyTypeId
          ? Number(event.propertyTypeId)
          : undefined,
        eventId: Number(event.id),
        name: form.name.trim(),
        phoneNumber: Number(form.phone),
        emailId: form.email || undefined,
        bookingDate: form.bookingDate || undefined,
      };

      if (mode === "interest") {
        await addEventInterest(base);
      } else {
        await addEventBooking({
          ...base,
          guestNumber: Number(form.totalGuest) || 1,
        });
      }

      setSubmitted(true);
      // Show success state briefly then close + refresh
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch {
      // keep modal open on error so user can retry
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isBook = mode === "book";
  const isFormValid = form.name.trim() && /^\d{10}$/.test(form.phone);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative text-left border border-zinc-100 dark:border-white/5"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h3 className="text-xl font-bold dark:text-white text-center">
              {isBook ? "Booking Confirmed!" : "You're on the list!"}
            </h3>
            <p className="text-sm text-zinc-400 text-center">
              {isBook
                ? "We've received your reservation. See you there!"
                : "We'll keep you updated about this event."}
            </p>
          </div>
        ) : (
          <>
            {/* Heading */}
            <h3 className="text-2xl font-serif mb-1 dark:text-white">
              {isBook ? "Reserve your spot" : "Mark as Interested"}
            </h3>
            <p className="text-xs text-zinc-500 mb-1 italic">{event.title}</p>
            <p className="text-xs text-zinc-400 mb-6">
              Please provide your details below.
            </p>

            <div className="space-y-4">
              <Input
                placeholder="Your Name *"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
              />
              {formErrors.name && (
                <p className="-mt-3 px-1 text-xs font-medium text-[#E33E33]">
                  {formErrors.name}
                </p>
              )}
              <Input
                placeholder="Phone Number *"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
              />
              {formErrors.phone && (
                <p className="-mt-3 px-1 text-xs font-medium text-[#E33E33]">
                  {formErrors.phone}
                </p>
              )}
              <Input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
              />

              {/* Guest count — only for booking */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#E33E33] px-1">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  value={form.bookingDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bookingDate: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                />
              </div>

              {isBook && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#E33E33] px-1">
                    Number of Guests
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Total Guests"
                    value={form.totalGuest}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, totalGuest: e.target.value }))
                    }
                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                  />
                </div>
              )}

              <button
                disabled={!isFormValid || submitting}
                onClick={handleSubmit}
                className="w-full h-14 bg-[#E33E33] disabled:opacity-50 text-white rounded-2xl font-black uppercase shadow-lg hover:bg-[#E33E33]/90 transition-all active:scale-95 text-xs tracking-widest flex items-center justify-center"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isBook ? (
                  "Confirm Reservation"
                ) : (
                  "I'm Interested"
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function EventDetails() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const ssrData = useSsrData();
  const initialEventDetail = ssrData?.eventDetail || null;
  const hasInitialEvent =
    !!initialEventDetail &&
    String(initialEventDetail?.eventId || "") === String(getEventIdFromSlug(eventSlug));
  const navigate = useNavigate();
  const id = getEventIdFromSlug(eventSlug);
  const [event, setEvent] = useState<ApiEvent | null>(
    hasInitialEvent ? initialEventDetail.event || null : null,
  );
  const [detailInfoList, setDetailInfoList] = useState<EventDetailInfo[]>(
    hasInitialEvent && Array.isArray(initialEventDetail?.detailInfoList)
      ? initialEventDetail.detailInfoList
      : [],
  );
  const [heroSlides, setHeroSlides] = useState<
    { url: string; type: "IMAGE" | "VIDEO"; alt?: string }[]
  >(hasInitialEvent && Array.isArray(initialEventDetail?.heroSlides) ? initialEventDetail.heroSlides : []);
  const [pastEventImages, setPastEventImages] = useState<
    { url: string; type: "IMAGE" | "VIDEO"; alt?: string }[]
  >(
    hasInitialEvent && Array.isArray(initialEventDetail?.pastEventImages)
      ? initialEventDetail.pastEventImages
      : [],
  );
  const [loading, setLoading] = useState(!hasInitialEvent);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showShareReactions, setShowShareReactions] = useState(false);

  // ── Interest / booking ──
  const [interestList, setInterestList] = useState<InterestEntry[]>(
    hasInitialEvent && Array.isArray(initialEventDetail?.interestList)
      ? initialEventDetail.interestList
      : [],
  );
  const [isInterested, setIsInterested] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("book");

  // ── Derived counts ──
  // Total INTERESTED entries = interest count
  const interestedCount = interestList.filter(
    (e) => e.interactionType === "INTERESTED",
  ).length;

  // Last BOOK entry's bookCount = cumulative book counter from API
  const bookEntries = interestList.filter((e) => e.interactionType === "BOOK");
  const lastBookCount =
    bookEntries.length > 0
      ? (bookEntries[bookEntries.length - 1].bookCount ?? bookEntries.length)
      : 0;

  // ── Fetch interest/booking list ──
  const fetchInterestList = async (eventId: string) => {
    try {
      const res = await getEventInterestByEventId(eventId);
      const data: InterestEntry[] = res?.data?.data ?? res?.data ?? res ?? [];
      setInterestList(Array.isArray(data) ? data : []);
    } catch {
      setInterestList([]);
    }
  };
  const boostedInterestedCount = useMemo(() => {
    const randomBoost = Math.floor(Math.random() * 150) + 200; // 100–199
    return interestedCount + randomBoost;
  }, [event?.id, interestedCount]);

  // ── Fetch event base info ──
  useEffect(() => {
    let isCurrentRequest = true;

    const fetchEventBase = async () => {
      try {
        if (!hasInitialEvent && !event) {
          setLoading(true);
        }
        const response = await getEventsUpdated({});
        if (!isCurrentRequest) return;

        const rawEvents: ApiEvent[] = response?.data || response || [];
        const foundEvent = rawEvents.find((e) => e.id.toString() === id);
        setEvent(foundEvent || null);
      } catch {
        if (!hasInitialEvent && isCurrentRequest) {
          setEvent(null);
        }
      } finally {
        if (!hasInitialEvent && isCurrentRequest) {
          setLoading(false);
        }
      }
    };
    if (!id) {
      setEvent(null);
      return;
    }
    fetchEventBase();

    return () => {
      isCurrentRequest = false;
    };
  }, [hasInitialEvent, id]);

  useEffect(() => {
    if (!event || !eventSlug) return;
    if (String(event.id) !== String(id)) return;

    const canonicalPath = buildEventDetailPath(event);
    if (canonicalPath !== `/events/${eventSlug}`) {
      navigate(canonicalPath, { replace: true });
    }
  }, [event, eventSlug, id, navigate]);

  // ── Fetch detail info + media + interest list ──
  useEffect(() => {
    if (!id) return;
    let isCurrentRequest = true;

    const fetchDetails = async () => {
      try {
        let detailRes: any = null;
        let filesRes: any = null;

        try {
          detailRes = await getEventDetailInfoById(id);
        } catch (err) {
          console.warn("Event card API failed:", err);
        }

        try {
          filesRes = await getEventFilesByUploadedId(id);
        } catch (err) {
          console.error("Media API failed:", err);
        }

        // DETAIL INFO — API returns array, sort by id desc
        const rawList =
          detailRes?.data?.data ?? detailRes?.data ?? detailRes ?? [];
        const list: EventDetailInfo[] = Array.isArray(rawList)
          ? rawList
          : rawList
            ? [rawList]
            : [];
        if (!isCurrentRequest) return;
        setDetailInfoList([...list].sort((a, b) => b.id - a.id));

        // MEDIA FILE GROUPS
        const fileGroups: EventFileGroup[] =
          filesRes?.data?.data || filesRes?.data || filesRes || [];

        const heroMedias: MediaItem[] = [];
        const pastMedias: MediaItem[] = [];

        fileGroups.forEach((group) => {
          if (!group?.category) return;
          const cat = group.category.trim().toLowerCase();
          if (cat === "hero_slider") heroMedias.push(...(group.medias || []));
          if (cat === "past_event") pastMedias.push(...(group.medias || []));
        });

        const nextHeroSlides = heroMedias
          .filter((m) => m.url)
          .map((m) => ({
            url: m.url,
            type: m.type,
            alt: m.alt || "event-media",
          }));
        const nextPastEventImages = pastMedias
          .filter((m) => m.url)
          .map((m) => ({
            url: m.url,
            type: m.type,
            alt: m.alt || "past-event",
          }));

        if (!isCurrentRequest) return;
        setHeroSlides(nextHeroSlides);
        setPastEventImages(nextPastEventImages);
      } catch (err) {
        console.error("Failed to fetch event details:", err);
        if (!hasInitialEvent && isCurrentRequest) {
          setDetailInfoList([]);
        }
      }
    };

    fetchDetails();
    if (!hasInitialEvent) {
      fetchInterestList(id);
    }

    return () => {
      isCurrentRequest = false;
    };
  }, [hasInitialEvent, id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={20} />,
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      color: "bg-[#1877F2]",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X (Twitter)",
      icon: <Twitter size={18} />,
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={20} />,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E33E33]" />
      </div>
    );

  if (!event) return <NotFound />;

  const latestDetail = detailInfoList[0] ?? null;
  const carouselSlides = heroSlides;

  const eventDate = new Date(event.eventDate || Date.now());
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedDay = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const fullDescription = event.longDesc || "";
  const descriptionPreview = fullDescription.slice(0, 150);
  const shouldShowReadMore = fullDescription.length > 150;
  const displayPropertyName = event.propertyName?.trim() || "";

  // ── Interested button handler — opens interest modal ──
  const handleInterestedClick = () => {
    if (isInterested) return;
    setIsInterested(true);
    setModalMode("interest");
    setBookingModal(true);
  };

  // ── Book Now handler — opens booking modal ──
  const handleBookNow = () => {
    setModalMode("book");
    setBookingModal(true);
  };

  const sidebarProps: SidebarBookingCardProps = {
    event,
    detailInfo: latestDetail,
    displayPropertyName,
    formattedDay,
    formattedDate,
    showShareReactions,
    setShowShareReactions,
    socialPlatforms,
    setBookingModal: handleBookNow,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#E33E33] mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Events
          </Link>

          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* ── LEFT COLUMN ── */}
            <div className="flex-1 min-w-0 space-y-8 w-full">
              {/* 1. HEADER */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* 2. IMAGE CAROUSEL */}
              <div className="rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 border border-border/50 py-4 px-2">
                <EventImageCarousel
                  slides={carouselSlides}
                  active={activeSlide}
                  onActiveChange={setActiveSlide}
                />
              </div>

              {/* BOOKING CARD — mobile only */}
              <div className="block lg:hidden">
                <SidebarBookingCard {...sidebarProps} />
              </div>

              {/* 2b. INTERESTED STRIP */}
              <div className="flex items-center gap-3 py-3 border-y border-border/50">
                <button
                  onClick={handleInterestedClick}
                  disabled={isInterested}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    isInterested
                      ? "bg-[#E33E33]/10 border-[#E33E33] text-[#E33E33] cursor-default"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {isInterested ? "Interested ✓" : "I'm Interested"}
                </button>

                {/* Live counts from API */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {interestedCount > 0 && (
                    <span>
                      <span className="font-bold text-foreground">
                        {boostedInterestedCount.toLocaleString()}
                      </span>{" "}
                      interested
                    </span>
                  )}
                </div>
              </div>

              {/* 3. PAST EVENT GALLERY */}
              <PastEventGallery eventId={event.id} images={pastEventImages} />

              {/* 4. ABOUT */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold">About the Event</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {showFullDescription ? fullDescription : descriptionPreview}
                </p>
                {shouldShowReadMore && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-[#E33E33] text-sm font-bold hover:underline flex items-center gap-1"
                  >
                    {showFullDescription ? (
                      <>
                        Read Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </section>

              {/* 5. INFO CARDS — latest entry only */}
              {latestDetail ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <section className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold mb-2">
                          {latestDetail.card1Title || "You Should Know"}
                        </h3>
                        {[
                          latestDetail.card1textField1,
                          latestDetail.card1textField2,
                        ].filter(Boolean).length > 0 ? (
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {(
                              [
                                latestDetail.card1textField1,
                                latestDetail.card1textField2,
                              ].filter(Boolean) as string[]
                            ).map((point, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="shrink-0">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No additional info.
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold mb-2">
                          {latestDetail.card2Title || "Contactless M-Ticket"}
                        </h3>
                        {(
                          [
                            latestDetail.card2textField1,
                            latestDetail.card2textField2,
                          ].filter(Boolean) as string[]
                        ).length > 0 ? (
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {(
                              [
                                latestDetail.card2textField1,
                                latestDetail.card2textField2,
                              ].filter(Boolean) as string[]
                            ).map((point, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="shrink-0">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No ticket info available.
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <section className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold mb-2">
                          You Should Know
                        </h3>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="shrink-0">•</span>
                            <span>Arrive 30 minutes before start</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="shrink-0">•</span>
                            <span>Valid ID proof required</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                  <section className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold mb-2">
                          Contactless M-Ticket
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Instant delivery via SMS and email. Simply show your
                          phone at the gate.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* 6. UPCOMING EVENTS */}
              <UpcomingPropertyEvents
                propertyId={event.propertyId}
                currentEventId={event.id}
              />
            </div>

            {/* STICKY SIDEBAR — desktop only */}
            <aside className="hidden lg:block lg:sticky lg:top-28 w-full lg:w-[350px] shrink-0 lg:self-start pb-10">
              <SidebarBookingCard {...sidebarProps} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* UNIFIED BOOKING / INTEREST MODAL */}
      <AnimatePresence>
        {bookingModal && (
          <BookingModal
            isOpen={bookingModal}
            mode={modalMode}
            event={event}
            onClose={() => {
              setBookingModal(false);
              // Revert interested state if user closed without submitting
              if (modalMode === "interest") setIsInterested(false);
            }}
            onSuccess={() => {
              setBookingModal(false);
              // Refresh counts from API after successful submit
              if (id) fetchInterestList(id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
