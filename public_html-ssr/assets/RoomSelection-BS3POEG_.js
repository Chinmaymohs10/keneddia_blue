import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Maximize2, Users, Check, Receipt, ArrowRight, Star, Shield, Award, Clock, CheckCircle2, Home, ChevronRight, ArrowLeft, MapPin, Grid3x3, List, ChevronLeft } from "lucide-react";
import { O as OptimizedImage, w as siteContent, c as createCitySlug, a as createHotelSlug, N as Navbar, F as Footer } from "../entry-server.js";
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
import "swiper/react";
import "swiper/modules";
import "react-hot-toast";
import "@radix-ui/react-avatar";
import "@radix-ui/react-label";
import "@heroicons/react/24/outline";
import "@heroicons/react/24/solid";
function RoomCard({ room, isSelected, onSelect, viewMode = "grid" }) {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      className: `bg-card border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${isSelected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative h-44 overflow-hidden group", children: [
          /* @__PURE__ */ jsx(
            OptimizedImage,
            {
              ...room.image,
              className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" }),
          room.available ? /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 px-2.5 py-0.5 bg-green-500 text-white text-xs font-bold uppercase tracking-wider rounded-full", children: "Available" }) : /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full", children: "Sold Out" }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 flex items-center gap-1.5 text-white", children: [
            /* @__PURE__ */ jsx(Maximize2, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: room.size })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-semibold text-foreground mb-0.5", children: room.name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground text-xs", children: [
                /* @__PURE__ */ jsx(Users, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Up to ",
                  room.maxOccupancy,
                  " guests"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xl font-serif font-bold text-primary", children: formatPrice(room.basePrice) }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "per night" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2", children: room.description }),
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground mb-1.5", children: "Amenities" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1.5", children: room.amenities.slice(0, 4).map((amenity) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-1.5 text-xs text-muted-foreground",
                children: [
                  /* @__PURE__ */ jsx(Check, { className: "w-3 h-3 text-primary flex-shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: amenity })
                ]
              },
              amenity
            )) }),
            room.amenities.length > 4 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-primary mt-1.5 font-medium", children: [
              "+",
              room.amenities.length - 4,
              " more amenities"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onSelect(room.id),
              disabled: !room.available,
              className: `w-full px-4 py-2.5 text-sm font-bold uppercase tracking-widest rounded-lg transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-lg" : room.available ? "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`,
              children: isSelected ? "Selected" : room.available ? "Select Room" : "Unavailable"
            }
          )
        ] })
      ]
    }
  );
}
function PricingBreakdown({
  basePrice,
  nights = 1,
  onProceed
}) {
  const baseAmount = basePrice * nights;
  const gst = baseAmount * 0.18;
  const serviceCharge = baseAmount * 0.1;
  const total = baseAmount + gst + serviceCharge;
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      className: "bg-card border border-border rounded-xl p-6 shadow-lg sticky top-24",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6 pb-4 border-b border-border", children: [
          /* @__PURE__ */ jsx(Receipt, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-semibold text-foreground", children: "Pricing Breakdown" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground", children: "Base Price" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                formatPrice(basePrice),
                " × ",
                nights,
                " ",
                nights === 1 ? "night" : "nights"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-base font-medium text-foreground", children: formatPrice(baseAmount) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground", children: "GST" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "18% of base amount" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-base font-medium text-foreground", children: formatPrice(gst) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground", children: "Service Charge" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "10% of base amount" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-base font-medium text-foreground", children: formatPrice(serviceCharge) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-border mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-foreground uppercase tracking-wide", children: "Total Amount" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-serif font-bold text-primary", children: formatPrice(total) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Including all taxes and charges" })
        ] }),
        onProceed && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onProceed,
            className: "w-full px-6 py-4 bg-primary text-primary-foreground font-bold tracking-widest rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group",
            children: [
              "Proceed to Checkout",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-border", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Free cancellation up to 24 hours before check-in" }) })
      ]
    }
  );
}
function TrustSection() {
  const rating = 4.8;
  const totalReviews = 2847;
  const testimonials = [
    {
      text: "Exceptional service and beautiful rooms. The staff went above and beyond!",
      author: "Priya S.",
      rating: 5
    },
    {
      text: "Best hotel experience in years. Clean, comfortable, and great location.",
      author: "Rajesh K.",
      rating: 5
    }
  ];
  const whyChooseUs = [
    { icon: Shield, text: "100% Secure Booking" },
    { icon: Award, text: "Award-Winning Service" },
    { icon: Clock, text: "24/7 Customer Support" },
    { icon: CheckCircle2, text: "Best Price Guarantee" }
  ];
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.2 },
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-serif font-semibold text-foreground", children: "Guest Rating" }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-serif font-bold text-primary", children: rating }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "out of 5" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 mb-2", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
            Star,
            {
              className: `w-4 h-4 ${star <= Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : star - 0.5 <= rating ? "fill-yellow-500/50 text-yellow-500" : "text-muted"}`
            },
            star
          )) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Based on ",
            totalReviews.toLocaleString(),
            " verified reviews"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-serif font-semibold text-foreground mb-3", children: "What Guests Say" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: testimonials.map((testimonial, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "pb-3 last:pb-0 border-b last:border-b-0 border-border",
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 mb-1.5", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
                  Star,
                  {
                    className: `w-3 h-3 ${star <= testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`
                  },
                  star
                )) }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed mb-1.5", children: [
                  '"',
                  testimonial.text,
                  '"'
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-foreground", children: [
                  "— ",
                  testimonial.author
                ] })
              ]
            },
            index
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-serif font-semibold text-foreground mb-3", children: "Why Choose Us" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: whyChooseUs.map((item, index) => {
            const Icon = item.icon;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 text-primary" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground font-medium", children: item.text })
            ] }, index);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx(Shield, { className: "w-8 h-8 text-primary mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground uppercase tracking-wider mb-1", children: "Safe & Secure" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Your booking is protected with industry-leading security" })
        ] })
      ]
    }
  );
}
const allHotels = [
  {
    id: "mumbai",
    name: "Kennedia Blu Mumbai",
    location: "Colaba, Mumbai",
    city: "Mumbai",
    image: siteContent.images.hotels.mumbai,
    price: "₹35,000",
    rating: "4.9",
    reviews: 1240,
    description: "A historic landmark transformed into a sanctuary of modern luxury, overlooking the Gateway of India. Experience the convergence of heritage and contemporary elegance.",
    amenities: ["Free WiFi", "Spa", "Restaurant", "Bar", "Gym", "Room Service"],
    features: ["Heritage Wing", "Sea View Suites", "Butlers on call"],
    rooms: 156,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 18.921984,
      lng: 72.833855
    },
    nearbyPlaces: [
      { name: "Gateway of India", type: "Landmark", distance: "0.2 km", coordinates: { lat: 18.922, lng: 72.8347 } },
      { name: "Marine Drive", type: "Attraction", distance: "2.5 km", coordinates: { lat: 18.9438, lng: 72.8234 } },
      { name: "Colaba Causeway", type: "Shopping", distance: "0.5 km", coordinates: { lat: 18.9149, lng: 72.8266 } }
    ],
    dining: [
      {
        name: "The Golden Peacock",
        cuisine: "North Indian & Mughlai",
        timings: "12:00 PM - 3:00 PM, 7:00 PM - 11:00 PM",
        image: siteContent.images.bars.rooftop
      },
      {
        name: "Ocean View Deck",
        cuisine: "Continental & Seafood",
        timings: "24 Hours",
        image: siteContent.images.bars.rooftop
      }
    ],
    policies: {
      checkInAge: 18,
      pets: false,
      cancellation: "Flexible until 24 hours before check-in",
      extraBed: true
    },
    events: [
      {
        id: "evt-mumbai-1",
        title: "Live Jazz Night",
        date: "Fri, 24 Oct",
        time: "8:00 PM",
        image: siteContent.images.events.jazz,
        tag: "Music"
      },
      {
        id: "evt-mumbai-2",
        title: "Sunday Brunch",
        date: "Sun, 26 Oct",
        time: "11:00 AM",
        image: siteContent.images.cafes.garden,
        tag: "Dining"
      },
      {
        id: "evt-mumbai-3",
        title: "Art & Wine Mixer",
        date: "Sat, 01 Nov",
        time: "6:30 PM",
        image: siteContent.images.bars.lounge,
        tag: "Social"
      }
    ],
    roomTypes: [
      {
        id: "mumbai-deluxe",
        name: "Deluxe Room",
        description: "Elegantly appointed room with city views, featuring modern amenities and classic decor. Perfect for business and leisure travelers.",
        basePrice: 12e3,
        maxOccupancy: 2,
        size: "350 sq ft",
        amenities: [
          "King Size Bed",
          "City View",
          "Work Desk",
          "Mini Bar",
          "Smart TV",
          "Coffee Maker"
        ],
        image: siteContent.images.hotels.mumbai,
        available: true
      },
      {
        id: "mumbai-executive",
        name: "Executive Suite",
        description: "Spacious suite with separate living area and stunning sea views. Includes access to executive lounge and complimentary breakfast.",
        basePrice: 25e3,
        maxOccupancy: 3,
        size: "650 sq ft",
        amenities: [
          "Sea View",
          "Living Room",
          "Executive Lounge Access",
          "Butler Service",
          "Jacuzzi",
          "Premium Minibar"
        ],
        image: siteContent.images.hotels.mumbai,
        available: true
      },
      {
        id: "mumbai-presidential",
        name: "Presidential Suite",
        description: "The pinnacle of luxury with panoramic views of the Arabian Sea and Gateway of India. Features private terrace, dining room, and dedicated butler service.",
        basePrice: 75e3,
        maxOccupancy: 4,
        size: "1500 sq ft",
        amenities: [
          "Panoramic Sea View",
          "Private Terrace",
          "Dining Room",
          "Master Bedroom",
          "24/7 Butler",
          "Private Bar"
        ],
        image: siteContent.images.hotels.mumbai,
        available: true
      }
    ]
  },
  {
    id: "bengaluru",
    name: "Kennedia Blu Bengaluru",
    location: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    image: siteContent.images.hotels.bengaluru,
    price: "₹18,000",
    rating: "4.8",
    reviews: 892,
    description: "Minimalist perfection in the heart of Bengaluru's most exclusive tech and lifestyle district. A haven for digital nomads and business leaders.",
    amenities: [
      "Free WiFi",
      "Traditional Tea Room",
      "Michelin Restaurant",
      "Zen Garden"
    ],
    dining: [
      {
        name: "Zen Garden Cafe",
        cuisine: "Pan-Asian & Teas",
        timings: "10:00 AM - 10:00 PM"
      },
      {
        name: "Sky Brew",
        cuisine: "Finger Food & Craft Beer",
        timings: "4:00 PM - 1:00 AM"
      }
    ],
    policies: {
      checkInAge: 18,
      pets: true,
      cancellation: "Non-refundable for promotional rates",
      extraBed: false
    },
    events: [
      {
        id: "evt-blr-1",
        title: "Craft Beer Tasting",
        date: "Sat, 26 Oct",
        time: "7:00 PM",
        image: siteContent.images.bars.lounge,
        tag: "Brewery"
      },
      {
        id: "evt-blr-2",
        title: "Startup Founders Mixer",
        date: "Wed, 30 Oct",
        time: "6:30 PM",
        image: siteContent.images.cafes.garden,
        tag: "Networking"
      }
    ],
    features: ["Co-working Lounge", "Rooftop Microbrewery", "Smart Rooms"],
    rooms: 98,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 12.971891,
      lng: 77.641154
    },
    nearbyPlaces: [
      { name: "100 Feet Road", type: "Dining", distance: "0.2 km", coordinates: { lat: 12.97, lng: 77.64 } },
      { name: "Ulsoor Lake", type: "Nature", distance: "2.5 km", coordinates: { lat: 12.983, lng: 77.62 } }
    ],
    roomTypes: [
      {
        id: "bengaluru-deluxe",
        name: "Deluxe Room",
        description: "Contemporary design meets functionality with smart room controls and high-speed connectivity. Ideal for tech-savvy travelers.",
        basePrice: 8500,
        maxOccupancy: 2,
        size: "320 sq ft",
        amenities: [
          "Smart Controls",
          "High-Speed WiFi",
          "Ergonomic Workspace",
          "Rain Shower",
          "Bluetooth Speaker",
          "USB Charging Ports"
        ],
        image: siteContent.images.hotels.bengaluru,
        available: true
      },
      {
        id: "bengaluru-executive",
        name: "Executive Suite",
        description: "Spacious suite with dedicated workspace and access to co-working lounge. Features zen-inspired design and garden views.",
        basePrice: 18e3,
        maxOccupancy: 2,
        size: "550 sq ft",
        amenities: [
          "Garden View",
          "Co-working Access",
          "Meeting Room Credits",
          "Tea Ceremony Set",
          "Premium Workspace",
          "Meditation Corner"
        ],
        image: siteContent.images.hotels.bengaluru,
        available: true
      },
      {
        id: "bengaluru-penthouse",
        name: "Penthouse Suite",
        description: "Ultra-modern penthouse with private rooftop access and microbrewery privileges. The ultimate retreat for discerning guests.",
        basePrice: 45e3,
        maxOccupancy: 4,
        size: "1200 sq ft",
        amenities: [
          "Private Rooftop",
          "Brewery Access",
          "Smart Home System",
          "Private Chef Option",
          "Infinity Tub",
          "Skyline Views"
        ],
        image: siteContent.images.hotels.bengaluru,
        available: true
      }
    ]
  },
  {
    id: "delhi",
    name: "Kennedia Blu Delhi",
    location: "Connaught Place, Delhi",
    city: "Delhi",
    image: siteContent.images.hotels.delhi,
    price: "₹25,000",
    rating: "5.0",
    reviews: 2156,
    description: "Opulence redefined with unparalleled views of the capital's heritage. The preferred address for diplomats and discerning travelers.",
    amenities: [
      "Infinity Pool",
      "Spa",
      "5 Restaurants",
      "Butler Service",
      "Helipad"
    ],
    features: ["Presidential Suite", "Cigar Lounge", "Art Gallery"],
    rooms: 342,
    checkIn: "2:00 PM",
    checkOut: "12:00 PM",
    coordinates: {
      lat: 28.631451,
      lng: 77.216667
    },
    nearbyPlaces: [
      { name: "Janpath Market", type: "Shopping", distance: "0.5 km", coordinates: { lat: 28.6267, lng: 77.2192 } },
      { name: "Jantar Mantar", type: "Landmark", distance: "0.8 km", coordinates: { lat: 28.6271, lng: 77.2166 } },
      { name: "Gurudwara Bangla Sahib", type: "Religious", distance: "1.2 km", coordinates: { lat: 28.6262, lng: 77.209 } }
    ],
    dining: [
      {
        name: "The Royal Durbbar",
        cuisine: "Awadhi",
        timings: "7:00 PM - 11:30 PM"
      },
      {
        name: "24/7 Pavilion",
        cuisine: "Multi-Cuisine",
        timings: "24 Hours"
      }
    ],
    policies: {
      checkInAge: 21,
      pets: false,
      cancellation: "Free cancellation up to 48 hours",
      extraBed: true
    },
    events: [
      {
        id: "evt-del-1",
        title: "Classical Music Evening",
        date: "Fri, 25 Oct",
        time: "8:00 PM",
        image: siteContent.images.events.jazz,
        tag: "Culture"
      },
      {
        id: "evt-del-2",
        title: "Royal Awadhi Food Festival",
        date: "Sun, 27 Oct",
        time: "1:00 PM",
        image: siteContent.images.bars.rooftop,
        tag: "Dining"
      }
    ],
    roomTypes: [
      {
        id: "delhi-deluxe",
        name: "Deluxe Room",
        description: "Luxuriously appointed room with views of historic Delhi. Features premium bedding and marble bathroom.",
        basePrice: 15e3,
        maxOccupancy: 2,
        size: "400 sq ft",
        amenities: [
          "Heritage View",
          "Marble Bathroom",
          "Premium Bedding",
          "Nespresso Machine",
          "Smart TV",
          "Work Station"
        ],
        image: siteContent.images.hotels.delhi,
        available: true
      },
      {
        id: "delhi-executive",
        name: "Executive Suite",
        description: "Elegant suite with separate living area and access to all five restaurants. Includes complimentary spa treatment.",
        basePrice: 35e3,
        maxOccupancy: 3,
        size: "750 sq ft",
        amenities: [
          "City View",
          "Living Area",
          "Spa Credit",
          "Butler Service",
          "Wine Cellar Access",
          "Dining Privileges"
        ],
        image: siteContent.images.hotels.delhi,
        available: true
      },
      {
        id: "delhi-presidential",
        name: "Presidential Suite",
        description: "The crown jewel of Delhi hospitality. Features private art gallery, cigar lounge access, and helipad privileges for arriving in style.",
        basePrice: 125e3,
        maxOccupancy: 6,
        size: "2500 sq ft",
        amenities: [
          "Private Art Gallery",
          "Cigar Lounge",
          "Helipad Access",
          "Private Dining Room",
          "Master Suite",
          "Concierge Team"
        ],
        image: siteContent.images.hotels.delhi,
        available: true
      },
      {
        id: "delhi-family",
        name: "Family Suite",
        description: "Spacious family accommodation with connecting rooms and kid-friendly amenities. Perfect for memorable family stays.",
        basePrice: 42e3,
        maxOccupancy: 5,
        size: "900 sq ft",
        amenities: [
          "Connecting Rooms",
          "Kids Play Area",
          "Family Dining",
          "Baby Cot Available",
          "Game Console",
          "Kitchenette"
        ],
        image: siteContent.images.hotels.delhi,
        available: true
      }
    ]
  },
  {
    id: "kolkata",
    name: "Kennedia Blu Kolkata",
    location: "Park Street, Kolkata",
    city: "Kolkata",
    image: siteContent.images.hotels.kolkata,
    price: "₹20,000",
    rating: "4.9",
    reviews: 1567,
    description: "Classic colonial elegance meets contemporary comfort in the City of Joy. A tribute to the artistic and intellectual spirit of Bengal.",
    amenities: [
      "Michelin Star Restaurant",
      "Wine Cellar",
      "Art Gallery",
      "Concierge"
    ],
    features: ["Literary Club", "Afternoon Tea", "Jazz Bar"],
    rooms: 124,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 22.553523,
      lng: 88.349934
    },
    dining: [
      {
        name: "Bengal Brasserie",
        cuisine: "Bengali & French Fusion",
        timings: "12:30 PM - 3:30 PM, 7:30 PM - 11:30 PM"
      }
    ],
    policies: {
      checkInAge: 18,
      pets: false,
      cancellation: "Flexible",
      extraBed: true
    },
    events: [
      {
        id: "evt-kol-1",
        title: "Jazz & Poetry Night",
        date: "Sat, 26 Oct",
        time: "7:30 PM",
        image: siteContent.images.bars.lounge,
        tag: "Music"
      },
      {
        id: "evt-kol-2",
        title: "Literary Club Meetup",
        date: "Thu, 31 Oct",
        time: "6:00 PM",
        image: siteContent.images.cafes.garden,
        tag: "Literature"
      }
    ],
    roomTypes: [
      {
        id: "kolkata-deluxe",
        name: "Deluxe Room",
        description: "Colonial charm with modern comforts. Features period furniture and views of historic Park Street.",
        basePrice: 9500,
        maxOccupancy: 2,
        size: "340 sq ft",
        amenities: [
          "Park Street View",
          "Period Furniture",
          "Tea Service",
          "Library Access",
          "Vintage Decor",
          "Premium Toiletries"
        ],
        image: siteContent.images.hotels.kolkata,
        available: true
      },
      {
        id: "kolkata-heritage",
        name: "Heritage Suite",
        description: "Step back in time with authentic colonial architecture and curated art pieces. Includes literary club membership.",
        basePrice: 22e3,
        maxOccupancy: 2,
        size: "600 sq ft",
        amenities: [
          "Literary Club Access",
          "Art Collection",
          "Afternoon Tea",
          "Wine Cellar Tours",
          "Antique Furnishings",
          "Private Balcony"
        ],
        image: siteContent.images.hotels.kolkata,
        available: true
      },
      {
        id: "kolkata-royal",
        name: "Royal Suite",
        description: "The epitome of Bengali aristocracy. Features private art gallery, jazz bar access, and Michelin dining privileges.",
        basePrice: 55e3,
        maxOccupancy: 4,
        size: "1300 sq ft",
        amenities: [
          "Private Art Gallery",
          "Jazz Bar Access",
          "Michelin Dining",
          "Grand Piano",
          "Butler Service",
          "Heritage Tours"
        ],
        image: siteContent.images.hotels.kolkata,
        available: true
      }
    ]
  },
  {
    id: "hyderabad",
    name: "Kennedia Blu Hyderabad",
    location: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    image: siteContent.images.hotels.hyderabad,
    price: "₹22,000",
    rating: "4.8",
    reviews: 1023,
    description: "An urban oasis featuring our signature infinity pool and lush sky gardens. The jewel of the Nizams, reimagined for the modern era.",
    amenities: [
      "Rooftop Pool",
      "Sky Gardens",
      "3 Restaurants",
      "Spa",
      "Business Center"
    ],
    features: ["Convention Hall", "Helipad Access", "Royal Suites"],
    rooms: 287,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 17.412348,
      lng: 78.448522
    },
    dining: [
      {
        name: "Nizam's Table",
        cuisine: "Hyderabadi",
        timings: "12:00 PM - 4:00 PM, 7:00 PM - 12:00 AM"
      }
    ],
    policies: {
      checkInAge: 18,
      pets: false,
      cancellation: "24 hours notice",
      extraBed: true
    },
    roomTypes: [
      {
        id: "hyderabad-deluxe",
        name: "Deluxe Room",
        description: "Modern luxury with sky garden views. Features contemporary design inspired by Nizami architecture.",
        basePrice: 11e3,
        maxOccupancy: 2,
        size: "360 sq ft",
        amenities: [
          "Sky Garden View",
          "Pool Access",
          "Modern Design",
          "Rain Shower",
          "Smart Controls",
          "Mini Bar"
        ],
        image: siteContent.images.hotels.hyderabad,
        available: true
      },
      {
        id: "hyderabad-pool",
        name: "Pool View Suite",
        description: "Direct views of the iconic infinity pool with private balcony. Includes spa credits and dining privileges.",
        basePrice: 24e3,
        maxOccupancy: 3,
        size: "700 sq ft",
        amenities: [
          "Infinity Pool View",
          "Private Balcony",
          "Spa Credits",
          "Restaurant Access",
          "Luxury Bathroom",
          "Living Area"
        ],
        image: siteContent.images.hotels.hyderabad,
        available: true
      },
      {
        id: "hyderabad-royal",
        name: "Royal Suite",
        description: "Nizami opulence meets modern luxury. Features private sky garden access, helipad privileges, and convention hall for private events.",
        basePrice: 65e3,
        maxOccupancy: 4,
        size: "1400 sq ft",
        amenities: [
          "Private Sky Garden",
          "Helipad Access",
          "Convention Privileges",
          "Royal Decor",
          "Butler Service",
          "Private Dining"
        ],
        image: siteContent.images.hotels.hyderabad,
        available: true
      }
    ]
  },
  {
    id: "chennai",
    name: "Kennedia Blu Chennai",
    location: "ECR, Chennai",
    city: "Chennai",
    image: siteContent.images.hotels.chennai,
    price: "₹19,000",
    rating: "4.9",
    reviews: 934,
    description: "Waterfront luxury with commanding views of the Bay of Bengal. Where the rhythm of the waves meets the soul of hospitality.",
    amenities: ["Harbour Views", "Fine Dining", "Pool", "Gym", "Yacht Charter"],
    features: ["Private Beach", "Ayurvedic Spa", "Seafood Specialty"],
    rooms: 198,
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    coordinates: {
      lat: 12.909821,
      lng: 80.249693
    },
    dining: [
      {
        name: "Bay Catch",
        cuisine: "Seafood",
        timings: "11:00 AM - 11:00 PM"
      }
    ],
    policies: {
      checkInAge: 18,
      pets: true,
      cancellation: "Flexible",
      extraBed: true
    },
    roomTypes: [
      {
        id: "chennai-deluxe",
        name: "Deluxe Room",
        description: "Coastal elegance with partial ocean views. Features beach-inspired decor and modern amenities.",
        basePrice: 1e4,
        maxOccupancy: 2,
        size: "350 sq ft",
        amenities: [
          "Partial Ocean View",
          "Beach Access",
          "Coastal Decor",
          "Premium Bedding",
          "Coffee Maker",
          "Smart TV"
        ],
        image: siteContent.images.hotels.chennai,
        available: true
      },
      {
        id: "chennai-ocean",
        name: "Ocean View Suite",
        description: "Panoramic views of the Bay of Bengal with private balcony. Includes Ayurvedic spa treatment and seafood dining experience.",
        basePrice: 23e3,
        maxOccupancy: 3,
        size: "680 sq ft",
        amenities: [
          "Ocean View",
          "Private Balcony",
          "Spa Treatment",
          "Seafood Dining",
          "Beach Cabana",
          "Living Room"
        ],
        image: siteContent.images.hotels.chennai,
        available: true
      },
      {
        id: "chennai-beach",
        name: "Beach Villa",
        description: "Exclusive beachfront villa with direct beach access and private yacht charter privileges. The ultimate coastal retreat.",
        basePrice: 58e3,
        maxOccupancy: 5,
        size: "1600 sq ft",
        amenities: [
          "Direct Beach Access",
          "Yacht Charter",
          "Private Pool",
          "Outdoor Shower",
          "Butler Service",
          "Beachfront Dining"
        ],
        image: siteContent.images.hotels.chennai,
        available: true
      }
    ]
  }
];
const getHotelById = (id) => {
  return allHotels.find((hotel) => hotel.id === id);
};
const getRoomById = (hotelId, roomId) => {
  const hotel = getHotelById(hotelId);
  return hotel?.roomTypes.find((room) => room.id === roomId);
};
const ROOMS_PER_PAGE = 6;
function RoomSelection() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const hotel = hotelId ? getHotelById(hotelId) : null;
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  if (!hotel) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-serif mb-4", children: "Hotel Not Found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "The hotel you're looking for doesn't exist." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/hotels"),
          className: "px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
          children: "Back to Hotels"
        }
      )
    ] }) });
  }
  const selectedRoom = selectedRoomId && hotelId ? getRoomById(hotelId, selectedRoomId) : null;
  const hotelDetailPath = `/${createCitySlug(hotel.city || hotel.location || hotel.name)}/${createHotelSlug(hotel.name || hotel.city || "hotel", hotel.id)}`;
  const totalRooms = hotel.roomTypes.length;
  const totalPages = Math.ceil(totalRooms / ROOMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
  const endIndex = startIndex + ROOMS_PER_PAGE;
  const currentRooms = hotel.roomTypes.slice(startIndex, endIndex);
  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("pricing-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    }
  };
  const handleProceedToCheckout = () => {
    alert(
      `Proceeding to checkout for ${selectedRoom?.name} at ${hotel.name}. This is a demo - checkout functionality not implemented.`
    );
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground overflow-x-hidden", children: [
    /* @__PURE__ */ jsx(Navbar, { logo: siteContent.brand.logo_hotel }),
    /* @__PURE__ */ jsx("div", { className: "bg-secondary/5 border-b border-border mt-20 md:mt-24", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 md:px-6 lg:px-12 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs md:text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "hover:text-foreground transition-colors flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsx(Home, { className: "w-3.5 md:w-4 h-3.5 md:h-4" }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Home" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 md:w-4 h-3.5 md:h-4" }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/hotels",
          className: "hover:text-foreground transition-colors",
          children: "Hotels"
        }
      ),
      /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 md:w-4 h-3.5 md:h-4" }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: hotelDetailPath,
          className: "hover:text-foreground transition-colors truncate max-w-[100px] md:max-w-none",
          children: hotel.name
        }
      ),
      /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 md:w-4 h-3.5 md:h-4" }),
      /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: "Rooms" })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-gradient-to-br from-secondary/10 via-background to-background py-4 md:py-6 border-b border-border", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 md:px-6 lg:px-12", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate(hotelDetailPath),
            className: "flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 md:mb-3 group",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3.5 md:w-4 h-3.5 md:h-4 group-hover:-translate-x-1 transition-transform" }),
              "Back to Hotel"
            ]
          }
        ),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-serif font-bold text-foreground mb-1.5", children: "Select Your Room" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 md:w-4 h-3.5 md:h-4 text-primary" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs md:text-sm truncate", children: [
            hotel.name,
            " • ",
            hotel.location
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-lg px-3 md:px-4 py-2 md:py-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-0.5", children: "Available" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl md:text-2xl font-serif font-bold text-primary", children: hotel.roomTypes.filter((room) => room.available).length })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setViewMode("grid"),
              className: `p-2 rounded transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              title: "Grid View",
              children: /* @__PURE__ */ jsx(Grid3x3, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setViewMode("list"),
              className: `p-2 rounded transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              title: "List View",
              children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
            }
          )
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 md:gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 md:space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-lg px-4 py-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-foreground", children: [
            totalRooms,
            " Room",
            totalRooms !== 1 ? "s" : "",
            " Available"
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "md:hidden flex items-center gap-0.5 bg-secondary/20 border border-border rounded-lg p-0.5", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setViewMode("grid"),
                className: `p-1.5 rounded transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
                children: /* @__PURE__ */ jsx(Grid3x3, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setViewMode("list"),
                className: `p-1.5 rounded transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`,
                children: /* @__PURE__ */ jsx(List, { className: "w-3.5 h-3.5" })
              }
            )
          ] })
        ] }),
        hotel.roomTypes.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-xl p-8 md:p-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "No rooms available at this property." }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" : "space-y-4 md:space-y-6",
              children: currentRooms.map((room) => /* @__PURE__ */ jsx(
                RoomCard,
                {
                  room,
                  isSelected: selectedRoomId === room.id,
                  onSelect: handleRoomSelect,
                  viewMode
                },
                room.id
              ))
            }
          ),
          totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-6 md:mt-8", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handlePageChange(currentPage - 1),
                disabled: currentPage === 1,
                className: "p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                "aria-label": "Previous page",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handlePageChange(page),
                className: `min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-all ${currentPage === page ? "bg-primary text-primary-foreground shadow-sm" : "border border-border hover:bg-secondary text-foreground"}`,
                children: page
              },
              page
            )) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handlePageChange(currentPage + 1),
                disabled: currentPage === totalPages,
                className: "p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                "aria-label": "Next page",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:sticky lg:top-24 h-fit space-y-4", id: "pricing-section", children: selectedRoom ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          PricingBreakdown,
          {
            basePrice: selectedRoom.basePrice,
            nights: 1,
            onProceed: handleProceedToCheckout
          }
        ),
        /* @__PURE__ */ jsx(TrustSection, {})
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            className: "bg-card border border-border rounded-xl p-6 md:p-8 text-center",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 md:w-16 md:h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4", children: /* @__PURE__ */ jsx(Home, { className: "w-6 h-6 md:w-8 md:h-8 text-muted-foreground" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-base md:text-lg font-serif font-semibold text-foreground mb-2", children: "Select a Room" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm text-muted-foreground", children: "Choose a room to see the pricing breakdown and proceed to checkout." })
            ]
          }
        ),
        /* @__PURE__ */ jsx(TrustSection, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  RoomSelection as default
};
