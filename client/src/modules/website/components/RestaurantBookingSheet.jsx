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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getPropertiesByDineInAndTakeaway } from "@/Api/RestaurantApi";
import { generateSlug } from "@/lib/slugify";

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
        className="group flex h-12 w-full items-center justify-between rounded-md border border-border/60 bg-background/50 px-4 text-left text-sm font-normal transition-colors hover:border-primary/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {value === option.value && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const getLocationOptions = (properties) => {
  const unique = [
    ...new Set(
      (Array.isArray(properties) ? properties : [])
        .map((p) => p?.locationName?.trim())
        .filter(Boolean),
    ),
  ];
  return unique.map((name) => ({ value: name, label: name }));
};

export default function RestaurantBookingSheet({ isOpen, onOpenChange }) {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState("");
  const [location, setLocation] = useState("");
  const [allProperties, setAllProperties] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  const selectedTypeLabel =
    BOOKING_TYPES.find((o) => o.value === bookingType)?.label ?? "";

  const visibleProperties = useMemo(() => {
    if (!location) return allProperties;
    return allProperties.filter((p) => p.locationName === location);
  }, [allProperties, location]);

  const fetchProperties = async (type) => {
    if (!type) {
      setAllProperties([]);
      setLocationOptions([]);
      setResultsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const params = type === "dineIn" ? { dineIn: true } : { takeaway: true };
      const res = await getPropertiesByDineInAndTakeaway(params);
      const filtered = (res.data ?? []).filter(
        (p) =>
          p.isActive &&
          p.propertyTypes?.some((t) => t.toLowerCase() === "restaurant"),
      );
      setAllProperties(filtered);
      setLocationOptions(getLocationOptions(filtered));
      setResultsOpen(true);
    } catch {
      setAllProperties([]);
      setLocationOptions([]);
      setResultsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (property) => {
    onOpenChange(false);
    if (property.bookingEngineUrl) {
      window.open(property.bookingEngineUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const citySlug = generateSlug(property.locationName || "");
    const propertySlug = `${generateSlug(property.propertyName)}-${property.id}`;
    navigate(`/${citySlug}/${propertySlug}`);
  };

  const clearAll = () => {
    setBookingType("");
    setLocation("");
    setAllProperties([]);
    setLocationOptions([]);
    setResultsOpen(false);
  };

  const handleClose = (open) => {
    if (!open) clearAll();
    onOpenChange(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background text-foreground border-l border-border/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/10 bg-card/50 backdrop-blur-md relative">
          <button
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <SheetTitle className="text-xl font-serif font-medium">
            Find Your Table
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs mt-1">
            Quick Restaurant Booking
          </SheetDescription>
        </div>

        {/* Form + Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Booking Type */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Booking Type
            </Label>
            <CustomSelect
              options={BOOKING_TYPES}
              value={bookingType}
              onChange={(val) => {
                setBookingType(val);
                setLocation("");
                fetchProperties(val);
              }}
              placeholder="Choose booking type"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Location
            </Label>
            <CustomSelect
              options={locationOptions}
              value={location}
              onChange={(val) => {
                setLocation(val);
                setResultsOpen(true);
              }}
              placeholder={
                bookingType ? "Choose location" : "Select booking type first"
              }
              disabled={!bookingType || loading || locationOptions.length === 0}
            />
          </div>

          {/* Active filter chips */}
          {(bookingType || location) && (
            <div className="flex flex-wrap items-center gap-2">
              {bookingType && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <UtensilsCrossed className="h-3 w-3" />
                  {selectedTypeLabel}
                  <button
                    type="button"
                    onClick={clearAll}
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
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Results */}
          <AnimatePresence initial={false}>
            {!loading && resultsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="border-t border-border/10 pt-5 space-y-3"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Available Restaurants
                  </p>
                  <h3 className="mt-1 text-lg font-serif text-foreground">
                    {selectedTypeLabel} Options
                    {location ? ` · ${location}` : ""}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {visibleProperties.length} option
                    {visibleProperties.length === 1 ? "" : "s"} available
                  </p>
                </div>

                {visibleProperties.length > 0 ? (
                  <div className="space-y-2.5">
                    {visibleProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07, duration: 0.25 }}
                        className="overflow-hidden rounded-lg border border-border/50 bg-background transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="p-4">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h4 className="font-serif text-base font-medium text-foreground">
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
                          <div className="mb-3 flex flex-wrap items-center gap-3">
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
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleSelect(property)}
                          >
                            <Search className="mr-2 h-3.5 w-3.5" />
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="font-medium">No options available.</p>
                    <p className="mt-1 text-xs">
                      Try clearing the location filter or selecting a different
                      booking type.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
