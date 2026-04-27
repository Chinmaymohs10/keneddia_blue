import { useRef, useState, useEffect, useMemo } from "react";
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
  ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMenuItemsByPropertyId,
  getMenuHeaders,
  createJoiningUs,
  getAllMenuThumbnails
} from "@/Api/RestaurantApi";

export default function CafeSignatureDrinks({ propertyId, propertyType, verticalId }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [menuHeader, setMenuHeader] = useState(null);
  const [fetchedThumbnails, setFetchedThumbnails] = useState([]);

  const [formData, setFormData] = useState({
    guestName: "",
    contactNumber: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    totalGuest: "2",
  });
  const scrollRef = useRef(null);

  // ── Fetch Data ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);

    Promise.all([
      getMenuItemsByPropertyId(propertyId),
      getMenuHeaders()
    ])
      .then(([itemsRes, headersRes]) => {
        // Items
        const allItems = itemsRes?.data || [];
        setMenuItems(allItems.filter((i) => i.isActive !== false));

        // Header
        const allHeaders = headersRes?.data || [];
        const matchedHeader = allHeaders
          .filter((h) => Number(h.propertyId) === Number(propertyId) && h.isActive)
          .sort((a, b) => b.id - a.id)[0];
        if (matchedHeader) {
          setMenuHeader({
            part1: matchedHeader.part1 || "The",
            part2: matchedHeader.part2 || "Menu",
            description: matchedHeader.description || "",
          });
        }
      })
      .catch((err) => console.error("CafeSignatureDrinks fetch error:", err))
      .finally(() => setLoading(false));
  }, [propertyId]);

  // ── Fetch Menu Thumbnails ────────────────────────────────────────────────
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        const res = await getAllMenuThumbnails();
        const data = res?.data || [];
        const active = Array.isArray(data) ? data.filter((t) => t.active === true) : [];
        setFetchedThumbnails(active);
      } catch (err) {
        console.error("Failed to fetch menu thumbnails:", err);
      }
    })();
  }, [propertyId]);

  // ── Group menu by category ───────────────────────────────────────────────
  const groupedMenu = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      const catName = item.itemCategory?.categoryName || "Signature";
      if (!map[catName]) {
        map[catName] = {
          category: catName,
          categoryId: item.itemCategory?.id || null,
          categoryImage: item.media?.url || item.image?.url || "",
          items: [],
        };
      }
      map[catName].items.push({
        id: item.id,
        name: item.itemName,
        description: item.description || "",
        image: item.media?.url || item.image?.url || "",
        foodType: item.foodType,
        price: item.price ? `₹${item.price}` : null,
        isSpicy: item.isSpicy,
      });
    });
    return Object.values(map);
  }, [menuItems]);

  useEffect(() => {
    if (groupedMenu.length > 0 && activeTab >= groupedMenu.length) {
      setActiveTab(0);
    }
  }, [groupedMenu, activeTab]);

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
    if (activeTab < groupedMenu.length - 1) handleTabClick(activeTab + 1);
  };

  const openReserve = (item = null) => {
    const category = groupedMenu[activeTab]?.category || "General";
    setSelectedItem(
      item ?? { name: "Table Reservation", category: category },
    );
    setShowModal(true);
  };

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!formData.guestName || !formData.contactNumber) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setIsSubmitting(true);
    try {
      const category = groupedMenu[activeTab]?.category || "General";
      const itemType = selectedItem?.name || "Table Reservation";

      await createJoiningUs({
        guestName: formData.guestName.trim(),
        contactNumber: formData.contactNumber.trim(),
        date: formData.date,
        time: formData.time,
        totalGuest: Number(formData.totalGuest),
        propertyId: propertyId,
        description: `Request: ${itemType} | Category: ${category}`,
      });
      toast.success("Reservation request sent!");
      setShowModal(false);
      setFormData({
        guestName: "",
        contactNumber: "",
        date: new Date().toISOString().split("T")[0],
        time: "19:00",
        totalGuest: "2",
      });
    } catch (error) {
      console.error("Reservation submission failed:", error);
      toast.error("Failed to submit reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm font-medium">Brewing the menu...</p>
      </div>
    );
  }

  if (groupedMenu.length === 0) {
    return null; // Don't show if no items
  }

  const activeSection = groupedMenu[activeTab];

  // ── Thumbnail matching logic from CategoryMenu ──────────────────────────
  const getDisplayThumbs = (section) => {
    if (!section) return [];

    const sectionTypeId = section.categoryId;
    const itemCount = section.items?.length || 0;
    const thumbsNeeded = Math.ceil(itemCount / 4); // Cafe uses 4 per thumb grid

    // Filter thumbnails by propertyId (Cafes don't have verticals)
    const propertyThumbs = fetchedThumbnails.filter(
      (t) => Number(t.propertyId) === Number(propertyId),
    );

    // Nothing for this property — show nothing
    if (!propertyThumbs.length) return [];

    // Prefer type-specific match within the property
    const typeMatched = sectionTypeId !== null
      ? propertyThumbs.filter((t) => Number(t.itemTypeId) === Number(sectionTypeId))
      : [];

    const pool = typeMatched.length > 0 ? typeMatched : propertyThumbs;

    // Cycle through pool to fill thumbsNeeded slots
    const result = [];
    for (let i = 0; i < thumbsNeeded; i++) {
      result.push(pool[i % pool.length]);
    }
    return result;
  };

  const displayThumbs = getDisplayThumbs(activeSection);

  return (
    <section
      id="menu"
      className="py-16 bg-[#EFEFEB] dark:bg-[#050505] transition-colors duration-500"
    >
      <div className="container mx-auto px-6 max-w-[1200px]">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-serif dark:text-white">
              {menuHeader?.part1 || "The"}{" "}
              <span className="italic text-primary">{menuHeader?.part2 || "Menu"}</span>
            </h2>
          </div>

          <div className="flex flex-row-reverse items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={activeTab === 0}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 dark:text-white" />
              </button>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {activeTab + 1} / {groupedMenu.length}
              </div>
              <button
                onClick={handleNext}
                disabled={activeTab === groupedMenu.length - 1}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            <button
              onClick={() => openReserve()}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none cursor-pointer"
            >
              <CalendarCheck size={14} /> Reserve Now
            </button>
          </div>
        </div>

        {/* ── TAB SCROLLER ─────────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-8 snap-x no-scrollbar"
        >
          {groupedMenu.map((section, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleTabClick(idx)}
              className={`relative shrink-0 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all snap-center cursor-pointer ${activeTab === idx
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
                {displayThumbs.map((thumb, i) => {
                  const url = thumb.media?.url;
                  const vid = thumb.media?.type === "VIDEO";
                  return (
                    <div
                      key={i}
                      className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900"
                    >
                      {vid ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={url || thumb.imageUrl}
                          alt={thumb.tag || thumb.label}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">
                          {thumb.tag || "Featured"}
                        </p>
                        <h3 className="text-2xl font-serif uppercase tracking-tight line-clamp-1">
                          {activeSection.category}
                        </h3>
                      </div>
                    </div>
                  );
                })}
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

                  <div className="flex-1 border-b border-zinc-100 dark:border-white/5 pb-4 group-last:border-none text-left">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <Input
                        value={formData.guestName}
                        onChange={(e) => setField("guestName", e.target.value)}
                        placeholder="Full Name"
                        className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <Input
                        type="tel"
                        maxLength={10}
                        value={formData.contactNumber}
                        onChange={(e) =>
                          setField("contactNumber", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="10-digit number"
                        className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
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

                  <div className="space-y-1 text-left">
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

                  <div className="space-y-1 col-span-2 text-left">
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

                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-left">
                  <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    Requesting <b>{selectedItem?.name}</b> for{" "}
                    <b>{formData.totalGuest} guests</b> at{" "}
                    <b>{formData.time}</b>.
                  </p>
                </div>

                <Button
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full h-11 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 cursor-pointer"
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
