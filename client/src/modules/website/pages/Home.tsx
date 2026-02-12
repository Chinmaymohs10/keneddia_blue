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

export default function Home() {
  const handleScrollToBusiness = () => {
    const businessSection = document.getElementById("business");
    if (businessSection) {
      businessSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <section id="daily-offers" className="border-b border-section-divider"><DailyOffers /></section>
        <section id="properties" className="border-b border-section-divider"><PropertiesSection /></section>
        <section id="about" className="border-b border-section-divider"><AboutUsSection /></section>
        <section id="business" className="border-b border-section-divider"><BusinessVerticals /></section>
        <section id="events" className="border-b border-section-divider"><EventsSection /></section>
        <section id="news" className="border-b border-section-divider"><NewsPress /></section>
        <section id="story" className="border-b border-section-divider"><OurStoryPreview /></section>
        <section id="global"><GlobalPresence /></section>
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