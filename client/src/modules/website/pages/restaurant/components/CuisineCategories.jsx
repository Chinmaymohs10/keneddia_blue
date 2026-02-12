import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EXPERIENCES = [
  {
    id: "italian",
    title: "Italian",
    description: "Authentic Mediterranean soul in a sophisticated setting.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    link: "/restaurant/italian"
  },
  {
    id: "luxury-lounge",
    title: "Luxury Family Lounge",
    description: "Premium comfort tailored for memorable family gatherings.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800", 
    link: "/restaurant/luxury-lounge"
  },
  {
    id: "spicy-darbar",
    title: "Spicy Darbar",
    description: "Bold, traditional Indian flavors with a fiery spirit.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/restaurant/spicy-darbar"
  },
  {
    id: "takeaway",
    title: "Takeaway Treats",
    description: "Gourmet quality on the go for your convenience.",
    image: "https://images.unsplash.com/photo-1626733130029-f33c44bc4352?q=80&w=800", 
    link: "/restaurant/takeaway"
  }
];

export default function CuisineCategories() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax for the background text specifically behind the header
  const textX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative py-24 bg-[#050505] overflow-hidden"
    >
      {/* BACKGROUND ANIMATION LAYER - Centered on Header */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none z-0">
        <motion.div 
          style={{ x: textX, opacity: bgOpacity }}
          className="absolute top-20 left-0 whitespace-nowrap text-[12rem] md:text-[18rem] font-black text-white/[0.03] select-none italic"
        >
          DESTINATION DESTINATION
        </motion.div>
        
        {/* Glow behind the header */}
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* SECTION HEADER - Elements now sit on top of the animated text */}
        <div className="max-w-4xl mb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-primary/50" />
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.5em]">
                Culinary Sub-Verticals
              </span>
            </div>
            
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] mb-2 tracking-tight">
              One Location.
            </h2>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white/40 italic leading-[1.1] tracking-tight">
              Multiple Memories.
            </h2>
          </motion.div>
        </div>

        {/* EXPERIENCE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCES.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                navigate(exp.link);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group relative h-[480px] cursor-pointer"
            >
              <div className="relative h-full w-full overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-primary/40 transition-all duration-500">
                
                {/* Image Component */}
                <div className="absolute inset-0">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] text-primary font-black">0{index + 1}</span>
                    <div className="w-8 h-[1px] bg-primary/40 group-hover:w-16 transition-all duration-700" />
                  </div>

                  <h3 className="text-3xl font-serif text-white mb-3 group-hover:text-primary transition-colors">
                    {exp.title}
                  </h3>
                  
                  <p className="text-white/50 text-xs leading-relaxed max-w-[220px] mb-6 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {exp.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                      Discover Experience
                    </span>
                    <ArrowUpRight className="w-5 h-5 text-white transform group-hover:rotate-45 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}