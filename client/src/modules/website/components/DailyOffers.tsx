import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, ChevronLeft, ChevronRight, MapPin, Clock, Loader2, ExternalLink } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { Swiper as SwiperType } from "swiper";
import { getDailyOffers } from "@/Api/Api";
import "swiper/css";
import "swiper/css/navigation";

// Countdown Timer Component
function CountdownTimer({ expiresAt }: { expiresAt?: string | Date }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const expiryTime = new Date(expiresAt).getTime();

      if (isNaN(expiryTime)) {
        console.warn('Invalid expiry date:', expiresAt);
        return;
      }

      const difference = expiryTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${isExpired
      ? 'bg-red-500/90 text-white border border-red-600'
      : 'bg-orange-500/90 text-white border border-orange-600'
      }`}>
      <Clock className="w-3 h-3" />
      <span>{isExpired ? "Expired" : `Expires in ${timeLeft}`}</span>
    </div>
  );
}

// Interface for API offer data
interface ApiOffer {
  id: number;
  title: string;
  description: string;
  couponCode: string;
  ctaText: string;
  ctaLink?: string; // Added field
  availableHours: string;
  propertyId: number;
  propertyName: string;
  propertyTypes: Array<{
    id: number;
    typeName: string;
    isActive: boolean;
  }>;
  locationId: number;
  locationName: string;
  image: Array<{
    mediaId: number;
    type: string;
    url: string;
    fileName: string | null;
    alt: string;
    width: number;
    height: number;
  }>;
  expiresAt: string;
  isActive: boolean;
}

// Transform API offer to component format
const transformOffer = (apiOffer: ApiOffer) => {
  return {
    id: apiOffer.id,
    title: apiOffer.title,
    description: apiOffer.description,
    couponCode: apiOffer.couponCode,
    ctaText: apiOffer.ctaText || 'View Offer',
    ctaLink: apiOffer.ctaLink || '', // Added field
    availableHours: apiOffer.availableHours,
    location: apiOffer.locationName,
    propertyName: apiOffer.propertyName,
    propertyType: apiOffer.propertyTypes?.[0]?.typeName || 'Hotel',
    expiresAt: apiOffer.expiresAt,
    image: apiOffer.image?.[0] ? {
      src: apiOffer.image[0].url,
      alt: apiOffer.image[0].alt || apiOffer.title,
      width: apiOffer.image[0].width || 400,
      height: apiOffer.image[0].height || 300
    } : null
  };
};

// Check if image is Instagram banner size (1080x1080)
const isInstagramBanner = (image: any) => {
  return image && image.width === 1080 && image.height === 1080;
};

// Fallback offers for skeleton/initial state
const getFallbackOffers = () => {
  if (siteContent.text.dailyOffers?.offers) {
    return siteContent.text.dailyOffers.offers;
  }
  
  return [
    { id: 1, title: '', description: '', couponCode: '', location: '', image: null },
    { id: 2, title: '', description: '', couponCode: '', location: '', image: null },
    { id: 3, title: '', description: '', couponCode: '', location: '', image: null },
  ];
};

export default function DailyOffers() {
  const { dailyOffers } = siteContent.text;
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [offers, setOffers] = useState<any[]>(getFallbackOffers());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const response = await getDailyOffers({
          targetType: 'GLOBAL',
          page: 0,
          size: 100
        });

        let offersData: ApiOffer[] = [];
        
        if (response.data?.data?.offers) {
          offersData = response.data.data.offers;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          offersData = response.data.data;
        } else if (response.data?.content) {
          offersData = response.data.content;
        } else if (Array.isArray(response.data)) {
          offersData = response.data;
        }

        const activeOffers = offersData
          .filter((offer: ApiOffer) => offer.isActive)
          .map(transformOffer);

        setOffers(activeOffers.reverse());
        
      } catch (err) {
        console.error('Error fetching daily offers:', err);
        setError(true);
        if (dailyOffers?.offers) {
          setOffers(dailyOffers.offers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const uniqueLocations = ["All Locations", ...Array.from(new Set(offers.map((offer: any) => offer.location).filter(Boolean)))];

  const filteredOffers = selectedLocation === "All Locations"
    ? offers
    : offers.filter((offer: any) => offer.location === selectedLocation);

  const getCategory = (offer: any) => {
    if (offer.propertyType) return offer.propertyType;
    const text = ((offer.title || '') + " " + (offer.description || '')).toLowerCase();
    if (text.includes("dining") || text.includes("meal") || text.includes("restaurant") || text.includes("dinner")) return "Restaurant";
    if (text.includes("cafe") || text.includes("coffee") || text.includes("tea")) return "Cafe";
    if (text.includes("spa") || text.includes("massage")) return "Wellness";
    return "Hotel";
  };

  const handlePrev = () => swiperInstance?.slidePrev();
  const handleNext = () => swiperInstance?.slideNext();

  if (!offers || offers.length === 0) return null;

  return (
    <section className="relative w-full bg-muted py-10 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground">
              {dailyOffers?.title || 'Exclusive Daily Offers'}
            </h2>
            <div className="w-12 h-0.5 bg-primary mt-2" />
          </div>

          <div className="flex items-center gap-3">
            {uniqueLocations.length > 1 && (
              <div className="relative hidden sm:block">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none bg-background border border-border rounded-full py-1.5 pl-3 pr-8 text-sm font-medium focus:ring-1 focus:ring-primary outline-none shadow-sm transition-colors"
                >
                  {uniqueLocations.map((loc) => (
                    <option key={String(loc)} value={String(loc)}>{String(loc)}</option>
                  ))}
                </select>
                <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            )}
            <button onClick={handlePrev} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronLeft size={16} /></button>
            <button onClick={handleNext} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={filteredOffers.length > 3}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            onSwiper={setSwiperInstance}
            speed={600}
            className="w-full pb-4"
          >
            {filteredOffers.map((offer: any, index: number) => {
              const category = getCategory(offer);
              const isIGBanner = isInstagramBanner(offer.image);

              return (
                <SwiperSlide key={offer.id || index} className="h-auto">
                  {/* flex-col h-full fix applied here */}
                  <div className={`group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors duration-300 flex flex-col h-full`}>
                    
                    {isIGBanner ? (
                      <div className="relative w-full aspect-square overflow-hidden bg-muted">
                        {offer.image?.src && (
                          <img
                            src={offer.image.src}
                            alt={offer.image.alt || offer.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        {offer.expiresAt && <div className="absolute top-3 right-3"><CountdownTimer expiresAt={offer.expiresAt} /></div>}
                      </div>
                    ) : (
                      <>
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
                          {offer.image?.src ? (
                            <img
                              src={offer.image.src}
                              alt={offer.image.alt || offer.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Tag className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded">
                              {category}
                            </span>
                          </div>
                          {offer.expiresAt && <div className="absolute top-3 right-3"><CountdownTimer expiresAt={offer.expiresAt} /></div>}
                        </div>

                        {/* Content Section - flex-1 pushes footer down */}
                        <div className="p-4 flex flex-col flex-1 gap-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-serif font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
                              {offer.title}
                            </h3>
                            {offer.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                <MapPin className="w-3 h-3" />
                                <span className="whitespace-nowrap">{offer.location}</span>
                              </div>
                            )}
                          </div>

                          {offer.propertyName && <div className="text-xs text-muted-foreground">at <span className="font-medium text-foreground">{offer.propertyName}</span></div>}
                          {offer.availableHours && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="w-3 h-3" /><span>{offer.availableHours}</span></div>}

                          {/* Footer with CTA Placeholder and Code */}
                          <div className="mt-auto pt-4 border-t border-border space-y-3">
                            <div className="text-xs text-muted-foreground">
                              Code: <span className="font-mono text-foreground font-medium">{offer.couponCode || 'N/A'}</span>
                            </div>

                            {/* CTA Link Placeholder Logic */}
                            {offer.ctaLink ? (
                              <Link 
                                to={offer.ctaLink} 
                                target="_blank"
                                className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                              >
                                {offer.ctaText}
                                <ExternalLink size={12} />
                              </Link>
                            ) : (
                              <button 
                                disabled
                                className="w-full bg-muted text-muted-foreground py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
                              >
                                {offer.ctaText}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}