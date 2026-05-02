import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate, useParams } from "react-router-dom";
import { getAllWineBrands, getWineBrandsByPropertyId } from "@/Api/WineApi";
import { GetAllPropertyDetails } from "@/Api/Api";
import "swiper/css";
import "swiper/css/navigation";

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
export default function WineTopBrands({ clickable = false, globalRoute = false }) {
  const navigate = useNavigate();
  const { citySlug = "ghaziabad", propertySlug = "kennedia-blu" } = useParams();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        let brandsData = [];
        if (globalRoute) {
          const res = await getAllWineBrands();
          brandsData = toList(res);
        } else {
          // Try to get propertyId by slug
          const propRes = await GetAllPropertyDetails();
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
        
        const mapped = brandsData.filter(b => b.active).map((b, i) => ({
          id: b.id,
          name: b.name,
          subLabel: b.wineTypeName || "Premium Selection",
          accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
          detail: b.description || "Harmony",
          logo: b.media?.url || "",
          logoFit: "contain",
        }));
        setBrands(mapped);
      } catch (error) {
        console.error("Failed to fetch wine brands:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [globalRoute, propertySlug]);

  const handleBrandClick = (brand) => {
    if (!clickable) return;
    if (globalRoute) {
      navigate(`/wine-categories/${brand.id}`);
    } else {
      navigate(`/wine-detail/${citySlug}/${propertySlug}/${brand.id}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F0EAE2] py-8 text-zinc-950 transition-colors duration-500 dark:bg-[#100609] dark:text-white md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(193,154,83,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.04),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(193,154,83,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_28%)]" />

      <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-2 text-[0.68rem] uppercase tracking-[0.45em] text-[#c9a25a]">
            Curated Labels
          </span>
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Top Brands
          </h2>
         
          <div className="mt-2 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a25a] to-transparent" />
        </div>

        <div className="relative">
          <button
            type="button"
            className="wine-top-brands-prev absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-300/80 bg-white/90 text-zinc-700 shadow-md backdrop-blur-md transition hover:border-[#c9a25a]/60 hover:text-[#c9a25a] dark:border-white/15 dark:bg-white/10 dark:text-white/80 md:left-1 md:h-10 md:w-10 lg:left-0 cursor-pointer"
            aria-label="Previous brands"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            className="wine-top-brands-next absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-300/80 bg-white/90 text-zinc-700 shadow-md backdrop-blur-md transition hover:border-[#c9a25a]/60 hover:text-[#c9a25a] dark:border-white/15 dark:bg-white/10 dark:text-white/80 md:right-1 md:h-10 md:w-10 lg:right-0 cursor-pointer"
            aria-label="Next brands"
          >
            <ChevronRight size={20} />
          </button>

          <div className="px-6 sm:px-8 lg:px-12">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[#c9a25a]" size={32} />
              </div>
            ) : brands.length > 0 ? (
              <Swiper
                modules={[Navigation]}
                navigation={{
                  prevEl: ".wine-top-brands-prev",
                  nextEl: ".wine-top-brands-next",
                }}
                spaceBetween={16}
                slidesPerView={1.1}
                breakpoints={{
                  480: { slidesPerView: 1.35, spaceBetween: 14 },
                  640: { slidesPerView: 2.1, spaceBetween: 16 },
                  900: { slidesPerView: 3, spaceBetween: 16 },
                  1200: { slidesPerView: 4.2, spaceBetween: 18 },
                }}
              >
                {brands.map((brand) => (
                  <SwiperSlide key={brand.id} className="h-auto">
                    <BrandCard brand={brand} onClick={clickable ? () => handleBrandClick(brand) : undefined} clickable={clickable} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex justify-center py-12 text-zinc-500 italic">
                No brands available at this moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
