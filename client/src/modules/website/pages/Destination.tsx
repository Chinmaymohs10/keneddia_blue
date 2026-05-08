import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Star, Coffee, Bed, Utensils, Wine,
  ChevronLeft, ArrowRight, Compass
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getPropertiesByLocationDetails } from "@/Api/Api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { createHotelSlug, createCitySlug } from "@/lib/HotelSlug";

const HOTEL_BASE_URL = "https://hotels.kennediablu.com";
const RESTAURANT_BASE_URL = "https://restaurants.kennediablu.com/";
const CAFE_BASE_URL = "https://cafes.kennediablu.com/";
const WINE_BASE_URL = "https://onenight.kennediablu.com/";

const getPropertyIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "hotel":
      return <Bed className="w-5 h-5" />;
    case "restaurant":
    case "resturant":
      return <Utensils className="w-5 h-5" />;
    case "cafe":
      return <Coffee className="w-5 h-5" />;
    case "wine":
      return <Wine className="w-5 h-5" />;
    default:
      return <Star className="w-5 h-5" />;
  }
};

const getPropertyColor = (type) => {
  switch (type?.toLowerCase()) {
    case "hotel":
      return "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "restaurant":
    case "resturant":
      return "text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "cafe":
      return "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "wine":
      return "text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    default:
      return "text-primary bg-primary/10 border-primary/20";
  }
};

export default function Destination() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const res = await getPropertiesByLocationDetails(locationId);
        if (res?.data) {
          setProperties(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error("Error fetching properties by location:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (locationId) {
      fetchProperties();
    }
  }, [locationId]);

  const locationName = properties.length > 0 ? properties[0]?.propertyResponseDTO?.locationName : "Destination";

  const categories = useMemo(() => {
    const types = new Set(["All"]);
    properties.forEach(item => {
      const type = item?.propertyListingResponseDTOS?.[0]?.propertyType || item?.propertyResponseDTO?.propertyTypes?.[0];
      if (type) types.add(type);
    });
    return Array.from(types);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    if (activeFilter === "All") return properties;
    return properties.filter(item => {
      const type = item?.propertyListingResponseDTOS?.[0]?.propertyType || item?.propertyResponseDTO?.propertyTypes?.[0];
      return type === activeFilter;
    });
  }, [properties, activeFilter]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="website-shell bg-background min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-20 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <div className="p-2 bg-secondary rounded-full group-hover:bg-primary/10 transition-colors border border-border group-hover:border-primary/30">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-sm tracking-widest uppercase font-medium">Back to Map</span>
          </motion.button>

          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-8">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-6"
              >
                <Compass className="w-3.5 h-3.5" />
                Destinations
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl font-serif text-foreground tracking-tight leading-none"
              >
                {isLoading ? "Exploring..." : locationName}
              </motion.h1>
            </div>

            {/* Category Filters */}
            {!isLoading && categories.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2 md:justify-end"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-md",
                      activeFilter === cat
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                        : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border animate-pulse shadow-sm">
                    <div className="h-72 bg-secondary/80" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 w-3/4 bg-secondary/80 rounded" />
                      <div className="h-4 w-1/2 bg-secondary/80 rounded" />
                      <div className="h-10 w-full bg-secondary/80 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : filteredProperties.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center bg-secondary/30 rounded-3xl border border-border/50 backdrop-blur-sm shadow-sm"
              >
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-serif text-foreground mb-3">No Experiences Found</h3>
                <p className="text-muted-foreground max-w-md">We couldn't find any curated experiences matching your criteria in this location.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {filteredProperties.map((item) => {
                  const property = item.propertyResponseDTO;
                  const listing = item.propertyListingResponseDTOS?.[0];
                  const primaryType = listing?.propertyType || property?.propertyTypes?.[0];

                  return (
                    <motion.div
                      key={property.id}
                      variants={itemVariants}
                      className="group relative bg-card/60 backdrop-blur-md border border-border rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-xl shadow-sm"
                    >
                      {/* Image Container */}
                      <div className="relative h-[340px] overflow-hidden">
                        {listing?.media?.[0]?.url ? (
                          <>
                            {/* Gradient to ensure text over image remains readable in light mode too */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />
                            <OptimizedImage
                              src={listing.media[0].url}
                              alt={listing.propertyName}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-[0.25,0.46,0.45,0.94]"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary z-0">
                            <div className="text-muted-foreground opacity-70">
                              {getPropertyIcon(primaryType)}
                            </div>
                            <span className="mt-4 text-muted-foreground font-serif text-xl opacity-70">Image Unavailable</span>
                          </div>
                        )}

                        {/* Badge */}
                        <div className={cn(
                          "absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 backdrop-blur-md bg-background/80 border shadow-sm",
                          getPropertyColor(primaryType)
                        )}>
                          {getPropertyIcon(primaryType)}
                          {primaryType}
                        </div>

                        {/* Rating overlay if available */}
                        {(listing?.rating || property.propertyRating) && (
                          <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-sm">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-foreground text-xs font-bold tracking-wider">
                              {listing?.rating ? Number(listing.rating).toFixed(1) : property.propertyRating}
                            </span>
                          </div>
                        )}

                        {/* Overlay Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          {/* Force white text here since it's over the dark image gradient */}
                          <h3 className="text-2xl font-serif text-white mb-2 tracking-wide drop-shadow-md line-clamp-1">
                            {listing?.propertyName || property.propertyName}
                          </h3>
                          <div className="flex items-center gap-2 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-sm truncate drop-shadow-sm">
                              {listing?.fullAddress || property.address}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Interaction Area */}
                      <div className="p-6 bg-card relative overflow-hidden border-t border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 h-10 font-light leading-relaxed">
                          {listing?.tagline || "Experience unparalleled service and luxurious comfort in our exquisite property."}
                        </p>

                        <button
                          onClick={() => {
                            const city = listing?.city || property.locationName || "";
                            const pName = listing?.propertyName || property.propertyName || "";
                            const pId = property.id;
                            const propertyPath = `${createCitySlug(city || pName)}/${createHotelSlug(pName || city, pId)}`;

                            const pType = primaryType?.toLowerCase();
                            const localPath = pType === "wine" ? `/wine-detail/${propertyPath}` : `/${propertyPath}`;

                            // --- Base URL Navigation Logic ---
                            const baseUrl = pType === "cafe" 
                              ? CAFE_BASE_URL 
                              : (pType === "restaurant" || pType === "resturant") 
                                ? RESTAURANT_BASE_URL 
                                : pType === "wine" 
                                  ? WINE_BASE_URL 
                                  : HOTEL_BASE_URL;
                            const finalUrl = `${baseUrl.replace(/\/$/, "")}${localPath}`;
                            window.open(finalUrl, "_blank", "noopener,noreferrer");

                            navigate(localPath);
                          }}
                          className="relative z-10 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground font-medium transition-all duration-300 border border-border hover:border-transparent group/btn shadow-sm"
                        >
                          Explore Experience
                          <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
