import { useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import WineBanner from "./winepage/WineBanner";
import WineSubCategories from "./winepage/WineSubCategories";
import AboutWinePage from "./winepage/AboutWinePage";
import WinepageEvents from "./winepage/WinepageEvents";
import WineSignatureDrinks from "./winepage/WineSignatureDrinks";
import WineTestimonials from "./winepage/WineTestimonials";
import WineGalleryPage from "./winepage/WineGalleryPage";
import WineReservationForm from "./winepage/WineReservationForm";
import WineTopBrands from "./components/WineTopBrands";
import { siteContent } from "@/data/siteContent";

const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "BRANDS", key: "brand", href: "#brand" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
];

export default function WinePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} />

      <main>
        <div id="home">
          <WineBanner />
        </div>

        <div id="menu">
          <div className="dark:hidden">
            <div className="h-px bg-[#E1E1DD]" />
            <div className="h-4 bg-linear-to-b from-[#F8F8F6] to-[#F7F7F5]" />
          </div>
          <WineSignatureDrinks />
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#F7F7F5] to-[#F5F5F3]" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <div id="brand">
          <WineTopBrands />
        </div>

        {/* <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#F5F5F3] to-[#EFEFEB]" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <div id="about">
          <AboutWinePage />
        </div> */}

        <div className="dark:hidden">
          <div className="h-px bg-[#E5E5E2]" />
          <div className="h-4 bg-linear-to-b from-[#F5F5F3] to-[#F8F8F6]" />
        </div>
        <div id="events">
          {/* <WinepageEvents /> */}
        </div>

        {/* <WineTestimonials /> */}
        <div id="gallery">
          <WineGalleryPage />
        </div>

        {/* <WineReservationForm /> */}
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
