import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { useNavigate, useParams } from "react-router-dom";
import { getAllWineBrands, getWineBrandsByPropertyId } from "@/Api/WineApi";
import { GetAllPropertyDetails, getPropertyTypes } from "@/Api/Api";
import { getMenuSectionsByPropertyTypeId } from "@/Api/RestaurantApi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const toList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const generateSlug = (text) =>
  text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const ACCENT_COLORS = ["#d7d3cc", "#e5d4ab", "#c6a76d", "#b48a35", "#f0c15b"];

function BrandCard({ brand, onClick, clickable }) {
  const hasLogo = Boolean(brand.logo);

  return (
    <article onClick={onClick} className={`group relative h-full overflow-hidden rounded-[1rem] border border-zinc-200/80 bg-white/90 px-3 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-zinc-300 dark:border-white/10 dark:bg-[#14090d]/90 dark:shadow-[0_12px_40px_rgba(0,0,0,0.25)] dark:hover:border-white/20 ${clickable ? "cursor-pointer" : ""}`}>
      <div
        className="absolute inset-x-4 top-0 h-px opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${brand.accent}, transparent)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_56%)] opacity-60 transition-opacity duration-500 group-hover:opacity-80 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_52%)] dark:opacity-0 dark:group-hover:opacity-100" />

      <div className="relative flex h-full min-h-[160px] flex-col items-center justify-center text-center">
        {/* Detail label */}
        <span className="mb-2 text-[0.55rem] uppercase tracking-[0.4em]" style={{ color: `${brand.accent}cc` }}>
          {brand.detail}
        </span>

        {/* Image area — always same height, image fits without cropping */}
        {hasLogo ? (
          <div className="mb-2 flex h-16 w-full items-center justify-center px-2">
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-full w-full"
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        ) : (
          <h3
            className="text-[1.4rem] font-semibold tracking-[0.08em] text-zinc-950 dark:text-white sm:text-[1.6rem]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {brand.name}
          </h3>
        )}

        {/* Accent divider */}
        <div
          className="my-2 h-px w-10"
          style={{ background: `linear-gradient(90deg, transparent, ${brand.accent}, transparent)` }}
        />

        {/* Sub label */}
        <p className="text-[0.68rem] uppercase tracking-[0.28em]" style={{ color: `${brand.accent}dd` }}>
          {brand.subLabel}
        </p>

        {/* Show brand name below sub label when image is present */}
        {hasLogo && (
          <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.24em] text-zinc-600 dark:text-white/70">
            {brand.name}
          </p>
        )}
      </div>
    </article>
  );
}
import { useSsrData } from "@/ssr/SsrDataContext";

export default function WineTopBrands({ clickable = false, globalRoute = false, sectionHeader }) {
  const navigate = useNavigate();
  const { citySlug = "ghaziabad", propertySlug = "kennedia-blu" } = useParams();
  const { wineHomepage: ssr } = useSsrData();
  const ssrData = ssr?.allWineData;

  const [brands, setBrands] = useState(() => {
    if (ssrData) {
      const brandsData = ssrData.brands || [];
      const currentProp = (ssrData.properties || []).find(p => generateSlug(p.propertyName) === propertySlug);

      return brandsData
        .filter(b => {
          if (!b.active) return false;
          if (propertySlug && currentProp && !globalRoute) {
            const ids = b.propertyIds && b.propertyIds.length > 0 ? b.propertyIds : [b.propertyId];
            return ids.map(Number).includes(Number(currentProp.id));
          }
          return true;
        })
        .map((b, i) => ({
          id: b.id,
          name: b.name,
          subLabel: b.wineTypeName || "Premium Selection",
          accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
          detail: b.propertyNames?.length > 0 ? b.propertyNames.join(", ") : (b.description || "Harmony"),
          logo: b.media?.url || "",
          logoFit: "contain",
        }));
    }
    return [];
  });
  const [loading, setLoading] = useState(!ssrData);
  const [headerData, setHeaderData] = useState(ssr?.headerData || null);

  // sectionHeader (from Events API, renamed "Brands") takes priority
  const resolvedHeader = sectionHeader
    ? { part1: sectionHeader.header1 || "", part2: sectionHeader.header2 || "", description: sectionHeader.description || "" }
    : headerData;

  useEffect(() => {
    if (ssrData && globalRoute) return; // Already have data for global route
    
    const fetchBrands = async () => {
      try {
        const [brandsRes, propRes, propTypesRes] = await Promise.all([
          globalRoute ? getAllWineBrands() : null,
          GetAllPropertyDetails(),
          getPropertyTypes()
        ]);

        let brandsData = [];
        if (globalRoute) {
          brandsData = toList(brandsRes);
        } else {
          const allProps = toList(propRes);
          const currentProp = allProps.find(p => generateSlug(p.propertyName) === propertySlug);

          if (currentProp) {
            const res = await getWineBrandsByPropertyId(currentProp.id);
            brandsData = toList(res);
          } else {
            const res = await getAllWineBrands();
            brandsData = toList(res);
          }
        }

        const allProps = toList(propRes);
        const currentProp = allProps.find(p => generateSlug(p.propertyResponseDTO?.propertyName || p.propertyName) === propertySlug);

        const mapped = brandsData
          .filter(b => {
            if (!b.active) return false;
            if (propertySlug && currentProp) {
              const ids = b.propertyIds && b.propertyIds.length > 0 ? b.propertyIds : [b.propertyId];
              return ids.map(Number).includes(Number(currentProp.id));
            }
            return true;
          })
          .map((b, i) => ({
            id: b.id,
            name: b.name,
            subLabel: b.wineTypeName || "Premium Selection",
            accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
            detail: b.propertyNames?.length > 0 ? b.propertyNames.join(", ") : (b.description || "Harmony"),
            logo: b.media?.url || "",
            logoFit: "contain",
          }));

        setBrands(mapped);

        // Header Integration
        const propTypesData = propTypesRes?.data ?? [];
        const wineTypeObj = propTypesData.find(t => t.typeName?.toLowerCase() === "wine");
        if (wineTypeObj) {
          const headerRes = await getMenuSectionsByPropertyTypeId(wineTypeObj.id);
          const headers = headerRes?.data || [];
          const match = headers.find(h => h.isActive && (h.part1?.includes("Brand") || h.part1?.includes("Label")));
          if (match) setHeaderData(match);
        }
      } catch (error) {
        console.error("Failed to fetch wine brands:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [globalRoute, propertySlug, ssrData]);

  const handleBrandClick = (brand) => {
    if (!clickable) return;
    const targetId = brand.brandId || brand.id;
    if (globalRoute) {
      navigate(`/wine-categories/${targetId}?kind=brand`);
    } else {
      navigate(`/wine-detail/${citySlug}/${propertySlug}/${targetId}?kind=brand`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F0EAE2] py-8 text-zinc-950 transition-colors duration-500 dark:bg-[#100609] dark:text-white md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(193,154,83,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.04),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(193,154,83,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_28%)]" />

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-2 text-[0.68rem] uppercase tracking-[0.45em] text-[#c9a25a]">
            {resolvedHeader?.part1 || "Curated Labels"}
          </span>
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {resolvedHeader?.part2 || "Top Brands"}
          </h2>
          {resolvedHeader?.description && (
            <p className="mt-2 max-w-xl text-center text-xs leading-relaxed text-zinc-500 dark:text-white/60">
              {resolvedHeader.description}
            </p>
          )}
          <div className="mt-2 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a25a] to-transparent" />
        </div>

        <div className="relative mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#c9a25a]" size={32} />
            </div>
          ) : brands.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} onClick={clickable ? () => handleBrandClick(brand) : undefined} clickable={clickable} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-12 text-zinc-500 italic">
              No brands available at this moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
