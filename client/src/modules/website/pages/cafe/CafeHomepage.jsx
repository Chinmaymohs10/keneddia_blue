import { useState, useEffect, useCallback } from "react";
import { useGeolocated } from "react-geolocated";
import * as MapboxSearch from "@mapbox/search-js-core";
const { SearchBoxCore } = MapboxSearch;
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { siteContent } from "@/data/siteContent";
import { useSsrData } from "@/ssr/SsrDataContext";
import CafeHeroBanner from "./components/CafeHeroBanner";
import PageLoader from "@/modules/website/components/PageLoader";
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

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Cities with Kennedia cafe properties — used for matching against Mapbox nearby results
const PROPERTY_CITIES = ["Ghaziabad", "Noida", "Delhi", "Bhubaneswar", "Bangalore"];

// Only consider railway stations within this radius for city matching
const NEARBY_RADIUS_KM = 70;

export default function CafeHomepage() {
  const { cafeHomepage: ssr } = useSsrData();
  const [isPageReady, setIsPageReady] = useState(
    (ssr?.heroSlides?.length ?? 0) > 0,
  );
  const handleReady = useCallback(() => setIsPageReady(true), []);
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

        // ── Parallel fetch: railway stations + airports + cafes + reverse geocode ──
        const [stationsResult, airportsResult, cafesResult, reverseGeoRes] = await Promise.all([
          search.category("railway_station", { proximity: [longitude, latitude], limit: 15 }),
          search.category("airport", { proximity: [longitude, latitude], limit: 8 }),
          search.category("cafe", { proximity: [longitude, latitude], limit: 10 }),
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json` +
            `?access_token=${MAPBOX_ACCESS_TOKEN}&types=address,neighborhood,place,district,region,country`
          ).then((r) => r.json()),
        ]);

        // ── Parse reverse geocode → structured current location ──────────────────
        const geoFeature = reverseGeoRes.features?.[0];
        const ctx = geoFeature?.context ?? [];
        const currentLocation = {
          fullAddress: geoFeature?.place_name ?? "",
          neighborhood: ctx.find((c) => c.id.startsWith("neighborhood"))?.text ?? "",
          city: ctx.find((c) => c.id.startsWith("place"))?.text ?? "",
          district: ctx.find((c) => c.id.startsWith("district"))?.text ?? "",
          state: ctx.find((c) => c.id.startsWith("region"))?.text ?? "",
          country: ctx.find((c) => c.id.startsWith("country"))?.text ?? "",
        };

        // ── Process railway stations (city matching + display) ───────────────────
        const seenCities = new Set();
        const nearbyStations = stationsResult.features
          .map((f) => ({
            name: f.properties.name,
            city: f.properties.context?.place?.name || null,
            distanceKm: f.properties.distance / 1000,
          }))
          .filter((entry) => {
            if (!entry.city || entry.distanceKm > NEARBY_RADIUS_KM) return false;
            if (seenCities.has(entry.city)) return false;
            seenCities.add(entry.city);
            return true;
          });

        console.log(
          "Nearby Cities (within 70km):",
          nearbyStations.map((e) => `${e.city} — ${e.distanceKm.toFixed(2)}km`).join(" | ")
        );

        // ── Process airports ─────────────────────────────────────────────────────
        const nearbyAirports = airportsResult.features
          .filter((f) => f.properties.distance / 1000 <= NEARBY_RADIUS_KM)
          .map((f) => ({
            name: f.properties.name,
            distanceKm: f.properties.distance / 1000,
          }));

        // ── Process cafes ────────────────────────────────────────────────────────
        const nearbyCafes = cafesResult.features
          .filter((f) => f.properties.distance / 1000 <= NEARBY_RADIUS_KM)
          .map((f) => ({
            name: f.properties.name,
            distanceKm: f.properties.distance / 1000,
          }));

        // ── Match property city ──────────────────────────────────────────────────
        const matched = nearbyStations.find((entry) =>
          PROPERTY_CITIES.some(
            (propCity) => propCity.toLowerCase() === entry.city?.toLowerCase()
          )
        );

        const canonicalCity = matched
          ? PROPERTY_CITIES.find((c) => c.toLowerCase() === matched.city.toLowerCase())
          : null;

        if (canonicalCity) {
          console.log(`Location match found: ${canonicalCity} (${matched.distanceKm.toFixed(2)}km)`);
        } else {
          console.log("No property city matched nearby locations.");
        }

        setLocationMatch({
          city: canonicalCity,
          found: Boolean(canonicalCity),
          currentLocation,
          nearbyStations,
          nearbyAirports,
          nearbyCafes,
        });

        if (canonicalCity) setShowLocationPopup(true);

        setPlaces(stationsResult.features);
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
    <div
      className="min-h-screen bg-background [scrollbar-gutter:stable]"
      data-ssr-hero={ssr?.heroSlides?.length ?? 0}
      data-ssr-properties={ssr?.cafeProperties?.length ?? 0}
    >
      <AnimatePresence>{!isPageReady && <PageLoader />}</AnimatePresence>

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
          <CafeHeroBanner initialSlides={ssr?.heroSlides} onReady={handleReady} />
        </div>
        <div id="quick-booking">
          <CafeQuickBooking />
        </div>
        <div className="dark:hidden">
          <div className="h-px bg-[#E5E5E2]" />
          <div className="h-4 bg-linear-to-b from-white to-[#F7F7F5]" />
        </div>
        <CafeCoffeeStory initialData={ssr?.coffeeStory} />
        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#F7F7F5] to-white" />
          <div className="h-px bg-[#E5E5E2]" />
        </div>
        <div id="cafe-properties">
          <CafeProperties
            locationMatch={locationMatch}
            initialCafes={ssr?.cafeProperties}
          />
        </div>
        <div className="dark:hidden">
          <div className="h-px bg-[#E3E3DF]" />
          <div className="h-4 bg-linear-to-b from-white to-[#EFEFEB]" />
        </div>
        <CafeBestSellers
          initialItems={ssr?.bestSellers}
          cafeTypeId={ssr?.cafeTypeId}
        />
        <div className="dark:hidden">
          <div className="h-4 bg-linear-to-b from-[#EFEFEB] to-white" />
          <div className="h-px bg-[#E3E3DF]" />
        </div>
        <CafeAbout initialSections={ssr?.aboutSections} />
        <div className="dark:hidden">
          <div className="h-px bg-[#E5E5E2]" />
          <div className="h-4 bg-linear-to-b from-white to-[#F5F5F3]" />
        </div>
        <CafeShowcaseSlider
          initialEvents={ssr?.cafeEvents}
          initialOffers={ssr?.cafeOffers}
          initialGroupBookings={ssr?.groupBookings}
          initialCafeTypeId={ssr?.cafeTypeId}
        />
        <div className="dark:hidden">
          <div className="h-px bg-[#E1E1DD]" />
          <div className="h-4 bg-linear-to-b from-[#F5F5F3] to-[#ECECE8]" />
        </div>
        <CafeNewsSection initialNews={ssr?.cafeNews} />
        <div className="dark:hidden">
          <div className="h-px bg-[#E1E1DD]" />
          <div className="h-4 bg-linear-to-b from-[#ECECE8] to-[#F8F8F6]" />
        </div>
        <CafeGuestReviews
          initialExperiences={ssr?.guestExperiences}
          initialSectionHeader={ssr?.guestExperienceSectionHeader}
          initialRatingHeader={ssr?.guestExperienceRatingHeader}
          initialCafeTypeId={ssr?.cafeTypeId}
        />
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
