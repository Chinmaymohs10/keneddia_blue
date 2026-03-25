import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { getEventsUpdated } from "@/Api/Api";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";

// ============================================================================
// TYPES
// ============================================================================
export interface ApiEvent {
  id: number | string;
  title: string;
  propertyName?: string;
  propertyId?: number | string | null;
  locationName: string;
  eventDate: string;
  description: string;
  longDesc: string | null;
  image: { url: string; type?: string };
  ctaText: string;
  ctaLink: string | null;
  typeName?: string;
  time?: string;
  active?: boolean;
  status?: string;
  propertyTypeId?: number | string | null;
}

// ============================================================================
// FALLBACK CONSTANTS
// ============================================================================
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200";

// Static property name used when propertyName is absent
const FALLBACK_PROPERTY_NAME = "Kennedia Hotels & Restaurants";

// ============================================================================
// UPCOMING EVENT CARD
// ============================================================================
export function UpcomingEventCard({
  ev,
  index,
}: {
  ev: ApiEvent;
  index: number;
}) {
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const isVideo = ev.image?.type === "VIDEO" || ev.image?.url?.includes(".mp4");

  const analyzeMediaSize = (w: number, h: number) => {
    if (w / h <= 0.85) setIsBanner(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((p) => !p);
    }
  };

  const day = new Date(ev.eventDate).getDate();
  const month = new Date(ev.eventDate)
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      onClick={() => navigate(buildEventDetailPath(ev))}
      className="group h-[520px] bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl cursor-pointer"
    >
      {/* Media */}
      <div
        className={`relative overflow-hidden flex items-start justify-center bg-muted/10 ${
          isBanner ? "h-full" : "h-[260px]"
        }`}
      >
        {ev.image?.url ? (
          isVideo ? (
            <>
              <video
                ref={videoRef}
                src={ev.image.url}
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
                className="absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 backdrop-blur-sm"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </>
          ) : (
            <img
              src={ev.image.url}
              alt={ev.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onLoad={(e) =>
                analyzeMediaSize(
                  e.currentTarget.naturalWidth,
                  e.currentTarget.naturalHeight,
                )
              }
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-4 left-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10">
          <span className="text-lg font-black leading-none">{day}</span>
          <span className="text-[9px] font-bold tracking-tighter">{month}</span>
        </div>

        {/* Location badge */}
        <div className="absolute top-4 right-4 z-20 bg-[#E33E33] text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1 max-w-[45%] truncate">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">{ev.locationName}</span>
        </div>

        {/* Banner hover overlay */}
        {isBanner && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <h3 className="text-white font-serif font-bold text-xl mb-2">
              {ev.title}
            </h3>
            <p className="text-white/80 text-xs mb-5 line-clamp-2 italic">
              {ev.description}
            </p>
            {ev.ctaText?.trim() && (
              <Link
                to={buildEventDetailPath(ev)}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 bg-[#E33E33] text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                {ev.ctaText} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Standard body */}
      {!isBanner && (
        <div className="p-5 flex flex-col flex-1 bg-card">
          <h3 className="text-base font-serif font-bold line-clamp-1 leading-tight group-hover:text-[#E33E33] transition-colors">
            {ev.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5 mb-2">
            <Clock size={11} className="text-[#E33E33] shrink-0" />
            <span className="text-[11px] font-medium italic uppercase truncate">
              {ev.time || "7:00 PM onwards"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {ev.description}
          </p>
          <div className="mt-auto pt-4 border-t border-dashed border-border">
            {ev.ctaText?.trim() && (
              <Link
                to={buildEventDetailPath(ev)}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 bg-[#E33E33] text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                {ev.ctaText} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// UPCOMING PROPERTY EVENTS (Swiper-based carousel)
// ============================================================================
interface UpcomingPropertyEventsProps {
  propertyId: number | string | undefined;
  currentEventId: number | string;
}

export function UpcomingPropertyEvents({
  propertyId,
  currentEventId,
}: UpcomingPropertyEventsProps) {
  const [events, setEvents] = useState<ApiEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiper, setSwiper] = useState<any>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);

        const response = await getEventsUpdated({});
        const all: ApiEvent[] = response?.data || response || [];

        // Find the currently opened event
        const currentEvent = all.find(
          (e) => e.id.toString() === currentEventId.toString(),
        );

        if (!currentEvent) {
          setEvents([]);
          return;
        }

        const propertyTypeId = currentEvent.propertyTypeId;

        const now = new Date();

        // normalize today to start of day (00:00:00)
        now.setHours(0, 0, 0, 0);

        const filtered = all.filter((e) => {
          if (!e.active) return false;

          const eventDate = new Date(e.eventDate);

          // normalize event date also
          eventDate.setHours(0, 0, 0, 0);

          // ❗ keep today + future, remove only past days
          if (eventDate < now) return false;

          if (e.id.toString() === currentEventId.toString()) return false;

          if (propertyTypeId != null) {
            if (e.propertyTypeId == null) return false;
            if (e.propertyTypeId.toString() !== propertyTypeId.toString())
              return false;
          }

          return true;
        });

        setEvents(
          filtered
            .sort(
              (a, b) =>
                new Date(a.eventDate).getTime() -
                new Date(b.eventDate).getTime(),
            )
            .slice(0, 8),
        );
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [currentEventId]);

  if (loading || events === null)
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-[#E33E33]" />
      </div>
    );
  if (events.length === 0) return null;

  return (
    <section className="space-y-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold">Upcoming Events</h2>
          <div className="h-0.5 w-8 bg-[#E33E33] mt-1 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/events"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#E33E33] hover:gap-2 transition-all"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => swiper?.slidePrev()}
            className="p-2 rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => swiper?.slideNext()}
            className="p-2 rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onSwiper={setSwiper}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="!pb-2"
      >
        {events.map((ev, i) => (
          <SwiperSlide key={ev.id}>
            <UpcomingEventCard ev={ev} index={i} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

// Re-export fallback property name for use in EventDetails page
export { FALLBACK_PROPERTY_NAME };
