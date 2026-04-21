import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  Phone,
  Send,
  User,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteContent } from "@/data/siteContent";

const MENU = [
  {
    category: "Brews",
    categoryImage: siteContent.images.cafes.minimalist.src,
    items: [
      {
        id: 1,
        name: "Single Origin Pour-Over",
        description:
          "Hand-poured through a single filter, this brew highlights the natural clarity and fruit tones of its origin bean.",
        image: siteContent.images.cafes.minimalist.src,
        foodType: "VEG",
        price: "₹280",
      },
      {
        id: 2,
        name: "Iced Matcha Latte",
        description:
          "Ceremonial-grade matcha whisked into cold oat milk for a smooth, grassy, and lightly sweet glass.",
        image: siteContent.images.cafes.library.src,
        foodType: "VEG",
        price: "₹320",
      },
      {
        id: 3,
        name: "Classic Cold Brew",
        description:
          "Slow-steeped overnight for 18 hours. Low acid, high clarity, cocoa and malt undertones.",
        image: siteContent.images.cafes.garden.src,
        foodType: "VEG",
        price: "₹260",
      },
      {
        id: 4,
        name: "Hazelnut Cappuccino",
        description:
          "Toasted nut sweetness folded into velvet milk foam and a warm aromatic espresso base.",
        image: siteContent.images.cafes.parisian.src,
        foodType: "VEG",
        price: "₹240",
      },
      {
        id: 5,
        name: "Espresso Tonic",
        description:
          "Bright tonic sparkle, fresh espresso, and a citrus wedge — a sharper modern coffee serve.",
        image: siteContent.images.cafes.highTea.src,
        foodType: "VEG",
        price: "₹220",
      },
      {
        id: 6,
        name: "Salted Caramel Frappe",
        description:
          "Blended coffee, cream, and caramel in a frozen profile made for long slow cafe hours.",
        image: siteContent.images.cafes.bakery.src,
        foodType: "VEG",
        price: "₹300",
      },
    ],
  },
  {
    category: "Bites",
    categoryImage: siteContent.images.cafes.highTea.src,
    items: [
      {
        id: 7,
        name: "Avocado Toast & Poached Egg",
        description:
          "Thick-cut sourdough, smashed avocado, two poached eggs, chilli flakes, and a drizzle of herb oil.",
        image: siteContent.images.cafes.minimalist.src,
        foodType: "VEG",
        price: "₹380",
      },
      {
        id: 8,
        name: "High Tea Platter for Two",
        description:
          "A tiered selection of finger sandwiches, petit fours, scones, and seasonal preserves.",
        image: siteContent.images.cafes.highTea.src,
        foodType: "VEG",
        price: "₹680",
      },
      {
        id: 9,
        name: "Garden Brunch Board",
        description:
          "Cold cuts, artisan cheeses, seasonal fruit, house hummus, and warm flatbread on a sharing board.",
        image: siteContent.images.cafes.garden.src,
        foodType: "NON_VEG",
        price: "₹580",
      },
      {
        id: 10,
        name: "Smashed Banana Pancakes",
        description:
          "Fluffy banana pancakes topped with honey yoghurt, toasted granola, and a cocoa dust finish.",
        image: siteContent.images.cafes.library.src,
        foodType: "VEG",
        price: "₹320",
      },
      {
        id: 11,
        name: "Chicken Tikka Bruschetta",
        description:
          "Tandoor-spiced chicken tikka on toasted sourdough with mint chutney, pickled onion, and cheddar melt.",
        image: siteContent.images.cafes.parisian.src,
        foodType: "NON_VEG",
        price: "₹360",
        isSpicy: true,
      },
      {
        id: 12,
        name: "Pulled Lamb Slider",
        description:
          "Slow-braised lamb with harissa mayo, pickled cucumber, and sesame brioche — a bold two-bite serve.",
        image: siteContent.images.cafes.bakery.src,
        foodType: "NON_VEG",
        price: "₹420",
        isSpicy: true,
      },
    ],
  },
  {
    category: "Bakes",
    categoryImage: siteContent.images.cafes.parisian.src,
    items: [
      {
        id: 13,
        name: "Croissant & Jam",
        description:
          "Freshly baked butter croissant served warm with house-made seasonal jam and French-style cultured butter.",
        image: siteContent.images.cafes.parisian.src,
        foodType: "VEG",
        price: "₹180",
      },
      {
        id: 14,
        name: "Belgian Waffle Stack",
        description:
          "Crisp on the outside, fluffy inside, topped with mascarpone, berries, and maple drizzle.",
        image: siteContent.images.cafes.bakery.src,
        foodType: "VEG",
        price: "₹340",
      },
      {
        id: 15,
        name: "Almond Danish",
        description:
          "Flaky laminated dough filled with almond cream, glazed with apricot and toasted flaked almonds.",
        image: siteContent.images.cafes.minimalist.src,
        foodType: "VEG",
        price: "₹200",
      },
      {
        id: 16,
        name: "Sourdough Loaf",
        description:
          "Long-fermented sourdough with a deep crust and open crumb, baked fresh every morning from 5 AM.",
        image: siteContent.images.cafes.library.src,
        foodType: "VEG",
        price: "₹260",
      },
      {
        id: 17,
        name: "Cinnamon Scroll",
        description:
          "Soft enriched dough rolled with cinnamon butter and brown sugar, finished with a cream cheese glaze.",
        image: siteContent.images.cafes.garden.src,
        foodType: "VEG",
        price: "₹220",
      },
    ],
  },
];

export default function CafeSignatureDrinks() {
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    totalGuest: "2",
  });
  const scrollRef = useRef(null);

  const handleTabClick = (idx) => {
    setActiveTab(idx);
    const container = scrollRef.current;
    if (container) {
      const tab = container.children[idx];
      if (tab) {
        container.scrollTo({
          left: tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  };

  const handlePrev = () => {
    if (activeTab > 0) handleTabClick(activeTab - 1);
  };

  const handleNext = () => {
    if (activeTab < MENU.length - 1) handleTabClick(activeTab + 1);
  };

  const openReserve = (item = null) => {
    setSelectedItem(
      item ?? { name: "Table Reservation", category: MENU[activeTab].category },
    );
    setShowModal(true);
  };

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Reservation request sent!");
      setShowModal(false);
      setFormData({
        name: "",
        phone: "",
        date: new Date().toISOString().split("T")[0],
        time: "19:00",
        totalGuest: "2",
      });
      setIsSubmitting(false);
    }, 600);
  };

  const activeSection = MENU[activeTab];

  // 1 thumbnail per 4 items — first uses categoryImage, rest use every 4th item's image
  const getThumbnails = (section) => {
    const count = Math.ceil(section.items.length / 4);
    return Array.from({ length: count }, (_, i) => ({
      image: i === 0 ? section.categoryImage : (section.items[i * 4 - 1]?.image ?? section.categoryImage),
      label: i === 0 ? section.category : section.items[i * 4 - 1]?.name ?? section.category,
    }));
  };

  const thumbnails = getThumbnails(activeSection);

  return (
    <section
      id="menu"
      className="py-16 bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      <div className="container mx-auto px-6 max-w-[1200px]">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-serif dark:text-white">
              The <span className="italic text-primary">Menu</span>
            </h2>
          </div>

          <div className="flex flex-row-reverse items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={activeTab === 0}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <ChevronLeft className="w-5 h-5 dark:text-white" />
              </button>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {activeTab + 1} / {MENU.length}
              </div>
              <button
                onClick={handleNext}
                disabled={activeTab === MENU.length - 1}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <ChevronRight className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            <button
              onClick={() => openReserve()}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              <CalendarCheck size={14} /> Reserve Now
            </button>
          </div>
        </div>

        {/* ── TAB SCROLLER ─────────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-8 snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {MENU.map((section, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleTabClick(idx)}
              className={`relative shrink-0 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all snap-center ${
                activeTab === idx
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-primary/50 dark:text-zinc-400"
              }`}
            >
              {section.category}
            </motion.button>
          ))}
        </div>

        {/* ── CONTENT AREA ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid lg:grid-cols-12 gap-8 items-start"
          >
            {/* LEFT: thumbnails — 1 per 4 items */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="space-y-4">
                {thumbnails.map((thumb, i) => (
                  <div
                    key={i}
                    className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-white/5 bg-black"
                  >
                    <img
                      src={thumb.image}
                      alt={thumb.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">
                        {i === 0 ? "Featured" : `Items ${i * 4 + 1}–${Math.min((i + 1) * 4, activeSection.items.length)}`}
                      </p>
                      <h3 className="text-2xl font-serif uppercase tracking-tight line-clamp-1">
                        {i === 0 ? activeSection.category : thumb.label}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: item list */}
            <div className="lg:col-span-7 space-y-2">
              {activeSection.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-start gap-5 p-4 rounded-2xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <Utensils size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 border-b border-zinc-100 dark:border-white/5 pb-4 group-last:border-none">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                          {item.name}
                        </h4>

                        {item.foodType === "VEG" && (
                          <span className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center shrink-0">
                            <span className="w-2 h-2 rounded-full bg-green-600 block" />
                          </span>
                        )}
                        {item.foodType === "NON_VEG" && (
                          <span className="w-3.5 h-3.5 border border-red-600 flex items-center justify-center shrink-0">
                            <span className="w-2 h-2 rounded-full bg-red-600 block" />
                          </span>
                        )}
                        {item.isSpicy && (
                          <Flame size={14} className="text-red-500 fill-red-500" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {item.price && (
                      <p className="text-xs font-bold text-primary mt-1">
                        {item.price}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── RESERVE MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-4xl overflow-hidden shadow-2xl relative border border-zinc-100 dark:border-white/5"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <CalendarCheck size={18} />
                  </div>
                  <h3 className="font-serif text-xl dark:text-white">
                    {selectedItem?.name?.includes("Table")
                      ? "Reservation"
                      : `Reserve for: ${selectedItem?.name}`}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <Input
                        value={formData.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Full Name"
                        className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <Input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) =>
                          setField("phone", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="10-digit number"
                        className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setField("date", e.target.value)}
                      className="h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Arrival Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setField("time", e.target.value)}
                      className="h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Total Guests <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={formData.totalGuest}
                      onChange={(e) => setField("totalGuest", e.target.value)}
                      className="h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    Requesting <b>{selectedItem?.name}</b> for{" "}
                    <b>{formData.totalGuest} guests</b> at{" "}
                    <b>{formData.time}</b>.
                  </p>
                </div>

                <Button
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full h-11 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Confirm Reservation{" "}
                      <Send size={14} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
