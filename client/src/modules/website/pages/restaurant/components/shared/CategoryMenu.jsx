import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Utensils,
  ShoppingBag,
  X,
  User,
  Phone,
  Send,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { createJoiningUs, getAllMenuThumbnails } from "@/Api/RestaurantApi";
import { validateName, validatePhone, validateDate, validateTime, validateGuests } from "@/lib/validation/reservationValidation";

export default function CategoryMenu({
  menu,
  themeColor,
  propertyId,
  verticalId,          // ← NEW: pass currentCategory.id from parent
  showOrderButton = false,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [thumbnails, setThumbnails] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    totalGuest: "2",
  });

  // ── Fetch thumbnails — keep all active ones, filter by verticalId at match time ──
  useEffect(() => {
    if (!propertyId) {
      console.warn("[CategoryMenu] ⚠️ No propertyId — skipping thumbnail fetch");
      return;
    }
    console.log("[CategoryMenu] 🔍 Fetching thumbnails for propertyId:", propertyId, "| verticalId:", verticalId);
    (async () => {
      try {
        const res = await getAllMenuThumbnails(propertyId);
        console.log("[CategoryMenu] 📦 Raw API response:", res);
        const data = res?.data || [];
        console.log("[CategoryMenu] 📋 Total records in data:", data.length);
        const active = Array.isArray(data) ? data.filter((t) => t.active === true) : [];
        console.log("[CategoryMenu] ✅ Active thumbnails:", active.length, active);
        setThumbnails(active);
      } catch (err) {
        console.error("[CategoryMenu] ❌ Thumbnail fetch error:", err);
      }
    })();
  }, [propertyId]);

  // ── Thumbnail matching — mirrors CafeSignatureDrinks.getDisplayThumbs ──────
  const getThumbsForTab = (tabIndex) => {
    const section = menu[tabIndex];
    if (!section) return [];

    const sectionTypeId = section.itemTypeId ?? section.items?.[0]?.typeId ?? null;
    const itemCount = section.items?.length || 0;
    const thumbsNeeded = Math.ceil(itemCount / 3);

    console.log(`[CategoryMenu] 🗂️ Tab[${tabIndex}] "${section.category}" | itemCount:${itemCount} | thumbsNeeded:${thumbsNeeded} | sectionTypeId:${sectionTypeId}`);
    console.log(`[CategoryMenu] 🗃️ All thumbnails in state (${thumbnails.length}):`, thumbnails);

    // Prefer vertical-scoped match, fall back to property-level
    const verticalThumbs = verticalId
      ? thumbnails.filter(
          (t) =>
            Number(t.verticalCardResponseDTO?.id ?? t.verticalCardId) ===
            Number(verticalId),
        )
      : [];

    console.log(`[CategoryMenu] 🎯 verticalId:${verticalId} → verticalThumbs matched:`, verticalThumbs.length, verticalThumbs);

    const propertyThumbs = thumbnails.filter(
      (t) =>
        Number(t.propertyId ?? t.propertyResponseDTO?.id) === Number(propertyId),
    );

    console.log(`[CategoryMenu] 🏠 propertyId:${propertyId} → propertyThumbs matched:`, propertyThumbs.length, propertyThumbs);

    const scopedThumbs = verticalThumbs.length > 0 ? verticalThumbs : propertyThumbs;
    console.log(`[CategoryMenu] 📌 Using scope: ${verticalThumbs.length > 0 ? "VERTICAL" : "PROPERTY"} (${scopedThumbs.length} thumbs)`);

    if (!scopedThumbs.length) {
      console.warn("[CategoryMenu] ⚠️ No scoped thumbnails found — left column will be hidden");
      return [];
    }

    // Prefer type-specific match within the scope
    const typeMatched =
      sectionTypeId !== null
        ? scopedThumbs.filter(
            (t) => Number(t.itemTypeId) === Number(sectionTypeId),
          )
        : [];

    console.log(`[CategoryMenu] 🔎 typeMatched (itemTypeId=${sectionTypeId}):`, typeMatched.length);

    const pool = typeMatched.length > 0 ? typeMatched : scopedThumbs;
    console.log(`[CategoryMenu] 🎲 Final pool size: ${pool.length} | thumbsNeeded: ${thumbsNeeded}`);

    const result = [];
    for (let i = 0; i < thumbsNeeded; i++) {
      result.push(pool[i % pool.length]);
    }
    console.log(`[CategoryMenu] 🖼️ Returning ${result.length} thumbnail(s):`, result);
    return result;
  };

  // ── Tab navigation ────────────────────────────────────────────────────────
  const handleTabClick = (idx) => {
    setActiveTab(idx);
    scrollToTab(idx);
  };

  const handleNext = () => {
    if (activeTab < menu.length - 1) {
      setActiveTab((p) => p + 1);
      scrollToTab(activeTab + 1);
    }
  };

  const handlePrev = () => {
    if (activeTab > 0) {
      setActiveTab((p) => p - 1);
      scrollToTab(activeTab - 1);
    }
  };

  const scrollToTab = (index) => {
    const container = scrollContainerRef.current;
    if (container) {
      const tab = container.children[index];
      if (tab) {
        container.scrollTo({
          left:
            tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  };

  // ── Order / Reserve ───────────────────────────────────────────────────────
  const handleOrderClick = (item) => {
    setSelectedItem(item);
    setShowOrderModal(true);
  };

  const handleReserveClick = () => {
    setSelectedItem({
      name: "Table Reservation",
      category: menu[activeTab]?.category,
    });
    setShowOrderModal(true);
  };

  const setModalField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleFinalSubmit = async () => {
    const errs = {};
    const nameErr = validateName(formData.name);
    if (nameErr) errs.name = nameErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errs.phone = phoneErr;
    const dateErr = validateDate(formData.date);
    if (dateErr) errs.date = dateErr;
    const timeErr = validateTime(formData.time);
    if (timeErr) errs.time = timeErr;
    const guestErr = validateGuests(formData.totalGuest);
    if (guestErr) errs.totalGuest = guestErr;
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const currentCategory = menu[activeTab]?.category || "General";
      const itemType = selectedItem?.name || "Table Reservation";

      const payload = {
        guestName: formData.name.trim(),
        contactNumber: formData.phone.trim(),
        date: formData.date,
        time: formData.time,
        totalGuest: Number(formData.totalGuest),
        propertyId: propertyId,
        description: `Category: ${currentCategory} | Request: ${itemType}`,
      };

      await createJoiningUs(payload);
      toast.success("Request sent successfully!");
      setShowOrderModal(false);
      setFormErrors({});
      setFormData({
        name: "",
        phone: "",
        date: new Date().toISOString().split("T")[0],
        time: "19:00",
        totalGuest: "2",
      });
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayThumbs = getThumbsForTab(activeTab);

  return (
    <section
      id="menu"
      className="py-16 bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      <div className="container mx-auto px-6 max-w-[1200px]">
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-serif dark:text-white">
              The <span className="italic text-primary">Selection</span>
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

            <button
              onClick={handleReserveClick}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              <CalendarCheck size={14} /> Reserve Now
            </button>
          </div>
        </div>

        {/* ── TAB SCROLLER ───────────────────────────────────────────────── */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-8 snap-x"
        >
          {menu.map((section, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleTabClick(idx)}
              className={`relative flex-shrink-0 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all snap-center
                ${
                  activeTab === idx
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-primary/50"
                }`}
            >
              {section.category}
            </motion.button>
          ))}
        </div>

        {/* ── CONTENT AREA ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid lg:grid-cols-12 gap-8 items-start"
          >
            {/* ── LEFT: THUMBNAIL COLUMN — only when real thumbnails exist ── */}
            {displayThumbs.length > 0 && (
              <div className="lg:col-span-5 hidden lg:block">
                <div className="space-y-4">
                  {displayThumbs.map((thumb, i) => {
                    const url = thumb.media?.url;
                    const vid = thumb.media?.type === "VIDEO";
                    return (
                      <div
                        key={i}
                        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900"
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
                            src={url}
                            alt={thumb.tag}
                            className="w-full h-full object-cover"
                          />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        <div className="absolute bottom-6 left-6 text-white">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">
                            {thumb.tag || "Featured"}
                          </p>
                          <h3 className="text-2xl font-serif uppercase tracking-tight">
                            {menu[activeTab]?.category}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── RIGHT: ITEM LIST — full width when no thumbnails ── */}
            <div className={displayThumbs.length > 0 ? "lg:col-span-7 space-y-2" : "lg:col-span-12 space-y-2"}>
              {menu[activeTab].items.map((item, i) => (
                <motion.div
                  key={item.id ?? i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-start gap-5 p-4 rounded-2xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {item.image ? (
                      <img
                        src={item.image}
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                        alt={item.name}
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

                        {item.signatureItem && (
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                            ★ Signature
                          </span>
                        )}
                      </div>

                      {showOrderButton && (
                        <button
                          onClick={() => handleOrderClick(item)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shrink-0"
                        >
                          <ShoppingBag size={12} /> Order
                        </button>
                      )}
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

      {/* ── ORDER / RESERVE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative border border-zinc-100 dark:border-white/5"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {selectedItem?.name?.includes("Table") ? (
                      <CalendarCheck size={18} />
                    ) : (
                      <ShoppingBag size={18} />
                    )}
                  </div>
                  <h3 className="font-serif text-xl dark:text-white">
                    {selectedItem?.name?.includes("Table")
                      ? "Reservation"
                      : `Order: ${selectedItem?.name}`}
                  </h3>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-[10px] text-zinc-400">
                  Fields marked <span className="text-red-500 font-bold">*</span> are required.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Full Name <span className="text-red-500">*</span>
                      <span className="ml-1 font-normal normal-case tracking-normal text-zinc-400">(letters only)</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <Input
                        value={formData.name}
                        onChange={(e) => setModalField("name", e.target.value)}
                        placeholder="Full Name"
                        className={`pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl ${formErrors.name ? "border-red-500" : "border-none"}`}
                      />
                    </div>
                    {formErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Phone <span className="text-red-500">*</span>
                      <span className="ml-1 font-normal normal-case tracking-normal text-zinc-400">(10 digits)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <Input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setModalField("phone", e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit number"
                        className={`pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl ${formErrors.phone ? "border-red-500" : "border-none"}`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setModalField("date", e.target.value)}
                      className={`h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl ${formErrors.date ? "border-red-500" : "border-none"}`}
                    />
                    {formErrors.date && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.date}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Arrival Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setModalField("time", e.target.value)}
                      className={`h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl ${formErrors.time ? "border-red-500" : "border-none"}`}
                    />
                    {formErrors.time && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.time}</p>}
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                      Total Guests <span className="text-red-500">*</span>
                      <span className="ml-1 font-normal normal-case tracking-normal text-zinc-400">(min 1)</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={formData.totalGuest}
                      onChange={(e) => setModalField("totalGuest", e.target.value)}
                      className={`h-11 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl ${formErrors.totalGuest ? "border-red-500" : "border-none"}`}
                    />
                    {formErrors.totalGuest && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.totalGuest}</p>}
                  </div>
                </div>

                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    Requesting <b>{selectedItem?.name}</b> for{" "}
                    <b>{formData.totalGuest} guests</b> at <b>{formData.time}</b>.
                  </p>
                </div>

                <Button
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="w-full h-11 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>Confirm Reservation <Send size={14} className="ml-2" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}