import { motion, useInView } from "framer-motion";
import { MapPin, Star, Award, Users, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { siteContent } from "@/data/siteContent";
import { getAllLocations, getOurPresenceSection } from "@/Api/Api";

interface LocationData {
  id: number;
  locationName: string;
  country: string;
  state: string;
  isActive: boolean;
}

interface PresenceSectionData {
  sectionTitle: string;
  sectionSubtitle: string;
  items: {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
    displayOrder: number;
  }[];
}

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    sparkle: Sparkles,
    sparkles: Sparkles,
    award: Award,
    users: Users,
    star: Star,
    mappin: MapPin,
    trendingup: TrendingUp,
  };
  return iconMap[iconName.toLowerCase()] || Sparkles;
};

export default function GlobalPresence({
  initialData,
}: {
  initialData?: {
    locations: { state: string; city: string }[];
    sectionData: PresenceSectionData | null;
  };
}) {
  const [locations, setLocations] = useState<{ state: string; city: string }[]>(
    initialData?.locations || [],
  );
  const [isLoading, setIsLoading] = useState(!initialData?.sectionData);
  const [sectionData, setSectionData] = useState<PresenceSectionData | null>(
    initialData?.sectionData || null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch locations
        const locationsRes = await getAllLocations();

        if (locationsRes?.data && Array.isArray(locationsRes.data)) {
          const activeLocations = locationsRes.data
            .filter((location: LocationData) => location.isActive)
            .map((location: LocationData) => ({
              state: location.state,
              city: location.locationName,
            }));

          setLocations(activeLocations);
        }

        // Fetch presence section data
        const presenceRes = await getOurPresenceSection();

        if (presenceRes?.data) {
          setSectionData(presenceRes.data);
        } else {
          setSectionData(null);
        }
      } catch (error) {
        console.error("Error fetching Global Presence:", error);
        setSectionData(null);
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedItems = sectionData?.items
    ? [...sectionData.items].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  if (isLoading) return null;
  if (!sectionData) return null;

  return (
    <section className="py-16 md:py-20 bg-secondary/20 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <OptimizedImage
          {...siteContent.images.globalPresence.map}
          className="w-full h-full object-cover grayscale"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Compact Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-xs font-bold uppercase tracking-[0.25em] mb-3 block"
          >
            {sectionData.sectionTitle}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-serif text-foreground mb-4 leading-tight"
          >
            {sectionData.sectionSubtitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground font-light leading-relaxed text-sm md:text-base"
          >
            Handpicked destinations that blend heritage charm with modern
            excellence, creating unforgettable stays in India's most iconic
            cities.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Locations - More Prominent */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 bg-card/40 backdrop-blur-sm border border-primary/10 rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Our Destinations
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {locations.map((location, index) => (
                <motion.div
                  key={`${location.city}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-start gap-2 p-2 rounded hover:bg-primary/5 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {location.city}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {location.state}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Value Propositions - Focus on Quality */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {sortedItems.map((item, index) => {
              const IconComponent = getIconComponent(item.icon);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-card/30 backdrop-blur-sm border border-primary/10 rounded-lg p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
