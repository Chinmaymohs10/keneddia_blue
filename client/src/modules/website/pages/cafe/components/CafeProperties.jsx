import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import { siteContent } from "@/data/siteContent";
import { useNavigate } from "react-router-dom";

const CAFES = [
  {
    id: 1,
    name: "Kennedia Roast Room",
    city: "Ghaziabad",
    location: "Raj Nagar Extension, Ghaziabad",
    type: "Cafe",
    image: siteContent.images.cafes.minimalist,
    rating: 4.7,
    description: "A modern espresso room with mellow interiors, pastry displays, and long-stay seating.",
    highlights: ["Espresso Bar", "Work-Friendly", "Dessert Counter"],
    citySlug: "ghaziabad",
    propertySlug: "kennedia-roast-room-cafe",
  },
  {
    id: 2,
    name: "Kennedia Garden Terrace Cafe",
    city: "Noida",
    location: "Sector 62, Noida",
    type: "Cafe",
    image: siteContent.images.cafes.garden,
    rating: 4.8,
    description: "An open-air cafe setup designed for daytime brunches, relaxed meetings, and sunset coffee.",
    highlights: ["Outdoor Seating", "Brunch Menu", "Cold Brew"],
    citySlug: "noida",
    propertySlug: "kennedia-garden-terrace-cafe",
  },
  {
    id: 3,
    name: "Kennedia High Tea Lounge",
    city: "Delhi",
    location: "Connaught Place, New Delhi",
    type: "Cafe",
    image: siteContent.images.cafes.highTea,
    rating: 4.9,
    description: "An elevated tea-and-dessert lounge with plated sweets, polished service, and soft evening ambience.",
    highlights: ["High Tea", "Patisserie", "Lounge Seating"],
    citySlug: "delhi",
    propertySlug: "kennedia-high-tea-lounge-cafe",
  },
];

export default function CafeProperties() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState("All Cities");

  const cities = useMemo(() => ["All Cities", ...new Set(CAFES.map((item) => item.city))], []);
  const filteredCafes = useMemo(() => {
    if (selectedCity === "All Cities") return CAFES;
    return CAFES.filter((item) => item.city === selectedCity);
  }, [selectedCity]);

  const activeCafe = filteredCafes[activeIndex] || filteredCafes[0];

  if (!activeCafe) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? filteredCafes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === filteredCafes.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/5 to-background py-6">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-primary">Cafe Collection</span>
              <h2 className="text-xl font-serif text-foreground md:text-2xl">Our Cafes</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setActiveIndex(0);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    selectedCity === city ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[60%_40%]">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <img src={activeCafe.image.src} alt={activeCafe.image.alt || activeCafe.name} className="h-[500px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]">
                {activeCafe.type}
              </div>
              <h3 className="text-2xl font-serif font-semibold">{activeCafe.name}</h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{activeCafe.location}</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <button onClick={handlePrev} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={handleNext} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex h-[500px] flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                  Signature Cafe
                </span>
                <div className="flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1">
                  <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-900">{activeCafe.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold text-foreground">{activeCafe.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activeCafe.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                  <p className="text-[10px] text-muted-foreground">City</p>
                  <p className="text-xs font-bold text-foreground">{activeCafe.city}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Type</p>
                  <p className="text-xs font-bold text-foreground">{activeCafe.type}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                  <p className="text-xs font-bold text-foreground">{activeCafe.rating}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">Cafe Highlights</h4>
                <div className="grid grid-cols-2 gap-2">
                  {activeCafe.highlights.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" })}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold uppercase text-primary-foreground shadow-md"
              >
                Reserve A Table <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate(`/${activeCafe.citySlug}/${activeCafe.propertySlug}`)}
                className="w-full py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Explore Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
