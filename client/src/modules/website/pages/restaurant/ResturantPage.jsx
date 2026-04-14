import { useState, useEffect } from "react";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import ResturantBanner from "./resturantpage/ResturantBanner";
import ResturantSubCategories from "./resturantpage/ResturantSubCategories";
import AboutResturantPage from "./resturantpage/AboutResturantPage";
import ResturantpageEvents from "./resturantpage/ResturantpageEvents";
import SignatureDishesAndBuffet from "./resturantpage/SignatureDishesAndBuffet";
import Testimonials from "./components/Testimonials";
import ResturantGallerypage from "./resturantpage/ResturantGallerypage";
import ReservationForm from "./components/ReservationForm";
import { siteContent } from "@/data/siteContent";
import { useParams } from "react-router-dom";
import { GetAllPropertyDetails, getGalleryByPropertyId } from "@/Api/Api";
import { useSsrData } from "@/ssr/SsrDataContext";
import {
  applySeoToDocument,
  fetchPropertySeo,
  resetSeoDocument,
} from "@/lib/seo";

const RESTAURANT_NAV_ITEMS = [
  { type: "link", label: "HOME", key: "home", href: "#home" },
  { type: "link", label: "MENU", key: "menu", href: "#menu" },
  { type: "link", label: "ABOUT", key: "about", href: "#about" },
  { type: "link", label: "GALLERY", key: "gallery", href: "#gallery" },
];

export default function RestaurantHomepage() {
  const { propertyId, propertySlug } = useParams();
  const { propertyDetail } = useSsrData();
  const slugTail = propertySlug?.split("-").pop() || "";
  const numericPropertyId = Number(propertyId || slugTail) || null;
  const ssrRestaurantDetail =
    propertyDetail?.propertyType === "restaurant" &&
      propertyDetail?.propertyId === numericPropertyId
      ? propertyDetail.pageData
      : null;
  const ssrSeo =
    propertyDetail?.propertyId === numericPropertyId ? propertyDetail?.seo : null;

  const [propertyData, setPropertyData] = useState(
    ssrRestaurantDetail?.propertyData || null,
  );
  const [galleryData, setGalleryData] = useState(
    ssrRestaurantDetail?.galleryData || [],
  );
  const [loading, setLoading] = useState(!ssrRestaurantDetail);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncSeo = async () => {
      if (!numericPropertyId) return;

      if (ssrSeo) {
        applySeoToDocument(ssrSeo);
        return;
      }

      const seo = await fetchPropertySeo(numericPropertyId, window.location.pathname);
      if (isMounted) {
        applySeoToDocument(seo);
      }
    };

    syncSeo();

    return () => {
      isMounted = false;
      resetSeoDocument();
    };
  }, [numericPropertyId, ssrSeo]);

  useEffect(() => {
    if (ssrRestaurantDetail || !numericPropertyId) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setPropertyData(null);
        setGalleryData([]);

        const response = await GetAllPropertyDetails();
        const rawData = response?.data || response;

        const flattened = (Array.isArray(rawData) ? rawData : []).flatMap(
          (item) => {
            const parent = item.propertyResponseDTO;
            const listings = item.propertyListingResponseDTOS || [];

            return listings.length === 0
              ? [{ parent, listing: null }]
              : listings.map((listing) => ({ parent, listing }));
          },
        );

        const matched = flattened.find(
          (item) => Number(item.parent.id) === numericPropertyId,
        );

        if (!matched) {
          if (isMounted) setLoading(false);
          return;
        }

        const { parent, listing } = matched;
        const combinedProperty = {
          ...parent,
          ...listing,
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

        const galleryRes = await getGalleryByPropertyId(parent.id);
        const rawGallery =
          galleryRes?.data?.content || galleryRes?.data || galleryRes || [];
        const filteredGallery = (
          Array.isArray(rawGallery) ? rawGallery : []
        ).filter(
          (item) =>
            item?.isActive &&
            item?.media?.url &&
            !item?.vertical &&
            String(item?.categoryName || "").toLowerCase() !== "3d",
        );

        if (!isMounted) return;
        setPropertyData(combinedProperty);
        setGalleryData(filteredGallery);
      } catch (err) {
        console.error("Restaurant Fetch Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [numericPropertyId, ssrRestaurantDetail]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        navItems={RESTAURANT_NAV_ITEMS}
        logo={siteContent.brand.logo_restaurant}
        showQuickBook={true}
        quickBookOptions={[{ label: "Reserve Restaurant", href: "#reservation" }]}
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
        <div id="reservation">
          <ReservationForm propertyId={numericPropertyId} />
        </div>
      </main>

      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
