import { motion } from "framer-motion";
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
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
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
      <Navbar />
      <main>
        <section
          id="hero"
          data-ssr-section="hero"
          data-ssr-count={debug.hero}
        >
          <Hero initialSlides={home?.heroData} />
        </section>
        <section
          id="daily-offers"
          className="border-b border-section-divider"
          data-ssr-section="daily-offers"
          data-ssr-count={debug.dailyOffers}
        >
          <DailyOffers initialOffers={home?.dailyOffers} />
        </section>
        <section
          id="properties"
          className="border-b border-section-divider"
          data-ssr-section="properties"
          data-ssr-count={debug.properties}
        >
          <PropertiesSection initialProperties={home?.properties} />
        </section>
        <section
          id="about"
          className="border-b border-section-divider"
          data-ssr-section="about"
          data-ssr-count={debug.about}
          data-ssr-ventures-count={debug.aboutVentures}
          data-ssr-recognitions-count={debug.aboutRecognitions}
        >
          <AboutUsSection initialData={home?.aboutData} />
        </section>
        <section
          id="business"
          className="border-b border-section-divider"
          data-ssr-section="business"
          data-ssr-count={debug.business}
        >
          <BusinessVerticals initialData={home?.businessData} />
        </section>
        <section
          id="events"
          className="border-b border-section-divider"
          data-ssr-section="events"
          data-ssr-count={debug.events}
        >
          <EventsSection initialEvents={home?.eventsData} />
        </section>
        <section
          id="news"
          className="border-b border-section-divider"
          data-ssr-section="news"
          data-ssr-count={debug.news}
        >
          <NewsPress initialItems={home?.newsData} />
        </section>
        <section
          id="story"
          className="border-b border-section-divider"
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
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-4 shadow-[0_4px_20px_rgba(251,191,36,0.4)] cursor-pointer hover:shadow-[0_6px_28px_rgba(251,191,36,0.6)] transition-all duration-300 group ring-1 ring-amber-500/30 hover:ring-amber-500/50 hover:scale-105"
        onClick={handleScrollToBusiness}
      >
        <div className="flex flex-col items-start bg-transparent">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-700 leading-none mb-1">
            Discover More
          </span>
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
            Explore Our Diversities
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-900/20 flex items-center justify-center group-hover:bg-gray-900/30 transition-colors">
          <ChevronDown className="w-4 h-4 animate-pulse text-gray-900" />
        </div>
      </motion.div>

      {/* <SpecialOfferPopup /> Remove from Home, only for Hotels page */}
      <Footer />
    </div>
  );
}
