import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
import { fetchHomePageData } from "@/ssr/homepageData";
import { fetchHotelsPageData } from "@/ssr/hotelsPageData";

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
