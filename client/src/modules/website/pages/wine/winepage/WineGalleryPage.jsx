import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Wine,
  Loader2,
} from "lucide-react";
import { getAllGalleries } from "@/Api/Api";
import { getActiveVisualGalleriesHeader } from "@/Api/RestaurantApi";

const FALLBACK_ITEMS = [
  { id: 1, title: "Estate Cellar", category: "Interior", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80", isHighlighted: false },
  { id: 2, title: "Vintage Red", category: "Brews", img: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80", isHighlighted: true },
  { id: 3, title: "Artisan Pour", category: "Events", img: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80", isHighlighted: false },
  { id: 4, title: "Grand Tasting", category: "Events", img: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800&q=80", isHighlighted: true },
  { id: 5, title: "Bottle Archive", category: "Interior", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", isHighlighted: false },
];

export default function WineGalleryPage({ propertyId }) {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const [galleryHeader, setGalleryHeader] = useState({ header1: "", header2: "", description: "" });
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parallax background text
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  // Fetch header
  useEffect(() => {
    if (!propertyId) return;
    getActiveVisualGalleriesHeader()
      .then((res) => {
        const all = res?.data ?? [];
        const latest = all
          .filter((h) => h.propertyId === propertyId && h.isActive === true)
          .sort((a, b) => b.id - a.id)[0];
        if (latest) {
          setGalleryHeader({
            header1: latest.header1 || "",
            header2: latest.header2 || "",
            description: latest.description || "",
          });
        }
      })
      .catch(() => {});
  }, [propertyId]);

  // Fetch gallery items
  useEffect(() => {
    if (!propertyId) { setLoading(false); return; }
    setLoading(true);
    getAllGalleries({})
      .then((res) => {
        const allContent = res?.data?.content ?? res?.content ?? [];
        const filtered = allContent
          .filter((item) => item.propertyId === propertyId && item.isActive && item.media?.url)
          .map((item, i) => ({
            id: item.id,
            title: item.propertyName || item.categoryName || "Gallery",
            category: item.categoryName
              ? item.categoryName.charAt(0).toUpperCase() + item.categoryName.slice(1).toLowerCase()
              : "Other",
            img: item.media.url,
            isHighlighted: i % 3 === 0,
          }));
        setGalleryItems(filtered.length > 0 ? filtered : FALLBACK_ITEMS);
      })
      .catch(() => setGalleryItems(FALLBACK_ITEMS))
      .finally(() => setLoading(false));
  }, [propertyId]);

  // Dynamic category list from data
  const categories = useMemo(() => {
    const unique = ["All", ...new Set(galleryItems.map((i) => i.category))];
    return unique;
  }, [galleryItems]);

  const filteredItems = useMemo(
    () => (activeCategory === "All" ? galleryItems : galleryItems.filter((i) => i.category === activeCategory)),
    [galleryItems, activeCategory]
  );

  // Lightbox
  const openLightbox = (id) => {
    const idx = filteredItems.findIndex((item) => item.id === id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => { setLightboxIndex(null); document.body.style.overflow = ""; };
  const nextImage = (e) => { e?.stopPropagation(); setLightboxIndex((p) => (p + 1) % filteredItems.length); };
  const prevImage = (e) => { e?.stopPropagation(); setLightboxIndex((p) => (p - 1 + filteredItems.length) % filteredItems.length); };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[750px] overflow-hidden bg-[#FAF8F4] py-24 dark:bg-[#050505] transition-colors duration-700"
    >
      {/* Background parallax text */}
      <motion.div
        style={{ x: bgTextX }}
        className="pointer-events-none absolute top-1/2 left-0 z-0 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[18rem] font-black italic uppercase text-stone-900/[0.03] dark:text-white/[0.02]"
      >
        {galleryHeader.header1 || "Vintage Archive"}
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">

          {/* ── LEFT: EDITORIAL ── */}
          <div className="lg:col-span-4">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A2A]/10 dark:bg-[#C8956A]/10">
                <Wine className="h-5 w-5 text-[#8B1A2A] dark:text-[#C8956A]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B1A2A] dark:text-[#C8956A]">
                Visual Registry
              </span>
            </div>

            <h2 className="mb-6 font-serif text-5xl leading-[1.1] text-stone-900 md:text-7xl dark:text-stone-100">
              {galleryHeader.header1 || "The"} <br />
              <span className="italic text-stone-400 dark:text-white/30 underline decoration-[#8B1A2A]/20 underline-offset-[12px]">
                {galleryHeader.header2 || "Sommelier's"}
              </span>{" "}
              <br />
              {!galleryHeader.header1 && !galleryHeader.header2 && "Archive"}
            </h2>

            <p className="mb-10 max-w-sm text-lg font-light leading-relaxed text-stone-500 dark:text-stone-400">
              {galleryHeader.description ||
                "A curated visual journey through our private cellars, artisan brews, and the timeless heritage of Kennedia Estates."}
            </p>

            {/* Category pills */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      activeCategory === cat
                        ? "bg-[#8B1A2A] text-white shadow-lg shadow-[#8B1A2A]/20"
                        : "bg-white/50 text-stone-400 hover:bg-stone-100 dark:bg-white/5 dark:text-stone-500 dark:hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: CAROUSEL TRACKS ── */}
          <div
            className="group lg:col-span-8 relative h-[600px] overflow-hidden rounded-[3.5rem] border border-stone-200 bg-white/40 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.02]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute top-10 left-10 z-20 h-6 w-6 border-t-2 border-l-2 border-[#8B1A2A]/40" />
            <div className="absolute bottom-10 right-10 z-20 h-6 w-6 border-b-2 border-r-2 border-[#8B1A2A]/40" />
            <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8B1A2A]" size={40} />
              </div>
            ) : (
              <div className="relative flex h-full flex-col justify-center gap-8 py-10">
                <div className="relative flex h-[240px] items-center">
                  <MarqueeTrack items={filteredItems} direction="right" isPaused={isPaused} onOpen={openLightbox} />
                </div>
                <div className="relative flex h-[240px] items-center">
                  <MarqueeTrack items={filteredItems.slice().reverse()} direction="left" isPaused={isPaused} onOpen={openLightbox} />
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-gradient-to-r from-white dark:from-[#050505] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-gradient-to-l from-white dark:from-[#050505] to-transparent" />
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-950/95 backdrop-blur-2xl"
            onClick={closeLightbox}
          >
            <div className="absolute top-6 right-6 flex gap-4">
              <button
                onClick={closeLightbox}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-all hover:bg-white/20 cursor-pointer"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="relative flex h-full w-full items-center justify-center px-4 md:px-20">
              <button
                onClick={prevImage}
                className="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/20 hover:scale-110 cursor-pointer"
              >
                <ChevronLeft size={32} />
              </button>

              <motion.div
                key={filteredItems[lightboxIndex]?.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl"
                style={{ maxWidth: "min(1200px, 90vw)", maxHeight: "80vh" }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filteredItems[lightboxIndex]?.img}
                  alt={filteredItems[lightboxIndex]?.title}
                  className="h-full w-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-8 pt-20 text-center">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.4em] text-[#C8956A]">
                    {filteredItems[lightboxIndex]?.category}
                  </p>
                  <h3 className="font-serif text-3xl text-white">{filteredItems[lightboxIndex]?.title}</h3>
                </div>
              </motion.div>

              <button
                onClick={nextImage}
                className="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/20 hover:scale-110 cursor-pointer"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-widest text-stone-500">
              {lightboxIndex + 1} / {filteredItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function MarqueeTrack({ items, direction = "left", isPaused, onOpen }) {
  const duplicated = useMemo(() => [...items, ...items, ...items], [items]);
  return (
    <motion.div
      animate={{ x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"] }}
      transition={{ duration: 25, ease: "linear", repeat: Infinity, paused: isPaused }}
      className="flex gap-6 whitespace-nowrap"
    >
      {duplicated.map((item, idx) => (
        <GalleryCard key={`${item.id}-${idx}`} item={item} onOpen={() => onOpen(item.id)} />
      ))}
    </motion.div>
  );
}

function GalleryCard({ item, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className={`group relative shrink-0 overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100 shadow-xl transition-all duration-700 hover:z-30 dark:border-white/10 dark:bg-[#1A0C13] cursor-pointer ${
        item.isHighlighted ? "h-[320px] w-[240px] -rotate-1" : "h-[240px] w-[180px]"
      } hover:scale-110 hover:rotate-0`}
    >
      <img
        src={item.img}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {item.isHighlighted && (
        <div className="absolute inset-0 border-2 border-[#8B1A2A]/40 mix-blend-overlay" />
      )}
      <div className="absolute inset-0 bg-stone-900/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 flex translate-y-4 flex-col items-center justify-center p-4 text-center opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mb-3 rounded-full bg-white/20 p-2 backdrop-blur-md">
          <Maximize2 size={16} className="text-white" />
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#C8956A]">{item.category}</p>
        <h4 className="line-clamp-2 font-serif text-sm text-white">{item.title}</h4>
      </div>
      {item.isHighlighted && (
        <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1 backdrop-blur-md">
          <Sparkles size={8} className="text-[#C8956A]" />
          <span className="text-[7px] font-black uppercase tracking-widest text-white">Curated</span>
        </div>
      )}
    </button>
  );
}
