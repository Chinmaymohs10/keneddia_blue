import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Search, Star, ArrowRight, X, Clock, Coffee, ChevronRight } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HeaderLogo from "@/modules/website/components/HeaderLogo";

// Assets
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { BackButton } from "@/components/ui/BackButton";

// Cafe Navigation Items
const CAFE_NAV_ITEMS = [
  { type: 'link', label: 'MENU', key: 'menu', href: '#collection' },
  { type: 'link', label: 'LOCATIONS', key: 'locations', href: '#collection' },
  { type: 'link', label: 'RESERVATIONS', key: 'reserve', href: '#collection' },
  { type: 'link', label: 'EVENTS', key: 'events', href: '/events' },
] as any[];

const allCafes = [
  {
    id: "parisian",
    name: "The Pâtisserie",
    location: "Pondicherry",
    city: "Pondicherry",
    image: siteContent.images.cafes.parisian,
    cuisine: "French Patisserie",
    rating: "4.9",
    reviews: 876,
    description: "A classic experience featuring artisanal croissants and rich espresso in a marine-side setting.",
    specialties: ["Croissants", "Macarons", "Espresso", "Pain au Chocolat"],
    openingHours: "7:00 AM - 8:00 PM",
    reservations: true,
    avgPrice: "₹1,200-2,000",
  },
  {
    id: "zenith",
    name: "Zenith Brew",
    location: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    image: siteContent.images.cafes.minimalist,
    cuisine: "Specialty Coffee",
    rating: "4.8",
    reviews: 654,
    description: "Minimalist precision meets the art of coffee. Single-origin pours in a serene concrete sanctuary.",
    specialties: ["Pour Over", "Cold Brew", "Matcha Latte", "Single Origin"],
    openingHours: "8:00 AM - 7:00 PM",
    reservations: false,
    avgPrice: "₹800-1,500",
  },
  {
    id: "hearth",
    name: "Hearth & Grain",
    location: "Kala Ghoda, Mumbai",
    city: "Mumbai",
    image: siteContent.images.cafes.bakery,
    cuisine: "Artisan Bakery",
    rating: "4.9",
    reviews: 1023,
    description: "The warmth of fresh sourdough and cinnamon, served in a rustic yet refined wooden haven.",
    specialties: ["Sourdough", "Cinnamon Rolls", "Rye Bread", "Danish Pastries"],
    openingHours: "6:00 AM - 6:00 PM",
    reservations: true,
    avgPrice: "₹500-1,200",
  },
  {
    id: "orchid",
    name: "The Orchid Room",
    location: "New Delhi",
    city: "New Delhi",
    image: siteContent.images.cafes.highTea,
    cuisine: "High Tea",
    rating: "5.0",
    reviews: 1456,
    description: "An elegant afternoon tradition. Fine china, floral infusions, and delicate pastries.",
    specialties: ["Afternoon Tea", "Scones", "Tea Selection", "Finger Sandwiches"],
    openingHours: "12:00 PM - 6:00 PM",
    reservations: true,
    avgPrice: "₹2,500-4,500",
  },
  {
    id: "eden",
    name: "Eden Terrace",
    location: "Jubilee Hills, Hyderabad",
    city: "Hyderabad",
    image: siteContent.images.cafes.garden,
    cuisine: "Garden Brunch",
    rating: "4.7",
    reviews: 789,
    description: "Dining amidst nature. Sun-dappled tables and fresh, organic ingredients.",
    specialties: ["Avocado Toast", "Smoothie Bowls", "Eggs Benedict", "Fresh Juices"],
    openingHours: "8:00 AM - 4:00 PM",
    reservations: true,
    avgPrice: "₹1,200-2,500",
  },
  {
    id: "study",
    name: "The Study",
    location: "Park Street, Kolkata",
    city: "Kolkata",
    image: siteContent.images.cafes.library,
    cuisine: "Literary Lounge",
    rating: "4.8",
    reviews: 567,
    description: "Quiet corners, leather chairs, and the scent of old books paired with dark roast coffee.",
    specialties: ["Dark Roast", "Cappuccino", "Book Club Specials", "Pastries"],
    openingHours: "7:00 AM - 10:00 PM",
    reservations: false,
    avgPrice: "₹800-1,800",
  },
];

const cities = ["All Cities", "Pondicherry", "Bengaluru", "Mumbai", "New Delhi", "Hyderabad", "Kolkata"];

// Hero Images
const HERO_IMAGES = [
  siteContent.images.cafes.parisian,
  siteContent.images.cafes.highTea,
  siteContent.images.cafes.garden
];

export default function Cafes() {
  const [selectedCafe, setSelectedCafe] = useState<typeof allCafes[0] | null>(null);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [filteredCafes, setFilteredCafes] = useState(allCafes);
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
      const filtered = allCafes.filter((cafe) => {
        if (selectedCity !== "All Cities" && cafe.city !== selectedCity) {
          return false;
        }
        return true;
      });
      setFilteredCafes(filtered);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar navItems={CAFE_NAV_ITEMS} logo={siteContent.brand.logo_cafe} />

      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] w-full overflow-hidden">
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
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-background/90 backdrop-blur-sm p-8 md:p-12 rounded-sm border border-primary/20 max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-4">
              Artisan Flavors
            </h1>
            <p className="text-lg text-muted-foreground font-light tracking-wide uppercase">
              Curated Coffee, Fine Tea & Culinary Delights
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">A Symphony of Taste</h2>
          <p className="text-muted-foreground/80 leading-relaxed text-lg font-light max-w-3xl mx-auto mb-12">
            From the aroma of freshly roasted beans in our minimalist cafes to the delicate china of our high-tea salons, Kennedia Cafes & Dining offers a diverse palette of experiences. Each location is designed not just to feed the body, but to inspire the soul.
          </p>
          <div className="flex justify-center gap-12">
            <div className="flex flex-col items-center">
              <Coffee className="w-8 h-8 text-primary mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">100% Arabica</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-primary mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">All Day Dining</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-primary mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Award Winning</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE SECTION */}
      <section id="collection" className="py-20 bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Locations</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">Find Your Perfect Spot</h2>
          </div>

          {/* Search Section */}
          <div className="mb-12 bg-card p-6 rounded-xl shadow-lg border border-border/50 max-w-5xl mx-auto">
            {/* Back button removed as we are now a main page essentially, but kept logic simpler */}

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
                {isSearching ? <Search className="w-4 h-4 animate-spin" /> : "Find Table"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredCafes.map((cafe, index) => (
                <motion.div
                  key={cafe.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCafe(cafe)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden mb-6 rounded-sm">
                    <div className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur px-3 py-1 flex items-center rounded-full">
                      <Star className="w-3 h-3 text-primary fill-primary mr-1" />
                      <span className="text-xs font-bold text-foreground">{cafe.rating}</span>
                    </div>
                    <motion.div className="w-full h-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
                      <OptimizedImage {...cafe.image} className="w-full h-full object-cover" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">{cafe.name}</h3>
                        <div className="flex items-center text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="text-xs uppercase tracking-wide">{cafe.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="text-sm font-medium text-foreground">{cafe.cuisine}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed pt-2 border-t border-primary/10 mt-4">
                      {cafe.description}
                    </p>
                    <div className="pt-4 flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:underline underline-offset-4">
                      View Menu <ArrowRight className="w-3 h-3 ml-2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="py-20 bg-card border-t border-border/10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
          <div className="order-2 md:order-1">
            <div className="aspect-square rounded-full overflow-hidden border-4 border-secondary max-w-md mx-auto relative">
              <OptimizedImage
                {...siteContent.images.cafes.parisian}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/10" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">Taste the Difference</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Whether it's a quiet morning coffee or a celebratory brunch, our venues provide the perfect backdrop. Reserve your table today and experience culinary excellence.
            </p>
            <button className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded">
              Make a Reservation
            </button>
          </div>
        </div>
      </section>

      {/* Magnified Detail Modal */}
      <AnimatePresence>
        {selectedCafe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCafe(null)}
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
                onClick={() => setSelectedCafe(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/9] overflow-hidden">
                <OptimizedImage
                  {...selectedCafe.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 flex items-center rounded-full">
                  <Star className="w-4 h-4 text-primary fill-primary mr-1" />
                  <span className="text-sm font-bold">{selectedCafe.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">({selectedCafe.reviews} reviews)</span>
                </div>
                {selectedCafe.reservations && (
                  <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-primary-foreground uppercase tracking-widest">Reservations Available</span>
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-serif text-foreground mb-2">{selectedCafe.name}</h2>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm uppercase tracking-wide">{selectedCafe.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Coffee className="w-4 h-4 mr-1" />
                      <span className="text-xs uppercase tracking-wide">{selectedCafe.cuisine}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Avg. Price</p>
                    <p className="text-2xl font-serif text-foreground">{selectedCafe.avgPrice}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground/80 font-light leading-relaxed mb-6 pb-6 border-b border-primary/10">
                  {selectedCafe.description}
                </p>

                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-bold">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCafe.specialties.map((specialty) => (
                      <span key={specialty} className="px-3 py-1 bg-secondary/50 text-foreground text-xs font-medium rounded">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6 border border-primary/10 p-4 rounded">
                  <div className="flex items-center text-muted-foreground mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase tracking-widest font-bold">Opening Hours</span>
                  </div>
                  <p className="text-lg font-serif">{selectedCafe.openingHours}</p>
                </div>

                <button className="w-full bg-primary text-primary-foreground py-4 rounded flex items-center justify-center hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-bold">
                  {selectedCafe.reservations ? "Reserve Table" : "Visit Us"}
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