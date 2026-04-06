import { fetchHomePageData } from "@/ssr/homepageData";
import { fetchHotelsPageData } from "@/ssr/hotelsPageData";
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
    globalSeo: await fetchGlobalSeo(),
  };

  if (pathname === "/") {
    initialData.home = await fetchHomePageData();
  }

  if (pathname === "/hotels" || pathname === "/hotels/") {
    initialData.hotels = await fetchHotelsPageData();
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
    initialData.propertyDetail = await fetchPropertyDetailPageData(pathname);
  }

  const propertyCategoryMatch = pathname.match(
    /^\/([^/]+)\/([^/]+-\d+)\/([^/]+)\/?$/,
  );
  if (propertyCategoryMatch) {
    initialData.propertyCategory = await fetchPropertyCategoryPageData(pathname);
  }

  return initialData;
}
