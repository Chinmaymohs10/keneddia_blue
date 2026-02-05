import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  ArrowRight,
  MapPin,
  Star,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Wifi,
  Grid3x3,
  Map,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GetAllPropertyListing, getPropertyListingMedia } from "@/Api/Api";

// Custom CSS for Leaflet popups
const customPopupStyles = `
  .leaflet-popup-content-wrapper {
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  .leaflet-popup-content {
    margin: 8px;
    min-width: 200px;
  }
  .leaflet-popup-tip {
    display: none;
  }
  .custom-popup .leaflet-popup-close-button {
    display: none;
  }
`;

const mapApiHotelToUI = (hotel: any, media: any[]) => {
  const basePrice = hotel.price || 0;
  const discount = hotel.discountAmount || 0;
  const gstPercent = hotel.gstPercentage || 0;

  const discountPercent =
    basePrice > 0 ? Math.round((discount / basePrice) * 100) : 0;

  return {
    id: hotel.id || "N/A",
    name: hotel.propertyName || hotel.mainHeading || "N/A",
    location: hotel.fullAddress || "N/A",
    city: hotel.city || "N/A",
    type: hotel.propertyType || "Hotel",

    image: {
      src: media?.[0]?.url || "",
      alt: hotel.propertyName || "Hotel Image",
    },

    rating: hotel.rating || "N/A",
    reviews: 0,
    description: hotel.tagline || hotel.subTitle || "N/A",
    amenities:
      hotel.amenities && hotel.amenities.length > 0 ? hotel.amenities : ["N/A"],

    rooms: hotel.capacity || "N/A",
    capacity: hotel.capacity || "N/A",

    pricing: {
      basePrice,
      discount,
      discountPercent,
      discountLabel: discount > 0 ? "Discount" : "Standard Price",
      gstPercent,
    },

    checkIn: "2:00 PM",
    checkOut: "11:00 AM",

    coordinates: {
      lat: hotel.latitude || 20.5937,
      lng: hotel.longitude || 78.9629,
    },
  };
};

// Inject custom styles
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = customPopupStyles;
  if (!document.querySelector("style[data-leaflet-custom]")) {
    styleEl.setAttribute("data-leaflet-custom", "true");
    document.head.appendChild(styleEl);
  }
}

const cities = [
  "All Cities",
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Kolkata",
  "Hyderabad",
  "Chennai",
];

// Helper function to calculate prices
const calculatePricing = (pricing: any) => {
  const subtotal = (pricing.basePrice || 0) - (pricing.discount || 0);
  const gst = Math.round(subtotal * ((pricing.gstPercent || 0) / 100));
  const total = subtotal + gst;

  return {
    basePrice: pricing.basePrice || 0,
    discount: pricing.discount || 0,
    subtotal,
    gst,
    total,
  };
};

// Price Breakdown Component with Toggle
function PriceBreakdown({
  pricing,
  calculated,
}: {
  pricing: any;
  calculated: ReturnType<typeof calculatePricing>;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="py-2.5 border-y border-border">
      {!showDetails ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pricing
              </span>
            </div>
            <button
              onClick={() => setShowDetails(true)}
              className="text-[9px] text-primary hover:underline font-medium"
            >
              View Breakdown
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground line-through">
                ₹{calculated.basePrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                {pricing.discountPercent}% OFF
              </span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">
                ₹{calculated.total.toLocaleString("en-IN")}
              </p>
              <p className="text-[8px] text-muted-foreground">
                per night (incl. taxes)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                Price Breakdown
              </span>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-[9px] text-primary hover:underline font-medium"
            >
              Hide Details
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Base Price</span>
            <span className="font-medium">
              ₹{calculated.basePrice.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              {pricing.discountLabel}
              <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                {pricing.discountPercent}%
              </span>
            </span>
            <span className="font-medium text-green-600">
              - ₹{calculated.discount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/50">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              ₹{calculated.subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">
              GST ({pricing.gstPercent}%)
            </span>
            <span className="font-medium">
              ₹{calculated.gst.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-border bg-primary/5 -mx-2 px-2 py-1.5 rounded-lg mt-1.5">
            <div>
              <p className="text-[10px] font-bold text-foreground">
                Total Amount
              </p>
              <p className="text-[8px] text-muted-foreground">
                per night (all taxes incl.)
              </p>
            </div>
            <p className="text-xl font-bold text-primary">
              ₹{calculated.total.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Map controller component
function MapViewController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 2.0,
      easeLinearity: 0.1,
    });
  }, [center, zoom, map]);

  return null;
}

export default function HotelCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"gallery" | "map">("gallery");
  const [isPaused, setIsPaused] = useState(false);
  const [cities, setCities] = useState<string[]>(["All Cities"]);

  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [checkInDate] = useState("");
  const [checkOutDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [hotels, setHotels] = useState<any[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const res = await GetAllPropertyListing();
        const list = res.data || res;

        if (!Array.isArray(list)) return;

        // 1. Filter only type "Hotel" and active status
        const hotelList = list.filter(
          (h) => h.isActive && h.propertyType?.toLowerCase() === "hotel",
        );

        // 2. Fetch media ONLY for those filtered hotels
        const mappedHotels = await Promise.all(
          hotelList.map(async (hotel) => {
            try {
              const mediaRes = await getPropertyListingMedia(hotel.id);
              const media = mediaRes.data || mediaRes || [];
              return mapApiHotelToUI(hotel, media);
            } catch {
              return mapApiHotelToUI(hotel, []);
            }
          }),
        );
        const uniqueCities = Array.from(
          new Set(mappedHotels.map((h) => h.city).filter(Boolean)),
        );

        // Optional: sort alphabetically
        uniqueCities.sort((a, b) => a.localeCompare(b));

        // prepend "All Cities"
        setCities(["All Cities", ...uniqueCities]);

        setHotels(mappedHotels);
        setFilteredHotels(mappedHotels);
      } catch (err) {
        console.error("Failed to load hotels", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const getCitySlug = (city: string) => city.toLowerCase().replace(/\s+/g, "-");

  const getHotelDetailUrl = (hotel: any) =>
    `/hotels/${getCitySlug(hotel.city)}/${hotel.id}`;

  useEffect(() => {
    if (viewMode !== "gallery" || isPaused || filteredHotels.length <= 1)
      return;

    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev === filteredHotels.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [viewMode, isPaused, filteredHotels.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filteredHotels]);

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? filteredHotels.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === filteredHotels.length - 1 ? 0 : prev + 1,
    );
  };

  useEffect(() => {
    if (selectedCity === "All Cities") {
      setFilteredHotels(hotels);
    } else {
      setFilteredHotels(hotels.filter((hotel) => hotel.city === selectedCity));
    }
  }, [selectedCity, hotels]);

  if (loading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading hotels…
          </div>
        </div>
      </section>
    );
  }

  if (filteredHotels.length === 0) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No hotels available.
          </div>
        </div>
      </section>
    );
  }

  const activeHotel = filteredHotels[activeIndex];
  const activePricing = calculatePricing(activeHotel.pricing);

  const getVisibleCards = () => {
    const total = filteredHotels.length;
    if (total === 1) return [{ index: 0, position: "center" }];
    return [
      { index: (activeIndex - 1 + total) % total, position: "left" },
      { index: activeIndex, position: "center" },
      { index: (activeIndex + 1) % total, position: "right" },
    ];
  };

  const visibleCards = getVisibleCards();

  const createRedIcon = (isActive: boolean = false) => {
    return new L.Icon({
      iconUrl: isActive
        ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
        : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: isActive ? [35, 57] : [25, 41],
      iconAnchor: isActive ? [17, 57] : [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  return (
    <section className="py-6 bg-gradient-to-br from-background via-secondary/5 to-background relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                  {viewMode === "gallery" ? "Premium Selection" : "Discover"}
                </span>
                <h2 className="text-xl md:text-2xl font-serif text-foreground">
                  Our Collection
                </h2>
              </div>

              <div className="inline-flex items-center gap-0.5 bg-background border border-border rounded-full p-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode("gallery")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    viewMode === "gallery"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3x3 className="w-3 h-3" />
                  <span className="hidden sm:inline">Gallery</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    viewMode === "map"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Map className="w-3 h-3" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Filter By:
              </span>

              <div className="relative">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full outline-none hover:border-primary/50 transition-colors text-xs shadow-sm"
                >
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="font-medium">{selectedCity}</span>
                  <ArrowRight
                    className={`w-2.5 h-2.5 text-muted-foreground transition-transform ${showCityDropdown ? "rotate-90" : ""}`}
                  />
                </button>
                {showCityDropdown && (
                  <div className="absolute top-full mt-1 left-0 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowCityDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-secondary/50 transition-colors ${
                          selectedCity === city
                            ? "bg-secondary/30 font-semibold"
                            : ""
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full outline-none hover:border-primary/50 transition-colors text-xs shadow-sm">
                <Building2 className="w-3 h-3 text-primary" />
                <span className="font-medium">Hotel</span>
              </button>

              <div className="flex-1" />

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs">
                <Star className="w-3 h-3 text-primary fill-current" />
                <span className="font-semibold text-foreground">
                  {filteredHotels.length} Properties
                </span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "gallery" ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 items-start">
                <div
                  className="relative h-[500px] flex items-center justify-center px-12"
                  style={{ perspective: "1000px" }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {visibleCards.map(({ index, position }) => {
                      const hotel = filteredHotels[index];
                      const isCenter = position === "center";
                      const isLeft = position === "left";

                      return (
                        <div
                          key={hotel.id}
                          className={`absolute transition-all duration-700 ease-out ${
                            isCenter
                              ? "z-30 scale-100 opacity-100"
                              : "z-10 scale-65 opacity-35"
                          }`}
                          style={{
                            transform: isCenter
                              ? "translateX(0) rotateY(0deg)"
                              : isLeft
                                ? "translateX(-90%) rotateY(30deg)"
                                : "translateX(90%) rotateY(-30deg)",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <div className="w-[340px] max-w-[80vw] h-[380px] bg-card border-2 border-border rounded-2xl overflow-hidden shadow-2xl">
                            <div className="relative h-full">
                              <OptimizedImage
                                {...hotel.image}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                              {isCenter && (
                                <>
                                  <div className="absolute top-4 left-4">
                                    <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                      <span className="text-xs font-bold text-gray-900">
                                        {hotel.rating}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                    <div className="inline-block px-2.5 py-0.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm rounded border border-white/30">
                                      {hotel.type}
                                    </div>
                                    <h3 className="text-lg font-serif font-semibold mb-1">
                                      {hotel.name}
                                    </h3>
                                    <div className="flex items-center text-xs opacity-90 mb-1.5">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {hotel.location}
                                    </div>
                                    <p className="text-[11px] opacity-80 line-clamp-2 leading-relaxed">
                                      {hotel.description}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">
                    <button
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg hover:scale-110 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full border border-border">
                      <span className="text-xs font-semibold text-foreground">
                        {activeIndex + 1} / {filteredHotels.length}
                      </span>
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg hover:scale-110 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 shadow-xl h-[500px] flex flex-col justify-between">
                  <div className="space-y-3.5 overflow-y-auto">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20">
                          {activeHotel.type}
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                          <span className="text-xs font-bold text-yellow-900">
                            {activeHotel.rating}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-serif font-semibold text-foreground mb-1.5 line-clamp-2">
                        {activeHotel.name}
                      </h3>
                      <div className="flex items-center text-muted-foreground mb-2.5 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1.5" />
                        <span className="line-clamp-1">
                          {activeHotel.location}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {activeHotel.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                        Featured Amenities
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {activeHotel.amenities.map(
                          (amenity: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                              <span className="line-clamp-1">{amenity}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <PriceBreakdown
                      pricing={activeHotel.pricing}
                      calculated={activePricing}
                    />
                  </div>

                  <div className="space-y-2.5 mt-4">
                    <button
                      onClick={() => navigate(getHotelDetailUrl(activeHotel))}
                      className="w-full py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm"
                    >
                      Book Room
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/hotels/${activeHotel.city}`, {
                          state: {
                            hotelId: activeHotel.id,
                            city: activeHotel.city,
                          },
                        })
                      }
                      className="w-full py-2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      View Full Details →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div
                  className="relative"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-[240px] overflow-hidden group">
                      <OptimizedImage
                        {...activeHotel.image}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                          <span className="text-xs font-bold text-gray-900">
                            {activeHotel.rating}
                          </span>
                        </div>
                        <div className="bg-primary/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                          <span className="text-[10px] font-bold text-primary-foreground">
                            {activeIndex + 1} / {filteredHotels.length}
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-white/90" />
                          <span className="text-xs opacity-90">
                            {activeHotel.location}
                          </span>
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-1">
                          {activeHotel.name}
                        </h3>
                        <p className="text-xs opacity-80 line-clamp-2">
                          {activeHotel.description}
                        </p>
                      </div>
                      <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border">
                        <div className="text-center">
                          <Home className="w-4 h-4 text-primary mx-auto mb-0.5" />
                          <p className="text-[10px] text-muted-foreground">
                            Rooms
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeHotel.rooms}
                          </p>
                        </div>
                        <div className="text-center">
                          <Users className="w-4 h-4 text-primary mx-auto mb-0.5" />
                          <p className="text-[10px] text-muted-foreground">
                            Capacity
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeHotel.capacity}
                          </p>
                        </div>
                        <div className="text-center">
                          <Wifi className="w-4 h-4 text-primary mx-auto mb-0.5" />
                          <p className="text-[10px] text-muted-foreground">
                            Amenities
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeHotel.amenities.length}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-foreground mb-2">
                          Top Amenities
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {activeHotel.amenities
                            .slice(0, 6)
                            .map((amenity: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-secondary/50 rounded-full text-[10px] font-medium text-foreground"
                              >
                                {amenity}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="mb-3 pb-3 border-b border-border bg-muted/20 rounded-lg p-2.5">
                        <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                          <div>
                            <p className="text-[10px] font-bold text-foreground">
                              Total
                            </p>
                            <p className="text-[8px] text-muted-foreground">
                              per night
                            </p>
                          </div>
                          <p className="text-lg font-bold text-primary">
                            ₹{activePricing.total.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(getHotelDetailUrl(activeHotel))}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg text-sm"
                      >
                        Book Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:sticky lg:top-6">
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-card">
                    <MapContainer
                      center={[
                        activeHotel.coordinates.lat,
                        activeHotel.coordinates.lng,
                      ]}
                      zoom={12}
                      scrollWheelZoom={true}
                      className="w-full h-full"
                      style={{ zIndex: 1 }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapViewController
                        center={[
                          activeHotel.coordinates.lat,
                          activeHotel.coordinates.lng,
                        ]}
                        zoom={12}
                      />
                      {filteredHotels.map((hotel, idx) => {
                        const isActive = idx === activeIndex;
                        const markerIcon = createRedIcon(isActive);
                        const hotelPricing = calculatePricing(hotel.pricing);

                        return (
                          <Marker
                            key={hotel.id}
                            position={[
                              hotel.coordinates.lat,
                              hotel.coordinates.lng,
                            ]}
                            icon={markerIcon}
                            eventHandlers={{
                              click: () => setActiveIndex(idx),
                            }}
                          >
                            <Popup closeButton={false} className="custom-popup">
                              <div className="space-y-2 min-w-[200px]">
                                <div className="flex items-center justify-between">
                                  <p className="font-serif text-sm font-bold">
                                    {hotel.name}
                                  </p>
                                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs font-bold">
                                      {hotel.rating}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3 mr-1 text-red-500" />
                                  <span className="line-clamp-1">
                                    {hotel.location}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t">
                                  <span className="text-[9px] font-bold">
                                    Total (incl. GST)
                                  </span>
                                  <span className="text-sm font-bold text-primary">
                                    ₹
                                    {hotelPricing.total.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    navigate(getHotelDetailUrl(hotel))
                                  }
                                  className="w-full text-xs bg-primary text-primary-foreground font-bold py-2 rounded"
                                >
                                  View Details
                                </button>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
