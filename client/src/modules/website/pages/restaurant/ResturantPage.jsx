import { useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import ResturantBanner from "./resturantpage/ResturantBanner";
import ResturantSubCategories from "./resturantpage/ResturantSubCategories";
import AboutResturantPage from "./resturantpage/AboutResturantPage";
import ResturantpageOffers from "./resturantpage/ResturantpageOffers";
import ResturantpageEvents from "./resturantpage/ResturantpageEvents";
import SignatureDishesAndBuffet from "./resturantpage/SignatureDishesAndBuffet";
import Testimonials from "./components/Testimonials";
import ResturantGallerypage from "./resturantpage/ResturantGallerypage";
import { siteContent } from "@/data/siteContent";
import { useParams } from "react-router-dom";

/* ===============================
   RESTAURANT NAVIGATION ITEMS
================================= */
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "EVENTS", key: "events", href: "#events" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
  { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];

export default function RestaurantHomepage() {
  const params = useParams();
  const propertyId = params.propertyId;

  /* Scroll to top on page load */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ===============================
          NAVBAR
      =============================== */}
      <Navbar
        navItems={RESTAURANT_NAV_ITEMS}
        logo={siteContent.brand.logo}
      />

      {/* ===============================
          MAIN CONTENT
      =============================== */}
      <main>
        {/* HERO SECTION */}
        <div id="home">
          <ResturantBanner propertyId={propertyId} />
        </div>

        {/* MENU SECTION (Categories + Signature Dishes) */}
        <div id="menu">
          <ResturantSubCategories propertyId={propertyId} />
          <SignatureDishesAndBuffet propertyId={propertyId} />
        </div>

        {/* OFFERS SECTION */}
        <div id="offers">
          <ResturantpageOffers propertyId={propertyId} />
        </div>

        {/* ABOUT SECTION */}
        <div id="about">
          <AboutResturantPage propertyId={propertyId} />
        </div>

        {/* EVENTS SECTION */}
        <div id="events">
          <ResturantpageEvents propertyId={propertyId} />
        </div>

        {/* TESTIMONIALS */}
        <Testimonials propertyId={propertyId} />

        {/* GALLERY SECTION */}
        <div id="gallery">
          <ResturantGallerypage propertyId={propertyId} />
        </div>
      </main>

      {/* ===============================
          FOOTER / CONTACT
      =============================== */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
