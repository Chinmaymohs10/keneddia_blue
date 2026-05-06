import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  X,
  Grid3x3,
  List,
  ChevronDown,
  Search,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getEventsUpdated } from "@/Api/Api";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";
import { useSsrData } from "@/ssr/SsrDataContext";

const dateFilters = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Weekend", value: "weekend" },
  { label: "This Month", value: "month" },
];

const defaultFilters = {
  dateFilter: "",
  locations: [] as string[],
  eventTypes: [] as string[],
  statuses: [] as string[],
  categories: [] as string[],
};

// ============================================================================
// DYNAMIC MEDIA COMPONENT
// ============================================================================
const EventMedia = ({
  event,
  isListView,
}: {
  event: any;
  isListView: boolean;
}) => {
  const navigate = useNavigate();
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const OFFER_STYLE_PORTRAIT_RATIO = 1080 / 1920;

  const isVideo =
    event.image?.type === "VIDEO" || event.image?.url?.includes(".mp4");

  const analyzeMediaSize = (w: number, h: number) => {
    if (!isListView) {
      const ratio = w / h;
      if (ratio <= OFFER_STYLE_PORTRAIT_RATIO + 0.1) setIsBanner(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-500 bg-muted/20 ${
        isListView
          ? "w-full md:w-80 h-64 md:h-auto flex-shrink-0"
          : isBanner
            ? "h-full"
            : "h-64"
      }`}
      onClick={() => navigate(buildEventDetailPath(event))}
    >
      {event.image?.url ? (
        isVideo ? (
          <>
            <video
              ref={videoRef}
              src={event.image.url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              autoPlay
              loop
              muted
              playsInline
              onLoadedMetadata={(e) =>
                analyzeMediaSize(
                  e.currentTarget.videoWidth,
                  e.currentTarget.videoHeight,
                )
              }
            />
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 backdrop-blur-sm"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </>
        ) : (
          <img
            src={event.image.url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onLoad={(e) =>
              analyzeMediaSize(
                e.currentTarget.naturalWidth,
                e.currentTarget.naturalHeight,
              )
            }
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
        </div>
      )}

      <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
        {event.status?.replace(/_/g, " ")}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function EventsListing() {
  const ssrData = useSsrData();
  const initialEvents = Array.isArray(ssrData?.events?.items) ? ssrData.events.items : [];
  const hasInitialEvents = initialEvents.length > 0;
  const navigate = useNavigate();
  const [eventList, setEventList] = useState<any[]>(initialEvents);
  const [loading, setLoading] = useState(!hasInitialEvents);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previousOverflowY = root.style.overflowY;
    const previousScrollbarGutter = root.style.scrollbarGutter;

    root.style.overflowY = "scroll";
    root.style.scrollbarGutter = "stable";

    return () => {
      root.style.overflowY = previousOverflowY;
      root.style.scrollbarGutter = previousScrollbarGutter;
    };
  }, []);

  const fetchEvents = async () => {
    try {
      if (!hasInitialEvents) {
        setLoading(true);
      }
      const response = await getEventsUpdated();
      const data = response?.data || response || [];
      setEventList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      if (!hasInitialEvents) {
        setEventList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    

    return eventList.filter((event) => {
      if (!event.active) return false;

      const eventDateStr = event.eventDate; // already YYYY-MM-DD

      const isUpcoming = eventDateStr >= todayStr;

      // ✅ Tab logic
      if (activeTab === "upcoming" && !isUpcoming) return false;
      if (activeTab === "past" && isUpcoming) return false;

      // ======================
      // DATE FILTERS
      // ======================
      if (filters.dateFilter) {
        const today = todayStr;

        if (filters.dateFilter === "today") {
          if (eventDateStr !== today) return false;
        }

        if (filters.dateFilter === "tomorrow") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];

          if (eventDateStr !== tomorrowStr) return false;
        }

        if (filters.dateFilter === "weekend") {
          const day = new Date(eventDateStr).getDay();
          if (day !== 0 && day !== 6) return false;
        }

        if (filters.dateFilter === "month") {
          const now = new Date();
          const eventDate = new Date(eventDateStr);

          if (
            eventDate.getMonth() !== now.getMonth() ||
            eventDate.getFullYear() !== now.getFullYear()
          )
            return false;
        }
      }

      // ======================
      // OTHER FILTERS
      // ======================
      if (
        filters.locations.length > 0 &&
        !filters.locations.includes(event.locationName as never)
      )
        return false;

      if (
        filters.eventTypes.length > 0 &&
        !filters.eventTypes.includes(event.typeName as never)
      )
        return false;

      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(event.status as never)
      )
        return false;

      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(event.typeName as never)
      )
        return false;

      return true;
    });
  }, [eventList, activeTab, filters]);

  const uniqueLocations = [
    ...new Set(eventList.map((e) => e.locationName)),
  ].sort();
  const uniqueTypes = [...new Set(eventList.map((e) => e.typeName))].sort();
  const uniqueStatuses = [...new Set(eventList.map((e) => e.status))].sort();
  const hasActiveFilters =
    Boolean(filters.dateFilter) ||
    filters.locations.length > 0 ||
    filters.eventTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.categories.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
            {/* Sidebar with all filters restored */}
            <aside
              className={`fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-80px)] lg:top-20 w-80 lg:w-full bg-card border-r border-border/50 p-6 z-50 lg:z-0 transition-transform overflow-y-scroll ${filterSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
              style={{ scrollbarGutter: "stable" }}
            >
              <div className="sticky top-0 z-10 -mx-6 mb-8 flex items-center justify-between bg-card px-6 pb-4 pt-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-serif shrink-0">Filters</h3>
                  <button
                    type="button"
                    onClick={() => hasActiveFilters && setFilters(defaultFilters)}
                    disabled={!hasActiveFilters}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                      hasActiveFilters
                        ? "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                        : "border-border/60 bg-background text-muted-foreground/40 cursor-not-allowed"
                    }`}
                  >
                    <RotateCcw size={13} />
                    Clear
                  </button>
                </div>
                <X
                  className="lg:hidden cursor-pointer"
                  onClick={() => setFilterSidebarOpen(false)}
                />
              </div>

              {/* Date Filters */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">
                  Date
                </h4>
                <div className="space-y-2">
                  {dateFilters.map((d) => (
                    <label
                      key={d.value}
                      className="flex items-center gap-3 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="date"
                        checked={filters.dateFilter === d.value}
                        onChange={() =>
                          setFilters({ ...filters, dateFilter: d.value })
                        }
                        className="accent-primary"
                      />{" "}
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">
                  Location
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {uniqueLocations.map((loc) => (
                    <label
                      key={loc}
                      className="flex items-center gap-3 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(loc as never)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...filters.locations, loc]
                            : filters.locations.filter((l) => l !== loc);
                          setFilters({ ...filters, locations: next as any });
                        }}
                        className="accent-primary"
                      />{" "}
                      {loc}
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Type Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4">
                  Property Type
                </h4>
                <div className="space-y-2">
                  {uniqueTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.eventTypes.includes(type as never)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...filters.eventTypes, type]
                            : filters.eventTypes.filter((t) => t !== type);
                          setFilters({ ...filters, eventTypes: next as any });
                        }}
                        className="accent-primary"
                      />{" "}
                      {type}
                    </label>
                  ))}
                </div>
              </div>

            </aside>

            {/* Content Area */}
            <div className="py-12 px-6 lg:pl-10">
              <div className="mb-8 mt-8">
                <h2 className="text-3xl font-serif mb-2 mt-12">Events</h2>
                <div className="flex gap-8 border-b">
                  {["upcoming", "past"].map((tab: any) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-xs font-bold uppercase tracking-widest relative ${activeTab === tab ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {tab} Events{" "}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="tab-bar"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Toggle Moved Below Tabs for visibility */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredEvents.length} results
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setFilterSidebarOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted lg:hidden"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                  </button>
                  <div className="flex bg-muted p-1 rounded-lg border border-border/50">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === "card" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                    >
                      <Grid3x3 size={14} /> Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
                    >
                      <List size={14} /> List
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[420px] justify-center py-20">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 text-center">
                  <div className="max-w-sm space-y-2">
                    <h3 className="text-xl font-serif text-foreground">
                      No events found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try clearing or adjusting your filters to see more events.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "card"
                      ? "grid min-h-[420px] grid-cols-2 gap-4 md:gap-6 justify-items-center"
                      : "flex min-h-[420px] flex-col gap-6"
                  }
                >
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`group bg-card border rounded-xl overflow-hidden flex transition-all duration-300 hover:shadow-xl ${viewMode === "card" ? "flex-col w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] aspect-9/16" : "flex-col md:flex-row h-auto md:min-h-64"}`}
                      >
                        <EventMedia
                          event={event}
                          isListView={viewMode === "list"}
                        />

                        <div
                          className={`${viewMode === "card" ? "p-4" : "p-6"} flex flex-col flex-1 justify-between`}
                        >
                          <div>
                            <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase mb-2">
                              <Calendar size={12} />{" "}
                              {new Date(event.eventDate).toDateString()}
                              <span className="mx-2 opacity-20">|</span>
                              <MapPin size={12} /> {event.locationName}
                            </div>
                            <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors line-clamp-1">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>
                          {event.ctaText && (
                            <Link
                              to={buildEventDetailPath(event)}
                              className="mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all"
                            >
                              {activeTab === "past" ? "Explore Now" : event.ctaText} <ArrowRight size={14} />
                            </Link>
                          )}
                        </div>
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
