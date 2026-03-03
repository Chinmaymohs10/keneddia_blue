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
import { getAllVerticalCards, getMenuItems } from "@/Api/RestaurantApi";
import { getAllGalleries, GetAllPropertyDetails } from "@/Api/Api";

/* Navigation for Category Page */
const resturant_NAV_ITEMS = [
  { type: "link", label: "HOME", href: "/" },
  { type: "link", label: "MENU", href: "#menu" },
  { type: "link", label: "CONTACT", href: "#contact" },
];
const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, "-");

function buildMenuFromApi(allItems, verticalTitle) {
  if (!allItems?.length || !verticalTitle) return [];

  const titleLower = verticalTitle.toLowerCase().trim();

  const matched = allItems.filter((item) => {
    const catName = item.category?.categoryName?.toLowerCase().trim() || "";
    return catName.includes(titleLower) || titleLower.includes(catName);
  });

  if (!matched.length) return [];

  const groups = {};

  matched.forEach((item) => {
    const typeName = item.type?.typeName || "Other";

    if (!groups[typeName]) groups[typeName] = [];

    groups[typeName].push({
      name: item.itemName || "",
      description: item.description || "",
      price: item.price ? `₹${item.price}` : "",
      image: item.image?.url || item.media?.url || "",
      isSpicy: item.foodType === "NON_VEG",
      foodType: item.foodType,
      likeCount: item.likeCount || 0,
    });
  });

  return Object.entries(groups).map(([typeName, items]) => ({
    category: typeName,
    categoryImage: items[0]?.image || "",
    items,
  }));
}

/* ── Other Verticals Grid ─────────────────────────────────────────────────── */
function OtherVerticalsSection({ experiences, propertyId }) {
  const navigate = useNavigate();

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
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/resturant/${propertyId}/${exp.slug}`)}
              style={exp.isHexColor ? { backgroundColor: exp.bgColor } : {}}
              className={`
                group cursor-pointer relative flex transition-all duration-500 hover:shadow-2xl
                ${!exp.isHexColor ? exp.bgColor : ""} ${exp.hoverBg}
                w-full p-4 rounded-2xl flex-row items-center border border-zinc-100 dark:border-white/5 shadow-sm
                lg:flex-col lg:items-center lg:text-center lg:p-10 lg:rounded-[2.5rem] lg:w-[calc(25%-1.5rem)] lg:min-h-[420px] lg:hover:border-primary/20
              `}
            >
              <div className="shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-zinc-800 shadow-lg z-20 transition-transform duration-500 group-hover:scale-110 w-14 h-14 lg:w-28 lg:h-28 lg:mb-8">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                />
              </div>

              <div className="flex flex-col flex-grow px-4 lg:px-0">
                <h3 className="text-lg lg:text-3xl font-serif text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors tracking-tight">
                  {exp.title}
                </h3>
                <p className="hidden lg:block text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mt-4 mb-6 line-clamp-4 font-light">
                  {exp.description}
                </p>
                <div className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                  <ChevronRight size={20} />
                </div>
                <div className="hidden lg:flex mt-auto items-center justify-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <ChevronRight size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
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

              <span className="hidden lg:block absolute bottom-8 right-10 text-7xl font-black text-zinc-900/[0.03] dark:text-white/[0.02] italic select-none">
                0{index + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main Template ─────────────────────────────────────────────────────────── */
function ResturantCategoryPageTemplate() {
  const { propertyId: paramPropertyId, categoryType } = useParams();
  const propertyId = paramPropertyId ? Number(paramPropertyId) : null;
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState(null);

  const [currentCategory, setCurrentCategory] = useState(null);
  const [otherVerticals, setOtherVerticals] = useState([]);
  const [apiMenuItems, setApiMenuItems] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

        const mapped = filtered.map((card) => {
          const slug = generateSlug(card.verticalName);

          return {
            slug,
            id: card.id,
            title: card.verticalName || card.itemName,
            description: card.description || "",
            image: card.media?.url || "",
            link: card.link || "",
            ctaButtonText: card.showOrderButton
              ? card.extraText || ""
              : null,
            bgColor: card.cardBackgroundColor || "",
            hoverBg: "",
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
        const menuRes = await getMenuItems();
        const allItems = menuRes?.data || menuRes || [];

        const propItems = allItems.filter(
          (i) =>
            String(i.propertyId) === String(propertyId) && i.status !== false,
        );

        setApiMenuItems(propItems);

        /* ─────────────────────────────────────────────
         3️⃣ Gallery
      ───────────────────────────────────────────── */
        const galleryRes = await getAllGalleries({
          page: 0,
          size: 100,
        });

        const allGallery = galleryRes?.data?.content || [];

        const filteredGallery = allGallery.filter(
          (g) =>
            String(g.propertyId) === String(propertyId) &&
            g.isActive &&
            g.media?.url &&
            g.categoryName?.toLowerCase() !== "3d",
        );

        setGalleryData(filteredGallery);
      } catch (err) {
        console.error("[CategoryPage] Error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, normalizedSlug]);
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
        <Navbar navItems={resturant_NAV_ITEMS} logo={siteContent.brand.logo} />
        <div className="py-40 text-center container mx-auto px-6">
          <h2 className="text-5xl font-serif mb-6 dark:text-white">
            Category Not Found
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            The culinary vertical you are looking for is currently unavailable.
          </p>
          <button
            onClick={() => navigate(`/resturant/${propertyId}`)}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
          >
            Return to Restaurant
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const resolvedMenu = buildMenuFromApi(apiMenuItems, currentCategory.title);

  /* ── Page ── */
  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500">
      <Navbar navItems={resturant_NAV_ITEMS} logo={siteContent.brand.logo_hotel} />

      <main>
        {/* Hero */}
        <CategoryHero
          content={currentCategory}
          propertyId={propertyId}
          galleryData={galleryData}
          propertyData={propertyData}
        />

        {/* Menu — API items matched by categoryName, grouped by typeName as tabs */}
        <div id="menu">
          {resolvedMenu.length > 0 ? (
            <CategoryMenu
              menu={resolvedMenu}
              themeColor={currentCategory.themeColor}
              propertyId={propertyId}
            />
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              Menu coming soon for this vertical.
            </div>
          )}
        </div>

        {/* Other Verticals (excluding current) */}
        <div id="categories">
          <OtherVerticalsSection
            experiences={otherVerticals}
            propertyId={propertyId}
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
