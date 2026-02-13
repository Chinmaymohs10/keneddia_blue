import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  Loader2,
  Star,
  Navigation,
  Image as ImageIcon,
  X,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import { toast } from "react-hot-toast";

// ... (Interfaces and Fallback Data stay the same as your original code)
// ─── Interfaces ─────────────────────────────────────────────────────────────

interface PropertyMedia {
  mediaId: number | null;
  type: string;
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface RestaurantData {
  id: number;
  propertyId: number;
  name: string;
  location: string;
  city: string;
  type: string;
  tagline: string;
  rating: number | null;
  price: string;
  media: PropertyMedia[];
  coordinates: { lat: number; lng: number } | null;
  image: { src: string; alt: string };
  nearbyPlaces?: string[];
}

interface GalleryItem {
  id: number;
  category: string;
  propertyId: number;
  propertyName: string;
  media: PropertyMedia;
  isActive: boolean;
}

// ─── Fallback Data (Explicitly Typed) ───────────────────────────────────────

const FALLBACK_RESTAURANT: RestaurantData = {
  id: 0,
  propertyId: 0,
  name: "The Grand Dining Restaurant",
  location: "123 Heritage Lane, Near Gateway Arch",
  city: "Mumbai",
  type: "FINE DINING",
  tagline: "Experience culinary excellence in every bite.",
  rating: 4.8,
  price: "₹2,500",
  media: [
    {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
      type: "IMAGE",
      alt: "Restaurant Ambience",
      mediaId: null,
      fileName: null,
      width: null,
      height: null,
    },
    {
      url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800",
      type: "IMAGE",
      alt: "Interior",
      mediaId: null,
      fileName: null,
      width: null,
      height: null,
    },
    {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800",
      type: "IMAGE",
      alt: "Dish",
      mediaId: null,
      fileName: null,
      width: null,
      height: null,
    },
    {
      url: "https://images.unsplash.com/photo-1550966841-3ee5ad0110d3?q=80&w=800",
      type: "IMAGE",
      alt: "Service",
      mediaId: null,
      fileName: null,
      width: null,
      height: null,
    },
  ],
  coordinates: { lat: 18.922, lng: 72.8347 },
  image: {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
    alt: "The Grand Dining",
  },
  nearbyPlaces: ["0.2 km from Gateway of India", "2.5 km from Marine Drive"],
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

function ResturantBanner() {
  const [restaurant, setRestaurant] = useState(FALLBACK_RESTAURANT);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // --- State for Share Hover ---
  const [showShareReactions, setShowShareReactions] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const topGridImages = useMemo(() => {
    const combined = [
      ...(restaurant?.media || []),
      ...galleryData.map((g) => g.media),
    ];
    if (combined.length === 0) return FALLBACK_RESTAURANT.media;
    return combined.filter((m) => m && m.url);
  }, [restaurant?.media, galleryData]);
  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={20} />,
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      color: "bg-[#1877F2]",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    // {
    //   name: "Instagram",
    //   icon: <Instagram size={20} />,
    //   color: "https://instagram.com",
    // },
    {
      name: "LinkedIn",
      icon: <Linkedin size={20} />,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success("Added to bookmark");
    } else {
      toast("Removed from bookmark");
    }
  };

  const openGalleryAt = (index) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  if (!restaurant) return null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="pt-24 pb-12 bg-gradient-to-b from-background to-muted/20"
    >
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        hotel={{
          name: restaurant.name,
          location: restaurant.location,
          propertyId: restaurant.propertyId,
          media: restaurant.media,
        }}
        initialImageIndex={initialGalleryIndex}
        galleryData={galleryData}
      />

      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <motion.nav
          variants={fadeIn}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to="/resturants"
            className="hover:text-primary transition-colors"
          >
            Restaurants
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold truncate">
            {restaurant.name}
          </span>
        </motion.nav>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <motion.div variants={staggerContainer} className="space-y-3 w-full">
            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <span className="inline-flex bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {restaurant.type}
              </span>
              {restaurant.rating && (
                <div className="flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                  <span>{restaurant.rating}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
              )}
            </motion.div>
            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-5xl font-serif font-bold tracking-tight"
            >
              {restaurant.name}
            </motion.h1>
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground"
            >
              <div className="flex items-center gap-1.5 cursor-default">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {restaurant.location}, {restaurant.city}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex gap-3 relative">
            {/* ── SHARE BUTTON WITH HOVER REACTION ── */}
            <div
              className="relative"
              onMouseEnter={() => setShowShareReactions(true)}
              onMouseLeave={() => setShowShareReactions(false)}
            >
              <AnimatePresence>
                {showShareReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -55, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-12 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 shadow-2xl rounded-full px-2 py-1.5 flex gap-2 z-50 backdrop-blur-md"
                  >
                    {socialPlatforms.map((platform, index) => (
                      <motion.a
                        key={platform.name}
                        href={platform.link}
                        target="_blank"
                        rel="noreferrer"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04 }}
                        whileHover={{ scale: 1.2, y: -5 }}
                        className={`${platform.color} text-white p-2.5 rounded-full shadow-lg transition-transform flex items-center justify-center`}
                      >
                        {platform.icon}
                        <span className="sr-only">{platform.name}</span>
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="outline"
                className="rounded-full active:scale-95"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>

            {/* ── SAVE BUTTON (Normal Click Logic) ── */}
            <Button
              variant="outline"
              className={`rounded-full active:scale-95 transition-all ${isBookmarked ? "bg-destructive/10 border-destructive text-destructive" : ""}`}
              onClick={handleBookmark}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current text-destructive" : ""}`}
              />
              {isBookmarked ? "Bookmarked" : "Save"}
            </Button>
          </div>
        </div>

        {/* --- PHOTO GRID --- */}
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[320px] md:h-[440px] rounded-3xl overflow-hidden shadow-xl relative"
        >
          <div
            className="md:col-span-2 relative group cursor-pointer overflow-hidden"
            onClick={() => openGalleryAt(0)}
          >
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
            <OptimizedImage
              src={topGridImages[0]?.url || ""}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          <div className="md:col-span-1 flex flex-col gap-3">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="h-1/2 relative group cursor-pointer overflow-hidden"
                onClick={() => openGalleryAt(idx)}
              >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
                <OptimizedImage
                  src={topGridImages[idx]?.url || ""}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          <div
            className="md:col-span-1 relative group cursor-pointer overflow-hidden"
            onClick={() => openGalleryAt(3)}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
            <OptimizedImage
              src={topGridImages[3]?.url || ""}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGalleryOpen(true);
                }}
                className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 text-black text-[11px] font-black shadow-lg transform transition-transform group-hover:scale-110 hover:bg-white"
              >
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>
                  {topGridImages.length > 4
                    ? `+${topGridImages.length - 4} MORE`
                    : "VIEW GALLERY"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ResturantBanner;
