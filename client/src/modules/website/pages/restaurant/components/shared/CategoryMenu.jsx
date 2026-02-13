import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ChevronLeft, ChevronRight, Sparkles, Utensils } from "lucide-react";

export default function CategoryMenu({ menu, themeColor }) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef(null);

  // Navigation logic
  const handleNext = () => {
    if (activeTab < menu.length - 1) {
      setActiveTab(activeTab + 1);
      scrollToTab(activeTab + 1);
    }
  };

  const handlePrev = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
      scrollToTab(activeTab - 1);
    }
  };

  const scrollToTab = (index) => {
    const container = scrollContainerRef.current;
    if (container) {
      const tab = container.children[index];
      container.scrollTo({
        left: tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="menu" className="py-16 bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="container mx-auto px-6 max-w-[1200px]">
        
        {/* --- COMPACT HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-serif dark:text-white">
              The <span className="italic text-primary">Selection</span>
            </h2>
          </div>

          {/* NEXT/PREV CONTROLS */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrev}
              disabled={activeTab === 0}
              className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5 dark:text-white" />
            </button>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {activeTab + 1} / {menu.length}
            </div>
            <button 
              onClick={handleNext}
              disabled={activeTab === menu.length - 1}
              className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            >
              <ChevronRight className="w-5 h-5 dark:text-white" />
            </button>
          </div>
        </div>

        {/* --- COMPACT TAB SCROLLER --- */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-8 snap-x"
        >
          {menu.map((section, idx) => (
            <motion.button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`relative flex-shrink-0 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all snap-center
                ${activeTab === idx 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-primary/50"
                }`}
            >
              {section.category}
            </motion.button>
          ))}
        </div>

        {/* --- REFINED CONTENT AREA --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid lg:grid-cols-12 gap-8 items-start"
          >
            {/* COMPACT STICKY IMAGE */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-white/5">
                <img 
                  src={menu[activeTab].categoryImage} 
                  className="w-full h-full object-cover" 
                  alt="Featured" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Featured</p>
                   <h3 className="text-2xl font-serif uppercase tracking-tight">{menu[activeTab].category}</h3>
                </div>
              </div>
            </div>

            {/* MINIMALIST ITEM LIST */}
            <div className="lg:col-span-7 space-y-4">
              {menu[activeTab].items.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src={item.image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" alt={item.name} />
                  </div>
                  
                  <div className="flex-1 border-b border-zinc-100 dark:border-white/5 pb-3 group-last:border-none">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{item.name}</h4>
                        {item.isSpicy && <Flame size={12} className="text-red-500 fill-red-500" />}
                      </div>
                      <span className="text-primary font-serif text-sm font-bold">{item.price}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 italic">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}