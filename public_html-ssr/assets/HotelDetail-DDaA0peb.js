import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { addDays, format, isBefore, parseISO, startOfToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { B as Button, O as OptimizedImage, r as getEventsUpdated, z as getEventFilesByUploadedId, v as buildEventDetailPath, T as Textarea, A as getCommentsByProperty, C as createComment, E as Avatar, H as AvatarFallback, I as Input, J as getCommentThread, N as Navbar, w as siteContent, F as Footer, G as GetAllPropertyDetails, K as getRoomsByPropertyId, L as getGalleryByPropertyId, M as getAllBookingChannelPartners, P as getAllDiningByPropertyId, Q as getAllPropertyPolicies, R as showWarning, c as createCitySlug, a as createHotelSlug } from "../entry-server.js";
import { MapPin, ExternalLink, Calendar, Users, Loader2, Expand, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, VolumeX, Volume2, Image, ArrowRight, Clock, Star, Navigation, Info, MessageSquare, Send, MessageCircle, X, CheckCircle2, Facebook, Twitter, Linkedin, Share2, Heart, UtensilsCrossed } from "lucide-react";
import { P as Popover, a as PopoverTrigger, b as PopoverContent, C as Calendar$1 } from "./calendar-BxWrXvmW.js";
import { toast } from "react-hot-toast";
import { G as GalleryModal } from "./GalleryModal-DTwSFNib.js";
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
import "@radix-ui/react-avatar";
import "@radix-ui/react-label";
import "@heroicons/react/24/outline";
import "@heroicons/react/24/solid";
import "@radix-ui/react-popover";
import "react-calendar";
function isEmbedUrl(url) {
  return url?.startsWith("https://www.google.com/maps/embed");
}
function buildPropertyEmbedUrl(property) {
  if (property.coordinates?.lat && property.coordinates?.lng) {
    return `https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&output=embed&t=m&z=15`;
  }
  const query = encodeURIComponent(`${property.name} ${property.location}`.trim());
  return `https://www.google.com/maps?q=${query}&output=embed&t=m&z=15`;
}
function PropertyMap({ property, nearbyPlaces = [] }) {
  const [activeLocation, setActiveLocation] = useState(
    nearbyPlaces.length > 0 ? nearbyPlaces[0] : null
  );
  if (!property) return null;
  const { mapUrl, sourceName, isValidEmbed, externalLink } = useMemo(() => {
    if (activeLocation !== null) {
      const valid = isEmbedUrl(activeLocation.googleMapLink);
      return {
        mapUrl: valid ? activeLocation.googleMapLink : null,
        sourceName: activeLocation.name,
        isValidEmbed: valid,
        externalLink: activeLocation.googleMapLink
      };
    }
    return {
      mapUrl: buildPropertyEmbedUrl(property),
      sourceName: property.name,
      isValidEmbed: true,
      externalLink: null
    };
  }, [activeLocation, property]);
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative bg-slate-50", children: [
    isValidEmbed && mapUrl ? /* @__PURE__ */ jsx(
      "iframe",
      {
        src: mapUrl,
        width: "100%",
        height: "100%",
        style: { border: 0 },
        allowFullScreen: true,
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        className: "w-full h-full"
      },
      mapUrl
    ) : /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-100 text-slate-600 p-6 text-center", children: [
      /* @__PURE__ */ jsx(MapPin, { size: 40, className: "text-red-400" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-800 text-sm mb-1", children: sourceName }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-4", children: "This location link cannot be embedded. Use Google Maps → Share → Embed a map to get a valid embed URL." }),
        externalLink && /* @__PURE__ */ jsxs(
          "a",
          {
            href: externalLink,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-700 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ExternalLink, { size: 14 }),
              "Open in Google Maps"
            ]
          }
        )
      ] })
    ] }),
    nearbyPlaces.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 z-20 w-64 max-h-[90%] hidden md:flex flex-col gap-3", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center mb-4", children: /* @__PURE__ */ jsxs("h4", { className: "text-sm font-extrabold text-slate-800 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(MapPin, { size: 16, className: "text-red-500" }),
        " Nearby Places"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 overflow-y-auto pr-1 custom-scrollbar", children: nearbyPlaces.map((place, idx) => {
        const valid = isEmbedUrl(place.googleMapLink);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveLocation(place),
            className: `w-full text-left p-3 rounded-xl border transition-all duration-200 ${activeLocation?.name === place.name ? "bg-slate-900 border-slate-900 shadow-lg translate-x-[-4px]" : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: `text-xs font-bold truncate max-w-[120px] ${activeLocation?.name === place.name ? "text-white" : "text-slate-800"}`, children: place.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  !valid && /* @__PURE__ */ jsx("span", { title: "Non-embeddable link", className: "text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold", children: "ext" }),
                  place.distance && /* @__PURE__ */ jsx("span", { className: `text-[10px] font-mono ${activeLocation?.name === place.name ? "text-slate-400" : "text-slate-500"}`, children: place.distance })
                ] })
              ] }),
              place.type && /* @__PURE__ */ jsx("span", { className: `text-[10px] uppercase tracking-wider font-semibold ${activeLocation?.name === place.name ? "text-blue-400" : "text-blue-600"}`, children: place.type })
            ]
          },
          idx
        );
      }) })
    ] }) })
  ] });
}
function FindYourStay({
  initialDate,
  initialGuests,
  onChange
}) {
  const fallbackDate = [
    /* @__PURE__ */ new Date(),
    addDays(/* @__PURE__ */ new Date(), 2)
  ];
  const [date, setDate] = useState(
    initialDate || fallbackDate
  );
  const [guests, setGuests] = useState(
    initialGuests || { adults: 2, children: 0, rooms: 1 }
  );
  const [guestOpen, setGuestOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const startDate = Array.isArray(date) ? date[0] : date;
  const endDate = Array.isArray(date) ? date[1] : null;
  useEffect(() => {
    setDate(initialDate || fallbackDate);
  }, [initialDate]);
  useEffect(() => {
    setGuests(initialGuests || { adults: 2, children: 0, rooms: 1 });
  }, [initialGuests]);
  const emitChange = () => {
    onChange?.({
      checkIn: startDate ?? null,
      checkOut: endDate ?? null,
      adults: guests.adults,
      children: guests.children,
      rooms: guests.rooms
    });
  };
  const handleUpdateStay = async () => {
    if (!startDate || !endDate || isApplying) return;
    setIsApplying(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    emitChange();
    setIsApplying(false);
  };
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      className: "bg-card border border-border rounded-xl p-3 shadow-sm mb-8",
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-3 lg:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 grid grid-cols-2 gap-3 bg-secondary/5 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground uppercase font-semibold mb-1", children: "Check-in" }),
            /* @__PURE__ */ jsxs(Popover, { children: [
              /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-sm font-medium hover:text-primary", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-primary" }),
                startDate ? format(startDate, "EEE, dd MMM") : "Select"
              ] }) }),
              /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
                Calendar$1,
                {
                  selectRange: true,
                  value: date,
                  minDate: /* @__PURE__ */ new Date(),
                  onChange: (val) => setDate(val)
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col border-l border-border/10 pl-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground uppercase font-semibold mb-1", children: "Check-out" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-primary" }),
              endDate ? format(endDate, "EEE, dd MMM") : "Select"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 bg-secondary/5 rounded-lg p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground uppercase font-semibold mb-1 block", children: "Guests & Rooms" }),
          /* @__PURE__ */ jsxs(Popover, { open: guestOpen, onOpenChange: setGuestOpen, children: [
            /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-sm font-medium w-full hover:text-primary", children: [
              /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-primary" }),
              guests.rooms,
              " Room · ",
              guests.adults,
              " Adults ·",
              " ",
              guests.children,
              " Children"
            ] }) }),
            /* @__PURE__ */ jsx(PopoverContent, { className: "w-80 p-4", align: "start", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-serif font-medium", children: "Guests & Rooms" }),
              [
                {
                  label: "Rooms",
                  value: guests.rooms,
                  min: 1,
                  key: "rooms"
                },
                {
                  label: "Adults",
                  value: guests.adults,
                  min: 1,
                  key: "adults"
                },
                {
                  label: "Children",
                  value: guests.children,
                  min: 0,
                  key: "children"
                }
              ].map((item) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center justify-between",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm", children: item.label }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          className: "w-8 h-8 rounded-full border flex items-center justify-center",
                          onClick: () => setGuests((p) => ({
                            ...p,
                            [item.key]: Math.max(item.min, p[item.key] - 1)
                          })),
                          children: "−"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "w-4 text-center text-sm font-medium", children: item.value }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          className: "w-8 h-8 rounded-full border flex items-center justify-center",
                          onClick: () => setGuests((p) => ({
                            ...p,
                            [item.key]: p[item.key] + 1
                          })),
                          children: "+"
                        }
                      )
                    ] })
                  ]
                },
                item.key
              )),
              /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => setGuestOpen(false), children: "Done" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Button,
          {
            className: "w-full lg:w-auto px-8 py-4 text-sm font-bold uppercase tracking-wider",
            onClick: handleUpdateStay,
            disabled: !startDate || !endDate || isApplying,
            children: isApplying ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Updating..."
            ] }) : "Update Stay"
          }
        ) })
      ] })
    }
  );
}
function HotelStickyNav({ sections }) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id || "");
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 150;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveTab(id);
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);
  return /* @__PURE__ */ jsx("div", { className: "sticky top-[72px] z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 md:px-6 lg:px-12", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-6 overflow-x-auto no-scrollbar", children: sections.map((section) => /* @__PURE__ */ jsx(
    "button",
    {
      onClick: () => scrollToSection(section.id),
      className: `py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === section.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
      children: section.label
    },
    section.id
  )) }) }) });
}
function RoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  policyHighlightText
}) {
  const [expandedRoom, setExpandedRoom] = useState(null);
  const toggleExpand = (id) => {
    setExpandedRoom(expandedRoom === id ? null : id);
  };
  const toggleRoomSelection = (roomId) => {
    onSelectRoom(roomId);
  };
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };
  const getDiscountedPrice = (room) => {
    const price = room.basePrice ?? room.price ?? 0;
    return typeof price === "number" ? price : 0;
  };
  const getOriginalPrice = (room) => {
    const originalPrice = room.originalPrice ?? room.strikePrice;
    if (typeof originalPrice === "number" && originalPrice > 0) {
      return originalPrice;
    }
    return getDiscountedPrice(room);
  };
  const getDiscountPercent = (room) => {
    const discountPercent = typeof room.discountPercent === "number" && room.discountPercent > 0 ? room.discountPercent : typeof room.discount === "number" ? room.discount : 0;
    if (discountPercent > 0) {
      return Math.round(discountPercent);
    }
    return 0;
  };
  const formatRoomSize = (room) => {
    if (!room.roomSize) return null;
    const unitMap = {
      SQ_FT: "sq ft",
      SQ_M: "sq m"
    };
    return `${room.roomSize} ${unitMap[room.roomSizeUnit || ""] || room.roomSizeUnit || ""}`.trim();
  };
  const getAmenityLabel = (amenity) => {
    if (typeof amenity === "string") return amenity;
    if (amenity && typeof amenity === "object" && "name" in amenity && typeof amenity.name === "string") {
      return amenity.name;
    }
    return null;
  };
  const isHighlightedAmenity = (amenity) => {
    return Boolean(
      amenity && typeof amenity === "object" && "showHighlight" in amenity && amenity.showHighlight
    );
  };
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: rooms.map((room) => {
    const isSelected = selectedRoomId === room.id;
    const isAvailable = room.isAvailable === true;
    const roomSizeText = formatRoomSize(room);
    const discountPercent = getDiscountPercent(room);
    const highlightedAmenities = (room.highlightedAmenities?.length ? room.highlightedAmenities : (room.amenities || []).filter(isHighlightedAmenity)).map(getAmenityLabel).filter(Boolean);
    const primaryHighlightedAmenity = highlightedAmenities[0] ?? null;
    let highlightedAmenityRemoved = false;
    const amenities = (room.amenities || []).map(getAmenityLabel).filter(Boolean).filter((amenity) => {
      if (primaryHighlightedAmenity && amenity === primaryHighlightedAmenity && !highlightedAmenityRemoved) {
        highlightedAmenityRemoved = true;
        return false;
      }
      return true;
    });
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: `bg-card border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:shadow-md"}`,
        onClick: () => isAvailable && toggleRoomSelection(room.id),
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row cursor-pointer", children: [
          /* @__PURE__ */ jsx("div", { className: "w-full md:w-[280px] h-56 md:h-auto relative flex-shrink-0", children: /* @__PURE__ */ jsx(
            OptimizedImage,
            {
              ...room.image,
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 p-4 md:p-6 flex flex-col justify-between md:border-r border-border", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-semibold text-foreground", children: room.name }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground", children: [
                  roomSizeText && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Expand, { className: "h-3.5 w-3.5" }),
                    roomSizeText
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }),
                    "Max ",
                    room.maxOccupancy,
                    " Guests"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "md:hidden text-right", children: [
                discountPercent > 0 && /* @__PURE__ */ jsxs("p", { className: "mb-1 inline-flex rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600", children: [
                  discountPercent,
                  "% OFF"
                ] }),
                discountPercent > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-through", children: formatPrice(getOriginalPrice(room)) }),
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-primary", children: formatPrice(getDiscountedPrice(room)) })
              ] })
            ] }),
            policyHighlightText ? /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm font-medium text-green-600", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: policyHighlightText })
            ] }) : null,
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "rounded-md bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-700", children: room.type || "Room Only" }),
              primaryHighlightedAmenity && /* @__PURE__ */ jsx(
                "span",
                {
                  className: "rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700",
                  children: primaryHighlightedAmenity
                },
                `${room.id}-${primaryHighlightedAmenity}`
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mb-4 flex flex-wrap gap-x-4 gap-y-2", children: amenities.slice(0, 6).map((item, idx) => /* @__PURE__ */ jsxs(
              "span",
              {
                className: "inline-flex max-w-full items-center gap-1.5 text-xs text-muted-foreground",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "h-1 w-1 rounded-full bg-red-500" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: item })
                ]
              },
              idx
            )) }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  toggleExpand(room.id);
                },
                className: "text-primary text-xs font-medium flex items-center gap-1 hover:underline relative z-10",
                children: [
                  expandedRoom === room.id ? "Hide Details" : "Room Details",
                  expandedRoom === room.id ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3" })
                ]
              }
            ),
            expandedRoom === room.id && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-border text-sm text-muted-foreground", children: /* @__PURE__ */ jsx("p", { children: room.description }) })
          ] }) }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: `p-4 md:p-6 border-t md:border-t-0 border-border md:w-[240px] flex flex-col justify-center items-center md:items-end text-center md:text-right ${isSelected ? "bg-primary/5" : "bg-secondary/5"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "hidden md:block mb-4", children: [
                  discountPercent > 0 && /* @__PURE__ */ jsxs("p", { className: "mb-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600", children: [
                    discountPercent,
                    "% Off"
                  ] }),
                  discountPercent > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-through", children: formatPrice(getOriginalPrice(room)) }),
                  /* @__PURE__ */ jsx("p", { className: "text-2xl font-serif font-bold text-primary", children: formatPrice(getDiscountedPrice(room)) }),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "+ taxes & fees" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-green-600", children: "Per Night" })
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      toggleRoomSelection(room.id);
                    },
                    disabled: !isAvailable,
                    variant: "default",
                    className: "w-full md:w-auto min-w-[140px]",
                    children: isAvailable ? "Book" : "Unavailable"
                  }
                ),
                !isAvailable && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-red-500 mt-2 font-medium", children: "Not Available" })
              ]
            }
          )
        ] })
      },
      room.id
    );
  }) }) });
}
function EventCard({ event, index }) {
  const navigate = useNavigate();
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const videoRef = useRef(null);
  const slides = event.mediaSlides?.length ? event.mediaSlides : event.image ? [event.image] : [];
  const activeMedia = slides[activeMediaIndex] || event.image;
  const isVideo = activeMedia?.type === "VIDEO" || activeMedia?.url?.includes(".mp4");
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsMuted(true);
  }, [event.id]);
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveMediaIndex((prev) => prev === slides.length - 1 ? 0 : prev + 1);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [slides.length]);
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
  const day = new Date(event.eventDate).getDate();
  const month = new Date(event.eventDate).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { delay: index * 0.1 },
      onClick: () => navigate(buildEventDetailPath(event)),
      className: "group w-full max-w-[300px] h-[520px] mx-auto bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl cursor-pointer",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative overflow-hidden transition-all duration-500 ${isBanner ? "h-full" : "h-[280px]"}`,
            children: [
              activeMedia?.url ? isVideo ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "video",
                  {
                    src: activeMedia.url,
                    className: "absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50",
                    autoPlay: true,
                    loop: true,
                    muted: true,
                    playsInline: true,
                    "aria-hidden": "true"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-white/10 backdrop-blur-md" }),
                /* @__PURE__ */ jsx(
                  "video",
                  {
                    ref: videoRef,
                    src: activeMedia.url,
                    className: "relative z-10 w-full h-full object-contain object-top transition-transform duration-700 group-hover:scale-105",
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
                    "aria-label": isMuted ? "Unmute" : "Mute",
                    children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4" })
                  }
                )
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: activeMedia.url,
                    "aria-hidden": "true",
                    className: "absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-white/10 backdrop-blur-md" }),
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: activeMedia.url,
                    alt: activeMedia.alt || event.title,
                    className: "relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105",
                    onLoad: (e) => analyzeMediaSize(
                      e.currentTarget.naturalWidth,
                      e.currentTarget.naturalHeight
                    )
                  }
                )
              ] }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-muted", children: /* @__PURE__ */ jsx(Image, { className: "w-10 h-10 text-muted-foreground/20" }) }),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-4 left-4 z-20 flex flex-col items-center bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/10", children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg font-black leading-none", children: day }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold tracking-tighter", children: month })
              ] }),
              slides.length > 1 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 right-4 z-20 flex gap-1.5", children: slides.map((_, idx) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveMediaIndex(idx);
                  },
                  className: `h-1.5 rounded-full transition-all ${activeMediaIndex === idx ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"}`,
                  "aria-label": `Show media ${idx + 1}`
                },
                `${event.id}-media-${idx}`
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 z-20 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(MapPin, { size: 10 }),
                " ",
                event.locationName
              ] }),
              isBanner && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-white font-serif font-bold text-xl mb-2 drop-shadow-md", children: event.title }),
                /* @__PURE__ */ jsx("p", { className: "text-white/80 text-xs mb-6 line-clamp-2 italic drop-shadow-sm", children: event.description }),
                /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: event.ctaText?.trim() && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.stopPropagation();
                      navigate(buildEventDetailPath(event));
                    },
                    className: "flex-1 bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform",
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
        ),
        !isBanner && /* @__PURE__ */ jsxs("div", { className: "p-6 flex flex-col flex-1 bg-card", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors", children: event.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground mt-2 mb-3", children: [
            /* @__PURE__ */ jsx(Clock, { size: 12, className: "text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium italic uppercase", children: format(parseISO(event.eventDate), "EEE, dd MMM yyyy") })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4", children: event.description }),
          /* @__PURE__ */ jsx("div", { className: "mt-auto pt-4 border-t border-dashed border-border flex gap-2", children: event.ctaText?.trim() && /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.stopPropagation();
                navigate(buildEventDetailPath(event));
              },
              className: "flex-1 bg-primary text-white py-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95 transition-transform hover:opacity-90",
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
function EventSectionPropertySpecific({
  locationId,
  locationName,
  singleCard = false
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const CARD_PCT = 100 / 2.2;
  const isHoveredRef = useRef(false);
  const eventsLengthRef = useRef(0);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);
  useEffect(() => {
    eventsLengthRef.current = events.length;
  }, [events.length]);
  useEffect(() => {
    fetchEvents();
  }, [locationId]);
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEventsUpdated();
      const allEvents = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const filteredEvents = allEvents.filter((event) => {
        const isMatchingLocation = Number(event.locationId) === Number(locationId);
        const isActive = event.active === true;
        if (!event.eventDate) return false;
        const isUpcoming = !isBefore(parseISO(event.eventDate), startOfToday());
        return isMatchingLocation && isActive && isUpcoming;
      });
      const enrichedEvents = await Promise.all(
        filteredEvents.map(async (event) => {
          try {
            const filesRes = await getEventFilesByUploadedId(event.id);
            const fileGroups = filesRes?.data?.data || filesRes?.data || filesRes || [];
            const groups = Array.isArray(fileGroups) ? fileGroups : [];
            const heroSliderMedia = groups.filter(
              (group) => String(group?.category || "").trim().toLowerCase() === "hero_slider"
            ).flatMap((group) => group?.medias || []).filter((media) => Boolean(media?.url));
            return {
              ...event,
              mediaSlides: heroSliderMedia.length > 0 ? heroSliderMedia : event.image ? [event.image] : []
            };
          } catch {
            return {
              ...event,
              mediaSlides: event.image ? [event.image] : []
            };
          }
        })
      );
      setEvents(
        enrichedEvents.sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };
  const totalSlides = events.length;
  const handlePrevious = () => setCurrentIndex((prev) => prev === 0 ? totalSlides - 1 : prev - 1);
  const handleNext = () => setCurrentIndex((prev) => prev === totalSlides - 1 ? 0 : prev + 1);
  useEffect(() => {
    if (events.length <= 2) return;
    const interval = window.setInterval(() => {
      if (isHoveredRef.current) return;
      setCurrentIndex(
        (prev) => prev === eventsLengthRef.current - 1 ? 0 : prev + 1
      );
    }, 3500);
    return () => window.clearInterval(interval);
  }, [events.length]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  if (events.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12 border rounded-xl bg-muted/20", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground italic mb-2", children: "No upcoming events at this location" }),
      locationName && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground/60", children: [
        "Location: ",
        locationName
      ] })
    ] });
  }
  if (singleCard) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative w-full",
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-hidden w-full", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex transition-transform duration-500 ease-out",
              style: {
                transform: `translateX(-${currentIndex * 100}%)`
              },
              children: events.map((event, index) => /* @__PURE__ */ jsx("div", { className: "w-full flex-shrink-0", children: /* @__PURE__ */ jsx(EventCard, { event, index }) }, event.id))
            }
          ) }),
          events.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handlePrevious,
                className: "absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-border rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-all backdrop-blur-sm",
                "aria-label": "Previous",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleNext,
                className: "absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-border rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-all backdrop-blur-sm",
                "aria-label": "Next",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-4", children: events.map((_, idx) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setCurrentIndex(idx),
                className: `h-1.5 rounded-full transition-all ${currentIndex === idx ? "bg-primary w-5" : "bg-border hover:bg-muted-foreground w-1.5"}`,
                "aria-label": `Go to slide ${idx + 1}`
              },
              idx
            )) })
          ] })
        ]
      }
    );
  }
  if (events.length === 1) {
    return /* @__PURE__ */ jsx("div", { className: "w-full max-w-sm", children: /* @__PURE__ */ jsx(EventCard, { event: events[0], index: 0 }) });
  }
  if (events.length === 2) {
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 w-full", children: events.map((event, index) => /* @__PURE__ */ jsx(EventCard, { event, index }, event.id)) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative w-full",
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-hidden w-full", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex transition-transform duration-500 ease-out",
            style: {
              gap: "16px",
              // Shift by currentIndex × one card slot width.
              // One card slot = CARD_PCT% of the container.
              transform: `translateX(calc(-${currentIndex} * (${CARD_PCT}% + 16px / 2.2)))`
            },
            children: events.map((event, index) => /* @__PURE__ */ jsx(
              "div",
              {
                className: "flex-shrink-0",
                style: {
                  // 2 full cards + 20% peek of the 3rd = CARD_PCT% each
                  width: `calc(${CARD_PCT}% - 10px)`
                },
                children: /* @__PURE__ */ jsx(EventCard, { event, index })
              },
              event.id
            ))
          }
        ) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePrevious,
            className: "absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-black/60 border border-border rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-all backdrop-blur-sm",
            "aria-label": "Previous",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleNext,
            className: "absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-black/60 border border-border rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-all backdrop-blur-sm",
            "aria-label": "Next",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-4", children: events.map((_, idx) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCurrentIndex(idx),
            className: `h-1.5 rounded-full transition-all ${currentIndex === idx ? "bg-primary w-5" : "bg-border hover:bg-muted-foreground w-1.5"}`,
            "aria-label": `Go to slide ${idx + 1}`
          },
          idx
        )) })
      ]
    }
  );
}
const EmptySlot = () => /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center", children: /* @__PURE__ */ jsx(Image, { className: "w-7 h-7 text-zinc-300" }) });
function MobileCarousel({
  images,
  onOpen
}) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(null);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);
  if (images.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg md:hidden", children: [
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
        transition: { duration: 0.25 },
        className: "absolute inset-0 cursor-pointer",
        onClick: () => onOpen(current),
        onTouchStart: (e) => {
          touchStart.current = e.touches[0].clientX;
        },
        onTouchEnd: (e) => {
          if (touchStart.current === null) return;
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
          touchStart.current = null;
        },
        children: [
          /* @__PURE__ */ jsx(
            OptimizedImage,
            {
              src: images[current]?.url || "",
              className: "absolute inset-0 w-full h-full object-cover object-center"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" })
        ]
      },
      current
    ) }),
    images.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: prev,
          className: "absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 text-zinc-800" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: next,
          className: "absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-zinc-800" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white text-[11px] font-bold px-3 py-1 rounded-full", children: [
      current + 1,
      " / ",
      images.length
    ] })
  ] });
}
function DesktopGrid({
  gridSlots,
  totalImages,
  onOpen,
  sortedImages
}) {
  const remaining = totalImages > 4 ? totalImages - 4 : 0;
  const openByMedia = (media) => {
    if (!media) return;
    const idx = sortedImages.findIndex((m) => m.url === media.url);
    onOpen(idx >= 0 ? idx : 0);
  };
  const Tile = ({
    slot,
    className,
    children
  }) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative overflow-hidden group bg-zinc-100 ${className} ${slot ? "cursor-pointer" : "cursor-default"}`,
      onClick: () => openByMedia(slot),
      children: [
        slot ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            OptimizedImage,
            {
              src: slot.url,
              alt: slot.alt ?? "",
              className: "absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" })
        ] }) : /* @__PURE__ */ jsx(EmptySlot, {}),
        children
      ]
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-4 gap-3 h-[450px] rounded-2xl overflow-hidden shadow-xl", children: [
    /* @__PURE__ */ jsx(Tile, { slot: gridSlots[0], className: "col-span-2 h-full" }),
    /* @__PURE__ */ jsxs("div", { className: "col-span-1 flex flex-col gap-3 h-full", children: [
      /* @__PURE__ */ jsx(Tile, { slot: gridSlots[1], className: "flex-1" }),
      /* @__PURE__ */ jsx(Tile, { slot: gridSlots[2], className: "flex-1" })
    ] }),
    /* @__PURE__ */ jsx(Tile, { slot: gridSlots[3], className: "col-span-1 h-full", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: "pointer-events-auto bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 text-zinc-900 text-[11px] font-black shadow-lg transform transition-transform group-hover:scale-110 hover:bg-white",
        onClick: (e) => {
          e.stopPropagation();
          onOpen(0);
        },
        children: [
          /* @__PURE__ */ jsx(Image, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsx("span", { children: remaining > 0 ? `+${remaining} MORE` : "VIEW GALLERY" })
        ]
      }
    ) }) })
  ] });
}
function HotelGalleryGrid({ galleryData, onOpenGallery }) {
  const sortedItems = useMemo(() => {
    return (galleryData || []).filter(
      (g) => g.isActive !== false && g.media?.url && g.categoryName?.toLowerCase() !== "3d"
    ).sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [galleryData]);
  const sortedImages = useMemo(() => sortedItems.map((g) => g.media), [sortedItems]);
  const gridSlots = useMemo(() => {
    const slots = [null, null, null, null];
    const overflow = [];
    sortedItems.forEach((item) => {
      const order = item.displayOrder;
      if (order && order >= 1 && order <= 4) {
        if (!slots[order - 1]) {
          slots[order - 1] = item.media;
        } else {
          overflow.push(item.media);
        }
      } else {
        overflow.push(item.media);
      }
    });
    for (let i = 0; i < 4; i++) {
      if (!slots[i] && overflow.length > 0) {
        slots[i] = overflow.shift();
      }
    }
    return slots;
  }, [sortedItems]);
  if (sortedImages.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "w-full h-48 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 gap-2 text-sm mb-8", children: [
      /* @__PURE__ */ jsx(Image, { className: "w-5 h-5" }),
      " No gallery images available"
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsx(MobileCarousel, { images: sortedImages, onOpen: onOpenGallery }),
    /* @__PURE__ */ jsx(
      DesktopGrid,
      {
        gridSlots,
        totalImages: sortedImages.length,
        onOpen: onOpenGallery,
        sortedImages
      }
    )
  ] });
}
const makemytripLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTYwIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNGRkYxRjIiLz4NCiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjQyIiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiNERjFGMjYiLz4NCiAgPHRleHQgeD0iMjkiIHk9IjM4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIj5NTVQ8L3RleHQ+DQogIDx0ZXh0IHg9IjYwIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjMTExODI3Ij5NYWtlTXlUcmlwPC90ZXh0Pg0KPC9zdmc+DQo=";
const goibiboLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTYwIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNFRkY2RkYiLz4NCiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjQyIiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiMyMjc2RTMiLz4NCiAgPHRleHQgeD0iMjkiIHk9IjM4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIj5HTzwvdGV4dD4NCiAgPHRleHQgeD0iNjAiIHk9IjM4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiMxMTE4MjciPkdvaWJpYm88L3RleHQ+DQo8L3N2Zz4NCg==";
const agodaLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTYwIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNGOUZBRkIiLz4NCiAgPGNpcmNsZSBjeD0iMjgiIGN5PSIzMiIgcj0iOCIgZmlsbD0iIzVFOTZEMiIvPg0KICA8Y2lyY2xlIGN4PSI0NCIgY3k9IjMyIiByPSI4IiBmaWxsPSIjRjM0RjM2Ii8+DQogIDxjaXJjbGUgY3g9IjM2IiBjeT0iMjAiIHI9IjgiIGZpbGw9IiNGOUMyM0MiLz4NCiAgPGNpcmNsZSBjeD0iMzYiIGN5PSI0NCIgcj0iOCIgZmlsbD0iIzZBQzI1OSIvPg0KICA8dGV4dCB4PSI2MCIgeT0iMzgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iIzExMTgyNyI+YWdvZGE8L3RleHQ+DQo8L3N2Zz4NCg==";
const hotelsLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTYwIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNGRUYyRjIiLz4NCiAgPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMzgiIGhlaWdodD0iNDQiIHJ4PSI4IiBmaWxsPSIjRDMyRjJGIi8+DQogIDx0ZXh0IHg9IjI5IiB5PSIzOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSJ3aGl0ZSI+SDwvdGV4dD4NCiAgPHRleHQgeD0iNTgiIHk9IjM4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiMxMTE4MjciPkhvdGVscy5jb208L3RleHQ+DQo8L3N2Zz4NCg==";
const bookingLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTYwIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNFRkY2RkYiLz4NCiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjQyIiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiMwMDM1ODAiLz4NCiAgPHRleHQgeD0iMjkiIHk9IjM4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIj5CPC90ZXh0Pg0KICA8dGV4dCB4PSI2MCIgeT0iMzgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iIzExMTgyNyI+Qm9va2luZy5jb208L3RleHQ+DQo8L3N2Zz4NCg==";
const genericPartnerLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTYwIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNGM0Y0RjYiLz4NCiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjQyIiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiM2QjcyODAiLz4NCiAgPHRleHQgeD0iMjkiIHk9IjM4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIj5PVEE8L3RleHQ+DQogIDx0ZXh0IHg9IjYwIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjMTExODI3Ij5Cb29raW5nIFBhcnRuZXI8L3RleHQ+DQo8L3N2Zz4NCg==";
const normalizePartnerName = (value) => (value || "").trim().toLowerCase().replace(/\s+/g, " ");
const PARTNER_LOGOS = {
  makemytrip: makemytripLogo,
  "make my trip": makemytripLogo,
  mmt: makemytripLogo,
  goibibo: goibiboLogo,
  agoda: agodaLogo,
  "hotels.com": hotelsLogo,
  hotels: hotelsLogo,
  "booking.com": bookingLogo,
  booking: bookingLogo
};
function RightSidebar({
  hotel,
  selectedRoom,
  onBookNow,
  checkInDate,
  checkOutDate,
  numberOfNights,
  policies = null,
  bookingPartners = []
}) {
  const resolvedCheckIn = policies?.checkInTime || hotel.checkIn || "2:00 PM";
  const resolvedCheckOut = policies?.checkOutTime || hotel.checkOut || "11:00 AM";
  const scrollToSection = (id, offset = 150) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };
  const formatPrice = (amount) => {
    if (amount === void 0 || amount === null || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };
  const getRoomPrice = (room) => {
    if (!room) return 0;
    const price = room.basePrice ?? room.price ?? 0;
    return typeof price === "number" ? price : 0;
  };
  const getOriginalRoomPrice = (room) => {
    if (!room) return 0;
    const originalPrice = room.originalPrice ?? room.strikePrice;
    if (typeof originalPrice === "number" && originalPrice > 0) {
      return originalPrice;
    }
    return Math.round(getRoomPrice(room) * 1.2);
  };
  const calculateTotalPrice = (room) => {
    if (!room) return 0;
    const roomPrice = getRoomPrice(room);
    return roomPrice * numberOfNights;
  };
  const calculateOriginalTotalPrice = (room) => {
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
    (partner) => partner?.isActive !== false && partner?.url
  );
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 sticky top-24", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `bg-card border ${selectedRoom ? "border-primary ring-1 ring-primary" : "border-border"} rounded-xl p-5 shadow-lg relative overflow-hidden transition-all text-left`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-2 opacity-5", children: /* @__PURE__ */ jsx(Star, { className: "w-24 h-24" }) }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 text-left", children: [
            /* @__PURE__ */ jsx("div", { className: "flex justify-between items-end mb-4 text-left", children: /* @__PURE__ */ jsx("div", { className: "text-left w-full", children: selectedRoom ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground uppercase tracking-wider font-semibold", children: [
                "Total Price for ",
                numberOfNights,
                " ",
                numberOfNights === 1 ? "Night" : "Nights"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mt-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl font-serif font-bold text-primary", children: formatPrice(calculateTotalPrice(selectedRoom)) }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground line-through", children: formatPrice(calculateOriginalTotalPrice(selectedRoom)) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground mt-1 truncate", children: selectedRoom.name }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "+ taxes & fees included" })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider font-semibold", children: "Starting from" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1 mt-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl font-serif font-bold text-muted-foreground/60", children: hotel.price }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "/ night" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Select a room to see final price" })
            ] }) }) }),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => selectedRoom ? onBookNow() : scrollToSection("room-options"),
                className: "w-full font-bold uppercase tracking-wider py-3 text-sm shadow-md hover:shadow-lg transition-all",
                variant: selectedRoom ? "default" : "secondary",
                children: selectedRoom ? "Proceed to Book" : "Select Room"
              }
            ),
            /* @__PURE__ */ jsxs("p", { className: "mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-green-500" }),
              /* @__PURE__ */ jsx("span", { children: "Best Price Guarantee • Instant Confirmation" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl overflow-hidden border border-border shadow-md group", children: [
      /* @__PURE__ */ jsxs("div", { className: "h-44 relative w-full overflow-hidden", children: [
        /* @__PURE__ */ jsx(
          "iframe",
          {
            width: "100%",
            height: "100%",
            frameBorder: "0",
            scrolling: "no",
            src: getMapEmbedUrl(),
            className: "w-full h-full scale-110 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-white text-primary p-2.5 rounded-full shadow-xl animate-bounce ring-4 ring-white/30", children: /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-1 bg-black/20 rounded-full blur-sm" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none", children: /* @__PURE__ */ jsxs("p", { className: "text-white text-xs font-semibold flex items-center gap-1.5 truncate", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 flex-shrink-0 text-red-400" }),
          hotel.location,
          ", ",
          hotel.city
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-3 bg-card border-t border-border flex gap-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "flex-1 text-xs font-semibold",
            onClick: () => scrollToSection("location"),
            children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 mr-1.5" }),
              "View Full Map"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: hotel.coordinates ? `https://www.google.com/maps?q=${hotel.coordinates.lat},${hotel.coordinates.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.location}`)}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            title: "Open in Google Maps",
            children: /* @__PURE__ */ jsx(Navigation, { className: "w-3 h-3" })
          }
        )
      ] })
    ] }),
    hotel.rating && /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxs("h4", { className: "text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between", children: [
        "Guest Reviews",
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-[10px] text-primary cursor-pointer hover:underline font-normal",
            onClick: () => scrollToSection("reviews"),
            children: "View All"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-primary/10 text-primary p-2 rounded-lg", children: /* @__PURE__ */ jsx(Star, { className: "w-6 h-6 fill-current" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60", children: [
            hotel.rating,
            "/5"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            hotel.verifiedReviews || 0,
            " Verified Reviews"
          ] })
        ] })
      ] })
    ] }),
    hotel.amenities && hotel.amenities.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxs("h4", { className: "text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between", children: [
        "Top Amenities",
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-[10px] text-primary cursor-pointer hover:underline font-normal",
            onClick: () => scrollToSection("amenities"),
            children: "View All"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-y-3 gap-x-2", children: hotel.amenities.slice(0, 6).map((amenity, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-1 h-1 bg-primary rounded-full shrink-0" }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-xs text-muted-foreground truncate",
            title: amenity,
            children: amenity
          }
        )
      ] }, idx)) })
    ] }),
    hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxs("h4", { className: "text-sm font-serif font-bold text-foreground mb-3 flex items-center justify-between", children: [
        "Nearby",
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-[10px] text-primary cursor-pointer hover:underline font-normal",
            onClick: () => scrollToSection("location"),
            children: "Full List"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: hotel.nearbyPlaces.slice(0, 3).map((place, idx) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex justify-between items-center text-xs",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: place.name }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-primary", children: place.distance })
          ]
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-secondary/10 border border-secondary/20 rounded-xl p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(Info, { className: "w-4 h-4 text-primary shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground mb-1", children: "Check-in / Check-out" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground gap-4", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "In:",
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: resolvedCheckIn })
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Out:",
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: resolvedCheckOut })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "text-[10px] font-bold text-primary hover:underline mt-2",
            onClick: () => scrollToSection("policies"),
            children: "Read All Policies"
          }
        )
      ] })
    ] }) }),
    visibleBookingPartners.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-5 shadow-sm", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center", children: "View on Other Platforms" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center justify-center gap-2", children: visibleBookingPartners.map((partner) => {
        const fallbackLogo = PARTNER_LOGOS[normalizePartnerName(partner.title)] || genericPartnerLogo;
        const logoSrc = partner?.icon?.url || fallbackLogo;
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: partner.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "group flex items-center gap-2 rounded-lg border border-border bg-secondary/10 px-3 py-2 transition-all hover:bg-secondary/20",
            title: partner.title || "Booking Partner",
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-7 w-12 items-center justify-center overflow-hidden rounded bg-white", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: logoSrc,
                  alt: partner.title || "Booking Partner",
                  className: "h-full w-full object-contain"
                }
              ) }),
              /* @__PURE__ */ jsx("span", { className: "max-w-[120px] truncate text-[11px] font-bold text-foreground", children: partner.title || "Booking Partner" }),
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100" })
            ]
          },
          partner.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        className: "w-full h-12 gap-2 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10 hover:text-[#25D366] font-bold shadow-sm",
        onClick: () => window.open(
          `https://wa.me/919876543210?text=I'm interested in booking a room at ${hotel.name}`,
          "_blank"
        ),
        children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5" }),
          " Chat on WhatsApp"
        ]
      }
    )
  ] });
}
function MobileBookingBar({
  hotel,
  selectedRoom,
  checkInDate,
  checkOutDate,
  numberOfNights,
  onSelectRoom
}) {
  const formatPrice = (amount) => {
    if (amount === void 0 || amount === null || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };
  const getRoomPrice = (room) => {
    if (!room) return 0;
    const price = room.basePrice ?? room.price ?? 0;
    return typeof price === "number" ? price : 0;
  };
  const calculateTotalPrice = (room) => {
    if (!room) return 0;
    const roomPrice = getRoomPrice(room);
    return roomPrice * numberOfNights;
  };
  return /* @__PURE__ */ jsx("div", { className: "lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      checkInDate && checkOutDate && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] text-muted-foreground mb-1", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }),
        /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
          format(checkInDate, "dd MMM"),
          " - ",
          format(checkOutDate, "dd MMM"),
          " • ",
          numberOfNights,
          "N"
        ] })
      ] }),
      selectedRoom ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: selectedRoom.name }),
        /* @__PURE__ */ jsx("p", { className: "font-bold text-primary text-lg", children: formatPrice(calculateTotalPrice(selectedRoom)) })
      ] }) : /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Starting from" }),
        /* @__PURE__ */ jsx("p", { className: "font-bold text-muted-foreground/60 text-lg", children: hotel.price })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        onClick: onSelectRoom,
        className: "font-bold uppercase tracking-wider text-xs px-6",
        variant: selectedRoom ? "default" : "secondary",
        children: selectedRoom ? "Book Now" : "Select Room"
      }
    )
  ] }) }) });
}
function filterEnabledReplies(replies = []) {
  return replies.filter((reply) => reply?.enabled !== false).map((reply) => ({
    ...reply,
    replies: filterEnabledReplies(reply.replies || [])
  }));
}
function filterEnabledComments(comments = []) {
  return comments.filter((comment) => comment?.enabled !== false).map((comment) => ({
    ...comment,
    replies: filterEnabledReplies(comment.replies || [])
  }));
}
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function getInitials(name) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}
function parseMessage(message) {
  const match = message.match(/^\[(\d)★\]\s*/);
  if (match) {
    return { rating: parseInt(match[1]), text: message.slice(match[0].length) };
  }
  return { rating: null, text: message };
}
function buildMessage(rating, text) {
  return `[${rating}★] ${text}`;
}
function StarDisplay({ rating }) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
    Star,
    {
      className: `w-3.5 h-3.5 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`
    },
    star
  )) });
}
function UserInfoModal({ message, rating, onSubmit, onClose }) {
  const [info, setInfo] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!info.name.trim()) e.name = "Name is required";
    if (!info.email.trim() || !/\S+@\S+\.\S+/.test(info.email)) e.email = "Valid email required";
    if (!info.phone.trim() || !/^\d{10}$/.test(info.phone)) e.phone = "10-digit phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative animate-in fade-in zoom-in-95 duration-200", children: [
    /* @__PURE__ */ jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground", children: "Almost there!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Please share a few details to post your review." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-secondary/20 border border-border/50 rounded-lg px-4 py-3 mb-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-1.5", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsx(Star, { className: `w-3.5 h-3.5 ${s <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}` }, s)) }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-foreground/70 italic line-clamp-2", children: [
        '"',
        message,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "Your name *", value: info.name, onChange: (e) => setInfo({ ...info, name: e.target.value }), className: errors.name ? "border-red-400" : "" }),
        errors.name && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "Email address *", type: "email", value: info.email, onChange: (e) => setInfo({ ...info, email: e.target.value }), className: errors.email ? "border-red-400" : "" }),
        errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "Phone number *", type: "tel", value: info.phone, onChange: (e) => setInfo({ ...info, phone: e.target.value }), className: errors.phone ? "border-red-400" : "" }),
        errors.phone && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.phone })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Button, { onClick: () => {
      if (validate()) onSubmit(info);
    }, className: "w-full mt-5 gap-2", children: [
      /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
      " Post Review"
    ] })
  ] }) });
}
function SuccessToast({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4e3);
    return () => clearTimeout(t);
  }, [onClose]);
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300", children: [
    /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 shrink-0" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-sm", children: "Review submitted!" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-green-100", children: "Your review has been added successfully." })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: onClose, className: "ml-2 text-green-200 hover:text-white", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
  ] });
}
function ReplyThread({ commentId, replyCount }) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  if (replyCount === 0) return null;
  const loadThread = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getCommentThread(commentId);
      setReplies(filterEnabledReplies(res.data?.replies || []));
      setExpanded(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mt-3 ml-4 md:ml-10", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: loadThread,
        disabled: replyCount === 0,
        className: "flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-3 disabled:opacity-50 disabled:cursor-default disabled:no-underline",
        children: [
          expanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-3.5 h-3.5" }),
          loading ? "Loading..." : expanded ? "Hide replies" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
        ]
      }
    ),
    expanded && replies.length > 0 && /* @__PURE__ */ jsx("div", { className: "bg-secondary/20 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200", children: replies.map((reply) => /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-bold text-foreground flex items-center gap-1.5", children: [
          reply.adminReply && /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary rounded-full" }),
          reply.name
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground text-xs", children: [
          "• ",
          formatDate(reply.createdAt)
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: reply.message })
    ] }, reply.id)) })
  ] });
}
function ReviewCard({ comment }) {
  const { rating, text } = parseMessage(comment.message);
  return /* @__PURE__ */ jsxs("div", { className: "border-b border-border pb-6 last:border-0 last:pb-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Avatar, { children: /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-primary/10 text-primary font-bold", children: getInitials(comment.name) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: comment.name }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: formatDate(comment.createdAt) })
        ] })
      ] }),
      rating !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded", children: [
        rating,
        " ",
        /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-current" })
      ] })
    ] }),
    rating !== null && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(StarDisplay, { rating }) }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed mb-2", children: text }),
    /* @__PURE__ */ jsx(
      ReplyThread,
      {
        commentId: comment.id,
        replyCount: (comment.replies || []).filter((reply) => reply?.enabled !== false).length
      }
    )
  ] });
}
function ReviewsSection({ propertyId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!propertyId) return;
    const fetch2 = async () => {
      setLoading(true);
      try {
        const res = await getCommentsByProperty(propertyId);
        setComments(filterEnabledComments(res.data || []));
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch2();
  }, [propertyId]);
  useEffect(() => {
    const totalPages2 = Math.max(1, Math.ceil(comments.length / itemsPerPage));
    if (currentPage > totalPages2) {
      setCurrentPage(totalPages2);
    }
  }, [comments.length, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(comments.length / itemsPerPage);
  const currentComments = comments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleSubmitClick = () => {
    if (!newComment.trim()) return;
    setShowModal(true);
  };
  const handleUserInfoSubmit = async (userInfo) => {
    if (!propertyId) return;
    setSubmitting(true);
    try {
      const payload = {
        propertyId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        tags: "PropertyReview",
        message: buildMessage(newRating, newComment)
      };
      const res = await createComment(payload);
      const newEntry = {
        id: res.data?.id ?? Date.now(),
        name: userInfo.name,
        message: buildMessage(newRating, newComment),
        adminReply: false,
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        replies: []
      };
      setComments([newEntry, ...comments]);
      setNewComment("");
      setNewRating(5);
      setShowModal(false);
      setShowSuccess(true);
      setCurrentPage(1);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-serif font-bold", children: "Guest Reviews" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-0.5", children: [
        comments.length,
        " ",
        comments.length === 1 ? "review" : "reviews"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-secondary/5 rounded-xl p-6 border border-border/50", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-4", children: "Write a Review" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          Textarea,
          {
            placeholder: "Share your experience about your stay...",
            className: "min-h-[100px] bg-background resize-none",
            value: newComment,
            onChange: (e) => setNewComment(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium mr-2", children: "Your Rating:" }),
            [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setNewRating(star),
                className: "focus:outline-none transition-transform hover:scale-110",
                children: /* @__PURE__ */ jsx(Star, { className: `w-5 h-5 ${star <= newRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}` })
              },
              star
            ))
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: handleSubmitClick, disabled: !newComment.trim() || submitting, className: "gap-2", children: [
            /* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" }),
            " Submit Review"
          ] })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "space-y-6", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-secondary shrink-0" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-secondary rounded w-32" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-secondary rounded w-full" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 bg-secondary rounded w-3/4" })
      ] })
    ] }, i)) }) : comments.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(MessageCircle, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No reviews yet. Be the first to review!" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: currentComments.map((comment) => /* @__PURE__ */ jsx(ReviewCard, { comment }, comment.id)) }),
    totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 pt-4", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, children: "Previous" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium mx-2", children: [
        "Page ",
        currentPage,
        " of ",
        totalPages
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, children: "Next" })
    ] }),
    showModal && /* @__PURE__ */ jsx(
      UserInfoModal,
      {
        message: newComment,
        rating: newRating,
        onSubmit: handleUserInfoSubmit,
        onClose: () => setShowModal(false)
      }
    ),
    showSuccess && /* @__PURE__ */ jsx(SuccessToast, { onClose: () => setShowSuccess(false) })
  ] });
}
const getAmenityName = (amenity) => {
  if (typeof amenity === "string") return amenity;
  if (amenity && typeof amenity === "object" && "name" in amenity && typeof amenity.name === "string") {
    return amenity.name;
  }
  return null;
};
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };
const VERIFIED_REVIEWS_SCALE = 1e6;
const parseCombinedRatingMeta = (value) => {
  if (value === null || value === void 0 || value === "") {
    return { rating: null, verifiedReviews: null };
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return { rating: null, verifiedReviews: null };
  }
  const rating = Math.floor((numericValue + 1e-7) * 10) / 10;
  const verifiedReviews = Math.round(
    (numericValue - rating) * VERIFIED_REVIEWS_SCALE
  );
  return {
    rating: Number.isNaN(rating) ? null : rating,
    verifiedReviews: Number.isNaN(verifiedReviews) || verifiedReviews <= 0 ? null : verifiedReviews
  };
};
const normalizeDiningList = (response) => {
  const data = response?.data?.data || response?.data || response || [];
  return Array.isArray(data) ? data : [];
};
const buildRestaurantPathMap = (rawData) => {
  return (Array.isArray(rawData) ? rawData : []).reduce(
    (acc, item) => {
      const parent = item?.propertyResponseDTO;
      const listings = item?.propertyListingResponseDTOS || [];
      const listing = listings.find((entry) => entry?.isActive) || listings[0] || null;
      const typeName = String(
        listing?.propertyType || parent?.propertyTypes?.[0] || ""
      ).trim().toLowerCase();
      if (!parent?.id || typeName !== "restaurant") {
        return acc;
      }
      const cityName = listing?.city || parent?.locationName || parent?.city || "restaurant";
      const propertyName = listing?.propertyName?.trim() || listing?.mainHeading || parent?.propertyName || "restaurant";
      acc[String(parent.id)] = `/${createCitySlug(cityName)}/${createHotelSlug(propertyName, parent.id)}`;
      return acc;
    },
    {}
  );
};
const mapDiningItem = (item) => ({
  id: item?.id ?? `dining-${item?.attachRestaurantId ?? "item"}`,
  name: item?.part1 || "",
  cuisine: item?.attachRestaurantName || item?.part2 || "",
  timings: item?.time || "",
  image: item?.image?.url || void 0,
  description: item?.part2 || "",
  attachedRestaurantName: item?.attachRestaurantName || "",
  attachRestaurantId: item?.attachRestaurantId ?? void 0
});
const normalizeGalleryMedia = (galleryResponse) => {
  const rawGallery = galleryResponse?.data?.content || galleryResponse?.data || galleryResponse || [];
  return (Array.isArray(rawGallery) ? rawGallery : []).filter(
    (item) => item?.isActive && item?.media?.url && !item?.vertical && String(item?.categoryName || "").toLowerCase() !== "3d"
  ).map((item) => item.media).filter((media) => Boolean(media?.url));
};
function HotelDetail() {
  const { citySlug, propertySlug, propertyId } = useParams();
  const navigate = useNavigate();
  const slugTail = propertySlug?.split("-").pop() || "";
  const propertyIdFromUrl = Number(propertyId || slugTail) || null;
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [policies, setPolicies] = useState(null);
  const [diningItems, setDiningItems] = useState([]);
  const [bookingPartners, setBookingPartners] = useState([]);
  const [restaurantPaths, setRestaurantPaths] = useState({});
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [currentDiningIndex, setCurrentDiningIndex] = useState(0);
  const [currentDiningMediaIndex, setCurrentDiningMediaIndex] = useState(0);
  const [datesInitialized, setDatesInitialized] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareReactions, setShowShareReactions] = useState(false);
  const [searchData, setSearchData] = useState({
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    rooms: 1
  });
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      // Just the name of the component
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2]",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "X",
      icon: Twitter,
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
  ];
  useEffect(() => {
    if (!datesInitialized && !searchData.checkIn) {
      const today = /* @__PURE__ */ new Date();
      const tomorrow = addDays(today, 1);
      setSearchData((prev) => ({
        ...prev,
        checkIn: today,
        checkOut: tomorrow
      }));
      setDatesInitialized(true);
    }
  }, [datesInitialized, searchData.checkIn]);
  const numberOfNights = useMemo(() => {
    if (!searchData.checkIn || !searchData.checkOut) return 1;
    const diffTime = searchData.checkOut.getTime() - searchData.checkIn.getTime();
    return Math.max(1, Math.ceil(diffTime / (1e3 * 60 * 60 * 24)));
  }, [searchData.checkIn, searchData.checkOut]);
  const highlightedRoomAmenities = useMemo(() => {
    return Array.from(
      new Set(
        rooms.flatMap((room) => room.highlightedAmenities || []).map((amenity) => getAmenityName(amenity)).filter(Boolean)
      )
    );
  }, [rooms]);
  const firstAvailableRoom = useMemo(() => {
    const availableRooms = rooms.filter((room) => room.isAvailable);
    return availableRooms[0] || null;
  }, [rooms]);
  const effectiveSelectedRoomId = useMemo(() => {
    if (selectedRoomId && rooms.some((room) => room.id === selectedRoomId && room.isAvailable)) {
      return selectedRoomId;
    }
    return firstAvailableRoom?.id || null;
  }, [firstAvailableRoom, rooms, selectedRoomId]);
  const effectiveSelectedRoom = useMemo(
    () => rooms.find((room) => room.id === effectiveSelectedRoomId) || null,
    [effectiveSelectedRoomId, rooms]
  );
  const diningSectionItems = useMemo(
    () => diningItems,
    [diningItems]
  );
  useEffect(() => {
    setCurrentDiningIndex(0);
  }, [diningSectionItems.length]);
  useEffect(() => {
    setCurrentDiningMediaIndex(0);
  }, [currentDiningIndex]);
  useEffect(() => {
    if (diningSectionItems.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentDiningIndex(
        (prev) => prev === diningSectionItems.length - 1 ? 0 : prev + 1
      );
    }, 3500);
    return () => window.clearInterval(timer);
  }, [diningSectionItems.length]);
  const activeDiningItem = diningSectionItems[currentDiningIndex] || null;
  const activeDiningMediaSlides = activeDiningItem?.mediaSlides?.length ? activeDiningItem.mediaSlides : activeDiningItem?.image ? [
    {
      mediaId: null,
      type: "IMAGE",
      url: activeDiningItem.image,
      fileName: null,
      alt: activeDiningItem.name || null,
      width: null,
      height: null
    }
  ] : [];
  useEffect(() => {
    if (activeDiningMediaSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentDiningMediaIndex(
        (prev) => prev === activeDiningMediaSlides.length - 1 ? 0 : prev + 1
      );
    }, 2800);
    return () => window.clearInterval(timer);
  }, [activeDiningMediaSlides.length]);
  const aboutAmenitiesPreview = useMemo(
    () => hotel?.amenities?.slice(0, 4) ?? [],
    [hotel]
  );
  const roomPolicyHighlightText = useMemo(() => {
    const normalizedFreeCancellation = "free cancellation";
    const matchedPolicy = (policies?.policies || []).find((policy) => {
      const normalizedPolicyName = String(policy?.name || "").trim().toLowerCase().replace(/\s+/g, " ");
      return policy?.isActive && normalizedPolicyName === normalizedFreeCancellation;
    });
    return matchedPolicy?.name || "";
  }, [policies]);
  const fetchNearbyFromOSM = async (lat, lng, propertyName) => {
    try {
      console.log(
        `📍 Fetching nearby locations for: "${propertyName}" at [${lat}, ${lng}]`
      );
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"restaurant|cafe|fast_food|bank"](around:3000, ${lat}, ${lng});
          node["tourism"~"museum|attraction|viewpoint|hotel"](around:3000, ${lat}, ${lng});
          node["historic"](around:3000, ${lat}, ${lng});
          node["highway"~"bus_stop"](around:3000, ${lat}, ${lng});
        );
        out body 10;
      `;
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        console.warn(
          "⚠️ OSM Server busy or returned HTML error. Using fallback."
        );
        return [];
      }
      const data = await response.json();
      if (!data.elements) return [];
      const results = data.elements.filter((el) => el.tags && el.tags.name).map((el) => {
        const dist = (Math.sqrt(Math.pow(el.lat - lat, 2) + Math.pow(el.lon - lng, 2)) * 111).toFixed(2);
        console.log(
          `🔎 Found: ${el.tags.name} (${el.tags.amenity || "Point"}) ~${dist}km away`
        );
        return {
          name: el.tags.name,
          type: (el.tags.amenity || el.tags.tourism || "Landmark").replace(
            "_",
            " "
          ),
          // Save the distance here so the UI can use it
          distance: `${(Math.sqrt(Math.pow(el.lat - lat, 2) + Math.pow(el.lon - lng, 2)) * 111).toFixed(2)} km`,
          coordinates: { lat: el.lat, lng: el.lon }
        };
      }).sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(a.coordinates.lat - lat, 2) + Math.pow(a.coordinates.lng - lng, 2)
        );
        const distB = Math.sqrt(
          Math.pow(b.coordinates.lat - lat, 2) + Math.pow(b.coordinates.lng - lng, 2)
        );
        return distA - distB;
      }).slice(0, 2);
      return results;
    } catch (error2) {
      console.error("❌ OSM Fetch Error:", error2);
      return [];
    }
  };
  const scrollToLocation = () => {
    const el = document.getElementById("location");
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 120,
        behavior: "smooth"
      });
    }
  };
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyIdFromUrl) {
        setError("Invalid ID");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await GetAllPropertyDetails();
        const rawData = response?.data || response;
        setRestaurantPaths(buildRestaurantPathMap(rawData));
        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
          (item) => {
            const parent2 = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];
            return listings.length === 0 ? [{ parent: parent2, listing: null }] : listings.map((l) => ({ parent: parent2, listing: l }));
          }
        );
        const matched = flattened.find(
          (m) => Number(m.parent.id) === Number(propertyIdFromUrl) && m.listing?.isActive === true
        );
        if (!matched) {
          setError("Property Not Found");
          return;
        }
        const { parent, listing } = matched;
        const coords = parent.latitude && parent.longitude ? { lat: Number(parent.latitude), lng: Number(parent.longitude) } : null;
        const displayName = listing?.propertyName?.trim() ? listing.propertyName : listing?.mainHeading || parent.propertyName;
        const ratingMeta = parseCombinedRatingMeta(listing?.rating);
        let dynamicNearby = [];
        if (coords) {
          dynamicNearby = await fetchNearbyFromOSM(
            coords.lat,
            coords.lng,
            displayName
          );
        }
        setHotel({
          id: listing?.id || parent.id,
          propertyId: parent.id,
          locationId: parent.locationId,
          name: displayName,
          addressUrl: parent.addressUrl || null,
          location: listing?.fullAddress || parent.address,
          city: parent.locationName,
          type: listing?.propertyType || parent.propertyTypes?.[0] || "Property",
          description: listing?.mainHeading || "",
          tagline: listing?.tagline || "",
          rating: ratingMeta.rating,
          verifiedReviews: ratingMeta.verifiedReviews,
          price: `₹${(listing?.price || 0).toLocaleString()}`,
          media: listing?.media || [],
          coordinates: coords,
          amenities: (listing?.amenities || []).map((amenity) => getAmenityName(amenity)).filter(Boolean),
          bookingEngineUrl: parent.bookingEngineUrl || null,
          checkIn: "2:00 PM",
          checkOut: "11:00 AM",
          image: { src: listing?.media?.[0]?.url || "", alt: displayName },
          nearbyPlaces: parent.nearbyLocations?.length > 0 ? parent.nearbyLocations.map((n) => ({
            name: n.nearbyLocationName,
            googleMapLink: n.googleMapLink
          })) : dynamicNearby.length > 0 ? dynamicNearby : []
        });
        console.log("LISTING:", listing);
        console.log("TAGLINE:", listing?.tagline);
        fetchRooms(parent.id);
        fetchGallery(parent.id);
        fetchDining(parent.id);
        fetchBookingPartners(parent.id);
        fetchPolicies(parent.id);
      } catch (err) {
        console.error("Property Fetch Error:", err);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [propertyIdFromUrl]);
  const fetchRooms = async (propId) => {
    try {
      setRoomsLoading(true);
      const res = await getRoomsByPropertyId(propId);
      const mappedRooms = Array.isArray(res?.data) ? res.data.map((r) => {
        const originalBasePrice = Number(r.basePrice ?? r.price ?? 0);
        const discountPercentage = Number(r.discount ?? 0);
        const discountedPrice = originalBasePrice > 0 ? Math.max(
          0,
          originalBasePrice - originalBasePrice * discountPercentage / 100
        ) : 0;
        const resolvedDiscountPercent = originalBasePrice > 0 && discountPercentage > 0 ? Math.round(discountPercentage) : 0;
        return {
          id: r.roomId.toString(),
          name: r.roomName || r.roomNumber,
          type: r.roomTypeName || r.roomType,
          description: r.description || "",
          basePrice: discountedPrice,
          originalPrice: originalBasePrice > 0 ? originalBasePrice : null,
          strikePrice: originalBasePrice > 0 ? originalBasePrice : null,
          discount: discountPercentage > 0 ? discountPercentage : null,
          discountPercent: resolvedDiscountPercent > 0 ? resolvedDiscountPercent : null,
          maxOccupancy: r.maxOccupancy || 1,
          roomSize: r.roomSize ?? null,
          roomSizeUnit: r.roomSizeUnit || "SQ_FT",
          isAvailable: r.status === "AVAILABLE",
          amenities: r.amenitiesAndFeatures || [],
          highlightedAmenities: r.amenitiesAndFeatures?.filter(
            (a) => Boolean(a.showHighlight)
          ) || [],
          image: {
            src: r.media?.find((item) => item.type === "IMAGE")?.url || r.media?.[0]?.url || "/images/room-placeholder.jpg",
            alt: r.roomName
          }
        };
      }) : [];
      setRooms(mappedRooms);
      setSelectedRoomId((currentSelectedRoomId) => {
        if (currentSelectedRoomId && mappedRooms.some((room) => room.id === currentSelectedRoomId)) {
          return currentSelectedRoomId;
        }
        return mappedRooms.find((room) => room.isAvailable)?.id || null;
      });
    } finally {
      setRoomsLoading(false);
    }
  };
  const fetchGallery = async (propId) => {
    try {
      const res = await getGalleryByPropertyId(propId);
      const raw = res?.data?.content || res?.data || res;
      const items = (Array.isArray(raw) ? raw : []).filter((i) => i.isActive && i.media?.url).sort((a, b) => {
        const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
      console.log("🎯 SORTED PROPERTY GALLERY:", items);
      setGalleryData(items);
    } catch (error2) {
      console.error("❌ GALLERY FETCH ERROR:", error2);
      setGalleryData([]);
    }
  };
  const fetchBookingPartners = async (propId) => {
    try {
      const res = await getAllBookingChannelPartners();
      const raw = res?.data || res || [];
      const list = Array.isArray(raw) ? raw : raw?.content || [];
      setBookingPartners(
        list.filter(
          (item) => String(item?.propertyId || "") === String(propId) && item?.isActive !== false
        )
      );
    } catch (error2) {
      console.error("Booking channel partners fetch error:", error2);
      setBookingPartners([]);
    }
  };
  const fetchDining = async (propId) => {
    try {
      const res = await getAllDiningByPropertyId(propId);
      const baseItems = normalizeDiningList(res).filter((item) => item?.isActive ?? true).map((item) => mapDiningItem(item));
      const items = await Promise.all(
        baseItems.map(async (item) => {
          const ownSlides = item.image ? [
            {
              mediaId: null,
              type: "IMAGE",
              url: item.image,
              fileName: null,
              alt: item.name || null,
              width: null,
              height: null
            }
          ] : [];
          if (!item.attachRestaurantId) {
            return {
              ...item,
              mediaSlides: ownSlides
            };
          }
          try {
            const galleryRes = await getGalleryByPropertyId(
              Number(item.attachRestaurantId)
            );
            const restaurantGallerySlides = normalizeGalleryMedia(galleryRes);
            return {
              ...item,
              mediaSlides: restaurantGallerySlides.length > 0 ? restaurantGallerySlides : ownSlides
            };
          } catch (error2) {
            console.error("DINING RESTAURANT GALLERY FETCH ERROR:", error2);
            return {
              ...item,
              mediaSlides: ownSlides
            };
          }
        })
      );
      setDiningItems(items);
    } catch (error2) {
      console.error("DINING FETCH ERROR:", error2);
      setDiningItems([]);
    }
  };
  const fetchPolicies = async (propId) => {
    try {
      const res = await getAllPropertyPolicies(propId);
      const data = res?.data || res;
      const matched = Array.isArray(data) ? data.find((p) => Number(p.propertyId) === Number(propId)) : data;
      if (matched) {
        setPolicies(matched);
        setHotel(
          (currentHotel) => currentHotel ? {
            ...currentHotel,
            checkIn: matched.checkInTime || currentHotel.checkIn,
            checkOut: matched.checkOutTime || currentHotel.checkOut
          } : currentHotel
        );
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    isBookmarked ? toast("Removed from favorites") : toast.success("Added to favorites!");
  };
  const openGalleryAt = (index) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };
  const handleSearchDataChange = (data) => {
    setSearchData(data);
    setSelectedRoomId(null);
  };
  const handleBookNow = () => {
    if (!hotel?.bookingEngineUrl) {
      showWarning("Online booking is not available for this property yet.");
      return;
    }
    if (!searchData.checkIn || !searchData.checkOut) {
      toast.error("Please select dates");
      return;
    }
    try {
      const baseUrl = hotel.bookingEngineUrl;
      if (baseUrl.includes("checkin")) {
        window.open(baseUrl, "_blank");
        return;
      }
      const url = new URL(baseUrl);
      url.searchParams.set(
        "checkin",
        searchData.checkIn.toISOString().split("T")[0]
      );
      url.searchParams.set(
        "checkout",
        searchData.checkOut.toISOString().split("T")[0]
      );
      url.searchParams.set("adults", String(searchData.adults));
      url.searchParams.set("children", String(searchData.children));
      url.searchParams.set("rooms", String(searchData.rooms));
      window.open(url.toString(), "_blank");
    } catch (error2) {
      console.error("Booking URL error:", error2);
      toast.error("Booking link is not configured correctly.");
    }
  };
  const handleRoomBook = (roomId) => {
    if (!roomId) return;
    setSelectedRoomId(roomId);
    handleBookNow();
  };
  useMemo(() => {
    return galleryData.filter((g) => g.media?.url).map((g) => g.media);
  }, [galleryData]);
  const sections = useMemo(
    () => [
      { id: "room-options", label: "Room Options" },
      { id: "about-hotel", label: "About Hotel" },
      { id: "events", label: "Upcoming Events" },
      // renamed
      { id: "amenities", label: "Amenities" },
      { id: "food-dining", label: "Food & Dining" },
      // ✅ NEW
      { id: "reviews", label: "Guest Reviews" },
      // moved up
      { id: "location", label: "Location" },
      { id: "policies", label: "Guest Policies" }
    ],
    []
  );
  if (loading)
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin w-8 h-8 text-primary" }) });
  if (error || !hotel)
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-4", children: error || "Property Not Found" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/hotels"), children: "Back" })
    ] }) });
  console.log("Selected Room:", selectedRoomId);
  console.log("Booking URL:", hotel?.bookingEngineUrl);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground pt-20", children: [
    /* @__PURE__ */ jsx(Navbar, { logo: siteContent.brand.logo_hotel }),
    /* @__PURE__ */ jsx(
      GalleryModal,
      {
        isOpen: isGalleryOpen,
        onClose: () => setIsGalleryOpen(false),
        hotel,
        initialImageIndex: initialGalleryIndex,
        galleryData
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 md:px-8 lg:px-12 py-6", children: [
      /* @__PURE__ */ jsxs(
        motion.nav,
        {
          variants: fadeIn,
          initial: "initial",
          animate: "animate",
          className: "flex items-center gap-2 text-sm text-muted-foreground mb-6",
          children: [
            /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-foreground transition-colors", children: "Home" }),
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/hotels",
                className: "hover:text-foreground transition-colors",
                children: "Hotels"
              }
            ),
            /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: hotel.name })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8", children: [
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            variants: staggerContainer,
            initial: "initial",
            animate: "animate",
            className: "space-y-3 w-full text-left",
            children: [
              hotel.tagline && /* @__PURE__ */ jsx(motion.div, { variants: fadeIn, children: /* @__PURE__ */ jsx("span", { className: "inline-block text-[11px] font-semibold text-red-500 bg-red-500/10 px-3 py-1 rounded-md", children: hotel.tagline }) }),
              /* @__PURE__ */ jsx(
                motion.h1,
                {
                  variants: fadeIn,
                  className: "text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white",
                  children: hotel.name
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  variants: fadeIn,
                  className: "flex items-center gap-2 text-muted-foreground text-sm flex-wrap",
                  children: [
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary" }),
                      hotel.location,
                      ", ",
                      hotel.city
                    ] }),
                    (hotel.addressUrl || hotel.coordinates) && /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: hotel.addressUrl || `https://www.google.com/maps?q=${hotel.coordinates?.lat},${hotel.coordinates?.lng}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-red-500 font-medium hover:underline ml-2",
                        children: "View Map"
                      }
                    )
                  ]
                }
              ),
              hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && /* @__PURE__ */ jsx(
                motion.div,
                {
                  variants: fadeIn,
                  className: "flex items-center gap-4 text-xs text-muted-foreground flex-wrap",
                  children: hotel.nearbyPlaces.slice(0, 2).map((place, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(Navigation, { className: "w-3 h-3 text-primary" }),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        onClick: scrollToLocation,
                        className: "cursor-pointer hover:text-primary hover:underline transition",
                        children: place.distance ? `${place.distance} from ${place.name}` : place.name
                      }
                    )
                  ] }, i))
                }
              ),
              hotel.rating && /* @__PURE__ */ jsxs(
                motion.div,
                {
                  variants: fadeIn,
                  className: "flex items-center gap-4 pt-1",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "bg-green-600 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-1", children: [
                      hotel.rating,
                      " ",
                      /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-white" })
                    ] }),
                    hotel.verifiedReviews ? /* @__PURE__ */ jsxs("span", { className: "text-sm text-foreground font-semibold", children: [
                      hotel.verifiedReviews,
                      " Verified Reviews"
                    ] }) : null
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 relative", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative",
              onMouseEnter: () => setShowShareReactions(true),
              onMouseLeave: () => setShowShareReactions(false),
              children: [
                /* @__PURE__ */ jsx(AnimatePresence, { children: showShareReactions && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10, scale: 0.9 },
                    animate: { opacity: 1, y: -60, scale: 1 },
                    exit: { opacity: 0, y: 10, scale: 0.9 },
                    className: "absolute left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 shadow-2xl rounded-full px-2.5 py-2 flex gap-2.5 z-50 backdrop-blur-md",
                    children: socialPlatforms.map((p) => {
                      const Icon = p.icon;
                      return /* @__PURE__ */ jsxs(
                        motion.a,
                        {
                          href: p.link,
                          target: "_blank",
                          rel: "noreferrer",
                          whileHover: { scale: 1.2, y: -3 },
                          className: `${p.color} text-white p-2.5 rounded-full shadow-lg flex items-center justify-center`,
                          children: [
                            /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
                            " "
                          ]
                        },
                        p.name
                      );
                    })
                  }
                ) }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "outline",
                    className: "rounded-full active:scale-95 px-6",
                    children: [
                      /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4 mr-2" }),
                      " Share"
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              className: `rounded-full active:scale-95 transition-all px-6 ${isBookmarked ? "bg-destructive/10 border-destructive text-destructive" : ""}`,
              onClick: handleBookmark,
              children: [
                /* @__PURE__ */ jsx(
                  Heart,
                  {
                    className: `w-4 h-4 mr-2 ${isBookmarked ? "fill-current text-destructive" : ""}`
                  }
                ),
                isBookmarked ? "Saved" : "Save"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        HotelGalleryGrid,
        {
          galleryData,
          onOpenGallery: openGalleryAt
        }
      ),
      /* @__PURE__ */ jsx(
        FindYourStay,
        {
          onChange: handleSearchDataChange,
          initialDate: [searchData.checkIn, searchData.checkOut],
          initialGuests: {
            adults: searchData.adults,
            children: searchData.children,
            rooms: searchData.rooms
          }
        }
      ),
      /* @__PURE__ */ jsx(HotelStickyNav, { sections }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 py-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
          /* @__PURE__ */ jsxs("section", { id: "room-options", className: "scroll-mt-32", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-bold mb-6", children: "Choose Your Room" }),
            highlightedRoomAmenities.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 mb-6", children: highlightedRoomAmenities.map((amenity) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "inline-flex items-center rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-foreground",
                children: amenity
              },
              amenity
            )) }),
            roomsLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin w-8 h-8 text-primary" }) }) : rooms.length > 0 ? /* @__PURE__ */ jsx(
              RoomList,
              {
                rooms,
                selectedRoomId: effectiveSelectedRoomId,
                onSelectRoom: handleRoomBook,
                policyHighlightText: roomPolicyHighlightText
              }
            ) : /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No rooms available for the selected dates" })
          ] }),
          /* @__PURE__ */ jsx("section", { id: "about-hotel", className: "scroll-mt-32 border-t pt-10", children: /* @__PURE__ */ jsxs("div", { className: "pb-10", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-2xl md:text-3xl font-serif font-bold mb-4", children: [
              "About ",
              hotel.name
            ] }),
            /* @__PURE__ */ jsx("div", { className: "max-w-4xl text-base leading-relaxed text-muted-foreground space-y-4", children: hotel.description?.split("\n\n").map((para, index) => /* @__PURE__ */ jsx("p", { children: para.trim() }, index)) }),
            aboutAmenitiesPreview.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-4", children: aboutAmenitiesPreview.map((amenity, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "rounded-md border border-border bg-card px-4 py-4 text-center shadow-sm transition-colors hover:border-primary/30",
                children: [
                  /* @__PURE__ */ jsx(Star, { className: "mx-auto mb-2 h-4 w-4 text-red-500" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.08em] text-foreground leading-snug", children: amenity })
                ]
              },
              `${amenity}-${index}`
            )) }) })
          ] }) }),
          /* @__PURE__ */ jsx("section", { id: "events", className: "scroll-mt-32 border-t pt-10", children: /* @__PURE__ */ jsxs(
            "div",
            {
              id: "food-dining",
              className: "grid grid-cols-1 xl:grid-cols-2 gap-8",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-bold mb-6", children: "Events" }),
                  /* @__PURE__ */ jsx(
                    EventSectionPropertySpecific,
                    {
                      locationId: hotel.locationId,
                      locationName: hotel.city,
                      singleCard: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-bold mb-6", children: "Food & Dining" }),
                  diningSectionItems.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "flex transition-transform duration-500 ease-out",
                        style: {
                          transform: `translateX(-${currentDiningIndex * 100}%)`
                        },
                        children: diningSectionItems.map((restaurant) => {
                          const restaurantPath = restaurant.attachRestaurantId ? restaurantPaths[String(restaurant.attachRestaurantId)] : null;
                          return /* @__PURE__ */ jsx(
                            "div",
                            {
                              className: "w-full flex-shrink-0",
                              children: /* @__PURE__ */ jsxs(
                                "div",
                                {
                                  className: `rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-shadow duration-200 ${restaurantPath ? "cursor-pointer hover:shadow-md" : ""}`,
                                  onClick: () => {
                                    if (restaurantPath)
                                      navigate(restaurantPath);
                                  },
                                  role: restaurantPath ? "button" : void 0,
                                  tabIndex: restaurantPath ? 0 : void 0,
                                  onKeyDown: (event) => {
                                    if (restaurantPath && (event.key === "Enter" || event.key === " ")) {
                                      event.preventDefault();
                                      navigate(restaurantPath);
                                    }
                                  },
                                  children: [
                                    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[320px] bg-muted flex items-center justify-center", children: [
                                      activeDiningMediaSlides.length > 0 ? activeDiningMediaSlides[currentDiningMediaIndex]?.type === "VIDEO" ? /* @__PURE__ */ jsx(
                                        "video",
                                        {
                                          src: activeDiningMediaSlides[currentDiningMediaIndex]?.url,
                                          className: "w-full h-full object-cover",
                                          autoPlay: true,
                                          loop: true,
                                          muted: true,
                                          playsInline: true
                                        }
                                      ) : /* @__PURE__ */ jsx(
                                        "img",
                                        {
                                          src: activeDiningMediaSlides[currentDiningMediaIndex]?.url,
                                          alt: restaurant.name,
                                          className: "w-full h-full object-cover"
                                        }
                                      ) : /* @__PURE__ */ jsx(
                                        UtensilsCrossed,
                                        {
                                          className: "w-10 h-10 text-muted-foreground/50",
                                          strokeWidth: 1.5
                                        }
                                      ),
                                      activeDiningMediaSlides.length > 1 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 right-3 z-10 flex gap-1.5", children: activeDiningMediaSlides.map(
                                        (_, idx) => /* @__PURE__ */ jsx(
                                          "button",
                                          {
                                            type: "button",
                                            onClick: (event) => {
                                              event.preventDefault();
                                              event.stopPropagation();
                                              setCurrentDiningMediaIndex(
                                                idx
                                              );
                                            },
                                            className: `h-1.5 rounded-full transition-all ${currentDiningMediaIndex === idx ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"}`,
                                            "aria-label": `Show dining media ${idx + 1}`
                                          },
                                          `dining-media-${restaurant.id}-${idx}`
                                        )
                                      ) })
                                    ] }),
                                    /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-1", children: [
                                      restaurant.name ? /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-foreground leading-snug", children: restaurant.name }) : null,
                                      restaurant.cuisine ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: restaurant.cuisine }) : null,
                                      restaurant.description && restaurant.description !== restaurant.cuisine ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground/90", children: restaurant.description }) : null,
                                      restaurant.attachedRestaurantName ? /* @__PURE__ */ jsxs("div", { className: "pt-2 text-sm", children: [
                                        /* @__PURE__ */ jsx("span", { className: "text-red-600 font-semibold", children: "Restaurant:" }),
                                        " ",
                                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: restaurant.attachedRestaurantName })
                                      ] }) : null,
                                      restaurant.timings ? /* @__PURE__ */ jsxs("div", { className: "pt-2 flex items-center gap-1 text-sm", children: [
                                        /* @__PURE__ */ jsx("span", { className: "text-red-600 font-semibold", children: "Open:" }),
                                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: restaurant.timings })
                                      ] }) : null
                                    ] })
                                  ]
                                }
                              )
                            },
                            restaurant.id
                          );
                        })
                      }
                    ) }),
                    diningSectionItems.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => setCurrentDiningIndex(
                            (prev) => prev === 0 ? diningSectionItems.length - 1 : prev - 1
                          ),
                          className: "absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-border rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-all",
                          "aria-label": "Previous dining item",
                          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => setCurrentDiningIndex(
                            (prev) => prev === diningSectionItems.length - 1 ? 0 : prev + 1
                          ),
                          className: "absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-border rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-all",
                          "aria-label": "Next dining item",
                          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-4", children: diningSectionItems.map((_, idx) => /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => setCurrentDiningIndex(idx),
                          className: `h-1.5 rounded-full transition-all ${currentDiningIndex === idx ? "bg-primary w-5" : "bg-border hover:bg-muted-foreground w-1.5"}`,
                          "aria-label": `Go to dining slide ${idx + 1}`
                        },
                        idx
                      )) })
                    ] })
                  ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground", children: "No food and dining highlights available for this property." })
                ] })
              ]
            }
          ) }),
          hotel.amenities.length > 0 && /* @__PURE__ */ jsx("section", { id: "amenities", className: "scroll-mt-32 border-t pt-10", children: /* @__PURE__ */ jsxs("div", { className: "pb-10", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-6 flex items-center justify-between gap-4", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-bold", children: "Amenities" }) }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-y-6 gap-x-10 sm:grid-cols-2 lg:grid-cols-3", children: hotel.amenities.map((amenity, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-3",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-red-500", children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsx("p", { className: "text-base text-foreground", children: amenity })
                ]
              },
              `${amenity}-${index}`
            )) })
          ] }) }),
          /* @__PURE__ */ jsx("section", { id: "reviews", className: "scroll-mt-32 border-t pt-10", children: /* @__PURE__ */ jsx(ReviewsSection, { propertyId: propertyIdFromUrl }) }),
          /* @__PURE__ */ jsxs("section", { id: "location", className: "scroll-mt-32 border-t pt-10", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-bold mb-6", children: "Location" }),
            /* @__PURE__ */ jsx(
              PropertyMap,
              {
                property: hotel,
                nearbyPlaces: hotel.nearbyPlaces || []
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("section", { id: "policies", className: "scroll-mt-32 border-t pt-10", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-serif font-bold mb-6", children: "Guest Policies" }),
            /* @__PURE__ */ jsx("div", { className: "bg-white border rounded-xl p-6 md:p-8 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest", children: [
                  /* @__PURE__ */ jsx(Info, { className: "w-4 h-4" }),
                  " CHECK-IN / CHECK-OUT"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-5 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between md:justify-start md:gap-6", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground min-w-[100px]", children: "Check-in:" }),
                      /* @__PURE__ */ jsx("span", { children: policies?.checkInTime || "2:00 PM" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between md:justify-start md:gap-6", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground min-w-[100px]", children: "Check-out:" }),
                      /* @__PURE__ */ jsx("span", { children: policies?.checkOutTime || "11:00 AM" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border/60 bg-muted/20 px-4 py-4", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground mb-2", children: "Cancellation Policy" }),
                    /* @__PURE__ */ jsx("p", { className: "leading-relaxed", children: policies?.cancellationPolicy || "Non-refundable for promotional rates" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest", children: [
                  /* @__PURE__ */ jsx(Info, { className: "w-4 h-4" }),
                  " OTHER POLICIES"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-border/60 bg-muted/20 px-4 py-4", children: /* @__PURE__ */ jsx("ul", { className: "grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2", children: policies?.policies?.map((p) => /* @__PURE__ */ jsxs(
                  "li",
                  {
                    className: "flex items-start gap-2 text-foreground",
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" }),
                      /* @__PURE__ */ jsx("span", { className: "leading-snug", children: p.name })
                    ]
                  },
                  p.id
                )) }) })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsx(
          RightSidebar,
          {
            hotel,
            selectedRoom: effectiveSelectedRoom,
            onBookNow: handleBookNow,
            checkInDate: searchData.checkIn,
            checkOutDate: searchData.checkOut,
            numberOfNights,
            policies,
            bookingPartners
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      MobileBookingBar,
      {
        hotel,
        selectedRoom: effectiveSelectedRoom,
        checkInDate: searchData.checkIn,
        checkOutDate: searchData.checkOut,
        numberOfNights,
        onSelectRoom: () => {
          const roomSection = document.getElementById("room-options");
          if (roomSection)
            window.scrollTo({
              top: roomSection.getBoundingClientRect().top + window.pageYOffset - 120,
              behavior: "smooth"
            });
        }
      }
    ),
    /* @__PURE__ */ jsx(Footer, {})
  ] }) });
}
export {
  HotelDetail as default
};
