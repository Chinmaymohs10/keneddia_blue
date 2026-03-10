import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================
export interface CarouselSlide {
  id: number;
  src: string;
  label: string;
}

interface EventImageCarouselProps {
  slides: CarouselSlide[];
  active?: number;
  onActiveChange?: (index: number) => void;
}

// ============================================================================
// FALLBACK
// ============================================================================
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200";

// ============================================================================
// HELPERS
// ============================================================================
const CAROUSEL_SEEDS = [10, 20, 30, 40, 50];

export function buildCarouselSlides(
  eventId: string | number,
  mainUrl: string
): CarouselSlide[] {
  return [
    { id: 0, src: mainUrl, label: "Main Visual" },
    ...CAROUSEL_SEEDS.map((s, i) => ({
      id: i + 1,
      src: `https://picsum.photos/seed/${eventId}${s}/900/600`,
      label: `Moment ${i + 1}`,
    })),
  ];
}

const cardPos = {
  center: { zIndex: 30, scale: 1,    x: "0%",   opacity: 1    },
  left:   { zIndex: 10, scale: 0.82, x: "-32%", opacity: 0.35 },
  right:  { zIndex: 10, scale: 0.82, x: "32%",  opacity: 0.35 },
  hidden: { zIndex: 0,  scale: 0.65,             opacity: 0    },
};

// ============================================================================
// MOBILE CAROUSEL — full-width slider with touch swipe + arrows
// ============================================================================
function MobileCarousel({
  slides,
  active,
  setActive,
  total,
}: {
  slides: CarouselSlide[];
  active: number;
  setActive: (n: number) => void;
  total: number;
}) {
  const touchStartX = useRef<number | null>(null);

  const prev = () => setActive((active - 1 + total) % total);
  const next = () => setActive((active + 1) % total);

  return (
    <div
      className="md:hidden relative w-full"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
        touchStartX.current = null;
      }}
    >
      {/* Image */}
      <div className="relative w-full h-[240px] rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={slides[active].src}
            alt={slides[active].label}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </AnimatePresence>

        {/* Gradient overlay bottom */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Slide counter badge */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
          {active + 1} / {total}
        </div>

        {/* Arrow buttons — visible on mobile */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full shadow-md hover:bg-[#E33E33] hover:text-white transition-all active:scale-90"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full shadow-md hover:bg-[#E33E33] hover:text-white transition-all active:scale-90"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Pill dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === active
                ? "w-6 bg-[#E33E33]"
                : "w-2 bg-zinc-300 dark:bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


export default function EventImageCarousel({
  slides,
  active: externalActive,
  onActiveChange,
}: EventImageCarouselProps) {
  const [internalActive, setInternalActive] = useState(0);
  const active = externalActive ?? internalActive;

  const setActive = (n: number) => {
    setInternalActive(n);
    onActiveChange?.(n);
  };

  const total = slides.length;
  const next = () => setActive((active + 1) % total);
  const prev = () => setActive((active - 1 + total) % total);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* ── Stage ── */}
      <div className="relative w-full md:h-[420px] flex items-center justify-center md:overflow-hidden">
        {/* Ambient glow — desktop only */}
        <div className="hidden md:block absolute inset-x-0 top-1/2 -translate-y-1/2 h-48 bg-[#E33E33]/10 blur-[100px] pointer-events-none" />

        {/* Desktop 3-card */}
        <div className="hidden md:block relative w-full h-full">
          {slides.map((slide, idx) => {
            const pos =
              idx === active
                ? "center"
                : idx === (active - 1 + total) % total
                ? "left"
                : idx === (active + 1) % total
                ? "right"
                : "hidden";

            return (
              <motion.div
                key={slide.id}
                animate={cardPos[pos]}
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                className={`absolute inset-0 m-auto w-[72%] h-[92%] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
                  pos === "center"
                    ? "cursor-default"
                    : "cursor-pointer pointer-events-auto"
                }`}
                onClick={() => pos !== "center" && setActive(idx)}
              >
                <img
                  src={slide.src}
                  alt={slide.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
                {pos === "center" && (
                  <>
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Maximize hint */}
                    <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm p-1.5 rounded-full border border-white/20 opacity-60">
                      <Maximize2 size={12} className="text-white" />
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile single card */}
        <MobileCarousel
          slides={slides}
          active={active}
          setActive={setActive}
          total={total}
        />

        {/* Desktop arrow buttons */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="hidden md:flex absolute left-3 z-40 p-2.5 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-[#E33E33] hover:text-white transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="hidden md:flex absolute right-3 z-40 p-2.5 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-[#E33E33] hover:text-white transition-all active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* ── Animated caption strip — desktop only ── */}
      <div className="hidden md:block w-full mt-3 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-3 text-center"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E33E33]">
              {slides[active].label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {active === 0
                ? "Official event banner"
                : `${active} of ${slides.length - 1}`}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Pill dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-7 bg-[#E33E33]"
                  : "w-2 bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}