import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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

      if (!backgroundMedia?.url) return null;

      const primaryWord = item.mainTitle?.trim()?.split(/\s+/)?.[0] || "";

      return {
        id: item.id,
        tag: item.ctaText || null,
        title: item.mainTitle || null,
        desc: item.subTitle || null,
        img: backgroundMedia.url,
        isVideo: backgroundMedia.type === "VIDEO",
        bgTitle: primaryWord.toUpperCase(),
        ctaText: item.ctaText || null,
        ctaLink: item.ctaLink || null,
        showOnHomepage: item.showOnHomepage === true,
        showOnMobilePage: item.showOnMobilePage ?? null,
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

export default function HeroBanner({ initialSlides, onReady }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const onReadyCalled = useRef(false);
  const [slides, setSlides] = useState(
    Array.isArray(initialSlides) && initialSlides.length > 0
      ? initialSlides
      : [],
  );
  const [isFetchingHero, setIsFetchingHero] = useState(
    !(Array.isArray(initialSlides) && initialSlides.length > 0),
  );

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
    if (
      !isFetchingHero &&
      desktopSlides.length === 0 &&
      mobileSlides.length === 0 &&
      !onReadyCalled.current
    ) {
      onReadyCalled.current = true;
      onReady?.();
    }
  }, [desktopSlides.length, isFetchingHero, mobileSlides.length, onReady]);

  useEffect(() => {
    // Skip client fetch if SSR already provided slides
    if (Array.isArray(initialSlides) && initialSlides.length > 0) {
      setIsFetchingHero(false);
      return;
    }

    let isMounted = true;

    const fetchRestaurantHero = async () => {
      try {
        setIsFetchingHero(true);
        const typeResponse = await getPropertyTypes();
        const types = typeResponse?.data || typeResponse;
        const restaurantType = Array.isArray(types)
          ? types.find(
              (type) =>
                type.isActive &&
                type.typeName?.toLowerCase() === "restaurant",
            )
          : null;

        if (!restaurantType?.id) return;

        const response = await getHotelHomepageHeroSection(restaurantType.id);
        const data = response?.data || response;
        const apiSlides = transformApiDataToSlides(data);

        if (isMounted && apiSlides.length > 0) {
          setSlides(apiSlides);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Error fetching restaurant hero sections:", error);
      } finally {
        if (isMounted) setIsFetchingHero(false);
      }
    };

    fetchRestaurantHero();

    return () => {
      isMounted = false;
    };
  }, [initialSlides]);

  useEffect(() => {
    if (desktopSlides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % desktopSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [desktopSlides.length]);

  useEffect(() => {
    if (mobileSlides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setMobileActiveIndex((current) => (current + 1) % mobileSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [mobileSlides.length]);

  const goToSlide = (index) => {
    if (desktopSlides.length === 0) return;
    setActiveIndex((index + desktopSlides.length) % desktopSlides.length);
  };

  const goToMobileSlide = (index) => {
    setMobileActiveIndex((index + mobileSlides.length) % mobileSlides.length);
  };

  const activeSlide = useMemo(
    () => desktopSlides[activeIndex] || null,
    [activeIndex, desktopSlides],
  );
  const activeMobileSlide = useMemo(() => mobileSlides[mobileActiveIndex] || null, [mobileActiveIndex, mobileSlides]);
  const upcomingThumbnailSlides = useMemo(() => {
    if (desktopSlides.length === 0) return [];
    if (desktopSlides.length === 1) {
      return [{ slide: desktopSlides[0], index: 0 }];
    }

    return Array.from({ length: desktopSlides.length - 1 }, (_, offset) => {
      const index = (activeIndex + offset + 1) % desktopSlides.length;
      const slide = desktopSlides[index];

      if (!slide) return null;

      return {
        slide,
        index,
      };
    }).filter(Boolean);
  }, [activeIndex, desktopSlides]);

  // Global fallback if no slides are available for either device
  if (!activeSlide && !activeMobileSlide) {
    return (
      <section className="relative h-[90vh] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-700 via-neutral-800 to-neutral-950 opacity-80" />
        <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
          <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            No Preview Available
          </div>
          <p className="text-sm text-white/25">Hero section has no active slides configured.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-background h-[90vh]"
    >
      {!activeSlide ? (
        <div className="absolute inset-0 hidden items-center justify-center bg-neutral-900 md:flex">
          <div className="text-center px-6">
            <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              No Preview
            </div>
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute inset-0 hidden md:block"
            >
              <HeroMedia slide={activeSlide} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 hidden bg-gradient-to-r from-black/80 via-black/40 to-transparent md:block" />

          <div className="absolute left-0 top-1/4 hidden whitespace-nowrap text-[16rem] font-black italic text-white/[0.03] pointer-events-none md:block">
            {activeSlide.bgTitle}
          </div>

          <div className="relative z-10 hidden h-full items-center md:flex">
            <div className="container mx-auto flex h-full items-center px-8 md:px-16 lg:px-24">
              <div className="w-full md:w-[70%] xl:w-[75%]">
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
                      className={`group relative h-auto overflow-hidden rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-500 ease-out flex items-center gap-2 ${!activeSlide.ctaLink
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
        </>
      )}

      {!activeMobileSlide ? (
        <div
          className="relative z-10 flex md:hidden w-full overflow-hidden bg-neutral-900 items-center justify-center h-full"
        >
          <div className="text-center px-6">
            <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40 inline-block">
              No Preview
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 block md:hidden">
          <div
            className="relative w-full overflow-hidden bg-black"
            style={{ height: "calc(75vw + 64px)", minHeight: "320px", maxHeight: "500px" }}
          >
            <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: "64px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mobile-${activeMobileSlide.id}`}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <HeroMedia slide={activeMobileSlide} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: "64px" }}>
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
            </div>
            <div className="absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 z-20 flex flex-col items-center justify-center px-5 text-center" style={{ top: "64px", bottom: "2.5rem" }}>
              {activeMobileSlide.title && (
                <motion.h1
                  key={`m-title-${activeMobileSlide.id}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="mb-1.5 text-lg font-serif font-semibold leading-[1.08] tracking-tight text-white drop-shadow-md"
                >
                  {activeMobileSlide.title}
                </motion.h1>
              )}
              {activeMobileSlide.desc && (
                <motion.p
                  key={`m-desc-${activeMobileSlide.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-3 text-[10px] font-light capitalize tracking-normal text-white/80"
                >
                  {activeMobileSlide.desc}
                </motion.p>
              )}
              {activeMobileSlide.ctaText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  <button
                    disabled={!activeMobileSlide.ctaLink}
                    onClick={() => { if (activeMobileSlide.ctaLink) { const url = /^https?:\/\//i.test(activeMobileSlide.ctaLink) ? activeMobileSlide.ctaLink : `https://${activeMobileSlide.ctaLink}`; window.open(url, "_blank", "noopener,noreferrer"); } }}
                    className={`group relative h-auto overflow-hidden rounded-full border px-5 py-2 text-xs font-semibold transition-all duration-500 ease-out inline-flex items-center gap-2 ${
                      !activeMobileSlide.ctaLink
                        ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70"
                        : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] cursor-pointer border-amber-300/40"
                    }`}
                  >
                    {activeMobileSlide.ctaLink && (
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {activeMobileSlide.ctaText}
                    </span>
                  </button>
                </motion.div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-3">
              <button
                onClick={() => goToMobileSlide(mobileActiveIndex - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1.5">
                {mobileSlides.map((_, index) => (
                  <div
                    key={`mob-dot-${index}`}
                    onClick={() => goToMobileSlide(index)}
                    className={`h-[3px] cursor-pointer rounded-full transition-all duration-500 ${
                      mobileActiveIndex === index
                        ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                        : "w-4 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => goToMobileSlide(mobileActiveIndex + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSlide && (
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
            {upcomingThumbnailSlides.map(({ slide, index }, thumbOrder) => (
              <motion.div
                key={`thumbnail-${slide.id}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: thumbOrder * 0.12 + 0.35 }}
                onClick={() => goToSlide(index)}
                className="group relative h-28 w-[67px] flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-500 ease-out md:h-[134px] md:w-[78px] lg:h-[179px] lg:w-28 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
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
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 z-10 hidden h-32 w-full md:block md:h-40">
        <svg
          viewBox="0 0 1440 320"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            className="fill-background"
            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,181.3C672,171,768,181,864,181.3C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
}
