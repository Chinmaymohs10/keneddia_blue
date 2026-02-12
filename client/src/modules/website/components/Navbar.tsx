import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogIn, Calendar } from "lucide-react";
import { siteContent } from "@/data/siteContent";
import { BookingSheet } from "./BookingSheet";
import { ThemeToggle } from "./ThemeToggle";

// Business Dropdown Items
const BUSINESS_ITEMS = [
  { label: "Hotels & Resorts", href: "/hotels" },
  // { label: "Restaurants", href: "/restaurant-homepage" },
  // { label: "Cafes & Dining", href: "/cafes" },
  // { label: "Bars & Lounges", href: "/bars" },
  // { label: "Events & Conf.", href: "/events" },
  // { label: "Entertainment", href: "/entertainment" },
];

// Join Us Dropdown Items
const JOIN_US_ITEMS = [
  { label: "Careers", href: "/careers" },
  // { label: "Become a Partner", href: "#" },
  // { label: "Franchise Opportunities", href: "#" },
  // { label: "Investor Relations", href: "#" },
  // { label: "Supplier Registration", href: "#" },
];

// Quick Booking Options
const QUICK_BOOKING_OPTIONS = [
  { label: "Book Hotel", category: "hotel" as const },
  { label: "Reserve Table (Dine-in)", category: "dining" as const },
  { label: "Takeaway / Delivery", category: "delivery" as const },
];

// Types
type NavItem =
  | { type: 'link'; label: string; href: string; key: string }
  | { type: 'dropdown'; label: string; key: string; items: { label: string; href: string }[] };

// Main Navigation Items - Updated to use hash links for home sections
const NAV_ITEMS: NavItem[] = [
  {
    type: 'dropdown',
    label: 'BUSINESSES',
    key: 'business',
    items: BUSINESS_ITEMS
  },
  {
    type: 'link',
    label: 'EVENTS',
    key: 'events',
    href: '#events' // Scroll to #events section
  },
  {
    type: 'link',
    label: 'REVIEWS',
    key: 'story',
    href: '#story' // Scroll to #reviews section
  },
  {
    type: 'dropdown',
    label: 'JOIN US',
    key: 'joinus',
    items: JOIN_US_ITEMS
  },
  {
    type: 'link',
    label: 'ABOUT US',
    key: 'about',
    href: '#about' // Scroll to #about section
  }
];

// Sections for Active State Detection
const TRACKED_SECTIONS = ['business', 'events', 'reviews', 'joinus', 'about', 'daily-offers'];

// Navbar Configuration
const NAVBAR_CONFIG = {
  scrollThreshold: 50,
  navbarHeight: 64,
  scrollBehavior: "smooth" as ScrollBehavior,
};

// ============================================================================
// MAIN NAVBAR COMPONENT
// ============================================================================

// Brand Interface
interface NavbarBrand {
  image: { src: string; alt: string };
  subImage?: { src: string; alt: string };
  text?: string;
}

export default function Navbar({ navItems = NAV_ITEMS, logo }: { navItems?: NavItem[], logo?: NavbarBrand }) {
  const brandLogo = logo || siteContent.brand.logo;
  const darkLogo = brandLogo.image;
  const lightLogo = brandLogo.subImage || brandLogo.image;
  

  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<"hotel" | "dining" | "delivery" | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const openBooking = (category: "hotel" | "dining" | "delivery") => {
    setBookingCategory(category);
    setBookingOpen(true);
    setActiveDropdown(null);
  };

  // Scroll & Active State Logic
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > NAVBAR_CONFIG.scrollThreshold);

          // Active Section Detection
          const currentSection = TRACKED_SECTIONS.find(sectionId => {
            const el = document.getElementById(sectionId);
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          });

          setActiveSection(currentSection || null);
          ticking = false;
        });

        ticking = true;
      }
    };

    // Handle initial state
    onScroll();

    // Handle initial hash scroll
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - NAVBAR_CONFIG.navbarHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: NAVBAR_CONFIG.scrollBehavior
          });
        }, 100);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location]);

  // Handle Hash Links specifically
  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // If we're on the home page, just scroll
        if (location.pathname === '/') {
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - NAVBAR_CONFIG.navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: NAVBAR_CONFIG.scrollBehavior
          });
        } else {
          // If on another page, navigate to home with hash
          navigate(`/${href}`);
        }
      } else {
        // Element not found, navigate to home with hash
        if (location.pathname !== '/') {
          navigate(`/${href}`);
        }
      }
      setMobileMenuOpen(false);
      setActiveDropdown(null);
    } else {
      // For normal routes (not hash links), just close menu and scroll to top
      setMobileMenuOpen(false);
      setActiveDropdown(null);
      window.scrollTo(0, 0);
    }
  };

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
    ? "bg-white dark:bg-background/95 dark:backdrop-blur-sm shadow-md py-2 border-b border-border/10"
    : "bg-white dark:bg-transparent backdrop-blur-none dark:xl:backdrop-blur-none shadow-md xl:shadow-none py-2 xl:py-4"
    }`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 xl:px-12">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center gap-2 xl:gap-4">
            <div className="flex items-center justify-start flex-shrink-0">
              <Link to="/" onClick={() => window.scrollTo(0, 0)} className="block transition-all duration-300 rounded-lg p-1.5 xl:p-2 dark:bg-transparent hover:opacity-100 cursor-pointer">
                <img
                  src={darkLogo.src}
                  alt={darkLogo.alt}
                  className="hidden dark:block h-12 xl:h-14 w-auto object-contain opacity-90"
                />
                <img
                  src={lightLogo.src}
                  alt={lightLogo.alt}
                  className="block dark:hidden h-12 xl:h-14 w-auto object-contain opacity-90"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center justify-center flex-1 space-x-1 2xl:space-x-2">
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                handleHashLink={handleHashLink}
                isActive={activeSection === item.key || (item.type === 'link' && activeSection === item.href.replace(/^[/#]/, ''))}
              />
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden xl:flex items-center justify-end gap-2 2xl:gap-3 w-auto">
            {/* Quick Action Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 2xl:px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs 2xl:text-sm font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer whitespace-nowrap">
                <span>Quick Book</span>
                <ChevronDown className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border shadow-xl rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right cursor-pointer">
                <div className="py-1">
                  {QUICK_BOOKING_OPTIONS.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => openBooking(option.category)}
                      className="block w-full text-left px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/login" className="flex items-center gap-1.5 px-3 2xl:px-5 py-2 text-foreground/80 hover:text-primary transition-colors text-xs 2xl:text-sm font-medium whitespace-nowrap cursor-pointer">
              <LogIn className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
              LOGIN
            </Link>

            <ThemeToggle />
          </div>

          {/* Mobile Actions */}
          <div className="xl:hidden flex items-center gap-3">
            <button
              onClick={() => setBookingOpen(true)}
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
              aria-label="Quick Book"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground hover:text-primary transition-colors relative cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              {!mobileMenuOpen && (
                <span className="absolute -top-0.5 -right-0.5">
                  <BlinkingIndicator />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          mobileMenuOpen={mobileMenuOpen}
          mobileExpandedMenu={mobileExpandedMenu}
          setMobileExpandedMenu={setMobileExpandedMenu}
          navItems={navItems}
          handleHashLink={handleHashLink}
        />
      </div>

      <BookingSheet
        isOpen={bookingOpen}
        onOpenChange={setBookingOpen}
        category={bookingCategory}
      />
    </nav>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Desktop Nav Item Component
interface NavItemProps {
  item: NavItem;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
  handleHashLink: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  isActive: boolean;
}

function NavItem({ item, activeDropdown, setActiveDropdown, handleHashLink, isActive }: NavItemProps) {
  const isHovered = activeDropdown === item.key;
  const showIndicator = isHovered || isActive;

  if (item.type === 'link') {
    return (
      <div className="relative">
        <Link
          to={item.href}
          onClick={(e) => handleHashLink(e, item.href)}
          className={`flex items-center gap-1 px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${isActive ? "text-primary" : "text-foreground hover:text-primary"
            }`}
        >
          {item.label}
        </Link>
        {showIndicator && <ActiveIndicator />}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setActiveDropdown(item.key)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <button
        className={`flex items-center gap-1 px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${isActive ? "text-primary" : "text-foreground hover:text-primary"
          }`}
      >
        {item.label}
        <ChevronDown className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
      </button>
      {showIndicator && <ActiveIndicator />}

      <AnimatePresence>
        {isHovered && (
          <DropdownMenu items={item.items} handleHashLink={handleHashLink} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Active Indicator Component
function ActiveIndicator() {
  return (
    <motion.div
      layoutId="activeNav"
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
      initial={false}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  );
}

// Dropdown Menu Component
interface DropdownMenuProps {
  items: { label: string; href: string }[];
  handleHashLink: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

function DropdownMenu({ items, handleHashLink }: DropdownMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full mt-2 bg-card border border-border/50 shadow-xl rounded-lg overflow-hidden right-0 w-64"
    >
      <div className="py-2">
        {items.map((subItem, idx) => (
          <div key={idx}>
            <Link
              to={subItem.href}
              onClick={(e) => handleHashLink(e, subItem.href)}
              className="block px-6 py-3 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              {subItem.label}
            </Link>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Blinking Indicator Component
function BlinkingIndicator() {
  return (
    <motion.div
      className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [1, 0.6, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-primary rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

// Mobile Menu Component
interface MobileMenuProps {
  mobileMenuOpen: boolean;
  mobileExpandedMenu: string | null;
  setMobileExpandedMenu: (key: string | null) => void;
  navItems: NavItem[];
  handleHashLink: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

function MobileMenu({ mobileMenuOpen, mobileExpandedMenu, setMobileExpandedMenu, navItems, handleHashLink }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="xl:hidden border-t border-border/10 overflow-hidden bg-background/95 backdrop-blur-md"
        >
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) =>
              item.type === 'link' ? (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={(e) => handleHashLink(e, item.href)}
                  className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-primary transition-colors border-b border-border/5 cursor-pointer"
                >
                  {item.label}
                </Link>
              ) : (
                <MobileDropdown
                  key={item.key}
                  item={item}
                  mobileExpandedMenu={mobileExpandedMenu}
                  setMobileExpandedMenu={setMobileExpandedMenu}
                  handleHashLink={handleHashLink}
                />
              )
            )}

            <div className="px-4 pt-4">
              <Link to="/login" onClick={() => handleHashLink({ preventDefault: () => { } } as any, '/login')} className="flex items-center justify-center gap-2 py-2.5 bg-transparent border border-border/20 text-foreground text-sm font-medium rounded-full hover:border-primary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer">
                <LogIn className="w-4 h-4" />
                LOGIN
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mobile Dropdown Component
interface MobileDropdownProps {
  item: Exclude<NavItem, { type: 'link' }>;
  mobileExpandedMenu: string | null;
  setMobileExpandedMenu: (key: string | null) => void;
  handleHashLink: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

function MobileDropdown({ item, mobileExpandedMenu, setMobileExpandedMenu, handleHashLink }: MobileDropdownProps) {
  const isExpanded = mobileExpandedMenu === item.key;

  return (
    <div className="border-b border-border/5">
      <button
        onClick={() => setMobileExpandedMenu(isExpanded ? null : item.key)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 hover:text-primary transition-colors relative cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {item.label}
          {!isExpanded && (
            <span className="relative">
              <BlinkingIndicator />
            </span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-accent/5 overflow-hidden"
          >
            {item.items.map((subItem, idx) => (
              <Link
                key={idx}
                to={subItem.href}
                onClick={(e) => handleHashLink(e, subItem.href)}
                className="block px-6 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-accent/10 transition-colors cursor-pointer"
              >
                {subItem.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}