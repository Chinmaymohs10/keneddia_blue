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
            className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
              activeIndex === idx ? "w-12 bg-[#D4AF37]" : "w-6 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
