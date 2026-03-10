import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  Instagram,
  Linkedin,
  Twitter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getEventsUpdated } from "@/Api/Api";
import NotFound from "./not-found";

// ── Split components ──
import EventImageCarousel, {
  buildCarouselSlides,
} from "@/modules/website/components/eventDetail/Eventimagecarousel";
import PastEventGallery from "@/modules/website/components/eventDetail/Pasteventgallery";
import {
  UpcomingPropertyEvents,
  FALLBACK_PROPERTY_NAME,
} from "@/modules/website/components/eventDetail/Eventcards";

// ============================================================================
// FALLBACK CONSTANTS
// ============================================================================
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200";

interface ApiEvent {
  id: number | string;
  title: string;
  propertyName?: string;
  propertyId?: number | string;
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

const GLOBAL_FALLBACK_EVENT: ApiEvent = {
  id: "featured-fallback",
  title: "Exclusive Property Showcase 2026",
  locationName: "Premium Corporate Hub, Delhi NCR",
  eventDate: new Date().toISOString(),
  description:
    "Join us for an exclusive walkthrough of our latest luxury residential projects. This featured event offers a unique opportunity to interact with architects and claim limited-time spot booking benefits.",
  longDesc:
    "This is a premium showcase event designed for serious investors and homebuyers. Attendees will get first-row access to floor plans, virtual reality tours, and one-on-one consultations with our financial advisory team.",
  image: { url: FALLBACK_IMAGE },
  ctaText: "Book Your Slot",
  ctaLink: "/contact",
  typeName: "Premium Showcase",
  time: "10:00 AM - 6:00 PM",
};

const STATIC_EVENTS: ApiEvent[] = [
  {
    id: "1",
    title: "Sunday Brunch Extravaganza",
    propertyName: "Kennedia Grand",
    propertyId: "1",
    locationName: "Bengaluru",
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      "A lavish brunch experience featuring live stations, gourmet desserts, and premium beverages.",
    longDesc: null,
    image: {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
    },
    ctaText: "Reserve Now",
    ctaLink: "#",
    typeName: "Restaurant Event",
    time: "11:00 AM - 3:00 PM",
    price: 999,
  },
  {
    id: "2",
    title: "Live Jazz & Cocktail Night",
    propertyName: "Kennedia Skybar",
    propertyId: "1",
    locationName: "Bengaluru",
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      "Enjoy a soulful jazz evening paired with signature cocktails and rooftop city views.",
    longDesc: null,
    image: {
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200",
    },
    ctaText: "Book Seats",
    ctaLink: "#",
    typeName: "Music Night",
    time: "7:30 PM onwards",
    price: 499,
  },
];

// ============================================================================
// SIDEBAR BOOKING CARD — extracted to avoid duplication
// ============================================================================
interface SidebarBookingCardProps {
  event: ApiEvent;
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
  setBookingModal: (v: boolean) => void;
}

function SidebarBookingCard({
  event,
  displayPropertyName,
  formattedDay,
  formattedDate,
  showShareReactions,
  setShowShareReactions,
  socialPlatforms,
  setBookingModal,
}: SidebarBookingCardProps) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Property name + type badge */}
      <div className="space-y-1.5">
        {event.typeName && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.35em] text-[#E33E33] bg-[#E33E33]/8 border border-[#E33E33]/20 px-2.5 py-0.5 rounded-full">
            {event.typeName}
          </span>
        )}
        <p className="text-base font-bold leading-snug">{displayPropertyName}</p>
      </div>

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
          <p className="text-sm font-bold">{event.time || "7:00 PM onwards"}</p>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#E33E33] shrink-0 mt-0.5" />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              event.locationName,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold hover:text-[#E33E33] hover:underline underline-offset-2 transition-colors leading-snug"
          >
            {event.locationName}
          </a>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 space-y-2">
        {!event.price || Number(event.price) === 0 ? (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tighter text-green-600">
              Free Entry
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <IndianRupee className="w-4 h-4" />
            <span className="text-3xl font-black tracking-tighter">
              {event.price}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">
              onwards
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setBookingModal(true)}
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
// MAIN PAGE
// ============================================================================
export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [interestedCount, setInterestedCount] = useState(2847);
  const [isInterested, setIsInterested] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [showShareReactions, setShowShareReactions] = useState(false);

  // ── Booking modal state ──
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    totalGuest: "2",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const handleBookingSubmit = async () => {
    if (!bookingForm.name || !bookingForm.phone) return;
    setBookingSubmitting(true);
    // TODO: wire to your API
    await new Promise((r) => setTimeout(r, 1200));
    setBookingSubmitting(false);
    setBookingModal(false);
    setBookingForm({
      name: "",
      phone: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
      time: "19:00",
      totalGuest: "2",
    });
  };

  useEffect(() => {
    setLoading(true);
    const foundEvent =
      STATIC_EVENTS.find((e) => e.id.toString() === id) ||
      STATIC_EVENTS[0] ||
      GLOBAL_FALLBACK_EVENT;
    setEvent(foundEvent);
    setLoading(false);
  }, [id]);

  // useEffect(() => {
  //   const fetchSingleEvent = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await getEventsUpdated({});
  //       const rawEvents: ApiEvent[] = response?.data || response || [];
  //       const foundEvent =
  //         rawEvents.find((e) => e.id.toString() === id) ||
  //         rawEvents[0] ||
  //         GLOBAL_FALLBACK_EVENT;
  //       setEvent(foundEvent);
  //     } catch {
  //       setEvent(GLOBAL_FALLBACK_EVENT);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchSingleEvent();
  // }, [id]);

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

  const imgUrl = event.image?.url || FALLBACK_IMAGE;
  const slides = buildCarouselSlides(event.id, imgUrl);

  const eventDate = new Date(event.eventDate || Date.now());
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedDay = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const descriptionPreview =
    event.description?.slice(0, 150) || "Event description details.";
  const shouldShowReadMore = (event.description?.length || 0) > 150;

  const displayPropertyName =
    event.propertyName?.trim() || FALLBACK_PROPERTY_NAME;

  const sidebarProps: SidebarBookingCardProps = {
    event,
    displayPropertyName,
    formattedDay,
    formattedDate,
    showShareReactions,
    setShowShareReactions,
    socialPlatforms,
    setBookingModal,
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
              {/* ── 1. HEADER ── */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* ── 2. IMAGE CAROUSEL ── */}
              <div className="rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 border border-border/50 py-4 px-2">
                <EventImageCarousel
                  slides={slides}
                  active={activeSlide}
                  onActiveChange={setActiveSlide}
                />
              </div>

              {/* ── BOOKING CARD — mobile only, after hero ── */}
              <div className="block lg:hidden">
                <SidebarBookingCard {...sidebarProps} />
              </div>

              {/* ── 2b. INTERESTED STRIP ── */}
              <div className="flex items-center gap-3 py-3 border-y border-border/50">
                <button
                  onClick={() => {
                    setIsInterested(!isInterested);
                    setInterestedCount((prev) =>
                      isInterested ? prev - 1 : prev + 1,
                    );
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    isInterested
                      ? "bg-[#E33E33]/10 border-[#E33E33] text-[#E33E33]"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {isInterested ? "Interested" : "I'm Interested"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {interestedCount.toLocaleString()} people interested
                </span>
              </div>

              {/* ── 3. PAST EVENT GALLERY ── */}
              <PastEventGallery eventId={event.id} />

              {/* ── 4. ABOUT ── */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold">About the Event</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {showFullDescription ? event.description : descriptionPreview}
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

              {/* ── 5. INFO CARDS — responsive fix ── */}
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

              {/* ── 6. UPCOMING EVENTS ── */}
              <UpcomingPropertyEvents
                propertyId={event.propertyId}
                currentEventId={event.id}
              />
            </div>

            {/* ── STICKY SIDEBAR — desktop only ── */}
            <aside className="hidden lg:block lg:sticky lg:top-28 w-full lg:w-[350px] shrink-0 lg:self-start pb-10">
              <SidebarBookingCard {...sidebarProps} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── BOOKING MODAL ── */}
      <AnimatePresence>
        {bookingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative text-left border border-zinc-100 dark:border-white/5"
            >
              {/* Close */}
              <button
                onClick={() => setBookingModal(false)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              {/* Heading */}
              <h3 className="text-2xl font-serif mb-1 dark:text-white">
                Reserve your spot
              </h3>
              <p className="text-xs text-zinc-500 mb-1 italic">{event.title}</p>
              <p className="text-xs text-zinc-400 mb-6">
                Please provide your details below for the reservation.
              </p>

              <div className="space-y-4">
                {/* Name */}
                <Input
                  placeholder="Your Name"
                  value={bookingForm.name}
                  onChange={(e) =>
                    setBookingForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                />

                {/* Phone */}
                <Input
                  placeholder="Phone Number"
                  value={bookingForm.phone}
                  onChange={(e) =>
                    setBookingForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                />

                {/* Email */}
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={bookingForm.email}
                  onChange={(e) =>
                    setBookingForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                />

                {/* Guests */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#E33E33] px-1">
                    Number of Guests
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Total Guests"
                    value={bookingForm.totalGuest}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        totalGuest: e.target.value,
                      }))
                    }
                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                  />
                </div>

                {/* Couples note */}
                <p className="text-[11px] text-[#E33E33] font-semibold flex items-center gap-1.5 px-1">
                  <span>🎟️</span>
                  10% off for couples — use code{" "}
                  <span className="font-black tracking-wide">COUPLE10</span>
                </p>

                {/* Submit */}
                <button
                  disabled={
                    !bookingForm.name || !bookingForm.phone || bookingSubmitting
                  }
                  onClick={handleBookingSubmit}
                  className="w-full h-14 bg-[#E33E33] disabled:opacity-50 text-white rounded-2xl font-black uppercase shadow-lg hover:bg-[#E33E33]/90 transition-all active:scale-95 text-xs tracking-widest flex items-center justify-center"
                >
                  {bookingSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Confirm Reservation"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}