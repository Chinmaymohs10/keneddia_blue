import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Sparkles,
  Wine
} from "lucide-react";
import { Wine_GALLERY_ITEMS } from "./WineGalleryData";

const CATEGORIES = ["All", "Interior", "Brews", "Bakery", "Events", "Outdoor"];

export default function WineGalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const containerRef = useRef(null);

  // --- Filter Data ---
  const filteredItems = useMemo(() => {
    const normalized = Wine_GALLERY_ITEMS.map((item) => ({
      id: item.id,
      title: item.media.fileName || item.propertyName,
      category: item.categoryName.charAt(0) + item.categoryName.slice(1).toLowerCase(),
      img: item.media.url,
      isHighlighted: item.id % 3 === 0, // Highlight every 3rd item logically
    }));
    return activeCategory === "All"
      ? normalized
      : normalized.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  // --- Parallax Background Text ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  // --- Lightbox Handlers ---
  const openLightbox = (id) => {
    const idx = filteredItems.findIndex(item => item.id === id);
    setLightboxIndex(idx);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[750px] overflow-hidden bg-[#FAF8F4] py-24 dark:bg-[#050505] transition-colors duration-700"
    >
      {/* ── BACKGROUND ACCENT Text ── */}
      <motion.div
        style={{ x: bgTextX }}
        className="pointer-events-none absolute top-1/2 left-0 z-0 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[18rem] font-black italic uppercase text-stone-900/[0.03] dark:text-white/[0.02]"
      >
        Vintage Archive
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* ── LEFT: EDITORIAL CONTENT ── */}
          <div className="lg:col-span-4">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A2A]/10 dark:bg-[#C8956A]/10">
                <Wine className="h-5 w-5 text-[#8B1A2A] dark:text-[#C8956A]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B1A2A] dark:text-[#C8956A]">
                Visual Registry
              </span>
            </div>

            <h2 className="mb-6 font-serif text-5xl leading-[1.1] text-stone-900 md:text-7xl dark:text-stone-100">
              The <br />
              <span className="italic text-stone-400 dark:text-white/30 underline decoration-[#8B1A2A]/20 underline-offset-[12px]">
                Sommelier's
              </span> <br />
              Archive
            </h2>

            <p className="mb-10 max-w-sm text-lg font-light leading-relaxed text-stone-500 dark:text-stone-400">
              A curated visual journey through our private cellars, artisan brews, and the timeless heritage of Kennedia Estates.
            </p>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#8B1A2A] text-white shadow-lg shadow-[#8B1A2A]/20"
                      : "bg-white/50 text-stone-400 hover:bg-stone-100 dark:bg-white/5 dark:text-stone-500 dark:hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: INTERACTIVE CAROUSEL TRACKS ── */}
          <div 
            className="group lg:col-span-8 relative h-[600px] overflow-hidden rounded-[3.5rem] border border-stone-200 bg-white/40 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.02]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Corner Decorative Elements */}
            <div className="absolute top-10 left-10 z-20 h-6 w-6 border-t-2 border-l-2 border-[#8B1A2A]/40" />
            <div className="absolute bottom-10 right-10 z-20 h-6 w-6 border-b-2 border-r-2 border-[#8B1A2A]/40" />

            {/* Cinematic Noise Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

            <div className="relative flex h-full flex-col justify-center gap-8 py-10">
              {/* Track 1: Moving Right */}
              <div className="relative flex h-[240px] items-center">
                <MarqueeTrack items={filteredItems} direction="right" isPaused={isPaused} onOpen={openLightbox} />
              </div>

              {/* Track 2: Moving Left */}
              <div className="relative flex h-[240px] items-center">
                <MarqueeTrack items={filteredItems.slice().reverse()} direction="left" isPaused={isPaused} onOpen={openLightbox} />
              </div>
            </div>

            {/* Gradient Mask for Edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r from-white dark:from-[#050505] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-gradient-to-l from-white dark:from-[#050505] to-transparent" />
          </div>

        </div>
      </div>

      {/* ── IMMERSIVE LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-950/95 backdrop-blur-2xl"
            onClick={closeLightbox}
          >
            <div className="absolute top-6 right-6 flex gap-4">
               <button 
                onClick={closeLightbox}
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 transition-all hover:bg-white/20 cursor-pointer"
               >
                 <X size={24} className="text-white" />
               </button>
            </div>

            <div className="relative flex h-full w-full items-center justify-center px-4 md:px-20">
               <button 
                onClick={prevImage}
                className="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 cursor-pointer"
               >
                 <ChevronLeft size={32} />
               </button>

               <motion.div
                key={filteredItems[lightboxIndex].id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl"
                style={{ maxWidth: "min(1200px, 90vw)", maxHeight: "80vh" }}
                onClick={(e) => e.stopPropagation()}
               >
                  <img 
                    src={filteredItems[lightboxIndex].img} 
                    alt={filteredItems[lightboxIndex].title} 
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-8 pt-20 text-center">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.4em] text-[#C8956A]">
                      {filteredItems[lightboxIndex].category}
                    </p>
                    <h3 className="font-serif text-3xl text-white">{filteredItems[lightboxIndex].title}</h3>
                  </div>
               </motion.div>

               <button 
                onClick={nextImage}
                className="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 cursor-pointer"
               >
                 <ChevronRight size={32} />
               </button>
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-stone-500 font-mono text-xs uppercase tracking-widest">
               {lightboxIndex + 1} / {filteredItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function MarqueeTrack({ items, direction = "left", isPaused, onOpen }) {
  const [duplicateItems] = useState([...items, ...items, ...items]);
  
  return (
    <motion.div
      animate={{
        x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"]
      }}
      transition={{
        duration: 25,
        ease: "linear",
        repeat: Infinity,
        paused: isPaused
      }}
      className="flex gap-6 whitespace-nowrap"
    >
      {duplicateItems.map((item, idx) => (
        <GalleryCard 
          key={`${item.id}-${idx}`} 
          item={item} 
          onOpen={() => onOpen(item.id)} 
        />
      ))}
    </motion.div>
  );
}

function GalleryCard({ item, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className={`group relative shrink-0 overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100 transition-all duration-700 hover:z-30 dark:border-white/10 dark:bg-[#1A0C13] shadow-xl cursor-pointer ${
        item.isHighlighted ? "w-[240px] h-[320px] -rotate-1" : "w-[180px] h-[240px]"
      } hover:scale-110 hover:rotate-0`}
    >
      <img
        src={item.img}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Glow Effect for Highlighted Items */}
      {item.isHighlighted && (
        <div className="absolute inset-0 border-2 border-[#8B1A2A]/40 mix-blend-overlay" />
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-stone-900/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center opacity-0 transition-all duration-500 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mb-3 rounded-full bg-white/20 p-2 backdrop-blur-md">
          <Maximize2 size={16} className="text-white" />
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#C8956A]">
          {item.category}
        </p>
        <h4 className="font-serif text-sm text-white line-clamp-2">{item.title}</h4>
      </div>

      {/* Sommelier's Seal for Highlighted */}
      {item.isHighlighted && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1 backdrop-blur-md">
          <Sparkles size={8} className="text-[#C8956A]" />
          <span className="text-[7px] font-black uppercase tracking-widest text-white">Curated</span>
        </div>
      )}
    </button>
  );
}
