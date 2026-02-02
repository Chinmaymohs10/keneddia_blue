import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, MapPin, Clock, ArrowRight, Users, GlassWater, Sparkles, 
  Loader2, SlidersHorizontal, X, Grid3x3, List, ChevronDown, Search 
} from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getEventsUpdated } from "@/Api/Api";

const EVENT_NAV_ITEMS = [
  { type: 'link', label: 'WEDDINGS', key: 'weddings', href: '#collection' },
  { type: 'link', label: 'CORPORATE', key: 'corporate', href: '#collection' },
  { type: 'link', label: 'SOCIAL', key: 'social', href: '#collection' },
  { type: 'link', label: 'PLANNING', key: 'planning', href: '#collection' },
] as any[];

const categories = ["All Categories", "Music & Dining", "Celebration", "Culinary", "Community"];

const dateFilters = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Weekend", value: "weekend" },
  { label: "This Month", value: "month" },
];

const sortOptions = [
  { label: "Date: Earliest First", value: "date-asc" },
  { label: "Date: Latest First", value: "date-desc" },
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
];

// Filter Sidebar Component
const FilterSidebar = ({ 
  filters, 
  setFilters, 
  eventList, 
  isOpen, 
  onClose 
}: any) => {
  const uniqueLocations = useMemo(() => {
    const locations = eventList.map((e: any) => e.locationName).filter(Boolean);
    return [...new Set(locations)];
  }, [eventList]);

  const uniqueEventTypes = useMemo(() => {
    const types = eventList.map((e: any) => e.typeName).filter(Boolean);
    return [...new Set(types)];
  }, [eventList]);

  const [locationSearch, setLocationSearch] = useState("");

  const clearAllFilters = () => {
    setFilters({
      dateFilter: "",
      categories: [],
      locations: [],
      eventTypes: [],
    });
  };

  const hasActiveFilters = 
    filters.dateFilter || 
    filters.categories.length > 0 || 
    filters.locations.length > 0 || 
    filters.eventTypes.length > 0;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-80px)] lg:top-20
          w-80 lg:w-full bg-card border-r border-border/50
          overflow-y-auto z-50 lg:z-0
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-serif text-foreground">Filters</h3>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full mb-4 py-2 text-sm text-primary hover:text-primary/80 font-bold uppercase tracking-widest transition-colors"
            >
              Clear All Filters
            </button>
          )}

          {/* Date Filter */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">
              Date
            </h4>
            <div className="space-y-2">
              {dateFilters.map((date) => (
                <label
                  key={date.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="dateFilter"
                    value={date.value}
                    checked={filters.dateFilter === date.value}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFilter: e.target.value })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {date.label}
                  </span>
                </label>
              ))}
            </div>
            {filters.dateFilter && (
              <button
                onClick={() => setFilters({ ...filters, dateFilter: "" })}
                className="mt-2 text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">
              Categories
            </h4>
            <div className="space-y-2">
              {categories.filter(c => c !== "All Categories").map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({
                          ...filters,
                          categories: [...filters.categories, category],
                        });
                      } else {
                        setFilters({
                          ...filters,
                          categories: filters.categories.filter(
                            (c: string) => c !== category
                          ),
                        });
                      }
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
            {filters.categories.length > 0 && (
              <button
                onClick={() => setFilters({ ...filters, categories: [] })}
                className="mt-2 text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>

          {/* Location */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">
              Location
            </h4>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uniqueLocations
                .filter((loc: string) =>
                  loc.toLowerCase().includes(locationSearch.toLowerCase())
                )
                .map((location: string) => (
                  <label
                    key={location}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.locations.includes(location)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({
                            ...filters,
                            locations: [...filters.locations, location],
                          });
                        } else {
                          setFilters({
                            ...filters,
                            locations: filters.locations.filter(
                              (l: string) => l !== location
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                      {location}
                    </span>
                  </label>
                ))}
            </div>
            {filters.locations.length > 0 && (
              <button
                onClick={() => setFilters({ ...filters, locations: [] })}
                className="mt-2 text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>

          {/* Event Type */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">
              Event Type
            </h4>
            <div className="space-y-2">
              {uniqueEventTypes.map((type: string) => (
                <label
                  key={type}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.eventTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({
                          ...filters,
                          eventTypes: [...filters.eventTypes, type],
                        });
                      } else {
                        setFilters({
                          ...filters,
                          eventTypes: filters.eventTypes.filter(
                            (t: string) => t !== type
                          ),
                        });
                      }
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
            {filters.eventTypes.length > 0 && (
              <button
                onClick={() => setFilters({ ...filters, eventTypes: [] })}
                className="mt-2 text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

// Event Card Component
const EventCard = ({ event, onClick }: any) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-lg overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden">
        <OptimizedImage
          src={event.image?.url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
          {event.typeName || "General"}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center text-xs text-white font-bold uppercase tracking-widest">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(event.eventDate)}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 opacity-70" />
            {event.time || "Time TBA"}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 opacity-70" />
            <span className="truncate">{event.locationName}</span>
          </div>
        </div>

        <p className="text-muted-foreground/80 text-sm leading-relaxed mb-6 line-clamp-2">
          {event.description}
        </p>

        <div className="w-full py-3 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded flex items-center justify-center">
          View Details 
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

// Event List Row Component
const EventListRow = ({ event, onClick }: any) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-lg overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row"
    >
      <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
        <OptimizedImage
          src={event.image?.url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
          {event.typeName || "General"}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-serif text-foreground mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-muted-foreground/80 text-sm leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 opacity-70" />
              {event.time || "Time TBA"}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 opacity-70" />
              {event.locationName}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-border/50">
        <div className="text-right mb-4">
          <div className="flex items-center text-xs text-primary font-bold uppercase tracking-widest mb-1">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(event.eventDate)}
          </div>
        </div>
        <button className="px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors rounded flex items-center whitespace-nowrap">
          View Details
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default function Events() {
  const navigate = useNavigate();
  const [eventList, setEventList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    dateFilter: "",
    categories: [] as string[],
    locations: [] as string[],
    eventTypes: [] as string[],
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEventsUpdated({});
        const data = response?.data || response || [];
        setEventList(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const HERO_IMAGES = eventList.length > 0
    ? eventList.slice(0, 3).map((e) => ({ src: e.image?.url, alt: e.title }))
    : [{ src: "/images/placeholder.jpg", alt: "Events" }];

  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [HERO_IMAGES.length]);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...eventList];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((event) =>
        filters.categories.includes(event.typeName || "Music & Dining")
      );
    }

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter((event) =>
        filters.locations.includes(event.locationName)
      );
    }

    // Event type filter
    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter((event) =>
        filters.eventTypes.includes(event.typeName)
      );
    }

    // Date filter
    if (filters.dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.eventDate);
        
        switch (filters.dateFilter) {
          case "today":
            return eventDate.toDateString() === today.toDateString();
          case "tomorrow":
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventDate.toDateString() === tomorrow.toDateString();
          case "weekend":
            const thisWeekend = new Date(today);
            const day = today.getDay();
            const daysUntilSaturday = 6 - day;
            thisWeekend.setDate(today.getDate() + daysUntilSaturday);
            const sunday = new Date(thisWeekend);
            sunday.setDate(thisWeekend.getDate() + 1);
            return (
              eventDate.toDateString() === thisWeekend.toDateString() ||
              eventDate.toDateString() === sunday.toDateString()
            );
          case "month":
            return (
              eventDate.getMonth() === today.getMonth() &&
              eventDate.getFullYear() === today.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.eventDate).getTime();
      const dateB = new Date(b.eventDate).getTime();

      switch (sortBy) {
        case "date-asc":
          return dateA - dateB;
        case "date-desc":
          return dateB - dateA;
        case "popular":
          return 0; // Could implement popularity logic
        case "newest":
          return b.id - a.id;
        default:
          return dateA - dateB;
      }
    });

    return filtered;
  }, [eventList, filters, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar navItems={EVENT_NAV_ITEMS} />
      <section id="collection" className="bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0">
            {/* Left Sidebar - Filters */}
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              eventList={eventList}
              isOpen={filterSidebarOpen}
              onClose={() => setFilterSidebarOpen(false)}
            />

            {/* Right Content Area */}
            <div className="py-12 px-6 lg:pl-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-serif text-foreground mb-2">
                      Events in Bhubaneswar
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredAndSortedEvents.length} event
                      {filteredAndSortedEvents.length !== 1 ? "s" : ""} found
                    </p>
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setFilterSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs uppercase tracking-widest"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>
                </div>

                {/* Category Chips */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        if (cat === "All Categories") {
                          setFilters({ ...filters, categories: [] });
                        } else {
                          if (filters.categories.includes(cat)) {
                            setFilters({
                              ...filters,
                              categories: filters.categories.filter((c) => c !== cat),
                            });
                          } else {
                            setFilters({
                              ...filters,
                              categories: [...filters.categories, cat],
                            });
                          }
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        cat === "All Categories" && filters.categories.length === 0
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : filters.categories.includes(cat)
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-card border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-card border border-border/50 rounded-lg px-4 py-2 pr-10 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-card border border-border/50 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "card"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Events Listing */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : filteredAndSortedEvents.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/50 mb-6">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-serif text-foreground mb-2">
                    No Events Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to find more events
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        dateFilter: "",
                        categories: [],
                        locations: [],
                        eventTypes: [],
                      })
                    }
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg"
                  >
                    Clear All Filters
                  </button>
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
                    {filteredAndSortedEvents.map((event) =>
                      viewMode === "card" ? (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => navigate(`/events/${event.id}`)}
                        />
                      ) : (
                        <EventListRow
                          key={event.id}
                          event={event}
                          onClick={() => navigate(`/events/${event.id}`)}
                        />
                      )
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-background border-t border-border/10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
          <div className="order-2 md:order-1 relative h-[500px] w-full rounded-lg overflow-hidden">
            <OptimizedImage
              src={eventList[0]?.image?.url || "/images/placeholder.jpg"}
              alt="Weddings"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-2xl font-serif mb-2">Weddings at Kennedia</h3>
              <p className="text-white/90 font-light">
                Create timeless memories in our breathtaking venues.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">
              Start Planning
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Whether it's a corporate conference, a social gathering, or the wedding of your dreams, our team is here to bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg">
                Inquire Now
              </button>
              <button className="px-8 py-4 border border-primary text-primary font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors rounded-lg">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}