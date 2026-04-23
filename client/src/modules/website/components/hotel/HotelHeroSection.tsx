import { useState, useEffect, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

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
  showOnMobilePage?: boolean | null;
  backgroundAll: MediaItem[];
  backgroundLight: MediaItem[];
  backgroundDark: MediaItem[];
  subAll?: MediaItem[];
  subLight?: MediaItem[];
  subDark?: MediaItem[];
}

interface HotelHeroSectionProps {
  slides: HeroSlide[];
  loading: boolean;
}

const EmptyHeroState = ({
  title = "No Slides Available",
  subtitle = "Hero section has no active slides configured.",
}: {
  title?: string;
  subtitle?: string;
}) => (
  <section className="relative h-[90vh] w-full overflow-hidden bg-neutral-900">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-700 via-neutral-800 to-neutral-950 opacity-80" />
    <div className="absolute inset-0 backdrop-blur-sm" />
    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
        {title}
      </div>
      <p className="text-sm text-white/25">{subtitle}</p>
    </div>
    <div className="pointer-events-none absolute bottom-0 left-0 z-10 hidden h-32 w-full md:block md:h-40">
      <svg viewBox="0 0 1440 320" className="h-full w-full" preserveAspectRatio="none">
        <path
          className="fill-background"
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,181.3C672,171,768,181,864,181.3C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  </section>
);

const getCurrentTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const selectMediaByTheme = (
  theme: "light" | "dark",
  all: MediaItem[],
  light: MediaItem[],
  dark: MediaItem[],
): MediaItem | null => {
  if (theme === "dark" && dark?.length > 0) return dark[0];
  if (theme === "light" && light?.length > 0) return light[0];
  if (all?.length > 0) return all[0];
  if (light?.length > 0) return light[0];
  if (dark?.length > 0) return dark[0];
  return null;
};

export default function HotelHeroSection({ slides, loading }: HotelHeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [mobileSwiperInstance, setMobileSwiperInstance] = useState<SwiperType | null>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(getCurrentTheme());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set());

  const mobileSlides = useMemo(
    () => slides.filter((s) => s.showOnMobilePage === true),
    [slides],
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) setCurrentTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [currentTheme]);

  useEffect(() => {
    setLoadedSlides(new Set());
  }, [slides, currentTheme]);

  const handleImageError = useCallback((url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const logMediaError = useCallback(
    (mediaRole: string, url: string, title: string) => {
      console.error(`[HotelHero] Failed to load ${mediaRole}`, {
        title,
        url,
      });
      handleImageError(url);
    },
    [handleImageError],
  );

  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (swiperInstance) swiperInstance.slideToLoop(index);
    },
    [swiperInstance],
  );

  const markSlideLoaded = useCallback((index: number) => {
    setLoadedSlides((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!swiperInstance || slides.length === 0) return;

    if (loadedSlides.has(activeIndex)) {
      swiperInstance.autoplay?.start();
      return;
    }

    swiperInstance.autoplay?.stop();
  }, [activeIndex, loadedSlides, slides.length, swiperInstance]);

  const getBackgroundMedia = useCallback(
    (slide: HeroSlide) => {
      const media = selectMediaByTheme(
        currentTheme,
        slide.backgroundAll,
        slide.backgroundLight,
        slide.backgroundDark,
      );

      return {
        mediaUrl: media?.url || "",
        mediaType: media?.type === "VIDEO" ? "video" as const : "image" as const,
      };
    },
    [currentTheme],
  );

  const getThumbnailMedia = useCallback(
    (slide?: HeroSlide | null) => {
      if (!slide) {
        return {
          mediaUrl: "",
          mediaType: "image" as const,
        };
      }

      const subMedia = selectMediaByTheme(
        currentTheme,
        slide.subAll || [],
        slide.subLight || [],
        slide.subDark || [],
      );
      const backgroundMedia = selectMediaByTheme(
        currentTheme,
        slide.backgroundAll,
        slide.backgroundLight,
        slide.backgroundDark,
      );
      const previewMedia = subMedia || backgroundMedia;

      return {
        mediaUrl: previewMedia?.url || "",
        mediaType: previewMedia?.type === "VIDEO" ? "video" as const : "image" as const,
      };
    },
    [currentTheme],
  );

  const renderDesktopMedia = useCallback(
    (slide: HeroSlide, index: number) => {
      const { mediaUrl, mediaType } = getBackgroundMedia(slide);
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;

      if (mediaType === "video") {
        return (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            key={mediaUrl}
            onLoadedData={() => markSlideLoaded(index)}
            onError={() => {
              logMediaError("desktop video", mediaUrl, slide.title);
              markSlideLoaded(index);
            }}
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
          onLoad={() => markSlideLoaded(index)}
          onError={() => {
            logMediaError("desktop image", mediaUrl, slide.title);
            markSlideLoaded(index);
          }}
        />
      );
    },
    [getBackgroundMedia, imageErrors, logMediaError, markSlideLoaded],
  );

  const renderMobileMedia = useCallback(
    (slide: HeroSlide, index: number) => {
      const { mediaUrl, mediaType } = getBackgroundMedia(slide);
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;

      if (mediaType === "video") {
        return (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
            key={mediaUrl}
            onLoadedData={() => markSlideLoaded(index)}
            onError={() => {
              logMediaError("mobile video", mediaUrl, slide.title);
              markSlideLoaded(index);
            }}
          >
            <source src={mediaUrl} type="video/mp4" />
          </video>
        );
      }

      return (
        <img
          src={mediaUrl}
          alt={slide.title}
          className="w-full h-full object-contain"
          onLoad={() => markSlideLoaded(index)}
          onError={() => {
            logMediaError("mobile image", mediaUrl, slide.title);
            markSlideLoaded(index);
          }}
        />
      );
    },
    [getBackgroundMedia, imageErrors, logMediaError, markSlideLoaded],
  );

  const renderThumbnail = useCallback(
    (slide?: HeroSlide | null) => {
      if (!slide) return null;

      const { mediaUrl, mediaType } = getThumbnailMedia(slide);
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;

      if (mediaType === "video") {
        return (
          <video
            src={mediaUrl}
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => logMediaError("thumbnail video", mediaUrl, slide.title)}
          />
        );
      }

      return (
        <img
          src={mediaUrl}
          alt={slide.subtitle || slide.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => logMediaError("thumbnail image", mediaUrl, slide.title)}
        />
      );
    },
    [getThumbnailMedia, imageErrors, logMediaError],
  );

  if (!loading && slides.length === 0) {
    return <EmptyHeroState />;
  }

  return (
    <section className="relative w-full h-auto md:h-screen overflow-hidden bg-background">
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
            <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden">
              {renderDesktopMedia(slide, index)}
            </div>
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="hidden md:block absolute inset-0 z-10 pointer-events-none">
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
                      disabled={!slide.ctaLink}
                      onClick={() => {
                        if (slide.ctaLink) { const url = /^https?:\/\//i.test(slide.ctaLink) ? slide.ctaLink : `https://${slide.ctaLink}`; window.open(url, "_blank", "noopener,noreferrer"); }
                      }}
                      className={`group relative px-6 py-2.5 font-semibold text-sm rounded-full overflow-hidden transition-all duration-500 ease-out flex items-center gap-2 border ${
                        !slide.ctaLink
                          ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                          : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)] hover:scale-105 hover:-translate-y-0.5 cursor-pointer border-amber-300/40"
                      }`}
                    >
                      {slide.ctaLink && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      )}
                      <span className="relative z-10">{slide.ctaText}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:block absolute bottom-0 left-0 w-full h-32 md:h-40 z-10 pointer-events-none">
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

      {/* ══════════════ MOBILE SWIPER ══════════════ */}
      <div className="block md:hidden">
        {mobileSlides.length === 0 ? (
          <div
            className="relative w-full overflow-hidden bg-neutral-900 flex items-center justify-center"
            style={{ height: "calc(75vw + 64px)", minHeight: "320px", maxHeight: "500px" }}
          >
            <div className="text-center px-6">
              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40 inline-block">
                Not Available on Mobile
              </div>
            </div>
          </div>
        ) : (
          <Swiper
            modules={[EffectFade, Autoplay, Navigation]}
            effect="fade"
            speed={1200}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop={mobileSlides.length > 1}
            onSwiper={setMobileSwiperInstance}
            onSlideChange={(swiper) => setMobileActiveIndex(swiper.realIndex)}
            className="w-full"
            style={{ height: "calc(75vw + 64px)", minHeight: "320px", maxHeight: "500px" }}
          >
            {mobileSlides.map((slide, index) => (
              <SwiperSlide key={`mobile-${slide.id}-${currentTheme}`} className="relative w-full h-full bg-black overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: "64px" }}>
                  {renderMobileMedia(slide, index)}
                </div>
                <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: "64px" }}>
                  <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 px-5 z-20 flex flex-col items-center justify-center text-center" style={{ top: "64px", bottom: "6.5rem" }}>
                  <motion.h1
                    key={`m-title-${index}-${mobileActiveIndex}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-xl font-serif font-semibold text-white leading-snug mb-1 drop-shadow-md"
                  >
                    {slide.title}
                  </motion.h1>
                  {slide.subtitle && (
                    <motion.p
                      key={`m-sub-${index}-${mobileActiveIndex}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45, duration: 0.6 }}
                      className="text-[11px] text-white/75 font-light tracking-widest uppercase mb-3"
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}
                  {slide.ctaText && (
                    <motion.button
                      key={`m-cta-${index}-${mobileActiveIndex}`}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      disabled={!slide.ctaLink}
                      onClick={() => { if (slide.ctaLink) { const url = /^https?:\/\//i.test(slide.ctaLink) ? slide.ctaLink : `https://${slide.ctaLink}`; window.open(url, "_blank", "noopener,noreferrer"); } }}
                      className={`group relative px-5 py-2 font-semibold text-xs rounded-full overflow-hidden transition-all duration-500 ease-out inline-flex items-center gap-2 border ${
                        !slide.ctaLink
                          ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                          : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] cursor-pointer border-amber-300/40"
                      }`}
                    >
                      {slide.ctaLink && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      )}
                      <span className="relative z-10">{slide.ctaText}</span>
                    </motion.button>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-16 z-20 flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); mobileSwiperInstance?.slidePrev(); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {mobileSlides.map((_, i) => (
                      <div
                        key={`mob-dot-${i}`}
                        onClick={(e) => { e.stopPropagation(); mobileSwiperInstance?.slideToLoop(i); }}
                        className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${
                          mobileActiveIndex === i
                            ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                            : "w-4 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); mobileSwiperInstance?.slideNext(); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="hidden md:flex absolute right-4 md:right-8 lg:right-12 bottom-48 z-20 flex-col items-end gap-4 max-w-[calc(100vw-2rem)]">
        <div className="flex flex-row items-end gap-2 md:gap-3 lg:gap-4 overflow-hidden">
          {slides.map((slide, index) => (
            <motion.div
              key={`thumbnail-${index}-${currentTheme}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 + 0.5 }}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-[67px] h-28 md:w-[78px] md:h-[134px] lg:w-28 lg:h-[179px] cursor-pointer overflow-hidden transition-all duration-500 ease-out group ${
                activeIndex === index
                  ? "ring-2 ring-[#FDFBF7] shadow-2xl scale-105 z-10 grayscale-0"
                  : "opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
              }`}
            >
              {renderThumbnail(slide)}
              <div className="absolute bottom-0 left-0 w-full p-2 md:p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-[10px] md:text-xs text-white/90 font-medium truncate">
                  {slide.subtitle || slide.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4 lg:gap-6 pr-2">
          <div className="flex items-center gap-1.5 md:gap-2">
            {slides.map((_, index) => (
              <div
                key={`indicator-${index}`}
                onClick={() => handleThumbnailClick(index)}
                className={`cursor-pointer h-[3px] transition-all duration-500 rounded-full ${
                  activeIndex === index
                    ? "w-8 md:w-10 lg:w-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    : "w-4 md:w-5 lg:w-6 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
            >
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
