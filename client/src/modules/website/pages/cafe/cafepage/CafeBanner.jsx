import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  Navigation,
  MessageCircle,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";

const FALLBACK_CAFE = {
  name: "Kennedia Cafe",
  location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
  city: "Ghaziabad",
  tagline: "Where Every Sip Feels Like a Hug",
  description: "Crafted with love, every blend at Kennedia Café is more than just coffee — it's a comforting embrace in a cup. From the first sip to the last, our flavors are designed to bring you warmth, comfort, and joy, turning everyday moments into something truly special.",
};

export default function CafeBanner({ propertyData, galleryData, loading }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showBookmarkMessage, setShowBookmarkMessage] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Derive cafe fields from propertyData
  const cafe = useMemo(() => {
    if (!propertyData) return FALLBACK_CAFE;
    return {
      id: propertyData.id || propertyData.propertyId || 1,
      propertyId: propertyData.propertyId || propertyData.id || 1,
      name: propertyData.name || propertyData.propertyName || FALLBACK_CAFE.name,
      location: propertyData.location || propertyData.fullAddress || FALLBACK_CAFE.location,
      city: propertyData.city || propertyData.locationName || FALLBACK_CAFE.city,
      tagline: propertyData.tagline || propertyData.subTitle || FALLBACK_CAFE.tagline,
      description: propertyData.description || propertyData.mainHeading || FALLBACK_CAFE.description,
      addressUrl: propertyData.addressUrl || null,
      coordinates: propertyData.coordinates || null,
    };
  }, [propertyData]);

  // Process gallery media
  const galleryMedia = useMemo(() => {
    if (!galleryData || galleryData.length === 0) return [];
    return galleryData
      .filter((g) => g.isActive && g.media?.url)
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
      .map((g) => g.media);
  }, [galleryData]);

  const mapsLink = useMemo(() => {
    return cafe.addressUrl || (cafe.coordinates
      ? `https://www.google.com/maps?q=${cafe.coordinates.lat},${cafe.coordinates.lng}`
      : `https://www.google.com/maps/search/${encodeURIComponent(cafe.name + " " + cafe.city)}`);
  }, [cafe]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const totalImages = galleryMedia.length;
  const thumbImages = galleryMedia.slice(0, Math.min(6, totalImages));
  const mainImg = galleryMedia[activeThumb];
  const companions = [
    galleryMedia[(activeThumb + 1) % totalImages],
    galleryMedia[(activeThumb + 2) % totalImages],
  ];

  // Auto-rotate every 3.5 s
  useEffect(() => {
    if (!isAutoPlaying || totalImages <= 1) return;
    const t = setInterval(() => setActiveThumb((p) => (p + 1) % totalImages), 3500);
    return () => clearInterval(t);
  }, [isAutoPlaying, totalImages]);

  const handleThumbClick = (i) => {
    setActiveThumb(i);
    setInitialGalleryIndex(i);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleBookmark = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const message = isMobile
      ? "Use browser menu to bookmark"
      : "Press Ctrl + D to bookmark";

    toast(message, {
      icon: "🔖",
      style: {
        borderRadius: "10px",
        background: "#18181b",
        color: "#fff",
        fontSize: "12px",
      },
    });

    setShowBookmarkMessage(true);
    setTimeout(() => {
      setShowBookmarkMessage(false);
    }, 3000);
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={15} />,
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook size={15} />,
      color: "bg-[#1877F2]",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X",
      icon: <Twitter size={13} />,
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={15} />,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F8F6] dark:bg-[#14100b]">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    /* ── Root: light = warm off-white | dark = deep espresso ── */
    <div
      className="min-h-[calc(100vh-var(--navbar-height,72px))] lg:h-screen overflow-visible lg:overflow-hidden flex flex-col bg-[#F8F8F6] dark:bg-[#14100b] transition-colors duration-300"
      style={{ paddingTop: "var(--navbar-height,72px)" }}
    >
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        hotel={{
          name: cafe.name,
          location: cafe.location,
          propertyId: cafe.propertyId,
          media: galleryMedia,
        }}
        initialImageIndex={initialGalleryIndex}
        galleryData={galleryData}
      />

      {/* ── BODY ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row px-6 md:px-8 lg:px-10 pt-4 pb-5 gap-0 overflow-visible lg:overflow-hidden">

        {/* ════ LEFT PANEL ════ */}
        <div className="flex-1 min-w-0 flex flex-col pr-0 lg:pr-10 overflow-hidden">

          {/* ── small flex spacer so content sits ~30% down, not flush top ── */}
          <div className="hidden lg:block" style={{ flex: "0.25", minHeight: 0 }} />

          {/* Content block — breadcrumb through CTA */}
          <div className="flex flex-col shrink-0">

            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-1.5 text-xs font-semibold mb-4"
            >
              <Link
                to="/"
                className="text-primary dark:text-[#a07850] hover:text-primary/80 dark:hover:text-[#f0dfc0] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-primary/50 dark:text-[#a07850]/50" />
              <Link
                to="/cafe-homepage"
                className="text-primary dark:text-[#a07850] hover:text-primary/80 dark:hover:text-[#f0dfc0] transition-colors"
              >
                Cafes
              </Link>
              <ChevronRight className="w-3 h-3 text-primary/50 dark:text-[#a07850]/50" />
              <span className="text-primary dark:text-[#f0dfc0] font-black">
                {cafe.name}
              </span>
            </motion.nav>

            {/* Title — single line */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-1"
            >
              <h1
                className="text-zinc-900 dark:text-[#f0dfc0]"
                style={{
                  fontFamily: '"Georgia","Times New Roman",serif',
                  fontSize: "clamp(2.1rem, 5.8vw, 4.96rem)",
                  lineHeight: 1,
                  fontStyle: "italic",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {cafe.name}
              </h1>

              {/* Swoosh */}
              <svg
                viewBox="0 0 320 22"
                style={{ width: "clamp(130px,32vw,290px)", height: "14px", display: "block", marginTop: "4px", marginBottom: "12px" }}
                fill="none"
              >
                <path d="M4 16 C 40 4, 100 20, 160 11 S 260 2, 316 13" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" />
                <path d="M20 19 C 70 8, 130 18, 200 14 S 280 6, 312 16" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              </svg>
            </motion.div>

            {/* Tagline */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="font-black text-zinc-800 dark:text-[#e8d0b0] mb-2"
              style={{ fontSize: "clamp(0.78rem, 1.5vw, 1.05rem)" }}
            >
              {cafe.tagline}
            </motion.h2>

            {/* Description — 2 lines, wider */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="text-zinc-600 dark:text-[#b09070] italic leading-relaxed mb-4"
              style={{
                fontSize: "clamp(0.7rem, 1.15vw, 0.88rem)",
                maxWidth: "560px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {cafe.description}
            </motion.p>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.42 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-[#a07850]">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[220px]">
                  {cafe.location}
                </span>
              </div>
              <a
                href={mapsLink} target="_blank" rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-1 text-xs font-black text-red-700 dark:text-red-400 hover:underline"
              >
                <Navigation className="w-3 h-3" /> View Map
              </a>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
            >
              <button
                onClick={() => {
                  const el = document.getElementById("menu");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-2.5 rounded-full font-black text-sm tracking-wide text-white dark:text-[#1e0d00] bg-primary dark:bg-[#f0dfc0] transition-all active:scale-95 hover:bg-primary/90 shadow-lg cursor-pointer"
              >
                Explore Now
              </button>
            </motion.div>
          </div>

          {/* spacer pushes thumbnails to bottom */}
          <div className="hidden lg:block flex-1 min-h-0" />

          {/* ── Thumbnail row ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.56 }}
            className="mt-3 flex items-end gap-2 shrink-0 overflow-x-auto lg:mt-0"
            style={{ paddingBottom: "4px", scrollbarWidth: "none" }}
          >
            {thumbImages.map((img, i) => (
              <button
                key={i}
                onClick={() => handleThumbClick(i)}
                className="relative cursor-pointer rounded-xl overflow-hidden focus:outline-none"
                style={{
                  width: "clamp(56px,8vw,90px)",
                  height: "clamp(56px,8vw,90px)",
                  flexShrink: 0,
                  transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                  border: activeThumb === i ? "2.5px solid #c0392b" : "2.5px solid transparent",
                  transform: activeThumb === i ? "scale(1.08)" : "scale(1)",
                  boxShadow: activeThumb === i
                    ? "0 6px 18px rgba(192,57,43,0.35)"
                    : "0 2px 8px rgba(192,57,43,0.14)",
                }}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                {activeThumb !== i && <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />}
                {activeThumb === i && isAutoPlaying && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-white/60 animate-pulse pointer-events-none" />
                )}
              </button>
            ))}

            {totalImages > 6 && (
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="cursor-pointer rounded-xl flex flex-col items-center justify-center font-black transition-all active:scale-95 shrink-0 text-[#3d1f00] dark:text-[#e8d0b0]"
                style={{
                  width: "clamp(56px,8vw,90px)",
                  height: "clamp(56px,8vw,90px)",
                  background: "rgba(30,13,0,0.08)",
                  border: "2px dashed rgba(30,13,0,0.25)",
                }}
              >
                <span className="text-base font-black">+{totalImages - 6}</span>
                <span className="text-[9px] font-semibold opacity-60 mt-0.5">MORE</span>
              </button>
            )}
          </motion.div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-[36%] shrink-0 flex-col gap-3"
        >

          {/* Floating multi-image grid */}
          <div className="relative flex-1 min-h-0">

            {/* Companion 1 — top-right */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`c1-${activeThumb}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1, rotate: 6 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="absolute top-0 right-0 rounded-2xl overflow-hidden cursor-pointer z-10"
                style={{ width: "46%", aspectRatio: "4/5", boxShadow: "0 12px 36px rgba(30,13,0,0.28)", transformOrigin: "top right" }}
                onClick={() => { setInitialGalleryIndex((activeThumb + 1) % totalImages); setIsGalleryOpen(true); }}
              >
                <img src={companions[0]?.url} alt={companions[0]?.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
              </motion.div>
            </AnimatePresence>

            {/* Companion 2 — bottom-left */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`c2-${activeThumb}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute bottom-0 left-0 rounded-2xl overflow-hidden cursor-pointer z-10"
                style={{ width: "42%", aspectRatio: "4/5", boxShadow: "0 12px 36px rgba(30,13,0,0.28)", transformOrigin: "bottom left" }}
                onClick={() => { setInitialGalleryIndex((activeThumb + 2) % totalImages); setIsGalleryOpen(true); }}
              >
                <img src={companions[1]?.url} alt={companions[1]?.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
              </motion.div>
            </AnimatePresence>

            {/* Main card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`main-${activeThumb}`}
                initial={{ opacity: 0, scale: 0.93, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-x-[12%] inset-y-[8%] rounded-3xl overflow-hidden cursor-pointer z-20"
                style={{ boxShadow: "0 24px 56px rgba(30,13,0,0.45)" }}
                onClick={() => { setInitialGalleryIndex(activeThumb); setIsGalleryOpen(true); }}
              >
                <img src={mainImg?.url} alt={mainImg?.alt} className="w-full h-full object-cover object-center" draggable={false} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(20,10,5,0.6) 0%,transparent 55%)" }} />

                {/* Progress bar */}
                {isAutoPlaying && (
                  <motion.div
                    key={`bar-${activeThumb}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 3.5, ease: "linear" }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/70 origin-left z-30 pointer-events-none"
                  />
                )}

                <div className="absolute bottom-4 left-4 pointer-events-none z-10">
                  <p
                    className="text-white font-black italic leading-none"
                    style={{
                      fontFamily: '"Georgia",serif',
                      fontSize: "clamp(1rem,2.4vw,1.5rem)",
                      textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                    }}
                  >
                    {cafe.name.split(" ").map((word, idx) => (
                      <span key={idx}>
                        {word}
                        <br />
                      </span>
                    ))}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-2.5 h-2.5 text-white/70" />
                    <span className="text-white/70 text-[9px] font-medium">
                      {cafe.city}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[10px] font-black tracking-widest uppercase">
                    View Gallery
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Share + Bookmark */}
          <div className="flex items-center justify-center gap-3 shrink-0 pt-1">
            <div className="relative" onMouseEnter={() => setShowShare(true)} onMouseLeave={() => setShowShare(false)}>
              <AnimatePresence>
                {showShare && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -52, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 shadow-xl rounded-full px-2 py-1.5 flex gap-1.5 z-50"
                  >
                    {socialPlatforms.map((p, i) => (
                      <motion.a
                        key={p.name} href={p.link} target="_blank" rel="noreferrer"
                        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.15, y: -2 }}
                        className={`${p.color} text-white p-1.5 rounded-full flex items-center justify-center`}
                      >
                        {p.icon}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all active:scale-95 text-[#3d1f00] dark:text-[#e8d0b0] bg-[#e8d8c4]/60 dark:bg-white/10 border border-[#c4a882]/40 dark:border-white/15 hover:bg-[#dcc9af]/80 dark:hover:bg-white/15 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            <div className="relative">
              <AnimatePresence>
                {showBookmarkMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -52, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 shadow-xl rounded-full px-4 py-2 flex items-center gap-2 z-50 whitespace-nowrap"
                  >
                    <Heart size={14} className="text-primary fill-primary" />
                    <p className="text-[10px] font-bold text-zinc-800 dark:text-white">
                      {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                        ? "Use browser menu to bookmark"
                        : "Press Ctrl + D to bookmark"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all active:scale-95 text-[#3d1f00] dark:text-[#e8d0b0] bg-[#e8d8c4]/60 dark:bg-white/10 border border-[#c4a882]/40 dark:border-white/15 hover:bg-[#dcc9af]/80 dark:hover:bg-white/15 cursor-pointer"
                onClick={handleBookmark}
                onMouseEnter={() => setShowBookmarkMessage(true)}
                onMouseLeave={() => setShowBookmarkMessage(false)}
              >
                <Heart className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>
        </motion.div>

        {/* Mobile */}
        <div className="lg:hidden mt-4 shrink-0 flex flex-col gap-2">
          <div
            className="relative w-full h-44 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => { setInitialGalleryIndex(activeThumb); setIsGalleryOpen(true); }}
            style={{ boxShadow: "0 12px 32px rgba(30,13,0,0.28)" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeThumb} src={mainImg?.url} alt={mainImg?.alt}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(20,10,5,0.55) 0%,transparent 60%)" }} />
            <p
              className="absolute bottom-3 left-4 text-white font-black italic text-base"
              style={{ fontFamily: '"Georgia",serif' }}
            >
              {cafe.name}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="flex cursor-pointer items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-[#e8d8c4]/70 dark:bg-white/10 text-[#3d1f00] dark:text-[#e8d0b0]">
              <Share2 className="w-3 h-3" /> Share
            </button>
            <div className="relative">
              <AnimatePresence>
                {showBookmarkMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -45, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    className="absolute right-0 bg-white dark:bg-zinc-800 shadow-xl rounded-full px-4 py-1.5 flex items-center gap-2 z-50 whitespace-nowrap"
                  >
                    <Heart size={12} className="text-primary fill-primary" />
                    <p className="text-[10px] font-bold text-zinc-800 dark:text-white">
                      Use browser menu
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                className="flex cursor-pointer items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-[#e8d8c4]/70 dark:bg-white/10 text-[#3d1f00] dark:text-[#e8d0b0]"
                onClick={handleBookmark}
              >
                <Heart className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
