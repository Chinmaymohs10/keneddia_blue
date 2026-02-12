import { useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HeroBanner from "./components/HeroBanner";
import CuisineCategories from "./components/CuisineCategories";
import AboutRestaurant from "./components/AboutRestaurant";
import PerformanceMetrics from "./components/PerformanceMetrics";
import BanquetsAndCatering from "./components/BanquetsAndCatering";
import EventsSchedule from "./components/EventsSchedule";
import SignatureDishes from "./components/SignatureDishes";
import ReservationForm from "./components/ReservationForm";
import Testimonials from "./components/Testimonials";
import { siteContent } from "@/data/siteContent";

// Restaurant Navigation Items (following Hotels page pattern)
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "RESERVATION", key: "reservation", href: "#reservation" },
  { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];

export default function RestaurantHomepage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navbar with Restaurant-specific items */}
      <Navbar navItems={RESTAURANT_NAV_ITEMS} logo={siteContent.brand.logo} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div id="home">
          <HeroBanner />
        </div>

        {/* Cuisine Categories */}
        <CuisineCategories />

        {/* About Section */}
        <AboutRestaurant />
        
        {/* Banquets & Catering */}
        <BanquetsAndCatering />

        {/* Events Schedule */}
        <EventsSchedule />

        {/* Signature Dishes / Menu */}
        <SignatureDishes />

        {/* Reservation Form */}
        <ReservationForm />

        {/* Testimonials */}
        <Testimonials />
      </main>

      {/* Footer */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
