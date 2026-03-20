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
}

/* ================= EVENT CARD — matches EventsSection exactly ================= */
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
      onClick={() => navigate(`/events/${event.id}`)}
      className="group h-[520px] bg-card border border-border/60 rounded-[1rem] overflow-hidden flex flex-col shadow-sm relative transition-all duration-500 hover:shadow-xl cursor-pointer"
    >
      {/* Media Container */}
      <div
        className={`relative overflow-hidden transition-all duration-500 ${
          isBanner ? "h-full" : "h-[280px]"
        }`}
      >
        {event.image?.url ? (
          isVideo ? (
            <>
              <video
                ref={videoRef}
                src={event.image.url}
                className="w-full h-full object-contain object-top transition-transform duration-700 group-hover:scale-105"
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
            <img
              src={event.image.url}
              alt={event.image.alt || event.title}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
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
                    navigate(`/events/${event.id}`);
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
                  navigate(`/events/${event.id}`);
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
}: EventSectionPropertySpecificProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handlePrevious = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, events.length - 2) : prev - 1,
    );

  const handleNext = () =>
    setCurrentIndex((prev) => (prev >= events.length - 2 ? 0 : prev + 1));

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

  /* ── Single event ── */
  if (events.length === 1) {
    return (
      <div className="max-w-sm">
        <EventCard event={events[0]} index={0} />
      </div>
    );
  }

  /* ── Multiple events carousel ── */
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out gap-5"
          style={{ transform: `translateX(-${currentIndex * (100 / 2)}%)` }}
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className="min-w-[calc(50%-10px)] flex-shrink-0"
            >
              <EventCard event={event} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      {events.length > 2 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white border border-border rounded-full p-2 shadow-lg hover:bg-primary hover:text-white transition-all z-10 disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= events.length - 2}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white border border-border rounded-full p-2 shadow-lg hover:bg-primary hover:text-white transition-all z-10 disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {events.length > 2 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: Math.ceil(events.length / 2) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 2) === idx
                  ? "bg-primary w-6"
                  : "bg-border hover:bg-muted-foreground w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
