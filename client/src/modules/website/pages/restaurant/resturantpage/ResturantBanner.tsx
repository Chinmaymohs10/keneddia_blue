import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import {
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  Loader2,
  ChevronLeft,
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
import { showSuccess, showError } from "@/lib/toasters/toastUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  addressUrl?: string | null;
  image: { src: string; alt: string };
  nearbyPlaces?: {
    nearbyLocationName: string;
    googleMapLink?: string;
  }[];
}

interface GalleryItem {
  id: number;
  category: string;
  propertyId: number;
  propertyName: string;
  media: PropertyMedia;
  categoryId: number;
  isActive: boolean;
  displayOrder?: number;
}

interface ResturantBannerProps {
  propertyData: any | null;
  galleryData: GalleryItem[];
  loading: boolean;
}

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
      url: "",
      type: "IMAGE",
      alt: "Kennedia Blu Restaurant",
      mediaId: null,
      fileName: null,
      width: null,
      height: null,
    },
  ],
  coordinates: null,
  image: { src: "", alt: "Kennedia Blu Restaurant Ghaziabad" },
  nearbyPlaces: [{ nearbyLocationName: "300 meters from T&T Fragrance" }],
};

// ── Motion variants ───────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

// ── Empty slot placeholder ────────────────────────────────────────────────────
const EmptySlot = ({ className = "" }: { className?: string }) => (
  <div
    className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
  >
    <ImageIcon className="w-8 h-8 text-gray-300" />
  </div>
);

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
      media: propertyData.media ?? FALLBACK_RESTAURANT.media,
      coordinates:
        propertyData.coordinates ??
        (propertyData.latitude && propertyData.longitude
          ? { lat: propertyData.latitude, lng: propertyData.longitude }
          : null),
      addressUrl: propertyData.addressUrl ?? null,
      image: {
        src: propertyData.media?.[0]?.url ?? "",
        alt: propertyData.propertyName ?? FALLBACK_RESTAURANT.name,
      },
      nearbyPlaces:
        propertyData.nearbyLocations?.length > 0
          ? propertyData.nearbyLocations.map((n: any) => ({
              nearbyLocationName: typeof n.nearbyLocationName === "string" ? n.nearbyLocationName : String(n.nearbyLocationName ?? ""),
              googleMapLink: n.googleMapLink,
            }))
          : FALLBACK_RESTAURANT.nearbyPlaces ?? [],
    };
  }, [propertyData]);

  // Sorted active gallery items (excluding 3d), ordered by displayOrder
  const galleryItems: GalleryItem[] = useMemo(() => {
    return (galleryData || [])
      .filter(
        (g) =>
          g.isActive && g.media?.url && g.categoryName?.toLowerCase() !== "3d",
      )
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [galleryData]);

  // Flat media array in sorted order (used for mobile carousel + gallery modal)
  const galleryMedia: PropertyMedia[] = useMemo(
    () => galleryItems.map((g) => g.media),
    [galleryItems],
  );

  const gridMedia: (PropertyMedia | null)[] = useMemo(() => {
    const slots: (PropertyMedia | null)[] = [null, null, null, null];
    const overflow: PropertyMedia[] = [];

    galleryItems.forEach((item) => {
      const order = item.displayOrder;
      if (order && order >= 1 && order <= 4) {
        if (!slots[order - 1]) {
          slots[order - 1] = item.media;
        } else {
          // Collision on same slot → overflow
          overflow.push(item.media);
        }
      } else {
        // displayOrder missing or > 4 → overflow
        overflow.push(item.media);
      }
    });

    // Backfill empty slots from left using overflow items
    for (let i = 0; i < 4; i++) {
      if (!slots[i] && overflow.length > 0) {
        slots[i] = overflow.shift()!;
      }
    }

    return slots;
  }, [galleryItems]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [showShareReactions, setShowShareReactions] = useState(false);
  const [showBookmarkMessage, setShowBookmarkMessage] = useState(false);


  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileTouchStart = useRef<number | null>(null);
  const mobilePrev = () =>
    setMobileIndex((c) => (c - 1 + galleryMedia.length) % galleryMedia.length);
  const mobileNext = () => setMobileIndex((c) => (c + 1) % galleryMedia.length);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    // Bookmark functionality removed as per request
  }, [restaurant.propertyId]);


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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const message = isMobile 
      ? "Use browser menu to bookmark" 
      : "Press Ctrl + D to bookmark";
    
    toast(message, {
      icon: "🔖",
      style: {
        borderRadius: "10px",
        background: "#18181b",
        color: "#fff",
        fontSize: "12px",
      },
    });

    setShowBookmarkMessage(true);
    setTimeout(() => {
      setShowBookmarkMessage(false);
    }, 3000);
  };


  const openGalleryAt = (index: number) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  // ── Map link: addressUrl > coordinates > null (no fallback to avoid wrong location) ──
  const mapsLink: string | null =
    restaurant.addressUrl ||
    (restaurant.coordinates
      ? `https://www.google.com/maps?q=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`
      : null);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );

  if (!restaurant) return null;

  // ── Desktop grid layout helpers ───────────────────────────────────────────
  // Determine layout based on how many images are available
  const totalImages = galleryMedia.length;

  // Render a grid slot: if media exists show image, else show empty placeholder
  const GridSlot = ({
    index,
    className = "",
    imgClassName = "",
    onClick,
  }: {
    index: number;
    className?: string;
    imgClassName?: string;
    onClick?: () => void;
  }) => {
    const media = galleryMedia[index];
    return (
      <div
        className={`relative group overflow-hidden rounded-2xl ${className} ${
          media ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={media ? onClick : undefined}
      >
        {media ? (
          <>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
            <OptimizedImage
              src={media.url}
              alt={media.alt ?? restaurant.name}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${imgClassName}`}
            />
          </>
        ) : (
          <EmptySlot />
        )}
      </div>
    );
  };

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
          <Link
            to="/restaurant-homepage"
            className="hover:text-primary transition-colors"
          >
            Restaurants
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
                {mapsLink && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-destructive hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" /> View Map
                  </a>
                )}
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
                        {place.googleMapLink ? (
                          <a
                            href={place.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline transition cursor-pointer"
                          >
                            {typeof place.nearbyLocationName === "string" ? place.nearbyLocationName : String(place.nearbyLocationName ?? "")}
                          </a>
                        ) : (
                          <span>{typeof place.nearbyLocationName === "string" ? place.nearbyLocationName : String(place.nearbyLocationName ?? "")}</span>
                        )}
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

            <div className="relative">
              <AnimatePresence>
                {showBookmarkMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -60, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-2 z-50 backdrop-blur-md whitespace-nowrap"
                  >
                    <Heart size={14} className="text-primary fill-primary" />
                    <p className="text-[11px] font-bold text-zinc-800 dark:text-white">
                      {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
                        ? "Use browser menu to bookmark" 
                        : "Press Ctrl + D to bookmark"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="outline"
                className="rounded-full active:scale-95 transition-all"
                onClick={handleBookmark}
                onMouseEnter={() => setShowBookmarkMessage(true)}
                onMouseLeave={() => setShowBookmarkMessage(false)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>

          </div>
        </div>

        <motion.div variants={fadeIn}>
          {/* ── MOBILE CAROUSEL ── */}
          <div className="relative w-full h-[420px] overflow-hidden bg-black md:hidden">
            {/* Watermark text */}
            <div className="absolute top-1/4 left-0 whitespace-nowrap text-[8rem] font-black text-white/[0.03] select-none z-0 pointer-events-none italic">
              GALLERY
            </div>

            {galleryMedia.length === 0 ? (
              <EmptySlot className="absolute inset-0" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => openGalleryAt(mobileIndex)}
                  onTouchStart={(e) => {
                    mobileTouchStart.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (mobileTouchStart.current === null) return;
                    const diff =
                      mobileTouchStart.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 40)
                      diff > 0 ? mobileNext() : mobilePrev();
                    mobileTouchStart.current = null;
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                  <img
                    src={galleryMedia[mobileIndex]?.url || ""}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center scale-110"
                  />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Counter + arrows */}
            {galleryMedia.length > 0 && (
              <div className="absolute bottom-8 right-5 z-30 flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-4xl font-serif italic tracking-tighter">
                      0{mobileIndex + 1}
                    </span>
                    <span className="text-white/20 text-lg font-serif">
                      /{String(galleryMedia.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="w-24 h-[2px] bg-white/10 relative mt-1.5 overflow-hidden">
                    <motion.div
                      className="absolute h-full bg-primary top-0 left-0"
                      animate={{
                        width: `${((mobileIndex + 1) / galleryMedia.length) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={mobilePrev}
                    className="p-3 border border-white/10 text-white hover:bg-white hover:text-black transition-all group active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={mobileNext}
                    className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-all group active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── DESKTOP GRID ── */}
          {/* gridMedia[0..3] are placed by displayOrder (1–4), gaps backfilled */}
          <div className="hidden md:grid grid-cols-4 gap-3 h-[440px] rounded-3xl overflow-hidden shadow-xl">
            {/* SLOT 0 — main image, col-span-2 */}
            <div
              className={`md:col-span-2 relative group overflow-hidden rounded-2xl ${gridMedia[0] ? "cursor-pointer" : "cursor-default"}`}
              onClick={() =>
                gridMedia[0] &&
                openGalleryAt(galleryMedia.indexOf(gridMedia[0]))
              }
            >
              {gridMedia[0] ? (
                <>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                  <OptimizedImage
                    src={gridMedia[0].url}
                    alt={gridMedia[0].alt ?? restaurant.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </>
              ) : (
                <EmptySlot />
              )}
            </div>

            {/* SLOTS 1 & 2 — stacked right column */}
            <div className="md:col-span-1 flex flex-col gap-3">
              {([1, 2] as const).map((idx) => (
                <div
                  key={idx}
                  className={`relative group overflow-hidden rounded-2xl flex-1 ${gridMedia[idx] ? "cursor-pointer" : "cursor-default"}`}
                  onClick={() =>
                    gridMedia[idx] &&
                    openGalleryAt(galleryMedia.indexOf(gridMedia[idx]!))
                  }
                >
                  {gridMedia[idx] ? (
                    <>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                      <OptimizedImage
                        src={gridMedia[idx]!.url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      />
                    </>
                  ) : (
                    <EmptySlot />
                  )}
                </div>
              ))}
            </div>

            {/* SLOT 3 — last column + view gallery button */}
            <div
              className={`md:col-span-1 relative group overflow-hidden rounded-2xl ${gridMedia[3] ? "cursor-pointer" : "cursor-default"}`}
              onClick={() =>
                gridMedia[3] &&
                openGalleryAt(galleryMedia.indexOf(gridMedia[3]))
              }
            >
              {gridMedia[3] ? (
                <>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                  <OptimizedImage
                    src={gridMedia[3].url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </>
              ) : (
                <EmptySlot />
              )}

              {/* VIEW GALLERY BUTTON — always on last slot */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGalleryOpen(true);
                  }}
                  className="pointer-events-auto bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-black text-[11px] font-black shadow-lg transition-all group-hover:scale-110 hover:bg-white"
                >
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>
                    {totalImages > 4
                      ? `+${totalImages - 4} MORE`
                      : "VIEW GALLERY"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ResturantBanner;
