import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ChevronRight, Beer, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllVerticalCards,
  getAllVerticalSectionsHeader,
} from "@/Api/RestaurantApi";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";

const STATIC_EXPERIENCES = [
  {
    id: "italian",
    title: "Italian",
    description:
      "Authentic Mediterranean soul in a sophisticated setting. Experience the rich heritage of Tuscany through our hand-picked ingredients.",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    link: "/restaurant/italian",
    bgColor: "bg-orange-50",
    hoverBg: "hover:bg-orange-50",
  },
  {
    id: "luxury-lounge",
    title: "Luxury Lounge",
    description:
      "Premium comfort tailored for memorable family gatherings. A refined space where elegance meets contemporary dining.",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800",
    link: "/restaurant/luxury-lounge",
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-50",
  },
  {
    id: "spicy-darbar",
    title: "Spicy Darbar",
    description:
      "Bold, traditional Indian flavors with a fiery spirit. Royal curries and tandoori masterpieces prepared with authentic spices.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/restaurant/spicy-darbar",
    bgColor: "bg-red-50",
    hoverBg: "hover:bg-red-50",
  },
  {
    id: "takeaway",
    title: "Takeaway Treats",
    description:
      "Gourmet quality on the go for your convenience. Perfectly packaged meals that bring the restaurant experience to your home.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
    link: "/restaurant/takeaway",
    bgColor: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-50",
  },
];

const CARD_BG_COLORS = [
  {
    bgColor: "bg-orange-50",
    hoverBg: "hover:bg-orange-100",
  },
  {
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
  },
  {
    bgColor: "bg-red-50",
    hoverBg: "hover:bg-red-100",
  },
  {
    bgColor: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-100",
  },
];

const STATIC_HEADER = {
  badgeLabel: "Verticals",
  headlineLine1: "One Location.",
  headlineLine2: "Diverse Verticals.",
  description:
    "Discover a curated collection of culinary spaces designed for every mood and occasion. From intimate fine dining to casual gourmet treats.",
  policyType: "Dining Policy",
  policyName: "BYOB Support",
  policyDescription:
    "Bring your favorite spirits; we provide the perfect ambiance and premium glassware.",
  policyMedia: {
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&h=200&auto=format&fit=crop",
  },
};

export default function ResturantSubCategories({ propertyId, propertyData }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [header, setHeader] = useState(null);
  const [experiences, setExperiences] = useState(null);
  const [experiencesFetched, setExperiencesFetched] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const generateSlug = (name) =>
    name?.toLowerCase().trim().replace(/\s+/g, "-");

  const moveTL_BR = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 0.04, 0.04, 0],
  );

  // Detect dark mode
  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headerRes = await getAllVerticalSectionsHeader();
        const headers = headerRes?.data || headerRes || [];
        const matchedHeader = headers.find(
          (h) => h.propertyId === propertyId && h.isActive,
        );
        if (matchedHeader) setHeader(matchedHeader);
      } catch (err) {
        console.error("Failed to fetch vertical section header:", err);
      }

      try {
        const cardsRes = await getAllVerticalCards();
        const cards = cardsRes?.data || cardsRes || [];
        const filtered = cards
          .filter((c) => c.propertyId === propertyId && c.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        if (filtered.length > 0) {
          const mapped = filtered.map((card, index) => ({
            slug: generateSlug(card.verticalName),
            id: card.id,
            title: card.verticalName || card.itemName,
            description: card.description || "",
            image:
              card.media?.url ||
              "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
            link: card.link || "#",
            ctaButtonText: card.showOrderButton
              ? card.extraText || "Order"
              : null,
            // Only use dynamic hex color in light mode; dark mode uses static class
            lightBgColor: card.cardBackgroundColor || null,
            bgColor: CARD_BG_COLORS[index % CARD_BG_COLORS.length].bgColor,
            hoverBg: CARD_BG_COLORS[index % CARD_BG_COLORS.length].hoverBg,
            isHexColor: !!card.cardBackgroundColor,
          }));
          setExperiences(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch vertical cards:", err);
      } finally {
        setExperiencesFetched(true); // ← add this (runs whether success or error)
      }
    };

    if (propertyId) fetchData();
  }, [propertyId]);

  const activeHeader = header || STATIC_HEADER;
  const activeExperiences = experiences || STATIC_EXPERIENCES;

  const citySlug = createCitySlug(
    propertyData?.city ||
    propertyData?.locationName ||
    propertyData?.propertyName,
  );
  const propertySlug = createHotelSlug(
    propertyData?.propertyName || propertyData?.name || "restaurant",
    propertyId,
  );

  // Resolve per-card inline style and className based on current mode
  const resolveCardStyle = (exp, index) => {
    // In dark mode: always use static zinc card bg (no inline style override)
    if (isDark) {
      return {
        style: {},
        bgClass: "dark:bg-zinc-800/80",
        hoverClass: "dark:hover:bg-zinc-700/90",
        lightBgClass: exp.bgColor,
        lightHoverClass: exp.hoverBg,
      };
    }
    // In light mode: use hex color if available, else Tailwind class
    if (exp.isHexColor && exp.lightBgColor) {
      return {
        style: { backgroundColor: exp.lightBgColor },
        bgClass: "",
        hoverClass: "",
        lightBgClass: "",
        lightHoverClass: "",
      };
    }
    return {
      style: {},
      bgClass: exp.bgColor,
      hoverClass: exp.hoverBg,
      lightBgClass: "",
      lightHoverClass: "",
    };
  };
  if (experiencesFetched && !experiences) return null;
  return (
    <section
      ref={containerRef}
      className="relative py-10 lg:py-20 transition-colors duration-500 bg-white dark:bg-[#080808] overflow-hidden"
    >
      {/* Parallax Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          style={{ x: moveTL_BR, y: moveTL_BR, opacity: bgOpacity }}
          className="absolute top-4 left-4 text-[6rem] lg:text-[10rem] font-black italic text-zinc-900 dark:text-white select-none uppercase"
        >
          Cuisine
        </motion.div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-primary text-[11px] font-bold uppercase tracking-[0.4em]">
                {activeHeader.badgeLabel}
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-white tracking-tight mb-6">
              {activeHeader.headlineLine1} <br />
              <span className="text-primary italic">
                {activeHeader.headlineLine2}
              </span>
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg font-light leading-relaxed">
              {activeHeader.description}
            </p>
          </motion.div>

          {/* ── BYOB TAG SECTION (Right Side) ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-6 bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-[2rem] border border-primary/10 max-w-lg shadow-sm backdrop-blur-md"
          >
            <div className="relative shrink-0">
              <img
                src={activeHeader.policyMedia?.url}
                className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-md"
                alt="BYOB Support"
              />
              <div className="absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
                <Beer className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Quote className="w-3 h-3 text-primary fill-primary" />
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  {activeHeader.policyType}
                </span>
              </div>
              <h3 className="text-xl font-serif dark:text-white text-zinc-900">
                {activeHeader.policyName.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="italic text-primary">
                  {activeHeader.policyName.split(" ").slice(-1)}
                </span>
              </h3>
              <p className="text-sm italic dark:text-zinc-400 text-zinc-600 leading-snug">
                "{activeHeader.policyDescription}"
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── EXPERIENCE GRID ── */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {activeExperiences.map((exp, index) => {
            const {
              style,
              bgClass,
              hoverClass,
              lightBgClass,
              lightHoverClass,
            } = resolveCardStyle(exp, index);

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  navigate(`/${citySlug}/${propertySlug}/${exp.slug}`, {
                    state: { propertyData },
                  })
                }
                style={style}
                className={`
                  group cursor-pointer relative flex transition-all duration-500 hover:shadow-2xl
                  ${lightBgClass} ${lightHoverClass} ${bgClass} ${hoverClass}
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

                <div className="flex flex-col flex-grow px-4 lg:px-0">
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
