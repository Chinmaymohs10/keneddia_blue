import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import { useSsrData } from "@/ssr/SsrDataContext";
import WineHeroBanner from "./components/WineHeroBanner";

const WineBestSellers = lazy(() => import("./components/WineBestSellers"));
const WineTopBrands = lazy(() => import("./components/WineTopBrands"));
const WineAbout = lazy(() => import("./components/WineAbout"));
const WineShowcaseSlider = lazy(() => import("./components/WineShowcaseSlider"));

const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "COLLECTION", key: "collection", href: "#collection" },
  { type: "link", label: "BRANDS", key: "brand", href: "#brand" },
  { type: "link", label: "SHOWCASE", key: "showcase", href: "#showcase" },
  { type: "link", label: "REVIEWS", key: "reviews", href: "#reviews" },
  { type: "link", label: "RESERVATION", key: "reservation", href: "#reservation" },
];

// ─── KENNEDIA WINES LOADER ────────────────────────────────────────────────────
function KenediaWinesLoader() {
  const R_OUTER = 88;
  const R_INNER = 68;
  const CX = 110;
  const CY = 110;
  const circlePerimeter = 2 * Math.PI * R_OUTER;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0D0508]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.65, ease: "easeInOut" } }}
    >
      <div className="flex flex-col items-center">
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
          <style>{`
            @keyframes kw-draw { to { stroke-dashoffset: 0; } }
            @keyframes kw-fade { to { opacity: 1; } }
            @keyframes kw-expand {
              from { stroke-dasharray: 0 220; }
              to   { stroke-dasharray: 100 220; }
            }
            .kw-circle {
              stroke-dasharray: ${circlePerimeter};
              stroke-dashoffset: ${circlePerimeter};
              animation: kw-draw 1.4s cubic-bezier(0.4,0,0.2,1) 0.1s forwards;
            }
            .kw-fade-1 { opacity: 0; animation: kw-fade 0.5s ease 0.9s forwards; }
            .kw-fade-2 { opacity: 0; animation: kw-fade 0.5s ease 1.05s forwards; }
            .kw-fade-3 { opacity: 0; animation: kw-fade 0.5s ease 1.2s forwards; }
            .kw-fade-4 { opacity: 0; animation: kw-fade 0.5s ease 1.35s forwards; }
            .kw-fade-5 { opacity: 0; animation: kw-fade 0.5s ease 1.5s forwards; }
          `}</style>

          {/* Outer circle */}
          <circle
            cx={CX} cy={CY} r={R_OUTER}
            stroke="#C49A22" strokeWidth="1.4"
            className="kw-circle"
          />

          {/* Inner dotted arc — top half */}
          <path
            d={`M ${CX - R_INNER},${CY} A ${R_INNER},${R_INNER} 0 0,1 ${CX + R_INNER},${CY}`}
            stroke="#C49A22" strokeWidth="1.2"
            strokeDasharray="3.5 5"
            className="kw-fade-1"
          />

          {/* Top rule */}
          <line
            x1={CX - 58} y1={CY - 9} x2={CX + 58} y2={CY - 9}
            stroke="#C49A22" strokeWidth="0.7"
            className="kw-fade-2"
          />

          {/* KENNEDIA */}
          <text
            x={CX} y={CY + 5}
            textAnchor="middle"
            fill="white"
            fontSize="17"
            fontWeight="700"
            letterSpacing="6"
            fontFamily="Georgia, 'Times New Roman', serif"
            className="kw-fade-3"
          >
            KENNEDIA
          </text>

          {/* Bottom rule */}
          <line
            x1={CX - 58} y1={CY + 16} x2={CX + 58} y2={CY + 16}
            stroke="#C49A22" strokeWidth="0.7"
            className="kw-fade-2"
          />

          {/* Inner dotted arc — bottom half */}
          <path
            d={`M ${CX - R_INNER},${CY} A ${R_INNER},${R_INNER} 0 0,0 ${CX + R_INNER},${CY}`}
            stroke="#C49A22" strokeWidth="1.2"
            strokeDasharray="3.5 5"
            className="kw-fade-1"
          />

          {/* WINES — inside circle, below KENNEDIA band */}
          <text
            x={CX} y={CY + 42}
            textAnchor="middle"
            fill="#C49A22"
            fontSize="8.5"
            fontWeight="600"
            letterSpacing="7"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            className="kw-fade-4"
          >
            WINES
          </text>

          {/* ® mark */}
          <text
            x={CX + 52} y={CY + 3}
            textAnchor="start"
            fill="white"
            fontSize="7"
            fontFamily="serif"
            className="kw-fade-3"
          >
            ®
          </text>
        </svg>
      </div>
    </motion.div>
  );
}

function SectionFallback({ height = "h-40" }) {
  return (
    <div className={`container mx-auto px-4 ${height}`}>
      <div className="h-full animate-pulse rounded-xl bg-muted/30" />
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
        <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} />

        <main>
          {/* Hero — full viewport */}
          <div id="home">
            <WineHeroBanner initialSlides={ssr?.heroSlides} />
          </div>

          {/* Collection */}
          <div id="collection" className="bg-[#FAF8F4] dark:bg-[#0D0508]">
            <Suspense fallback={<SectionFallback height="h-96" />}>
              <WineBestSellers />
            </Suspense>
          </div>

          {/* Brands */}
          <div id="brand" className="bg-[#F0EAE2] dark:bg-[#100609]">
            <Suspense fallback={<SectionFallback height="h-[24rem]" />}>
              <WineTopBrands />
            </Suspense>
          </div>

          {/* About */}
          <div id="about" className="bg-[#F5F0EA] dark:bg-[#0D0508]">
            <Suspense fallback={<SectionFallback height="h-80" />}>
              <WineAbout />
            </Suspense>
          </div>

          {/* Showcase */}
          <div id="showcase" className="bg-[#EDE7DF] dark:bg-[#0A0407]">
            <Suspense fallback={<SectionFallback height="h-[28rem]" />}>
              <WineShowcaseSlider />
            </Suspense>
          </div>
        </main>

        <div id="contact">
          <Footer />
        </div>
      </div>
    </>
  );
}
