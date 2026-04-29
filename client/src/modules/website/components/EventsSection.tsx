import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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

export default function EventsSection({
  initialEvents = [],
}: {
  initialEvents?: ApiEvent[];
}) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);

  useEffect(() => { fetchEventData(); }, []);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await getEventsUpdated();
      const rawEvents = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response) ? response : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeEvents = rawEvents.filter((event: any) => {
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return event.active === true && eventDate >= today;
      });
      setApiEvents(
        activeEvents.sort((a: any, b: any) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )
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
          spaceBetween={16}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          onSwiper={setSwiper}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
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

// ── EVENT CARD ───────────────────────────────────────────────────────────────

function EventCard({ event, index }: { event: ApiEvent; index: number }) {
  const navigate=useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Offer-style portrait target ratio (1080x1920)
  const TARGET_RATIO = 1080 / 1920;

  const isVideo = event.image?.type === "VIDEO" || event.image?.url?.includes(".mp4");
  const imageUrl = event.image?.url || "";

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > 0) setNaturalRatio(naturalWidth / naturalHeight);
  };

  const handleVideoMeta = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    if (videoHeight > 0) setNaturalRatio(videoWidth / videoHeight);
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
    if (!dateString) return { day: "—", month: "—" };
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  };

  const { day, month } = formatDate(event.eventDate);

  // Portrait/tall images (ratio ≤ TARGET + buffer) → full-frame mode
  // Wider images → split mode (image top + info panel below)
  const isFullFrame = naturalRatio === null || naturalRatio <= TARGET_RATIO + 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(buildEventDetailPath(event))}
      className="group relative w-full h-[440px] sm:h-[520px] flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl cursor-pointer"
    >
      {isFullFrame ? (
        /* ── FULL-FRAME MODE ─────────────────────────────────────────────── */
        <div className="relative w-full h-full">

          {/* Blurred image bg — fills any letterbox gaps with the image's own colours */}
          {imageUrl && (
            <img
              src={imageUrl}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110"
              style={{ filter: "blur(18px)", opacity: 0.55 }}
            />
          )}
          {/* Dark overlay on top of blur to deepen it */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Actual media — object-contain, no crop */}
          <Link 
            to={buildEventDetailPath(event)} 
            className="absolute inset-0 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {imageUrl ? (
              isVideo ? (
                <video
                  ref={videoRef}
                  src={imageUrl}
                  className="w-full h-full object-cover sm:object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedMetadata={handleVideoMeta}
                />
              ) : (
                <img
                  src={imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover sm:object-contain"
                  onLoad={handleImageLoad}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-white/20" />
              </div>
            )}
          </Link>

          {/* Mute button needs to be outside Link to stay clickable */}
          {imageUrl && isVideo && (
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Date badge */}
          <div className="absolute top-4 left-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/10">
            <span className="text-lg font-black leading-none">{day}</span>
            <span className="text-[9px] font-bold tracking-tighter">{month}</span>
          </div>

          {/* Location badge */}
          <div className="absolute top-4 right-4 z-20 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1">
            <MapPin size={10} /> {event.locationName}
          </div>

          {/* Hover info overlay */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <h3 className="text-white font-serif font-bold text-xl mb-1 drop-shadow-md line-clamp-1">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-white/80 text-xs mb-4 line-clamp-2 italic">
                {event.description}
              </p>
            )}
            {event.ctaText?.trim() && (
              <Link
                to={buildEventDetailPath(event)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
              >
                {event.ctaText} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* ── SPLIT MODE: wider images — image top + info panel fills blank space ── */
        <>
          <div
            className="relative w-full overflow-hidden flex-shrink-0 bg-black"
            style={{ height: `${Math.min(Math.round((1 / naturalRatio!) * 100), 65)}%` }}
          >
            {/* Blurred image bg for split mode too */}
            {imageUrl && (
              <img
                src={imageUrl}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110"
                style={{ filter: "blur(14px)", opacity: 0.5 }}
              />
            )}
            <div className="absolute inset-0 bg-black/20" />

            <Link 
              to={buildEventDetailPath(event)} 
              className="relative z-10 block w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={imageUrl}
                className="w-full h-full object-cover sm:object-contain transition-transform duration-700 group-hover:scale-105"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedMetadata={handleVideoMeta}
                />
              ) : (
                <img
                  src={imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover sm:object-contain transition-transform duration-700 group-hover:scale-105"
                  onLoad={handleImageLoad}
                />
              )}
            </Link>

            {isVideo && (
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {/* Date badge */}
            <div className="absolute top-4 left-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/10">
              <span className="text-lg font-black leading-none">{day}</span>
              <span className="text-[9px] font-bold tracking-tighter">{month}</span>
            </div>

            {/* Location badge */}
            <div className="absolute top-4 right-4 z-20 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1">
              <MapPin size={10} /> {event.locationName}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col flex-1 p-5 bg-card min-h-0">
            <Link 
              to={buildEventDetailPath(event)}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-serif font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                {event.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-2 mb-2">
              <Clock size={12} className="text-primary flex-shrink-0" />
              <span className="text-[11px] font-medium italic uppercase truncate">
                {event.eventDate
                  ? new Date(event.eventDate).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : "Date TBA"}
              </span>
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                {event.description}
              </p>
            )}
            <div className="mt-auto pt-3 border-t border-dashed border-border">
              {event.ctaText?.trim() && (
                <Link
                  to={buildEventDetailPath(event)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-primary text-white py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform"
                >
                  {event.ctaText} <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
