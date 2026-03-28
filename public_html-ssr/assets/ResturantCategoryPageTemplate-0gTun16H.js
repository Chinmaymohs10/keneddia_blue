import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React__default, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, Star, MapPin, Navigation, Share2, Heart, Image, MessageCircle, Facebook, Twitter, Linkedin, Utensils, ChevronLeft, CalendarCheck, Flame, ShoppingBag, X, User, Phone, Loader2, Send } from "lucide-react";
import { c as createCitySlug, a as createHotelSlug, B as Button, O as OptimizedImage, a8 as getAllMenuThumbnails, I as Input, a4 as createJoiningUs, N as Navbar, w as siteContent, F as Footer, G as GetAllPropertyDetails, W as getAllVerticalCards, a3 as getMenuItems, a9 as searchGallery } from "../entry-server.js";
import { toast } from "react-hot-toast";
import { G as GalleryModal } from "./GalleryModal-DTwSFNib.js";
import { R as ResturantpageEvents, A as AutoTestimonials, a as ReservationForm } from "./ResturantpageEvents-DDzM4gBC.js";
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
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };
const FALLBACK_LOCATION = "Ghaziabad, India";
const FALLBACK_NEARBY = [
  "0.2 km from Gateway of India",
  "2.5 km from Marine Drive"
];
const FALLBACK_TAGLINE = "PREMIUM EXPERIENCE";
const FALLBACK_MAPS_LINK = "https://google.com/maps/place/kennedia+blu+restaurant+ghaziabad/data=!4m2!3m1!1s0x390cf1005bab4c6f:0xb455a48e012d76e7?sa=X&ved=1t:242&ictx=111";
const EmptySlot = ({ className = "" }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: `w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`,
    children: /* @__PURE__ */ jsx(Image, { className: "w-8 h-8 text-gray-300" })
  }
);
function CategoryHero({
  content,
  propertyId,
  galleryData = [],
  propertyData
}) {
  useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareReactions, setShowShareReactions] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStart = React__default.useRef(null);
  const restaurantPath = `/${createCitySlug(
    propertyData?.city || propertyData?.locationName || propertyData?.propertyName
  )}/${createHotelSlug(
    propertyData?.propertyName || propertyData?.name || "restaurant",
    propertyId || 27
  )}`;
  const location = useMemo(() => {
    if (!propertyData) return FALLBACK_LOCATION;
    return propertyData.fullAddress ?? propertyData.address ?? propertyData.location ?? FALLBACK_LOCATION;
  }, [propertyData]);
  const city = useMemo(() => {
    if (!propertyData) return "";
    return propertyData.city ?? propertyData.locationName ?? "";
  }, [propertyData]);
  const tagline = useMemo(() => {
    if (!propertyData) return FALLBACK_TAGLINE;
    return propertyData.tagline ?? propertyData.subTitle ?? FALLBACK_TAGLINE;
  }, [propertyData]);
  const rating = useMemo(() => propertyData?.rating ?? null, [propertyData]);
  const nearbyPlaces = useMemo(() => {
    if (propertyData?.nearbyLocations?.length > 0) {
      return propertyData.nearbyLocations.map((n) => ({
        nearbyLocationName: n.nearbyLocationName,
        googleMapLink: n.googleMapLink
      }));
    }
    if (content?.nearbyPlaces?.length > 0) {
      return content.nearbyPlaces.map(
        (p) => typeof p === "string" ? { nearbyLocationName: p } : p
      );
    }
    return FALLBACK_NEARBY.map((name) => ({ nearbyLocationName: name }));
  }, [propertyData, content]);
  const mapsLink = useMemo(() => {
    if (propertyData?.latitude && propertyData?.longitude) {
      return `https://www.google.com/maps?q=${propertyData.latitude},${propertyData.longitude}`;
    }
    if (propertyData?.coordinates?.lat && propertyData?.coordinates?.lng) {
      return `https://www.google.com/maps?q=${propertyData.coordinates.lat},${propertyData.coordinates.lng}`;
    }
    return FALLBACK_MAPS_LINK;
  }, [propertyData]);
  const galleryItems = useMemo(() => {
    return (galleryData || []).filter(
      (g) => g.isActive !== false && g.media?.url && g.categoryName?.toLowerCase() !== "3d"
    ).sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [galleryData]);
  const galleryMedia = useMemo(
    () => galleryItems.map((g) => ({
      mediaId: g.media.mediaId,
      url: g.media.url,
      type: g.media.type,
      fileName: g.media.fileName,
      alt: g.media.alt
    })),
    [galleryItems]
  );
  const gridMedia = useMemo(() => {
    if (galleryItems.length === 0) {
      return [null, null, null, null];
    }
    const slots = [null, null, null, null];
    const overflow = [];
    galleryItems.forEach((item) => {
      const order = item.displayOrder;
      if (order >= 1 && order <= 4) {
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
  }, [galleryItems, content]);
  const totalImages = galleryMedia.length;
  const prevMobile = () => setMobileIndex(
    (c) => (c - 1 + Math.max(totalImages, 1)) % Math.max(totalImages, 1)
  );
  const nextMobile = () => setMobileIndex((c) => (c + 1) % Math.max(totalImages, 1));
  const openGalleryAt = (index) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    isBookmarked ? toast("Removed from bookmark") : toast.success("Added to bookmark");
  };
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: /* @__PURE__ */ jsx(MessageCircle, { size: 20 }),
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Facebook",
      icon: /* @__PURE__ */ jsx(Facebook, { size: 20 }),
      color: "bg-[#1877F2]",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "X",
      icon: /* @__PURE__ */ jsx(Twitter, { size: 18 }),
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "LinkedIn",
      icon: /* @__PURE__ */ jsx(Linkedin, { size: 20 }),
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
  ];
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: "initial",
      animate: "animate",
      className: "pt-24 pb-12 bg-gradient-to-b from-background to-muted/20",
      children: [
        /* @__PURE__ */ jsx(
          GalleryModal,
          {
            isOpen: isGalleryOpen,
            onClose: () => setIsGalleryOpen(false),
            hotel: {
              name: content.title,
              location,
              propertyId,
              media: galleryMedia
            },
            initialImageIndex: initialGalleryIndex,
            galleryData
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 md:px-8 lg:px-12", children: [
          /* @__PURE__ */ jsxs(
            motion.nav,
            {
              variants: fadeIn,
              className: "flex items-center gap-2 text-sm text-muted-foreground mb-6",
              children: [
                /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-primary transition-colors", children: "Home" }),
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: restaurantPath,
                    className: "hover:text-primary transition-colors font-medium",
                    children: "Restaurant"
                  }
                ),
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold truncate", children: content.title })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8", children: [
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                variants: staggerContainer,
                className: "space-y-3 w-full text-left",
                children: [
                  /* @__PURE__ */ jsxs(motion.div, { variants: fadeIn, className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", children: [
                      /* @__PURE__ */ jsx(Sparkles, { size: 12, className: "animate-pulse" }),
                      " ",
                      tagline
                    ] }),
                    rating && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm", children: [
                      /* @__PURE__ */ jsx("span", { children: rating }),
                      /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-white" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    motion.h1,
                    {
                      variants: fadeIn,
                      className: "text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-balance leading-tight",
                      children: [
                        content.title.split(" ")[0],
                        " ",
                        /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: content.title.split(" ").slice(1).join(" ") })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxs(
                      motion.div,
                      {
                        variants: fadeIn,
                        className: "flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground",
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 cursor-default", children: [
                            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary" }),
                            /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium", children: [
                              location,
                              city && location !== city ? `, ${city}` : ""
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs(
                            "a",
                            {
                              href: mapsLink,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "text-sm font-bold text-destructive hover:underline flex items-center gap-1",
                              children: [
                                /* @__PURE__ */ jsx(Navigation, { className: "w-4 h-4" }),
                                " View Map"
                              ]
                            }
                          )
                        ]
                      }
                    ),
                    nearbyPlaces.length > 0 && /* @__PURE__ */ jsx(
                      motion.div,
                      {
                        variants: fadeIn,
                        className: "flex flex-wrap items-center gap-4 pt-1",
                        children: nearbyPlaces.map((place, i) => /* @__PURE__ */ jsxs(
                          "div",
                          {
                            className: "flex items-center gap-1.5 text-xs text-muted-foreground/80",
                            children: [
                              /* @__PURE__ */ jsx("div", { className: "w-1 h-1 rounded-full bg-primary/40" }),
                              place.googleMapLink ? /* @__PURE__ */ jsx(
                                "a",
                                {
                                  href: place.googleMapLink,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  className: "hover:text-primary hover:underline transition cursor-pointer",
                                  children: place.nearbyLocationName
                                }
                              ) : /* @__PURE__ */ jsx("span", { children: place.nearbyLocationName })
                            ]
                          },
                          i
                        ))
                      }
                    )
                  ] })
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
                        children: socialPlatforms.map((platform, index) => /* @__PURE__ */ jsxs(
                          motion.a,
                          {
                            href: platform.link,
                            target: "_blank",
                            rel: "noreferrer",
                            initial: { opacity: 0, scale: 0 },
                            animate: { opacity: 1, scale: 1 },
                            transition: { delay: index * 0.04 },
                            whileHover: { scale: 1.2, y: -3 },
                            className: `${platform.color} text-white p-2.5 rounded-full shadow-lg transition-transform flex items-center justify-center`,
                            children: [
                              platform.icon,
                              /* @__PURE__ */ jsx("span", { className: "sr-only", children: platform.name })
                            ]
                          },
                          platform.name
                        ))
                      }
                    ) }),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "outline",
                        className: "rounded-full active:scale-95",
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
                  className: `rounded-full active:scale-95 transition-all ${isBookmarked ? "bg-destructive/10 border-destructive text-destructive" : ""}`,
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
          /* @__PURE__ */ jsxs(motion.div, { variants: fadeIn, children: [
            /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[420px] overflow-hidden rounded-3xl shadow-xl md:hidden", children: [
              galleryMedia.length === 0 ? /* @__PURE__ */ jsx(EmptySlot, { className: "absolute inset-0 rounded-3xl" }) : /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: 40 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -40 },
                  transition: { duration: 0.3 },
                  className: "absolute inset-0 cursor-pointer",
                  onClick: () => openGalleryAt(mobileIndex),
                  onTouchStart: (e) => {
                    touchStart.current = e.touches[0].clientX;
                  },
                  onTouchEnd: (e) => {
                    if (touchStart.current === null) return;
                    const diff = touchStart.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 40)
                      diff > 0 ? nextMobile() : prevMobile();
                    touchStart.current = null;
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      OptimizedImage,
                      {
                        src: galleryMedia[mobileIndex]?.url,
                        className: "absolute inset-0 w-full h-full object-cover object-center"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" })
                  ]
                },
                mobileIndex
              ) }),
              galleryMedia.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: prevMobile,
                    className: "absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md",
                    children: /* @__PURE__ */ jsx(ChevronRight, { className: "rotate-180 w-4 h-4 text-zinc-800" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: nextMobile,
                    className: "absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md",
                    children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-zinc-800" })
                  }
                )
              ] }),
              galleryMedia.length > 0 && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 right-4 z-20 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full", children: [
                mobileIndex + 1,
                " / ",
                galleryMedia.length
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-4 gap-3 h-[440px] rounded-3xl overflow-hidden shadow-xl", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `md:col-span-2 relative group overflow-hidden rounded-2xl ${gridMedia[0] ? "cursor-pointer" : "cursor-default"}`,
                  onClick: () => {
                    if (!gridMedia[0]) return;
                    const idx = galleryMedia.findIndex(
                      (m) => m.url === gridMedia[0].url
                    );
                    openGalleryAt(idx >= 0 ? idx : 0);
                  },
                  children: gridMedia[0] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" }),
                    /* @__PURE__ */ jsx(
                      OptimizedImage,
                      {
                        src: gridMedia[0].url,
                        alt: gridMedia[0].alt || content.title,
                        className: "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      }
                    )
                  ] }) : /* @__PURE__ */ jsx(EmptySlot, {})
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "md:col-span-1 flex flex-col gap-3", children: [1, 2].map((idx) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: `relative group overflow-hidden rounded-2xl flex-1 ${gridMedia[idx] ? "cursor-pointer" : "cursor-default"}`,
                  onClick: () => {
                    if (!gridMedia[idx]) return;
                    const gi = galleryMedia.findIndex(
                      (m) => m.url === gridMedia[idx].url
                    );
                    openGalleryAt(gi >= 0 ? gi : 0);
                  },
                  children: gridMedia[idx] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" }),
                    /* @__PURE__ */ jsx(
                      OptimizedImage,
                      {
                        src: gridMedia[idx].url,
                        alt: gridMedia[idx].alt || "",
                        className: "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      }
                    )
                  ] }) : /* @__PURE__ */ jsx(EmptySlot, {})
                },
                idx
              )) }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `md:col-span-1 relative group overflow-hidden rounded-2xl ${gridMedia[3] ? "cursor-pointer" : "cursor-default"}`,
                  onClick: () => {
                    if (!gridMedia[3]) return;
                    const gi = galleryMedia.findIndex(
                      (m) => m.url === gridMedia[3].url
                    );
                    openGalleryAt(gi >= 0 ? gi : 0);
                  },
                  children: [
                    gridMedia[3] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" }),
                      /* @__PURE__ */ jsx(
                        OptimizedImage,
                        {
                          src: gridMedia[3].url,
                          alt: gridMedia[3].alt || "",
                          className: "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        }
                      )
                    ] }) : /* @__PURE__ */ jsx(EmptySlot, {}),
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          setIsGalleryOpen(true);
                        },
                        className: "pointer-events-auto bg-white/85 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-black text-[11px] font-black shadow-lg transition-all group-hover:scale-110 hover:bg-white",
                        children: [
                          /* @__PURE__ */ jsx(Image, { className: "w-4 h-4 text-primary" }),
                          /* @__PURE__ */ jsx("span", { children: totalImages > 4 ? `+${totalImages - 4} MORE` : "VIEW GALLERY" })
                        ]
                      }
                    ) })
                  ]
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
function CategoryMenu({
  menu,
  themeColor,
  propertyId,
  verticalId,
  // ← NEW: pass currentCategory.id from parent
  showOrderButton = false
}) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    time: "19:00",
    totalGuest: "2"
  });
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        const res = await getAllMenuThumbnails(propertyId);
        const data = res?.data || [];
        const active = Array.isArray(data) ? data.filter((t) => t.active === true) : [];
        setThumbnails(active);
      } catch {
      }
    })();
  }, [propertyId]);
  const getThumbsForTab = (tabIndex) => {
    const section = menu[tabIndex];
    if (!section || !verticalId) return [];
    const sectionTypeId = section.itemTypeId ?? section.items?.[0]?.typeId ?? null;
    const itemCount = section.items?.length || 0;
    const thumbsNeeded = Math.ceil(itemCount / 3);
    const verticalThumbs = thumbnails.filter(
      (t) => Number(t.verticalCardResponseDTO?.id) === Number(verticalId)
    );
    if (!verticalThumbs.length) return [];
    const typeMatched = sectionTypeId !== null ? verticalThumbs.filter((t) => Number(t.itemTypeId) === Number(sectionTypeId)) : [];
    const pool = typeMatched.length > 0 ? typeMatched : verticalThumbs;
    const result = [];
    for (let i = 0; i < thumbsNeeded; i++) {
      result.push(pool[i % pool.length]);
    }
    return result;
  };
  const handleTabClick = (idx) => {
    setActiveTab(idx);
    scrollToTab(idx);
  };
  const handleNext = () => {
    if (activeTab < menu.length - 1) {
      setActiveTab((p) => p + 1);
      scrollToTab(activeTab + 1);
    }
  };
  const handlePrev = () => {
    if (activeTab > 0) {
      setActiveTab((p) => p - 1);
      scrollToTab(activeTab - 1);
    }
  };
  const scrollToTab = (index) => {
    const container = scrollContainerRef.current;
    if (container) {
      const tab = container.children[index];
      if (tab) {
        container.scrollTo({
          left: tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2,
          behavior: "smooth"
        });
      }
    }
  };
  const handleOrderClick = (item) => {
    setSelectedItem(item);
    setShowOrderModal(true);
  };
  const handleReserveClick = () => {
    setSelectedItem({
      name: "Table Reservation",
      category: menu[activeTab]?.category
    });
    setShowOrderModal(true);
  };
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentCategory = menu[activeTab]?.category || "General";
      const itemType = selectedItem?.name || "Table Reservation";
      const payload = {
        guestName: formData.name.trim(),
        contactNumber: formData.phone.trim(),
        date: formData.date,
        time: formData.time,
        totalGuest: Number(formData.totalGuest),
        propertyId,
        description: `Category: ${currentCategory} | Request: ${itemType}`
      };
      await createJoiningUs(payload);
      toast.success("Request sent successfully!");
      setShowOrderModal(false);
      setFormData({
        name: "",
        phone: "",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        time: "19:00",
        totalGuest: "2"
      });
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const displayThumbs = getThumbsForTab(activeTab);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "menu",
      className: "py-16 bg-white dark:bg-[#050505] transition-colors duration-500",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 max-w-[1200px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between mb-10 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-primary/10 rounded-full", children: /* @__PURE__ */ jsx(Utensils, { className: "w-5 h-5 text-primary" }) }),
              /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-serif dark:text-white", children: [
                "The ",
                /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: "Selection" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-row-reverse items-center gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handlePrev,
                    disabled: activeTab === 0,
                    className: "p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all",
                    children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 dark:text-white" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400", children: [
                  activeTab + 1,
                  " / ",
                  menu.length
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleNext,
                    disabled: activeTab === menu.length - 1,
                    className: "p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all",
                    children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 dark:text-white" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleReserveClick,
                  className: "hidden md:flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none",
                  children: [
                    /* @__PURE__ */ jsx(CalendarCheck, { size: 14 }),
                    " Reserve Now"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: scrollContainerRef,
              className: "flex gap-4 overflow-x-auto no-scrollbar pb-8 snap-x",
              children: menu.map((section, idx) => /* @__PURE__ */ jsx(
                motion.button,
                {
                  onClick: () => handleTabClick(idx),
                  className: `relative flex-shrink-0 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all snap-center
                ${activeTab === idx ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-primary/50"}`,
                  children: section.category
                },
                idx
              ))
            }
          ),
          /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: 10 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -10 },
              className: "grid lg:grid-cols-12 gap-8 items-start",
              children: [
                displayThumbs.length > 0 && /* @__PURE__ */ jsx("div", { className: "lg:col-span-5 hidden lg:block", children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: displayThumbs.map((thumb, i) => {
                  const url = thumb.media?.url;
                  const vid = thumb.media?.type === "VIDEO";
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-white/5 bg-black",
                      children: [
                        vid ? /* @__PURE__ */ jsx(
                          "video",
                          {
                            src: url,
                            className: "w-full h-full object-contain",
                            autoPlay: true,
                            loop: true,
                            muted: true,
                            playsInline: true
                          }
                        ) : /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: url,
                            alt: thumb.tag,
                            className: "w-full h-full object-contain"
                          }
                        ),
                        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" }),
                        /* @__PURE__ */ jsxs("div", { className: "absolute bottom-6 left-6 text-white", children: [
                          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1", children: thumb.tag || "Featured" }),
                          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-serif uppercase tracking-tight", children: menu[activeTab]?.category })
                        ] })
                      ]
                    },
                    i
                  );
                }) }) }),
                /* @__PURE__ */ jsx("div", { className: displayThumbs.length > 0 ? "lg:col-span-7 space-y-2" : "lg:col-span-12 space-y-2", children: menu[activeTab].items.map((item, i) => /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: i * 0.05 },
                    className: "group flex items-start gap-5 p-4 rounded-2xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800", children: item.image ? /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: item.image,
                          className: "w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500",
                          alt: item.name
                        }
                      ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center text-zinc-300", children: /* @__PURE__ */ jsx(Utensils, { size: 20 }) }) }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 border-b border-zinc-100 dark:border-white/5 pb-4 group-last:border-none", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                            /* @__PURE__ */ jsx("h4", { className: "text-base font-extrabold tracking-tight text-zinc-900 dark:text-white", children: item.name }),
                            item.foodType === "VEG" && /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 border border-green-600 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-green-600 block" }) }),
                            item.foodType === "NON_VEG" && /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 border border-red-600 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-600 block" }) }),
                            item.isSpicy && /* @__PURE__ */ jsx(Flame, { size: 14, className: "text-red-500 fill-red-500" }),
                            item.signatureItem && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-amber-500 uppercase tracking-wider", children: "★ Signature" })
                          ] }),
                          showOrderButton && /* @__PURE__ */ jsxs(
                            "button",
                            {
                              onClick: () => handleOrderClick(item),
                              className: "flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shrink-0",
                              children: [
                                /* @__PURE__ */ jsx(ShoppingBag, { size: 12 }),
                                " Order"
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2", children: item.description }),
                        item.price && /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-primary mt-1", children: item.price })
                      ] })
                    ]
                  },
                  item.id ?? i
                )) })
              ]
            },
            activeTab
          ) })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: showOrderModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 },
            className: "bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative border border-zinc-100 dark:border-white/5",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-2 bg-primary/10 rounded-lg text-primary", children: selectedItem?.name?.includes("Table") ? /* @__PURE__ */ jsx(CalendarCheck, { size: 18 }) : /* @__PURE__ */ jsx(ShoppingBag, { size: 18 }) }),
                  /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl dark:text-white", children: selectedItem?.name?.includes("Table") ? "Reservation" : `Order: ${selectedItem?.name}` })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowOrderModal(false),
                    className: "p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400",
                    children: /* @__PURE__ */ jsx(X, { size: 20 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Full Name" }),
                    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          value: formData.name,
                          onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                          placeholder: "Your Name",
                          className: "pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Phone Number" }),
                    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsx(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          value: formData.phone,
                          onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
                          placeholder: "+91",
                          className: "pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Date" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "date",
                        value: formData.date,
                        onChange: (e) => setFormData({ ...formData, date: e.target.value }),
                        className: "h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Arrival Time" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "time",
                        value: formData.time,
                        onChange: (e) => setFormData({ ...formData, time: e.target.value }),
                        className: "h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 col-span-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-black tracking-widest text-primary", children: "Total Guests" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        type: "number",
                        min: "1",
                        value: formData.totalGuest,
                        onChange: (e) => setFormData({ ...formData, totalGuest: e.target.value }),
                        className: "h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "p-3 bg-primary/5 rounded-xl border border-primary/10", children: /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-zinc-500 italic leading-relaxed", children: [
                  "Requesting ",
                  /* @__PURE__ */ jsx("b", { children: selectedItem?.name }),
                  " for",
                  " ",
                  /* @__PURE__ */ jsxs("b", { children: [
                    formData.totalGuest,
                    " guests"
                  ] }),
                  " at ",
                  /* @__PURE__ */ jsx("b", { children: formData.time }),
                  "."
                ] }) }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    disabled: isSubmitting || !formData.name || !formData.phone || !formData.date || !formData.time,
                    onClick: handleFinalSubmit,
                    className: "w-full h-11 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20",
                    children: isSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 18 }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      "Confirm Reservation ",
                      /* @__PURE__ */ jsx(Send, { size: 14, className: "ml-2" })
                    ] })
                  }
                )
              ] })
            ]
          }
        ) }) }),
        /* @__PURE__ */ jsx("style", { jsx: true, children: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` })
      ]
    }
  );
}
const resturant_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "/" },
  { type: "link", label: "MENU", href: "#menu" },
  { type: "link", label: "CONTACT", href: "#contact" }
];
const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, "-");
const CARD_BG_COLORS = [
  { bgColor: "bg-orange-50", hoverBg: "hover:bg-orange-100" },
  { bgColor: "bg-blue-50", hoverBg: "hover:bg-blue-100" },
  { bgColor: "bg-red-50", hoverBg: "hover:bg-red-100" },
  { bgColor: "bg-emerald-50", hoverBg: "hover:bg-emerald-100" }
];
function buildMenuFromApi(allItems, currentVerticalId) {
  if (!allItems?.length || !currentVerticalId) return [];
  const matched = allItems.filter(
    (item) => item.verticalCardResponseDTO?.id === currentVerticalId || item.verticalCardId === currentVerticalId
  );
  if (!matched.length) return [];
  const groups = {};
  matched.forEach((item) => {
    const typeName = item.type?.typeName || "Other";
    const typeId = item.type?.id ?? null;
    if (!groups[typeName]) {
      groups[typeName] = { typeId, items: [] };
    }
    groups[typeName].items.push({
      id: item.id,
      name: item.itemName || "",
      description: item.description || "",
      price: item.price ? `₹${item.price}` : "",
      image: item.image?.url || item.media?.url || "",
      isSpicy: item.foodType === "NON_VEG",
      foodType: item.foodType,
      likeCount: item.likeCount || 0,
      typeId: item.type?.id ?? null,
      typeName: item.type?.typeName || "",
      propertyId: item.propertyId,
      status: item.status
    });
  });
  return Object.entries(groups).map(([typeName, group]) => ({
    category: typeName,
    itemTypeId: group.typeId,
    categoryImage: group.items[0]?.image || "",
    items: group.items
  }));
}
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}
function resolveCardStyle(exp, index, isDark) {
  if (isDark) {
    return {
      style: {},
      className: `bg-zinc-800/80 hover:bg-zinc-700/90`
    };
  }
  if (exp.isHexColor && exp.lightBgColor) {
    return {
      style: { backgroundColor: exp.lightBgColor },
      className: ""
    };
  }
  const fallback = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
  return {
    style: {},
    className: `${exp.bgColor || fallback.bgColor} ${exp.hoverBg || fallback.hoverBg}`
  };
}
function OtherVerticalsSection({
  experiences,
  propertyId,
  citySlug,
  propertyName
}) {
  const navigate = useNavigate();
  const isDark = useIsDark();
  const propertySlug = createHotelSlug(propertyName || "restaurant", propertyId);
  if (!experiences || experiences.length === 0) return null;
  return /* @__PURE__ */ jsx("section", { className: "py-10 lg:py-20 bg-white dark:bg-[#080808]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20", children: [
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        className: "mb-12",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary animate-pulse" }),
            /* @__PURE__ */ jsx("span", { className: "text-primary text-[11px] font-bold uppercase tracking-[0.4em]", children: "Explore More" })
          ] }),
          /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-5xl font-serif text-zinc-900 dark:text-white tracking-tight", children: [
            "Other ",
            /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: "Verticals" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-4 lg:gap-8", children: experiences.map((exp, index) => {
      const { style, className } = resolveCardStyle(exp, index, isDark);
      return /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { delay: index * 0.1 },
          onClick: () => navigate(`/${citySlug}/${propertySlug}/${exp.slug}`),
          style,
          className: `
                  group cursor-pointer relative flex transition-all duration-500 hover:shadow-2xl
                  ${className}
                  w-full p-4 rounded-2xl flex-row items-center border border-zinc-100 dark:border-white/10 shadow-sm
                  lg:flex-col lg:items-center lg:text-center lg:p-10 lg:rounded-[2.5rem] lg:w-[calc(25%-1.5rem)] lg:min-h-[420px] lg:hover:border-primary/20
                `,
          children: [
            /* @__PURE__ */ jsx("div", { className: "shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-zinc-600 shadow-lg z-20 transition-transform duration-500 group-hover:scale-110 w-14 h-14 lg:w-28 lg:h-28 lg:mb-8", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: exp.image,
                alt: exp.title,
                className: "w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col grow px-4 lg:px-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg lg:text-3xl font-serif text-zinc-950 dark:text-zinc-100 group-hover:text-primary transition-colors tracking-tight", children: exp.title }),
              /* @__PURE__ */ jsx("p", { className: "hidden lg:block text-zinc-700 dark:text-zinc-400 text-sm leading-relaxed mt-4 mb-6 line-clamp-4 font-light", children: exp.description }),
              /* @__PURE__ */ jsx("div", { className: "lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-primary", children: /* @__PURE__ */ jsx(ChevronRight, { size: 20 }) }),
              /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex mt-auto items-center justify-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500", children: /* @__PURE__ */ jsx(ChevronRight, { size: 24 }) }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors", children: "Explore Vertical" }),
                exp.ctaButtonText && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      navigate(exp.link || "#");
                    },
                    className: "px-3 py-2 text-[10px] font-light uppercase tracking-wider bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-all",
                    children: exp.ctaButtonText
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "hidden lg:block absolute bottom-8 right-10 text-7xl font-black text-zinc-900/[0.03] dark:text-white/[0.04] italic select-none", children: [
              "0",
              index + 1
            ] })
          ]
        },
        exp.id
      );
    }) })
  ] }) });
}
function ResturantCategoryPageTemplate() {
  const {
    propertyId: paramPropertyId,
    propertySlug: routePropertySlug,
    categoryType,
    citySlug: paramCitySlug
  } = useParams();
  const slugTail = routePropertySlug?.split("-").pop() || "";
  const propertyId = Number(paramPropertyId || slugTail) || null;
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [otherVerticals, setOtherVerticals] = useState([]);
  const [apiMenuItems, setApiMenuItems] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [citySlug, setCitySlug] = useState(paramCitySlug || "hotel");
  const propertySlug = createHotelSlug(
    propertyData?.propertyName || propertyData?.name || "restaurant",
    propertyId
  );
  const normalizedSlug = categoryType?.toLowerCase().trim();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryType]);
  useEffect(() => {
    if (!propertyId) return;
    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const propertyRes = await GetAllPropertyDetails();
        const rawData = propertyRes?.data || propertyRes;
        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
          (item) => {
            const parent = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];
            return listings.length === 0 ? [{ parent, listing: null }] : listings.map((l) => ({ parent, listing: l }));
          }
        );
        const matchedProperty = flattened.find(
          (m) => Number(m.parent.id) === Number(propertyId)
        );
        if (matchedProperty) {
          const { parent, listing } = matchedProperty;
          const combinedProperty = {
            ...parent,
            ...listing,
            id: parent.id,
            propertyId: parent.id,
            name: listing?.propertyName?.trim() || parent.propertyName,
            description: listing?.mainHeading || "",
            location: listing?.fullAddress || parent.address,
            city: listing?.city || parent.locationName,
            media: listing?.media?.length > 0 ? listing.media : parent.media || []
          };
          setPropertyData(combinedProperty);
          setCitySlug(
            createCitySlug(
              combinedProperty.city || combinedProperty.locationName || combinedProperty.propertyName
            )
          );
        }
        const cardsRes = await getAllVerticalCards();
        const cards = cardsRes?.data || cardsRes || [];
        const filtered = cards.filter(
          (c) => String(c.propertyId) === String(propertyId) && c.isActive
        ).sort((a, b) => a.displayOrder - b.displayOrder);
        const mapped = filtered.map((card, index) => {
          const slug = generateSlug(card.verticalName);
          const fallback = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
          return {
            slug,
            id: card.id,
            title: card.verticalName || card.itemName,
            description: card.description || "",
            image: card.media?.url || "",
            link: card.link || "",
            ctaButtonText: card.showOrderButton ? card.extraText || "" : null,
            // Keep hex for light mode usage
            lightBgColor: card.cardBackgroundColor || null,
            bgColor: fallback.bgColor,
            hoverBg: fallback.hoverBg,
            isHexColor: !!card.cardBackgroundColor,
            heroImage: card.media?.url || "",
            themeColor: card.cardBackgroundColor || null
          };
        });
        const matched = mapped.find((m) => m.slug === normalizedSlug);
        if (!matched) {
          setNotFound(true);
        } else {
          setCurrentCategory(matched);
          setOtherVerticals(mapped.filter((m) => m.slug !== normalizedSlug));
        }
        const menuRes = await getMenuItems();
        const allItems = menuRes?.data || menuRes || [];
        const propItems = allItems.filter(
          (i) => String(i.propertyId) === String(propertyId) && i.status !== false
        );
        setApiMenuItems(propItems);
        if (matched) {
          const galleryRes = await searchGallery({
            propertyId,
            verticalId: matched.id
          });
          const rawGallery = galleryRes?.data?.content || galleryRes?.data || galleryRes || [];
          const normalizedGallery = (Array.isArray(rawGallery) ? rawGallery : []).filter((g) => g.isActive && g.media?.url).map((g) => ({
            id: g.id,
            media: {
              mediaId: g.media.mediaId,
              url: g.media.url,
              type: g.media.type ?? "IMAGE",
              fileName: g.media.fileName ?? "",
              alt: g.media.alt ?? ""
            },
            isActive: g.isActive,
            categoryName: g.categoryName ?? null,
            displayOrder: g.displayOrder ?? 999
          }));
          setGalleryData(normalizedGallery);
        }
      } catch (err) {
        console.error("[CategoryPage] Error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId, normalizedSlug]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white dark:bg-[#080808] flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" }) });
  }
  if (notFound || !currentCategory) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsx(Navbar, { navItems: resturant_NAV_ITEMS, logo: siteContent.brand.logo_restaurant }),
      /* @__PURE__ */ jsxs("div", { className: "py-40 text-center container mx-auto px-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-5xl font-serif mb-6 dark:text-white", children: "Category Not Found" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8 text-lg", children: "The culinary vertical you are looking for is currently unavailable." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate(`/${citySlug}/${propertySlug}`),
            className: "px-8 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg",
            children: "Return to Restaurant"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Footer, {})
    ] });
  }
  const resolvedMenu = buildMenuFromApi(apiMenuItems, currentCategory.id);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500", children: [
    /* @__PURE__ */ jsx(
      Navbar,
      {
        navItems: resturant_NAV_ITEMS,
        logo: siteContent.brand.logo_restaurant
      }
    ),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx(
        CategoryHero,
        {
          content: currentCategory,
          propertyId,
          galleryData,
          propertyData
        }
      ),
      /* @__PURE__ */ jsx("div", { id: "menu", children: resolvedMenu.length > 0 ? /* @__PURE__ */ jsx(
        CategoryMenu,
        {
          menu: resolvedMenu,
          themeColor: currentCategory.themeColor,
          propertyId,
          verticalId: currentCategory.id
        }
      ) : /* @__PURE__ */ jsx("div", { className: "py-20 text-center text-muted-foreground", children: "Menu coming soon for this vertical." }) }),
      /* @__PURE__ */ jsx("div", { id: "categories", children: /* @__PURE__ */ jsx(
        OtherVerticalsSection,
        {
          experiences: otherVerticals,
          propertyId,
          citySlug,
          propertyName: propertyData?.propertyName || propertyData?.name
        }
      ) }),
      /* @__PURE__ */ jsx("div", { id: "events", children: /* @__PURE__ */ jsx(ResturantpageEvents, { propertyId }) }),
      /* @__PURE__ */ jsx("div", { id: "testimonials", children: /* @__PURE__ */ jsx(AutoTestimonials, { propertyId }) }),
      /* @__PURE__ */ jsx("div", { id: "ReservationForm", children: /* @__PURE__ */ jsx(ReservationForm, { propertyId }) })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "contact", children: /* @__PURE__ */ jsx(Footer, {}) })
  ] });
}
export {
  ResturantCategoryPageTemplate as default
};
