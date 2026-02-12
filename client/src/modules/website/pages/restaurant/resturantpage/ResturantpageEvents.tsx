import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, MapPin, Loader2, Image as ImageIcon } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getEventsUpdated } from "@/Api/Api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// ============================================================================
// CONFIGURATION & FALLBACKS
// ============================================================================

const ROUTES = {
  allEvents: "/events",
  eventDetail: (id: number | string) => `/#`,
} as const;

const STYLE_CONFIG = {
  cardHeight: "h-[280px]",
  cardRadius: "rounded-2xl",
} as const;

const FALLBACK_EVENTS: ApiEvent[] = [
  {
    id: "f1",
    title: "Weekend Jazz Night",
    locationName: "Main Lounge",
    eventDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    description: "Experience soul-stirring jazz performances by international artists.",
    status: "ACTIVE",
    active: true,
    ctaText: "Book Table",
    image: {
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800",
      type: "IMAGE"
    }
  },
  {
    id: "f2",
    title: "Gourmet Wine Tasting",
    locationName: "The Vineyard Room",
    eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    description: "An evening of fine wines paired with artisanal cheeses.",
    status: "ACTIVE",
    active: true,
    ctaText: "Get Tickets",
    image: {
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800",
      type: "IMAGE"
    }
  },
  {
    id: "f3",
    title: "Salsa Fusion Workshop",
    locationName: "Grand Ballroom",
    eventDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    description: "Learn the rhythm of Salsa with a modern fusion twist.",
    status: "ACTIVE",
    active: true,
    ctaText: "Join Now",
    image: {
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800",
      type: "IMAGE"
    }
  }
];

// ============================================================================
// INTERFACES
// ============================================================================

interface ApiEvent {
  id: number | string;
  title: string;
  locationName: string;
  eventDate: string;
  description: string;
  status: "ACTIVE" | "COMING_SOON" | "SOLD_OUT";
  active: boolean;
  image?: {
    mediaId?: number;
    type?: "IMAGE" | "VIDEO";
    url: string;
    fileName?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  ctaText: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ResturantpageEvents() {
  const [apiEvents] = useState<ApiEvent[]>(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  // useEffect(() => {
  //   fetchEventData();
  // }, []);

  // const fetchEventData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await getEventsUpdated();

  //     const rawEvents = Array.isArray(response?.data)
  //       ? response.data
  //       : Array.isArray(response)
  //         ? response
  //         : [];

  //     const activeEvents = rawEvents
  //       .filter((event: any) => event.status === "ACTIVE" && event.active === true)
  //       .map((event: any) => ({
  //         ...event,
  //         image: event.image
  //           ? {
  //               mediaId: event.image.mediaId,
  //               type: event.image.type,
  //               url: event.image.url,
  //               fileName: event.image.fileName,
  //               alt: event.image.alt,
  //               width: event.image.width,
  //               height: event.image.height,
  //             }
  //           : null,
  //       }));

  //     // Use API events if available, otherwise use FALLBACK_EVENTS
  //     if (activeEvents.length > 0) {
  //       const sortedEvents = [...activeEvents].sort(
  //         (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  //       );
  //       setApiEvents(sortedEvents);
  //     } else {
  //       setApiEvents(FALLBACK_EVENTS);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch events, using fallbacks:", error);
  //     setApiEvents(FALLBACK_EVENTS);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      <section id="events" className="py-12 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-12 bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <SectionHeader
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          uniqueLocations={uniqueLocations}
        />

        {filteredEvents.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
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

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SectionHeader({
  selectedLocation,
  setSelectedLocation,
  uniqueLocations,
}: {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  uniqueLocations: string[];
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Upcoming Events
        </h2>
        <div className="h-0.5 w-16 bg-primary" />
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full appearance-none bg-background border border-border rounded-full py-1.5 pl-3 pr-8 text-sm font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            {uniqueLocations.map((loc: string) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <Link
          to={ROUTES.allEvents}
          className="group flex items-center shrink-0 gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
        >
          All Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function EventCard({ event, index }: { event: ApiEvent; index: number }) {
  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString;
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      return `${day} ${month}`;
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative"
    >
      <Link to="#" className="block">
        <div className={`relative ${STYLE_CONFIG.cardHeight} ${STYLE_CONFIG.cardRadius} overflow-hidden shadow-md hover:shadow-xl transition-all duration-500`}>
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {event.image?.url ? (
              event.image.type === "VIDEO" ? (
                <video
                  src={event.image.url}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  muted playsInline autoPlay loop
                />
              ) : (
                <OptimizedImage
                  src={event.image.url}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

          <div className="absolute top-3 right-3 bg-primary shadow-lg rounded-md">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                {formatDate(event.eventDate)}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-center gap-1 text-[11px] font-medium text-white/90 mb-2">
              <MapPin className="w-3 h-3 text-primary" />
              <span>{event.locationName}</span>
            </div>

            <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-primary transition-colors drop-shadow-lg">
              {event.title}
            </h3>

            <p className="text-[11px] text-white/80 mb-4 line-clamp-1 leading-relaxed drop-shadow-md">
              {event.description}
            </p>

            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-white px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-white transition-all shadow-lg uppercase tracking-wider">
              {event.ctaText || "View Details"} <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}