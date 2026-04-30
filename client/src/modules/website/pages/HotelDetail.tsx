import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccess, showWarning, showError } from "@/lib/toasters/toastUtils";
import {
  MapPin,
  Star,
  Share2,
  Heart,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  Navigation,
  Image as ImageIcon,
  Facebook,
  Twitter,
  UtensilsCrossed,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteContent } from "@/data/siteContent";
import PropertyMap from "@/modules/website/components/PropertyMap";
import FindYourStay from "@/modules/website/components/FindYourStay";
import HotelStickyNav from "@/modules/website/components/HotelStickyNav";
import RoomList from "@/modules/website/components/RoomList";
import EventSectionPropertySpecific from "../components/hotel-detail/EventSectionPropertySpecific";
import { Button } from "@/components/ui/button";
import {
  GetAllPropertyDetails,
  getRoomsByPropertyId,
  getAllGalleries,
  getAllPropertyPolicies,
  getGalleryByPropertyId,
  getAllDiningByPropertyId,
  getBookingChannelPartnersByPropertyId,
} from "@/Api/Api";
import { toast } from "react-hot-toast";
import HotelGalleryGrid from "../components/hotel/Hotelgallerygrid";
import { useSsrData } from "@/ssr/SsrDataContext";
// Components
import RightSidebar from "@/modules/website/components/hotel-detail/RightSidebar";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import MobileBookingBar from "@/modules/website/components/Mobilebookingbar";
import ReviewsSection from "../components/hotel-detail/ReviewsSection";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import {
  applySeoToDocument,
  fetchPropertySeo,
  resetSeoDocument,
} from "@/lib/seo";

// Interfaces
interface PropertyMedia {
  mediaId: number | null;
  type: string;
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface ApiPropertyData {
  propertyResponseDTO: any;
  propertyListingResponseDTOS: any[];
}

interface GalleryItem {
  id: number;
  category: string;
  propertyId: number;
  propertyName: string;
  media: PropertyMedia;
  isActive: boolean;
}

interface HotelData {
  id: number;
  propertyId: number;
  name: string;
  bookingEngineUrl?: string | null;
  addressUrl?: string | null;
  location: string;
  city: string;
  locationId: number;
  type: string;
  description: string;
  tagline: string;
  rating: number | null;
  verifiedReviews: number | null;
  price: string;
  media: PropertyMedia[];
  restaurants?: Restaurant[];
  coordinates: { lat: number; lng: number } | null;
  amenities: string[];
  image: { src: string; alt: string };
  nearbyPlaces?: string[];
  dining?: Restaurant[];
  checkIn?: string;
  checkOut?: string;
}

interface PolicyData {
  propertyId: number;
  propertyName: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  cancellationPolicy: string | null;
  policies: Array<{ id: number; name: string; isActive: boolean }>;
}

interface RoomAmenity {
  id: number;
  name: string;
  showHighlight?: boolean | null;
}

const getAmenityName = (amenity: unknown) => {
  if (typeof amenity === "string") return amenity;
  if (
    amenity &&
    typeof amenity === "object" &&
    "name" in amenity &&
    typeof amenity.name === "string"
  ) {
    return amenity.name;
  }

  return null;
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };
interface Restaurant {
  id: number | string;
  name: string;
  cuisine: string;
  timings: string;
  image?: string;
  mediaSlides?: PropertyMedia[];
  description?: string;
  attachedRestaurantName?: string;
  attachRestaurantId?: number | string;
}

const VERIFIED_REVIEWS_SCALE = 1000000;

const parseCombinedRatingMeta = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return { rating: null, verifiedReviews: null };
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return { rating: null, verifiedReviews: null };
  }

  const rating = Math.floor((numericValue + 0.0000001) * 10) / 10;
  const verifiedReviews = Math.round(
    (numericValue - rating) * VERIFIED_REVIEWS_SCALE,
  );

  return {
    rating: Number.isNaN(rating) ? null : rating,
    verifiedReviews:
      Number.isNaN(verifiedReviews) || verifiedReviews <= 0
        ? null
        : verifiedReviews,
  };
};

// Sample data — replace with API data when available
const normalizeDiningList = (response: any) => {
  const data = response?.data?.data || response?.data || response || [];
  return Array.isArray(data) ? data : [];
};

const buildRestaurantPathMap = (rawData: ApiPropertyData[]) => {
  return (Array.isArray(rawData) ? rawData : []).reduce(
    (acc: Record<string, string>, item: ApiPropertyData) => {
      const parent = item?.propertyResponseDTO;
      const listings = item?.propertyListingResponseDTOS || [];
      const listing =
        listings.find((entry: any) => entry?.isActive) || listings[0] || null;
      const typeName = String(
        listing?.propertyType || parent?.propertyTypes?.[0] || "",
      )
        .trim()
        .toLowerCase();

      if (!parent?.id || typeName !== "restaurant") {
        return acc;
      }

      const cityName =
        listing?.city || parent?.locationName || parent?.city || "restaurant";
      const propertyName =
        listing?.propertyName?.trim() ||
        listing?.mainHeading ||
        parent?.propertyName ||
        "restaurant";

      acc[String(parent.id)] =
        `/${createCitySlug(cityName)}/${createHotelSlug(propertyName, parent.id)}`;
      return acc;
    },
    {},
  );
};

const mapDiningItem = (item: any): Restaurant => ({
  id: item?.id ?? `dining-${item?.attachRestaurantId ?? "item"}`,
  name: item?.part1 || "",
  cuisine: item?.attachRestaurantName || item?.part2 || "",
  timings: item?.time || "",
  image: item?.image?.url || undefined,
  description: item?.part2 || "",
  attachedRestaurantName: item?.attachRestaurantName || "",
  attachRestaurantId: item?.attachRestaurantId ?? undefined,
});

const normalizeGalleryMedia = (galleryResponse: any): PropertyMedia[] => {
  const rawGallery =
    galleryResponse?.data?.content ||
    galleryResponse?.data ||
    galleryResponse ||
    [];

  return (Array.isArray(rawGallery) ? rawGallery : [])
    .filter(
      (item: any) =>
        item?.isActive &&
        item?.media?.url &&
        !item?.vertical &&
        String(item?.categoryName || "").toLowerCase() !== "3d",
    )
    .map((item: any) => item.media)
    .filter((media: PropertyMedia) => Boolean(media?.url));
};

export default function HotelDetail() {
  const { citySlug, propertySlug, propertyId } = useParams<{
    citySlug: string;
    propertySlug: string;
    propertyId: string;
  }>();
  const { propertyDetail } = useSsrData();
  const navigate = useNavigate();
  const slugTail = propertySlug?.split("-").pop() || "";
  const propertyIdFromUrl = Number(propertyId || slugTail) || null;
  const ssrHotelDetail =
    propertyDetail?.propertyType === "hotel" &&
    propertyDetail?.propertyId === propertyIdFromUrl
      ? propertyDetail?.pageData
      : null;
  const ssrSeo =
    propertyDetail?.propertyId === propertyIdFromUrl
      ? propertyDetail?.seo
      : null;
  const [hotel, setHotel] = useState<HotelData | null>(
    ssrHotelDetail?.hotel || null,
  );
  const [rooms, setRooms] = useState<any[]>(ssrHotelDetail?.rooms || []);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>(
    ssrHotelDetail?.galleryData || [],
  );
  const [policies, setPolicies] = useState<PolicyData | null>(
    ssrHotelDetail?.policies || null,
  );
  const [diningItems, setDiningItems] = useState<Restaurant[]>(
    ssrHotelDetail?.diningItems || [],
  );
  const [bookingPartners, setBookingPartners] = useState<any[]>(
    ssrHotelDetail?.bookingPartners || [],
  );
  const [restaurantPaths, setRestaurantPaths] = useState<
    Record<string, string>
  >(ssrHotelDetail?.restaurantPaths || {});
  const [loading, setLoading] = useState(!ssrHotelDetail);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    ssrHotelDetail?.selectedRoomId || null,
  );
  const [currentDiningIndex, setCurrentDiningIndex] = useState(0);
  const [currentDiningMediaIndex, setCurrentDiningMediaIndex] = useState(0);
  const [datesInitialized, setDatesInitialized] = useState(false);

  // Feature States
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareReactions, setShowShareReactions] = useState(false);

  const [searchData, setSearchData] = useState({
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: MessageCircle, // Just the name of the component
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2]",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X",
      icon: Twitter,
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    const syncSeo = async () => {
      if (!propertyIdFromUrl) return;

      if (ssrSeo) {
        applySeoToDocument(ssrSeo);
        return;
      }

      const seo = await fetchPropertySeo(
        propertyIdFromUrl,
        window.location.pathname,
      );
      if (isMounted) {
        applySeoToDocument(seo);
      }
    };

    syncSeo();

    return () => {
      isMounted = false;
      resetSeoDocument();
    };
  }, [propertyIdFromUrl, ssrSeo]);

  useEffect(() => {
    if (!datesInitialized && !searchData.checkIn) {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      setSearchData((prev) => ({
        ...prev,
        checkIn: today,
        checkOut: tomorrow,
      }));
      setDatesInitialized(true);
    }
  }, [datesInitialized, searchData.checkIn]);

  const numberOfNights = useMemo(() => {
    if (!searchData.checkIn || !searchData.checkOut) return 1;
    const diffTime =
      searchData.checkOut.getTime() - searchData.checkIn.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [searchData.checkIn, searchData.checkOut]);

  const highlightedRoomAmenities = useMemo(() => {
    return Array.from(
      new Set(
        rooms
          .flatMap((room) => room.highlightedAmenities || [])
          .map((amenity) => getAmenityName(amenity))
          .filter(Boolean),
      ),
    );
  }, [rooms]);

  const firstAvailableRoom = useMemo(() => {
    const availableRooms = rooms.filter((room) => room.isAvailable);
    return availableRooms[0] || null;
  }, [rooms]);

  const effectiveSelectedRoomId = useMemo(() => {
    if (
      selectedRoomId &&
      rooms.some((room) => room.id === selectedRoomId && room.isAvailable)
    ) {
      return selectedRoomId;
    }

    return firstAvailableRoom?.id || null;
  }, [firstAvailableRoom, rooms, selectedRoomId]);

  const effectiveSelectedRoom = useMemo(
    () => rooms.find((room) => room.id === effectiveSelectedRoomId) || null,
    [effectiveSelectedRoomId, rooms],
  );

  const diningSectionItems = useMemo(() => diningItems, [diningItems]);

  useEffect(() => {
    setCurrentDiningIndex(0);
  }, [diningSectionItems.length]);

  useEffect(() => {
    setCurrentDiningMediaIndex(0);
  }, [currentDiningIndex]);

  useEffect(() => {
    if (diningSectionItems.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentDiningIndex((prev) =>
        prev === diningSectionItems.length - 1 ? 0 : prev + 1,
      );
    }, 3500);

    return () => window.clearInterval(timer);
  }, [diningSectionItems.length]);

  const activeDiningItem = diningSectionItems[currentDiningIndex] || null;
  const activeDiningMediaSlides = activeDiningItem?.mediaSlides?.length
    ? activeDiningItem.mediaSlides
    : activeDiningItem?.image
      ? [
          {
            mediaId: null,
            type: "IMAGE",
            url: activeDiningItem.image,
            fileName: null,
            alt: activeDiningItem.name || null,
            width: null,
            height: null,
          },
        ]
      : [];

  useEffect(() => {
    if (activeDiningMediaSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentDiningMediaIndex((prev) =>
        prev === activeDiningMediaSlides.length - 1 ? 0 : prev + 1,
      );
    }, 2800);

    return () => window.clearInterval(timer);
  }, [activeDiningMediaSlides.length]);

  const aboutAmenitiesPreview = useMemo(
    () => hotel?.amenities?.slice(0, 4) ?? [],
    [hotel],
  );

  const roomPolicyHighlightText = useMemo(() => {
    const normalizedFreeCancellation = "free cancellation";

    const matchedPolicy = (policies?.policies || []).find((policy) => {
      const normalizedPolicyName = String(policy?.name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      return (
        policy?.isActive && normalizedPolicyName === normalizedFreeCancellation
      );
    });

    return matchedPolicy?.name || "";
  }, [policies]);

  const fetchNearbyFromOSM = async (
    lat: number,
    lng: number,
    propertyName: string,
  ) => {
    try {
      console.log(
        `📍 Fetching nearby locations for: "${propertyName}" at [${lat}, ${lng}]`,
      );

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"restaurant|cafe|fast_food|bank"](around:3000, ${lat}, ${lng});
          node["tourism"~"museum|attraction|viewpoint|hotel"](around:3000, ${lat}, ${lng});
          node["historic"](around:3000, ${lat}, ${lng});
          node["highway"~"bus_stop"](around:3000, ${lat}, ${lng});
        );
        out body 10;
      `;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      );

      // 🔍 DEBUG: Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (
        !response.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        console.warn(
          "⚠️ OSM Server busy or returned HTML error. Using fallback.",
        );
        return [];
      }

      const data = await response.json();

      if (!data.elements) return [];

      const results = data.elements
        .filter((el: any) => el.tags && el.tags.name)
        .map((el: any) => {
          // DEBUG CALCULATION: Distance check
          const dist = (
            Math.sqrt(Math.pow(el.lat - lat, 2) + Math.pow(el.lon - lng, 2)) *
            111
          ).toFixed(2);
          console.log(
            `🔎 Found: ${el.tags.name} (${el.tags.amenity || "Point"}) ~${dist}km away`,
          );

          return {
            name: el.tags.name,
            type: (el.tags.amenity || el.tags.tourism || "Landmark").replace(
              "_",
              " ",
            ),
            // Save the distance here so the UI can use it
            distance: `${(Math.sqrt(Math.pow(el.lat - lat, 2) + Math.pow(el.lon - lng, 2)) * 111).toFixed(2)} km`,
            coordinates: { lat: el.lat, lng: el.lon },
          };
        })
        // Sort by distance (optional but recommended for the "Top 2")
        .sort((a, b) => {
          const distA = Math.sqrt(
            Math.pow(a.coordinates.lat - lat, 2) +
              Math.pow(a.coordinates.lng - lng, 2),
          );
          const distB = Math.sqrt(
            Math.pow(b.coordinates.lat - lat, 2) +
              Math.pow(b.coordinates.lng - lng, 2),
          );
          return distA - distB;
        })
        .slice(0, 2);

      return results;
    } catch (error) {
      console.error("❌ OSM Fetch Error:", error);
      return [];
    }
  };
  const scrollToLocation = () => {
    const el = document.getElementById("location");
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 120,
        behavior: "smooth",
      });
    }
  };

  // --- MAIN FETCH FUNCTION ---
  useEffect(() => {
    if (ssrHotelDetail) {
      return;
    }

    const fetchPropertyData = async () => {
      if (!propertyIdFromUrl) {
        setError("Invalid ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await GetAllPropertyDetails();
        const rawData = response?.data || response;
        setRestaurantPaths(buildRestaurantPathMap(rawData));

        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
          (item: ApiPropertyData) => {
            const parent = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];
            return listings.length === 0
              ? [{ parent, listing: null }]
              : listings.map((l: any) => ({ parent, listing: l }));
          },
        );

        const matched = flattened.find(
          (m: any) =>
            Number(m.parent.id) === Number(propertyIdFromUrl) &&
            m.listing?.isActive === true,
        );
        if (!matched) {
          setError("Property Not Found");
          return;
        }

        const { parent, listing } = matched;

        // Coordinate extraction with Number casting for safety
        const coords =
          parent.latitude && parent.longitude
            ? { lat: Number(parent.latitude), lng: Number(parent.longitude) }
            : null;

        const displayName = listing?.propertyName?.trim()
          ? listing.propertyName
          : listing?.mainHeading || parent.propertyName;
        const ratingMeta = parseCombinedRatingMeta(listing?.rating);

        // Fetch dynamic nearby places based on coordinates
        let dynamicNearby = [];
        if (coords) {
          dynamicNearby = await fetchNearbyFromOSM(
            coords.lat,
            coords.lng,
            displayName,
          );
        }

        setHotel({
          id: listing?.id || parent.id,
          propertyId: parent.id,
          locationId: parent.locationId,
          name: displayName,
          addressUrl: parent.addressUrl || null,
          location: listing?.fullAddress || parent.address,
          city: parent.locationName,
          type:
            listing?.propertyType || parent.propertyTypes?.[0] || "Property",
          description: listing?.mainHeading || "",
          tagline: listing?.tagline || "",
          rating: ratingMeta.rating,
          verifiedReviews: ratingMeta.verifiedReviews,
          price: `₹${(listing?.price || 0).toLocaleString()}`,
          media: listing?.media || [],
          coordinates: coords,
          amenities: (listing?.amenities || [])
            .map((amenity: unknown) => getAmenityName(amenity))
            .filter(Boolean),
          bookingEngineUrl: parent.bookingEngineUrl || null,
          checkIn: "2:00 PM",
          checkOut: "11:00 AM",
          image: { src: listing?.media?.[0]?.url || "", alt: displayName },
          nearbyPlaces:
            parent.nearbyLocations?.length > 0
              ? parent.nearbyLocations.map((n: any) => ({
                  name: n.nearbyLocationName,
                  googleMapLink: n.googleMapLink,
                }))
              : dynamicNearby.length > 0
                ? dynamicNearby
                : [],
        });
        console.log("LISTING:", listing);
        console.log("TAGLINE:", listing?.tagline);
      } catch (err) {
        console.error("Property Fetch Error:", err);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyIdFromUrl, ssrHotelDetail]);
  const fetchRooms = async (propId: number) => {
    try {
      setRoomsLoading(true);
      const res = await getRoomsByPropertyId(propId);
      const mappedRooms = Array.isArray(res?.data)
        ? [...res.data]
            .sort((a: any, b: any) => {
              const orderA = Number.isFinite(Number(a.displayOrder))
                ? Number(a.displayOrder)
                : Number.MAX_SAFE_INTEGER;
              const orderB = Number.isFinite(Number(b.displayOrder))
                ? Number(b.displayOrder)
                : Number.MAX_SAFE_INTEGER;

              if (orderA !== orderB) return orderA - orderB;
              return Number(a.roomId || 0) - Number(b.roomId || 0);
            })
            .map((r: any) => {
              const originalBasePrice = Number(r.basePrice ?? r.price ?? 0);
              const discountPercentage = Number(r.discount ?? 0);
              const discountedPrice =
                originalBasePrice > 0
                  ? Math.max(
                      0,
                      originalBasePrice -
                        (originalBasePrice * discountPercentage) / 100,
                    )
                  : 0;
              const resolvedDiscountPercent =
                originalBasePrice > 0 && discountPercentage > 0
                  ? Math.round(discountPercentage)
                  : 0;

              return {
                id: r.roomId.toString(),
                name: r.roomName || r.roomNumber,
                type: r.roomTypeName || r.roomType,
                description: r.description || "",
                basePrice: discountedPrice,
                originalPrice: originalBasePrice > 0 ? originalBasePrice : null,
                strikePrice: originalBasePrice > 0 ? originalBasePrice : null,
                discount: discountPercentage > 0 ? discountPercentage : null,
                discountPercent:
                  resolvedDiscountPercent > 0 ? resolvedDiscountPercent : null,
                maxOccupancy: r.maxOccupancy || 1,
                roomSize: r.roomSize ?? null,
                roomSizeUnit: r.roomSizeUnit || "SQ_FT",
                displayOrder: r.displayOrder ?? null,
                isAvailable: r.status === "AVAILABLE",
                amenities: r.amenitiesAndFeatures || [],
                highlightedAmenities:
                  r.amenitiesAndFeatures?.filter((a: RoomAmenity) =>
                    Boolean(a.showHighlight),
                  ) || [],
                image: {
                  src:
                    r.media?.find((item: any) => item.type === "IMAGE")?.url ||
                    r.media?.[0]?.url ||
                    "/images/room-placeholder.jpg",
                  alt: r.roomName,
                },
              };
            })
        : [];

      setRooms(mappedRooms);
      setSelectedRoomId((currentSelectedRoomId) => {
        if (
          currentSelectedRoomId &&
          mappedRooms.some((room: any) => room.id === currentSelectedRoomId)
        ) {
          return currentSelectedRoomId;
        }

        return mappedRooms.find((room: any) => room.isAvailable)?.id || null;
      });
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchGallery = async (propId: number) => {
    try {
      const res = await getGalleryByPropertyId(propId);

      const raw = res?.data?.content || res?.data || res;

      const items = (Array.isArray(raw) ? raw : [])
        .filter((i: any) => i.isActive && i.media?.url)
        .sort((a: any, b: any) => {
          const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });

      console.log("🎯 SORTED PROPERTY GALLERY:", items);

      setGalleryData(items);
    } catch (error) {
      console.error("❌ GALLERY FETCH ERROR:", error);
      setGalleryData([]);
    }
  };

  const fetchBookingPartners = async (propId: number) => {
    try {
      const res = await getBookingChannelPartnersByPropertyId(propId);
      const raw = res?.data?.data || res?.data || res || [];
      const list = Array.isArray(raw) ? raw : raw?.content || [];
      setBookingPartners(list.filter((item: any) => item?.isActive !== false));
    } catch (error) {
      console.error("Booking channel partners fetch error:", error);
      setBookingPartners([]);
    }
  };

  const fetchDining = async (propId: number) => {
    try {
      const res = await getAllDiningByPropertyId(propId);
      const baseItems = normalizeDiningList(res)
        .filter((item: any) => item?.isActive ?? true)
        .map((item: any) => mapDiningItem(item));

      const items = await Promise.all(
        baseItems.map(async (item: Restaurant) => {
          const ownSlides = item.image
            ? [
                {
                  mediaId: null,
                  type: "IMAGE",
                  url: item.image,
                  fileName: null,
                  alt: item.name || null,
                  width: null,
                  height: null,
                },
              ]
            : [];

          if (!item.attachRestaurantId) {
            return {
              ...item,
              mediaSlides: ownSlides,
            };
          }

          try {
            const galleryRes = await getGalleryByPropertyId(
              Number(item.attachRestaurantId),
            );
            const restaurantGallerySlides = normalizeGalleryMedia(galleryRes);

            return {
              ...item,
              mediaSlides:
                restaurantGallerySlides.length > 0
                  ? restaurantGallerySlides
                  : ownSlides,
            };
          } catch (error) {
            console.error("DINING RESTAURANT GALLERY FETCH ERROR:", error);
            return {
              ...item,
              mediaSlides: ownSlides,
            };
          }
        }),
      );

      setDiningItems(items);
    } catch (error) {
      console.error("DINING FETCH ERROR:", error);
      setDiningItems([]);
    }
  };

  const fetchPolicies = async (propId: number) => {
    try {
      const res = await getAllPropertyPolicies(propId);
      const data = res?.data || res;
      const matched = Array.isArray(data)
        ? data.find((p: any) => Number(p.propertyId) === Number(propId))
        : data;
      if (matched) {
        setPolicies(matched);
        setHotel((currentHotel) =>
          currentHotel
            ? {
                ...currentHotel,
                checkIn: matched.checkInTime || currentHotel.checkIn,
                checkOut: matched.checkOutTime || currentHotel.checkOut,
              }
            : currentHotel,
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!propertyIdFromUrl) return;

    fetchRooms(propertyIdFromUrl);
    fetchGallery(propertyIdFromUrl);
    fetchDining(propertyIdFromUrl);
    fetchBookingPartners(propertyIdFromUrl);
    fetchPolicies(propertyIdFromUrl);
  }, [propertyIdFromUrl]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    isBookmarked
      ? toast("Removed from favorites")
      : toast.success("Added to favorites!");
  };

  const openGalleryAt = (index: number) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const handleSearchDataChange = (data: typeof searchData) => {
    setSearchData(data);
    setSelectedRoomId(null);
  };

  const handleBookNow = () => {
    if (!hotel?.bookingEngineUrl) {
      showWarning("Online booking is not available for this property yet.");
      return;
    }

    if (!searchData.checkIn || !searchData.checkOut) {
      toast.error("Please select dates");
      return;
    }

    try {
      const baseUrl = hotel.bookingEngineUrl;

      if (baseUrl.includes("checkin")) {
        window.open(baseUrl, "_blank");
        return;
      }

      const url = new URL(baseUrl);

      url.searchParams.set(
        "checkin",
        searchData.checkIn.toISOString().split("T")[0],
      );
      url.searchParams.set(
        "checkout",
        searchData.checkOut.toISOString().split("T")[0],
      );
      url.searchParams.set("adults", String(searchData.adults));
      url.searchParams.set("children", String(searchData.children));
      url.searchParams.set("rooms", String(searchData.rooms));

      window.open(url.toString(), "_blank");
    } catch (error) {
      console.error("Booking URL error:", error);
      toast.error("Booking link is not configured correctly.");
    }
  };

  const handleRoomBook = (roomId: string | null) => {
    if (!roomId) return;
    setSelectedRoomId(roomId);
    handleBookNow();
  };

  const topGridImages = useMemo(() => {
    return galleryData.filter((g) => g.media?.url).map((g) => g.media);
  }, [galleryData]);

  const sections = useMemo(
    () => [
      { id: "room-options", label: "Room Options" },
      { id: "about-hotel", label: "About Hotel" },
      { id: "events", label: "Upcoming Events" }, // renamed
      { id: "amenities", label: "Amenities" },
      { id: "food-dining", label: "Food & Dining" }, // ✅ NEW
      { id: "reviews", label: "Guest Reviews" }, // moved up
      { id: "location", label: "Location" },
      { id: "policies", label: "Guest Policies" },
    ],
    [],
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  if (error || !hotel)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">{error || "Property Not Found"}</p>
          <Button onClick={() => navigate("/hotels")}>Back</Button>
        </div>
      </div>
    );
  console.log("Selected Room:", selectedRoomId);
  console.log("Booking URL:", hotel?.bookingEngineUrl);

  return (
    <>
      <div className="min-h-screen bg-background text-foreground pt-20">
        <Navbar logo={siteContent.brand.logo_hotel} />
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          hotel={hotel}
          initialImageIndex={initialGalleryIndex}
          galleryData={galleryData}
        />

        <div className="website-page-container py-6">
          <motion.nav
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="hotel-breadcrumb"
          >
            <Link to="/" className="hotel-breadcrumb-link">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/hotels" className="hotel-breadcrumb-link">
              Hotels
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{hotel.name}</span>
          </motion.nav>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3 w-full text-left"
            >
              {/* ROW 1 — TAGLINE */}
              {hotel.tagline && (
                <motion.div variants={fadeIn}>
                  <span className="inline-block text-[11px] font-semibold text-red-500 bg-red-500/10 px-3 py-1 rounded-md">
                    {hotel.tagline}
                  </span>
                </motion.div>
              )}

              {/* ROW 2 — TITLE */}
              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white"
              >
                {hotel.name}
              </motion.h1>

              {/* ROW 3 — LOCATION */}
              <motion.div
                variants={fadeIn}
                className="flex items-center gap-2 text-muted-foreground text-sm flex-wrap"
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {hotel.location}, {hotel.city}
                </span>

                {(hotel.addressUrl || hotel.coordinates) && (
                  <a
                    href={
                      hotel.addressUrl ||
                      `https://www.google.com/maps?q=${hotel.coordinates?.lat},${hotel.coordinates?.lng}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 font-medium hover:underline ml-2"
                  >
                    View Map
                  </a>
                )}
              </motion.div>

              {/* ROW 4 — NEARBY */}
              {hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && (
                <motion.div
                  variants={fadeIn}
                  className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap"
                >
                  {hotel.nearbyPlaces.slice(0, 2).map((place: any, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {/* ICON */}
                      <Navigation className="w-3 h-3 text-primary" />

                      {/* TEXT */}
                      <span
                        onClick={scrollToLocation}
                        className="cursor-pointer hover:text-primary hover:underline transition"
                      >
                        {place.distance
                          ? `${place.distance} from ${place.name}`
                          : place.name}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ROW 5 — RATING */}
              {hotel.rating && (
                <motion.div
                  variants={fadeIn}
                  className="flex items-center gap-4 pt-1"
                >
                  {/* RATING BADGE */}
                  <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
                    {hotel.rating} <Star className="w-3 h-3 fill-white" />
                  </div>

                  {hotel.verifiedReviews ? (
                    <span className="text-sm text-foreground font-semibold">
                      {hotel.verifiedReviews} Verified Reviews
                    </span>
                  ) : null}
                </motion.div>
              )}
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
                      {socialPlatforms.map((p) => {
                        const Icon = p.icon; // ✅ Capitalize so React treats it as a component
                        return (
                          <motion.a
                            key={p.name}
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ scale: 1.2, y: -3 }}
                            className={`${p.color} text-white p-2.5 rounded-full shadow-lg flex items-center justify-center`}
                          >
                            <Icon className="w-4 h-4" />{" "}
                            {/* ✅ Render as JSX element */}
                          </motion.a>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="outline"
                  className="rounded-full active:scale-95 px-6"
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
              <Button
                variant="outline"
                className={`rounded-full active:scale-95 transition-all px-6 ${isBookmarked ? "bg-destructive/10 border-destructive text-destructive" : ""}`}
                onClick={handleBookmark}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current text-destructive" : ""}`}
                />
                {isBookmarked ? "Saved" : "Save"}
              </Button>
            </div>
          </div>

          <HotelGalleryGrid
            galleryData={galleryData}
            onOpenGallery={openGalleryAt}
          />

          <FindYourStay
            onChange={handleSearchDataChange}
            initialDate={[searchData.checkIn, searchData.checkOut]}
            initialGuests={{
              adults: searchData.adults,
              children: searchData.children,
              rooms: searchData.rooms,
            }}
          />
          <HotelStickyNav sections={sections} />

          <div className="hotel-page-grid">
            <div className="space-y-10">
              <section id="room-options" className="scroll-mt-32">
                <h2 className="website-section-heading">Choose Your Room</h2>
                {highlightedRoomAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {highlightedRoomAmenities.map((amenity) => (
                      <span key={amenity} className="hotel-pill">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
                {roomsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin w-8 h-8 text-primary" />
                  </div>
                ) : rooms.length > 0 ? (
                  <RoomList
                    rooms={rooms}
                    selectedRoomId={effectiveSelectedRoomId}
                    onSelectRoom={handleRoomBook}
                    policyHighlightText={roomPolicyHighlightText}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No rooms available for the selected dates
                  </div>
                )}
              </section>

              <section id="about-hotel" className="hotel-section">
                <div className="pb-10">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                    About {hotel.name}
                  </h2>
                  <div className="max-w-4xl text-base leading-relaxed text-muted-foreground space-y-4">
                    {hotel.description?.split("\n\n").map((para, index) => (
                      <p key={index}>{para.trim()}</p>
                    ))}
                  </div>

                  {aboutAmenitiesPreview.length > 0 && (
                    <div className="mt-8">
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {aboutAmenitiesPreview.map((amenity, index) => (
                          <div
                            key={`${amenity}-${index}`}
                            className="hotel-card px-4 py-4 text-center transition-colors hover:border-primary/30"
                          >
                            <Star className="mx-auto mb-2 h-4 w-4 text-red-500" />
                            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground leading-snug">
                              {amenity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
              <section id="events" className="hotel-section">
                <div
                  id="food-dining"
                  className="grid grid-cols-1 xl:grid-cols-2 gap-8"
                >
                  <div className="min-w-0">
                    <h2 className="website-section-heading">Events</h2>
                    <EventSectionPropertySpecific
                      locationId={hotel.locationId}
                      locationName={hotel.city}
                      singleCard
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="website-section-heading">Food & Dining</h2>

                    {diningSectionItems.length > 0 ? (
                      <div className="relative">
                        <div className="overflow-hidden">
                          <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{
                              transform: `translateX(-${currentDiningIndex * 100}%)`,
                            }}
                          >
                            {diningSectionItems.map((restaurant) => {
                              const restaurantPath =
                                restaurant.attachRestaurantId
                                  ? restaurantPaths[
                                      String(restaurant.attachRestaurantId)
                                    ]
                                  : null;

                              return (
                                <div
                                  key={restaurant.id}
                                  className="w-full flex-shrink-0"
                                >
                                  <div
                                    className={`hotel-card overflow-hidden transition-shadow duration-200 ${
                                      restaurantPath
                                        ? "cursor-pointer hover:shadow-md"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (restaurantPath)
                                        navigate(restaurantPath);
                                    }}
                                    role={restaurantPath ? "button" : undefined}
                                    tabIndex={restaurantPath ? 0 : undefined}
                                    onKeyDown={(event) => {
                                      if (
                                        restaurantPath &&
                                        (event.key === "Enter" ||
                                          event.key === " ")
                                      ) {
                                        event.preventDefault();
                                        navigate(restaurantPath);
                                      }
                                    }}
                                  >
                                    <div className="relative w-full h-[320px] bg-muted flex items-center justify-center">
                                      {activeDiningMediaSlides.length > 0 ? (
                                        activeDiningMediaSlides[
                                          currentDiningMediaIndex
                                        ]?.type === "VIDEO" ? (
                                          <video
                                            src={
                                              activeDiningMediaSlides[
                                                currentDiningMediaIndex
                                              ]?.url
                                            }
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                          />
                                        ) : (
                                          <img
                                            src={
                                              activeDiningMediaSlides[
                                                currentDiningMediaIndex
                                              ]?.url
                                            }
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                          />
                                        )
                                      ) : (
                                        <UtensilsCrossed
                                          className="w-10 h-10 text-muted-foreground/50"
                                          strokeWidth={1.5}
                                        />
                                      )}
                                      {activeDiningMediaSlides.length > 1 && (
                                        <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
                                          {activeDiningMediaSlides.map(
                                            (_, idx) => (
                                              <button
                                                key={`dining-media-${restaurant.id}-${idx}`}
                                                type="button"
                                                onClick={(event) => {
                                                  event.preventDefault();
                                                  event.stopPropagation();
                                                  setCurrentDiningMediaIndex(
                                                    idx,
                                                  );
                                                }}
                                                className={`h-1.5 rounded-full transition-all ${
                                                  currentDiningMediaIndex ===
                                                  idx
                                                    ? "w-5 bg-white"
                                                    : "w-1.5 bg-white/55 hover:bg-white/80"
                                                }`}
                                                aria-label={`Show dining media ${idx + 1}`}
                                              />
                                            ),
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-4 space-y-1">
                                      {restaurant.name ? (
                                        <p className="text-base font-semibold text-foreground leading-snug">
                                          {restaurant.name}
                                        </p>
                                      ) : null}
                                      {restaurant.cuisine ? (
                                        <p className="text-sm text-muted-foreground">
                                          {restaurant.cuisine}
                                        </p>
                                      ) : null}
                                      {restaurant.description &&
                                      restaurant.description !==
                                        restaurant.cuisine ? (
                                        <p className="text-sm text-muted-foreground/90">
                                          {restaurant.description}
                                        </p>
                                      ) : null}
                                      {restaurant.attachedRestaurantName ? (
                                        <div className="pt-2 text-sm">
                                          <span className="text-red-600 font-semibold">
                                            Restaurant:
                                          </span>{" "}
                                          <span className="text-muted-foreground">
                                            {restaurant.attachedRestaurantName}
                                          </span>
                                        </div>
                                      ) : null}
                                      {restaurant.timings ? (
                                        <div className="pt-2 flex items-center gap-1 text-sm">
                                          <span className="text-red-600 font-semibold">
                                            Open:
                                          </span>
                                          <span className="text-muted-foreground">
                                            {restaurant.timings}
                                          </span>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {diningSectionItems.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setCurrentDiningIndex((prev) =>
                                  prev === 0
                                    ? diningSectionItems.length - 1
                                    : prev - 1,
                                )
                              }
                              className="hotel-carousel-nav left-2"
                              aria-label="Previous dining item"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setCurrentDiningIndex((prev) =>
                                  prev === diningSectionItems.length - 1
                                    ? 0
                                    : prev + 1,
                                )
                              }
                              className="hotel-carousel-nav right-2"
                              aria-label="Next dining item"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <div className="flex justify-center gap-2 mt-4">
                              {diningSectionItems.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentDiningIndex(idx)}
                                  className={`h-1.5 rounded-full transition-all ${
                                    currentDiningIndex === idx
                                      ? "bg-primary w-5"
                                      : "bg-border hover:bg-muted-foreground w-1.5"
                                  }`}
                                  aria-label={`Go to dining slide ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="hotel-empty-state">
                        No food and dining highlights available for this
                        property.
                      </div>
                    )}
                  </div>
                </div>
              </section>
              {hotel.amenities.length > 0 && (
                <section id="amenities" className="hotel-section">
                  <div className="pb-10">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <h2 className="website-section-heading mb-0">
                        Amenities
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                      {hotel.amenities.map((amenity, index) => (
                        <div
                          key={`${amenity}-${index}`}
                          className="hotel-amenity-row"
                        >
                          <div className="hotel-amenity-icon">
                            <Check className="h-4 w-4" />
                          </div>
                          <p className="text-base text-foreground">{amenity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section id="location" className="hotel-section">
                <h2 className="website-section-heading">Location</h2>
                <PropertyMap
                  property={hotel}
                  nearbyPlaces={hotel.nearbyPlaces || []}
                />
              </section>
              <section id="reviews" className="hotel-section">
                <ReviewsSection propertyId={propertyIdFromUrl} />
              </section>

              <section id="policies" className="hotel-section">
                <h2 className="website-section-heading">Guest Policies</h2>
                <div className="hotel-policy-panel">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest">
                        <Info className="w-4 h-4" /> CHECK-IN / CHECK-OUT
                      </div>
                      <div className="space-y-5 text-sm text-muted-foreground dark:text-foreground/80">
                        <div className="space-y-3">
                          <div className="flex justify-between md:justify-start md:gap-6">
                            <span className="font-medium text-foreground min-w-[100px]">
                              Check-in:
                            </span>
                            <span className="text-foreground dark:text-foreground/85">
                              {policies?.checkInTime || "2:00 PM"}
                            </span>
                          </div>
                          <div className="flex justify-between md:justify-start md:gap-6">
                            <span className="font-medium text-foreground min-w-[100px]">
                              Check-out:
                            </span>
                            <span className="text-foreground dark:text-foreground/85">
                              {policies?.checkOutTime || "11:00 AM"}
                            </span>
                          </div>
                        </div>
                        <div className="hotel-policy-box">
                          <p className="font-medium text-foreground mb-2">
                            Cancellation Policy
                          </p>
                          <p className="leading-relaxed text-foreground/80 dark:text-foreground/85">
                            {policies?.cancellationPolicy ||
                              "Non-refundable for promotional rates"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest">
                        <Info className="w-4 h-4" /> OTHER POLICIES
                      </div>
                      <div className="hotel-policy-box">
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {policies?.policies?.map((p) => (
                            <li
                              key={p.id}
                              className="flex items-center gap-1.5"
                            >
                              <span className="h-1 w-1 shrink-0 rounded-full bg-red-500" />
                              <span
                                className="text-[11px] leading-tight text-foreground dark:text-foreground/85 truncate"
                                title={p.name}
                              >
                                {p.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <aside>
              <RightSidebar
                hotel={hotel}
                selectedRoom={effectiveSelectedRoom}
                onBookNow={handleBookNow}
                checkInDate={searchData.checkIn}
                checkOutDate={searchData.checkOut}
                numberOfNights={numberOfNights}
                policies={policies}
                bookingPartners={bookingPartners}
              />
            </aside>
          </div>
        </div>

        <MobileBookingBar
          hotel={hotel}
          selectedRoom={effectiveSelectedRoom}
          checkInDate={searchData.checkIn}
          checkOutDate={searchData.checkOut}
          numberOfNights={numberOfNights}
          onSelectRoom={() => {
            const roomSection = document.getElementById("room-options");
            if (roomSection)
              window.scrollTo({
                top:
                  roomSection.getBoundingClientRect().top +
                  window.pageYOffset -
                  120,
                behavior: "smooth",
              });
          }}
        />
        <Footer />
      </div>
    </>
  );
}
