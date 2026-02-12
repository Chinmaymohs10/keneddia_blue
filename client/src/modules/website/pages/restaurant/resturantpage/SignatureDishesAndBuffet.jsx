import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Flame, ArrowUpRight, Sparkles, Maximize2, X, Quote } from "lucide-react";

// --- Data ---
const BUFFET_DATA = [
  { id: "b1", name: "Royal Lunch", price: "₹1,299", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600", chef: "Chef Rajat", remark: "Mughal Era inspiration with authentic spices." },
  { id: "b2", name: "Grand Dinner", price: "₹1,599", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600", chef: "Chef Lin", remark: "Applewood smoked grills and coastal curries." },
  { id: "b3", name: "Sunday Brunch", price: "₹1,899", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600", chef: "Chef Rajat", remark: "Live pasta stations and bottomless prosecco." },
];

const SIGNATURE_DATA = [
  { id: "s1", name: "Butter Chicken", price: "₹545", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600", spice: 2, chef: "Chef Rajat" },
  { id: "s2", name: "Tandoori Jhinga", price: "₹695", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600", spice: 3, chef: "Chef Rajat" },
  { id: "s3", name: "Truffle Dim Sum", price: "₹425", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600", spice: 1, chef: "Chef Lin" },
  { id: "s4", name: "Szechuan Prawns", price: "₹745", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600", spice: 4, chef: "Chef Lin" },
];

export default function EnhancedCulinaryCuration() {
  const [isPausedLeft, setIsPausedLeft] = useState(false);
  const [isPausedRight, setIsPausedRight] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const scrollVariants = (direction) => ({
    animate: {
      y: direction === 'up' ? ["0%", "-50%"] : ["-50%", "0%"],
      transition: {
        y: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
      },
    },
  });

  return (
    <section className="relative py-16 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-20">
        
        {/* --- HEADER WITH ONE-LINE TITLE & CHEF REMARK --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 border-b border-zinc-100 dark:border-white/5 pb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-primary text-[11px] font-black uppercase tracking-[0.4em]">Culinary Masterpieces</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif dark:text-white leading-tight">
              One Location. <span className="italic text-primary">Diverse Flavors.</span>
            </h2>
          </div>

          {/* Chef Spotlight (Utilizing Right Side Spacing) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-primary/10 max-w-lg shadow-sm"
          >
            <div className="relative shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=200" 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary" 
                alt="Executive Chef" 
              />
              <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-full border-2 border-white dark:border-zinc-900">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Quote className="w-3 h-3 text-primary fill-primary" />
                <span className="text-[10px] font-bold dark:text-zinc-400 uppercase tracking-widest">Chef's Remark</span>
              </div>
              <p className="text-sm italic dark:text-zinc-200 leading-snug">
                "We don't just serve food; we serve memories crafted with heritage spices and modern techniques."
              </p>
            </div>
          </motion.div>
        </div>

        {/* --- DUAL SCROLLING SECTION (Increased Height) --- */}
        <div className="grid lg:grid-cols-2 gap-8 h-[750px]">
          
          {/* LEFT: Buffet (Scrolls UP) */}
          <div className="relative group overflow-hidden bg-zinc-50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 shadow-inner">
            <div className="absolute top-6 left-8 z-20 flex justify-between w-[calc(100%-64px)] items-center">
               <h3 className="text-2xl font-serif dark:text-white">Buffet <span className="text-primary italic text-xl">Selection</span></h3>
               <button onClick={() => setExpandedSection('buffet')} className="p-2.5 bg-white dark:bg-black rounded-full shadow-lg hover:bg-primary hover:text-white transition-all">
                  <Maximize2 className="w-5 h-5" />
               </button>
            </div>

            <motion.div 
              className="flex flex-col gap-6 p-8 pt-24"
              variants={scrollVariants('up')}
              animate={isPausedLeft ? "pause" : "animate"}
              onMouseEnter={() => setIsPausedLeft(true)}
              onMouseLeave={() => setIsPausedLeft(false)}
            >
              {[...BUFFET_DATA, ...BUFFET_DATA].map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="bg-white dark:bg-zinc-900 min-h-[160px] p-6 rounded-[2rem] flex gap-6 border border-zinc-100 dark:border-white/5 shadow-sm hover:border-primary/20 transition-all">
                  <img src={item.img} className="w-32 h-32 rounded-2xl object-cover shrink-0 shadow-md" alt="" />
                  <div className="flex flex-col justify-between py-1 w-full">
                    <div>
                      <h4 className="font-serif text-xl dark:text-white mb-1">{item.name}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic line-clamp-2">"{item.remark}"</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-50 dark:border-white/5 pt-3 mt-2">
                      <span className="text-primary font-bold text-lg">{item.price}</span>
                      <div className="flex items-center gap-2 dark:text-zinc-300">
                        <ChefHat className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.chef}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />
          </div>

          {/* RIGHT: Signature (Scrolls DOWN) */}
          <div className="relative group overflow-hidden bg-zinc-50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 shadow-inner">
            <div className="absolute top-6 left-8 z-20 flex justify-between w-[calc(100%-64px)] items-center">
               <h3 className="text-2xl font-serif dark:text-white">Signature <span className="text-primary italic text-xl">Dishes</span></h3>
               <button onClick={() => setExpandedSection('signature')} className="p-2.5 bg-white dark:bg-black rounded-full shadow-lg hover:bg-primary hover:text-white transition-all">
                  <Maximize2 className="w-5 h-5" />
               </button>
            </div>

            <motion.div 
              className="flex flex-col gap-6 p-8 pt-24"
              variants={scrollVariants('down')}
              animate={isPausedRight ? "pause" : "animate"}
              onMouseEnter={() => setIsPausedRight(true)}
              onMouseLeave={() => setIsPausedRight(false)}
            >
              {[...SIGNATURE_DATA, ...SIGNATURE_DATA].map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="bg-white dark:bg-zinc-900 min-h-[160px] p-6 rounded-[2rem] flex items-center justify-between border border-zinc-100 dark:border-white/5 shadow-sm hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-6">
                    <img src={item.img} className="w-32 h-32 rounded-2xl object-cover shrink-0 shadow-md" alt="" />
                    <div className="space-y-2">
                      <h4 className="font-serif text-xl dark:text-white leading-tight">{item.name}</h4>
                      <div className="flex gap-1">
                        {[...Array(item.spice)].map((_, i) => <Flame key={i} className="w-4 h-4 text-primary fill-primary" />)}
                      </div>
                      <p className="text-[10px] dark:text-zinc-500 font-bold uppercase tracking-widest italic">By {item.chef}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end justify-between h-28">
                    <p className="text-primary font-black text-2xl">{item.price}</p>
                    <button className="p-3 bg-zinc-100 dark:bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all group">
                      <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* --- EXPAND OVERLAY --- */}
      <AnimatePresence>
        {expandedSection && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-black p-8 overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-5xl font-serif dark:text-white">Full <span className="text-primary italic">Menu Catalog</span></h2>
                <button onClick={() => setExpandedSection(null)} className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-primary hover:text-white transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {(expandedSection === 'buffet' ? BUFFET_DATA : SIGNATURE_DATA).map(item => (
                   <div key={item.id} className="group cursor-pointer bg-zinc-50 dark:bg-zinc-900 p-4 rounded-[2.5rem] border border-zinc-100 dark:border-white/5">
                      <div className="aspect-[4/3] overflow-hidden rounded-[2rem] mb-6 shadow-xl">
                        <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      </div>
                      <div className="px-2">
                        <h4 className="text-2xl dark:text-white font-serif mb-2">{item.name}</h4>
                        <div className="flex justify-between items-center">
                          <p className="text-primary font-black text-2xl">{item.price}</p>
                          <div className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-primary" />
                            <span className="text-xs dark:text-zinc-400 font-bold uppercase">{item.chef}</span>
                          </div>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}