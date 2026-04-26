import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getCafeSectionsByProperty } from "@/Api/CafeApi";
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
  const { propertySlug, propertyId: paramPropertyId } = useParams();
  const [storyData, setStoryData] = useState(null);

  // Extract propertyId from either paramPropertyId or propertySlug tail
  const resolvedPropertyId = useMemo(() => {
    const slugTail = propertySlug?.split("-").pop() || "";
    return Number(paramPropertyId || slugTail) || null;
  }, [paramPropertyId, propertySlug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (resolvedPropertyId) {
      fetchStory();
    }
  }, [resolvedPropertyId]);

  const fetchStory = async () => {
    try {
      const res = await getCafeSectionsByProperty(resolvedPropertyId);
      const data = res?.data?.data || res?.data;
      if (Array.isArray(data) && data.length > 0) {
        setStoryData(data[0]); // Take first section
      } else if (data && !Array.isArray(data)) {
        setStoryData(data);
      }
    } catch (error) {
      console.error("Failed to fetch cafe story", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar navItems={CAFE_NAV_ITEMS} logo={siteContent.brand.logo_cafe} />

      <main>
        <div id="home">
          <CafeBanner />
        </div>

        <div className="dark:hidden">
          <div className="h-px bg-[#E1E1DD]" />
          <div className="h-4 bg-linear-to-b from-[#F8F8F6] to-[#F7F7F5]" />
        </div>

        <div id="menu">
          <CafeSubCategories initialData={storyData} />
          <div className="dark:hidden">
            <div className="h-px bg-[#E3E3DF]" />
            <div className="h-4 bg-linear-to-b from-[#F7F7F5] to-[#EFEFEB]" />
          </div>
          <CafeSignatureDrinks />
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#EFEFEB] to-[#F5F5F3]" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <div id="about">
          <AboutCafePage />
        </div>

        <div className="dark:hidden">
          <div className="h-px bg-[#E1E1DD]" />
          <div className="h-4 bg-linear-to-b from-[#F5F5F3] to-[#ECECE8]" />
        </div>
        <div id="events">
          <CafepageEvents />
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#ECECE8] to-[#F7F7F5]" />
          <div className="h-px bg-[#E5E5E2]" />
        </div>
        <CafeTestimonials />

        <div className="dark:hidden">
          <div className="h-px bg-[#E5E5E2]" />
          <div className="h-4 bg-linear-to-b from-[#F7F7F5] to-[#F8F8F6]" />
        </div>
        <div id="gallery">
          <CafeGalleryPage />
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#F8F8F6] to-[#EFEFEB]" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <CafeReservationForm />
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
