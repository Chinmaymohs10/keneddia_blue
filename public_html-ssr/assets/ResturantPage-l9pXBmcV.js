import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useMemo, useState, useRef, useEffect } from "react";
import { B as Button, O as OptimizedImage, c as createCitySlug, a as createHotelSlug, V as getAllVerticalSectionsHeader, W as getAllVerticalCards, X as getAllRestaurantAbout, Y as getRestaurantImageSocialByProperty, Z as getRestaurantConnectByProperty, g as getDailyOffers, b as OfferVideo, _ as getAllBuffetSectionHeaders, $ as getAllBuffetItems, a0 as getAllOfferHeaders, a1 as getMenuHeaders, a2 as getChefRemarks, a3 as getMenuItems, I as Input, a4 as createJoiningUs, a5 as addItemLike, a6 as getActiveVisualGalleriesHeader, a7 as getAllGalleries, N as Navbar, w as siteContent, F as Footer, G as GetAllPropertyDetails, L as getGalleryByPropertyId } from "../entry-server.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Loader2, ChevronRight, Star, MapPin, Navigation, Share2, Heart, ChevronLeft, Image, MessageCircle, Facebook, Twitter, Linkedin, Sparkles, Beer, Quote, Clock, Phone, Contact2, X, Instagram, Link as Link$1, MessageSquare, Tag, ExternalLink, ChefHat, ImageOff, Camera, Maximize2 } from "lucide-react";
import { G as GalleryModal } from "./GalleryModal-DTwSFNib.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation as Navigation$1, Autoplay } from "swiper/modules";
import { R as ResturantpageEvents, A as AutoTestimonials, a as ReservationForm } from "./ResturantpageEvents-DDzM4gBC.js";
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
const FALLBACK_RESTAURANT = {
  id: 1,
  propertyId: 1,
  name: "Kennedia Blu Restaurant Ghaziabad",
  location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
  city: "Ghaziabad",
  type: "FINE DINING",
  tagline: "Experience elegance, taste, and unforgettable dining.",
  rating: null,
  price: "₹₹₹",
  media: [
    {
      url: "",
      type: "IMAGE",
      alt: "Kennedia Blu Restaurant",
      mediaId: null,
      fileName: null,
      width: null,
      height: null
    }
  ],
  coordinates: null,
  image: { src: "", alt: "Kennedia Blu Restaurant Ghaziabad" },
  nearbyPlaces: [{ nearbyLocationName: "300 meters from T&T Fragrance" }]
};
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };
const EmptySlot = ({ className = "" }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: `w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`,
    children: /* @__PURE__ */ jsx(Image, { className: "w-8 h-8 text-gray-300" })
  }
);
function ResturantBanner({
  propertyData,
  galleryData,
  loading
}) {
  const restaurant = useMemo(() => {
    if (!propertyData) return FALLBACK_RESTAURANT;
    return {
      id: propertyData.id ?? propertyData.propertyId ?? FALLBACK_RESTAURANT.id,
      propertyId: propertyData.propertyId ?? propertyData.id ?? FALLBACK_RESTAURANT.propertyId,
      name: propertyData.propertyName ?? propertyData.name ?? FALLBACK_RESTAURANT.name,
      location: propertyData.fullAddress ?? propertyData.address ?? propertyData.location ?? FALLBACK_RESTAURANT.location,
      city: propertyData.city ?? propertyData.locationName ?? FALLBACK_RESTAURANT.city,
      type: propertyData.propertyType ?? propertyData.propertyTypes?.[0] ?? FALLBACK_RESTAURANT.type,
      tagline: propertyData.tagline ?? propertyData.subTitle ?? FALLBACK_RESTAURANT.tagline,
      rating: propertyData.rating ?? FALLBACK_RESTAURANT.rating,
      price: propertyData.price ?? FALLBACK_RESTAURANT.price,
      media: propertyData.media ?? FALLBACK_RESTAURANT.media,
      coordinates: propertyData.coordinates ?? (propertyData.latitude && propertyData.longitude ? { lat: propertyData.latitude, lng: propertyData.longitude } : FALLBACK_RESTAURANT.coordinates),
      image: {
        src: propertyData.media?.[0]?.url ?? "",
        alt: propertyData.propertyName ?? FALLBACK_RESTAURANT.name
      },
      nearbyPlaces: propertyData.nearbyLocations?.length > 0 ? propertyData.nearbyLocations.map((n) => ({
        nearbyLocationName: n.nearbyLocationName,
        googleMapLink: n.googleMapLink
      })) : FALLBACK_RESTAURANT.nearbyPlaces?.map((name) => ({
        nearbyLocationName: name
      }))
    };
  }, [propertyData]);
  const galleryItems = useMemo(() => {
    return (galleryData || []).filter(
      (g) => g.isActive && g.media?.url && g.categoryName?.toLowerCase() !== "3d"
    ).sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [galleryData]);
  const galleryMedia = useMemo(
    () => galleryItems.map((g) => g.media),
    [galleryItems]
  );
  const gridMedia = useMemo(() => {
    const slots = [null, null, null, null];
    const overflow = [];
    galleryItems.forEach((item) => {
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
  }, [galleryItems]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareReactions, setShowShareReactions] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileTouchStart = useRef(null);
  const mobilePrev = () => setMobileIndex((c) => (c - 1 + galleryMedia.length) % galleryMedia.length);
  const mobileNext = () => setMobileIndex((c) => (c + 1) % galleryMedia.length);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  useEffect(() => {
    const bookmarks = JSON.parse(
      localStorage.getItem("bookmarkedRestaurants") || "[]"
    );
    if (bookmarks.includes(restaurant.propertyId)) {
      setIsBookmarked(true);
    }
  }, [restaurant.propertyId]);
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
      name: "X (Twitter)",
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
  const handleBookmark = () => {
    const bookmarks = JSON.parse(
      localStorage.getItem("bookmarkedRestaurants") || "[]"
    );
    if (bookmarks.includes(restaurant.propertyId)) {
      const updated = bookmarks.filter((id) => id !== restaurant.propertyId);
      localStorage.setItem("bookmarkedRestaurants", JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      bookmarks.push(restaurant.propertyId);
      localStorage.setItem("bookmarkedRestaurants", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };
  const openGalleryAt = (index) => {
    setInitialGalleryIndex(index);
    setIsGalleryOpen(true);
  };
  const mapsLink = restaurant.coordinates ? `https://www.google.com/maps?q=${restaurant.coordinates.lat},${restaurant.coordinates.lng}` : "https://google.com/maps/place/kennedia+blu+restaurant+ghaziabad/data=!4m2!3m1!1s0x390cf1005bab4c6f:0xb455a48e012d76e7?sa=X&ved=1t:242&ictx=111";
  if (loading)
    return /* @__PURE__ */ jsx("div", { className: "min-h-[60vh] flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin w-10 h-10 text-primary" }) });
  if (!restaurant) return null;
  const totalImages = galleryMedia.length;
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
              name: restaurant.name,
              location: restaurant.location,
              propertyId: restaurant.propertyId,
              media: galleryMedia
            },
            initialImageIndex: initialGalleryIndex,
            galleryData: galleryItems
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
                /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold truncate", children: restaurant.name })
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
                    /* @__PURE__ */ jsx("span", { className: "inline-flex bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", children: restaurant.tagline }),
                    restaurant.rating && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm", children: [
                      /* @__PURE__ */ jsx("span", { children: restaurant.rating }),
                      /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 fill-white" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    motion.h1,
                    {
                      variants: fadeIn,
                      className: "text-4xl md:text-5xl font-serif font-bold tracking-tight",
                      children: restaurant.name
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
                              restaurant.location,
                              restaurant.city && restaurant.location !== restaurant.city ? `, ${restaurant.city}` : ""
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
                    restaurant.nearbyPlaces && restaurant.nearbyPlaces.length > 0 && /* @__PURE__ */ jsx(
                      motion.div,
                      {
                        variants: fadeIn,
                        className: "flex flex-wrap items-center gap-4 pt-1",
                        children: restaurant.nearbyPlaces.map((place, i) => /* @__PURE__ */ jsxs(
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
                    isBookmarked ? "Bookmarked" : "Save"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(motion.div, { variants: fadeIn, children: [
            /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[420px] overflow-hidden bg-black md:hidden", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 left-0 whitespace-nowrap text-[8rem] font-black text-white/[0.03] select-none z-0 pointer-events-none italic", children: "GALLERY" }),
              galleryMedia.length === 0 ? /* @__PURE__ */ jsx(EmptySlot, { className: "absolute inset-0" }) : /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 1.5 },
                  className: "absolute inset-0 cursor-pointer",
                  onClick: () => openGalleryAt(mobileIndex),
                  onTouchStart: (e) => {
                    mobileTouchStart.current = e.touches[0].clientX;
                  },
                  onTouchEnd: (e) => {
                    if (mobileTouchStart.current === null) return;
                    const diff = mobileTouchStart.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 40)
                      diff > 0 ? mobileNext() : mobilePrev();
                    mobileTouchStart.current = null;
                  },
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" }),
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: galleryMedia[mobileIndex]?.url || "",
                        alt: "",
                        className: "absolute inset-0 w-full h-full object-cover object-center scale-110"
                      }
                    )
                  ]
                },
                mobileIndex
              ) }),
              galleryMedia.length > 0 && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-8 right-5 z-30 flex items-center gap-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-white text-4xl font-serif italic tracking-tighter", children: [
                      "0",
                      mobileIndex + 1
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "text-white/20 text-lg font-serif", children: [
                      "/",
                      String(galleryMedia.length).padStart(2, "0")
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "w-24 h-[2px] bg-white/10 relative mt-1.5 overflow-hidden", children: /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "absolute h-full bg-primary top-0 left-0",
                      animate: {
                        width: `${(mobileIndex + 1) / galleryMedia.length * 100}%`
                      },
                      transition: { duration: 0.5 }
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: mobilePrev,
                      className: "p-3 border border-white/10 text-white hover:bg-white hover:text-black transition-all group active:scale-95",
                      children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 group-hover:-translate-x-1 transition-transform" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: mobileNext,
                      className: "p-3 bg-white text-black hover:bg-primary hover:text-white transition-all group active:scale-95",
                      children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-4 gap-3 h-[440px] rounded-3xl overflow-hidden shadow-xl", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `md:col-span-2 relative group overflow-hidden rounded-2xl ${gridMedia[0] ? "cursor-pointer" : "cursor-default"}`,
                  onClick: () => gridMedia[0] && openGalleryAt(galleryMedia.indexOf(gridMedia[0])),
                  children: gridMedia[0] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" }),
                    /* @__PURE__ */ jsx(
                      OptimizedImage,
                      {
                        src: gridMedia[0].url,
                        alt: gridMedia[0].alt ?? restaurant.name,
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
                  onClick: () => gridMedia[idx] && openGalleryAt(galleryMedia.indexOf(gridMedia[idx])),
                  children: gridMedia[idx] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" }),
                    /* @__PURE__ */ jsx(
                      OptimizedImage,
                      {
                        src: gridMedia[idx].url,
                        alt: "",
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
                  onClick: () => gridMedia[3] && openGalleryAt(galleryMedia.indexOf(gridMedia[3])),
                  children: [
                    gridMedia[3] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" }),
                      /* @__PURE__ */ jsx(
                        OptimizedImage,
                        {
                          src: gridMedia[3].url,
                          alt: "",
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
                        className: "pointer-events-auto bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-black text-[11px] font-black shadow-lg transition-all group-hover:scale-110 hover:bg-white",
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
const STATIC_EXPERIENCES = [
  {
    id: "italian",
    title: "Italian",
    description: "Authentic Mediterranean soul in a sophisticated setting. Experience the rich heritage of Tuscany through our hand-picked ingredients.",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    link: "/restaurant/italian",
    bgColor: "bg-orange-50",
    hoverBg: "hover:bg-orange-50"
  },
  {
    id: "luxury-lounge",
    title: "Luxury Lounge",
    description: "Premium comfort tailored for memorable family gatherings. A refined space where elegance meets contemporary dining.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800",
    link: "/restaurant/luxury-lounge",
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-50"
  },
  {
    id: "spicy-darbar",
    title: "Spicy Darbar",
    description: "Bold, traditional Indian flavors with a fiery spirit. Royal curries and tandoori masterpieces prepared with authentic spices.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/restaurant/spicy-darbar",
    bgColor: "bg-red-50",
    hoverBg: "hover:bg-red-50"
  },
  {
    id: "takeaway",
    title: "Takeaway Treats",
    description: "Gourmet quality on the go for your convenience. Perfectly packaged meals that bring the restaurant experience to your home.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/restaurant/takeaway",
    bgColor: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-50"
  }
];
const CARD_BG_COLORS = [
  {
    bgColor: "bg-orange-50",
    hoverBg: "hover:bg-orange-100"
  },
  {
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-100"
  },
  {
    bgColor: "bg-red-50",
    hoverBg: "hover:bg-red-100"
  },
  {
    bgColor: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-100"
  }
];
const STATIC_HEADER = {
  badgeLabel: "Verticals",
  headlineLine1: "One Location.",
  headlineLine2: "Diverse Verticals.",
  description: "Discover a curated collection of culinary spaces designed for every mood and occasion. From intimate fine dining to casual gourmet treats.",
  policyType: "Dining Policy",
  policyName: "BYOB Support",
  policyDescription: "Bring your favorite spirits; we provide the perfect ambiance and premium glassware.",
  policyMedia: {
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&h=200&auto=format&fit=crop"
  }
};
function ResturantSubCategories({ propertyId, propertyData }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [header, setHeader] = useState(null);
  const [experiences, setExperiences] = useState(null);
  const [experiencesFetched, setExperiencesFetched] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, "-");
  const moveTL_BR = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 0.04, 0.04, 0]
  );
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headerRes = await getAllVerticalSectionsHeader();
        const headers = headerRes?.data || headerRes || [];
        const matchedHeader = headers.find(
          (h) => h.propertyId === propertyId && h.isActive
        );
        if (matchedHeader) setHeader(matchedHeader);
      } catch (err) {
        console.error("Failed to fetch vertical section header:", err);
      }
      try {
        const cardsRes = await getAllVerticalCards();
        const cards = cardsRes?.data || cardsRes || [];
        const filtered = cards.filter((c) => c.propertyId === propertyId && c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
        if (filtered.length > 0) {
          const mapped = filtered.map((card, index) => ({
            slug: generateSlug(card.verticalName),
            id: card.id,
            title: card.verticalName || card.itemName,
            description: card.description || "",
            image: card.media?.url || "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
            link: card.link || "#",
            ctaButtonText: card.showOrderButton ? card.extraText || "Order" : null,
            // Only use dynamic hex color in light mode; dark mode uses static class
            lightBgColor: card.cardBackgroundColor || null,
            bgColor: CARD_BG_COLORS[index % CARD_BG_COLORS.length].bgColor,
            hoverBg: CARD_BG_COLORS[index % CARD_BG_COLORS.length].hoverBg,
            isHexColor: !!card.cardBackgroundColor
          }));
          setExperiences(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch vertical cards:", err);
      } finally {
        setExperiencesFetched(true);
      }
    };
    if (propertyId) fetchData();
  }, [propertyId]);
  const activeHeader = header || STATIC_HEADER;
  const activeExperiences = experiences || STATIC_EXPERIENCES;
  const citySlug = createCitySlug(
    propertyData?.city || propertyData?.locationName || propertyData?.propertyName
  );
  const propertySlug = createHotelSlug(
    propertyData?.propertyName || propertyData?.name || "restaurant",
    propertyId
  );
  const resolveCardStyle = (exp, index) => {
    if (isDark) {
      return {
        style: {},
        bgClass: "dark:bg-zinc-800/80",
        hoverClass: "dark:hover:bg-zinc-700/90",
        lightBgClass: exp.bgColor,
        lightHoverClass: exp.hoverBg
      };
    }
    if (exp.isHexColor && exp.lightBgColor) {
      return {
        style: { backgroundColor: exp.lightBgColor },
        bgClass: "",
        hoverClass: "",
        lightBgClass: "",
        lightHoverClass: ""
      };
    }
    return {
      style: {},
      bgClass: exp.bgColor,
      hoverClass: exp.hoverBg,
      lightBgClass: "",
      lightHoverClass: ""
    };
  };
  if (experiencesFetched && !experiences) return null;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref: containerRef,
      className: "relative py-10 lg:py-20 transition-colors duration-500 bg-white dark:bg-[#080808] overflow-hidden",
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none z-0", children: /* @__PURE__ */ jsx(
          motion.div,
          {
            style: { x: moveTL_BR, y: moveTL_BR, opacity: bgOpacity },
            className: "absolute top-4 left-4 text-[6rem] lg:text-[10rem] font-black italic text-zinc-900 dark:text-white select-none uppercase",
            children: "Cuisine"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start gap-10 mb-20", children: [
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, x: -20 },
                whileInView: { opacity: 1, x: 0 },
                viewport: { once: true },
                className: "max-w-2xl",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                    /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary animate-pulse" }),
                    /* @__PURE__ */ jsx("span", { className: "text-primary text-[11px] font-bold uppercase tracking-[0.4em]", children: activeHeader.badgeLabel })
                  ] }),
                  /* @__PURE__ */ jsxs("h2", { className: "text-4xl md:text-6xl font-serif text-zinc-900 dark:text-white tracking-tight mb-6", children: [
                    activeHeader.headlineLine1,
                    " ",
                    /* @__PURE__ */ jsx("br", {}),
                    /* @__PURE__ */ jsx("span", { className: "text-primary italic", children: activeHeader.headlineLine2 })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-zinc-600 dark:text-zinc-400 text-base md:text-lg font-light leading-relaxed", children: activeHeader.description })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, x: 20 },
                whileInView: { opacity: 1, x: 0 },
                viewport: { once: true },
                className: "flex items-center gap-6 bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-primary/10 max-w-lg shadow-sm backdrop-blur-md",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: activeHeader.policyMedia?.url,
                        className: "w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-md",
                        alt: "BYOB Support"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm", children: /* @__PURE__ */ jsx(Beer, { className: "w-4 h-4 text-white" }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(Quote, { className: "w-3 h-3 text-primary fill-primary" }),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest", children: activeHeader.policyType })
                    ] }),
                    /* @__PURE__ */ jsxs("h3", { className: "text-xl font-serif dark:text-white text-zinc-900", children: [
                      activeHeader.policyName.split(" ").slice(0, -1).join(" "),
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: activeHeader.policyName.split(" ").slice(-1) })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-sm italic dark:text-zinc-400 text-zinc-600 leading-snug", children: [
                      '"',
                      activeHeader.policyDescription,
                      '"'
                    ] })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-4 lg:gap-8", children: activeExperiences.map((exp, index) => {
            const {
              style,
              bgClass,
              hoverClass,
              lightBgClass,
              lightHoverClass
            } = resolveCardStyle(exp);
            return /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { delay: index * 0.1 },
                onClick: () => navigate(`/${citySlug}/${propertySlug}/${exp.slug}`, {
                  state: { propertyData }
                }),
                style,
                className: `
                  group cursor-pointer relative flex transition-all duration-500 hover:shadow-2xl
                  ${lightBgClass} ${lightHoverClass} ${bgClass} ${hoverClass}
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
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-grow px-4 lg:px-0", children: [
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
        ] })
      ]
    }
  );
}
const gallery3 = "/assets/3dGallery3-DN1S9KXZ.jpeg";
const gallery4 = "/assets/3dGallery4-xCZqSdpV.jpeg";
const gallery5 = "/assets/3dGallery5-BgIgVbmq.jpeg";
function parseMarkdown(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return /* @__PURE__ */ jsx("strong", { className: "text-zinc-900 dark:text-white font-medium", children: part.slice(2, -2) }, i);
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return /* @__PURE__ */ jsx("em", { className: "italic font-medium text-primary", children: part.slice(1, -1) }, i);
    }
    return part;
  });
}
const FALLBACK_ABOUT = {
  badgeLabel: "Authentic Heritage Dining",
  headlineLine1: "Experience elegance, taste",
  headlineLine2: "and unforgettable dining.",
  description: "We believe dining is more than just a meal; it's a curated premium experience. Our philosophy balances bold Indian tradition with refined global elegance, all within a thoughtfully designed setting.",
  openingTime: "11:00 AM",
  closingTime: "11:30 PM",
  days: "Monday — Sunday"
};
const FALLBACK_IMAGES = [gallery3, gallery4, gallery5];
const FALLBACK_SOCIALS = [
  { platformName: "Instagram", url: "#" },
  { platformName: "Facebook", url: "#" },
  { platformName: "Twitter", url: "#" },
  { platformName: "WhatsApp", url: "#" }
];
const FALLBACK_CONNECT = {
  sectionLabel: "Connect",
  title: "Get In Touch",
  subtitle: "Direct Reservation",
  whatsappContact: "919999999999",
  phoneNumber: "919999999999"
};
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const min = m || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, "0")}:${min} ${ampm}`;
}
function getPlatformIcon(platformName) {
  const name = (platformName || "").toLowerCase();
  if (name.includes("instagram")) return /* @__PURE__ */ jsx(Instagram, { size: 14 });
  if (name.includes("facebook")) return /* @__PURE__ */ jsx(Facebook, { size: 14 });
  if (name.includes("twitter") || name.includes("x"))
    return /* @__PURE__ */ jsx(Twitter, { size: 14 });
  if (name.includes("whatsapp")) return /* @__PURE__ */ jsx(MessageCircle, { size: 14 });
  return /* @__PURE__ */ jsx(Link$1, { size: 14 });
}
const ContactPopup = ({ isOpen, onClose, connectData }) => {
  const whatsappHref = connectData.whatsappContact ? `https://wa.me/${connectData.whatsappContact.replace(/\D/g, "")}` : "#";
  const phoneHref = connectData.phoneNumber ? `tel:+${connectData.phoneNumber.replace(/\D/g, "")}` : "#";
  const contactOptions = [
    {
      name: "WhatsApp",
      sub: "Instant Chat",
      icon: /* @__PURE__ */ jsx(MessageSquare, { size: 24 }),
      link: whatsappHref,
      bgColor: "bg-[#25D366]",
      lightBg: "bg-[#25D366]/10"
    },
    {
      name: "Direct Call",
      sub: "Speak to Host",
      icon: /* @__PURE__ */ jsx(Phone, { size: 24 }),
      link: phoneHref,
      bgColor: "bg-primary",
      lightBg: "bg-primary/10"
    }
  ];
  return /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        className: "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-8 z-[101] shadow-2xl border border-zinc-100 dark:border-white/10",
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "absolute right-4 top-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
              children: /* @__PURE__ */ jsx(X, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-2xl font-serif text-zinc-900 dark:text-white italic", children: connectData.title || "Quick Connect" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest font-bold", children: connectData.subtitle || "Choose preferred method" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: contactOptions.map((opt, i) => /* @__PURE__ */ jsxs(
              "a",
              {
                href: opt.link,
                target: "_blank",
                rel: "noopener noreferrer",
                className: `flex items-center gap-4 p-4 rounded-2xl ${opt.lightBg} transition-all group`,
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: `w-12 h-12 ${opt.bgColor} text-white rounded-xl flex items-center justify-center shadow-lg`,
                      children: opt.icon
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                    /* @__PURE__ */ jsx("span", { className: "block font-bold text-sm text-zinc-900 dark:text-white", children: opt.name }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-zinc-500 uppercase tracking-wider", children: opt.sub })
                  ] })
                ]
              },
              i
            )) })
          ] })
        ]
      }
    )
  ] }) });
};
function AboutResturantPage({ propertyId }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const containerRef = useRef(null);
  const [aboutData, setAboutData] = useState(FALLBACK_ABOUT);
  const [carouselImages, setCarouselImages] = useState(FALLBACK_IMAGES);
  const [socials, setSocials] = useState(FALLBACK_SOCIALS);
  const [connectData, setConnectData] = useState(FALLBACK_CONNECT);
  useEffect(() => {
    if (!propertyId) return;
    getAllRestaurantAbout().then((res) => {
      const data = Array.isArray(res) ? res : res?.data;
      if (data?.length > 0) {
        const matched = data.find(
          (item) => item.propertyId === propertyId && item.isActive
        );
        if (matched) {
          setAboutData({
            badgeLabel: matched.badgeLabel || FALLBACK_ABOUT.badgeLabel,
            headlineLine1: matched.headlineLine1 || FALLBACK_ABOUT.headlineLine1,
            headlineLine2: matched.headlineLine2 || FALLBACK_ABOUT.headlineLine2,
            description: matched.description || FALLBACK_ABOUT.description,
            openingTime: matched.openingTime ? formatTime(matched.openingTime) : FALLBACK_ABOUT.openingTime,
            closingTime: matched.closingTime ? formatTime(matched.closingTime) : FALLBACK_ABOUT.closingTime,
            days: matched.days || FALLBACK_ABOUT.days
          });
        }
      }
    }).catch(() => {
    });
    getRestaurantImageSocialByProperty(propertyId).then((res) => {
      const data = res?.data || res;
      if (data && data.propertyId === propertyId && data.isActive) {
        if (data.images?.length > 0) {
          setCarouselImages(data.images.map((img) => img.url));
        }
        if (data.socialLinks?.length > 0) {
          const activeSocials = data.socialLinks.filter((s) => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
          if (activeSocials.length > 0) setSocials(activeSocials);
        }
      }
    }).catch(() => {
    });
    getRestaurantConnectByProperty(propertyId).then((res) => {
      const data = res?.data || res;
      if (data && data.propertyId === propertyId && data.isActive) {
        setConnectData({
          sectionLabel: data.sectionLabel || FALLBACK_CONNECT.sectionLabel,
          title: data.title || FALLBACK_CONNECT.title,
          subtitle: data.subtitle || FALLBACK_CONNECT.subtitle,
          whatsappContact: data.whatsappContact || FALLBACK_CONNECT.whatsappContact,
          phoneNumber: data.phoneNumber || FALLBACK_CONNECT.phoneNumber
        });
      }
    }).catch(() => {
    });
  }, [propertyId]);
  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4e3);
    return () => clearInterval(timer);
  }, [carouselImages]);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const textX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15px", "15px"]);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref: containerRef,
      id: "about",
      className: "relative py-16 md:py-20 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden",
      children: [
        /* @__PURE__ */ jsx(
          ContactPopup,
          {
            isOpen: isPopupOpen,
            onClose: () => setIsPopupOpen(false),
            connectData
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            style: { x: textX },
            className: "absolute top-1/4 left-0 whitespace-nowrap text-[8rem] md:text-[12rem] font-black text-zinc-100 dark:text-white/[0.02] pointer-events-none select-none italic uppercase z-0",
            children: aboutData.badgeLabel
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-12 gap-10 lg:gap-16 items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 relative max-w-sm mx-auto lg:mx-0", children: [
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                style: { y: imageY },
                className: "relative rounded-2xl overflow-hidden aspect-square shadow-xl border border-zinc-100 dark:border-white/5",
                children: [
                  /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
                    motion.img,
                    {
                      src: carouselImages[imgIndex],
                      initial: { opacity: 0, scale: 1.1 },
                      animate: { opacity: 1, scale: 1 },
                      exit: { opacity: 0 },
                      transition: { duration: 1.2, ease: "easeInOut" },
                      alt: "Restaurant Carousel",
                      className: "w-full h-full object-cover"
                    },
                    imgIndex
                  ) }),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute -bottom-4 left-4 flex gap-2", children: socials.map((social, i) => /* @__PURE__ */ jsx(
              "a",
              {
                href: social.url || social.link || "#",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "w-9 h-9 bg-white dark:bg-zinc-900 shadow-lg rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors border border-zinc-100 dark:border-white/10",
                children: getPlatformIcon(social.platformName)
              },
              social.id || i
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "text-primary text-[10px] font-bold uppercase tracking-[0.4em]", children: aboutData.badgeLabel })
              ] }),
              /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-5xl font-serif text-zinc-900 dark:text-white leading-tight tracking-tight", children: [
                aboutData.headlineLine1,
                " ",
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsx("span", { className: "italic text-zinc-400 dark:text-white/40", children: aboutData.headlineLine2 })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-600 dark:text-white/70 text-base md:text-lg leading-relaxed font-light max-w-3xl", children: parseMarkdown(aboutData.description) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-white/10", children: [
              /* @__PURE__ */ jsxs("div", { className: "group", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 text-primary" }),
                  " Availability"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-zinc-900 dark:text-white font-serif text-lg md:text-xl italic leading-tight", children: [
                    aboutData.openingTime,
                    " — ",
                    aboutData.closingTime
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-zinc-400 dark:text-white/30 text-[9px] font-bold tracking-widest uppercase", children: aboutData.days })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "group cursor-pointer",
                  onClick: () => setIsPopupOpen(true),
                  children: [
                    /* @__PURE__ */ jsxs("h4", { className: "text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(Phone, { className: "w-3 h-3 text-primary" }),
                      " ",
                      connectData.sectionLabel
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-primary/10 dark:bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm active:scale-95", children: /* @__PURE__ */ jsx(Contact2, { className: "w-6 h-6" }) }),
                      /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-zinc-900 dark:text-white font-serif text-lg md:text-xl italic block leading-tight", children: connectData.title }),
                        /* @__PURE__ */ jsx("span", { className: "text-zinc-400 dark:text-white/30 text-[9px] font-bold tracking-widest uppercase", children: connectData.subtitle })
                      ] })
                    ] })
                  ]
                }
              )
            ] })
          ] })
        ] }) })
      ]
    }
  );
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
function CountdownTimer({ expiresAt }) {
  const [label, setLabel] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  useEffect(() => {
    if (!expiresAt) return;
    const i = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
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
function ResturantpageOffers({
  propertyId
}) {
  const [swiper, setSwiper] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!propertyId) {
      setOffers([]);
      setLoading(false);
      return;
    }
    getDailyOffers({ page: 0, size: 100 }).then((res) => {
      const raw = res?.data?.content ?? res?.data ?? [];
      console.log("raw", raw);
      const now = Date.now();
      const DAYS = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY"
      ];
      const todayName = DAYS[(/* @__PURE__ */ new Date()).getDay()];
      const filtered = raw.filter((o) => {
        const expiry = o.expiresAt ? /* @__PURE__ */ new Date(o.expiresAt + "T23:59:59") : null;
        const notExpired = !expiry || expiry.getTime() >= now;
        const isDayActive = !o.activeDays?.length || o.activeDays.includes(todayName);
        return Number(o.propertyId) === Number(propertyId) && o.isActive === true && o.image?.url && notExpired && isDayActive;
      });
      if (filtered.length > 0) {
        const mapped = filtered.map((o) => ({
          id: o.id,
          title: o.title ?? "",
          description: o.description ?? "",
          couponCode: o.couponCode ?? "",
          ctaText: o.ctaText ?? "",
          ctaLink: o.ctaUrl || o.ctaLink || null,
          expiresAt: o.expiresAt ?? null,
          // Map to the shape detectBanner expects (src + fileName)
          image: {
            src: o.image.url,
            type: o.image.type ?? "IMAGE",
            width: o.image.width ?? null,
            height: o.image.height ?? null,
            fileName: o.image.fileName ?? "",
            alt: o.title ?? "Offer"
          }
        }));
        setOffers(mapped);
      } else {
        setOffers([]);
      }
    }).catch(() => setOffers([])).finally(() => setLoading(false));
  }, [propertyId]);
  console.log(offers);
  if (loading)
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin text-primary", size: 24 }) });
  if (!offers.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => swiper?.slidePrev(),
          className: "p-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 hover:bg-zinc-50 transition-all shadow-sm",
          children: /* @__PURE__ */ jsx(ChevronLeft, { size: 14, className: "dark:text-white" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => swiper?.slideNext(),
          className: "p-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 hover:bg-zinc-50 transition-all shadow-sm",
          children: /* @__PURE__ */ jsx(ChevronRight, { size: 14, className: "dark:text-white" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "w-full max-w-full", children: /* @__PURE__ */ jsx(
      Swiper,
      {
        modules: [Navigation$1, Autoplay],
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: true,
        loop: offers.length > 1,
        autoplay: {
          delay: 5e3,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        onSwiper: setSwiper,
        className: "rounded-[28px]",
        children: offers.map((offer, i) => {
          const isBanner = detectBanner(offer.image);
          const isVideo = offer.image?.type === "VIDEO";
          const hasContent = !!(offer.title || offer.description || offer.couponCode);
          const hasCtaText = !!offer.ctaText?.trim();
          const isClickable = !!offer.ctaLink;
          const showFullImage = isBanner || !hasContent;
          return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsxs("div", { className: "group h-[520px] bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[28px] overflow-hidden flex flex-col shadow-sm relative transition-all duration-300 hover:shadow-xl", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `relative overflow-hidden shrink-0 ${showFullImage ? "h-full" : "h-[280px]"}`,
                children: [
                  offer.image ? isVideo ? (
                    // OfferVideo handles its own sizing inside the container
                    /* @__PURE__ */ jsx(OfferVideo, { src: offer.image.src })
                  ) : /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: offer.image.src,
                      alt: offer.image.alt,
                      className: "w-full h-full object-contain object-center bg-zinc-900 transition-transform duration-500 group-hover:scale-105"
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-zinc-800", children: /* @__PURE__ */ jsx(Tag, { className: "w-10 h-10 text-zinc-600" }) }),
                  offer.expiresAt && /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 z-10", children: /* @__PURE__ */ jsx(CountdownTimer, { expiresAt: offer.expiresAt }) }),
                  showFullImage && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20", children: [
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
                        className: "w-full bg-primary text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90",
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
            !showFullImage && /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col flex-1 bg-white dark:bg-zinc-900", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-serif font-bold line-clamp-2 leading-tight text-zinc-900 dark:text-white group-hover:text-primary transition-colors", children: offer.title }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-zinc-500 italic line-clamp-2 mt-2", children: offer.description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-3 border-t border-zinc-100 dark:border-white/10", children: [
                offer.couponCode && /* @__PURE__ */ jsxs("div", { className: "text-[11px] mb-3 flex items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-md border border-dashed border-primary/20", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-zinc-400 font-medium uppercase", children: "Code" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono font-black text-primary text-xs tracking-widest bg-white dark:bg-zinc-900 px-2 py-0.5 rounded shadow-sm border", children: offer.couponCode })
                ] }),
                hasCtaText && (isClickable ? /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: offer.ctaLink,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "w-full bg-primary text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md",
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
                    className: "w-full bg-zinc-100 dark:bg-zinc-800 py-2.5 rounded-lg text-xs font-bold opacity-70 cursor-not-allowed flex items-center justify-center gap-2",
                    children: [
                      offer.ctaText,
                      " ",
                      /* @__PURE__ */ jsx(ExternalLink, { size: 12 })
                    ]
                  }
                ))
              ] })
            ] })
          ] }) }, offer.id ?? i);
        })
      }
    ) })
  ] });
}
const resturant_buffet1 = "/assets/resturant_buffet1-DXA26XbK.jpeg";
const BUFFET_DATA_FALLBACK = [
  { id: "b1", img: resturant_buffet1 },
  { id: "b2", img: resturant_buffet1 },
  { id: "b3", img: resturant_buffet1 }
];
const BUFFET_HEADER_FALLBACK = {
  headlinePart1: "Buffet",
  headlinePart2: "Selection",
  description: "Explore international delicacies curated for every occasion."
};
const OFFER_HEADER_FALLBACK = {
  headLine1: "Today's",
  headLine2: "Deals",
  description: "Claim your rewards on your favorite culinary treats."
};
function BuffetCarousel({ items, onBook }) {
  const [active, setActive] = useState(0);
  const total = items.length;
  const next = () => setActive((a) => (a + 1) % total);
  const prev = () => setActive((a) => (a - 1 + total) % total);
  const activeItem = items[active];
  const positionStyles = {
    center: { zIndex: 30, scale: 1, x: "0%", opacity: 1 },
    left: { zIndex: 10, scale: 0.9, x: "-25%", opacity: 0.2 },
    right: { zIndex: 10, scale: 0.9, x: "25%", opacity: 0.2 },
    hidden: { zIndex: 0, scale: 0.7, opacity: 0 }
  };
  if (!items.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full flex flex-col items-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[360px] flex items-center justify-center overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 bg-primary/10 blur-[120px] pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "hidden md:block relative w-full h-full", children: items.map((item, idx) => {
        const pos = idx === active ? "center" : idx === (active - 1 + total) % total ? "left" : idx === (active + 1) % total ? "right" : "hidden";
        const imgSrc = item.media?.url || item.img || resturant_buffet1;
        return /* @__PURE__ */ jsx(
          motion.div,
          {
            animate: positionStyles[pos],
            transition: { duration: 0.6, ease: "easeInOut" },
            className: `absolute inset-0 m-auto w-[80%] h-[95%] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 ${pos === "center" ? "pointer-events-auto" : "pointer-events-none"}`,
            children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: imgSrc,
                className: "max-w-full max-h-full object-contain",
                alt: item.itemName
              }
            ) })
          },
          item.id
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "md:hidden w-full h-full px-4", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: activeItem.media?.url || activeItem.img || resturant_buffet1,
          className: "w-full h-full object-cover rounded-3xl",
          alt: "active buffet"
        }
      ) }),
      total > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: prev,
            className: "absolute left-4 z-40 p-3 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all",
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: next,
            className: "absolute right-4 z-40 p-3 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all",
            children: /* @__PURE__ */ jsx(ChevronRight, { size: 20 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-full mt-8 px-4", children: [
      /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { duration: 0.4 },
          className: "flex flex-col items-center text-center space-y-4",
          children: [
            activeItem.price > 0 && /* @__PURE__ */ jsx("div", { className: "bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full", children: /* @__PURE__ */ jsxs("span", { className: "text-primary font-black text-sm tracking-tighter", children: [
              "₹",
              activeItem.price,
              " "
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-3xl font-serif dark:text-white mb-2 uppercase tracking-tight", children: activeItem.itemName }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm italic font-light leading-relaxed", children: activeItem.description })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => onBook(activeItem),
                className: "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary dark:hover:text-white h-10 px-10 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                children: [
                  activeItem.ctaButtonText || "Reserve Your Table",
                  /* @__PURE__ */ jsx(ChevronRight, { size: 12, className: "ml-2" })
                ]
              }
            ) })
          ]
        },
        activeItem.id
      ) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-8", children: items.map((_, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `h-1 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-primary" : "w-2 bg-zinc-200 dark:bg-zinc-800"}`
        },
        i
      )) })
    ] })
  ] });
}
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(Math.floor(target * 0.8));
  useEffect(() => {
    let start = count;
    const increment = (target - start) / 125;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return /* @__PURE__ */ jsx("span", { children: count.toLocaleString() });
}
function DishImage({ src, alt }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center", children: /* @__PURE__ */ jsx(ImageOff, { size: 32, className: "text-zinc-300" }) });
  }
  return /* @__PURE__ */ jsx(
    "img",
    {
      src,
      className: "w-full h-full object-cover",
      alt,
      onError: () => setErrored(true)
    }
  );
}
function EnhancedCulinaryCuration({ propertyId }) {
  useNavigate();
  const [buffetHeader, setBuffetHeader] = useState(BUFFET_HEADER_FALLBACK);
  const [buffetItems, setBuffetItems] = useState(BUFFET_DATA_FALLBACK);
  const [offerHeader, setOfferHeader] = useState(OFFER_HEADER_FALLBACK);
  const [menuHeader, setMenuHeader] = useState(null);
  const [chefRemark, setChefRemark] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [isMenuDescriptionExpanded, setIsMenuDescriptionExpanded] = useState(false);
  const [showMenuDescriptionToggle, setShowMenuDescriptionToggle] = useState(false);
  const menuDescriptionRef = useRef(null);
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    item: null,
    type: "book"
  });
  const [likedItems, setLikedItems] = useState({});
  const [likeForm, setLikeForm] = useState({
    name: "",
    phone: "",
    description: "",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    time: "19:00",
    totalGuest: "2"
  });
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const formatChefRemarkText = (text) => {
    if (!text) return "";
    const trimmed = text.trim();
    const normalized = trimmed.replace(/^"+|"+$/g, "");
    return `"${normalized}"`;
  };
  useEffect(() => {
    if (!propertyId) return;
    getAllBuffetSectionHeaders().then((res) => {
      const data = Array.isArray(res) ? res : res?.data;
      if (data?.length) {
        const active = data.filter(
          (h) => h.propertyId === propertyId && h.isActive
        )[0];
        if (active)
          setBuffetHeader({
            headlinePart1: active.headlinePart1 || BUFFET_HEADER_FALLBACK.headlinePart1,
            headlinePart2: active.headlinePart2 || BUFFET_HEADER_FALLBACK.headlinePart2,
            description: active.description || BUFFET_HEADER_FALLBACK.description
          });
      }
    }).catch(() => {
    });
    getAllBuffetItems().then((res) => {
      const data = Array.isArray(res) ? res : res?.data;
      if (data?.length) {
        const matched = data.filter((i) => i.propertyId === propertyId && i.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
        setBuffetItems(matched.length ? matched : BUFFET_DATA_FALLBACK);
      }
    }).catch(() => {
    });
    getAllOfferHeaders().then((res) => {
      const data = Array.isArray(res) ? res : res?.data;
      if (data?.length) {
        const matchedHeaders = data.filter(
          (h) => Number(h.propertyId) === Number(propertyId) && h.isActive === true
        ).sort((a, b) => b.id - a.id);
        const latestHeader = matchedHeaders[0];
        if (latestHeader) {
          setOfferHeader({
            headLine1: latestHeader.headLine1 || OFFER_HEADER_FALLBACK.headLine1,
            headLine2: latestHeader.headLine2 || OFFER_HEADER_FALLBACK.headLine2,
            description: latestHeader.description || OFFER_HEADER_FALLBACK.description
          });
        }
      }
    }).catch(() => {
    });
  }, [propertyId]);
  useEffect(() => {
    if (!propertyId) return;
    setMenuLoading(true);
    Promise.all([getMenuHeaders(), getChefRemarks(), getMenuItems()]).then(([headersRes, remarksRes, itemsRes]) => {
      const headers = (headersRes?.data || []).filter((h) => h.propertyId === propertyId).sort((a, b) => b.id - a.id);
      const latestHeader = headers[0] || null;
      if (latestHeader) {
        setMenuHeader({
          part1: latestHeader.part1 || "",
          part2: latestHeader.part2 || "",
          description: latestHeader.description || ""
        });
      }
      const remarks = (remarksRes?.data || []).filter((r) => r.propertyId === propertyId).sort((a, b) => b.id - a.id);
      const latestRemark = remarks[0] || null;
      if (latestRemark) {
        setChefRemark({
          remark: latestRemark.remark || "Chef's Remark",
          description: latestRemark.description || "",
          imageUrl: latestRemark.img || latestRemark.image?.url || ""
        });
      }
      const items = (itemsRes?.data || []).filter(
        (i) => i.propertyId === propertyId && i.status !== false && i.signatureItem === true
      ).sort((a, b) => b.id - a.id);
      setMenuItems(items);
    }).catch(() => {
    }).finally(() => setMenuLoading(false));
  }, [propertyId]);
  useEffect(() => {
    const el = menuDescriptionRef.current;
    if (!el || !menuHeader?.description) {
      setShowMenuDescriptionToggle(false);
      return;
    }
    const checkOverflow = () => {
      setShowMenuDescriptionToggle(el.scrollHeight > el.clientHeight + 1);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [menuHeader?.description, isMenuDescriptionExpanded]);
  const handleBookingSubmit = async () => {
    if (!bookingModal.item) return;
    setLikeSubmitting(true);
    try {
      const itemType = bookingModal.item.itemName || "Buffet Reservation";
      const currentCategory = buffetHeader.headlinePart1 || "Buffet";
      await createJoiningUs({
        guestName: likeForm.name.trim(),
        contactNumber: likeForm.phone.trim(),
        date: likeForm.date,
        time: likeForm.time,
        totalGuest: Number(likeForm.totalGuest),
        propertyId: Number(propertyId),
        description: `Category: ${currentCategory} | Request: ${itemType} | Email: ${likeForm.email || "N/A"}`
      });
      toast.success("Reservation request sent!");
      setBookingModal({ isOpen: false, item: null, type: "book" });
      setLikeForm({
        name: "",
        phone: "",
        email: "",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        time: "19:00",
        totalGuest: "2",
        description: ""
      });
    } catch (error) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLikeSubmitting(false);
    }
  };
  const handleLikeSubmit = async () => {
    if (!bookingModal.item) return;
    setLikeSubmitting(true);
    try {
      const res = await addItemLike(bookingModal.item.id, {
        name: likeForm.name,
        mobileNumber: likeForm.phone,
        description: likeForm.description || "Great taste!"
      });
      const updated = res?.data || res;
      setMenuItems(
        (prev) => prev.map(
          (i) => i.id === bookingModal.item.id ? { ...i, likeCount: updated.totalLikeCount ?? i.likeCount } : i
        )
      );
      setLikedItems((prev) => ({ ...prev, [bookingModal.item.id]: true }));
      setBookingModal({ isOpen: false, item: null, type: "book" });
      setLikeForm({
        name: "",
        phone: "",
        description: "",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        time: "19:00",
        totalGuest: "2"
      });
    } catch {
      setLikedItems((prev) => ({ ...prev, [bookingModal.item.id]: true }));
      setBookingModal({ isOpen: false, item: null, type: "book" });
    } finally {
      setLikeSubmitting(false);
    }
  };
  const getItemImage = (item) => item.media?.url || item.image?.url || (item.mediaId ? `/api/media/${item.mediaId}` : null);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#050505] transition-colors duration-500 pb-10", children: [
    /* @__PURE__ */ jsx("section", { className: "pt-20 pb-12 border-b border-zinc-100 dark:border-white/5", children: /* @__PURE__ */ jsx("div", { className: "max-w-[1400px] mx-auto px-6 md:px-12 text-left", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-10 items-stretch", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:w-[60%] flex flex-col pt-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 h-[100px]", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-4xl font-serif dark:text-white mb-2", children: [
            buffetHeader.headlinePart1,
            " ",
            /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: buffetHeader.headlinePart2 })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-zinc-400 text-xs font-light truncate", children: buffetHeader.description })
        ] }),
        /* @__PURE__ */ jsx(
          BuffetCarousel,
          {
            items: buffetItems,
            onBook: (item) => setBookingModal({ isOpen: true, item, type: "book" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:w-[35%] bg-zinc-50/50 dark:bg-white/[0.02] rounded-[40px] p-8 border border-zinc-100 dark:border-white/5 flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-serif dark:text-white mb-1", children: [
            offerHeader.headLine1,
            " ",
            /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: offerHeader.headLine2 })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-zinc-400 text-[10px] font-light truncate", children: offerHeader.description })
        ] }),
        /* @__PURE__ */ jsx(ResturantpageOffers, { propertyId })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "pt-16 pb-2", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto px-6 md:px-12 text-left", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start gap-8 mb-20", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0 lg:max-w-[80%]", children: menuLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-zinc-400 text-sm", children: [
          /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }),
          " Loading…"
        ] }) : menuHeader ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-4xl font-serif dark:text-white mb-2", children: [
            menuHeader.part1,
            " ",
            /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: menuHeader.part2 })
          ] }),
          menuHeader.description && /* @__PURE__ */ jsxs("div", { className: "max-w-[80%]", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                ref: menuDescriptionRef,
                className: `text-zinc-500 dark:text-zinc-400 text-sm font-light leading-relaxed break-words ${isMenuDescriptionExpanded ? "max-h-32 overflow-y-auto pr-2" : "line-clamp-2"}`,
                children: menuHeader.description
              }
            ),
            showMenuDescriptionToggle && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setIsMenuDescriptionExpanded((prev) => !prev),
                className: "mt-2 text-xs font-semibold text-primary hover:underline",
                children: isMenuDescriptionExpanded ? "Show less" : "Show more .."
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxs("h2", { className: "text-3xl md:text-4xl font-serif dark:text-white mb-2", children: [
          "Signature",
          " ",
          /* @__PURE__ */ jsx("span", { className: "italic text-primary", children: "Masterpieces" })
        ] }) }),
        !menuLoading && chefRemark && /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: 20 },
            whileInView: { opacity: 1, x: 0 },
            className: "w-full lg:w-[368px] shrink-0 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-primary/10 shadow-sm overflow-hidden",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
                chefRemark.imageUrl ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: chefRemark.imageUrl,
                    className: "w-16 h-16 rounded-full object-cover border-2 border-primary",
                    alt: "Chef",
                    onError: (e) => {
                      e.target.style.display = "none";
                    }
                  }
                ) : /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center border-2 border-primary", children: /* @__PURE__ */ jsx(ChefHat, { className: "w-7 h-7 text-primary" }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 -right-1 bg-primary p-1 rounded-full border-2 border-white dark:border-zinc-900", children: /* @__PURE__ */ jsx(ChefHat, { className: "w-4 h-4 text-white" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1 min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Quote, { className: "w-3 h-3 text-primary fill-primary" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold dark:text-zinc-400 uppercase tracking-widest", children: chefRemark.remark })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm italic dark:text-zinc-200 leading-snug line-clamp-6 break-words overflow-hidden", children: formatChefRemarkText(chefRemark.description) })
              ] })
            ]
          }
        )
      ] }),
      menuLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-20 text-zinc-400 gap-2", children: [
        /* @__PURE__ */ jsx(Loader2, { size: 20, className: "animate-spin" }),
        " Loading menu items…"
      ] }) : menuItems.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20 text-zinc-300 text-sm italic", children: "No menu items available." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20 pt-16", children: menuItems.map((item) => {
        const imgSrc = getItemImage(item);
        const isLiked = !!likedItems[item.id];
        const likes = item.likeCount || 0;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "group relative bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 flex-col items-center text-center flex cursor-pointer",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-square rounded-[2rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl -mt-24 mb-4 transition-transform duration-700 group-hover:scale-105", children: [
                /* @__PURE__ */ jsx(DishImage, { src: imgSrc, alt: item.itemName }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      setBookingModal({ isOpen: true, item, type: "like" });
                    },
                    className: "absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md text-primary hover:scale-110 transition-transform",
                    children: /* @__PURE__ */ jsx(
                      Heart,
                      {
                        size: 18,
                        className: isLiked ? "fill-primary" : ""
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-primary uppercase tracking-widest mb-2", children: item.category?.categoryName || item.type?.typeName || "" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-full items-center", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-2xl font-serif text-zinc-900 dark:text-white mb-2 leading-tight", children: item.itemName }),
                item.description && /* @__PURE__ */ jsxs("p", { className: "text-zinc-500 text-[13px] leading-snug line-clamp-2 italic mb-3", children: [
                  '"',
                  item.description,
                  '"'
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5 text-primary", children: [
                  /* @__PURE__ */ jsx(Heart, { size: 14, className: "fill-primary" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm font-black", children: [
                    /* @__PURE__ */ jsx(AnimatedCounter, { target: likes }),
                    "+"
                  ] })
                ] })
              ] })
            ]
          },
          item.id
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: bookingModal.isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        className: "bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative text-left border border-zinc-100 dark:border-white/5",
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setBookingModal({ isOpen: false, item: null, type: "book" }),
              className: "absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors",
              children: /* @__PURE__ */ jsx(X, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-serif mb-2 dark:text-white", children: bookingModal.type === "like" ? "Show your love" : `Reserve ${bookingModal.item?.itemName || bookingModal.item?.name || "Table"}` }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 mb-6 italic", children: bookingModal.type === "like" ? "Share your details to like this dish." : "Please provide your details below for the reservation." }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Your Name",
                  value: likeForm.name,
                  onChange: (e) => setLikeForm((f) => ({ ...f, name: e.target.value })),
                  className: "h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                }
              ),
              /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Phone Number",
                  value: likeForm.phone,
                  onChange: (e) => setLikeForm((f) => ({ ...f, phone: e.target.value })),
                  className: "h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                }
              )
            ] }),
            bookingModal.type === "book" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-bold text-primary px-1", children: "Date" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "date",
                      value: likeForm.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                      onChange: (e) => setLikeForm((f) => ({ ...f, date: e.target.value })),
                      className: "h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-bold text-primary px-1", children: "Time" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "time",
                      value: likeForm.time || "19:00",
                      onChange: (e) => setLikeForm((f) => ({ ...f, time: e.target.value })),
                      className: "h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-bold text-primary px-1", children: "Number of Guests" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "number",
                    min: "1",
                    placeholder: "Total Guests",
                    value: likeForm.totalGuest || "2",
                    onChange: (e) => setLikeForm((f) => ({
                      ...f,
                      totalGuest: e.target.value
                    })),
                    className: "h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none shadow-sm"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                disabled: !likeForm.name || !likeForm.phone || likeSubmitting,
                onClick: bookingModal.type === "like" ? handleLikeSubmit : handleBookingSubmit,
                className: "w-full h-14 bg-primary text-white rounded-2xl font-black uppercase shadow-lg hover:bg-primary/90 transition-all active:scale-95",
                children: likeSubmitting ? /* @__PURE__ */ jsx(Loader2, { size: 18, className: "animate-spin mx-auto" }) : bookingModal.type === "like" ? "Submit Like" : "Confirm Reservation"
              }
            )
          ] })
        ]
      }
    ) }) })
  ] });
}
const gallery1 = "/assets/3dGallery1-COCf3Orf.jpeg";
const gallery2 = "/assets/3dGallery2-BVpDHSJc.jpeg";
const FALLBACK_DATA = [
  { id: 1, title: "Grand Hall", cat: "3d", img: gallery1 },
  { id: 2, title: "Chef's Table", cat: "3d", img: gallery2 },
  { id: 3, title: "Sunset Deck", cat: "3d", img: gallery3 },
  { id: 4, title: "The Bar", cat: "3d", img: gallery4 },
  { id: 5, title: "Live Kitchen", cat: "3d", img: gallery5 }
];
function RestaurantGalleryPage({ propertyId }) {
  const [galleryHeader, setGalleryHeader] = useState({
    header1: "",
    header2: "",
    description: ""
  });
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [manualOffset, setManualOffset] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const bgTextX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const fetchGalleryHeader = async () => {
    try {
      const res = await getActiveVisualGalleriesHeader();
      const all = res?.data || [];
      const matched = all.filter((h) => h.propertyId === propertyId && h.isActive === true).sort((a, b) => b.id - a.id);
      const latest = matched[0];
      if (latest) {
        setGalleryHeader({
          header1: latest.header1 || "",
          header2: latest.header2 || "",
          description: latest.description || ""
        });
      }
    } catch (err) {
      console.error("Failed to load gallery header:", err);
    }
  };
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await getAllGalleries({});
        const allContent = response?.data?.content || response?.content || [];
        const filtered = allContent.filter(
          (item) => item.propertyId === propertyId && item.categoryName?.toLowerCase() === "3d" && item.isActive
        ).map((item) => ({
          id: item.id,
          title: item.propertyName || "Gallery View",
          cat: item.categoryName || "3d",
          img: item.media?.url
        }));
        console.log("filtered", filtered);
        setGalleryItems(filtered.length > 0 ? filtered : FALLBACK_DATA);
      } catch (error) {
        console.error("Gallery fetch error:", error);
        setGalleryItems(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) {
      fetchGalleryHeader();
      fetchGallery();
    }
  }, [propertyId]);
  const diagonalVariants = {
    animate: {
      x: ["-25%", "25%"],
      y: ["-25%", "25%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 15,
          ease: "linear"
        },
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 15,
          ease: "linear"
        }
      }
    },
    animateReverse: {
      x: ["25%", "-25%"],
      y: ["-25%", "25%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 35,
          ease: "linear"
        },
        y: {
          repeat: Infinity,
          repeatType: "mirror",
          duration: 35,
          ease: "linear"
        }
      }
    }
  };
  const handleManual = (dir) => {
    setManualOffset((prev) => prev + (dir === "next" ? -150 : 150));
  };
  return /* @__PURE__ */ jsxs(
    "section",
    {
      ref: containerRef,
      className: "relative py-14 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden min-h-[650px]",
      children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            style: { x: bgTextX },
            className: "absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap text-[15rem] font-black text-zinc-900/[0.03] dark:text-white/[0.01] pointer-events-none select-none italic uppercase z-0",
            children: galleryHeader.header1 || " "
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-12 gap-12 items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Camera, { className: "w-5 h-5 text-primary animate-pulse" }),
                /* @__PURE__ */ jsx("span", { className: "text-primary text-[10px] font-black uppercase tracking-[0.4em]", children: "3D Visual Gallery" })
              ] }),
              /* @__PURE__ */ jsxs("h2", { className: "text-5xl md:text-7xl font-serif dark:text-white leading-[1.1]", children: [
                galleryHeader.header1 || " ",
                " ",
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsx("span", { className: "italic text-zinc-400 dark:text-white/30 decoration-primary/20 underline decoration-1 underline-offset-8", children: galleryHeader.header2 || "" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-white/40 text-lg font-light leading-relaxed max-w-sm", children: galleryHeader.description || "" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4 pt-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleManual("prev"),
                  className: "p-4 rounded-full border border-zinc-200 dark:border-white/10 dark:text-white hover:bg-primary hover:text-white transition-all shadow-xl",
                  children: /* @__PURE__ */ jsx(ChevronLeft, { size: 24 })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleManual("next"),
                  className: "p-4 rounded-full border border-zinc-200 dark:border-white/10 dark:text-white hover:bg-primary hover:text-white transition-all shadow-xl",
                  children: /* @__PURE__ */ jsx(ChevronRight, { size: 24 })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "lg:col-span-8 h-[550px] relative rounded-[3rem] overflow-hidden border border-zinc-100 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl shadow-2xl",
              onMouseEnter: () => setIsPaused(true),
              onMouseLeave: () => setIsPaused(false),
              children: [
                loading ? /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin text-primary", size: 40 }) }) : /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full flex items-center justify-center", children: [
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      variants: diagonalVariants,
                      animate: isPaused ? "" : "animate",
                      style: { translateX: manualOffset },
                      className: "absolute flex gap-8 p-10 whitespace-nowrap",
                      children: [...galleryItems, ...galleryItems].map((item, i) => /* @__PURE__ */ jsx(GalleryItem, { item }, `tlbr-${i}`))
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      variants: diagonalVariants,
                      animate: isPaused ? "" : "animateReverse",
                      style: { translateX: -manualOffset },
                      className: "absolute flex gap-8 p-10 whitespace-nowrap",
                      children: [...galleryItems, ...galleryItems].reverse().map((item, i) => /* @__PURE__ */ jsx(GalleryItem, { item }, `trbl-${i}`))
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute top-10 left-10 w-4 h-4 border-t-2 border-l-2 border-primary" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute bottom-10 right-10 w-4 h-4 border-b-2 border-r-2 border-primary" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-white/20 dark:from-black/20 dark:to-black/20" })
              ]
            }
          )
        ] }) })
      ]
    }
  );
}
function GalleryItem({ item }) {
  return /* @__PURE__ */ jsxs("div", { className: "relative group w-[280px] h-[380px] shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-100 dark:bg-zinc-800 transition-transform duration-500 hover:scale-105", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: item.img,
        alt: item.title,
        className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end", children: [
      /* @__PURE__ */ jsx("span", { className: "text-primary text-[10px] font-black uppercase tracking-widest mb-1", children: item.cat }),
      /* @__PURE__ */ jsx("h4", { className: "text-white font-serif text-lg", children: item.title })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(Maximize2, { size: 16, className: "text-white" }) })
  ] });
}
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  // { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  // { type: "link", label: "EVENTS", key: "events", href: "#events" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" }
  // { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];
function RestaurantHomepage() {
  const { propertyId, propertySlug } = useParams();
  const slugTail = propertySlug?.split("-").pop() || "";
  const numericPropertyId = Number(propertyId || slugTail) || null;
  const [propertyData, setPropertyData] = useState(null);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!numericPropertyId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setPropertyData(null);
        setGalleryData([]);
        const response = await GetAllPropertyDetails();
        const rawData = response?.data || response;
        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
          (item) => {
            const parent2 = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];
            return listings.length === 0 ? [{ parent: parent2, listing: null }] : listings.map((l) => ({ parent: parent2, listing: l }));
          }
        );
        const matched = flattened.find(
          (m) => Number(m.parent.id) === numericPropertyId
        );
        if (!matched) {
          console.warn("Property not found");
          return;
        }
        const { parent, listing } = matched;
        const combinedProperty = {
          ...parent,
          ...listing,
          // Override specific fields cleanly
          id: parent.id,
          propertyId: parent.id,
          name: listing?.propertyName?.trim() || parent.propertyName,
          description: listing?.mainHeading || "",
          location: listing?.fullAddress || parent.address,
          city: listing?.city || parent.locationName,
          media: listing?.media?.length > 0 ? listing.media : parent.media || [],
          coordinates: parent.latitude && parent.longitude ? {
            lat: Number(parent.latitude),
            lng: Number(parent.longitude)
          } : null
        };
        setPropertyData(combinedProperty);
        const galleryRes = await getGalleryByPropertyId(parent.id);
        const rawGallery = galleryRes?.data?.content || galleryRes?.data || galleryRes || [];
        const filteredGallery = (Array.isArray(rawGallery) ? rawGallery : []).filter(
          (g) => g.isActive && g.media?.url && !g.vertical && // exclude vertical galleries
          (g.categoryName || "").toLowerCase() !== "3d"
        );
        setGalleryData(filteredGallery);
      } catch (err) {
        console.error("Restaurant Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [numericPropertyId]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      Navbar,
      {
        navItems: RESTAURANT_NAV_ITEMS,
        logo: siteContent.brand.logo_restaurant
      }
    ),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx("div", { id: "home", children: /* @__PURE__ */ jsx(
        ResturantBanner,
        {
          propertyData,
          galleryData,
          loading
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { id: "menu", children: [
        /* @__PURE__ */ jsx(
          ResturantSubCategories,
          {
            propertyId: numericPropertyId,
            propertyData
          }
        ),
        /* @__PURE__ */ jsx(EnhancedCulinaryCuration, { propertyId: numericPropertyId })
      ] }),
      /* @__PURE__ */ jsx("div", { id: "about", children: /* @__PURE__ */ jsx(AboutResturantPage, { propertyId: numericPropertyId }) }),
      /* @__PURE__ */ jsx("div", { id: "events", children: /* @__PURE__ */ jsx(ResturantpageEvents, { propertyId: numericPropertyId }) }),
      /* @__PURE__ */ jsx(AutoTestimonials, { propertyId: numericPropertyId }),
      /* @__PURE__ */ jsx("div", { id: "gallery", children: /* @__PURE__ */ jsx(RestaurantGalleryPage, { propertyId: numericPropertyId }) }),
      /* @__PURE__ */ jsx(ReservationForm, { propertyId: numericPropertyId })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "contact", children: /* @__PURE__ */ jsx(Footer, {}) })
  ] });
}
export {
  RestaurantHomepage as default
};
