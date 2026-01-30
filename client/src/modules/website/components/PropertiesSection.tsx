import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, Building2, Phone, Mail, Loader2, Share2 } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { GetAllPropertyListing, getPropertyListingMedia } from "@/Api/Api";
import { toast } from "react-hot-toast";

interface ApiProperty {
  id: number;
  propertyId: number;
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
}

export default function PropertiesSection() {
  const [apiProperties, setApiProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchFullPropertyData = async () => {
      try {
        setLoading(true);
        const propResponse = await GetAllPropertyListing();
        const properties = propResponse.data || propResponse;

        if (Array.isArray(properties)) {
          const propertiesWithMedia = await Promise.all(
            properties.map(async (prop: ApiProperty) => {
              try {
                const mediaResponse = await getPropertyListingMedia(prop.id);
                return {
                  ...prop,
                  media: mediaResponse.data || mediaResponse || [],
                };
              } catch (err) {
                return { ...prop, media: [] };
              }
            })
          );
          setApiProperties(propertiesWithMedia.filter((p) => p.isActive));
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFullPropertyData();
  }, []);

  const uniqueCities = ["All Cities", ...Array.from(new Set(apiProperties.map((p) => p.city)))];
  const uniqueTypes = ["All Types", "Hotel", "Cafe", "Restaurant"];

  const filteredProperties = apiProperties.filter((p) => {
    const matchCity = selectedCity === "All Cities" || p.city === selectedCity;
    const matchType = selectedType === "All Types" || p.propertyType === selectedType;
    return matchCity && matchType;
  });

  useEffect(() => {
    if (filteredProperties.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev >= filteredProperties.length - 1 ? 0 : prev + 1));
    }, 8000); 
    return () => clearInterval(interval);
  }, [filteredProperties.length]);

  const activeProperty = filteredProperties[activeIndex];
  const nextProperty = filteredProperties[(activeIndex + 1) % filteredProperties.length];

  const handleShare = async (property: ApiProperty) => {
    const shareData = {
      title: property.mainHeading,
      text: `${property.tagline}`,
      url: `${window.location.origin}/properties/${property.id}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied!");
      }
    } catch (err) { console.error(err); }
  };

  const getActionButtonText = (type: string) => {
    switch (type) {
      case "Hotel": return { primary: "Book Room", secondary: "Reserve Table" };
      case "Cafe":
      case "Restaurant": return { primary: "Reserve Table", secondary: null };
      default: return { primary: "Book Now", secondary: null };
    }
  };

  if (loading) return (
    <div className="py-20 flex justify-center items-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-background via-secondary/5 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground mb-1.5">Explore Our Properties</h2>
            <div className="w-12 md:w-16 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setActiveIndex(0); }}
                className="appearance-none bg-background border border-border rounded-full py-1.5 md:py-2 pl-3 md:pl-4 pr-8 md:pr-10 text-xs md:text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer outline-none shadow-sm hover:border-primary/50 transition-all"
              >
                {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Building2 className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setActiveIndex(0); }}
                className="appearance-none bg-background border border-border rounded-full py-1.5 md:py-2 pl-3 md:pl-4 pr-8 md:pr-10 text-xs md:text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer outline-none shadow-sm hover:border-primary/50 transition-all"
              >
                {uniqueCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              <MapPin className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[60%_38%] gap-4 lg:gap-6">
            
            {/* LEFT: Carousel */}
            <div className="relative h-[320px] md:h-[400px] lg:h-[480px] rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl">
              {filteredProperties.map((property, index) => (
                <div key={property.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === activeIndex ? "opacity-100 translate-x-0" : "opacity-0"}`}>
                  <OptimizedImage src={property.media?.[0]?.url || ""} alt={property.propertyName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full px-4 md:px-8 lg:px-12">
                      <div className="max-w-xl">
                         <button onClick={() => handleShare(property)} className="mb-4 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2 group">
                            <Share2 className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Share</span>
                         </button>
                         
                         <p className="text-white/90 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed max-w-md line-clamp-2">{property.tagline}</p>

                         {/* Exact Original Pagination UI */}
                         <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            {filteredProperties.map((_, idx) => (
                              <div key={idx} className="flex flex-col items-start gap-1">
                                <span className={`text-[10px] md:text-xs font-medium ${idx === activeIndex ? "text-white" : "text-white/40"}`}>
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                <div className={`h-0.5 transition-all duration-500 ${idx === activeIndex ? "w-8 md:w-12 bg-white" : "w-6 md:w-8 bg-white/30"}`} />
                              </div>
                            ))}
                         </div>

                         <div className="inline-block mb-2 md:mb-3">
                           <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-white/80">
                             Kennedia Blu {property.propertyType}
                           </span>
                         </div>

                         <h1 className="text-2xl md:text-3xl lg:text-5xl text-white mb-3 md:mb-4">
                            <span className="font-serif font-normal block leading-tight">{property.mainHeading}</span>
                            <span className="font-serif italic font-light block leading-tight">{property.subTitle}</span>
                         </h1>

                         <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className="flex items-center text-white/90">
                              <MapPin className="w-3.5 md:w-4 h-3.5 md:h-4 mr-1.5 md:mr-2" />
                              <span className="text-xs md:text-sm font-medium">{property.city}</span>
                            </div>
                            {property.rating && (
                              <div className="flex items-center gap-1 md:gap-1.5 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                                <Star className="w-3.5 md:w-4 h-3.5 md:h-4 text-yellow-400 fill-current" />
                                <span className="text-xs md:text-sm font-bold text-white">{property.rating}</span>
                              </div>
                            )}
                         </div>

                         <Link to={`/properties/${property.id}`} className="group inline-flex items-center gap-2 md:gap-3 text-white hover:gap-3 md:hover:gap-4 transition-all duration-300">
                           <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">Explore Now</span>
                           <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all">
                             <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
                           </div>
                         </Link>
                      </div>
                    </div>
                  </div>

                  {/* Next Thumbnail Preview */}
                  {filteredProperties.length > 1 && index === activeIndex && (
                    <div className="hidden md:block absolute bottom-4 lg:bottom-6 right-4 lg:right-6 group cursor-pointer" onClick={() => setActiveIndex((activeIndex + 1) % filteredProperties.length)}>
                      <div className="relative w-16 h-16 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 lg:border-4 border-white/30 shadow-xl transition-transform duration-300 group-hover:scale-110">
                        <OptimizedImage src={nextProperty.media?.[0]?.url || ""} alt="Next" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-[10px] lg:text-xs font-semibold">Next</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT: Sidebar Card */}
            <div className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6 shadow-lg h-fit">
              <div className="pb-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-serif font-semibold text-foreground">Property Details</h3>
                  <Building2 className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">Capacity</p>
                    <p className="text-sm font-semibold text-foreground">{activeProperty.capacity || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1">Base Price</p>
                    <p className="text-lg font-bold text-foreground">
                      {activeProperty.price ? `₹${activeProperty.price.toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground uppercase tracking-tight">GST</span>
                    <span className="font-medium text-destructive">N/A</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground uppercase tracking-tight">Discount</span>
                    <span className="font-medium text-destructive">N/A</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Amount</span>
                    <span className="text-xl lg:text-2xl font-bold text-primary">
                      {activeProperty.price ? `₹${activeProperty.price.toLocaleString()}` : "N/A"}
                      {activeProperty.price && (
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">
                          {activeProperty.propertyType === 'Hotel' ? '/night' : '/person'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-4 border-b border-border">
                <h3 className="text-base md:text-lg font-serif font-semibold text-foreground mb-3 md:mb-4">Top Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {activeProperty.amenities.slice(0, 4).map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-primary rounded-full flex-shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5">
                <div className="space-y-2 md:space-y-3">
                  {(() => {
                    const btn = getActionButtonText(activeProperty.propertyType);
                    return (
                      <>
                        <Link to={`/properties/${activeProperty.id}`} className="w-full py-2 md:py-2.5 lg:py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 text-xs md:text-sm">
                          {btn.primary} <ArrowRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        </Link>
                        {btn.secondary && (
                          <Link to={`/properties/${activeProperty.id}`} className="w-full py-2 md:py-2.5 lg:py-3 bg-background border-2 border-primary text-primary font-bold uppercase tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2 text-xs md:text-sm">
                            {btn.secondary} <ArrowRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
                          </Link>
                        )}
                      </>
                    );
                  })()}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 border border-border text-foreground font-semibold rounded-lg hover:border-primary transition-all flex items-center justify-center gap-1 text-xs"><Phone size={14} /> Call</button>
                    <button className="py-2 border border-border text-foreground font-semibold rounded-lg hover:border-primary transition-all flex items-center justify-center gap-1 text-xs"><Mail size={14} /> Email</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed border-primary/20">
            <p className="text-muted-foreground">No matching properties found.</p>
          </div>
        )}
      </div>
    </section>
  );
}