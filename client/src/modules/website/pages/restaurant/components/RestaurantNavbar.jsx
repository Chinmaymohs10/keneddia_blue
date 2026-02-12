import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { siteContent } from "@/data/siteContent";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Contact", href: "#contact" }
];

export default function RestaurantNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Detect active section
      const sections = ["home", "about", "menu", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - 80;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleBookTable = () => {
    const reservationSection = document.getElementById('reservation');
    if (reservationSection) {
      const elementPosition = reservationSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - 80;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white dark:bg-background/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 xl:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/restaurant-homepage"
            onClick={() => window.scrollTo(0, 0)}
            className="flex items-center gap-2 group"
          >
            <div className={`transition-all duration-300 rounded-lg p-2 ${
              scrolled ? "bg-primary/10 dark:bg-transparent" : "bg-black/20 dark:bg-transparent"
            }`}>
              <img
                src={siteContent.brand.logo.image.src}
                alt="Kennedia Blu"
                className="h-10 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span className={`text-xl font-serif font-bold transition-colors ${
              scrolled ? "text-foreground" : "text-white"
            }`}>
              Kennedia Blu
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <div key={link.href} className="relative">
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-sm font-medium transition-colors relative ${
                      scrolled
                        ? isActive
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                        : isActive
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </a>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavRestaurant"
                      className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                        scrolled ? "bg-primary" : "bg-white"
                      }`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleBookTable}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
              scrolled
                ? "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
                : "bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Book a Table</span>
            <span className="sm:hidden">Book</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
