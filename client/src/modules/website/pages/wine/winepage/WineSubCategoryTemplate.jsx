import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getAllWineBrands,
  getAllWineTypes,
  getAllWineCategories,
  getAllWineSubCategories,
} from "@/Api/WineApi";
import { getAllProperties } from "@/Api/Api";
import { getPropertyLocation, generateWineCards } from "@/utils/wineDataUtils";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowLeft,
  Wine,
  ChevronDown,
  MapPin,
  Building2,
  ImageOff,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";

// ─── Constants ────────────────────────────────────────────────────────────────

const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "/wine-homepage" },
  { type: "link", label: "COLLECTION", href: "/wine-homepage#collection" },
];

const DEFAULT_ACCENT = { color: "#8B1A2A", light: "#FDF2F4", dot: "#C4485A", bg: "#FDF2F4" };

function generateSlug(text) {
  return text?.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
}

// ─── Components ───────────────────────────────────────────────────────────────

function ImgWithFallback({ src, alt, className }) {
  const [err, setErr] = useState(false);
  if (!src || err)
    return (
      <div className={`flex items-center justify-center bg-stone-100 dark:bg-zinc-900 ${className}`}>
        <ImageOff size={20} className="text-stone-300 dark:text-zinc-700" />
      </div>
    );
  return <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setErr(true)} />;
}

function ItemCard({ drink, index }) {
  const [hovered, setHovered] = useState(false);
  const accent = DEFAULT_ACCENT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.55 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex min-h-[266px] overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.07] dark:bg-[#1A0C13]"
    >
      <div className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500" style={{ background: hovered ? `linear-gradient(to bottom, ${accent.dot}, ${accent.color})` : "transparent" }} />

      <div className="flex h-full w-full overflow-hidden">
        <div className="relative w-[40%] shrink-0 overflow-hidden">
          <ImgWithFallback
            src={drink.image}
            alt={drink.name}
            className={`h-full w-full transition-transform duration-700 ${hovered ? "scale-[1.06]" : "scale-100"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 dark:to-[#1A0C13]/80" />
          <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: accent.dot }} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-5 text-center">
          <div className="mb-3 flex flex-col items-center gap-2">
            <div className="flex max-w-full items-center gap-1.5 whitespace-nowrap">
              <Building2 size={10} className="shrink-0" style={{ color: accent.color }} />
              <span className="truncate text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: accent.color }}>
                {drink.property} · {drink.location}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <h3 className="font-serif text-[1.4rem] leading-tight text-stone-900 dark:text-stone-100">{drink.name}</h3>
              {drink.subtitle && <p className="text-[11px] italic text-stone-400">{drink.subtitle}</p>}
            </div>
          </div>

          <div className="mb-3">
            <span
              className="rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest"
              style={{
                color: accent.color,
                backgroundColor: accent.bg || accent.light,
                border: `1px solid ${accent.color}30`,
              }}
            >
              {drink.category || drink.tag || drink.type}
            </span>
          </div>

          <div className="mb-3 h-px w-6 bg-stone-200 dark:bg-white/10" />

          <p className="mx-auto max-w-[220px] line-clamp-3 text-[11px] italic leading-relaxed text-stone-400 dark:text-stone-500">
            &ldquo;{drink.tasting}&rdquo;
          </p>

          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500 dark:bg-white/5 dark:text-stone-500">
              <MapPin size={10} />
              {drink.locationDisplay || drink.location}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { useSsrData } from "@/ssr/SsrDataContext";

export default function WineSubCategoryTemplate() {
  const { citySlug, propertySlug, slug } = useParams();
  const navigate = useNavigate();
  const { wineSubCategory } = useSsrData();

  const [loading, setLoading] = useState(!wineSubCategory);
  const [subCategory, setSubCategory] = useState(wineSubCategory?.subCategory || null);
  const [allCards, setAllCards] = useState(() => {
    if (wineSubCategory?.allCards) {
      const numericId = parseInt(slug, 10);
      return wineSubCategory.allCards.filter(c => c.subCategoryId === numericId);
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  const isGlobalPage = !citySlug || !propertySlug;

  useEffect(() => {
    window.scrollTo(0, 0);
    const numericId = parseInt(slug, 10);
    if (isNaN(numericId)) {
      setLoading(false);
      return;
    }

    if (wineSubCategory) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchData() {
      try {
        const [typesRes, brandsRes, catsRes, subCatsRes, propsRes] = await Promise.all([
          getAllWineTypes(),
          getAllWineBrands(),
          getAllWineCategories(),
          getAllWineSubCategories(),
          getAllProperties(),
        ]);
        if (cancelled) return;

        const subCats = subCatsRes?.data ?? [];
        const found = subCats.find(s => s.id === numericId);
        if (!found) {
          setLoading(false);
          return;
        }
        setSubCategory(found);

        const generatedCards = generateWineCards({
          wineTypes: typesRes?.data ?? [],
          brands: brandsRes?.data ?? [],
          categories: catsRes?.data ?? [],
          subCategories: subCats,
          properties: propsRes?.data ?? [],
          homepageOnly: false
        });

        const filtered = generatedCards.filter(c => c.subCategoryId === numericId);
        setAllCards(filtered);
      } catch (_) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [slug, wineSubCategory]);

  const availableLocations = useMemo(() => {
    return ["All Locations", ...Array.from(new Set(allCards.map((d) => d.locationDisplay || d.location))).sort()];
  }, [allCards]);

  const filteredCards = useMemo(() => {
    let result = allCards;
    if (selectedLocation !== "All Locations") {
      result = result.filter((d) => (d.locationDisplay || d.location) === selectedLocation);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.property.toLowerCase().includes(lower) ||
          (d.locationDisplay || d.location).toLowerCase().includes(lower)
      );
    }
    return result;
  }, [allCards, selectedLocation, searchTerm]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0508]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Loading Product</span>
        </div>
      </div>
    );
  }

  if (!subCategory) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0D0508]">
        <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} propertyTypeName="Wine" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <Wine size={48} className="text-stone-300" />
          <h2 className="font-serif text-4xl text-stone-800 dark:text-stone-200">Product Not Found</h2>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-full bg-[#8B1A2A] px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all">
            <ArrowLeft size={13} /> Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const backHref = isGlobalPage ? "/wine-homepage" : `/wine-detail/${citySlug}/${propertySlug}`;
  const heroImg = subCategory.media?.url || "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAF8F4] dark:bg-[#0D0508]">
      <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} propertyTypeName="Wine" />

      <main>
        {/* Exact Format Hero */}
        <section id="hero" className="relative h-[60vh] md:h-svh w-full overflow-hidden bg-[#0D0508]">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img src={heroImg} alt={subCategory.title} className="h-full w-full object-cover" />
          </motion.div>

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

          <div className="relative z-10 flex h-full items-center pt-[60px]">
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
              <div className="max-w-2xl">
                {/* Breadcrumb */}
                <motion.nav
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="mb-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]"
                >
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                  <ChevronRight className="h-2.5 w-2.5 opacity-50" />
                  <Link to="/wine-homepage" className="hover:text-white transition-colors">Wine</Link>
                  <ChevronRight className="h-2.5 w-2.5 opacity-50" />
                  <span className="text-white/60">Product Detail</span>
                </motion.nav>

                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-4">
                  <h1 className="font-serif text-5xl font-black italic leading-[1.1] text-white md:text-6xl lg:text-7xl">
                    {subCategory.title || subCategory.name}
                  </h1>
                  <div className="mt-2 h-px w-32 opacity-60" style={{ background: `linear-gradient(to right, #D4AF37, transparent)` }} />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="mb-8 max-w-lg text-sm italic leading-relaxed text-white/65 md:text-base"
                >
                  {subCategory.description}
                </motion.p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 right-12 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white/30">Explore</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown size={14} className="text-white/30" />
            </motion.div>
          </motion.div>
        </section>

        {/* Back link */}
        <div className="mx-auto max-w-[1400px] px-6 pt-8 md:px-12">
          <button onClick={() => navigate(backHref)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer">
            <ArrowLeft size={13} /> {isGlobalPage ? "Back to Wine Homepage" : "Back to Estate"}
          </button>
        </div>

        {/* Filters and Content Section */}
        <section className="relative overflow-hidden bg-[#FAF8F4] pt-8 pb-20 dark:bg-[#0D0508]">
          <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">

            <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-stone-200 pb-8 md:flex-row md:items-end dark:border-white/10">
              <div>
                <h2 className="font-serif text-3xl text-stone-900 dark:text-stone-100">
                  Available at <em className="not-italic text-[#8B1A2A]">{filteredCards.length} Locations</em>
                </h2>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Discover where to experience this label</p>
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <div className="relative">
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.22em] text-stone-400 dark:text-stone-600">Search</label>
                  <input
                    type="text"
                    placeholder="Search property..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 w-full min-w-[200px] rounded-xl border border-stone-200 bg-white px-3 text-[12px] font-semibold text-stone-800 outline-none transition-all focus:border-stone-400 dark:border-white/10 dark:bg-[#1A0C12] dark:text-stone-200"
                  />
                </div>

                <div className="relative">
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.22em] text-stone-400 dark:text-stone-600">Location</label>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="h-9 w-full min-w-[160px] cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-stone-800 outline-none transition-all focus:border-stone-400 dark:border-white/10 dark:bg-[#1A0C12] dark:text-stone-200"
                    >
                      {availableLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>
              </div>
            </div>

            {filteredCards.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCards.map((d, i) => (
                  <ItemCard key={d.id} drink={d} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Wine size={40} className="mb-4 text-stone-200 dark:text-white/5" />
                <p className="text-sm italic text-stone-400">No properties found matching your selection.</p>
                <button
                  onClick={() => { setSelectedLocation("All Locations"); setSearchTerm(""); }}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#8B1A2A] underline"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
