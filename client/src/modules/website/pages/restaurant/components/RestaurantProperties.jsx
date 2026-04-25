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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { GetAllPropertyDetails } from "@/Api/Api";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import RestaurantReserveDialog from "./RestaurantReserveDialog";

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
const getAmenityName = (amenity) =>
  typeof amenity === "string"
    ? amenity
    : amenity &&
        typeof amenity === "object" &&
        "name" in amenity &&
        typeof amenity.name === "string"
      ? amenity.name
      : null;
const isRestaurantType = (value) =>
  ["restaurant", "resturant"].includes(normalize(value));
const isEmbedUrl = (url) =>
  String(url || "").startsWith("https://www.google.com/maps/embed");

const mapApiToRestaurantUI = (item) => {
  const parent = item?.propertyResponseDTO;
  const listing = item?.propertyListingResponseDTOS?.find(
    (entry) => entry?.isActive,
  );
  const amenities = Array.isArray(listing?.amenities)
    ? listing.amenities.map((a) => getAmenityName(a)).filter(Boolean)
    : [];
  const hasServiceAvailability = Boolean(
    parent?.dineIn || parent?.takeaway || parent?.bookingEngineUrl,
  );
  const highlightedAmenities = [];
  if (parent?.dineIn) highlightedAmenities.push("Dining");
  if (parent?.takeaway) highlightedAmenities.push("Takeaway");
  highlightedAmenities.push(
    hasServiceAvailability ? "Reservation Available" : "Walk-in Only",
  );
  return {
    id: listing?.id ? `${parent?.id}-${listing.id}` : `property-${parent?.id}`,
    propertyId: parent?.id,
    name: parent?.propertyName || "Unnamed Restaurant",
    dineIn: Boolean(parent?.dineIn),
    takeaway: Boolean(parent?.takeaway),
    city: parent?.locationName || listing?.city || "Unknown",
    location: listing?.fullAddress || parent?.address || "N/A",
    type: listing?.propertyType || parent?.propertyTypes?.[0] || "Restaurant",
    serviceTag: parent?.dineIn
      ? "Dining"
      : listing?.propertyCategoryName || "Dining",
    reservationAvailable: hasServiceAvailability,
    image: {
      src: listing?.media?.[0]?.url || listing?.media?.[0] || "",
      alt: parent?.propertyName || "Restaurant",
    },
    rating: listing?.rating || 0,
    description:
      listing?.mainHeading ||
      listing?.tagline ||
      listing?.subTitle ||
      "Curated dining experience with signature hospitality.",
    cuisines: amenities.slice(0, 6),
    highlightedAmenities: highlightedAmenities.filter(Boolean),
    nearbyLocation:
      parent?.nearbyLocations?.[0]?.nearbyLocationName ||
      listing?.landmark ||
      parent?.locationName ||
      "Prime location",
    area: parent?.area || null,
    serviceHours: "Open Daily",
    googleMapLink:
      parent?.nearbyLocations?.[0]?.googleMapLink || parent?.addressUrl || "",
    isActive: parent?.isActive && (listing ? listing?.isActive : true),
  };
};

export default function RestaurantProperties({ initialRestaurants }) {
  const navigate = useNavigate();
  const ssrLoaded =
    Array.isArray(initialRestaurants) && initialRestaurants.length > 0;
  const [restaurants, setRestaurants] = useState(
      ssrLoaded ? initialRestaurants : [],
    ),
    [loading, setLoading] = useState(!ssrLoaded),
    [activeIndex, setActiveIndex] = useState(0),
    [viewMode, setViewMode] = useState("gallery"),
    [selectedCity, setSelectedCity] = useState("All Cities"),
    [showCityDropdown, setShowCityDropdown] = useState(false),
    [isPaused, setIsPaused] = useState(false),
    [selectedRestaurant, setSelectedRestaurant] = useState(null);
  useEffect(() => {
    if (ssrLoaded) return;
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await GetAllPropertyDetails();
        const rawData = response?.data?.data || response?.data || [];
        const mapped = Array.isArray(rawData)
          ? rawData
              .map((item) => mapApiToRestaurantUI(item))
              .filter((r) => r.isActive && isRestaurantType(r.type))
          : [];
        setRestaurants([...mapped].reverse());
      } catch (error) {
        console.error("Failed to load restaurant properties", error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);
  const cities = useMemo(
    () => [
      "All Cities",
      ...new Set(restaurants.map((item) => item.city).filter(Boolean)),
    ],
    [restaurants],
  );
  const filteredRestaurants = useMemo(
    () =>
      selectedCity === "All Cities"
        ? restaurants
        : restaurants.filter((item) => item.city === selectedCity),
    [restaurants, selectedCity],
  );
  useEffect(() => setActiveIndex(0), [selectedCity]);
  useEffect(() => {
    if (viewMode !== "gallery" || isPaused || filteredRestaurants.length <= 1)
      return undefined;
    const interval = window.setInterval(
      () =>
        setActiveIndex((prev) =>
          prev === filteredRestaurants.length - 1 ? 0 : prev + 1,
        ),
      4500,
    );
    return () => window.clearInterval(interval);
  }, [filteredRestaurants.length, isPaused, viewMode]);
  const activeRestaurant =
    filteredRestaurants[activeIndex] || filteredRestaurants[0];
  const activeMapIsEmbeddable = isEmbedUrl(activeRestaurant?.googleMapLink);
  const getRestaurantDetailUrl = (restaurant) =>
    `/${createCitySlug(restaurant.city || restaurant.name)}/${createHotelSlug(restaurant.name || restaurant.city || "property", restaurant.propertyId)}`;
  const goToRestaurantDetails = (restaurant) =>
    navigate(getRestaurantDetailUrl(restaurant));
  const handlePrev = () =>
    setActiveIndex((prev) =>
      prev === 0 ? filteredRestaurants.length - 1 : prev - 1,
    );
  const handleNext = () =>
    setActiveIndex((prev) =>
      prev === filteredRestaurants.length - 1 ? 0 : prev + 1,
    );
  const visibleCards =
    filteredRestaurants.length <= 1
      ? [{ index: 0, position: "center" }]
      : [
          {
            index:
              (activeIndex - 1 + filteredRestaurants.length) %
              filteredRestaurants.length,
            position: "left",
          },
          { index: activeIndex, position: "center" },
          {
            index: (activeIndex + 1) % filteredRestaurants.length,
            position: "right",
          },
        ];
  if (loading)
    return (
      <div className="container mx-auto mb-12 px-4">
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          Loading restaurants...
        </div>
      </div>
    );
  if (!activeRestaurant)
    return (
      <div className="container mx-auto mb-12 px-4">
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          No restaurants available.
        </div>
      </div>
    );
  return (
    <div className="container mx-auto mb-12 px-4">
      <RestaurantReserveDialog
        open={Boolean(selectedRestaurant)}
        onOpenChange={(open) => {
          if (!open) setSelectedRestaurant(null);
        }}
        property={
          selectedRestaurant
            ? {
                id: selectedRestaurant.propertyId,
                propertyName: selectedRestaurant.name,
              }
            : null
        }
      />

      <motion.div
        layout
        className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl backdrop-blur-md"
      >
        <div className="border-b border-border/10 bg-primary/5 p-3 min-[380px]:p-4 sm:p-6">
          <div className="flex items-start gap-2.5 min-[380px]:gap-3 sm:items-center sm:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg min-[380px]:h-10 min-[380px]:w-10">
              <Search className="h-4 w-4 min-[380px]:h-5 min-[380px]:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-serif font-medium text-foreground min-[380px]:text-lg sm:text-xl">
                Explore Our Restaurants
              </h3>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground min-[380px]:text-[10px] sm:text-xs">
                Collection Showcase
              </p>
            </div>
          </div>
        </div>
        <div className="p-3 min-[380px]:p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-border/10 pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowCityDropdown((prev) => !prev)}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs shadow-sm transition-colors hover:border-primary/50 cursor-pointer"
                  >
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="font-medium">{selectedCity}</span>
                    <ArrowRight
                      className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${showCityDropdown ? "rotate-90" : ""}`}
                    />
                  </button>
                  {showCityDropdown && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-44 max-w-[calc(100vw-3rem)] overflow-hidden rounded-lg border border-border bg-card shadow-xl sm:w-48 cursor-pointer">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowCityDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-secondary/50 cursor-pointer ${selectedCity === city ? "bg-secondary/30 font-semibold" : ""}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <Building2 className="h-3 w-3" />
                  Restaurant
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
                  <Star className="h-3 w-3 fill-current text-primary" />
                  <span className="font-semibold text-foreground">
                    {filteredRestaurants.length} Restaurants
                  </span>
                </span>
              </div>
              <div className="inline-flex w-full items-center gap-0.5 rounded-full border border-border bg-background p-0.5 shadow-sm sm:w-fit">
                <button
                  onClick={() => setViewMode("gallery")}
                  className={`flex flex-1 items-center cursor-pointer justify-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all min-[380px]:gap-1.5 min-[380px]:px-4 sm:flex-none ${viewMode === "gallery" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid3x3 className="h-3 w-3 " />
                  <span>Gallery</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex flex-1 items-center cursor-pointer justify-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all min-[380px]:gap-1.5 min-[380px]:px-4 sm:flex-none ${viewMode === "map" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Map className="h-3 w-3" />
                  <span>Map</span>
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
                    className="relative h-[300px] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-secondary/20 shadow-xl min-[380px]:h-[340px] sm:h-[420px] lg:h-[500px]"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center perspective-[1200px]">
                      {visibleCards.map(({ index, position }) => {
                        const restaurant = filteredRestaurants[index];
                        const isCenter = position === "center";
                        const isLeft = position === "left";
                        return (
                          <div
                            key={restaurant.id}
                            className={`absolute transition-all duration-700 ease-out ${isCenter ? "" : "hidden sm:block"}`}
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
                            <div className="h-[250px] w-[220px] max-w-[78vw] overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl min-[380px]:h-[290px] min-[380px]:w-[250px] min-[430px]:w-[270px] sm:h-[340px] sm:w-[300px] lg:h-[380px] lg:w-[340px]">
                              <div className="relative h-full">
                                <OptimizedImage
                                  {...restaurant.image}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                {isCenter && (
                                  <>
                                    <div className="absolute left-2.5 top-2.5 min-[380px]:left-3 min-[380px]:top-3 sm:left-4 sm:top-4">
                                      <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-lg backdrop-blur-sm min-[380px]:gap-1.5 min-[380px]:px-2.5 sm:px-3 sm:py-1.5">
                                        <Star className="h-3 w-3 fill-current text-yellow-500 min-[380px]:h-3.5 min-[380px]:w-3.5" />
                                        <span className="text-[11px] font-bold text-gray-900 min-[380px]:text-xs">
                                          {restaurant.rating || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white min-[380px]:p-4 sm:p-5">
                                      <div className="mb-1 inline-block rounded border border-white/30 bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm min-[380px]:mb-1.5 min-[380px]:px-2.5 min-[380px]:text-[10px]">
                                        {restaurant.type}
                                      </div>
                                      <h3 className="mb-1 line-clamp-2 text-sm font-serif font-semibold min-[380px]:text-base sm:text-lg">
                                        {restaurant.name}
                                      </h3>
                                      <div className="mb-1 flex items-center text-[11px] opacity-90 min-[380px]:mb-1.5 min-[380px]:text-xs">
                                        <MapPin className="mr-1 h-3 w-3 shrink-0" />
                                        <span className="line-clamp-1">
                                          {restaurant.location}
                                        </span>
                                      </div>
                                      <p className="line-clamp-2 text-[10px] leading-relaxed opacity-80 min-[380px]:text-[11px]">
                                        {restaurant.description}
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
                    <div className="absolute bottom-3 left-1/2 z-40 flex w-[calc(100%-1rem)] max-w-[240px] -translate-x-1/2 items-center justify-center gap-1.5 min-[380px]:bottom-4 min-[380px]:max-w-[280px] min-[380px]:gap-2 sm:w-[calc(100%-2rem)] sm:max-w-fit sm:gap-3">
                      <button
                        onClick={handlePrev}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-lg transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95 min-[380px]:h-9 min-[380px]:w-9 sm:h-10 sm:w-10 cursor-pointer"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4" />
                      </button>
                      <div className="rounded-full border border-border bg-background/90 px-2.5 py-1 backdrop-blur-sm min-[380px]:px-3">
                        <span className="text-[11px] font-semibold text-foreground min-[380px]:text-xs">
                          {activeIndex + 1} / {filteredRestaurants.length}
                        </span>
                      </div>
                      <button
                        onClick={handleNext}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-lg transition-all hover:scale-110 hover:bg-primary hover:text-primary-foreground active:scale-95 min-[380px]:h-9 min-[380px]:w-9 sm:h-10 sm:w-10 cursor-pointer"
                      >
                        <ChevronRight className="h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-5 lg:h-[500px]">
                    <div className="space-y-3.5 lg:overflow-y-auto">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {activeRestaurant.type}
                          </span>
                          <div className="flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1">
                            <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-900">
                              {activeRestaurant.rating || "N/A"}
                            </span>
                          </div>
                        </div>
                        <h3 className="mb-1.5 line-clamp-2 text-lg font-serif font-semibold text-foreground min-[380px]:text-xl">
                          {activeRestaurant.name}
                        </h3>
                        <div className="mb-2.5 flex items-start text-sm text-muted-foreground">
                          <MapPin className="mr-1.5 mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-2">
                            {activeRestaurant.location}
                          </span>
                        </div>
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {activeRestaurant.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 pb-1 sm:grid-cols-3">
                        <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                          <MapPin className="mx-auto mb-1 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">
                            City
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeRestaurant.city}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                          <Map className="mx-auto mb-1 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">
                            Area
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeRestaurant.area || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                          <CalendarClock className="mx-auto mb-1 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">
                            Rating
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeRestaurant.rating || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                          Available Highlights
                        </h4>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {activeRestaurant.dineIn && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                              <Building2 className="h-3 w-3" />
                              Dine In
                            </span>
                          )}
                          {activeRestaurant.takeaway && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                              Takeaway
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${activeRestaurant.reservationAvailable ? "border-sky-200 bg-sky-50 text-sky-700" : "border-zinc-200 bg-zinc-100 text-zinc-500"}`}
                          >
                            {activeRestaurant.reservationAvailable
                              ? "Reservation Available"
                              : "Walk-in Only"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(activeRestaurant.cuisines.length > 0
                            ? activeRestaurant.cuisines
                            : ["Signature Hospitality", "Prime Location"]
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
                        onClick={() => setSelectedRestaurant(activeRestaurant)}
                        className="w-full gap-2 py-3 text-sm font-bold uppercase cursor-pointer"
                      >
                        Reserve Table <ArrowRight className="h-4 w-4" />
                      </Button>
                      <button
                        onClick={() => goToRestaurantDetails(activeRestaurant)}
                        className="w-full py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
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
                        {...activeRestaurant.image}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-lg backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                          <span className="text-xs font-bold text-gray-900">
                            {activeRestaurant.rating || "N/A"}
                          </span>
                        </div>
                        <div className="rounded-full bg-primary/95 px-2.5 py-1 shadow-lg backdrop-blur-sm">
                          <span className="text-[10px] font-bold text-primary-foreground">
                            {activeIndex + 1} / {filteredRestaurants.length}
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="mb-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-white/90" />
                          <span className="text-xs opacity-90">
                            {activeRestaurant.location}
                          </span>
                        </div>
                        <h3 className="mb-1 text-xl font-serif font-bold">
                          {activeRestaurant.name}
                        </h3>
                        <p className="line-clamp-2 text-xs opacity-80">
                          {activeRestaurant.description}
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
                      <div className="mb-4 grid grid-cols-1 gap-3 border-b border-border pb-4 sm:grid-cols-3">
                        <div className="text-center">
                          <MapPin className="mx-auto mb-0.5 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">
                            City
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeRestaurant.city}
                          </p>
                        </div>
                        <div className="text-center">
                          <Map className="mx-auto mb-0.5 h-4 w-4 text-primary" />
                          <p className="text-[10px] text-muted-foreground">
                            Area
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeRestaurant.area || "N/A"}
                          </p>
                        </div>
                        <div className="text-center">
                          <Star className="mx-auto mb-0.5 h-4 w-4 fill-current text-primary" />
                          <p className="text-[10px] text-muted-foreground">
                            Rating
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {activeRestaurant.rating || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="mb-2 text-xs font-bold text-foreground">
                          Top Highlights
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeRestaurant.highlightedAmenities?.length > 0
                            ? activeRestaurant.highlightedAmenities
                            : ["Dining", "Walk-in Only"]
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
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-foreground">
                              Nearby Landmark
                            </p>
                            <p className="text-[8px] text-muted-foreground">
                              Restaurant response detail
                            </p>
                          </div>
                          <p className="text-sm font-bold text-primary">
                            {activeRestaurant.nearbyLocation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() =>
                            setSelectedRestaurant(activeRestaurant)
                          }
                          className="w-full gap-1.5 text-sm font-bold"
                        >
                          Reserve Now <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        <button
                          onClick={() =>
                            goToRestaurantDetails(activeRestaurant)
                          }
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
                          key={activeRestaurant.googleMapLink}
                          src={activeRestaurant.googleMapLink}
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
                              {activeRestaurant.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activeRestaurant.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Map preview is available only for Google embed
                              links.
                            </p>
                          </div>
                          {activeRestaurant.googleMapLink ? (
                            <a
                              href={activeRestaurant.googleMapLink}
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
