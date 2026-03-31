import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
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

const serializeInitialData = (data) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export async function render(url, template) {
  const pathname = new URL(url, "http://localhost").pathname;

  let initialData = {};

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

  const appHtml = renderToString(
    <StaticRouter location={url}>
      <App initialData={initialData} />
    </StaticRouter>,
  );

  const initialDataScript = `<script>window.__INITIAL_DATA__=${serializeInitialData(initialData)};</script>`;

  if (!template) {
    return { appHtml, initialData, initialDataScript };
  }

  const html = template
    .replace(/<div id="root"><\/div>/, `<div id="root">${appHtml}</div>`)
    .replace("</body>", `${initialDataScript}</body>`);

  return { html, appHtml, initialData };
}
