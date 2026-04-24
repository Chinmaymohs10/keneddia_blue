import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { CAFE_GALLERY_ITEMS } from "./cafeGalleryData";

const CATEGORIES = ["All", "Interior", "Brews", "Bakery", "Events", "Outdoor"];

export default function CafeGalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = useMemo(() => {
    const normalized = CAFE_GALLERY_ITEMS.map((item) => ({
      id: item.id,
      category:
        item.categoryName.charAt(0) +
        item.categoryName.slice(1).toLowerCase(),
      image: item.media.url,
      alt: item.media.alt || item.media.fileName || item.propertyName,
    }));

    return activeCategory === "All"
      ? normalized
      : normalized.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const columns = useMemo(
    () =>
      [0, 1, 2].map((columnIndex) =>
        filtered.filter((_, index) => index % 3 === columnIndex),
      ),
    [filtered],
  );

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const lightboxPrev = () =>
    setLightboxIndex((current) => (current - 1 + filtered.length) % filtered.length);
  const lightboxNext = () =>
    setLightboxIndex((current) => (current + 1) % filtered.length);

  return (
    <section className="py-16 lg:py-28 bg-[#F8F8F6] dark:bg-zinc-900/40">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-primary text-[11px] font-bold uppercase tracking-[0.4em]">
                Visual Gallery
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-white tracking-tight">
              Moments from the <span className="italic text-primary">Cafe</span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-[0_35px_80px_-35px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 z-20 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 z-20 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-[760px] overflow-hidden">
            {columns.map((columnItems, columnIndex) => {
              const loopItems =
                columnItems.length > 0 ? [...columnItems, ...columnItems] : [];

              return (
                <div
                  key={columnIndex}
                  className="relative h-full overflow-hidden rounded-[1.5rem] bg-zinc-100/70 dark:bg-white/[0.03]"
                >
                  <motion.div
                    initial={{ y: columnIndex % 2 === 0 ? "0%" : "-50%" }}
                    animate={{
                      y:
                        columnIndex % 2 === 0
                          ? ["0%", "-50%"]
                          : ["-50%", "0%"],
                    }}
                    transition={{
                      duration: 20 + columnIndex * 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex flex-col gap-4 p-4"
                  >
                    {loopItems.map((item, loopIndex) => {
                      const sourceIndex = filtered.findIndex(
                        (entry) => entry.id === item.id,
                      );

                      return (
                        <motion.button
                          key={`${item.id}-${loopIndex}`}
                          type="button"
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(loopIndex * 0.04, 0.2) }}
                          onClick={() => openLightbox(sourceIndex)}
                          className="relative group overflow-hidden rounded-[1.5rem] text-left"
                        >
                          <div
                            className={`relative ${
                              loopIndex % 3 === 0 ? "aspect-[4/5]" : "aspect-[5/4]"
                            }`}
                          >
                            <img
                              src={item.image}
                              alt={item.alt}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                                <Camera className="w-5 h-5 text-zinc-900" />
                              </div>
                            </div>
                            <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.35em] text-white/70 mb-2">
                                  {item.category}
                                </p>
                                <p className="text-white font-serif text-xl leading-tight">
                                  {item.alt}
                                </p>
                              </div>
                              <div className="shrink-0 rounded-full border border-white/20 bg-white/10 backdrop-blur-md p-2.5">
                                <Camera className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && filtered.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              lightboxPrev();
            }}
            className="absolute left-5 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <motion.img
            key={lightboxIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={filtered[lightboxIndex].image}
            alt={filtered[lightboxIndex].alt}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              lightboxNext();
            }}
            className="absolute right-5 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-5 text-white/60 text-sm">
            {lightboxIndex + 1} / {filtered.length}
          </div>
        </div>
      )}
    </section>
  );
}
