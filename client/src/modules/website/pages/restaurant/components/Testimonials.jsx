import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Quote, Star, Sparkles } from "lucide-react";

// --- Mock Data ---
const FEEDBACK_DATA = [
  { id: 1, name: "Arjun Mehta", text: "The Signature Butter Chicken is easily the best in Ghaziabad. Incredible atmosphere!", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400", rating: 5 },
  { id: 2, name: "Sarah Khan", text: "A perfect BYOB spot for family gatherings. The staff is exceptionally polite.", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=400", rating: 5 },
  { id: 3, name: "Priya Das", text: "Love the Dim Sum platter. The flavors are authentic and presentation is top-notch.", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=400", rating: 4 },
  { id: 4, name: "Rohan V.", text: "The live music on weekends pairs perfectly with their Tandoori Jhinga.", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400", rating: 5 },
  { id: 5, name: "Elena G.", text: "Sophisticated settings and very clean. Highly recommend for corporate dinners.", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400", rating: 5 },
];

const FeedbackCard = ({ item }) => (
  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-lg mb-6 flex flex-col gap-3 group transition-all hover:scale-[1.02]">
    <div className="flex gap-0.5">
      {[...Array(item.rating)].map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-primary text-primary" />
      ))}
    </div>
    <p className="text-zinc-600 dark:text-zinc-300 text-[13px] leading-relaxed italic">"{item.text}"</p>
    <div className="relative h-28 w-full rounded-xl overflow-hidden grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700">
      <img src={item.img} className="w-full h-full object-cover" alt="User Post" />
    </div>
    <div className="flex items-center gap-3 pt-1">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
        {item.name.charAt(0)}
      </div>
      <span className="text-[10px] font-bold dark:text-white uppercase tracking-tighter">{item.name}</span>
    </div>
  </div>
);

export default function AutoTestimonials() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section 
      ref={containerRef}
      className="relative py-24 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[750px] flex items-center"
    >
      {/* --- BACKGROUND DECOR --- */}
      <motion.div 
        style={{ x: bgTextX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[12rem] lg:text-[18rem] font-black text-zinc-900/[0.03] dark:text-white/[0.01] pointer-events-none select-none italic uppercase z-0"
      >
        Guest Stories Feedback
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* --- LEFT: CONTENT --- */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-white leading-[1.1]">
                Voices of <br />
                <span className="italic text-zinc-400 dark:text-white/30 decoration-primary/20 underline decoration-1 underline-offset-8">Delight.</span>
              </h2>
              <p className="text-zinc-500 dark:text-white/40 text-lg font-light leading-relaxed max-w-sm pt-4">
                Real moments shared by our guests. Experience the legacy of flavors through their eyes.
              </p>
            </div>

            <div className="pt-8 border-t border-zinc-100 dark:border-white/10 flex items-center gap-6">
               <div className="text-center">
                  <p className="text-4xl font-serif dark:text-white leading-none">4.9</p>
                  <div className="flex gap-0.5 mt-2 justify-center">
                     {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                  </div>
               </div>
               <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-tight">
                  Trusted by <br /> 1,200+ Guests
               </p>
            </div>
          </div>

          {/* --- RIGHT: AUTO CAROUSEL WITH BLUR OVERLAY --- */}
          <div className="lg:col-span-7 h-[650px] relative rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] backdrop-blur-2xl">
            
            <div className="grid grid-cols-2 gap-6 h-full p-6 overflow-hidden relative group">
              
              {/* Vertical Scroller 1 (Up) */}
              <div className="flex flex-col gap-6 animate-marquee-up group-hover:[animation-play-state:paused]">
                {[...FEEDBACK_DATA, ...FEEDBACK_DATA, ...FEEDBACK_DATA].map((item, i) => (
                  <FeedbackCard key={`up-${i}`} item={item} />
                ))}
              </div>

              {/* Vertical Scroller 2 (Down) */}
              <div className="flex flex-col gap-6 animate-marquee-down group-hover:[animation-play-state:paused]">
                {[...FEEDBACK_DATA, ...FEEDBACK_DATA, ...FEEDBACK_DATA].map((item, i) => (
                  <FeedbackCard key={`down-${i}`} item={item} />
                ))}
              </div>

              {/* Glass Overlays for Top/Bottom Fading */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-50/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/80 dark:from-[#050505]/80 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Floating Quote Icon */}
            <div className="absolute bottom-8 right-8 z-20 bg-primary p-4 rounded-full shadow-2xl shadow-primary/40 text-white">
               <Quote className="w-6 h-6 fill-white" />
            </div>
          </div>

        </div>
      </div>

      {/* --- Inline Styles for Custom Marquee --- */}
      <style>{`
        @keyframes marquee-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-marquee-up {
          animation: marquee-up 40s linear infinite;
        }
        .animate-marquee-down {
          animation: marquee-down 40s linear infinite;
        }
      `}</style>
    </section>
  );
}