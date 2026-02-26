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
  Twitter,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import { toast } from "react-hot-toast";

import gallery5 from "@/assets/resturant_images/food1.jpg";
import gallery6 from "@/assets/resturant_images/099A9549.jpg";
import gallery7 from "@/assets/resturant_images/099A9570.jpg";
import gallery8 from "@/assets/resturant_images/099A9580.jpg";
import gallery9 from "@/assets/resturant_images/099A9595.jpg";
import gallery10 from "@/assets/resturant_images/099A9691.jpg";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  price: string | number;
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
  categoryId: number;
  isActive: boolean;
}

interface ResturantBannerProps {
  propertyData: any | null; // raw API shape
  galleryData: GalleryItem[];
  loading: boolean;
}

// ── Fallback static data ──────────────────────────────────────────────────────

const FALLBACK_GALLERY_MEDIA: PropertyMedia[] = [
  gallery5,
  gallery6,
  gallery7,
  gallery8,
  gallery9,
  gallery10,
].map((img, index) => ({
  mediaId: index,
  type: "IMAGE",
  url: img,
  fileName: null,
  alt: `Restaurant Gallery ${index + 1}`,
  width: null,
  height: null,
}));

const FALLBACK_RESTAURANT: RestaurantData = {
  id: 1,
  propertyId: 1,
  name: "Kennedia Blu Restaurant Ghaziabad",
  location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
  city: "Ghaziabad",
  type: "FINE DINING",
  tagline: "Experience elegance, taste, and unforgettable dining.",
  rating: null,
  price: "₹₹₹",
  media: [
    {
      url: gallery5,
      type: "IMAGE",
      alt: "Kennedia Blu Restaurant",
      mediaId: null,
      fileName: null,
      width: null,
      height: null,
    },
  ],
  coordinates: null,
  image: { src: gallery5, alt: "Kennedia Blu Restaurant Ghaziabad" },
  nearbyPlaces: ["300 meters from T&T Fragrance"],
};

// ── Motion variants ───────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ResturantBanner({
  propertyData,
  galleryData,
  loading,
}: ResturantBannerProps) {
  // ── Derive restaurant fields from propertyData, fallback to static ────────
  const restaurant: RestaurantData = useMemo(() => {
    console.log("propertyData", propertyData);
    if (!propertyData) return FALLBACK_RESTAURANT;
    return {
      id: propertyData.id ?? propertyData.propertyId ?? FALLBACK_RESTAURANT.id,
      propertyId:
        propertyData.propertyId ??
        propertyData.id ??
        FALLBACK_RESTAURANT.propertyId,
      name:
        propertyData.propertyName ??
        propertyData.name ??
        FALLBACK_RESTAURANT.name,
      location:
        propertyData.fullAddress ??
        propertyData.address ??
        propertyData.location ??
        FALLBACK_RESTAURANT.location,
      city:
        propertyData.city ??
        propertyData.locationName ??
        FALLBACK_RESTAURANT.city,
      type:
        propertyData.propertyType ??
        propertyData.propertyTypes?.[0] ??
        FALLBACK_RESTAURANT.type,
      tagline:
        propertyData.tagline ??
        propertyData.subTitle ??
        FALLBACK_RESTAURANT.tagline,
      rating: propertyData.rating ?? FALLBACK_RESTAURANT.rating,
      price: propertyData.price ?? FALLBACK_RESTAURANT.price,
      // media intentionally NOT used for gallery — kept for type completeness
      media: propertyData.media ?? FALLBACK_RESTAURANT.media,
      coordinates:
        propertyData.coordinates ??
        (propertyData.latitude && propertyData.longitude
          ? { lat: propertyData.latitude, lng: propertyData.longitude }
          : FALLBACK_RESTAURANT.coordinates),
      image: {
        src: propertyData.media?.[0]?.url ?? gallery5,
        alt: propertyData.propertyName ?? FALLBACK_RESTAURANT.name,
      },
      nearbyPlaces: propertyData.nearbyLocations?.length
        ? propertyData.nearbyLocations.map((n: any) => n.name ?? n)
        : FALLBACK_RESTAURANT.nearbyPlaces,
    };
  }, [propertyData]);

  // ── Gallery images — from galleryData API, fallback to static assets ──────
  // Rule: NEVER use propertyData.media for the gallery grid.
  const galleryMedia: PropertyMedia[] = useMemo(() => {
    if (galleryData && galleryData.length > 0) {
      return galleryData
        .filter(
          (g) =>
            g.isActive && g.media?.url && g.categoryName?.toLowerCase() !== "3d",
        )
        .map((g) => g.media);
    }
    return FALLBACK_GALLERY_MEDIA;
  }, [galleryData]);

  const galleryItems: GalleryItem[] = useMemo(() => {
    if (galleryData && galleryData.length > 0) {
      return galleryData.filter(
        (g) => g.isActive && g.media?.url && g.categoryName?.toLowerCase() !== "3d",
      );
    }
    return FALLBACK_GALLERY_MEDIA.map((media, index) => ({
      id: index,
      category: "RESTAURANT",
      propertyId: restaurant.propertyId,
      propertyName: restaurant.name,
      media,
      isActive: true,
    }));
  }, [galleryData, restaurant.propertyId, restaurant.name]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareReactions, setShowShareReactions] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

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
    {
      name: "X (Twitter)",
      icon: <Twitter size={18} />,
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={20} />,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    isBookmarked
      ? toast("Removed from bookmark")
      : toast.success("Added to bookmark");
  };

  const openGalleryAt = (index: number) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  // ── Map coordinates link ──────────────────────────────────────────────────
  const mapsLink = restaurant.coordinates
    ? `https://www.google.com/maps?q=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`
    : "https://google.com/maps/place/kennedia+blu+restaurant+ghaziabad/data=!4m2!3m1!1s0x390cf1005bab4c6f:0xb455a48e012d76e7?sa=X&ved=1t:242&ictx=111";

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
          media: galleryMedia,
        }}
        initialImageIndex={initialGalleryIndex}
        galleryData={galleryItems}
      />

      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Breadcrumb */}
        <motion.nav
          variants={fadeIn}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold truncate">
            {restaurant.name}
          </span>
        </motion.nav>

        {/* Title row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <motion.div
            variants={staggerContainer}
            className="space-y-3 w-full text-left"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <span className="inline-flex bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {restaurant.tagline}
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

            <div className="space-y-2">
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground"
              >
                <div className="flex items-center gap-1.5 cursor-default">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {restaurant.location}
                    {restaurant.city && restaurant.location !== restaurant.city
                      ? `, ${restaurant.city}`
                      : ""}
                  </span>
                </div>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-destructive hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-4 h-4" /> View Map
                </a>
              </motion.div>

              {restaurant.nearbyPlaces &&
                restaurant.nearbyPlaces.length > 0 && (
                  <motion.div
                    variants={fadeIn}
                    className="flex flex-wrap items-center gap-4 pt-1"
                  >
                    {restaurant.nearbyPlaces.map((place, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground/80"
                      >
                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                        <span>{place}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
            </div>
          </motion.div>

          {/* Share + Save */}
          <div className="flex gap-3 relative">
            <div
              className="relative"
              onMouseEnter={() => setShowShareReactions(true)}
              onMouseLeave={() => setShowShareReactions(false)}
            >
              <AnimatePresence>
                {showShareReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -60, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 shadow-2xl rounded-full px-2.5 py-2 flex gap-2.5 z-50 backdrop-blur-md"
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
                        whileHover={{ scale: 1.2, y: -3 }}
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

        {/* Photo grid — uses galleryMedia exclusively */}
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[320px] md:h-[440px] rounded-3xl overflow-hidden shadow-xl relative"
        >
          {/* Main large image */}
          <div
            className="md:col-span-2 relative group cursor-pointer overflow-hidden"
            onClick={() => openGalleryAt(0)}
          >
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
            <OptimizedImage
              src={galleryMedia[0]?.url ?? ""}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Two stacked images */}
          <div className="md:col-span-1 flex flex-col gap-3">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="h-1/2 relative group cursor-pointer overflow-hidden"
                onClick={() => openGalleryAt(idx)}
              >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
                <OptimizedImage
                  src={galleryMedia[idx]?.url ?? ""}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* 4th image with "View Gallery" overlay */}
          <div
            className="md:col-span-1 relative group cursor-pointer overflow-hidden"
            onClick={() => openGalleryAt(3)}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
            <OptimizedImage
              src={galleryMedia[3]?.url ?? ""}
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
                  {galleryMedia.length > 4
                    ? `+${galleryMedia.length - 4} MORE`
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
