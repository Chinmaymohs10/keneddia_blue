import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PartyPopper, Briefcase, Heart, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANQUET_ITEMS = [
  {
    title: "Birthday Party",
    desc: "Private celebrations with curated ambience.",
    Icon: PartyPopper,
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800",
    parallaxOffset: ["30px", "-30px"]
  },
  {
    title: "Business Meetings",
    desc: "Professional gatherings with total privacy.",
    Icon: Briefcase,
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800",
    parallaxOffset: ["60px", "-60px"]
  },
  {
    title: "Wedding Party",
    desc: "Intimate receptions focused on elegance.",
    Icon: Heart,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800",
    parallaxOffset: ["20px", "-20px"]
  }
];

export default function BanquetsAndCatering() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const textX = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);

  return (
    <section 
      ref={containerRef}
      className="relative py-16 bg-[#050505] overflow-hidden min-h-[700px]"
    >
      {/* BACKGROUND REVERSE TEXT - Reduced Size */}
      <motion.div 
        style={{ x: textX, opacity: 0.02 }}
        className="absolute top-1/4 left-0 whitespace-nowrap text-[10rem] md:text-[12rem] font-black text-white pointer-events-none select-none italic uppercase z-0"
      >
        Celebrations Gatherings Events
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        {/* COMPACT HEADER */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-[9px] font-bold uppercase tracking-[0.5em]">
              Event Services
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
            Memories <span className="italic text-white/30">Beyond Dining.</span>
          </h2>
        </div>

        {/* COMPACT TRANSPARENT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {BANQUET_ITEMS.map((item, index) => {
            const cardY = useTransform(scrollYProgress, [0, 1], item.parallaxOffset);
            
            return (
              <motion.div
                key={item.title}
                style={{ y: cardY }}
                className="group relative h-[360px] cursor-pointer"
              >
                {/* 1. Transparent Layer: Backdrop Blur & Glass */}
                <div className="absolute inset-0 z-10 bg-white/[0.02] backdrop-blur-md border border-white/10 group-hover:border-primary/40 transition-all duration-500 overflow-hidden">
                  
                  {/* 2. Image Layer: Faded & Subtle */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-20 grayscale group-hover:opacity-40 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                  
                  {/* 3. Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Dynamic Hover Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.05)_0%,transparent_70%)]" />
                </div>

                {/* Content Layer */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-none border border-white/20 flex items-center justify-center backdrop-blur-xl group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                      <item.Icon className="w-4 h-4 text-white group-hover:text-black" />
                    </div>
                    <span className="text-[9px] text-white/20 font-black tracking-widest uppercase">
                      Vertical 0{index + 1}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-[11px] leading-relaxed max-w-[180px] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      {item.desc}
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Enquire <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* COMPACT ENQUIRE ACTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-8"
        >
          <div className="h-16 w-[1px] bg-gradient-to-b from-primary/50 to-transparent" />
          
          <Button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-transparent border border-white/20 text-white hover:border-primary px-10 h-14 rounded-none text-[9px] font-bold uppercase tracking-[0.3em] transition-all overflow-hidden"
          >
            <span className="relative z-10">Enquire Now</span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}