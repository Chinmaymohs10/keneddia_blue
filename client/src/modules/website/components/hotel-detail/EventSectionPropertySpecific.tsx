import { useState, useEffect, useRef } from "react";
import { format, parseISO, isBefore, startOfToday } from "date-fns";
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { getEventsUpdated } from "@/Api/Api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";

interface EventImage {
  mediaId: number;
  type: string;
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  locationId: number;
  locationName: string;
  propertyTypeId: number;
  typeName: string;
  eventDate: string;
  description: string;
  status: "ACTIVE" | "COMING_SOON" | "SOLD_OUT";
  ctaText: string;
  ctaLink: string | null;
  image: EventImage;
  active: boolean;
  longDesc: string;
}

interface EventSectionPropertySpecificProps {
  locationId: number;
  locationName?: string;
  singleCard?: boolean;
}

/* ================= EVENT CARD ================= */
function EventCard({ event, index }: { event: Event; index: number }) {
  const navigate = useNavigate();
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const OFFER_STYLE_PORTRAIT_RATIO = 1080 / 1920;
  const activeMedia = event.image;

  const isVideo =
    activeMedia?.type === "VIDEO" || activeMedia?.url?.includes(".mp4");

  useEffect(() => {
    setIsMuted(true);
  }, [event.id]);

  const analyzeMediaSize = (w: number, h: number) => {
    if (w / h <= OFFER_STYLE_PORTRAIT_RATIO + 0.1) setIsBanner(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const day = new Date(event.eventDate).getDate();
  const month = new Date(event.eventDate)
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(buildEventDetailPath(event))}
      className="group mx-auto flex h-[520px] w-full max-w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl sm:max-w-[300px]"
    >
      {/* Media Container */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ${
          isBanner ? "h-full" : "h-[280px]"
        }`}
      >
        {activeMedia?.url ? (
          isVideo ? (
            <>
              <video
                src={activeMedia.url}
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
              <video
                ref={videoRef}
                src={activeMedia.url}
                className="relative z-10 w-full h-full object-contain object-top transition-transform duration-700 group-hover:scale-105"
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
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </>
          ) : (
            <>
              <img
                src={activeMedia.url}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50"
              />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
              <img
                src={activeMedia.url}
                alt={activeMedia.alt || event.title}
                className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                onLoad={(e) =>
                  analyzeMediaSize(
                    e.currentTarget.naturalWidth,
                    e.currentTarget.naturalHeight,
                  )
                }
              />
            </>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 left-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/10">
          <span className="text-lg font-black leading-none">{day}</span>
          <span className="text-[9px] font-bold tracking-tighter">{month}</span>
        </div>

        {/* Location Badge */}
        <div className="absolute top-4 right-4 z-20 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1">
          <MapPin size={10} /> {event.locationName}
        </div>

        {/* Banner Hover Overlay */}
        {isBanner && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <h3 className="text-white font-serif font-bold text-xl mb-2 drop-shadow-md">
              {event.title}
            </h3>
            <p className="text-white/80 text-xs mb-6 line-clamp-2 italic drop-shadow-sm">
              {event.description}
            </p>
            <div className="flex gap-2">
              {event.ctaText?.trim() && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(buildEventDetailPath(event));
                  }}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {event.ctaText} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Standard Mode Content */}
      {!isBanner && (
        <div className="p-6 flex flex-col flex-1 bg-card">
          <h3 className="text-lg font-serif font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-2 mb-3">
            <Clock size={12} className="text-primary" />
            <span className="text-[11px] font-medium italic uppercase">
              {format(parseISO(event.eventDate), "EEE, dd MMM yyyy")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {event.description}
          </p>
          <div className="mt-auto pt-4 border-t border-dashed border-border flex gap-2">
            {event.ctaText?.trim() && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(buildEventDetailPath(event));
                }}
                className="flex-1 bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform hover:opacity-90"
              >
                {event.ctaText} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ================= MAIN ================= */
export default function EventSectionPropertySpecific({
  locationId,
  locationName,
  singleCard = false,
}: EventSectionPropertySpecificProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Each card is (100% / 2.2) wide so 2 full cards + ~20% of 3rd are visible.
  // We slide by one card width at a time = 100 / 2.2 ≈ 45.45% of track width.
  // The track width = events.length * cardWidthPct + gaps, but since we use %
  // on the card itself relative to the *overflow container*, we translate
  // using the card's own percentage share of that container.
  //
  // Simpler approach that's reliable:
  // card flex-basis = calc(45.45% - gap)  →  2 visible + 20% peek
  // translate step  = calc(45.45%)        →  shift exactly one card slot
  const CARD_PCT = 100 / 2.2; // ≈ 45.45 — portion of container each card occupies

  // Refs to avoid stale closures inside the interval
  const isHoveredRef = useRef(false);
  const eventsLengthRef = useRef(0);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    eventsLengthRef.current = events.length;
  }, [events.length]);

  useEffect(() => {
    fetchEvents();
  }, [locationId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEventsUpdated();
      const allEvents = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      const filteredEvents = allEvents.filter((event: Event) => {
        const isMatchingLocation =
          Number(event.locationId) === Number(locationId);
        const isActive = event.active === true;
        if (!event.eventDate) return false;
        const isUpcoming = !isBefore(parseISO(event.eventDate), startOfToday());
        return isMatchingLocation && isActive && isUpcoming;
      });

      setEvents(
        filteredEvents.sort(
          (a: Event, b: Event) =>
            new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
        ),
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Loop through all events one by one; wrap back to 0 after last.
  const totalSlides = events.length;

  const handlePrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));

  const handleNext = () =>
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));

  // Auto-slide: only when > 2 events; pauses on hover via ref.
  useEffect(() => {
    if (events.length <= 2) return;

    const interval = window.setInterval(() => {
      if (isHoveredRef.current) return;
      setCurrentIndex((prev) =>
        prev === eventsLengthRef.current - 1 ? 0 : prev + 1,
      );
    }, 3500);

    return () => window.clearInterval(interval);
  }, [events.length]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-muted/20">
        <p className="text-muted-foreground italic mb-2">
          No upcoming events at this location
        </p>
        {locationName && (
          <p className="text-xs text-muted-foreground/60">
            Location: {locationName}
          </p>
        )}
      </div>
    );
  }

  if (singleCard) {
    return (
      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {events.map((event, index) => (
              <div key={event.id} className="w-full flex-shrink-0">
                <EventCard event={event} index={index} />
              </div>
            ))}
          </div>
        </div>

        {events.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-white/90 p-2 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-primary hover:text-white dark:border-white/20 dark:bg-white/15 dark:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-white/90 p-2 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-primary hover:text-white dark:border-white/20 dark:bg-white/15 dark:text-white"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex justify-center gap-2 mt-4">
              {events.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === idx
                      ? "bg-primary w-5"
                      : "bg-border hover:bg-muted-foreground w-1.5"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Single event ── */
  if (events.length === 1) {
    return (
      <div className="w-full max-w-sm">
        <EventCard event={events[0]} index={0} />
      </div>
    );
  }

  /* ── 2 events: side by side, no carousel ── */
  if (events.length === 2) {
    return (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {events.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}
      </div>
    );
  }

  /* ── 3+ events: peek carousel — fits 100% of parent width ── */
  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clip to parent width — no overflow, no layout shift */}
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap: "16px",
            // Shift by currentIndex × one card slot width.
            // One card slot = CARD_PCT% of the container.
            transform: `translateX(calc(-${currentIndex} * (${CARD_PCT}% + 16px / 2.2)))`,
          }}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className="flex-shrink-0"
              style={{
                // 2 full cards + 20% peek of the 3rd = CARD_PCT% each
                width: `calc(${CARD_PCT}% - 10px)`,
              }}
            >
              <EventCard event={event} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Prev arrow — sits inside the container, overlapping left edge */}
      <button
        onClick={handlePrevious}
        className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-white/90 p-2 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-primary hover:text-white dark:border-white/20 dark:bg-white/15 dark:text-white"
        aria-label="Previous"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Next arrow — sits inside the container, overlapping right edge */}
      <button
        onClick={handleNext}
        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-white/90 p-2 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-primary hover:text-white dark:border-white/20 dark:bg-white/15 dark:text-white"
        aria-label="Next"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {events.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${
              currentIndex === idx
                ? "bg-primary w-5"
                : "bg-border hover:bg-muted-foreground w-1.5"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
