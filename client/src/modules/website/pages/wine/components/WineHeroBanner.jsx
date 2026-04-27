import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHotelHomepageHeroSection, getPropertyTypes } from "@/Api/Api";
import coverimg from "./../../../../../assets/resturant_images/wine_hero_premium.png";

const fallbackSlides = [
  {
    id: "wine-fallback-slide",
    tag: "Wine",
    title: "Discover Kennedia Wine Experiences",
    desc: "Explore curated spaces, signature pours, and memorable moments.",
    img: coverimg,
    isVideo: false,
    bgTitle: "WINE",
    ctaText: null,
    ctaLink: null,
  },
];

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

      const primaryWord = item.mainTitle?.trim()?.split(/\s+/)?.[0] || "";

      return {
        id: item.id,
        tag: item.ctaText || null,
        title: item.mainTitle || null,
        desc: item.subTitle || null,
        img: backgroundMedia?.url || coverimg,
        isVideo: backgroundMedia?.type === "VIDEO",
        bgTitle: primaryWord.toUpperCase(),
        ctaText: item.ctaText || null,
        ctaLink: item.ctaLink || null,
      };
    })
    .filter(Boolean);

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
  const [slides, setSlides] = useState(
    Array.isArray(initialSlides) && initialSlides.length > 0 ? initialSlides : fallbackSlides,
  );
  const [isLoading, setIsLoading] = useState(
    !(Array.isArray(initialSlides) && initialSlides.length > 0),
  );

  useEffect(() => {
    if (slides.length > 0 && !onReadyCalled.current) {
      onReadyCalled.current = true;
      onReady?.();
    }
  }, [slides.length, onReady]);

  useEffect(() => {
    if (Array.isArray(initialSlides) && initialSlides.length > 0) {
      setSlides(initialSlides);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchWineHero = async () => {
      try {
        const typeResponse = await getPropertyTypes();
        const types = typeResponse?.data || typeResponse;
        const WineType = Array.isArray(types)
          ? types.find(
              (type) => type.isActive && type.typeName?.toLowerCase() === "wine",
            )
          : null;

        if (!WineType?.id) return;

        const response = await getHotelHomepageHeroSection(WineType.id);
        const data = response?.data || response;
        const apiSlides = transformApiDataToSlides(data);

        if (isMounted) {
          setSlides(apiSlides.length > 0 ? apiSlides : fallbackSlides);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Error fetching Wine hero sections:", error);
        if (isMounted) {
          setSlides(fallbackSlides);
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
  }, [initialSlides]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const activeSlide = useMemo(() => slides[activeIndex] || null, [activeIndex, slides]);

  if (isLoading) {
    return (
      <section className="relative h-svh w-full overflow-hidden bg-[#0D0508]">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top,rgba(139,26,42,0.18),rgba(13,5,8,1))]" />
      </section>
    );
  }

  if (!activeSlide) {
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
    <section className="relative h-svh w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <HeroMedia slide={activeSlide} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/80 via-black/40 to-transparent md:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15 md:hidden" />

      <div className="absolute left-0 top-1/4 hidden whitespace-nowrap text-[16rem] font-black italic text-white/[0.03] pointer-events-none md:block">
        {activeSlide.bgTitle}
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
                  disabled={!activeSlide.ctaLink}
                  onClick={() => { if (activeSlide.ctaLink) { const url = /^https?:\/\//i.test(activeSlide.ctaLink) ? activeSlide.ctaLink : `https://${activeSlide.ctaLink}`; window.open(url, "_blank", "noopener,noreferrer"); } }}
                  className={`group relative h-auto overflow-hidden rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-500 ease-out flex items-center gap-2 ${
                    !activeSlide.ctaLink
                      ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)] cursor-pointer border-amber-300/40"
                  }`}
                >
                  {activeSlide.ctaLink && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
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

      <div className="relative z-10 block h-full md:hidden">
        <div className="relative h-full w-full overflow-hidden bg-black">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-${activeSlide.id}`}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                <HeroMedia slide={activeSlide} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/60 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32">
            {activeSlide.tag && (
              <motion.span
                key={`m-tag-${activeSlide.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-3 inline-flex rounded-full bg-white/12 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md"
              >
                {activeSlide.tag}
              </motion.span>
            )}

            {activeSlide.title && (
              <motion.h1
                key={`m-title-${activeSlide.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="mb-2 max-w-[11ch] text-[1.75rem] font-serif font-semibold leading-[1.02] tracking-tight text-white drop-shadow-md sm:text-[2.15rem]"
              >
                {activeSlide.title}
              </motion.h1>
            )}

            {activeSlide.desc && (
              <motion.p
                key={`m-desc-${activeSlide.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-5 max-w-[30ch] text-xs font-light capitalize leading-relaxed tracking-normal text-white/80 sm:text-sm"
              >
                {activeSlide.desc}
              </motion.p>
            )}

            {activeSlide.ctaText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <button
                  disabled={!activeSlide.ctaLink}
                  onClick={() => { if (activeSlide.ctaLink) { const url = /^https?:\/\//i.test(activeSlide.ctaLink) ? activeSlide.ctaLink : `https://${activeSlide.ctaLink}`; window.open(url, "_blank", "noopener,noreferrer"); } }}
                  className={`group relative inline-flex h-auto items-center gap-2 overflow-hidden rounded-full border px-5 py-2.5 text-xs font-semibold transition-all duration-500 ease-out sm:px-6 sm:text-sm ${
                    !activeSlide.ctaLink
                      ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] cursor-pointer border-amber-300/40"
                  }`}
                >
                  {activeSlide.ctaLink && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {activeSlide.ctaText}
                  </span>
                </button>
              </motion.div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-3 px-4 sm:bottom-5">
            <button
              onClick={() => goToSlide(activeIndex - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, index) => (
                <div
                  key={`mob-dot-${index}`}
                  onClick={() => goToSlide(index)}
                  className={`h-[3px] cursor-pointer rounded-full transition-all duration-500 ${
                    activeIndex === index
                      ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                      : "w-4 bg-white/40 hover:bg-white/70"
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
            {slides.map((_, index) => (
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
          {slides.map((slide, index) => (
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
              {slide.isVideo ? (
                <video
                  src={slide.img}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={slide.img}
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
