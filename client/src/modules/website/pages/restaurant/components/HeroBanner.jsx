import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Menu, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    id: 1,
    tag: "The Experience",
    title: "Culinary Artistry Across Asia",
    desc: "A curated journey through Chinese, Italian, and Indian Tandoor traditions.",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1600",
    isBYOB: false,
    bgTitle: "AUTHENTIC",
  },
  {
    id: 2,
    tag: "BYOB Friendly",
    title: "Your Choice, Our Expertise",
    desc: "Pair your favorite vintage with our signature Asian Fusion menu.",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600",
    isBYOB: true,
    bgTitle: "PREMIUM",
  },
  {
    id: 3,
    tag: "The Ambience",
    title: "Modern Spirit, Timeless Flavor",
    desc: "An elegant setting designed for intimate dinners and grand celebrations.",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600",
    isBYOB: false,
    bgTitle: "ELEGANCE",
  },
];

export default function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  };

  const activeSlide = SLIDES[activeIndex];

  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={activeSlide.img}
            alt={activeSlide.title}
            className="hidden h-full w-full object-cover md:block"
          />
          <img
            src={activeSlide.img}
            alt={activeSlide.title}
            className="block h-full w-full object-cover md:hidden"
          />
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
            {/* <motion.span
              key={`tag-${activeSlide.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-3 inline-flex rounded-full bg-white/12 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md"
            >
              {activeSlide.tag}
            </motion.span> */}

            <motion.h1
              key={`title-${activeSlide.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-3 text-3xl font-serif font-medium leading-[1.06] tracking-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl"
            >
              {activeSlide.title}
            </motion.h1>

            <motion.p
              key={`desc-${activeSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="mb-6 max-w-2xl text-sm font-light capitalize tracking-normal text-white/90 drop-shadow-md md:text-base"
            >
              {activeSlide.desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button className="group relative h-auto overflow-hidden rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)]">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                <span className="relative z-10 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Reserve
                </span>
              </Button>
              {/* <Button
                variant="outline"
                className="h-auto rounded-full border-white/30 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black"
              >
                <Menu className="mr-2 h-4 w-4" />
                Explore Menu
              </Button> */}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 block md:hidden">
        <div
          className="relative w-full overflow-hidden bg-black"
          style={{ height: "calc(75vw + 64px)", minHeight: "320px", maxHeight: "500px" }}
        >
          <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: "64px" }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={`mobile-${activeSlide.id}`}
                src={activeSlide.img}
                alt={activeSlide.title}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>

          <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: "64px" }}>
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
          </div>

          <div className="absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

          <div
            className="absolute inset-x-0 z-20 flex flex-col items-center justify-center px-5 text-center"
            style={{ top: "64px", bottom: "2.5rem" }}
          >
            <motion.span
              key={`m-tag-${activeSlide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-2 inline-flex rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md"
            >
              {activeSlide.tag}
            </motion.span>

            <motion.h1
              key={`m-title-${activeSlide.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mb-1.5 text-lg font-serif font-semibold leading-[1.08] tracking-tight text-white drop-shadow-md"
            >
              {activeSlide.title}
            </motion.h1>

            <motion.p
              key={`m-desc-${activeSlide.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-3 text-[10px] font-light capitalize tracking-normal text-white/80"
            >
              {activeSlide.desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Button className="h-auto rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-5 py-2 text-xs font-semibold text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)]">
                <Calendar className="mr-2 h-3.5 w-3.5" />
                Reserve
              </Button>
              <Button
                variant="outline"
                className="h-auto rounded-full border-white/30 bg-white/5 px-5 py-2 text-xs font-semibold text-white backdrop-blur-md"
              >
                <Menu className="mr-2 h-3.5 w-3.5" />
                Menu
              </Button>
            </motion.div>
          </div>

          <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-3">
            <button
              onClick={() => goToSlide(activeIndex - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, index) => (
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
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-48 right-4 z-20 hidden max-w-[calc(100vw-2rem)] flex-col items-end gap-4 md:flex md:right-8 lg:right-12">
        <div className="flex items-center gap-3 pr-2 md:gap-4 lg:gap-6">
          <div className="flex items-center gap-1.5 md:gap-2">
            {SLIDES.map((_, index) => (
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
          {SLIDES.map((slide, index) => (
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
              <img
                src={slide.img}
                alt={slide.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2 md:p-3">
                <p className="truncate text-[10px] font-medium text-white/90 md:text-xs">
                  {slide.tag}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
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
}
