import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HotelCarouselSection from "@/modules/website/components/HotelCarouselSection";
import HotelOffersCarousel from "@/modules/website/components/hotel/HotelOffersCarousel";
import HotelNewsUpdates from "@/modules/website/components/hotel/HotelNewsUpdates";
import HotelReviewsSection from "@/modules/website/components/HotelReviewsSection";
import QuickBooking from "@/modules/website/components/QuickBooking";
import GroupBookingSection from "@/modules/website/components/GroupBookingSection";
import SpecialOfferPopup from "@/modules/website/components/SpecialOfferPopup";
import WhatsAppButton from "@/modules/website/components/WhatsAppButton";
// Assets
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  getHotelHomepageHeroSection,
  getPropertyTypes,
  getAboutUsByPropertyType,
} from "@/Api/Api";

// Hotel Navigation Items
const HOTEL_NAV_ITEMS = [
  { type: "link", label: "OVERVIEW", key: "overview", href: "#overview" },
  { type: "link", label: "COLLECTION", key: "collection", href: "#collection" },
  { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "EVENTS", key: "events", href: "#events" },
  { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
] as any[];

// Fallback Hero Images
const FALLBACK_HERO_IMAGES = [
  siteContent.images.hotels.mumbai,
  siteContent.images.hotels.delhi,
  siteContent.images.hotels.hyderabad,
];

interface MediaItem {
  mediaId: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  fileName: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface ApiHeroItem {
  id: number;
  mainTitle: string;
  subTitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  backgroundAll: MediaItem[];
  backgroundLight: MediaItem[];
  backgroundDark: MediaItem[];
  subAll: MediaItem[];
  subLight: MediaItem[];
  subDark: MediaItem[];
  propertyId: number | null;
  propertyTypeId: number | null;
  showOnPropertyPage: boolean;
  showOnHomepage: boolean;
  active: boolean;
}

interface HeroSlide {
  id: number;
  type: "video" | "image";
  media: string;
  title: string;
  subtitle: string;
  backgroundAll: MediaItem[];
  backgroundLight: MediaItem[];
  backgroundDark: MediaItem[];
}

interface AboutUsMedia {
  mediaId: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface AboutUsSection {
  id: number;
  sectionTitle: string;
  subTitle: string;
  description: string;
  videoUrl: string | null;
  videoTitle: string | null;
  ctaButtonText: string | null;
  ctaButtonUrl: string | null;
  isActive: boolean;
  ventures: any[];
  recognitions: any[];
  media: AboutUsMedia[];
  createdAt: string;
  updatedAt: string;
  propertyId: number | null;
  propertyTypeId: number | null;
  showOnPropertyPage: boolean;
}

const getCurrentTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const selectMediaByTheme = (
  theme: "light" | "dark",
  all: MediaItem[],
  light: MediaItem[],
  dark: MediaItem[],
): MediaItem | null => {
  if (theme === "dark") {
    if (dark && dark.length > 0) return dark[0];
    if (all && all.length > 0) return all[0];
    if (light && light.length > 0) return light[0];
  } else {
    if (light && light.length > 0) return light[0];
    if (all && all.length > 0) return all[0];
    if (dark && dark.length > 0) return dark[0];
  }
  return null;
};

const transformApiDataToSlides = (content: ApiHeroItem[]): HeroSlide[] => {
  // Relaxed filter: Only requires the item to be active
  const filteredContent = content.filter((item) => item.active === true);

  // Sort by ID descending (latest first) and take the top 3
  const latestThree = filteredContent.sort((a, b) => b.id - a.id).slice(0, 3);

  return latestThree.map((item) => {
    // Correctly extract the media URL from the available arrays
    const mediaObj =
      item.backgroundAll?.[0] ||
      item.backgroundLight?.[0] ||
      item.backgroundDark?.[0];

    return {
      id: item.id,
      type: (mediaObj?.type?.toLowerCase() as "video" | "image") || "image",
      media: mediaObj?.url || "", // This was previously hardcoded to ""
      title: item.mainTitle || "",
      subtitle: item.subTitle || "",
      backgroundAll: item.backgroundAll || [],
      backgroundLight: item.backgroundLight || [],
      backgroundDark: item.backgroundDark || [],
    };
  });
};
const transformAboutUsData = (content: AboutUsSection[]): AboutUsSection[] => {
  // Filter: active AND showOnPropertyPage
  const filteredContent = content.filter(
    (item) => item.isActive === true && item.showOnPropertyPage === true,
  );

  // Get latest 3 by ID
  return filteredContent.sort((a, b) => b.id - a.id).slice(0, 3);
};

// Fallback About Us data
const FALLBACK_ABOUT_DATA = [
  {
    title: "Our Philosophy",
    subtitle: "Where Every Stay Is a Story",
    description:
      "Kennedia Blu Hotels & Resorts represents a collection of the world's most distinguished properties. We invite you to experience hospitality that goes beyond service—hospitality that is a feeling, a memory, a story waiting to be told.",
  },
  {
    title: "Our Promise",
    subtitle: "Excellence in Every Detail",
    description:
      "From the moment you arrive, every detail is carefully curated to exceed your expectations. Our commitment to excellence is reflected in our world-class amenities, personalized service, and unforgettable experiences that create lasting memories.",
  },
  {
    title: "Our Legacy",
    subtitle: "A Heritage of Hospitality",
    description:
      "With decades of experience in luxury hospitality, Kennedia Blu has established itself as a leader in creating exceptional guest experiences. Our heritage of excellence continues to set the standard for premium accommodations worldwide.",
  },
];

export default function Hotels() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    getCurrentTheme(),
  );
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutUsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [hotelTypeId, setHotelTypeId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [aboutImageErrors, setAboutImageErrors] = useState<Set<string>>(
    new Set(),
  );
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);

  // Reset recognition index when about section changes
  useEffect(() => {
    setCurrentRecognitionIndex(0);
  }, [currentAboutIndex]);

  // Fetch Property Types and get Hotel ID
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await getPropertyTypes();
        const data = response?.data || response;

        if (Array.isArray(data)) {
          const hotelType = data.find(
            (type) => type.isActive && type.typeName?.toLowerCase() === "hotel",
          );

          if (hotelType) {
            setHotelTypeId(hotelType.id);
          }
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
      }
    };

    fetchPropertyTypes();
  }, []);

  // Fetch Hero Sections when hotelTypeId is available
  useEffect(() => {
    const fetchHeroSections = async () => {
      if (!hotelTypeId) return;

      setLoading(true);
      try {
        const response = await getHotelHomepageHeroSection(hotelTypeId);
        const data = response?.data || response;

        if (Array.isArray(data) && data.length > 0) {
          const slides = transformApiDataToSlides(data);

          if (slides.length > 0) {
            setHeroSlides(slides);
          } else {
            setHeroSlides([]);
          }
        } else {
          setHeroSlides([]);
        }
      } catch (error) {
        console.error("Error fetching hero sections:", error);
        setHeroSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSections();
  }, [hotelTypeId]);

  // Fetch About Us Sections when hotelTypeId is available
  useEffect(() => {
    const fetchAboutUsSections = async () => {
      if (!hotelTypeId) return;

      setLoadingAbout(true);
      try {
        const response = await getAboutUsByPropertyType(hotelTypeId);
        const data = response?.data || response;

        if (Array.isArray(data) && data.length > 0) {
          const sections = transformAboutUsData(data);

          if (sections.length > 0) {
            setAboutSections(sections);
          } else {
            setAboutSections([]);
          }
        } else {
          setAboutSections([]);
        }
      } catch (error) {
        console.error("Error fetching about us sections:", error);
        setAboutSections([]);
      } finally {
        setLoadingAbout(false);
      }
    };

    fetchAboutUsSections();
  }, [hotelTypeId]);

  // Monitor theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [currentTheme]);

  // Hero Auto-play
  useEffect(() => {
    const slidesCount =
      heroSlides.length > 0 ? heroSlides.length : FALLBACK_HERO_IMAGES.length;

    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % slidesCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // About Us Auto-play (synced with hero)
  useEffect(() => {
    const aboutCount =
      aboutSections.length > 0
        ? aboutSections.length
        : FALLBACK_ABOUT_DATA.length;

    const timer = setInterval(() => {
      setCurrentAboutIndex((prev) => (prev + 1) % aboutCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [aboutSections.length]);

  // Get current media based on theme
  const getCurrentMedia = useCallback(
    (slide: HeroSlide) => {
      const media = selectMediaByTheme(
        currentTheme,
        slide.backgroundAll,
        slide.backgroundLight,
        slide.backgroundDark,
      );

      return {
        type: media?.type === "VIDEO" ? "video" : "image",
        url: media?.url || "",
      };
    },
    [currentTheme],
  );

  // Get About Us image from media array
  const getAboutImage = useCallback((section?: AboutUsSection | any) => {
  if (!section || !section.media || section.media.length === 0) {
    return siteContent.images.hotels.delhi;
  }

  const firstMedia = section.media.find(
    (m: AboutUsMedia) => m.type === "IMAGE",
  );

  return firstMedia?.url || siteContent.images.hotels.delhi;
}, []);

  const handleImageError = useCallback((url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const handleAboutImageError = useCallback((url: string) => {
    setAboutImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const renderMedia = useCallback(
    (slide: HeroSlide) => {
      const { type, url } = getCurrentMedia(slide);

      if (!url || imageErrors.has(url)) {
        const fallbackIndex = currentHeroIndex % FALLBACK_HERO_IMAGES.length;
        return (
          <OptimizedImage
            {...FALLBACK_HERO_IMAGES[fallbackIndex]}
            className="w-full h-full object-cover"
          />
        );
      }

      if (type === "video") {
        return (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            key={url}
            onError={() => handleImageError(url)}
          >
            <source src={url} type="video/mp4" />
          </video>
        );
      }

      return (
        <img
          src={url}
          alt={slide.title}
          className="w-full h-full object-cover"
          onError={() => handleImageError(url)}
        />
      );
    },
    [getCurrentMedia, currentHeroIndex, imageErrors, handleImageError],
  );

  const displaySlides = heroSlides.length > 0 ? heroSlides : [];
  const useFallback = displaySlides.length === 0;

  const displayAboutSections =
    aboutSections.length > 0 ? aboutSections : FALLBACK_ABOUT_DATA;
  const useAboutFallback = aboutSections.length === 0;
  useEffect(() => {
    const currentSection = displayAboutSections[currentAboutIndex];
    const recognitions = !useAboutFallback
      ? currentSection?.recognitions?.filter((r: any) => r.isActive) || []
      : [];

    if (recognitions.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentRecognitionIndex((prev) => (prev + 1) % recognitions.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [currentAboutIndex, aboutSections, useAboutFallback]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar navItems={HOTEL_NAV_ITEMS} logo={siteContent.brand.logo_hotel} />

      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={48} className="animate-spin text-white" />
              <p className="text-white text-sm font-medium">
                Loading hero section...
              </p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {useFallback ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeroIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0"
                >
                  <OptimizedImage
                    {...FALLBACK_HERO_IMAGES[currentHeroIndex]}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${displaySlides[currentHeroIndex].id}-${currentTheme}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0"
                >
                  {renderMedia(displaySlides[currentHeroIndex])}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
              <motion.h1
                key={`title-${currentHeroIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 uppercase tracking-wider drop-shadow-2xl"
              >
                {useFallback
                  ? "Timeless Luxury"
                  : displaySlides[currentHeroIndex].title}
              </motion.h1>
              <motion.p
                key={`subtitle-${currentHeroIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-xl md:text-2xl text-white/90 font-light max-w-2xl drop-shadow-lg"
              >
                {useFallback
                  ? "Where every moment is crafted with elegance."
                  : displaySlides[currentHeroIndex].subtitle}
              </motion.p>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {(useFallback ? FALLBACK_HERO_IMAGES : displaySlides).map(
                (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroIndex(idx)}
                    className={`w-12 h-1 rounded-full transition-all duration-300 ${
                      idx === currentHeroIndex
                        ? "bg-white"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ),
              )}
            </div>
          </>
        )}
      </section>

      {/* QUICK BOOKING */}
      <QuickBooking />

      {/* HOTEL COLLECTION SECTION */}
      <div id="collection">
        <HotelCarouselSection />
      </div>

      {/* 2. ABOUT / OVERVIEW SECTION - DYNAMIC WITH MEDIA */}
      <section id="overview" className="py-8 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          {loadingAbout ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={40} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 items-center">
              {/* LEFT: Dynamic Image from Media */}
              <motion.div
                key={`about-image-${currentAboutIndex}`}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden relative z-10 border border-border/10 shadow-2xl">
                  {(() => {
                    const imageUrl = getAboutImage(
                      displayAboutSections[currentAboutIndex],
                    );

                    if (typeof imageUrl === "string") {
                      if (aboutImageErrors.has(imageUrl)) {
                        return (
                          <OptimizedImage
                            {...siteContent.images.hotels.delhi}
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      return (
                        <img
                          src={imageUrl}
                          alt={
                            useAboutFallback
                              ? displayAboutSections[currentAboutIndex].subtitle
                              : displayAboutSections[currentAboutIndex]
                                  .sectionTitle
                          }
                          className="w-full h-full object-cover"
                          onError={() => handleAboutImageError(imageUrl)}
                        />
                      );
                    }

                    return (
                      <OptimizedImage
                        {...imageUrl}
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}
                </div>
                <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 border-2 border-primary/20 rounded-xl -z-0" />
                <div className="absolute -top-4 -left-4 w-1/2 h-1/2 bg-secondary/10 rounded-xl -z-0" />
              </motion.div>

              {/* RIGHT: Dynamic Content */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAboutIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-primary text-xs font-bold uppercase tracking-widest mb-1.5">
                        {useAboutFallback
                          ? displayAboutSections[currentAboutIndex].title
                          : displayAboutSections[currentAboutIndex].subTitle}
                      </h3>
                      <h2 className="text-3xl md:text-4xl font-serif text-foreground leading-tight mb-3">
                        {useAboutFallback
                          ? displayAboutSections[currentAboutIndex].subtitle
                          : displayAboutSections[currentAboutIndex]
                              .sectionTitle}
                      </h2>
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-base font-light">
                      {displayAboutSections[currentAboutIndex].description}
                    </p>

                    {/* Recognitions — all shown, one animates at a time */}
                    {!useAboutFallback &&
                      (() => {
                        const recognitions =
                          displayAboutSections[
                            currentAboutIndex
                          ]?.recognitions?.filter((r: any) => r.isActive) || [];

                        if (recognitions.length === 0) return null;

                        return (
                          <div className="pt-4 border-t border-border/40 space-y-4">
                            {/* All stats in a row */}
                            <div className="flex flex-wrap gap-x-10 gap-y-3">
                              {recognitions.map((r: any, idx: number) => (
                                <button
                                  key={r.id}
                                  onClick={() =>
                                    setCurrentRecognitionIndex(idx)
                                  }
                                  className="flex flex-col gap-0.5 text-left group"
                                >
                                  <AnimatePresence mode="wait">
                                    {idx === currentRecognitionIndex ? (
                                      <motion.span
                                        key="active"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.35 }}
                                        className="text-2xl md:text-3xl font-serif text-primary font-bold leading-none"
                                      >
                                        {r.value}
                                      </motion.span>
                                    ) : (
                                      <motion.span
                                        key="inactive"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-2xl md:text-3xl font-serif text-foreground/40 font-bold leading-none group-hover:text-foreground/60 transition-colors"
                                      >
                                        {r.value}
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                      idx === currentRecognitionIndex
                                        ? "text-muted-foreground"
                                        : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
                                    }`}
                                  >
                                    {r.title}
                                  </span>
                                </button>
                              ))}
                            </div>

                            {/* Active recognition subTitle */}
                            <AnimatePresence mode="wait">
                              {recognitions[currentRecognitionIndex]
                                ?.subTitle && (
                                <motion.p
                                  key={`subtitle-${currentRecognitionIndex}`}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }}
                                  transition={{ duration: 0.35 }}
                                  className="text-xs text-muted-foreground/70 italic"
                                >
                                  {
                                    recognitions[currentRecognitionIndex]
                                      .subTitle
                                  }
                                </motion.p>
                              )}
                            </AnimatePresence>

                            {/* Dot indicators */}
                            {recognitions.length > 1 && (
                              <div className="flex gap-2">
                                {recognitions.map((_: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      setCurrentRecognitionIndex(idx)
                                    }
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                      idx === currentRecognitionIndex
                                        ? "bg-primary w-6"
                                        : "bg-border w-3 hover:bg-primary/50"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </motion.div>
                </AnimatePresence>

                {/* About section carousel indicators */}
                {/* <div className="flex gap-2 mt-6">
                  {displayAboutSections.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentAboutIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === currentAboutIndex
                          ? "bg-primary w-8"
                          : "bg-border w-4 hover:bg-primary/50"
                      }`}
                    />
                  ))}
                </div> */}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HOTEL OFFERS CAROUSEL */}
      <div id="offers">
        <HotelOffersCarousel />
      </div>

      {/* GROUP BOOKING EXTENSION */}
      <GroupBookingSection />

      {/* HOTEL NEWS UPDATES */}
      <div id="events">
        <HotelNewsUpdates />
      </div>

      {/* HOTEL REVIEWS */}
      <div id="ratings">
        <HotelReviewsSection />
      </div>

      {/* EXCLUSIVE OFFER POPUP */}
      {/* <SpecialOfferPopup /> */}

      {/* FOOTER */}
      <div id="contact">
        <Footer />
        <WhatsAppButton />
      </div>
    </div>
  );
}
