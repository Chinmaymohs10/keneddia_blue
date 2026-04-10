import {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HotelOffersCarousel from "@/modules/website/components/hotel/HotelOffersCarousel";
import HotelNewsUpdates from "@/modules/website/components/hotel/HotelNewsUpdates";
import HotelReviewsSection from "@/modules/website/components/HotelReviewsSection";
import GroupBookingSection from "@/modules/website/components/GroupBookingSection";
import WhatsAppButton from "@/modules/website/components/WhatsAppButton";
import SpecialOfferPopup from "@/modules/website/components/SpecialOfferPopup";
import HotelHeroSection from "../components/hotel/HotelHeroSection";

import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  getHotelHomepageHeroSection,
  getPropertyTypes,
  getAboutUsByPropertyType,
} from "@/Api/Api";
import { useSsrData } from "@/ssr/SsrDataContext";

const HotelCarouselSection = lazy(
  () => import("@/modules/website/components/HotelCarouselSection"),
);
const QuickBooking = lazy(
  () => import("@/modules/website/components/QuickBooking"),
);

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
  backgroundAll: MediaItem[];
  backgroundLight: MediaItem[];
  backgroundDark: MediaItem[];
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

const HOTEL_NAV_ITEMS = [
  { type: "link", label: "OVERVIEW", key: "overview", href: "#overview" },
  { type: "link", label: "COLLECTION", key: "collection", href: "#collection" },
  { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "EVENTS", key: "events", href: "#events" },
  { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
] as any[];

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

const transformAboutUsData = (content: AboutUsSection[]): AboutUsSection[] =>
  content
    .filter((item) => item.isActive === true && item.showOnPropertyPage === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

export default function Hotels() {
  const { hotels: ssrHotels } = useSsrData();
  const initialHeroSlides = Array.isArray(ssrHotels?.heroSlides)
    ? ssrHotels.heroSlides
    : [];
  const initialAboutSections = Array.isArray(ssrHotels?.aboutSections)
    ? ssrHotels.aboutSections
    : [];
  const initialHotelTypeId =
    typeof ssrHotels?.hotelTypeId === "number" ? ssrHotels.hotelTypeId : null;

  const [isClient, setIsClient] = useState(false);
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);
  const [aboutSections, setAboutSections] =
    useState<AboutUsSection[]>(initialAboutSections);
  const [loading, setLoading] = useState(initialHeroSlides.length === 0);
  const [loadingAbout, setLoadingAbout] = useState(
    initialAboutSections.length === 0,
  );
  const [hotelTypeId, setHotelTypeId] = useState<number | null>(initialHotelTypeId);
  const [aboutImageErrors, setAboutImageErrors] = useState<Set<string>>(new Set());
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setCurrentRecognitionIndex(0);
  }, [currentAboutIndex]);

  useEffect(() => {
    if (hotelTypeId) return;

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
  }, [hotelTypeId]);

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

  useEffect(() => {
    if (aboutSections.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentAboutIndex((prev) => (prev + 1) % aboutSections.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [aboutSections.length]);

  useEffect(() => {
    const currentSection = aboutSections[currentAboutIndex];
    const recognitions =
      currentSection?.recognitions?.filter((r: any) => r.isActive) || [];

    if (recognitions.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentRecognitionIndex((prev) => (prev + 1) % recognitions.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [currentAboutIndex, aboutSections]);

  const getAboutImage = useCallback((section?: AboutUsSection) => {
    if (!section || !section.media || section.media.length === 0) {
      return siteContent.images.hotels.delhi;
    }

    const firstMedia = section.media.find((m: AboutUsMedia) => m.type === "IMAGE");
    return firstMedia?.url || siteContent.images.hotels.delhi;
  }, []);

  const handleAboutImageError = useCallback((url: string) => {
    setAboutImageErrors((prev) => new Set(prev).add(url));
  }, []);

  const activeAboutSection = aboutSections[currentAboutIndex] || null;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div
        hidden
        data-ssr-debug="hotels"
        data-hotel-type-id={hotelTypeId ?? ""}
        data-hero-count={heroSlides.length}
        data-about-count={aboutSections.length}
        data-offers-count={ssrHotels?.hotelOffers?.length ?? 0}
        data-events-count={ssrHotels?.groupEvents?.length ?? 0}
        data-group-bookings-count={ssrHotels?.groupBookings?.length ?? 0}
        data-news-count={ssrHotels?.hotelNews?.length ?? 0}
        data-reviews-count={ssrHotels?.hotelReviews?.guestExperiences?.length ?? 0}
        data-collection-count={ssrHotels?.hotelCollection?.length ?? 0}
        data-locations-count={ssrHotels?.hotelLocations?.length ?? 0}
      />

      <Navbar navItems={HOTEL_NAV_ITEMS} logo={siteContent.brand.logo_hotel} />
      <SpecialOfferPopup />

      <HotelHeroSection slides={heroSlides} loading={loading} />
      {isClient ? (
        <Suspense
          fallback={
            <div className="container mx-auto px-4 -mt-10 relative z-30 mb-12">
              <div className="bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                <div className="p-8">
                  <div className="h-20 flex items-center justify-center text-muted-foreground">
                    Loading booking tools...
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <QuickBooking />
        </Suspense>
      ) : (
        <div className="container mx-auto px-4 -mt-10 relative z-30 mb-12">
          <div className="bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
            <div className="p-8">
              <div className="h-20 flex items-center justify-center text-muted-foreground">
                Booking tools load after hydration.
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        id="collection"
        data-ssr-section="hotel-collection"
        data-ssr-count={ssrHotels?.hotelCollection?.length ?? 0}
      >
        {isClient ? (
          <Suspense
            fallback={
              <section className="py-6">
                <div className="container mx-auto px-6 lg:px-12">
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Loading hotel collection...
                  </div>
                </div>
              </section>
            }
          >
            <HotelCarouselSection initialHotels={ssrHotels?.hotelCollection} />
          </Suspense>
        ) : (
          <section className="py-6">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Hotel collection loads after hydration.
              </div>
            </div>
          </section>
        )}
      </div>

      <section id="overview" className="py-8 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          {loadingAbout ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={40} className="animate-spin text-primary" />
            </div>
          ) : !activeAboutSection ? (
            <div className="text-center py-16 text-muted-foreground">
              No hotel overview available.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 items-center">
              <motion.div
                key={`about-image-${currentAboutIndex}`}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden relative z-10 border border-border/10 shadow-2xl">
                  {(() => {
                    const imageUrl = getAboutImage(activeAboutSection);
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
                          alt={activeAboutSection.sectionTitle}
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
                        {activeAboutSection.subTitle}
                      </h3>
                      <h2 className="text-3xl md:text-4xl font-serif text-foreground leading-tight mb-3">
                        {activeAboutSection.sectionTitle}
                      </h2>
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-base font-light">
                      {activeAboutSection.description}
                    </p>

                    {(() => {
                      const recognitions =
                        activeAboutSection.recognitions?.filter(
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

      <section id="offers" className="bg-muted py-10">
        <div className="mx-auto w-[92%] max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-2xl md:text-3xl">
              Hotel Showcase
            </h2>
            <div className="mx-auto mt-3 h-0.5 w-16 bg-primary" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div
              className="min-w-0"
              data-ssr-section="hotel-offers"
              data-ssr-count={ssrHotels?.hotelOffers?.length ?? 0}
            >
              <HotelOffersCarousel
                initialOffers={ssrHotels?.hotelOffers}
                variant="showcase"
              />
            </div>

            <div
              id="events"
              className="contents"
              data-ssr-section="hotel-group-booking"
              data-events-count={ssrHotels?.groupEvents?.length ?? 0}
              data-bookings-count={ssrHotels?.groupBookings?.length ?? 0}
            >
              <GroupBookingSection
                propertyTypeId={hotelTypeId}
                initialEvents={ssrHotels?.groupEvents}
                initialGroupBookings={ssrHotels?.groupBookings}
                variant="showcase"
              />
            </div>
          </div>
        </div>
      </section>

      <div
        id="updates"
        data-ssr-section="hotel-news"
        data-ssr-count={ssrHotels?.hotelNews?.length ?? 0}
      >
        <HotelNewsUpdates initialItems={ssrHotels?.hotelNews} />
      </div>

      <div
        id="ratings"
        data-ssr-section="hotel-reviews"
        data-ssr-count={ssrHotels?.hotelReviews?.guestExperiences?.length ?? 0}
      >
        <HotelReviewsSection
          initialData={ssrHotels?.hotelReviews}
          initialHotelTypeId={hotelTypeId}
        />
      </div>

      <div id="contact">
        <Footer />
        <WhatsAppButton />
      </div>
    </div>
  );
}
