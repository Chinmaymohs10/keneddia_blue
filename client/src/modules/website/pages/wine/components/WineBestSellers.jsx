import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ImageOff,
  MapPin,
  Star,
  ChevronDown,
  Building2,
  MoveRight,
} from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "919999999999"; // ← Replace with actual number

// ─── TYPE ACCENTS ─────────────────────────────────────────────────────────────
const TYPE_ACCENTS = {
  Red:       { color: "#8B1A2A", light: "#FDF2F4", dark: "#3D0A10", dot: "#C4485A" },
  White:     { color: "#8A6A18", light: "#FBF7ED", dark: "#3A2C08", dot: "#C9A030" },
  Rosé:      { color: "#A8456A", light: "#FDF0F5", dark: "#3D1428", dot: "#D4789A" },
  Champagne: { color: "#9A7A10", light: "#FBF8E8", dark: "#3C3008", dot: "#D4B035" },
  Sparkling: { color: "#2E7A8E", light: "#EDF6F9", dark: "#0D2E35", dot: "#52B0C8" },
};

// ─── FILTER OPTIONS ───────────────────────────────────────────────────────────
const LOCATIONS = [
  "All Locations",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Kolkata",
];

const WINE_TYPES = ["All Types", "Red", "White", "Rosé", "Champagne", "Sparkling"];

// ─── WINE DATA ────────────────────────────────────────────────────────────────
const WINES = [
  {
    id: 1,
    property: "The Cellar Lounge",
    location: "Delhi",
    name: "Château Margaux",
    subtitle: "Premier Grand Cru Classé",
    type: "Red",
    grape: "Cabernet Sauvignon",
    origin: "Bordeaux, France",
    vintage: "2018",
    abv: "13.5%",
    rating: 4.9,
    tasting: "Opulent dark berry, cedar, violet, and perfectly polished tannins with extraordinary length.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85",
    pairing: "Grilled Ribeye, Lamb",
    servingTemp: "18°C",
    body: "Full Body"
  },
  {
    id: 2,
    property: "Vine & Dine",
    location: "Mumbai",
    name: "Veuve Clicquot",
    subtitle: "Yellow Label Brut",
    type: "Champagne",
    grape: "Pinot Noir & Chardonnay",
    origin: "Reims, France",
    vintage: "NV",
    abv: "12%",
    rating: 4.8,
    tasting: "Toasty brioche, fresh apple and a persistent, pinpoint mousse that lingers beautifully.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
    pairing: "Oysters, Fried Chicken",
    servingTemp: "8°C",
    body: "Light & Crisp"
  },
  {
    id: 3,
    property: "Terroir Room",
    location: "Bangalore",
    name: "Cloudy Bay",
    subtitle: "Sauvignon Blanc",
    type: "White",
    grape: "Sauvignon Blanc",
    origin: "Marlborough, NZ",
    vintage: "2022",
    abv: "13%",
    rating: 4.6,
    tasting: "Zesty passionfruit, fresh herbs, citrus peel on a crisp mineral-driven finish.",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85",
    pairing: "Goat Cheese, Seafood",
    servingTemp: "10°C",
    body: "Medium Body"
  },
  {
    id: 4,
    property: "The Wine Bar",
    location: "Hyderabad",
    name: "Whispering Angel",
    subtitle: "Côtes de Provence",
    type: "Rosé",
    grape: "Grenache & Cinsault",
    origin: "Provence, France",
    vintage: "2023",
    abv: "13%",
    rating: 4.5,
    tasting: "Pale and elegant — wild strawberry, white peach, bone-dry with mineral freshness.",
    image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&q=85",
    pairing: "Salads, Grilled Poultry",
    servingTemp: "12°C",
    body: "Light Body"
  },
  {
    id: 5,
    property: "Blanc & Rouge",
    location: "Pune",
    name: "Antinori Tignanello",
    subtitle: "Super Tuscan Red",
    type: "Red",
    grape: "Sangiovese & Cabernet",
    origin: "Tuscany, Italy",
    vintage: "2019",
    abv: "14%",
    rating: 4.7,
    tasting: "Dark plum, tobacco, dried violet and characteristic earthy Sangiovese depth.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85",
    pairing: "Osso Buco, Hard Cheeses",
    servingTemp: "18°C",
    body: "Full Body"
  },
  {
    id: 6,
    property: "Clos de Kennedia",
    location: "Kolkata",
    name: "Moët & Chandon",
    subtitle: "Impérial Brut",
    type: "Champagne",
    grape: "Pinot Noir, Chardonnay",
    origin: "Épernay, France",
    vintage: "NV",
    abv: "12%",
    rating: 4.7,
    tasting: "Green apple, white florals and brioche note with refined, silky effervescence.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
    pairing: "Sushi, White Fruit Tarts",
    servingTemp: "9°C",
    body: "Medium Body"
  },
  {
    id: 7,
    property: "The Cellar Lounge",
    location: "Delhi",
    name: "Caymus Vineyards",
    subtitle: "Special Selection Cabernet",
    type: "Red",
    grape: "Cabernet Sauvignon",
    origin: "Napa Valley, USA",
    vintage: "2020",
    abv: "14.5%",
    rating: 4.9,
    tasting: "Plush blackcurrant, mocha, cassis, and a velvety, seamlessly long finish.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85",
    pairing: "Steak House Cuts",
    servingTemp: "18°C",
    body: "Extra Full"
  },
  {
    id: 8,
    property: "Terroir Room",
    location: "Bangalore",
    name: "Kim Crawford",
    subtitle: "Reserve Sauvignon Blanc",
    type: "White",
    grape: "Sauvignon Blanc",
    origin: "Marlborough, NZ",
    vintage: "2023",
    abv: "12.5%",
    rating: 4.4,
    tasting: "Vibrant grapefruit, tropical fruit notes and a lively, refreshing clean finish.",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85",
    pairing: "Asparagus, Fresh Prawns",
    servingTemp: "8°C",
    body: "Light Body"
  }
];

// ─── WINE IMAGE ───────────────────────────────────────────────────────────────
function WineImage({ src, alt, className = "" }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored)
    return (
      <div className={`flex items-center justify-center bg-stone-100 dark:bg-zinc-900 ${className}`}>
        <ImageOff size={20} className="text-stone-300 dark:text-zinc-700" />
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={9}
          className={
            s <= Math.round(rating)
              ? "fill-amber-500 text-amber-500"
              : "text-stone-300 dark:text-zinc-700"
          }
        />
      ))}
      <span className="ml-1 text-[11px] font-bold tabular-nums text-amber-600 dark:text-amber-400">
        {rating}
      </span>
    </div>
  );
}

// ─── STYLED FILTER SELECT ─────────────────────────────────────────────────────
function FilterSelect({ value, options, onChange, label, accentColor }) {
  return (
    <div className="relative">
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.22em] text-stone-400 dark:text-stone-600">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full min-w-[148px] cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-stone-800 shadow-sm outline-none transition-all focus:border-stone-400 dark:border-white/10 dark:bg-[#1A0C12] dark:text-stone-200 dark:focus:border-white/20"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
        />
      </div>
    </div>
  );
}

// ─── HOVER QUERY POPUP ────────────────────────────────────────────────────────
function HoverQueryPopup({ wine, accent, onExplore }) {
  const message = encodeURIComponent(
    `Hi! I'd like to enquire about *${wine.name}* (${wine.subtitle}) available at *${wine.property}, ${wine.location}*. Could you share more details and pricing?`
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 bottom-0 z-20 overflow-hidden rounded-b-[1.75rem]"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(8,3,6,0.94) 0%, rgba(8,3,6,0.72) 55%, transparent 100%)`,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />
      <div className="relative flex items-center justify-between px-5 py-4">
        <div className="min-w-0">
          <p className="mb-0.5 truncate text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: accent.dot }}>
            {wine.property} · {wine.location}
          </p>
          <p className="truncate font-serif text-[14px] leading-tight text-white/90">
            {wine.name}
          </p>
        </div>

        <div className="ml-4 flex shrink-0 items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onExplore(); }}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-[#8B1A2A] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-black hover:scale-105"
          >
            Explore
          </button>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:bg-white/10"
            aria-label={`Enquire about ${wine.name}`}
          >
            Query
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── WINE CARD (content-first landscape) ──────────────────────────────────────
function WineCard({ wine, index }) {
  const [hovered, setHovered] = useState(false);
  const accent = TYPE_ACCENTS[wine.type] || TYPE_ACCENTS.Red;
  const navigate = useNavigate();

  const generateSlug = (text) => 
    text?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');

  const handleExplore = () => {
    const citySlug = wine.location.toLowerCase();
    const propSlug = generateSlug(wine.property);
    navigate(`/wine-detail/${citySlug}/${propSlug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleExplore}
      className="group relative flex h-full cursor-pointer select-none overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-[#1A0C12]"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-[1.75rem] transition-all duration-500"
        style={{
          background: hovered
            ? `linear-gradient(to bottom, ${accent.dot}, ${accent.color})`
            : "transparent",
        }}
      />

      <div className="flex h-full gap-0 overflow-hidden">
        {/* Image column — compact, secondary */}
        <div className="relative shrink-0 overflow-hidden" style={{ width: 184 }}>
          <WineImage
            src={wine.image}
            alt={wine.name}
            className="h-full w-full transition-transform duration-700"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
          />
          {/* Gradient blend into card */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/80 dark:to-[#1A0C12]/80" />
          {/* Top-left type dot */}
          <div
            className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: accent.dot }}
          />
        </div>

        {/* Content column — primary */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-5 text-center items-center">
          {/* Top: property + type */}
          <div className="mb-4 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                const citySlug = wine.location.toLowerCase();
                const propSlug = generateSlug(wine.property);
                navigate(`/wine-detail/${citySlug}/${propSlug}`); 
              }}
              className="flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-70 active:opacity-50"
              title="Explore this property"
            >
              <Building2 size={10} style={{ color: accent.color }} className="shrink-0" />
              <span
                className="text-[9px] font-black uppercase tracking-[0.22em]"
                style={{ color: accent.color }}
              >
                {wine.property} · {wine.location}
              </span>
            </button>

            {/* Wine name */}
            <h3 className="font-serif text-[1.25rem] leading-tight text-stone-950 dark:text-stone-100">
              {wine.name}
            </h3>
            <p className="text-[11px] font-medium italic text-stone-400 dark:text-stone-500">
              {wine.subtitle}
            </p>
          </div>

          {/* Type badge */}
          <div className="mb-4">
            <span
              className="rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest"
              style={{
                color: accent.color,
                backgroundColor: accent.bg,
                border: `1px solid ${accent.color}30`,
              }}
            >
              {wine.type}
            </span>
          </div>

          {/* Middle: rating + meta badges */}
          <div className="mb-4 flex flex-col items-center gap-2">
            <StarRating rating={wine.rating} />
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-400 dark:bg-white/5 dark:text-stone-500">
                {wine.vintage} · {wine.abv} ABV
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-400 dark:bg-white/5 dark:text-stone-500">
                {wine.body}
              </span>
            </div>
          </div>

          {/* Bottom: tasting + origin */}
          <div className="w-full space-y-4">
            <p className="mx-auto max-w-[220px] line-clamp-3 text-[11px] italic leading-relaxed text-stone-400 dark:text-stone-500">
              &ldquo;{wine.tasting}&rdquo;
            </p>
            
            <div className="mt-auto grid w-full grid-cols-2 gap-3 border-t border-stone-100 pt-4 dark:border-white/5">
              <div className="space-y-0.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-stone-300 dark:text-stone-700">Origin</p>
                <p className="truncate text-[10px] font-bold text-stone-700 dark:text-stone-300">{wine.origin}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-stone-300 dark:text-stone-700">Pairing</p>
                <p className="truncate text-[10px] font-bold text-stone-700 dark:text-stone-300">{wine.pairing}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover query popup */}
      <AnimatePresence>
        {hovered && (
          <HoverQueryPopup 
            key="popup" 
            wine={wine} 
            accent={accent} 
            onExplore={() => {
              const citySlug = wine.location.toLowerCase();
              const propSlug = generateSlug(wine.property);
              navigate(`/wine-detail/${citySlug}/${propSlug}`);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────
const CARD_W = 484; // card width (468) + gap (16)
const SCROLL_SPEED = 38; // px per second — slow ambient drift

function WineCarousel({ wines }) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // ── sync nav state on scroll ──
  const syncState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    setActiveIndex(Math.min(Math.round(el.scrollLeft / CARD_W), wines.length - 1));
  }, [wines.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncState();
    el.addEventListener("scroll", syncState, { passive: true });
    return () => el.removeEventListener("scroll", syncState);
  }, [syncState, wines]);

  // ── auto-scroll via requestAnimationFrame ──
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const tick = (timestamp) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimeRef.current, 60) / 1000;
      lastTimeRef.current = timestamp;

      if (!pausedRef.current) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          if (el.scrollLeft >= maxScroll - 1) {
            // seamless loop: jump back silently
            el.scrollLeft = 0;
          } else {
            el.scrollLeft += SCROLL_SPEED * dt;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [wines]);

  // ── pause / resume helpers ──
  const pause = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const scheduleResume = useCallback((delay = 2200) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      lastTimeRef.current = null; // reset so no jump
    }, delay);
  }, []);

  // ── manual navigation ──
  const scroll = (dir) => {
    pause();
    trackRef.current?.scrollBy({ left: dir * CARD_W, behavior: "smooth" });
    scheduleResume(3000);
  };

  const scrollTo = (idx) => {
    pause();
    trackRef.current?.scrollTo({ left: idx * CARD_W, behavior: "smooth" });
    scheduleResume(3000);
  };

  const visibleDots = Math.min(wines.length, 8);

  if (wines.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-stone-400 dark:text-stone-600">
        No wines match this filter combination.
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={pause}
      onMouseLeave={() => scheduleResume(1800)}
    >
      {/* Left fade mask */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-[340px] w-20 transition-opacity duration-300"
        style={{
          background: "linear-gradient(to right, #FAF8F4 0%, transparent 100%)",
          opacity: canLeft ? 1 : 0,
        }}
      />
      {/* Right fade mask — always visible to hint at more cards */}
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-[340px] w-28"
        style={{ background: "linear-gradient(to left, #FAF8F4 20%, transparent 100%)" }}
      />

      {/* Dark-mode fade masks */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[340px] w-20 dark:block transition-opacity duration-300"
        style={{
          background: "linear-opacity(to right, #0D0508 0%, transparent 100%)",
          opacity: canLeft ? 1 : 0,
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 hidden h-[340px] w-28 dark:block"
        style={{ background: "linear-gradient(to left, #0D0508 20%, transparent 100%)" }}
      />

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "none" }}
      >
        <div className="shrink-0" style={{ width: 2 }} />

        {wines.map((wine, i) => (
          <div
            key={wine.id}
            className="shrink-0"
            style={{ width: 468, height: 340 }}
          >
            <WineCard wine={wine} index={i} />
          </div>
        ))}

        <div className="shrink-0" style={{ width: 48 }} />
      </div>

      {/* Navigation bar */}
      <div className="mt-5 flex items-center justify-between px-1">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {wines.slice(0, visibleDots).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to wine ${i + 1}`}
              className="cursor-pointer rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 22 : 6,
                height: 6,
                backgroundColor:
                  i === activeIndex ? "#8B1A2A" : "rgba(139,26,42,0.20)",
              }}
            />
          ))}
          {wines.length > visibleDots && (
            <span className="ml-1 text-[10px] text-stone-400 dark:text-stone-600">
              +{wines.length - visibleDots}
            </span>
          )}
        </div>

        {/* Count + arrows */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold tabular-nums text-stone-400 dark:text-stone-600">
            {activeIndex + 1} / {wines.length}
          </span>
          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={() => scroll(-1)}
              disabled={!canLeft}
              whileHover={canLeft ? { scale: 1.06 } : {}}
              whileTap={canLeft ? { scale: 0.93 } : {}}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-all disabled:opacity-25 dark:border-white/10 dark:bg-[#1A0C12]"
              aria-label="Previous"
            >
              <ChevronLeft size={16} className="text-stone-700 dark:text-stone-300" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => scroll(1)}
              disabled={!canRight}
              whileHover={canRight ? { scale: 1.06 } : {}}
              whileTap={canRight ? { scale: 0.93 } : {}}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-all disabled:opacity-25 dark:border-white/10 dark:bg-[#1A0C12]"
              aria-label="Next"
            >
              <ChevronRight size={16} className="text-stone-700 dark:text-stone-300" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMMON WHATSAPP BUTTON (fixed — visible across entire homepage) ───────────
function CommonWhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="fixed bottom-8 right-8 z-50 flex items-center justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 14, scaleX: 0.88 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            exit={{ opacity: 0, x: 14, scaleX: 0.88 }}
            style={{ originX: 1 }}
            className="mr-3 overflow-hidden rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-2xl dark:border-white/10 dark:bg-[#1A0C12]"
          >
            <p className="text-[12px] font-black text-stone-900 dark:text-stone-100">
              Ask about our wines
            </p>
            <p className="mt-0.5 text-[10px] text-stone-400 dark:text-stone-500">
              Tap to chat on WhatsApp
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to enquire about your wine collection. Could you share more details and availability?")}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-2xl shadow-green-900/40"
        aria-label="Ask about wines on WhatsApp"
      >
        <svg viewBox="0 0 32 32" fill="white" className="h-7 w-7">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.663 4.882 1.818 6.932L2 30l7.302-1.784A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.892-1.607l-.422-.25-4.333 1.059 1.098-4.205-.275-.434A11.543 11.543 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.344-8.656c-.347-.174-2.055-1.014-2.375-1.13-.32-.115-.552-.173-.784.174-.232.347-.9 1.13-1.102 1.362-.202.232-.405.26-.752.086-.347-.174-1.464-.539-2.788-1.719-1.031-.917-1.726-2.05-1.929-2.397-.202-.347-.022-.534.152-.706.156-.155.347-.405.52-.607.174-.202.232-.347.347-.579.116-.232.058-.434-.029-.607-.087-.174-.784-1.89-1.074-2.59-.283-.68-.57-.588-.784-.598-.202-.01-.434-.012-.666-.012-.232 0-.607.087-.925.434-.318.347-1.216 1.188-1.216 2.897s1.245 3.36 1.418 3.592c.174.231 2.449 3.738 5.934 5.24.83.358 1.477.572 1.982.732.832.265 1.59.228 2.188.138.667-.1 2.055-.84 2.346-1.652.29-.812.29-1.508.202-1.652-.086-.144-.318-.231-.665-.405z" />
        </svg>
      </motion.a>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function WineBestSellers() {
  const [location, setLocation] = useState("All Locations");
  const [wineType, setWineType] = useState("All Types");

  const filtered = WINES.filter((w) => {
    const locOk = location === "All Locations" || w.location === location;
    const typeOk = wineType === "All Types" || w.type === wineType;
    return locOk && typeOk;
  });

  return (
    <>
      <section
        className="relative overflow-hidden bg-[#FAF8F4] pb-10 pt-16 dark:bg-[#0D0508]"
        style={{ "--section-bg": "#FAF8F4" }}
      >
        {/* Grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.016] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
        />
        {/* Ambient orbs */}
        <div
          className="pointer-events-none absolute -right-48 top-0 h-[640px] w-[640px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #8B1A2A 0%, transparent 70%)", opacity: 0.06 }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-48 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #9A7A10 0%, transparent 70%)", opacity: 0.05 }}
        />

        <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">

          {/* ── Section Header ── */}
          <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">

            {/* Left: title */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B1A2A]/20 bg-[#8B1A2A]/[0.07] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#8B1A2A] dark:border-[#C8956A]/20 dark:bg-[#C8956A]/[0.08] dark:text-[#C8956A]">
                <Sparkles className="h-3 w-3" />
                Wine Collection
              </div>
              <h2 className="mb-2 font-serif text-3xl leading-[1.2] text-stone-900 md:text-[2.5rem] dark:text-stone-100">
                Handpicked from the{" "}
                <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">
                  world&rsquo;s finest vineyards
                </em>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-500">
                Scroll to explore — hover any wine to send a direct enquiry.
              </p>
            </div>

            {/* Right: compact dropdowns */}
            <div className="flex items-end gap-3">
              <FilterSelect
                label="Location"
                value={location}
                options={LOCATIONS}
                onChange={(v) => setLocation(v)}
              />
              <FilterSelect
                label="Wine Type"
                value={wineType}
                options={WINE_TYPES}
                onChange={(v) => setWineType(v)}
              />

              {/* Active count pill */}
              <div className="flex h-9 items-center rounded-xl border border-[#8B1A2A]/20 bg-[#8B1A2A]/[0.07] px-3.5 text-[12px] font-black text-[#8B1A2A] dark:border-[#C8956A]/20 dark:bg-[#C8956A]/[0.08] dark:text-[#C8956A]">
                {filtered.length}&nbsp;
                <span className="font-normal text-[#8B1A2A]/60 dark:text-[#C8956A]/60">
                  wine{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* ── Carousel ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${location}-${wineType}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <WineCarousel wines={filtered} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Fixed common WhatsApp — floats across the entire homepage */}
      <CommonWhatsAppButton />
    </>
  );
}
