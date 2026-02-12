import { useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import ResturantBanner from "./resturantpage/ResturantBanner";
import ResturantSubCategories from "./resturantpage/ResturantSubCategories";
import AboutResturantPage from "./resturantpage/AboutResturantPage";
import PerformanceMetrics from "./components/PerformanceMetrics";
import BanquetsAndCatering from "./components/BanquetsAndCatering";
import ResturantpageOffers from "./resturantpage/ResturantpageOffers";
import EventsSchedule from "./components/EventsSchedule";
import ResturantpageEvents from "./resturantpage/ResturantpageEvents";
import SignatureDishesAndBuffet from "./resturantpage/SignatureDishesAndBuffet";
import ReservationForm from "./components/ReservationForm";
import Testimonials from "./components/Testimonials";
import { siteContent } from "@/data/siteContent";
import { useParams } from "react-router-dom";

// Restaurant Navigation Items (following Hotels page pattern)
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  {
    type: "link",
    label: "RESERVATION",
    key: "reservation",
    href: "#reservation",
  },
  { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];

export default function RestaurantHomepage() {
  const params = useParams();
  const propertyId = params.propertyId;

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
          <ResturantBanner />
        </div>

        {/* Cuisine Categories */}
        <ResturantSubCategories />

        {/* Signature Dishes / Menu */}
        <SignatureDishesAndBuffet />
        
        {/* ResturantpageOffers */}
        <ResturantpageOffers />

        {/* About Section */}
        <AboutResturantPage />

        {/* Banquets & Catering */}
        {/* <BanquetsAndCatering /> */}

         {/* Testimonials */}
        <Testimonials />

        {/* Events Schedule */}
        <ResturantpageEvents />

        {/* Reservation Form */}
        <ReservationForm />
      </main>

      {/* Footer */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
