import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Wine_GALLERY_ITEMS, Wine_GALLERY_MEDIA } from "./WineGalleryData";

const Wine_DATA = {
  name: "Kennedia Wine",
  location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
  city: "Ghaziabad",
};

const mapsLink = "https://www.google.com/maps/search/Kennedia+Wine+Ghaziabad";

const MAX_VISIBLE = 7;

export default function WineBanner() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [fanIndex, setFanIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const totalImages = Wine_GALLERY_MEDIA.length;
  const thumbImages = Wine_GALLERY_MEDIA.slice(0, Math.min(6, totalImages));
  const mainImg = Wine_GALLERY_MEDIA[activeThumb];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const t = setInterval(() => setActiveThumb((p) => (p + 1) % totalImages), 3500);
    return () => clearInterval(t);
  }, [isAutoPlaying, totalImages]);

  const handleThumbClick = (i) => {
    setActiveThumb(i);
    setInitialGalleryIndex(i);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const socialPlatforms = [
    { name: "WhatsApp", icon: <MessageCircle size={15} />, color: "bg-[#25D366]", link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}` },
    { name: "Facebook", icon: <Facebook size={15} />, color: "bg-[#1877F2]", link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: "X", icon: <Twitter size={13} />, color: "bg-black", link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}` },
    { name: "LinkedIn", icon: <Linkedin size={15} />, color: "bg-[#0A66C2]", link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  const fanFiltered = useMemo(
    () =>
      Wine_GALLERY_ITEMS.map((item) => ({
        id: item.id,
        category:
          item.categoryName.charAt(0) + item.categoryName.slice(1).toLowerCase(),
        image: item.media.url,
        name: item.media.alt || item.media.fileName || item.propertyName,
      })),
    [],
  );

  const fanPrev = useCallback(() => {
    setFanIndex((i) => (i - 1 + fanFiltered.length) % fanFiltered.length);
  }, [fanFiltered.length]);

  const fanNext = useCallback(() => {
    setFanIndex((i) => (i + 1) % fanFiltered.length);
  }, [fanFiltered.length]);

  const startIdx = Math.max(0, Math.min(fanIndex - 3, fanFiltered.length - MAX_VISIBLE));
  const visibleItems = fanFiltered.slice(startIdx, startIdx + MAX_VISIBLE);
  const centerLocal = fanIndex - startIdx;
  const angleStep = Math.min(16, 72 / Math.max(visibleItems.length - 1, 1));

  return (
    <div
      className="flex min-h-[100svh] flex-col overflow-x-hidden bg-[#F8F8F6] transition-colors duration-300 dark:bg-[#14100b] lg:h-screen lg:overflow-hidden"
      style={{ paddingTop: "var(--navbar-height,72px)" }}
    >
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        hotel={{ name: Wine_DATA.name, location: Wine_DATA.location, propertyId: 1, media: Wine_GALLERY_MEDIA }}
        initialImageIndex={initialGalleryIndex}
        galleryData={Wine_GALLERY_ITEMS}
      />

      <div className="flex flex-1 flex-col gap-6 overflow-visible px-4 pb-5 pt-4 sm:px-6 md:px-8 lg:flex-row lg:gap-0 lg:overflow-hidden lg:px-10">
        <div className="flex min-w-0 flex-1 flex-col overflow-visible pr-0 lg:overflow-hidden lg:pr-10">
          <div className="hidden lg:block" style={{ flex: "0.25", minHeight: 0 }} />

          <div className="flex flex-col shrink-0">
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold sm:mb-4 sm:text-xs"
            >
              <Link
                to="/"
                className="text-[#7a5c3a] dark:text-[#a07850] hover:text-[#3d1f00] dark:hover:text-[#f0dfc0] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-[#7a5c3a]/50 dark:text-[#a07850]/50" />
              <Link
                to="/Wine-homepage"
                className="text-[#7a5c3a] dark:text-[#a07850] hover:text-[#3d1f00] dark:hover:text-[#f0dfc0] transition-colors"
              >
                Wines
              </Link>
              <ChevronRight className="w-3 h-3 text-[#7a5c3a]/50 dark:text-[#a07850]/50" />
              <span className="text-[#3d1f00] dark:text-[#f0dfc0] font-black">{Wine_DATA.name}</span>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-1"
            >
              <h1
                className="max-w-[12ch] text-[#1e0d00] dark:text-[#f0dfc0] sm:max-w-none"
                style={{
                  fontFamily: '"Georgia","Times New Roman",serif',
                  fontSize: "clamp(2rem, 8.2vw, 4.96rem)",
                  lineHeight: 0.98,
                  fontStyle: "italic",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                One Night In <br />Kennedia Blu
              </h1>
              <svg
                viewBox="0 0 320 22"
                style={{ width: "clamp(130px,32vw,290px)", height: "14px", display: "block", marginTop: "4px", marginBottom: "12px" }}
                fill="none"
              >
                <path d="M4 16 C 40 4, 100 20, 160 11 S 260 2, 316 13" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" />
                <path d="M20 19 C 70 8, 130 18, 200 14 S 280 6, 312 16" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mb-2 font-black text-[#1e0d00] dark:text-[#e8d0b0]"
              style={{ fontSize: "clamp(0.78rem, 1.5vw, 1.05rem)" }}
            >
              Where Every Sip Feels Like a Hug
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="mb-4 max-w-xl text-[#5a3e28] dark:text-[#b09070] italic leading-relaxed"
              style={{
                fontSize: "clamp(0.82rem, 2.5vw, 0.95rem)",
                maxWidth: "560px",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Crafted with love, every blend at Kennedia Cafe is more than just
              coffee - it's a comforting embrace in a cup. From the first sip to
              the last, our flavors are designed to bring you warmth, comfort, and
              joy, turning everyday moments into something truly special.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.42 }}
              className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-[#7a5c3a] dark:text-[#a07850]">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[240px] sm:max-w-[320px]">{Wine_DATA.location}</span>
              </div>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-black text-red-700 dark:text-red-400 hover:underline"
              >
                <Navigation className="w-3 h-3" /> View Map
              </a>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
            >
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="rounded-full bg-[#1e0d00] px-5 py-2.5 text-sm font-black tracking-wide text-white shadow-lg transition-all active:scale-95 hover:opacity-90 dark:bg-[#f0dfc0] dark:text-[#1e0d00] sm:px-6"
              >
                Explore Now
              </button>
            </motion.div> */}
          </div>

          <div className="hidden min-h-0 flex-1 lg:block" />

          {/* <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.56 }}
            className="flex shrink-0 items-end gap-2 overflow-x-auto pt-1"
            style={{ paddingBottom: "4px", scrollbarWidth: "none" }}
          >
            {thumbImages.map((img, i) => (
              <button
                key={i}
                onClick={() => handleThumbClick(i)}
                className="relative rounded-xl overflow-hidden focus:outline-none"
                style={{
                  width: "clamp(56px,8vw,90px)",
                  height: "clamp(56px,8vw,90px)",
                  flexShrink: 0,
                  transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                  border: activeThumb === i ? "2.5px solid #1e0d00" : "2.5px solid transparent",
                  transform: activeThumb === i ? "scale(1.08)" : "scale(1)",
                  boxShadow: activeThumb === i
                    ? "0 6px 18px rgba(30,13,0,0.35)"
                    : "0 2px 8px rgba(30,13,0,0.14)",
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
                className="rounded-xl flex flex-col items-center justify-center font-black transition-all active:scale-95 shrink-0 text-[#3d1f00] dark:text-[#e8d0b0]"
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
          </motion.div> */}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-[40%] shrink-0 flex-col overflow-hidden"
        >
          <div
            className="flex-1 min-h-0 relative flex items-end justify-center"
            style={{ perspective: "1400px" }}
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, i) => {
                const offset = i - centerLocal;
                const isFront = i === centerLocal;
                const dist = Math.abs(offset);
                const angle = offset * angleStep;
                const scale = isFront ? 1.0 : Math.max(0.75, 1 - dist * 0.07);
                const brightness = isFront ? 1 : Math.max(0.4, 1 - dist * 0.18);
                const zIndex = 10 - dist;
                const translateX = offset * 14;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{
                      opacity: 1,
                      scale,
                      rotate: isFront ? 0 : angle,
                      x: isFront ? "-50%" : `calc(-50% + ${translateX}px)`,
                      filter: `brightness(${brightness})`,
                    }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    transition={{ type: "spring", stiffness: 240, damping: 26 }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      zIndex,
                      width: "clamp(190px, 23vw, 270px)",
                      height: "clamp(300px, 38vw, 440px)",
                      transformOrigin: "50% 115%",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (isFront) {
                        setLightboxIndex(startIdx + i);
                      } else {
                        setFanIndex(startIdx + i);
                      }
                    }}
                  >
                    <div
                      className="w-full h-full overflow-hidden"
                      style={{
                        borderRadius: "22px",
                        boxShadow: isFront
                          ? "0 32px 80px rgba(30,13,0,0.5), 0 10px 24px rgba(30,13,0,0.3)"
                          : "0 16px 48px rgba(30,13,0,0.35), 0 4px 12px rgba(30,13,0,0.2)",
                      }}
                    >
                      <div className="w-full h-full overflow-hidden rounded-[22px]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>

                      <div
                        className="px-4 flex flex-col justify-center bg-[#f5f0e8] dark:bg-[#1e1208]"
                        style={{ height: "25%" }}
                      >
                        <p
                          className="uppercase tracking-[0.22em] text-[#c8945a] font-semibold mb-1"
                          style={{ fontSize: "clamp(8px, 0.7vw, 10px)" }}
                        >
                          {item.category}
                        </p>
                        <p
                          className="text-[#1e0d00] dark:text-[#f0dfc0] font-semibold leading-snug"
                          style={{
                            fontFamily: '"Georgia","Times New Roman",serif',
                            fontSize: "clamp(14px, 1.35vw, 18px)",
                          }}
                        >
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2 py-3">
            <div className="flex gap-2">
              <button
                onClick={fanPrev}
                className="w-9 h-9 rounded-full border border-[#1e0d00]/20 dark:border-white/15 bg-[#f5f0e8] dark:bg-white/7 text-[#3d1f00] dark:text-white/80 flex items-center justify-center transition-all hover:bg-[#e8d8c4] dark:hover:bg-white/15 text-sm font-semibold shadow-sm"
              >
                ←
              </button>
              <button
                onClick={fanNext}
                className="w-9 h-9 rounded-full border border-[#1e0d00]/20 dark:border-white/15 bg-[#f5f0e8] dark:bg-white/7 text-[#3d1f00] dark:text-white/80 flex items-center justify-center transition-all hover:bg-[#e8d8c4] dark:hover:bg-white/15 text-sm font-semibold shadow-sm"
              >
                →
              </button>
            </div>

            <div className="flex gap-1 items-center">
              {fanFiltered.slice(0, Math.min(fanFiltered.length, 10)).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFanIndex(i)}
                  className="h-[3px] rounded-full transition-all duration-300"
                  style={{
                    width: i === fanIndex ? 20 : 5,
                    background: i === fanIndex ? "#1e0d00" : "rgba(30,13,0,0.22)",
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
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
                          key={p.name}
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
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
                <button className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all active:scale-95 text-[#3d1f00] dark:text-[#e8d0b0] bg-[#e8d8c4]/60 dark:bg-white/10 border border-[#c4a882]/40 dark:border-white/15 hover:bg-[#dcc9af]/80 dark:hover:bg-white/15">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>

              <button
                onClick={() => setIsBookmarked((b) => !b)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black transition-all active:scale-95 ${isBookmarked
                  ? "bg-red-100/60 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300/50 dark:border-red-700/30"
                  : "bg-[#e8d8c4]/60 dark:bg-white/10 text-[#3d1f00] dark:text-[#e8d0b0] border border-[#c4a882]/40 dark:border-white/15 hover:bg-[#dcc9af]/80 dark:hover:bg-white/15"
                  }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isBookmarked ? "fill-red-600 dark:fill-red-400" : ""}`} />
                {isBookmarked ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-1 flex shrink-0 flex-col gap-2 lg:hidden">
          <div
            className="relative h-52 w-full cursor-pointer overflow-hidden rounded-2xl sm:h-64"
            onClick={() => { setInitialGalleryIndex(activeThumb); setIsGalleryOpen(true); }}
            style={{ boxShadow: "0 12px 32px rgba(30,13,0,0.28)" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeThumb}
                src={mainImg?.url}
                alt={mainImg?.alt}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(20,10,5,0.55) 0%,transparent 60%)" }} />
            <p className="absolute bottom-3 left-4 text-base font-black italic text-white" style={{ fontFamily: '"Georgia",serif' }}>Kennedia Wine</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-[#e8d8c4]/70 dark:bg-white/10 text-[#3d1f00] dark:text-[#e8d0b0]">
              <Share2 className="w-3 h-3" /> Share
            </button>
            <button
              onClick={() => setIsBookmarked((b) => !b)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black ${isBookmarked ? "bg-red-100 dark:bg-red-900/25 text-red-700 dark:text-red-400" : "bg-[#e8d8c4]/70 dark:bg-white/10 text-[#3d1f00] dark:text-[#e8d0b0]"}`}
            >
              <Heart className={`w-3 h-3 ${isBookmarked ? "fill-red-600" : ""}`} /> {isBookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && fanFiltered[lightboxIndex] && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/12 hover:bg-white/22 text-white flex items-center justify-center transition-colors text-lg"
            >
              ✕
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + fanFiltered.length) % fanFiltered.length); }}
              className="absolute left-5 w-10 h-10 rounded-full bg-white/12 hover:bg-white/22 text-white flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={fanFiltered[lightboxIndex].image}
              alt={fanFiltered[lightboxIndex].name}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % fanFiltered.length); }}
              className="absolute right-5 w-10 h-10 rounded-full bg-white/12 hover:bg-white/22 text-white flex items-center justify-center transition-colors"
            >
              →
            </button>
            <div className="absolute bottom-5 text-white/50 text-sm font-light">
              {lightboxIndex + 1} / {fanFiltered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
