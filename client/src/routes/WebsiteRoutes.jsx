import { lazy, Suspense, useEffect, useState } from "react";
import { Route, useParams, Navigate } from "react-router-dom";
import Home from "@/modules/website/pages/Home";
import Cafes from "@/modules/website/pages/Cafes";
import Bars from "@/modules/website/pages/Bars";
import Events from "@/modules/website/pages/Events";
import Entertainment from "@/modules/website/pages/Entertainment";
import About from "@/modules/website/pages/About";
import Reviews from "@/modules/website/pages/Reviews";
import Login from "@/modules/auth/login";
import NotFound from "@/modules/website/pages/not-found";
import OfferListing from "@/modules/website/pages/OfferListing";
import OfferDetails from "@/modules/website/pages/OfferDetails";
import PropertyDetails from "@/modules/website/pages/PropertyDetails";
import EventDetails from "@/modules/website/pages/EventDetails";
import NewsDetails from "@/modules/website/pages/NewsDetails";
import HotelNewsDetails from "@/modules/website/pages/hotel/HotelNewsDetails";
import HotelOfferDetails from "@/modules/website/pages/hotel/HotelOfferDetails";
import Hotels from "@/modules/website/pages/Hotels";
import NewsListing from "@/modules/website/pages/NewsListing";
import Careers from "@/modules/website/pages/Careers";
import Checkout from "@/modules/website/pages/Checkout";
import HotelDetail from "@/modules/website/pages/HotelDetail";
import ResturantPage from "@/modules/website/pages/restaurant/ResturantPage";
import ResturantCategoryPageTemplate from "@/modules/website/pages/restaurant/ResturantCategoryPageTemplate";
import CafePage from "@/modules/website/pages/cafe/CafePage";
import RestaurantHomepage from "@/modules/website/pages/restaurant/RestaurantHomepage";
import CafeHomepage from "@/modules/website/pages/cafe/CafeHomepage";
import Italian from "@/modules/website/pages/restaurant/pages/verticals/Italian";
import LuxuryLounge from "@/modules/website/pages/restaurant/pages/verticals/LuxuryLounge";
import SpicyDarbar from "@/modules/website/pages/restaurant/pages/verticals/SpicyDarbar";
import TakeawayTreats from "@/modules/website/pages/restaurant/pages/verticals/TakeawayTreats";
import { GetAllPropertyDetails } from "@/Api/Api";
import { useSsrData } from "@/ssr/SsrDataContext";

const RoomSelection = lazy(() => import("@/modules/website/pages/RoomSelection"));
function withRouteSuspense(element) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

function PropertyDetailRoute() {
  const { propertySlug, propertyId } = useParams();
  const { propertyDetail } = useSsrData();

  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const isRestaurantHost = hostname.startsWith("restaurants.");
  const slugTail = propertySlug?.split("-").pop() || "";
  const resolvedPropertyId = Number(propertyId || slugTail) || null;
  const ssrResolvedType =
    propertyDetail?.propertyId === resolvedPropertyId &&
    (propertyDetail?.propertyType === "restaurant" ||
      propertyDetail?.propertyType === "cafe" ||
      propertyDetail?.propertyType === "hotel")
      ? propertyDetail.propertyType
      : null;
  const [resolvedType, setResolvedType] = useState(ssrResolvedType);

  useEffect(() => {
    let isMounted = true;

    if (ssrResolvedType) {
      setResolvedType(ssrResolvedType);
      return () => {
        isMounted = false;
      };
    }

    const resolvePropertyType = async () => {
      if (isRestaurantHost) {
        if (isMounted) setResolvedType("restaurant");
        return;
      }

      if (!resolvedPropertyId) {
        if (isMounted)
          setResolvedType(slugTail === "cafe" ? "cafe" : "hotel");
        return;
      }

      try {
        const response = await GetAllPropertyDetails();
        const rawData = response?.data?.data || response?.data || response || [];
        const matched = (Array.isArray(rawData) ? rawData : []).find(
          (item) => Number(item?.propertyResponseDTO?.id) === resolvedPropertyId,
        );

        if (!matched) {
          if (isMounted) setResolvedType("hotel");
          return;
        }

        const parentTypes = matched?.propertyResponseDTO?.propertyTypes || [];
        const listingTypes = (matched?.propertyListingResponseDTOS || [])
          .map((l) => l?.propertyType)
          .filter(Boolean);

        const allTypes = [...parentTypes, ...listingTypes]
          .map((t) => String(t).toLowerCase().trim());

        const isCafe = allTypes.some((t) => t === "cafe");
        const isRestaurant = allTypes.some((t) =>
          ["restaurant", "resturant", "wine & dine", "winedine", "dining"].includes(t),
        );

        if (isMounted)
          setResolvedType(isCafe ? "cafe" : isRestaurant ? "restaurant" : "hotel");
      } catch {
        if (isMounted) setResolvedType("hotel");
      }
    };

    setResolvedType(null);
    resolvePropertyType();
    return () => {
      isMounted = false;
    };
  }, [isRestaurantHost, resolvedPropertyId, ssrResolvedType]);

  if (!resolvedType) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading property...
      </div>
    );
  }

  return resolvedType === "cafe" ? <CafePage /> : resolvedType === "restaurant" ? <ResturantPage /> : <HotelDetail />;
}

const WebsiteRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  // <Route key="home" path="/" element={<Hotels />} />,
  // <Route key="home" path="/" element={withRouteSuspense(<RestaurantHomepage />)} />,


  // <Route path="/" element={<Navigate to="/ghaziabad/kennedia-blu-restaurant-ghaziabad-31" replace />}/>,
  
  <Route key="hotels" path="/hotels" element={<Hotels />} />,
  // <Route key="hotel-detail" path="/hotels/:city/:propertyId" element={<HotelDetail />} />,
  <Route key="property-detail" path="/:citySlug/:propertySlug" element={<PropertyDetailRoute />} />,
  // <Route key="hotel-detail" path="/hotels/:propertyId" element={<HotelDetail />} />,

  <Route key="room-selection" path="/hotels/:hotelId/rooms" element={withRouteSuspense(<RoomSelection />)} />,
  // <Route key="cafes" path="/cafes" element={<Cafes />} />,
  // <Route key="bars" path="/bars" element={<Bars />} />,
  <Route key="events" path="/events" element={<Events />} />,
  <Route key="offers" path="/offers" element={<OfferListing />} />,
  // OfferListing
  <Route key="entertainment" path="/entertainment" element={<Entertainment />} />,
  <Route key="about" path="/about" element={<About />} />,
  <Route key="reviews" path="/reviews" element={<Reviews />} />,
  <Route key="login" path="/login" element={<Login />} />,
  // <Route key="careers" path="/careers" element={<Careers />} />,

  <Route key="restaurant-homepage" path="/restaurant-homepage" element={withRouteSuspense(<RestaurantHomepage />)} />,
  <Route
    key="resturant-homepage-legacy"
    path="/resturant-homepage"
    element={<Navigate to="/restaurant-homepage" replace />}
  />,
  <Route key="cafe-homepage" path="/cafe-homepage" element={withRouteSuspense(<CafeHomepage />)} />,
  <Route key="cafe-page-preview" path="/cafe-page" element={<CafePage />} />,

  <Route key="resturant-detail-legacy" path="/resturant/:propertyId" element={withRouteSuspense(<ResturantPage />)} />,

  // Restaurant Sub-Verticals
  <Route path="/:citySlug/:propertySlug/:categoryType" element={<ResturantCategoryPageTemplate />}/>,

  <Route key="restaurant-italian" path="/restaurant/italian" element={<Italian />} />,
  <Route key="restaurant-lounge" path="/restaurant/luxury-lounge" element={<LuxuryLounge />} />,
  <Route key="restaurant-spicy-darbar" path="/restaurant/spicy-darbar" element={<SpicyDarbar />} />,
  <Route key="restaurant-takeaway" path="/restaurant/takeaway" element={<TakeawayTreats />} />,

  // Detail Pages
  <Route key="offer-details" path="/offers/:id" element={<OfferDetails />} />,
  <Route key="property-details" path="/properties/:id" element={<PropertyDetails />} />,
  <Route key="event-details" path="/events/:eventSlug" element={<EventDetails />} />,

  // News
  <Route key="news-listing" path="/news" element={<NewsListing />} />,
  <Route key="news-details" path="/news/:newsSlug" element={<NewsDetails />} />,

  // Hotel Detail Pages
  <Route key="hotel-news-details" path="/hotel/news/:slug" element={<HotelNewsDetails />} />,
  <Route key="hotel-offer-details" path="/hotel/offers/:id" element={<HotelOfferDetails />} />,
  <Route key="checkout" path="/checkout" element={<Checkout />} />,

  <Route key="not-found" path="*" element={<NotFound />} />,
];

export default WebsiteRoutes;
