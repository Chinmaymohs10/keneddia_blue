import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Users, GlassWater, Sparkles, Loader2 } from "lucide-react";
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

export default function Events() {
  const navigate = useNavigate();
  const [eventList, setEventList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEventsUpdated({});
        // Mapping from your API response structure [ { id, title, image: { url } ... } ]
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
    ? eventList.slice(0, 3).map(e => ({ src: e.image?.url, alt: e.title }))
    : [{ src: "/images/placeholder.jpg", alt: "Events" }];

  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [HERO_IMAGES.length]);

  const filteredEvents = eventList.filter(event => {
    const eventCat = event.typeName || "Music & Dining";
    return selectedCategory === "All Categories" || eventCat === selectedCategory;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar navItems={EVENT_NAV_ITEMS} />

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
              src={HERO_IMAGES[currentHeroIndex]?.src}
              alt={HERO_IMAGES[currentHeroIndex]?.alt}
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
              Moments That Matter
            </h1>
            <p className="text-lg text-muted-foreground font-light tracking-wide uppercase">
              Curated Events, Weddings & Corporate Gatherings
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">Celebrating Life's Milestones</h2>
          <p className="text-muted-foreground/80 leading-relaxed text-lg font-light max-w-3xl mx-auto mb-12">
            From intimate jazz evenings to grand wedding galas, Kennedia Events hosts a spectrum of experiences. Our dedicated planning team ensures every detail is perfect, allowing you to immerse yourself in the celebration.
          </p>
          <div className="flex justify-center gap-12 text-primary">
            <div className="flex flex-col items-center">
              <GlassWater className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Exquisite Catering</span>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Unmatched Decor</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Expert Planning</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE SECTION */}
      <section id="collection" className="py-20 bg-secondary/5 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Upcoming</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">Events & Happenings</h2>
          </div>

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

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="group cursor-pointer bg-card rounded-lg overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <OptimizedImage
                        src={event.image?.url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm shadow-sm">
                        {event.typeName || "General"}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-xs text-primary font-bold uppercase tracking-widest mb-3">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(event.eventDate)}
                      </div>

                      <h3 className="text-2xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors">{event.title}</h3>

                      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 opacity-70" />
                          {event.time || "Time TBA"}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 opacity-70" />
                          {event.locationName}
                        </div>
                      </div>

                      <p className="text-muted-foreground/80 text-sm leading-relaxed mb-6 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="w-full py-3 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded flex items-center justify-center">
                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="py-20 bg-background border-t border-border/10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
          <div className="order-2 md:order-1 relative h-[500px] w-full rounded-lg overflow-hidden">
            <OptimizedImage
              src={eventList[0]?.image?.url || "/images/placeholder.jpg"}
              alt="Weddings"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-2xl font-serif mb-2">Weddings at Kennedia</h3>
              <p className="text-white/80 font-light">Create timeless memories in our breathtaking venues.</p>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">Start Planning</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Whether it's a corporate conference, a social gathering, or the wedding of your dreams, our team is here to bring your vision to life.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded">
                Inquire Now
              </button>
              <button className="px-8 py-4 border border-primary text-primary font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors rounded">
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