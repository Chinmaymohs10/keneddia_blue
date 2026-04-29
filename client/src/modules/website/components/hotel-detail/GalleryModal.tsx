import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface PropertyMedia {
  mediaId: number | null;
  type: string;
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface GalleryItem {
  id: number;
  category: string;
  categoryName: string;
  propertyId: number;
  propertyName: string;
  media: PropertyMedia;
  isActive: boolean;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: {
    name: string;
    location: string;
    propertyId: number;
    media?: PropertyMedia[];
  };
  initialImageIndex?: number;
  galleryData?: GalleryItem[];
}

// Helper function to format category strings (e.g., "GUEST_ROOM" -> "Guest Room")
const formatCategoryName = (category: string) => {
  if (!category || category === "ALL") return "All";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Variants for the sliding animation
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export default function GalleryModal({
  isOpen,
  onClose,
  hotel,
  initialImageIndex = 0,
  galleryData = [],
}: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Prepare and filter images
  const allImages = useMemo(() => {
    return galleryData
      .filter(
        (item) =>
          item.isActive &&
          item.media?.url &&
          item.categoryName?.toLowerCase() !== "3d",
      )
      .map((item) => ({
        src: item.media.url,
        category: item.categoryName || "OTHER",
        caption: item.media.fileName || `${item.categoryName || "Image"} Image`,
      }));
  }, [galleryData]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(allImages.map((img) => img.category));
    return ["ALL", ...Array.from(uniqueCategories)];
  }, [allImages]);

  const filteredImages = useMemo(() => {
    return activeCategory === "ALL"
      ? allImages
      : allImages.filter((img) => img.category === activeCategory);
  }, [activeCategory, allImages]);

  // Reset index when category changes
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
      (prev) => (prev - 1 + filteredImages.length) % filteredImages.length,
    );
  }, [filteredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || filteredImages.length === 0) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/95 flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 md:p-6 text-white bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-30">
          <div>
            <h3 className="text-lg font-serif font-bold">{hotel.name}</h3>
            <p className="text-xs opacity-70">
              {filteredImages[currentIndex]?.caption || hotel.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Image Slider Area */}
        <div className="flex-1 relative flex items-center justify-center px-4 overflow-hidden">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 z-30 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="relative w-full max-w-6xl h-[75vh] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src={filteredImages[currentIndex].src}
                  alt={filteredImages[currentIndex].caption}
                  className="max-w-full max-h-full object-contain select-none"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 z-30 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Footer / Categories & Thumbnails */}
        <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 pb-8 md:pb-4 z-30">
          {/* Categories Navigation */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${
                  activeCategory === cat
                    ? "bg-white text-black"
                    : "text-white/50 hover:text-white bg-white/5"
                }`}
              >
                {formatCategoryName(cat)}
              </button>
            ))}
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-3 overflow-x-auto justify-start md:justify-center px-4 no-scrollbar h-16 max-w-6xl mx-auto">
            {filteredImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`relative w-20 h-14 rounded-md overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300 ${
                  idx === currentIndex
                    ? "ring-2 ring-white scale-110 z-10 opacity-100"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                <OptimizedImage src={img.src} alt={img.caption} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
