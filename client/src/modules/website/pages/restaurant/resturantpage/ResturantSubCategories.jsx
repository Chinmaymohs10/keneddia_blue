import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const EXPERIENCES = [
  {
    id: "italian",
    title: "Italian",
    category: "Mediterranean",
    description: "Authentic Mediterranean soul in a sophisticated setting.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    link: "/restaurant/italian"
  },
  {
    id: "luxury-lounge",
    title: "Luxury Lounge",
    category: "Premium",
    description: "Premium comfort tailored for memorable family gatherings.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800", 
    link: "/restaurant/luxury-lounge"
  },
  {
    id: "spicy-darbar",
    title: "Spicy Darbar",
    category: "Traditional",
    description: "Bold, traditional Indian flavors with a fiery spirit.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/restaurant/spicy-darbar"
  },
  {
    id: "takeaway",
    title: "Takeaway Treats",
    category: "Gourmet",
    description: "Gourmet quality on the go for your convenience.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800", 
    link: "/restaurant/takeaway"
  },
  {
    id: "bakery",
    title: "The Bakehouse",
    category: "Desserts",
    description: "Handcrafted pastries and artisanal breads baked daily.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800",
    link: "/restaurant/bakery"
  }
];

export default function ResturantSubCategories({propertyId}) {
  console.log(propertyId);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax background text logic
  const moveTL_BR = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const moveBL_TR = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.04, 0.04, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative py-16 transition-colors duration-500 bg-white dark:bg-[#080808] overflow-hidden"
    >
      {/* ── Background Parallax Text ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          style={{ x: moveTL_BR, y: moveTL_BR, opacity: bgOpacity }}
          className="absolute top-4 left-4 text-[10rem] font-black italic text-zinc-900 dark:text-white select-none uppercase"
        >
          Cuisine
        </motion.div>
        <motion.div 
          style={{ x: moveBL_TR, y: moveBL_TR, opacity: bgOpacity }}
          className="absolute bottom-4 right-4 text-[10rem] font-black italic text-zinc-900 dark:text-white select-none uppercase"
        >
          Flavors
        </motion.div>
      </div>

      {/* ── Main Container (Max-width for spacing) ── */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-20 relative z-10">
        
        {/* ── Header Row ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em]">Verticals</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 dark:text-white tracking-tight">
              One Location. <span className="text-primary italic">Diverse Verticals.</span>
            </h2>
          </motion.div>

          <motion.div className="hidden lg:flex items-center gap-4 bg-zinc-50 dark:bg-white/5 px-6 py-3.5 rounded-2xl border border-zinc-100 dark:border-white/10 shadow-sm">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <p className="text-sm font-serif font-bold text-zinc-900 dark:text-white tracking-wide">Premium Dining Destination</p>
          </motion.div>
        </div>

        {/* ── Carousel Section ── */}
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay, Navigation]}
            spaceBetween={28}
            slidesPerView={1}
            // Auto-pause on hover is enabled by default in Swiper's autoplay module
            autoplay={{ 
              delay: 3500, 
              disableOnInteraction: false,
              pauseOnMouseEnter: true // Specifically stops slider when mouse enters
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="pb-16 !overflow-visible"
          >
            {EXPERIENCES.map((exp, index) => (
              <SwiperSlide key={exp.id} className="h-auto">
                <motion.div
                  onClick={() => navigate(`/restaurant/${propertyId}/${exp.id}`)}
                  // Hover Zoom Effect for individual card
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group cursor-pointer flex flex-col h-full bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-transparent hover:border-zinc-100 dark:hover:border-white/10 transition-colors"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/2.2] overflow-hidden rounded-2xl shadow-sm">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover grayscale-[10%] dark:grayscale-[30%] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">{exp.category}</span>
                      <span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-bold">0{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors mb-2">
                      {exp.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Pagination Styling */}
          <style>{`
            .swiper-pagination-bullet {
              background: #d4d4d8;
              opacity: 0.5;
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .dark .swiper-pagination-bullet {
              background: #3f3f46;
            }
            .swiper-pagination-bullet-active {
              background: #ef4444 !important;
              opacity: 1;
              width: 28px;
              border-radius: 6px;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}