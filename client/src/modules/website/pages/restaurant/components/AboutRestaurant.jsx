import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, Phone, GlassWater, MapPin, Sparkles } from "lucide-react";

export default function AboutRestaurant() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // PARALLAX CONTROLS
  const textX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]); // BG Horizontal
  const titleY = useTransform(scrollYProgress, [0, 1], ["60px", "-60px"]); // Headline vertical
  const descY = useTransform(scrollYProgress, [0, 1], ["100px", "-100px"]); // Narrative vertical
  const imageY = useTransform(scrollYProgress, [0, 1], ["-40px", "40px"]); // Image vertical

  return (
    <section 
      ref={containerRef}
      id="about" 
      className="relative py-24 bg-[#050505] overflow-hidden"
    >
      {/* BACKGROUND DECORATIVE LAYER */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/3 left-0 whitespace-nowrap text-[15rem] font-black text-white/[0.02] pointer-events-none select-none italic uppercase z-0"
      >
        Authentic Heritage Ghaziabad
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* LEFT: VISUAL COMPONENT */}
          <div className="relative">
            <motion.div 
              style={{ y: imageY }}
              className="relative rounded-sm overflow-hidden aspect-[4/5] shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200"
                alt="Restaurant Ambience"
                className="w-full h-full object-cover grayscale-[0.2]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>

            {/* Float Badge: BYOB Experience */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="absolute top-10 -left-6 bg-primary p-5 shadow-2xl"
            >
              <GlassWater className="text-white w-6 h-6 mb-2" />
              <span className="text-white text-[10px] font-black uppercase tracking-tighter leading-tight block">
                Premium <br /> BYOB Setting
              </span>
            </motion.div>

            {/* Offer Card: Buffet */}
            <motion.div
              style={{ y: titleY }} // Linked to headline speed
              className="absolute -bottom-10 right-0 md:right-10 bg-zinc-900 border border-white/10 p-6 md:p-8 shadow-2xl max-w-[260px]"
            >
              <div className="flex items-center gap-2 mb-3 text-primary">
                <Sparkles className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Featured</span>
              </div>
              <h4 className="text-white font-serif text-xl mb-2">Grand Lunch Buffet</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-primary font-serif text-2xl">₹899</span>
                <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Daily • 12-4 PM</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: STORYTELLING CONTENT */}
          <div className="lg:pl-6 space-y-12">
            {/* Header Content with Parallax */}
            <motion.div style={{ y: titleY }}>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-primary text-[10px] font-bold uppercase tracking-[0.5em]">
                  Ghaziabad Destination
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-serif text-white leading-tight tracking-tight">
                A Symphony of <br />
                <span className="italic text-white/40 italic decoration-primary/20 underline decoration-1 underline-offset-[12px]">
                  Fine Flavors.
                </span>
              </h2>
            </motion.div>

            {/* Narrative with Independent Parallax */}
            <motion.div 
              style={{ y: descY }}
              className="space-y-8"
            >
              <div className="space-y-6 text-white/70 text-lg md:text-xl leading-relaxed font-light">
                <p>
                  We believe dining is more than just a meal; it’s a 
                  <span className="text-white font-medium"> curated premium experience</span> designed 
                  to ground you in the moment. 
                </p>
                <p>
                  Our philosophy balances the bold spices of Indian tradition with 
                  the refined elegance of global favorites, all within a 
                  <span className="text-primary italic font-medium"> thoughtfully designed BYOB setting</span>.
                </p>
              </div>

              {/* Functional Details */}
              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
                <div className="group">
                  <h4 className="text-white/40 font-bold text-[9px] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary" /> Availability
                  </h4>
                  <p className="text-white font-serif text-lg italic leading-tight">11:00 AM — 11:30 PM</p>
                  <p className="text-white/30 text-[10px] mt-1 font-bold tracking-tighter">MONDAY — SUNDAY</p>
                </div>

                <div className="group">
                  <h4 className="text-white/40 font-bold text-[9px] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Phone className="w-3 h-3 text-primary" /> Connect
                  </h4>
                  <a href="tel:+919999999999" className="text-white font-serif text-lg italic block hover:text-primary transition-colors">
                    +91 999 999 9999
                  </a>
                  <span className="text-white/30 text-[10px] font-bold tracking-tighter uppercase">Direct Reservation</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}