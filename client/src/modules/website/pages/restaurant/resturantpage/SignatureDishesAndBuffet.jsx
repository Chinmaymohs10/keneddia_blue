import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  UtensilsCrossed,
  Heart,
  ChefHat,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResturantpageOffers from "./ResturantpageOffers";

// --- Data ---
const BUFFET_DATA = [
  {
    id: "b1",
    name: "Royal Lunch",
    tag: "STUDENT SPECIAL",
    tagColor: "#e67e22",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200",
    remark: "Show your Student ID and enjoy the unlimited buffet.",
    bg: "#fdf2f2",
  },
  {
    id: "b2",
    name: "Grand Dinner",
    tag: "WEEKEND SPECIAL",
    tagColor: "#2ecc71",
    img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1200",
    remark: "Applewood smoked grills and coastal curries.",
    bg: "#f0fdf4",
  },
  {
    id: "b3",
    name: "Sunday Brunch",
    tag: "BOTTOMLESS BRUNCH",
    tagColor: "#8e44ad",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200",
    remark: "Live pasta stations and bottomless prosecco.",
    bg: "#f5f3ff",
  },
];

const SIGNATURE_DATA = [
  {
    id: "s1",
    name: "Butter Chicken",
    cuisine: "North Indian",
    description:
      "Our legendary cream-based curry with succulent clay-oven grilled chicken pieces.",
    img: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=800",
    likes: 1240,
  },
  {
    id: "s2",
    name: "Tandoori Jhinga",
    cuisine: "Coastal Tandoor",
    description:
      "Jumbo prawns marinated in a secret coastal spice mix and charred to perfection.",
    img: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=800",
    likes: 850,
  },
  {
    id: "s3",
    name: "Truffle Dim Sum",
    cuisine: "Asian Fusion",
    description:
      "Hand-rolled translucent dumplings infused with aromatic black truffle oil.",
    img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=800",
    likes: 2100,
  },
  {
    id: "s4",
    name: "Szechuan Prawns",
    cuisine: "Szechuan",
    description:
      "Fiery wok-tossed prawns glazed in a bold and spicy authentic Szechuan pepper sauce.",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    likes: 1800,
  },
];

// ─── BUFFET CAROUSEL (Reduced Image Size & Centered) ──────────────────────────
function BuffetCarousel({ onBook }) {
  const [active, setActive] = useState(0);
  const total = BUFFET_DATA.length;
  const next = () => setActive((a) => (a + 1) % total);
  const prev = () => setActive((a) => (a - 1 + total) % total);

  const positionStyles = {
    center: { zIndex: 30, scale: 1, x: "0%", opacity: 1 },
    left: { zIndex: 10, scale: 0.9, x: "-25%", opacity: 0.2 },
    right: { zIndex: 10, scale: 0.9, x: "25%", opacity: 0.2 },
    hidden: { zIndex: 0, scale: 0.7, opacity: 0 },
  };

  return (
    <div className="relative w-full h-[400px] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="hidden md:block relative w-full h-full">
          {BUFFET_DATA.map((item, idx) => {
            const pos =
              idx === active
                ? "center"
                : idx === (active - 1 + total) % total
                  ? "left"
                  : idx === (active + 1) % total
                    ? "right"
                    : "hidden";
            return (
              <motion.div
                key={item.id}
                animate={positionStyles[pos]}
                transition={{ duration: 0.6 }}
                // Decreased width to ~55% of container for centered compact look
                className={`absolute inset-0 m-auto w-[55%] h-[85%] rounded-[32px] overflow-hidden shadow-xl border border-white/20 backdrop-blur-md ${pos === "center" ? "pointer-events-auto" : "pointer-events-none"}`}
              >
                <img
                  src={item.img}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-left">
                  <span
                    className="w-fit px-3 py-1 rounded-full text-white text-[9px] font-black uppercase mb-3"
                    style={{ backgroundColor: item.tagColor }}
                  >
                    {item.tag}
                  </span>
                  <h3 className="text-white font-serif text-2xl mb-1">
                    {item.name}
                  </h3>
                  <p className="text-white/70 text-sm italic mb-4 line-clamp-1">
                    {item.remark}
                  </p>
                  <button
                    onClick={() => onBook(item)}
                    className="w-fit py-2 px-6 rounded-full text-white text-[10px] font-black uppercase bg-primary"
                  >
                    Book Unlimited
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        {/* Mobile: Row Cards on click popup */}
        <div className="md:hidden w-full space-y-3 px-2">
          {BUFFET_DATA.map((item) => (
            <div
              key={item.id}
              onClick={() => onBook(item)}
              className="p-4 rounded-xl flex items-center justify-between shadow-sm border border-zinc-100"
              style={{ background: item.bg }}
            >
              <div className="text-left">
                <p className="text-[8px] text-zinc-400 uppercase font-black mb-0.5">
                  {item.tag}
                </p>
                <h4 className="font-serif text-base font-bold text-zinc-900">
                  {item.name}
                </h4>
              </div>
              <ChevronRight className="text-zinc-400" size={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(Math.floor(target * 0.8));
  useEffect(() => {
    let start = count;
    const increment = (target - start) / 125;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}</span>;
}

export default function EnhancedCulinaryCuration() {
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    item: null,
  });

  return (
    <div className="bg-white dark:bg-[#050505] transition-colors duration-500 pb-10">
      <section className="pt-20 pb-12 border-b border-zinc-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-left">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            <div className="lg:w-[70%] flex flex-col pt-4">
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
                  Buffet <span className="italic text-primary">Selection</span>
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light tracking-wide truncate">
                  Explore international delicacies curated for every occasion.
                </p>
              </div>
              <BuffetCarousel
                onBook={(item) => setBookingModal({ isOpen: true, item })}
              />
            </div>
            <div className="lg:w-[30%] bg-zinc-50/50 dark:bg-white/[0.02] rounded-[40px] p-8 border border-zinc-100 dark:border-white/5">
              <ResturantpageOffers />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE DISHES (Compact Card & Likes Only) */}
      <section className="pt-16 pb-2">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-left">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
                Signature{" "}
                <span className="italic text-primary">Masterpieces</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
                Handcrafted masterpieces using premium ingredients and
                traditional techniques.
              </p>
            </div>
            {/* Chef Spotlight */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-5 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-primary/10 max-w-lg shadow-sm"
            >
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=200"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  alt="Chef"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-full border-2 border-white dark:border-zinc-900">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Quote className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-[10px] font-bold dark:text-zinc-400 uppercase tracking-widest">
                    Chef's Remark
                  </span>
                </div>
                <p className="text-sm italic dark:text-zinc-200 leading-snug">
                  "We don't just serve food; we serve memories crafted with
                  heritage spices."
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 pt-10">
            {SIGNATURE_DATA.map((item) => (
              <React.Fragment key={item.id}>
                {/* Desktop: Compact Square Card with no Book button */}
                <div className="hidden md:flex group relative bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 flex-col items-center text-center">
                  <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl -mt-24 mb-2 transition-transform duration-700 group-hover:scale-105">
                    <img
                      src={item.img}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col w-full items-center">
                    <h3 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-zinc-500 text-[13px] leading-snug line-clamp-2 italic mb-3">
                      "{item.description}"
                    </p>
                    {/* Like Counter */}
                    <div className="flex items-center justify-center gap-1.5 text-primary">
                      <Heart size={14} className="fill-primary" />
                      <span className="text-sm font-black">
                        <AnimatedCounter target={item.likes} />+
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile: Row card (Logo | Name | Like) */}
                <div className="md:hidden flex items-center gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
                    <img
                      src={item.img}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg font-bold text-zinc-900">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1 text-primary mt-1">
                      <Heart size={12} className="fill-primary" />
                      <span className="text-sm font-black">
                        <AnimatedCounter target={item.likes} />+
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {bookingModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative text-left"
            >
              <button
                onClick={() => setBookingModal({ isOpen: false, item: null })}
                className="absolute top-6 right-6 p-2 text-zinc-400"
              >
                <X />
              </button>
              <h3 className="text-2xl font-serif mb-6 dark:text-white">
                Reserve {bookingModal.item?.name}
              </h3>
              <div className="space-y-4">
                <Input
                  placeholder="Your Name"
                  className="h-14 rounded-2xl bg-zinc-50 border-none"
                />
                <Input
                  placeholder="Phone Number"
                  className="h-14 rounded-2xl bg-zinc-50 border-none"
                />
                <Button className="w-full h-14 bg-primary rounded-2xl font-black uppercase shadow-lg">
                  Confirm Request
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
