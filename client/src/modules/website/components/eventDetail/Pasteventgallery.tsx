import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================
interface GalleryItem {
  id: number;
  src: string;
  label: string;
}

interface PastEventGalleryProps {
  eventId: string | number;
}

// ============================================================================
// FALLBACK
// ============================================================================
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200";

// ============================================================================
// HELPERS
// ============================================================================
function buildGallery(eventId: string | number): GalleryItem[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    src: `https://picsum.photos/seed/${eventId}g${i * 7}/500/700`,
    label: `Highlight ${i + 1}`,
  }));
}

// ============================================================================
// FLOATING GALLERY CARD
// ============================================================================
function FloatingGalleryCard({ item }: { item: GalleryItem }) {
  return (
    <div className="relative group w-[180px] h-[260px] shrink-0 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-zinc-100 dark:bg-zinc-900">
      <img
        src={item.src}
        alt={item.label}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
        <span className="text-[#E33E33] text-[9px] font-black uppercase tracking-widest mb-0.5">
          Past Event
        </span>
        <p className="text-white text-xs font-semibold">{item.label}</p>
      </div>
      <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 size={12} className="text-white" />
      </div>
    </div>
  );
}

// ============================================================================
// PAST EVENT GALLERY — diagonal floating tracks + parallax background
// ============================================================================
export default function PastEventGallery({ eventId }: PastEventGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState(0);

  const items = buildGallery(eventId);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgX = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const track1Variants = {
    animate: {
      x: ["-15%", "15%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "mirror" as const,
          duration: 18,
          ease: "linear",
        },
      },
    },
  };

  const track2Variants = {
    animate: {
      x: ["15%", "-15%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "mirror" as const,
          duration: 26,
          ease: "linear",
        },
      },
    },
  };

  return (
    <section ref={containerRef} className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Camera className="w-4 h-4 text-[#E33E33] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E33E33]">
            Past Highlights
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setManualOffset((p) => p + 120)}
            aria-label="Scroll left"
            className="p-2 rounded-full border border-border hover:bg-[#E33E33] hover:text-white hover:border-[#E33E33] transition-all active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setManualOffset((p) => p - 120)}
            aria-label="Scroll right"
            className="p-2 rounded-full border border-border hover:bg-[#E33E33] hover:text-white hover:border-[#E33E33] transition-all active:scale-95"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Floating canvas */}
      <div
        className="relative h-[360px] rounded-[2rem] overflow-hidden border border-border/50 bg-zinc-50 dark:bg-zinc-950 shadow-inner"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Parallax watermark text */}
        <motion.div
          style={{ x: bgX }}
          className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[8rem] font-black text-zinc-900/[0.03] dark:text-white/[0.02] pointer-events-none select-none italic uppercase"
        >
          MOMENTS&nbsp;MEMORIES&nbsp;MOMENTS
        </motion.div>

        {/* Track 1 — centered, horizontal drift only */}
        <motion.div
          variants={track1Variants}
          animate={isPaused ? {} : "animate"}
          style={{ translateX: manualOffset }}
          className="absolute top-1/2 -translate-y-1/2 flex gap-5 whitespace-nowrap"
        >
          {[...items, ...items].map((item, i) => (
            <FloatingGalleryCard key={`t1-${i}`} item={item} />
          ))}
        </motion.div>

        {/* Track 2 — hidden behind track 1 when centered; subtle offset */}
        <motion.div
          variants={track2Variants}
          animate={isPaused ? {} : "animate"}
          style={{ translateX: -manualOffset }}
          className="absolute top-1/2 -translate-y-1/2 flex gap-5 whitespace-nowrap opacity-0 pointer-events-none"
        >
          {[...items]
            .reverse()
            .concat([...items].reverse())
            .map((item, i) => (
              <FloatingGalleryCard key={`t2-${i}`} item={item} />
            ))}
        </motion.div>

        {/* Corner accents */}
        <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 border-[#E33E33]/50 pointer-events-none" />
        <div className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 border-[#E33E33]/50 pointer-events-none" />

        {/* Edge fade */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-zinc-50/40 via-transparent to-zinc-50/40 dark:from-zinc-950/40 dark:to-zinc-950/40" />
      </div>
    </section>
  );
}