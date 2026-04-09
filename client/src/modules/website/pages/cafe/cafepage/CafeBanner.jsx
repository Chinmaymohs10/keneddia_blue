import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Image as ImageIcon,
  MessageCircle,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import { CAFE_GALLERY_ITEMS, CAFE_GALLERY_MEDIA } from "./cafeGalleryData";

const CAFE_DATA = {
  name: "Kennedia Cafe",
  location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
  city: "Ghaziabad",
  tagline: "Artisan Brews & All-Day Comfort",
  nearbyPlaces: [
    { nearbyLocationName: "300 meters from City Center Mall" },
    { nearbyLocationName: "Near Raj Nagar Metro Station" },
  ],
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

const mapsLink =
  "https://www.google.com/maps/search/Kennedia+Cafe+Ghaziabad";

export default function CafeBanner() {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareReactions, setShowShareReactions] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileTouchStart = useRef(null);

  const mobilePrev = () =>
    setMobileIndex(
      (c) => (c - 1 + CAFE_GALLERY_MEDIA.length) % CAFE_GALLERY_MEDIA.length,
    );
  const mobileNext = () =>
    setMobileIndex((c) => (c + 1) % CAFE_GALLERY_MEDIA.length);

  const openGalleryAt = (index) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
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

  const gridImages = CAFE_GALLERY_MEDIA.slice(0, 4);
  const totalImages = CAFE_GALLERY_MEDIA.length;

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
          name: CAFE_DATA.name,
          location: CAFE_DATA.location,
          propertyId: 1,
          media: CAFE_GALLERY_MEDIA,
        }}
        initialImageIndex={initialGalleryIndex}
        galleryData={CAFE_GALLERY_ITEMS}
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
          <span className="text-foreground font-semibold truncate">
            {CAFE_DATA.name}
          </span>
        </motion.nav>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <motion.div
            variants={staggerContainer}
            className="space-y-3 w-full text-left"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <span className="inline-flex bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {CAFE_DATA.tagline}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-5xl font-serif font-bold tracking-tight"
            >
              {CAFE_DATA.name}
            </motion.h1>

            <div className="space-y-2">
              <motion.div
                variants={fadeIn}
                className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground"
              >
                <div className="flex items-center gap-1.5 cursor-default">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {CAFE_DATA.location}
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

              <motion.div
                variants={fadeIn}
                className="flex flex-wrap items-center gap-4 pt-1"
              >
                {CAFE_DATA.nearbyPlaces.map((place, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground/80"
                  >
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    <span>{place.nearbyLocationName}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

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
              <Button variant="outline" className="rounded-full active:scale-95">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>

            <Button
              variant="outline"
              className={`rounded-full active:scale-95 transition-all ${
                isBookmarked
                  ? "bg-destructive/10 border-destructive text-destructive"
                  : ""
              }`}
              onClick={() => setIsBookmarked((b) => !b)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isBookmarked ? "fill-current text-destructive" : ""
                }`}
              />
              {isBookmarked ? "Bookmarked" : "Save"}
            </Button>
          </div>
        </div>

        <motion.div variants={fadeIn}>
          <div className="relative w-full h-[420px] overflow-hidden bg-black md:hidden">
            <div className="absolute top-1/4 left-0 whitespace-nowrap text-[8rem] font-black text-white/[0.03] select-none z-0 pointer-events-none italic">
              GALLERY
            </div>

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
                  if (Math.abs(diff) > 40) {
                    diff > 0 ? mobileNext() : mobilePrev();
                  }
                  mobileTouchStart.current = null;
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                <img
                  src={CAFE_GALLERY_MEDIA[mobileIndex]?.url || ""}
                  alt={CAFE_GALLERY_MEDIA[mobileIndex]?.alt || ""}
                  className="absolute inset-0 w-full h-full object-cover object-center scale-110"
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-8 right-5 z-30 flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-4xl font-serif italic tracking-tighter">
                    0{mobileIndex + 1}
                  </span>
                  <span className="text-white/20 text-lg font-serif">
                    /{String(CAFE_GALLERY_MEDIA.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="w-24 h-[2px] bg-white/10 relative mt-1.5 overflow-hidden">
                  <motion.div
                    className="absolute h-full bg-primary top-0 left-0"
                    animate={{
                      width: `${((mobileIndex + 1) / CAFE_GALLERY_MEDIA.length) * 100}%`,
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
          </div>

          <div className="hidden md:grid grid-cols-4 gap-3 h-[440px] rounded-3xl overflow-hidden shadow-xl">
            <div
              className="md:col-span-2 relative group overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => openGalleryAt(0)}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
              <img
                src={gridImages[0].url}
                alt={gridImages[0].alt}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            <div className="md:col-span-1 flex flex-col gap-3">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="relative group overflow-hidden rounded-2xl flex-1 cursor-pointer"
                  onClick={() => openGalleryAt(idx)}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                  <img
                    src={gridImages[idx].url}
                    alt={gridImages[idx].alt}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>

            <div
              className="md:col-span-1 relative group overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => openGalleryAt(3)}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
              <img
                src={gridImages[3].url}
                alt={gridImages[3].alt}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
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
