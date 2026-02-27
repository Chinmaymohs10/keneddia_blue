import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Loader2,
} from "lucide-react";
import { getAllGalleries } from "@/Api/Api";
import { getActiveVisualGalleriesHeader } from "@/Api/RestaurantApi";
// Fallbacks
import gallery1 from "@/assets/resturant_images/3dGallery/3dGallery1.jpeg";
import gallery2 from "@/assets/resturant_images/3dGallery/3dGallery2.jpeg";
import gallery3 from "@/assets/resturant_images/3dGallery/3dGallery3.jpeg";
import gallery4 from "@/assets/resturant_images/3dGallery/3dGallery4.jpeg";
import gallery5 from "@/assets/resturant_images/3dGallery/3dGallery5.jpeg";

const FALLBACK_DATA = [
  { id: 1, title: "Grand Hall", cat: "3d", img: gallery1 },
  { id: 2, title: "Chef's Table", cat: "3d", img: gallery2 },
  { id: 3, title: "Sunset Deck", cat: "3d", img: gallery3 },
  { id: 4, title: "The Bar", cat: "3d", img: gallery4 },
  { id: 5, title: "Live Kitchen", cat: "3d", img: gallery5 },
];

export default function RestaurantGalleryPage({ propertyId }) {
  const [galleryHeader, setGalleryHeader] = useState({
    header1: "",
    header2: "",
    description: "",
  });
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Parallax Logic (Must be defined at top level) ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
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
          header1: latest.header1 || "",
          header2: latest.header2 || "",
          description: latest.description || "",
        });
      }
    } catch (err) {
      console.error("Failed to load gallery header:", err);
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        // Fixed: Passing empty object to prevent "undefined reading page" error
        const response = await getAllGalleries({});

        // Handle response format: content array is inside response or response.data
        const allContent = response?.data?.content || response?.content || [];

        const filtered = allContent
          .filter(
            (item) =>
              item.propertyId === propertyId &&
              item.categoryName?.toLowerCase() === "3d" &&
              item.isActive,
          )
          .map((item) => ({
            id: item.id,
            title: item.propertyName || "Gallery View",
            cat: item.categoryName || "3d",
            img: item.media?.url,
          }));
        console.log("filtered", filtered);

        setGalleryItems(filtered.length > 0 ? filtered : FALLBACK_DATA);
      } catch (error) {
        console.error("Gallery fetch error:", error);
        setGalleryItems(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchGalleryHeader();
      fetchGallery();
    }
  }, [propertyId]);

  const diagonalVariants = {
    animate: {
      x: ["-25%", "25%"],
      y: ["-25%", "25%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 15,
          ease: "linear",
        },
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 15,
          ease: "linear",
        },
      },
    },
    animateReverse: {
      x: ["25%", "-25%"],
      y: ["-25%", "25%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 35,
          ease: "linear",
        },
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 35,
          ease: "linear",
        },
      },
    },
  };

  const handleManual = (dir) => {
    setManualOffset((prev) => prev + (dir === "next" ? -150 : 150));
  };

  return (
    <section
      ref={containerRef}
      className="relative py-14 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[650px]"
    >
      {/* ── BACKGROUND PARALLAX ── */}
      <motion.div
        style={{ x: bgTextX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[15rem] font-black text-zinc-900/[0.03] dark:text-white/[0.01] pointer-events-none select-none italic uppercase z-0"
      >
        {galleryHeader.header1 || " "}
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* ── LEFT: EDITORIAL ── */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                  3D Visual Gallery
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif dark:text-white leading-[1.1]">
                {galleryHeader.header1 || " "} <br />
                <span className="italic text-zinc-400 dark:text-white/30 decoration-primary/20 underline decoration-1 underline-offset-8">
                  {galleryHeader.header2 || ""}
                </span>
              </h2>
              <p className="text-zinc-500 dark:text-white/40 text-lg font-light leading-relaxed max-w-sm">
                {galleryHeader.description || ""}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleManual("prev")}
                className="p-4 rounded-full border border-zinc-200 dark:border-white/10 dark:text-white hover:bg-primary hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => handleManual("next")}
                className="p-4 rounded-full border border-zinc-200 dark:border-white/10 dark:text-white hover:bg-primary hover:text-white transition-all shadow-xl"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* ── RIGHT: CAROUSEL AREA ── */}
          <div
            className="lg:col-span-8 h-[550px] relative rounded-[3rem] overflow-hidden border border-zinc-100 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl shadow-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Track 1 */}
                <motion.div
                  variants={diagonalVariants}
                  animate={isPaused ? "" : "animate"}
                  style={{ translateX: manualOffset }}
                  className="absolute flex gap-8 p-10 whitespace-nowrap"
                >
                  {[...galleryItems, ...galleryItems].map((item, i) => (
                    <GalleryItem key={`tlbr-${i}`} item={item} />
                  ))}
                </motion.div>

                {/* Track 2 */}
                <motion.div
                  variants={diagonalVariants}
                  animate={isPaused ? "" : "animateReverse"}
                  style={{ translateX: -manualOffset }}
                  className="absolute flex gap-8 p-10 whitespace-nowrap"
                >
                  {[...galleryItems, ...galleryItems]
                    .reverse()
                    .map((item, i) => (
                      <GalleryItem key={`trbl-${i}`} item={item} />
                    ))}
                </motion.div>

                {/* Corner Accents */}
                <div className="absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-primary" />
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-white/20 dark:from-black/20 dark:to-black/20" />
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryItem({ item }) {
  return (
    <div className="relative group w-[280px] h-[380px] shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-100 dark:bg-zinc-800 transition-transform duration-500 hover:scale-105">
      <img
        src={item.img}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
        <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">
          {item.cat}
        </span>
        <h4 className="text-white font-serif text-lg">{item.title}</h4>
      </div>
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 size={16} className="text-white" />
      </div>
    </div>
  );
}
