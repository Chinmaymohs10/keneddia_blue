import { useState, useEffect } from "react";
import * as MapboxSearch from '@mapbox/search-js-core';
const { SearchBoxCore } = MapboxSearch;
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import CafeHeroBanner from "./components/CafeHeroBanner";
import CafeProperties from "./components/CafeProperties";
import CafeAbout from "./components/CafeAbout";
import CafeCoffeeStory from "./components/CafeCoffeeStory";
import CafeBestSellers from "./components/CafeBestSellers";
import CafeShowcaseSlider from "./components/CafeShowcaseSlider";
import CafeNewsSection from "./components/CafeNewsSection";
import CafeGuestReviews from "./components/CafeGuestReviews";
import CafeQuickBooking from "./components/CafeQuickBooking";

const CAFE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "SHOWCASE", key: "showcase", href: "#showcase" },
  { type: "link", label: "NEWS", key: "news", href: "#news" },
  { type: "link", label: "RESERVATION", key: "reservation", href: "#reservation" },
];

export default function CafeHomepage() {
  const ACCESS_TOKEN = 'import.meta.env.VITE_MAPBOX_ACCESS_TOKEN';
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const search = new SearchBoxCore({ accessToken: ACCESS_TOKEN });

        const result = await search.category('atm', {
          proximity: [77.23, 28.61], // Delhi coordinates [lng, lat]
          limit: 10
        });

        console.log("Found:", result.features);
        setPlaces(result.features);
      } catch (error) {
        console.error("Mapbox search failed:", error);
      }
    };

    fetchNearby();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background [scrollbar-gutter:stable]">
      <Navbar navItems={CAFE_NAV_ITEMS} logo={siteContent.brand.logo_cafe} />

      <main>
        <div id="home">
          <CafeHeroBanner />
        </div>
        {/* <CafeQuickBooking /> */}
        <CafeCoffeeStory />
        <CafeProperties />
        <CafeBestSellers />
        <CafeAbout />
        <CafeShowcaseSlider />
        <CafeNewsSection />
        <CafeGuestReviews />
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
