import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

// ─── TYPE ACCENTS ─────────────────────────────────────────────────────────────
const TYPE_ACCENTS = {
  Whiskey: { color: "#C9922A", dot: "#D4A017" },
  Wine: { color: "#8B1A2A", dot: "#C4485A" },
  Beers: { color: "#B8860B", dot: "#D4B035" },
  Tastings: { color: "#556B5E", dot: "#7AA088" },
};

// ─── CATEGORY DATA ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Whiskey", id: "whiskey", tag: "Single Malts & Blends", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=85", property: "Kennedia Blu", location: "ghaziabad" },
  { name: "Wine", id: "wine", tag: "Fine Estates", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85", property: "Kennedia Blu", location: "ghaziabad" },
  { name: "Beers", id: "beers", tag: "Craft & Imported", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=85", property: "Kennedia Blu", location: "ghaziabad" },
  { name: "Tastings", id: "tastings", tag: "Master Classes", image: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600&q=85", property: "Kennedia Blu", location: "ghaziabad" },
];

// ─── CATEGORY CARD ────────────────────────────────────────────────────────────
function CategoryCard({ category, index }) {
  const [hovered, setHovered] = useState(false);
  const accent = TYPE_ACCENTS[category.name] || TYPE_ACCENTS.Wine;
  const navigate = useNavigate();

  const generateSlug = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

  const handleExplore = () => {
    const citySlug = category.location.toLowerCase();
    const propSlug = generateSlug(category.property);
    const typeSlug = category.id;
    navigate(`/wine-detail/${citySlug}/${propSlug}/${typeSlug}`);
  };

  const [errored, setErrored] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleExplore}
      className="group relative flex h-full min-h-[300px] cursor-pointer select-none flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-white/[0.07] dark:bg-[#1A0C13]"
    >
      <div className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500 z-10" style={{ background: hovered ? `linear-gradient(to bottom, ${accent.dot}, ${accent.color})` : "transparent" }} />
      
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        {(!category.image || errored) ? (
           <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-zinc-900">
             <ImageOff size={20} className="text-stone-300 dark:text-zinc-700" />
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 text-left z-20">
         <span className="mb-2 w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/90 backdrop-blur-md" style={{ backgroundColor: `${accent.color}80` }}>
           {category.tag}
         </span>
         <h3 className="font-serif text-3xl leading-tight text-white">{category.name}</h3>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WineSignatureDrinks() {
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

          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} />
            ))}
          </div>
       </div>
    </section>
  );
}
