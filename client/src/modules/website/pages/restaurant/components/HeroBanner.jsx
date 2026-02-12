import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Calendar, Menu, Wine, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    id: 1,
    tag: "The Experience",
    title: "Culinary Artistry Across Asia",
    desc: "A curated journey through Chinese, Italian, and Indian Tandoor traditions.",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1600",
    isBYOB: false,
    bgTitle: "AUTHENTIC"
  },
  {
    id: 2,
    tag: "BYOB Friendly",
    title: "Your Choice, Our Expertise",
    desc: "Pair your favorite vintage with our signature Asian Fusion menu.",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600",
    isBYOB: true,
    bgTitle: "PREMIUM"
  },
  {
    id: 3,
    tag: "The Ambience",
    title: "Modern Spirit, Timeless Flavor",
    desc: "An elegant setting designed for intimate dinners and grand celebrations.",
    img: "https://images.unsplash.com/photo-1550966841-3ee7adac1661?q=80&w=1600",
    isBYOB: false,
    bgTitle: "ELEGANCE"
  }
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);

  // Scroll logic for Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // TRANSFORMATIONS (The "Reverse" and Storytelling effects)
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]); // Slow descent
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-150px"]); // Reverse Lift
  const textX = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]); // Horizontal Slide
  const cardOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]); // Fade out on scroll

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative h-screen min-h-[700px] w-full overflow-hidden bg-black"
    >
      {/* 1. LAYER: Large Background Parallax Text (Reverse Horizontal) */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/4 left-0 whitespace-nowrap text-[20rem] font-black text-white/[0.03] select-none z-0 pointer-events-none italic"
      >
        {SLIDES[current].bgTitle}
      </motion.div>

      {/* 2. LAYER: Background Images (Slow Vertical Parallax) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <motion.div style={{ y: bgY }} className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
            <img
              src={SLIDES[current].img}
              alt="Background"
              className="h-full w-full object-cover scale-110"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* 3. LAYER: Main Content (Reverse Vertical Lift) */}
      <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-20 pt-16">
        <motion.div 
          style={{ y: contentY, opacity: cardOpacity }}
          className="max-w-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`card-${current}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Ultra-Compact Glass Card */}
              <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                
                {/* Meta Row */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-bold">
                    {SLIDES[current].tag}
                  </span>
                  {SLIDES[current].isBYOB && (
                    <span className="flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1 text-[9px] font-black uppercase tracking-tighter">
                      <Wine className="w-3.5 h-3.5" /> Premium BYOB
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4 leading-[1.1] tracking-tight">
                  {SLIDES[current].title}
                </h1>

                {/* Description */}
                <p className="text-base md:text-lg text-white/60 mb-8 max-w-md leading-relaxed font-light">
                  {SLIDES[current].desc}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <Button 
                    size="lg"
                    className="rounded-none px-8 h-14 bg-primary hover:bg-primary/90 text-white transition-all shadow-xl shadow-primary/20 group"
                  >
                    <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> 
                    Reserve a Table
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="rounded-none px-8 h-14 border-white/20 text-white hover:bg-white hover:text-black transition-colors"
                  >
                    <Menu className="w-4 h-4 mr-2" /> Explore Menu
                  </Button>
                </div>

                {/* Cuisine Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-white/10">
                  {["Chinese", "Tandoor", "Asian Fusion", "Italian"].map((cuisine) => (
                    <span key={cuisine} className="text-[10px] uppercase tracking-widest text-white/40 font-bold hover:text-primary transition-colors cursor-default">
                      • {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. LAYER: Navigation & Controls */}
      <div className="absolute bottom-10 right-6 md:right-16 z-30 flex items-center gap-8">
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-white text-5xl font-serif italic tracking-tighter">0{current + 1}</span>
            <span className="text-white/20 text-xl font-serif">/03</span>
          </div>
          <div className="w-32 h-[2px] bg-white/10 relative mt-2 overflow-hidden">
            <motion.div 
              className="absolute h-full bg-primary top-0 left-0"
              initial={{ width: 0 }}
              animate={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={prevSlide} 
            className="p-4 border border-white/10 text-white hover:bg-white hover:text-black transition-all group active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={nextSlide} 
            className="p-4 bg-white text-black hover:bg-primary hover:text-white transition-all group active:scale-95"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}