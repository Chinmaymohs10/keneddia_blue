import { useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Share2,
  Heart,
  Check,
  Info,
  ChevronRight,
  Utensils,
  Map as MapIcon,
  Navigation,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getHotelById, allHotels } from "@/data/hotelData";
import { siteContent } from "@/data/siteContent";
import PropertyMap from "@/modules/website/components/PropertyMap";
import FindYourStay from "@/modules/website/components/FindYourStay";
import HotelStickyNav from "@/modules/website/components/HotelStickyNav";
import RoomList from "@/modules/website/components/RoomList";
import { Button } from "@/components/ui/button";

// New Optimization Components
import RightSidebar from "@/modules/website/components/hotel-detail/RightSidebar";
import GalleryModal from "@/modules/website/components/hotel-detail/GalleryModal";
import ReviewsSection from "@/modules/website/components/hotel-detail/ReviewsSection";
import MobileBookingBar from "@/modules/website/components/Mobilebookingbar";

export default function HotelDetail() {
  const params = useParams<{ city: string; propertyId: string }>();

  const city = params.city!;
  const propertyId = Number(params.propertyId);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    selectedDates?: { checkIn: string; checkOut: string };
    guests?: number;
    rooms?: number;
    guestsDetails?: { adults: number; children: number; rooms: number };
  } | null;

  // Find hotel by city name (case-insensitive) or ID as fallback
  const hotel = city
    ? allHotels.find(
        (h) =>
          h.city.toLowerCase() === city.toLowerCase() ||
          h.id === city.toLowerCase(),
      )
    : null;
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4">Hotel Not Found</h1>
          <button
            onClick={() => navigate("/hotels")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Hotels
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "room-options", label: "Room Options" },
    { id: "about-hotel", label: "About Hotel" },
    { id: "upcoming-events", label: "Upcoming Events" },
    { id: "amenities", label: "Amenities" },
    { id: "food-dining", label: "Food & Dining" },
    { id: "guest-reviews", label: "Guest Reviews" },
    { id: "location", label: "Location" },
    { id: "policies", label: "Guest Policies" },
  ];

  const openGallery = (index: number) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const selectedRoom = selectedRoomId
    ? hotel.roomTypes.find((r) => r.id === selectedRoomId) || null
    : null;

  const scrollToRoomOptions = () => {
    const element = document.getElementById("room-options");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20 pb-24 lg:pb-0">
      <Navbar logo={siteContent.brand.logo_hotel} />

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        hotel={hotel}
        initialImageIndex={initialGalleryIndex}
      />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/hotels" className="hover:text-foreground">
            Hotels
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{hotel.name}</span>
        </div>
      </div>

      {/* TOP SECTION: Header & Media */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Header Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              {/* Left Side - Main Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">
                    5 Star Luxury
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                  {hotel.name}
                </h1>

                {/* Location Only */}
                <div className="mb-4 space-y-2">
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {hotel.location}
                    <span
                      className="text-primary hover:underline cursor-pointer text-xs font-semibold ml-2"
                      onClick={() =>
                        document
                          .getElementById("location")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      View Map
                    </span>
                  </p>

                  {/* Nearby Landmark Info - Moved Here */}
                  {hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-green-500" />{" "}
                        {hotel.nearbyPlaces[0].distance} from{" "}
                        {hotel.nearbyPlaces[0].name}
                      </span>
                      {hotel.nearbyPlaces.length > 1 && (
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-green-500" />{" "}
                          {hotel.nearbyPlaces[1].distance} from{" "}
                          {hotel.nearbyPlaces[1].name}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
                    {hotel.rating} <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span
                    className="text-sm font-medium underline cursor-pointer hover:text-primary transition-colors"
                    onClick={() =>
                      document
                        .getElementById("guest-reviews")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    {hotel.reviews} Verified Reviews
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                {/* Share & Like Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] mb-8 rounded-xl overflow-hidden">
          {/* Main Image */}
          <div
            className="md:col-span-2 h-full relative group cursor-pointer"
            onClick={() => openGallery(0)}
          >
            <OptimizedImage
              {...hotel.image}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          </div>

          {/* Room Image */}
          <div className="md:col-span-1 flex flex-col gap-2 h-full">
            <div
              className="h-1/2 relative cursor-pointer overflow-hidden group"
              onClick={() => openGallery(1)}
            >
              <OptimizedImage
                src={hotel.roomTypes[0]?.image.src || hotel.image.src}
                alt="Room"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div
              className="h-1/2 relative cursor-pointer overflow-hidden group"
              onClick={() => openGallery(2)}
            >
              <OptimizedImage
                src={hotel.dining?.[0]?.image?.src || hotel.image.src}
                alt="Dining"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>

          {/* More Photos */}
          <div className="md:col-span-1 flex flex-col gap-2 h-full">
            <div
              className="h-1/2 relative cursor-pointer overflow-hidden group"
              onClick={() => openGallery(3)}
            >
              <OptimizedImage
                src={siteContent.images.hero.slide2.src}
                alt="Lobby"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div
              className="h-1/2 relative cursor-pointer group overflow-hidden"
              onClick={() => openGallery(0)}
            >
              <OptimizedImage
                src={siteContent.images.hero.slide3.src}
                alt="Pool"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-colors group-hover:bg-black/40">
                <span className="text-white font-medium border border-white/50 px-3 py-1 rounded backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  View All Photos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <FindYourStay
          initialDate={
            state?.selectedDates?.checkIn && state?.selectedDates?.checkOut
              ? {
                  from: new Date(state.selectedDates.checkIn),
                  to: new Date(state.selectedDates.checkOut),
                }
              : undefined
          }
          initialGuests={
            state?.guestsDetails ||
            (state?.guests
              ? {
                  adults: state.guests,
                  children: 0,
                  rooms: state.rooms || 1,
                }
              : undefined)
          }
        />
      </div>

      {/* Sticky Navigation */}
      <HotelStickyNav sections={sections} />

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 md:px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* LEFT COLUMN: Main Information */}
        <div className="space-y-12">
          {/* Room Options */}
          <section id="room-options" className="scroll-mt-40">
            <h2 className="text-2xl font-serif font-bold mb-6">
              Choose Your Room
            </h2>
            {/* Mobile Filter Chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
              <span className="px-3 py-1 bg-secondary border border-border rounded-full text-xs font-medium whitespace-nowrap">
                Free Cancellation
              </span>
              <span className="px-3 py-1 bg-secondary border border-border rounded-full text-xs font-medium whitespace-nowrap">
                Breakfast Included
              </span>
              <span className="px-3 py-1 bg-secondary border border-border rounded-full text-xs font-medium whitespace-nowrap">
                Pay at Hotel
              </span>
            </div>
            <RoomList
              rooms={hotel.roomTypes}
              selectedRoomId={selectedRoomId}
              onSelectRoom={(id) =>
                setSelectedRoomId(id === selectedRoomId ? null : id)
              }
            />
          </section>

          {/* About Hotel */}
          <section
            id="about-hotel"
            className="scroll-mt-40 pt-8 border-t border-border"
          >
            <h2 className="text-2xl font-serif font-bold mb-4">
              About {hotel.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {hotel.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hotel.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-secondary/10 p-4 rounded-lg border border-border/50 text-center hover:bg-secondary/20 transition-colors"
                >
                  <Star className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section
            id="upcoming-events"
            className="scroll-mt-40 pt-8 border-t border-border"
          >
            <h2 className="text-2xl font-serif font-bold mb-6">
              Upcoming Events
            </h2>
            {hotel.events && hotel.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotel.events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:border-primary/40 transition-all duration-300 group"
                  >
                    <div className="h-56 relative cursor-pointer overflow-hidden">
                      {/* Video/Reel Support Placeholder Logic */}
                      {event.mediaType === "video" ||
                      event.mediaType === "reel" ? (
                        // If videoSrc existed, we would render a video tag here.
                        // Using Image with Play Overlay as we don't have video URLs in data yet.
                        <>
                          <OptimizedImage
                            {...event.image}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover:bg-primary group-hover:border-primary transition-colors">
                              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <OptimizedImage
                          {...event.image}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                      {event.tag && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                            {event.tag}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-3 text-xs text-white/90 mb-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" /> {event.date}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Check className="w-3.5 h-3.5" /> {event.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col bg-card relative">
                      <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        Join us for an exclusive experience. Limited seats
                        available.
                      </p>

                      <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                          View Details
                        </span>
                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/5 rounded-xl border border-border/50">
                <p className="text-muted-foreground">
                  No upcoming events available
                </p>
              </div>
            )}
          </section>

          {/* Amenities */}
          <section
            id="amenities"
            className="scroll-mt-40 pt-8 border-t border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold">Amenities</h2>
              <Button variant="link" className="text-primary h-auto p-0">
                View All Amenities
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
              {hotel.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-foreground">{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Food & Dining */}
          <section
            id="food-dining"
            className="scroll-mt-40 pt-8 border-t border-border"
          >
            <h2 className="text-2xl font-serif font-bold mb-6">
              Food & Dining
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotel.dining?.map((place, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div
                    className="h-40 relative group cursor-pointer"
                    onClick={() => openGallery(2)}
                  >
                    {place.image ? (
                      <OptimizedImage
                        {...place.image}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-serif font-bold mb-1">
                      {place.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {place.cuisine}
                    </p>
                    <div className="mt-auto pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">Open:</span>{" "}
                      {place.timings}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Guest Reviews */}
          <section
            id="guest-reviews"
            className="scroll-mt-40 pt-8 border-t border-border"
          >
            <ReviewsSection />
          </section>

          {/* Location */}
          <section
            id="location"
            className="scroll-mt-40 pt-8 border-t border-border"
          >
            <h2 className="text-2xl font-serif font-bold mb-6">Location</h2>
            <p className="text-muted-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {hotel.location}, {hotel.city}
            </p>
            <PropertyMap property={hotel} />

            {/* Nearby Places */}
            {hotel.nearbyPlaces && (
              <div className="mt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">
                  Nearby Places
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hotel.nearbyPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{place.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {place.type}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {place.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Guest Policies */}
          <section
            id="policies"
            className="scroll-mt-40 pt-8 border-t border-border"
          >
            <h2 className="text-2xl font-serif font-bold mb-6">
              Guest Policies
            </h2>
            <div className="bg-secondary/5 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border border-border/50">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Check-in / Check-out
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>
                    Check-in:{" "}
                    <span className="text-foreground font-medium">
                      {hotel.checkIn}
                    </span>
                  </li>
                  <li>
                    Check-out:{" "}
                    <span className="text-foreground font-medium">
                      {hotel.checkOut}
                    </span>
                  </li>
                  <li>Minimum Age: {hotel.policies?.checkInAge || 18} years</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Other Policies
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>
                    Pets:{" "}
                    <span className="text-foreground font-medium">
                      {hotel.policies?.pets ? "Allowed" : "Not Allowed"}
                    </span>
                  </li>
                  <li>Cancellation: {hotel.policies?.cancellation}</li>
                  <li>
                    Extra Bed:{" "}
                    {hotel.policies?.extraBed
                      ? "Available on request"
                      : "Not available"}
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar (Desktop Only) */}
        <div className="hidden lg:block relative z-10">
          <RightSidebar hotel={hotel} selectedRoom={selectedRoom} />
        </div>
      </div>

      {/* Mobile Booking Bar (Mobile Only) */}
      <MobileBookingBar
        hotel={hotel}
        selectedRoom={selectedRoom}
        onSelectRoom={scrollToRoomOptions}
      />

      <Footer />
    </div>
  );
}
