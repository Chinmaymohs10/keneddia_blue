import { useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import HeroBanner from "./components/HeroBanner";
import RestaurantQuickBooking from "./components/RestaurantQuickBooking";
import RestaurantProperties from "./components/RestaurantProperties";
import RestaurantOffers from "./components/RestaurantOffers";
import RestaurantBestSellers from "./components/RestaurantBestSellers";
import CuisineCategories from "./components/CuisineCategories";
import AboutRestaurant from "./components/AboutRestaurant";
import PerformanceMetrics from "./components/PerformanceMetrics";
import BanquetsAndCatering from "./components/BanquetsAndCatering";
import EventsSchedule from "./components/EventsSchedule";
import RestaurantNewsSection from "./components/RestaurantNewsSection";
import RestaurantGuestReviews from "./components/RestaurantGuestReviews";
import SignatureDishes from "./components/SignatureDishes";
import ReservationForm from "./components/ReservationForm";
import Testimonials from "./components/Testimonials";
import { siteContent } from "@/data/siteContent";
import { useSsrData } from "@/ssr/SsrDataContext";

// Restaurant Navigation Items (following Hotels page pattern)
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "EVENTS", key: "events", href: "#events" },
  // { type: "link", label: "NEWS", key: "news", href: "#news" },
  // { type: "link", label: "REVIEWS", key: "reviews", href: "#reviews" },
  {
    type: "link",
    label: "RESERVATION",
    key: "reservation",
    href: "#reservation",
  },
  // { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];

export default function RestaurantHomepage() {
  const { restaurantHomepage: ssr } = useSsrData();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen bg-background [scrollbar-gutter:stable]"
      data-ssr-hero={ssr?.heroSlides?.length ?? 0}
      data-ssr-offers={ssr?.restaurantOffers?.length ?? 0}
      data-ssr-properties={ssr?.restaurantProperties?.length ?? 0}
      data-ssr-best-sellers={ssr?.bestSellers?.length ?? 0}
      data-ssr-news={ssr?.restaurantNews?.length ?? 0}
      data-ssr-events={ssr?.restaurantEvents?.length ?? 0}
      data-ssr-reviews={ssr?.guestExperiences?.length ?? 0}
    >
      {/* Main Navbar with Restaurant-specific items */}
      <Navbar
        navItems={RESTAURANT_NAV_ITEMS}
        logo={siteContent.brand.logo_restaurant}
        quickBookOptions={[{ label: "Reserve Restaurant", category: "restaurant" }]}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div id="home">
          <HeroBanner initialSlides={ssr?.heroSlides} />
        </div>

        <div id="quick-booking">
          <RestaurantQuickBooking />
        </div>
        <RestaurantOffers initialOffers={ssr?.restaurantOffers} />
        <RestaurantProperties initialRestaurants={ssr?.restaurantProperties} />
        <RestaurantBestSellers initialItems={ssr?.bestSellers} />
        <AboutRestaurant initialSections={ssr?.aboutSections} />
        <EventsSchedule
          initialEvents={ssr?.restaurantEvents}
          initialGroupBookings={ssr?.groupBookings}
          initialRestaurantTypeId={ssr?.restaurantTypeId}
        />
        <RestaurantNewsSection initialNews={ssr?.restaurantNews} />
        <RestaurantGuestReviews
          initialExperiences={ssr?.guestExperiences}
          initialSectionHeader={ssr?.sectionHeader}
          initialRatingHeader={ssr?.ratingHeader}
          initialRestaurantTypeId={ssr?.restaurantTypeId}
        />
      </main>

      {/* Footer */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
