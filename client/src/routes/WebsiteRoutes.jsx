import { Route } from "react-router-dom";

import Home from "@/modules/website/pages/Home";
import Hotels from "@/modules/website/pages/Hotels";
import HotelDetail from "@/modules/website/pages/HotelDetail";
import RoomSelection from "@/modules/website/pages/RoomSelection";
import Cafes from "@/modules/website/pages/Cafes";
import Bars from "@/modules/website/pages/Bars";
import Events from "@/modules/website/pages/Events";
import Entertainment from "@/modules/website/pages/Entertainment";
import About from "@/modules/website/pages/About";
import Reviews from "@/modules/website/pages/Reviews";
import Login from "@/modules/auth/login";
import NotFound from "@/modules/website/pages/not-found";
import OfferDetails from "@/modules/website/pages/OfferDetails";
import PropertyDetails from "@/modules/website/pages/PropertyDetails";
import EventDetails from "@/modules/website/pages/EventDetails";
import NewsDetails from "@/modules/website/pages/NewsDetails";
import HotelNewsDetails from "@/modules/website/pages/hotel/HotelNewsDetails";
import HotelOfferDetails from "@/modules/website/pages/hotel/HotelOfferDetails";
import NewsListing from "@/modules/website/pages/NewsListing";
import Careers from "@/modules/website/pages/Careers";
import Checkout from "@/modules/website/pages/Checkout";
import RestaurantHomepage from "@/modules/website/pages/restaurant/RestaurantHomepage";
import Italian from "@/modules/website/pages/restaurant/pages/verticals/Italian";
import LuxuryLounge from "@/modules/website/pages/restaurant/pages/verticals/LuxuryLounge";
import SpicyDarbar from "@/modules/website/pages/restaurant/pages/verticals/SpicyDarbar";
import TakeawayTreats from "@/modules/website/pages/restaurant/pages/verticals/TakeawayTreats";
import ResturantPage from "@/modules/website/pages/restaurant/ResturantPage";
import ResturantCategoryPageTemplate from "@/modules/website/pages/restaurant/ResturantCategoryPageTemplate";

const WebsiteRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="hotels" path="/hotels" element={<Hotels />} />,
  // <Route key="hotel-detail" path="/hotels/:city/:propertyId" element={<HotelDetail />} />,
  <Route key="hotel-detail" path="/hotels/:propertyId" element={<HotelDetail />} />,
  <Route key="room-selection" path="/hotels/:hotelId/rooms" element={<RoomSelection />} />,
  <Route key="cafes" path="/cafes" element={<Cafes />} />,
  <Route key="bars" path="/bars" element={<Bars />} />,
  <Route key="events" path="/events" element={<Events />} />,
  <Route key="entertainment" path="/entertainment" element={<Entertainment />} />,
  <Route key="about" path="/about" element={<About />} />,
  <Route key="reviews" path="/reviews" element={<Reviews />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="careers" path="/careers" element={<Careers />} />,
  <Route key="restaurant-homepage" path="/restaurant-homepage" element={<RestaurantHomepage />} />,
  <Route key="resturant-detail" path="/resturant/:propertyId" element={<ResturantPage />} />,

  // Restaurant Sub-Verticals
  <Route path="/restaurant/:propertyId/:categoryType" element={<ResturantCategoryPageTemplate />}/>,

  <Route key="restaurant-italian" path="/restaurant/italian" element={<Italian />} />,
  <Route key="restaurant-lounge" path="/restaurant/luxury-lounge" element={<LuxuryLounge />} />,
  <Route key="restaurant-spicy-darbar" path="/restaurant/spicy-darbar" element={<SpicyDarbar />} />,
  <Route key="restaurant-takeaway" path="/restaurant/takeaway" element={<TakeawayTreats />} />,

  // Detail Pages
  <Route key="offer-details" path="/offers/:id" element={<OfferDetails />} />,
  <Route key="property-details" path="/properties/:id" element={<PropertyDetails />} />,
  <Route key="event-details" path="/events/:id" element={<EventDetails />} />,

  // News
  <Route key="news-listing" path="/news" element={<NewsListing />} />,
  <Route key="news-details" path="/news/:id" element={<NewsDetails />} />,

  // Hotel Detail Pages
  <Route key="hotel-news-details" path="/hotel/news/:slug" element={<HotelNewsDetails />} />,
  <Route key="hotel-offer-details" path="/hotel/offers/:id" element={<HotelOfferDetails />} />,
  <Route key="checkout" path="/checkout" element={<Checkout />} />,

  <Route key="not-found" path="*" element={<NotFound />} />,
];

export default WebsiteRoutes;
