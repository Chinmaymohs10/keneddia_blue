import { lazy, Suspense, useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import { useSsrData } from "@/ssr/SsrDataContext";
import WineHeroBanner from "./components/WineHeroBanner";

const WineBestSellers = lazy(() => import("./components/WineBestSellers"));
const WineTopBrands = lazy(() => import("./components/WineTopBrands"));
const WineProperties = lazy(() => import("./components/WineProperties"));
const WineAbout = lazy(() => import("./components/WineAbout"));
const WineShowcaseSlider = lazy(() => import("./components/WineShowcaseSlider"));
const WineGuestReviews = lazy(() => import("./components/WineGuestReviews"));
const WineQuickBooking = lazy(() => import("./components/WineQuickBooking"));

const WINE_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "COLLECTION", key: "collection", href: "#collection" },
  { type: "link", label: "BRANDS", key: "brand", href: "#brand" },
  { type: "link", label: "SHOWCASE", key: "showcase", href: "#showcase" },
  { type: "link", label: "REVIEWS", key: "reviews", href: "#reviews" },
  { type: "link", label: "RESERVATION", key: "reservation", href: "#reservation" },
];

function SectionFallback({ height = "h-40" }) {
  return (
    <div className={`container mx-auto px-4 ${height}`}>
      <div className="h-full animate-pulse rounded-xl bg-muted/30" />
    </div>
  );
}

export default function WineHomepage() {
  const { wineHomepage: ssr } = useSsrData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background [scrollbar-gutter:stable]">
      <Navbar navItems={WINE_NAV_ITEMS} logo={siteContent.brand.logo_bar} />

      <main>
        <div id="home">
          <WineHeroBanner initialSlides={ssr?.heroSlides} />
        </div>

        <div className="dark:hidden">
          <div className="h-px bg-[#E5E5E2]" />
          <div className="h-4 bg-linear-to-b from-white to-[#F7F7F5]" />
        </div>
        <div id="collection">
          <Suspense fallback={<SectionFallback height="h-96" />}>
            <WineBestSellers />
          </Suspense>
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#F7F7F5] to-white" />
          <div className="h-px bg-[#E5E5E2]" />
        </div>
        <div id="brand">
          <Suspense fallback={<SectionFallback height="h-[24rem]" />}>
            <WineTopBrands />
          </Suspense>
        </div>

        {/* <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#F5F5F3] to-white" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <div id="wine-properties">
          <Suspense fallback={<SectionFallback height="h-[32rem]" />}>
            <WineProperties locationMatch={null} />
          </Suspense>
        </div> */}

        <div className="dark:hidden">
          <div className="h-px bg-[#E3E3DF]" />
          <div className="h-4 bg-linear-to-b from-white to-[#EFEFEB]" />
        </div>
        <div id="about">
          <Suspense fallback={<SectionFallback height="h-80" />}>
            <WineAbout />
          </Suspense>
        </div>

        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#EFEFEB] to-white" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <div id="showcase">
          <Suspense fallback={<SectionFallback height="h-[28rem]" />}>
            <WineShowcaseSlider />
          </Suspense>
        </div>


        {/* 
        <div className="dark:hidden">
          <div className="h-px bg-[#E1E1DD]" />
          <div className="h-4 bg-linear-to-b from-[#F5F5F3] to-[#F8F8F6]" />
        </div>
        <div id="reviews">
          <Suspense fallback={<SectionFallback height="h-[36rem]" />}>
            <WineGuestReviews />
          </Suspense>
        </div> */}
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
