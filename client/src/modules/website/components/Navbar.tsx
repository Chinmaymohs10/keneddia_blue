import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogIn, Calendar } from "lucide-react";
import { siteContent } from "@/data/siteContent";
import { BookingSheet } from "./BookingSheet";
import { ThemeToggle } from "./ThemeToggle";

// import logoHotelDark from "@assets/logo/kb-hotel-dark.png";
// import logoHotelLight from "@assets/logo/kb-hotel-light.png";
// Business Dropdown Items
const BUSINESS_ITEMS = [
  // { label: "Hotels & Resorts", href: "https://hotels.kennediablu.com", external: true },
  { label: "Hotels & Resorts", href: "/hotels", external: true },
  {
    label: "Restaurants",
    href: "/ghaziabad/kennedia-blu-restaurant-27",
    external: true,
  },
  // { label: "Restaurants", href: "https://restaurants.kennediablu.com/ghaziabad/kennedia-blu-restaurant-ghaziabad-31",external: true }

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
  // { label: "Reserve Table (Dine-in)", category: "dining" as const },
  // { label: "Takeaway / Delivery", category: "delivery" as const },
];

// Types
type NavItem =
  | { type: "link"; label: string; href: string; key: string }
  | {
      type: "dropdown";
      label: string;
      key: string;
      items: { label: string; href: string; external?: boolean }[];
    };

// Main Navigation Items
const NAV_ITEMS: NavItem[] = [
  {
    type: "dropdown",
    label: "BUSINESSES",
    key: "business",
    items: BUSINESS_ITEMS,
  },
  {
    type: "link",
    label: "EVENTS",
    key: "events",
    href: "#events",
  },
  {
    type: "link",
    label: "REVIEWS",
    key: "story",
    href: "#story",
  },
  // {
  //   type: 'dropdown',
  //   label: 'JOIN US',
  //   key: 'joinus',
  //   items: JOIN_US_ITEMS
  // },
  {
    type: "link",
    label: "ABOUT US",
    key: "about",
    href: "#about",
  },
];

// Sections for Active State Detection
const TRACKED_SECTIONS = [
  "business",
  "events",
  "reviews",
  "joinus",
  "about",
  "daily-offers",
];

// Navbar Configuration
const NAVBAR_CONFIG = {
  scrollThreshold: 50,
  navbarHeight: 64,
  scrollBehavior: "smooth" as ScrollBehavior,
};

// ============================================================================
// MAIN NAVBAR COMPONENT
// ============================================================================

interface NavbarBrand {
  image: { src: string; alt: string };
  subImage?: { src: string; alt: string };
  text?: string;
}

export default function Navbar({
  navItems = NAV_ITEMS,
  logo,
}: {
  navItems?: NavItem[];
  logo?: NavbarBrand;
}) {
  const brandLogo = logo || siteContent.brand.logo;
  const darkLogo = (brandLogo as any).darkImage || brandLogo.image;
  const lightLogo = brandLogo.subImage || brandLogo.image;

  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(
    null,
  );
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<
    "hotel" | "dining" | "delivery" | null
  >(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isTransparentHeroRoute =
    location.pathname === "/" ||
    location.pathname === "/hotels" ||
    location.pathname === "/restaurant-homepage"||
    location.pathname === "/cafe-homepage";
  const showQuickBook = isTransparentHeroRoute;
  const useWhiteTextOnTransparent = isTransparentHeroRoute;
  const transparentMode = !scrolled;
  const shouldUseDarkLogoOnTransparentInLightMode =
    isTransparentHeroRoute && transparentMode;
  const currentLightModeLogo = shouldUseDarkLogoOnTransparentInLightMode
    ? darkLogo
    : lightLogo;
  const transparentTextClass = useWhiteTextOnTransparent
    ? "text-white hover:text-white/80"
    : "text-black hover:text-black/80 dark:text-white dark:hover:text-white/80";
  const transparentBorderClass = useWhiteTextOnTransparent
    ? "border-white/30 text-white hover:border-white/50 hover:text-white hover:bg-white/10"
    : "border-black/20 text-black hover:border-black/40 hover:text-black hover:bg-black/5 dark:border-white/30 dark:text-white dark:hover:border-white/50 dark:hover:text-white dark:hover:bg-white/10";
  const transparentActionOverlayClass =
    transparentMode && isTransparentHeroRoute
      ? "bg-black/20 backdrop-blur-md border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:bg-black/28"
      : "";

  const openBooking = (category: "hotel" | "dining" | "delivery") => {
    setBookingCategory(category);
    setBookingOpen(true);
    setActiveDropdown(null);
  };

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > NAVBAR_CONFIG.scrollThreshold);

          const currentSection = TRACKED_SECTIONS.find((sectionId) => {
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

    onScroll();

    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.scrollY - NAVBAR_CONFIG.navbarHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: NAVBAR_CONFIG.scrollBehavior,
          });
        }, 100);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location]);

  const handleHashLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.scrollY - NAVBAR_CONFIG.navbarHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: NAVBAR_CONFIG.scrollBehavior,
        });
      } else {
        navigate(`${location.pathname}${href}`);
      }
      setMobileMenuOpen(false);
      setActiveDropdown(null);
    } else {
      setMobileMenuOpen(false);
      setActiveDropdown(null);
      window.scrollTo(0, 0);
    }
  };

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled
      ? "bg-white dark:bg-background/95 dark:backdrop-blur-sm shadow-md py-2 border-b border-border/10"
      : "bg-white/10 backdrop-blur-[2px] shadow-md xl:shadow-none py-2 xl:py-4"
  }`;

  return (
    <nav className={`${navbarClasses} site-nav-shell`}>
      <div className="site-nav-container">
        <div className="site-nav-row">
          {/* Logo Section */}
          <div className="flex items-center gap-2 xl:gap-4">
            <div className="flex items-center justify-start flex-shrink-0 bg-transparent">
              <Link
                to="/"
                onClick={() => window.scrollTo(0, 0)}
                className="block rounded-lg p-2 !bg-transparent"
              >
                {/* Light Mode Logo */}
                <img
                  src={currentLightModeLogo.src}
                  alt={currentLightModeLogo.alt}
                  className="h-12 xl:h-14 w-auto object-contain dark:hidden"
                />

                {/* Dark Mode Logo (fallback to light if not provided) */}
                <img
                  src={darkLogo.src}
                  alt={darkLogo.alt}
                  className="h-12 xl:h-14 w-auto object-contain hidden dark:block"
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
                transparentMode={transparentMode}
                transparentTextClass={transparentTextClass}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                handleHashLink={handleHashLink}
                isActive={
                  activeSection === item.key ||
                  (item.type === "link" &&
                    activeSection === item.href.replace(/^[/#]/, ""))
                }
              />
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden xl:flex items-center justify-end gap-2 2xl:gap-3 w-auto">
            {showQuickBook && (
              <div className="relative group">
                <button
                  className={`site-nav-quickbook-trigger ${transparentActionOverlayClass}`}
                >
                  <span>Quick Book</span>
                  <ChevronDown className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                </button>
                <div className="site-nav-quickbook-panel">
                  <div className="py-1">
                    {QUICK_BOOKING_OPTIONS.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => openBooking(option.category)}
                        className="site-nav-quickbook-option"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Link
              to="/login"
              className={`site-nav-action-link rounded-full ${
                transparentMode
                  ? `${transparentTextClass} ${transparentActionOverlayClass}`
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              <LogIn className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
              LOGIN
            </Link>

            <ThemeToggle
              className={
                transparentMode && isTransparentHeroRoute
                  ? "bg-black/20 border-white/15 text-white backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:bg-black/28 hover:text-white"
                  : ""
              }
            />
          </div>

          {/* Mobile Actions */}
          <div className="xl:hidden flex items-center gap-3">
            {showQuickBook && (
              <button
                onClick={() => openBooking("hotel")}
                className={`transition-colors cursor-pointer rounded-full p-2 ${
                  transparentMode
                    ? `${transparentTextClass} ${transparentActionOverlayClass}`
                    : "text-foreground hover:text-primary"
                }`}
                aria-label="Quick Book"
              >
                <Calendar className="w-5 h-5" />
              </button>
            )}

            <ThemeToggle
              className={
                transparentMode && isTransparentHeroRoute
                  ? "bg-black/20 border-white/15 text-white backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.18)] hover:bg-black/28 hover:text-white"
                  : ""
              }
            />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`transition-colors relative cursor-pointer rounded-full p-2 ${
                transparentMode
                  ? `${transparentTextClass} ${transparentActionOverlayClass}`
                  : "text-foreground hover:text-primary"
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
          transparentMode={transparentMode}
          transparentTextClass={transparentTextClass}
          transparentBorderClass={transparentBorderClass}
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
  transparentMode: boolean;
  transparentTextClass: string;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
  handleHashLink: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
  isActive: boolean;
}

function NavItem({
  item,
  transparentMode,
  transparentTextClass,
  activeDropdown,
  setActiveDropdown,
  handleHashLink,
  isActive,
}: NavItemProps) {
  const isHovered = activeDropdown === item.key;
  const showIndicator = isHovered || isActive;

  if (item.type === "link") {
    return (
      <div className="relative">
        <Link
          to={item.href}
          onClick={(e) => handleHashLink(e, item.href)}
          className={`site-nav-link ${
            isActive
              ? "text-primary"
              : transparentMode
                ? transparentTextClass
                : "text-foreground hover:text-primary"
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
        className={`site-nav-link ${
          isActive
            ? "text-primary"
            : transparentMode
              ? transparentTextClass
              : "text-foreground hover:text-primary"
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
  items: { label: string; href: string; external?: boolean }[];
  handleHashLink: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
}

function DropdownMenu({ items, handleHashLink }: DropdownMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="site-nav-dropdown"
    >
      <div className="py-2">
        {items.map((subItem, idx) =>
          subItem.external ? (
            <a
              key={idx}
              href={subItem.href}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav-dropdown-link"
            >
              {subItem.label}
            </a>
          ) : (
            <Link
              key={idx}
              to={subItem.href}
              onClick={(e) => handleHashLink(e, subItem.href)}
              className="site-nav-dropdown-link"
            >
              {subItem.label}
            </Link>
          ),
        )}
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
  transparentMode: boolean;
  transparentTextClass: string;
  transparentBorderClass: string;
  navItems: NavItem[];
  handleHashLink: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
}

function MobileMenu({
  mobileMenuOpen,
  mobileExpandedMenu,
  setMobileExpandedMenu,
  transparentMode,
  transparentTextClass,
  transparentBorderClass,
  navItems,
  handleHashLink,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="site-mobile-menu"
        >
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={(e) => handleHashLink(e, item.href)}
                  className={`site-mobile-link ${
                    transparentMode
                      ? `${transparentTextClass} hover:bg-accent`
                      : "text-foreground hover:bg-accent hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <MobileDropdown
                  key={item.key}
                  item={item}
                  mobileExpandedMenu={mobileExpandedMenu}
                  setMobileExpandedMenu={setMobileExpandedMenu}
                  transparentMode={transparentMode}
                  transparentTextClass={transparentTextClass}
                  handleHashLink={handleHashLink}
                />
              ),
            )}

            <div className="px-4 pt-4">
              <Link
                to="/login"
                onClick={(e) => handleHashLink(e, "/login")}
                className={`site-mobile-login ${
                  transparentMode
                    ? transparentBorderClass
                    : "border-border/20 text-foreground hover:border-primary hover:text-primary hover:bg-primary/10"
                }`}
              >
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
  item: Exclude<NavItem, { type: "link" }>;
  mobileExpandedMenu: string | null;
  setMobileExpandedMenu: (key: string | null) => void;
  transparentMode: boolean;
  transparentTextClass: string;
  handleHashLink: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
}

function MobileDropdown({
  item,
  mobileExpandedMenu,
  setMobileExpandedMenu,
  transparentMode,
  transparentTextClass,
  handleHashLink,
}: MobileDropdownProps) {
  const isExpanded = mobileExpandedMenu === item.key;

  return (
    <div className="border-b border-border/5">
      <button
        onClick={() => setMobileExpandedMenu(isExpanded ? null : item.key)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors relative cursor-pointer ${
          transparentMode
            ? `${transparentTextClass} hover:bg-accent/50`
            : "text-foreground hover:bg-accent/50 hover:text-primary"
        }`}
      >
        <span className="flex items-center gap-2">
          {item.label}
          {!isExpanded && (
            <span className="relative">
              <BlinkingIndicator />
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        />
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
            {item.items.map((subItem, idx) =>
              subItem.external ? (
                <a
                  key={idx}
                  href={subItem.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-mobile-submenu-link"
                >
                  {subItem.label}
                </a>
              ) : (
                <Link
                  key={idx}
                  to={subItem.href}
                  onClick={(e) => handleHashLink(e, subItem.href)}
                  className="site-mobile-submenu-link"
                >
                  {subItem.label}
                </Link>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
