import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import { CAFE_GALLERY_ITEMS, CAFE_GALLERY_MEDIA } from "./cafeGalleryData";

const CAFE_DATA = {
  name: "Kennedia Cafe",
  location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
  city: "Ghaziabad",
};

const mapsLink = "https://www.google.com/maps/search/Kennedia+Cafe+Ghaziabad";

export default function CafeBanner() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const totalImages = CAFE_GALLERY_MEDIA.length;
  const thumbImages = CAFE_GALLERY_MEDIA.slice(0, Math.min(6, totalImages));
  const mainImg     = CAFE_GALLERY_MEDIA[activeThumb];
  const companions  = [
    CAFE_GALLERY_MEDIA[(activeThumb + 1) % totalImages],
    CAFE_GALLERY_MEDIA[(activeThumb + 2) % totalImages],
  ];

  // ── Auto-rotate every 3.5 s ──
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveThumb((prev) => (prev + 1) % totalImages);
    }, 3500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, totalImages]);

  // Pause auto-play on manual thumbnail click for 8 s then resume
  const handleThumbClick = (i) => {
    setActiveThumb(i);
    setInitialGalleryIndex(i);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const socialPlatforms = [
    { name: "WhatsApp", icon: <MessageCircle size={15} />, color: "bg-[#25D366]", link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}` },
    { name: "Facebook", icon: <Facebook size={15} />,      color: "bg-[#1877F2]", link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: "X",        icon: <Twitter size={13} />,       color: "bg-black",     link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}` },
    { name: "LinkedIn", icon: <Linkedin size={15} />,      color: "bg-[#0A66C2]", link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg,#c9a27b 0%,#b8895c 50%,#a87648 100%)",
        paddingTop: "var(--navbar-height,72px)",
      }}
    >
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        hotel={{ name: CAFE_DATA.name, location: CAFE_DATA.location, propertyId: 1, media: CAFE_GALLERY_MEDIA }}
        initialImageIndex={initialGalleryIndex}
        galleryData={CAFE_GALLERY_ITEMS}
      />

      {/* ── BODY ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row px-6 md:px-8 lg:px-10 pt-6 pb-6 gap-0 overflow-hidden">

        {/* ════ LEFT PANEL ════ */}
        <div className="flex-1 min-w-0 flex flex-col pr-0 lg:pr-10 overflow-hidden">

          {/* 1. Breadcrumb — pushed down with mt */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#3d1f00]/70 mb-5 mt-2 shrink-0"
          >
            <Link to="/" className="hover:text-[#1e0d00] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-[#1e0d00] font-black">{CAFE_DATA.name}</span>
          </motion.nav>

          {/* 2. Title — SINGLE LINE, font size -20% */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 mb-1"
          >
            <h1
              style={{
                fontFamily: '"Georgia","Times New Roman",serif',
                /* original ~7.2vw → 80% = 5.76vw; original clamp max 6.2rem → 4.96rem */
                fontSize: "clamp(2.1rem, 5.8vw, 4.96rem)",
                lineHeight: 1,
                fontStyle: "italic",
                fontWeight: 900,
                color: "#1e0d00",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              Kennedia Café
            </h1>

            {/* SVG swoosh */}
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
            className="font-black text-[#1e0d00] shrink-0 mb-2"
            style={{ fontSize: "clamp(0.78rem, 1.5vw, 1.05rem)" }}
          >
            Where Every Sip Feels Like a Hug
          </motion.h2>

          {/* 3. Description — max 2 lines, width +40% (400 → 560px) */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="text-[#3d1f00]/80 italic leading-relaxed shrink-0 mb-4"
            style={{
              fontSize: "clamp(0.7rem, 1.15vw, 0.88rem)",
              maxWidth: "560px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            Crafted with love, every blend at Kennedia Café is more than just
            coffee — it's a comforting embrace in a cup. From the first sip to
            the last, our flavors are designed to bring you warmth, comfort, and
            joy, turning everyday moments into something truly special.
          </motion.p>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.42 }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 shrink-0 mb-5"
          >
            <div className="flex items-center gap-1.5 text-[#3d1f00]/70 text-xs font-medium">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[220px]">{CAFE_DATA.location}</span>
            </div>
            <a
              href={mapsLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-black text-red-900 hover:underline"
            >
              <Navigation className="w-3 h-3" /> View Map
            </a>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.48 }}
            className="shrink-0 mb-auto"
          >
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="px-6 py-2.5 rounded-full font-black text-sm tracking-wide text-white transition-all active:scale-95 hover:opacity-90 shadow-lg"
              style={{ background: "#1e0d00" }}
            >
              Explore Now
            </button>
          </motion.div>

          {/* 4. Thumbnail row — overflow-visible + bottom padding so nothing clips */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.56 }}
            className="flex items-end gap-2 shrink-0 overflow-x-auto"
            style={{ paddingBottom: "6px", scrollbarWidth: "none" }}
          >
            {thumbImages.map((img, i) => (
              <button
                key={i}
                onClick={() => handleThumbClick(i)}
                className="relative rounded-xl overflow-hidden focus:outline-none"
                style={{
                  width:  "clamp(56px,8vw,90px)",
                  height: "clamp(56px,8vw,90px)",
                  flexShrink: 0,
                  transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                  border:    activeThumb === i ? "2.5px solid #1e0d00" : "2.5px solid transparent",
                  transform: activeThumb === i ? "scale(1.08)"         : "scale(1)",
                  boxShadow: activeThumb === i ? "0 6px 18px rgba(30,13,0,0.38)" : "0 2px 8px rgba(30,13,0,0.18)",
                }}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                {activeThumb !== i && <div className="absolute inset-0 bg-black/25" />}

                {/* Active: animated progress ring indicator */}
                {activeThumb === i && isAutoPlaying && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-white/60 animate-pulse pointer-events-none" />
                )}
              </button>
            ))}

            {totalImages > 6 && (
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="rounded-xl flex flex-col items-center justify-center font-black text-[#1e0d00] transition-all active:scale-95 shrink-0"
                style={{
                  width: "clamp(56px,8vw,90px)",
                  height: "clamp(56px,8vw,90px)",
                  background: "rgba(30,13,0,0.12)",
                  border: "2px dashed rgba(30,13,0,0.3)",
                }}
              >
                <span className="text-base font-black">+{totalImages - 6}</span>
                <span className="text-[9px] font-semibold opacity-70 mt-0.5">MORE</span>
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
          {/* Pills row — moved down with mt */}
          <div className="flex items-center justify-between shrink-0 px-1 mt-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(255,245,235,0.55)", backdropFilter: "blur(10px)", color: "#3d1f00", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              <Link to="/" className="hover:underline">Home</Link>
              <ChevronRight className="w-2.5 h-2.5 opacity-50" />
              <span className="font-black">{CAFE_DATA.name}</span>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-[10px] font-black text-white"
              style={{ background: "rgba(30,13,0,0.55)", backdropFilter: "blur(10px)" }}
            >
              {totalImages} Photos
            </div>
          </div>

          {/* ── Floating multi-image grid ── */}
          <div className="relative flex-1 min-h-0">

            {/* Companion 1 — top-right, rotated */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`c1-${activeThumb}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1, rotate: 6 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="absolute top-0 right-0 rounded-2xl overflow-hidden cursor-pointer z-10"
                style={{
                  width: "46%", aspectRatio: "4/5",
                  boxShadow: "0 12px 36px rgba(30,13,0,0.32)",
                  transformOrigin: "top right",
                }}
                onClick={() => { setInitialGalleryIndex((activeThumb + 1) % totalImages); setIsGalleryOpen(true); }}
              >
                <img src={companions[0]?.url} alt={companions[0]?.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
              </motion.div>
            </AnimatePresence>

            {/* Companion 2 — bottom-left, rotated */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`c2-${activeThumb}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute bottom-0 left-0 rounded-2xl overflow-hidden cursor-pointer z-10"
                style={{
                  width: "42%", aspectRatio: "4/5",
                  boxShadow: "0 12px 36px rgba(30,13,0,0.32)",
                  transformOrigin: "bottom left",
                }}
                onClick={() => { setInitialGalleryIndex((activeThumb + 2) % totalImages); setIsGalleryOpen(true); }}
              >
                <img src={companions[1]?.url} alt={companions[1]?.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
              </motion.div>
            </AnimatePresence>

            {/* Main card — center, front */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`main-${activeThumb}`}
                initial={{ opacity: 0, scale: 0.93, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-x-[12%] inset-y-[8%] rounded-3xl overflow-hidden cursor-pointer z-20"
                style={{ boxShadow: "0 24px 56px rgba(30,13,0,0.52)" }}
                onClick={() => { setInitialGalleryIndex(activeThumb); setIsGalleryOpen(true); }}
              >
                <img
                  src={mainImg?.url}
                  alt={mainImg?.alt}
                  className="w-full h-full object-cover object-center"
                  draggable={false}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top,rgba(30,13,0,0.55) 0%,transparent 55%)" }} />

                {/* Auto-play progress bar */}
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
                    style={{ fontFamily: '"Georgia",serif', fontSize: "clamp(1rem,2.4vw,1.5rem)", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}
                  >
                    Kennedia<br />Café
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-2.5 h-2.5 text-white/70" />
                    <span className="text-white/70 text-[9px] font-medium">{CAFE_DATA.city}</span>
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

          {/* Share + Bookmark below image grid */}
          <div className="flex items-center justify-center gap-3 shrink-0 pt-1">
            <div className="relative" onMouseEnter={() => setShowShare(true)} onMouseLeave={() => setShowShare(false)}>
              <AnimatePresence>
                {showShare && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -52, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-xl rounded-full px-2 py-1.5 flex gap-1.5 z-50"
                  >
                    {socialPlatforms.map((p, i) => (
                      <motion.a
                        key={p.name} href={p.link} target="_blank" rel="noreferrer"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ scale: 1.15, y: -2 }}
                        className={`${p.color} text-white p-1.5 rounded-full flex items-center justify-center`}
                      >
                        {p.icon}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all active:scale-95"
                style={{ background: "rgba(30,13,0,0.15)", color: "#1e0d00", border: "1px solid rgba(30,13,0,0.2)" }}
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            <button
              onClick={() => setIsBookmarked((b) => !b)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all active:scale-95"
              style={{
                background: isBookmarked ? "rgba(220,38,38,0.18)" : "rgba(30,13,0,0.15)",
                color:      isBookmarked ? "#b91c1c"               : "#1e0d00",
                border:     isBookmarked ? "1px solid rgba(220,38,38,0.35)" : "1px solid rgba(30,13,0,0.2)",
              }}
            >
              <Heart className={`w-3.5 h-3.5 ${isBookmarked ? "fill-red-600" : ""}`} />
              {isBookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </motion.div>

        {/* Mobile: single image */}
        <div className="lg:hidden mt-4 shrink-0 flex flex-col gap-2">
          <div
            className="relative w-full h-44 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => { setInitialGalleryIndex(activeThumb); setIsGalleryOpen(true); }}
            style={{ boxShadow: "0 12px 32px rgba(30,13,0,0.35)" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeThumb}
                src={mainImg?.url} alt={mainImg?.alt}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(30,13,0,0.55) 0%,transparent 60%)" }} />
            <p className="absolute bottom-3 left-4 text-white font-black italic text-base" style={{ fontFamily: '"Georgia",serif' }}>
              Kennedia Café
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black"
              style={{ background: "rgba(30,13,0,0.15)", color: "#1e0d00" }}
            >
              <Share2 className="w-3 h-3" /> Share
            </button>
            <button
              onClick={() => setIsBookmarked((b) => !b)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black"
              style={{ background: isBookmarked ? "rgba(220,38,38,0.18)" : "rgba(30,13,0,0.15)", color: isBookmarked ? "#b91c1c" : "#1e0d00" }}
            >
              <Heart className={`w-3 h-3 ${isBookmarked ? "fill-red-600" : ""}`} /> {isBookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
