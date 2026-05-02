import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  Star,
  Navigation,
  Image as ImageIcon,
  X,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Sparkles,
  Twitter,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

// ── Fallbacks ─────────────────────────────────────────────────────────────────
const FALLBACK_LOCATION = "Ghaziabad, India";
const FALLBACK_NEARBY = [
  "0.2 km from Gateway of India",
  "2.5 km from Marine Drive",
];
const FALLBACK_TAGLINE = "PREMIUM EXPERIENCE";
const FALLBACK_MAPS_LINK =
  "https://google.com/maps/place/kennedia+blu+restaurant+ghaziabad/data=!4m2!3m1!1s0x390cf1005bab4c6f:0xb455a48e012d76e7?sa=X&ved=1t:242&ictx=111";

// ── Empty slot placeholder ────────────────────────────────────────────────────
const EmptySlot = ({ className = "" }) => (
  <div
    className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
  >
    <ImageIcon className="w-8 h-8 text-gray-300" />
  </div>
);

export default function CategoryHero({
  content,
  propertyId,
  galleryData = [],
  propertyData,
}) {
  const navigate = useNavigate();
  const [showShareReactions, setShowShareReactions] = useState(false);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStart = React.useRef(null);

  const restaurantPath = `/${createCitySlug(
    propertyData?.city ||
      propertyData?.locationName ||
      propertyData?.propertyName,
  )}/${createHotelSlug(
    propertyData?.propertyName || propertyData?.name || "restaurant",
    propertyId || 27,
  )}`;

  // ── Derive fields from propertyData ──────────────────────────────────────
  const location = useMemo(() => {
    if (!propertyData) return FALLBACK_LOCATION;
    return (
      propertyData.fullAddress ??
      propertyData.address ??
      propertyData.location ??
      FALLBACK_LOCATION
    );
  }, [propertyData]);

  const city = useMemo(() => {
    if (!propertyData) return "";
    return propertyData.city ?? propertyData.locationName ?? "";
  }, [propertyData]);

  const tagline = useMemo(() => {
    if (!propertyData) return FALLBACK_TAGLINE;
    return propertyData.tagline ?? propertyData.subTitle ?? FALLBACK_TAGLINE;
  }, [propertyData]);

  const rating = useMemo(() => propertyData?.rating ?? null, [propertyData]);

  const nearbyPlaces = useMemo(() => {
    if (propertyData?.nearbyLocations?.length > 0) {
      return propertyData.nearbyLocations.map((n) => ({
        nearbyLocationName: n.nearbyLocationName,
        googleMapLink: n.googleMapLink,
      }));
    }
    if (content?.nearbyPlaces?.length > 0) {
      return content.nearbyPlaces.map((p) =>
        typeof p === "string" ? { nearbyLocationName: p } : p,
      );
    }
    return FALLBACK_NEARBY.map((name) => ({ nearbyLocationName: name }));
  }, [propertyData, content]);

  const mapsLink = useMemo(() => {
    if (propertyData?.latitude && propertyData?.longitude) {
      return `https://www.google.com/maps?q=${propertyData.latitude},${propertyData.longitude}`;
    }
    if (propertyData?.coordinates?.lat && propertyData?.coordinates?.lng) {
      return `https://www.google.com/maps?q=${propertyData.coordinates.lat},${propertyData.coordinates.lng}`;
    }
    return FALLBACK_MAPS_LINK;
  }, [propertyData]);

  // ── galleryItems: active, non-3d, sorted by displayOrder ─────────────────
  // galleryData shape (after template normalization):
  //   { id, media: { mediaId, url, type, fileName, alt }, isActive, categoryName, displayOrder }
  const galleryItems = useMemo(() => {
    return (galleryData || [])
      .filter(
        (g) =>
          g.isActive !== false &&
          g.media?.url &&
          g.categoryName?.toLowerCase() !== "3d",
      )
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [galleryData]);

  // ── galleryMedia: flat list for mobile carousel & GalleryModal ───────────
  const galleryMedia = useMemo(
    () =>
      galleryItems.map((g) => ({
        mediaId: g.media.mediaId,
        url: g.media.url,
        type: g.media.type,
        fileName: g.media.fileName,
        alt: g.media.alt,
      })),
    [galleryItems],
  );

  /**
   * gridMedia: 4-element array for the desktop grid.
   *
   * Rules:
   * 1. Items with displayOrder 1–4 go into that exact slot (0-indexed).
   * 2. displayOrder outside 1–4 / missing / collision → overflow list.
   * 3. Empty slots are backfilled left-to-right from overflow.
   * 4. Still-empty slots → null (EmptySlot rendered).
   *
   * Each slot holds the media object { url, alt, ... } (not the full gallery item).
   * Fallback: if galleryData is empty, heroImage goes to slot 0.
   */
  const gridMedia = useMemo(() => {
    if (galleryItems.length === 0) {
     return [null, null, null, null];
    }

    const slots = [null, null, null, null];
    const overflow = [];

    galleryItems.forEach((item) => {
      const order = item.displayOrder;
      if (order >= 1 && order <= 4) {
        if (!slots[order - 1]) {
          slots[order - 1] = item.media; // store the media object
        } else {
          overflow.push(item.media); // collision → overflow
        }
      } else {
        overflow.push(item.media); // out of range → overflow
      }
    });

    // Backfill empty slots from overflow left-to-right
    for (let i = 0; i < 4; i++) {
      if (!slots[i] && overflow.length > 0) {
        slots[i] = overflow.shift();
      }
    }

    return slots;
  }, [galleryItems, content]);

  const totalImages = galleryMedia.length;

  const prevMobile = () =>
    setMobileIndex(
      (c) =>
        (c - 1 + Math.max(totalImages, 1)) % Math.max(totalImages, 1),
    );
  const nextMobile = () =>
    setMobileIndex((c) => (c + 1) % Math.max(totalImages, 1));

  const openGalleryAt = (index) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const handleBookmark = () => {
    // Bookmark functionality removed as per request
  };


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
      name: "X",
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
          name: content.title,
          location: location,
          propertyId: propertyId,
          media: galleryMedia,
        }}
        initialImageIndex={initialGalleryIndex}
        galleryData={galleryData}
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
            to={restaurantPath}
            className="hover:text-primary transition-colors font-medium"
          >
            Restaurant
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold truncate">
            {content.title}
          </span>
        </motion.nav>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <motion.div
            variants={staggerContainer}
            className="space-y-3 w-full text-left"
          >
            {/* Badge + Rating */}
            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                <Sparkles size={12} className="animate-pulse" /> {tagline}
              </span>
              {rating && (
                <div className="flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                  <span>{rating}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-balance leading-tight"
            >
              {content.title.split(" ")[0]}{" "}
              <span className="italic text-primary">
                {content.title.split(" ").slice(1).join(" ")}
              </span>
            </motion.h1>

            <div className="space-y-2">
              {/* Location row */}
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground"
              >
                <div className="flex items-center gap-1.5 cursor-default">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {location}
                    {city && location !== city ? `, ${city}` : ""}
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

              {/* Nearby landmarks */}
              {nearbyPlaces.length > 0 && (
                <motion.div
                  variants={fadeIn}
                  className="flex flex-wrap items-center gap-4 pt-1"
                >
                  {nearbyPlaces.map((place, i) => (
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full active:scale-95 transition-all"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-zinc-900 text-white border-none shadow-xl px-4 py-2">
                  <p className="flex items-center gap-2 text-[11px] font-medium">
                    <Heart size={14} className="text-primary" />
                    <span className="hidden md:inline">Press Ctrl + D to bookmark</span>
                    <span className="md:hidden">Use browser menu to bookmark</span>
                  </p>
                </TooltipContent>



              </Tooltip>
            </TooltipProvider>

          </div>
        </div>

        <motion.div variants={fadeIn}>
          {/* ── MOBILE SLIDER ── */}
          <div className="relative w-full h-[420px] overflow-hidden rounded-3xl shadow-xl md:hidden">
            {galleryMedia.length === 0 ? (
              <EmptySlot className="absolute inset-0 rounded-3xl" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => openGalleryAt(mobileIndex)}
                  onTouchStart={(e) => {
                    touchStart.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (touchStart.current === null) return;
                    const diff =
                      touchStart.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 40)
                      diff > 0 ? nextMobile() : prevMobile();
                    touchStart.current = null;
                  }}
                >
                  <OptimizedImage
                    src={galleryMedia[mobileIndex]?.url}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Arrows */}
            {galleryMedia.length > 1 && (
              <>
                <button
                  onClick={prevMobile}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
                >
                  <ChevronRight className="rotate-180 w-4 h-4 text-zinc-800" />
                </button>
                <button
                  onClick={nextMobile}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-800" />
                </button>
              </>
            )}

            {/* Counter */}
            {galleryMedia.length > 0 && (
              <div className="absolute bottom-4 right-4 z-20 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full">
                {mobileIndex + 1} / {galleryMedia.length}
              </div>
            )}
          </div>

          {/* ── DESKTOP GRID ── */}
          {/*
            gridMedia[0] → col-span-2 main image  (displayOrder 1)
            gridMedia[1] → top of right stack     (displayOrder 2)
            gridMedia[2] → bottom of right stack  (displayOrder 3)
            gridMedia[3] → last column            (displayOrder 4 or overflow)
            Any slot without an image renders EmptySlot.
          */}
          <div className="hidden md:grid grid-cols-4 gap-3 h-[440px] rounded-3xl overflow-hidden shadow-xl">
            {/* SLOT 0 — main image, col-span-2 */}
            <div
              className={`md:col-span-2 relative group overflow-hidden rounded-2xl ${
                gridMedia[0] ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={() => {
                if (!gridMedia[0]) return;
                const idx = galleryMedia.findIndex(
                  (m) => m.url === gridMedia[0].url,
                );
                openGalleryAt(idx >= 0 ? idx : 0);
              }}
            >
              {gridMedia[0] ? (
                <>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                  <OptimizedImage
                    src={gridMedia[0].url}
                    alt={gridMedia[0].alt || content.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </>
              ) : (
                <EmptySlot />
              )}
            </div>

            {/* SLOTS 1 & 2 — stacked middle column */}
            <div className="md:col-span-1 flex flex-col gap-3">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`relative group overflow-hidden rounded-2xl flex-1 ${
                    gridMedia[idx] ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() => {
                    if (!gridMedia[idx]) return;
                    const gi = galleryMedia.findIndex(
                      (m) => m.url === gridMedia[idx].url,
                    );
                    openGalleryAt(gi >= 0 ? gi : 0);
                  }}
                >
                  {gridMedia[idx] ? (
                    <>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                      <OptimizedImage
                        src={gridMedia[idx].url}
                        alt={gridMedia[idx].alt || ""}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      />
                    </>
                  ) : (
                    <EmptySlot />
                  )}
                </div>
              ))}
            </div>

            {/* SLOT 3 — last column + "View Gallery" button */}
            <div
              className={`md:col-span-1 relative group overflow-hidden rounded-2xl ${
                gridMedia[3] ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={() => {
                if (!gridMedia[3]) return;
                const gi = galleryMedia.findIndex(
                  (m) => m.url === gridMedia[3].url,
                );
                openGalleryAt(gi >= 0 ? gi : 0);
              }}
            >
              {gridMedia[3] ? (
                <>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                  <OptimizedImage
                    src={gridMedia[3].url}
                    alt={gridMedia[3].alt || ""}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </>
              ) : (
                <EmptySlot />
              )}

              {/* VIEW GALLERY — always rendered on last slot */}
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGalleryOpen(true);
                  }}
                  className="pointer-events-auto bg-white/85 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-black text-[11px] font-black shadow-lg transition-all group-hover:scale-110 hover:bg-white"
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