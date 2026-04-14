import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Check,
  MapPin,
  Star,
  Info,
  MessageSquare,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import makemytripLogo from "@/assets/booking-partners/makemytrip.svg";
import goibiboLogo from "@/assets/booking-partners/goibibo.svg";
import agodaLogo from "@/assets/booking-partners/agoda.svg";
import hotelsLogo from "@/assets/booking-partners/hotels.svg";
import bookingLogo from "@/assets/booking-partners/booking.svg";
import genericPartnerLogo from "@/assets/booking-partners/generic.svg";

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
  verifiedReviews?: number | null;
  amenities?: string[];
  nearbyPlaces?: { name: string; distance: string; type?: string }[];
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
  addressUrl?: string | null;
  [key: string]: any;
}

interface RightSidebarProps {
  hotel: Hotel;
  selectedRoom: Room | null;
  onBookNow: () => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  numberOfNights: number;
  policies?: {
    checkInTime?: string | null;
    checkOutTime?: string | null;
  } | null;
  bookingPartners?: Array<{
    id: number | string;
    title?: string;
    url?: string;
    textField?: string;
    icon?: { url?: string | null } | null;
    isActive?: boolean;
  }>;
}

const normalizePartnerName = (value?: string) =>
  (value || "").trim().toLowerCase().replace(/\s+/g, " ");

const PARTNER_LOGOS: Record<string, string> = {
  makemytrip: makemytripLogo,
  "make my trip": makemytripLogo,
  mmt: makemytripLogo,
  goibibo: goibiboLogo,
  agoda: agodaLogo,
  "hotels.com": hotelsLogo,
  hotels: hotelsLogo,
  "booking.com": bookingLogo,
  booking: bookingLogo,
};

export default function RightSidebar({
  hotel,
  selectedRoom,
  onBookNow,
  checkInDate,
  checkOutDate,
  numberOfNights,
  policies = null,
  bookingPartners = [],
}: RightSidebarProps) {
  const resolvedCheckIn = policies?.checkInTime || hotel.checkIn || "2:00 PM";
  const resolvedCheckOut =
    policies?.checkOutTime || hotel.checkOut || "11:00 AM";

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

  const getRoomPrice = (room: Room | null): number => {
    if (!room) return 0;
    const price = room.basePrice ?? room.price ?? 0;
    return typeof price === "number" ? price : 0;
  };

  const getOriginalRoomPrice = (room: Room | null): number => {
    if (!room) return 0;

    const originalPrice = room.originalPrice ?? room.strikePrice;
    if (typeof originalPrice === "number" && originalPrice > 0) {
      return originalPrice;
    }

    return Math.round(getRoomPrice(room) * 1.2);
  };

  const calculateTotalPrice = (room: Room | null): number => {
    if (!room) return 0;
    const roomPrice = getRoomPrice(room);
    return roomPrice * numberOfNights;
  };

  const calculateOriginalTotalPrice = (room: Room | null): number => {
    if (!room) return 0;
    return getOriginalRoomPrice(room) * numberOfNights;
  };

  const getMapEmbedUrl = () => {
    if (hotel.coordinates?.lat && hotel.coordinates?.lng) {
      const { lat, lng } = hotel.coordinates;
      const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    }
    return "https://www.openstreetmap.org/export/embed.html?bbox=72.82,18.91,72.85,18.93&layer=mapnik&marker=18.922,72.8347";
  };

  const visibleBookingPartners = bookingPartners.filter(
    (partner) => partner?.isActive !== false && partner?.url,
  );

  return (
    <div className="hotel-sidebar">
      {/* Price Summary Card */}
      <div
        className={`hotel-sidebar-card-strong ${selectedRoom ? "border-primary ring-1 ring-primary" : "border-border"}`}
      >
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <Star className="w-24 h-24" />
        </div>

        <div className="relative z-10 text-left">
          <div className="flex justify-between items-end mb-4 text-left">
            <div className="text-left w-full">
              {selectedRoom ? (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Total Price for {numberOfNights}{" "}
                    {numberOfNights === 1 ? "Night" : "Nights"}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-serif font-bold text-primary">
                      {formatPrice(calculateTotalPrice(selectedRoom))}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(calculateOriginalTotalPrice(selectedRoom))}
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

          <p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
            <Check className="h-3 w-3 text-green-500" />
            <span>Best Price Guarantee • Instant Confirmation</span>
          </p>
        </div>
      </div>
       {visibleBookingPartners.length > 0 && (
        <div className="hotel-sidebar-card">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center">
            View on Other Platforms
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {visibleBookingPartners.map((partner) => {
              const fallbackLogo =
                PARTNER_LOGOS[normalizePartnerName(partner.title)] ||
                genericPartnerLogo;
              const logoSrc = partner?.icon?.url || fallbackLogo;

              return (
                <a
                  key={partner.id}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hotel-partner-link group"
                  title={partner.title || "Booking Partner"}
                >
                  <div className="flex h-7 w-12 items-center justify-center overflow-hidden rounded bg-white">
                    <img
                      src={logoSrc}
                      alt={partner.title || "Booking Partner"}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="max-w-[120px] truncate text-[11px] font-bold text-foreground">
                    {partner.title || "Booking Partner"}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100" />
                </a>
              );
            })}
          </div>
        </div>
      )}
      {/* MAP PREVIEW CARD */}
      <div className="hotel-sidebar-map-card group">
        {/* MAP IFRAME PREVIEW */}
        <div className="h-44 relative w-full overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={getMapEmbedUrl()}
            className="w-full h-full scale-110 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
          />

          {/* Dim overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />

          {/* Bouncing pin */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-1">
              <div className="bg-white text-primary p-2.5 rounded-full shadow-xl animate-bounce ring-4 ring-white/30">
                <MapPin className="w-4 h-4" />
              </div>
              {/* Pin shadow */}
              <div className="w-2 h-1 bg-black/20 rounded-full blur-sm" />
            </div>
          </div>

          {/* Bottom gradient with location text */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none">
            <p className="text-white text-xs font-semibold flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0 text-red-400" />
              {hotel.location}, {hotel.city}
            </p>
          </div>
        </div>

        {/* FOOTER BUTTON */}
        <div className="hotel-sidebar-map-footer">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-semibold"
            onClick={() => scrollToSection("location")}
          >
            <MapPin className="w-3 h-3 mr-1.5" />
            View Full Map
          </Button>

          {/* Open in Google Maps externally */}
          <a
            href={
              hotel.addressUrl ||
              (hotel.coordinates
                ? `https://www.google.com/maps?q=${hotel.coordinates.lat},${hotel.coordinates.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.location}`)}`)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="hotel-sidebar-map-action"
            title="Open in Google Maps"
          >
            <Navigation className="w-3 h-3" />
          </a>
        </div>
      </div>
      {/* Reviews Snapshot */}
      {hotel.rating && (
        <div className="hotel-sidebar-card">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Guest Reviews
            <span
              className="hotel-sidebar-link"
              onClick={() => scrollToSection("reviews")}
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
                {hotel.verifiedReviews || 0} Verified Reviews
              </p>
            </div>
          </div>
          {/* <p className="text-xs text-muted-foreground">
            Based on {hotel.verifiedReviews || 0} verified reviews
          </p> */}
        </div>
      )}
      {/* Amenities Snapshot */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="hotel-sidebar-card">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Top Amenities
            <span
              className="hotel-sidebar-link"
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
        <div className="hotel-sidebar-card">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between">
            Nearby
            <span
              className="hotel-sidebar-link"
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
                  {resolvedCheckIn}
                </span>
              </span>
              <span>
                Out:{" "}
                <span className="text-foreground font-medium">
                  {resolvedCheckOut}
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

      {/* WhatsApp Button */}
      <Button
        variant="outline"
        className="hotel-whatsapp-button"
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
