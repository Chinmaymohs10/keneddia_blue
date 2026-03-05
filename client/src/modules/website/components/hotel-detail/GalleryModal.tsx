import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  galleryData?: GalleryItem[]; // Pass from parent
}

const formatCategoryName = (category: string) => {
  if (category === "ALL") return "All";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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
        category: item.categoryName || "OTHER", // ✅ correct field
        caption: item.media.fileName || `${item.categoryName || "Image"} Image`,
      }));
  }, [galleryData]);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const uniqueCategories = new Set(allImages.map((img) => img.category));
    return ["ALL", ...Array.from(uniqueCategories)];
  }, [allImages]);

  // Filter images by category
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
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  }, [filteredImages.length]);

  const handlePrev = useCallback(() => {
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

  if (!isOpen || filteredImages.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 text-white bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-10">
          <div>
            <h3 className="text-lg font-serif font-bold">{hotel.name}</h3>
            <p className="text-xs opacity-70">
              {filteredImages[currentIndex]?.caption || hotel.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative flex items-center justify-center w-full max-w-6xl h-[80vh] bg-black"
          >
            <img
              src={filteredImages[currentIndex].src}
              alt={filteredImages[currentIndex].caption}
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        </div>
        {/* Footer / Thumbnails */}
        <div className="bg-black/80 backdrop-blur-md border-t border-white/10 p-4 pb-8 md:pb-4">
          {/* Categories */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
                  activeCategory === cat
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {formatCategoryName(cat)}
              </button>
            ))}
          </div>

          {/* Thumbnails Strip */}
          <div className="flex gap-2 overflow-x-auto justify-start md:justify-center px-4 no-scrollbar h-16">
            {/* Thumbnails - change this */}
            {filteredImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-24 h-16 rounded-md overflow-hidden cursor-pointer flex-shrink-0 transition-all ${
                  idx === currentIndex
                    ? "ring-2 ring-primary scale-105 opacity-100"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <OptimizedImage // wrapper is absolute inset-0 now, parent has w-24 h-16 ✅
                  src={img.src}
                  alt={img.caption}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
