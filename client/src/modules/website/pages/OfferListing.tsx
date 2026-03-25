import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Tag,
  Clock,
  ExternalLink,
  Loader2,
  SlidersHorizontal,
  X,
  Grid3x3,
  List,
  Percent,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getDailyOffers } from "@/Api/Api";
import OfferVideo from "@/modules/website/components/OfferVideo";

// ============================================================================
// TYPES
// ============================================================================
interface OfferImage {
  src: string;
  type: "IMAGE" | "VIDEO";
  width: number | null;
  height: number | null;
  fileName: string | null;
  alt: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  couponCode: string | null;
  ctaText: string;
  ctaLink: string | null;
  expiresAt: string | undefined;
  activeDays: string[];
  propertyType: string;
  isExpiredOffer: boolean; // pre-computed
  image: OfferImage | null;
}

// ============================================================================
// HELPERS  (identical to DailyOffers)
// ============================================================================
const detectBanner = (image: OfferImage | null): boolean => {
  if (!image) return false;
  if (image.width && image.height && image.width / image.height <= 0.85) return true;
  const src = `${image.fileName || ""} ${image.src || ""}`.toLowerCase();
  if (src.includes("1080") || src.includes("1350") || src.includes("instagram_post")) return true;
  if (image.type === "VIDEO") return true;
  return false;
};

const isOfferExpired = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  const exp = new Date(expiresAt);
  exp.setHours(23, 59, 59, 999);
  return exp.getTime() <= Date.now();
};

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const todayName = DAYS[new Date().getDay()];

// ============================================================================
// COUNTDOWN TIMER
// ============================================================================
function CountdownTimer({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState("");
  const [expired, setExpired] = useState(false);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const exp = new Date(expiresAt);
      exp.setHours(23, 59, 59, 999);
      const diff = exp.getTime() - Date.now();
      if (diff <= 0) { setLabel("Expired"); setExpired(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(h < 2);
      setLabel(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    tick();
    const i = setInterval(tick, 60000);
    return () => clearInterval(i);
  }, [expiresAt]);

  if (!label) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white
      ${expired ? "bg-zinc-500" : urgent ? "bg-red-600 animate-pulse" : "bg-black/70"}`}>
      <Clock className="w-2.5 h-2.5" />{label}
    </span>
  );
}

// ============================================================================
// OFFER CARD  (grid + list variants)
// ============================================================================
function OfferCard({ offer, isListView }: { offer: Offer; isListView: boolean }) {
  const isBanner = detectBanner(offer.image);
  const hasContent = !!(offer.title || offer.description || offer.couponCode);
  const showFullImage = isBanner || !hasContent;
  const isClickable = !!offer.ctaLink;
  const hasCtaText = !!(offer.ctaText?.trim());
  const expired = offer.isExpiredOffer;

  return (
    <div className={`group bg-card border rounded-xl overflow-hidden flex transition-all duration-300 hover:shadow-xl
      ${isListView ? "flex-col md:flex-row h-auto md:min-h-56" : "flex-col h-[520px]"}
      ${expired ? "opacity-60 grayscale-[40%]" : "hover:border-primary/30"}`}
    >
      {/* ── Media ── */}
      <div className={`relative overflow-hidden bg-muted/20 flex-shrink-0
        ${isListView
          ? "w-full md:w-72 h-52 md:h-auto"
          : showFullImage ? "h-[340px]" : "h-56"}`}
      >
        {offer.image ? (
          offer.image.type === "VIDEO"
            ? <OfferVideo src={offer.image.src} />
            : <img
                src={offer.image.src}
                alt={offer.image.alt}
                className={`w-full h-full transition-transform duration-700 group-hover:scale-110
                  ${showFullImage ? "object-contain bg-black" : "object-cover object-center"}`}
              />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Percent className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {offer.propertyType && (
            <span className="bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {offer.propertyType}
            </span>
          )}
          {expired
            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-zinc-500"><Clock className="w-2.5 h-2.5" />Expired</span>
            : <CountdownTimer expiresAt={offer.expiresAt} />
          }
        </div>

        {/* Full-image hover overlay */}
        {showFullImage && !isListView && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
            {offer.title && <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{offer.title}</h3>}
            {offer.description && <p className="text-white/75 text-[11px] line-clamp-2 mb-3">{offer.description}</p>}
            {hasCtaText && (
              isClickable
                ? <a href={offer.ctaLink!} target="_blank" rel="noopener noreferrer"
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90">
                    {offer.ctaText} <ExternalLink size={12} />
                  </a>
                : <button disabled className="w-full bg-white/20 text-white py-2.5 rounded-lg text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2">
                    {offer.ctaText}
                  </button>
            )}
          </div>
        )}
      </div>

      {/* ── Text Content ── */}
      {(!showFullImage || isListView) && (
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            {offer.propertyType && (
              <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase mb-2">
                <Tag size={12} /> {offer.propertyType}
                {offer.activeDays?.length > 0 && (
                  <><span className="mx-1 opacity-20">|</span><Clock size={12} /> {offer.activeDays.join(", ")}</>
                )}
              </div>
            )}
            <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {offer.title}
            </h3>
            {offer.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed italic">
                {offer.description}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {offer.couponCode && (
              <div className="flex items-center gap-2 bg-muted/60 px-3 py-2 rounded-md border border-dashed border-primary/25 w-fit">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Code</span>
                <span className="font-mono font-black text-primary text-xs tracking-widest bg-card px-2 py-0.5 rounded shadow-sm border">
                  {offer.couponCode}
                </span>
              </div>
            )}
            {hasCtaText && (
              isClickable
                ? <a href={offer.ctaLink!} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground py-2.5 px-5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm">
                    {offer.ctaText} <ExternalLink size={12} />
                  </a>
                : <button disabled
                    className="inline-flex items-center gap-2 bg-muted/80 py-2.5 px-5 rounded-xl text-[11px] font-bold uppercase tracking-widest opacity-60 cursor-not-allowed">
                    {offer.ctaText}
                  </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function OfferListing() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    propertyTypes: [] as string[],
    days: [] as string[],
    hasCoupon: false,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getDailyOffers({ targetType: "GLOBAL", page: 0, size: 100 });
        const rawData = res.data?.data || res.data || [];
        const list: any[] = Array.isArray(rawData) ? rawData : rawData.content || [];

        const mapped: Offer[] = list
          .filter((o: any) => o.isActive)
          .map((o: any) => ({
            id: o.id,
            title: o.title || "",
            description: o.description || "",
            couponCode: o.couponCode || null,
            ctaText: o.ctaText || "",
            ctaLink: o.ctaUrl || o.ctaLink || null,
            expiresAt: o.expiresAt,
            activeDays: o.activeDays || [],
            propertyType: o.propertyTypeName || "",
            isExpiredOffer: isOfferExpired(o.expiresAt),
            image: o.image?.url
              ? { src: o.image.url, type: o.image.type, width: o.image.width, height: o.image.height, fileName: o.image.fileName, alt: o.title }
              : null,
          }));

        setAllOffers(mapped);
      } catch (err) {
        console.error("Failed to fetch offers:", err);
        setAllOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Unique filter options derived from data
  const uniquePropertyTypes = useMemo(() => [...new Set(allOffers.map((o) => o.propertyType).filter(Boolean))].sort(), [allOffers]);
  const uniqueDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

  const filteredOffers = useMemo(() => {
    return allOffers.filter((offer) => {
      // Tab
      if (activeTab === "active" && offer.isExpiredOffer) return false;
      if (activeTab === "expired" && !offer.isExpiredOffer) return false;

      // Property type
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(offer.propertyType)) return false;

      // Day filter
      if (filters.days.length > 0) {
        const offerDays = offer.activeDays;
        if (offerDays.length > 0 && !offerDays.some((d) => filters.days.includes(d))) return false;
      }

      // Coupon only
      if (filters.hasCoupon && !offer.couponCode) return false;

      return true;
    });
  }, [allOffers, activeTab, filters]);

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const activeCount = allOffers.filter((o) => !o.isExpiredOffer).length;
  const expiredCount = allOffers.filter((o) => o.isExpiredOffer).length;
  const hasActiveFilters = filters.propertyTypes.length > 0 || filters.days.length > 0 || filters.hasCoupon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">

            {/* ══════════════ SIDEBAR ══════════════ */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-80px)] lg:top-20
              w-80 lg:w-full bg-card border-r border-border/50 p-6 z-50 lg:z-0
              transition-transform overflow-y-auto
              ${filterSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-serif">Filters</h3>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={() => setFilters({ propertyTypes: [], days: [], hasCoupon: false })}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                  <X className="lg:hidden cursor-pointer" onClick={() => setFilterSidebarOpen(false)} />
                </div>
              </div>

              {/* Coupon Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Offer Type</h4>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasCoupon}
                    onChange={(e) => setFilters({ ...filters, hasCoupon: e.target.checked })}
                    className="accent-primary"
                  />
                  Has Coupon Code
                </label>
              </div>

              {/* Property Type Filter */}
              {uniquePropertyTypes.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Property Type</h4>
                  <div className="space-y-2">
                    {uniquePropertyTypes.map((type) => (
                      <label key={type} className="flex items-center gap-3 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.propertyTypes.includes(type)}
                          onChange={() => setFilters({ ...filters, propertyTypes: toggleArr(filters.propertyTypes, type) })}
                          className="accent-primary"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Valid On</h4>
                <div className="space-y-2">
                  {uniqueDays.map((day) => (
                    <label key={day} className="flex items-center gap-3 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.days.includes(day)}
                        onChange={() => setFilters({ ...filters, days: toggleArr(filters.days, day) })}
                        className="accent-primary"
                      />
                      <span className={day === todayName ? "text-primary font-bold" : ""}>
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                        {day === todayName && <span className="ml-1.5 text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">Today</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* ══════════════ CONTENT AREA ══════════════ */}
            <div className="pt-24 pb-12 px-6 lg:pl-10">

              {/* Page heading */}
              <div className="mb-8">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                </Link>

                <h2 className="text-3xl font-serif mb-2">Offers & Promotions</h2>

                {/* Tabs — identical pattern to EventsListing */}
                <div className="flex gap-8 border-b">
                  {([
                    { key: "active", label: "Active Offers", count: activeCount },
                    { key: "expired", label: "Past Offers", count: expiredCount },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`pb-4 text-xs font-bold uppercase tracking-widest relative flex items-center gap-2
                        ${activeTab === tab.key ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black
                        ${activeTab === tab.key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {tab.count}
                      </span>
                      {activeTab === tab.key && (
                        <motion.div layoutId="offer-tab-bar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls bar — identical to EventsListing */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filteredOffers.length}</span> result{filteredOffers.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-4">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setFilterSidebarOpen(true)}
                    className="lg:hidden p-2 border rounded-lg"
                  >
                    <SlidersHorizontal size={18} />
                  </button>

                  {/* Grid / List toggle */}
                  <div className="flex bg-muted p-1 rounded-lg border border-border/50">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all
                        ${viewMode === "card" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                    >
                      <Grid3x3 size={14} /> Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all
                        ${viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                    >
                      <List size={14} /> List
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : filteredOffers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Tag className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-base font-semibold">No offers found</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {hasActiveFilters
                      ? "No offers match the selected filters."
                      : activeTab === "expired"
                        ? "No past offers to display."
                        : "No active offers available right now."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => setFilters({ propertyTypes: [], days: [], hasCoupon: false })}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className={
                  viewMode === "card"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-6"
                }>
                  <AnimatePresence mode="popLayout">
                    {filteredOffers.map((offer) => (
                      <motion.div
                        key={offer.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <OfferCard offer={offer} isListView={viewMode === "list"} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
