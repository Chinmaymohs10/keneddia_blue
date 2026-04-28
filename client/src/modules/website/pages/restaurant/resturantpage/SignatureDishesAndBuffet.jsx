import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Heart,
  ChefHat,
  Quote,
  Loader2,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResturantpageOffers from "./ResturantpageOffers";
import { useNavigate } from "react-router-dom";
import resturant_buffet1 from "@/assets/resturant_images/resturant_buffet1.jpeg";
import {
  getAllBuffetSectionHeaders,
  getAllBuffetItems,
  getChefRemarks,
  getMenuHeaders,
  getMenuItemsByPropertyId,
  getAllOfferHeaders,
  addItemLike,
  createJoiningUs,
} from "@/Api/RestaurantApi";
import { toast } from "react-hot-toast";

// ── Fallbacks ─────────────────────────────────────────────────────────────────
const BUFFET_DATA_FALLBACK = [
  { id: "b1", img: resturant_buffet1 },
  { id: "b2", img: resturant_buffet1 },
  { id: "b3", img: resturant_buffet1 },
];

const BUFFET_HEADER_FALLBACK = {
  headlinePart1: "Buffet",
  headlinePart2: "Selection",
  description: "Explore international delicacies curated for every occasion.",
};

const OFFER_HEADER_FALLBACK = {
  headLine1: "Today's",
  headLine2: "Deals",
  description: "Claim your rewards on your favorite culinary treats.",
};

// ── Buffet Carousel ───────────────────────────────────────────────────────────
function BuffetCarousel({ items, onBook }) {
  const [active, setActive] = useState(0);
  const total = items.length;
  const next = () => setActive((a) => (a + 1) % total);
  const prev = () => setActive((a) => (a - 1 + total) % total);

  const activeItem = items[active];

  const positionStyles = {
    center: { zIndex: 30, scale: 1, x: "0%", opacity: 1 },
    left: { zIndex: 10, scale: 0.9, x: "-25%", opacity: 0.2 },
    right: { zIndex: 10, scale: 0.9, x: "25%", opacity: 0.2 },
    hidden: { zIndex: 0, scale: 0.7, opacity: 0 },
  };

  if (!items.length) return null;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full h-[360px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="hidden md:block relative w-full h-full">
          {items.map((item, idx) => {
            const pos =
              idx === active
                ? "center"
                : idx === (active - 1 + total) % total
                  ? "left"
                  : idx === (active + 1) % total
                    ? "right"
                    : "hidden";
            const imgSrc = item.media?.url || item.img || resturant_buffet1;

            return (
              <motion.div
                key={item.id}
                animate={positionStyles[pos]}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className={`absolute inset-0 m-auto w-[80%] h-[95%] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 ${pos === "center"
                  ? "pointer-events-auto"
                  : "pointer-events-none"
                  }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={imgSrc}
                    className="max-w-full max-h-full object-contain"
                    alt={item.itemName}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="md:hidden w-full h-full px-4">
          <img
            src={activeItem.media?.url || activeItem.img || resturant_buffet1}
            className="w-full h-full object-cover rounded-3xl"
            alt="active buffet"
          />
        </div>

        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 z-40 p-3 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 z-40 p-3 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <div className="w-full mt-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="max-w-2xl">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-3">
                <h3 className="text-3xl font-serif dark:text-white uppercase tracking-tight">
                  {activeItem.itemName}
                </h3>
                {activeItem.price > 0 && (
                  <div className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                    <span className="text-primary font-black text-sm tracking-tighter">
                      ₹{activeItem.price}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm italic font-light leading-relaxed">
                {activeItem.description}
              </p>

            </div>

            <div className="pt-2">
              <Button
                onClick={() => onBook(activeItem)}
                className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary dark:hover:text-white h-10 px-10 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl"
              >
                {activeItem.ctaButtonText || "Reserve Your Table"}
                <ChevronRight size={12} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === active
                ? "w-8 bg-primary"
                : "w-2 bg-zinc-200 dark:bg-zinc-800"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Animated like counter ─────────────────────────────────────────────────────
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

// ── Signature dish card image with fallback ───────────────────────────────────
function DishImage({ src, alt }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <ImageOff size={32} className="text-zinc-300" />
      </div>
    );
  }
  return (
    <img
      src={src}
      className="w-full h-full object-cover"
      alt={alt}
      onError={() => setErrored(true)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function EnhancedCulinaryCuration({ propertyId }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [buffetHeader, setBuffetHeader] = useState(BUFFET_HEADER_FALLBACK);
  const [buffetItems, setBuffetItems] = useState(BUFFET_DATA_FALLBACK);
  const [offerHeader, setOfferHeader] = useState(OFFER_HEADER_FALLBACK);

  const [menuHeader, setMenuHeader] = useState(null);
  const [chefRemark, setChefRemark] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [isMenuDescriptionExpanded, setIsMenuDescriptionExpanded] =
    useState(false);
  const [showMenuDescriptionToggle, setShowMenuDescriptionToggle] =
    useState(false);
  const menuDescriptionRef = useRef(null);

  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    item: null,
    type: "book",
  });
  const [likedItems, setLikedItems] = useState({});
  const [likeForm, setLikeForm] = useState({
    name: "",
    phone: "",
    description: "",
    date: today,
    time: "19:00",
    totalGuest: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [likeSubmitting, setLikeSubmitting] = useState(false);

  const formatChefRemarkText = (text) => {
    if (!text) return "";
    const trimmed = text.trim();
    const normalized = trimmed.replace(/^"+|"+$/g, "");
    return `"${normalized}"`;
  };

  useEffect(() => {
    if (!propertyId) return;

    getAllBuffetSectionHeaders()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data;
        if (data?.length) {
          const active = data.filter(
            (h) => h.propertyId === propertyId && h.isActive,
          )[0];
          if (active)
            setBuffetHeader({
              headlinePart1:
                active.headlinePart1 || BUFFET_HEADER_FALLBACK.headlinePart1,
              headlinePart2:
                active.headlinePart2 || BUFFET_HEADER_FALLBACK.headlinePart2,
              description:
                active.description || BUFFET_HEADER_FALLBACK.description,
            });
        }
      })
      .catch(() => { });

    getAllBuffetItems()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data;
        if (data?.length) {
          const matched = data
            .filter((i) => i.propertyId === propertyId && i.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);
          setBuffetItems(matched.length ? matched : BUFFET_DATA_FALLBACK);
        }
      })
      .catch(() => { });

    getAllOfferHeaders()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data;
        if (data?.length) {
          const matchedHeaders = data
            .filter(
              (h) =>
                Number(h.propertyId) === Number(propertyId) &&
                h.isActive === true,
            )
            .sort((a, b) => b.id - a.id);
          const latestHeader = matchedHeaders[0];
          if (latestHeader) {
            setOfferHeader({
              headLine1:
                latestHeader.headLine1 || OFFER_HEADER_FALLBACK.headLine1,
              headLine2:
                latestHeader.headLine2 || OFFER_HEADER_FALLBACK.headLine2,
              description:
                latestHeader.description || OFFER_HEADER_FALLBACK.description,
            });
          }
        }
      })
      .catch(() => { });
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    setMenuLoading(true);

    Promise.all([getMenuHeaders(), getChefRemarks(), getMenuItemsByPropertyId(propertyId)])
      .then(([headersRes, remarksRes, itemsRes]) => {
        const headers = (headersRes?.data || [])
          .filter((h) => h.propertyId === propertyId)
          .sort((a, b) => b.id - a.id);
        const latestHeader = headers[0] || null;
        if (latestHeader) {
          setMenuHeader({
            part1: latestHeader.part1 || "",
            part2: latestHeader.part2 || "",
            description: latestHeader.description || "",
          });
        }

        const remarks = (remarksRes?.data || [])
          .filter((r) => r.propertyId === propertyId)
          .sort((a, b) => b.id - a.id);
        const latestRemark = remarks[0] || null;
        if (latestRemark) {
          setChefRemark({
            remark: latestRemark.remark || "Chef's Remark",
            description: latestRemark.description || "",
            imageUrl: latestRemark.img || latestRemark.image?.url || "",
          });
        }

        const items = (itemsRes?.data || [])
          .filter(
            (i) =>
              i.status !== false &&
              i.signatureItem === true,
          )
          .sort((a, b) => b.id - a.id);
        setMenuItems(items);
      })
      .catch(() => { })
      .finally(() => setMenuLoading(false));
  }, [propertyId]);

  useEffect(() => {
    const el = menuDescriptionRef.current;
    if (!el || !menuHeader?.description) {
      setShowMenuDescriptionToggle(false);
      return;
    }

    const checkOverflow = () => {
      setShowMenuDescriptionToggle(el.scrollHeight > el.clientHeight + 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [menuHeader?.description, isMenuDescriptionExpanded]);

  const handleBookingSubmit = async () => {
    if (!bookingModal.item) return;

    const trimmedName = likeForm.name.trim();
    const trimmedPhone = likeForm.phone.trim();
    const errors = {};

    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errors.name = "Name should contain characters only.";
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      errors.phone = "Phone number should be exactly 10 digits.";
    }

    if (!likeForm.date || likeForm.date < today) {
      errors.date = "Please select today or a future date.";
    }

    if (likeForm.totalGuest && Number(likeForm.totalGuest) < 1) {
      errors.totalGuest = "Number of guests cannot be negative or zero.";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLikeSubmitting(true);

    try {
      const itemType = bookingModal.item.itemName || "Buffet Reservation";
      const currentCategory = buffetHeader.headlinePart1 || "Buffet";

      await createJoiningUs({
        guestName: trimmedName,
        contactNumber: trimmedPhone,
        date: likeForm.date,
        time: likeForm.time,
        totalGuest: Number(likeForm.totalGuest || 2),
        propertyId: Number(propertyId),
        description: `Category: ${currentCategory} | Request: ${itemType} | Email: ${likeForm.email || "N/A"}`,
      });

      toast.success("Reservation request sent!");
      setBookingModal({ isOpen: false, item: null, type: "book" });
      setLikeForm({
        name: "",
        phone: "",
        email: "",
        date: today,
        time: "19:00",
        totalGuest: "",
        description: "",
      });
      setFormErrors({});
    } catch (error) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLikeSubmitting(false);
    }
  };

  const handleLikeSubmit = async () => {
    if (!bookingModal.item) return;

    const trimmedName = likeForm.name.trim();
    const trimmedPhone = likeForm.phone.trim();
    const errors = {};

    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errors.name = "Name should contain characters only.";
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      errors.phone = "Phone number should be exactly 10 digits.";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLikeSubmitting(true);
    try {
      const res = await addItemLike(bookingModal.item.id, {
        name: trimmedName,
        mobileNumber: trimmedPhone,
        description: likeForm.description || "Great taste!",
      });
      const updated = res?.data || res;
      setMenuItems((prev) =>
        prev.map((i) =>
          i.id === bookingModal.item.id
            ? { ...i, likeCount: updated.totalLikeCount ?? i.likeCount }
            : i,
        ),
      );
      setLikedItems((prev) => ({ ...prev, [bookingModal.item.id]: true }));
      setBookingModal({ isOpen: false, item: null, type: "book" });
      setLikeForm({
        name: "",
        phone: "",
        description: "",
        date: today,
        time: "19:00",
        totalGuest: "",
      });
      setFormErrors({});
    } catch {
      setLikedItems((prev) => ({ ...prev, [bookingModal.item.id]: true }));
      setBookingModal({ isOpen: false, item: null, type: "book" });
    } finally {
      setLikeSubmitting(false);
    }
  };

  const getItemImage = (item) =>
    item.media?.url ||
    item.image?.url ||
    (item.mediaId ? `/api/media/${item.mediaId}` : null);

  return (
    <div className="bg-white dark:bg-[#050505] transition-colors duration-500 pb-10">
      <section className="pt-6 pb-12 border-b border-zinc-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-left">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            <div className="lg:w-[60%] flex flex-col">
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
                  {buffetHeader.headlinePart1}{" "}
                  <span className="italic text-primary">
                    {buffetHeader.headlinePart2}
                  </span>
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light truncate">
                  {buffetHeader.description}
                </p>
              </div>
              <BuffetCarousel
                items={buffetItems}
                onBook={(item) =>
                  setBookingModal({ isOpen: true, item, type: "book" })
                }
              />
            </div>

            <div className="lg:w-[35%] bg-zinc-50/50 dark:bg-white/[0.02] rounded-[40px] p-8 border border-zinc-100 dark:border-white/5 flex flex-col">
              <div className="mb-4">
                <h3 className="text-2xl font-serif dark:text-white mb-1">
                  {offerHeader.headLine1}{" "}
                  <span className="italic text-primary">
                    {offerHeader.headLine2}
                  </span>
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-light truncate">
                  {offerHeader.description}
                </p>
              </div>
              <ResturantpageOffers propertyId={propertyId} />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6 pb-2">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-left">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10">
            <div className="flex-1 min-w-0 lg:max-w-[80%]">
              {menuLoading ? (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading…
                </div>
              ) : menuHeader ? (
                <>
                  <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
                    {menuHeader.part1}{" "}
                    <span className="italic text-primary">
                      {menuHeader.part2}
                    </span>
                  </h2>
                  {menuHeader.description && (
                    <div className="max-w-[80%]">
                      <div
                        ref={menuDescriptionRef}
                        className={`text-zinc-500 dark:text-zinc-400 text-sm font-light leading-relaxed break-words ${isMenuDescriptionExpanded
                          ? "max-h-32 overflow-y-auto pr-2"
                          : "line-clamp-2"
                          }`}
                      >
                        {menuHeader.description}
                      </div>
                      {showMenuDescriptionToggle && (
                        <button
                          type="button"
                          onClick={() =>
                            setIsMenuDescriptionExpanded((prev) => !prev)
                          }
                          className="mt-2 text-xs font-semibold text-primary hover:underline"
                        >
                          {isMenuDescriptionExpanded
                            ? "Show less"
                            : "Show more .."}
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
                  Signature{" "}
                  <span className="italic text-primary">Masterpieces</span>
                </h2>
              )}
            </div>

            {!menuLoading && chefRemark && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="w-full lg:w-[368px] shrink-0 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-primary/10 shadow-sm overflow-hidden"
              >
                <div className="relative shrink-0">
                  {chefRemark.imageUrl ? (
                    <img
                      src={chefRemark.imageUrl}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                      alt="Chef"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border-2 border-primary">
                      <ChefHat className="w-7 h-7 text-primary" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-full border-2 border-white dark:border-zinc-900">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Quote className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-[10px] font-bold dark:text-zinc-400 uppercase tracking-widest">
                      {chefRemark.remark}
                    </span>
                  </div>
                  <p className="text-sm italic dark:text-zinc-200 leading-snug line-clamp-6 break-words overflow-hidden">
                    {formatChefRemarkText(chefRemark.description)}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {menuLoading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
              <Loader2 size={20} className="animate-spin" /> Loading menu items…
            </div>
          ) : menuItems.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-zinc-300 text-sm italic">
              No menu items available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20 pt-16">
              {menuItems.map((item) => {
                const imgSrc = getItemImage(item);
                const isLiked = !!likedItems[item.id];
                const likes = item.likeCount || 0;

                return (
                  <div
                    key={item.id}
                    className="group relative bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 flex-col items-center text-center flex cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl -mt-24 mb-4 transition-transform duration-700 group-hover:scale-105">
                      <DishImage src={imgSrc} alt={item.itemName} />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingModal({ isOpen: true, item, type: "like" });
                        }}
                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md text-primary hover:scale-110 transition-transform"
                      >
                        <Heart
                          size={18}
                          className={isLiked ? "fill-primary" : ""}
                        />
                      </button>
                    </div>

                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                      {item.category?.categoryName || item.type?.typeName || ""}
                    </span>

                    <div className="flex flex-col w-full items-center">
                      <h3 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2 leading-tight">
                        {item.itemName}
                      </h3>
                      {item.description && (
                        <p className="text-zinc-500 text-[13px] leading-snug line-clamp-2 italic mb-3">
                          "{item.description}"
                        </p>
                      )}

                      <div className="flex items-center justify-center gap-1.5 text-primary">
                        <Heart size={14} className="fill-primary" />
                        <span className="text-sm font-black">
                          <AnimatedCounter target={likes} />+
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {bookingModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative text-left border border-zinc-100 dark:border-white/5"
            >
              <button
                onClick={() => {
                  setBookingModal({ isOpen: false, item: null, type: "book" });
                  setFormErrors({});
                }}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-serif mb-2 dark:text-white">
                {bookingModal.type === "like"
                  ? "Show your love"
                  : `Reserve ${bookingModal.item?.itemName || bookingModal.item?.name || "Table"}`}
              </h3>
              <p className="text-xs text-zinc-500 mb-6 italic">
                {bookingModal.type === "like"
                  ? "Share your details to like this dish."
                  : "Please provide your details below for the reservation."}
              </p>

              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={likeForm.name}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                        setLikeForm((f) => ({ ...f, name: value }));
                        setFormErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                    />
                    {formErrors.name && (
                      <p className="mt-1 px-1 text-xs font-medium text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      placeholder="Phone Number"
                      value={likeForm.phone}
                      inputMode="numeric"
                      maxLength={10}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const value = rawValue.replace(/\D/g, "").slice(0, 10);
                        setLikeForm((f) => ({ ...f, phone: value }));
                        setFormErrors((prev) => ({
                          ...prev,
                          phone: rawValue.includes("-")
                            ? "Phone number cannot be negative."
                            : "",
                        }));
                      }}
                      className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 px-1 text-xs font-medium text-red-500">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {bookingModal.type === "book" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-primary px-1">
                          Date
                        </label>
                        <Input
                          type="date"
                          min={today}
                          value={likeForm.date || today}
                          onChange={(e) => {
                            const value = e.target.value < today ? today : e.target.value;
                            setLikeForm((f) => ({ ...f, date: value }));
                            setFormErrors((prev) => ({
                              ...prev,
                              date:
                                e.target.value < today
                                  ? "Please select today or a future date."
                                  : "",
                            }));
                          }}
                          className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                        />
                        {formErrors.date && (
                          <p className="mt-1 px-1 text-xs font-medium text-red-500">
                            {formErrors.date}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-primary px-1">
                          Time
                        </label>
                        <Input
                          type="time"
                          value={likeForm.time || "19:00"}
                          onChange={(e) =>
                            setLikeForm((f) => ({ ...f, time: e.target.value }))
                          }
                          className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-primary px-1">
                        Number of Guests
                      </label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        placeholder="2"
                        value={likeForm.totalGuest}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const value = rawValue.replace(/\D/g, "");
                          setLikeForm((f) => ({
                            ...f,
                            totalGuest: value,
                          }));
                          setFormErrors((prev) => ({
                            ...prev,
                            totalGuest: rawValue.includes("-")
                              ? "Number of guests cannot be negative."
                              : value && Number(value) < 1
                                ? "Number of guests should be at least 1."
                                : "",
                          }));
                        }}
                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                      />
                      {formErrors.totalGuest && (
                        <p className="mt-1 px-1 text-xs font-medium text-red-500">
                          {formErrors.totalGuest}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {bookingModal.type === "like" && (
                  <Input
                    placeholder="Leave a comment (optional)"
                    value={likeForm.description}
                    onChange={(e) =>
                      setLikeForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                  />
                )}

                <Button
                  disabled={likeSubmitting}
                  onClick={
                    bookingModal.type === "like"
                      ? handleLikeSubmit
                      : handleBookingSubmit
                  }
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                >
                  {likeSubmitting ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : bookingModal.type === "like" ? (
                    "Submit Like"
                  ) : (
                    "Confirm Reservation"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
