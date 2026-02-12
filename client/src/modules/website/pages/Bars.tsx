import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Search, Star, ArrowRight, X, Clock, Wine, Music, ChevronRight } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HeaderLogo from "@/modules/website/components/HeaderLogo";

// Assets
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { BackButton } from "@/components/ui/BackButton";

// Bar Navigation Items
const BAR_NAV_ITEMS = [
  { type: 'link', label: 'SIGNATURE ENCOUNTERS', key: 'signature', href: '#collection' },
  { type: 'link', label: 'WINE LIST', key: 'wine', href: '#collection' },
  { type: 'link', label: 'EVENTS', key: 'events', href: '/events' },
  { type: 'link', label: 'RESERVE', key: 'reserve', href: '#collection' },
] as any[];

const allBars = [
  {
    id: "skyline",
    name: "Skyline Lounge",
    location: "Rooftop, Mumbai",
    city: "Mumbai",
    image: siteContent.images.bars.rooftop,
    style: "Rooftop Bar",
    rating: "4.9",
    reviews: 890,
    description: "Sip signature cocktails while gazing at the city lights. An elevated experience for the sophisticated.",
    features: ["Panoramic Views", "Live DJ", "Signature Cocktails", "VIP Tables"],
    openingHours: "5:00 PM - 2:00 AM",
    happyHour: "5:00 PM - 8:00 PM",
  },
  {
    id: "vault",
    name: "The Vault",
    location: "Basement, Delhi",
    city: "Delhi",
    image: siteContent.images.bars.speakeasy,
    style: "Speakeasy",
    rating: "5.0",
    reviews: 1200,
    description: "Hidden behind a bookshelf, this Prohibition-style bar serves rare whiskeys and classic mixes.",
    features: ["Rare Whiskeys", "Jazz Nights", "Intimate Setting", "Members Only Area"],
    openingHours: "6:00 PM - 3:00 AM",
    happyHour: "No Happy Hour",
  },
  {
    id: "azure",
    name: "Azure Pool Bar",
    location: "Poolside, Goa",
    city: "Goa", // Assuming Goa or similar coastal city for context
    image: siteContent.images.bars.poolside,
    style: "Pool Bar",
    rating: "4.8",
    reviews: 654,
    description: "Tropical vibes, chilled beers, and sun-kissed afternoons by the infinity pool.",
    features: ["Swim-up Bar", "Sundowners", "Tapas Menu", "Cabanas"],
    openingHours: "11:00 AM - 11:00 PM",
    happyHour: "4:00 PM - 7:00 PM",
  },
  {
    id: "velvet",
    name: "The Velvet Room",
    location: "Kolkata",
    city: "Kolkata",
    image: siteContent.images.bars.jazz,
    style: "Jazz Lounge",
    rating: "4.9",
    reviews: 567,
    description: "Plush velvet seating, dim lighting, and the smooth sounds of live saxophone.",
    features: ["Live Jazz", "Wine Cellar", "Cigar Lounge", "Small Plates"],
    openingHours: "7:00 PM - 1:00 AM",
    happyHour: "7:00 PM - 9:00 PM",
  },
];

const cities = ["All Cities", "Mumbai", "Delhi", "Goa", "Kolkata"];

// Hero Images
const HERO_IMAGES = [
  siteContent.images.bars.rooftop,
  siteContent.images.bars.speakeasy,
  siteContent.images.bars.jazz
];

export default function Bars() {
  const [selectedBar, setSelectedBar] = useState<typeof allBars[0] | null>(null);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [filteredBars, setFilteredBars] = useState(allBars);
  const [isSearching, setIsSearching] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Hero Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const filtered = allBars.filter((bar) => {
        if (selectedCity !== "All Cities" && bar.city !== selectedCity) {
          return false;
        }
        return true;
      });
      setFilteredBars(filtered);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar navItems={BAR_NAV_ITEMS} logo={siteContent.brand.logo_bar} />

      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <OptimizedImage
              {...HERO_IMAGES[currentHeroIndex]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 uppercase tracking-wider"
          >
            Nights Reimagined
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/80 font-light max-w-2xl uppercase tracking-wide"
          >
            Exceptional Spirits. Iconic Views. Unforgettable Memories.
          </motion.p>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">The Art of Mixology</h2>
          <p className="text-muted-foreground/80 leading-relaxed text-lg font-light max-w-3xl mx-auto mb-12">
            At Kennedia Bars & Lounges, we believe every drink tells a story. From rare vintage whiskeys in our speakeasies to molecular cocktails at our rooftop bars, we curate experiences that tantalize the senses.
          </p>
          <div className="flex justify-center gap-12 text-primary">
            <div className="flex flex-col items-center">
              <Wine className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Curated Wine</span>
            </div>
            <div className="flex flex-col items-center">
              <Music className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Live Acoustics</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">World Class</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE SECTION */}
      <section id="collection" className="py-20 bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Destinations</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">Find Your Vibe</h2>
          </div>

          {/* Search Section */}
          <div className="mb-12 bg-card p-6 rounded-xl shadow-lg border border-border/50 max-w-5xl mx-auto">
            {/* Back button removed per new design */}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              {/* City Dropdown */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">City</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-transparent border border-border rounded outline-none hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-primary mr-2" />
                      <span className="text-sm font-medium">{selectedCity}</span>
                    </div>
                    <ArrowRight className={`w-3 h-3 transition-transform ${showCityDropdown ? "rotate-90" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showCityDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-1 w-full bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50"
                      >
                        {cities.map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setShowCityDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 transition-colors ${selectedCity === city ? "bg-secondary/30" : ""
                              }`}
                          >
                            {city}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Date Picker */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Date</label>
                <div className="flex items-center border border-border rounded px-3 py-2 hover:border-primary/30 transition-colors">
                  <Calendar className="w-4 h-4 text-primary mr-2" />
                  <input type="date" value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} className="w-full bg-transparent outline-none text-foreground text-sm font-medium" />
                </div>
              </div>

              {/* Time Picker */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Time</label>
                <div className="flex items-center border border-border rounded px-3 py-2 hover:border-primary/30 transition-colors">
                  <Clock className="w-4 h-4 text-primary mr-2" />
                  <input type="time" value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} className="w-full bg-transparent outline-none text-foreground text-sm font-medium" />
                </div>
              </div>

              {/* Guests Counter */}
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Guests</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded bg-secondary hover:bg-secondary/70 flex items-center justify-center transition-colors text-sm font-bold">-</button>
                  <div className="flex-1 flex items-center justify-center border border-border rounded px-3 py-2">
                    <Users className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm font-bold">{guests}</span>
                  </div>
                  <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 rounded bg-secondary hover:bg-secondary/70 flex items-center justify-center transition-colors text-sm font-bold">+</button>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-primary text-primary-foreground h-10 w-full rounded flex items-center justify-center hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-bold disabled:opacity-50"
              >
                {isSearching ? <Search className="w-4 h-4 animate-spin" /> : "Plan Evening"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredBars.map((bar, index) => (
                <motion.div
                  key={bar.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedBar(bar)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden mb-6 rounded-sm">
                    <div className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur px-3 py-1 flex items-center rounded-full">
                      <Star className="w-3 h-3 text-primary fill-primary mr-1" />
                      <span className="text-xs font-bold text-foreground">{bar.rating}</span>
                    </div>
                    <motion.div className="w-full h-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
                      <OptimizedImage {...bar.image} className="w-full h-full object-cover" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">{bar.name}</h3>
                        <div className="flex items-center text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="text-xs uppercase tracking-wide">{bar.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Style</p>
                        <p className="text-sm font-medium text-foreground">{bar.style}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed pt-2 border-t border-primary/10 mt-4">
                      {bar.description}
                    </p>
                    <div className="pt-4 flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:underline underline-offset-4">
                      Details & Hours <ArrowRight className="w-3 h-3 ml-2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="py-20 bg-primary/5 border-t border-border/10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">Raise a Glass</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Join us for an evening of elegance. Reservations recommended for larger groups and VIP tables.
            </p>
            <button className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded">
              Reserve a Table
            </button>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden md:rotate-3 hover:rotate-0 transition-transform duration-500">
              <OptimizedImage
                {...siteContent.images.bars.rooftop}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Magnified Detail Modal */}
      <AnimatePresence>
        {selectedBar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBar(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedBar(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/9] overflow-hidden">
                <OptimizedImage
                  {...selectedBar.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 flex items-center rounded-full">
                  <Star className="w-4 h-4 text-primary fill-primary mr-1" />
                  <span className="text-sm font-bold">{selectedBar.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">({selectedBar.reviews} reviews)</span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-serif text-foreground mb-2">{selectedBar.name}</h2>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm uppercase tracking-wide">{selectedBar.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Wine className="w-4 h-4 mr-1" />
                      <span className="text-xs uppercase tracking-wide">{selectedBar.style}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground/80 font-light leading-relaxed mb-6 pb-6 border-b border-primary/10">
                  {selectedBar.description}
                </p>

                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-bold">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBar.features.map((feature) => (
                      <span key={feature} className="px-3 py-1 bg-secondary/50 text-foreground text-xs font-medium rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border border-primary/10 p-4 rounded">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-xs uppercase tracking-widest font-bold">Hours</span>
                    </div>
                    <p className="text-lg font-serif">{selectedBar.openingHours}</p>
                  </div>
                  <div className="border border-primary/10 p-4 rounded bg-primary/5">
                    <div className="flex items-center text-primary mb-2">
                      <Wine className="w-4 h-4 mr-2" />
                      <span className="text-xs uppercase tracking-widest font-bold">Happy Hour</span>
                    </div>
                    <p className="text-lg font-serif">{selectedBar.happyHour}</p>
                  </div>
                </div>

                <button className="w-full bg-primary text-primary-foreground py-4 rounded flex items-center justify-center hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-bold">
                  Reserve Table
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )
        }
      </AnimatePresence >

      <Footer />
    </div>
  );
}