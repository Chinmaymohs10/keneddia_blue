
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X, MapPin, Percent, ChevronRight } from "lucide-react";

// ─── FONTS (injected once) ────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Mono:wght@300;400;500&display=swap";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "919999999999";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "whiskey",
    name: "Whiskey",
    subtitle: "Single Malts & Blends",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1200&q=90",
    accentColor: "#C9922A",
    number: "01",
    items: [
      { id: 101, brand: "Glenfiddich", title: "12 Year Old", tag: "Single Malt", origin: "Speyside, Scotland", abv: "40%", description: "Fresh pear, vanilla oak and a long clean finish.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", accent: "#C9922A" },
      { id: 102, brand: "Johnnie Walker", title: "Black Label", tag: "Blended Scotch", origin: "Scotland", abv: "40%", description: "Dark fruit and vanilla with a rich signature smokiness.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", accent: "#8B7355" },
      { id: 103, brand: "Maker's Mark", title: "Bourbon", tag: "Bourbon", origin: "Kentucky, USA", abv: "45%", description: "Caramel, red winter wheat softness and toasted oak.", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=85", accent: "#8B1A1A" },
      { id: 104, brand: "Jameson", title: "Irish Whiskey", tag: "Irish", origin: "Dublin, Ireland", abv: "40%", description: "Triple-distilled, silky light body with a gentle nutty finish.", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", accent: "#2D5A27" },
      { id: 105, brand: "Laphroaig", title: "10 Year Old", tag: "Islay Single Malt", origin: "Islay, Scotland", abv: "40%", description: "Intense peat smoke, iodine, and a long maritime finish.", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=85", accent: "#1E3A5F" },
      { id: 106, brand: "Bulleit", title: "Frontier Rye", tag: "Rye Whiskey", origin: "Kentucky, USA", abv: "45%", description: "Bold rye spice, dried fruit, and a clean dry close.", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=85", accent: "#8B6914" },
    ],
  },
  {
    id: "wine",
    name: "Wine",
    subtitle: "Reds, Whites & Champagne",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=90",
    accentColor: "#7B2D3E",
    number: "02",
    items: [
      { id: 201, brand: "Château Margaux", title: "Premier Grand Cru", tag: "Red Bordeaux", origin: "Bordeaux, France", abv: "13.5%", description: "Dark berry, cedar, violet and perfectly polished tannins.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#6B1A2A" },
      { id: 202, brand: "Cloudy Bay", title: "Sauvignon Blanc", tag: "White Wine", origin: "Marlborough, NZ", abv: "13%", description: "Zesty passionfruit, citrus and crisp mineral finish.", image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85", accent: "#C8A951" },
      { id: 203, brand: "Veuve Clicquot", title: "Yellow Label Brut", tag: "Champagne", origin: "Reims, France", abv: "12%", description: "Toasty brioche, fresh apple and a persistent mousse.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85", accent: "#E8B84B" },
      { id: 204, brand: "Antinori", title: "Tignanello", tag: "Super Tuscan", origin: "Tuscany, Italy", abv: "14%", description: "Dark plum, tobacco and earthy Sangiovese depth.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#A0291E" },
      { id: 205, brand: "Whispering Angel", title: "Côtes de Provence", tag: "Rosé", origin: "Provence, France", abv: "13%", description: "Pale, elegant rosé with strawberry, peach, bone-dry.", image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&q=85", accent: "#C47A8A" },
      { id: 206, brand: "Caymus", title: "Special Selection", tag: "Napa Cabernet", origin: "Napa Valley, USA", abv: "14.5%", description: "Plush blackcurrant, mocha and a seamless velvet finish.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#3D1A0E" },
    ],
  },
  {
    id: "beers",
    name: "Beers",
    subtitle: "Craft, Stout & Lager",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1200&q=90",
    accentColor: "#B8860B",
    number: "03",
    items: [
      { id: 301, brand: "Weihenstephaner", title: "Hefeweissbier", tag: "Wheat Beer", origin: "Bavaria, Germany", abv: "5.4%", description: "Banana, clove and a beautifully hazy golden body.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#D4A017" },
      { id: 302, brand: "Guinness", title: "Draught", tag: "Irish Stout", origin: "Dublin, Ireland", abv: "4.2%", description: "Silky nitrogen cascade with roasted coffee and chocolate.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", accent: "#3A3A3A" },
      { id: 303, brand: "Sierra Nevada", title: "Pale Ale", tag: "American Pale Ale", origin: "California, USA", abv: "5.6%", description: "Resinous pine, citrus hops and a clean bitter finish.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#2E7D32" },
      { id: 304, brand: "Hoegaarden", title: "Witbier", tag: "Belgian White", origin: "Belgium", abv: "4.9%", description: "Orange peel, coriander and a dreamy hazy glow.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", accent: "#C8A951" },
      { id: 305, brand: "Duvel", title: "Golden Strong", tag: "Belgian Strong Ale", origin: "Breendonk, Belgium", abv: "8.5%", description: "Dry-hopped, effervescent and powerfully smooth.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#E8B84B" },
      { id: 306, brand: "Modelo", title: "Especial", tag: "Mexican Lager", origin: "Mexico City, Mexico", abv: "4.4%", description: "Clean, crisp with a gentle malt sweetness.", image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=85", accent: "#C8960C" },
    ],
  },
  {
    id: "tasting-events",
    name: "Tastings",
    subtitle: "Guided Sensory Journeys",
    image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=1200&q=90",
    accentColor: "#556B5E",
    number: "04",
    items: [
      { id: 401, brand: "House Experience", title: "Whiskey Master Class", tag: "Monthly", origin: "In-House", abv: "Varies", description: "Five single malts, one sommelier, one hour of discovery.", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", accent: "#C9922A" },
      { id: 402, brand: "House Experience", title: "New World Wine Tour", tag: "Bi-Monthly", origin: "In-House", abv: "Varies", description: "Six pours across South America and Oceania.", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", accent: "#7B2D3E" },
      { id: 403, brand: "House Experience", title: "Craft Beer Lab", tag: "Weekly", origin: "In-House", abv: "Varies", description: "Eight blind ales with food pairings and brewing history.", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", accent: "#2E7D32" },
      { id: 404, brand: "House Experience", title: "Champagne & Canapés", tag: "Special", origin: "In-House", abv: "Varies", description: "Prestige cuvées with chef-crafted bites — pure elegance.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85", accent: "#E8B84B" },
    ],
  },
];

// ─── WHATSAPP ──────────────────────────────────────────────────────────────────
function WhatsAppBtn({ item, catName }) {
  const [hover, setHover] = useState(false);
  const msg = encodeURIComponent(`Hi! Interested in *${item.brand} – ${item.title}* (${catName}). Could you share details?`);
  return (
    <div className="flex items-center gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <AnimatePresence>
        {hover && (
          <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
            className="text-[11px] font-mono font-semibold text-[#25D366] tracking-wide whitespace-nowrap">
            Query on WhatsApp
          </motion.span>
        )}
      </AnimatePresence>
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`}
        target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.94 }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-green-900/50"
        aria-label="WhatsApp Query"
      >
        <svg viewBox="0 0 32 32" fill="white" className="h-[18px] w-[18px]">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.663 4.882 1.818 6.932L2 30l7.302-1.784A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.892-1.607l-.422-.25-4.333 1.059 1.098-4.205-.275-.434A11.543 11.543 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.344-8.656c-.347-.174-2.055-1.014-2.375-1.13-.32-.115-.552-.173-.784.174-.232.347-.9 1.13-1.102 1.362-.202.232-.405.26-.752.086-.347-.174-1.464-.539-2.788-1.719-1.031-.917-1.726-2.05-1.929-2.397-.202-.347-.022-.534.152-.706.156-.155.347-.405.52-.607.174-.202.232-.347.347-.579.116-.232.058-.434-.029-.607-.087-.174-.784-1.89-1.074-2.59-.283-.68-.57-.588-.784-.598-.202-.01-.434-.012-.666-.012-.232 0-.607.087-.925.434-.318.347-1.216 1.188-1.216 2.897s1.245 3.36 1.418 3.592c.174.231 2.449 3.738 5.934 5.24.83.358 1.477.572 1.982.732.832.265 1.59.228 2.188.138.667-.1 2.055-.84 2.346-1.652.29-.812.29-1.508.202-1.652-.086-.144-.318-.231-.665-.405z" />
        </svg>
      </motion.a>
    </div>
  );
}

// ─── PRODUCT DRAWER ───────────────────────────────────────────────────────────
function ProductDrawer({ category, onClose }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const tags = useMemo(() => ["all", ...new Set(category.items.map(i => i.tag))], [category]);
  const filtered = useMemo(() => activeFilter === "all" ? category.items : category.items.filter(i => i.tag === activeFilter), [category, activeFilter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="relative ml-auto flex h-full w-full max-w-[780px] flex-col overflow-hidden bg-[#111008]"
      >
        {/* Drawer header */}
        <div className="relative h-40 shrink-0 overflow-hidden sm:h-48">
          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#111008]" />
          <div className="absolute inset-0 flex items-end p-5 sm:p-8">
            <div>
              {/* <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-400/80">{category.subtitle}</p> */}
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-light italic text-white sm:text-5xl">
                {category.name}
              </h2>
            </div>
          </div>
          <button onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-5 sm:top-5">
            <X size={16} />
          </button>
        </div>

        {/* Tag filters */}
        <div className="shrink-0 px-4 py-4 sm:px-8">
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <button key={t} onClick={() => setActiveFilter(t)}
                className="rounded-full border px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest transition-all"
                style={activeFilter === t
                  ? { borderColor: category.accentColor, backgroundColor: category.accentColor + "22", color: category.accentColor }
                  : { borderColor: "#333", color: "#666", backgroundColor: "transparent" }
                }
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px shrink-0 sm:mx-8" style={{ background: `linear-gradient(to right, ${category.accentColor}44, transparent)` }} />

        {/* Scrollable product list */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.06] sm:flex-row sm:gap-4"
              >
                {/* Left: image */}
                <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-black sm:h-24 sm:w-24 sm:aspect-auto">
                  <img
                    src={item.image}
                    alt={item.brand}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 sm:object-cover sm:group-hover:scale-110"
                  />
                  <div className="absolute inset-0 rounded-xl" style={{ boxShadow: `inset 0 0 0 1px ${item.accent}33` }} />
                </div>

                {/* Center: info */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: item.accent }}>{item.brand}</span>
                      <span className="rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider" style={{ borderColor: item.accent + "44", color: item.accent + "cc" }}>{item.tag}</span>
                    </div>
                    <h4 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl font-semibold leading-tight text-white">{item.title}</h4>
                    <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500 italic">{item.description}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1"><MapPin size={10} />{item.origin}</span>

                  </div>
                </div>

                {/* Right: WhatsApp */}
                <div className="flex shrink-0 items-center self-end sm:self-auto">
                  <WhatsAppBtn item={item} catName={category.name} />
                </div>

                {/* Accent left border */}
                <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundColor: item.accent }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CATEGORY TILE ────────────────────────────────────────────────────────────
function CategoryTile({ category, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative cursor-pointer overflow-hidden"
      style={{ borderRadius: 24 }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ borderRadius: 24 }}>
        <motion.img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        {/* Accent overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: hovered ? 0.18 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: `radial-gradient(ellipse at bottom left, ${category.accentColor}, transparent 70%)` }}
        />

        {/* Issue number — top left */}
        <div className="absolute left-5 top-5">
          <span style={{ fontFamily: "'DM Mono', monospace", color: category.accentColor + "cc" }}
            className="text-[11px] font-semibold tracking-[0.3em]">№ {category.number}</span>
        </div>

        {/* Top-right arrow */}
        <motion.div
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: category.accentColor + "55", backgroundColor: category.accentColor + "11" }}
          animate={{ rotate: hovered ? 45 : 0, opacity: hovered ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowUpRight size={16} style={{ color: category.accentColor }} />
        </motion.div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Thin accent rule */}
          <motion.div
            className="mb-3 h-[1px]"
            style={{ backgroundColor: category.accentColor }}
            animate={{ width: hovered ? "100%" : "32px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* <p style={{ fontFamily: "'DM Mono', monospace" }} className="mb-1 text-[9px] uppercase tracking-[0.3em] text-white/50">{category.subtitle}</p> */}
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl font-light italic leading-none text-white">{category.name}</h3>
          {/* <motion.div
            className="mt-3 flex items-center gap-1.5"
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", color: category.accentColor }} className="text-[10px] font-semibold tracking-widest uppercase">{category.items.length} Selections</span>
            <ChevronRight size={12} style={{ color: category.accentColor }} />
          </motion.div> */}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function BestSellers() {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <>
      {/* Google Fonts */}
      <link href={FONT_LINK} rel="stylesheet" />

      <section
        className="relative min-h-screen overflow-hidden bg-[#F7F7F5] py-14 transition-colors duration-500 dark:bg-[#0C0B08] sm:py-20"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {/* Subtle noise texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "128px" }} />

        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-0 top-0 h-[320px] w-[320px] rounded-full opacity-10 sm:h-[500px] sm:w-[500px]"
          style={{ background: "radial-gradient(circle, #C9922A 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 md:px-16">

          {/* ── Header ── */}
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div>
              {/* Eyebrow */}
              <div className="mb-5 flex items-center gap-4">
                <div className="h-px w-12 bg-amber-500/60" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-amber-500/80">Curated Collection</span>
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-3xl font-light leading-[1.1] text-zinc-950 dark:text-white sm:text-4xl md:text-5xl">
                Crafted for Every Taste<br /><em className="text-amber-400/90">Explore our curated selection of premium spirits and beverages, designed to suit every mood and occasion.</em>
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-500 md:max-w-xs md:text-right">
              Premium spirits, wines and craft beers. Click any category to explore — hover an item to enquire via WhatsApp.
            </p>
          </div>

   

          {/* ── Category grid ── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => (
              <CategoryTile key={cat.id} category={cat} index={i} onClick={() => setActiveCategory(cat)} />
            ))}
          </div>

         
        </div>
      </section>

      {/* ── Drawer overlay ── */}
      <AnimatePresence>
        {activeCategory && (
          <ProductDrawer
            key={activeCategory.id}
            category={activeCategory}
            onClose={() => setActiveCategory(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
