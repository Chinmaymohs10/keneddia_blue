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
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { getEventsUpdated } from "@/Api/Api";

// ============================================================================
// TYPES
// ============================================================================
export interface ApiEvent {
  id: number | string;
  title: string;
  propertyName?: string;
  propertyId?: number | string;
  locationName: string;
  eventDate: string;
  description: string;
  longDesc: string | null;
  image: { url: string; type?: string };
  ctaText: string;
  ctaLink: string | null;
  typeName?: string;
  time?: string;
}

// ============================================================================
// FALLBACKS
// ============================================================================
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200";

// Static property name used when propertyName is absent
const FALLBACK_PROPERTY_NAME = "Kennedia Hotels & Restaurants";

const STATIC_UPCOMING_EVENTS: ApiEvent[] = [
  {
    id: "static-1",
    title: "Sunday Brunch Extravaganza",
    locationName: "Kennedia Grand, Bengaluru",
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      "A lavish spread of live stations, artisanal pastries, and free-flow beverages in an elegant setting.",
    longDesc: null,
    image: {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900",
    },
    ctaText: "Reserve Now",
    ctaLink: null,
    typeName: "Restaurant",
    time: "11:00 AM – 3:00 PM",
  },
  {
    id: "static-2",
    title: "Live Jazz & Cocktail Night",
    locationName: "Kennedia Skybar, Bengaluru",
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      "An intimate evening with live jazz performances, signature cocktails, and rooftop city views.",
    longDesc: null,
    image: {
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=900",
    },
    ctaText: "Book Seats",
    ctaLink: null,
    typeName: "Hotel",
    time: "7:30 PM onwards",
  },
  {
    id: "static-3",
    title: "Chef's Table: Farm to Fork",
    locationName: "Kennedia Bistro, Bengaluru",
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      "A curated 7-course tasting menu crafted from locally sourced seasonal produce by our executive chef.",
    longDesc: null,
    image: {
      url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=900",
    },
    ctaText: "Reserve Table",
    ctaLink: null,
    typeName: "Restaurant",
    time: "7:00 PM – 10:00 PM",
  },
];

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

  const isVideo =
    ev.image?.type === "VIDEO" || ev.image?.url?.includes(".mp4");

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
      className="group h-[480px] bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-500 hover:shadow-xl cursor-pointer"
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
                    e.currentTarget.videoHeight
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
                  e.currentTarget.naturalHeight
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
            <Link
              to={`/events/${ev.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 bg-[#E33E33] text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              View Details <ArrowRight size={14} />
            </Link>
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
            <Link
              to={`/events/${ev.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 bg-[#E33E33] text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E33E33]/90 active:scale-95 transition-all"
            >
              View Details <ArrowRight size={13} />
            </Link>
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
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStatic, setIsStatic] = useState(false);
  const [swiper, setSwiper] = useState<any>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const response = await getEventsUpdated({});
        const all: ApiEvent[] = response?.data || response || [];
        const now = Date.now();

        const filtered = all.filter((e) => {
          const isSameProperty = propertyId
            ? e.propertyId?.toString() === propertyId.toString()
            : true;
          const isUpcoming = new Date(e.eventDate).getTime() >= now;
          const isNotCurrent = e.id.toString() !== currentEventId.toString();
          return isSameProperty && isUpcoming && isNotCurrent;
        });

        if (filtered.length > 0) {
          setEvents(filtered.slice(0, 8));
          setIsStatic(false);
        } else {
          setEvents(STATIC_UPCOMING_EVENTS);
          setIsStatic(true);
        }
      } catch {
        setEvents(STATIC_UPCOMING_EVENTS);
        setIsStatic(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, [propertyId, currentEventId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-[#E33E33]" />
      </div>
    );

  return (
    <section className="space-y-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold">Upcoming Events</h2>
            {isStatic && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground">
                Suggested
              </span>
            )}
          </div>
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