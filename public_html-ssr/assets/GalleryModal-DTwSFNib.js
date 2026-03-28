import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { O as OptimizedImage } from "../entry-server.js";
const formatCategoryName = (category) => {
  if (!category || category === "ALL") return "All";
  return category.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
};
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0
  })
};
function GalleryModal({
  isOpen,
  onClose,
  hotel,
  initialImageIndex = 0,
  galleryData = []
}) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [direction, setDirection] = useState(0);
  const allImages = useMemo(() => {
    return galleryData.filter(
      (item) => item.isActive && item.media?.url && item.categoryName?.toLowerCase() !== "3d"
    ).map((item) => ({
      src: item.media.url,
      category: item.categoryName || "OTHER",
      caption: item.media.fileName || `${item.categoryName || "Image"} Image`
    }));
  }, [galleryData]);
  const categories = useMemo(() => {
    const uniqueCategories = new Set(allImages.map((img) => img.category));
    return ["ALL", ...Array.from(uniqueCategories)];
  }, [allImages]);
  const filteredImages = useMemo(() => {
    return activeCategory === "ALL" ? allImages : allImages.filter((img) => img.category === activeCategory);
  }, [activeCategory, allImages]);
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);
  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  }, [filteredImages.length]);
  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + filteredImages.length) % filteredImages.length
    );
  }, [filteredImages.length]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);
  if (!isOpen || filteredImages.length === 0) return null;
  return /* @__PURE__ */ jsx(AnimatePresence, { children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 bg-black/95 flex flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 md:p-6 text-white bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-30", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold", children: hotel.name }),
            /* @__PURE__ */ jsx("p", { className: "text-xs opacity-70", children: filteredImages[currentIndex]?.caption || hotel.location })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm",
              children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 relative flex items-center justify-center px-4 overflow-hidden", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handlePrev,
              className: "absolute left-4 z-30 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 group",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6 group-hover:-translate-x-0.5 transition-transform" })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-6xl h-[75vh] flex items-center justify-center", children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, custom: direction, mode: "popLayout", children: /* @__PURE__ */ jsx(
            motion.div,
            {
              custom: direction,
              variants: slideVariants,
              initial: "enter",
              animate: "center",
              exit: "exit",
              transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              },
              className: "w-full h-full flex items-center justify-center",
              children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: filteredImages[currentIndex].src,
                  alt: filteredImages[currentIndex].caption,
                  className: "max-w-full max-h-full object-contain select-none"
                }
              )
            },
            currentIndex
          ) }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleNext,
              className: "absolute right-4 z-30 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 group",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6 group-hover:translate-x-0.5 transition-transform" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 pb-8 md:pb-4 z-30", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mb-6 flex-wrap", children: categories.map((cat) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setActiveCategory(cat),
              className: `text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${activeCategory === cat ? "bg-white text-black" : "text-white/50 hover:text-white bg-white/5"}`,
              children: formatCategoryName(cat)
            },
            cat
          )) }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-3 overflow-x-auto justify-start md:justify-center px-4 no-scrollbar h-16 max-w-6xl mx-auto", children: filteredImages.map((img, idx) => /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              },
              className: `relative w-20 h-14 rounded-md overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300 ${idx === currentIndex ? "ring-2 ring-white scale-110 z-10 opacity-100" : "opacity-40 hover:opacity-100"}`,
              children: /* @__PURE__ */ jsx(OptimizedImage, { src: img.src, alt: img.caption })
            },
            idx
          )) })
        ] })
      ]
    }
  ) });
}
export {
  GalleryModal as G
};
