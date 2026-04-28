import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import WineWhatsAppButton from "./components/WineWhatsAppButton";

const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "BRANDS", key: "brand", href: "#brand" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
];

// ─── KENNEDIA WINES LOADER ────────────────────────────────────────────────────
function KenediaWinesLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0D0508]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -right-1/4 -top-1/4 h-[80%] w-[80%] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #8B1A2A 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -5, 0], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 h-[80%] w-[80%] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="relative mb-8 h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <style>{`
              @keyframes dash { to { stroke-dashoffset: 0; } }
              @keyframes revealText { to { opacity: 1; transform: translateY(0); } }
            `}</style>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="301.6" strokeDashoffset="301.6" style={{ animation: "dash 2s cubic-bezier(0.4, 0, 0.2, 1) forwards" }} />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#8B1A2A" strokeWidth="0.75" strokeDasharray="2 6" opacity="0" style={{ animation: "revealText 1s ease 0.8s forwards" }} />
            <text x="50" y="62" textAnchor="middle" fill="white" fontSize="38" fontFamily="'Playfair Display', serif" fontWeight="300" opacity="0" style={{ animation: "revealText 1.2s ease 0.4s forwards", transform: "translateY(10px)" }}>K</text>
          </svg>
        </div>
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#D4AF37]">Kennedia</span>
            <div className="my-2 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
            <span className="italic font-serif text-[18px] tracking-[0.1em] text-white/90">Fine Wines & Estates</span>
          </motion.div>
        </div>
        <div className="mt-12 h-[1px] w-48 overflow-hidden bg-white/5">
          <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 2.2, ease: "easeInOut" }} className="h-full w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

export default function WinePage() {
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setLoaderDone(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!loaderDone && <KenediaWinesLoader key="loader" />}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden bg-background">
        <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} />

        <main>
          {/* Banner — Full Viewport */}
          <div id="home">
            <WineBanner />
          </div>

          {/* Menu / Signature Drinks */}
          <div id="menu" className="bg-[#FAF8F4] dark:bg-[#0D0508]">
            <div className="dark:hidden">
              <div className="h-px bg-[#E1E1DD]/40" />
            </div>
            <WineSignatureDrinks />
          </div>

          {/* Top Brands */}
          <div id="brand" className="bg-[#F0EAE2] pb-16 dark:bg-[#100609]">
            <div className="dark:hidden">
              <div className="h-px bg-[#DCD4CB]/40" />
            </div>
            <WineTopBrands clickable={true} />
          </div>

          {/* Gallery */}
          <div id="gallery" className="bg-[#EDE7DF] pb-16 dark:bg-[#0A0407]">
            <div className="dark:hidden">
              <div className="h-px bg-[#DED7CE]/40" />
            </div>
            <WineGalleryPage />
          </div>
        </main>

        <div id="contact" className="bg-[#EDE7DF] dark:bg-[#0A0407]">
          <Footer />
        </div>

        <WineWhatsAppButton />
      </div>
    </>
  );
}
