import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { addDays } from "date-fns";
import {
  MapPin,
  Star,
  Share2,
  Heart,
  Check,
  ChevronRight,
  Loader2,
  Info,
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

interface HotelData {
  id: number;
  propertyId: number;
  name: string;
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
}

interface PolicyData {
  propertyId: number;
  propertyName: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  cancellationPolicy: string | null;
  policies: Array<{ id: number; name: string; isActive: boolean }>;
}

export default function HotelDetail() {
  const params = useParams<{ propertyId?: string }>();
  const navigate = useNavigate();
  const propertyIdFromUrl = params.propertyId
    ? Number(params.propertyId)
    : null;

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

  const [searchData, setSearchData] = useState({
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    adults: 2,
    children: 0,
    rooms: 1,
  });

  // Initialize dates on mount if not set
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

  // Calculate number of nights
  const numberOfNights = useMemo(() => {
    if (!searchData.checkIn || !searchData.checkOut) return 1;
    const diffTime =
      searchData.checkOut.getTime() - searchData.checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [searchData.checkIn, searchData.checkOut]);

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

        const flattened = rawData.flatMap((item: ApiPropertyData) => {
          const parent = item.propertyResponseDTO;
          const listings = item.propertyListingResponseDTOS || [];
          return listings.length === 0
            ? [{ parent, listing: null }]
            : listings.map((l) => ({ parent, listing: l }));
        });

        const matched = flattened.find(
          (m: any) => Number(m.parent.id) === Number(propertyIdFromUrl),
        );

        if (!matched) {
          setError("Property Not Found");
          return;
        }

        const { parent, listing } = matched;
        const displayName =
          listing?.propertyName && listing.propertyName.trim() !== ""
            ? listing.propertyName
            : listing?.mainHeading || parent.propertyName;

        setHotel({
          id: listing?.id || parent.id,
          propertyId: parent.id,
          locationId: parent.locationId,// Add this - or use the actual locationId field from your API
          name: displayName,
          location: listing?.fullAddress || parent.address,
          city: parent.locationName,
          type:
            listing?.propertyType || parent.propertyTypes?.[0] || "Property",
          description:
            listing?.subTitle ||
            listing?.mainHeading ||
            "Welcome to " + displayName,
          tagline: listing?.tagline || "",
          rating: listing?.rating || null,
          price: `₹${(listing?.price || 0).toLocaleString()}`,
          media: listing?.media || [],
          coordinates:
            parent.latitude && parent.longitude
              ? { lat: parent.latitude, lng: parent.longitude }
              : null,
          amenities: listing?.amenities || [],
          image: { src: listing?.media?.[0]?.url || "", alt: displayName },
        });

        fetchRooms(parent.id);
        fetchGallery(parent.id);
        fetchPolicies(parent.id);
      } catch (err) {
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
      const data = Array.isArray(res?.data) ? res.data : [];

      const mappedRooms = data.map((r: any) => {
        const isAvailable =
          r.status === "AVAILABLE" && r.bookable === true && r.active === true;

        return {
          id: r.roomId.toString(),
          name: r.roomName || r.roomNumber,
          type: r.roomType,
          description: r.description || "",
          basePrice: r.basePrice || 0,
          maxOccupancy: r.maxOccupancy || 1,
          isAvailable,
          amenities:
            r.amenitiesAndFeatures
              ?.filter((a: any) => a.isActive)
              ?.map((a: any) => a.name) || [],
          image: {
            src:
              roomImageMap.get(propId) ||
              hotel?.image?.src ||
              "/images/room-placeholder.jpg",
            alt: r.roomName || r.roomNumber,
          },
        };
      });
      setRooms(mappedRooms);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchGallery = async (propId: number) => {
    try {
      const res = await getAllGalleries({ page: 0, size: 100 });
      const allContent = res?.data?.content || res?.content || [];
      const filtered = allContent.filter(
        (item: any) =>
          Number(item.propertyId) === Number(propId) && item.isActive,
      );
      setGalleryData(filtered);
    } catch (err) {
      setGalleryData([]);
    }
  };

  const fetchPolicies = async (propId: number) => {
    try {
      const res = await getAllPropertyPolicies(propId);
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const matchedPolicy = data.find(
        (p: any) => Number(p.propertyId) === Number(propId),
      );
      if (matchedPolicy) {
        setPolicies(matchedPolicy);
      }
    } catch (err) {
      console.error("Error fetching policies", err);
    }
  };

  const roomImageMap = useMemo(() => {
    const map = new Map<number, string>();
    galleryData.forEach((item) => {
      if (
        item.category === "ROOM" &&
        item.media?.url &&
        !map.has(item.propertyId)
      ) {
        map.set(item.propertyId, item.media.url);
      }
    });
    return map;
  }, [galleryData]);

  const handleSearchDataChange = (data: typeof searchData) => {
    const dateChanged =
      data.checkIn?.getTime() !== searchData.checkIn?.getTime() ||
      data.checkOut?.getTime() !== searchData.checkOut?.getTime();

    setSearchData(data);

    // Clear selected room when dates change
    if (dateChanged) {
      setSelectedRoomId(null);
      toast.success("Dates updated! Please select a room again.");
    }
  };

  const handleBookNow = () => {
    if (!searchData.checkIn || !searchData.checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (!selectedRoomId) {
      toast.error("Please select a room");
      return;
    }
    const token = "ODQ2Mg==";
    const params = new URLSearchParams({
      token,
      checkin: searchData.checkIn.toISOString().split("T")[0],
      checkout: searchData.checkOut.toISOString().split("T")[0],
      adults: String(searchData.adults),
      children: String(searchData.children),
      rooms: String(searchData.rooms),
    });
    const bookingUrl = `https://asiatech.in/booking_engine/index3?${params.toString()}`;
    window.open(bookingUrl, "_blank");
  };

  const topGridImages = useMemo(() => {
    const combined = [
      ...(hotel?.media || []),
      ...galleryData.map((g) => g.media),
    ];
    return combined.filter((m) => m && m.url);
  }, [hotel?.media, galleryData]);

  const isRestaurant = useMemo(() => {
    if (!hotel) return false;
    const type = hotel.type.toLowerCase();
    return (
      type.includes("restaurant") ||
      type.includes("dining") ||
      type.includes("cafe")
    );
  }, [hotel?.type]);

  const sections = useMemo(() => {
    const baseSections = [
      { id: "room-options", label: "Room Options" },
      { id: "about-hotel", label: "About Hotel" },
      { id: "amenities", label: "Amenities" },
    ];

    const optionalSections = [
      { id: "events", label: "Events" },
      ...(isRestaurant ? [{ id: "dining", label: "Food & Dining" }] : []),
      { id: "reviews", label: "Guest Reviews" },
      { id: "location", label: "Location" },
      { id: "policies", label: "Guest Policies" },
    ];

    return [...baseSections, ...optionalSections];
  }, [isRestaurant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            Property Not Found
          </p>
          <Button onClick={() => navigate("/hotels")} variant="outline">
            Back to Hotels
          </Button>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
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
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>
                  {hotel.location}, {hotel.city}
                </span>
                {hotel.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${hotel.coordinates.lat},${hotel.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-destructive font-medium hover:underline ml-2 transition-colors"
                  >
                    View Map
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => toast.success("Link copied to clipboard!")}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => toast.success("Added to favorites!")}
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[350px] md:h-[450px] mb-8 rounded-xl overflow-hidden shadow-md cursor-pointer">
            <div
              className="md:col-span-2 h-full bg-muted overflow-hidden"
              onClick={() => {
                setInitialGalleryIndex(0);
                setIsGalleryOpen(true);
              }}
            >
              <OptimizedImage
                src={topGridImages[0]?.url || ""}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="md:col-span-1 flex flex-col gap-2">
              <div
                className="h-1/2 bg-muted overflow-hidden"
                onClick={() => {
                  setInitialGalleryIndex(1);
                  setIsGalleryOpen(true);
                }}
              >
                <OptimizedImage
                  src={topGridImages[1]?.url || ""}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div
                className="h-1/2 bg-muted overflow-hidden"
                onClick={() => {
                  setInitialGalleryIndex(2);
                  setIsGalleryOpen(true);
                }}
              >
                <OptimizedImage
                  src={topGridImages[2]?.url || ""}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div
              className="md:col-span-1 bg-muted relative overflow-hidden"
              onClick={() => {
                setInitialGalleryIndex(3);
                setIsGalleryOpen(true);
              }}
            >
              <OptimizedImage
                src={topGridImages[3]?.url || ""}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {topGridImages.length > 4 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                  +{topGridImages.length - 4} More
                </div>
              )}
            </div>
          </div>

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
                <p className="text-muted-foreground leading-relaxed text-base">
                  {hotel.description}
                </p>
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

              {isRestaurant && (
                <section id="dining" className="scroll-mt-32 border-t pt-10">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                    Food & Dining
                  </h2>
                  <p className="text-muted-foreground italic">
                    Dining details coming soon...
                  </p>
                </section>
              )}

              <section id="reviews" className="scroll-mt-32 border-t pt-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                  Guest Reviews
                </h2>
                <p className="text-muted-foreground italic">
                  Guest reviews coming soon...
                </p>
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
                        <Info className="w-4 h-4" />
                        CHECK-IN / CHECK-OUT
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
                        <div className="flex justify-between md:justify-start md:gap-6">
                          <span className="font-medium text-foreground min-w-[100px]">
                            Minimum Age:
                          </span>
                          <span>18 years</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest">
                        <Info className="w-4 h-4" />
                        OTHER POLICIES
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        {policies?.policies?.map((p) => {
                          const parts = p.name.split(" ");
                          const label = parts[0];
                          const value =
                            parts.slice(1).join(" ") ||
                            (p.isActive ? "Allowed" : "Not Allowed");

                          return (
                            <div
                              key={p.id}
                              className="flex justify-between md:justify-start md:gap-6"
                            >
                              <span className="font-medium text-foreground min-w-[100px]">
                                {label}:
                              </span>
                              <span>{value}</span>
                            </div>
                          );
                        })}

                        <div className="flex flex-col gap-1 pt-2">
                          <span className="font-medium text-foreground">
                            Cancellation:
                          </span>
                          <span className="leading-relaxed">
                            {policies?.cancellationPolicy ||
                              "Non-refundable for promotional rates"}
                          </span>
                        </div>

                        {!policies?.policies?.some((p) =>
                          p.name.toLowerCase().includes("bed"),
                        ) && (
                          <div className="flex justify-between md:justify-start md:gap-6">
                            <span className="font-medium text-foreground min-w-[100px]">
                              Extra Bed:
                            </span>
                            <span>Not available</span>
                          </div>
                        )}
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
            if (roomSection) {
              const elementPosition = roomSection.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - 120;
              window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
          }}
        />
        <Footer />
      </div>
    </>
  );
}
