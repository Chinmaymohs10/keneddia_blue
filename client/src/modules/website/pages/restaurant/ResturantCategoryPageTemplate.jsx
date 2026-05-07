import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Facebook,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
  Sparkles,
  Twitter,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import CategoryHero from "./components/shared/CategoryHero";
import CategoryMenu from "./components/shared/CategoryMenu";
import ResturantpageEvents from "./resturantpage/ResturantpageEvents";
import Testimonials from "./components/Testimonials";
import ReservationForm from "./components/ReservationForm";
import { getAllVerticalCards, getMenuItemsByPropertyId } from "@/Api/RestaurantApi";
import { getPropertyPetPoojaByPropertyId, fetchPetPoojaMenus } from "@/Api/externalApi";
import PetPoojaMenu from "./components/shared/PetPoojaMenu";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import { useSsrData } from "@/ssr/SsrDataContext";
import {
  GetAllPropertyDetails,
  getDailyOffers,
  searchGallery,
} from "@/Api/Api";

/* Navigation for Category Page */
const resturant_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "/" },
  { type: "link", label: "MENU", href: "#menu" },
  { type: "link", label: "CONTACT", href: "#contact" },
  { type: "link", label: "RESERVATION", href: "#ReservationForm" },
];

const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, "-");

const CARD_BG_COLORS = [
  { bgColor: "bg-orange-50", hoverBg: "hover:bg-orange-100" },
  { bgColor: "bg-blue-50",   hoverBg: "hover:bg-blue-100"   },
  { bgColor: "bg-red-50",    hoverBg: "hover:bg-red-100"    },
  { bgColor: "bg-emerald-50",hoverBg: "hover:bg-emerald-100"},
];

function buildMenuFromApi(allItems, currentVerticalId) {
  if (!allItems?.length || !currentVerticalId) return [];

  const matched = allItems.filter(
    (item) =>
      item.verticalCardResponseDTO?.id === currentVerticalId ||
      item.verticalCardId === currentVerticalId,
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
      status: item.status,
    });
  });

  return Object.entries(groups).map(([typeName, group]) => ({
    category: typeName,
    itemTypeId: group.typeId,
    categoryImage: group.items[0]?.image || "",
    items: group.items,
  }));
}

/* ── Dark mode hook ───────────────────────────────────────────────────────── */
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

/* ── Card style resolver ──────────────────────────────────────────────────── */
function resolveCardStyle(exp, index, isDark) {
  // Dark mode: always static zinc surface regardless of any hex color
  if (isDark) {
    return {
      style: {},
      className: `bg-zinc-800/80 hover:bg-zinc-700/90`,
    };
  }
  // Light mode: use hex inline style if available
  if (exp.isHexColor && exp.lightBgColor) {
    return {
      style: { backgroundColor: exp.lightBgColor },
      className: "",
    };
  }
  const fallback = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
  return {
    style: {},
    className: `${exp.bgColor || fallback.bgColor} ${exp.hoverBg || fallback.hoverBg}`,
  };
}

/* ── Other Verticals Grid ─────────────────────────────────────────────────── */
function OtherVerticalsSection({
  experiences,
  propertyId,
  citySlug,
  propertyName,
}) {
  const navigate = useNavigate();
  const isDark = useIsDark();
  const propertySlug = createHotelSlug(propertyName || "restaurant", propertyId);

  if (!experiences || experiences.length === 0) return null;

  return (
    <section className="py-10 lg:py-20 bg-white dark:bg-[#080808]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-primary text-[11px] font-bold uppercase tracking-[0.4em]">
              Explore More
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 dark:text-white tracking-tight">
            Other <span className="italic text-primary">Verticals</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {experiences.map((exp, index) => {
            const { style, className } = resolveCardStyle(exp, index, isDark);

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  navigate(`/${citySlug}/${propertySlug}/${exp.slug}`)
                }
                style={style}
                className={`
                  group cursor-pointer relative flex transition-all duration-500 hover:shadow-2xl
                  ${className}
                  w-full p-4 rounded-2xl flex-row items-center border border-zinc-100 dark:border-white/10 shadow-sm
                  lg:flex-col lg:items-center lg:text-center lg:p-10 lg:rounded-[2.5rem] lg:w-[calc(25%-1.5rem)] lg:min-h-[420px] lg:hover:border-primary/20
                `}
              >
                {/* Circular image */}
                <div className="shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-zinc-600 shadow-lg z-20 transition-transform duration-500 group-hover:scale-110 w-14 h-14 lg:w-28 lg:h-28 lg:mb-8">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                  />
                </div>

                <div className="flex flex-col grow px-4 lg:px-0">
                  <h3 className="text-lg lg:text-3xl font-serif text-zinc-950 dark:text-zinc-100 group-hover:text-primary transition-colors tracking-tight">
                    {exp.title}
                  </h3>
                  <p className="hidden lg:block text-zinc-700 dark:text-zinc-400 text-sm leading-relaxed mt-4 mb-6 line-clamp-4 font-light">
                    {exp.description}
                  </p>
                  <div className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                    <ChevronRight size={20} />
                  </div>
                  <div className="hidden lg:flex mt-auto items-center justify-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <ChevronRight size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                      Explore Vertical
                    </span>
                    {exp.ctaButtonText && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(exp.link || "#");
                        }}
                        className="px-3 py-2 text-[10px] font-light uppercase tracking-wider bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-all"
                      >
                        {exp.ctaButtonText}
                      </button>
                    )}
                  </div>
                </div>

                <span className="hidden lg:block absolute bottom-8 right-10 text-7xl font-black text-zinc-900/[0.03] dark:text-white/[0.04] italic select-none">
                  0{index + 1}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatOfferExpiry(expiresAt) {
  if (!expiresAt) return "";

  const parsed = new Date(`${expiresAt}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PropertyOffersHero({ offers, currentCategory, propertyData, propertyId, citySlug }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showShareReactions, setShowShareReactions] = useState(false);
  const total = offers.length;
  const activeOffer = offers[activeIndex];
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const restaurantPath = `/${citySlug}/${createHotelSlug(
    propertyData?.propertyName || propertyData?.name || "restaurant",
    propertyId,
  )}`;

  const location = useMemo(() => {
    if (!propertyData) return "";
    return (
      propertyData.fullAddress ??
      propertyData.address ??
      propertyData.location ??
      ""
    );
  }, [propertyData]);

  const city = useMemo(() => {
    if (!propertyData) return "";
    return propertyData.city ?? propertyData.locationName ?? "";
  }, [propertyData]);

  const mapsLink = useMemo(() => {
    if (propertyData?.latitude && propertyData?.longitude) {
      return `https://www.google.com/maps?q=${propertyData.latitude},${propertyData.longitude}`;
    }
    if (propertyData?.coordinates?.lat && propertyData?.coordinates?.lng) {
      return `https://www.google.com/maps?q=${propertyData.coordinates.lat},${propertyData.coordinates.lng}`;
    }
    return "";
  }, [propertyData]);

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: <MessageCircle size={16} />,
      color: "bg-[#25D366]",
      link: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook size={16} />,
      color: "bg-[#1877F2]",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X",
      icon: <Twitter size={15} />,
      color: "bg-black",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={16} />,
      color: "bg-[#0A66C2]",
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  useEffect(() => {
    setActiveIndex(0);
  }, [offers]);

  if (!total) {
    return null;
  }

  const prev = () => setActiveIndex((index) => (index - 1 + total) % total);
  const next = () => setActiveIndex((index) => (index + 1) % total);
  const activeOfferHasMedia = Boolean(activeOffer?.image?.src);

  const positionStyles = {
    center: { zIndex: 30, scale: 1, x: "0%", opacity: 1 },
    left: { zIndex: 10, scale: 0.9, x: "-25%", opacity: 0.2 },
    right: { zIndex: 10, scale: 0.9, x: "25%", opacity: 0.2 },
    hidden: { zIndex: 0, scale: 0.72, opacity: 0 },
  };

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-14 dark:bg-[#080808] md:pt-28 md:pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.14),_transparent_42%)]" />
      <div className="absolute inset-x-0 top-20 h-48 bg-primary/10 blur-[140px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 relative">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] gap-10 lg:gap-14 items-start">
          <div className="pt-6 md:pt-8">
            <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-8">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                to={restaurantPath}
                className="hover:text-primary transition-colors font-medium"
              >
                Restaurant
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-zinc-900 dark:text-white font-semibold truncate">
                {currentCategory?.title}
              </span>
            </nav>

            <div className="space-y-5 text-left max-w-xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  <Sparkles size={12} className="animate-pulse" />
                  {propertyData?.propertyName || propertyData?.name || "Restaurant"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-tight text-zinc-900 dark:text-white">
                {currentCategory?.title?.split(" ")[0] || "Restaurant"}{" "}
                <span className="italic text-primary">
                  {currentCategory?.title?.split(" ").slice(1).join(" ") || "Offers"}
                </span>
              </h1>

              <div className="space-y-3">
                {location ? (
                  <div className="flex items-start gap-2 text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-sm md:text-base font-medium leading-relaxed">
                      {location}
                      {city && location !== city ? `, ${city}` : ""}
                    </span>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {mapsLink ? (
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-200 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      View Map
                    </a>
                  ) : null}

                  <div
                    className="relative"
                    onMouseEnter={() => setShowShareReactions(true)}
                    onMouseLeave={() => setShowShareReactions(false)}
                  >
                    {showShareReactions ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -56, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 shadow-2xl rounded-full px-2.5 py-2 flex gap-2.5 z-50 backdrop-blur-md whitespace-nowrap"
                      >
                        {socialPlatforms.map((platform, index) => (
                          <motion.a
                            key={platform.name}
                            href={platform.link}
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04 }}
                            whileHover={{ scale: 1.15, y: -2 }}
                            className={`${platform.color} text-white p-2.5 rounded-full shadow-lg transition-transform flex items-center justify-center`}
                            aria-label={platform.name}
                          >
                            {platform.icon}
                          </motion.a>
                        ))}
                      </motion.div>
                    ) : null}

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-200"
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full flex flex-col items-center">
            <div className="relative w-full h-[300px] md:h-[340px] lg:h-[360px] flex items-center justify-center overflow-hidden">
            <div className="hidden md:block relative w-full h-full">
              {offers.map((offer, index) => {
                const pos =
                  index === activeIndex
                    ? "center"
                    : index === (activeIndex - 1 + total) % total
                      ? "left"
                      : index === (activeIndex + 1) % total
                        ? "right"
                        : "hidden";

                return (
                  <motion.div
                    key={offer.id || index}
                    animate={positionStyles[pos]}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className={`absolute inset-0 m-auto w-[78%] lg:w-[70%] h-[92%] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-zinc-950 ${
                      pos === "center" ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                  >
                    {offer.image?.type === "VIDEO" ? (
                      <video
                        src={offer.image.src}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : offer.image?.src ? (
                      <img
                        src={offer.image?.src}
                        alt={offer.image?.alt || offer.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  </motion.div>
                );
              })}
            </div>

            <div className="md:hidden w-full h-full px-4">
              {activeOffer.image?.type === "VIDEO" ? (
                <video
                  src={activeOffer.image.src}
                  className="w-full h-full object-cover rounded-3xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : activeOfferHasMedia ? (
                <img
                  src={activeOffer.image?.src}
                  className="w-full h-full object-cover rounded-3xl"
                  alt={activeOffer.image?.alt || activeOffer.title}
                />
              ) : null}
            </div>

            {total > 1 ? (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 z-40 p-3 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 z-40 p-3 bg-white/90 dark:bg-zinc-800/90 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            ) : null}
            </div>

            <div className="w-full mt-8 px-4">
              <motion.div
                key={activeOffer.id || activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center space-y-3"
              >
                <div className="max-w-xl">
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-3">
                    <h3 className="text-3xl font-serif dark:text-white uppercase tracking-tight">
                      {activeOffer.title || "Restaurant Offer"}
                    </h3>
                  </div>
                  {activeOffer.description ? (
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm italic font-light leading-relaxed line-clamp-2">
                      {activeOffer.description}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {offers.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main Template ─────────────────────────────────────────────────────────── */
function ResturantCategoryPageTemplate() {
  const {
    propertyId: paramPropertyId,
    propertySlug: routePropertySlug,
    categoryType,
    citySlug: paramCitySlug,
  } = useParams();
  const { propertyCategory } = useSsrData();
  const slugTail = routePropertySlug?.split("-").pop() || "";
  const propertyId = Number(paramPropertyId || slugTail) || null;
  const navigate = useNavigate();
  const ssrCategoryData =
    propertyCategory?.propertyId === propertyId &&
    propertyCategory?.categoryType === categoryType
      ? propertyCategory.pageData
      : null;
  const [propertyData, setPropertyData] = useState(
    ssrCategoryData?.propertyData || null,
  );

  const [currentCategory, setCurrentCategory] = useState(
    ssrCategoryData?.currentCategory || null,
  );
  const [otherVerticals, setOtherVerticals] = useState(
    ssrCategoryData?.otherVerticals || [],
  );
  const [apiMenuItems, setApiMenuItems] = useState(
    ssrCategoryData?.apiMenuItems || [],
  );
  const [galleryData, setGalleryData] = useState(
    ssrCategoryData?.galleryData || [],
  );
  const [petpoojaCategories, setPetpoojaCategories] = useState([]);
  const [petpoojaItems, setPetpoojaItems] = useState([]);
  const [petpoojaLoading, setPetpoojaLoading] = useState(false);
  const [propertyOffers, setPropertyOffers] = useState([]);
  const [loading, setLoading] = useState(ssrCategoryData ? false : true);
  const [notFound, setNotFound] = useState(ssrCategoryData?.notFound || false);
  const [citySlug, setCitySlug] = useState(
    ssrCategoryData?.citySlug || paramCitySlug || "hotel",
  );
  const propertySlug = createHotelSlug(
    propertyData?.propertyName || propertyData?.name || "restaurant",
    propertyId,
  );

  const normalizedSlug = categoryType?.toLowerCase().trim();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset PetPooja data when switching verticals so stale data doesn't flash
    setPetpoojaCategories([]);
    setPetpoojaItems([]);
    setPetpoojaLoading(false);
  }, [categoryType]);

  // Fetch PetPooja menu — only when the vertical has showOrderButton enabled
  useEffect(() => {
    if (!currentCategory?.id || !propertyId || !currentCategory?.showOrderButton) return;

    let cancelled = false;
    const fetchPetPooja = async () => {
      setPetpoojaLoading(true);
      try {
        const credRes = await getPropertyPetPoojaByPropertyId(propertyId);
        const creds = credRes?.data?.data ?? credRes?.data ?? credRes ?? null;
        if (!creds?.active || cancelled) return;

        const ppRes = await fetchPetPoojaMenus({
          appKey:      creds["app-key"],
          appSecret:   creds["app-secret"],
          accessToken: creds["access-token"],
          restID:      creds.restID,
        });
        if (cancelled) return;
        const raw = ppRes?.data;
        setPetpoojaCategories(raw?.categories ?? []);
        setPetpoojaItems(raw?.items ?? []);
      } catch (err) {
        console.error("[PetPooja] fetch error:", err);
      } finally {
        if (!cancelled) setPetpoojaLoading(false);
      }
    };

    fetchPetPooja();
    return () => { cancelled = true; };
  }, [currentCategory?.id, currentCategory?.showOrderButton, propertyId]);

  useEffect(() => {
    if (!propertyId) return;

    let cancelled = false;

    const fetchPropertyOffers = async () => {
      try {
        const res = await getDailyOffers({ page: 0, size: 100 });
        const raw = res?.data?.content ?? res?.data ?? [];
        const offersList = Array.isArray(raw) ? raw : [];
        const now = Date.now();
        const days = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ];
        const todayName = days[new Date().getDay()];

        const mapped = offersList
          .filter((offer) => {
            const expiry = offer.expiresAt
              ? new Date(`${offer.expiresAt}T23:59:59`)
              : null;
            const notExpired = !expiry || expiry.getTime() >= now;
            const isDayActive =
              !offer.activeDays?.length || offer.activeDays.includes(todayName);

            return (
              Number(offer.propertyId) === Number(propertyId) &&
              offer.isActive === true &&
              offer.image?.url &&
              notExpired &&
              isDayActive
            );
          })
          .sort(
            (a, b) => (a.displayOrder ?? a.id ?? 0) - (b.displayOrder ?? b.id ?? 0),
          )
          .map((offer) => ({
            id: offer.id,
            title: offer.title || "Restaurant Offer",
            description: offer.description || "",
            couponCode: offer.couponCode || "",
            ctaText: offer.ctaText || "",
            ctaLink: offer.ctaUrl || offer.ctaLink || "",
            expiresLabel: formatOfferExpiry(offer.expiresAt),
            image: {
              src: offer.image.url,
              type: offer.image.type ?? "IMAGE",
              alt: offer.title || "Offer",
            },
          }));

        if (!cancelled) {
          setPropertyOffers(mapped);
        }
      } catch (err) {
        console.error("[CategoryPage] offers error:", err);
        if (!cancelled) {
          setPropertyOffers([]);
        }
      }
    };

    fetchPropertyOffers();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    if (ssrCategoryData) return;

    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // Fetch property details, vertical cards, and menu in parallel
        const [propertyRes, cardsRes, menuRes] = await Promise.all([
          GetAllPropertyDetails(),
          getAllVerticalCards(),
          getMenuItemsByPropertyId(propertyId),
        ]);

        /* ─── Property Details ─── */
        const rawData = propertyRes?.data || propertyRes;
        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
          (item) => {
            const parent = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];
            return listings.length === 0
              ? [{ parent, listing: null }]
              : listings.map((l) => ({ parent, listing: l }));
          },
        );
        const matchedProperty = flattened.find(
          (m) => Number(m.parent.id) === Number(propertyId),
        );
        let combinedProperty = null;
        if (matchedProperty) {
          const { parent, listing } = matchedProperty;
          combinedProperty = {
            ...parent,
            ...listing,
            id: parent.id,
            propertyId: parent.id,
            name: listing?.propertyName?.trim() || parent.propertyName,
            description: listing?.mainHeading || "",
            location: listing?.fullAddress || parent.address,
            city: listing?.city || parent.locationName,
            media: listing?.media?.length > 0 ? listing.media : parent.media || [],
          };
          setPropertyData(combinedProperty);
          setCitySlug(
            createCitySlug(
              combinedProperty.city ||
                combinedProperty.locationName ||
                combinedProperty.propertyName,
            ),
          );
        }

        /* ─── Vertical Cards ─── */
        const cards = cardsRes?.data || cardsRes || [];
        const filtered = cards
          .filter((c) => String(c.propertyId) === String(propertyId) && c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);

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
            showOrderButton: !!card.showOrderButton,
            ctaButtonText: card.showOrderButton ? card.extraText || "" : null,
            lightBgColor: card.cardBackgroundColor || null,
            bgColor: fallback.bgColor,
            hoverBg: fallback.hoverBg,
            isHexColor: !!card.cardBackgroundColor,
            heroImage: card.media?.url || "",
            themeColor: card.cardBackgroundColor || null,
          };
        });

        const matched = mapped.find((m) => m.slug === normalizedSlug);
        if (!matched) {
          setNotFound(true);
        } else {
          setCurrentCategory(matched);
          setOtherVerticals(mapped.filter((m) => m.slug !== normalizedSlug));
        }

        /* ─── Menu Items ─── */
        const allItems = menuRes?.data || menuRes || [];
        setApiMenuItems(allItems.filter((i) => i.status !== false));

        /* ─── Gallery (depends on matched vertical) ─── */
        if (matched) {
          const galleryRes = await searchGallery({
            propertyId,
            verticalId: matched.id,
          });
          const rawGallery =
            galleryRes?.data?.content || galleryRes?.data || galleryRes || [];
          const normalizedGallery = (Array.isArray(rawGallery) ? rawGallery : [])
            .filter((g) => g.isActive && g.media?.url)
            .map((g) => ({
              id: g.id,
              media: {
                mediaId: g.media.mediaId,
                url: g.media.url,
                type: g.media.type ?? "IMAGE",
                fileName: g.media.fileName ?? "",
                alt: g.media.alt ?? "",
              },
              isActive: g.isActive,
              categoryName: g.categoryName ?? null,
              displayOrder: g.displayOrder ?? 999,
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
  }, [propertyId, normalizedSlug, ssrCategoryData]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ── Not Found ── */
  if (notFound || !currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar navItems={resturant_NAV_ITEMS} logo={siteContent.brand.logo_restaurant} propertyTypeName="Restaurant" />
        <div className="py-40 text-center container mx-auto px-6">
          <h2 className="text-5xl font-serif mb-6 dark:text-white">
            Category Not Found
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            The culinary vertical you are looking for is currently unavailable.
          </p>
          <button
            onClick={() => navigate(`/${citySlug}/${propertySlug}`)}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
          >
            Return to Restaurant
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const resolvedMenu = buildMenuFromApi(apiMenuItems, currentCategory.id);
  const isPetPoojaVertical = !!currentCategory.showOrderButton;
  const hasPetPoojaMenu = petpoojaCategories.length > 0;

  /* ── Page ── */
  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500">
      <Navbar
        navItems={resturant_NAV_ITEMS}
        logo={siteContent.brand.logo_restaurant}
        propertyTypeName="Restaurant"
        showQuickBook={true}
        quickBookOptions={[{ label: "Reserve Restaurant", href: "#ReservationForm" }]}
      />

      <main>
        {/* SSR: structured data for crawlers */}
        <div className="sr-only" aria-hidden="true">
          {propertyData && (
            <div>
              <h1>{propertyData.propertyName || propertyData.name}</h1>
              <p>{propertyData.city || propertyData.locationName}</p>
              {(propertyData.fullAddress || propertyData.address) && (
                <p>{propertyData.fullAddress || propertyData.address}</p>
              )}
            </div>
          )}
          {currentCategory && (
            <div>
              <h2>{currentCategory.title}</h2>
              {currentCategory.description && <p>{currentCategory.description}</p>}
              {currentCategory.heroImage && (
                <img src={currentCategory.heroImage} alt={currentCategory.title} />
              )}
            </div>
          )}
          {resolvedMenu.length > 0 && (
            <ul>
              {resolvedMenu.map((section) => (
                <li key={section.category}>
                  <h3>{section.category}</h3>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <span>{item.name}</span>
                        {item.description && <span> — {item.description}</span>}
                        {item.price && <span> {item.price}</span>}
                        {item.image && <img src={item.image} alt={item.name} />}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          {otherVerticals.length > 0 && (
            <ul>
              {otherVerticals.map((v) => (
                <li key={v.id}>
                  <span>{v.title}</span>
                  {v.description && <span>{v.description}</span>}
                  {v.heroImage && <img src={v.heroImage} alt={v.title} />}
                </li>
              ))}
            </ul>
          )}
          {galleryData.slice(0, 5).map((g, i) => (
            g?.media?.url && <img key={i} src={g.media.url} alt={g.media.alt || currentCategory?.title || ""} />
          ))}
        </div>

        {/* Hero — decided by showOrderButton (stable from first render, no flicker) */}
        {isPetPoojaVertical ? (
          <PropertyOffersHero
            offers={propertyOffers}
            currentCategory={currentCategory}
            propertyData={propertyData}
            propertyId={propertyId}
            citySlug={citySlug}
          />
        ) : (
          <CategoryHero
            content={currentCategory}
            propertyId={propertyId}
            galleryData={galleryData}
            propertyData={propertyData}
          />
        )}

        {/* Menu */}
        <div id="menu">
          {isPetPoojaVertical ? (
            petpoojaLoading ? (
              <section className="py-16 bg-white dark:bg-[#050505]">
                <div className="container mx-auto px-6 max-w-[1200px] space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse"
                    />
                  ))}
                </div>
              </section>
            ) : hasPetPoojaMenu ? (
              <PetPoojaMenu
                categories={petpoojaCategories}
                items={petpoojaItems}
                propertyId={propertyId}
                propertyData={propertyData}
                themeColor={currentCategory.themeColor}
              />
            ) : (
              <div className="py-20 text-center text-muted-foreground">
                Menu coming soon for this vertical.
              </div>
            )
          ) : resolvedMenu.length > 0 ? (
            <CategoryMenu
              menu={resolvedMenu}
              themeColor={currentCategory.themeColor}
              propertyId={propertyId}
              verticalId={currentCategory.id}
            />
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              Menu coming soon for this vertical.
            </div>
          )}
        </div>

        {/* Other Verticals */}
        <div id="categories">
          <OtherVerticalsSection
            experiences={otherVerticals}
            propertyId={propertyId}
            citySlug={citySlug}
            propertyName={propertyData?.propertyName || propertyData?.name}
          />
        </div>

        <div id="events">
          <ResturantpageEvents propertyId={propertyId} />
        </div>

        <div id="testimonials">
          <Testimonials propertyId={propertyId} />
        </div>

        <div id="ReservationForm">
          <ReservationForm propertyId={propertyId} />
        </div>
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}

export default ResturantCategoryPageTemplate;
