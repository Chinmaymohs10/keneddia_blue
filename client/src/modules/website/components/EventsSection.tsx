import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Loader2,
  Image as ImageIcon,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { getEventsUpdated } from "@/Api/Api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ApiEvent {
  id: number | string;
  title: string;
  locationName: string;
  eventDate: string;
  description: string;
  status: "ACTIVE" | "COMING_SOON" | "SOLD_OUT";
  active: boolean;
  ctaText: string;
  ctaLink: string | null;
  image?: {
    type?: "IMAGE" | "VIDEO";
    url: string;
    width?: number | null;
    height?: number | null;
    fileName?: string | null;
  } | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EventsSection() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventData();
  }, []);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await getEventsUpdated();

      const rawEvents = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      const activeEvents = rawEvents.filter(
        (event: any) => event.active === true,
      );

      setApiEvents(
        activeEvents.sort(
          (a: any, b: any) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
        ),
      );
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-[520px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <section id="events" className="py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Upcoming Events
            </h2>
            <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Link
              to="/events"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => swiper?.slidePrev()}
              className="p-2 rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => swiper?.slideNext()}
              className="p-2 rounded-full border border-border bg-background hover:bg-muted transition-colors shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

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
            1280: { slidesPerView: 4 },
          }}
          className="!pb-12"
        >
          {apiEvents.map((event, index) => (
            <SwiperSlide key={event.id}>
              <EventCard event={event} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

// ============================================================================
// EVENT CARD
// ============================================================================

function EventCard({ event, index }: { event: ApiEvent; index: number }) {
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo =
    event.image?.type === "VIDEO" || event.image?.url?.includes(".mp4");

  const analyzeMediaSize = (w: number, h: number) => {
    const ratio = w / h;
    if (ratio <= 0.85) setIsBanner(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  };

  const { day, month } = formatDate(event.eventDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group h-[520px] bg-card border rounded-2xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-500 hover:shadow-xl cursor-pointer"
    >
      {/* Media Container */}
      <div
        className={`relative overflow-hidden ${
          isBanner ? "h-full" : "h-[280px]"
        } flex items-start justify-center bg-card`}
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
              {/* Mute / Unmute Button */}
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
              alt={event.title}
             className="w-full h-full object-contain object-top transition-transform duration-700 group-hover:scale-105"
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

        {/* Banner Mode Hover Overlay */}
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
                <Link
                  to={event.ctaLink || "#"}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {event.ctaText} <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Standard Mode UI */}
      {!isBanner && (
        <div className="p-6 flex flex-col flex-1 bg-card">
          <h3 className="text-lg font-serif font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-2 mb-3">
            <Clock size={12} className="text-primary" />
            <span className="text-[11px] font-medium italic uppercase">
              Available 8:00 PM
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {event.description}
          </p>

          <div className="mt-auto pt-4 border-t border-dashed border-border flex gap-2">
            {event.ctaText?.trim() && (
              <Link
                to={event.ctaLink || "#"}
                className="flex-1 bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
              >
                {event.ctaText} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
