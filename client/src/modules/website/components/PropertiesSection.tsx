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
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { GetAllPropertyDetails } from "@/Api/Api";
import { toast } from "react-hot-toast";

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
}

const CarouselItem = ({
  property,
  isActive,
  onShare,
}: {
  property: ApiProperty;
  isActive: boolean;
  onShare: (property: ApiProperty) => void;
}) => {
  const navigate = useNavigate();
  const imageUrl = property.media?.[0]?.url || property.media?.[0] || "";

  return (
    <div
      className={`absolute inset-0 transition-all duration-1000 ${
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
          <button
            onClick={() => onShare(property)}
            className="mb-4 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {property.tagline && (
            <p className="text-white/90 text-sm mb-4 line-clamp-2 italic font-light tracking-wide">
              {property.tagline}
            </p>
          )}

          <h1 className="text-3xl lg:text-5xl font-serif mb-4 leading-tight">
            {property.propertyName}
            {property.mainHeading && (
              <span className="block italic font-light text-xl lg:text-2xl mt-1 opacity-80">
                {property.mainHeading}
              </span>
            )}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-sm font-medium">
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              {property.city || "N/A"}
            </div>
            {property.rating && (
              <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-bold text-sm">
                  {property.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const type = property.propertyType?.toLowerCase();

              if (type === "resturant" || type === "restaurant") {
                navigate(`/resturant/${property.propertyId}`);
              } else {
                navigate(`/hotels/${property.propertyId}`);
              }
            }}
            className="inline-flex items-center gap-3 uppercase text-sm font-bold tracking-widest group"
          >
            Explore Now
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-primary transition-all">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PropertiesSection() {
  const [apiProperties, setApiProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [activeIndex, setActiveIndex] = useState(0);

  // Mock searchData and selectedRoomId for the booking function
  // In your real code, these likely come from a context or state
  const [searchData] = useState({
    checkIn: new Date(),
    checkOut: new Date(new Date().setDate(new Date().getDate() + 1)),
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [selectedRoomId] = useState("default-room");

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

            if (!parent?.isActive) return [];

            return listings
              .filter((l: any) => l.isActive)
              .map((l: any) => ({
                id: l.id,
                propertyId: parent.id, // Fixed: correctly mapping parent propertyId
                listingId: l.id,
                propertyName: parent.propertyName || "Unnamed Property",
                propertyType:
                  l.propertyType || parent.propertyTypes?.[0] || "Property",
                city: parent.locationName,
                mainHeading: l.mainHeading || "",
                subTitle: l.subTitle || "",
                fullAddress: l.fullAddress || parent.address,
                tagline: l.tagline || "",
                rating: l.rating,
                capacity: l.capacity,
                price: l.price,
                gstPercentage: l.gstPercentage,
                discountAmount: l.discountAmount,
                amenities: l.amenities || [],
                isActive: true,
                media: l.media || [],
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
    if (filtered.length <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [filtered.length, activeIndex]);

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
            <div className="relative h-[400px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl group border border-white/10">
              {filtered.map((p, i) => (
                <CarouselItem
                  key={`${p.listingId}-${i}`}
                  property={p}
                  isActive={i === activeIndex}
                  onShare={() => {}}
                />
              ))}

              {filtered.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {active && (
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-foreground">
                    {active.propertyName}
                  </h3>

                  <div className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                      <div className="p-4 bg-secondary/20 rounded-2xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase">
                          Capacity
                        </p>
                        {active.capacity ? `${active.capacity} Guests` : "N/A"}
                      </div>
                      <div className="p-4 bg-secondary/20 rounded-2xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase">
                          Rating
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {active.rating ? active.rating.toFixed(1) : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleBookNow}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 uppercase shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                  >
                    Book Your Stay <ArrowRight size={20} />
                  </button>

                  {/* Added Call and Email buttons as per image */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        (window.location.href = `tel:+911234567890`)
                      }
                      className="py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-secondary/20 transition-colors"
                    >
                      <Phone size={18} /> Call
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `mailto:info@kennediahotels.com`)
                      }
                      className="py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-secondary/20 transition-colors"
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
