"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { ChevronRight, X, Loader2, ExternalLink } from "lucide-react"
import { GetAllPropertyDetails } from "@/Api/Api"

interface ApiProperty {
  propertyId: number
  listingId: number
  propertyName: string
  propertyType: string
  city: string
  bookingEngineUrl?: string | null
}

interface BookingSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingSheet({ isOpen, onOpenChange }: BookingSheetProps) {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await GetAllPropertyDetails()
        const rawData = response?.data?.data || response?.data || []

        if (Array.isArray(rawData)) {
          const formatted: ApiProperty[] = rawData.flatMap((item: any) => {
            const parent = item.propertyResponseDTO
            const listings = item.propertyListingResponseDTOS || []
            if (!parent || parent.isActive !== true) return []
            return listings
              .filter((l: any) => l.isActive === true)
              .map((l: any) => ({
                propertyId:       parent.id,
                listingId:        l.id,
                propertyName:     parent.propertyName || "Unnamed Property",
                propertyType:     l.propertyType || parent.propertyTypes?.[0] || "Property",
                city:             parent.locationName || "",
                bookingEngineUrl: parent.bookingEngineUrl || null,
              }))
          })
          setProperties(formatted)
        }
      } catch (err) {
        console.error("Failed to fetch properties", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const handleSelect = (property: ApiProperty) => {
    onOpenChange(false)
    if (property.bookingEngineUrl) {
      window.open(property.bookingEngineUrl, "_blank")
    } else {
      const type = property.propertyType?.toLowerCase()
      navigate(
        type === "restaurant" || type === "resturant"
          ? `/resturant/${property.propertyId}`
          : `/hotels/${property.propertyId}`
      )
    }
  }

  const filtered = properties.filter((p) =>
    p.propertyName.toLowerCase().includes(query.toLowerCase()) ||
    p.city?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background text-foreground border-l border-border/10">

        {/* Header */}
        <div className="p-6 border-b border-border/10 bg-card/50 backdrop-blur-md relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <SheetTitle className="text-xl font-serif font-medium">Select Property</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs mt-1">
            Click a property to book or view details
          </SheetDescription>
        </div>

        {/* Property List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Command className="border border-border/10 rounded-lg bg-card/30">
              <CommandInput
                placeholder="Search by name or city..."
                value={query}
                onValueChange={setQuery}
                className="text-foreground placeholder:text-muted-foreground/50 border-none"
              />
              <CommandList className="max-h-[600px]">
                <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">
                  No properties found.
                </CommandEmpty>
                <CommandGroup>
                  {filtered.map((p) => (
                    <CommandItem
                      key={`${p.propertyId}-${p.listingId}`}
                      onSelect={() => handleSelect(p)}
                      className="flex items-center justify-between py-3 px-3 cursor-pointer rounded-lg aria-selected:bg-primary/10"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{p.propertyName}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {p.city && `${p.city} • `}{p.propertyType}
                        </p>
                      </div>
                      {p.bookingEngineUrl
                        ? <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      }
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </div>

      </SheetContent>
    </Sheet>
  )
}