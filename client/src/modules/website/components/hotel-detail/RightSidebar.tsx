import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Check,
  MapPin,
  Star,
  Utensils,
  ChevronRight,
  Info,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface Room {
  id: string;
  name: string;
  basePrice?: number;
  price?: number;
  [key: string]: any;
}

interface Hotel {
  name: string;
  location: string;
  city: string;
  price: string;
  rating?: number | null;
  reviews?: number;
  amenities?: string[];
  nearbyPlaces?: { name: string; distance: string; type?: string }[];
  dining?: {
    name: string;
    cuisine: string;
    image?: { src: string; alt: string };
  }[];
  events?: {
    title: string;
    date: string;
    time: string;
    tag?: string;
    image: { src: string; alt: string };
  }[];
  checkIn: string;
  checkOut: string;
  coordinates?: { lat: number; lng: number } | null;
  [key: string]: any;
}

interface RightSidebarProps {
  hotel: Hotel;
  selectedRoom: Room | null;
  onBookNow: () => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  numberOfNights: number;
}

export default function RightSidebar({
  hotel,
  selectedRoom,
  onBookNow,
  checkInDate,
  checkOutDate,
  numberOfNights,
}: RightSidebarProps) {
  const scrollToSection = (id: string, offset = 150) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const formatPrice = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get room price (handle both basePrice and price)
  const getRoomPrice = (room: Room | null): number => {
    if (!room) return 0;
    const price = room.basePrice ?? room.price ?? 0;
    return typeof price === "number" ? price : 0;
  };

  // Calculate total price based on nights
  const calculateTotalPrice = (room: Room | null): number => {
    if (!room) return 0;
    const roomPrice = getRoomPrice(room);
    return roomPrice * numberOfNights;
  };

  // Generate dynamic map URL based on coordinates
  const getMapEmbedUrl = () => {
    if (hotel.coordinates?.lat && hotel.coordinates?.lng) {
      const { lat, lng } = hotel.coordinates;
      const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    }
    // Default fallback
    return "https://www.openstreetmap.org/export/embed.html?bbox=72.82,18.91,72.85,18.93&layer=mapnik&marker=18.922,72.8347";
  };

  return (
    <div className="space-y-6 sticky top-24">
      {/* Price Summary Card - UPDATED WITH DATES */}
      <div
        className={`bg-card border ${selectedRoom ? "border-primary ring-1 ring-primary" : "border-border"} rounded-xl p-5 shadow-lg relative overflow-hidden transition-all text-left`}
      >
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <Star className="w-24 h-24" />
        </div>

        <div className="relative z-10 text-left">
          {/* Date Display Section */}
          {checkInDate && checkOutDate && (
            <div className="mb-4 pb-4 border-b border-border">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Check-in
                  </p>
                  <p className="font-semibold text-foreground text-xs">
                    {format(checkInDate, "dd MMM")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(checkInDate, "EEE")}
                  </p>
                </div>
                
                <div className="text-center px-2">
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-primary mb-1" />
                    <p className="font-bold text-primary text-sm">
                      {numberOfNights}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase">
                      {numberOfNights === 1 ? "Night" : "Nights"}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Check-out
                  </p>
                  <p className="font-semibold text-foreground text-xs">
                    {format(checkOutDate, "dd MMM")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(checkOutDate, "EEE")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Display Section */}
          <div className="flex justify-between items-end mb-4 text-left">
            <div className="text-left w-full">
              {selectedRoom ? (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Total Price for {numberOfNights} {numberOfNights === 1 ? "Night" : "Nights"}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-serif font-bold text-primary">
                      {formatPrice(calculateTotalPrice(selectedRoom))}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(getRoomPrice(selectedRoom))}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1 truncate">
                    {selectedRoom.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    + taxes & fees included
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Starting from
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-serif font-bold text-muted-foreground/60">
                      {hotel.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / night
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Select a room to see final price
                  </p>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={() =>
              selectedRoom ? onBookNow() : scrollToSection("room-options")
            }
            className="w-full font-bold uppercase tracking-wider py-3 text-sm shadow-md hover:shadow-lg transition-all"
            variant={selectedRoom ? "default" : "secondary"}
          >
            {selectedRoom ? "Proceed to Book" : "Select Room"}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Check className="w-3 h-3 text-green-500" /> Best Price Guarantee •
            Instant Confirmation
          </p>
        </div>
      </div>

      {/* Mini Map Card - Dynamic Coordinates */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group">
        <div className="h-40 relative w-full bg-secondary/20">
          {/* Dynamic Map Preview */}
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={getMapEmbedUrl()}
            className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500 pointer-events-none"
          ></iframe>

          <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
            <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg animate-bounce">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
            <div className="text-white">
              <p className="text-xs font-semibold flex items-center gap-1">
                {hotel.location}, {hotel.city}
              </p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-card border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => scrollToSection("location")}
          >
            View Full Map
          </Button>
        </div>
      </div>

      {/* Reviews Snapshot */}
      {hotel.rating && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Guest Reviews
            <span
              className="text-[10px] text-primary cursor-pointer hover:underline font-normal"
              onClick={() => scrollToSection("guest-reviews")}
            >
              View All
            </span>
          </h4>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {hotel.rating}/5
              </p>
              <p className="text-xs text-muted-foreground">
                {hotel.reviews || 0} Verified Reviews
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            "Exceptional stay with wonderful staff..."
          </p>
        </div>
      )}

      {/* Amenities Snapshot */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Top Amenities
            <span
              className="text-[10px] text-primary cursor-pointer hover:underline font-normal"
              onClick={() => scrollToSection("amenities")}
            >
              View All
            </span>
          </h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {hotel.amenities.slice(0, 6).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full shrink-0" />
                <span
                  className="text-xs text-muted-foreground truncate"
                  title={amenity}
                >
                  {amenity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Snapshot */}
      {hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Nearby
            <span
              className="text-[10px] text-primary cursor-pointer hover:underline font-normal"
              onClick={() => scrollToSection("location")}
            >
              Full List
            </span>
          </h4>
          <div className="space-y-2">
            {hotel.nearbyPlaces.slice(0, 3).map((place, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-muted-foreground">{place.name}</span>
                <span className="font-bold text-primary">{place.distance}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food & Dining Snapshot */}
      {hotel.dining && hotel.dining.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Dining
            <span
              className="text-[10px] text-primary cursor-pointer hover:underline font-normal"
              onClick={() => scrollToSection("food-dining")}
            >
              View Details
            </span>
          </h4>
          <div className="space-y-3">
            {hotel.dining.slice(0, 2).map((place, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-center group cursor-pointer"
                onClick={() => scrollToSection("food-dining")}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {place.image ? (
                    <OptimizedImage
                      {...place.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-foreground truncate">
                    {place.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {place.cuisine}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies Snapshot */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground mb-1">
              Check-in / Check-out
            </p>
            <div className="flex justify-between text-[10px] text-muted-foreground gap-4">
              <span>
                In:{" "}
                <span className="text-foreground font-medium">
                  {hotel.checkIn}
                </span>
              </span>
              <span>
                Out:{" "}
                <span className="text-foreground font-medium">
                  {hotel.checkOut}
                </span>
              </span>
            </div>
            <button
              className="text-[10px] font-bold text-primary hover:underline mt-2"
              onClick={() => scrollToSection("policies")}
            >
              Read All Policies
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {hotel.events && hotel.events.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Upcoming Events
            <span className="text-[10px] text-primary cursor-pointer hover:underline font-normal">
              View All
            </span>
          </h4>
          <div className="space-y-4">
            {hotel.events.slice(0, 3).map((event, idx) => (
              <div key={idx} className="flex gap-3 group cursor-pointer">
                <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0 relative">
                  <OptimizedImage
                    {...event.image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Date Badge Overlay */}
                  <div className="absolute top-0 left-0 bg-primary/90 text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-br-md">
                    {event.date.split(",")[0]}
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {event.date} • {event.time}
                    </span>
                  </div>
                  {event.tag && (
                    <span className="inline-block mt-1 text-[9px] font-semibold text-primary bg-primary/10 px-1.5 rounded w-fit">
                      {event.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 text-xs font-medium"
          >
            Enquire for Events
          </Button>
        </div>
      )}

      {/* Also Available On */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h4 className="text-sm font-serif font-bold text-foreground mb-3 text-center">
          Also Available On
        </h4>
        <div className="flex items-center justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
          <div className="text-[10px] font-bold border border-border px-2 py-1 rounded">
            Goibibo
          </div>
          <div className="text-[10px] font-bold border border-border px-2 py-1 rounded">
            MakeMyTrip
          </div>
          <div className="text-[10px] font-bold border border-border px-2 py-1 rounded">
            Agoda
          </div>
        </div>
      </div>

      {/* Hotel Specific WhatsApp */}
      <Button
        variant="outline"
        className="w-full h-12 gap-2 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10 hover:text-[#25D366] font-bold shadow-sm"
        onClick={() =>
          window.open(
            `https://wa.me/919876543210?text=I'm interested in booking a room at ${hotel.name}`,
            "_blank",
          )
        }
      >
        <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
      </Button>
    </div>
  );
}