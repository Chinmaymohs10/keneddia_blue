import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { getHeroSectionsPaginated } from "@/Api/Api";

const CACHE_KEY = "hero_sections_cache";
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData {
  desktopSlides: HeroSlide[];
  mobileSlides: HeroSlide[];
  timestamp: number;
  hash: string;
}

interface MediaItem {
  mediaId: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  fileName: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface ApiHeroItem {
  id: number;
  mainTitle: string;
  subTitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  backgroundAll: MediaItem[];
  backgroundLight: MediaItem[];
  backgroundDark: MediaItem[];
  subAll: MediaItem[];
  subLight: MediaItem[];
  subDark: MediaItem[];
  showOnHomepage: boolean;
  showOnMobilePage: boolean | null;
  active: boolean;
}

interface HeroSlide {
  id?: number;
  type: "video" | "image";         // background media type (desktop)
  mobileMediaType: "video" | "image"; // FIX: actual type of mobileMedia url
  media: string;
  mobileMedia: string;
  thumbnail: string;
  thumbnailType: "video" | "image";
  title: string;
  subtitle: string;
  cta?: string;
  ctaLink?: string | null;
  showOnHomepage?: boolean;
  showOnMobilePage?: boolean | null;
}

const getCurrentTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const generateDataHash = (items: ApiHeroItem[]): string => {
  return items
    .map(
      (item) =>
        `${item.id}-${item.mainTitle}-${item.ctaText}-${item.ctaLink}-${item.backgroundAll.length}-${item.subAll.length}`,
    )
    .join("|");
};

const getCachedData = (): CachedData | null => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsedCache: CachedData = JSON.parse(cached);
    if (Date.now() - parsedCache.timestamp < CACHE_DURATION) return parsedCache;
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

const setCachedData = (
  desktopSlides: HeroSlide[],
  mobileSlides: HeroSlide[],
  hash: string,
): void => {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        desktopSlides,
        mobileSlides,
        timestamp: Date.now(),
        hash,
      }),
    );
  } catch {}
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

const transformApiDataToSlides = (
  content: ApiHeroItem[],
  theme: "light" | "dark",
): HeroSlide[] => {
  const filteredContent = content.filter(
    (item) => item.active === true && item.showOnHomepage === true,
  );
  const homepageItems = filteredContent.sort((a, b) => b.id - a.id);

  return homepageItems.map((item) => {
    const backgroundMedia = selectMediaByTheme(
      theme,
      item.backgroundAll,
      item.backgroundLight,
      item.backgroundDark,
    );

    const subMedia = selectMediaByTheme(
      theme,
      item.subAll,
      item.subLight,
      item.subDark,
    );

    const isBackgroundVideo = backgroundMedia?.type === "VIDEO";

    // ── FIX 1: thumbnail ────────────────────────────────────────────────────
    // Always prefer a sub IMAGE for the thumbnail, regardless of background type.
    // Fall back to background url only if no sub media exists.
    let thumbnailUrl = "";
    if (subMedia?.type === "IMAGE") {
      thumbnailUrl = subMedia.url;
    } else if (subMedia?.type === "VIDEO") {
      // sub is also a video — thumbnail falls back to background image if available
      thumbnailUrl = isBackgroundVideo ? "" : (backgroundMedia?.url ?? "");
    } else {
      thumbnailUrl = backgroundMedia?.url ?? "";
    }
    const resolvedThumbnailUrl = subMedia?.url || thumbnailUrl;
    const thumbnailType: "video" | "image" =
      subMedia?.type === "VIDEO" ? "video" : "image";

    // ── mobileMedia always uses the BACKGROUND (main) media ────────────────
    // Sub media is only ever used for the thumbnail card.
    // Mobile should show the same main image/video as desktop.
    const mobileMediaUrl = backgroundMedia?.url || "";
    const mobileMediaType: "video" | "image" = isBackgroundVideo ? "video" : "image";

    return {
      id: item.id,
      type: isBackgroundVideo ? "video" : "image",
      mobileMediaType,                           // NEW field
      media: backgroundMedia?.url || "",
      mobileMedia: mobileMediaUrl,
      thumbnail: resolvedThumbnailUrl,
      thumbnailType,
      title: item.mainTitle || "",
      subtitle: item.subTitle || "",
      cta: item.ctaText ?? undefined,
      ctaLink: item.ctaLink ?? null,
      showOnHomepage: item.showOnHomepage,
      showOnMobilePage: item.showOnMobilePage ?? null,
    };
  });
};

const transformApiDataToMobileSlides = (
  content: ApiHeroItem[],
  theme: "light" | "dark",
): HeroSlide[] => {
  const mobileItems = content.filter(
    (item) => item.active === true && item.showOnMobilePage === true,
  );

  return mobileItems.sort((a, b) => b.id - a.id).map((item) => {
    const backgroundMedia = selectMediaByTheme(theme, item.backgroundAll, item.backgroundLight, item.backgroundDark);
    const subMedia = selectMediaByTheme(theme, item.subAll, item.subLight, item.subDark);
    const isBackgroundVideo = backgroundMedia?.type === "VIDEO";
    const resolvedThumbnailUrl = subMedia?.url || backgroundMedia?.url || "";
    const thumbnailType: "video" | "image" = subMedia?.type === "VIDEO" ? "video" : "image";
    const mobileMediaUrl = backgroundMedia?.url || "";
    const mobileMediaType: "video" | "image" = isBackgroundVideo ? "video" : "image";
    return {
      id: item.id,
      type: isBackgroundVideo ? "video" : "image",
      mobileMediaType,
      media: backgroundMedia?.url || "",
      mobileMedia: mobileMediaUrl,
      thumbnail: resolvedThumbnailUrl,
      thumbnailType,
      title: item.mainTitle || "",
      subtitle: item.subTitle || "",
      cta: item.ctaText ?? undefined,
      ctaLink: item.ctaLink ?? null,
      showOnHomepage: item.showOnHomepage,
      showOnMobilePage: item.showOnMobilePage ?? null,
    };
  });
};

const getInitialDesktopSlides = (items: HeroSlide[]) =>
  (Array.isArray(items) ? items : []).filter(
    (item) => item.showOnHomepage !== false,
  );

const getInitialMobileSlides = (items: HeroSlide[]) =>
  (Array.isArray(items) ? items : []).filter(
    (item) => item.showOnMobilePage === true,
  );

export default function Hero({ initialSlides = [], onReady }: { initialSlides?: HeroSlide[]; onReady?: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [mobileSwiperInstance, setMobileSwiperInstance] = useState<SwiperType | null>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [mobileSlides, setMobileSlides] = useState<HeroSlide[]>(
    getInitialMobileSlides(initialSlides),
  );
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(getCurrentTheme());
  const [slides, setSlides] = useState<HeroSlide[]>(
    getInitialDesktopSlides(initialSlides),
  );
  const [isFetching, setIsFetching] = useState(initialSlides.length === 0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set());
  const isFetchingRef = useRef(false);
  const currentHashRef = useRef<string>("");
  const apiDataRef = useRef<ApiHeroItem[]>([]);
  const onReadyCalled = useRef(false);

  useEffect(() => {
    if (!onReadyCalled.current && (slides.length > 0 || !isFetching)) {
      onReadyCalled.current = true;
      onReady?.();
    }
  }, [slides.length, isFetching, onReady]);

  const fetchHeroSection = useCallback(
    async (forceRefresh = false) => {
      if (isFetchingRef.current) return;

      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setSlides(cachedData.desktopSlides);
          setMobileSlides(cachedData.mobileSlides || []);
          currentHashRef.current = cachedData.hash;
          setIsFetching(false);
          return;
        }
      }

      isFetchingRef.current = true;
      setIsFetching(true);

      try {
        const response = await getHeroSectionsPaginated({ page: 0, size: 100 });
        const pageData = response.data?.data || response.data || response;

        const apiContent: ApiHeroItem[] = Array.isArray(pageData?.content)
          ? pageData.content
          : Array.isArray(pageData)
            ? pageData
            : [];

        if (apiContent.length >= 0) {
          apiDataRef.current = apiContent;
          const newHash = generateDataHash(apiContent);

          if (newHash === currentHashRef.current && slides.length > 0 && !forceRefresh) {
            setIsFetching(false);
            isFetchingRef.current = false;
            return;
          }

          const apiSlides = transformApiDataToSlides(apiContent, currentTheme);
          const apiMobileSlides = transformApiDataToMobileSlides(apiContent, currentTheme);
          if (apiSlides.length > 0) {
            setSlides(apiSlides);
            setLoadedSlides(new Set());
            currentHashRef.current = newHash;
          } else {
            setSlides([]);
            setLoadedSlides(new Set());
          }
          setMobileSlides(apiMobileSlides);
          setCachedData(apiSlides, apiMobileSlides, newHash);
        }
      } catch (error) {
        console.error("Hero fetch failed:", error);
        setSlides([]);
        setLoadedSlides(new Set());
      } finally {
        setIsFetching(false);
        isFetchingRef.current = false;
      }
    },
    [currentTheme, slides.length],
  );

  const updateSlidesForTheme = useCallback((newTheme: "light" | "dark") => {
    if (apiDataRef.current.length > 0) {
      const newSlides = transformApiDataToSlides(apiDataRef.current, newTheme);
      setSlides(newSlides.length > 0 ? newSlides : []);
      setLoadedSlides(new Set());
      const nextMobileSlides = transformApiDataToMobileSlides(
        apiDataRef.current,
        newTheme,
      );
      setMobileSlides(nextMobileSlides);
      setCachedData(newSlides, nextMobileSlides, currentHashRef.current);
    }
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        updateSlidesForTheme(newTheme);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [currentTheme, updateSlidesForTheme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CACHE_KEY);
    }
    fetchHeroSection(initialSlides.length > 0);
  }, [fetchHeroSection]);

  const handleImageError = useCallback((url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const logMediaError = useCallback(
    (mediaRole: string, url: string, title: string) => {
      console.error(`[Hero] Failed to load ${mediaRole}`, {
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

  const upcomingThumbnailSlides = useMemo(() => {
    if (slides.length === 0) return [];
    if (slides.length === 1) {
      return [{ slide: slides[0], index: 0 }];
    }

    return Array.from({ length: slides.length - 1 }, (_, offset) => {
      const index = (activeIndex + offset + 1) % slides.length;
      const slide = slides[index];

      if (!slide) return null;

      return {
        slide,
        index,
      };
    }).filter(Boolean);
  }, [activeIndex, slides]);

  // ── Desktop media (object-cover, full bleed) — UNCHANGED ──────────────────
  const renderDesktopMedia = useCallback(
    (slide: HeroSlide, index: number) => {
      const mediaUrl = slide.media;
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;
      if (slide.type === "video") {
        return (
          <video
            autoPlay loop muted playsInline preload="metadata"
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
    [imageErrors, logMediaError, markSlideLoaded],
  );

  // ── FIX 3: Mobile media — uses mobileMediaType (not slide.type) ───────────
  // Previously this checked `slide.type` which is the BACKGROUND type.
  // When background=VIDEO but mobileMedia points to a sub IMAGE, it would try
  // to render a <video> tag for an image URL → black screen.
  const renderMobileMedia = useCallback(
    (slide: HeroSlide, index: number) => {
      const mediaUrl = slide.mobileMedia;
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;

      if (slide.mobileMediaType === "video") {
        return (
          <video
            autoPlay loop muted playsInline preload="metadata"
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
    [imageErrors, logMediaError, markSlideLoaded],
  );

  // ── Thumbnail — always an image ────────────────────────────────────────────
  const renderThumbnail = useCallback(
    (slide?: HeroSlide | null) => {
      if (!slide) return null;

      const thumbnailUrl = slide.thumbnail;
      if (!thumbnailUrl || imageErrors.has(thumbnailUrl)) return null;

      if (slide.thumbnailType === "video") {
        return (
          <video
            src={thumbnailUrl}
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => logMediaError("thumbnail video", thumbnailUrl, slide.title)}
          />
        );
      }

      return (
        <img
          src={thumbnailUrl}
          alt={slide.subtitle || slide.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => logMediaError("thumbnail image", thumbnailUrl, slide.title)}
        />
      );
    },
    [imageErrors, logMediaError],
  );

  if (!isFetching && slides.length === 0 && mobileSlides.length === 0) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-700 via-neutral-800 to-neutral-950 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            No Content Available
          </div>
          <p className="text-sm text-white/25">Hero section has no active slides configured.</p>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 hidden h-32 w-full md:block md:h-48">
          <svg viewBox="0 0 1440 320" className="w-full h-full drop-shadow-lg" preserveAspectRatio="none">
            <path
              className="fill-background"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative w-full overflow-hidden bg-background ${
        slides.length > 0 ? "h-auto md:h-screen" : "h-auto"
      }`}
    >
      {isFetching && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
          <Loader2 size={16} className="animate-spin text-white/80" />
          <span className="text-xs text-white/80">Updating...</span>
        </div>
      )}

      <Swiper
        modules={[EffectFade, Autoplay, Navigation]}
        effect="fade"
        speed={1200}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={true}
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={`slide-${index}-${currentTheme}`}
            className="relative w-full h-full"
          >
            {/* ══════════════ DESKTOP (unchanged) ══════════════ */}
            <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden">
              {renderDesktopMedia(slide, index)}
            </div>
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="hidden md:block absolute inset-0 z-10 pointer-events-none">
              <div className="container mx-auto h-full px-8 md:px-16 lg:px-24 flex items-center">
                <div className="w-full md:w-[70%] xl:w-[75%] pointer-events-auto">
                  <motion.h1
                    key={`title-${index}-${slide.title}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6 leading-[1.1] tracking-tight drop-shadow-lg"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    key={`subtitle-${index}-${slide.subtitle}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-lg md:text-xl text-white/90 font-light mb-10 tracking-wide uppercase drop-shadow-md"
                  >
                    {slide.subtitle}
                  </motion.p>
                  {slide.cta && (
                    <motion.button
                      key={`cta-${index}-${slide.cta}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      disabled={!slide.ctaLink}
                      onClick={() => { if (slide.ctaLink) { const url = /^https?:\/\//i.test(slide.ctaLink) ? slide.ctaLink : `https://${slide.ctaLink}`; window.open(url, "_blank", "noopener,noreferrer"); } }}
                      className={`group relative px-6 py-2.5 font-semibold text-sm rounded-full overflow-hidden transition-all duration-500 ease-out flex items-center gap-2 border
                        ${!slide.ctaLink
                          ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                          : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)] hover:scale-105 hover:-translate-y-0.5 cursor-pointer border-amber-300/40"
                        }`}
                    >
                      {slide.ctaLink && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      )}
                      <span className="relative z-10">{slide.cta}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
            {/* Desktop wave */}
            <div className="hidden md:block absolute bottom-0 left-0 w-full h-32 md:h-48 z-10 pointer-events-none">
              <svg viewBox="0 0 1440 320" className="w-full h-full drop-shadow-lg" preserveAspectRatio="none">
                <path
                  className="fill-background"
                  d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </svg>
            </div>

          </SwiperSlide>
        ))}
      </Swiper>

      {/* ══════════════ MOBILE SWIPER (separate, uses mobileSlides) ══════════════ */}
      <div className="block md:hidden">
        {mobileSlides.length > 0 ? (
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
              <SwiperSlide key={`mobile-slide-${index}-${currentTheme}`} className="relative w-full h-full bg-black overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: "64px" }}>
                  {renderMobileMedia(slide, index)}
                </div>
                <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: "64px" }}>
                  <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 px-5 z-20 flex flex-col items-center justify-center text-center" style={{ top: "64px", bottom: "2.5rem" }}>
                  <motion.h1
                    key={`m-title-${index}-${slide.title}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-xl font-serif font-semibold text-white leading-snug mb-1 drop-shadow-md"
                  >
                    {slide.title}
                  </motion.h1>
                  {slide.subtitle && (
                    <motion.p
                      key={`m-sub-${index}-${slide.subtitle}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45, duration: 0.6 }}
                      className="text-[11px] text-white/75 font-light tracking-widest uppercase mb-3"
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}
                  {slide.cta && (
                    <motion.button
                      key={`m-cta-${index}-${slide.cta}`}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      disabled={!slide.ctaLink}
                      onClick={() => { if (slide.ctaLink) { const url = /^https?:\/\//i.test(slide.ctaLink) ? slide.ctaLink : `https://${slide.ctaLink}`; window.open(url, "_blank", "noopener,noreferrer"); } }}
                      className={`group relative px-5 py-2 font-semibold text-xs rounded-full overflow-hidden transition-all duration-500 ease-out inline-flex items-center gap-2 border
                        ${!slide.ctaLink
                          ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                          : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] cursor-pointer border-amber-300/40"
                        }`}
                    >
                      {slide.ctaLink && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      )}
                      <span className="relative z-10">{slide.cta}</span>
                    </motion.button>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-3">
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
                        className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer
                          ${mobileActiveIndex === i
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
        ) : (
          <div
            className="relative flex w-full overflow-hidden bg-neutral-900 items-center justify-center"
            style={{ height: "calc(75vw + 64px)", minHeight: "320px", maxHeight: "500px" }}
          >
            <div className="text-center px-6">
              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40 inline-block">
                Not Available on Mobile
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ DESKTOP thumbnails + nav (unchanged) ══════════════ */}
      {/*
        FIX 4: Thumbnail panel — changed from absolute right-positioned to use
        max-w so thumbnails don't overflow off-screen on smaller desktops.
        Also capped thumbnail count rendering to what fits.
      */}
      <div className="hidden md:flex absolute right-4 md:right-8 lg:right-12 bottom-48 z-20 flex-col items-end gap-4 max-w-[calc(100vw-2rem)]">
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
        <div className="flex flex-row items-end gap-2 md:gap-3 lg:gap-4 overflow-hidden">
          {upcomingThumbnailSlides.map(({ slide, index }, thumbOrder) => (
            <motion.div
              key={`thumbnail-${index}-${currentTheme}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: thumbOrder * 0.15 + 0.5 }}
              onClick={() => handleThumbnailClick(index)}
              className="relative flex-shrink-0 w-[67px] h-28 md:w-[78px] md:h-[134px] lg:w-28 lg:h-[179px] cursor-pointer overflow-hidden transition-all duration-500 ease-out group opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
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
      </div>
    </section>
  );
}
