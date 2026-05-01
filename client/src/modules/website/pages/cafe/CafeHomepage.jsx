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

// Kennedia cafe property cities with fixed coordinates — used for direct distance matching
const PROPERTY_CITIES = [
  { name: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  { name: "Noida", lat: 28.5355, lng: 77.3910 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
];

// Show "nearby property" popup when user is within this km of a property city
const PROPERTY_MATCH_RADIUS_KM = 300;

// Only consider railway stations within this radius for display purposes
const NEARBY_RADIUS_KM = 100;

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function CafeHomepage() {
  const { cafeHomepage: ssr } = useSsrData();
  const isInsecureOrigin =
    typeof window !== "undefined" &&
    !window.isSecureContext &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";
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
    if (isInsecureOrigin) {
      console.warn(
        "CafeHomepage: Geolocation requires HTTPS or localhost. Current origin is insecure:",
        window.location.origin,
      );
      return;
    }
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
  }, [coords, isGeolocationAvailable, isGeolocationEnabled, isInsecureOrigin, positionError]);

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

        // ── Match property city via direct haversine distance ───────────────────
        // Mapbox station search only finds cities near the GPS pin, so spelling
        // variants and distant-but-nearest cities are unreliable. Instead we
        // calculate straight-line distance from the user to every property city
        // and pick the closest one within PROPERTY_MATCH_RADIUS_KM.
        const citiesWithDistance = PROPERTY_CITIES.map((pc) => ({
          ...pc,
          distanceKm: haversineKm(latitude, longitude, pc.lat, pc.lng),
        })).sort((a, b) => a.distanceKm - b.distanceKm);

        const nearestPropertyCity = citiesWithDistance[0];
        const canonicalCity =
          nearestPropertyCity && nearestPropertyCity.distanceKm <= PROPERTY_MATCH_RADIUS_KM
            ? nearestPropertyCity.name
            : null;

        console.log(
          "Property city distances:",
          citiesWithDistance.map((c) => `${c.name} — ${c.distanceKm.toFixed(0)}km`).join(" | ")
        );
        if (canonicalCity) {
          console.log(`Location match: ${canonicalCity} (${nearestPropertyCity.distanceKm.toFixed(0)}km away)`);
        } else {
          console.log(`No property city within ${PROPERTY_MATCH_RADIUS_KM}km. Nearest: ${nearestPropertyCity?.name} (${nearestPropertyCity?.distanceKm.toFixed(0)}km)`);
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
      className="min-h-screen bg-background [scrollbar-gutter:stable] overflow-x-hidden"
      data-ssr-hero={ssr?.heroSlides?.length ?? 0}
      data-ssr-properties={ssr?.cafeProperties?.length ?? 0}
    >
      <AnimatePresence>{!isPageReady && <PageLoader />}</AnimatePresence>

      <Navbar
        navItems={CAFE_NAV_ITEMS}
        logo={siteContent.brand.logo_cafe}
        showQuickBook={true}
        quickBookOptions={[{ label: "Reserve Cafe", category: "cafe" }]}
      />
     {/* {isInsecureOrigin && (
        <div className="relative z-[190] border-y border-amber-500/30 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">
              Nearby location is unavailable on this server URL.
            </p>
            <p className="text-amber-900/80">
              Open this page on HTTPS or localhost to allow browser location access.
            </p>
          </div>
        </div>
      )}*/}

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
                className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                className="mt-5 flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Nearby Properties
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        {/* SSR: structured cafe homepage data for crawlers */}
        <div className="sr-only" aria-hidden="true">
          {(ssr?.heroSlides || []).map((slide, i) => (
            <div key={i}>
              {slide.title && <h2>{slide.title}</h2>}
              {slide.desc && <p>{slide.desc}</p>}
              {slide.img && <img src={slide.img} alt={slide.title || "Cafe"} />}
            </div>
          ))}
          {ssr?.coffeeStory && (
            <div>
              {ssr.coffeeStory.heading && <h2>{ssr.coffeeStory.heading}</h2>}
              {ssr.coffeeStory.highlight && <p>{ssr.coffeeStory.highlight}</p>}
              {ssr.coffeeStory.description && <p>{ssr.coffeeStory.description}</p>}
            </div>
          )}
          {(ssr?.cafeProperties || []).length > 0 && (
            <ul>
              {ssr.cafeProperties.map((cafe) => (
                <li key={cafe.id}>
                  <h3>{cafe.name}</h3>
                  <p>{cafe.city}</p>
                  {cafe.location && <p>{cafe.location}</p>}
                  {cafe.description && <p>{cafe.description}</p>}
                  {cafe.image?.src && <img src={cafe.image.src} alt={cafe.image.alt || cafe.name} />}
                </li>
              ))}
            </ul>
          )}
          {ssr?.menuSectionHeader && (
            <div>
              {ssr.menuSectionHeader.heading && <h2>{ssr.menuSectionHeader.heading}</h2>}
              {ssr.menuSectionHeader.subHeading && <h3>{ssr.menuSectionHeader.subHeading}</h3>}
              {ssr.menuSectionHeader.description && <p>{ssr.menuSectionHeader.description}</p>}
            </div>
          )}
          {(ssr?.bestSellers || []).length > 0 && (
            <ul>
              {ssr.bestSellers.map((item) => (
                <li key={item.id}>
                  <h4>{item.title}</h4>
                  {item.description && <p>{item.description}</p>}
                  {item.image && <img src={item.image} alt={item.title} />}
                </li>
              ))}
            </ul>
          )}
          {(ssr?.aboutSections || []).map((section, i) => (
            <div key={i}>
              {section.sectionTitle && <h2>{section.sectionTitle}</h2>}
              {section.subTitle && <h3>{section.subTitle}</h3>}
              {section.description && <p>{section.description}</p>}
              {section.image && <img src={section.image} alt={section.sectionTitle || "About"} />}
            </div>
          ))}
          {(ssr?.cafeEvents || []).length > 0 && (
            <ul>
              {ssr.cafeEvents.map((event) => (
                <li key={event.id}>
                  <h4>{event.title}</h4>
                  {event.description && <p>{event.description}</p>}
                  {event.date && <span>{event.date}</span>}
                  {event.image?.url && <img src={event.image.url} alt={event.title} />}
                </li>
              ))}
            </ul>
          )}
          {(ssr?.cafeNews || []).length > 0 && (
            <ul>
              {ssr.cafeNews.map((news) => (
                <li key={news.id}>
                  <h4>{news.title}</h4>
                  {news.description && <p>{news.description}</p>}
                  {news.imageUrl && <img src={news.imageUrl} alt={news.title} />}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id="home" className="relative z-20 shadow-sm">
          <CafeHeroBanner initialSlides={ssr?.heroSlides} onReady={handleReady} />
        </div>
        <div id="quick-booking" className="relative z-30 shadow-sm">
          <CafeQuickBooking />
        </div>
        <div className="relative z-[9] shadow-sm">
          <CafeCoffeeStory initialData={ssr?.coffeeStory} />
        </div>
        <div id="cafe-properties" className="relative z-[8] shadow-sm">
          <CafeProperties
            locationMatch={locationMatch}
            initialCafes={ssr?.cafeProperties}
          />
        </div>
        <div className="relative z-[7] shadow-sm">
          <CafeBestSellers
            initialItems={ssr?.bestSellers}
            cafeTypeId={ssr?.cafeTypeId}
            initialHeaderData={ssr?.menuSectionHeader}
          />
        </div>
        <div className="relative z-[6] shadow-sm">
          <CafeAbout initialSections={ssr?.aboutSections} />
        </div>
        <div className="relative z-[5] shadow-sm">
          <CafeShowcaseSlider
            initialEvents={ssr?.cafeEvents}
            initialOffers={ssr?.cafeOffers}
            initialGroupBookings={ssr?.groupBookings}
            initialCafeTypeId={ssr?.cafeTypeId}
          />
        </div>
        <div className="relative z-[4] shadow-sm">
          <CafeNewsSection initialNews={ssr?.cafeNews} />
        </div>
        <div className="relative z-[3] shadow-sm">
          <CafeGuestReviews
            initialExperiences={ssr?.guestExperiences}
            initialSectionHeader={ssr?.guestExperienceSectionHeader}
            initialRatingHeader={ssr?.guestExperienceRatingHeader}
            initialCafeTypeId={ssr?.cafeTypeId}
          />
        </div>
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
