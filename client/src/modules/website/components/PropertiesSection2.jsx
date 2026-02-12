import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame, wrap } from "framer-motion";
import { ArrowRight, MapPin, Star, Building2 } from "lucide-react";
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// Data from Hotels.tsx (kept internal as requested)
// Enriched with 'type' for filtering
const properties = [
  {
    id: "mumbai",
    name: "Kennedia Blu Mumbai",
    location: "Colaba, Mumbai",
    city: "Mumbai",
    type: "Heritage",
    image: siteContent.images.hotels.mumbai,
    rating: "4.9",
  },
  {
    id: "bengaluru",
    name: "Kennedia Blu Bengaluru",
    location: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    type: "Business",
    image: siteContent.images.hotels.bengaluru,
    rating: "4.8",
  },
  {
    id: "delhi",
    name: "Kennedia Blu Delhi",
    location: "Connaught Place, Delhi",
    city: "Delhi",
    type: "Luxury",
    image: siteContent.images.hotels.delhi,
    rating: "5.0",
  },
  {
    id: "kolkata",
    name: "Kennedia Blu Kolkata",
    location: "Park Street, Kolkata",
    city: "Kolkata",
    type: "Heritage",
    image: siteContent.images.hotels.kolkata,
    rating: "4.9",
  },
  {
    id: "hyderabad",
    name: "Kennedia Blu Hyderabad",
    location: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    type: "City Hotel",
    image: siteContent.images.hotels.hyderabad,
    rating: "4.8",
  },
  {
    id: "chennai",
    name: "Kennedia Blu Chennai",
    location: "ECR, Chennai",
    city: "Chennai",
    type: "Resort",
    image: siteContent.images.hotels.chennai,
    rating: "4.9",
  },
];

interface PropertyCardProps {
  property: typeof properties[0];
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <div className="w-[260px] md:w-[320px] h-[200px] md:h-[240px] relative group overflow-hidden rounded-lg mx-3 flex-shrink-0 cursor-pointer">
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          {...property.image}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{property.rating} Exceptional</span>
            </div>
            <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white/90">
              {property.type}
            </span>
          </div>

          <h3 className="text-xl font-serif font-medium mb-0.5">{property.name}</h3>

          <div className="flex items-center text-white/70 text-xs mb-3">
            <MapPin className="w-2.5 h-2.5 mr-1" />
            {property.location}
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-1.5 px-3 rounded text-[10px] uppercase tracking-widest font-bold border border-white/30 transition-colors">
              Details
            </button>
            <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-1.5 px-3 rounded text-[10px] uppercase tracking-widest font-bold transition-colors">
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AutoCarousel = ({ items, direction = "left", duration = 60 }: { items: typeof properties, direction?: "left" | "right", duration?: number }) => {
  if (!items.length) return null;

  // Ensure enough items for seamless scrolling
  // If fewer items, duplicate more times
  let scrollItems = [...items, ...items, ...items];
  if (items.length < 4) {
    scrollItems = [...items, ...items, ...items, ...items, ...items, ...items];
  }

  return (
    <div className={`marquee-container-${direction} overflow-hidden w-full select-none`}>
      <div className={`marquee-content-${direction} flex-shrink-0`}>
        {scrollItems.map((item, idx) => (
          <PropertyCard key={`row-a-${item.id}-${idx}`} property={item} />
        ))}
      </div>
      <div className={`marquee-content-${direction} flex-shrink-0`}>
        {scrollItems.map((item, idx) => (
          <PropertyCard key={`row-b-${item.id}-${idx}`} property={item} />
        ))}
      </div>
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .marquee-container-${direction} {
          display: flex;
          width: 100%;
          overflow: hidden;
        }
        .marquee-content-${direction} {
          display: flex;
          animation: ${direction === "left" ? "scrollLeft" : "scrollRight"} ${duration}s linear infinite;
        }
        .marquee-container-${direction}:hover .marquee-content-${direction} {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

export default function PropertiesSection() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");

  const uniqueCities = ["All Cities", ...Array.from(new Set(properties.map(p => p.city)))];
  const uniqueTypes = ["All Types", ...Array.from(new Set(properties.map(p => p.type)))];

  const filteredProperties = properties.filter(p => {
    const matchCity = selectedCity === "All Cities" || p.city === selectedCity;
    const matchType = selectedType === "All Types" || p.type === selectedType;
    return matchCity && matchType;
  });

  return (
    <div className="py-10 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 mb-6">

        {/* Header Layout matching DailyOffers (flex justify-between) */}
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground">
              Explore Our Properties
            </h2>
            <div className="w-12 h-0.5 bg-primary mt-2" />
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            {/* Type Filter */}
            <div className="relative min-w-[140px] hidden sm:block">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full appearance-none bg-background border border-border rounded-full py-1.5 pl-3 pr-8 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer outline-none shadow-sm hover:border-primary/50 transition-colors"
              >
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Building2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Location Filter */}
            <div className="relative min-w-[140px]">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full appearance-none bg-background border border-border rounded-full py-1.5 pl-3 pr-8 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer outline-none shadow-sm hover:border-primary/50 transition-colors"
              >
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        {filteredProperties.length > 0 ? (
          <>
            <AutoCarousel items={filteredProperties} direction="left" duration={80} />
            <AutoCarousel items={filteredProperties} direction="right" duration={90} />
          </>
        ) : (
          <div className="text-center py-12 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10 rounded-lg mx-6 lg:mx-12 border border-dashed border-primary/10">
            <Building2 className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No properties found matching your selection.</p>
            <button
              onClick={() => { setSelectedCity("All Cities"); setSelectedType("All Types") }}
              className="mt-2 text-xs text-primary underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
