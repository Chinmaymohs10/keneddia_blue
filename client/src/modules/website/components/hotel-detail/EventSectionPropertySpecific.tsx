import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isFuture } from "date-fns";
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { getEventsUpdated } from "@/Api/Api";
import { toast } from "react-hot-toast";

interface EventImage {
  mediaId: number;
  type: string;
  url: string;
  fileName: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  locationId: number;
  locationName: string;
  propertyTypeId: number;
  typeName: string;
  eventDate: string;
  description: string;
  status: "ACTIVE" | "COMING_SOON" | "SOLD_OUT";
  ctaText: string;
  ctaLink: string | null;
  image: EventImage;
  active: boolean;
  longDesc: string;
}

interface EventSectionPropertySpecificProps {
  locationId: number;
  locationName?: string;
}

export default function EventSectionPropertySpecific({
  locationId,
  locationName,
}: EventSectionPropertySpecificProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [locationId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEventsUpdated();
      const allEvents = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];

      console.log(`--- Debug: Filtering Events for Location ID: ${locationId} (${locationName || 'Unknown'}) ---`);
      
      const debugInfo = allEvents.map((event: Event) => ({
        id: event.id,
        title: event.title,
        eventLocationId: event.locationId,
        propLocationId: locationId,
        isMatch: Number(event.locationId) === Number(locationId),
        isActive: event.active,
        date: event.eventDate,
        isFuture: isFuture(parseISO(event.eventDate))
      }));

      // View this in your browser console to see exactly why events are appearing or not
      console.table(debugInfo);

      // Filter events by locationId, active status, and upcoming dates
      const filteredEvents = allEvents.filter((event: Event) => {
        const isMatchingLocation = Number(event.locationId) === Number(locationId);
        const isActive = event.active === true;
        const isUpcoming = isFuture(parseISO(event.eventDate));
        
        return isMatchingLocation && isActive && isUpcoming;
      });

      console.log(`Found ${filteredEvents.length} matching events.`);

      // Sort by event date (nearest first)
      const sortedEvents = filteredEvents.sort((a: Event, b: Event) => {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      });

      setEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, events.length - 2) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= events.length - 2 ? 0 : prev + 1));
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { text: "OPEN", color: "bg-green-500" },
      COMING_SOON: { text: "COMING SOON", color: "bg-blue-500" },
      SOLD_OUT: { text: "SOLD OUT", color: "bg-red-500" },
    };
    return badges[status as keyof typeof badges] || badges.ACTIVE;
  };

  const getEventCategory = (typeName: string) => {
    const categories: { [key: string]: string } = {
      Hotel: "NETWORKING",
      Cafe: "SOCIAL",
      Restaurant: "DINING",
      Resort: "LEISURE",
      Bar: "NIGHTLIFE",
    };
    return categories[typeName] || "EVENT";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-muted/20">
        <p className="text-muted-foreground italic mb-2">No upcoming events at this location</p>
        <p className="text-xs text-muted-foreground/60">Location ID: {locationId}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / 2)}%)`,
          }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="min-w-[calc(50%-12px)] flex-shrink-0"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                {/* Event Image */}
                <div className="relative h-56 overflow-hidden">
                  {event.image.type === "VIDEO" ? (
                    <video
                      src={event.image.url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <OptimizedImage
                      src={event.image.url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}

                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                      {getEventCategory(event.typeName)}
                    </span>
                  </div>

                  {event.status !== "ACTIVE" && (
                    <div className="absolute top-4 right-4">
                      <span
                        className={`${getStatusBadge(event.status).color} text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded`}
                      >
                        {getStatusBadge(event.status).text}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {format(parseISO(event.eventDate), "EEE, dd MMM")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">7:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>{event.locationName}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group/btn hover:bg-primary hover:text-white transition-all"
                    onClick={() => {
                      if (event.ctaLink) {
                        window.open(event.ctaLink, "_blank");
                      } else {
                        toast.success("Event details coming soon!");
                      }
                    }}
                  >
                    <span className="flex items-center justify-center gap-2 font-semibold text-sm uppercase tracking-wider">
                      {event.ctaText || "View Details"}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {events.length > 2 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white border border-border rounded-full p-2 shadow-lg hover:bg-primary hover:text-white transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white border border-border rounded-full p-2 shadow-lg hover:bg-primary hover:text-white transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex >= events.length - 2}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {events.length > 2 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(events.length / 2) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 2) === idx
                  ? "bg-primary w-6"
                  : "bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}