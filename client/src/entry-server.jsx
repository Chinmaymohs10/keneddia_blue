import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
import { injectSeoIntoHtml } from "@/lib/seo";
import { loadInitialDataForUrl } from "@/ssr/loadInitialData";

let prettierPromise;

async function getPrettier() {
  if (!prettierPromise) {
    prettierPromise = import("prettier").catch(() => null);
  }

  return prettierPromise;
}

function formatHtmlFallback(html) {
  return html
    .replace(/></g, ">\n<")
    .replace(/^\s*\n/gm, "")
    .trim();
}

async function formatHtmlDocument(html) {
  const prettier = await getPrettier();

  if (!prettier?.format) {
    return formatHtmlFallback(html);
  }

  try {
    return await prettier.format(html, {
      parser: "html",
      htmlWhitespaceSensitivity: "ignore",
    });
  } catch {
    return formatHtmlFallback(html);
  }
}

export async function render(url, template) {
  const initialData = await loadInitialDataForUrl(url);

  const appHtml = renderToString(
    <StaticRouter location={url}>
      <App initialData={initialData} />
    </StaticRouter>,
  );

  if (!template) {
    return { appHtml, initialData };
  }

  const processedTemplate =
    initialData?.propertyDetail?.seo || initialData?.globalSeo
      ? injectSeoIntoHtml(
          template,
          initialData?.propertyDetail?.seo || initialData?.globalSeo,
        )
      : template;

  const rawHtml = processedTemplate.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${appHtml}</div>`,
  );
  const html = await formatHtmlDocument(rawHtml);

  return { html, appHtml, initialData };
}
