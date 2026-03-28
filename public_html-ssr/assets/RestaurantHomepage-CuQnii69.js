import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef } from "react";
import { B as Button, S as Label, w as siteContent, O as OptimizedImage, U as restaurantEventShowcase, N as Navbar, F as Footer } from "../entry-server.js";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Menu, ChevronLeft, ChevronRight, Search, ChevronUp, UtensilsCrossed, MapPin, ChevronDown, Check, Grid3x3, Map, ArrowRight, Building2, Star, CalendarClock, ExternalLink, Tag, Clock, Phone, Sparkles, Users, ArrowUpRight, Edit2, User, Youtube, X, Video, Loader2, ImageIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
/* empty css                 */
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import "react-toastify";
import "react-hot-toast";
import "react-dom/server";
import "react-router";
import "@tanstack/react-query";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "@radix-ui/react-dialog";
import "cmdk";
import "axios";
import "@radix-ui/react-slot";
import "@radix-ui/react-avatar";
import "@radix-ui/react-label";
import "@heroicons/react/24/outline";
import "@heroicons/react/24/solid";
const SLIDES = [
  {
    id: 1,
    tag: "The Experience",
    title: "Culinary Artistry Across Asia",
    desc: "A curated journey through Chinese, Italian, and Indian Tandoor traditions.",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1600",
    isBYOB: false,
    bgTitle: "AUTHENTIC"
  },
  {
    id: 2,
    tag: "BYOB Friendly",
    title: "Your Choice, Our Expertise",
    desc: "Pair your favorite vintage with our signature Asian Fusion menu.",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600",
    isBYOB: true,
    bgTitle: "PREMIUM"
  },
  {
    id: 3,
    tag: "The Ambience",
    title: "Modern Spirit, Timeless Flavor",
    desc: "An elegant setting designed for intimate dinners and grand celebrations.",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600",
    isBYOB: false,
    bgTitle: "ELEGANCE"
  }
];
function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, 6e3);
    return () => window.clearInterval(timer);
  }, []);
  const goToSlide = (index) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  };
  const activeSlide = SLIDES[activeIndex];
  return /* @__PURE__ */ jsxs("section", { className: "relative h-[90vh] w-full overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 1.04 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.9, ease: "easeOut" },
        className: "absolute inset-0",
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: activeSlide.img,
              alt: activeSlide.title,
              className: "hidden h-full w-full object-cover md:block"
            }
          ),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: activeSlide.img,
              alt: activeSlide.title,
              className: "block h-full w-full object-cover md:hidden"
            }
          )
        ]
      },
      activeSlide.id
    ) }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 hidden bg-gradient-to-r from-black/80 via-black/40 to-transparent md:block" }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15 md:hidden" }),
    /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-1/4 hidden whitespace-nowrap text-[16rem] font-black italic text-white/[0.03] pointer-events-none md:block", children: activeSlide.bgTitle }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 hidden h-full items-center md:flex", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto flex h-full items-center px-8 md:px-16 lg:px-24", children: /* @__PURE__ */ jsxs("div", { className: "w-full md:w-[70%] xl:w-[60%]", children: [
      /* @__PURE__ */ jsx(
        motion.h1,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.15, duration: 0.8 },
          className: "mb-6 text-4xl font-serif font-medium leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl",
          children: activeSlide.title
        },
        `title-${activeSlide.id}`
      ),
      /* @__PURE__ */ jsx(
        motion.p,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.3, duration: 0.8 },
          className: "mb-10 max-w-2xl text-lg font-light uppercase tracking-[0.18em] text-white/85",
          children: activeSlide.desc
        },
        `desc-${activeSlide.id}`
      )
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 block md:hidden", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative w-full overflow-hidden bg-black",
        style: { height: "calc(75vw + 64px)", minHeight: "320px", maxHeight: "500px" },
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 overflow-hidden", style: { top: "64px" }, children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
            motion.img,
            {
              src: activeSlide.img,
              alt: activeSlide.title,
              initial: { opacity: 0, scale: 1.03 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0 },
              transition: { duration: 0.7 },
              className: "absolute inset-0 h-full w-full object-cover"
            },
            `mobile-${activeSlide.id}`
          ) }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 pointer-events-none", style: { top: "64px" }, children: /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent" }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "absolute inset-x-0 z-20 flex flex-col items-center justify-center px-5 text-center",
              style: { top: "64px", bottom: "2.5rem" },
              children: [
                /* @__PURE__ */ jsx(
                  motion.span,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.5 },
                    className: "mb-2 inline-flex rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md",
                    children: activeSlide.tag
                  },
                  `m-tag-${activeSlide.id}`
                ),
                /* @__PURE__ */ jsx(
                  motion.h1,
                  {
                    initial: { opacity: 0, y: 14 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.15, duration: 0.6 },
                    className: "mb-2 text-xl font-serif font-semibold leading-snug text-white drop-shadow-md",
                    children: activeSlide.title
                  },
                  `m-title-${activeSlide.id}`
                ),
                /* @__PURE__ */ jsx(
                  motion.p,
                  {
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.3, duration: 0.6 },
                    className: "mb-4 text-[11px] font-light uppercase tracking-[0.18em] text-white/75",
                    children: activeSlide.desc
                  },
                  `m-desc-${activeSlide.id}`
                ),
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, scale: 0.92 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { delay: 0.45, duration: 0.6 },
                    className: "flex flex-wrap items-center justify-center gap-3",
                    children: [
                      /* @__PURE__ */ jsxs(Button, { className: "h-auto rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-5 py-2 text-xs font-semibold text-gray-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)]", children: [
                        /* @__PURE__ */ jsx(Calendar, { className: "mr-2 h-3.5 w-3.5" }),
                        "Reserve"
                      ] }),
                      /* @__PURE__ */ jsxs(
                        Button,
                        {
                          variant: "outline",
                          className: "h-auto rounded-full border-white/30 bg-white/5 px-5 py-2 text-xs font-semibold text-white backdrop-blur-md",
                          children: [
                            /* @__PURE__ */ jsx(Menu, { className: "mr-2 h-3.5 w-3.5" }),
                            "Menu"
                          ]
                        }
                      )
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => goToSlide(activeIndex - 1),
                className: "flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5", children: SLIDES.map((_, index) => /* @__PURE__ */ jsx(
              "div",
              {
                onClick: () => goToSlide(index),
                className: `h-[3px] cursor-pointer rounded-full transition-all duration-500 ${activeIndex === index ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" : "w-4 bg-white/40 hover:bg-white/70"}`
              },
              `mob-dot-${index}`
            )) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => goToSlide(activeIndex + 1),
                className: "flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white/20",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" })
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "absolute bottom-48 right-4 z-20 hidden max-w-[calc(100vw-2rem)] flex-col items-end gap-4 md:flex md:right-8 lg:right-12", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-row items-end gap-2 overflow-hidden md:gap-3 lg:gap-4", children: SLIDES.map((slide, index) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: index * 0.12 + 0.35 },
          onClick: () => goToSlide(index),
          className: `group relative h-28 w-[67px] flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-500 ease-out md:h-[134px] md:w-[78px] lg:h-[179px] lg:w-28 ${activeIndex === index ? "z-10 scale-105 ring-2 ring-[#FDFBF7] shadow-2xl" : "grayscale opacity-60 hover:opacity-100 hover:grayscale-0"}`,
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: slide.img,
                alt: slide.title,
                className: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2 md:p-3", children: /* @__PURE__ */ jsx("p", { className: "truncate text-[10px] font-medium text-white/90 md:text-xs", children: slide.tag }) })
          ]
        },
        `thumbnail-${slide.id}`
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pr-2 md:gap-4 lg:gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 md:gap-2", children: SLIDES.map((_, index) => /* @__PURE__ */ jsx(
          "div",
          {
            onClick: () => goToSlide(index),
            className: `h-[3px] cursor-pointer rounded-full transition-all duration-500 ${activeIndex === index ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] md:w-10 lg:w-12" : "w-4 bg-white/30 hover:bg-white/60 md:w-5 lg:w-6"}`
          },
          `indicator-${index}`
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 md:gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => goToSlide(activeIndex - 1),
              className: "flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black md:h-10 md:w-10",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3 w-3 md:h-4 md:w-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => goToSlide(activeIndex + 1),
              className: "flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black md:h-10 md:w-10",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 md:h-4 md:w-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const BOOKING_TYPES = [
  { value: "dining", label: "Dining" },
  { value: "takeaway", label: "Takeaway" }
];
const LOCATIONS = [
  { value: "ghaziabad", label: "Ghaziabad" },
  { value: "noida", label: "Noida" },
  { value: "delhi", label: "Delhi" }
];
const RESTAURANTS$1 = [
  { id: 1, name: "Kennedia Blu Signature Dining", type: "dining", location: "ghaziabad", cuisine: "Asian Fusion", timing: "12:00 PM – 11:00 PM" },
  { id: 2, name: "Spicy Darbar", type: "dining", location: "ghaziabad", cuisine: "North Indian", timing: "01:00 PM – 11:30 PM" },
  { id: 3, name: "Luxury Family Lounge", type: "dining", location: "noida", cuisine: "Multi Cuisine", timing: "11:30 AM – 10:30 PM" },
  { id: 4, name: "Takeaway Treats Express", type: "takeaway", location: "ghaziabad", cuisine: "Quick Bites", timing: "11:00 AM – 10:00 PM" },
  { id: 5, name: "Italian Box Kitchen", type: "takeaway", location: "delhi", cuisine: "Italian", timing: "12:00 PM – 09:30 PM" },
  { id: 6, name: "City Wok Pickup", type: "takeaway", location: "noida", cuisine: "Chinese", timing: "12:30 PM – 10:00 PM" }
];
function CustomSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const selected = options.find((o) => o.value === value);
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((o) => !o),
        className: "flex h-12 w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors hover:border-zinc-300 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20",
        children: [
          /* @__PURE__ */ jsx("span", { className: selected ? "" : "text-zinc-400 dark:text-white/30", children: selected ? selected.label : placeholder }),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: `h-4 w-4 text-zinc-400 transition-transform duration-200 dark:text-white/30 ${open ? "rotate-180" : ""}`
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsx(
      motion.ul,
      {
        initial: { opacity: 0, y: -6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.15 },
        className: "absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-zinc-900",
        children: options.map((option) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              onChange(option.value);
              setOpen(false);
            },
            className: "flex w-full items-center justify-between px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-white/80 dark:hover:bg-white/5",
            children: [
              option.label,
              value === option.value && /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-primary" })
            ]
          }
        ) }, option.value))
      }
    ) })
  ] });
}
function RestaurantQuickBooking() {
  const [bookingType, setBookingType] = useState("");
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const handleTypeChange = (val) => {
    setBookingType(val);
    setIsOpen(false);
  };
  const handleLocChange = (val) => {
    setLocation(val);
    setIsOpen(false);
  };
  const matchingRestaurants = useMemo(() => {
    if (!bookingType || !location) return [];
    return RESTAURANTS$1.filter(
      (r) => r.type === bookingType && r.location === location
    );
  }, [bookingType, location]);
  const selectedTypeLabel = BOOKING_TYPES.find((o) => o.value === bookingType)?.label ?? "";
  const selectedLocLabel = LOCATIONS.find((o) => o.value === location)?.label ?? "";
  const canSearch = Boolean(bookingType && location);
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-white py-12 transition-colors duration-500 dark:bg-[#050505]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-8 select-none text-[6rem] font-black uppercase italic text-zinc-900/[0.03] dark:text-white/[0.02] md:text-[8rem]", children: "Quick Booking" }),
    /* @__PURE__ */ jsxs("div", { className: "container relative z-10 mx-auto px-6", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-7 max-w-3xl", children: /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-serif leading-tight text-zinc-900 dark:text-white md:text-3xl", children: [
        "Book Faster.",
        /* @__PURE__ */ jsx("span", { className: "italic text-zinc-400 dark:text-white/30", children: " Dine Smarter." })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-[1.5rem] border border-zinc-200 bg-white/80 p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40 md:p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "border-b border-zinc-200 pb-6 dark:border-white/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-[0.35em] text-primary", children: "Select Type" }),
              /* @__PURE__ */ jsx(
                CustomSelect,
                {
                  options: BOOKING_TYPES,
                  value: bookingType,
                  onChange: handleTypeChange,
                  placeholder: "Choose booking type"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold uppercase tracking-[0.35em] text-primary", children: "Select Location" }),
              /* @__PURE__ */ jsx(
                CustomSelect,
                {
                  options: LOCATIONS,
                  value: location,
                  onChange: handleLocChange,
                  placeholder: "Choose location"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => setIsOpen(true),
                disabled: !canSearch,
                className: "h-10 rounded-full bg-zinc-900 px-6 text-sm text-white transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-white",
                children: [
                  /* @__PURE__ */ jsx(Search, { className: "mr-2 h-4 w-4" }),
                  "Search"
                ]
              }
            ),
            /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.9 },
                transition: { duration: 0.15 },
                children: /* @__PURE__ */ jsxs(
                  Button,
                  {
                    onClick: () => setIsOpen(false),
                    variant: "outline",
                    className: "h-10 rounded-full border-zinc-200 px-6 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5",
                    children: [
                      /* @__PURE__ */ jsx(ChevronUp, { className: "mr-2 h-4 w-4" }),
                      "Hide"
                    ]
                  }
                )
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: isOpen && /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
            style: { overflow: "hidden" },
            children: /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500 dark:text-white/40", children: "Available Restaurants" }),
                  /* @__PURE__ */ jsxs("h3", { className: "mt-1.5 text-xl font-serif text-zinc-900 dark:text-white", children: [
                    selectedTypeLabel,
                    " in ",
                    selectedLocLabel
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-500 dark:text-white/50", children: [
                  matchingRestaurants.length,
                  " option",
                  matchingRestaurants.length === 1 ? "" : "s",
                  " available"
                ] })
              ] }),
              matchingRestaurants.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: matchingRestaurants.map((restaurant, index) => /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: index * 0.08, duration: 0.3 },
                  className: "flex min-h-[248px] flex-col justify-between rounded-[1.2rem] border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5",
                  children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
                        /* @__PURE__ */ jsx("span", { className: "inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary", children: selectedTypeLabel }),
                        /* @__PURE__ */ jsx(UtensilsCrossed, { className: "h-4 w-4 text-zinc-400 dark:text-white/40" })
                      ] }),
                      /* @__PURE__ */ jsx("h4", { className: "text-lg font-serif text-zinc-900 dark:text-white", children: restaurant.name }),
                      /* @__PURE__ */ jsxs("div", { className: "mt-2.5 space-y-1.5 text-sm text-zinc-600 dark:text-white/60", children: [
                        /* @__PURE__ */ jsx("p", { children: restaurant.cuisine }),
                        /* @__PURE__ */ jsx("p", { children: restaurant.timing }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-primary" }),
                          /* @__PURE__ */ jsx("span", { children: selectedLocLabel })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        onClick: () => document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" }),
                        className: "mt-5 h-10 rounded-full bg-zinc-900 text-sm text-white transition-all hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-white",
                        children: "Reserve"
                      }
                    )
                  ]
                },
                restaurant.id
              )) }) : /* @__PURE__ */ jsx("div", { className: "flex min-h-[160px] items-center justify-center rounded-[1.2rem] border border-dashed border-zinc-200 dark:border-white/10", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 dark:text-white/30", children: "No options available for this combination." }) })
            ] })
          },
          "cards"
        ) })
      ] })
    ] })
  ] });
}
const RESTAURANTS = [
  {
    id: 31,
    name: "Kennedia Blu Restaurant-Ghaziabad",
    heading: "Kennedia Blu Restaurant- Ghaziabad",
    city: "Ghaziabad",
    location: "Noor Nagar, Raj Nagar Extension, Ghaziabad, Uttar Pradesh 201003",
    type: "Restaurant",
    image: siteContent.images.cafes.highTea,
    rating: 4.5,
    description: "Premium dining experience with elegant interiors and signature multi-cuisine service.",
    cuisines: ["Fine Dining", "Family Dining", "Signature Service"],
    nearbyLocation: "Near Guldhar Metro Station (2KM)",
    email: "blukennedia@gmail.com",
    assignedAdmin: "Vishal bhardwaj",
    serviceHours: "Open Daily",
    coordinates: { lat: 28.6692, lng: 77.4538 }
  },
  {
    id: 32,
    name: "Kennedia Blu Rooftop Noida",
    heading: "Kennedia Blu Rooftop Dining - Noida",
    city: "Noida",
    location: "Sector 62, Noida, Uttar Pradesh",
    type: "Restaurant",
    image: siteContent.images.bars.rooftop,
    rating: 4.7,
    description: "Skyline dining setup with elevated evening service and a modern social atmosphere.",
    cuisines: ["Rooftop Dining", "Asian Grill", "Cocktail Lounge"],
    nearbyLocation: "Near Electronic City Metro",
    email: "noida@kennediablu.com",
    assignedAdmin: "Operations Team",
    serviceHours: "Open Daily",
    coordinates: { lat: 28.627, lng: 77.3649 }
  },
  {
    id: 33,
    name: "Kennedia Blu Brasserie Delhi",
    heading: "Kennedia Blu Brasserie - Delhi",
    city: "Delhi",
    location: "Connaught Place, New Delhi",
    type: "Restaurant",
    image: siteContent.images.cafes.parisian,
    rating: 4.6,
    description: "All-day dining format with polished cafe-brasserie service and curated plated offerings.",
    cuisines: ["Cafe Brasserie", "Bakery", "Continental"],
    nearbyLocation: "Near Rajiv Chowk Metro",
    email: "delhi@kennediablu.com",
    assignedAdmin: "City Team",
    serviceHours: "Open Daily",
    coordinates: { lat: 28.6315, lng: 77.2167 }
  },
  {
    id: 34,
    name: "Kennedia Blu Social Lounge Mumbai",
    heading: "Kennedia Blu Social Lounge - Mumbai",
    city: "Mumbai",
    location: "Bandra West, Mumbai, Maharashtra",
    type: "Restaurant",
    image: siteContent.images.bars.speakeasy,
    rating: 4.8,
    description: "An intimate dining and social lounge concept built around premium hosting and chef-driven menus.",
    cuisines: ["Chef's Table", "Fusion", "Social Lounge"],
    nearbyLocation: "Near Bandra Station",
    email: "mumbai@kennediablu.com",
    assignedAdmin: "Hospitality Desk",
    serviceHours: "Open Daily",
    coordinates: { lat: 19.0596, lng: 72.8295 }
  }
];
const popupStyles = `
  .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; box-shadow: 0 10px 25px rgba(0,0,0,.15); }
  .leaflet-popup-content { margin: 8px; min-width: 220px; }
  .leaflet-popup-tip, .custom-popup .leaflet-popup-close-button { display: none; }
`;
if (typeof document !== "undefined" && !document.querySelector("style[data-restaurant-leaflet-custom]")) {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = popupStyles;
  styleEl.setAttribute("data-restaurant-leaflet-custom", "true");
  document.head.appendChild(styleEl);
}
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}
const createMarkerIcon = (active = false) => new L.Icon({
  iconUrl: active ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: active ? [35, 57] : [25, 41],
  iconAnchor: active ? [17, 57] : [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
function RestaurantProperties() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("gallery");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const cities = useMemo(
    () => ["All Cities", ...new Set(RESTAURANTS.map((item) => item.city))],
    []
  );
  const filteredRestaurants = useMemo(() => {
    if (selectedCity === "All Cities") return RESTAURANTS;
    return RESTAURANTS.filter((item) => item.city === selectedCity);
  }, [selectedCity]);
  useEffect(() => setActiveIndex(0), [selectedCity]);
  useEffect(() => {
    if (viewMode !== "gallery" || isPaused || filteredRestaurants.length <= 1) return void 0;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => prev === filteredRestaurants.length - 1 ? 0 : prev + 1);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [filteredRestaurants.length, isPaused, viewMode]);
  const activeRestaurant = filteredRestaurants[activeIndex] || filteredRestaurants[0];
  if (!activeRestaurant) {
    return /* @__PURE__ */ jsx("section", { className: "py-6", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 lg:px-12", children: /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center text-muted-foreground", children: "No restaurants available." }) }) });
  }
  const scrollToReservation = () => {
    document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handlePrev = () => {
    setActiveIndex((prev) => prev === 0 ? filteredRestaurants.length - 1 : prev - 1);
  };
  const handleNext = () => {
    setActiveIndex((prev) => prev === filteredRestaurants.length - 1 ? 0 : prev + 1);
  };
  const visibleCards = filteredRestaurants.length <= 1 ? [{ index: 0, position: "center" }] : [
    { index: (activeIndex - 1 + filteredRestaurants.length) % filteredRestaurants.length, position: "left" },
    { index: activeIndex, position: "center" },
    { index: (activeIndex + 1) % filteredRestaurants.length, position: "right" }
  ];
  return /* @__PURE__ */ jsx("section", { className: "py-6 bg-gradient-to-br from-background via-secondary/5 to-background relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 lg:px-12", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-xl p-4 shadow-sm mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block", children: viewMode === "gallery" ? "Restaurant Collection" : "Explore By Map" }),
          /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-serif text-foreground", children: "Our Restaurants" })
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
              onClick: () => setShowCityDropdown((prev) => !prev),
              className: "flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full outline-none hover:border-primary/50 transition-colors text-xs shadow-sm",
              children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: selectedCity }),
                /* @__PURE__ */ jsx(ArrowRight, { className: `w-2.5 h-2.5 text-muted-foreground transition-transform ${showCityDropdown ? "rotate-90" : ""}` })
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
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-xs shadow-sm", children: [
          /* @__PURE__ */ jsx(Building2, { className: "w-3 h-3 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Restaurant" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs", children: [
          /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 text-primary fill-current" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
            filteredRestaurants.length,
            " Restaurants"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: viewMode === "gallery" ? /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 }, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 items-start", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative h-[500px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/20 border border-border shadow-xl", onMouseEnter: () => setIsPaused(true), onMouseLeave: () => setIsPaused(false), children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center perspective-[1200px]", children: visibleCards.map(({ index, position }) => {
          const restaurant = filteredRestaurants[index];
          const isCenter = position === "center";
          const isLeft = position === "left";
          return /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute transition-all duration-700 ease-out",
              style: {
                zIndex: isCenter ? 30 : 20,
                opacity: isCenter ? 1 : 0.55,
                transform: isCenter ? "translateX(0) rotateY(0deg)" : isLeft ? "translateX(-90%) rotateY(30deg)" : "translateX(90%) rotateY(-30deg)",
                transformStyle: "preserve-3d"
              },
              children: /* @__PURE__ */ jsx("div", { className: "w-[340px] max-w-[80vw] h-[380px] bg-card border-2 border-border rounded-2xl overflow-hidden shadow-2xl", children: /* @__PURE__ */ jsxs("div", { className: "relative h-full", children: [
                /* @__PURE__ */ jsx(OptimizedImage, { ...restaurant.image, className: "w-full h-full object-cover" }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
                isCenter && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg", children: [
                    /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 text-yellow-500 fill-current" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-gray-900", children: restaurant.rating })
                  ] }) }),
                  /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-5 text-white", children: [
                    /* @__PURE__ */ jsx("div", { className: "inline-block px-2.5 py-0.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm rounded border border-white/30", children: restaurant.type }),
                    /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-semibold mb-1", children: restaurant.name }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs opacity-90 mb-1.5", children: [
                      /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 mr-1" }),
                      restaurant.location
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] opacity-80 line-clamp-2 leading-relaxed", children: restaurant.description })
                  ] })
                ] })
              ] }) })
            },
            restaurant.id
          );
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40", children: [
          /* @__PURE__ */ jsx("button", { onClick: handlePrev, className: "w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg hover:scale-110 active:scale-95", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("div", { className: "px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full border border-border", children: /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold text-foreground", children: [
            activeIndex + 1,
            " / ",
            filteredRestaurants.length
          ] }) }),
          /* @__PURE__ */ jsx("button", { onClick: handleNext, className: "w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg hover:scale-110 active:scale-95", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 shadow-xl h-[500px] flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3.5 overflow-y-auto", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20", children: activeRestaurant.type }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 rounded-full border border-yellow-200", children: [
                /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 text-yellow-500 fill-current" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-yellow-900", children: activeRestaurant.rating })
              ] })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-semibold text-foreground mb-1.5 line-clamp-2", children: activeRestaurant.name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-muted-foreground mb-2.5 text-sm", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 mr-1.5" }),
              /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: activeRestaurant.location })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed line-clamp-3", children: activeRestaurant.description })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 pb-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-muted/30 px-3 py-3 text-center", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary mx-auto mb-1" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "City" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeRestaurant.city })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-muted/30 px-3 py-3 text-center", children: [
              /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 text-primary mx-auto mb-1" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Type" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeRestaurant.type })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-muted/30 px-3 py-3 text-center", children: [
              /* @__PURE__ */ jsx(CalendarClock, { className: "w-4 h-4 text-primary mx-auto mb-1" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rating" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeRestaurant.rating })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-foreground mb-2", children: "Available Highlights" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: activeRestaurant.cuisines.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: item })
            ] }, item)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2.5 mt-4", children: [
          /* @__PURE__ */ jsxs("button", { onClick: scrollToReservation, className: "w-full py-3 bg-primary text-primary-foreground font-bold uppercase rounded-lg shadow-md flex items-center justify-center gap-2 text-sm", children: [
            "Reserve Table ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: handleNext, className: "w-full py-2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors", children: "View Details →" })
        ] })
      ] })
    ] }) }, "gallery") : /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.3 }, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border-2 border-border rounded-2xl overflow-hidden shadow-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative h-[240px] overflow-hidden group", children: [
          /* @__PURE__ */ jsx(OptimizedImage, { ...activeRestaurant.image, className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" }),
          /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-3 right-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg", children: [
              /* @__PURE__ */ jsx(Star, { className: "w-3.5 h-3.5 text-yellow-500 fill-current" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-gray-900", children: activeRestaurant.rating })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "bg-primary/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg", children: /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-primary-foreground", children: [
              activeIndex + 1,
              " / ",
              filteredRestaurants.length
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4 text-white", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-white/90" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs opacity-90", children: activeRestaurant.location })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-serif font-bold mb-1", children: activeRestaurant.name }),
            /* @__PURE__ */ jsx("p", { className: "text-xs opacity-80 line-clamp-2", children: activeRestaurant.description })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: handlePrev, className: "absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("button", { onClick: handleNext, className: "absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg hover:scale-110 z-10", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary mx-auto mb-0.5" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "City" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeRestaurant.city })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 text-primary mx-auto mb-0.5" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Type" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeRestaurant.type })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-primary mx-auto mb-0.5 fill-current" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rating" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: activeRestaurant.rating })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-foreground mb-2", children: "Top Highlights" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: activeRestaurant.cuisines.map((item) => /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-secondary/50 rounded-full text-[10px] font-medium text-foreground", children: item }, item)) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mb-3 pb-3 border-b border-border bg-muted/20 rounded-lg p-2.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-foreground", children: "Nearby Landmark" }),
              /* @__PURE__ */ jsx("p", { className: "text-[8px] text-muted-foreground", children: "From response format" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-primary", children: activeRestaurant.nearbyLocation })
          ] }) }),
          /* @__PURE__ */ jsxs("button", { onClick: scrollToReservation, className: "w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg shadow-md text-sm", children: [
            "Reserve Now ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:sticky lg:top-6", children: /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-card", children: /* @__PURE__ */ jsxs(MapContainer, { center: [activeRestaurant.coordinates.lat, activeRestaurant.coordinates.lng], zoom: 11, scrollWheelZoom: true, className: "w-full h-full", style: { zIndex: 1 }, children: [
        /* @__PURE__ */ jsx(
          TileLayer,
          {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        ),
        /* @__PURE__ */ jsx(MapViewController, { center: [activeRestaurant.coordinates.lat, activeRestaurant.coordinates.lng], zoom: 11 }),
        filteredRestaurants.map((restaurant, index) => /* @__PURE__ */ jsx(
          Marker,
          {
            position: [restaurant.coordinates.lat, restaurant.coordinates.lng],
            icon: createMarkerIcon(index === activeIndex),
            eventHandlers: { click: () => setActiveIndex(index) },
            children: /* @__PURE__ */ jsx(Popup, { closeButton: false, className: "custom-popup", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 min-w-[200px]", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx("p", { className: "font-serif text-sm font-bold", children: restaurant.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full", children: [
                  /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 text-yellow-500 fill-current" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: restaurant.rating })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 mr-1 text-red-500" }),
                /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: restaurant.location })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1 border-t", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold", children: "Open" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-primary", children: restaurant.serviceHours })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: scrollToReservation, className: "w-full text-xs bg-primary text-primary-foreground font-bold py-2 rounded", children: "Reserve Table" })
            ] }) })
          },
          restaurant.id
        ))
      ] }) }) })
    ] }) }, "map") })
  ] }) });
}
function OfferCard({ offer, index }) {
  const media = offer.image;
  const isVideo = media?.type === "VIDEO";
  const isReel = !!media?.width && !!media?.height && media.width / media.height <= 0.85;
  const showFullMedia = isVideo || isReel;
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { delay: index * 0.08 },
      className: "group relative flex h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative overflow-hidden bg-card ${showFullMedia ? "h-full" : "h-[280px]"}`,
            children: [
              isVideo ? /* @__PURE__ */ jsx(
                "video",
                {
                  src: media?.src,
                  className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                  autoPlay: true,
                  muted: true,
                  loop: true,
                  playsInline: true
                }
              ) : /* @__PURE__ */ jsx(
                "img",
                {
                  src: media?.src,
                  alt: media?.alt || offer.title,
                  className: "h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute left-3 top-3 z-10 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white", children: "Offer" }),
              /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsx("span", { children: offer.location })
              ] }) })
            ]
          }
        ),
        showFullMedia ? /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 text-sm font-bold text-white", children: offer.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-[10px] text-white/80", children: offer.description })
          ] }),
          /* @__PURE__ */ jsx("a", { href: offer.link || "#", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxs(Button, { className: "h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-primary/90", children: [
            offer.ctaText || "View Offer",
            /* @__PURE__ */ jsx(ExternalLink, { className: "ml-2 h-3.5 w-3.5" })
          ] }) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 font-serif text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary", children: offer.title }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Tag, { size: 12, className: "text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium italic uppercase", children: offer.couponCode || "Exclusive Offer" })
          ] }),
          offer.availableHours && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Clock, { size: 12, className: "text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium italic uppercase", children: offer.availableHours })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-3 text-[11px] italic text-muted-foreground", children: offer.description }),
          /* @__PURE__ */ jsx("div", { className: "mt-auto border-t border-muted pt-4", children: /* @__PURE__ */ jsx("a", { href: offer.link || "#", target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxs(Button, { className: "h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-primary/90", children: [
            offer.ctaText || "View Offer",
            /* @__PURE__ */ jsx(ExternalLink, { className: "ml-2 h-3.5 w-3.5" })
          ] }) }) })
        ] })
      ]
    }
  );
}
function RestaurantOffers() {
  const [swiper, setSwiper] = useState(null);
  const offers = siteContent?.text?.dailyOffers?.offers || [];
  if (!offers.length) return null;
  return /* @__PURE__ */ jsx("section", { id: "offers", className: "bg-muted py-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-serif", children: siteContent?.text?.dailyOffers?.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => swiper?.slidePrev(),
            className: "rounded-full p-2 transition-colors hover:bg-white/50",
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => swiper?.slideNext(),
            className: "rounded-full p-2 transition-colors hover:bg-white/50",
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
        children: offers.map((offer, index) => /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx(OfferCard, { offer, index }) }, `${offer.title}-${index}`))
      }
    )
  ] }) });
}
const ABOUT_SECTIONS = [
  {
    id: 1,
    subTitle: "Ghaziabad Destination",
    sectionTitle: "A Symphony of Fine Flavors",
    description: "We believe dining is more than just a meal — it's a curated premium experience designed to ground you in the moment. Our philosophy balances the bold spices of Indian tradition with the refined elegance of global favorites, all within a thoughtfully designed BYOB setting.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
    recognitions: [
      { id: 1, value: "11 AM", title: "Opens Daily", subTitle: "Serving guests every day from morning to night", isActive: true },
      { id: 2, value: "₹899", title: "Lunch Buffet", subTitle: "Grand spread served daily from 12 PM to 4 PM", isActive: true },
      { id: 3, value: "BYOB", title: "Premium Setting", subTitle: "Bring your own bottle — curated bar ambience", isActive: true }
    ],
    isActive: true
  },
  {
    id: 2,
    subTitle: "Signature Experience",
    sectionTitle: "Where Heritage Meets Modern Craft",
    description: "Our chefs bring decades of mastery to every plate, blending age-old family recipes with contemporary presentation. Each visit is a new chapter in a story written with saffron, smoke, and seasonal produce sourced from local farms.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
    recognitions: [
      { id: 4, value: "50+", title: "Menu Items", subTitle: "Rotating seasonal specials added every month", isActive: true },
      { id: 5, value: "4.8★", title: "Guest Rating", subTitle: "Consistently rated across platforms", isActive: true },
      { id: 6, value: "15yr", title: "Legacy", subTitle: "Serving the region since our founding", isActive: true }
    ],
    isActive: true
  }
];
function AboutRestaurant() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);
  useEffect(() => {
    setCurrentRecognitionIndex(0);
  }, [currentIndex]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ABOUT_SECTIONS.length);
    }, 5e3);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const recognitions2 = ABOUT_SECTIONS[currentIndex].recognitions.filter((r) => r.isActive);
    if (recognitions2.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentRecognitionIndex((prev) => (prev + 1) % recognitions2.length);
    }, 2e3);
    return () => clearInterval(timer);
  }, [currentIndex]);
  const section = ABOUT_SECTIONS[currentIndex];
  section.recognitions.filter((r) => r.isActive);
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "about",
      className: "py-8 px-6 bg-white transition-colors duration-500 dark:bg-[#050505]",
      children: /* @__PURE__ */ jsx("div", { className: "container mx-auto max-w-7xl", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 items-center", children: [
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -50 },
            whileInView: { opacity: 1, x: 0 },
            viewport: { once: true },
            className: "relative",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "aspect-[4/3] rounded-xl overflow-hidden relative z-10 border border-zinc-200/10 dark:border-white/10 shadow-2xl", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: section.image,
                    alt: section.sectionTitle,
                    className: "w-full h-full object-cover"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "absolute -bottom-4 -right-4 w-2/3 h-2/3 border-2 border-primary/20 rounded-xl -z-0" }),
              /* @__PURE__ */ jsx("div", { className: "absolute -top-4 -left-4 w-1/2 h-1/2 bg-zinc-100/80 dark:bg-white/5 rounded-xl -z-0" })
            ]
          },
          `about-image-${currentIndex}`
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative lg:pl-4", children: [
          /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: 20 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -20 },
              transition: { duration: 0.5 },
              className: "space-y-4",
              children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("h3", { className: "text-primary text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3" }),
                    section.subTitle
                  ] }),
                  /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-serif text-zinc-900 dark:text-white leading-tight mb-3", children: section.sectionTitle })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-zinc-500 dark:text-white/60 leading-relaxed text-base font-light", children: section.description }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6 pt-2 border-t border-zinc-200 dark:border-white/10", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("h4", { className: "text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 text-primary" }),
                      " Availability"
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-zinc-900 dark:text-white font-serif text-base italic leading-tight", children: "11:00 AM — 11:30 PM" }),
                    /* @__PURE__ */ jsx("p", { className: "text-zinc-400 dark:text-white/30 text-[10px] mt-1 font-bold tracking-tighter", children: "MONDAY — SUNDAY" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("h4", { className: "text-zinc-400 dark:text-white/40 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsx(Phone, { className: "w-3 h-3 text-primary" }),
                      " Connect"
                    ] }),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "tel:+919999999999",
                        className: "text-zinc-900 dark:text-white font-serif text-base italic block hover:text-primary transition-colors",
                        children: "+91 999 999 9999"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-zinc-400 dark:text-white/30 text-[10px] font-bold tracking-tighter uppercase", children: "Direct Reservation" })
                  ] })
                ] })
              ]
            },
            currentIndex
          ) }),
          ABOUT_SECTIONS.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 mt-6", children: ABOUT_SECTIONS.map((_, idx) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setCurrentIndex(idx),
              className: `h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-primary w-6" : "bg-zinc-200 dark:bg-white/10 w-3 hover:bg-primary/50"}`
            },
            idx
          )) })
        ] })
      ] }) })
    }
  );
}
const groupBookingItems = [
  {
    id: 1,
    title: "Private Dining Celebrations",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    title: "Corporate Lunch Packages",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    title: "Festive Group Reservations",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80"
  }
];
function EventCard({ event, index }) {
  const media = event.media;
  const isVideo = media?.type === "VIDEO";
  const isReel = !!media?.width && !!media?.height && media.width / media.height <= 0.85;
  const showFullMedia = isVideo || isReel;
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { delay: index * 0.08 },
      className: "group relative flex h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative overflow-hidden bg-card ${showFullMedia ? "h-full" : "h-[280px]"}`,
            children: [
              isVideo ? /* @__PURE__ */ jsx(
                "video",
                {
                  src: media?.src,
                  className: `h-full w-full transition-transform duration-500 group-hover:scale-105 ${isReel ? "object-cover" : "object-cover"}`,
                  autoPlay: true,
                  muted: true,
                  loop: true,
                  playsInline: true
                }
              ) : /* @__PURE__ */ jsx(
                "img",
                {
                  src: media?.src,
                  alt: media?.alt || event.title,
                  className: `h-full w-full transition-transform duration-500 group-hover:scale-105 ${showFullMedia ? "object-cover" : "object-cover object-center"}`
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute left-3 top-3 z-10 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white", children: isVideo ? "Reel" : "Event" }),
              /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsx("span", { children: event.location })
              ] }) })
            ]
          }
        ),
        showFullMedia ? /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 text-sm font-bold text-white", children: event.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-[10px] text-white/80", children: event.description })
          ] }),
          /* @__PURE__ */ jsx(Link, { to: `/events/${event.slug}`, children: /* @__PURE__ */ jsxs(Button, { className: "h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-primary/90", children: [
            "View Event ",
            /* @__PURE__ */ jsx(ExternalLink, { className: "ml-2 h-3.5 w-3.5" })
          ] }) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 font-serif text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary", children: event.title }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Calendar, { size: 12, className: "text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium italic uppercase", children: event.date })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-3 text-[11px] italic text-muted-foreground", children: event.description }),
          /* @__PURE__ */ jsx("div", { className: "mt-auto border-t border-muted pt-4", children: /* @__PURE__ */ jsx(Link, { to: `/events/${event.slug}`, children: /* @__PURE__ */ jsxs(Button, { className: "h-auto w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-primary/90", children: [
            "View Event ",
            /* @__PURE__ */ jsx(ExternalLink, { className: "ml-2 h-3.5 w-3.5" })
          ] }) }) })
        ] })
      ]
    }
  );
}
function EventsSchedule() {
  const [swiper, setSwiper] = useState(null);
  const events = restaurantEventShowcase?.items || [];
  return /* @__PURE__ */ jsx("section", { id: "events", className: "bg-muted py-10", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-[92%] max-w-7xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-serif md:text-3xl", children: "Events & Group Bookings" }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto mt-3 h-0.5 w-16 bg-primary" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-lg font-serif font-semibold", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
            restaurantEventShowcase?.title
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => swiper?.slidePrev(),
                className: "rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted",
                children: /* @__PURE__ */ jsx(ChevronLeft, { size: 18 })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => swiper?.slideNext(),
                className: "rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted",
                children: /* @__PURE__ */ jsx(ChevronRight, { size: 18 })
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
              1024: { slidesPerView: 2.2 }
            },
            autoplay: {
              delay: 5e3,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            },
            onSwiper: setSwiper,
            className: "!pb-2",
            children: events.map((event, index) => /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx(EventCard, { event, index }) }, event.slug || event.title))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col rounded-2xl border bg-card p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-serif font-semibold", children: "Group Booking" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: groupBookingItems.map((item) => /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 16 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            className: "group overflow-hidden rounded-xl border border-border bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-md",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/30 bg-muted shadow-sm", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.image,
                  alt: item.title,
                  className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                }
              ) }),
              /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsx("h4", { className: "line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary", children: item.title }) }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  size: "icon",
                  className: "h-10 w-10 shrink-0 rounded-full",
                  children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                }
              )
            ] })
          },
          item.id
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "relative mt-4 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900/10 via-white/55 to-amber-50/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-2xl", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-slate-900/5" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-white/70" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -left-12 top-8 h-32 w-32 rounded-full bg-rose-200/35 blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "absolute right-[-20px] top-10 h-36 w-36 rounded-full bg-slate-400/20 blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-18px] right-8 h-36 w-36 rounded-full bg-amber-200/35 blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-10 left-8 h-24 w-24 rounded-full bg-sky-200/25 blur-3xl" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-2xl ring-1 ring-black/5" })
        ] })
      ] })
    ] })
  ] }) });
}
const restaurantNewsItems = [
  {
    id: 1,
    category: "Restaurant",
    title: "Kennedia Introduces A Curated Seasonal Tasting Menu",
    description: "The restaurant unveils a new chef-led tasting experience built around regional produce, plated courses, and elevated evening service.",
    dateBadge: "2026-02-18",
    badgeType: "Press Release",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-seasonal-tasting-menu",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant"
  },
  {
    id: 2,
    category: "Restaurant",
    title: "Weekend Brunch Program Expands With Live Kitchen Counters",
    description: "A refreshed brunch format brings interactive stations, dessert theatre, and family-style sharing platters to the weekend offering.",
    dateBadge: "2026-01-26",
    badgeType: "Feature",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-weekend-brunch-program",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant"
  },
  {
    id: 3,
    category: "Restaurant",
    title: "Private Dining Experiences Gain New Celebration Packages",
    description: "Kennedia adds compact celebration formats for anniversaries, birthdays, and executive dining with pre-set menus and decor options.",
    dateBadge: "2025-12-14",
    badgeType: "Update",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-private-dining-packages",
    imageUrl: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant"
  },
  {
    id: 4,
    category: "Restaurant",
    title: "Signature Beverage Pairings Roll Out Across Evening Service",
    description: "A new pairing program highlights house beverages and chef recommendations designed to complement small plates and signature mains.",
    dateBadge: "2025-11-03",
    badgeType: "Editorial",
    ctaText: "Read Story",
    ctaLink: "/news/kennedia-signature-beverage-pairings",
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
    type: "Restaurant"
  }
];
const STYLE_CONFIG = {
  navigation: {
    buttonSize: "w-8 h-8",
    iconSize: "w-4 h-4"
  }
};
function NavBtn({ onClick, icon, label }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: `${STYLE_CONFIG.navigation.buttonSize} flex items-center justify-center rounded-full border border-border text-foreground transition-all hover:bg-primary hover:text-primary-foreground`,
      "aria-label": label,
      children: icon
    }
  );
}
function SectionHeader({ title, onPrev, onNext }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-serif text-foreground md:text-3xl", children: title }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/news",
          className: "hidden items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5 md:flex",
          children: [
            "View All ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          NavBtn,
          {
            onClick: onPrev,
            icon: /* @__PURE__ */ jsx(ChevronLeft, { className: STYLE_CONFIG.navigation.iconSize }),
            label: "Previous"
          }
        ),
        /* @__PURE__ */ jsx(
          NavBtn,
          {
            onClick: onNext,
            icon: /* @__PURE__ */ jsx(ChevronRight, { className: STYLE_CONFIG.navigation.iconSize }),
            label: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function NewsCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(item.dateBadge).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxs("div", { className: "group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/50", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full overflow-hidden bg-black", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: item.imageUrl,
          alt: item.title,
          className: "block h-auto w-full object-contain transition-transform duration-700 group-hover:scale-105",
          style: { maxHeight: "280px", minHeight: "140px" }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute left-3 top-3", children: /* @__PURE__ */ jsx("span", { className: "rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md", children: date }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-grow flex-col p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 text-xs font-bold uppercase tracking-wider text-primary", children: [
        item.category,
        " • ",
        item.badgeType
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "mb-3 line-clamp-2 text-lg font-serif font-bold leading-tight text-foreground transition-colors group-hover:text-primary", children: item.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex-grow", children: [
        /* @__PURE__ */ jsx(
          "p",
          {
            className: `text-sm leading-relaxed text-muted-foreground transition-all duration-300 ${expanded ? "" : "line-clamp-2"}`,
            children: item.description
          }
        ),
        item.description && item.description.length > 100 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            },
            className: "mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline",
            children: expanded ? /* @__PURE__ */ jsxs(Fragment, { children: [
              "Show less ",
              /* @__PURE__ */ jsx(ChevronUp, { className: "h-3 w-3" })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Show more ",
              /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 border-t border-border/50 pt-2", children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: item.ctaLink,
          className: "group/link inline-flex items-center gap-1.5 pt-2 text-xs font-bold text-foreground transition-colors hover:text-primary",
          children: [
            item.ctaText,
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" })
          ]
        }
      ) })
    ] })
  ] });
}
function RestaurantNewsSection() {
  const swiperRef = useRef(null);
  const newsItems = restaurantNewsItems.filter(
    (item) => item.type === "Restaurant"
  );
  return /* @__PURE__ */ jsx(
    "section",
    {
      id: "news",
      className: "relative overflow-hidden bg-background py-12 md:py-16",
      children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 lg:px-12", children: [
        /* @__PURE__ */ jsx(
          SectionHeader,
          {
            title: "Restaurant News & Press",
            onPrev: () => swiperRef.current?.slidePrev(),
            onNext: () => swiperRef.current?.slideNext()
          }
        ),
        /* @__PURE__ */ jsx(
          Swiper,
          {
            modules: [Autoplay, Navigation],
            spaceBetween: 24,
            slidesPerView: 1,
            loop: newsItems.length > 3,
            autoplay: { delay: 5e3, disableOnInteraction: false },
            breakpoints: {
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            },
            onSwiper: (swiper) => {
              swiperRef.current = swiper;
            },
            className: "w-full pb-4",
            children: newsItems.map((item) => /* @__PURE__ */ jsx(SwiperSlide, { className: "!h-auto", children: /* @__PURE__ */ jsx(NewsCard, { item }) }, item.id))
          }
        )
      ] })
    }
  );
}
const sectionHeader = {
  sectionTag: "Guest Impressions",
  title: "Dining Moments Worth Returning For"
};
const ratingHeader = {
  description: "Average guest dining rating",
  rating: 5
};
const guestReviews = [
  {
    id: 1,
    author: "Ritika Sharma",
    description: "The tasting menu felt polished from start to finish. Every course arrived with perfect pacing and the dessert service was especially memorable.",
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    author: "Arjun Mehta",
    description: "We booked a family dinner here and the team handled the table setup, recommendations, and service flow exceptionally well.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    author: "Sneha Kapoor",
    description: "The live kitchen counters and beverage pairings made brunch feel premium without becoming overly formal. Strong repeat-visit energy.",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    author: "Kabir Sethi",
    description: "Private dining for our celebration was executed cleanly. The ambience, plating, and staff attentiveness stood out throughout the evening.",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
  }
];
function RestaurantGuestReviews() {
  const swiperRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUploading] = useState(false);
  const hasContent = feedbackText || mediaPreviews.length > 0 || ytLink.trim();
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
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setFeedbackText("");
    setMediaPreviews([]);
    setYtLink("");
    setIsVerified(false);
    setAuthorName("");
    setEmail("");
    setPhone("");
  };
  return /* @__PURE__ */ jsxs("section", { id: "reviews", className: "bg-background py-12", children: [
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-col items-stretch gap-6 lg:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex w-full min-w-0 flex-col rounded-2xl border bg-card p-6 shadow-sm lg:w-3/4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 text-xs font-bold uppercase tracking-widest text-primary", children: sectionHeader.sectionTag }),
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-serif font-bold italic", children: sectionHeader.title })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-1 flex items-center justify-end gap-1 text-primary", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(
              Star,
              {
                size: 14,
                className: i < ratingHeader.rating ? "fill-primary text-primary" : "text-primary/20"
              },
              i
            )) }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-tighter", children: ratingHeader.description })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full flex-grow overflow-hidden", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
          Swiper,
          {
            modules: [Autoplay, Navigation],
            spaceBetween: 15,
            slidesPerView: 1.2,
            breakpoints: { 768: { slidesPerView: 3 } },
            autoplay: { delay: 6e3, disableOnInteraction: false },
            onSwiper: (s) => {
              swiperRef.current = s;
            },
            onMouseEnter: () => {
              swiperRef.current?.autoplay?.stop();
            },
            onMouseLeave: () => {
              swiperRef.current?.autoplay?.start();
            },
            className: "h-full w-full",
            children: guestReviews.map((item) => /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx("div", { className: "group flex h-full flex-col overflow-hidden rounded-xl border bg-background", children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-[3/4] overflow-hidden bg-muted", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.imageUrl,
                  alt: item.author,
                  className: "h-full w-full object-cover"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/25 to-transparent p-4", children: [
                /* @__PURE__ */ jsxs("p", { className: "line-clamp-4 text-base italic text-white", children: [
                  '"',
                  item.description,
                  '"'
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white", children: item.author })
              ] })
            ] }) }) }, item.id))
          }
        ) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex w-full flex-col lg:w-1/4", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full w-full flex-col rounded-2xl border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold", children: "Share Experience" }),
          hasContent && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowPopup(true),
              className: "rounded-full p-1 text-primary hover:bg-primary/10",
              children: /* @__PURE__ */ jsx(Edit2, { size: 16 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-full bg-white p-2 text-red-400 shadow-sm", children: /* @__PURE__ */ jsx(User, { size: 18 }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase leading-none text-red-400", children: "Posting as" }),
            /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-bold text-gray-800", children: authorName || "Guest User" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: feedbackText,
            onChange: (e) => setFeedbackText(e.target.value),
            placeholder: "Tell us about your dining experience...",
            className: "mb-3 w-full flex-grow resize-none rounded-xl border-none bg-secondary/20 p-4 text-sm outline-none focus:ring-1 focus:ring-primary"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-transparent bg-secondary/20 px-3 py-2.5 transition-all focus-within:border-primary/40 focus-within:bg-white", children: [
          /* @__PURE__ */ jsx(
            Youtube,
            {
              size: 15,
              className: ytLink ? "text-red-500" : "text-muted-foreground"
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
        mediaPreviews.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-3 grid grid-cols-4 gap-2", children: mediaPreviews.map((m, i) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative aspect-square overflow-hidden rounded-lg border",
            children: [
              m.type === "image" ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: m.url,
                  alt: "",
                  className: "h-full w-full object-cover"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-black", children: /* @__PURE__ */ jsx(Video, { size: 12, className: "text-white" }) }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setMediaPreviews(
                    (prev) => prev.filter((_, idx) => idx !== i)
                  ),
                  className: "absolute right-0 top-0 bg-black/50 text-white",
                  children: /* @__PURE__ */ jsx(X, { size: 10 })
                }
              )
            ]
          },
          i
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => fileInputRef.current?.click(),
              className: "flex-grow rounded-xl bg-secondary/40 py-2.5 text-xs font-bold transition-colors hover:bg-secondary/60",
              children: /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                mediaUploading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(ImageIcon, { size: 16 }),
                "Media"
              ] })
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
            className: "w-full rounded-xl bg-[#f88d8d] py-4 text-sm font-bold text-white shadow-md transition-all active:scale-95 hover:bg-[#f67a7a] disabled:opacity-50",
            children: isSubmitting ? /* @__PURE__ */ jsx(Loader2, { className: "mx-auto animate-spin", size: 20 }) : "Submit Story"
          }
        )
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showPopup && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { scale: 0.9 },
        animate: { scale: 1 },
        className: "w-full max-w-sm rounded-2xl border bg-card p-8 shadow-2xl",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
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
                className: "w-full rounded-lg bg-muted p-3 outline-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "Email",
                className: "w-full rounded-lg bg-muted p-3 outline-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                placeholder: "Phone",
                maxLength: 10,
                className: "w-full rounded-lg bg-muted p-3 outline-none"
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
                className: "w-full rounded-lg bg-primary py-3 font-bold text-white",
                children: "Save & Continue"
              }
            )
          ] })
        ]
      }
    ) }) })
  ] });
}
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "EVENTS", key: "events", href: "#events" },
  // { type: "link", label: "NEWS", key: "news", href: "#news" },
  // { type: "link", label: "REVIEWS", key: "reviews", href: "#reviews" },
  {
    type: "link",
    label: "RESERVATION",
    key: "reservation",
    href: "#reservation"
  }
  // { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];
function RestaurantHomepage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background [scrollbar-gutter:stable]", children: [
    /* @__PURE__ */ jsx(
      Navbar,
      {
        navItems: RESTAURANT_NAV_ITEMS,
        logo: siteContent.brand.logo_restaurant
      }
    ),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx("div", { id: "home", children: /* @__PURE__ */ jsx(HeroBanner, {}) }),
      /* @__PURE__ */ jsx(RestaurantQuickBooking, {}),
      /* @__PURE__ */ jsx(RestaurantProperties, {}),
      /* @__PURE__ */ jsx(AboutRestaurant, {}),
      /* @__PURE__ */ jsx(RestaurantOffers, {}),
      /* @__PURE__ */ jsx(EventsSchedule, {}),
      /* @__PURE__ */ jsx(RestaurantNewsSection, {}),
      /* @__PURE__ */ jsx(RestaurantGuestReviews, {})
    ] }),
    /* @__PURE__ */ jsx("div", { id: "contact", children: /* @__PURE__ */ jsx(Footer, {}) })
  ] });
}
export {
  RestaurantHomepage as default
};
