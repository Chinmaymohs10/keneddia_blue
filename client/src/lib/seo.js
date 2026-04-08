import { getAllGoogleTags, getAllMetaData } from "@/Api/Api";

const DEFAULT_TITLE = "Kennedia Hotels | Redefining Luxury Across India";
const SEO_MARKER_START = "<!-- dynamic-seo:start -->";
const SEO_MARKER_END = "<!-- dynamic-seo:end -->";
const BODY_MARKER_START = "<!-- dynamic-seo-body:start -->";
const BODY_MARKER_END = "<!-- dynamic-seo-body:end -->";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeScript = (value = "") => String(value).replace(/<\/script/gi, "<\\/script");

const isActiveSeo = (item) => Boolean(item?.active ?? item?.status);

const normalizePathname = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw, "http://localhost");
    const pathname = parsed.pathname || "/";
    return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  } catch {
    return "";
  }
};

const normalizeSchema = (rawSchema) => {
  const schemaValue = rawSchema?.trim();
  if (!schemaValue) {
    return { jsonLd: "", headMarkup: "" };
  }

  // Admin SEO input may contain raw head markup such as <meta>, <script>, or <link>.
  if (/<\s*(meta|script|link)\b/i.test(schemaValue)) {
    return { jsonLd: "", headMarkup: schemaValue };
  }

  try {
    const parsed = JSON.parse(schemaValue);
    if (parsed && typeof parsed === "object") {
      return { jsonLd: JSON.stringify(parsed), headMarkup: "" };
    }
  } catch {
    // Ignore invalid plain-text values instead of fabricating fallback SEO tags.
  }

  return { jsonLd: "", headMarkup: "" };
};

const selectSeoRecord = (list, { pathname = "", propertyId = null } = {}) => {
  const records = (Array.isArray(list) ? list : []).filter((item) => isActiveSeo(item));
  const normalizedPath = normalizePathname(pathname);

  const pathMatch =
    records
      .filter((item) => normalizePathname(item?.url) === normalizedPath)
      .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null;

  if (pathMatch) return pathMatch;

  if (!propertyId) return null;

  return (
    records
      .filter((item) => String(item?.propertyId ?? "") === String(propertyId ?? ""))
      .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null
  );
};

const selectGlobalGoogleTag = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((item) => isActiveSeo(item))
    .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null;

const extractGoogleTagId = (url = "") => {
  const trimmed = String(url).trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    return parsed.searchParams.get("id")?.trim() || "";
  } catch {
    const match = trimmed.match(/[?&]id=([^&]+)/i);
    return match?.[1]?.trim() || "";
  }
};

export async function fetchPropertySeo(propertyId, pathname = "") {
  try {
    const [metaRes, googleRes] = await Promise.all([
      getAllMetaData().catch(() => null),
      getAllGoogleTags().catch(() => null),
    ]);

    const metaList = metaRes?.data || metaRes || [];
    const googleList = googleRes?.data || googleRes || [];

    return {
      metaTag: selectSeoRecord(metaList, { propertyId, pathname }),
      googleTag: selectGlobalGoogleTag(googleList),
    };
  } catch {
    return { metaTag: null, googleTag: null };
  }
}

export async function fetchGlobalSeo(pathname = "") {
  try {
    const [metaRes, googleRes] = await Promise.all([
      getAllMetaData().catch(() => null),
      getAllGoogleTags().catch(() => null),
    ]);
    const metaList = metaRes?.data || metaRes || [];
    const googleList = googleRes?.data || googleRes || [];

    return {
      metaTag: selectSeoRecord(metaList, { pathname }),
      googleTag: selectGlobalGoogleTag(googleList),
    };
  } catch {
    return { metaTag: null, googleTag: null };
  }
}

export function buildSeoState(seo) {
  const metaTag = seo?.metaTag || null;
  const googleTag = seo?.googleTag || null;
  const title = metaTag?.metaTitle?.trim() || "";
  const description = metaTag?.metaDescription?.trim() || "";
  const keywords = metaTag?.metaKeywords?.trim() || "";
  const canonicalUrl = metaTag?.url?.trim() || "";
  const schema = normalizeSchema(metaTag?.skima);

  return {
    hasDynamicMeta: Boolean(
      title || description || keywords || canonicalUrl || schema.jsonLd || schema.headMarkup,
    ),
    title,
    description,
    keywords,
    canonicalUrl,
    schemaJsonLd: schema.jsonLd,
    headMarkup: schema.headMarkup,
    googleTagHeadUrl: googleTag?.category?.trim() || "",
    googleTagId: extractGoogleTagId(googleTag?.category),
    googleTagBodyUrl: googleTag?.description?.trim() || "",
  };
}

const setOrRemoveMeta = (selector, attrs, content) => {
  let element = document.head.querySelector(selector);

  if (!content) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  element.setAttribute("data-dynamic-seo", "meta");
};

const ensureCanonical = (href) => {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
  element.setAttribute("data-dynamic-seo", "canonical");
};

const removeInjectedNodes = () => {
  document.head.querySelectorAll("[data-dynamic-seo-script]").forEach((node) => node.remove());
  document.head.querySelectorAll("[data-dynamic-seo-head]").forEach((node) => node.remove());
  document.body?.querySelectorAll("[data-dynamic-seo-body]").forEach((node) => node.remove());
};

const injectHeadMarkup = (markup) => {
  if (!markup || typeof document === "undefined") return;

  const template = document.createElement("template");
  template.innerHTML = markup;

  Array.from(template.content.childNodes).forEach((node) => {
    if (!(node instanceof Element)) return;
    node.setAttribute("data-dynamic-seo-head", "custom");
    document.head.appendChild(node.cloneNode(true));
  });
};

const injectGoogleTagUrls = (headUrl, bodyUrl) => {
  if (headUrl) {
    const script = document.createElement("script");
    script.src = headUrl;
    script.async = true;
    script.setAttribute("data-dynamic-seo-script", "google-tag-head");
    document.head.appendChild(script);
  }

  const googleTagId = extractGoogleTagId(headUrl);
  if (googleTagId) {
    const configScript = document.createElement("script");
    configScript.textContent = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleTagId}');`;
    configScript.setAttribute("data-dynamic-seo-script", "google-tag-config");
    document.head.appendChild(configScript);
  }

  if (bodyUrl && document.body) {
    const noScript = document.createElement("noscript");
    noScript.setAttribute("data-dynamic-seo-body", "google-tag-body");
    noScript.innerHTML = `<iframe src="${escapeHtml(bodyUrl)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.appendChild(noScript);
  }
};

export function applySeoToDocument(seo) {
  const state = buildSeoState(seo);
  document.title = state.title || DEFAULT_TITLE;

  setOrRemoveMeta('meta[name="description"]', { name: "description" }, state.description);
  setOrRemoveMeta('meta[name="keywords"]', { name: "keywords" }, state.keywords);

  if (state.canonicalUrl) {
    ensureCanonical(state.canonicalUrl);
  } else {
    document.head
      .querySelectorAll('link[rel="canonical"][data-dynamic-seo="canonical"]')
      .forEach((node) => node.remove());
  }

  removeInjectedNodes();

  if (state.schemaJsonLd) {
    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.textContent = state.schemaJsonLd;
    schemaScript.setAttribute("data-dynamic-seo-script", "schema");
    document.head.appendChild(schemaScript);
  }

  injectHeadMarkup(state.headMarkup);
  injectGoogleTagUrls(state.googleTagHeadUrl, state.googleTagBodyUrl);
}

export function resetSeoDocument() {
  applySeoToDocument({ metaTag: null, googleTag: null });
}

export function injectSeoIntoHtml(template, seo) {
  const state = buildSeoState(seo);
  const titleTag = `<title>${escapeHtml(state.title || DEFAULT_TITLE)}</title>`;

  if (!state.hasDynamicMeta && !state.googleTagHeadUrl && !state.googleTagBodyUrl) {
    const block = `${SEO_MARKER_START}
    ${titleTag}
    ${SEO_MARKER_END}`;
    const existingBlock = new RegExp(
      `${SEO_MARKER_START}[\\s\\S]*?${SEO_MARKER_END}`,
      "i",
    );

    if (existingBlock.test(template)) {
      return template.replace(existingBlock, block);
    }

    return template.replace("</head>", `  ${block}\n  </head>`);
  }

  const canonicalTag = state.canonicalUrl
    ? `\n    <link rel="canonical" href="${escapeHtml(state.canonicalUrl)}" />`
    : "";
  const schemaTag = state.schemaJsonLd
    ? `\n    <script type="application/ld+json">${escapeScript(state.schemaJsonLd)}</script>`
    : "";
  const headMarkupTag = state.headMarkup ? `\n    ${state.headMarkup}` : "";
  const googleTagHeadBlock = state.googleTagHeadUrl
    ? `\n    <script async src="${escapeHtml(state.googleTagHeadUrl)}"></script>${
        state.googleTagId
          ? `\n    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '${escapeHtml(state.googleTagId)}');
    </script>`
          : ""
      }`
    : "";
  const googleTagBodyBlock = state.googleTagBodyUrl
    ? `
    ${BODY_MARKER_START}
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="${escapeHtml(state.googleTagBodyUrl)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    ${BODY_MARKER_END}`
    : `
    ${BODY_MARKER_START}
    ${BODY_MARKER_END}`;

  const block = `${SEO_MARKER_START}
    ${titleTag}
    ${state.description ? `<meta name="description" content="${escapeHtml(state.description)}" />` : ""}
    ${state.keywords ? `<meta name="keywords" content="${escapeHtml(state.keywords)}" />` : ""}
    ${canonicalTag}${schemaTag}${headMarkupTag}${googleTagHeadBlock}
    ${SEO_MARKER_END}`;

  const existingBlock = new RegExp(
    `${SEO_MARKER_START}[\\s\\S]*?${SEO_MARKER_END}`,
    "i",
  );

  const headInjected = existingBlock.test(template)
    ? template.replace(existingBlock, block)
    : template.replace("</head>", `  ${block}\n  </head>`);

  const existingBodyBlock = new RegExp(
    `${BODY_MARKER_START}[\\s\\S]*?${BODY_MARKER_END}`,
    "i",
  );

  if (existingBodyBlock.test(headInjected)) {
    return headInjected.replace(existingBodyBlock, googleTagBodyBlock);
  }

  return headInjected.replace("<body>", `<body>${googleTagBodyBlock}`);
}
