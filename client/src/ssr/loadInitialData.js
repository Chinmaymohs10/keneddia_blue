import { fetchHomePageData } from "@/ssr/homepageData";
import { fetchHotelsPageData } from "@/ssr/hotelsPageData";
import { fetchRestaurantHomepageData } from "@/ssr/restaurantHomepageData";
import { fetchCafeHomepageData } from "@/ssr/cafeHomepageData";
import { fetchWineHomepageData } from "@/ssr/wineHomepageData";
import {
  fetchWineDetailPageData,
  fetchWineCategoryPageData,
  fetchWineSubCategoryPageData,
} from "@/ssr/wineDetailData";
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

  // --- Wine Detail Pages ---
  if (pathname.startsWith("/wine-detail/")) {
    const parts = pathname.split("/").filter(Boolean);
    // Case 1: /wine-detail/:city/:property
    if (parts.length === 3) {
      initialData.wineDetail = await fetchWineDetailPageData(pathname);
    }
    // Case 2: /wine-detail/:city/:property/sub/:slug
    else if (parts.length === 5 && parts[3] === "sub") {
      initialData.wineSubCategory = await fetchWineSubCategoryPageData(pathname);
    }
    // Case 3: /wine-detail/:city/:property/:category
    else if (parts.length === 4) {
      initialData.wineCategory = await fetchWineCategoryPageData(pathname);
    }
  }

  if (pathname.startsWith("/wine-categories/")) {
    initialData.wineCategory = await fetchWineCategoryPageData(pathname);
  }

  if (pathname.startsWith("/wine-subcategory/")) {
    initialData.wineSubCategory = await fetchWineSubCategoryPageData(pathname);
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
  if (propertyDetailMatch && !pathname.startsWith("/wine-detail/")) {
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
  if (propertyCategoryMatch && !pathname.startsWith("/wine-detail/")) {
    try {
      initialData.propertyCategory = await fetchPropertyCategoryPageData(pathname);
    } catch (err) {
      console.error("SSR propertyCategory fetch failed:", err?.message || err);
      initialData.propertyCategory = null;
    }
  }

  return initialData;
}
