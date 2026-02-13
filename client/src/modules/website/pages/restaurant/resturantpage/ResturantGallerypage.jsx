import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Sparkles, Maximize2 } from "lucide-react";

const GALLERY_DATA = [
  { id: 1, title: "Grand Hall", cat: "Interior", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600" },
  { id: 2, title: "Chef's Table", cat: "Kitchen", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600" },
  { id: 3, title: "Sunset Deck", cat: "Outdoor", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600" },
  { id: 4, title: "The Bar", cat: "Lounge", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600" },
  { id: 5, title: "Live Kitchen", cat: "Kitchen", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600" },
  { id: 6, title: "VIP Suite", cat: "Private", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600" },
];

export default function RestaurantGalleryPage() {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState(0);

  // Parallax for the background storytelling text
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // --- Diagonal Animation Logic ---
  const diagonalVariants = {
    animate: {
      x: ["-25%", "25%"],
      y: ["-25%", "25%"],
      transition: {
        x: { repeat: Infinity, repeatType: "mirror", duration: 10, ease: "linear" },
        y: { repeat: Infinity, repeatType: "mirror", duration: 10, ease: "linear" },
      },
    },
    // Cross-axis (Top Right to Bottom Left)
    animateReverse: {
      x: ["25%", "-25%"],
      y: ["-25%", "25%"],
      transition: {
        x: { repeat: Infinity, repeatType: "mirror", duration: 35, ease: "linear" },
        y: { repeat: Infinity, repeatType: "mirror", duration: 35, ease: "linear" },
      },
    }
  };

  const handleManual = (dir) => {
    setManualOffset(prev => prev + (dir === 'next' ? -100 : 100));
  };

  return (
    <section ref={containerRef} className="relative py-14 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[650px]">
      
      {/* ── BACKGROUND PARALLAX ── */}
      <motion.div 
        style={{ x: bgTextX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[15rem] font-black text-zinc-900/[0.03] dark:text-white/[0.01] pointer-events-none select-none italic uppercase z-0"
      >
        Atmosphere Kitchen Elegance Ambience
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* ── LEFT: EDITORIAL ── */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Visual Gallery</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif dark:text-white leading-[1.1]">
                Welcome to <br />
                <span className="italic text-zinc-400 dark:text-white/30 decoration-primary/20 underline decoration-1 underline-offset-8">Kennedia.</span>
              </h2>
              <p className="text-zinc-500 dark:text-white/40 text-lg font-light leading-relaxed max-w-sm">
                A cinematic intersection of our finest spaces, moving through the heart of our architecture.
              </p>
            </div>

            {/* Manual Controls */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => handleManual('prev')}
                className="p-4 rounded-full border border-zinc-200 dark:border-white/10 dark:text-white hover:bg-primary hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => handleManual('next')}
                className="p-4 rounded-full border border-zinc-200 dark:border-white/10 dark:text-white hover:bg-primary hover:text-white transition-all shadow-xl"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* ── RIGHT: DIAGONAL "X" CAROUSEL ── */}
          <div 
            className="lg:col-span-8 h-[550px] relative rounded-[3rem] overflow-hidden border border-zinc-100 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl shadow-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* Track 1: Top-Left to Bottom-Right */}
              <motion.div 
                variants={diagonalVariants}
                animate={isPaused ? "" : "animate"}
                style={{ translateX: manualOffset }}
                className="absolute flex gap-8 p-10 whitespace-nowrap"
              >
                {[...GALLERY_DATA, ...GALLERY_DATA].map((item, i) => (
                  <GalleryItem key={`tlbr-${i}`} item={item} />
                ))}
              </motion.div>

              {/* Track 2: Top-Right to Bottom-Left (The X intersection) */}
              <motion.div 
                variants={diagonalVariants}
                animate={isPaused ? "" : "animateReverse"}
                style={{ translateX: -manualOffset }}
                className="absolute flex gap-8 p-10 whitespace-nowrap"
              >
                {[...GALLERY_DATA, ...GALLERY_DATA].reverse().map((item, i) => (
                  <GalleryItem key={`trbl-${i}`} item={item} />
                ))}
              </motion.div>

              {/* Central Focus Overlay */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-transparent rounded-[3rem] shadow-[inset_0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
              
              {/* Corner Accents */}
              <div className="absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-primary" />
              <div className="absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-primary" />
            </div>

            {/* Gradient Fades for the Box Edges */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-white/20 dark:from-black/20 dark:to-black/20" />
          </div>

        </div>
      </div>
    </section>
  );
}

function GalleryItem({ item }) {
  return (
    <div className="relative group w-[280px] h-[380px] shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-100 dark:bg-zinc-800 transition-transform duration-500 hover:scale-105">
      <img 
        src={item.img} 
        alt={item.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
        <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">{item.cat}</span>
        <h4 className="text-white font-serif text-lg">{item.title}</h4>
      </div>
      {/* Visual Marker for "X" movement */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 size={16} className="text-white" />
      </div>
    </div>
  );
}