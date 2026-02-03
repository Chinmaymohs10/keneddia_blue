import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  MapPin,
  Search,
  Users,
  Minus,
  Plus,
  Map,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CalendarComponent from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup as MapPopup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Data
import { CITIES, HOTELS_DATA, Hotel } from "@/data/hotelsData";

const ITEMS_PER_PAGE = 3;

// Leaflet Icon Fix
const markerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function QuickBooking() {
  const navigate = useNavigate();

  // Popover open states for controlled closing
  const [locationOpen, setLocationOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  // Search State
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  // Dialog State
  const [showMap, setShowMap] = useState<Hotel | null>(null);

  // Results State
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Handlers with auto-close
  const handleLocationSelect = (city: string) => {
    setLocation(city);
    setLocationOpen(false);
  };
  const RESAVENUE_CONFIG = {
    baseUrl: "https://bookings.resavenue.com/resBooking4/searchRooms",
    defaultRegCode: "TXGZ0113",
    dateFormat: "dd/MM/yyyy",
  };

  const generateResAvenueUrl = ({
    checkIn,
    checkOut,
    adults,
    regCode = RESAVENUE_CONFIG.defaultRegCode,
  }: {
    checkIn?: Date;
    checkOut?: Date;
    adults: number;
    regCode?: string;
  }) => {
    if (!checkIn || !checkOut) return null;

    const arrDate = format(checkIn, RESAVENUE_CONFIG.dateFormat);
    const depDate = format(checkOut, RESAVENUE_CONFIG.dateFormat);

    const params = new URLSearchParams({
      targetTemplate: "4",
      regCode,
      curr: "INR",

      // legacy-required fields (MUST MATCH HTML)
      arrDate,
      depDate,
      arr_date: arrDate,
      dep_date: depDate,

      // optional but safe
      adult_1: String(adults ?? 1),
    });

    return `${RESAVENUE_CONFIG.baseUrl}?${params.toString()}`;
  };


  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    if (date) {
      setCheckInOpen(false);
      // Auto-open checkout if not set
      if (!checkOut) {
        setTimeout(() => setCheckOutOpen(true), 150);
      }
    }
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    setCheckOut(date);
    if (date) {
      setCheckOutOpen(false);
    }
  };

  // Search Handler
  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);

    let filtered = HOTELS_DATA;
    if (location) {
      filtered = HOTELS_DATA.filter((h) => h.city === location);
    }

    if (filtered.length === 1) {
      handleBook(filtered[0]); // now redirects externally
    } else {
      setSearchResults(filtered);
    }
  };


  const handleBook = (hotel: Hotel) => {
    const bookingUrl = generateResAvenueUrl({
      checkIn,
      checkOut,
      adults: guests.adults,
      regCode: hotel.regCode || RESAVENUE_CONFIG.defaultRegCode,
    });

    if (!bookingUrl) {
      console.warn("Booking URL not generated. Missing dates.");
      return;
    }

    window.open(bookingUrl, "_blank", "noopener,noreferrer");
  };


  // Pagination Logic
  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const paginatedHotels = searchResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 -mt-10 relative z-30 mb-12">
      <motion.div
        layout
        className="bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md"
      >
        {/* Header */}
        <div className="p-6 bg-primary/5 border-b border-border/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-medium text-foreground">Find Your Stay</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Best Prices Guaranteed</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Search Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {/* Location Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Location
              </label>
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors",
                      !location && "text-muted-foreground"
                    )}
                  >
                    <span className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-primary" />
                      {location || "Select City"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                  <div className="p-2 border-b border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Select Location
                    </p>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    <div
                      className={cn(
                        "px-3 py-2.5 cursor-pointer text-sm font-medium transition-colors flex items-center gap-2",
                        location === ""
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleLocationSelect("")}
                    >
                      <MapPin className="w-4 h-4" />
                      All Locations
                    </div>
                    {CITIES.map((city) => (
                      <div
                        key={city}
                        className={cn(
                          "px-3 py-2.5 cursor-pointer text-sm transition-colors flex items-center gap-2",
                          location === city
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted"
                        )}
                        onClick={() => handleLocationSelect(city)}
                      >
                        <MapPin className="w-4 h-4 opacity-50" />
                        {city}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-in */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Check-in
              </label>
              <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select Date"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-xl" align="start" sideOffset={8}>
                  <div className="p-3 border-b bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">Select Check-in Date</p>
                  </div>
                  <CalendarComponent
                    value={checkIn}
                    onChange={(value) => {
                      if (value instanceof Date) {
                        handleCheckInSelect(value);
                      }
                    }}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 365)}
                  />

                  {checkIn && (
                    <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Selected: <span className="font-medium text-foreground">{format(checkIn, "MMM dd, yyyy")}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setCheckIn(undefined)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Check-out
              </label>
              <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select Date"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-xl" align="start" sideOffset={8}>
                  <div className="p-3 border-b bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">Select Check-out Date</p>
                  </div>
                  <CalendarComponent
                    value={checkOut}
                    onChange={(value) => {
                      if (value instanceof Date) {
                        handleCheckOutSelect(value);
                      }
                    }}
                    minDate={checkIn ? addDays(checkIn, 1) : new Date()}
                    maxDate={addDays(new Date(), 365)}
                  />

                  <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
                    {checkIn && (
                      <span className="text-xs text-muted-foreground">
                        Check-in: <span className="font-medium text-foreground">{format(checkIn, "MMM dd")}</span>
                      </span>
                    )}
                    {checkOut && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs ml-auto"
                        onClick={() => setCheckOut(undefined)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Guest Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Guests & Rooms
              </label>
              <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors"
                  >
                    <span className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-primary" />
                      {guests.adults + guests.children} Guests, {guests.rooms} Room
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-3 border-b border-border/50">
                    <p className="text-sm font-semibold">Guests & Rooms</p>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Adults</p>
                        <p className="text-xs text-muted-foreground">Ages 13+</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGuests((prev) => ({
                              ...prev,
                              adults: Math.max(1, prev.adults - 1),
                            }))
                          }
                          disabled={guests.adults <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {guests.adults}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGuests((prev) => ({
                              ...prev,
                              adults: prev.adults + 1,
                            }))
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Children</p>
                        <p className="text-xs text-muted-foreground">Ages 2-12</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGuests((prev) => ({
                              ...prev,
                              children: Math.max(0, prev.children - 1),
                            }))
                          }
                          disabled={guests.children <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {guests.children}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGuests((prev) => ({
                              ...prev,
                              children: prev.children + 1,
                            }))
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div>
                        <p className="text-sm font-medium">Rooms</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGuests((prev) => ({
                              ...prev,
                              rooms: Math.max(1, prev.rooms - 1),
                            }))
                          }
                          disabled={guests.rooms <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {guests.rooms}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            setGuests((prev) => ({
                              ...prev,
                              rooms: prev.rooms + 1,
                            }))
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Done Button */}
                  <div className="p-3 border-t border-border/50 bg-muted/30">
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => setGuestsOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold uppercase tracking-wide text-base shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="w-4 h-4" />
                Book
              </Button>
            </div>
          </div>

          {/* Selected Summary */}
          {(location || checkIn || checkOut) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 mb-4"
            >
              {location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  {location}
                  <button
                    onClick={() => setLocation("")}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {checkIn && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Calendar className="w-3 h-3" />
                  {format(checkIn, "MMM dd")}
                  {checkOut && ` - ${format(checkOut, "MMM dd")}`}
                  <button
                    onClick={() => {
                      setCheckIn(undefined);
                      setCheckOut(undefined);
                    }}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </motion.div>
          )}

          {/* Search Results Area */}
          {hasSearched && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border/10 pt-6"
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Available Properties in {location || "All Locations"} ({searchResults.length})
              </h4>

              <div className="space-y-3">
                {paginatedHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-background border border-border/50 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md hover:border-primary/30 transition-all gap-4"
                  >
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-serif text-lg font-medium">
                          {hotel.name}
                        </h5>
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {hotel.rating} ★
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {hotel.location},{" "}
                        {hotel.city}
                      </p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-secondary/30 px-2 py-0.5 rounded text-muted-foreground"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 md:border-l md:pl-4 border-border/10">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">
                          Starting from
                        </p>
                        <p className="text-lg font-bold text-primary">
                          ₹{hotel.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleBook(hotel)}
                          className="w-full md:w-auto px-6"
                        >
                          Book Now
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] text-muted-foreground hover:text-primary gap-1"
                          onClick={() => setShowMap(hotel)}
                        >
                          <Map className="w-3 h-3" /> Show on Map
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm flex items-center px-3 bg-muted rounded-md">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {hasSearched && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-t border-border/10 pt-6 mt-6">
              <p>No hotels found matching your criteria.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Map Dialog */}
      <Dialog open={!!showMap} onOpenChange={(open) => !open && setShowMap(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden h-[500px]">
          {showMap && (
            <div className="w-full h-full relative">
              <MapContainer
                center={[showMap.coordinates.lat, showMap.coordinates.lng]}
                zoom={14}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[showMap.coordinates.lat, showMap.coordinates.lng]}
                  icon={markerIcon}
                >
                  <MapPopup>
                    <div className="text-center">
                      <h3 className="font-bold">{showMap.name}</h3>
                      <p className="text-xs">{showMap.location}</p>
                    </div>
                  </MapPopup>
                </Marker>
              </MapContainer>
              <div className="absolute top-4 right-4 z-[400] bg-white p-4 rounded-lg shadow-lg max-w-xs">
                <h3 className="font-bold text-lg mb-1">{showMap.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {showMap.location}
                </p>
                <Button
                  onClick={() => {
                    setShowMap(null);
                    handleBook(showMap);
                  }}
                  className="w-full"
                >
                  Book This Property
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}