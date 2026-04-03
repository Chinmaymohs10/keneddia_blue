import { useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HeroBanner from "./components/HeroBanner";
import RestaurantQuickBooking from "./components/RestaurantQuickBooking";
import RestaurantProperties from "./components/RestaurantProperties";
import RestaurantOffers from "./components/RestaurantOffers";
import RestaurantBestSellers from "./components/RestaurantBestSellers";
import CuisineCategories from "./components/CuisineCategories";
import AboutRestaurant from "./components/AboutRestaurant";
import PerformanceMetrics from "./components/PerformanceMetrics";
import BanquetsAndCatering from "./components/BanquetsAndCatering";
import EventsSchedule from "./components/EventsSchedule";
import RestaurantNewsSection from "./components/RestaurantNewsSection";
import RestaurantGuestReviews from "./components/RestaurantGuestReviews";
import SignatureDishes from "./components/SignatureDishes";
import ReservationForm from "./components/ReservationForm";
import Testimonials from "./components/Testimonials";
import { siteContent } from "@/data/siteContent";

// Restaurant Navigation Items (following Hotels page pattern)
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "EVENTS", key: "events", href: "#events" },
  // { type: "link", label: "NEWS", key: "news", href: "#news" },
  // { type: "link", label: "REVIEWS", key: "reviews", href: "#reviews" },
  {
    type: "link",
    label: "RESERVATION",
    key: "reservation",
    href: "#reservation",
  },
  // { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];

export default function RestaurantHomepage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background [scrollbar-gutter:stable]">
      {/* Main Navbar with Restaurant-specific items */}
      <Navbar
        navItems={RESTAURANT_NAV_ITEMS}
        logo={siteContent.brand.logo_restaurant}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div id="home">
          <HeroBanner />
        </div>

        <RestaurantQuickBooking />
        <RestaurantOffers />
        <RestaurantProperties />
         <RestaurantBestSellers />
        <AboutRestaurant />
        {/* Events Schedule */}
        <EventsSchedule />
        <RestaurantNewsSection />
        <RestaurantGuestReviews />
        
      </main>

      {/* Footer */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
