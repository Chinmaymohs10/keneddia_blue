import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Share2,
  Heart,
  Check,
  Info,
  ChevronRight,
  Utensils,
  Map as MapIcon,
  Navigation,
  ArrowRight,
  Calendar,
  Loader2,
  BedDouble,
  Building2,
  Users,
  Phone,
  Mail,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteContent } from "@/data/siteContent";
import PropertyMap from "@/modules/website/components/PropertyMap";
import FindYourStay from "@/modules/website/components/FindYourStay";
import HotelStickyNav from "@/modules/website/components/HotelStickyNav";
import RoomList from "@/modules/website/components/RoomList";
import { Button } from "@/components/ui/button";
import {
  GetAllPropertyDetails,
  getRoomsByPropertyId,
  getAllGalleries,
  getEventsUpdated,
} from "@/Api/Api";
import { toast } from "react-hot-toast";

// Components
import RightSidebar from "@/modules/website/components/hotel-detail/RightSidebar";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import ReviewsSection from "@/modules/website/components/hotel-detail/ReviewsSection";
import MobileBookingBar from "@/modules/website/components/Mobilebookingbar";

// Types
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
  assignedAdminId: number;
  assignedAdminName: string;
  propertyType: string | null;
  city: string | null;
  mainHeading: string;
  subTitle: string;
  fullAddress: string;
  tagline: string;
  rating: number | null;
  capacity: number | null;
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
  area: string;
  pincode: string;
  locationId: number;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  assignedAdminId: number;
  assignedAdminName: string;
  parentPropertyId: number | null;
  parentPropertyName: string | null;
  childProperties: any[];
  isActive: boolean;
}

interface ApiPropertyData {
  propertyResponseDTO: PropertyResponse;
  propertyListingResponseDTOS: PropertyListing[];
}

interface RoomAmenity {
  id: number;
  name: string;
  isActive: boolean;
}

interface ApiRoom {
  roomId: number;
  propertyId: number;
  roomNumber: string;
  roomType: string;
  roomName: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  roomSize: number | null;
  roomSizeUnit: string;
  floorNumber: number;
  status: string;
  bookable: boolean;
  active: boolean;
  amenitiesAndFeatures: RoomAmenity[];
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
  location: string;
  city: string;
  type: string;
  description: string;
  tagline: string;
  rating: number | null;
  reviews: number;
  price: string;
  gstPercentage: number;
  discountAmount: number;
  capacity: number | null;
  amenities: string[];
  media: PropertyMedia[];
  coordinates: { lat: number; lng: number } | null;
  checkIn: string;
  checkOut: string;
  features: string[];
  image: { src: string; alt: string };
  roomTypes: any[];
  dining: any[];
  events: any[];
  nearbyPlaces: any[];
  policies: {
    checkInAge: number;
    pets: boolean;
    cancellation: string;
    extraBed: boolean;
  };
}

const formatCategoryName = (category: string) => {
  if (category === "ALL") return "All";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const mapApiToHotelData = (
  item: ApiPropertyData,
  searchId: number,
): HotelData | null => {
  const parent = item.propertyResponseDTO;

  // Find the specific listing that matches the search ID
  const listing =
    item.propertyListingResponseDTOS?.find(
      (l) => l.id === searchId && l.isActive,
    ) ||
    item.propertyListingResponseDTOS?.find((l) => l.isActive) ||
    item.propertyListingResponseDTOS?.[0];

  if (!parent) return null;

  const priceValue = listing?.price || 0;
  return {
    id: listing?.id || parent.id,
    propertyId: parent.id,
    name: parent.propertyName || "__",
    location: listing?.fullAddress || parent.address || "__",
    city: parent.locationName || "__",
    type: listing?.propertyType || parent.propertyTypes?.[0] || "__",
    description: listing?.mainHeading || parent.propertyName || "__",
    tagline: listing?.tagline || "__",
    rating: listing?.rating || null,
    reviews: 0,
    price: `₹${priceValue.toLocaleString("en-IN")}`,
    gstPercentage: listing?.gstPercentage || 0,
    discountAmount: listing?.discountAmount || 0,
    capacity: listing?.capacity || null,
    amenities: listing?.amenities || [],
    media: listing?.media || [],
    coordinates:
      parent.latitude && parent.longitude
        ? { lat: parent.latitude, lng: parent.longitude }
        : null,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    features: parent.propertyCategories || [],
    image: {
      src: listing?.media?.[0]?.url || "",
      alt: parent.propertyName || "Hotel Image",
    },
    roomTypes: [],
    dining: [],
    events: [],
    nearbyPlaces: [],
    policies: {
      checkInAge: 18,
      pets: false,
      cancellation: "Flexible",
      extraBed: true,
    },
  };
};

const mapRoomToUIFormat = (room: ApiRoom, roomImage?: string) => {
  const isAvailable = room.status === "AVAILABLE" && room.active === true;

  return {
    id: room.roomId.toString(),
    name: room.roomName || "__",
    type: room.roomType || "__",
    description: room.description || "__",
    basePrice: room.basePrice || 0,
    price: room.basePrice || 0,
    maxOccupancy: room.maxOccupancy || "__",
    size: room.roomSize
      ? `${room.roomSize} ${room.roomSizeUnit?.replace("_", " ")}`
      : "__",
    floor: room.floorNumber || "__",
    roomNumber: room.roomNumber || "__",
    status: isAvailable ? "available" : "unavailable",
    isAvailable: isAvailable,
    bookable: room.bookable,
    active: room.active,
    amenities:
      room.amenitiesAndFeatures
        ?.filter((a) => a.isActive)
        ?.map((a) => a.name) || [],
    image: { src: roomImage || "", alt: room.roomName || room.roomNumber },
  };
};

export default function HotelDetail() {
  const params = useParams<{ city?: string; propertyId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const propertyId = params.propertyId
    ? Number(params.propertyId)
    : params.city
      ? Number(params.city)
      : null;

  const state = location.state as any;

  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  // FIX: Ensure this is defined
  const [selectedGalleryCategory, setSelectedGalleryCategory] =
    useState<string>("ALL");

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) {
        setError("Invalid ID");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const response = await GetAllPropertyDetails();
        const rawData = response?.data || response;

        console.log("=== MATCHING DEBUG ===");
        console.log("URL Param ID:", propertyId);

        const propertyItem = rawData?.find((item: any) => {
          console.log(
            "\n--- Checking Property:",
            item.propertyResponseDTO?.propertyName,
          );

          // Strategy 1: Try to match by listing ID first (more specific)
          const matchingListing = item.propertyListingResponseDTOS?.find(
            (listing: any) => {
              const matches =
                listing.id === propertyId && listing.isActive === true;
              console.log(
                `  Listing ID: ${listing.id} === ${propertyId}? ${matches}`,
              );
              return matches;
            },
          );

          if (matchingListing) {
            console.log("✅ MATCHED via Listing ID:", matchingListing.id);
            return true;
          }

          // Strategy 2: Only try property ID match if NO listings matched
          const propertyMatches = item.propertyResponseDTO?.id === propertyId;
          console.log(
            `  Property ID: ${item.propertyResponseDTO?.id} === ${propertyId}? ${propertyMatches}`,
          );

          if (propertyMatches) {
            console.log(
              "✅ MATCHED via Property ID:",
              item.propertyResponseDTO.id,
            );
          }

          return propertyMatches;
        });

        console.log("\n=== RESULT ===");
        console.log("Found:", propertyItem ? "YES" : "NO");

        if (!propertyItem) {
          console.error("❌ No property found");
          setError("Not found");
          setLoading(false);
          return;
        }

        const mappedHotel = mapApiToHotelData(propertyItem, propertyId);
        console.log("Mapped Hotel:", mappedHotel);

        if (mappedHotel) {
          console.log("✅ Setting hotel state");
          setHotel(mappedHotel);
          setError(null);
          fetchRooms(mappedHotel.propertyId);
          fetchGallery(mappedHotel.propertyId);
        } else {
          console.error("❌ Mapping failed");
          setError("Failed to map data");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [propertyId]);

  const fetchRooms = async (propId: number) => {
    try {
      setRoomsLoading(true);

      const response = await getRoomsByPropertyId(propId);
      const roomsData: ApiRoom[] = response?.data || [];

      setRooms(
        roomsData.map((room, index) =>
          mapRoomToUIFormat(
            room,
            roomGalleryImages[index] || hotel?.image?.src || "",
          ),
        ),
      );
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchGallery = async (propId: number) => {
    try {
      const response = await getAllGalleries({ page: 0, size: 100 });
      const data = response?.data?.content || response?.content || [];
      setGalleryData(
        data.filter((item: any) => item.propertyId === propId && item.isActive),
      );
    } catch (err) {
      setGalleryData([]);
    }
  };
  const roomGalleryImages = useMemo(() => {
    return galleryData
      .filter((item) => item.media?.url)
      .map((item) => item.media.url);
  }, [galleryData]);

  const topGridImages = useMemo(() => {
    return [...(hotel?.media || []), ...galleryData.map((item) => item.media)];
  }, [hotel?.media, galleryData]);

  const sections = [
    { id: "room-options", label: "Room Options" },
    { id: "about-hotel", label: "About Hotel" },
    { id: "amenities", label: "Amenities" },
    { id: "location", label: "Location" },
    { id: "policies", label: "Guest Policies" },
  ];

  const openGallery = (index: number) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };
  const selectedRoom = selectedRoomId
    ? rooms.find((r) => r.id === selectedRoomId) || null
    : null;
  const scrollToRoomOptions = () =>
    document
      .getElementById("room-options")
      ?.scrollIntoView({ behavior: "smooth" });

  const handleShare = async () => {
    if (!hotel) return;
    try {
      if (navigator.share)
        await navigator.share({ title: hotel.name, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Copied!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navbar logo={siteContent.brand.logo_hotel} />
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );

  if (error || !hotel)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navbar logo={siteContent.brand.logo_hotel} />
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <Button onClick={() => navigate("/hotels")}>Back to Hotels</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20 pb-24 lg:pb-0">
      <Navbar logo={siteContent.brand.logo_hotel} />

      {topGridImages.length > 0 && (
        <GalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          hotel={hotel}
          initialImageIndex={initialGalleryIndex}
          galleryData={galleryData} // ✅ Pass the gallery data
        />
      )}

      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/hotels" className="hover:text-foreground">
            Hotels
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{hotel.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-12 pb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block">
              {hotel.type}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              {hotel.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> {hotel.location},{" "}
              {hotel.city}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] mb-8 rounded-xl overflow-hidden shadow-sm">
          <div
            className="md:col-span-2 h-full relative group cursor-pointer bg-muted"
            onClick={() => openGallery(0)}
          >
            {topGridImages[0]?.url ? (
              <OptimizedImage
                src={topGridImages[0].url}
                alt={hotel.name}
                className="w-full h-full object-cover transition-all group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <BedDouble className="w-12 h-12 opacity-20" />
              </div>
            )}
          </div>
          <div className="md:col-span-1 flex flex-col gap-2">
            <div
              className="h-1/2 bg-muted relative cursor-pointer overflow-hidden group"
              onClick={() => openGallery(1)}
            >
              {topGridImages[1]?.url && (
                <OptimizedImage
                  src={topGridImages[1].url}
                  alt="Gallery"
                  className="w-full h-full object-cover group-hover:scale-110 transition-all"
                />
              )}
            </div>
            <div
              className="h-1/2 bg-muted relative cursor-pointer overflow-hidden group"
              onClick={() => openGallery(2)}
            >
              {topGridImages[2]?.url && (
                <OptimizedImage
                  src={topGridImages[2].url}
                  alt="Gallery"
                  className="w-full h-full object-cover group-hover:scale-110 transition-all"
                />
              )}
            </div>
          </div>
          <div
            className="md:col-span-1 bg-muted relative cursor-pointer group overflow-hidden"
            onClick={() => openGallery(3)}
          >
            {topGridImages[3]?.url && (
              <OptimizedImage
                src={topGridImages[3].url}
                alt="Gallery"
                className="w-full h-full object-cover group-hover:scale-110 transition-all"
              />
            )}
            {topGridImages.length > 4 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
                +{topGridImages.length - 4} More
              </div>
            )}
          </div>
        </div>

        <FindYourStay />
      </div>

      <HotelStickyNav sections={sections} />

      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-12">
          <section id="room-options" className="scroll-mt-40">
            <h2 className="text-2xl font-serif font-bold mb-6">
              Choose Your Room
            </h2>
            {roomsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rooms.length > 0 ? (
              <RoomList
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={(id) =>
                  setSelectedRoomId(id === selectedRoomId ? null : id)
                }
              />
            ) : (
              <div className="text-center py-12 bg-secondary/5 rounded-xl border">
                <p>No rooms available</p>
              </div>
            )}
          </section>

          <section id="about-hotel" className="scroll-mt-40 pt-8 border-t">
            <h2 className="text-2xl font-serif font-bold mb-4">
              About {hotel.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {hotel.description}
            </p>
          </section>

          <section id="amenities" className="scroll-mt-40 pt-8 border-t">
            <h2 className="text-2xl font-serif font-bold mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hotel.amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" /> {a}
                </div>
              ))}
            </div>
          </section>

          <section id="location" className="scroll-mt-40 pt-8 border-t">
            <h2 className="text-2xl font-serif font-bold mb-6">Location</h2>
            <PropertyMap property={hotel} />
          </section>
        </div>
        <div className="hidden lg:block relative z-10">
          <RightSidebar hotel={hotel} selectedRoom={selectedRoom} />
        </div>
      </div>
      <MobileBookingBar
        hotel={hotel}
        selectedRoom={selectedRoom}
        onSelectRoom={scrollToRoomOptions}
      />
      <Footer />
    </div>
  );
}
