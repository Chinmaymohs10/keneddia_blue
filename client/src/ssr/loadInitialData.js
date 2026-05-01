import { fetchHomePageData } from "@/ssr/homepageData";
import { fetchHotelsPageData } from "@/ssr/hotelsPageData";
import { fetchRestaurantHomepageData } from "@/ssr/restaurantHomepageData";
import { fetchCafeHomepageData } from "@/ssr/cafeHomepageData";
import { fetchWineHomepageData } from "@/ssr/wineHomepageData";
import {
  fetchEventDetailPageData,
  fetchEventsListingData,
  fetchNewsDetailPageData,
  fetchNewsListingData,
  fetchOfferListingData,
} from "@/ssr/contentPagesData";
import {
  fetchPropertyCategoryPageData,
  fetchPropertyDetailPageData,
} from "@/ssr/propertyDetailData";
import { fetchGlobalSeo } from "@/lib/seo";

export async function loadInitialDataForUrl(url) {
  const pathname = new URL(url, "http://localhost").pathname;
  const initialData = {
    globalSeo: await fetchGlobalSeo(pathname),
  };

  if (pathname === "/") {
    initialData.home = await fetchHomePageData();
  }

  if (pathname === "/hotels" || pathname === "/hotels/") {
    initialData.hotels = await fetchHotelsPageData();
  }

  if (
    pathname === "/restaurant-homepage" ||
    pathname === "/restaurant-homepage/" ||
    pathname === "/resturant-homepage" ||
    pathname === "/resturant-homepage/"
  ) {
    initialData.restaurantHomepage = await fetchRestaurantHomepageData();
  }

  if (
    pathname === "/cafe-homepage" ||
    pathname === "/cafe-homepage/" ||
    pathname === "/cafe-page" ||
    pathname === "/cafe-page/"
  ) {
    initialData.cafeHomepage = await fetchCafeHomepageData();
  }

  if (pathname === "/wine-homepage" || pathname === "/wine-homepage/") {
    initialData.wineHomepage = await fetchWineHomepageData();
  }

  if (pathname === "/offers" || pathname === "/offers/") {
    initialData.offers = await fetchOfferListingData();
  }

  if (pathname === "/events" || pathname === "/events/") {
    initialData.events = await fetchEventsListingData();
  }

  const eventDetailMatch = pathname.match(/^\/events\/([^/]+)\/?$/);
  if (eventDetailMatch) {
    initialData.eventDetail = await fetchEventDetailPageData(eventDetailMatch[1]);
  }

  if (pathname === "/news" || pathname === "/news/") {
    initialData.news = await fetchNewsListingData();
  }

  const newsDetailMatch = pathname.match(/^\/news\/([^/]+)\/?$/);
  if (newsDetailMatch) {
    initialData.newsDetail = await fetchNewsDetailPageData(newsDetailMatch[1]);
  }

  const propertyDetailMatch = pathname.match(/^\/([^/]+)\/([^/]+-\d+)\/?$/);
  if (propertyDetailMatch) {
    try {
      initialData.propertyDetail = await fetchPropertyDetailPageData(pathname);
    } catch (err) {
      console.error("SSR propertyDetail fetch failed:", err?.message || err);
      initialData.propertyDetail = null;
    }
  }

  const propertyCategoryMatch = pathname.match(
    /^\/([^/]+)\/([^/]+-\d+)\/([^/]+)\/?$/,
  );
  if (propertyCategoryMatch) {
    try {
      initialData.propertyCategory = await fetchPropertyCategoryPageData(pathname);
    } catch (err) {
      console.error("SSR propertyCategory fetch failed:", err?.message || err);
      initialData.propertyCategory = null;
    }
  }

  return initialData;
}
