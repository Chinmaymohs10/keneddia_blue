import { useState, useEffect } from "react";
import { useGeolocated } from "react-geolocated";
import * as MapboxSearch from "@mapbox/search-js-core";
const { SearchBoxCore } = MapboxSearch;
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
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

const MAPBOX_ACCESS_TOKEN =
  "import.meta.env.VITE_MAPBOX_ACCESS_TOKEN";

// Cities with Kennedia cafe properties — used for matching against Mapbox nearby results
const PROPERTY_CITIES = ["Ghaziabad", "Noida", "Delhi", "Bhubaneswar"];

// Only consider railway stations within this radius for city matching
const NEARBY_RADIUS_KM = 70;

export default function CafeHomepage() {
  const [places, setPlaces] = useState([]);
  // { city: string, found: boolean } — passed down to CafeProperties
  const [locationMatch, setLocationMatch] = useState(null);
  // popup shown when a nearby property city is detected
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // ── react-geolocated hook ────────────────────────────────────────────────
  const { coords, isGeolocationAvailable, isGeolocationEnabled, positionError } =
    useGeolocated({
      positionOptions: { enableHighAccuracy: false },
      userDecisionTimeout: 5000,
      watchPosition: false,
    });

  // ── Scroll to top on mount ───────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── Geolocation status logging ───────────────────────────────────────────
  useEffect(() => {
    if (!isGeolocationAvailable) {
      console.warn("CafeHomepage: Geolocation not supported by this browser.");
      return;
    }
    if (isGeolocationEnabled === false) {
      console.warn("CafeHomepage: Location permission denied.");
      return;
    }
    if (positionError) {
      console.warn(
        "CafeHomepage: Position error —",
        positionError.code === 1 ? "Permission denied" : "Location unavailable"
      );
      return;
    }
    if (!coords) {
      console.log("CafeHomepage: Waiting for user coordinates...");
    }
  }, [isGeolocationAvailable, isGeolocationEnabled, positionError, coords]);

  // ── fetchNearby — runs only once real coords are available ───────────────
  useEffect(() => {
    if (!coords) return;

    const { latitude, longitude } = coords;
    console.log("User Coordinates:", { latitude, longitude });

    const fetchNearby = async () => {
      try {
        const search = new SearchBoxCore({ accessToken: MAPBOX_ACCESS_TOKEN });

        // Search nearby railway stations — more granular than airports, resolves to the
        // exact city the user is in rather than a distant major airport city.
        const result = await search.category("railway_station", {
          proximity: [longitude, latitude],
          limit: 15,
        });

        console.log("Found:", result.features);

        // Deduplicate city names within 70km radius, sorted by nearest distance
        const seenCities = new Set();
        const nearbyEntries = result.features
          .map((f) => ({
            city: f.properties.context?.place?.name || null,
            distanceKm: f.properties.distance / 1000, // keep as number for comparison
          }))
          .filter((entry) => {
            // Hard 70km cutoff — prevents distant cities from polluting the match
            if (!entry.city || entry.distanceKm > NEARBY_RADIUS_KM) return false;
            if (seenCities.has(entry.city)) return false;
            seenCities.add(entry.city);
            return true;
          });

        console.log(
          "Nearby Cities (within 70km):",
          nearbyEntries.map((e) => `${e.city} — ${e.distanceKm.toFixed(2)}km`).join(" | ")
        );

        // Match against known property cities (case-insensitive)
        const matched = nearbyEntries.find((entry) =>
          PROPERTY_CITIES.some(
            (propCity) => propCity.toLowerCase() === entry.city.toLowerCase()
          )
        );

        if (matched) {
          const canonicalCity = PROPERTY_CITIES.find(
            (c) => c.toLowerCase() === matched.city.toLowerCase()
          );
          console.log(`Location match found: ${canonicalCity} (${matched.distanceKm.toFixed(2)}km)`);
          setLocationMatch({ city: canonicalCity, found: true });
          setShowLocationPopup(true);
        } else {
          console.log("No property city matched nearby locations.");
          setLocationMatch({ city: null, found: false });
        }

        setPlaces(result.features);
      } catch (error) {
        console.error("Mapbox search failed:", error);
      }
    };

    fetchNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const handlePopupOk = () => {
    setShowLocationPopup(false);
    setTimeout(() => {
      document.getElementById("cafe-properties")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background [scrollbar-gutter:stable]">
      <Navbar navItems={CAFE_NAV_ITEMS} logo={siteContent.brand.logo_cafe} />

      {/* ── Location match popup ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showLocationPopup && locationMatch?.city && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
              onClick={handlePopupOk}
            />

            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-1/2 top-1/2 z-[201] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
            >
              {/* Close icon */}
              <button
                onClick={handlePopupOk}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon badge */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>

              {/* Message */}
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Kennedia Cafe near you!
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                We found a Kennedia Cafe property in{" "}
                <span className="font-semibold text-primary">{locationMatch.city}</span>, near your
                current location.
              </p>

              {/* CTA */}
              <button
                onClick={handlePopupOk}
                className="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Nearby Properties
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        <div id="home">
          <CafeHeroBanner />
        </div>
        <div id="quick-booking">
          <CafeQuickBooking />
        </div>
        <CafeCoffeeStory />
        <div id="cafe-properties">
          <CafeProperties locationMatch={locationMatch} />
        </div>
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
