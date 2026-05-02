import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  Navigation,
  MessageCircle,
  Facebook,
  Linkedin,
  Twitter,
  Loader2,
} from "lucide-react";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import { Wine_GALLERY_ITEMS, Wine_GALLERY_MEDIA } from "./WineGalleryData";

import coverimg from "./../../../../../assets/resturant_images/wine_hero_premium.png";

const Wine_DATA = {
  name: "Kennedia Wine",
  location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
  city: "Ghaziabad",
};

const mapsLink = "https://www.google.com/maps/search/Kennedia+Wine+Ghaziabad";

const WINE_BANNER_IMAGES = [
  { url: coverimg, alt: "Premium Wine Collection" },
  { url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80", alt: "Vintage Red Wine" },
  { url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80", alt: "Artisan Pouring" },
  { url: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=1600&q=80", alt: "Estate Cellar" },
];

const MAX_VISIBLE = 7;

export default function WineBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = WINE_BANNER_IMAGES.length;

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const activeSlide = WINE_BANNER_IMAGES[activeIndex];

  return (
    <section className="relative h-svh w-full overflow-hidden bg-[#0D0508]">
      {/* Background Media Cross-fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={activeSlide?.url}
            alt={activeSlide?.alt || "Wine Gallery"}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Main Content Overlay */}
      <div className="relative z-10 flex h-full items-center pt-[100px] md:pt-[120px]">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl">
            {/* Breadcrumbs */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]"
            >
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <Link to="/wine-homepage" className="hover:text-white transition-colors">Wines</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <span className="text-white/60">Properties</span>
            </motion.nav>

            {/* Title & Heading */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-4"
            >
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
                Kennedia Blu · Estate Collection
              </span>
              <h1
                className="font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl"
                style={{ fontStyle: "italic", fontWeight: 900 }}
              >
                One Night In <br />
                <span className="text-[#D4AF37]">Kennedia Blu</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-8 max-w-lg text-sm md:text-base italic leading-relaxed text-white/70"
            >
              "Where every sip feels like a hug. Crafted with love, every blend at
              Kennedia is more than just a drink - it's a comforting embrace in a cup."
            </motion.p>

            {/* Action Buttons & Info */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-wrap items-center gap-5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                  <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Location</p>
                  <p className="text-xs font-semibold text-white/90">{Wine_DATA.city}</p>
                </div>
              </div>

              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 hover:bg-white cursor-pointer"
              >
                Navigate to Estate <Navigation className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 right-10 z-20 flex items-center gap-3">
        {WINE_BANNER_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${activeIndex === idx ? "w-12 bg-[#D4AF37]" : "w-6 bg-white/20 hover:bg-white/40"
              }`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── STATIC FALLBACK SLIDES ───────────────────────────────────────────────────
const FALLBACK_SLIDES = [
  { url: coverimg, alt: "Premium Wine Collection" },
  { url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80", alt: "Vintage Red Wine" },
  { url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80", alt: "Artisan Pouring" },
  { url: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=1600&q=80", alt: "Estate Cellar" },
];

/**
 * Dynamic hero banner for WinePage.
 * Accepts propertyData (from GetAllPropertyDetails) and galleryData (from getGalleryByPropertyId).
 * Falls back to static slides when no gallery images are available.
 */
export function DynamicWineBanner({ propertyData, galleryData = [], loading = false }) {
  const slides = useMemo(() => {
    const activeImages = (galleryData || [])
      .filter((g) => g.isActive && g.media?.url && g.categoryName?.toLowerCase() !== "3d")
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
      .map((g) => ({ url: g.media.url, alt: g.media.alt || "" }));
    return (activeImages.length > 0 ? activeImages : FALLBACK_SLIDES).slice(0, 3);
  }, [galleryData]);

  const name = useMemo(() => {
    if (!propertyData) return "Kennedia Wine";
    return propertyData.name ?? propertyData.propertyName ?? "Kennedia Wine";
  }, [propertyData]);

  const city = useMemo(() => {
    if (!propertyData) return "";
    return propertyData.city ?? propertyData.locationName ?? propertyData.city ?? "";
  }, [propertyData]);

  const address = useMemo(() => {
    if (!propertyData) return "";
    return propertyData.location ?? propertyData.fullAddress ?? propertyData.address ?? "";
  }, [propertyData]);

  const mapsLink = useMemo(() => {
    if (!propertyData) return null;
    if (propertyData.addressUrl) return propertyData.addressUrl;
    if (propertyData.coordinates?.lat && propertyData.coordinates?.lng)
      return `https://www.google.com/maps?q=${propertyData.coordinates.lat},${propertyData.coordinates.lng}`;
    if (propertyData.latitude && propertyData.longitude)
      return `https://www.google.com/maps?q=${propertyData.latitude},${propertyData.longitude}`;
    return null;
  }, [propertyData]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="relative flex h-svh w-full items-center justify-center bg-[#0D0508]">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
      </section>
    );
  }

  const activeSlide = slides[activeIndex];

  return (
    <section className="relative h-svh w-full overflow-hidden bg-[#0D0508]">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={activeSlide?.url}
            alt={activeSlide?.alt || name}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center pt-[100px] md:pt-[120px]">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]"
            >
              <Link to="/" className="transition-colors hover:text-white">Home</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <Link to="/wine-homepage" className="transition-colors hover:text-white">Wines</Link>
              <ChevronRight className="h-2.5 w-2.5 opacity-50" />
              <span className="text-white/60">{name}</span>
            </motion.nav>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-4"
            >
              {/* <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
                Estate Collection
              </span> */}
              <h1
                className="font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl"
                style={{ fontStyle: "italic", fontWeight: 900 }}
              >
                {name.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-[#D4AF37]">{name.split(" ").slice(-1)}</span>
              </h1>
            </motion.div>

            {/* Location + CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-wrap items-center gap-5"
            >
              {(city || address) && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Location</p>
                    <p className="text-xs font-semibold text-white/90">{city || address}</p>
                  </div>
                </div>
              )}

              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 hover:bg-white"
                >
                  Navigate to Estate <Navigation className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 right-10 z-20 flex items-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${activeIndex === idx ? "w-12 bg-[#D4AF37]" : "w-6 bg-white/20 hover:bg-white/40"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
