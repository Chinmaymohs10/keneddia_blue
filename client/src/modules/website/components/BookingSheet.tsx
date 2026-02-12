"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Calendar from "@/components/ui/calendar"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronRight, User, Calendar as CalendarIcon, CreditCard, ChevronLeft, Users, Minus, Plus, BedDouble, Utensils, ShoppingBag, X } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { cn } from "@/lib/utils"

// ============================================================================
// BOOKING CONFIGURATION - Centralized
// ============================================================================

// Location Data
const LOCATIONS = [
  { value: "kennedia-blu-bangalore", label: "Kennedia Blu - Bangalore (MG Road)", stars: 5 },
  { value: "kennedia-grand-mumbai", label: "Kennedia Grand - Mumbai (Juhu)", stars: 5 },
  { value: "kennedia-resort-goa", label: "Kennedia Resort - Goa (Calangute)", stars: 5 },
  { value: "kennedia-suites-delhi", label: "Kennedia Suites - New Delhi", stars: 5 },
]

// Guest Configuration
const GUEST_CONFIG = {
  adults: {
    min: 1,
    max: 10,
    default: 2,
    label: "Adults",
    description: "Age 13+",
  },
  children: {
    min: 0,
    max: 8,
    default: 0,
    label: "Children",
    description: "Age 2-12",
  },
  infants: {
    min: 0,
    max: 4,
    default: 0,
    label: "Infants",
    description: "Under 2",
  },
} as const

// Date Configuration
const DATE_CONFIG = {
  minDate: new Date(),
  maxDate: addDays(new Date(), 365),
  defaultCheckIn: new Date(),
  defaultCheckOut: addDays(new Date(), 1),
} as const

// Step Configuration
const STEPS = {
  CATEGORY: 0,
  LOCATION: 1,
  DETAILS: 2,
  CHECKOUT: 3,
} as const

const STEP_LABELS = {
  [STEPS.CATEGORY]: "Select Service",
  [STEPS.LOCATION]: "Select Location",
  [STEPS.DETAILS]: "Select Dates & Guests",
  [STEPS.CHECKOUT]: "Checkout",
} as const

// Text Content
const TEXT_CONTENT = {
  titles: {
    hotel: "Book a Stay",
    dining: "Reserve a Table",
    delivery: "Order Food",
    default: "Booking",
  },
  buttons: {
    confirmContinue: "Confirm & Continue",
    proceedToPay: "Proceed to Pay",
  },
  placeholders: {
    search: "Search location...",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
    selectDate: "Select date",
  },
  labels: {
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    totalAmount: "Total Amount",
    checkIn: "Check-in Date",
    checkOut: "Check-out Date",
    guests: "Guests",
    nights: "Night(s)",
  },
  messages: {
    noLocations: "No locations found.",
    propertyFeatures: "5 Star Luxury Property • Free Cancellation",
    securePayment: "Secured by Kennedia SafePay. By proceeding, you agree to our Terms.",
    showingAvailability: (category: string) => `Showing ${category} availability for nearby properties.`,
  },
} as const

// ============================================================================
// TYPES
// ============================================================================

interface BookingSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  category: "hotel" | "dining" | "delivery" | null
}

interface GuestCount {
  adults: number
  children: number
  infants: number
}

interface DateRange {
  checkIn: Date | undefined
  checkOut: Date | undefined
}

// ============================================================================
// MAIN BOOKING SHEET COMPONENT
// ============================================================================

export function BookingSheet({ isOpen, onOpenChange, category }: BookingSheetProps) {
  const [step, setStep] = useState<number>(category ? STEPS.LOCATION : STEPS.CATEGORY)
  const [internalCategory, setInternalCategory] = useState<"hotel" | "dining" | "delivery" | null>(category)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    checkIn: DATE_CONFIG.defaultCheckIn,
    checkOut: DATE_CONFIG.defaultCheckOut,
  })
  const [guests, setGuests] = useState<GuestCount>({
    adults: GUEST_CONFIG.adults.default,
    children: GUEST_CONFIG.children.default,
    infants: GUEST_CONFIG.infants.default,
  })

  // Update internal category when prop changes
  useEffect(() => {
    if (category) {
      setInternalCategory(category)
    }
  }, [category])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(category ? STEPS.LOCATION : STEPS.CATEGORY)
      if (!category) setInternalCategory(null) // Reset if opening via generic trigger
      setSelectedLocation(null)
      setDateRange({
        checkIn: DATE_CONFIG.defaultCheckIn,
        checkOut: DATE_CONFIG.defaultCheckOut,
      })
      setGuests({
        adults: GUEST_CONFIG.adults.default,
        children: GUEST_CONFIG.children.default,
        infants: GUEST_CONFIG.infants.default,
      })
    }
  }, [isOpen, category])

  const handleCategorySelect = (cat: "hotel" | "dining" | "delivery") => {
    setInternalCategory(cat)
    setStep(STEPS.LOCATION)
  }

  const handleSelect = (value: string) => {
    setSelectedLocation(value)
    setStep(STEPS.DETAILS)
  }

  const handleBack = () => {
    if (step > STEPS.LOCATION) setStep(step - 1)
  }

  const getTitle = () => {
    const currentCat = internalCategory || category
    if (!currentCat) return TEXT_CONTENT.titles.default
    return TEXT_CONTENT.titles[currentCat] || TEXT_CONTENT.titles.default
  }

  const getTotalGuests = () => {
    return guests.adults + guests.children + guests.infants
  }

  const getNights = () => {
    if (!dateRange.checkIn || !dateRange.checkOut) return 0
    return differenceInDays(dateRange.checkOut, dateRange.checkIn)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background text-foreground border-l border-border/10">

        {/* Header with Back Button */}
        <BookingHeader
          step={step}
          onBack={handleBack}
          onClose={() => onOpenChange(false)}
          title={getTitle()}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {step === STEPS.CATEGORY && (
            <CategoryStep onSelect={handleCategorySelect} />
          )}

          {step === STEPS.LOCATION && (
            <LocationStep
              category={internalCategory || category}
              onSelect={handleSelect}
            />
          )}

          {step === STEPS.DETAILS && (
            <DetailsStep
              selectedLocation={selectedLocation}
              dateRange={dateRange}
              setDateRange={setDateRange}
              guests={guests}
              setGuests={setGuests}
              onContinue={() => setStep(STEPS.CHECKOUT)}
              getTotalGuests={getTotalGuests}
              getNights={getNights}
            />
          )}

          {step === STEPS.CHECKOUT && (
            <CheckoutStep
              selectedLocation={selectedLocation}
              dateRange={dateRange}
              guests={guests}
              getNights={getNights}
            />
          )}
        </div>

      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Booking Header Component
interface BookingHeaderProps {
  step: number
  onBack: () => void
  onClose: () => void
  title: string
}

function BookingHeader({ step, onBack, onClose, title }: BookingHeaderProps) {
  return (
    <div className="p-6 border-b border-border/10 bg-card/50 backdrop-blur-md relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors z-50"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-2 pr-8">
        {step > STEPS.LOCATION && (
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors -ml-2">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <SheetTitle className="text-xl font-serif font-medium">{title}</SheetTitle>
      </div>
      <SheetDescription className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
        Step {step} of {STEPS.CHECKOUT} • {STEP_LABELS[step as keyof typeof STEP_LABELS]}
      </SheetDescription>
    </div>
  )
}

// Category Step Component
function CategoryStep({ onSelect }: { onSelect: (cat: "hotel" | "dining" | "delivery") => void }) {
  const options = [
    { id: "hotel", label: "Book a Stay", icon: BedDouble, desc: "Luxury rooms & suites" },
    { id: "dining", label: "Reserve Table", icon: Utensils, desc: "Fine dining experiences" },
    { id: "delivery", label: "Order Food", icon: ShoppingBag, desc: "In-room dining" },
  ] as const

  return (
    <div className="p-6 space-y-4">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/10 bg-card/50 hover:bg-card hover:border-primary/20 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <opt.icon className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{opt.label}</div>
            <div className="text-xs text-muted-foreground">{opt.desc}</div>
          </div>
          <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground/50 group-hover:text-primary transition-colors" />
        </button>
      ))}
    </div>
  )
}

// Location Step Component
interface LocationStepProps {
  category: "hotel" | "dining" | "delivery" | null
  onSelect: (value: string) => void
}

function LocationStep({ category, onSelect }: LocationStepProps) {
  return (
    <div className="p-4 h-full flex flex-col">
      <Command className="border border-border/10 rounded-lg bg-card/30">
        <CommandInput
          placeholder={TEXT_CONTENT.placeholders.search}
          className="text-foreground placeholder:text-muted-foreground/50 border-none"
        />
        <CommandList className="max-h-[500px]">
          <CommandEmpty className="py-6 text-sm text-muted-foreground">
            {TEXT_CONTENT.messages.noLocations}
          </CommandEmpty>
          <CommandGroup heading="Available Locations" className="text-muted-foreground">
            {LOCATIONS.map((loc) => (
              <CommandItem
                key={loc.value}
                onSelect={() => onSelect(loc.value)}
                className="flex items-center justify-between py-3 cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
              >
                <span className="font-medium text-foreground">{loc.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
        <p>{TEXT_CONTENT.messages.showingAvailability(category || "property")}</p>
      </div>
    </div>
  )
}

// Details Step Component
interface DetailsStepProps {
  selectedLocation: string | null
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  guests: GuestCount
  setGuests: (guests: GuestCount) => void
  onContinue: () => void
  getTotalGuests: () => number
  getNights: () => number
}

function DetailsStep({
  selectedLocation,
  dateRange,
  setDateRange,
  guests,
  setGuests,
  onContinue,
  getTotalGuests,
  getNights
}: DetailsStepProps) {
  const location = LOCATIONS.find(l => l.value === selectedLocation)

  return (
    <div className="p-6 space-y-6">
      {/* Location Card */}
      <LocationCard location={location} />

      {/* Date Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Select Dates</h3>
        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            date={dateRange.checkIn}
            onSelect={(date) => setDateRange({ ...dateRange, checkIn: date })}
            label={TEXT_CONTENT.labels.checkIn}
            minDate={DATE_CONFIG.minDate}
          />
          <DatePicker
            date={dateRange.checkOut}
            onSelect={(date) => setDateRange({ ...dateRange, checkOut: date })}
            label={TEXT_CONTENT.labels.checkOut}
            minDate={dateRange.checkIn ? addDays(dateRange.checkIn, 1) : DATE_CONFIG.minDate}
          />
        </div>
        {dateRange.checkIn && dateRange.checkOut && (
          <p className="text-xs text-muted-foreground text-center">
            {getNights()} {TEXT_CONTENT.labels.nights}
          </p>
        )}
      </div>

      {/* Guest Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {TEXT_CONTENT.labels.guests}
        </h3>
        <GuestSelector guests={guests} setGuests={setGuests} />
        <p className="text-xs text-muted-foreground text-center">
          Total: {getTotalGuests()} guest{getTotalGuests() !== 1 ? 's' : ''}
        </p>
      </div>

      <Button
        onClick={onContinue}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base"
      >
        {TEXT_CONTENT.buttons.confirmContinue}
      </Button>
    </div>
  )
}

// Location Card Component
function LocationCard({ location }: { location: typeof LOCATIONS[0] | undefined }) {
  if (!location) return null

  return (
    <div className="rounded-xl border border-border/10 bg-card overflow-hidden">
      <div className="h-32 bg-muted/20 relative">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-sm font-medium">
          Selected Property Image
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-medium text-foreground mb-1">
          {location.label}
        </h3>
        <p className="text-sm text-muted-foreground">
          {TEXT_CONTENT.messages.propertyFeatures}
        </p>
      </div>
    </div>
  )
}

// Date Picker Component
interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  label: string
  minDate?: Date
}

function DatePicker({ date, onSelect, label, minDate }: DatePickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-card/50 border-border/20 hover:bg-card",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMM dd, yyyy") : TEXT_CONTENT.placeholders.selectDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            value={date}
            onChange={(value) => {
              if (value instanceof Date) {
                onSelect(value);
              } else if (Array.isArray(value) && value[0]) {
                onSelect(value[0]);
              }
            }}
            minDate={minDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Guest Selector Component
interface GuestSelectorProps {
  guests: GuestCount
  setGuests: (guests: GuestCount) => void
}

function GuestSelector({ guests, setGuests }: GuestSelectorProps) {
  const handleGuestChange = (type: keyof GuestCount, delta: number) => {
    const config = GUEST_CONFIG[type]
    const newValue = Math.max(config.min, Math.min(config.max, guests[type] + delta))
    setGuests({ ...guests, [type]: newValue })
  }

  return (
    <div className="space-y-3 p-4 rounded-lg bg-card/50 border border-border/10">
      {(Object.keys(GUEST_CONFIG) as Array<keyof typeof GUEST_CONFIG>).map((type) => (
        <GuestCounter
          key={type}
          type={type}
          count={guests[type]}
          config={GUEST_CONFIG[type]}
          onChange={(delta) => handleGuestChange(type, delta)}
        />
      ))}
    </div>
  )
}

// Guest Counter Component
interface GuestCounterProps {
  type: string
  count: number
  config: typeof GUEST_CONFIG[keyof typeof GUEST_CONFIG]
  onChange: (delta: number) => void
}

function GuestCounter({ type, count, config, onChange }: GuestCounterProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onChange(-1)}
          disabled={count <= config.min}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium text-foreground">{count}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onChange(1)}
          disabled={count >= config.max}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// Checkout Step Component
interface CheckoutStepProps {
  selectedLocation: string | null
  dateRange: DateRange
  guests: GuestCount
  getNights: () => number
}

function CheckoutStep({ selectedLocation, dateRange, guests, getNights }: CheckoutStepProps) {
  const location = LOCATIONS.find(l => l.value === selectedLocation)

  return (
    <div className="p-6 space-y-6">
      {/* Booking Summary */}
      <div className="p-4 rounded-lg bg-card/50 border border-border/10 space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location</span>
            <span className="text-foreground font-medium">{location?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span className="text-foreground">{dateRange.checkIn ? format(dateRange.checkIn, "MMM dd, yyyy") : "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out</span>
            <span className="text-foreground">{dateRange.checkOut ? format(dateRange.checkOut, "MMM dd, yyyy") : "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nights</span>
            <span className="text-foreground">{getNights()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests</span>
            <span className="text-foreground">{guests.adults}A {guests.children}C {guests.infants}I</span>
          </div>
        </div>
      </div>

      {/* Guest Information Form */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Guest Information</h3>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">{TEXT_CONTENT.labels.fullName}</Label>
          <Input
            id="name"
            placeholder={TEXT_CONTENT.placeholders.name}
            className="bg-card/50 border-border/20 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">{TEXT_CONTENT.labels.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder={TEXT_CONTENT.placeholders.email}
            className="bg-card/50 border-border/20 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">{TEXT_CONTENT.labels.phone}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder={TEXT_CONTENT.placeholders.phone}
            className="bg-card/50 border-border/20 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="pt-4 border-t border-border/10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">{TEXT_CONTENT.labels.totalAmount}</span>
          <span className="text-xl font-bold text-foreground">₹{(getNights() * 12499).toLocaleString()}</span>
        </div>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base flex items-center justify-center gap-2">
          <CreditCard className="w-4 h-4" />
          {TEXT_CONTENT.buttons.proceedToPay}
        </Button>
        <p className="text-center text-[10px] text-muted-foreground mt-3">
          {TEXT_CONTENT.messages.securePayment}
        </p>
      </div>
    </div>
  )
}