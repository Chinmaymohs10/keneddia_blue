import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { ChefHat, Flame, ArrowUpRight, Search, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extended Data - 4 Signature Items per Row/Vertical
const DISHES_ROW_1 = [
  { id: 1, name: "Signature Butter Chicken", price: "₹545", spice: 2, img: "https://images.unsplash.com/photo-1603894584202-747304677943?q=80&w=600" },
  { id: 2, name: "Tandoori Jhinga", price: "₹695", spice: 3, img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600" },
  { id: 3, name: "Dal Bukhara", price: "₹425", spice: 1, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600" },
  { id: 4, name: "Mutton Rogan Josh", price: "₹625", spice: 3, img: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=600" }
];

const DISHES_ROW_2 = [
  { id: 5, name: "Kung Pao Chicken", price: "₹425", spice: 3, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600" },
  { id: 6, name: "Dim Sum Platter", price: "₹595", spice: 1, img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600" },
  { id: 7, name: "Honey Chilli Lotus", price: "₹385", spice: 2, img: "https://images.unsplash.com/photo-1512058560366-cd2427ff06d3?q=80&w=600" },
  { id: 8, name: "Szechuan Prawns", price: "₹745", spice: 4, img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600" }
];

// All items combined for the "Explore" Grid
const ALL_DISHES = [...DISHES_ROW_1, ...DISHES_ROW_2];

const DishCard = ({ dish }) => (
  <motion.div className="relative flex-shrink-0 w-[280px] h-[340px] bg-zinc-900 border border-white/5 overflow-hidden group">
    <div className="absolute inset-0 overflow-hidden">
      <motion.img 
        src={dish.img} 
        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
        whileHover={{ scale: 1.25 }}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="p-3 bg-primary/20 backdrop-blur-md rounded-full border border-primary/50">
          <Search className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
      <h4 className="text-xl font-serif text-white leading-tight mb-2">{dish.name}</h4>
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-primary font-serif text-lg">{dish.price}</span>
        <div className="flex gap-0.5">
          {[...Array(dish.spice)].map((_, i) => <Flame key={i} className="w-3 h-3 text-primary" />)}
        </div>
      </div>
    </div>
  </motion.div>
);

export default function SignatureDishes() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const row1X = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const row2X = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const smoothRow1 = useSpring(row1X, { stiffness: 50, damping: 20 });
  const smoothRow2 = useSpring(row2X, { stiffness: 50, damping: 20 });

  const totalPages = Math.ceil(ALL_DISHES.length / itemsPerPage);
  const currentItems = ALL_DISHES.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section ref={containerRef} className="relative py-24 bg-[#050505] overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* PREVIOUS UI: CHEF SIDEBAR */}
          <div className="lg:col-span-3 h-fit sticky top-24 space-y-8">
            <div className="space-y-2">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">The Masters</span>
              <h2 className="text-white text-4xl font-serif leading-tight">Curated By <br/><span className="italic text-white/40">Experts</span></h2>
            </div>
            <div className="space-y-6">
              {[
                { name: "Chef Rajat", role: "Tandoor", img: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=100" },
                { name: "Chef Lin", role: "Wok Specialist", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=100" }
              ].map(chef => (
                <div key={chef.name} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/50 group-hover:border-primary transition-all">
                    <img src={chef.img} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-serif">{chef.name}</p>
                    <p className="text-white/30 text-[9px] uppercase tracking-widest">{chef.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PREVIOUS UI: PARALLAX ROWS */}
          <div className="lg:col-span-9 space-y-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-[1px] bg-primary/40" />
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Spicy Darbar</span>
              </div>
              <motion.div style={{ x: smoothRow1 }} className="flex gap-6">
                {DISHES_ROW_1.map(dish => <DishCard key={dish.id} dish={dish} />)}
              </motion.div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Chinese & Fusion</span>
                <div className="w-8 h-[1px] bg-primary/40" />
              </div>
              <motion.div style={{ x: smoothRow2 }} className="flex gap-6">
                {DISHES_ROW_2.map(dish => <DishCard key={dish.id} dish={dish} />)}
              </motion.div>
            </div>

            {/* EXPANDABLE GRID WITH PAGINATION */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  className="pt-20 space-y-10 border-t border-white/5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-serif text-white italic">Manual Exploration</h3>
                    <div className="flex items-center gap-4">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 border border-white/10 text-white disabled:opacity-20 hover:bg-primary hover:text-black transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{currentPage} / {totalPages}</span>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 border border-white/10 text-white disabled:opacity-20 hover:bg-primary hover:text-black transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {currentItems.map(dish => (
                      <motion.div key={dish.id} layout className="bg-white/5 p-4 border border-white/5 flex flex-col">
                        <img src={dish.img} className="aspect-square object-cover mb-4 grayscale-[0.5]" alt="" />
                        <h4 className="text-white font-serif text-lg mb-1">{dish.name}</h4>
                        <p className="text-primary text-sm font-serif mb-4">{dish.price}</p>
                        <Button size="sm" variant="outline" className="rounded-none border-white/10 text-[9px] uppercase tracking-widest group">
                          View Details <ArrowUpRight className="ml-2 w-3 h-3 group-hover:translate-x-1" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* TOGGLE BUTTON */}
        <div className="mt-20 flex flex-col items-center">
          <div className="h-16 w-[1px] bg-gradient-to-b from-primary/50 to-transparent mb-8" />
          <Button 
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            className="rounded-none border-primary/20 bg-transparent text-white hover:bg-primary hover:text-black transition-all h-14 px-12 text-[10px] font-bold uppercase tracking-widest"
          >
            {isExpanded ? "Close Explorer" : "Explore Full Menu Details"}
          </Button>
        </div>
      </div>
    </section>
  );
}