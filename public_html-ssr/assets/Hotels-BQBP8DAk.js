import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Grid3x3, Map, MapPin, ArrowRight, Building2, Star, ChevronLeft, ChevronRight, Home, Users, Wifi, Tag, Loader2, ExternalLink, Clock, ArrowUpRight, Edit2, User, Youtube, X, Video, ImageIcon, VolumeX, Volume2, Search, ChevronDown, Calendar, Minus, Plus, BedDouble, Maximize, Sparkles, Image, MessageCircle } from "lucide-react";
import { O as OptimizedImage, G as GetAllPropertyDetails, c as createCitySlug, a as createHotelSlug, b as OfferVideo, g as getDailyOffers, d as getPropertyTypeById, e as getAllNews, f as getGuestExperienceSectionHeader, h as getGuestExperineceRatingHeader, i as getGuestExperienceSection, j as createGuestExperienceByGuest, B as Button, k as cn, D as Dialog, l as DialogContent, m as getLocationsByType, s as searchRooms, n as DialogHeader, o as DialogTitle, p as DialogDescription, I as Input, T as Textarea, q as getPropertyTypes, r as getEventsUpdated, t as getGroupBookings, u as createGroupBookingEnquiry, v as buildEventDetailPath, w as siteContent, N as Navbar, F as Footer, x as getHotelHomepageHeroSection, y as getAboutUsByPropertyType } from "../entry-server.js";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
/* empty css                 */
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, EffectFade } from "swiper/modules";
import { P as Popover, a as PopoverTrigger, b as PopoverContent, C as Calendar$1 } from "./calendar-BxWrXvmW.js";
import { format, addDays } from "date-fns";
import { toast } from "react-hot-toast";
import "react-dom/server";
import "react-router";
import "@tanstack/react-query";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "react-toastify";
import "@radix-ui/react-dialog";
import "cmdk";
import "axios";
import "@radix-ui/react-slot";
import "@radix-ui/react-avatar";
import "@radix-ui/react-label";
import "@heroicons/react/24/outline";
import "@heroicons/react/24/solid";
import "@radix-ui/react-popover";
import "react-calendar";
const getAmenityName = (amenity) => {
  if (typeof amenity === "string") return amenity;
  if (amenity && typeof amenity === "object" && "name" in amenity && typeof amenity.name === "string") {
    return amenity.name;
  }
  return null;
};
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
const mapApiToHotelUI = (item) => {
  const parent = item.propertyResponseDTO;
  const listing = item.propertyListingResponseDTOS?.find(
    (l) => l.isActive
  );
  const basePrice = listing?.price || 0;
  const discount = listing?.discountAmount || 0;
  const gstPercent = listing?.gstPercentage || 0;
  const discountPercent = basePrice > 0 ? Math.round(discount / basePrice * 100) : 0;
  return {
    id: listing?.id ? `${parent?.id}-${listing.id}` : `property-${parent?.id}`,
    propertyId: parent?.id,
    listingId: listing?.id,
    name: parent?.propertyName || "Unnamed Property",
    location: listing?.fullAddress || parent?.address || "N/A",
    city: parent?.locationName || "Unknown",
    type: listing?.propertyType || parent?.propertyTypes?.[0] || "Hotel",
    bookingEngineUrl: parent?.bookingEngineUrl || null,
    image: {
      src: listing?.media?.[0]?.url || listing?.media?.[0] || "",
      alt: parent?.propertyName
    },
    rating: listing?.rating || 0,
    description: listing?.tagline || listing?.subTitle || "Luxury comfort in the heart of the city",
    amenities: Array.isArray(listing?.amenities) ? listing.amenities.map((amenity) => getAmenityName(amenity)).filter(Boolean) : [],
    // Dynamic Capacity and Rooms
    rooms: listing?.capacity || 1,
    capacity: listing?.capacity || parent?.capacity || 0,
    pricing: {
      basePrice,
      discount,
      discountPercent,
      gstPercent
    },
    // Dynamic Coordinates from propertyResponseDTO
    coordinates: {
      lat: parent?.latitude || 20.5937,
      lng: parent?.longitude || 78.9629
    },
    isActive: parent?.isActive && (listing ? listing.isActive : true)
  };
};
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = customPopupStyles;
  if (!document.querySelector("style[data-leaflet-custom]")) {
    styleEl.setAttribute("data-leaflet-custom", "true");
    document.head.appendChild(styleEl);
  }
}
const calculatePricing = (pricing) => {
  const subtotal = (pricing.basePrice || 0) - (pricing.discount || 0);
  const gst = Math.round(subtotal * ((pricing.gstPercent || 0) / 100));
  const total = subtotal + gst;
  return {
    basePrice: pricing.basePrice || 0,
    discount: pricing.discount || 0,
    subtotal,
    gst,
    total
  };
};
function PriceBreakdown({
  pricing,
  calculated
}) {
  const [showDetails, setShowDetails] = useState(false);
  return /* @__PURE__ */ jsx("div", { className: "py-2.5 border-y border-border", children: !showDetails ? /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(Tag, { className: "w-3 h-3 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Pricing" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground line-through", children: [
          "₹",
          calculated.basePrice.toLocaleString("en-IN")
        ] }),
        pricing.discountPercent > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold", children: [
          pricing.discountPercent,
          "% OFF"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-primary", children: [
          "₹",
          calculated.total.toLocaleString("en-IN")
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[8px] text-muted-foreground", children: "per night (incl. taxes)" })
      ] })
    ] })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Tag, { className: "w-3 h-3 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground", children: "Price Breakdown" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowDetails(false),
          className: "text-[9px] text-primary hover:underline font-medium",
          children: "Hide Details"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Base Price" }),
      /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
        "₹",
        calculated.basePrice.toLocaleString("en-IN")
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [
        pricing.discountLabel,
        pricing.discountPercent > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold", children: [
          pricing.discountPercent,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "font-medium text-green-600", children: [
        "- ₹",
        calculated.discount.toLocaleString("en-IN")
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs pb-1.5 border-b border-border/50", children: [
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
      /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
        "₹",
        calculated.subtotal.toLocaleString("en-IN")
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[10px]", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
        "GST (",
        pricing.gstPercent,
        "%)"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
        "₹",
        calculated.gst.toLocaleString("en-IN")
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1.5 border-t border-border bg-primary/5 -mx-2 px-2 py-1.5 rounded-lg mt-1.5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-foreground", children: "Total Amount" }),
        /* @__PURE__ */ jsx("p", { className: "text-[8px] text-muted-foreground", children: "per night (all taxes incl.)" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-primary", children: [
        "₹",
        calculated.total.toLocaleString("en-IN")
      ] })
    ] })
  ] }) });
}
function MapViewController({
  center,
  zoom
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 2,
      easeLinearity: 0.1
    });
  }, [center, zoom, map]);
  return null;
}
function HotelCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("gallery");
  const [isPaused, setIsPaused] = useState(false);
  const [cities, setCities] = useState(["All Cities"]);
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await GetAllPropertyDetails();
        const rawData = response?.data?.data || response?.data || [];
        if (Array.isArray(rawData)) {
          const mappedHotels = rawData.map((item) => mapApiToHotelUI(item)).filter(
            (hotel) => hotel.isActive && hotel.type?.toLowerCase() === "hotel"
          );
          setHotels([...mappedHotels].reverse());
        }
      } catch (err) {
        console.error("Failed to load hotels", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);
  const getHotelDetailUrl = (hotel) => `/${createCitySlug(hotel.city || hotel.name)}/${createHotelSlug(hotel.name || hotel.city || "property", hotel.propertyId)}`;
  useEffect(() => {
    if (viewMode !== "gallery" || isPaused || filteredHotels.length <= 1)
      return;
    const interval = setInterval(() => {
      setActiveIndex(
        (prev) => prev === filteredHotels.length - 1 ? 0 : prev + 1
      );
    }, 5e3);
    return () => clearInterval(interval);
  }, [viewMode, isPaused, filteredHotels.length]);
  const handleBookNow = (hotel) => {
    if (!hotel.bookingEngineUrl) {
      console.warn("No booking engine URL available for this property.");
      return;
    }
    if (hotel.bookingEngineUrl.includes("checkin")) {
      window.open(hotel.bookingEngineUrl, "_blank");
      return;
    }
    const checkInDate = /* @__PURE__ */ new Date();
    const checkOutDate = /* @__PURE__ */ new Date();
    checkOutDate.setDate(checkInDate.getDate() + 1);
    const url = new URL(hotel.bookingEngineUrl);
    url.searchParams.set("checkin", checkInDate.toISOString().split("T")[0]);
    url.searchParams.set("checkout", checkOutDate.toISOString().split("T")[0]);
    url.searchParams.set("adults", "2");
    url.searchParams.set("children", "0");
    url.searchParams.set("rooms", "1");
    window.open(url.toString(), "_blank");
  };
  const goToHotelDetails = (hotel) => {
    navigate(getHotelDetailUrl(hotel));
  };
  const handlePrev = () => {
    setActiveIndex(
      (prev) => prev === 0 ? filteredHotels.length - 1 : prev - 1
    );
  };
  const handleNext = () => {
    setActiveIndex(
      (prev) => prev === filteredHotels.length - 1 ? 0 : prev + 1
    );
  };
  useEffect(() => {
    if (selectedCity === "All Cities") {
      setFilteredHotels(hotels);
    } else {
      setFilteredHotels(hotels.filter((hotel) => hotel.city === selectedCity));
    }
    setActiveIndex(0);
  }, [selectedCity, hotels]);
  if (loading) {
    return /* @__PURE__ */ jsx("section", { className: "py-6", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 lg:px-12", children: /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center text-muted-foreground", children: "Loading hotels…" }) }) });
  }
  if (filteredHotels.length === 0) {
    return /* @__PURE__ */ jsx("section", { className: "py-6", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 lg:px-12", children: /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center text-muted-foreground", children: "No hotels available." }) }) });
  }
  const activeHotel = filteredHotels[activeIndex];
  if (!activeHotel) {
    return /* @__PURE__ */ jsx("section", { className: "py-6", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 lg:px-12", children: /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center text-muted-foreground", children: "Loading hotels..." }) }) });
  }
  const activePricing = calculatePricing(activeHotel.pricing);
  const getVisibleCards = () => {
    const total = filteredHotels.length;
    if (total === 1) return [{ index: 0, position: "center" }];
    return [
      { index: (activeIndex - 1 + total) % total, position: "left" },
      { index: activeIndex, position: "center" },
      { index: (activeIndex + 1) % total, position: "right" }
    ];
  };
  const visibleCards = getVisibleCards();
  const createRedIcon = (isActive = false) => {
    return new L.Icon({
      iconUrl: isActive ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: isActive ? [35, 57] : [25, 41],
      iconAnchor: isActive ? [17, 57] : [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };
  return /* @__PURE__ */ jsx("section", { className: "py-6 bg-gradient-to-br from-background via-secondary/5 to-background relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 lg:px-12", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-xl p-4 shadow-sm mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block", children: viewMode === "gallery" ? "Premium Selection" : "Discover" }),
          /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-serif text-foreground", children: "Our Collection" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-0.5 bg-background border border-border rounded-full p-0.5 shadow-sm", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setViewMode("gallery"),
              className: `flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === "gallery" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: [
                /* @__PURE__ */ jsx(Grid3x3, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Gallery" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setViewMode("map"),
              className: `flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === "map" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: [
                /* @__PURE__ */ jsx(Map, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Map" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 pt-3 border-t border-border/50", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1", children: "Filter By:" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowCityDropdown(!showCityDropdown),
              className: "flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full outline-none hover:border-primary/50 transition-colors text-xs shadow-sm",
              children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedCity }),
                /* @__PURE__ */ jsx(
                  ArrowRight,
                  {
                    className: `w-2.5 h-2.5 text-muted-foreground transition-transform ${showCityDropdown ? "rotate-90" : ""}`
                  }
                )
              ]
            }
          ),
          showCityDropdown && /* @__PURE__ */ jsx("div", { className: "absolute top-full mt-1 left-0 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50", children: cities.map((city) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setSelectedCity(city);
                setShowCityDropdown(false);
              },
              className: `w-full px-3 py-2 text-left text-xs hover:bg-secondary/50 transition-colors ${selectedCity === city ? "bg-secondary/30 font-semibold" : ""}`,
              children: city
            },
            city
          )) })
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full outline-none hover:border-primary/50 transition-colors text-xs shadow-sm", children: [
          /* @__PURE__ */ jsx(Building2, { className: "w-3 h-3 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Hotel" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs", children: [
          /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 text-primary fill-current" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
            filteredHotels.length,
            " Properties"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: viewMode === "gallery" ? /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
        children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 items-start", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative h-[500px] flex items-center justify-center px-12",
              style: { perspective: "1000px" },
              children: [
                /* @__PURE__ */ jsx("div", { className: "relative w-full h-full flex items-center justify-center", children: visibleCards.map(({ index, position }) => {
                  const hotel = filteredHotels[index];
                  const isCenter = position === "center";
                  const isLeft = position === "left";
                  return /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: `absolute transition-all duration-700 ease-out ${isCenter ? "z-30 scale-100 opacity-100" : "z-10 scale-65 opacity-35"}`,
                      style: {
                        transform: isCenter ? "translateX(0) rotateY(0deg)" : isLeft ? "translateX(-90%) rotateY(30deg)" : "translateX(90%) rotateY(-30deg)",
                        transformStyle: "preserve-3d"
                      },
                      children: /* @__PURE__ */ jsx("div", { className: "w-[340px] max-w-[80vw] h-[380px] bg-card border-2 border-border rounded-2xl overflow-hidden shadow-2xl", children: /* @__PURE__ */ jsxs("div", { className: "relative h-full", children: [
                        /* @__PURE__ */ jsx(
                          OptimizedImage,
                          {
                            ...hotel.image,
                            className: "w-full h-full object-cover"
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
                        isCenter && /* @__PURE__ */ jsxs(Fragment, { children: [
                          /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg", children: [
                            /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 text-yellow-500 fill-current" }),
                            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-gray-900", children: hotel.rating || "N/A" })
                          ] }) }),
                          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-5 text-white", children: [
                            /* @__PURE__ */ jsx("div", { className: "inline-block px-2.5 py-0.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm rounded border border-white/30", children: hotel.type }),
                            /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-semibold mb-1", children: hotel.name }),
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs opacity-90 mb-1.5", children: [
                              /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 mr-1" }),
                              hotel.location
                            ] }),
                            /* @__PURE__ */ jsx("p", { className: "text-[11px] opacity-80 line-clamp-2 leading-relaxed", children: hotel.description })
                          ] })
                        ] })
                      ] }) })
                    },
                    `${position}-${hotel.id}`
                  );
                }) }),
                /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handlePrev,
                      className: "w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg hover:scale-110 active:scale-95",
                      children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full border border-border", children: /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold text-foreground", children: [
                    activeIndex + 1,
                    " / ",
                    filteredHotels.length
                  ] }) }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleNext,
                      className: "w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg hover:scale-110 active:scale-95",
                      children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 shadow-xl h-[500px] flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3.5 overflow-y-auto", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20", children: activeHotel.type }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 rounded-full border border-yellow-200", children: [
                    /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 text-yellow-500 fill-current" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-yellow-900", children: activeHotel.rating || "N/A" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-semibold text-foreground mb-1.5 line-clamp-2", children: activeHotel.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center text-muted-foreground mb-2.5 text-sm", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 mr-1.5" }),
                  /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: activeHotel.location })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed line-clamp-3", children: activeHotel.description })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-foreground mb-2", children: "Featured Amenities" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: activeHotel.amenities.map(
                  (amenity, idx) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "flex items-center gap-2 text-xs text-muted-foreground",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" }),
                        /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: amenity })
                      ]
                    },
                    idx
                  )
                ) })
              ] }),
              /* @__PURE__ */ jsx(
                PriceBreakdown,
                {
                  pricing: activeHotel.pricing,
                  calculated: activePricing
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2.5 mt-4", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleBookNow(activeHotel),
                  className: "w-full py-3 bg-primary text-primary-foreground font-bold uppercase rounded-lg shadow-md flex items-center justify-center gap-2 text-sm",
                  children: [
                    "Book Room ",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => goToHotelDetails(activeHotel),
                  className: "w-full py-2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors",
                  children: "View Full Details →"
                }
              )
            ] })
          ] })
        ] })
      },
      "gallery"
    ) : /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
        children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "relative",
              onMouseEnter: () => setIsPaused(true),
              onMouseLeave: () => setIsPaused(false),
              children: /* @__PURE__ */ jsxs("div", { className: "bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300", children: [
                /* @__PURE__ */ jsxs("div", { className: "relative h-[240px] overflow-hidden group", children: [
                  /* @__PURE__ */ jsx(
                    OptimizedImage,
                    {
                      ...activeHotel.image,
                      className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" }),
                  /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-3 right-3 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg", children: [
                      /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 text-yellow-500 fill-current" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-gray-900", children: activeHotel.rating || "N/A" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "bg-primary/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg", children: /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-primary-foreground", children: [
                      activeIndex + 1,
                      " / ",
                      filteredHotels.length
                    ] }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4 text-white", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-white/90" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs opacity-90", children: activeHotel.location })
                    ] }),
                    /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-bold mb-1", children: activeHotel.name }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs opacity-80 line-clamp-2", children: activeHotel.description })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handlePrev,
                      className: "absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10",
                      children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleNext,
                      className: "absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10",
                      children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx(Home, { className: "w-4 h-4 text-primary mx-auto mb-0.5" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rooms" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeHotel.rooms })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-primary mx-auto mb-0.5" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Capacity" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeHotel.capacity })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx(Wifi, { className: "w-4 h-4 text-primary mx-auto mb-0.5" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Amenities" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeHotel.amenities.length })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
                    /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-foreground mb-2", children: "Top Amenities" }),
                    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: activeHotel.amenities.slice(0, 6).map((amenity, idx) => /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "px-2 py-0.5 bg-secondary/50 rounded-full text-[10px] font-medium text-foreground",
                        children: amenity
                      },
                      idx
                    )) })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mb-3 pb-3 border-b border-border bg-muted/20 rounded-lg p-2.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1.5 border-t border-border/50", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-foreground", children: "Total" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[8px] text-muted-foreground", children: "per night" })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold text-primary", children: [
                      "₹",
                      activePricing.total.toLocaleString("en-IN")
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => handleBookNow(activeHotel),
                      className: "w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg shadow-md text-sm",
                      children: [
                        "Book Now ",
                        /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })
                      ]
                    }
                  )
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "lg:sticky lg:top-6", children: /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-card", children: /* @__PURE__ */ jsxs(
            MapContainer,
            {
              center: [
                activeHotel.coordinates.lat,
                activeHotel.coordinates.lng
              ],
              zoom: 12,
              scrollWheelZoom: true,
              className: "w-full h-full",
              style: { zIndex: 1 },
              children: [
                /* @__PURE__ */ jsx(
                  TileLayer,
                  {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                ),
                /* @__PURE__ */ jsx(
                  MapViewController,
                  {
                    center: [
                      activeHotel.coordinates.lat,
                      activeHotel.coordinates.lng
                    ],
                    zoom: 12
                  }
                ),
                filteredHotels.map((hotel, idx) => {
                  const isActive = idx === activeIndex;
                  const markerIcon2 = createRedIcon(isActive);
                  const hotelPricing = calculatePricing(hotel.pricing);
                  return /* @__PURE__ */ jsx(
                    Marker,
                    {
                      position: [
                        hotel.coordinates.lat,
                        hotel.coordinates.lng
                      ],
                      icon: markerIcon2,
                      eventHandlers: {
                        click: () => setActiveIndex(idx)
                      },
                      children: /* @__PURE__ */ jsx(Popup, { closeButton: false, className: "custom-popup", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 min-w-[200px]", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                          /* @__PURE__ */ jsx("p", { className: "font-serif text-sm font-bold", children: hotel.name }),
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full", children: [
                            /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 text-yellow-500 fill-current" }),
                            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: hotel.rating || "N/A" })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs text-muted-foreground", children: [
                          /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 mr-1 text-red-500" }),
                          /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: hotel.location })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1 border-t", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold", children: "Total (incl. GST)" }),
                          /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-primary", children: [
                            "₹",
                            hotelPricing.total.toLocaleString("en-IN")
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => goToHotelDetails(hotel),
                            className: "w-full text-xs bg-primary text-primary-foreground font-bold py-2 rounded",
                            children: "View Details"
                          }
                        )
                      ] }) })
                    },
                    hotel.id
                  );
                })
              ]
            }
          ) }) })
        ] })
      },
      "map"
    ) })
  ] }) });
}
const detectBanner = (image) => {
  if (!image) return false;
  if (image.width && image.height) {
    const ratio = image.width / image.height;
    if (ratio <= 0.85) return true;
  }
  const name = (image.fileName || "").toLowerCase();
  const url = (image.src || "").toLowerCase();
  const sourceString = `${name} ${url}`;
  if (sourceString.includes("1080") || sourceString.includes("1350") || sourceString.includes("instagram_post")) {
    return true;
  }
  if (image.type === "VIDEO") return true;
  return false;
};
function CountdownTimer$1({ expiresAt }) {
  const [label, setLabel] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  useEffect(() => {
    if (!expiresAt) return;
    const i = setInterval(() => {
      const expiry = new Date(expiresAt);
      expiry.setHours(23, 59, 59, 999);
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Expired");
        setIsExpired(true);
        clearInterval(i);
      } else {
        const h = Math.floor(diff / 36e5);
        const m = Math.floor(diff % 36e5 / 6e4);
        setLabel(`${h}h ${m}m Remaining`);
        setIsExpired(false);
      }
    }, 1e3);
    return () => clearInterval(i);
  }, [expiresAt]);
  if (!label) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-center gap-1 px-2.5 py-1 text-white text-[10px] font-bold rounded-full shadow-md ${isExpired ? "bg-red-600" : "bg-black/70"}`,
      children: [
        /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
        label
      ]
    }
  );
}
function HotelOffersCarousel() {
  const [swiper, setSwiper] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const normalize2 = (v) => (v || "").trim().toLowerCase().replace(/\s+/g, " ");
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await getDailyOffers({
          targetType: "GLOBAL",
          page: 0,
          size: 100
        });
        const rawData = res.data?.data || res.data || [];
        const list = Array.isArray(rawData) ? rawData : rawData.content || [];
        const now = Date.now();
        const filtered = await Promise.all(
          list.map(async (o) => {
            if (!o.isActive) return null;
            if (!["PROPERTY_PAGE", "BOTH"].includes(o.displayLocation))
              return null;
            if (o.propertyTypeId) {
              try {
                const propertyTypeRes = await getPropertyTypeById(
                  o.propertyTypeId
                );
                const propertyType = propertyTypeRes.data;
                if (propertyType?.isActive) {
                  const typeName = normalize2(propertyType.typeName);
                  if (typeName === "hotel" || typeName === "both") {
                    return { ...o, propertyTypeName: propertyType.typeName };
                  }
                }
              } catch (err) {
                console.error(
                  `Failed to fetch property type ${o.propertyTypeId}`,
                  err
                );
              }
            }
            return null;
          })
        );
        const DAYS2 = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY"
        ];
        const todayName = DAYS2[(/* @__PURE__ */ new Date()).getDay()];
        const active = filtered.filter((o) => {
          if (!o) return false;
          let notExpired = true;
          if (o.expiresAt) {
            const expiry = /* @__PURE__ */ new Date(o.expiresAt + "T23:59:59");
            const now2 = /* @__PURE__ */ new Date();
            notExpired = expiry.getTime() >= now2.getTime();
          }
          const isDayActive = !o.activeDays?.length || o.activeDays.includes(todayName);
          return notExpired && isDayActive;
        });
        setOffers(
          active.map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            couponCode: o.couponCode,
            ctaText: o.ctaText || "",
            ctaLink: o.ctaUrl || o.ctaLink || null,
            expiresAt: o.expiresAt,
            propertyType: o.propertyTypeName || "",
            image: o.image?.url ? {
              src: o.image.url,
              type: o.image.type,
              width: o.image.width,
              height: o.image.height,
              fileName: o.image.fileName,
              alt: o.title
            } : null
          }))
        );
      } catch (err) {
        console.error("Offer fetch failed", err);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);
  if (loading)
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) });
  if (!offers.length) return null;
  return /* @__PURE__ */ jsx("section", { className: "bg-muted py-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-serif", children: "Exclusive Hotel Offers" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => swiper?.slidePrev(),
            className: "p-2 rounded-full hover:bg-white/50 transition-colors",
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => swiper?.slideNext(),
            className: "p-2 rounded-full hover:bg-white/50 transition-colors",
            children: /* @__PURE__ */ jsx(ChevronRight, { size: 20 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Swiper,
      {
        modules: [Navigation, Autoplay],
        slidesPerView: 1,
        spaceBetween: 16,
        breakpoints: {
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1200: { slidesPerView: 4 }
        },
        autoplay: {
          delay: 5e3,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        onSwiper: setSwiper,
        children: offers.map((offer, i) => {
          const isBanner = detectBanner(offer.image);
          const isClickable = !!offer.ctaLink;
          const hasContent = !!(offer.title || offer.description || offer.couponCode);
          const hasCtaText = !!(offer.ctaText && offer.ctaText.trim());
          const showFullImage = isBanner || !hasContent || !hasCtaText;
          return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsxs("div", { className: "group h-[520px] bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl cursor-pointer", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `relative overflow-hidden ${showFullImage ? "h-full" : "h-[280px]"}`,
                children: [
                  offer.image ? offer.image.type === "VIDEO" ? /* @__PURE__ */ jsx(OfferVideo, { src: offer.image.src }) : /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: offer.image.src,
                      alt: offer.image.alt,
                      className: `w-full h-full ${showFullImage ? "object-contain bg-black" : "object-cover"} object-center transition-transform duration-500 group-hover:scale-105`
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-muted", children: /* @__PURE__ */ jsx(Tag, { className: "w-10 h-10 text-muted-foreground/30" }) }),
                  /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded z-10 font-bold uppercase tracking-wider", children: offer.propertyType }),
                  offer.expiresAt && /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 z-10", children: /* @__PURE__ */ jsx(CountdownTimer$1, { expiresAt: offer.expiresAt }) }),
                  showFullImage && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20", children: [
                    /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
                      offer.title && /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm line-clamp-1", children: offer.title }),
                      offer.description && /* @__PURE__ */ jsx("p", { className: "text-white/80 text-[10px] line-clamp-1", children: offer.description })
                    ] }),
                    hasCtaText && (isClickable ? /* @__PURE__ */ jsxs(
                      "a",
                      {
                        href: offer.ctaLink,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "w-full bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700",
                        children: [
                          offer.ctaText,
                          " ",
                          /* @__PURE__ */ jsx(ExternalLink, { size: 12 })
                        ]
                      }
                    ) : /* @__PURE__ */ jsxs(
                      "button",
                      {
                        disabled: true,
                        className: "w-full bg-white/20 text-white py-2.5 rounded-lg text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2",
                        children: [
                          offer.ctaText,
                          " ",
                          /* @__PURE__ */ jsx(ExternalLink, { size: 12 })
                        ]
                      }
                    ))
                  ] })
                ]
              }
            ),
            !showFullImage && /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-serif font-bold line-clamp-2 leading-tight text-foreground group-hover:text-red-600 transition-colors", children: offer.title }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground italic line-clamp-2 mt-2", children: offer.description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-3 border-t border-muted", children: [
                offer.couponCode && /* @__PURE__ */ jsxs("div", { className: "text-[11px] mb-3 flex items-center justify-center gap-2 bg-muted/50 px-3 py-2 rounded-md border border-dashed border-primary/20", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-medium uppercase", children: "Code" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono font-black text-primary text-xs tracking-widest bg-card px-2 py-0.5 rounded shadow-sm border", children: offer.couponCode })
                ] }),
                hasCtaText && (isClickable ? /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: offer.ctaLink,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "w-full bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-md",
                    children: [
                      offer.ctaText,
                      " ",
                      /* @__PURE__ */ jsx(ExternalLink, { size: 12 })
                    ]
                  }
                ) : /* @__PURE__ */ jsxs(
                  "button",
                  {
                    disabled: true,
                    className: "w-full bg-muted/80 py-2.5 rounded-lg text-xs font-bold opacity-70 cursor-not-allowed flex items-center justify-center gap-2",
                    children: [
                      offer.ctaText,
                      " ",
                      /* @__PURE__ */ jsx(ExternalLink, { size: 12 })
                    ]
                  }
                ))
              ] })
            ] })
          ] }) }, offer.id || i);
        })
      }
    )
  ] }) });
}
const STYLE_CONFIG = {
  aspectRatio: "4/3",
  navigation: {
    buttonSize: "w-8 h-8",
    iconSize: "w-4 h-4"
  }
};
const TEXT_CONTENT = {
  header: {
    badge: "Latest News",
    title: "Hotel Updates"
    // Updated for clarity
  },
  aria: {
    previous: "Previous",
    next: "Next"
  }
};
function HotelNewsUpdates() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  useEffect(() => {
    const fetchHotelNews = async () => {
      try {
        setLoading(true);
        const res = await getAllNews({ category: "", page: 0, size: 20 });
        const data = res?.content || res?.data?.content || [];
        const processedItems = Array.isArray(data) ? data.filter(
          (item) => item.active === true && item.badgeType?.toLowerCase() === "hotel"
        ).sort((a, b) => {
          const dateA = new Date(a.newsDate || a.dateBadge).getTime();
          const dateB = new Date(b.newsDate || b.dateBadge).getTime();
          return dateB - dateA;
        }).slice(0, 6) : [];
        setNewsItems(processedItems);
      } catch (error) {
        console.error("Error fetching hotel news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelNews();
  }, []);
  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();
  if (loading) {
    return /* @__PURE__ */ jsx("section", { className: "py-2 bg-background", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 lg:px-6", children: /* @__PURE__ */ jsx("div", { className: "h-64 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }) }) });
  }
  if (newsItems.length === 0) return null;
  return /* @__PURE__ */ jsx("section", { className: "py-2 bg-background relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 lg:px-6", children: [
    /* @__PURE__ */ jsx(SectionHeader, { onPrev: handlePrev, onNext: handleNext }),
    /* @__PURE__ */ jsx(NewsCarousel, { items: newsItems, swiperRef })
  ] }) });
}
function SectionHeader({
  onPrev,
  onNext
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-primary tracking-[0.25em] uppercase block mb-2", children: TEXT_CONTENT.header.badge }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif text-foreground", children: TEXT_CONTENT.header.title })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/news",
          className: "hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all cursor-pointer",
          children: [
            "View All",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-4 h-4" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          NavBtn,
          {
            onClick: onPrev,
            icon: /* @__PURE__ */ jsx(ChevronLeft, { className: STYLE_CONFIG.navigation.iconSize }),
            label: TEXT_CONTENT.aria.previous
          }
        ),
        /* @__PURE__ */ jsx(
          NavBtn,
          {
            onClick: onNext,
            icon: /* @__PURE__ */ jsx(ChevronRight, { className: STYLE_CONFIG.navigation.iconSize }),
            label: TEXT_CONTENT.aria.next
          }
        )
      ] })
    ] })
  ] });
}
function NavBtn({
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick,
      className: `${STYLE_CONFIG.navigation.buttonSize} rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer z-10 relative`,
      "aria-label": label,
      children: icon
    }
  );
}
function NewsCarousel({
  items,
  swiperRef
}) {
  return /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
    Swiper,
    {
      modules: [Autoplay, Navigation],
      spaceBetween: 24,
      slidesPerView: 1,
      loop: items.length > 3,
      speed: 600,
      autoplay: {
        delay: 5e3,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      },
      onSwiper: (swiper) => swiperRef.current = swiper,
      className: "w-full pb-4",
      children: items.map((item) => /* @__PURE__ */ jsx(SwiperSlide, { className: "!h-auto", children: /* @__PURE__ */ jsx(NewsCard, { item }) }, item.id))
    }
  ) });
}
function NewsCard({ item }) {
  const formatDate2 = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateString;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors duration-300", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `relative aspect-[${STYLE_CONFIG.aspectRatio}] overflow-hidden`,
        children: [
          /* @__PURE__ */ jsx(
            OptimizedImage,
            {
              src: item.imageUrl,
              alt: item.title,
              className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded", children: formatDate2(item.dateBadge) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "p-5 flex flex-col flex-grow", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 text-xs font-bold text-primary tracking-wider uppercase", children: [
        item.category,
        " • ",
        item.badgeType
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2", children: item.title }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-grow", children: item.description }),
      /* @__PURE__ */ jsx("div", { className: "mt-auto pt-2 border-t border-border/50", children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: `/news/${item.id}`,
          className: "inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors group/link pt-3",
          children: [
            item.ctaText || "Read Story",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" })
          ]
        }
      ) })
    ] })
  ] });
}
const isYoutubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url.trim());
const isInstagramUrl = (url) => /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv)\/.+/.test(url.trim());
const getYoutubeId = (url) => {
  if (!url) return null;
  const matches = [
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
    /youtu\.be\/([^"&?\/\s]{11})/,
    /[?&]v=([^"&?\/\s]{11})/,
    /embed\/([^"&?\/\s]{11})/
  ];
  for (const regex of matches) {
    const match = url.match(regex);
    if (match) return match[1];
  }
  return null;
};
const getInstagramId = (url) => {
  if (!url) return null;
  const clean = url.trim().split("?")[0].replace(/\/$/, "");
  const match = clean.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_\-]+)/);
  return match ? match[1] : null;
};
const getYoutubeThumbnail = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};
const buildMediaList = (item) => {
  const allMedia = [];
  const seenUrls = /* @__PURE__ */ new Set();
  const add = (type, url) => {
    if (url && typeof url === "string" && url.trim() !== "" && !seenUrls.has(url.trim())) {
      seenUrls.add(url.trim());
      allMedia.push({ type, url: url.trim() });
    }
  };
  if (item.mediaList && Array.isArray(item.mediaList)) {
    item.mediaList.forEach((m) => {
      const url = m.url || m.imageUrl || m.videoUrl;
      if (!url) return;
      const isVid = m.type === "VIDEO" || isYoutubeUrl(url) || isInstagramUrl(url) || url.match(/\.(mp4|webm|mov|ogg)$/i);
      add(isVid ? "video" : "image", url);
    });
  }
  if (item.videoUrl) add("video", item.videoUrl);
  if (item.imageUrl) add("image", item.imageUrl);
  return allMedia;
};
function HotelReviewsSection() {
  const [guestExperiences, setGuestExperiences] = useState(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [ytError, setYtError] = useState("");
  const [sectionHeader, setSectionHeader] = useState(
    null
  );
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaErrors, setMediaErrors] = useState(/* @__PURE__ */ new Set());
  const [mutedVideos, setMutedVideos] = useState(/* @__PURE__ */ new Set());
  const [ratingHeader, setRatingHeader] = useState(null);
  const swiperRef = useRef(null);
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const fetchExperiences = async () => {
    try {
      const res = await getGuestExperienceSection({ size: 20 });
      const rawData = res?.data?.data || res?.data || res;
      setGuestExperiences(rawData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getGuestExperienceSectionHeader().then(
      (res) => setSectionHeader(Array.isArray(res.data) ? res.data[0] : res.data)
    );
    getGuestExperineceRatingHeader().then(
      (res) => setRatingHeader(Array.isArray(res.data) ? res.data[0] : res.data)
    );
    fetchExperiences();
  }, []);
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews = Array.from(files).map((file) => ({
        type: file.type.startsWith("video") ? "video" : "image",
        url: URL.createObjectURL(file),
        file
      }));
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };
  const handleSubmit = async () => {
    if (!isVerified) {
      setShowPopup(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", feedbackText.slice(0, 20) || "Experience");
      formData.append("description", feedbackText);
      formData.append("author", authorName);
      formData.append("authorPhone", phone);
      formData.append("authorEmail", email);
      if (ytLink.trim()) formData.append("videoUrl", ytLink.trim());
      mediaPreviews.forEach((m) => formData.append("files", m.file));
      await createGuestExperienceByGuest(formData);
      setFeedbackText("");
      setMediaPreviews([]);
      setYtLink("");
      setIsVerified(false);
      await fetchExperiences();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderMediaItem = (m, idx) => {
    const videoKey = `video-${m.url}`;
    const isMuted = !mutedVideos.has(videoKey);
    if (m.type === "video") {
      if (isInstagramUrl(m.url)) {
        const id = getInstagramId(m.url);
        if (!id) return null;
        const embedUrl = `https://www.instagram.com/reel/${id}/embed/?autoplay=1&muted=1`;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative w-full h-full bg-black overflow-hidden flex items-center justify-center group",
            onClick: () => console.log("Container Tapped for Reel:", id),
            children: [
              /* @__PURE__ */ jsx(
                "iframe",
                {
                  src: embedUrl,
                  title: "Instagram Reel",
                  className: "absolute w-full h-[145%] pointer-events-auto",
                  style: {
                    // border: "2px solid red", // DEBUG: Red border = The actual Iframe
                    top: "-22.5%"
                  },
                  allow: "autoplay; encrypted-media"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-0 pointer-events-none" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: m.url,
                  target: "_blank",
                  rel: "noreferrer",
                  onClick: (e) => e.stopPropagation(),
                  className: "absolute bottom-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100",
                  children: "Open"
                }
              )
            ]
          },
          idx
        );
      }
      if (isYoutubeUrl(m.url)) {
        const videoId = getYoutubeId(m.url);
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-full h-full relative group",
            children: /* @__PURE__ */ jsx(
              "iframe",
              {
                src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1`,
                className: "w-full h-full",
                style: { border: "none" },
                allow: "autoplay; encrypted-media"
              }
            )
          },
          idx
        );
      }
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative group w-full h-full",
          style: { border: "2px solid yellow" },
          children: [
            /* @__PURE__ */ jsx(
              "video",
              {
                src: m.url,
                className: "w-full h-full object-cover",
                autoPlay: true,
                muted: isMuted,
                loop: true,
                playsInline: true
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  setMutedVideos((prev) => {
                    const next = new Set(prev);
                    next.has(videoKey) ? next.delete(videoKey) : next.add(videoKey);
                    return next;
                  });
                },
                className: "absolute bottom-3 right-3 z-20 bg-black/70 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { size: 16, className: "text-white" }) : /* @__PURE__ */ jsx(Volume2, { size: 16, className: "text-white" })
              }
            )
          ]
        },
        idx
      );
    }
    return /* @__PURE__ */ jsx(
      "img",
      {
        src: m.url,
        alt: "",
        className: "w-full h-full object-cover",
        onError: () => setMediaErrors((prev) => new Set(prev).add(m.url))
      },
      idx
    );
  };
  const renderMediaGrid = (allMedia, item) => {
    const hasMediaErrors = allMedia.some((m) => mediaErrors.has(m.url));
    const total = allMedia.length;
    if (total === 0 || hasMediaErrors) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3 max-w-[90%]", children: [
        item.description?.trim() ? /* @__PURE__ */ jsxs("p", { className: "text-white text-base md:text-lg italic leading-relaxed line-clamp-4", children: [
          '"',
          item.description,
          '"'
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-white/60 text-sm italic", children: "No description provided" }),
        item.author?.trim() && /* @__PURE__ */ jsxs("p", { className: "text-white/90 font-bold text-lg md:text-xl", children: [
          "— ",
          item.author
        ] })
      ] }) });
    }
    if (total === 1)
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full", children: renderMediaItem(allMedia[0], 0) });
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 grid-rows-2 h-full gap-0.5", children: allMedia.slice(0, 4).map((m, i) => /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
      renderMediaItem(m, i),
      i === 3 && total > 4 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center", children: /* @__PURE__ */ jsxs("span", { className: "text-white font-black text-xl", children: [
        "+",
        total - 4
      ] }) })
    ] }, i)) });
  };
  const hasContent = feedbackText || mediaPreviews.length > 0 || ytLink.trim();
  ytLink.trim() && isYoutubeUrl(ytLink) ? getYoutubeThumbnail(ytLink) : null;
  return /* @__PURE__ */ jsxs("section", { ref: sectionRef, className: "py-12 bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-6 items-stretch min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:w-3/4 w-full min-w-0 flex flex-col bg-card border rounded-2xl p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            sectionHeader?.sectionTag && /* @__PURE__ */ jsx("p", { className: "text-xs uppercase font-bold tracking-widest text-primary mb-1", children: sectionHeader.sectionTag }),
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-serif font-bold italic", children: sectionHeader?.title || "Moments of Excellence" })
          ] }),
          ratingHeader && /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 justify-end text-primary mb-1", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(
              Star,
              {
                size: 14,
                className: i < (ratingHeader.rating || 0) ? "fill-primary text-primary" : "text-primary/20"
              },
              i
            )) }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-tighter", children: ratingHeader.description })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-grow w-full overflow-hidden", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) }) : /* @__PURE__ */ jsx(
          Swiper,
          {
            modules: [Autoplay, Navigation],
            spaceBetween: 15,
            slidesPerView: 1.2,
            breakpoints: { 768: { slidesPerView: 3 } },
            autoplay: { delay: 6e3, disableOnInteraction: false },
            onSwiper: (s) => swiperRef.current = s,
            onMouseEnter: () => {
              swiperRef.current?.autoplay?.stop();
            },
            onMouseLeave: () => {
              swiperRef.current?.autoplay?.start();
            },
            className: "h-full w-full",
            children: guestExperiences.map((item) => {
              const allMedia = buildMediaList(item);
              return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx("div", { className: "bg-background border rounded-xl overflow-hidden h-full flex flex-col group", children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-[3/4] bg-muted overflow-hidden", children: [
                renderMediaGrid(allMedia, item),
                allMedia.length > 0 && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-4 flex flex-col justify-end pointer-events-none", children: [
                  item.description?.trim() && /* @__PURE__ */ jsxs("p", { className: "text-white italic text-base line-clamp-4", children: [
                    '"',
                    item.description,
                    '"'
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: item.author })
                ] })
              ] }) }) }, item.id);
            })
          },
          guestExperiences.length
        ) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:w-1/4 w-full flex flex-col", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-2xl p-6 shadow-sm h-full flex flex-col w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm", children: "Share Experience" }),
          hasContent && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowPopup(true),
              className: "text-primary hover:bg-primary/10 p-1 rounded-full",
              children: /* @__PURE__ */ jsx(Edit2, { size: 16 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-white p-2 rounded-full text-red-400 shadow-sm", children: /* @__PURE__ */ jsx(User, { size: 18 }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-bold text-red-400 leading-none", children: "Posting as" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-gray-800 truncate", children: authorName || "Guest User" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: feedbackText,
            onChange: (e) => setFeedbackText(e.target.value),
            placeholder: "Tell us about your stay...",
            className: "w-full flex-grow bg-secondary/20 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none mb-3"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/20 border border-transparent focus-within:border-primary/40 focus-within:bg-white transition-all", children: [
          /* @__PURE__ */ jsx(
            Youtube,
            {
              size: 15,
              className: ytLink && isYoutubeUrl(ytLink) ? "text-red-500" : "text-muted-foreground"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              value: ytLink,
              onChange: (e) => setYtLink(e.target.value),
              placeholder: "Paste YouTube or Instagram Reel link",
              className: "flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            }
          ),
          ytLink && /* @__PURE__ */ jsx("button", { onClick: () => setYtLink(""), children: /* @__PURE__ */ jsx(X, { size: 12 }) })
        ] }) }),
        mediaPreviews.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2 mb-3", children: mediaPreviews.map((m, i) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative aspect-square rounded-lg overflow-hidden border",
            children: [
              m.type === "image" ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: m.url,
                  className: "h-full w-full object-cover"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-black flex items-center justify-center", children: /* @__PURE__ */ jsx(Video, { size: 12, className: "text-white" }) }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setMediaPreviews(
                    (p) => p.filter((_, idx) => idx !== i)
                  ),
                  className: "absolute top-0 right-0 bg-black/50 text-white",
                  children: /* @__PURE__ */ jsx(X, { size: 10 })
                }
              )
            ]
          },
          i
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => fileInputRef.current?.click(),
              className: "flex-grow bg-secondary/40 hover:bg-secondary/60 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors",
              children: [
                mediaUploading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(ImageIcon, { size: 16 }),
                " ",
                "Media"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              ref: fileInputRef,
              className: "hidden",
              multiple: true,
              onChange: handleFileUpload
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: isSubmitting || !feedbackText && mediaPreviews.length === 0 && !ytLink.trim(),
            onClick: handleSubmit,
            className: "w-full bg-[#f88d8d] hover:bg-[#f67a7a] text-white py-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50",
            children: isSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin mx-auto", size: 20 }) : "Submit Story"
          }
        )
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showPopup && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { scale: 0.9 },
        animate: { scale: 1 },
        className: "bg-card p-8 rounded-2xl border shadow-2xl w-full max-w-sm",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-bold", children: "Guest Information" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setShowPopup(false), children: /* @__PURE__ */ jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                value: authorName,
                onChange: (e) => setAuthorName(e.target.value),
                placeholder: "Full Name",
                className: "w-full p-3 bg-muted rounded-lg outline-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "Email",
                className: "w-full p-3 bg-muted rounded-lg outline-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                placeholder: "Phone",
                maxLength: 10,
                className: "w-full p-3 bg-muted rounded-lg outline-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setIsVerified(true);
                  setShowPopup(false);
                  handleSubmit();
                },
                className: "w-full bg-primary text-white py-3 rounded-lg font-bold",
                children: "Save & Continue"
              }
            )
          ] })
        ]
      }
    ) }) })
  ] });
}
const ITEMS_PER_PAGE = 3;
const getRoomImage = (room) => room.image || room.media?.find((item) => item?.type === "IMAGE" && item?.url)?.url || room.media?.find((item) => item?.url)?.url || "";
const markerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
function QuickBooking() {
  const navigate = useNavigate();
  const [locationOpen, setLocationOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    null
  );
  const [checkIn, setCheckIn] = useState();
  const [checkOut, setCheckOut] = useState();
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [showMap, setShowMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        const res = await getLocationsByType("Hotel");
        const data = res?.data || res || [];
        const activeLocations = data.filter((l) => l.isActive);
        setLocations(activeLocations);
      } catch (err) {
        console.error("Failed to load hotel locations", err);
        setLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationOpen(false);
  };
  const RESAVENUE_CONFIG = {
    baseUrl: "https://bookings.resavenue.com/resBooking4/searchRooms",
    defaultRegCode: "TXGZ0113",
    dateFormat: "dd/MM/yyyy"
  };
  const generateResAvenueUrl = ({
    checkIn: checkIn2,
    checkOut: checkOut2,
    adults,
    regCode = RESAVENUE_CONFIG.defaultRegCode
  }) => {
    if (!checkIn2 || !checkOut2) return null;
    const arrDate = format(checkIn2, RESAVENUE_CONFIG.dateFormat);
    const depDate = format(checkOut2, RESAVENUE_CONFIG.dateFormat);
    const params = new URLSearchParams({
      targetTemplate: "4",
      regCode,
      curr: "INR",
      arrDate,
      depDate,
      arr_date: arrDate,
      dep_date: depDate,
      adult_1: String(adults ?? 1)
    });
    return `${RESAVENUE_CONFIG.baseUrl}?${params.toString()}`;
  };
  const handleCheckInSelect = (date) => {
    setCheckIn(date);
    if (date) {
      setCheckInOpen(false);
      if (!checkOut) {
        setTimeout(() => setCheckOutOpen(true), 150);
      }
    }
  };
  const handleCheckOutSelect = (date) => {
    setCheckOut(date);
    if (date) {
      setCheckOutOpen(false);
    }
  };
  const handleSearch = async () => {
    setHasSearched(true);
    setCurrentPage(1);
    setIsSearching(true);
    try {
      const params = {
        propertyType: "Hotel",
        // Filter by hotel type
        page: 0,
        size: 50
      };
      if (selectedLocation) {
        params.locationId = selectedLocation.id;
      }
      if (checkIn) {
        params.checkIn = format(checkIn, "yyyy-MM-dd");
      }
      if (checkOut) {
        params.checkOut = format(checkOut, "yyyy-MM-dd");
      }
      if (guests.adults + guests.children > 0) {
        params.minOccupancy = guests.adults + guests.children;
      }
      const response = await searchRooms(params);
      const data = response?.data || response;
      const rooms = data?.content || data || [];
      const availableRooms = rooms.filter(
        (room) => room.bookable && room.active && room.status === "AVAILABLE"
      );
      setSearchResults(availableRooms);
      if (availableRooms.length === 1) {
        handleBook(availableRooms[0]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  const handleBook = (room) => {
    const bookingUrl = generateResAvenueUrl({
      checkIn,
      checkOut,
      adults: guests.adults,
      regCode: RESAVENUE_CONFIG.defaultRegCode
    });
    if (!bookingUrl) {
      const cityName = selectedLocation?.locationName || room.locationName;
      if (!cityName) {
        console.error("No location found for hotel navigation.");
        return;
      }
      const citySlug = createCitySlug(cityName);
      const propertyPath = `/${citySlug}/${createHotelSlug(room.propertyName || cityName || "property", room.propertyId)}`;
      navigate(propertyPath);
      return;
    }
    window.open(bookingUrl, "_blank", "noopener,noreferrer");
  };
  const getRoomTypeBadgeColor = (type) => {
    switch (type?.toUpperCase()) {
      case "DELUXE":
        return "bg-purple-100 text-purple-700";
      case "SUITE":
        return "bg-amber-100 text-amber-700";
      case "STANDARD":
        return "bg-blue-100 text-blue-700";
      case "PREMIUM":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const paginatedRooms = searchResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 -mt-10 relative z-30 mb-12", children: [
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        layout: true,
        className: "bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md",
        children: [
          /* @__PURE__ */ jsx("div", { className: "p-6 bg-primary/5 border-b border-border/10 flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg", children: /* @__PURE__ */ jsx(Search, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-medium text-foreground", children: "Find Your Stay" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Best Prices Guaranteed" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-6 mb-8", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Location" }),
                /* @__PURE__ */ jsxs(Popover, { open: locationOpen, onOpenChange: setLocationOpen, children: [
                  /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "outline",
                      className: cn(
                        "w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors",
                        !selectedLocation && "text-muted-foreground"
                      ),
                      children: [
                        /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                          /* @__PURE__ */ jsx(MapPin, { className: "mr-2 h-4 w-4 text-primary" }),
                          selectedLocation?.locationName || "Select Location"
                        ] }),
                        /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxs(PopoverContent, { className: "w-[280px] p-0", align: "start", children: [
                    /* @__PURE__ */ jsx("div", { className: "p-2 border-b border-border/50", children: /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Select Location" }) }),
                    /* @__PURE__ */ jsx("div", { className: "max-h-[280px] overflow-y-auto", children: locationsLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: cn(
                            "px-3 py-2.5 cursor-pointer text-sm font-medium transition-colors flex items-center gap-2",
                            selectedLocation === null ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          ),
                          onClick: () => handleLocationSelect(null),
                          children: [
                            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }),
                            "All Locations"
                          ]
                        }
                      ),
                      locations.map((location) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: cn(
                            "px-3 py-2.5 cursor-pointer text-sm transition-colors flex items-center justify-between",
                            selectedLocation?.id === location.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                          ),
                          onClick: () => handleLocationSelect(location),
                          children: [
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                              /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 opacity-50" }),
                              location.locationName
                            ] }),
                            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: location.state })
                          ]
                        },
                        location.id
                      )),
                      locations.length === 0 && !locationsLoading && /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-center text-sm text-muted-foreground", children: "No locations available" })
                    ] }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Check-in" }),
                /* @__PURE__ */ jsxs(Popover, { open: checkInOpen, onOpenChange: setCheckInOpen, children: [
                  /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "outline",
                      className: cn(
                        "w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors",
                        !checkIn && "text-muted-foreground"
                      ),
                      children: [
                        /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                          /* @__PURE__ */ jsx(Calendar, { className: "mr-2 h-4 w-4 text-primary" }),
                          checkIn ? format(checkIn, "MMM dd, yyyy") : "Select Date"
                        ] }),
                        /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxs(
                    PopoverContent,
                    {
                      className: "w-auto p-0 shadow-xl",
                      align: "start",
                      sideOffset: 8,
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "p-3 border-b bg-muted/30", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Select Check-in Date" }) }),
                        /* @__PURE__ */ jsx(
                          Calendar$1,
                          {
                            value: checkIn,
                            onChange: (value) => {
                              if (value instanceof Date) {
                                handleCheckInSelect(value);
                              }
                            },
                            minDate: /* @__PURE__ */ new Date(),
                            maxDate: addDays(/* @__PURE__ */ new Date(), 365)
                          }
                        ),
                        checkIn && /* @__PURE__ */ jsxs("div", { className: "p-3 border-t bg-muted/30 flex items-center justify-between", children: [
                          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                            "Selected:",
                            " ",
                            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: format(checkIn, "MMM dd, yyyy") })
                          ] }),
                          /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "ghost",
                              size: "sm",
                              className: "h-7 text-xs",
                              onClick: () => setCheckIn(void 0),
                              children: "Clear"
                            }
                          )
                        ] })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Check-out" }),
                /* @__PURE__ */ jsxs(Popover, { open: checkOutOpen, onOpenChange: setCheckOutOpen, children: [
                  /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "outline",
                      className: cn(
                        "w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors",
                        !checkOut && "text-muted-foreground"
                      ),
                      children: [
                        /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                          /* @__PURE__ */ jsx(Calendar, { className: "mr-2 h-4 w-4 text-primary" }),
                          checkOut ? format(checkOut, "MMM dd, yyyy") : "Select Date"
                        ] }),
                        /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxs(
                    PopoverContent,
                    {
                      className: "w-auto p-0 shadow-xl",
                      align: "start",
                      sideOffset: 8,
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "p-3 border-b bg-muted/30", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Select Check-out Date" }) }),
                        /* @__PURE__ */ jsx(
                          Calendar$1,
                          {
                            value: checkOut,
                            onChange: (value) => {
                              if (value instanceof Date) {
                                handleCheckOutSelect(value);
                              }
                            },
                            minDate: checkIn ? addDays(checkIn, 1) : /* @__PURE__ */ new Date(),
                            maxDate: addDays(/* @__PURE__ */ new Date(), 365)
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { className: "p-3 border-t bg-muted/30 flex items-center justify-between", children: [
                          checkIn && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                            "Check-in:",
                            " ",
                            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: format(checkIn, "MMM dd") })
                          ] }),
                          checkOut && /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "ghost",
                              size: "sm",
                              className: "h-7 text-xs ml-auto",
                              onClick: () => setCheckOut(void 0),
                              children: "Clear"
                            }
                          )
                        ] })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Guests & Rooms" }),
                /* @__PURE__ */ jsxs(Popover, { open: guestsOpen, onOpenChange: setGuestsOpen, children: [
                  /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "outline",
                      className: "w-full justify-between text-left font-normal bg-background/50 h-14 px-4 group border-border/60 hover:border-primary/50 transition-colors",
                      children: [
                        /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                          /* @__PURE__ */ jsx(Users, { className: "mr-2 h-4 w-4 text-primary" }),
                          guests.adults + guests.children,
                          " Guests, ",
                          guests.rooms,
                          " ",
                          "Room"
                        ] }),
                        /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50 group-data-[state=open]:rotate-180 transition-transform" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxs(PopoverContent, { className: "w-80 p-0", align: "start", children: [
                    /* @__PURE__ */ jsx("div", { className: "p-3 border-b border-border/50", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Guests & Rooms" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-4", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Adults" }),
                          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Ages 13+" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "icon",
                              className: "h-8 w-8 rounded-full",
                              onClick: () => setGuests((prev) => ({
                                ...prev,
                                adults: Math.max(1, prev.adults - 1)
                              })),
                              disabled: guests.adults <= 1,
                              children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
                            }
                          ),
                          /* @__PURE__ */ jsx("span", { className: "w-6 text-center text-sm font-semibold", children: guests.adults }),
                          /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "icon",
                              className: "h-8 w-8 rounded-full",
                              onClick: () => setGuests((prev) => ({
                                ...prev,
                                adults: prev.adults + 1
                              })),
                              children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
                            }
                          )
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Children" }),
                          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Ages 2-12" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "icon",
                              className: "h-8 w-8 rounded-full",
                              onClick: () => setGuests((prev) => ({
                                ...prev,
                                children: Math.max(0, prev.children - 1)
                              })),
                              disabled: guests.children <= 0,
                              children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
                            }
                          ),
                          /* @__PURE__ */ jsx("span", { className: "w-6 text-center text-sm font-semibold", children: guests.children }),
                          /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "icon",
                              className: "h-8 w-8 rounded-full",
                              onClick: () => setGuests((prev) => ({
                                ...prev,
                                children: prev.children + 1
                              })),
                              children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
                            }
                          )
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-border/50", children: [
                        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Rooms" }) }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "icon",
                              className: "h-8 w-8 rounded-full",
                              onClick: () => setGuests((prev) => ({
                                ...prev,
                                rooms: Math.max(1, prev.rooms - 1)
                              })),
                              disabled: guests.rooms <= 1,
                              children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
                            }
                          ),
                          /* @__PURE__ */ jsx("span", { className: "w-6 text-center text-sm font-semibold", children: guests.rooms }),
                          /* @__PURE__ */ jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "icon",
                              className: "h-8 w-8 rounded-full",
                              onClick: () => setGuests((prev) => ({
                                ...prev,
                                rooms: prev.rooms + 1
                              })),
                              children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
                            }
                          )
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "p-3 border-t border-border/50 bg-muted/30", children: /* @__PURE__ */ jsx(
                      Button,
                      {
                        className: "w-full",
                        size: "sm",
                        onClick: () => setGuestsOpen(false),
                        children: "Done"
                      }
                    ) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: handleSearch,
                  disabled: isSearching,
                  className: "w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold uppercase tracking-wide text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70",
                  children: isSearching ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                    "Searching..."
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" }),
                    "Book"
                  ] })
                }
              ) })
            ] }),
            (selectedLocation || checkIn || checkOut) && /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: -10 },
                animate: { opacity: 1, y: 0 },
                className: "flex flex-wrap items-center gap-2 mb-4",
                children: [
                  selectedLocation && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3" }),
                    selectedLocation.locationName,
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setSelectedLocation(null),
                        className: "ml-1 hover:bg-primary/20 rounded-full p-0.5",
                        children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
                      }
                    )
                  ] }),
                  checkIn && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium", children: [
                    /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }),
                    format(checkIn, "MMM dd"),
                    checkOut && ` - ${format(checkOut, "MMM dd")}`,
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => {
                          setCheckIn(void 0);
                          setCheckOut(void 0);
                        },
                        className: "ml-1 hover:bg-primary/20 rounded-full p-0.5",
                        children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
                      }
                    )
                  ] })
                ]
              }
            ),
            hasSearched && !isSearching && searchResults.length > 0 && /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                className: "border-t border-border/10 pt-6",
                children: [
                  /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4", children: [
                    "Available Rooms",
                    " ",
                    selectedLocation ? `in ${selectedLocation.locationName}` : "in All Locations",
                    " ",
                    "(",
                    searchResults.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-3", children: paginatedRooms.map((room) => {
                    const roomImage = getRoomImage(room);
                    return /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "bg-background border border-border/50 rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-md hover:border-primary/30 transition-all",
                        children: [
                          /* @__PURE__ */ jsx("div", { className: "w-full md:w-48 h-40 md:h-auto bg-muted flex items-center justify-center flex-shrink-0", children: roomImage ? /* @__PURE__ */ jsx(
                            "img",
                            {
                              src: roomImage,
                              alt: room.roomName,
                              className: "w-full h-full object-cover"
                            }
                          ) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center text-muted-foreground", children: [
                            /* @__PURE__ */ jsx(BedDouble, { className: "w-10 h-10 opacity-30" }),
                            /* @__PURE__ */ jsx("span", { className: "text-[10px] mt-1 opacity-50", children: "No Image" })
                          ] }) }),
                          /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
                            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
                                /* @__PURE__ */ jsx("h5", { className: "font-serif text-lg font-medium", children: room.roomName }),
                                /* @__PURE__ */ jsx(
                                  "span",
                                  {
                                    className: cn(
                                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                                      getRoomTypeBadgeColor(room.roomType)
                                    ),
                                    children: room.roomType
                                  }
                                ),
                                /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium", children: room.status })
                              ] }),
                              room.propertyName && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
                                /* @__PURE__ */ jsx(Home, { className: "w-3 h-3" }),
                                " ",
                                room.propertyName
                              ] }),
                              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2 line-clamp-2", children: room.description }),
                              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-2", children: [
                                /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground flex items-center gap-1", children: [
                                  /* @__PURE__ */ jsx(Users, { className: "w-3 h-3" }),
                                  "Max ",
                                  room.maxOccupancy,
                                  " guests"
                                ] }),
                                /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground flex items-center gap-1", children: [
                                  /* @__PURE__ */ jsx(Maximize, { className: "w-3 h-3" }),
                                  room.roomSize,
                                  " ",
                                  room.roomSizeUnit?.replace("_", " ")
                                ] }),
                                /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                                  "Floor ",
                                  room.floorNumber
                                ] })
                              ] }),
                              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
                                room.amenitiesAndFeatures?.slice(0, 4).map((amenity) => /* @__PURE__ */ jsx(
                                  "span",
                                  {
                                    className: "text-[10px] bg-secondary/30 px-2 py-0.5 rounded text-muted-foreground",
                                    children: amenity.name
                                  },
                                  amenity.id
                                )),
                                room.amenitiesAndFeatures?.length > 4 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-primary", children: [
                                  "+",
                                  room.amenitiesAndFeatures.length - 4,
                                  " more"
                                ] })
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 md:border-l md:pl-4 border-border/10", children: [
                              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Starting from" }),
                                /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-primary", children: [
                                  "₹",
                                  room.basePrice?.toLocaleString("en-IN")
                                ] }),
                                /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground", children: "per night" })
                              ] }),
                              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                                /* @__PURE__ */ jsx(
                                  Button,
                                  {
                                    size: "sm",
                                    onClick: () => handleBook(room),
                                    className: "w-full md:w-auto px-6",
                                    children: "Book Now"
                                  }
                                ),
                                room.coordinates && /* @__PURE__ */ jsxs(
                                  Button,
                                  {
                                    size: "sm",
                                    variant: "ghost",
                                    className: "h-6 text-[10px] text-muted-foreground hover:text-primary gap-1",
                                    onClick: () => setShowMap(room),
                                    children: [
                                      /* @__PURE__ */ jsx(Map, { className: "w-3 h-3" }),
                                      " Show on Map"
                                    ]
                                  }
                                )
                              ] })
                            ] })
                          ] })
                        ]
                      },
                      `room-${room.roomId}`
                    );
                  }) }),
                  totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2 mt-6", children: [
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: "outline",
                        size: "sm",
                        onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
                        disabled: currentPage === 1,
                        children: "Previous"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-sm flex items-center px-3 bg-muted rounded-md", children: [
                      "Page ",
                      currentPage,
                      " of ",
                      totalPages
                    ] }),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        variant: "outline",
                        size: "sm",
                        onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
                        disabled: currentPage === totalPages,
                        children: "Next"
                      }
                    )
                  ] })
                ]
              }
            ),
            isSearching && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 border-t border-border/10 mt-6", children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary mb-3" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Searching for available rooms..." })
            ] }),
            hasSearched && !isSearching && searchResults.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground border-t border-border/10 pt-6 mt-6", children: [
              /* @__PURE__ */ jsx(BedDouble, { className: "w-12 h-12 mx-auto opacity-20 mb-3" }),
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "No rooms found matching your criteria." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", children: "Try adjusting your filters or selecting a different location." })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        open: !!showMap,
        onOpenChange: (open) => !open && setShowMap(null),
        children: /* @__PURE__ */ jsx(DialogContent, { className: "max-w-3xl p-0 overflow-hidden h-[500px]", children: showMap && showMap.coordinates && /* @__PURE__ */ jsxs("div", { className: "w-full h-full relative", children: [
          /* @__PURE__ */ jsxs(
            MapContainer,
            {
              center: [showMap.coordinates.lat, showMap.coordinates.lng],
              zoom: 14,
              scrollWheelZoom: true,
              className: "w-full h-full",
              children: [
                /* @__PURE__ */ jsx(
                  TileLayer,
                  {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Marker,
                  {
                    position: [showMap.coordinates.lat, showMap.coordinates.lng],
                    icon: markerIcon,
                    children: /* @__PURE__ */ jsx(Popup, { children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-bold", children: showMap.roomName }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs", children: showMap.propertyName })
                    ] }) })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 z-[400] bg-white p-4 rounded-lg shadow-lg max-w-xs", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-1", children: showMap.roomName }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: showMap.description }),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => {
                  setShowMap(null);
                  handleBook(showMap);
                },
                className: "w-full",
                children: "Book This Room"
              }
            )
          ] })
        ] }) })
      }
    )
  ] });
}
const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  persons: "",
  customQuery: ""
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  };
};
const CARD_COLORS = [
  "bg-pink-50 border-pink-200 hover:border-pink-300",
  "bg-blue-50 border-blue-200 hover:border-blue-300",
  "bg-orange-50 border-orange-200 hover:border-orange-300",
  "bg-purple-50 border-purple-200 hover:border-purple-300",
  "bg-green-50 border-green-200 hover:border-green-300"
];
function EventCard({ event, index }) {
  const navigate = useNavigate();
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const isVideo = event.image?.type === "VIDEO" || event.image?.url?.includes(".mp4");
  const analyzeMediaSize = (w, h) => {
    if (w / h <= 0.85) setIsBanner(true);
  };
  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };
  const { day, month } = formatDate(event.eventDate);
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      onClick: () => navigate(buildEventDetailPath(event)),
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { delay: index * 0.1 },
      className: "group h-[520px] bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl cursor-pointer",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative overflow-hidden transition-all duration-500 ${isBanner ? "h-full" : "h-[220px]"} flex items-start justify-center bg-card`,
            children: [
              event.image?.url ? isVideo ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "video",
                  {
                    ref: videoRef,
                    src: event.image.url,
                    className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                    autoPlay: true,
                    loop: true,
                    muted: true,
                    playsInline: true,
                    onLoadedMetadata: (e) => analyzeMediaSize(
                      e.currentTarget.videoWidth,
                      e.currentTarget.videoHeight
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: toggleMute,
                    className: "absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm",
                    children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4" })
                  }
                )
              ] }) : /* @__PURE__ */ jsx(
                "img",
                {
                  src: event.image.url,
                  alt: event.image.alt || event.title,
                  className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                  onLoad: (e) => analyzeMediaSize(
                    e.currentTarget.naturalWidth,
                    e.currentTarget.naturalHeight
                  )
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-muted", children: /* @__PURE__ */ jsx(Image, { className: "w-10 h-10 text-muted-foreground/20" }) }),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-4 left-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/10", children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg font-black leading-none", children: day }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold tracking-tighter", children: month })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 z-20 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(MapPin, { size: 10 }),
                " ",
                event.locationName
              ] }),
              isBanner && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-white font-serif font-bold text-xl mb-2", children: event.title }),
                /* @__PURE__ */ jsx("p", { className: "text-white/80 text-xs mb-6 line-clamp-2 italic", children: event.description }),
                event.ctaText?.trim() && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      if (event.ctaLink) {
                        window.open(event.ctaLink, "_blank");
                      } else {
                        navigate(buildEventDetailPath(event));
                      }
                    },
                    className: "w-full bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform hover:opacity-90",
                    children: [
                      event.ctaText,
                      " ",
                      /* @__PURE__ */ jsx(ArrowRight, { size: 14 })
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        !isBanner && /* @__PURE__ */ jsxs("div", { className: "p-6 flex flex-col flex-1 bg-card", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors", children: event.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground mt-2 mb-3", children: [
            /* @__PURE__ */ jsx(MapPin, { size: 12, className: "text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium italic uppercase", children: event.locationName })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4", children: event.description }),
          event.ctaText?.trim() && /* @__PURE__ */ jsx("div", { className: "mt-auto pt-4 border-t border-dashed border-border", children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: event.ctaLink || "#",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "w-full bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform hover:opacity-90",
              children: [
                event.ctaText,
                " ",
                /* @__PURE__ */ jsx(ArrowRight, { size: 14 })
              ]
            }
          ) })
        ] })
      ]
    }
  );
}
function GroupBookingSection({
  propertyTypeId: initialPropertyTypeId = null
}) {
  const [swiper, setSwiper] = useState(null);
  const [events, setEvents] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState(null);
  const [propertyTypeId, setPropertyTypeId] = useState(
    initialPropertyTypeId
  );
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  useEffect(() => {
    setPropertyTypeId(initialPropertyTypeId);
  }, [initialPropertyTypeId]);
  useEffect(() => {
    if (propertyTypeId) return;
    const resolveHotelTypeId = async () => {
      try {
        const response = await getPropertyTypes();
        const types = response?.data || response || [];
        const hotelType = Array.isArray(types) ? types.find(
          (type) => type?.isActive && type?.typeName?.toLowerCase() === "hotel"
        ) : null;
        if (hotelType?.id) {
          setPropertyTypeId(Number(hotelType.id));
        }
      } catch (error) {
        console.error("Failed to resolve hotel property type:", error);
      }
    };
    resolveHotelTypeId();
  }, [propertyTypeId]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventResponse, bookingResponse] = await Promise.all([
          getEventsUpdated(),
          getGroupBookings()
        ]);
        const rawEvents = Array.isArray(eventResponse?.data) ? eventResponse.data : Array.isArray(eventResponse) ? eventResponse : [];
        const rawBookings = bookingResponse?.data || bookingResponse || [];
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        setEvents(
          rawEvents.filter((e) => {
            const eventDate = new Date(e.eventDate);
            eventDate.setHours(0, 0, 0, 0);
            return e.typeName === "Hotel" && e.status === "ACTIVE" && e.active === true && eventDate >= today;
          }).sort(
            (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
            // upcoming first
          )
        );
        const filteredBookings = (Array.isArray(rawBookings) ? rawBookings : []).filter(
          (b) => propertyTypeId ? b.propertyTypeName === "Restaurant" ? false : b.propertyTypeId == null || Number(b.propertyTypeId) === Number(propertyTypeId) : b.propertyTypeName !== "Restaurant"
        ).sort((a, b) => b.id - a.id);
        setGroupBookings(filteredBookings);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyTypeId]);
  const handleFinalSubmit = async () => {
    if (!propertyTypeId) {
      toast.error("Hotel type is not available. Please try again.");
      return;
    }
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast.error("Please fill in name, phone, and email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedDates = Array.isArray(dateRange) && dateRange[0] ? `${dateRange[0].toLocaleDateString("en-IN")}${dateRange[1] ? ` to ${dateRange[1].toLocaleDateString("en-IN")}` : ""}` : null;
      const queriesText = [
        `Guest Name: ${formData.name.trim()}`,
        `Phone Number: ${formData.phone.trim()}`,
        `Email Address: ${formData.email.trim()}`,
        selectedOffer?.title ? `Booking Package: ${selectedOffer.title}` : null,
        formattedDates ? `Preferred Dates: ${formattedDates}` : null,
        formData.persons ? `No. of Persons: ${formData.persons}` : null,
        formData.customQuery ? `Additional Info: ${formData.customQuery}` : null
      ].filter(Boolean).join(" | ");
      await createGroupBookingEnquiry({
        name: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        emailAddress: formData.email.trim(),
        queries: queriesText || null,
        enquiryDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        propertyTypeId: Number(propertyTypeId),
        ...selectedOffer?.id ? { groupBookingId: selectedOffer.id } : {}
      });
      setStep(3);
    } catch (error) {
      console.error("Group booking enquiry failed:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const totalPages = Math.ceil(groupBookings.length / itemsPerPage);
  const paginatedBookings = groupBookings.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  return /* @__PURE__ */ jsxs("section", { className: "py-10 bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-[92%] max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-semibold mb-2", children: "Events & Celebrations" }),
        /* @__PURE__ */ jsx("div", { className: "w-16 h-0.5 bg-primary mx-auto mb-3" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-2xl p-5 h-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-serif font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary" }),
              " Upcoming Events"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => swiper?.slidePrev(),
                  className: "p-2 rounded-full border border-border bg-background hover:bg-muted shadow-sm",
                  children: /* @__PURE__ */ jsx(ChevronLeft, { size: 18 })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => swiper?.slideNext(),
                  className: "p-2 rounded-full border border-border bg-background hover:bg-muted shadow-sm",
                  children: /* @__PURE__ */ jsx(ChevronRight, { size: 18 })
                }
              )
            ] })
          ] }),
          loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin text-primary w-7 h-7" }) }) : events.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-muted-foreground text-sm", children: "No upcoming hotel events available." }) : /* @__PURE__ */ jsx(
            Swiper,
            {
              modules: [Autoplay, Pagination, Navigation],
              spaceBetween: 16,
              slidesPerView: 1,
              autoplay: {
                delay: 5e3,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              },
              pagination: { clickable: true },
              onSwiper: setSwiper,
              breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 2.4 }
                // 👈 slightly wider cards
              },
              className: "!pb-10",
              children: events.map((event, index) => /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx(EventCard, { event, index }) }, event.id))
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-4", children: /* @__PURE__ */ jsxs("div", { className: "border rounded-2xl p-5 h-full flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-serif font-semibold flex gap-2", children: [
              /* @__PURE__ */ jsx(Users, { className: "w-5 h-5 text-primary" }),
              " Group Booking"
            ] }),
            totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: currentPage === 0,
                  onClick: () => setCurrentPage((p) => p - 1),
                  className: "p-1 rounded bg-muted disabled:opacity-30",
                  children: /* @__PURE__ */ jsx(ChevronLeft, { size: 14 })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: currentPage >= totalPages - 1,
                  onClick: () => setCurrentPage((p) => p + 1),
                  className: "p-1 rounded bg-muted disabled:opacity-30",
                  children: /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
                }
              )
            ] })
          ] }),
          groupBookings.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground text-sm flex-1", children: "No group booking packages available." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3 flex-1", children: paginatedBookings.map((booking, index) => {
            const colorCls = CARD_COLORS[index % CARD_COLORS.length];
            return /* @__PURE__ */ jsxs(
              "div",
              {
                onClick: () => {
                  setSelectedOffer(booking);
                  setStep(1);
                  setDateRange(null);
                  setFormData(EMPTY_FORM);
                },
                className: `flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all group ${colorCls}`,
                children: [
                  /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0", children: booking.media?.[0]?.url ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: booking.media[0].url,
                      alt: booking.title,
                      className: "w-full h-full object-cover"
                    }
                  ) : /* @__PURE__ */ jsx(Image, { className: "w-5 h-5 text-muted-foreground/40 m-auto" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold line-clamp-1 group-hover:text-primary", children: booking.title }),
                    booking.description && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground line-clamp-2 mt-0.5", children: booking.description }),
                    booking.ctaLink && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-2 uppercase tracking-tight", children: [
                      booking.ctaText || "Details",
                      " ",
                      /* @__PURE__ */ jsx(ExternalLink, { size: 9 })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    ArrowRight,
                    {
                      size: 14,
                      className: "text-muted-foreground/40 group-hover:text-primary transition-colors"
                    }
                  )
                ]
              },
              booking.id
            );
          }) }),
          totalPages > 1 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-center text-muted-foreground mt-4 uppercase", children: [
            "Page ",
            currentPage + 1,
            " of ",
            totalPages
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        open: !!selectedOffer,
        onOpenChange: (open) => {
          if (!open) {
            setSelectedOffer(null);
            setStep(1);
            setDateRange(null);
            setFormData(EMPTY_FORM);
          }
        },
        children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
          /* @__PURE__ */ jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsx(DialogTitle, { className: "font-serif text-2xl", children: selectedOffer?.title }),
            /* @__PURE__ */ jsx(DialogDescription, { children: "Share your preferred dates and contact details for this booking." })
          ] }),
          step === 1 ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Calendar$1, { selectRange: true, value: dateRange, onChange: setDateRange }),
            /* @__PURE__ */ jsx(
              Button,
              {
                className: "w-full",
                onClick: () => setStep(2),
                disabled: !Array.isArray(dateRange) || !dateRange[0],
                children: "Confirm Dates"
              }
            )
          ] }) : step === 2 ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Your name",
                value: formData.name,
                onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Phone number",
                type: "tel",
                value: formData.phone,
                onChange: (e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Email address",
                type: "email",
                value: formData.email,
                onChange: (e) => setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "No. of persons",
                type: "number",
                min: "1",
                value: formData.persons,
                onChange: (e) => setFormData((prev) => ({ ...prev, persons: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                placeholder: "Additional requirements",
                value: formData.customQuery,
                onChange: (e) => setFormData((prev) => ({
                  ...prev,
                  customQuery: e.target.value
                })),
                rows: 4
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                className: "w-full",
                onClick: handleFinalSubmit,
                disabled: isSubmitting,
                children: isSubmitting ? "Submitting..." : "Send Enquiry"
              }
            )
          ] }) : /* @__PURE__ */ jsxs("div", { className: "py-8 text-center space-y-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-green-600", children: "Enquiry Sent!" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "We'll get back to you shortly." })
          ] })
        ] })
      }
    )
  ] });
}
function WhatsAppButton() {
  const phoneNumber = "9754811000";
  const message = "Hi! I'm interested in booking a stay.";
  const handleClick = () => {
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };
  return /* @__PURE__ */ jsxs(
    motion.button,
    {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { delay: 1, type: "spring" },
      onClick: handleClick,
      className: "fixed bottom-6 left-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 group flex items-center gap-2 overflow-hidden",
      title: "Chat with us on WhatsApp",
      children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "w-6 h-6 fill-current" }),
        /* @__PURE__ */ jsx("span", { className: "max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100", children: "Chat with us" })
      ]
    }
  );
}
function CountdownTimer({ expiresAt }) {
  const [label, setLabel] = useState("--:--:--");
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const expiry = /* @__PURE__ */ new Date(`${expiresAt}T23:59:59`);
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Expired");
        return;
      }
      const h = Math.floor(diff / 36e5).toString().padStart(2, "0");
      const m = Math.floor(diff % 36e5 / 6e4).toString().padStart(2, "0");
      const s = Math.floor(diff % 6e4 / 1e3).toString().padStart(2, "0");
      setLabel(`${h}:${m}:${s}`);
    };
    tick();
    const i = setInterval(tick, 1e3);
    return () => clearInterval(i);
  }, [expiresAt]);
  return /* @__PURE__ */ jsx("span", { children: label });
}
const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
];
const normalize = (value) => (value || "").trim().toLowerCase().replace(/\s+/g, " ");
const isOfferExpired = (expiresAt) => {
  if (!expiresAt) return false;
  const expiry = /* @__PURE__ */ new Date(`${expiresAt}T23:59:59`);
  return expiry.getTime() < Date.now();
};
function SpecialOfferPopup() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [offers, setOffers] = useState([]);
  const [swiper, setSwiper] = useState(null);
  useEffect(() => {
    const fetchQuickOffers = async () => {
      try {
        const res = await getDailyOffers({ targetType: "GLOBAL", page: 0, size: 100 });
        const rawData = res.data?.data || res.data || [];
        const list = Array.isArray(rawData) ? rawData : rawData.content || [];
        const todayName = DAYS[(/* @__PURE__ */ new Date()).getDay()];
        const filtered = await Promise.all(
          list.map(async (offer) => {
            if (!offer?.isActive || !offer?.quickOfferActive) return null;
            if (isOfferExpired(offer?.expiresAt)) return null;
            const isDayActive = !offer?.activeDays?.length || offer.activeDays.includes(todayName);
            if (!isDayActive) return null;
            if (!offer?.propertyTypeId) return null;
            try {
              const propertyTypeRes = await getPropertyTypeById(offer.propertyTypeId);
              const propertyType = propertyTypeRes?.data;
              if (!propertyType?.isActive) return null;
              const typeName = normalize(propertyType?.typeName);
              if (typeName !== "hotel") return null;
              return {
                id: offer.id,
                title: offer.title || "",
                description: offer.description || "",
                couponCode: offer.couponCode,
                ctaText: offer.ctaText || "",
                ctaLink: offer.ctaUrl || offer.ctaLink || null,
                expiresAt: offer.expiresAt,
                propertyType: propertyType.typeName || "Hotel",
                image: offer.image?.url ? {
                  src: offer.image.url,
                  type: offer.image.type,
                  alt: offer.title || "Special Offer"
                } : null
              };
            } catch {
              return null;
            }
          })
        );
        const validOffers = filtered.filter(Boolean).sort((a, b) => b.id - a.id);
        if (!validOffers.length) return;
        setOffers(validOffers);
        const showTimer = setTimeout(() => setIsVisible(true), 1e3);
        return () => clearTimeout(showTimer);
      } catch (err) {
        console.error("Quick offer fetch failed", err);
      }
    };
    fetchQuickOffers();
  }, []);
  const handleClose = () => {
    setIsVisible(false);
  };
  const handleClaim = (offer) => {
    if (offer?.ctaLink && offer.ctaLink !== "#") {
      window.open(offer.ctaLink, "_blank");
      return;
    }
    navigate("/checkout");
  };
  if (!offers.length) return null;
  return /* @__PURE__ */ jsx(AnimatePresence, { children: isVisible && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
        className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[59]",
        onClick: handleClose
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.94, y: "-46%", x: "-50%" },
        animate: { opacity: 1, scale: 1, y: "-50%", x: "-50%" },
        exit: { opacity: 0, scale: 0.94, y: "-46%", x: "-50%" },
        transition: { duration: 0.35, type: "spring" },
        className: "fixed top-1/2 left-1/2 z-[60] w-[92vw] max-w-[460px] bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden",
        style: { transform: "translate(-50%, -50%)" },
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleClose,
              className: "absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          ),
          offers.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => swiper?.slidePrev(),
                className: "absolute left-3 top-1/2 z-30 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/55 transition-colors",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => swiper?.slideNext(),
                className: "absolute right-3 top-1/2 z-30 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/55 transition-colors",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Swiper,
            {
              modules: [Navigation, Pagination, Autoplay],
              slidesPerView: 1,
              onSwiper: setSwiper,
              pagination: { clickable: true },
              allowTouchMove: offers.length > 1,
              autoplay: offers.length > 1 ? {
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              } : false,
              children: offers.map((offer) => /* @__PURE__ */ jsx(SwiperSlide, { children: (() => {
                const hasTextContent = Boolean(
                  offer.title || offer.description || offer.couponCode
                );
                const hasCta = Boolean(offer.ctaText && offer.ctaText.trim());
                const hasMetaInfo = Boolean(offer.expiresAt || offer.couponCode);
                const showFullFrameMedia = !hasTextContent && !hasCta;
                return /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `relative w-full bg-black flex items-center justify-center overflow-hidden ${showFullFrameMedia ? "h-[520px]" : "h-[320px]"}`,
                      children: [
                        offer.image?.src ? offer.image.type === "VIDEO" ? /* @__PURE__ */ jsx(
                          "video",
                          {
                            src: offer.image.src,
                            className: "w-full h-full object-contain",
                            autoPlay: true,
                            loop: true,
                            muted: true,
                            playsInline: true
                          }
                        ) : /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: offer.image.src,
                            alt: offer.image.alt,
                            className: "w-full h-full object-contain"
                          }
                        ) : /* @__PURE__ */ jsx(
                          OptimizedImage,
                          {
                            ...siteContent.images.hero.slide3,
                            className: "w-full h-full object-contain"
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
                        /* @__PURE__ */ jsxs("div", { className: "absolute top-4 left-4 flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxs("span", { className: "bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1", children: [
                            /* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3" }),
                            " Exclusive"
                          ] }),
                          offer.propertyType && /* @__PURE__ */ jsx("span", { className: "bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", children: offer.propertyType })
                        ] }),
                        !showFullFrameMedia && hasTextContent && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-4 right-4 text-white", children: [
                          /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl font-bold leading-tight", children: offer.title }),
                          offer.description && /* @__PURE__ */ jsx("p", { className: "text-white/85 text-[11px] mt-1 line-clamp-2", children: offer.description })
                        ] })
                      ]
                    }
                  ),
                  !showFullFrameMedia && (hasMetaInfo || hasCta) && /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-5 bg-card relative overflow-hidden", children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" }),
                    (offer.expiresAt || offer.couponCode) && /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
                      /* @__PURE__ */ jsx("div", { children: offer.expiresAt && /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1", children: "Offer Expires In" }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-primary font-mono font-bold text-base", children: [
                          /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }),
                          /* @__PURE__ */ jsx(CountdownTimer, { expiresAt: offer.expiresAt })
                        ] })
                      ] }) }),
                      offer.couponCode && offer.couponCode !== "N/A" && /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1", children: "Coupon Code" }),
                        /* @__PURE__ */ jsx("code", { className: "bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/20", children: offer.couponCode })
                      ] })
                    ] }),
                    hasCta && /* @__PURE__ */ jsxs(
                      Button,
                      {
                        onClick: () => handleClaim(offer),
                        className: "w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow",
                        children: [
                          offer.ctaText,
                          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
                        ]
                      }
                    ),
                    hasCta && /* @__PURE__ */ jsx("p", { className: "text-center text-[10px] text-muted-foreground mt-2.5", children: "*Terms and conditions apply." })
                  ] })
                ] });
              })() }, offer.id))
            }
          )
        ]
      }
    )
  ] }) });
}
const getCurrentTheme = () => {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};
const selectMediaByTheme = (theme, all, light, dark) => {
  if (theme === "dark" && dark?.length > 0) return dark[0];
  if (theme === "light" && light?.length > 0) return light[0];
  if (all?.length > 0) return all[0];
  if (light?.length > 0) return light[0];
  if (dark?.length > 0) return dark[0];
  return null;
};
function HotelHeroSection({ slides, loading }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
  const [imageErrors, setImageErrors] = useState(/* @__PURE__ */ new Set());
  const [loadedSlides, setLoadedSlides] = useState(/* @__PURE__ */ new Set());
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) setCurrentTheme(newTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, [currentTheme]);
  useEffect(() => {
    setLoadedSlides(/* @__PURE__ */ new Set());
  }, [slides, currentTheme]);
  const handleImageError = useCallback((url) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);
  const logMediaError = useCallback(
    (mediaRole, url, title) => {
      console.error(`[HotelHero] Failed to load ${mediaRole}`, {
        title,
        url
      });
      handleImageError(url);
    },
    [handleImageError]
  );
  const handleThumbnailClick = useCallback(
    (index) => {
      if (swiperInstance) swiperInstance.slideToLoop(index);
    },
    [swiperInstance]
  );
  const markSlideLoaded = useCallback((index) => {
    setLoadedSlides((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);
  useEffect(() => {
    if (!swiperInstance || slides.length === 0) return;
    if (loadedSlides.has(activeIndex)) {
      swiperInstance.autoplay?.start();
      return;
    }
    swiperInstance.autoplay?.stop();
  }, [activeIndex, loadedSlides, slides.length, swiperInstance]);
  const getBackgroundMedia = useCallback(
    (slide) => {
      const media = selectMediaByTheme(
        currentTheme,
        slide.backgroundAll,
        slide.backgroundLight,
        slide.backgroundDark
      );
      return {
        mediaUrl: media?.url || "",
        mediaType: media?.type === "VIDEO" ? "video" : "image"
      };
    },
    [currentTheme]
  );
  const getThumbnailMedia = useCallback(
    (slide) => {
      if (!slide) {
        return {
          mediaUrl: "",
          mediaType: "image"
        };
      }
      const subMedia = selectMediaByTheme(
        currentTheme,
        slide.subAll || [],
        slide.subLight || [],
        slide.subDark || []
      );
      const backgroundMedia = selectMediaByTheme(
        currentTheme,
        slide.backgroundAll,
        slide.backgroundLight,
        slide.backgroundDark
      );
      const previewMedia = subMedia || backgroundMedia;
      return {
        mediaUrl: previewMedia?.url || "",
        mediaType: previewMedia?.type === "VIDEO" ? "video" : "image"
      };
    },
    [currentTheme]
  );
  const renderDesktopMedia = useCallback(
    (slide, index) => {
      const { mediaUrl, mediaType } = getBackgroundMedia(slide);
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;
      if (mediaType === "video") {
        return /* @__PURE__ */ jsx(
          "video",
          {
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            preload: "metadata",
            className: "w-full h-full object-cover",
            onLoadedData: () => markSlideLoaded(index),
            onError: () => {
              logMediaError("desktop video", mediaUrl, slide.title);
              markSlideLoaded(index);
            },
            children: /* @__PURE__ */ jsx("source", { src: mediaUrl, type: "video/mp4" })
          },
          mediaUrl
        );
      }
      return /* @__PURE__ */ jsx(
        "img",
        {
          src: mediaUrl,
          alt: slide.title,
          className: "w-full h-full object-cover",
          onLoad: () => markSlideLoaded(index),
          onError: () => {
            logMediaError("desktop image", mediaUrl, slide.title);
            markSlideLoaded(index);
          }
        }
      );
    },
    [getBackgroundMedia, imageErrors, logMediaError, markSlideLoaded]
  );
  const renderMobileMedia = useCallback(
    (slide, index) => {
      const { mediaUrl, mediaType } = getBackgroundMedia(slide);
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;
      if (mediaType === "video") {
        return /* @__PURE__ */ jsx(
          "video",
          {
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            preload: "metadata",
            className: "w-full h-full object-contain",
            onLoadedData: () => markSlideLoaded(index),
            onError: () => {
              logMediaError("mobile video", mediaUrl, slide.title);
              markSlideLoaded(index);
            },
            children: /* @__PURE__ */ jsx("source", { src: mediaUrl, type: "video/mp4" })
          },
          mediaUrl
        );
      }
      return /* @__PURE__ */ jsx(
        "img",
        {
          src: mediaUrl,
          alt: slide.title,
          className: "w-full h-full object-contain",
          onLoad: () => markSlideLoaded(index),
          onError: () => {
            logMediaError("mobile image", mediaUrl, slide.title);
            markSlideLoaded(index);
          }
        }
      );
    },
    [getBackgroundMedia, imageErrors, logMediaError, markSlideLoaded]
  );
  const renderThumbnail = useCallback(
    (slide) => {
      if (!slide) return null;
      const { mediaUrl, mediaType } = getThumbnailMedia(slide);
      if (!mediaUrl || imageErrors.has(mediaUrl)) return null;
      if (mediaType === "video") {
        return /* @__PURE__ */ jsx(
          "video",
          {
            src: mediaUrl,
            muted: true,
            playsInline: true,
            autoPlay: true,
            loop: true,
            preload: "metadata",
            className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
            onError: () => logMediaError("thumbnail video", mediaUrl, slide.title)
          }
        );
      }
      return /* @__PURE__ */ jsx(
        "img",
        {
          src: mediaUrl,
          alt: slide.subtitle || slide.title,
          className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
          onError: () => logMediaError("thumbnail image", mediaUrl, slide.title)
        }
      );
    },
    [getThumbnailMedia, imageErrors, logMediaError]
  );
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-auto md:h-screen overflow-hidden bg-background", children: [
    loading && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm", children: /* @__PURE__ */ jsx(Loader2, { size: 48, className: "animate-spin text-primary" }) }),
    /* @__PURE__ */ jsx(
      Swiper,
      {
        modules: [EffectFade, Autoplay, Navigation],
        effect: "fade",
        speed: 1200,
        autoplay: { delay: 6e3, disableOnInteraction: false },
        loop: slides.length > 1,
        onSwiper: setSwiperInstance,
        onSlideChange: (swiper) => setActiveIndex(swiper.realIndex),
        className: "w-full h-full",
        children: slides.map((slide, index) => /* @__PURE__ */ jsxs(SwiperSlide, { className: "relative w-full h-full", children: [
          /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute inset-0 w-full h-full overflow-hidden", children: renderDesktopMedia(slide, index) }),
          /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" }),
          /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute inset-0 z-10 pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto h-full px-8 md:px-16 lg:px-24 flex items-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full md:w-[70%] xl:w-[60%] pointer-events-auto", children: [
            /* @__PURE__ */ jsx(
              motion.h1,
              {
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.3, duration: 0.8 },
                className: "text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6 leading-tight drop-shadow-lg",
                children: slide.title
              },
              `title-${index}-${activeIndex}`
            ),
            /* @__PURE__ */ jsx(
              motion.p,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.5, duration: 0.8 },
                className: "text-lg md:text-xl text-white/90 font-light mb-10 tracking-wide uppercase",
                children: slide.subtitle
              },
              `subtitle-${index}-${activeIndex}`
            ),
            slide.ctaText && /* @__PURE__ */ jsxs(
              motion.button,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.7, duration: 0.8 },
                disabled: !slide.ctaLink,
                onClick: () => {
                  if (slide.ctaLink) window.location.href = slide.ctaLink;
                },
                className: `group relative px-6 py-2.5 font-semibold text-sm rounded-full overflow-hidden transition-all duration-500 ease-out flex items-center gap-2 border ${!slide.ctaLink ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70" : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)] hover:scale-105 hover:-translate-y-0.5 cursor-pointer border-amber-300/40"}`,
                children: [
                  slide.ctaLink && /* @__PURE__ */ jsx("span", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" }),
                  /* @__PURE__ */ jsx("span", { className: "relative z-10", children: slide.ctaText })
                ]
              }
            )
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute bottom-0 left-0 w-full h-32 md:h-40 z-10 pointer-events-none", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 1440 320", className: "w-full h-full", preserveAspectRatio: "none", children: /* @__PURE__ */ jsx(
            "path",
            {
              className: "fill-background",
              d: "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,181.3C672,171,768,181,864,181.3C960,181,1056,171,1152,165.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            }
          ) }) }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "block md:hidden relative w-full bg-black overflow-hidden",
              style: { height: "calc(75vw + 64px)", minHeight: "320px", maxHeight: "500px" },
              children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 overflow-hidden", style: { top: "64px" }, children: renderMobileMedia(slide, index) }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 pointer-events-none", style: { top: "64px" }, children: /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" }),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "absolute inset-x-0 px-5 z-20 flex flex-col items-center justify-center text-center",
                    style: { top: "64px", bottom: "2.5rem" },
                    children: [
                      /* @__PURE__ */ jsx(
                        motion.h1,
                        {
                          initial: { opacity: 0, y: 14 },
                          animate: { opacity: 1, y: 0 },
                          transition: { delay: 0.3, duration: 0.6 },
                          className: "text-xl font-serif font-semibold text-white leading-snug mb-1 drop-shadow-md",
                          children: slide.title
                        },
                        `m-title-${index}-${activeIndex}`
                      ),
                      slide.subtitle && /* @__PURE__ */ jsx(
                        motion.p,
                        {
                          initial: { opacity: 0, y: 8 },
                          animate: { opacity: 1, y: 0 },
                          transition: { delay: 0.45, duration: 0.6 },
                          className: "text-[11px] text-white/75 font-light tracking-widest uppercase mb-3",
                          children: slide.subtitle
                        },
                        `m-sub-${index}-${activeIndex}`
                      ),
                      slide.ctaText && /* @__PURE__ */ jsxs(
                        motion.button,
                        {
                          initial: { opacity: 0, scale: 0.92 },
                          animate: { opacity: 1, scale: 1 },
                          transition: { delay: 0.6, duration: 0.6 },
                          disabled: !slide.ctaLink,
                          onClick: () => {
                            if (slide.ctaLink) window.location.href = slide.ctaLink;
                          },
                          className: `group relative px-5 py-2 font-semibold text-xs rounded-full overflow-hidden transition-all duration-500 ease-out inline-flex items-center gap-2 border ${!slide.ctaLink ? "bg-gray-400/50 text-gray-300 border-gray-500/30 cursor-not-allowed opacity-70" : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] cursor-pointer border-amber-300/40"}`,
                          children: [
                            slide.ctaLink && /* @__PURE__ */ jsx("span", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" }),
                            /* @__PURE__ */ jsx("span", { className: "relative z-10", children: slide.ctaText })
                          ]
                        },
                        `m-cta-${index}-${activeIndex}`
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        swiperInstance?.slidePrev();
                      },
                      className: "w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors",
                      children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-3.5 h-3.5" })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5", children: slides.map((_, i) => /* @__PURE__ */ jsx(
                    "div",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleThumbnailClick(i);
                      },
                      className: `h-[3px] rounded-full transition-all duration-500 cursor-pointer ${activeIndex === i ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" : "w-4 bg-white/40 hover:bg-white/70"}`
                    },
                    `mob-dot-${i}`
                  )) }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        swiperInstance?.slideNext();
                      },
                      className: "w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors",
                      children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5" })
                    }
                  )
                ] })
              ]
            }
          )
        ] }, `${slide.id}-${currentTheme}`))
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex absolute right-4 md:right-8 lg:right-12 bottom-48 z-20 flex-col items-end gap-4 max-w-[calc(100vw-2rem)]", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-row items-end gap-2 md:gap-3 lg:gap-4 overflow-hidden", children: slides.map((slide, index) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: index * 0.15 + 0.5 },
          onClick: () => handleThumbnailClick(index),
          className: `relative flex-shrink-0 w-[67px] h-28 md:w-[78px] md:h-[134px] lg:w-28 lg:h-[179px] cursor-pointer overflow-hidden transition-all duration-500 ease-out group ${activeIndex === index ? "ring-2 ring-[#FDFBF7] shadow-2xl scale-105 z-10 grayscale-0" : "opacity-60 hover:opacity-100 grayscale hover:grayscale-0"}`,
          children: [
            renderThumbnail(slide),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-full p-2 md:p-3 bg-gradient-to-t from-black/90 to-transparent", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] md:text-xs text-white/90 font-medium truncate", children: slide.subtitle || slide.title }) })
          ]
        },
        `thumbnail-${index}-${currentTheme}`
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 md:gap-4 lg:gap-6 pr-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 md:gap-2", children: slides.map((_, index) => /* @__PURE__ */ jsx(
          "div",
          {
            onClick: () => handleThumbnailClick(index),
            className: `cursor-pointer h-[3px] transition-all duration-500 rounded-full ${activeIndex === index ? "w-8 md:w-10 lg:w-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-4 md:w-5 lg:w-6 bg-white/30 hover:bg-white/60"}`
          },
          `indicator-${index}`
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 md:gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => swiperInstance?.slidePrev(),
              className: "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 cursor-pointer",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-3 h-3 md:w-4 md:h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => swiperInstance?.slideNext(),
              className: "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 cursor-pointer",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-3 h-3 md:w-4 md:h-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const HOTEL_NAV_ITEMS = [
  { type: "link", label: "OVERVIEW", key: "overview", href: "#overview" },
  { type: "link", label: "COLLECTION", key: "collection", href: "#collection" },
  { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "EVENTS", key: "events", href: "#events" },
  { type: "link", label: "CONTACT", key: "contact", href: "#contact" }
];
const transformApiDataToSlides = (content) => {
  const filteredContent = content.filter((item) => item.active === true);
  const latestThree = filteredContent.sort((a, b) => b.id - a.id).slice(0, 3);
  return latestThree.map((item) => {
    const mediaObj = item.backgroundAll?.[0] || item.backgroundLight?.[0] || item.backgroundDark?.[0];
    return {
      id: item.id,
      type: mediaObj?.type?.toLowerCase() || "image",
      media: mediaObj?.url || "",
      title: item.mainTitle || "",
      subtitle: item.subTitle || "",
      backgroundAll: item.backgroundAll || [],
      backgroundLight: item.backgroundLight || [],
      backgroundDark: item.backgroundDark || []
    };
  });
};
const transformAboutUsData = (content) => {
  const filteredContent = content.filter(
    (item) => item.isActive === true && item.showOnPropertyPage === true
  );
  return filteredContent.sort((a, b) => b.id - a.id).slice(0, 3);
};
function Hotels() {
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState([]);
  const [aboutSections, setAboutSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [hotelTypeId, setHotelTypeId] = useState(null);
  const [aboutImageErrors, setAboutImageErrors] = useState(/* @__PURE__ */ new Set());
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);
  useEffect(() => {
    setCurrentRecognitionIndex(0);
  }, [currentAboutIndex]);
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await getPropertyTypes();
        const data = response?.data || response;
        if (Array.isArray(data)) {
          const hotelType = data.find(
            (type) => type.isActive && type.typeName?.toLowerCase() === "hotel"
          );
          if (hotelType) setHotelTypeId(hotelType.id);
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
      }
    };
    fetchPropertyTypes();
  }, []);
  useEffect(() => {
    if (!hotelTypeId) return;
    const fetchHeroSections = async () => {
      setLoading(true);
      try {
        const response = await getHotelHomepageHeroSection(hotelTypeId);
        const data = response?.data || response;
        if (Array.isArray(data) && data.length > 0) {
          const slides = transformApiDataToSlides(data);
          setHeroSlides(slides.length > 0 ? slides : []);
        } else {
          setHeroSlides([]);
        }
      } catch (error) {
        console.error("Error fetching hero sections:", error);
        setHeroSlides([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroSections();
  }, [hotelTypeId]);
  useEffect(() => {
    if (!hotelTypeId) return;
    const fetchAboutUsSections = async () => {
      setLoadingAbout(true);
      try {
        const response = await getAboutUsByPropertyType(hotelTypeId);
        const data = response?.data || response;
        if (Array.isArray(data) && data.length > 0) {
          const sections = transformAboutUsData(data);
          setAboutSections(sections.length > 0 ? sections : []);
        } else {
          setAboutSections([]);
        }
      } catch (error) {
        console.error("Error fetching about us sections:", error);
        setAboutSections([]);
      } finally {
        setLoadingAbout(false);
      }
    };
    fetchAboutUsSections();
  }, [hotelTypeId]);
  useEffect(() => {
    if (aboutSections.length === 0) return;
    const timer = setInterval(() => {
      setCurrentAboutIndex((prev) => (prev + 1) % aboutSections.length);
    }, 5e3);
    return () => clearInterval(timer);
  }, [aboutSections.length]);
  useEffect(() => {
    const currentSection = aboutSections[currentAboutIndex];
    const recognitions = currentSection?.recognitions?.filter((r) => r.isActive) || [];
    if (recognitions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentRecognitionIndex((prev) => (prev + 1) % recognitions.length);
    }, 2e3);
    return () => clearInterval(timer);
  }, [currentAboutIndex, aboutSections]);
  const getAboutImage = useCallback((section) => {
    if (!section || !section.media || section.media.length === 0) {
      return siteContent.images.hotels.delhi;
    }
    const firstMedia = section.media.find((m) => m.type === "IMAGE");
    return firstMedia?.url || siteContent.images.hotels.delhi;
  }, []);
  const handleAboutImageError = useCallback((url) => {
    setAboutImageErrors((prev) => new Set(prev).add(url));
  }, []);
  const displayAboutSections = aboutSections;
  const useAboutFallback = aboutSections.length === 0;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground overflow-x-hidden", children: [
    /* @__PURE__ */ jsx(Navbar, { navItems: HOTEL_NAV_ITEMS, logo: siteContent.brand.logo_hotel }),
    /* @__PURE__ */ jsx(SpecialOfferPopup, {}),
    /* @__PURE__ */ jsx(HotelHeroSection, { slides: heroSlides, loading }),
    /* @__PURE__ */ jsx(QuickBooking, {}),
    /* @__PURE__ */ jsx("div", { id: "collection", children: /* @__PURE__ */ jsx(HotelCarouselSection, {}) }),
    /* @__PURE__ */ jsx("section", { id: "overview", className: "py-8 px-6 bg-background", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto max-w-7xl", children: loadingAbout ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { size: 40, className: "animate-spin text-primary" }) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 items-center", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: -50 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true },
          className: "relative",
          children: [
            /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] rounded-xl overflow-hidden relative z-10 border border-border/10 shadow-2xl", children: (() => {
              const imageUrl = getAboutImage(displayAboutSections[currentAboutIndex]);
              if (typeof imageUrl === "string") {
                if (aboutImageErrors.has(imageUrl)) {
                  return /* @__PURE__ */ jsx(
                    OptimizedImage,
                    {
                      ...siteContent.images.hotels.delhi,
                      className: "w-full h-full object-cover"
                    }
                  );
                }
                return /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: imageUrl,
                    alt: useAboutFallback ? displayAboutSections[currentAboutIndex].subtitle : displayAboutSections[currentAboutIndex].sectionTitle,
                    className: "w-full h-full object-cover",
                    onError: () => handleAboutImageError(imageUrl)
                  }
                );
              }
              return /* @__PURE__ */ jsx(
                OptimizedImage,
                {
                  ...imageUrl,
                  className: "w-full h-full object-cover"
                }
              );
            })() }),
            /* @__PURE__ */ jsx("div", { className: "absolute -bottom-4 -right-4 w-2/3 h-2/3 border-2 border-primary/20 rounded-xl -z-0" }),
            /* @__PURE__ */ jsx("div", { className: "absolute -top-4 -left-4 w-1/2 h-1/2 bg-secondary/10 rounded-xl -z-0" })
          ]
        },
        `about-image-${currentAboutIndex}`
      ),
      /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
          transition: { duration: 0.5 },
          className: "space-y-4",
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-primary text-xs font-bold uppercase tracking-widest mb-1.5", children: useAboutFallback ? displayAboutSections[currentAboutIndex].title : displayAboutSections[currentAboutIndex].subTitle }),
              /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-serif text-foreground leading-tight mb-3", children: useAboutFallback ? displayAboutSections[currentAboutIndex].subtitle : displayAboutSections[currentAboutIndex].sectionTitle })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed text-base font-light", children: displayAboutSections[currentAboutIndex].description }),
            !useAboutFallback && (() => {
              const recognitions = displayAboutSections[currentAboutIndex]?.recognitions?.filter(
                (r) => r.isActive
              ) || [];
              if (recognitions.length === 0) return null;
              return /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-border/40 space-y-4", children: [
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-x-10 gap-y-3", children: recognitions.map((r, idx) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setCurrentRecognitionIndex(idx),
                    className: "flex flex-col gap-0.5 text-left group",
                    children: [
                      /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: idx === currentRecognitionIndex ? /* @__PURE__ */ jsx(
                        motion.span,
                        {
                          initial: { opacity: 0, y: 6 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -6 },
                          transition: { duration: 0.35 },
                          className: "text-2xl md:text-3xl font-serif text-primary font-bold leading-none",
                          children: r.value
                        },
                        "active"
                      ) : /* @__PURE__ */ jsx(
                        motion.span,
                        {
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          className: "text-2xl md:text-3xl font-serif text-foreground/40 font-bold leading-none group-hover:text-foreground/60 transition-colors",
                          children: r.value
                        },
                        "inactive"
                      ) }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: `text-[10px] font-bold uppercase tracking-widest transition-colors ${idx === currentRecognitionIndex ? "text-muted-foreground" : "text-muted-foreground/40 group-hover:text-muted-foreground/60"}`,
                          children: r.title
                        }
                      )
                    ]
                  },
                  r.id
                )) }),
                /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: recognitions[currentRecognitionIndex]?.subTitle && /* @__PURE__ */ jsx(
                  motion.p,
                  {
                    initial: { opacity: 0, y: 6 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -6 },
                    transition: { duration: 0.35 },
                    className: "text-xs text-muted-foreground/70 italic",
                    children: recognitions[currentRecognitionIndex].subTitle
                  },
                  `subtitle-${currentRecognitionIndex}`
                ) }),
                recognitions.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: recognitions.map((_, idx) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setCurrentRecognitionIndex(idx),
                    className: `h-1 rounded-full transition-all duration-300 ${idx === currentRecognitionIndex ? "bg-primary w-6" : "bg-border w-3 hover:bg-primary/50"}`
                  },
                  idx
                )) })
              ] });
            })()
          ]
        },
        currentAboutIndex
      ) }) })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { id: "offers", children: /* @__PURE__ */ jsx(HotelOffersCarousel, {}) }),
    /* @__PURE__ */ jsx(GroupBookingSection, { propertyTypeId: hotelTypeId }),
    /* @__PURE__ */ jsx("div", { id: "events", children: /* @__PURE__ */ jsx(HotelNewsUpdates, {}) }),
    /* @__PURE__ */ jsx("div", { id: "ratings", children: /* @__PURE__ */ jsx(HotelReviewsSection, {}) }),
    /* @__PURE__ */ jsxs("div", { id: "contact", children: [
      /* @__PURE__ */ jsx(Footer, {}),
      /* @__PURE__ */ jsx(WhatsAppButton, {})
    ] })
  ] });
}
export {
  Hotels as default
};
