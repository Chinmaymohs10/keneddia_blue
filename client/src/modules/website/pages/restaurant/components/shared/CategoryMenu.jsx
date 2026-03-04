import React, { useState, useRef } from "react";
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
  Mail,
  Send,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { createJoiningUs } from "@/Api/RestaurantApi";
export default function CategoryMenu({
  menu,
  themeColor,
  propertyId,
  showOrderButton = false,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef(null);

  // Modal & Form States
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    totalGuest: "2",
  });

  const handleOrderClick = (item) => {
    setSelectedItem(item);
    setShowOrderModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentCategory = menu[activeTab]?.category || "General";
      const itemType = selectedItem?.name || "Table Reservation";

      // Matching your exact payload structure
      const payload = {
        guestName: formData.name.trim(),
        contactNumber: formData.phone.trim(),
        date: formData.date,
        time: formData.time, // Now captured from manual input
        totalGuest: Number(formData.totalGuest), // Now captured from manual input
        propertyId: propertyId,
        description: `Category: ${currentCategory} | Request: ${itemType} | Email: ${formData.email}`,
      };

      await createJoiningUs(payload);

      toast.success("Request sent successfully!");
      setShowOrderModal(false);
      setStep(1);
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: new Date().toISOString().split("T")[0],
        time: "19:00",
        totalGuest: "2",
      });
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Optional: Update handleReserveClick to be more descriptive
  const handleReserveClick = () => {
    const categoryName = menu[activeTab].category;
    setSelectedItem({
      name: `Table Reservation`,
      category: categoryName,
    });
    setShowOrderModal(true);
  };

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
    <section
      id="menu"
      className="py-16 bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      <div className="container mx-auto px-6 max-w-[1200px]">
        {/* --- HEADER --- */}
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

            <button
              onClick={handleReserveClick}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none"
            >
              <CalendarCheck size={14} /> Reserve Now
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

        {/* --- CONTENT AREA --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid lg:grid-cols-12 gap-8 items-start"
          >
            {/* STICKY IMAGE */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-white/5">
                <img
                  src={menu[activeTab].categoryImage}
                  className="w-full h-full object-cover"
                  alt="Featured"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">
                    Featured
                  </p>
                  <h3 className="text-2xl font-serif uppercase tracking-tight">
                    {menu[activeTab].category}
                  </h3>
                </div>
              </div>
            </div>

            {/* ITEM LIST */}
            <div className="lg:col-span-7 space-y-6">
              {menu[activeTab].items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-start gap-5 p-4 rounded-2xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                      alt={item.name}
                    />
                  </div>

                  <div className="flex-1 border-b border-zinc-100 dark:border-white/5 pb-4 group-last:border-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                          {item.name}
                        </h4>
                        {item.isSpicy && (
                          <Flame
                            size={16}
                            className="text-red-500 fill-red-500"
                          />
                        )}
                      </div>

                      {/* ORDER BUTTON — only shown when showOrderButton is true */}
                      {showOrderButton && (
                        <button
                          onClick={() => handleOrderClick(item)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                        >
                          <ShoppingBag size={12} /> Order
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- ORDER/RESERVE POPUP FORM --- */}
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
                    {selectedItem?.name.includes("Table") ? (
                      <CalendarCheck size={18} />
                    ) : (
                      <ShoppingBag size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl dark:text-white">
                      {selectedItem?.name.includes("Table")
                        ? "Reservation"
                        : `Order ${selectedItem?.name}`}
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                      Step {step} of 2
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {step === 1 ? (
                  <div className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your Name"
                          className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <Input
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+91"
                            className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                          />
                        </div>
                      </div>
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                          Date
                        </label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                    </div>

                    <Button
                      disabled={
                        !formData.name || !formData.phone || !formData.date
                      }
                      onClick={() => setStep(2)}
                      className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-primary transition-all"
                    >
                      Next Step <ChevronRight size={14} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Arrival Time */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                          Arrival Time
                        </label>
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                      {/* Total Guests */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                          Total Guests
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.totalGuest}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              totalGuest: e.target.value,
                            })
                          }
                          className="h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-primary">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <Input
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="email@example.com"
                          className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                        Requesting <b>{selectedItem?.name}</b> for{" "}
                        <b>{formData.totalGuest} guests</b> at{" "}
                        <b>{formData.time}</b>. Our staff will call shortly.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="h-14 rounded-xl px-8 dark:text-white"
                      >
                        Back
                      </Button>
                      <Button
                        disabled={
                          isSubmitting ||
                          !formData.email ||
                          !formData.time ||
                          formData.totalGuest < 1
                        }
                        onClick={handleFinalSubmit}
                        className="flex-1 h-14 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            Confirm & Reserve{" "}
                            <Send size={14} className="ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
