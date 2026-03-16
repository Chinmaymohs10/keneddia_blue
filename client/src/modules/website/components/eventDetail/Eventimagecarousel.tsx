import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================
export interface CarouselSlide {
  url: string;
  type?: "IMAGE" | "VIDEO";
  alt?: string;
  label?: string;
  id?: string | number;
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

/**
 * Builds carousel slides from real API media.
 * Only includes the mainUrl (event.image) — no picsum seeds.
 * Returns an empty array if mainUrl is falsy so callers can decide the fallback.
 */
export function buildCarouselSlides(
  _eventId: string | number,
  mainUrl: string,
): CarouselSlide[] {
  if (!mainUrl) return [];
  return [{ id: 0, url: mainUrl, label: "Main Visual", type: "IMAGE" }];
}

const cardPos = {
  center: { zIndex: 30, scale: 1, x: "0%", opacity: 1 },
  left: { zIndex: 10, scale: 0.82, x: "-32%", opacity: 0.35 },
  right: { zIndex: 10, scale: 0.82, x: "32%", opacity: 0.35 },
  hidden: { zIndex: 0, scale: 0.65, opacity: 0 },
};

// ============================================================================
// SOUND BUTTON
// ============================================================================
function SoundButton({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="absolute bottom-3 right-3 z-40 flex items-center gap-1.5 bg-black/55 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-white/20 hover:bg-[#E33E33]/80 transition-all active:scale-95 shadow-lg"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <>
          <VolumeX size={12} />
          <span>Muted</span>
        </>
      ) : (
        <>
          <Volume2 size={12} />
          <span>Sound On</span>
        </>
      )}
    </button>
  );
}

// ============================================================================
// MOBILE CAROUSEL — full-width slider with touch swipe + arrows
// ============================================================================
function MobileCarousel({
  slides,
  active,
  setActive,
  total,
  muted,
  onToggleMute,
}: {
  slides: CarouselSlide[];
  active: number;
  setActive: (n: number) => void;
  total: number;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const touchStartX = useRef<number | null>(null);

  const prev = () => setActive((active - 1 + total) % total);
  const next = () => setActive((active + 1) % total);

  const currentSlide = slides[active];

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
      {/* Media container */}
      <div className="relative w-full h-[240px] rounded-2xl overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {currentSlide.type === "VIDEO" ? (
            <video
              key={`mobile-video-${active}`}
              src={currentSlide.url}
              autoPlay
              muted={muted}
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <motion.img
              key={`mobile-img-${active}`}
              src={currentSlide.url}
              alt={currentSlide.alt}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
        </AnimatePresence>

        {/* Gradient overlay bottom */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Slide counter badge */}
        {total > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
            {active + 1} / {total}
          </div>
        )}

        {/* Sound button — only for video */}
        {currentSlide.type === "VIDEO" && (
          <SoundButton muted={muted} onToggle={onToggleMute} />
        )}

        {/* Arrow buttons */}
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

      {/* Pill dots — only when multiple slides */}
      {total > 1 && (
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
      )}
    </div>
  );
}

// ============================================================================
// MAIN CAROUSEL
// ============================================================================
export default function EventImageCarousel({
  slides,
  active: externalActive,
  onActiveChange,
}: EventImageCarouselProps) {
  const [internalActive, setInternalActive] = useState(0);
  const [muted, setMuted] = useState(true);

  const active = externalActive ?? internalActive;

  const setActive = (n: number) => {
    setInternalActive(n);
    onActiveChange?.(n);
  };

  const total = slides.length;

  // Nothing to render
  if (total === 0) {
    return (
      <div className="w-full h-[240px] md:h-[420px] rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          No images available
        </span>
      </div>
    );
  }

  const next = () => setActive((active + 1) % total);
  const prev = () => setActive((active - 1 + total) % total);

  const toggleMute = () => setMuted((m) => !m);

  const activeSlide = slides[active];

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* ── Stage ── */}
      <div className="relative w-full h-[240px] md:h-[420px] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
        {/* Ambient glow — desktop only */}
        <div className="hidden md:block absolute inset-x-0 top-1/2 -translate-y-1/2 h-48 bg-[#E33E33]/10 blur-[100px] pointer-events-none" />

        {/* Desktop 3-card layout */}
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
                key={slide.id ?? idx}
                animate={cardPos[pos]}
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                className={`absolute inset-0 m-auto w-[72%] h-[92%] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black ${
                  pos === "center"
                    ? "cursor-default"
                    : "cursor-pointer pointer-events-auto"
                }`}
                onClick={() => pos !== "center" && setActive(idx)}
              >
                {slide.type === "VIDEO" ? (
                  <video
                    src={slide.url}
                    autoPlay
                    muted={muted}
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={slide.url}
                    alt={slide.alt || "event-image"}
                    className="w-full h-full object-contain"
                  />
                )}

                {pos === "center" && (
                  <>
                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* Maximize icon hint */}
                    <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm p-1.5 rounded-full border border-white/20 opacity-60">
                      <Maximize2 size={12} className="text-white" />
                    </div>

                    {/* Sound control — only for video */}
                    {slide.type === "VIDEO" && (
                      <SoundButton muted={muted} onToggle={toggleMute} />
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile single-card slider */}
        <MobileCarousel
          slides={slides}
          active={active}
          setActive={setActive}
          total={total}
          muted={muted}
          onToggleMute={toggleMute}
        />

        {/* Desktop arrow buttons — only when multiple slides */}
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

      {/* ── Caption strip + dots — desktop, only when multiple slides ── */}
      {total > 1 && (
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
                {activeSlide.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {active + 1} of {total}
              </span>
              {/* Video type badge */}
              {activeSlide.type === "VIDEO" && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                  Video
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pill dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {slides.map((s, i) => (
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
      )}
    </div>
  );
}