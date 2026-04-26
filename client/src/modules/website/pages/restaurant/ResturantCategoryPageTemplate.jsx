import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import CategoryHero from "./components/shared/CategoryHero";
import CategoryMenu from "./components/shared/CategoryMenu";
import ResturantpageEvents from "./resturantpage/ResturantpageEvents";
import Testimonials from "./components/Testimonials";
import ReservationForm from "./components/ReservationForm";
import { getAllVerticalCards, getMenuItemsByPropertyId } from "@/Api/RestaurantApi";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import { useSsrData } from "@/ssr/SsrDataContext";
import {
  getAllGalleries,
  GetAllPropertyDetails,
  getGalleryByPropertyId,
  searchGallery,
} from "@/Api/Api";

/* Navigation for Category Page */
const resturant_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "/" },
  { type: "link", label: "MENU", href: "#menu" },
  { type: "link", label: "CONTACT", href: "#contact" },
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
  }, [categoryType]);

  useEffect(() => {
    if (!propertyId) return;
    if (ssrCategoryData) return;

    const fetchData = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        /* ─────────────────────────────────────────────
         0️⃣ Fetch Property Details
        ───────────────────────────────────────────── */
        const propertyRes = await GetAllPropertyDetails();
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
            media:
              listing?.media?.length > 0 ? listing.media : parent.media || [],
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

        /* ─────────────────────────────────────────────
         1️⃣ Vertical Cards
        ───────────────────────────────────────────── */
        const cardsRes = await getAllVerticalCards();
        const cards = cardsRes?.data || cardsRes || [];

        const filtered = cards
          .filter(
            (c) => String(c.propertyId) === String(propertyId) && c.isActive,
          )
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
            ctaButtonText: card.showOrderButton ? card.extraText || "" : null,
            // Keep hex for light mode usage
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

        /* ─────────────────────────────────────────────
         2️⃣ Menu Items
        ───────────────────────────────────────────── */
        const menuRes = await getMenuItemsByPropertyId(propertyId);
        const allItems = menuRes?.data || menuRes || [];

        const propItems = allItems.filter(
          (i) => i.status !== false,
        );

        setApiMenuItems(propItems);

        /* ─────────────────────────────────────────────
         3️⃣ Gallery
        ───────────────────────────────────────────── */
        if (matched) {
          const galleryRes = await searchGallery({
            propertyId: propertyId,
            verticalId: matched.id,
          });

          const rawGallery =
            galleryRes?.data?.content || galleryRes?.data || galleryRes || [];

          const normalizedGallery = (
            Array.isArray(rawGallery) ? rawGallery : []
          )
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
        <Navbar navItems={resturant_NAV_ITEMS} logo={siteContent.brand.logo_restaurant} />
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

  /* ── Page ── */
  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500">
      <Navbar
        navItems={resturant_NAV_ITEMS}
        logo={siteContent.brand.logo_restaurant}
      />

      <main>
        {/* Hero */}
        <CategoryHero
          content={currentCategory}
          propertyId={propertyId}
          galleryData={galleryData}
          propertyData={propertyData}
        />

        {/* Menu */}
        <div id="menu">
          {resolvedMenu.length > 0 ? (
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
