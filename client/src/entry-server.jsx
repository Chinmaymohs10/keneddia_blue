import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
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
  // For large documents (full page with React SSR output) prettier is too slow;
  // use the fast regex fallback instead.
  if (html.length > 100_000) {
    return formatHtmlFallback(html);
  }

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

function serializeInitialData(initialData) {
  return JSON.stringify(initialData || {})
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function renderAppToString(app) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let appHtml = "";
    const stream = new PassThrough();
    const timeout = setTimeout(() => {
      abort();
      finish(reject, new Error("SSR render timed out while waiting for Suspense"));
    }, 15000);

    function finish(callback, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback(value);
    }

    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      appHtml += chunk;
    });
    stream.on("end", () => finish(resolve, appHtml));
    stream.on("error", (error) => finish(reject, error));

    const { pipe, abort } = renderToPipeableStream(app, {
      onAllReady() {
        pipe(stream);
      },
      onShellError(error) {
        finish(reject, error);
      },
      onError(error) {
        console.error("SSR render error:", error);
      },
    });
  });
}

export async function render(url, template) {
  const initialData = await loadInitialDataForUrl(url);

  const appHtml = await renderAppToString(
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

  const initialDataScript = `<script>window.__SSR_INITIAL_DATA__=${serializeInitialData(initialData)}</script>`;
  const assembledHtml = processedTemplate
    .replace(
      /<div id="root"><\/div>/,
      `<div id="root">${appHtml}</div>`,
    )
    .replace("</body>", `${initialDataScript}</body>`);

  const html = await formatHtmlDocument(assembledHtml);

  return { html, appHtml, initialData };
}
