import React, { useState, useEffect } from "react";
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
  getOfferHeaderById,
  getChefRemarks,
  getMenuHeaders,
  getMenuItems,
  getAllOfferHeaders,
} from "@/Api/RestaurantApi";

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

  const positionStyles = {
    center: { zIndex: 30, scale: 1, x: "0%", opacity: 1 },
    left: { zIndex: 10, scale: 0.9, x: "-25%", opacity: 0.2 },
    right: { zIndex: 10, scale: 0.9, x: "25%", opacity: 0.2 },
    hidden: { zIndex: 0, scale: 0.7, opacity: 0 },
  };

  if (!items.length) return null;

  return (
    <div className="relative w-full h-[400px] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Desktop Carousel */}
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
                transition={{ duration: 0.6 }}
                className={`absolute inset-0 m-auto w-[80%] h-[90%] rounded-[32px] overflow-hidden shadow-xl border border-white/20 backdrop-blur-md ${pos === "center" ? "pointer-events-auto" : "pointer-events-none"}`}
              >
                <img
                  src={imgSrc}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt={item.itemName || ""}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-left">
                  {item.price > 0 && (
                    <span className="w-fit px-3 py-1 rounded-full text-white text-[9px] font-black uppercase mb-3 bg-primary">
                      ₹{item.price}
                    </span>
                  )}
                  {item.itemName && (
                    <h3 className="text-white font-serif text-2xl mb-1">
                      {item.itemName}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-white/70 text-xs italic mb-4 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                  {item.ctaLink && item.ctaButtonText && (
                    <a
                      href={item.ctaLink}
                      className="w-fit py-2 px-6 rounded-full text-white text-[10px] font-black uppercase bg-primary"
                    >
                      {item.ctaButtonText}
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Stack */}
        <div className="md:hidden w-full space-y-4 px-2">
          {items.map((item) => {
            const imgSrc = item.media?.url || item.img || resturant_buffet1;
            return (
              <div
                key={item.id}
                className="h-60 rounded-2xl overflow-hidden shadow-md"
              >
                <img
                  src={imgSrc}
                  className="w-full h-full object-cover"
                  alt={item.itemName || "Buffet"}
                />
              </div>
            );
          })}
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full shadow"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full shadow"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
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

  // ── Buffet / Offer state (unchanged) ──────────────────────────────────────
  const [buffetHeader, setBuffetHeader] = useState(BUFFET_HEADER_FALLBACK);
  const [buffetItems, setBuffetItems] = useState(BUFFET_DATA_FALLBACK);
  const [offerHeader, setOfferHeader] = useState(OFFER_HEADER_FALLBACK);

  // ── NEW: Menu / Chef state ─────────────────────────────────────────────────
  const [menuHeader, setMenuHeader] = useState(null); // { part1, part2, description }
  const [chefRemark, setChefRemark] = useState(null); // { remark, description, imageUrl }
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    item: null,
    type: "book",
  });
  const [likedItems, setLikedItems] = useState({});

  // ── Fetch buffet / offer (existing logic, unchanged) ──────────────────────
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
      .catch(() => {});

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
      .catch(() => {});

    getAllOfferHeaders()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data;

        if (data?.length) {
          // filter by propertyId + active
          const matchedHeaders = data
            .filter(
              (h) =>
                Number(h.propertyId) === Number(propertyId) &&
                h.isActive === true,
            )
            .sort((a, b) => b.id - a.id); // latest first

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
          } else {
            setOfferHeader(OFFER_HEADER_FALLBACK);
          }
        }
      })
      .catch(() => {
        setOfferHeader(OFFER_HEADER_FALLBACK);
      });
  }, [propertyId]);

  // ── Fetch menu header, chef remark, menu items ─────────────────────────────
  useEffect(() => {
    if (!propertyId) return;
    setMenuLoading(true);

    Promise.all([getMenuHeaders(), getChefRemarks(), getMenuItems()])
      .then(([headersRes, remarksRes, itemsRes]) => {
        // ── Menu Section Header — latest for this property ──
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

        // ── Chef Remark — latest for this property ──
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

        // ── Menu Items — filter by propertyId + status, sort latest first ──
        const items = (itemsRes?.data || [])
          .filter(
            (i) =>
              i.propertyId === propertyId &&
              i.status !== false &&
              i.signatureItem === true, // 🔥 only signature
          )
          .sort((a, b) => b.id - a.id);
        setMenuItems(items);
      })
      .catch(() => {
        // keep empty / null — sections will show nothing gracefully
      })
      .finally(() => setMenuLoading(false));
  }, [propertyId]);

  const handleLikeSubmit = () => {
    if (bookingModal.item) {
      setLikedItems((prev) => ({ ...prev, [bookingModal.item.id]: true }));
      setBookingModal({ isOpen: false, item: null, type: "book" });
    }
  };

  // ── Resolve image for a menu item ─────────────────────────────────────────
  const getItemImage = (item) =>
    item.media?.url ||
    item.image?.url ||
    (item.mediaId ? `/api/media/${item.mediaId}` : null);

  return (
    <div className="bg-white dark:bg-[#050505] transition-colors duration-500 pb-10">
      {/* ── 1. BUFFET & OFFERS (unchanged) ──────────────────────────────── */}
      <section className="pt-20 pb-12 border-b border-zinc-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-left">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            {/* Buffet Column */}
            <div className="lg:w-[60%] flex flex-col pt-8">
              <div className="mb-6 h-[100px]">
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

            {/* Offers Column */}
            <div className="lg:w-[35%] bg-zinc-50/50 dark:bg-white/[0.02] rounded-[40px] p-8 border border-zinc-100 dark:border-white/5 flex flex-col justify-end">
              <div className="mb-6 h-[80px]">
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

      {/* ── 2. SIGNATURE / MENU SECTION — fully dynamic ─────────────────── */}
      <section className="pt-16 pb-2">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-left">
          {/* Section header row */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-20">
            {/* Menu Section Headline — from API */}
            <div>
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
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
                      {menuHeader.description}
                    </p>
                  )}
                </>
              ) : (
                /* fallback if no header configured yet */
                <h2 className="text-3xl md:text-4xl font-serif dark:text-white mb-2">
                  Signature{" "}
                  <span className="italic text-primary">Masterpieces</span>
                </h2>
              )}
            </div>

            {/* Chef Remark Card — from API */}
            {!menuLoading && chefRemark && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-5 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-primary/10 max-w-lg shadow-sm"
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
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Quote className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-[10px] font-bold dark:text-zinc-400 uppercase tracking-widest">
                      {chefRemark.remark}
                    </span>
                  </div>
                  <p className="text-sm italic dark:text-zinc-200 leading-snug">
                    "{chefRemark.description}"
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Menu Items Grid — dynamic ────────────────────────────────── */}
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
                    // onClick={() =>
                    //   navigate(
                    //     `/resturant/${item.category?.categoryName?.toLowerCase() || "menu"}`,
                    //   )
                    // }
                    className="group relative bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 flex-col items-center text-center flex cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl -mt-24 mb-4 transition-transform duration-700 group-hover:scale-105">
                      <DishImage src={imgSrc} alt={item.itemName} />

                      {/* Like button */}
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

                      {/* Food type badge */}
                      {/* {item.foodType && (
                        <span
                          className={`absolute top-4 left-4 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.foodType === "VEG"
                              ? "bg-green-500 text-white"
                              : item.foodType === "NON_VEG"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                          }`}
                        >
                          {item.foodType === "NON_VEG"
                            ? "Non-Veg"
                            : item.foodType === "EGG"
                              ? "Egg"
                              : "Veg"}
                        </span>
                      )} */}

                      {/* Signature badge */}
                      {/* {item.signatureItem && (
                        <span className="absolute bottom-4 left-4 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-white">
                          ★ Signature
                        </span>
                      )} */}
                    </div>

                    {/* Category tag */}
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

                      {/* Like counter */}
                      <div className="flex items-center justify-center gap-1.5 text-primary">
                        <Heart size={14} className="fill-primary" />
                        <span className="text-sm font-black">
                          <AnimatedCounter
                            target={isLiked ? likes + 1 : likes}
                          />
                          +
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

      {/* ── Like / Booking Modal (unchanged) ────────────────────────────── */}
      <AnimatePresence>
        {bookingModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative text-left"
            >
              <button
                onClick={() =>
                  setBookingModal({ isOpen: false, item: null, type: "book" })
                }
                className="absolute top-6 right-6 p-2 text-zinc-400"
              >
                <X />
              </button>
              <h3 className="text-2xl font-serif mb-2 dark:text-white">
                {bookingModal.type === "like"
                  ? "Show your love"
                  : `Reserve ${bookingModal.item?.itemName || bookingModal.item?.name}`}
              </h3>
              <p className="text-xs text-zinc-500 mb-6 italic">
                {bookingModal.type === "like"
                  ? "Share your details to like this dish."
                  : "Please provide your details below."}
              </p>
              <div className="space-y-4">
                <Input
                  placeholder="Your Name"
                  className="h-14 rounded-2xl bg-zinc-50 border-none"
                />
                <Input
                  placeholder="Phone Number"
                  className="h-14 rounded-2xl bg-zinc-50 border-none"
                />
                <Button
                  onClick={
                    bookingModal.type === "like"
                      ? handleLikeSubmit
                      : () =>
                          setBookingModal({
                            isOpen: false,
                            item: null,
                            type: "book",
                          })
                  }
                  className="w-full h-14 bg-primary rounded-2xl font-black uppercase shadow-lg"
                >
                  {bookingModal.type === "like"
                    ? "Submit Like"
                    : "Confirm Request"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
