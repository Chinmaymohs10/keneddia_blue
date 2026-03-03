import { useState, useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";

// Swiper Styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
interface MediaItem {
  mediaId: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  fileName: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface HeroSlide {
  id: number;
  type: "video" | "image";
  media: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundAll: MediaItem[];
  backgroundLight: MediaItem[];
  backgroundDark: MediaItem[];
}

interface HotelHeroSectionProps {
  slides: HeroSlide[];
  loading: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const getCurrentTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const selectMediaByTheme = (
  theme: "light" | "dark",
  all: MediaItem[],
  light: MediaItem[],
  dark: MediaItem[]
): MediaItem | null => {
  if (theme === "dark" && dark?.length > 0) return dark[0];
  if (theme === "light" && light?.length > 0) return light[0];
  return all?.[0] || light?.[0] || dark?.[0] || null;
};

// ── Component ──────────────────────────────────────────────────────────────
export default function HotelHeroSection({ slides, loading }: HotelHeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(getCurrentTheme());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Theme observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) setCurrentTheme(newTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [currentTheme]);

  const handleImageError = useCallback((url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    if (swiperInstance) swiperInstance.slideToLoop(index);
  }, [swiperInstance]);

  const renderMedia = useCallback((slide: HeroSlide) => {
    const media = selectMediaByTheme(currentTheme, slide.backgroundAll, slide.backgroundLight, slide.backgroundDark);
    const mediaUrl = media?.url || "";

    if (!mediaUrl || imageErrors.has(mediaUrl)) return null;

    if (media?.type === "VIDEO") {
      return (
        <video
          autoPlay loop muted playsInline preload="metadata"
          className="w-full h-full object-cover"
          key={mediaUrl}
          onError={() => handleImageError(mediaUrl)}
        >
          <source src={mediaUrl} type="video/mp4" />
        </video>
      );
    }

    return (
      <img
        src={mediaUrl}
        alt={slide.title}
        className="w-full h-full object-cover"
        onError={() => handleImageError(mediaUrl)}
      />
    );
  }, [currentTheme, imageErrors, handleImageError]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-background">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 size={48} className="animate-spin text-primary" />
        </div>
      )}

      <Swiper
        modules={[EffectFade, Autoplay, Navigation]}
        effect="fade"
        speed={1200}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={slides.length > 1}
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.id}-${currentTheme}`} className="relative w-full h-full">
            {/* Background Media */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {renderMedia(slide)}
            </div>
            
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="container mx-auto h-full px-8 md:px-16 lg:px-24 flex items-center">
                <div className="w-full md:w-[70%] xl:w-[60%] pointer-events-auto">
                  <motion.h1
                    key={`title-${index}-${activeIndex}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6 leading-tight drop-shadow-lg"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    key={`subtitle-${index}-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-lg md:text-xl text-white/90 font-light mb-10 tracking-wide uppercase"
                  >
                    {slide.subtitle}
                  </motion.p>
                  
                  {slide.ctaText && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      onClick={() => slide.ctaLink && (window.location.href = slide.ctaLink)}
                      className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-amber-400 transition-colors duration-300"
                    >
                      {slide.ctaText}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Curve SVG */}
            <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 z-10 pointer-events-none">
              <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                <path
                  className="fill-background"
                  d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,181.3C672,171,768,181,864,181.3C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </svg>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Desktop Navigation & Thumbnails */}
      <div className="hidden md:flex absolute right-8 lg:right-12 bottom-40 z-20 flex-col items-end gap-6">
        <div className="flex flex-row items-end gap-4">
          {slides.map((slide, index) => (
            <div
              key={`thumb-${slide.id}`}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-24 h-32 cursor-pointer overflow-hidden transition-all duration-500 border-2 ${
                activeIndex === index ? "border-white scale-110 shadow-2xl" : "border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
              }`}
            >
              {renderMedia(slide)}
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ))}
        </div>

        {/* Indicators & Buttons */}
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-500 ${activeIndex === index ? "w-12 bg-white" : "w-6 bg-white/30"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => swiperInstance?.slidePrev()} className="p-2 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => swiperInstance?.slideNext()} className="p-2 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}