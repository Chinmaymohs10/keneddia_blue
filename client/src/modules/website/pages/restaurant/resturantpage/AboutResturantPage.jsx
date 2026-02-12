import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, Phone, MapPin, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";

export default function AboutResturantPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth Parallax Controls
  const textX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-20px", "20px"]);

  return (
    <section 
      ref={containerRef}
      id="about" 
      className="relative py-16 md:py-24 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden"
    >
      {/* DECORATIVE BACKGROUND TEXT */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/4 left-0 whitespace-nowrap text-[10rem] md:text-[15rem] font-black text-zinc-100 dark:text-white/[0.02] pointer-events-none select-none italic uppercase z-0"
      >
        Authentic Heritage Dining
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: COMPACT IMAGE COMPONENT (5 Columns) */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              style={{ y: imageY }}
              className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl border border-zinc-100 dark:border-white/5"
            >
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200"
                alt="Restaurant Ambience"
                className="w-full h-full object-cover"
              />
              {/* Overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </motion.div>

            {/* SOCIAL MEDIA FLOATER */}
            <div className="absolute -bottom-6 left-6 flex gap-3">
              {[
                { icon: <Instagram size={18} />, link: "#" },
                { icon: <Facebook size={18} />, link: "#" },
                { icon: <Twitter size={18} />, link: "#" },
                { icon: <MessageCircle size={18} />, link: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.link}
                  className="w-12 h-12 bg-white dark:bg-zinc-900 shadow-xl rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors border border-zinc-100 dark:border-white/10"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: COMPACT CONTENT (7 Columns) */}
          <div className="lg:col-span-7 lg:pl-10 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                  The Destination
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-white leading-tight tracking-tight">
                A Symphony of <br />
                <span className="italic text-zinc-400 dark:text-white/40">Fine Flavors.</span>
              </h2>
              
              <p className="text-zinc-600 dark:text-white/70 text-lg md:text-xl leading-relaxed font-light max-w-2xl">
                We believe dining is more than just a meal; it’s a 
                <span className="text-zinc-900 dark:text-white font-medium"> curated premium experience</span>. 
                Our philosophy balances bold Indian tradition with refined global elegance, 
                all within a <span className="text-primary italic font-medium">thoughtfully designed setting</span>.
              </p>
            </div>

            {/* INFO GRID */}
            <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-zinc-100 dark:border-white/10">
              {/* Availability */}
              <div className="group">
                <h4 className="text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary" /> Availability
                </h4>
                <div className="space-y-1">
                  <p className="text-zinc-900 dark:text-white font-serif text-xl italic leading-tight transition-colors">
                    11:00 AM — 11:30 PM
                  </p>
                  <p className="text-zinc-400 dark:text-white/30 text-[10px] font-bold tracking-widest uppercase">
                    MONDAY — SUNDAY
                  </p>
                </div>
              </div>

              {/* Connect */}
              <div className="group">
                <h4 className="text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-primary" /> Connect
                </h4>
                <div className="space-y-1">
                  <a 
                    href="tel:+919999999999" 
                    className="text-zinc-900 dark:text-white font-serif text-xl italic block hover:text-primary transition-colors"
                  >
                    +91 999 999 9999
                  </a>
                  <span className="text-zinc-400 dark:text-white/30 text-[10px] font-bold tracking-widest uppercase">
                    Direct Reservation
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}