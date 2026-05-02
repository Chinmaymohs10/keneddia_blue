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
  // Only insert newlines between closing and opening tags at the top level —
  // NOT inside attribute values (data URIs, SVG href, etc.)
  // Strategy: split on tag boundaries while respecting quoted attribute values.
  let result = "";
  let inTag = false;
  let inAttr = false;
  let attrChar = "";

  for (let i = 0; i < html.length; i++) {
    const ch = html[i];

    if (inTag) {
      if (inAttr) {
        result += ch;
        if (ch === attrChar) inAttr = false;
      } else if (ch === '"' || ch === "'") {
        inAttr = true;
        attrChar = ch;
        result += ch;
      } else if (ch === ">") {
        result += ">\n";
        inTag = false;
      } else {
        result += ch;
      }
    } else if (ch === "<") {
      inTag = true;
      result += "<";
    } else {
      result += ch;
    }
  }

  return result.replace(/\n\s*\n/g, "\n").trim();
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
  let initialData = {};
  try {
    initialData = await loadInitialDataForUrl(url);
  } catch (err) {
    console.error("SSR loadInitialData failed:", err?.message || err);
  }

  let appHtml = "";
  try {
    appHtml = await renderAppToString(
      <StaticRouter location={url}>
        <App initialData={initialData} />
      </StaticRouter>,
    );
  } catch (err) {
    console.error("SSR renderAppToString failed:", err?.message || err);
    // Fall through with empty appHtml — client JS will hydrate normally
  }

  if (!template) {
    return { appHtml, initialData };
  }

  let processedTemplate = template;
  try {
    processedTemplate =
      initialData?.propertyDetail?.seo || initialData?.globalSeo
        ? injectSeoIntoHtml(
            template,
            initialData?.propertyDetail?.seo || initialData?.globalSeo,
          )
        : template;
  } catch (err) {
    console.error("SSR SEO injection failed:", err?.message || err);
  }

  const initialDataScript = `<script>window.__SSR_INITIAL_DATA__=${serializeInitialData(initialData)}</script>`;
  const assembledHtml = processedTemplate
    .replace(
      /<div id="root"><\/div>/,
      `<div id="root">${appHtml}</div>`,
    )
    .replace("</body>", `${initialDataScript}</body>`);

  let html = assembledHtml;
  // Skip formatting as it can introduce hydration mismatches by adding unexpected whitespace
  /*
  try {
    html = await formatHtmlDocument(assembledHtml);
  } catch (err) {
    console.error("SSR formatHtml failed:", err?.message || err);
  }
  */

  return { html, appHtml, initialData };
}
