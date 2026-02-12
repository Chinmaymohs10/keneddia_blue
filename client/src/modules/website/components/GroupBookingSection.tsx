import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  PartyPopper,
  ArrowRight,
  ChevronRight,
  Check,
  Calendar as CalendarIcon,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { siteContent } from "@/data/siteContent";
import { CITIES, HOTELS_DATA, Hotel } from "@/data/hotelsData";
import Calendar from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { getEventsUpdated } from "@/Api/Api";

/* ================= TYPES ================= */
type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

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

/* ================= GROUP BOOKING OPTIONS ================= */
const GROUP_BOOKING_OPTIONS = [
  {
    id: "birthday",
    title: "Birthday & Private Parties",
    icon: PartyPopper,
    description: "Celebrate in style with custom decor and curated menus.",
    color:
      "bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30",
  },
  {
    id: "corporate",
    title: "Corporate Meetings & Offsites",
    icon: Users,
    description: "State-of-the-art venues for productivity and connection.",
    color:
      "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    id: "wedding",
    title: "Weddings & Receptions",
    icon: Sparkles,
    description: "Make your special day unforgettable with our premium venues.",
    color:
      "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30",
  },
];

/* ================= HELPER FUNCTIONS ================= */
const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  
  const suffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  
  return `${day}${suffix(day)} ${month} ${year}`;
};

const getStatusBadge = (status: Event["status"]): string => {
  switch (status) {
    case "ACTIVE":
      return "Book Now";
    case "COMING_SOON":
      return "Coming Soon";
    case "SOLD_OUT":
      return "Sold Out";
    default:
      return "View Details";
  }
};

/* ================= COMPONENT ================= */
export default function GroupBookingSection() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<{
    id: string;
    title: string;
    icon: any;
  } | null>(null);

  const [step, setStep] = useState(1);

  // Wizard state
  const [city, setCity] = useState("");
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [dateRange, setDateRange] = useState<CalendarValue>(null);

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEventsUpdated();
        
        // Access the data array from response
        const eventsData = response.data || response;
        
        // Filter: only Hotel type and ACTIVE status
        const filteredEvents = eventsData.filter(
          (event: Event) => {
            return event.typeName === "Hotel" && 
                   event.status === "ACTIVE" && 
                   event.active === true;
          }
        );
        
        setEvents(filteredEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Group events into pairs for the swiper
  const eventPairs: Event[][] = [];
  for (let i = 0; i < events.length; i += 2) {
    eventPairs.push(events.slice(i, i + 2));
  }

  const handleOpenBooking = (option: typeof GROUP_BOOKING_OPTIONS[0]) => {
    setSelectedOffer({
      id: option.id,
      title: option.title,
      icon: option.icon,
    });
    setStep(1);
    setCity("");
    setHotel(null);
    setDateRange(null);
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);
  const handleFinish = () => setStep(4);

  const filteredHotels = city
    ? HOTELS_DATA.filter((h) => h.city === city)
    : [];

  return (
    <section className="py-10 bg-background">
      <div className="w-[92%] max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-2">
            Events & Celebrations
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Discover upcoming experiences and plan your special gatherings
          </p>
        </div>

        {/* ================= SPLIT LAYOUT ================= */}
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
                <div className="text-center py-12 text-muted-foreground">
                  <p>No upcoming events available at the moment.</p>
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
                          <div
                            key={event.id}
                            className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                          >
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
                              <h4 className="font-semibold mb-1 line-clamp-1">
                                {event.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {event.description}
                              </p>
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {event.typeName}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={event.status === "SOLD_OUT"}
                                  onClick={() => {
                                    if (event.ctaLink) {
                                      window.open(event.ctaLink, "_blank");
                                    }
                                  }}
                                >
                                  {event.ctaText || "View Details"}
                                </Button>
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

          {/* RIGHT: GROUP BOOKING */}
          <div className="lg:col-span-4">
            <div className="border rounded-2xl p-6 h-full">
              <h3 className="text-xl font-serif font-semibold mb-4 flex gap-2">
                <Users className="w-6 h-6 text-primary" />
                Group Booking
              </h3>

              <div className="space-y-3">
                {GROUP_BOOKING_OPTIONS.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleOpenBooking(option)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer hover:scale-[1.02] transition-transform",
                      option.color
                    )}
                  >
                    <div className="flex gap-3 items-center">
                      <option.icon className="w-5 h-5" />
                      <span className="font-semibold">{option.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <Dialog
        open={!!selectedOffer}
        onOpenChange={() => setSelectedOffer(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selectedOffer?.title}
            </DialogTitle>
            <DialogDescription>
              Plan your event in 3 simple steps.
            </DialogDescription>
          </DialogHeader>

          {/* STEP 3 – CALENDAR */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Select Event Dates</h3>

              <Calendar selectRange value={dateRange} onChange={setDateRange} />

              <p className="text-xs text-muted-foreground">
                *Select start and end date
              </p>
            </div>
          )}

          {/* FOOTER */}
          {step < 4 && (
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
              >
                Back
              </Button>

              {step < 3 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={
                    !Array.isArray(dateRange) ||
                    !dateRange[0] ||
                    !dateRange[1]
                  }
                >
                  Send Enquiry
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}