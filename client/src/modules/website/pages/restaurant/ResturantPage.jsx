import { useState, useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import ResturantBanner from "./resturantpage/ResturantBanner";
import ResturantSubCategories from "./resturantpage/ResturantSubCategories";
import AboutResturantPage from "./resturantpage/AboutResturantPage";
import ResturantpageOffers from "./resturantpage/ResturantpageOffers";
import ResturantpageEvents from "./resturantpage/ResturantpageEvents";
import SignatureDishesAndBuffet from "./resturantpage/SignatureDishesAndBuffet";
import Testimonials from "./components/Testimonials";
import ResturantGallerypage from "./resturantpage/ResturantGallerypage";
import ReservationForm from "./components/ReservationForm";
import { siteContent } from "@/data/siteContent";
import { useParams } from "react-router-dom";
import {
  GetAllPropertyDetails,
  getAllGalleries,
  getGalleryByPropertyId,
} from "@/Api/Api";
/* ===============================
   RESTAURANT NAVIGATION ITEMS
================================= */
const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  // { type: "link", label: "OFFERS", key: "offers", href: "#offers" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  // { type: "link", label: "EVENTS", key: "events", href: "#events" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
  // { type: "link", label: "CONTACT", key: "contact", href: "#contact" },
];

export default function RestaurantHomepage() {
  const { propertyId, propertySlug } = useParams();
  const slugTail = propertySlug?.split("-").pop() || "";
  const numericPropertyId = Number(propertyId || slugTail) || null;

  const [propertyData, setPropertyData] = useState(null);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top (ONLY ONCE)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!numericPropertyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setPropertyData(null);
        setGalleryData([]);

        // 1️⃣ Fetch property details
        const response = await GetAllPropertyDetails();
        const rawData = response?.data || response;

        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
          (item) => {
            const parent = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];

            return listings.length === 0
              ? [{ parent, listing: null }]
              : listings.map((l) => ({ parent, listing: l }));
          },
        );

        const matched = flattened.find(
          (m) => Number(m.parent.id) === numericPropertyId,
        );

        if (!matched) {
          console.warn("Property not found");
          return;
        }

        const { parent, listing } = matched;

        const combinedProperty = {
          ...parent,
          ...listing,

          // Override specific fields cleanly
          id: parent.id,
          propertyId: parent.id,
          name: listing?.propertyName?.trim() || parent.propertyName,

          description: listing?.mainHeading || "",

          location: listing?.fullAddress || parent.address,

          city: listing?.city || parent.locationName,

          media:
            listing?.media?.length > 0 ? listing.media : parent.media || [],

          coordinates:
            parent.latitude && parent.longitude
              ? {
                  lat: Number(parent.latitude),
                  lng: Number(parent.longitude),
                }
              : null,
        };

        setPropertyData(combinedProperty);

        // 2️⃣ Fetch gallery using propertyId
        const galleryRes = await getGalleryByPropertyId(parent.id);

        const rawGallery =
          galleryRes?.data?.content || galleryRes?.data || galleryRes || [];

        const filteredGallery = (
          Array.isArray(rawGallery) ? rawGallery : []
        ).filter(
          (g) =>
            g.isActive &&
            g.media?.url &&
            !g.vertical && // exclude vertical galleries
            (g.categoryName || "").toLowerCase() !== "3d",
        );
        setGalleryData(filteredGallery);
      } catch (err) {
        console.error("Restaurant Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [numericPropertyId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        navItems={RESTAURANT_NAV_ITEMS}
        logo={siteContent.brand.logo_hotel}
      />

      <main>
        <div id="home">
          <ResturantBanner
            propertyData={propertyData}
            galleryData={galleryData}
            loading={loading}
          />
        </div>

        <div id="menu">
          <ResturantSubCategories
            propertyId={numericPropertyId}
            propertyData={propertyData}
          />
          <SignatureDishesAndBuffet propertyId={numericPropertyId} />
        </div>

        <div id="about">
          <AboutResturantPage propertyId={numericPropertyId} />
        </div>

        <div id="events">
          <ResturantpageEvents propertyId={numericPropertyId} />
        </div>

        <Testimonials propertyId={numericPropertyId} />

        <div id="gallery">
          <ResturantGallerypage propertyId={numericPropertyId} />
        </div>

        <ReservationForm propertyId={numericPropertyId} />
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
