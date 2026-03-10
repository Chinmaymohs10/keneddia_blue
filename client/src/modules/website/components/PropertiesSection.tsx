import { useState, useEffect, useRef } from "react";
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
  Share2,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { GetAllPropertyDetails } from "@/Api/Api";
import { toast } from "react-hot-toast";
import { createHotelSlug, createCitySlug } from "@/lib/HotelSlug";

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
}

// ── Max chars to show in collapsed state ──
const SUBTITLE_LIMIT = 120;

const CarouselItem = ({
  property,
  isActive,
  total,
  activeIndex,
  onDotClick,
  onShare,
}: {
  property: ApiProperty;
  isActive: boolean;
  total: number;
  activeIndex: number;
  onDotClick: (i: number) => void;
  onShare: (property: ApiProperty) => void;
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const imageUrl = property.media?.[0]?.url || property.media?.[0] || "";
  const propertyPath = `/${createCitySlug(property.city || property.propertyName)}/${createHotelSlug(
    property.propertyName || property.city || "property",
    property.propertyId,
  )}`;

  const subtitle = property.subTitle || "";
  const isLong = subtitle.length > SUBTITLE_LIMIT;

  return (
    <div
      className={`absolute inset-0 transition-all duration-1000 cursor-pointer ${
        isActive
          ? "opacity-100 z-10 pointer-events-auto"
          : "opacity-0 z-0 pointer-events-none"
      }`}
    >
      {imageUrl ? (
        <OptimizedImage
          src={imageUrl}
          alt={property.propertyName || "Property"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <Building2 className="w-24 h-24 text-gray-400" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-0 flex items-center px-8 lg:px-12">
        <div className="max-w-xl text-white">
          {/* Share button */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(property);
            }}
            className="mb-4 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button> */}

          {property.tagline && (
            <p className="text-white/90 text-xs mb-3 line-clamp-2 italic font-light tracking-wide">
              {property.tagline}
            </p>
          )}

          {/* Numbered Pagination */}
          {total > 1 && (
            <div className="flex items-center gap-5 mb-4">
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
                      : "text-white/40 border-b-2 border-transparent hover:text-white/60"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          )}

          {/* Property name — font reduced ~50% from text-3xl lg:text-5xl */}
          <h1 className="text-xl lg:text-2xl font-serif mb-2 leading-tight">
            {property.propertyName}
          </h1>

          {/* Subtitle — fixed height scrollable, never breaks layout */}
          {subtitle && (
            <div className="mb-4">
              <div
                className={`transition-all duration-300 ${
                  expanded
                    ? "h-[90px] overflow-y-auto"
                    : "h-[42px] overflow-hidden"
                } pr-1 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent`}
              >
                <p className="italic font-light text-sm opacity-80 leading-snug">
                  {subtitle}
                </p>
              </div>
              {isLong && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => !prev);
                  }}
                  className="mt-1 text-xs font-semibold not-italic tracking-wide text-white/70 hover:text-white underline underline-offset-2"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {property.city || "N/A"}
            </div>
            {property.rating ? (
              <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                <span className="font-bold text-xs">
                  {property.rating.toFixed(1)}
                </span>
              </div>
            ) : null}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(propertyPath);
            }}
            className="inline-flex items-center gap-3 uppercase text-xs font-bold tracking-widest group cursor-pointer"
          >
            Explore Now
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-primary transition-all">
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PropertiesSection() {
  const navigate = useNavigate();
  const [apiProperties, setApiProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
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
                amenities: l.amenities || [],
                isActive: true,
                media: l.media || [],
                bookingEngineUrl: parent?.bookingEngineUrl || null,
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

  const active = filtered[activeIndex];

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-background via-secondary/5 to-background relative">
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground">
              Explore Our Properties
            </h2>
            <div className="w-24 h-1 bg-primary rounded-full" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setActiveIndex(0);
              }}
              className="bg-card border border-border rounded-full py-2.5 px-6 text-sm font-semibold outline-none cursor-pointer"
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
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setActiveIndex(0);
              }}
              className="bg-card border border-border rounded-full py-2.5 px-6 text-sm font-semibold outline-none cursor-pointer"
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
          <div className="grid grid-cols-1 lg:grid-cols-[65%_32%] gap-8">
            {/* ── LEFT: Carousel ── */}
            <div
              className="relative h-[400px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl group border border-white/10"
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
                  onShare={() => {}}
                />
              ))}

              {/* Prev / Next arrows */}
              {filtered.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}

              {/* Dot Pagination — Bottom Left */}
              {filtered.length > 1 && (
                <div className="absolute bottom-5 left-8 z-20 flex items-center gap-2">
                  {filtered.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex(i);
                      }}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeIndex
                          ? "w-5 h-2 bg-white"
                          : "w-2 h-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Details Card ── */}
            {active && (
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-foreground">
                    {active.propertyName}
                  </h3>

                  <div className="space-y-4">
                    {/* Price block — only show if price > 0 */}
                    {active.price > 0 && (
                      <div className="flex flex-col pb-4 border-b border-border">
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-muted-foreground uppercase font-bold">
                            Base Price
                          </span>
                          <span className="text-xl font-semibold">
                            ₹{active.price.toLocaleString()}
                          </span>
                        </div>

                        {active.discountAmount && active.discountAmount > 0 ? (
                          <div className="flex justify-between text-sm text-green-600 mt-1">
                            <span>Discount</span>
                            <span>
                              -₹{active.discountAmount.toLocaleString()}
                            </span>
                          </div>
                        ) : null}

                        {active.gstPercentage && active.gstPercentage > 0 ? (
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>GST ({active.gstPercentage}%)</span>
                            <span>
                              +₹
                              {(
                                (active.price - (active.discountAmount || 0)) *
                                (active.gstPercentage / 100)
                              ).toLocaleString()}
                            </span>
                          </div>
                        ) : null}

                        <div className="flex justify-between items-end mt-4">
                          <span className="text-sm text-foreground font-bold uppercase">
                            Total
                          </span>
                          <span className="text-3xl font-black text-primary">
                            ₹
                            {(
                              (active.price - (active.discountAmount || 0)) *
                              (1 + (active.gstPercentage || 0) / 100)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {(!!active.capacity || !!active.rating) && (
                      <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                        {!!active.capacity && (
                          <div className="p-4 bg-secondary/20 rounded-2xl border border-border/50">
                            <p className="text-[10px] text-muted-foreground mb-1 uppercase">
                              Capacity
                            </p>
                            {active.capacity} Guests
                          </div>
                        )}
                        {!!active.rating && (
                          <div className="p-4 bg-secondary/20 rounded-2xl border border-border/50">
                            <p className="text-[10px] text-muted-foreground mb-1 uppercase">
                              Rating
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              {active.rating.toFixed(1)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {active.bookingEngineUrl ? (
                    <button
                      onClick={() =>
                        window.open(active.bookingEngineUrl!, "_blank")
                      }
                      className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 uppercase shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Book Your Stay <ArrowRight size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const propertyPath = `/${createCitySlug(active.city || active.propertyName)}/${createHotelSlug(
                          active.propertyName || active.city || "property",
                          active.propertyId,
                        )}`;
                        navigate(propertyPath);
                      }}
                      className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 uppercase shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      View Details <ArrowRight size={20} />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-secondary/20 transition-colors cursor-pointer">
                      <Phone size={18} /> Call
                    </button>
                    <button
                      onClick={() => (window.location.href = `#`)}
                      className="py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <Mail size={18} /> Email
                    </button>
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