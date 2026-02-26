import { useState, useEffect } from "react";
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
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { getEventsUpdated, getGroupBookings } from "@/Api/Api";

// Color palette for dynamic group booking backgrounds
const COLOR_PALETTE = [
  { color: "bg-[#F5E6FF] text-[#8E44AD]", border: "border-[#D7BDE2]" },
  { color: "bg-[#E3F2FD] text-[#1976D2]", border: "border-[#BBDEFB]" },
  { color: "bg-[#FFF3E0] text-[#E67E22]", border: "border-[#FFE0B2]" },
  { color: "bg-[#E8F5E9] text-[#2E7D32]", border: "border-[#C8E6C9]" },
];

const detectBanner = (image) => {
  if (!image?.width || !image?.height) return false;
  const ratio = image.width / image.height;
  return Math.abs(ratio - 9 / 16) <= 0.15 || Math.abs(ratio - 4 / 5) <= 0.1;
};

const isVideoUrl = (url = "") => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

const getBookingIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("birthday") || t.includes("party"))
    return <PartyPopper size={18} />;
  if (t.includes("corporate") || t.includes("meeting") || t.includes("office"))
    return <Briefcase size={18} />;
  if (t.includes("wedding") || t.includes("reception"))
    return <Sparkles size={18} />;
  return <Calendar size={18} />;
};

const normalizeEvent = (apiEvent) => {
  const rawImage = apiEvent.image ?? {};
  const resolvedType =
    rawImage.type === "VIDEO" || isVideoUrl(rawImage.url) ? "VIDEO" : "IMAGE";
  return {
    ...apiEvent,
    image: { ...rawImage, type: resolvedType },
  };
};

export default function ResturantpageEvents({ propertyId }) {
  const [events, setEvents] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const [showModal, setShowModal] = useState(false);
  const [bookingType, setBookingType] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, bookingRes] = await Promise.all([
          getEventsUpdated(),
          getGroupBookings(),
        ]);

        // Process Events
        const allEvents = Array.isArray(eventRes)
          ? eventRes
          : (eventRes?.data ?? []);
        setEvents(
          allEvents
            .filter(
              (ev) =>
                ev.active &&
                ev.status === "ACTIVE" &&
                (propertyId ? ev.propertyId === propertyId : true),
            )
            .map(normalizeEvent),
        );

        // Process Group Bookings: Match propertyId and sort Latest First (ID Descending)
        const allBookings = Array.isArray(bookingRes)
          ? bookingRes
          : (bookingRes?.data ?? []);
        const sortedBookings = allBookings
          .filter((b) => (propertyId ? b.propertyId === propertyId : true))
          .sort((a, b) => b.id - a.id);

        setGroupBookings(sortedBookings);
      } catch (err) {
        toast.error("Error loading events data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId]);

  // Auto-carousel for events
  useEffect(() => {
    if (events.length <= 2 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 2 >= events.length ? 0 : prev + 2));
    }, 5000);
    return () => clearInterval(timer);
  }, [events, isPaused]);

  const openInquiry = (type) => {
    setBookingType(type);
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setShowModal(false);
    toast.success(`Inquiry sent for ${bookingType}!`);
    setStep(1);
    setFormData({ name: "", email: "", phone: "" });
  };

  // Pagination Logic
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
    <section id="events" className="py-8 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="lg:w-[70%] flex flex-col pt-2 mb-6">
          <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
            Events <span className="italic text-primary">& Celebrations</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light tracking-wide">
            Explore international delicacies curated for every event.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Events Section */}
          <div
            className="lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              {displayedEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
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
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((item, index) => {
                    const style = COLOR_PALETTE[index % COLOR_PALETTE.length];
                    return (
                      <button
                        key={item.id}
                        onClick={() => openInquiry(item.title)}
                        className={`w-full flex items-center gap-4 p-5 rounded-2xl border ${style.border} ${style.color} transition-transform hover:scale-[1.02] text-left group`}
                      >
                        <div className="shrink-0">
                          {getBookingIcon(item.title)}
                        </div>
                        <span className="font-bold text-sm md:text-base tracking-tight">
                          {item.title}
                        </span>
                        <ArrowRight
                          size={16}
                          className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity"
                        />
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm italic">
                    No group packages available.
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-dashed border-border text-center">
                <p className="text-xs text-muted-foreground mb-4 italic">
                  Planning a large gathering? Let our experts handle the
                  details.
                </p>
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
                      Inquiry: {bookingType}
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                      Step {step} of 2
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                {step === 1 ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your Name"
                          className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+91"
                          className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                    </div>
                    <Button
                      disabled={!formData.name || !formData.phone}
                      onClick={() => setStep(2)}
                      className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px] tracking-[0.2em]"
                    >
                      Next Step <ChevronRight size={14} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <Input
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="email@example.com"
                          className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="h-14 rounded-xl px-8 dark:text-white"
                      >
                        Back
                      </Button>
                      <Button
                        disabled={isSubmitting || !formData.email}
                        onClick={handleFinalSubmit}
                        className="flex-1 h-14 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20"
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

function EventCard({ event, index }) {
  const isVideo = event.image.type === "VIDEO";
  const isBanner = isVideo || detectBanner(event.image);
  const dateObj = new Date(event.eventDate);
  const day = dateObj.getDate();
  const month = dateObj
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  const handleCta = () => {
    if (event.ctaLink) window.open(event.ctaLink, "_blank", "noopener");
  };

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="group h-[520px] bg-card border rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
    >
      <div
        className={`relative overflow-hidden ${isBanner ? "flex-1" : "h-[280px]"}`}
      >
        {isVideo ? (
          <video
            src={event.image.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <OptimizedImage
            src={event.image.url}
            alt={event.title}
            className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
          />
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
            <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out space-y-4">
              <div>
                <h3 className="text-white font-serif font-bold text-2xl">
                  {event.title}
                </h3>
                <p className="text-white/70 text-xs italic font-light line-clamp-2 mt-1">
                  {event.description}
                </p>
              </div>
              {event.ctaText && (
                <div className="flex gap-2 pb-2">
                  <button
                    onClick={handleCta}
                    className="flex-[2] py-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider bg-primary text-white shadow-lg transition-all"
                  >
                    {event.ctaText}
                  </button>
                  <button className="flex-1 bg-white/20 backdrop-blur-md text-white py-3 rounded-xl text-[10px] font-bold flex items-center justify-center uppercase tracking-wider border border-white/20 hover:bg-white hover:text-black transition-colors">
                    Details
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isBanner && (
        <div className="p-6 flex flex-col flex-1 bg-card text-left">
          <h3 className="text-lg font-serif font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {event.description}
          </p>
          {event.ctaText && (
            <div className="mt-auto pt-4 border-t border-dashed border-border flex items-center gap-2">
              <button
                onClick={handleCta}
                className="flex-[2] py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider bg-primary text-white"
              >
                {event.ctaText}
              </button>
              <button className="flex-1 bg-muted text-foreground py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center uppercase tracking-wider">
                Details
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
