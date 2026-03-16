import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================
interface GalleryItem {
  id: number;
  src: string;
  label: string;
  type?: "IMAGE" | "VIDEO";
}

interface PastEventGalleryProps {
  eventId: string | number;
  images: { url: string; alt?: string; type?: "IMAGE" | "VIDEO" }[];
}

// ============================================================================
// HELPERS
// ============================================================================
function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

// ============================================================================
// FLOATING GALLERY CARD
// ============================================================================
function FloatingGalleryCard({
  item,
  muted,
  onToggleMute,
}: {
  item: GalleryItem;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const isVideo = item.type === "VIDEO" || isVideoUrl(item.src);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <div className="relative group w-[200px] h-[280px] shrink-0 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-zinc-900 flex items-center justify-center">
      {/* Media */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={item.src}
          autoPlay
          muted={muted}
          loop
          playsInline
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={item.src}
          alt={item.label}
          className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
        <span className="text-[#E33E33] text-[9px] font-black uppercase tracking-widest mb-0.5">
          Past Event
        </span>
        <p className="text-white text-xs font-semibold">{item.label}</p>
      </div>

      {/* Expand icon */}
      <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 size={12} className="text-white" />
      </div>

      {/* Video badge */}
      {isVideo && (
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
          <Play size={8} className="text-[#E33E33] fill-[#E33E33]" />
          <span className="text-[9px] text-white font-bold uppercase tracking-widest">
            Video
          </span>
        </div>
      )}

      {/* Sound toggle — only for video, shown on hover */}
      {isVideo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 text-white text-[9px] font-bold hover:bg-[#E33E33]/80 active:scale-95"
        >
          {muted ? <VolumeX size={10} /> : <Volume2 size={10} />}
          <span>{muted ? "Muted" : "Sound"}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// PAST EVENT GALLERY
// ============================================================================
// Change the function signature to:
export default function PastEventGallery({
  eventId,
  images = [],
}: PastEventGalleryProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);
  const manualOffsetRef = useRef(0);

  const CARD_W = 200 + 20; // card width + gap

  const items: GalleryItem[] = images.map((img, i) => ({
    id: i,
    src: img.url,
    label: img.alt || `Highlight ${i + 1}`,
    type: img.type ?? (isVideoUrl(img.url) ? "VIDEO" : "IMAGE"),
  }));

  const { scrollYProgress } = useScroll();
  const bgX = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // Duplicate enough for seamless loop — need at least 3 full copies
  const looped =
    items.length < 4
      ? [...items, ...items, ...items, ...items]
      : [...items, ...items, ...items];

  // Width of one full set — used as the wrap boundary
  const totalW = items.length * CARD_W;

  useEffect(() => {
    if (items.length === 0) return;

    const step = () => {
      // Auto-scroll
      if (!isPaused) {
        posRef.current -= 0.6;
      }

      // Apply manual nudge with easing
      if (Math.abs(manualOffsetRef.current) > 0.1) {
        posRef.current += manualOffsetRef.current * 0.12;
        manualOffsetRef.current *= 0.88;
      }

      // Seamless wrap — stay within [-totalW, 0)
      if (posRef.current <= -totalW) posRef.current += totalW;
      if (posRef.current > 0) posRef.current -= totalW;

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${posRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, totalW, items.length]);

  if (items.length === 0) return null;

  const nudge = (dir: 1 | -1) => {
    manualOffsetRef.current += dir * 200;
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Camera className="w-4 h-4 text-[#E33E33] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E33E33]">
            Past Highlights
          </span>
          {/* <span className="text-[10px] text-muted-foreground font-medium">
            ({items.length} {items.length === 1 ? "photo" : "photos"})
          </span> */}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => nudge(1)}
            className="p-2 rounded-full border border-border hover:bg-[#E33E33] hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => nudge(-1)}
            className="p-2 rounded-full border border-border hover:bg-[#E33E33] hover:text-white transition-all active:scale-95"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Floating Canvas */}
      <div
        className="relative h-[380px] rounded-[2rem] overflow-hidden border border-border/50 bg-zinc-50 dark:bg-zinc-950 shadow-inner"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background watermark */}
        <motion.div
          style={{ x: bgX }}
          className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[8rem] font-black text-zinc-900/[0.03] dark:text-white/[0.02] pointer-events-none select-none italic uppercase"
        >
          MOMENTS MEMORIES MOMENTS
        </motion.div>

        {/* Single infinite track */}
        <div
          ref={trackRef}
          className="absolute top-1/2 -translate-y-1/2 flex gap-5 will-change-transform"
          style={{ width: "max-content" }}
        >
          {looped.map((item, i) => (
            <FloatingGalleryCard
              key={`item-${i}`}
              item={item}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
