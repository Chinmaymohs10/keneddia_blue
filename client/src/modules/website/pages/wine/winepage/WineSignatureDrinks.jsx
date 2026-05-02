import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ImageOff, Loader2 } from "lucide-react";
import { getAllWineTypes } from "@/Api/WineApi";

// ─── TYPE ACCENTS ─────────────────────────────────────────────────────────────
const TYPE_ACCENTS = {
  Whiskey: { color: "#C9922A", dot: "#D4A017" },
  Wine: { color: "#8B1A2A", dot: "#C4485A" },
  Beers: { color: "#B8860B", dot: "#D4B035" },
  Tastings: { color: "#556B5E", dot: "#7AA088" },
};

const toList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

// ─── CATEGORY CARD ────────────────────────────────────────────────────────────
function CategoryCard({ category, index, routeMode = "property" }) {
  const [hovered, setHovered] = useState(false);
  const accent = TYPE_ACCENTS[category.name] || TYPE_ACCENTS.Wine;
  const navigate = useNavigate();
  const params = useParams();

  const generateSlug = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

  const handleExplore = () => {
    const typeSlug = category.id;
    if (routeMode === "global") {
      navigate(`/wine-categories/${typeSlug}`);
      return;
    }
    const citySlug = (category.location || params.citySlug || "ghaziabad").toLowerCase();
    const propSlug = generateSlug(category.property || params.propertySlug || "kennedia-blu");
    navigate(`/wine-detail/${citySlug}/${propSlug}/${typeSlug}`);
  };

  const [errored, setErrored] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleExplore}
      className="group relative flex h-full min-h-[96px] cursor-pointer select-none items-center overflow-hidden rounded-[1.5rem] border border-stone-200/90 bg-white px-4 py-4 shadow-[0_14px_40px_-28px_rgba(66,28,35,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-34px_rgba(66,28,35,0.45)] dark:border-white/[0.07] dark:bg-[#1A0C13]"
    >
      <div
        className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500"
        style={{ background: hovered ? `linear-gradient(to bottom, ${accent.dot}, ${accent.color})` : "transparent" }}
      />

      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-200/80 dark:bg-zinc-900 dark:ring-white/10">
          {(!category.image || errored) ? (
            <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-zinc-900">
              <ImageOff size={18} className="text-stone-300 dark:text-zinc-700" />
            </div>
          ) : (
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-700"
              style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
              onError={() => setErrored(true)}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate whitespace-nowrap font-serif text-lg capitalize leading-tight text-stone-900 dark:text-stone-100">
            {category.name}
          </h3>
        </div>

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${accent.dot}, ${accent.color})`,
            transform: hovered ? "translateX(2px)" : "translateX(0px)",
          }}
        >
          <ArrowRight size={20} />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, ${accent.color}08 0%, transparent 45%)`,
        }}
      />
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function WineCategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllWineTypes();
        const data = toList(res);
        const mapped = data.filter(item => item.active).map(item => ({
          name: item.wineTypeName,
          id: item.id,
          image: item.media?.url || "",
          property: item.propertyName || "",
          location: item.propertyTypeName || ""
        }));
        setCategories(mapped);
      } catch (error) {
        console.error("Failed to fetch wine categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F5F0EA] pt-16 pb-20 dark:bg-[#12070A]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-12 max-w-2xl text-center md:text-left">
          <h2 className="font-serif text-4xl leading-[1.1] text-stone-900 md:text-5xl dark:text-stone-100">
            Explore by <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">Categories</em>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            Browse whiskey, wine, beers, and tasting experiences across every location. Open any category to see the full collection with filters.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#8B1A2A]" size={40} />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} routeMode="global" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function WineSignatureDrinks() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllWineTypes();
        const data = toList(res);
        const mapped = data.filter(item => item.active).map(item => ({
          name: item.wineTypeName,
          id: item.id,
          image: item.media?.url || "",
          property: item.propertyName || "",
          location: item.propertyTypeName || ""
        }));
        setCategories(mapped);
      } catch (error) {
        console.error("Failed to fetch wine categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FAF8F4] pt-20 pb-24 dark:bg-[#0D0508]">
       <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />
       
       <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-12 max-w-2xl text-center md:text-left">
             <div className="mb-5 flex justify-center md:justify-start items-center gap-3">
               <div className="h-px w-10 bg-[#8B1A2A]/40" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B1A2A]">Sommelier Selection</span>
               <div className="h-px w-10 bg-[#8B1A2A]/40 md:hidden" />
             </div>
             <h2 className="font-serif text-4xl leading-[1.1] text-stone-900 md:text-5xl dark:text-stone-100">
               Signature <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">Collections</em>
             </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#8B1A2A]" size={40} />
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {categories.map((category, i) => (
                <CategoryCard key={category.id} category={category} index={i} routeMode="property" />
              ))}
            </div>
          )}
       </div>
    </section>
  );
}
