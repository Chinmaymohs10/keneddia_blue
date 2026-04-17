import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Coffee,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ── Static data ──────────────────────────────────────────────────────────────

const VISIT_TYPES = [
  { value: "dineIn", label: "Dine In" },
  { value: "takeaway", label: "Takeaway" },
];

const CAFES = [
  {
    id: 1,
    name: "Kennedia Roast Room",
    locationName: "Ghaziabad",
    visitType: "dineIn",
    specialty: "Espresso Bar",
    timing: "8:00 AM – 10:30 PM",
    address: "Sector 4, Vaishali, Ghaziabad",
  },
  {
    id: 2,
    name: "Kennedia Library Cafe",
    locationName: "Delhi",
    visitType: "dineIn",
    specialty: "Quiet Seating + Artisan Brews",
    timing: "9:00 AM – 11:00 PM",
    address: "Connaught Place, New Delhi",
  },
  {
    id: 3,
    name: "Kennedia High Tea Lounge",
    locationName: "Noida",
    visitType: "dineIn",
    specialty: "Tea Towers + Desserts",
    timing: "11:30 AM – 9:30 PM",
    address: "Sector 18, Noida",
  },
  {
    id: 4,
    name: "Garden Brew Terrace",
    locationName: "Noida",
    visitType: "takeaway",
    specialty: "Cold Brew + Packed Bites",
    timing: "8:30 AM – 9:30 PM",
    address: "Sector 62, Noida",
  },
  {
    id: 5,
    name: "Brew & Co.",
    locationName: "Ghaziabad",
    visitType: "takeaway",
    specialty: "Quick Cups + Grab & Go Snacks",
    timing: "7:30 AM – 10:00 PM",
    address: "Indirapuram, Ghaziabad",
  },
  {
    id: 6,
    name: "The Leaf Lounge",
    locationName: "Delhi",
    visitType: "takeaway",
    specialty: "Artisan Teas + Pastry Boxes",
    timing: "10:00 AM – 8:00 PM",
    address: "Hauz Khas Village, New Delhi",
  },
];

// ── CustomSelect — identical structure to RestaurantQuickBooking ─────────────

function CustomSelect({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((c) => !c)}
        className="group flex h-14 w-full items-center justify-between rounded-md border border-border/60 bg-background/50 px-4 text-left text-sm font-normal transition-colors hover:border-primary/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg"
          >
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {option.label}
                  {value === option.value && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const getLocationOptionsFromCafes = (cafes) => {
  const uniqueLocations = Array.from(
    new Set(cafes.map((c) => c.locationName?.trim()).filter(Boolean)),
  );
  return uniqueLocations.map((loc) => ({ value: loc, label: loc }));
};

// ── Component ────────────────────────────────────────────────────────────────

export default function CafeQuickBooking() {
  const [visitType, setVisitType] = useState("");
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedTypeLabel = VISIT_TYPES.find((o) => o.value === visitType)?.label ?? "";

  // All cafes filtered by visit type (mirrors how restaurant filters by booking type)
  const allCafesForType = useMemo(() => {
    if (!visitType) return [];
    return CAFES.filter((c) => c.visitType === visitType);
  }, [visitType]);

  // Location options derived from the visit-type-filtered set
  const locationOptions = useMemo(
    () => getLocationOptionsFromCafes(allCafesForType),
    [allCafesForType],
  );

  // Further filter by selected location (client-side)
  const visibleCafes = useMemo(() => {
    if (!location) return allCafesForType;
    return allCafesForType.filter((c) => c.locationName === location);
  }, [allCafesForType, location]);

  const canSearch = Boolean(visitType);

  const handleSearch = () => {
    if (!visitType) return;
    setIsOpen(true);
  };

  const clearFilters = () => {
    setVisitType("");
    setLocation("");
    setIsOpen(false);
  };

  return (
    <div className="relative z-30 mb-12 -mt-10 container mx-auto px-4">
      <motion.div
        layout
        className="overflow-visible rounded-xl border border-border/50 bg-card shadow-2xl backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/10 bg-primary/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-medium text-foreground">Find Your Cafe</h3>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Quick Cafe Booking
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Selects + Search button */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Visit Type */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Booking Type
              </Label>
              <CustomSelect
                options={VISIT_TYPES}
                value={visitType}
                onChange={(value) => {
                  setVisitType(value);
                  setLocation("");
                  setIsOpen(false);
                }}
                placeholder="Choose visit type"
              />
            </div>

            {/* Location — derived from visit type selection */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Location
              </Label>
              <CustomSelect
                options={locationOptions}
                value={location}
                onChange={(value) => {
                  setLocation(value);
                  setIsOpen(true);
                }}
                placeholder={visitType ? "Choose location" : "Select visit type first"}
                disabled={!visitType || locationOptions.length === 0}
              />
            </div>

            {/* Search */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={!canSearch}
                className="h-14 w-full gap-2 bg-primary text-base font-bold uppercase tracking-wide text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-70"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          {(visitType || location) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap items-center gap-2"
            >
              {visitType && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <Coffee className="h-3 w-3" />
                  {selectedTypeLabel}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <MapPin className="h-3 w-3" />
                  {location}
                  <button
                    type="button"
                    onClick={() => setLocation("")}
                    className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {isOpen && (
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-auto rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Hide Results
                </Button>
              )}
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="cards"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: "hidden" }}
                className="border-t border-border/10 pt-6"
              >
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Available Cafes
                    </p>
                    <h3 className="mt-1.5 text-xl font-serif text-foreground">
                      {selectedTypeLabel} Options{location ? ` · ${location}` : ""}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {visibleCafes.length} option{visibleCafes.length === 1 ? "" : "s"} available
                  </p>
                </div>

                {visibleCafes.length > 0 ? (
                  <div className="space-y-3">
                    {visibleCafes.map((cafe, index) => (
                      <motion.div
                        key={cafe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        className="overflow-hidden rounded-lg border border-border/50 bg-background transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-serif text-lg font-medium text-foreground">
                                {cafe.name}
                              </h4>
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                                {selectedTypeLabel}
                              </span>
                            </div>
                            <p className="mb-2 text-xs text-muted-foreground">{cafe.specialty}</p>
                            <div className="flex flex-wrap items-center gap-3">
                              {cafe.locationName && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <MapPin className="h-3 w-3 text-primary" />
                                  {cafe.locationName}
                                </span>
                              )}
                              {cafe.address && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Coffee className="h-3 w-3 text-primary" />
                                  {cafe.address}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 border-border/10 md:border-l md:pl-4">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Visit Type</p>
                              <p className="text-lg font-bold text-primary">{selectedTypeLabel}</p>
                            </div>
                            <Button
                              size="sm"
                              className="w-full px-6 md:w-auto"
                              onClick={() =>
                                document
                                  .getElementById("reservation")
                                  ?.scrollIntoView({ behavior: "smooth" })
                              }
                            >
                              Reserve
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="font-medium">No options available.</p>
                    <p className="mt-1 text-xs">
                      Try clearing the location filter or selecting a different visit type.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
