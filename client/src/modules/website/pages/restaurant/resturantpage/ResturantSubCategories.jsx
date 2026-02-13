import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, UtensilsCrossed, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EXPERIENCES = [
  {
    id: "italian",
    title: "Italian",
    description:
      "Authentic Mediterranean soul in a sophisticated setting. Experience the rich heritage of Tuscany through our hand-picked ingredients.",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    link: "/resturant/italian",
    // Separate BG Colors: Light/Main and Dark/Hover
    bgColor: "bg-orange-50 dark:bg-orange-950/10",
    hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
  },
  {
    id: "luxury-lounge",
    title: "Luxury Lounge",
    description:
      "Premium comfort tailored for memorable family gatherings. A refined space where elegance meets contemporary dining.",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800",
    link: "/resturant/luxury-lounge",
    bgColor: "bg-blue-50 dark:bg-blue-950/10",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
  },
  {
    id: "spicy-darbar",
    title: "Spicy Darbar",
    description:
      "Bold, traditional Indian flavors with a fiery spirit. Royal curries and tandoori masterpieces prepared with authentic spices.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/resturant/spicy-darbar",
    bgColor: "bg-red-50 dark:bg-red-950/10",
    hoverBg: "hover:bg-red-50 dark:hover:bg-red-900/20",
  },
  {
    id: "takeaway",
    title: "Takeaway Treats",
    description:
      "Gourmet quality on the go for your convenience. Perfectly packaged meals that bring the resturant experience to your home.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/resturant/takeaway",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/10",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
  },
];

export default function ResturantSubCategories({ propertyId }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const moveTL_BR = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 0.04, 0.04, 0],
  );

  return (
    <section
      ref={containerRef}
      className="relative py-10 lg:py-14 transition-colors duration-500 bg-white dark:bg-[#080808] overflow-hidden"
    >
      {/* ── Background Parallax Text ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          style={{ x: moveTL_BR, y: moveTL_BR, opacity: bgOpacity }}
          className="absolute top-4 left-4 text-[6rem] lg:text-[10rem] font-black italic text-zinc-900 dark:text-white select-none uppercase"
        >
          Cuisine
        </motion.div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em]">
                VerticalS
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 dark:text-white tracking-tight mb-4">
              One Location.{" "}
              <span className="text-primary italic">Diverse Verticals.</span>
            </h2>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base max-w-2xl font-light leading-relaxed">
              Discover a curated collection of culinary spaces designed for
              every mood and occasion. From intimate fine dining to casual
              gourmet treats, explore the distinct flavors that define our
              premium destination.
            </p>
          </motion.div>
        </div>

        {/* ── Adaptive Layout ── */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {EXPERIENCES.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/resturant/${propertyId}/${exp.id}`)}
              className={`
                group cursor-pointer relative flex transition-all duration-500 hover:shadow-2xl
                ${exp.bgColor} ${exp.hoverBg}
                /* Mobile Style: Small rectangle, single row */
                w-full p-4 rounded-2xl flex-row items-center border border-zinc-100 dark:border-white/5 shadow-sm
                /* Desktop Style: Large square card, centered image */
                lg:flex-col lg:items-center lg:text-center lg:p-10 lg:rounded-[2.5rem] lg:w-[calc(25%-1.5rem)] lg:min-h-[420px] lg:hover:border-primary/20
              `}
            >
              {/* Circular Image Container */}
              <div
                className={`
                shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-zinc-800 shadow-lg z-20 transition-transform duration-500 group-hover:scale-110
                /* Mobile */
                w-14 h-14
                /* Desktop */
                lg:w-28 lg:h-28 lg:mb-8
              `}
              >
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col flex-grow px-4 lg:px-0">
                <h3 className="text-lg lg:text-3xl font-serif text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors tracking-tight">
                  {exp.title}
                </h3>

                <p className="hidden lg:block text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mt-4 mb-6 line-clamp-4 font-light">
                  {exp.description}
                </p>

                <div className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                  <ChevronRight size={20} />
                </div>

                <div className="hidden lg:flex mt-auto items-center justify-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <ChevronRight size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    Explore Vertical
                  </span>
                </div>
              </div>

              <span className="hidden lg:block absolute bottom-8 right-10 text-7xl font-black text-zinc-900/[0.03] dark:text-white/[0.02] italic select-none">
                0{index + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}