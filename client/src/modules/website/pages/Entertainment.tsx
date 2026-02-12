import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Ticket, Search, Star, ArrowRight, X, Clock, Music, Gamepad2, Film, ChevronRight } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HeaderLogo from "@/modules/website/components/HeaderLogo";

// Assets
import { siteContent } from "@/data/siteContent";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { BackButton } from "@/components/ui/BackButton";

// Entertainment Navigation Items
const ENT_NAV_ITEMS = [
  { type: 'link', label: 'CINEMA', key: 'cinema', href: '#collection' },
  { type: 'link', label: 'LIVE SHOWS', key: 'shows', href: '#collection' },
  { type: 'link', label: 'KIDS ZONE', key: 'kids', href: '#collection' },
  { type: 'link', label: 'EXPERIENCES', key: 'experiences', href: '#collection' },
] as any[];

const entertainmentVenues = [
  {
    id: "grand-theatre",
    name: "The Grand Theatre",
    location: "Mumbai",
    city: "Mumbai",
    image: siteContent.images.events.jazz, // Using existing image heavily
    type: "Cinema & Theatre",
    rating: "4.9",
    reviews: 2100,
    description: "A restoration of the golden age of cinema. Plush red velvet seats, state-of-the-art acoustics, and a curated selection of films.",
    highlights: ["IMAX Screen", "Private Boxes", "Gourmet Concessions"],
    openingHours: "10:00 AM - 1:00 AM",
  },
  {
    id: "arcade-hub",
    name: "Pixel Arcade",
    location: "Bengaluru",
    city: "Bengaluru",
    image: siteContent.images.bars.speakeasy, // Placeholder
    type: "Gaming & VR",
    rating: "4.7",
    reviews: 1540,
    description: "Next-gen gaming arena featuring VR zones, retro arcade classics, and e-sports tournaments.",
    highlights: ["VR Zone", "Bowling Alley", "E-Sports Arena"],
    openingHours: "11:00 AM - 11:00 PM",
  },
  {
    id: "wonder-park",
    name: "Wonder Kids Park",
    location: "Delhi",
    city: "Delhi",
    image: siteContent.images.cafes.garden, // Placeholder
    type: "Kids & Family",
    rating: "4.8",
    reviews: 3200,
    description: "A safe, imaginative world for children. Featuring educational play zones, puppet shows, and outdoor adventures.",
    highlights: ["Interactive Learning", "Safe Play Zones", "Cafe for Parents"],
    openingHours: "9:00 AM - 8:00 PM",
  },
  {
    id: "cultural-center",
    name: "Heritage Cultural Center",
    location: "Jaipur",
    city: "Jaipur",
    image: siteContent.images.events.wedding, // Placeholder
    type: "Art & Culture",
    rating: "5.0",
    reviews: 980,
    description: "Daily showcases of traditional dance, music, and art. Immerse yourself in the rich cultural tapestry of the region.",
    highlights: ["Live Folk Dance", "Art Workshops", "Handicraft Market"],
    openingHours: "10:00 AM - 9:00 PM",
  },
];

const categories = ["All Types", "Cinema & Theatre", "Gaming & VR", "Kids & Family", "Art & Culture"];

// Hero Images
const HERO_IMAGES = [
  siteContent.images.events.jazz,
  siteContent.images.bars.speakeasy,
  siteContent.images.cafes.garden
];

export default function Entertainment() {
  const [selectedVenue, setSelectedVenue] = useState<typeof entertainmentVenues[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Types");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Hero Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredVenues = entertainmentVenues.filter(venue => selectedCategory === "All Types" || venue.type === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar navItems={ENT_NAV_ITEMS} />

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
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-background/90 backdrop-blur-sm p-8 md:p-12 rounded-sm border border-primary/20 max-w-4xl"
          >
            <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-4">
              Beyond Imagination
            </h1>
            <p className="text-lg text-muted-foreground font-light tracking-wide uppercase">
              Cinema, Gaming, Cultural Experiences & More
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">A World of Wonder</h2>
          <p className="text-muted-foreground/80 leading-relaxed text-lg font-light max-w-3xl mx-auto mb-12">
            Kennedia Entertainment brings you a kaleidoscope of activities. Whether you seek the thrill of the latest blockbuster, the immersion of virtual reality, or the joy of family fun, our destinations promise unforgettable moments.
          </p>
          <div className="flex justify-center gap-12 text-primary">
            <div className="flex flex-col items-center">
              <Film className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Immersive Cinema</span>
            </div>
            <div className="flex flex-col items-center">
              <Gamepad2 className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Next-Gen Gaming</span>
            </div>
            <div className="flex flex-col items-center">
              <Music className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Cultural Shows</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE SECTION */}
      <section id="collection" className="py-20 bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Worlds</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">Explore Entertainment</h2>
          </div>

          {/* Filter Categories */}
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/50 hover:bg-secondary text-muted-foreground"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredVenues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedVenue(venue)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden mb-6 rounded-sm">
                    <div className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur px-3 py-1 flex items-center rounded-full">
                      <Star className="w-3 h-3 text-primary fill-primary mr-1" />
                      <span className="text-xs font-bold text-foreground">{venue.rating}</span>
                    </div>
                    <motion.div className="w-full h-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
                      <OptimizedImage {...venue.image} className="w-full h-full object-cover" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">{venue.name}</h3>
                        <div className="flex items-center text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="text-xs uppercase tracking-wide">{venue.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="text-sm font-medium text-foreground">{venue.type}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed pt-2 border-t border-primary/10 mt-4 line-clamp-2">
                      {venue.description}
                    </p>
                    <div className="pt-4 flex items-center text-primary text-xs font-bold uppercase tracking-widest group-hover:underline underline-offset-4">
                      View Experience <ArrowRight className="w-3 h-3 ml-2" />
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
          <div className="order-2 md:order-1 relative h-[500px] w-full rounded-lg overflow-hidden">
            <OptimizedImage
              {...siteContent.images.events.jazz}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-2xl font-serif mb-2">Exclusive Memberships</h3>
              <p className="text-white/80 font-light">Get priority access to premieres and private events.</p>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">Step Into the Spotlight</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Ready for an adventure? Book tickets to our latest shows, reserve a gaming booth, or plan a family day out.
            </p>
            <button className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded">
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Magnified Detail Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVenue(null)}
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
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/9] overflow-hidden">
                <OptimizedImage
                  {...selectedVenue.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 flex items-center rounded-full">
                  <Star className="w-4 h-4 text-primary fill-primary mr-1" />
                  <span className="text-sm font-bold">{selectedVenue.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">({selectedVenue.reviews} reviews)</span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-serif text-foreground mb-2">{selectedVenue.name}</h2>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm uppercase tracking-wide">{selectedVenue.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Ticket className="w-4 h-4 mr-1" />
                      <span className="text-xs uppercase tracking-wide">{selectedVenue.type}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground/80 font-light leading-relaxed mb-6 pb-6 border-b border-primary/10">
                  {selectedVenue.description}
                </p>

                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-bold">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVenue.highlights.map((highlight) => (
                      <span key={highlight} className="px-3 py-1 bg-secondary/50 text-foreground text-xs font-medium rounded">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6 border border-primary/10 p-4 rounded bg-primary/5">
                  <div className="flex items-center text-primary mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase tracking-widest font-bold">Opening Hours</span>
                  </div>
                  <p className="text-lg font-serif">{selectedVenue.openingHours}</p>
                </div>

                <button className="w-full bg-primary text-primary-foreground py-4 rounded flex items-center justify-center hover:bg-primary/90 transition-colors uppercase tracking-widest text-xs font-bold">
                  Book Experience
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
