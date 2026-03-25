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
import WhatsAppButton from "@/modules/website/components/WhatsAppButton";
import SpecialOfferPopup from "@/modules/website/components/SpecialOfferPopup";
import HotelHeroSection from "../components/hotel/HotelHeroSection";

// Assets
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  getHotelHomepageHeroSection,
  getPropertyTypes,
  getAboutUsByPropertyType,
} from "@/Api/Api";

// ── Types ──────────────────────────────────────────────────────────────────
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

// Hotel Navigation Items
const HOTEL_NAV_ITEMS = [
  { type: "link", label: "OVERVIEW",   key: "overview",    href: "#overview" },
  { type: "link", label: "COLLECTION", key: "collection",  href: "#collection" },
  { type: "link", label: "OFFERS",     key: "offers",      href: "#offers" },
  { type: "link", label: "EVENTS",     key: "events",      href: "#events" },
  { type: "link", label: "CONTACT",    key: "contact",     href: "#contact" },
] as any[];

// ── Data transform helpers ─────────────────────────────────────────────────
const transformApiDataToSlides = (content: ApiHeroItem[]): HeroSlide[] => {
  const filteredContent = content.filter((item) => item.active === true);
  const latestThree = filteredContent.sort((a, b) => b.id - a.id).slice(0, 3);

  return latestThree.map((item) => {
    const mediaObj =
      item.backgroundAll?.[0] ||
      item.backgroundLight?.[0] ||
      item.backgroundDark?.[0];

    return {
      id: item.id,
      type: (mediaObj?.type?.toLowerCase() as "video" | "image") || "image",
      media: mediaObj?.url || "",
      title: item.mainTitle || "",
      subtitle: item.subTitle || "",
      backgroundAll: item.backgroundAll || [],
      backgroundLight: item.backgroundLight || [],
      backgroundDark: item.backgroundDark || [],
    };
  });
};

const transformAboutUsData = (content: AboutUsSection[]): AboutUsSection[] => {
  const filteredContent = content.filter(
    (item) => item.isActive === true && item.showOnPropertyPage === true,
  );
  return filteredContent.sort((a, b) => b.id - a.id).slice(0, 3);
};

// ── Page Component ─────────────────────────────────────────────────────────
export default function Hotels() {
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutUsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [hotelTypeId, setHotelTypeId] = useState<number | null>(null);
  const [aboutImageErrors, setAboutImageErrors] = useState<Set<string>>(new Set());
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);

  // Reset recognition index when about section changes
  useEffect(() => {
    setCurrentRecognitionIndex(0);
  }, [currentAboutIndex]);

  // Fetch Property Types → get Hotel type ID
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await getPropertyTypes();
        const data = response?.data || response;
        if (Array.isArray(data)) {
          const hotelType = data.find(
            (type) => type.isActive && type.typeName?.toLowerCase() === "hotel",
          );
          if (hotelType) setHotelTypeId(hotelType.id);
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
      }
    };
    fetchPropertyTypes();
  }, []);

  // Fetch Hero Sections
  useEffect(() => {
    if (!hotelTypeId) return;
    const fetchHeroSections = async () => {
      setLoading(true);
      try {
        const response = await getHotelHomepageHeroSection(hotelTypeId);
        const data = response?.data || response;
        if (Array.isArray(data) && data.length > 0) {
          const slides = transformApiDataToSlides(data);
          setHeroSlides(slides.length > 0 ? slides : []);
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

  // Fetch About Us Sections
  useEffect(() => {
    if (!hotelTypeId) return;
    const fetchAboutUsSections = async () => {
      setLoadingAbout(true);
      try {
        const response = await getAboutUsByPropertyType(hotelTypeId);
        const data = response?.data || response;
        if (Array.isArray(data) && data.length > 0) {
          const sections = transformAboutUsData(data);
          setAboutSections(sections.length > 0 ? sections : []);
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

  // About Us Auto-play
  useEffect(() => {
    if (aboutSections.length === 0) return;
    const timer = setInterval(() => {
      setCurrentAboutIndex((prev) => (prev + 1) % aboutSections.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [aboutSections.length]);

  // Recognition auto-cycle
  useEffect(() => {
    const currentSection = aboutSections[currentAboutIndex];
    const recognitions = currentSection?.recognitions?.filter((r: any) => r.isActive) || [];
    if (recognitions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentRecognitionIndex((prev) => (prev + 1) % recognitions.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [currentAboutIndex, aboutSections]);

  const getAboutImage = useCallback((section?: AboutUsSection | any) => {
    if (!section || !section.media || section.media.length === 0) {
      return siteContent.images.hotels.delhi;
    }
    const firstMedia = section.media.find((m: AboutUsMedia) => m.type === "IMAGE");
    return firstMedia?.url || siteContent.images.hotels.delhi;
  }, []);

  const handleAboutImageError = useCallback((url: string) => {
    setAboutImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const displayAboutSections = aboutSections;
  const useAboutFallback = aboutSections.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar navItems={HOTEL_NAV_ITEMS} logo={siteContent.brand.logo_hotel} />
      <SpecialOfferPopup />

      {/* 1. HERO SECTION — extracted component */}
      <HotelHeroSection slides={heroSlides} loading={loading} />

      {/* QUICK BOOKING */}
      <QuickBooking />

      {/* HOTEL COLLECTION SECTION */}
      <div id="collection">
        <HotelCarouselSection />
      </div>

      {/* 2. ABOUT / OVERVIEW SECTION */}
      <section id="overview" className="py-8 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          {loadingAbout ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={40} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 items-center">
              {/* LEFT: Dynamic Image */}
              <motion.div
                key={`about-image-${currentAboutIndex}`}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden relative z-10 border border-border/10 shadow-2xl">
                  {(() => {
                    const imageUrl = getAboutImage(displayAboutSections[currentAboutIndex]);
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
                              : displayAboutSections[currentAboutIndex].sectionTitle
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
                          : displayAboutSections[currentAboutIndex].sectionTitle}
                      </h2>
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-base font-light">
                      {displayAboutSections[currentAboutIndex].description}
                    </p>

                    {/* Recognitions */}
                    {!useAboutFallback &&
                      (() => {
                        const recognitions =
                          displayAboutSections[currentAboutIndex]?.recognitions?.filter(
                            (r: any) => r.isActive,
                          ) || [];
                        if (recognitions.length === 0) return null;
                        return (
                          <div className="pt-4 border-t border-border/40 space-y-4">
                            <div className="flex flex-wrap gap-x-10 gap-y-3">
                              {recognitions.map((r: any, idx: number) => (
                                <button
                                  key={r.id}
                                  onClick={() => setCurrentRecognitionIndex(idx)}
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

                            <AnimatePresence mode="wait">
                              {recognitions[currentRecognitionIndex]?.subTitle && (
                                <motion.p
                                  key={`subtitle-${currentRecognitionIndex}`}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -6 }}
                                  transition={{ duration: 0.35 }}
                                  className="text-xs text-muted-foreground/70 italic"
                                >
                                  {recognitions[currentRecognitionIndex].subTitle}
                                </motion.p>
                              )}
                            </AnimatePresence>

                            {recognitions.length > 1 && (
                              <div className="flex gap-2">
                                {recognitions.map((_: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => setCurrentRecognitionIndex(idx)}
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
      <GroupBookingSection propertyTypeId={hotelTypeId} />

      {/* HOTEL NEWS UPDATES */}
      <div id="events">
        <HotelNewsUpdates />
      </div>

      {/* HOTEL REVIEWS */}
      <div id="ratings">
        <HotelReviewsSection />
      </div>

      {/* FOOTER */}
      <div id="contact">
        <Footer />
        <WhatsAppButton />
      </div>
    </div>
  );
}
