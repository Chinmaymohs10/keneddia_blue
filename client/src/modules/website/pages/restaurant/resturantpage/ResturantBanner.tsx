import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Share2,
  Heart,
  ChevronRight,
  Loader2,
  Star,
  Navigation,
  Image as ImageIcon,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { GetAllPropertyDetails, getAllGalleries } from "@/Api/Api";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import { toast } from "react-hot-toast";

// ─── Fallback Data ──────────────────────────────────────────────────────────

const FALLBACK_RESTAURANT: RestaurantData = {
  id: 0,
  propertyId: 0,
  name: "The Grand Dining Restaurant",
  location: "123 Heritage Lane, Near Gateway Arch",
  city: "Mumbai",
  type: "Fine Dining",
  tagline: "Experience culinary excellence in every bite.",
  rating: 4.8,
  price: "₹2,500",
  media: [
    {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
      type: "IMAGE",
      mediaId: null,
      fileName: null,
      alt: "Restaurant Ambience",
      width: null,
      height: null,
    },
    {
      url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800",
      type: "IMAGE",
      mediaId: null,
      fileName: null,
      alt: "Interior",
      width: null,
      height: null,
    },
    {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800",
      type: "IMAGE",
      mediaId: null,
      fileName: null,
      alt: "Dish",
      width: null,
      height: null,
    },
    {
      url: "https://images.unsplash.com/photo-1550966841-3ee5ad0110d3?q=80&w=800",
      type: "IMAGE",
      mediaId: null,
      fileName: null,
      alt: "Service",
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

interface PropertyListing {
  id: number;
  propertyId: number;
  propertyName: string | null;
  propertyType: string | null;
  mainHeading: string;
  subTitle: string;
  fullAddress: string;
  tagline: string;
  rating: number | null;
  price: number;
  gstPercentage: number;
  discountAmount: number;
  amenities: string[];
  isActive: boolean;
  media: PropertyMedia[];
}

interface PropertyResponse {
  id: number;
  propertyName: string;
  propertyTypes: string[];
  propertyCategories: string[];
  address: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
}

interface ApiPropertyData {
  propertyResponseDTO: PropertyResponse;
  propertyListingResponseDTOS: PropertyListing[];
}

interface GalleryItem {
  id: number;
  category: string;
  propertyId: number;
  propertyName: string;
  media: PropertyMedia;
  isActive: boolean;
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

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// ─── Component ───────────────────────────────────────────────────────────────

function ResturantBanner() {
  const params = useParams<{ propertyId?: string }>();
  const propertyIdFromUrl = params.propertyId
    ? Number(params.propertyId)
    : null;

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);

  // ── Fetch property data ──────────────────────────────────────────────────
  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!propertyIdFromUrl) {
  //       setRestaurant(FALLBACK_RESTAURANT);
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       const response = await GetAllPropertyDetails();
  //       const rawData = response?.data || response;

  //       if (!rawData || !Array.isArray(rawData)) {
  //           throw new Error("Invalid API response");
  //       }

  //       const flattened = rawData.flatMap((item: ApiPropertyData) => {
  //         const parent = item.propertyResponseDTO;
  //         const listings = item.propertyListingResponseDTOS || [];
  //         return listings.length === 0
  //           ? [{ parent, listing: null }]
  //           : listings.map((l) => ({ parent, listing: l }));
  //       });

  //       const matched = flattened.find(
  //         (m: any) => Number(m.parent.id) === Number(propertyIdFromUrl)
  //       );

  //       if (!matched) {
  //         // If ID provided but no match found, use fallback
  //         setRestaurant(FALLBACK_RESTAURANT);
  //         return;
  //       }

  //       const { parent, listing } = matched;
  //       const displayName =
  //         listing?.propertyName?.trim() !== ""
  //           ? listing?.propertyName
  //           : listing?.mainHeading || parent.propertyName;

  //       setRestaurant({
  //         id: listing?.id || parent.id,
  //         propertyId: parent.id,
  //         name: displayName,
  //         location: listing?.fullAddress || parent.address,
  //         city: parent.locationName,
  //         type:
  //           listing?.propertyType || parent.propertyTypes?.[0] || "Restaurant",
  //         tagline: listing?.tagline || "",
  //         rating: listing?.rating || null,
  //         price: `₹${(listing?.price || 0).toLocaleString()}`,
  //         media: (listing?.media && listing.media.length > 0) ? listing.media : FALLBACK_RESTAURANT.media,
  //         coordinates:
  //           parent.latitude && parent.longitude
  //             ? { lat: parent.latitude, lng: parent.longitude }
  //             : null,
  //         image: { src: listing?.media?.[0]?.url || FALLBACK_RESTAURANT.image.src, alt: displayName },
  //         nearbyPlaces: ["0.2 km from Gateway of India", "2.5 km from Marine Drive"],
  //       });

  //       fetchGallery(parent.id);
  //     } catch (err) {
  //       console.error("Error loading restaurant data, using fallback", err);
  //       setRestaurant(FALLBACK_RESTAURANT);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [propertyIdFromUrl]);
  useEffect(() => {
    setRestaurant(FALLBACK_RESTAURANT);
    setGalleryData([]); // optional: keep empty or add static gallery
    setLoading(false);
  }, []);

  const fetchGallery = async (propId: number) => {
    try {
      const res = await getAllGalleries({ page: 0, size: 100 });
      const allContent = res?.data?.content || res?.content || [];
      const filtered = allContent.filter(
        (item: any) =>
          Number(item.propertyId) === Number(propId) && item.isActive,
      );
      setGalleryData(filtered);
    } catch {
      setGalleryData([]);
    }
  };

  const topGridImages = useMemo(() => {
    const combined = [
      ...(restaurant?.media || []),
      ...galleryData.map((g) => g.media),
    ];
    // If we have restaurant data but no images, use fallback images
    if (combined.length === 0) return FALLBACK_RESTAURANT.media;
    return combined.filter((m) => m && m.url);
  }, [restaurant?.media, galleryData]);

  const openGallery = (index: number) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Setting the table...
        </p>
      </div>
    );
  }

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
        {/* ── Breadcrumb ── */}
        <motion.nav
          variants={fadeIn}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to="/restaurants"
            className="hover:text-primary transition-colors"
          >
            Restaurants
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold truncate">
            {restaurant.name}
          </span>
        </motion.nav>

        {/* ── Header Section ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <motion.div variants={staggerContainer} className="space-y-3 w-full">
            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <span className="inline-flex items-center bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
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
              className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-balance"
            >
              {restaurant.name}
            </motion.h1>

            <motion.div
              variants={fadeIn}
              className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground"
            >
              <div className="flex items-center gap-1.5 group cursor-default">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {restaurant.location}, {restaurant.city}
                </span>
              </div>

              {restaurant.coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-destructive hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-4 h-4" /> View Map
                </a>
              )}
            </motion.div>

            {/* Static Nearby Places */}
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              {restaurant.nearbyPlaces?.map((place, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground/80"
                >
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  <span>{place}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div variants={fadeIn} className="flex gap-3">
            <Button
              variant="outline"
              size="default"
              className="rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied!");
              }}
            >
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button
              variant="outline"
              size="default"
              className="rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 group"
              onClick={() => toast.success("Added to favourites!")}
            >
              <Heart className="w-4 h-4 mr-2 group-hover:fill-destructive group-hover:text-destructive transition-colors" />{" "}
              Save
            </Button>
          </motion.div>
        </div>

        {/* ── Photo Grid ── */}
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[320px] md:h-[440px] rounded-3xl overflow-hidden shadow-xl"
        >
          {/* Main Image */}
          <div
            className="md:col-span-2 relative group cursor-pointer overflow-hidden"
            onClick={() => openGallery(0)}
          >
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
            <OptimizedImage
              src={topGridImages[0]?.url || FALLBACK_RESTAURANT.image.src}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Middle Stack */}
          <div className="md:col-span-1 flex flex-col gap-3">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="h-1/2 relative group cursor-pointer overflow-hidden"
                onClick={() => openGallery(idx)}
              >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
                <OptimizedImage
                  src={
                    topGridImages[idx]?.url ||
                    FALLBACK_RESTAURANT.media[idx % 4].url
                  }
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* Final Image with Overlay */}
          <div
            className="md:col-span-1 relative group cursor-pointer overflow-hidden"
            onClick={() => openGallery(3)}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
            <OptimizedImage
              src={topGridImages[3]?.url || FALLBACK_RESTAURANT.media[3].url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {topGridImages.length > 4 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-black text-sm font-bold shadow-lg transform transition-transform group-hover:scale-110">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>+{topGridImages.length - 4} More</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ResturantBanner;
