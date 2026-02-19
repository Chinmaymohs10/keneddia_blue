import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Sparkles,
  CalendarIcon,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Calendar from "@/components/ui/calendar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getEventsUpdated, getGroupBookings } from "@/Api/Api";

/* ================= TYPES ================= */
type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  id: number;
  title: string;
  locationName: string;
  eventDate: string;
  description: string;
  status: "ACTIVE" | "COMING_SOON" | "SOLD_OUT";
  ctaText: string;
  ctaLink: string | null;
  image: { url: string; alt: string | null };
  typeName: string;
  active: boolean;
}

interface GroupBooking {
  id: number;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  media: { mediaId: number; type: string; url: string }[];
}

/* ================= HELPERS ================= */
const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const suffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  return `${day}${suffix(day)} ${month} ${year}`;
};

const getStatusBadge = (status: Event["status"]) => {
  switch (status) {
    case "ACTIVE":      return "Book Now";
    case "COMING_SOON": return "Coming Soon";
    case "SOLD_OUT":    return "Sold Out";
    default:            return "View Details";
  }
};

/* ================= COMPONENT ================= */
export default function GroupBookingSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<GroupBooking | null>(null);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<CalendarValue>(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEventsUpdated();
        const eventsData = response.data || response;
        setEvents(
          eventsData.filter(
            (e: Event) => e.typeName === "Hotel" && e.status === "ACTIVE" && e.active === true,
          ),
        );
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch group bookings
  useEffect(() => {
    const fetchGroupBookings = async () => {
      try {
        const res = await getGroupBookings();
        setGroupBookings(res?.data || []);
      } catch (err) {
        console.error("Error fetching group bookings:", err);
      }
    };
    fetchGroupBookings();
  }, []);

  // Pair events for swiper
  const eventPairs: Event[][] = [];
  for (let i = 0; i < events.length; i += 2) eventPairs.push(events.slice(i, i + 2));

  const handleOpenBooking = (booking: GroupBooking) => {
    setSelectedOffer(booking);
    setStep(1);
    setDateRange(null);
  };

  return (
    <section className="py-10 bg-background">
      <div className="w-[92%] max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-2">
            Events & Celebrations
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Discover upcoming experiences and plan your special gatherings
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: EVENTS */}
          <div className="lg:col-span-8">
            <div className="bg-card border rounded-2xl p-5">
              <h3 className="text-lg font-serif font-semibold mb-4 flex gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Upcoming Events
              </h3>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No upcoming events available at the moment.
                </div>
              ) : (
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  loop={eventPairs.length > 1}
                  className="pb-8"
                >
                  {eventPairs.map((pair, i) => (
                    <SwiperSlide key={i}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pair.map((event) => (
                          <div key={event.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                              <img
                                src={event.image.url}
                                alt={event.image.alt || event.title}
                                className="h-[160px] w-full object-cover"
                                loading="lazy"
                              />
                              <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full">
                                {getStatusBadge(event.status)}
                              </span>
                            </div>
                            <div className="p-4">
                              <div className="text-xs text-muted-foreground flex gap-2 mb-2 flex-wrap">
                                <span className="flex items-center gap-1 text-primary">
                                  <CalendarIcon className="w-3 h-3" />
                                  {formatEventDate(event.eventDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.locationName}
                                </span>
                              </div>
                              <h4 className="font-semibold mb-1 line-clamp-1">{event.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-xs font-medium text-muted-foreground">{event.typeName}</span>
                                {/* <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={event.status === "SOLD_OUT"}
                                  onClick={() => event.ctaLink && window.open(event.ctaLink, "_blank")}
                                >
                                  {event.ctaText || "View Details"}
                                </Button> */}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>

          {/* RIGHT: GROUP BOOKINGS — dynamic */}
          <div className="lg:col-span-4">
            <div className="border rounded-2xl p-5 h-full">
              <h3 className="text-xl font-serif font-semibold mb-4 flex gap-2">
                <Users className="w-5 h-5 text-primary" />
                Group Booking
              </h3>

              {groupBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No group booking options available.
                </div>
              ) : (
                <div className="space-y-3">
                  {groupBookings.map((booking) => {
                    const img = booking.media?.[0]?.url;
                    const hasCtaLink = !!(booking.ctaLink && booking.ctaLink.trim());

                    return (
                      <div
                        key={booking.id}
                        onClick={() => handleOpenBooking(booking)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 cursor-pointer transition-all group"
                      >
                        {/* Thumbnail */}
                        {img ? (
                          <img
                            src={img}
                            alt={booking.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {booking.title}
                          </p>
                          {booking.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {booking.description}
                            </p>
                          )}
                          {/* CTA — only if link exists */}
                          {hasCtaLink && (
                            <a
                              href={booking.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-1 hover:underline"
                            >
                              {booking.ctaText || "Learn More"} <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{selectedOffer?.title}</DialogTitle>
            <DialogDescription>Select your preferred event dates.</DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <Calendar selectRange value={dateRange} onChange={setDateRange} />
              <p className="text-xs text-muted-foreground">*Select start and end date</p>
            </div>
          )}

          {step === 2 && (
            <div className="py-8 text-center space-y-2">
              <p className="text-lg font-semibold text-green-600">Enquiry Sent!</p>
              <p className="text-sm text-muted-foreground">We'll get back to you shortly.</p>
            </div>
          )}

          {step < 2 && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setStep(2)}
                disabled={!Array.isArray(dateRange) || !dateRange[0] || !dateRange[1]}
              >
                Send Enquiry
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}