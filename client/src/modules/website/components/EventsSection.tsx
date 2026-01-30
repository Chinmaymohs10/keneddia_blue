import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getEventsUpdated } from "@/Api/Api";

// Swiper for Carousel logic
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const ROUTES = {
  allEvents: "/events",
  eventDetail: (id: number | string) => `/events/${id}`,
} as const;

const STYLE_CONFIG = {
  aspectRatio: "4/3.5" as const,
  gridGap: "gap-5",
  cardRadius: "rounded-xl",
} as const;

// Interface exactly matching your API response
interface ApiEvent {
  id: number;
  title: string;
  locationName: string;
  eventDate: string;
  description: string;
  image: {
    url: string;
  };
  ctaText: string;
}

export default function EventsSection() {
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  useEffect(() => {
    fetchEventData();
  }, []);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await getEventsUpdated({});

      // Extract array regardless of wrapper
      const rawEvents = Array.isArray(response?.data) 
        ? response.data 
        : Array.isArray(response) 
        ? response 
        : [];

      // Sort: Latest events first
      const sortedEvents = [...rawEvents].sort(
        (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );

      setApiEvents(sortedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setApiEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const uniqueLocations = [
    "All Locations",
    ...Array.from(new Set(apiEvents.map((event) => event.locationName).filter(Boolean))),
  ];

  const filteredEvents =
    selectedLocation === "All Locations"
      ? apiEvents
      : apiEvents.filter((event) => event.locationName === selectedLocation);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section id="events" className="py-12 bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          title="Upcoming Events"
          viewAllLink={ROUTES.allEvents}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          uniqueLocations={uniqueLocations}
        />

        {filteredEvents.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={
              filteredEvents.length > 3
                ? { delay: 3000, disableOnInteraction: false }
                : false
            }
            pagination={
              filteredEvents.length > 3
                ? { clickable: true, dynamicBullets: true }
                : false
            }
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            allowTouchMove={filteredEvents.length > 3}
            className="pb-12"
          >
            {filteredEvents.map((event, index) => (
              <SwiperSlide key={event.id}>
                <EventCard event={event} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
            No events found for {selectedLocation}.
          </div>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  viewAllLink,
  selectedLocation,
  setSelectedLocation,
  uniqueLocations,
}: any) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h2>
        <div className="h-0.5 w-16 bg-primary" />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="appearance-none bg-background border border-border rounded-full py-1.5 pl-3 pr-8 text-sm font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            {uniqueLocations.map((loc: string) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <Link
          to={viewAllLink}
          className="group flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
        >
          All Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function EventCard({ event, index }: { event: ApiEvent; index: number }) {
  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative"
    >
      <Link to={ROUTES.eventDetail(event.id)} className="block">
        <div
          className={`relative aspect-[${STYLE_CONFIG.aspectRatio}] ${STYLE_CONFIG.cardRadius} overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-500`}
        >
          {/* Dynamic Image mapping from nested image object */}
          <OptimizedImage
            src={event.image?.url || ""}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

          {/* Date Badge */}
          <div className="absolute top-3 right-3 bg-primary shadow-xl border border-white/20">
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-1 text-xs font-medium text-white mb-1">
              <MapPin className="w-3 h-3" />
              <span>{event.locationName}</span>
            </div>
            
            <h3 className="text-lg font-bold mb-1.5 line-clamp-2 group-hover:text-primary transition-colors drop-shadow-lg">
              {event.title}
            </h3>
            
            <p className="text-xs text-white/90 mb-3 line-clamp-2 leading-relaxed drop-shadow-md">
              {event.description}
            </p>
            
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-white px-3 py-1.5 rounded-full group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
              Details <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}