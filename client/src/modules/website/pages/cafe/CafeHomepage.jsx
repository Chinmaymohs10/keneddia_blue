import { useState, useEffect } from "react";
import { useGeolocated } from "react-geolocated";
import * as MapboxSearch from "@mapbox/search-js-core";
const { SearchBoxCore } = MapboxSearch;
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
const PROPERTY_CITIES = ["Ghaziabad", "Noida", "Delhi", "Jamshedpur"];

export default function CafeHomepage() {
  const [places, setPlaces] = useState([]);
  // { city: string, found: boolean } — passed down to CafeProperties
  const [locationMatch, setLocationMatch] = useState(null);

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
          limit: 10,
        });

        console.log("Found:", result.features);

        // Deduplicate city names (context.place.name), sorted by nearest distance
        const seenCities = new Set();
        const nearbyEntries = result.features
          .map((f) => ({
            city: f.properties.context?.place?.name || null,
            distanceKm: (f.properties.distance / 1000).toFixed(2),
          }))
          .filter((entry) => {
            if (!entry.city || seenCities.has(entry.city)) return false;
            seenCities.add(entry.city);
            return true;
          });

        console.log(
          "Nearby Cities:",
          nearbyEntries.map((e) => `${e.city} — ${e.distanceKm}km`).join(" | ")
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
          console.log(`Location match found: ${canonicalCity} (${matched.distanceKm}km)`);
          setLocationMatch({ city: canonicalCity, found: true });
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

  return (
    <div className="min-h-screen bg-background [scrollbar-gutter:stable]">
      <Navbar navItems={CAFE_NAV_ITEMS} logo={siteContent.brand.logo_cafe} />

      <main>
        <div id="home">
          <CafeHeroBanner />
        </div>
        <div id="quick-booking">
          <CafeQuickBooking />
        </div>
        <CafeCoffeeStory />
        <CafeProperties locationMatch={locationMatch} />
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
