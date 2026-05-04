import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import { useSsrData } from "@/ssr/SsrDataContext";
import WineHeroBanner from "./components/WineHeroBanner";
import WineNewsSection from "./components/WineNewsSection";
import { WineCategoriesSection } from "./winepage/WineSignatureDrinks";

const WineBestSellers = lazy(() => import("./components/WineBestSellers"));
const WineTopBrands = lazy(() => import("./components/WineTopBrands"));
const WineAbout = lazy(() => import("./components/WineAbout"));

const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "CATEGORIES", key: "categories", href: "#categories" },
  { type: "link", label: "COLLECTION", key: "collection", href: "#collection" },
  { type: "link", label: "BRANDS", key: "brand", href: "#brand" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "NEWS", key: "news", href: "#news" },
  { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];

// ─── KENNEDIA WINES LOADER ────────────────────────────────────────────────────
function KenediaWinesLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0D0508]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } }}
    >
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
            opacity: [0.03, 0.07, 0.03]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -right-1/4 -top-1/4 h-[80%] w-[80%] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #8B1A2A 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [0, -5, 0],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 h-[80%] w-[80%] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* The Minimalist 'K' Monogram */}
        <div className="relative mb-8 h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <style>{`
              @keyframes dash { to { stroke-dashoffset: 0; } }
              @keyframes revealText { to { opacity: 1; transform: translateY(0); } }
              @keyframes pulseSlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
            `}</style>

            {/* Outer Ring — Elegant Trace */}
            <circle
              cx="50" cy="50" r="48"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.5"
              strokeDasharray="301.6"
              strokeDashoffset="301.6"
              style={{ animation: "dash 2s cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
            />

            {/* Inner Ring — Dotted Accents */}
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#8B1A2A"
              strokeWidth="0.75"
              strokeDasharray="2 6"
              opacity="0"
              style={{ animation: "revealText 1s ease 0.8s forwards" }}
            />

            {/* Central 'K' Monogram */}
            <text
              x="50" y="62"
              textAnchor="middle"
              fill="white"
              fontSize="38"
              fontFamily="'Playfair Display', serif"
              fontWeight="300"
              opacity="0"
              style={{
                animation: "revealText 1.2s ease 0.4s forwards",
                transform: "translateY(10px)"
              }}
            >
              K
            </text>
          </svg>
        </div>

        {/* Brand Text Branding */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#D4AF37]">
              Kennedia
            </span>
            <div className="my-2 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
            <span className="italic font-serif text-[18px] tracking-[0.1em] text-white/90">
              Fine Wines & Estates
            </span>
          </motion.div>
        </div>

        {/* Loading Progress Line */}
        <div className="mt-12 h-[1px] w-48 overflow-hidden bg-white/5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="h-full w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}

function SectionFallback({ height = "h-40", eyebrow, heading }) {
  return (
    <div className={`container mx-auto px-4 py-10 ${height}`}>
      {(eyebrow || heading) && (
        <div className="mb-6 text-center">
          {eyebrow && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="text-2xl md:text-3xl font-serif text-foreground">{heading}</h2>
          )}
        </div>
      )}
      <div className="animate-pulse rounded-xl bg-muted/30" style={{ height: "60%" }} />
    </div>
  );
}

export default function WineHomepage() {
  const { wineHomepage: ssr } = useSsrData();
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setLoaderDone(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ── Kennedia Wines page loader ── */}
      <AnimatePresence>
        {!loaderDone && <KenediaWinesLoader key="loader" />}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden bg-background [scrollbar-gutter:stable]">
        <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} propertyTypeName="Wine" />

        <main>
          {/* Hero — full viewport */}
          <div id="home">
            <WineHeroBanner initialSlides={ssr?.heroSlides} />
          </div>

          <div id="categories" className="bg-[#F5F0EA] dark:bg-[#12070A]">
            <WineCategoriesSection />
          </div>

          {/* Collection */}
          <div id="collection" className="bg-[#FAF8F4] dark:bg-[#0D0508]">
            <Suspense fallback={<SectionFallback height="h-96" eyebrow="Wine Collection" heading="Handpicked from the world's finest vineyards" />}>
              <WineBestSellers />
            </Suspense>
          </div>

          {/* Brands */}
          <div id="brand" className="bg-[#F0EAE2] dark:bg-[#100609]">
            <Suspense fallback={<SectionFallback height="h-[24rem]" eyebrow="Curated Labels" heading="Top Brands" />}>
              <WineTopBrands clickable globalRoute />
            </Suspense>
          </div>

          {/* About */}
          <div id="about" className="bg-[#F5F0EA] dark:bg-[#0D0508]">
            <Suspense fallback={<SectionFallback height="h-80" heading="About Us" />}>
              <WineAbout initialSections={ssr?.wineAboutSections} />
            </Suspense>
          </div>

          {/* News & Press */}
          <div id="news" className="bg-[#EDE7DF] dark:bg-[#0A0407]">
            <Suspense fallback={<SectionFallback height="h-[28rem]" heading="Wine News & Press" />}>
              <WineNewsSection initialNews={ssr?.wineNews} />
            </Suspense>
          </div>
        </main>

        <div id="contact">
          <Footer />
        </div>
        {/* <WineWhatsAppButton /> */}
      </div>
    </>
  );
}
