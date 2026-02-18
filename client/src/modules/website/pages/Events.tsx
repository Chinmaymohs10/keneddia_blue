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
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { getEventsUpdated } from "@/Api/Api";

const dateFilters = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Weekend", value: "weekend" },
  { label: "This Month", value: "month" },
];

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
  const [isBanner, setIsBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo =
    event.image?.type === "VIDEO" || event.image?.url?.includes(".mp4");

  const analyzeMediaSize = (w: number, h: number) => {
    if (!isListView) {
      const ratio = w / h;
      if (ratio <= 0.85) setIsBanner(true);
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
  const navigate = useNavigate();
  const [eventList, setEventList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [activeTab, setActiveTab] = useState<"upcoming" | "expired">(
    "upcoming",
  );
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFilter: "",
    locations: [] as string[],
    eventTypes: [] as string[],
    statuses: [] as string[],
    categories: [] as string[],
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEventsUpdated();
      const data = response?.data || response || [];
      setEventList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return eventList.filter((event) => {
      const eventDate = new Date(event.eventDate);
      const isUpcoming = eventDate >= now;
      if (activeTab === "upcoming" && !isUpcoming) return false;
      if (activeTab === "expired" && isUpcoming) return false;

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

      if (filters.dateFilter) {
        if (
          filters.dateFilter === "today" &&
          eventDate.toDateString() !== now.toDateString()
        )
          return false;
        // ... (other date filter logic if needed)
      }

      return true;
    });
  }, [eventList, activeTab, filters]);

  const uniqueLocations = [
    ...new Set(eventList.map((e) => e.locationName)),
  ].sort();
  const uniqueTypes = [...new Set(eventList.map((e) => e.typeName))].sort();
  const uniqueStatuses = [...new Set(eventList.map((e) => e.status))].sort();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
            {/* Sidebar with all filters restored */}
            <aside
              className={`fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-80px)] lg:top-20 w-80 lg:w-full bg-card border-r border-border/50 p-6 z-50 lg:z-0 transition-transform overflow-y-auto ${filterSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-serif">Filters</h3>
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
              <div className="mb-8">
                <h2 className="text-3xl font-serif mb-2">Events</h2>
                <div className="flex gap-8 border-b">
                  {["upcoming", "expired"].map((tab: any) => (
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
                    className="lg:hidden p-2 border rounded-lg"
                  >
                    <SlidersHorizontal size={18} />
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
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : (
                <div
                  className={
                    viewMode === "card"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-6"
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
                        className={`group bg-card border rounded-2xl overflow-hidden flex transition-all duration-500 hover:shadow-xl ${viewMode === "card" ? "flex-col h-[520px]" : "flex-col md:flex-row h-auto md:min-h-64"}`}
                      >
                        <EventMedia
                          event={event}
                          isListView={viewMode === "list"}
                        />

                        <div className="p-6 flex flex-col flex-1 justify-between">
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
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>
                          {event.ctaText && (
                            <Link
                              to={event.ctaLink || "#"}
                              className="mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all"
                            >
                              {event.ctaText} <ArrowRight size={14} />
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
