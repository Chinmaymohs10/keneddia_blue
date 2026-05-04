import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { getHotelHomepageHeroSection, getPropertyTypes } from "@/Api/Api";

const transformApiDataToSlides = (content) =>
  (Array.isArray(content) ? content : [])
    .filter((item) => item.active === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map((item) => {
      const backgroundMedia =
        item.backgroundAll?.[0] ||
        item.backgroundLight?.[0] ||
        item.backgroundDark?.[0] ||
        null;
      const subMedia =
        item.subAll?.[0] ||
        item.subLight?.[0] ||
        item.subDark?.[0] ||
        null;

      const primaryWord = item.mainTitle?.trim()?.split(/\s+/)?.[0] || "";
      if (!backgroundMedia?.url) return null;

      return {
        id: item.id,
        tag: item.ctaText || null,
        title: item.mainTitle || null,
        desc: item.subTitle || null,
        img: backgroundMedia.url,
        isVideo: backgroundMedia?.type === "VIDEO",
        thumbnail: subMedia?.url || backgroundMedia.url,
        thumbnailIsVideo: subMedia?.type === "VIDEO",
        bgTitle: primaryWord.toUpperCase(),
        ctaText: item.ctaText || null,
        ctaLink: item.ctaLink || null,
        showOnHomepage: item.showOnHomepage === true,
        showOnMobilePage: item.showOnMobilePage ?? null,
      };
    })
    .filter(Boolean);

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");
const isWineType = (value = "") =>
  ["wine", "wines", "wine and dine", "wine & dine", "winedine"].includes(
    normalize(value),
  );

const HeroMedia = ({ slide }) => {
  if (slide.isVideo) {
    return (
      <video
        src={slide.img}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return <img src={slide.img} alt={slide.title} className="h-full w-full object-cover" />;
};

export default function WineHeroBanner({ initialSlides, onReady }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const onReadyCalled = useRef(false);
  const ssrLoaded = Array.isArray(initialSlides) && initialSlides.length > 0;
  const [slides, setSlides] = useState(ssrLoaded ? initialSlides : []);
  const [isLoading, setIsLoading] = useState(!ssrLoaded);

  const mobileSlides = useMemo(
    () => slides.filter((s) => s.showOnMobilePage === true),
    [slides],
  );
  const desktopSlides = useMemo(
    () => slides.filter((s) => s.showOnHomepage === true),
    [slides],
  );

  useEffect(() => {
    if ((desktopSlides.length > 0 || mobileSlides.length > 0) && !onReadyCalled.current) {
      onReadyCalled.current = true;
      onReady?.();
    }
  }, [desktopSlides.length, mobileSlides.length, onReady]);

  useEffect(() => {
    if (ssrLoaded) {
      setSlides(initialSlides);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchWineHero = async () => {
      try {
        const typeResponse = await getPropertyTypes();
        const types = typeResponse?.data || typeResponse;
        const wineType = Array.isArray(types)
          ? types.find(
              (type) => type?.isActive && isWineType(type?.typeName),
            )
          : null;

        if (!wineType?.id) return;

        const response = await getHotelHomepageHeroSection(wineType.id);
        const data = response?.data || response;
        const apiSlides = transformApiDataToSlides(data);

        if (isMounted) {
          setSlides(apiSlides);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Error fetching Wine hero sections:", error);
        if (isMounted) {
          setSlides([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWineHero();

    return () => {
      isMounted = false;
    };
  }, [initialSlides, ssrLoaded]);

  useEffect(() => {
    if (desktopSlides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % desktopSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [desktopSlides.length]);

  const handleCtaClick = (link) => {
    if (!link) return;
    const url = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const goToSlide = (index) => {
    const list = desktopSlides.length > 0 ? desktopSlides : slides;
    if (list.length === 0) return;
    setActiveIndex((index + list.length) % list.length);
  };

  const activeSlide = useMemo(() => {
    const list = desktopSlides.length > 0 ? desktopSlides : slides;
    if (list.length === 0) return null;
    return list[activeIndex % list.length];
  }, [activeIndex, desktopSlides, slides]);

  const activeMobileSlide = useMemo(() => {
    if (mobileSlides.length > 0) {
      return mobileSlides[activeIndex % mobileSlides.length];
    }
    return activeSlide;
  }, [activeIndex, mobileSlides, activeSlide]);

  if (isLoading) {
    return (
      <section className="relative h-svh w-full overflow-hidden bg-[#0D0508]">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top,rgba(139,26,42,0.18),rgba(13,5,8,1))]" />
      </section>
    );
  }

  if (!activeSlide && !activeMobileSlide) {
    return (
      <section className="relative h-svh w-full overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-700 via-neutral-800 to-neutral-950 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            No Content Available
          </div>
          <p className="text-sm text-white/25">Hero section has no active slides configured.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-background h-auto md:h-svh">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide?.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <div className="hidden md:block h-full w-full">
            <HeroMedia slide={activeSlide} />
          </div>
          <div className="md:hidden h-full w-full">
             <HeroMedia slide={activeMobileSlide} />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/80 via-black/40 to-transparent md:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 md:hidden" />

      <div className="absolute left-4 top-1/3 whitespace-nowrap text-[10rem] font-black italic text-white/[0.03] pointer-events-none md:left-0 md:text-[16rem]">
        {activeSlide?.bgTitle}
      </div>

      <div className="relative z-10 hidden h-full items-center md:flex">
        <div className="container mx-auto flex h-full items-center px-8 md:px-16 lg:px-24">
          <div className="w-full md:w-[70%] xl:w-[60%]">
            {activeSlide.title && (
              <motion.h1
                key={`title-${activeSlide.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-3 text-3xl font-serif font-medium leading-[1.06] tracking-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl"
              >
                {activeSlide.title}
              </motion.h1>
            )}

            {activeSlide.desc && (
              <motion.p
                key={`desc-${activeSlide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                className="mb-6 max-w-2xl text-sm font-light capitalize tracking-normal text-white/90 drop-shadow-md md:text-base"
              >
                {activeSlide.desc}
              </motion.p>
            )}

            {activeSlide.ctaText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex flex-wrap items-center gap-3"
              >
                <button
                  disabled={!activeSlide?.ctaLink}
                  onClick={() => handleCtaClick(activeSlide?.ctaLink)}
                  className={`group relative h-auto overflow-hidden rounded-full border px-8 py-3 text-sm font-bold transition-all duration-500 ease-out flex items-center gap-2 ${
                    !activeSlide?.ctaLink
                      ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-gray-900 shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(251,191,36,0.6)] cursor-pointer border-amber-300/40"
                  }`}
                >
                  {activeSlide?.ctaLink && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {activeSlide.ctaText}
                  </span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 block md:hidden">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "calc(85vw + 64px)", minHeight: "420px", maxHeight: "600px" }}
        >
          {/* Media is handled by the unified background above */}

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/60 to-transparent" />

          <div className="absolute inset-x-0 z-20 flex flex-col items-center justify-center px-6 text-center" style={{ top: "64px", bottom: "4rem" }}>
            {(activeMobileSlide || activeSlide)?.tag && (
              <motion.span
                key={`m-tag-${(activeMobileSlide || activeSlide).id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/90 backdrop-blur-xl border border-white/10"
              >
                {(activeMobileSlide || activeSlide).tag}
              </motion.span>
            )}

            {(activeMobileSlide || activeSlide)?.title && (
              <motion.h1
                key={`m-title-${(activeMobileSlide || activeSlide).id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="mb-3 max-w-[15ch] text-3xl font-serif font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl sm:text-4xl"
              >
                {(activeMobileSlide || activeSlide).title}
              </motion.h1>
            )}

            {(activeMobileSlide || activeSlide)?.desc && (
              <motion.p
                key={`m-desc-${(activeMobileSlide || activeSlide).id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8 max-w-[34ch] text-xs font-light leading-relaxed tracking-wide text-white/70 sm:text-sm"
              >
                {(activeMobileSlide || activeSlide).desc}
              </motion.p>
            )}

            {(activeMobileSlide || activeSlide)?.ctaText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                  <button
                  disabled={!(activeMobileSlide || activeSlide)?.ctaLink}
                  onClick={() => handleCtaClick((activeMobileSlide || activeSlide)?.ctaLink)}
                  className={`group relative inline-flex h-auto items-center gap-2 overflow-hidden rounded-full border px-7 py-3 text-xs font-bold transition-all duration-500 ease-out sm:px-8 sm:text-sm ${
                    !(activeMobileSlide || activeSlide)?.ctaLink
                      ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-gray-900 shadow-[0_6px_20px_rgba(251,191,36,0.45)] cursor-pointer border-amber-300/40"
                  }`}
                >
                  {(activeMobileSlide || activeSlide)?.ctaLink && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {(activeMobileSlide || activeSlide).ctaText}
                  </span>
                </button>
              </motion.div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-3">
            <button
              onClick={() => goToSlide(activeIndex - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-2">
              {(desktopSlides.length > 0 ? desktopSlides : slides).map((_, index) => (
                <div
                  key={`mob-dot-${index}`}
                  onClick={() => goToSlide(index)}
                  className={`h-1 cursor-pointer rounded-full transition-all duration-500 ${
                    activeIndex % (desktopSlides.length || slides.length) === index
                      ? "w-10 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      : "w-4 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => goToSlide(activeIndex + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-30 right-4 z-20 hidden max-w-[calc(100vw-2rem)] flex-col items-end gap-4 md:flex md:right-8 lg:right-12">
        <div className="flex items-center gap-3 pr-2 md:gap-4 lg:gap-6">
          <div className="flex items-center gap-1.5 md:gap-2">
            {desktopSlides.map((_, index) => (
              <div
                key={`indicator-${index}`}
                onClick={() => goToSlide(index)}
                className={`h-[3px] cursor-pointer rounded-full transition-all duration-500 ${
                  activeIndex === index
                    ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] md:w-10 lg:w-12"
                    : "w-4 bg-white/30 hover:bg-white/60 md:w-5 lg:w-6"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => goToSlide(activeIndex - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black md:h-10 md:w-10"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
            </button>
            <button
              onClick={() => goToSlide(activeIndex + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black md:h-10 md:w-10"
            >
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-row items-end gap-2 overflow-hidden md:gap-3 lg:gap-4">
          {desktopSlides.map((slide, index) => (
            <motion.div
              key={`thumbnail-${slide.id}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 + 0.35 }}
              onClick={() => goToSlide(index)}
              className={`group relative h-28 w-[67px] flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-500 ease-out md:h-[134px] md:w-[78px] lg:h-[179px] lg:w-28 ${
                activeIndex === index
                  ? "z-10 scale-105 ring-2 ring-[#FDFBF7] shadow-2xl"
                  : "grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
              }`}
            >
              {slide.thumbnailIsVideo ? (
                <video
                  src={slide.thumbnail}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={slide.thumbnail}
                  alt={slide.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              {slide.tag && (
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2 md:p-3">
                  <p className="truncate text-[10px] font-medium text-white/90 md:text-xs">
                    {slide.tag}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}
