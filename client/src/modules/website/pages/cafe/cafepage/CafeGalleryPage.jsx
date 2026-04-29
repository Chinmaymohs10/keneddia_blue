import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Camera, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { CAFE_GALLERY_ITEMS } from "./cafeGalleryData";
import { getGalleryByPropertyId } from "@/Api/Api";
import { getActiveVisualGalleriesHeader } from "@/Api/RestaurantApi";

export default function CafeGalleryPage({ propertyId }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryHeader, setGalleryHeader] = useState({
    header1: "Moments from the",
    header2: "Cafe",
    description: "",
  });

  // Dynamically derive unique categories from the gallery items
  const dynamicCategories = useMemo(() => {
    const cats = new Set(["All"]);
    galleryItems.forEach((item) => {
      if (item.categoryName) {
        const normalized =
          item.categoryName.charAt(0).toUpperCase() +
          item.categoryName.slice(1).toLowerCase();
        cats.add(normalized);
      }
    });
    return Array.from(cats);
  }, [galleryItems]);

  const fetchGalleryHeader = async () => {
    try {
      const res = await getActiveVisualGalleriesHeader();
      const all = res?.data || [];
      const matched = all
        .filter((h) => h.propertyId === propertyId && h.isActive === true)
        .sort((a, b) => b.id - a.id);
      const latest = matched[0];

      if (latest) {
        setGalleryHeader({
          header1: latest.header1 || "Moments from the",
          header2: latest.header2 || "Cafe",
          description: latest.description || "",
        });
      }
    } catch (err) {
      console.error("Failed to load gallery header:", err);
    }
  };

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await getGalleryByPropertyId(propertyId);
      const allData = response?.data || response;
      const allContent = allData?.content || (Array.isArray(allData) ? allData : []);

      const filtered = allContent
        .filter((item) => item.isActive)
        .map((item) => ({
          id: item.id,
          categoryName: item.categoryName || "All",
          media: {
            url: item.media?.url,
            alt: item.propertyName,
          },
        }));

      console.log("Cafe Gallery Property Response:", allContent);
      console.log("Filtered Cafe Gallery Items:", filtered);

      if (filtered.length > 0) {
        setGalleryItems(filtered);
      } else {
        setGalleryItems(CAFE_GALLERY_ITEMS);
      }
    } catch (error) {
      console.error("Gallery fetch error:", error);
      setGalleryItems(CAFE_GALLERY_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchGalleryHeader();
      fetchGallery();
    }
  }, [propertyId]);

  const filtered = useMemo(() => {
    return galleryItems
      .map((item) => {
        const cat = String(item.categoryName || "All");
        return {
          id: item.id,
          category: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
          image: item.media?.url,
          alt: item.media?.alt || item.propertyName || "Cafe Gallery Image",
        };
      })
      .filter((item) => {
        if (activeCategory === "All") return true;
        return item.category === activeCategory;
      });
  }, [activeCategory, galleryItems]);

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
    setLightboxIndex(
      (current) => (current - 1 + filtered.length) % filtered.length,
    );
  const lightboxNext = () =>
    setLightboxIndex((current) => (current + 1) % filtered.length);

  return (
    <section className="bg-[#F8F8F6] pb-12 pt-0 dark:bg-zinc-900/40 md:pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:mb-10 md:flex-row md:items-end md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] sm:text-[11px] sm:tracking-[0.4em]">
                Visual Gallery
              </span>
            </div>
            <h2 className="text-3xl font-serif tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
              {galleryHeader.header1}{" "}
              <span className="italic text-primary">{galleryHeader.header2}</span>
            </h2>
            {galleryHeader.description && (
              <p className="mt-3 max-w-xl text-base font-light text-zinc-500 dark:text-white/40 sm:mt-4 sm:text-lg">
                {galleryHeader.description}
              </p>
            )}
          </motion.div>

          <div className="flex flex-wrap gap-2">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer sm:px-4 sm:text-sm ${activeCategory === cat
                  ? "bg-primary text-white shadow-md"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-primary/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-zinc-200/70 bg-white shadow-[0_35px_80px_-35px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-950 sm:rounded-[2rem]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 z-20 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 z-20 pointer-events-none" />

          <div className="relative grid h-[520px] grid-cols-1 gap-3 overflow-hidden p-3 sm:h-[620px] sm:gap-4 sm:p-4 md:h-[700px] md:grid-cols-2 lg:h-[760px] lg:grid-cols-3">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-medium text-zinc-500">Loading gallery...</p>
                </div>
              </div>
            ) : null}
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
                          className="relative group overflow-hidden rounded-[1.5rem] text-left cursor-pointer"
                        >
                          <div
                            className={`relative ${loopIndex % 3 === 0 ? "aspect-[4/5]" : "aspect-[5/4]"
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

      {lightboxIndex !== null &&
        filtered.length > 0 &&
        createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-3 right-3 z-[1210] p-2 sm:top-5 sm:right-5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              lightboxPrev();
            }}
            className="absolute left-3 sm:left-5 z-[1210] p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            aria-label="Previous image"
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
            className="absolute right-3 sm:right-5 z-[1210] p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-5 text-white/60 text-sm">
            {lightboxIndex + 1} / {filtered.length}
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
