import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  UtensilsCrossed,
  Search,
  ChevronDown,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getPropertiesByDineInAndTakeaway } from "@/Api/RestaurantApi";
import { generateSlug } from "@/lib/slugify";
import RestaurantReserveDialog from "./RestaurantReserveDialog";

const BOOKING_TYPES = [
  { value: "dineIn", label: "Dine In" },
  { value: "takeaway", label: "Takeaway" },
];

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

const getLocationOptionsFromProperties = (properties) => {
  const uniqueLocations = Array.from(
    new Set(
      (Array.isArray(properties) ? properties : [])
        .map((property) => property?.locationName?.trim())
        .filter(Boolean),
    ),
  );

  return uniqueLocations.map((locationName) => ({
    value: locationName,
    label: locationName,
  }));
};

export default function RestaurantQuickBooking() {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState("");
  const [location, setLocation] = useState("");
  const [allProperties, setAllProperties] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const selectedTypeLabel = BOOKING_TYPES.find((o) => o.value === bookingType)?.label ?? "";

  // Filter by selected location (client-side after search)
  const visibleProperties = useMemo(() => {
    if (!location) return allProperties;
    return allProperties.filter((p) => p.locationName === location);
  }, [allProperties, location]);

  const canSearch = Boolean(bookingType);

  const fetchPropertiesForBookingType = async (selectedBookingType) => {
    if (!selectedBookingType) {
      setAllProperties([]);
      setLocationOptions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const params =
        selectedBookingType === "dineIn" ? { dineIn: true } : { takeaway: true };
      const res = await getPropertiesByDineInAndTakeaway(params);
      const filtered = (res.data ?? []).filter(
        (p) =>
          p.isActive &&
          p.propertyTypes?.some((t) => t.toLowerCase() === "restaurant"),
      );
      setAllProperties(filtered);
      setLocationOptions(getLocationOptionsFromProperties(filtered));
      setIsOpen(true);
    } catch {
      setAllProperties([]);
      setLocationOptions([]);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!bookingType) return;
    setIsOpen(true);
  };

  const handleReserve = (property) => {
    if (property.bookingEngineUrl) {
      window.open(property.bookingEngineUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (bookingType === "dineIn") {
      const citySlug = generateSlug(property.locationName || "");
      const propertySlug = `${generateSlug(property.propertyName)}-${property.id}`;
      navigate(`/${citySlug}/${propertySlug}`);
    }
  };

  const clearFilters = () => {
    setBookingType("");
    setLocation("");
    setAllProperties([]);
    setLocationOptions([]);
    setIsOpen(false);
    setSelectedProperty(null);
    // locationOptions intentionally kept — pre-fetched from API
  };

  return (
    <div className="relative z-30 mb-12 mt-6 md:-mt-10 container mx-auto px-4">
      <RestaurantReserveDialog
        open={Boolean(selectedProperty)}
        onOpenChange={(open) => {
          if (!open) setSelectedProperty(null);
        }}
        property={selectedProperty}
      />

      <motion.div
        layout
        className="overflow-visible rounded-xl border border-border/50 bg-card shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-border/10 bg-primary/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-medium text-foreground">Find Your Table</h3>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Quick Restaurant Booking
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Booking Type */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Booking Type
              </Label>
              <CustomSelect
                options={BOOKING_TYPES}
                value={bookingType}
                onChange={(value) => {
                  setBookingType(value);
                  setLocation("");
                  fetchPropertiesForBookingType(value);
                }}
                placeholder="Choose booking type"
              />
            </div>

            {/* Location — populated from API results */}
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
                placeholder={bookingType ? "Choose location" : "Select booking type first"}
                disabled={!bookingType || loading || locationOptions.length === 0}
              />
            </div>

            {/* Search */}
            <div className="flex items-end cursor-pointer">
              <Button
                onClick={handleSearch}
                disabled={!canSearch || loading}
                className="h-14 w-full gap-2 bg-primary text-base font-bold uppercase tracking-wide text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 cursor-pointer" />
                )}
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          {(bookingType || location) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap items-center gap-2"
            >
              {bookingType && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <UtensilsCrossed className="h-3 w-3" />
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
                      Available Restaurants
                    </p>
                    <h3 className="mt-1.5 text-xl font-serif text-foreground">
                      {selectedTypeLabel} Options{location ? ` · ${location}` : ""}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {visibleProperties.length} option{visibleProperties.length === 1 ? "" : "s"} available
                  </p>
                </div>

                {visibleProperties.length > 0 ? (
                  <div className="space-y-3">
                    {visibleProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        className="overflow-hidden rounded-lg border border-border/50 bg-background transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-serif text-lg font-medium text-foreground">
                                {property.propertyName}
                              </h4>
                              {property.dineIn && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                                  Dine In
                                </span>
                              )}
                              {property.takeaway && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                                  Takeaway
                                </span>
                              )}
                            </div>
                            {property.propertyCategories?.length > 0 && (
                              <p className="mb-2 text-xs text-muted-foreground">
                                {property.propertyCategories.join(", ")}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                              {property.locationName && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <MapPin className="h-3 w-3 text-primary" />
                                  {property.locationName}
                                </span>
                              )}
                              {property.address && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <UtensilsCrossed className="h-3 w-3 text-primary" />
                                  {property.address}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 border-border/10 md:border-l md:pl-4">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Reservation Type</p>
                              <p className="text-lg font-bold text-primary">{selectedTypeLabel}</p>
                            </div>
                            {bookingType === "dineIn" ? (
                              <Button
                                size="sm"
                                className="w-full px-6 md:w-auto"
                                onClick={() => setSelectedProperty(property)}
                              >
                                Reserve
                              </Button>
                            ) : property.bookingEngineUrl ? (
                              <Button
                                size="sm"
                                className="w-full px-6 md:w-auto"
                                onClick={() => handleReserve(property)}
                              >
                                Reserve
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full px-6 md:w-auto"
                                onClick={() => {
                                  const citySlug = generateSlug(property.locationName || "");
                                  const propertySlug = `${generateSlug(property.propertyName)}-${property.id}`;
                                  navigate(`/${citySlug}/${propertySlug}`);
                                }}
                              >
                                Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="font-medium">No options available.</p>
                    <p className="mt-1 text-xs">
                      Try clearing the location filter or selecting a different booking type.
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
