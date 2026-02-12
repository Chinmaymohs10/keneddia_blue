import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Define multiple hero images for the vertical section
const VERTICAL_HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80",
    alt: "Restaurant Interior 1"
  },
  {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80",
    alt: "Restaurant Interior 2"
  },
  {
    src: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1920&q=80",
    alt: "Restaurant Interior 3"
  }
];

export default function VerticalHero({ title, tagline, image, ctaText = "View Menu" }) {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % VERTICAL_HERO_IMAGES.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScrollToMenu = () => {
    const menuSection = document.getElementById('vertical-menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Use provided image or fallback to carousel images
  const heroImages = image 
    ? [{ src: image, alt: title }] 
    : VERTICAL_HERO_IMAGES;

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Animated Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentHeroIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[currentHeroIndex % heroImages.length].src}
            alt={heroImages[currentHeroIndex % heroImages.length].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <div className="container mx-auto">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center gap-1.5 text-xs text-white/60 mb-6 font-medium"
          >
            <Link 
              to="/restaurant-homepage" 
              className="hover:text-primary transition-colors duration-300 hover:underline"
            >
              Restaurant
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">{title}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-4 uppercase tracking-wider drop-shadow-2xl"
          >
            {title}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-sm md:text-base text-white/80 font-light max-w-2xl mx-auto mb-6 drop-shadow-lg leading-relaxed"
          >
            {tagline}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Button 
              size="sm" 
              onClick={handleScrollToMenu}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-5 py-2 rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 font-medium tracking-wide"
            >
              {ctaText}
              <ChevronRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Hero Indicators - Only show if multiple images */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentHeroIndex
                  ? "w-8 h-0.5 bg-white"
                  : "w-6 h-0.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 bg-white/70 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}