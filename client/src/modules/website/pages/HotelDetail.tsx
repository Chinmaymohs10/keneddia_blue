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
  ChevronRight,
  Loader2,
  Info,
  Navigation,
  Image as ImageIcon,
  Facebook,
  Twitter,
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
} from "@/Api/Api";
import { toast } from "react-hot-toast";

// Components
import RightSidebar from "@/modules/website/components/hotel-detail/RightSidebar";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import MobileBookingBar from "@/modules/website/components/Mobilebookingbar";

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
  location: string;
  city: string;
  locationId: number;
  type: string;
  description: string;
  tagline: string;
  rating: number | null;
  price: string;
  media: PropertyMedia[];
  coordinates: { lat: number; lng: number } | null;
  amenities: string[];
  image: { src: string; alt: string };
  nearbyPlaces?: string[];
}

interface PolicyData {
  propertyId: number;
  propertyName: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  cancellationPolicy: string | null;
  policies: Array<{ id: number; name: string; isActive: boolean }>;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

export default function HotelDetail() {
  const params = useParams();
  console.log(params);

  const { citySlug, propertyId } = useParams<{
    citySlug: string;
    propertyId: string;
  }>();

  const propertyIdFromUrl = propertyId ? Number(propertyId) : null;
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [policies, setPolicies] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
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

  // --- MAIN FETCH FUNCTION ---
  useEffect(() => {
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
          (m: any) => Number(m.parent.id) === Number(propertyIdFromUrl),
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
          location: listing?.fullAddress || parent.address,
          city: parent.locationName,
          type:
            listing?.propertyType || parent.propertyTypes?.[0] || "Property",
          description: listing?.mainHeading || "",
          tagline: listing?.tagline || "",
          rating: listing?.rating || null,
          price: `₹${(listing?.price || 0).toLocaleString()}`,
          media: listing?.media || [],
          coordinates: coords,
          amenities: listing?.amenities || [],
          bookingEngineUrl: parent.bookingEngineUrl || null,
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

        // Secondary Data Fetches
        fetchRooms(parent.id);
        fetchGallery(parent.id);
        fetchPolicies(parent.id);
      } catch (err) {
        console.error("Property Fetch Error:", err);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyIdFromUrl]);
  const fetchRooms = async (propId: number) => {
    try {
      setRoomsLoading(true);
      const res = await getRoomsByPropertyId(propId);
      setRooms(
        Array.isArray(res?.data)
          ? res.data.map((r: any) => ({
              id: r.roomId.toString(),
              name: r.roomName || r.roomNumber,
              type: r.roomType,
              description: r.description || "",
              basePrice: r.basePrice || 0,
              maxOccupancy: r.maxOccupancy || 1,
              isAvailable: r.status === "AVAILABLE",
              amenities: r.amenitiesAndFeatures?.map((a: any) => a.name) || [],
              image: {
                src: r.media?.[0]?.url || "/images/room-placeholder.jpg",
                alt: r.roomName,
              },
            }))
          : [],
      );
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchGallery = async (propId: number) => {
    try {
      const res = await getAllGalleries({ page: 0, size: 100 });
      const all = res?.data?.content || [];

      const filtered = all.filter(
        (i: any) =>
          Number(i.propertyId) === Number(propId) && i.isActive && i.media?.url,
      );

      console.log("🎯 FINAL FILTERED GALLERY:", filtered);

      setGalleryData(filtered);
    } catch (error) {
      console.error("❌ GALLERY FETCH ERROR:", error);
      setGalleryData([]);
    }
  };

  const fetchPolicies = async (propId: number) => {
    try {
      const res = await getAllPropertyPolicies(propId);
      const data = res?.data || res;
      const matched = Array.isArray(data)
        ? data.find((p: any) => Number(p.propertyId) === Number(propId))
        : data;
      if (matched) setPolicies(matched);
    } catch (err) {
      console.error(err);
    }
  };

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

  const topGridImages = useMemo(() => {
    return galleryData.filter((g) => g.media?.url).map((g) => g.media);
  }, [galleryData]);

  const sections = useMemo(
    () => [
      { id: "room-options", label: "Room Options" },
      { id: "about-hotel", label: "About Hotel" },
      { id: "amenities", label: "Amenities" },
      { id: "events", label: "Events" },
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

        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
          <motion.nav
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              to="/hotels"
              className="hover:text-foreground transition-colors"
            >
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
              <motion.div variants={fadeIn} className="flex items-center gap-3">
                <span className="inline-flex bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {hotel.type}
                </span>
                {hotel.rating && (
                  <div className="flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    <span>{hotel.rating}</span>
                    <Star className="w-3 h-3 fill-white" />
                  </div>
                )}
              </motion.div>
              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white"
              >
                {hotel.name}
              </motion.h1>
              <div className="space-y-2">
                <motion.div
                  variants={fadeIn}
                  className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {hotel.location}, {hotel.city}
                    </span>
                  </div>
                  {hotel.coordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${hotel.coordinates.lat},${hotel.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-destructive hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-4 h-4" /> View Map
                    </a>
                  )}
                </motion.div>
                <motion.div
                  variants={fadeIn}
                  className="flex flex-wrap items-center gap-4 pt-1"
                >
                  {hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && (
                    <motion.div
                      variants={fadeIn}
                      className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground/80"
                    >

                      {hotel.nearbyPlaces.map((place: any, i) => {
                        const mapLink =
                          place.googleMapLink ||
                          (place.coordinates
                            ? `https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`
                            : null);

                        return (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-primary/40" />

                            {mapLink ? (
                              <a
                                href={mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline transition cursor-pointer"
                              >
                                {place.name}
                              </a>
                            ) : (
                              <span>{place.name}</span>
                            )}

                            {place.distance && (
                              <span className="text-[10px] opacity-70">
                                ({place.distance})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
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

          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[350px] md:h-[450px] mb-8 rounded-2xl overflow-hidden shadow-xl relative cursor-pointer [&>*]:min-h-0"
          >
            <div
              className="md:col-span-2 h-full bg-muted overflow-hidden relative group row-span-2"
              onClick={() => openGalleryAt(0)}
            >
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
              <div className="absolute inset-0">
                <OptimizedImage
                  src={topGridImages[0]?.url || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="md:col-span-1 flex flex-col gap-3 h-full">
              {[1, 2].map((idx) =>
                topGridImages[idx] ? (
                  <div
                    key={idx}
                    className="flex-1 bg-muted overflow-hidden relative group"
                    onClick={() => openGalleryAt(idx)}
                  >
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
                    <OptimizedImage
                      src={topGridImages[idx]?.url || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div key={idx} className="flex-1 bg-muted/40 rounded" /> // empty placeholder
                ),
              )}
            </div>
            <div
              className="md:col-span-1 bg-muted relative overflow-hidden group"
              onClick={() => (topGridImages[3] ? openGalleryAt(3) : undefined)}
            >
              {topGridImages[3] ? (
                <>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
                  <OptimizedImage
                    src={topGridImages[3]?.url || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-muted/40" />
              )}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 text-black text-[11px] font-black shadow-lg transform transition-transform group-hover:scale-110">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>
                    {topGridImages.length > 4
                      ? `+${topGridImages.length - 4} MORE`
                      : "VIEW GALLERY"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

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

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 py-8">
            <div className="space-y-10">
              <section id="room-options" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                  Choose Your Room
                </h2>
                {roomsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin w-8 h-8 text-primary" />
                  </div>
                ) : rooms.length > 0 ? (
                  <RoomList
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={setSelectedRoomId}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No rooms available for the selected dates
                  </div>
                )}
              </section>

              <section id="about-hotel" className="scroll-mt-32 border-t pt-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                  About {hotel.name}
                </h2>
                <div className="text-muted-foreground leading-relaxed text-base space-y-4">
                  {hotel.description?.split("\n\n").map((para, index) => (
                    <p key={index}>{para.trim()}</p>
                  ))}
                </div>
              </section>

              {hotel.amenities.length > 0 && (
                <section id="amenities" className="scroll-mt-32 border-t pt-10">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                    Amenities
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <Check className="text-primary w-4 h-4 flex-shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section id="events" className="scroll-mt-32 border-t pt-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                  Events
                </h2>
                <EventSectionPropertySpecific
                  locationId={hotel.locationId}
                  locationName={hotel.city}
                />
              </section>
              <section id="location" className="scroll-mt-32 border-t pt-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                  Location
                </h2>
                <PropertyMap property={hotel} />
              </section>

              <section id="policies" className="scroll-mt-32 border-t pt-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                  Guest Policies
                </h2>
                <div className="bg-white border rounded-xl p-6 md:p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest">
                        <Info className="w-4 h-4" /> CHECK-IN / CHECK-OUT
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex justify-between md:justify-start md:gap-6">
                          <span className="font-medium text-foreground min-w-[100px]">
                            Check-in:
                          </span>
                          <span>{policies?.checkInTime || "2:00 PM"}</span>
                        </div>
                        <div className="flex justify-between md:justify-start md:gap-6">
                          <span className="font-medium text-foreground min-w-[100px]">
                            Check-out:
                          </span>
                          <span>{policies?.checkOutTime || "11:00 AM"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest">
                        <Info className="w-4 h-4" /> OTHER POLICIES
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        {policies?.policies?.map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between md:justify-start md:gap-6"
                          >
                            <span className="font-medium text-foreground min-w-[100px]">
                              {p.name.split(" ")[0]}:
                            </span>
                            <span>
                              {p.isActive ? "Allowed" : "Not Allowed"}
                            </span>
                          </div>
                        ))}
                        <div className="flex flex-col gap-1 pt-2">
                          <span className="font-medium text-foreground">
                            Cancellation:
                          </span>
                          <span className="leading-relaxed">
                            {policies?.cancellationPolicy ||
                              "Non-refundable for promotional rates"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <aside className="hidden lg:block">
              <RightSidebar
                hotel={hotel}
                selectedRoom={rooms.find((r) => r.id === selectedRoomId)}
                onBookNow={handleBookNow}
                checkInDate={searchData.checkIn}
                checkOutDate={searchData.checkOut}
                numberOfNights={numberOfNights}
              />
            </aside>
          </div>
        </div>

        <MobileBookingBar
          hotel={hotel}
          selectedRoom={rooms.find((r) => r.id === selectedRoomId)}
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
