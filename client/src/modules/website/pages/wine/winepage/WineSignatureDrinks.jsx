import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
const WHATSAPP_NUMBER = "919999999999";

// ─── TYPE ACCENTS ─────────────────────────────────────────────────────────────
const TYPE_ACCENTS = {
  Whiskey:   { color: "#C9922A", light: "#FDF9F2", dark: "#3D2B08", dot: "#D4A017", bg: "#FDF9F2" },
  Wine:      { color: "#8B1A2A", light: "#FDF2F4", dark: "#3D0A10", dot: "#C4485A", bg: "#FDF2F4" },
  Beers:     { color: "#B8860B", light: "#FBF7ED", dark: "#3A2C08", dot: "#D4B035", bg: "#FBF7ED" },
  Tastings:  { color: "#556B5E", light: "#F2F7F4", dark: "#1A241F", dot: "#7AA088", bg: "#F2F7F4" },
};

// ─── DATA ADAPTATION ──────────────────────────────────────────────────────────
const DRINK_CATEGORIES = ["All Collections", "Whiskey", "Wine", "Beers", "Tastings"];

const DRINKS_DATA = [
  // --- Whiskey ---
  { id: 101, property: "Kennedia Blu", location: "Ghaziabad", name: "Glenfiddich", subtitle: "12 Year Old Single Malt", type: "Whiskey", tag: "Single Malt", origin: "Speyside, Scotland", abv: "40%", rating: 4.8, tasting: "Fresh pear, vanilla oak and a long clean finish with hints of spice.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", pairing: "Dark Chocolate", servingTemp: "neat", body: "Medium Body" },
  { id: 102, property: "Kennedia Blu", location: "Ghaziabad", name: "Johnnie Walker", subtitle: "Black Label Blended Scotch", type: "Whiskey", tag: "Blended Scotch", origin: "Scotland", abv: "40%", rating: 4.7, tasting: "Dark fruit and vanilla with a rich signature smokiness and malty depth.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", pairing: "Smoked Meat", servingTemp: "Rocks", body: "Full Body" },
  { id: 103, property: "Kennedia Blu", location: "Ghaziabad", name: "Maker's Mark", subtitle: "Bourbon Whiskey", type: "Whiskey", tag: "Bourbon", origin: "Kentucky, USA", abv: "45%", rating: 4.6, tasting: "Caramel, red winter wheat softness and toasted oak with sweet notes.", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=85", pairing: "BBQ, Pork", servingTemp: "Neat", body: "Full Body" },
  // --- Wine ---
  { id: 201, property: "Kennedia Blu", location: "Ghaziabad", name: "Château Margaux", subtitle: "Premier Grand Cru Classé", type: "Wine", tag: "Red Bordeaux", origin: "Bordeaux, France", abv: "13.5%", rating: 4.9, tasting: "Dark berry, cedar, violet and perfectly polished tannins with long finish.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", pairing: "Lamb, Steak", servingTemp: "18°C", body: "Full Body" },
  { id: 202, property: "Kennedia Blu", location: "Ghaziabad", name: "Cloudy Bay", subtitle: "Sauvignon Blanc", type: "Wine", tag: "White Wine", origin: "Marlborough, NZ", abv: "13%", rating: 4.5, tasting: "Zesty passionfruit, citrus and crisp mineral finish with lingering freshness.", image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85", pairing: "Seafood, Salads", servingTemp: "10°C", body: "Light Body" },
  { id: 203, property: "Kennedia Blu", location: "Ghaziabad", name: "Veuve Clicquot", subtitle: "Yellow Label Brut", type: "Wine", tag: "Champagne", origin: "Reims, France", abv: "12%", rating: 4.8, tasting: "Toasty brioche, fresh apple and a persistent mousse with refined elegance.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85", pairing: "Oysters, Sushi", servingTemp: "8°C", body: "Medium Body" },
  // --- Beers ---
  { id: 301, property: "Kennedia Blu", location: "Ghaziabad", name: "Weihenstephaner", subtitle: "Hefeweissbier", type: "Beers", tag: "Wheat Beer", origin: "Bavaria, Germany", abv: "5.4%", rating: 4.7, tasting: "Banana, clove and a beautifully hazy golden body with creamy head.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", pairing: "Pretzels, Sausages", servingTemp: "6°C", body: "Medium Body" },
  { id: 302, property: "Kennedia Blu", location: "Ghaziabad", name: "Guinness", subtitle: "Draught Stout", type: "Beers", tag: "Irish Stout", origin: "Dublin, Ireland", abv: "4.2%", rating: 4.9, tasting: "Silky nitrogen cascade with roasted coffee and chocolate undertones.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", pairing: "Oysters, Pot Pie", servingTemp: "6°C", body: "Full Body" },
  // --- Tastings ---
  { id: 401, property: "Kennedia Blu", location: "Ghaziabad", name: "Whiskey Master Class", subtitle: "House Experience", type: "Tastings", tag: "Event", origin: "In-House", abv: "Varies", rating: 5.0, tasting: "Five single malts, one sommelier, one hour of sensory discovery.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", pairing: "Matched Bites", servingTemp: "Mixed", body: "Educational" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function DrinkImage({ src, alt, className = "" }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored)
    return (
      <div className={`flex items-center justify-center bg-stone-100 dark:bg-zinc-900 ${className}`}>
        <ImageOff size={20} className="text-stone-300 dark:text-zinc-700" />
      </div>
    );
  return <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setErrored(true)} />;
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={9} className={s <= Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-stone-300 dark:text-zinc-700"} />
      ))}
      <span className="ml-1 text-[11px] font-bold tabular-nums text-amber-600 dark:text-amber-400">{rating}</span>
    </div>
  );
}

function FilterSelect({ value, options, onChange, label }) {
  return (
    <div className="relative">
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.22em] text-stone-400 dark:text-stone-600">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full min-w-[170px] cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-stone-800 shadow-sm outline-none transition-all focus:border-stone-400 dark:border-white/10 dark:bg-[#1A0C13] dark:text-stone-200 dark:focus:border-white/20"
        >
          {options.map((o) => (<option key={o} value={o}>{o}</option>))}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
      </div>
    </div>
  );
}

function HoverQueryPopup({ drink, accent, onExplore }) {
  const message = encodeURIComponent(`Hi! Interested in *${drink.name}* (${drink.subtitle}) at Kennedia Blu. Details?`);
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} className="absolute inset-x-0 bottom-0 z-20 overflow-hidden rounded-b-[1.75rem]">
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-md" />
      <div className="relative flex items-center justify-between px-5 py-4">
        <div className="min-w-0">
          <p className="mb-0.5 truncate text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: accent.dot }}>Kennedia Blu · {drink.type}</p>
          <p className="truncate font-serif text-[14px] leading-tight text-white/90">{drink.name}</p>
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
          >
            Query
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function DrinkCard({ drink, index }) {
  const [hovered, setHovered] = useState(false);
  const accent = TYPE_ACCENTS[drink.type] || TYPE_ACCENTS.Wine;
  const navigate = useNavigate();

  const generateSlug = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

  const handleExplore = () => {
    const citySlug = drink.location?.toLowerCase() || "ghaziabad";
    const propSlug = generateSlug(drink.property);
    navigate(`/wine-detail/${citySlug}/${propSlug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.07, 0.35), duration: 0.55 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleExplore}
      className="relative flex h-full cursor-pointer select-none overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-white/[0.07] dark:bg-[#1A0C13]"
    >
      <div className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500" style={{ background: hovered ? `linear-gradient(to bottom, ${accent.dot}, ${accent.color})` : "transparent" }} />
      <div className="flex h-full gap-0 overflow-hidden">
        <div className="relative shrink-0 overflow-hidden" style={{ width: 184 }}>
          <DrinkImage src={drink.image} alt={drink.name} className="h-full w-full transition-transform duration-700" style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/80 dark:to-[#1A0C13]/80" />
          <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent.dot }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-5 text-center items-center">
          <div className="w-full">
            <div className="mb-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleExplore(); }}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#8B1A2A] hover:underline dark:text-[#C8956A]"
              >
                <Building2 size={10} /> {drink.property}
              </button>
              <div className="flex flex-col items-center gap-1">
                <h3 className="font-serif text-[1.25rem] leading-tight text-stone-900 dark:text-stone-100">{drink.name}</h3>
                <p className="text-[11px] font-medium italic text-stone-400">{drink.subtitle}</p>
              </div>
            </div>

            <div className="mb-3 flex justify-center">
              <span className="rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-widest" style={{ color: accent.color, backgroundColor: accent.bg, border: `1px solid ${accent.color}30` }}>{drink.tag}</span>
            </div>

            <div className="mb-4 flex flex-col items-center gap-2">
              <StarRating rating={drink.rating} />
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500 dark:bg-white/5 dark:text-stone-400">{drink.abv} ABV</span>
            </div>

            <p className="mx-auto mb-5 max-w-[220px] line-clamp-3 text-[11px] italic leading-relaxed text-stone-400 dark:text-stone-500">“{drink.tasting}”</p>
          </div>

          <div className="mt-auto grid w-full grid-cols-2 gap-3 border-t border-stone-100 pt-4 dark:border-white/5">
             <div className="space-y-0.5">
               <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Origin</p>
               <p className="truncate text-[10px] font-bold text-stone-700 dark:text-stone-300">{drink.origin}</p>
             </div>
             <div className="space-y-0.5">
               <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Pairing</p>
               <p className="truncate text-[10px] font-bold text-stone-700 dark:text-stone-300">{drink.pairing}</p>
             </div>
          </div>
        </div>
      </div>
      <AnimatePresence>{hovered && <HoverQueryPopup drink={drink} accent={accent} onExplore={handleExplore} />}</AnimatePresence>
    </motion.div>
  );
}

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────
function DrinkCarousel({ drinks }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 484, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const handleScroll = () => setActiveIndex(Math.round(el.scrollLeft / 484));
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      <div ref={trackRef} className="flex gap-4 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {drinks.map((d, i) => (<div key={d.id} className="shrink-0" style={{ width: 468, height: 320 }}><DrinkCard drink={d} index={i} /></div>))}
        <div className="shrink-0 w-20" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1.5">
          {drinks.slice(0, 8).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 bg-[#8B1A2A]" : "w-1.5 bg-stone-200"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white transition-all hover:bg-stone-50"><ChevronLeft size={18} /></button>
          <button onClick={() => scroll(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white transition-all hover:bg-stone-50"><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WineSignatureDrinks() {
  const [activeCategory, setActiveCategory] = useState("All Collections");

  const filteredDrinks = useMemo(() => {
    if (activeCategory === "All Collections") return DRINKS_DATA;
    return DRINKS_DATA.filter((d) => d.type === activeCategory);
  }, [activeCategory]);

  return (
    <section className="relative overflow-hidden bg-[#FAF8F4] pt-20 pb-0 dark:bg-[#0D0508]">
       <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />
       
       <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
         <div className="mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
           <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-[#8B1A2A]/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B1A2A]">Sommelier Selection</span>
              </div>
              <h2 className="font-serif text-4xl leading-[1.1] text-stone-900 md:text-5xl dark:text-stone-100">
                Signature Drinks & <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">House Masterpieces</em>
              </h2>
           </div>
           
           <FilterSelect label="Drink Category" value={activeCategory} options={DRINK_CATEGORIES} onChange={setActiveCategory} />
         </div>

         <DrinkCarousel drinks={filteredDrinks} />
       </div>
    </section>
  );
}
