import { useState, useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { getHeroSectionsPaginated } from "@/Api/Api";
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// Assets - Fallback
import video1 from "@assets/video/video1.mp4";

// Cache configuration
const CACHE_KEY = "hero_sections_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: HeroSlide[];
  timestamp: number;
  hash: string;
}

// Default slides as fallback
const defaultSlides = [
  {
    type: "video" as const,
    media: video1,
    mobileMedia: video1,
    thumbnail: siteContent.images.hero.slide1,
    title: siteContent.text.hero.slides[0].title,
    subtitle: siteContent.text.hero.slides[0].subtitle,
  },
  {
    type: "image" as const,
    media: siteContent.images.hero.slide2,
    mobileMedia: siteContent.images.hero.slide2,
    thumbnail: siteContent.images.hero.slide2,
    title: siteContent.text.hero.slides[1].title,
    subtitle: siteContent.text.hero.slides[1].subtitle,
    cta: "Explore",
  },
  {
    type: "image" as const,
    media: siteContent.images.hero.slide3,
    mobileMedia: siteContent.images.hero.slide3,
    thumbnail: siteContent.images.hero.slide3,
    title: siteContent.text.hero.slides[2].title,
    subtitle: siteContent.text.hero.slides[2].subtitle,
    cta: "Explore",
  },
];

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
  active: boolean;
}

interface HeroSlide {
  type: "video" | "image";
  media: string | any;
  mobileMedia: string | any;
  thumbnail: string | any;
  title: string;
  subtitle: string;
  cta?: string;
  ctaLink?: string | null;
  fallbackMedia?: any;
  fallbackThumbnail?: any;
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
    const now = Date.now();
    if (now - parsedCache.timestamp < CACHE_DURATION) {
      return parsedCache;
    }
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.warn("Error reading cache:", error);
    return null;
  }
};

const setCachedData = (slides: HeroSlide[], hash: string): void => {
  try {
    const cacheData: CachedData = {
      data: slides,
      timestamp: Date.now(),
      hash,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Error saving to cache:", error);
  }
};

const selectMediaByTheme = (
  theme: "light" | "dark",
  all: MediaItem[],
  light: MediaItem[],
  dark: MediaItem[],
): MediaItem | null => {
  if (theme === "dark" && dark && dark.length > 0) return dark[0];
  if (theme === "light" && light && light.length > 0) return light[0];
  if (all && all.length > 0) return all[0];
  if (light && light.length > 0) return light[0];
  if (dark && dark.length > 0) return dark[0];
  return null;
};

const transformApiDataToSlides = (
  content: ApiHeroItem[],
  theme: "light" | "dark",
): HeroSlide[] => {

  // CRITICAL FIX: Only show if BOTH conditions are true
  const filteredContent = content.filter((item) => {
    const shouldShow = item.active === true && item.showOnHomepage === true;
    return shouldShow;
  });
  const latestThree = filteredContent.sort((a, b) => b.id - a.id).slice(0, 3);

  return latestThree.map((item, index) => {
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

    const isVideo = backgroundMedia?.type === "VIDEO";

    let thumbnailUrl = backgroundMedia?.url || "";
    if (subMedia && subMedia.type === "IMAGE") {
      thumbnailUrl = subMedia.url;
    }

    return {
      type: isVideo ? "video" : "image",
      media: backgroundMedia?.url || "",
      mobileMedia: subMedia?.url || backgroundMedia?.url || "",
      thumbnail: thumbnailUrl,
      title: item.mainTitle || ``,
      subtitle: item.subTitle || "",
      cta: item.ctaText,
      ctaLink: item.ctaLink ?? null,
      fallbackMedia: defaultSlides[index % defaultSlides.length].media,
      fallbackThumbnail: defaultSlides[index % defaultSlides.length].thumbnail,
    };
  });
};

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    getCurrentTheme(),
  );

  const [slides, setSlides] = useState<HeroSlide[]>(
    defaultSlides.map((slide) => ({
      ...slide,
      fallbackMedia: slide.media,
      fallbackThumbnail: slide.thumbnail,
    })),
  );

  const [isFetching, setIsFetching] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const isFetchingRef = useRef(false);
  const currentHashRef = useRef<string>("");
  const apiDataRef = useRef<ApiHeroItem[]>([]);

  const fetchHeroSection = useCallback(
    async (forceRefresh = false) => {
      if (isFetchingRef.current) return;

      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setSlides(cachedData.data);
          currentHashRef.current = cachedData.hash;
          setIsFetching(false);
          return;
        }
      }

      isFetchingRef.current = true;
      setIsFetching(true);

      try {
        const response = await getHeroSectionsPaginated({ page: 0, size: 100 }); // Increased to get all sections
        const pageData = response.data?.data || response.data || response;

        if (pageData?.content && Array.isArray(pageData.content)) {
          const apiContent: ApiHeroItem[] = pageData.content;
          apiDataRef.current = apiContent;
          const newHash = generateDataHash(apiContent);

          if (
            newHash === currentHashRef.current &&
            slides.length > 0 &&
            !forceRefresh
          ) {
            setIsFetching(false);
            isFetchingRef.current = false;
            return;
          }

          const apiSlides = transformApiDataToSlides(apiContent, currentTheme);
          if (apiSlides.length > 0) {
            const finalSlides = [...apiSlides];

            // Only add default slides if NO API slides are available
            if (finalSlides.length === 0) {
              finalSlides.push(
                ...defaultSlides.map((slide) => ({
                  ...slide,
                  fallbackMedia: slide.media,
                  fallbackThumbnail: slide.thumbnail,
                })),
              );
            }

            setSlides(finalSlides);
            currentHashRef.current = newHash;
            setCachedData(finalSlides, newHash);
          } else {
            const defaultSlidesWithFallback = defaultSlides.map((slide) => ({
              ...slide,
              fallbackMedia: slide.media,
              fallbackThumbnail: slide.thumbnail,
            }));
            setSlides(defaultSlidesWithFallback);
          }
        }
      } catch (error) {
        // Use defaults on error
        const defaultSlidesWithFallback = defaultSlides.map((slide) => ({
          ...slide,
          fallbackMedia: slide.media,
          fallbackThumbnail: slide.thumbnail,
        }));
        setSlides(defaultSlidesWithFallback);
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
      if (newSlides.length > 0) {
        setSlides(newSlides);
        setCachedData(newSlides, currentHashRef.current);
      } else {
        // If no slides for new theme, use defaults
        const defaultSlidesWithFallback = defaultSlides.map((slide) => ({
          ...slide,
          fallbackMedia: slide.media,
          fallbackThumbnail: slide.thumbnail,
        }));
        setSlides(defaultSlidesWithFallback);
      }
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

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [currentTheme, updateSlidesForTheme]);

  useEffect(() => {
    sessionStorage.removeItem(CACHE_KEY);
    fetchHeroSection();
  }, [fetchHeroSection]);

  const handleImageError = useCallback((url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (swiperInstance) swiperInstance.slideToLoop(index);
    },
    [swiperInstance],
  );

  const handleScrollToBusiness = useCallback(() => {
    const section = document.getElementById("business");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }, []);

  const renderMedia = useCallback(
    (slide: HeroSlide, isMobile: boolean = false) => {
      const mediaUrl = isMobile ? slide.mobileMedia : slide.media;
      const shouldUseFallback =
        !mediaUrl ||
        (typeof mediaUrl === "string" && imageErrors.has(mediaUrl));
      const finalMedia = shouldUseFallback ? slide.fallbackMedia : mediaUrl;

      if (
        slide.type === "video" &&
        typeof finalMedia === "string" &&
        !shouldUseFallback
      ) {
        return (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            key={finalMedia}
            onError={() => handleImageError(finalMedia)}
          >
            <source src={finalMedia} type="video/mp4" />
          </video>
        );
      }

      if (typeof finalMedia === "string") {
        return (
          <img
            src={finalMedia}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={() => handleImageError(finalMedia)}
          />
        );
      }

      return (
        <OptimizedImage
          {...finalMedia}
          className="w-full h-full object-cover"
        />
      );
    },
    [imageErrors, handleImageError],
  );

  const renderThumbnail = useCallback(
    (slide: HeroSlide) => {
      const thumbnailUrl = slide.thumbnail;
      const shouldUseFallback =
        !thumbnailUrl ||
        (typeof thumbnailUrl === "string" && imageErrors.has(thumbnailUrl));
      const finalThumbnail = shouldUseFallback
        ? slide.fallbackThumbnail
        : thumbnailUrl;

      if (typeof finalThumbnail === "string") {
        return (
          <img
            src={finalThumbnail}
            alt={slide.subtitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => handleImageError(finalThumbnail)}
          />
        );
      }

      return (
        <OptimizedImage
          {...finalThumbnail}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      );
    },
    [imageErrors, handleImageError],
  );

  return (
    <section className="relative w-full h-screen overflow-hidden bg-background">
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
            <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden">
              {renderMedia(slide, false)}
            </div>
            <div className="block md:hidden absolute inset-0 w-full h-full overflow-hidden">
              {renderMedia(slide, true)}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 z-10 pointer-events-none">
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
                      disabled={!slide.ctaLink} // Disable if link is missing
                      onClick={() => {
                        if (!slide.ctaLink) return;
                        window.location.href = slide.ctaLink;
                      }}
                      className={`group relative px-6 py-2.5 font-semibold text-sm rounded-full overflow-hidden transition-all duration-500 ease-out flex items-center gap-2 border 
      ${
        !slide.ctaLink
          ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
          : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)] hover:scale-105 hover:-translate-y-0.5 cursor-pointer border-amber-300/40"
      }`}
                    >
                      {/* Shine effect only for active buttons */}
                      {slide.ctaLink && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                      )}

                      <span className="relative z-10">{slide.cta}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 z-10 pointer-events-none">
              <svg
                viewBox="0 0 1440 320"
                className="w-full h-full drop-shadow-lg"
                preserveAspectRatio="none"
              >
                <path
                  className="fill-background"
                  d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </svg>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hidden md:flex absolute right-4 md:right-8 lg:right-12 bottom-48 z-20 flex-col items-end gap-4">
        <div className="flex flex-row items-end gap-2 md:gap-3 lg:gap-4">
          {slides.map((slide, index) => (
            <motion.div
              key={`thumbnail-${index}-${currentTheme}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 + 0.5 }}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-[67px] h-28 md:w-[78px] md:h-[134px] lg:w-28 lg:h-[179px] cursor-pointer overflow-hidden transition-all duration-500 ease-out group ${activeIndex === index ? "ring-2 ring-[#FDFBF7] shadow-2xl scale-105 z-10 grayscale-0" : "opacity-60 hover:opacity-100 grayscale hover:grayscale-0"}`}
            >
              {renderThumbnail(slide)}
              <div className="absolute bottom-0 left-0 w-full p-2 md:p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-[10px] md:text-xs text-white/90 font-medium truncate">
                  {slide.subtitle}
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
                className={`cursor-pointer h-[3px] transition-all duration-500 rounded-full ${activeIndex === index ? "w-8 md:w-10 lg:w-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-4 md:w-5 lg:w-6 bg-white/30 hover:bg-white/60"}`}
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

      <div className="md:hidden absolute bottom-36 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <button
          onClick={() => swiperInstance?.slidePrev()}
          className="w-10 h-10 flex items-center justify-center border border-[#FDFBF7]/40 text-[#FDFBF7] transition-all duration-300 rounded-full backdrop-blur-md cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <div
              key={`mobile-indicator-${index}`}
              onClick={() => handleThumbnailClick(index)}
              className={`h-0.5 transition-all duration-500 cursor-pointer ${activeIndex === index ? "w-10 bg-[#FDFBF7]" : "w-5 bg-[#FDFBF7]/40"}`}
            />
          ))}
        </div>
        <button
          onClick={() => swiperInstance?.slideNext()}
          className="w-10 h-10 flex items-center justify-center border border-[#FDFBF7]/40 text-[#FDFBF7] transition-all duration-300 rounded-full backdrop-blur-md cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
