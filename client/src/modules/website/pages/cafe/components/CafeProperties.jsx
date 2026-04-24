import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Grid3x3,
  Map,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
// import { GetAllPropertyDetails } from "@/Api/Api";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import cafeParisian from "@assets/generated_images/parisian_style_cafe_interior.png";
import cafeMinimalist from "@assets/generated_images/modern_minimalist_coffee_shop.png";
import cafeGarden from "@assets/generated_images/garden_terrace_cafe.png";
import cafeLibrary from "@assets/generated_images/cozy_library_cafe.png";

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const getAmenityName = (amenity) =>
  typeof amenity === "string"
    ? amenity
    : amenity && typeof amenity === "object" && "name" in amenity
      ? amenity.name
      : null;

const isCafeType = (value) => normalize(value) === "cafe";

const isEmbedUrl = (url) =>
  String(url || "").startsWith("https://www.google.com/maps/embed");

const mapApiToCafeUI = (item) => {
  const parent = item?.propertyResponseDTO;
  const listing = item?.propertyListingResponseDTOS?.find((entry) => entry?.isActive);
  const amenities = Array.isArray(listing?.amenities)
    ? listing.amenities.map(getAmenityName).filter(Boolean)
    : [];
  const reservationAvailable = Boolean(
    parent?.dineIn || parent?.takeaway || parent?.bookingEngineUrl,
  );
  const highlightedAmenities = [];

  if (parent?.dineIn) highlightedAmenities.push("Dine In");
  if (parent?.takeaway) highlightedAmenities.push("Takeaway");
  highlightedAmenities.push(
    reservationAvailable ? "Reservation Available" : "Walk-in Only",
  );
  highlightedAmenities.push(...amenities.slice(0, 3));

  return {
    id: listing?.id ? `${parent?.id}-${listing.id}` : `property-${parent?.id}`,
    propertyId: parent?.id,
    name: parent?.propertyName || "Unnamed Cafe",
    dineIn: Boolean(parent?.dineIn),
    takeaway: Boolean(parent?.takeaway),
    city: parent?.locationName || listing?.city || "Unknown",
    location: listing?.fullAddress || parent?.address || "N/A",
    type: listing?.propertyType || parent?.propertyTypes?.[0] || "Cafe",
    serviceTag: parent?.dineIn
      ? "Dine In"
      : parent?.takeaway
        ? "Takeaway"
        : listing?.propertyCategoryName || "Cafe",
    reservationAvailable,
    image: {
      src: listing?.media?.[0]?.url || listing?.media?.[0] || "",
      alt: parent?.propertyName || "Cafe",
    },
    rating: listing?.rating || 0,
    description:
      listing?.mainHeading ||
      listing?.tagline ||
      listing?.subTitle ||
      "Cafe experience with signature beverages and relaxed hospitality.",
    cuisines: amenities.slice(0, 6),
    highlightedAmenities: highlightedAmenities.filter(Boolean),
    nearbyLocation:
      parent?.nearbyLocations?.[0]?.nearbyLocationName ||
      listing?.landmark ||
      parent?.locationName ||
      "Prime location",
    area: parent?.area || null,
    serviceHours: "Open Daily",
    googleMapLink: parent?.nearbyLocations?.[0]?.googleMapLink || parent?.addressUrl || "",
    isActive: parent?.isActive && (listing ? listing?.isActive : true),
  };
};

export const FALLBACK_CAFE_PROPERTIES = [
  {
    id: "fallback-cafe-ghaziabad",
    propertyId: 9001,
    name: "Kennedia Blu Cafe Ghaziabad",
    dineIn: true,
    takeaway: true,
    city: "Ghaziabad",
    location: "Raj Nagar District Centre, Ghaziabad",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: {
      src: cafeParisian,
      alt: "Kennedia Blu Cafe Ghaziabad",
    },
    rating: 4.8,
    description:
      "A refined neighbourhood cafe for slow mornings, crafted coffee, fresh bakes, and relaxed evening conversations.",
    cuisines: ["Specialty Coffee", "Artisan Bakery", "All Day Breakfast", "Desserts"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Wi-Fi"],
    nearbyLocation: "RDC Ghaziabad",
    area: "Raj Nagar",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Ghaziabad",
    isActive: true,
  },
  {
    id: "fallback-cafe-noida",
    propertyId: 9002,
    name: "Kennedia Blu Cafe Noida",
    dineIn: true,
    takeaway: true,
    city: "Noida",
    location: "Sector 18, Noida",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: {
      src: cafeMinimalist,
      alt: "Kennedia Blu Cafe Noida",
    },
    rating: 4.7,
    description:
      "A modern cafe space with clean interiors, single-origin brews, working lunches, and signature comfort plates.",
    cuisines: ["Single-Origin Coffee", "Continental", "Sandwiches", "Healthy Bowls"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Work Friendly"],
    nearbyLocation: "Sector 18 Metro",
    area: "Sector 18",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Noida",
    isActive: true,
  },
  {
    id: "fallback-cafe-delhi",
    propertyId: 9003,
    name: "Kennedia Blu Cafe Delhi",
    dineIn: true,
    takeaway: true,
    city: "Delhi",
    location: "Connaught Place, New Delhi",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: {
      src: cafeLibrary,
      alt: "Kennedia Blu Cafe Delhi",
    },
    rating: 4.9,
    description:
      "A calm city cafe with lounge seating, curated teas, handcrafted desserts, and a quiet premium setting.",
    cuisines: ["Coffee", "High Tea", "Desserts", "Light Meals"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Lounge Seating"],
    nearbyLocation: "Connaught Place",
    area: "CP",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Delhi",
    isActive: true,
  },
  {
    id: "fallback-cafe-bangalore",
    propertyId: 9004,
    name: "Kennedia Blu Cafe Bangalore",
    dineIn: true,
    takeaway: true,
    city: "Bangalore",
    location: "Indiranagar, Bangalore",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: {
      src: cafeGarden,
      alt: "Kennedia Blu Cafe Bangalore",
    },
    rating: 4.8,
    description:
      "A garden-inspired cafe for premium coffee, brunch plates, relaxed meetings, and evening desserts.",
    cuisines: ["Coffee", "Brunch", "Bakery", "Small Plates"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Outdoor Seating"],
    nearbyLocation: "Indiranagar",
    area: "Indiranagar",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Bangalore",
    isActive: true,
  },
];

export default function CafeProperties({ locationMatch, initialCafes }) {
  const navigate = useNavigate();
  // const ssrLoaded = Array.isArray(initialCafes) && initialCafes.length > 0;
  const [cafes, setCafes] = useState(FALLBACK_CAFE_PROPERTIES);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("gallery");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [locationBanner, setLocationBanner] = useState(null);

  /*
  // Uncomment this block, the GetAllPropertyDetails import, and ssrLoaded above
  // when cafe properties should load from the API again.
  useEffect(() => {
    if (ssrLoaded) {
      setCafes(initialCafes);
      setLoading(false);
      return;
    }

    const fetchCafes = async () => {
      try {
        setLoading(true);
        const response = await GetAllPropertyDetails();
        const rawData = response?.data?.data || response?.data || [];
        const mapped = Array.isArray(rawData)
          ? rawData
              .map((item) => mapApiToCafeUI(item))
              .filter((cafe) => cafe.isActive && isCafeType(cafe.type))
          : [];
        setCafes([...mapped].reverse());
      } catch (error) {
        console.error("Failed to load cafe properties", error);
        setCafes(FALLBACK_CAFE_PROPERTIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, [initialCafes, ssrLoaded]);
  */

  const cities = useMemo(
    () => ["All Cities", ...new Set(cafes.map((item) => item.city).filter(Boolean))],
    [cafes],
  );

  const filteredCafes = useMemo(
    () =>
      selectedCity === "All Cities"
        ? cafes
        : cafes.filter((item) => item.city === selectedCity),
    [cafes, selectedCity],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCity]);

  useEffect(() => {
    if (!locationMatch) return;

    if (locationMatch.found && locationMatch.city) {
      setSelectedCity(locationMatch.city);
      setLocationBanner("found");
      return;
    }

    setLocationBanner("not-found");
  }, [locationMatch]);

  useEffect(() => {
    if (viewMode !== "gallery" || isPaused || filteredCafes.length <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) =>
        prev === filteredCafes.length - 1 ? 0 : prev + 1,
      );
    }, 4500);

    return () => window.clearInterval(interval);
  }, [filteredCafes.length, isPaused, viewMode]);

  const activeCafe = filteredCafes[activeIndex] || filteredCafes[0];
  const activeMapIsEmbeddable = isEmbedUrl(activeCafe?.googleMapLink);

  const isFallbackCafe = (cafe) =>
    String(cafe?.id || "").startsWith("fallback-cafe-");

  const getCafeDetailUrl = (cafe) =>
    isFallbackCafe(cafe)
      ? "/cafe-page"
      :
    `/${createCitySlug(cafe.city || cafe.name)}/${createHotelSlug(
      cafe.name || cafe.city || "property",
      cafe.propertyId,
    )}`;

  const goToCafeDetails = (cafe) => navigate(getCafeDetailUrl(cafe));

  const handlePrev = () =>
    setActiveIndex((prev) =>
      prev === 0 ? filteredCafes.length - 1 : prev - 1,
    );

  const handleNext = () =>
    setActiveIndex((prev) =>
      prev === filteredCafes.length - 1 ? 0 : prev + 1,
    );

  const visibleCards =
    filteredCafes.length <= 1
      ? [{ index: 0, position: "center" }]
      : [
          {
            index: (activeIndex - 1 + filteredCafes.length) % filteredCafes.length,
            position: "left",
          },
          { index: activeIndex, position: "center" },
          {
            index: (activeIndex + 1) % filteredCafes.length,
            position: "right",
          },
        ];

  if (loading) {
    return (
      <div className="container mx-auto mb-12 px-4">
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          Loading cafes...
        </div>
      </div>
    );
  }

  if (!activeCafe) {
    return (
      <div className="container mx-auto mb-12 px-4">
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          No cafes available.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mb-12 px-4">
      <motion.div
        layout
        className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-border/10 bg-primary/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-medium text-foreground">
                Explore Our Cafes
              </h3>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Collection Showcase
              </p>
            </div>
          </div>

          {locationBanner === "found" && locationMatch && (
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold uppercase leading-none tracking-wider text-primary">
                  Near You
                </p>
                <p className="max-w-[160px] truncate text-[11px] leading-tight font-medium text-foreground">
                  {locationMatch.currentLocation?.city || locationMatch.city}
                </p>
              </div>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                {locationMatch.city}
              </span>
            </div>
          )}

          {locationBanner === "not-found" && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/20 px-3 py-1.5 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">No nearby property</span>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-border/10 pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowCityDropdown((prev) => !prev)}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs shadow-sm transition-colors hover:border-primary/50"
                  >
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="font-medium">{selectedCity}</span>
                    <ArrowRight
                      className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${
                        showCityDropdown ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {showCityDropdown && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowCityDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-secondary/50 ${
                            selectedCity === city ? "bg-secondary/30 font-semibold" : ""
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCity !== "All Cities" && (
                  <button
                    onClick={() => setSelectedCity("All Cities")}
                    className="flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <Building2 className="h-3 w-3" />
                  Cafe
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
                  <Star className="h-3 w-3 fill-current text-primary" />
                  <span className="font-semibold text-foreground">
                    {filteredCafes.length} Cafes
                  </span>
                </span>
              </div>

              <div className="inline-flex w-fit items-center gap-0.5 rounded-full border border-border bg-background p-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode("gallery")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    viewMode === "gallery"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3x3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Gallery</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    viewMode === "map"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Map className="h-3 w-3" />
                  <span className="hidden sm:inline">Map</span>
                </button>
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
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[60%_40%]">
                  <div
                    className="relative h-[500px] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-secondary/20 shadow-xl"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center perspective-[1200px]">
                      {visibleCards.map(({ index, position }) => {
                        const cafe = filteredCafes[index];
                        const isCenter = position === "center";
                        const isLeft = position === "left";

                        return (
                          <div
                            key={cafe.id}
                            className="absolute transition-all duration-700 ease-out"
                            style={{
                              zIndex: isCenter ? 30 : 20,
                              opacity: isCenter ? 1 : 0.55,
                              transform: isCenter
                                ? "translateX(0) rotateY(0deg)"
                                : isLeft
                                  ? "translateX(-90%) rotateY(30deg)"
                                  : "translateX(90%) rotateY(-30deg)",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div className="h-[380px] w-[340px] max-w-[80vw] overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl">
                              <div className="relative h-full">
                                <OptimizedImage
                                  {...cafe.image}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {isCenter && (
                                  <>
                                    <div className="absolute left-4 top-4">
                                      <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                                        <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                                        <span className="text-xs font-bold text-gray-900">
                                          {cafe.rating || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                      <div className="mb-1.5 inline-block rounded border border-white/30 bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                        {cafe.type}
                                      </div>
                                      <h3 className="mb-1 text-lg font-serif font-semibold">
                                        {cafe.name}
                                      </h3>
                                      <div className="mb-1.5 flex items-center text-xs opacity-90">
                                        <MapPin className="mr-1 h-3 w-3" />
                                        {cafe.location}
                                      </div>
                                      <p className="line-clamp-2 text-[11px] leading-relaxed opacity-80">
                                        {cafe.description}
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

                    <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3">
                      <button
                        onClick={handlePrev}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-lg transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="rounded-full border border-border bg-background/90 px-3 py-1 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-foreground">
                          {activeIndex + 1} / {filteredCafes.length}
                        </span>
                      </div>
                      <button
                        onClick={handleNext}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-lg transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex h-[500px] flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xl">
                    <div className="space-y-3.5 overflow-y-auto">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {activeCafe.type}
                          </span>
                          <div className="flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1">
                            <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-900">
                              {activeCafe.rating || "N/A"}
                            </span>
                          </div>
                        </div>
                        <h3 className="mb-1.5 line-clamp-2 text-xl font-serif font-semibold text-foreground">
                          {activeCafe.name}
                        </h3>
                        <div className="mb-2.5 flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1.5 h-3.5 w-3.5" />
                          <span className="line-clamp-1">{activeCafe.location}</span>
                        </div>
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {activeCafe.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pb-1">
                        <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                          <MapPin className="mx-auto mb-1 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">City</p>
                          <p className="text-xs font-bold text-foreground">
                            {activeCafe.city}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                          <Map className="mx-auto mb-1 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">Area</p>
                          <p className="text-xs font-bold text-foreground">
                            {activeCafe.area || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                          <CalendarClock className="mx-auto mb-1 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">Rating</p>
                          <p className="text-xs font-bold text-foreground">
                            {activeCafe.rating || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                          Available Highlights
                        </h4>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {activeCafe.dineIn && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                              <Building2 className="h-3 w-3" />
                              Dine In
                            </span>
                          )}
                          {activeCafe.takeaway && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                              Takeaway
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              activeCafe.reservationAvailable
                                ? "border-sky-200 bg-sky-50 text-sky-700"
                                : "border-zinc-200 bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {activeCafe.reservationAvailable
                              ? "Reservation Available"
                              : "Walk-in Only"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {(activeCafe.cuisines.length > 0
                            ? activeCafe.cuisines
                            : ["Specialty Beverages", "Prime Location"]
                          ).map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                              <span className="line-clamp-1">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <Button
                        onClick={() => goToCafeDetails(activeCafe)}
                        className="w-full gap-2 py-3 text-sm font-bold uppercase"
                      >
                        Explore Cafe <ArrowRight className="h-4 w-4" />
                      </Button>
                      <button
                        onClick={() => goToCafeDetails(activeCafe)}
                        className="w-full py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        View Details -&gt;
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
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                  <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-xl">
                    <div className="group relative h-[240px] overflow-hidden">
                      <OptimizedImage
                        {...activeCafe.image}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-lg backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                          <span className="text-xs font-bold text-gray-900">
                            {activeCafe.rating || "N/A"}
                          </span>
                        </div>
                        <div className="rounded-full bg-primary/95 px-2.5 py-1 shadow-lg backdrop-blur-sm">
                          <span className="text-[10px] font-bold text-primary-foreground">
                            {activeIndex + 1} / {filteredCafes.length}
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="mb-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-white/90" />
                          <span className="text-xs opacity-90">
                            {activeCafe.location}
                          </span>
                        </div>
                        <h3 className="mb-1 text-xl font-serif font-bold">
                          {activeCafe.name}
                        </h3>
                        <p className="line-clamp-2 text-xs opacity-80">
                          {activeCafe.description}
                        </p>
                      </div>
                      <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-all hover:scale-110 hover:bg-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-all hover:scale-110 hover:bg-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="mb-4 grid grid-cols-3 gap-3 border-b border-border pb-4">
                        <div className="text-center">
                          <MapPin className="mx-auto mb-0.5 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">City</p>
                          <p className="text-xs font-bold text-foreground">
                            {activeCafe.city}
                          </p>
                        </div>
                        <div className="text-center">
                          <Map className="mx-auto mb-0.5 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">Area</p>
                          <p className="text-xs font-bold text-foreground">
                            {activeCafe.area || "N/A"}
                          </p>
                        </div>
                        <div className="text-center">
                          <Star className="mx-auto mb-0.5 h-4 w-4 fill-current text-primary" />
                          <p className="text-[10px] text-muted-foreground">Rating</p>
                          <p className="text-xs font-bold text-foreground">
                            {activeCafe.rating || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="mb-2 text-xs font-bold text-foreground">
                          Top Highlights
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeCafe.highlightedAmenities?.length > 0
                            ? activeCafe.highlightedAmenities
                            : ["Cafe Seating", "Walk-in Friendly"]
                          ).map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-foreground"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3 rounded-lg border-b border-border bg-muted/20 p-2.5 pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-foreground">
                              Nearby Landmark
                            </p>
                            <p className="text-[8px] text-muted-foreground">
                              Cafe response detail
                            </p>
                          </div>
                          <p className="text-sm font-bold text-primary">
                            {activeCafe.nearbyLocation}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => goToCafeDetails(activeCafe)}
                          className="w-full gap-1.5 text-sm font-bold"
                        >
                          Explore Now <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        <button
                          onClick={() => goToCafeDetails(activeCafe)}
                          className="w-full py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          View Details -&gt;
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:sticky lg:top-6">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl">
                      {activeMapIsEmbeddable ? (
                        <iframe
                          key={activeCafe.googleMapLink}
                          src={activeCafe.googleMapLink}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-lg">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-serif font-semibold text-foreground">
                              {activeCafe.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activeCafe.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Map preview is available only for Google embed links.
                            </p>
                          </div>
                          {activeCafe.googleMapLink ? (
                            <a
                              href={activeCafe.googleMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                              Open in Google Maps
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">
                              Google map link not available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
