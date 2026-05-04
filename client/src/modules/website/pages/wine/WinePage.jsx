import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ChevronDown, ImageOff, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { DynamicWineBanner } from "./winepage/WineBanner";
import WineSubCategories from "./winepage/WineSubCategories";
import AboutWinePage from "./winepage/AboutWinePage";
import WinepageEvents from "./winepage/WinepageEvents";
import WineSignatureDrinks from "./winepage/WineSignatureDrinks";
import WineTestimonials from "./winepage/WineTestimonials";
import WineGalleryPage from "./winepage/WineGalleryPage";
import WineReservationForm from "./winepage/WineReservationForm";
import WineTopBrands from "./components/WineTopBrands";
import { siteContent } from "@/data/siteContent";
import {
  getAllWineTypes,
  getAllWineBrands,
  getAllWineCategories,
  getAllWineSubCategories,
} from "@/Api/WineApi";
import { getAllProperties, GetAllPropertyDetails, getGalleryByPropertyId, getPropertyTypes } from "@/Api/Api";
import {
  getMenuSectionsByPropertyTypeId,
  getActiveTestimonialHeaders,
  getPrimaryConversionsHeader,
  getEventsHeaderByProperty,
} from "@/Api/RestaurantApi";
import { generateWineCards } from "@/utils/wineDataUtils";

const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "BRANDS", key: "brand", href: "#brand" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
];

// ─── KENNEDIA WINES LOADER ────────────────────────────────────────────────────
function KenediaWinesLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0D0508]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -right-1/4 -top-1/4 h-[80%] w-[80%] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #8B1A2A 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -5, 0], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 h-[80%] w-[80%] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="relative mb-8 h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <style>{`
              @keyframes dash { to { stroke-dashoffset: 0; } }
              @keyframes revealText { to { opacity: 1; transform: translateY(0); } }
            `}</style>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="301.6" strokeDashoffset="301.6" style={{ animation: "dash 2s cubic-bezier(0.4, 0, 0.2, 1) forwards" }} />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#8B1A2A" strokeWidth="0.75" strokeDasharray="2 6" opacity="0" style={{ animation: "revealText 1s ease 0.8s forwards" }} />
            <text x="50" y="62" textAnchor="middle" fill="white" fontSize="38" fontFamily="'Playfair Display', serif" fontWeight="300" opacity="0" style={{ animation: "revealText 1.2s ease 0.4s forwards", transform: "translateY(10px)" }}>K</text>
          </svg>
        </div>
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#D4AF37]">Kennedia</span>
            <div className="my-2 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
            <span className="italic font-serif text-[18px] tracking-[0.1em] text-white/90">Fine Wines & Estates</span>
          </motion.div>
        </div>
        <div className="mt-12 h-[1px] w-48 overflow-hidden bg-white/5">
          <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 2.2, ease: "easeInOut" }} className="h-full w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

function generateSlug(text) {
  return text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function humanizeSlug(slug) {
  return slug
    ?.replace(/-/g, " ")
    .replace(/\bwine\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function WineShowcaseCard({ wine, index }) {
  const [errored, setErrored] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group relative flex min-h-[266px] overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1A0C12]"
    >
      <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-[1.75rem] bg-gradient-to-b from-[#C4485A] to-[#8B1A2A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex h-full w-full overflow-hidden">
        <div className="relative w-[40%] shrink-0 overflow-hidden bg-stone-100 dark:bg-zinc-900">
          {!wine.image || errored ? (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff size={20} className="text-stone-300 dark:text-zinc-700" />
            </div>
          ) : (
            <img
              src={wine.image}
              alt={wine.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setErrored(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 dark:to-[#1A0C12]/80" />
          <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full bg-[#D4AF37] shadow-sm" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-5 text-center">
          <div className="mb-3 flex flex-col items-center gap-2">
            <div className="flex max-w-full items-center gap-1.5 whitespace-nowrap">
              <Building2 size={10} className="shrink-0 text-[#8B1A2A]" />
              <span className="truncate text-[8px] font-black uppercase tracking-[0.18em] text-[#8B1A2A]">
                {wine.property}{wine.location && wine.location !== "_" ? ` · ${wine.location}` : ""}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <h3 className="font-serif text-[1.4rem] leading-tight text-stone-950 dark:text-stone-100">
                {wine.name}
              </h3>
              {wine.subtitle && (
                <p className="text-[11px] font-medium italic text-stone-400 dark:text-stone-500">
                  {wine.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="mb-3">
            <span className="rounded-lg border border-[#8B1A2A]/20 bg-[#8B1A2A]/6 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#8B1A2A] dark:border-[#C8956A]/20 dark:bg-[#C8956A]/10 dark:text-[#C8956A]">
              {wine.category || wine.tag}
            </span>
          </div>

          <div className="mb-3 h-px w-6 bg-stone-200 dark:bg-white/10" />

          <p className="mx-auto max-w-[220px] line-clamp-3 text-[11px] italic leading-relaxed text-stone-400 dark:text-stone-500">
            &ldquo;{wine.tasting}&rdquo;
          </p>

          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500 dark:bg-white/5 dark:text-stone-500">
              <MapPin size={10} />
              {wine.locationDisplay || wine.location}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function WineShowcaseSection({ wines, propertyName, headerData }) {
  const [expanded, setExpanded] = useState(false);
  const visibleWines = expanded ? wines : wines.slice(0, 6);
  const hasMore = wines.length > 6;

  if (!wines.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#F5F0EA] py-20 dark:bg-[#12070A]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundSize: "128px",
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-10 bg-[#8B1A2A]/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.38em] text-[#8B1A2A]">
                {headerData?.header1 || "Wine Showcase"}
              </span>
            </div>
            <h2 className="font-serif text-4xl leading-[1.1] text-stone-900 md:text-5xl dark:text-stone-100">
              {headerData?.header2 ? (
                <>
                  {headerData.header2}{" "}
                  <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">{propertyName}</em>
                </>
              ) : (
                <>
                  Bottles available at{" "}
                  <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">{propertyName}</em>
                </>
              )}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {headerData?.description || "A property-specific collection in a listing format, using the same editorial card direction as the wine homepage."}
            </p>
          </div>
          <div className="rounded-full border border-[#8B1A2A]/15 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#8B1A2A] shadow-sm dark:border-[#C8956A]/20 dark:bg-white/5 dark:text-[#C8956A]">
            {wines.length} Labels
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleWines.map((wine, index) => (
            <WineShowcaseCard key={wine.id} wine={wine} index={index} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-[#8B1A2A]/20 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.26em] text-[#8B1A2A] transition-all hover:border-[#8B1A2A]/35 hover:shadow-lg dark:border-[#C8956A]/20 dark:bg-white/5 dark:text-[#C8956A]"
            >
              {expanded ? "Show Less" : "Show More"}
              <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import { useSsrData } from "@/ssr/SsrDataContext";

export default function WinePage() {
  const { citySlug, propertySlug } = useParams();
  const { wineDetail } = useSsrData();

  const [loaderDone, setLoaderDone] = useState(false);
  const [allCards, setAllCards] = useState(wineDetail?.allCards || []);
  const [bannerPropertyData, setBannerPropertyData] = useState(wineDetail?.propertyData || null);
  const [bannerGalleryData, setBannerGalleryData] = useState(wineDetail?.galleryData || []);
  const [bannerLoading, setBannerLoading] = useState(!wineDetail);
  const [headerData, setHeaderData] = useState(wineDetail?.headerData || null);
  const [sectionHeaders, setSectionHeaders] = useState(wineDetail?.sectionHeaders || {
    signatures: null,   // Wines Menu  → WineSignatureDrinks
    collections: null,  // Collections → WineShowcaseSection
    brands: null,       // Brands      → WineTopBrands
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setLoaderDone(true), 1500); // Shorter if SSR
    return () => clearTimeout(t);
  }, []);

  // Fetch property details + gallery for the dynamic banner
  useEffect(() => {
    if (!propertySlug || wineDetail) { setBannerLoading(false); return; }
    let cancelled = false;

    // Extract ID from slug (e.g. cheers-corner-71 -> 71)
    const slugParts = propertySlug.split("-");
    const slugId = Number(slugParts[slugParts.length - 1]);

    async function fetchBanner() {
      try {
        const res = await GetAllPropertyDetails();
        const rawData = res?.data?.data ?? res?.data ?? res ?? [];
        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap((item) => {
          const parent = item.propertyResponseDTO;
          const listings = item.propertyListingResponseDTOS || [];
          return listings.length === 0
            ? [{ parent, listing: null }]
            : listings.map((listing) => ({ parent, listing }));
        });

        const matched = flattened.find(({ parent, listing }) => {
          if (!isNaN(slugId)) {
            return Number(parent?.id) === slugId;
          }
          return generateSlug(listing?.propertyName || parent?.propertyName || "") === propertySlug.toLowerCase();
        });

        if (!matched || cancelled) return;
        const { parent, listing } = matched;
        const combinedProperty = {
          id: parent.id,
          propertyId: parent.id,
          name: listing?.propertyName?.trim() || parent.propertyName,
          location: listing?.fullAddress || parent.address,
          city: listing?.city || parent.locationName,
          addressUrl: parent.addressUrl ?? null,
          latitude: parent.latitude,
          longitude: parent.longitude,
          media: listing?.media?.length > 0 ? listing.media : parent.media || [],
        };
        if (!cancelled) setBannerPropertyData(combinedProperty);
        // Fetch gallery in parallel
        const galleryRes = await getGalleryByPropertyId(parent.id);
        if (!cancelled) setBannerGalleryData(galleryRes?.data ?? []);
      } catch (_) {
        // fallback to static slides (handled inside DynamicWineBanner)
      } finally {
        if (!cancelled) setBannerLoading(false);
      }
    }
    fetchBanner();
    return () => { cancelled = true; };
  }, [propertySlug, wineDetail]);

  // Fetch section headers after propertyId is resolved
  useEffect(() => {
    const pid = bannerPropertyData?.propertyId ?? bannerPropertyData?.id;
    if (!pid || wineDetail) return;
    let cancelled = false;
    async function fetchSectionHeaders() {
      try {
        const [testimonialRes, conversionRes, eventsRes] = await Promise.all([
          getActiveTestimonialHeaders(),
          getPrimaryConversionsHeader(),
          getEventsHeaderByProperty(pid),
        ]);
        if (cancelled) return;

        const testimonials = testimonialRes?.data ?? [];
        const conversions = conversionRes?.data ?? [];
        const eventsData = eventsRes?.data;

        const signaturesHeader = testimonials
          .filter((h) => String(h.propertyId) === String(pid) && h.isActive)
          .sort((a, b) => b.id - a.id)[0] ?? null;

        const collectionsHeader = conversions
          .filter((h) => h.propertyId === pid && h.isActive)
          .sort((a, b) => b.id - a.id)[0] ?? null;

        const brandsHeader = Array.isArray(eventsData)
          ? eventsData.sort((a, b) => b.id - a.id)[0] ?? null
          : eventsData ?? null;

        setSectionHeaders({ signatures: signaturesHeader, collections: collectionsHeader, brands: brandsHeader });
      } catch (_) { }
    }
    fetchSectionHeaders();
    return () => { cancelled = true; };
  }, [bannerPropertyData, wineDetail]);

  useEffect(() => {
    if (wineDetail) return;
    let cancelled = false;
    async function fetchAll() {
      try {
        const [typesRes, brandsRes, catsRes, subCatsRes, propsRes, propTypesRes] = await Promise.all([
          getAllWineTypes(),
          getAllWineBrands(),
          getAllWineCategories(),
          getAllWineSubCategories(),
          getAllProperties(),
          getPropertyTypes(),
        ]);
        if (cancelled) return;

        // Header Integration
        const propTypesData = propTypesRes?.data ?? [];
        const wineTypeObj = propTypesData.find(t => t.typeName?.toLowerCase() === "wine");
        if (wineTypeObj) {
          const headerRes = await getMenuSectionsByPropertyTypeId(wineTypeObj.id);
          const headers = headerRes?.data || [];
          const match = headers.find(h => h.isActive && (h.part1?.includes("Showcase") || h.part1?.includes("Collection")));
          if (match) setHeaderData(match);
        }
        const cards = generateWineCards({
          brands: brandsRes?.data ?? [],
          wineTypes: typesRes?.data ?? [],
          categories: catsRes?.data ?? [],
          subCategories: subCatsRes?.data ?? [],
          properties: propsRes?.data ?? [],
        });
        setAllCards(cards);
      } catch (_) { }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [wineDetail]);

  const showcaseWines = useMemo(() => {
    if (!allCards.length) return [];
    if (!citySlug && !propertySlug) return allCards;

    // Extract ID from slug
    const slugParts = propertySlug?.split("-") || [];
    const slugId = Number(slugParts[slugParts.length - 1]);

    // Exact match: property slug/ID + city slug
    const exactMatch = allCards.filter((c) => {
      const ids = Array.isArray(c.propertyId) ? c.propertyId : [c.propertyId];
      const matchProperty = !isNaN(slugId)
        ? ids.map(Number).includes(slugId)
        : generateSlug(c.property) === propertySlug?.toLowerCase();
      const matchCity = generateSlug(c.locationDisplay || c.location) === citySlug?.toLowerCase();
      return matchProperty && matchCity;
    });
    if (exactMatch.length) return exactMatch;

    // Fallback: property slug/ID only
    const propMatch = allCards.filter((c) => {
      const ids = Array.isArray(c.propertyId) ? c.propertyId : [c.propertyId];
      return !isNaN(slugId)
        ? ids.map(Number).includes(slugId)
        : generateSlug(c.property) === propertySlug?.toLowerCase();
    });
    if (propMatch.length) return propMatch;

    // Fallback: same propertyId group
    if (!isNaN(slugId)) {
      const byId = allCards.filter((c) => Number(c.propertyId) === slugId);
      if (byId.length) return byId;
    }

    return allCards;
  }, [allCards, citySlug, propertySlug]);

  const currentPropertyName =
    showcaseWines[0]?.property ||
    humanizeSlug(propertySlug) ||
    siteContent.brand.name ||
    "this property";

  const showcaseDescription = useMemo(() => {
    const exactPropertyMatch = showcaseWines.some(
      (c) => generateSlug(c.property) === propertySlug?.toLowerCase()
    );
    if (exactPropertyMatch) return currentPropertyName;
    if (citySlug) return `${currentPropertyName} collection`;
    return currentPropertyName;
  }, [showcaseWines, propertySlug, citySlug, currentPropertyName]);

  return (
    <>
      <AnimatePresence>
        {!loaderDone && <KenediaWinesLoader key="loader" />}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden bg-background">
        <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} propertyTypeName="Wine" />

        <main>
          {/* Banner — Full Viewport */}
          <div id="home">
            <DynamicWineBanner
              propertyData={bannerPropertyData}
              galleryData={bannerGalleryData}
              loading={bannerLoading}
            />
          </div>

          {/* Menu / Signature Drinks — Wines Menu header */}
          <div id="menu" className="bg-[#FAF8F4] dark:bg-[#0D0508]">
            <div className="dark:hidden">
              <div className="h-px bg-[#E1E1DD]/40" />
            </div>
            <WineSignatureDrinks
              sectionHeader={sectionHeaders.signatures}
              propertyId={propertySlug?.split("-").pop()}
            />
          </div>

          {/* Collections header */}
          <WineShowcaseSection
            wines={showcaseWines}
            propertyName={showcaseDescription}
            headerData={sectionHeaders.collections}
          />

          {/* Top Brands — Brands header */}
          <div id="brand" className="bg-[#F0EAE2] pb-16 dark:bg-[#100609]">
            <div className="dark:hidden">
              <div className="h-px bg-[#DCD4CB]/40" />
            </div>
            <WineTopBrands clickable={true} sectionHeader={sectionHeaders.brands} />
          </div>

          {/* Gallery */}
          <div id="gallery" className="bg-[#EDE7DF] pb-16 dark:bg-[#0A0407]">
            <div className="dark:hidden">
              <div className="h-px bg-[#DED7CE]/40" />
            </div>
            <WineGalleryPage propertyId={bannerPropertyData?.propertyId ?? bannerPropertyData?.id ?? null} />
          </div>
        </main>

        <div id="contact" className="bg-[#EDE7DF] dark:bg-[#0A0407]">
          <Footer />
        </div>
        {/* <WineWhatsAppButton /> */}
      </div>
    </>
  );
}
