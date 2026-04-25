import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Star,
  Building2,
  Phone,
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { GetAllPropertyDetails } from "@/Api/Api";
import { toast } from "react-hot-toast";
import { createHotelSlug, createCitySlug } from "@/lib/HotelSlug";

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

interface ApiProperty {
  id: number;
  propertyId: number;
  listingId: number;
  propertyName: string;
  propertyType: string;
  city: string;
  mainHeading: string;
  subTitle: string;
  fullAddress: string;
  tagline: string;
  rating: number | null;
  capacity: number | null;
  price: number;
  amenities: string[];
  isActive: boolean;
  media: any[];
  gstPercentage?: number;
  discountAmount?: number;
  bookingEngineUrl?: string | null;
  mobileNumber?: string | null;
  email?: string | null;
}

const SUBTITLE_LIMIT = 120;
// ── PROD BASE URLS ─────────────────────────────
const HOTEL_BASE_URL = "https://hotels.kennediablu.com";
const RESTAURANT_BASE_URL = "https://restaurants.kennediablu.com/";

const getPropertyUrls = (
  propertyType: string | undefined,
  city: string | undefined,
  propertyName: string | undefined,
  propertyId: number,
) => {
  const propertyPath = `${createCitySlug(
    city || propertyName,
  )}/${createHotelSlug(propertyName || city || "", propertyId)}`;
  const isRestaurant = propertyType?.toLowerCase() === "restaurant";
  const finalUrl = isRestaurant
    ? `${RESTAURANT_BASE_URL.replace(/\/$/, "")}/${propertyPath}`
    : `${HOTEL_BASE_URL.replace(/\/$/, "")}/${propertyPath}`;

  return {
    isRestaurant,
    propertyPath,
    localPath: `/${propertyPath}`,
    finalUrl,
  };
};

const CarouselItem = ({
  property,
  isActive,
  total,
  activeIndex,
  onDotClick,
  nextProperty,
}: {
  property: ApiProperty;
  isActive: boolean;
  total: number;
  activeIndex: number;
  onDotClick: (i: number) => void;
  nextProperty: ApiProperty | null;
}) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const imageUrl = property.media?.[0]?.url || property.media?.[0] || "";
  const nextImageUrl =
    nextProperty?.media?.[0]?.url || nextProperty?.media?.[0] || "";

  const { propertyPath, localPath, finalUrl } = getPropertyUrls(
    property.propertyType,
    property.city,
    property.propertyName,
    property.propertyId,
  );

  const propertyName = property.propertyName || "";
  const subTitle = property.subTitle || "";
  const isLong = subTitle.length > SUBTITLE_LIMIT;

  return (
    <div
      className={`absolute inset-0 transition-all duration-1000 ${
        isActive
          ? "opacity-100 z-10 pointer-events-auto"
          : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      {/* Background */}
      {imageUrl ? (
        <OptimizedImage
          src={imageUrl}
          alt={property.propertyName || "Property"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <Building2 className="w-24 h-24 text-gray-600" />
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Three-zone layout */}
      <div className="absolute inset-0 flex flex-col justify-between px-8 lg:px-10 py-8">
        {/* TOP — tagline */}
        <div className="min-h-[28px]">
          {property.tagline ? (
            <p className="text-white/75 text-xs font-light italic tracking-wide max-w-xs leading-relaxed">
              {property.tagline}
            </p>
          ) : null}
        </div>

        {/* MIDDLE — numbered nav + heading + subtitle + city/rating + CTA */}
        <div className="text-white max-w-lg">
          {total > 1 && (
            <div className="flex items-center gap-5 mb-5">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDotClick(i);
                  }}
                  className={`text-xs font-bold tracking-widest pb-1 transition-all cursor-pointer ${
                    i === activeIndex
                      ? "text-white border-b-2 border-white"
                      : "text-white/35 border-b-2 border-transparent hover:text-white/60"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl lg:text-3xl font-serif leading-tight mb-1">
            <span className="block font-bold not-italic">{propertyName}</span>
          </h1>

          {subTitle && (
            <div className="mb-1">
              <div
                className={`transition-all duration-300 ${
                  expanded
                    ? "h-[90px] overflow-y-auto"
                    : "h-[42px] overflow-hidden"
                } pr-1 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent`}
              >
                <p className="italic font-light text-sm opacity-80 leading-snug">
                  {subTitle}
                </p>
              </div>
              {isLong && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => !prev);
                  }}
                  className="mt-1 text-xs font-semibold not-italic tracking-wide text-white/70 hover:text-white underline underline-offset-2 cursor-pointer"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          <div className="flex min-w-0 items-center gap-3 mt-4 mb-5">
            <div
              className="flex min-w-0 max-w-[70%] items-center text-sm font-medium text-white/80"
              title={property.city || "N/A"}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0" />
              <span className="truncate">{property.city || "N/A"}</span>
            </div>
            {property.rating && property.rating > 0 ? (
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                <span className="font-bold text-sm">
                  {property.rating.toFixed(1)}
                </span>
              </div>
            ) : null}
          </div>

          <a
            href={finalUrl}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              const isRestaurant =
                property.propertyType?.toLowerCase() === "restaurant";
              navigate(localPath);

              // const finalUrl = isRestaurant
              //   ? `${RESTAURANT_BASE_URL.replace(/\/$/, "")}/${propertyPath}`
              //   : `${HOTEL_BASE_URL.replace(/\/$/, "")}/${propertyPath}`;

              // window.open(finalUrl, "_blank", "noopener,noreferrer");
            }}
            className="inline-flex items-center gap-3 uppercase text-xs font-bold tracking-widest group cursor-pointer"
          >
            Explore Now
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
              <ArrowRight size={14} />
            </div>
          </a>
        </div>

        {/* BOTTOM — dot pagination left + next thumbnail right */}
        <div className="flex items-end justify-between">
          {total > 1 ? (
            <div className="flex items-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDotClick(i);
                  }}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeIndex
                      ? "w-5 h-2 bg-white"
                      : "w-2 h-2 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          {nextProperty && nextImageUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDotClick((activeIndex + 1) % total);
              }}
              className="relative w-20 h-20 mb-6 rounded-full overflow-hidden border-2 border-white/50 shadow-xl hover:border-white/90 hover:scale-105 transition-all cursor-pointer flex-shrink-0"
              title={`Next: ${nextProperty.propertyName}`}
            >
              <OptimizedImage
                src={nextImageUrl}
                alt={nextProperty.propertyName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/15 rounded-full" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PropertiesSection({
  initialProperties = [],
}: {
  initialProperties?: ApiProperty[];
}) {
  const navigate = useNavigate();
  const [apiProperties, setApiProperties] =
    useState<ApiProperty[]>(initialProperties);
  const [loading, setLoading] = useState(initialProperties.length === 0);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchFullPropertyData = async () => {
      try {
        setLoading(true);
        const response = await GetAllPropertyDetails();
        const rawData = response?.data?.data || response?.data || [];

        if (Array.isArray(rawData)) {
          const formatted = rawData.flatMap((item: any) => {
            const parent = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];
            if (!parent || parent.isActive !== true) return [];
            return listings
              .filter((l: any) => l.isActive === true)
              .map((l: any) => ({
                id: l.id,
                propertyId: parent?.id,
                listingId: l.id,
                propertyName: parent?.propertyName || "Unnamed Property",
                propertyType:
                  l.propertyType || parent?.propertyTypes?.[0] || "Property",
                city: parent?.locationName,
                mainHeading: l.mainHeading || "",
                subTitle: l.subTitle || "",
                fullAddress: l.fullAddress || parent?.address,
                tagline: l.tagline || "",
                rating: l.rating ?? 0,
                capacity: l.capacity ?? 0,
                price: l.price ?? 0,
                gstPercentage: l.gstPercentage ?? 0,
                discountAmount: l.discountAmount ?? 0,
                amenities: (l.amenities || [])
                  .map((amenity: unknown) => getAmenityName(amenity))
                  .filter(Boolean),
                isActive: true,
                media: l.media || [],
                bookingEngineUrl: parent?.bookingEngineUrl || null,
                mobileNumber: parent?.mobileNumber || null,
                email: parent?.email || null,
              }));
          });
          setApiProperties([...formatted].reverse());
        }
      } catch (error) {
        console.error("❌ API Error:", error);
        toast.error("Could not fetch latest properties");
      } finally {
        setLoading(false);
      }
    };
    fetchFullPropertyData();
  }, []);

  const filtered = apiProperties.filter((p) => {
    const matchCity = selectedCity === "All Cities" || p.city === selectedCity;
    const matchType =
      selectedType === "All Types" || p.propertyType === selectedType;
    return matchCity && matchType;
  });

  const nextSlide = () =>
    setActiveIndex((prev) => (prev === filtered.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setActiveIndex((prev) => (prev === 0 ? filtered.length - 1 : prev - 1));

  useEffect(() => {
    if (filtered.length <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [filtered.length, activeIndex, isPaused]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCity, selectedType]);

  const active = filtered[activeIndex];
  const nextProperty =
    filtered.length > 1 ? filtered[(activeIndex + 1) % filtered.length] : null;
  const isRestaurant = active?.propertyType?.toLowerCase() === "restaurant";
  const activePropertyUrls = active
    ? getPropertyUrls(
        active.propertyType,
        active.city,
        active.propertyName,
        active.propertyId,
      )
    : null;
  const basePrice = active?.price ?? 0;
  const discount = active?.discountAmount ?? 0;
  const gst = active?.gstPercentage ?? 0;
  const discountedPrice = basePrice - discount;

  // Mobile: 4 amenities max; desktop: 6
  const displayAmenities = active?.amenities?.slice(0, 6) ?? [];
  const mobileAmenities = active?.amenities?.slice(0, 4) ?? [];
  const hasAmenities = displayAmenities.length > 0;

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-background via-secondary/5 to-background relative">
      <div className="container mx-auto px-4 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground">
              Explore Our Properties
            </h2>
            <div className="w-24 h-1 bg-primary rounded-full" />
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="min-w-0 flex-1 bg-card border border-border rounded-full py-2.5 px-4 text-sm font-semibold outline-none cursor-pointer md:flex-none md:px-6"
            >
              <option value="All Types">All Types</option>
              {Array.from(
                new Set(apiProperties.map((p) => p.propertyType)),
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="min-w-0 flex-1 bg-card border border-border rounded-full py-2.5 px-4 text-sm font-semibold outline-none cursor-pointer md:flex-none md:px-6"
            >
              <option value="All Cities">All Cities</option>
              {Array.from(new Set(apiProperties.map((p) => p.city))).map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
            {loading && (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            )}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[63%_35%] gap-6">
            {/* LEFT: Carousel */}
            <div
              className="relative h-[440px] md:h-[560px] rounded-2xl overflow-hidden shadow-2xl group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {filtered.map((p, i) => (
                <CarouselItem
                  key={`${p.listingId}-${i}`}
                  property={p}
                  isActive={i === activeIndex}
                  total={filtered.length}
                  activeIndex={activeIndex}
                  onDotClick={setActiveIndex}
                  nextProperty={nextProperty}
                />
              ))}
              {filtered.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 
p-2 md:p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md 
opacity-100 md:opacity-0 md:group-hover:opacity-100 
transition-all cursor-pointer"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 
p-2 md:p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md 
opacity-100 md:opacity-0 md:group-hover:opacity-100 
transition-all cursor-pointer"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* RIGHT: Details Card
                Desktop → fixed height matching carousel (h-[560px])
                Mobile  → auto height, compact padding, no overflow scroll needed */}
            {active && (
              <div className="bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden lg:h-[560px]">
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-border">
                  <h3 className="text-sm md:text-base font-bold text-foreground tracking-wide">
                    Property Details
                  </h3>
                  <div className="p-1.5 md:p-2 rounded-lg bg-secondary/30 text-muted-foreground">
                    <Building2 size={16} />
                  </div>
                </div>

                {/* Scrollable on desktop only; natural flow on mobile */}
                <div className="px-4 md:px-6 py-3 md:py-5 flex flex-col flex-1 gap-3 md:gap-5 lg:overflow-y-auto">
                  {/* Top info row */}
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 md:gap-4">
                    {/* Capacity */}
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">
                        Capacity
                      </p>
                      {active.capacity && active.capacity > 0 ? (
                        <p className="text-base md:text-lg font-bold text-foreground">
                          {active.capacity}{" "}
                          <span className="text-xs md:text-sm font-medium text-muted-foreground">
                            {isRestaurant ? "Covers" : "Guests"}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">—</p>
                      )}
                    </div>

                    {/* Hotel: price | Restaurant: city */}
                    {isRestaurant ? (
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">
                          Location
                        </p>
                        <p className="truncate text-base md:text-lg font-bold text-foreground leading-tight">
                          {active.city || "—"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">
                          Starting From
                        </p>
                        {basePrice > 0 ? (
                          <div className="min-w-0">
                            <p className="text-xl md:text-2xl font-black text-primary leading-none">
                              ₹
                              {Math.round(
                                discountedPrice > 0
                                  ? discountedPrice
                                  : basePrice,
                              ).toLocaleString()}
                            </p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">
                              /night
                            </p>
                            {discount > 0 && (
                              <p className="text-[10px] md:text-[11px] text-muted-foreground line-through mt-0.5">
                                ₹{basePrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            On Request
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Restaurant extra row: type + rating */}
                  {isRestaurant && (
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 md:gap-4">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">
                          Type
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {active.propertyType}
                        </p>
                      </div>
                      {active.rating && active.rating > 0 ? (
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">
                            Rating
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-base md:text-lg font-bold text-foreground">
                              {active.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              / 5
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 md:mb-1">
                            Address
                          </p>
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                            {active.fullAddress || "—"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amenities OR location fallback */}
                  {hasAmenities ? (
                    <div>
                      <p className="text-xs md:text-sm font-bold text-foreground mb-2 md:mb-3">
                        Top Amenities
                      </p>
                      {/* Mobile: 4 items in 2-col; Desktop: 6 items */}
                      <div className="grid grid-cols-2 gap-y-1.5 md:gap-y-2.5 gap-x-3">
                        {displayAmenities.map((amenity, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 ${i >= 4 ? "hidden md:flex" : ""}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-xs md:text-sm text-muted-foreground leading-tight">
                              {amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs md:text-sm font-bold text-foreground mb-1">
                        Location Info
                      </p>
                      {active.city && (
                        <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-xl bg-secondary/20 border border-border/50">
                          <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                              City
                            </p>
                            <p
                              className="truncate text-xs md:text-sm font-semibold text-foreground"
                              title={active.city}
                            >
                              {active.city}
                            </p>
                          </div>
                        </div>
                      )}
                      {active.fullAddress && (
                        <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-xl bg-secondary/20 border border-border/50">
                          <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                              Address
                            </p>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                              {active.fullAddress}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border" />

                  {/* Book Now */}
                  <div>
                    <div className="space-y-2 md:space-y-3">
                      {active.bookingEngineUrl ? (
                        <button
                          onClick={() =>
                            window.open(active.bookingEngineUrl!, "_blank")
                          }
                          className="w-full py-2.5 md:py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 uppercase text-xs md:text-sm tracking-wider shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          {isRestaurant ? "Reserve Table" : "Book Your Stay"}
                          <ArrowRight size={15} />
                        </button>
                      ) : (
                        <a
                          href={activePropertyUrls?.finalUrl || "#"}
                          // onClick={() => {
                          // const path = `/${createCitySlug(active.city || active.propertyName)}/${createHotelSlug(
                          //   active.propertyName || active.city || "property",
                          //   active.propertyId,
                          // )}`;
                          // navigate(path);
                          // }}
                          onClick={(e) => {
                            e.preventDefault();

                            const propertyPath =
                              activePropertyUrls?.propertyPath ||
                              `${createCitySlug(
                                active.city || active.propertyName,
                              )}/${createHotelSlug(
                                active.propertyName || active.city || "property",
                                active.propertyId,
                              )}`;

                            const isRestaurant =
                              activePropertyUrls?.isRestaurant ??
                              (active.propertyType?.toLowerCase() ===
                                "restaurant");
                            navigate(activePropertyUrls?.localPath || `/${propertyPath}`);

                            // const finalUrl = isRestaurant
                            //   ? `${RESTAURANT_BASE_URL.replace(/\/$/, "")}/${propertyPath}`
                            //   : `${HOTEL_BASE_URL.replace(/\/$/, "")}/${propertyPath}`;

                            // window.open(
                            //   finalUrl,
                            //   "_blank",
                            //   "noopener,noreferrer",
                            // );
                          }}
                          className="w-full py-2.5 md:py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 uppercase text-xs md:text-sm tracking-wider shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          View Details <ArrowRight size={15} />
                        </a>
                      )}
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <button
                          onClick={() => {
                            if (active.mobileNumber) {
                              window.location.href = `tel:${active.mobileNumber}`;
                            } else {
                              toast("Phone number not available");
                            }
                          }}
                          className="py-2 md:py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm font-semibold hover:bg-secondary/20 transition-colors cursor-pointer text-foreground"
                        >
                          <Phone size={14} /> Call
                        </button>
                        <button
                          onClick={() => {
                            if (active.email) {
                              window.location.href = `mailto:${active.email}`;
                            } else {
                              toast("Email not available");
                            }
                          }}
                          className="py-2 md:py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm font-semibold hover:bg-secondary/20 transition-colors cursor-pointer text-foreground"
                        >
                          <Mail size={14} /> Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-3xl">
            <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground font-serif">
              No active properties found.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
