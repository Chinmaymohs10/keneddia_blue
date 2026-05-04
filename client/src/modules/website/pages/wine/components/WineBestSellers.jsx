import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ImageOff,
  MapPin,
  ChevronDown,
  Building2,
} from "lucide-react";
import {
  getAllWineTypes,
  getAllWineBrands,
  getAllWineCategories,
  getAllWineSubCategories,
} from "@/Api/WineApi";
import { getAllProperties, getPropertyTypes } from "@/Api/Api";
import { getMenuSectionsByPropertyTypeId } from "@/Api/RestaurantApi";
import {
  generateWineCards,
  buildTypeAccents,
  extractWineFilters,
} from "@/utils/wineDataUtils";

const DEFAULT_ACCENTS = {
  color: "#8B1A2A",
  light: "#FDF2F4",
  dot: "#C4485A",
};

function generateSlug(text) {
  return text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function WineImage({ src, alt, className = "" }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-100 dark:bg-zinc-900 ${className}`}
      >
        <ImageOff size={20} className="text-stone-300 dark:text-zinc-700" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  );
}

function FilterSelect({ value, options, onChange, label }) {
  return (
    <div className="relative">
      <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.22em] text-stone-400 dark:text-stone-600">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full min-w-0 sm:min-w-[148px] cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-stone-800 shadow-sm outline-none transition-all focus:border-stone-400 dark:border-white/10 dark:bg-[#1A0C12] dark:text-stone-200 dark:focus:border-white/20"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
        />
      </div>
    </div>
  );
}

function WineCard({ wine, index, typeAccents = {} }) {
  const navigate = useNavigate();
  const accent = typeAccents[wine.type] || DEFAULT_ACCENTS;

  const handleExplore = () => {
    const citySlug = generateSlug(wine.locationDisplay || wine.location);
    const propertySlug = generateSlug(wine.property);
    navigate(`/wine-detail/${citySlug}/${propertySlug}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
      onClick={handleExplore}
      className="group relative flex cursor-pointer overflow-hidden rounded-[1.5rem] border border-stone-200/90 bg-white shadow-[0_20px_50px_rgba(120,71,35,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(120,71,35,0.14)] dark:border-white/10 dark:bg-[#1A0C12]"
    >
      <div className="flex h-full w-full flex-col overflow-hidden sm:flex-row sm:min-h-[288px]">
        <div className="relative h-[190px] w-full shrink-0 overflow-hidden sm:h-auto sm:w-[38%] sm:min-w-[150px]">
          <WineImage
            src={wine.image}
            alt={wine.name}
            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-transparent via-transparent to-white/90 dark:to-[#1A0C12]/90" />
          <div
            className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: accent.dot }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-5 py-6 text-center sm:px-4 sm:py-5">
          <div className="mb-3 flex flex-col items-center gap-2">
            <div className="flex max-w-full items-start gap-1.5">
              <Building2 size={10} className="mt-[2px] shrink-0" style={{ color: accent.color }} />
              <span
                className="line-clamp-2 text-[8px] font-black uppercase leading-[1.5] tracking-[0.18em]"
                style={{ color: accent.color }}
              >
                {wine.property}{wine.location && wine.location !== "_" ? ` · ${wine.location}` : ""}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <h3 className="font-serif text-[1.4rem] leading-tight text-stone-950 dark:text-stone-100">
                {wine.name}
              </h3>
              {wine.subtitle && (
                <p 
                  className="text-[11px] font-medium italic text-stone-400 hover:text-[#8B1A2A] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cSlug = generateSlug(wine.locationDisplay || wine.location);
                    const pSlug = generateSlug(wine.property);
                    const sSlug = wine.subCategoryId || generateSlug(wine.subtitle);
                    navigate(`/wine-detail/${cSlug}/${pSlug}/sub/${sSlug}`);
                  }}
                >
                  {wine.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="mb-3">
            <span
              className="rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest"
              style={{
                color: accent.color,
                backgroundColor: accent.light,
                border: `1px solid ${accent.color}30`,
              }}
            >
              {wine.category || wine.tag || wine.type}
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

import { useSsrData } from "@/ssr/SsrDataContext";

export default function WineBestSellers() {
  const { wineHomepage: ssr } = useSsrData();
  const ssrData = ssr?.allWineData;

  const [location, setLocation] = useState("All Locations");
  const [wineType, setWineType] = useState("All Types");
  const [expanded, setExpanded] = useState(false);
  const [wines, setWines] = useState(ssrData?.allCards || []);
  const [locations, setLocations] = useState(() => {
    if (ssrData?.allCards) {
      const { locations: locs } = extractWineFilters(ssrData.allCards);
      return locs;
    }
    return ["All Locations"];
  });
  const [wineTypes, setWineTypes] = useState(() => {
    if (ssrData?.allCards) {
      const { types: types_ } = extractWineFilters(ssrData.allCards);
      return types_;
    }
    return ["All Types"];
  });
  const [typeAccents, setTypeAccents] = useState(() => {
    if (ssrData?.types) {
      return buildTypeAccents(ssrData.types);
    }
    return {};
  });
  const [loading, setLoading] = useState(!ssrData);
  const [headerData, setHeaderData] = useState(ssr?.headerData || null);

  useEffect(() => {
    if (ssrData) return;
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

        const wineTypesData = typesRes?.data ?? [];
        const brandsData = brandsRes?.data ?? [];
        const categoriesData = catsRes?.data ?? [];
        const subCatsData = subCatsRes?.data ?? [];
        const propertiesData = propsRes?.data ?? [];
        const propTypesData = propTypesRes?.data ?? [];

        // Fetch Header Data
        const wineTypeObj = propTypesData.find(t => t.typeName?.toLowerCase() === "wine");
        if (wineTypeObj) {
          const headerRes = await getMenuSectionsByPropertyTypeId(wineTypeObj.id);
          const activeHeader = headerRes?.data?.find(h => h.isActive);
          if (activeHeader) setHeaderData(activeHeader);
        }

        const cards = generateWineCards({
          brands: brandsData,
          wineTypes: wineTypesData,
          categories: categoriesData,
          subCategories: subCatsData,
          properties: propertiesData,
          homepageOnly: true,
        });

        const accents = buildTypeAccents(wineTypesData);
        const { locations: locs, types: types_ } = extractWineFilters(cards);

        setWines(cards);
        setTypeAccents(accents);
        setLocations(locs);
        setWineTypes(types_);
      } catch (_) {
        // silently leave empty state — no crash
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, [ssrData]);

  const filtered = useMemo(() => {
    return wines.filter((wine) => {
      const locationMatch = location === "All Locations" || wine.location === location;
      const typeMatch = wineType === "All Types" || wine.type === wineType;
      return locationMatch && typeMatch;
    });
  }, [wines, location, wineType]);

  useEffect(() => {
    setExpanded(false);
  }, [location, wineType]);

  const visibleWines = expanded ? filtered : filtered.slice(0, 6);
  const hasMore = filtered.length > 6;

  return (
    <section className="relative overflow-hidden bg-[#FAF8F4] pb-16 pt-16 dark:bg-[#0D0508]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.016] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />
      <div
        className="pointer-events-none absolute -right-48 top-0 h-[640px] w-[640px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #8B1A2A 0%, transparent 70%)",
          opacity: 0.06,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-48 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #9A7A10 0%, transparent 70%)",
          opacity: 0.05,
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B1A2A]/20 bg-[#8B1A2A]/[0.07] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-[#8B1A2A] dark:border-[#C8956A]/20 dark:bg-[#C8956A]/[0.08] dark:text-[#C8956A]">
              <Sparkles className="h-3 w-3" />
              {headerData?.part1 || "Wine Collection"}
            </div>
            <h2 className="mb-2 font-serif text-3xl leading-[1.2] text-stone-900 md:text-[2.5rem] dark:text-stone-100">
              {headerData?.part2 || (
                <>
                  Handpicked from the{" "}
                  <em className="not-italic text-[#8B1A2A] dark:text-[#C8956A]">
                    world&rsquo;s finest vineyards
                  </em>
                </>
              )}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-500">
              {headerData?.description || "A curated showcase in the same editorial card format used on the wine detail page."}
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-end">
            <FilterSelect
              label="Location"
              value={location}
              options={locations}
              onChange={setLocation}
            />
            <FilterSelect
              label="Liquor Type"
              value={wineType}
              options={wineTypes}
              onChange={setWineType}
            />
            {/* <div className="flex h-9 items-center rounded-xl border border-[#8B1A2A]/20 bg-[#8B1A2A]/[0.07] px-3.5 text-[12px] font-black text-[#8B1A2A] dark:border-[#C8956A]/20 dark:bg-[#C8956A]/[0.08] dark:text-[#C8956A]">
              {filtered.length}&nbsp;
              <span className="font-normal text-[#8B1A2A]/60 dark:text-[#C8956A]/60">
                wine{filtered.length !== 1 ? "s" : ""}
              </span>
            </div> */}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-[2rem] border border-dashed border-stone-300/80 bg-white/50 px-6 py-20 text-center text-sm text-stone-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-600">
            Loading collection…
          </div>
        ) : filtered.length ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleWines.map((wine, index) => (
                <WineCard key={wine.id} wine={wine} index={index} typeAccents={typeAccents} />
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
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center rounded-[2rem] border border-dashed border-stone-300/80 bg-white/50 px-6 py-20 text-center text-sm text-stone-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-500">
            No wines match this filter combination.
          </div>
        )}
      </div>
    </section>
  );
}
