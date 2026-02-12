import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, Calendar, Search, Star, ArrowRight, ChevronLeft, ChevronRight, Home, Users, Wifi } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom CSS for Leaflet popups
const customPopupStyles = `
  .leaflet-popup-content-wrapper {
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  .leaflet-popup-content {
    margin: 8px;
    min-width: 200px;
  }
  .leaflet-popup-tip {
    display: none;
  }
  .custom-popup .leaflet-popup-close-button {
    display: none;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = customPopupStyles;
  if (!document.querySelector('style[data-leaflet-custom]')) {
    styleEl.setAttribute('data-leaflet-custom', 'true');
    document.head.appendChild(styleEl);
  }
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  image: any;
  price: string;
  rating: string;
  reviews: number;
  description: string;
  amenities: string[];
  features?: string[];
  rooms: number;
  checkIn: string;
  checkOut: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface CollectionSectionProps {
  filteredHotels: Hotel[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  cities: string[];
  showCityDropdown: boolean;
  setShowCityDropdown: (show: boolean) => void;
  onHotelSelect: (hotel: Hotel) => void;
}

// Map controller component to handle center changes
function MapViewController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 2.0, // Slower, smoother transition (2 seconds)
      easeLinearity: 0.1 // Smoother easing
    });
  }, [center, zoom, map]);

  return null;
}

export default function CollectionSection({
  filteredHotels,
  selectedCity,
  setSelectedCity,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  handleSearch,
  isSearching,
  cities,
  showCityDropdown,
  setShowCityDropdown,
  onHotelSelect,
}: CollectionSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Auto-cycle through properties every 5 seconds
  useEffect(() => {
    if (filteredHotels.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredHotels.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredHotels.length, isPaused]);

  // Reset index when filtered hotels change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredHotels]);

  const currentHotel = filteredHotels[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredHotels.length) % filteredHotels.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredHotels.length);
  };

  // Create custom red icon
  const createRedIcon = (isActive: boolean = false) => {
    return new L.Icon({
      iconUrl: isActive
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: isActive ? [35, 57] : [25, 41],
      iconAnchor: isActive ? [17, 57] : [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  if (filteredHotels.length === 0) {
    return (
      <section id="collection" className="py-8 bg-secondary/5">
        <div className="container mx-auto px-6">
          <div className="text-center py-20">
            <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-lg text-muted-foreground">No properties found matching your criteria.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="collection" className="py-8 bg-secondary/5 relative">
      <div className="container mx-auto px-6">
        {/* Slim Compact Header with Full Width Background */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Title */}
            <div className="flex-shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                Discover
              </span>
              <h2 className="text-xl md:text-2xl font-serif text-foreground">Our Collection</h2>
            </div>

            {/* Right: Compact Inline Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Location Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-full outline-none hover:border-primary/50 transition-colors text-xs shadow-sm"
                >
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="font-medium">{selectedCity}</span>
                  <ArrowRight
                    className={`w-2.5 h-2.5 text-muted-foreground transition-transform ${showCityDropdown ? "rotate-90" : ""
                      }`}
                  />
                </button>
                {showCityDropdown && (
                  <div className="absolute top-full mt-1 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowCityDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-secondary/50 transition-colors ${selectedCity === city ? "bg-secondary/30 font-semibold" : ""
                          }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-in Date */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full shadow-sm">
                <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  placeholder="Check-in"
                  className="bg-transparent outline-none text-xs font-medium w-24"
                />
              </div>

              {/* Check-out Date */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full shadow-sm">
                <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  placeholder="Check-out"
                  className="bg-transparent outline-none text-xs font-medium w-24"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors uppercase tracking-wider text-xs font-bold disabled:opacity-50 shadow-sm"
              >
                {isSearching ? (
                  <Search className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Search className="w-3 h-3" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content: Property Card (50%) + Map (50%) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
          {/* LEFT: Single Property Card with Navigation - 50% */}
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Property Card */}
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Image Section */}
              <div className="relative h-[240px] overflow-hidden group">
                <OptimizedImage
                  {...currentHotel.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    <span className="text-xs font-bold text-gray-900">{currentHotel.rating}</span>
                    <span className="text-[10px] text-gray-600">({currentHotel.reviews})</span>
                  </div>

                  <div className="bg-primary/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                    <span className="text-[10px] font-bold text-primary-foreground">
                      {currentIndex + 1} / {filteredHotels.length}
                    </span>
                  </div>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-white/90" />
                    <span className="text-xs opacity-90">{currentHotel.location}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-1">
                    {currentHotel.name}
                  </h3>
                  <p className="text-xs opacity-80 line-clamp-2">
                    {currentHotel.description}
                  </p>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10"
                  aria-label="Previous Property"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10"
                  aria-label="Next Property"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Details Section */}
              <div className="p-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border">
                  <div className="text-center">
                    <Home className="w-4 h-4 text-primary mx-auto mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Rooms</p>
                    <p className="text-xs font-bold text-foreground">{currentHotel.rooms}</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-4 h-4 text-primary mx-auto mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Guests</p>
                    <p className="text-xs font-bold text-foreground">{currentHotel.rooms * 2}</p>
                  </div>
                  <div className="text-center">
                    <Wifi className="w-4 h-4 text-primary mx-auto mb-0.5" />
                    <p className="text-[10px] text-muted-foreground">Amenities</p>
                    <p className="text-xs font-bold text-foreground">{currentHotel.amenities.length}+</p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-foreground mb-2">Top Amenities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentHotel.amenities.slice(0, 6).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-secondary/50 rounded-full text-[10px] font-medium text-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Starting from</p>
                    <p className="text-2xl font-bold text-primary">
                      {currentHotel.price}
                      <span className="text-xs text-muted-foreground font-normal">/night</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/hotels/${currentHotel.city}`, {
                      state: {
                        hotelId: currentHotel.id,
                        hotelSlug: currentHotel.id,
                        city: currentHotel.city,
                        selectedDates: { checkIn: checkInDate, checkOut: checkOutDate },
                        guests: 2,
                        rooms: 1
                      }
                    })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {filteredHotels.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${idx === currentIndex
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-border hover:bg-primary/50'
                    }`}
                  aria-label={`Go to property ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Interactive Map - 50% */}
          <div className="lg:sticky lg:top-6">
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-card">
              <MapContainer
                center={[currentHotel.coordinates.lat, currentHotel.coordinates.lng]}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ zIndex: 1 }}
              >
                {/* Map Tiles */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Map View Controller - follows current hotel */}
                <MapViewController
                  center={[currentHotel.coordinates.lat, currentHotel.coordinates.lng]}
                  zoom={12}
                />

                {/* Hotel Markers */}
                {filteredHotels.map((hotel, idx) => {
                  const isActive = idx === currentIndex;
                  const markerIcon = createRedIcon(isActive);

                  return (
                    <Marker
                      key={hotel.id}
                      position={[hotel.coordinates.lat, hotel.coordinates.lng]}
                      icon={markerIcon}
                      eventHandlers={{
                        click: () => setCurrentIndex(idx),
                        mouseover: (e) => {
                          e.target.openPopup();
                        },
                        mouseout: (e) => {
                          e.target.closePopup();
                        },
                      }}
                    >
                      <Popup
                        closeButton={false}
                        className="custom-popup"
                        autoClose={false}
                        closeOnClick={false}
                      >
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between">
                            <p className="font-serif text-sm font-bold text-foreground line-clamp-1">
                              {hotel.name}
                            </p>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full flex-shrink-0">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-bold">{hotel.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1 text-red-500 flex-shrink-0" />
                            <span className="line-clamp-1">{hotel.location}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground">Starting from</span>
                            <span className="text-base font-bold text-primary">{hotel.price}</span>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentIndex(idx);
                              navigate(`/hotels/${hotel.city}`, {
                                state: {
                                  hotelId: hotel.id,
                                  hotelSlug: hotel.id,
                                  city: hotel.city,
                                  selectedDates: { checkIn: checkInDate, checkOut: checkOutDate },
                                  guests: 2,
                                  rooms: 1
                                }
                              });
                            }}
                            className="w-full text-xs bg-primary text-primary-foreground font-bold py-2 rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                          >
                            View Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="mt-3 bg-card border border-border rounded-lg p-2 shadow-sm">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                  <span className="text-muted-foreground">Current Property</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full border border-white shadow-sm" />
                  <span className="text-muted-foreground">Other Properties</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}