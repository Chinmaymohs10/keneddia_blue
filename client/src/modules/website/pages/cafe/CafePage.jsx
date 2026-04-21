import { useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import CafeBanner from "./cafepage/CafeBanner";
import CafeSubCategories from "./cafepage/CafeSubCategories";
import AboutCafePage from "./cafepage/AboutCafePage";
import CafepageEvents from "./cafepage/CafepageEvents";
import CafeSignatureDrinks from "./cafepage/CafeSignatureDrinks";
import CafeTestimonials from "./cafepage/CafeTestimonials";
import CafeGalleryPage from "./cafepage/CafeGalleryPage";
import CafeReservationForm from "./cafepage/CafeReservationForm";
import { siteContent } from "@/data/siteContent";

const CAFE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
];

export default function CafePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar navItems={CAFE_NAV_ITEMS} logo={siteContent.brand.logo_cafe} />

      <main>
        <div id="home">
          <CafeBanner />
        </div>

        <div id="menu">
          <CafeSubCategories />
          <div className="h-12 bg-linear-to-b from-[#E6E2D7] to-[#E4CDB0] dark:hidden" />
          <CafeSignatureDrinks />
        </div>

        <div className="h-12 bg-linear-to-b from-[#E4CDB0] to-[#E6E2D7] dark:hidden" />
        <div id="about">
          <AboutCafePage />
        </div>

        <div className="h-12 bg-linear-to-b from-[#E6E2D7] to-[#E4CDB0] dark:hidden" />
        <div id="events">
          <CafepageEvents />
        </div>

        <div className="h-12 bg-linear-to-b from-[#E4CDB0] to-[#E6E2D7] dark:hidden" />
        <CafeTestimonials />

        <div className="h-12 bg-linear-to-b from-[#E6E2D7] to-[#ABBF9B] dark:hidden" />
        <div id="gallery">
          <CafeGalleryPage />
        </div>

        <div className="h-12 bg-linear-to-b from-[#ABBF9B] to-[#E4CDB0] dark:hidden" />
        <CafeReservationForm />
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
