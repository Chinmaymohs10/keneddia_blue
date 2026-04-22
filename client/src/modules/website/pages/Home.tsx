import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "@/modules/website/components/PageLoader";
import { ChevronDown } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Hero from "@/modules/website/components/Hero";
import AboutUsSection from "@/modules/website/components/AboutUsSection";
import BusinessVerticals from "@/modules/website/components/BusinessVerticals";
import GlobalPresence from "@/modules/website/components/GlobalPresence";
import RatingsAndAwards from "@/modules/website/components/RatingsAndAwards";
import Footer from "@/modules/website/components/Footer";
// New Components
import DailyOffers from "@/modules/website/components/DailyOffers";
import PropertiesSection from "@/modules/website/components/PropertiesSection";
import EventsSection from "@/modules/website/components/EventsSection";
import NewsPress from "@/modules/website/components/NewsPress";
import OurStoryPreview from "@/modules/website/components/OurStoryPreview";
import SpecialOfferPopup from "@/modules/website/components/SpecialOfferPopup";
import { useSsrData } from "@/ssr/SsrDataContext";

export default function Home() {
  const { home } = useSsrData();
  const [isPageReady, setIsPageReady] = useState(
    (home?.heroData?.length ?? 0) > 0,
  );
  const handleReady = useCallback(() => setIsPageReady(true), []);
  const debug = {
    hero: home?.heroData?.length ?? 0,
    dailyOffers: home?.dailyOffers?.length ?? 0,
    properties: home?.properties?.length ?? 0,
    about: home?.aboutData?.aboutUsData ? 1 : 0,
    aboutVentures: home?.aboutData?.ventures?.length ?? 0,
    aboutRecognitions: home?.aboutData?.recognitions?.length ?? 0,
    business: home?.businessData?.divisions?.length ?? 0,
    events: home?.eventsData?.length ?? 0,
    news: home?.newsData?.length ?? 0,
    story: home?.storyData?.guestExperiences?.length ?? 0,
    storyHeader: home?.storyData?.sectionHeader ? 1 : 0,
    storyRating: home?.storyData?.ratingHeader ? 1 : 0,
    globalLocations: home?.globalData?.locations?.length ?? 0,
    globalSection: home?.globalData?.sectionData ? 1 : 0,
  };

  const handleScrollToBusiness = () => {
    if (typeof document === "undefined") return;
    const businessSection = document.getElementById("business");
    if (businessSection) {
      businessSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="website-shell">
      <div
        hidden
        aria-hidden="true"
        data-ssr-debug="home"
        data-hero-count={debug.hero}
        data-daily-offers-count={debug.dailyOffers}
        data-properties-count={debug.properties}
        data-about-count={debug.about}
        data-about-ventures-count={debug.aboutVentures}
        data-about-recognitions-count={debug.aboutRecognitions}
        data-business-count={debug.business}
        data-events-count={debug.events}
        data-news-count={debug.news}
        data-story-count={debug.story}
        data-story-header-count={debug.storyHeader}
        data-story-rating-count={debug.storyRating}
        data-global-locations-count={debug.globalLocations}
        data-global-section-count={debug.globalSection}
      />
      <AnimatePresence>{!isPageReady && <PageLoader />}</AnimatePresence>

      <Navbar />
      <main>
        <section
          id="hero"
          data-ssr-section="hero"
          data-ssr-count={debug.hero}
        >
          <Hero initialSlides={home?.heroData} onReady={handleReady} />
        </section>
        <section
          id="daily-offers"
          className="website-section-divider"
          data-ssr-section="daily-offers"
          data-ssr-count={debug.dailyOffers}
        >
          <DailyOffers initialOffers={home?.dailyOffers} />
        </section>
        <section
          id="properties"
          className="website-section-divider"
          data-ssr-section="properties"
          data-ssr-count={debug.properties}
        >
          <PropertiesSection initialProperties={home?.properties} />
        </section>
        <section
          id="about"
          className="website-section-divider"
          data-ssr-section="about"
          data-ssr-count={debug.about}
          data-ssr-ventures-count={debug.aboutVentures}
          data-ssr-recognitions-count={debug.aboutRecognitions}
        >
          <AboutUsSection initialData={home?.aboutData} />
        </section>
        <section
          id="business"
          className="website-section-divider"
          data-ssr-section="business"
          data-ssr-count={debug.business}
        >
          <BusinessVerticals initialData={home?.businessData} />
        </section>
        <section
          id="events"
          className="website-section-divider"
          data-ssr-section="events"
          data-ssr-count={debug.events}
        >
          <EventsSection initialEvents={home?.eventsData} />
        </section>
        <section
          id="news"
          className="website-section-divider"
          data-ssr-section="news"
          data-ssr-count={debug.news}
        >
          <NewsPress initialItems={home?.newsData} />
        </section>
        <section
          id="story"
          className="website-section-divider"
          data-ssr-section="story"
          data-ssr-count={debug.story}
          data-ssr-header-count={debug.storyHeader}
          data-ssr-rating-count={debug.storyRating}
        >
          <OurStoryPreview initialData={home?.storyData} />
        </section>
        <section
          id="global"
          data-ssr-section="global"
          data-ssr-locations-count={debug.globalLocations}
          data-ssr-section-count={debug.globalSection}
        >
          <GlobalPresence initialData={home?.globalData} />
        </section>
        {/* <section id="reviews"><RatingsAndAwards /></section> */}
      </main>

      {/* Hero Interaction Indicator - Enhanced for Better Visibility */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.8, type: "spring" }}
        className="website-floating-cta group"
        onClick={handleScrollToBusiness}
      >
        <div className="website-floating-cta-copy">
          <span className="website-floating-cta-badge">
            Discover More
          </span>
          <span className="website-floating-cta-title">
            Explore Our Diversities
          </span>
        </div>
        <div className="website-floating-cta-icon">
          <ChevronDown className="w-4 h-4 animate-pulse text-gray-900" />
        </div>
      </motion.div>

      {/* <SpecialOfferPopup /> Remove from Home, only for Hotels page */}
      <Footer />
    </div>
  );
}
