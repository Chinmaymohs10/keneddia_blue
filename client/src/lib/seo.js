import { getAllGoogleTags, getAllMetaData } from "@/Api/Api";

const DEFAULT_TITLE = "Kennedia Hotels | Redefining Luxury Across India";
const DEFAULT_OG_IMAGE = "/og-image.png";
const DEFAULT_TWITTER_SITE = "@kennediahotels";
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

const buildFallbackSchema = (schemaType, metaTag) => {
  if (!schemaType) return "";

  const fallbackSchema = {
    "@context": "https://schema.org",
    "@type": schemaType,
  };

  if (metaTag?.metaTitle?.trim()) {
    fallbackSchema.name = metaTag.metaTitle.trim();
  }

  if (metaTag?.metaDescription?.trim()) {
    fallbackSchema.description = metaTag.metaDescription.trim();
  }

  if (metaTag?.url?.trim()) {
    fallbackSchema.url = metaTag.url.trim();
  }

  return JSON.stringify(fallbackSchema);
};

const normalizeSchema = (rawSchema, metaTag) => {
  const schemaValue = rawSchema?.trim();
  if (!schemaValue) return "";

  try {
    const parsed = JSON.parse(schemaValue);
    if (parsed && typeof parsed === "object") {
      return JSON.stringify(parsed);
    }
  } catch {
    // Plain strings such as "Hotel" are converted into a minimal valid schema.
  }

  return buildFallbackSchema(schemaValue, metaTag);
};

const selectSeoRecord = (list, propertyId) =>
  (Array.isArray(list) ? list : [])
    .filter(
      (item) =>
        isActiveSeo(item) &&
        String(item?.propertyId ?? "") === String(propertyId ?? ""),
    )
    .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null;

const selectGlobalGoogleTag = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((item) => isActiveSeo(item))
    .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null;

export async function fetchPropertySeo(propertyId) {
  if (!propertyId) {
    return { metaTag: null, googleTag: null };
  }

  try {
    const [metaRes, googleRes] = await Promise.all([
      getAllMetaData().catch(() => null),
      getAllGoogleTags().catch(() => null),
    ]);

    const metaList = metaRes?.data || metaRes || [];
    const googleList = googleRes?.data || googleRes || [];

    return {
      metaTag: selectSeoRecord(metaList, propertyId),
      googleTag: selectGlobalGoogleTag(googleList),
    };
  } catch {
    return { metaTag: null, googleTag: null };
  }
}

export async function fetchGlobalSeo() {
  try {
    const googleRes = await getAllGoogleTags().catch(() => null);
    const googleList = googleRes?.data || googleRes || [];

    return {
      metaTag: null,
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
  const schema = normalizeSchema(metaTag?.skima, metaTag);

  return {
    hasDynamicMeta: Boolean(title || description || keywords || canonicalUrl || schema),
    title,
    description,
    keywords,
    canonicalUrl,
    schema,
    googleTagHeadUrl: googleTag?.category?.trim() || "",
    googleTagBodyUrl: googleTag?.description?.trim() || "",
    ogImage: DEFAULT_OG_IMAGE,
    twitterSite: DEFAULT_TWITTER_SITE,
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
  document.body?.querySelectorAll("[data-dynamic-seo-body]").forEach((node) => node.remove());
};

const injectGoogleTagUrls = (headUrl, bodyUrl) => {
  if (headUrl) {
    const script = document.createElement("script");
    script.src = headUrl;
    script.async = true;
    script.setAttribute("data-dynamic-seo-script", "google-tag-head");
    document.head.appendChild(script);
  }

  if (bodyUrl && document.body) {
    const iframe = document.createElement("iframe");
    iframe.src = bodyUrl;
    iframe.width = "0";
    iframe.height = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("data-dynamic-seo-body", "google-tag-body");
    document.body.appendChild(iframe);
  }
};

export function applySeoToDocument(seo) {
  const state = buildSeoState(seo);
  document.title = state.title || DEFAULT_TITLE;

  setOrRemoveMeta('meta[name="description"]', { name: "description" }, state.description);
  setOrRemoveMeta('meta[name="keywords"]', { name: "keywords" }, state.keywords);
  setOrRemoveMeta('meta[property="og:title"]', { property: "og:title" }, state.title);
  setOrRemoveMeta(
    'meta[property="og:description"]',
    { property: "og:description" },
    state.description,
  );
  setOrRemoveMeta(
    'meta[property="og:type"]',
    { property: "og:type" },
    state.hasDynamicMeta ? "website" : "",
  );
  setOrRemoveMeta(
    'meta[property="og:image"]',
    { property: "og:image" },
    state.hasDynamicMeta ? state.ogImage : "",
  );
  setOrRemoveMeta(
    'meta[name="twitter:card"]',
    { name: "twitter:card" },
    state.hasDynamicMeta ? "summary_large_image" : "",
  );
  setOrRemoveMeta(
    'meta[name="twitter:site"]',
    { name: "twitter:site" },
    state.hasDynamicMeta ? state.twitterSite : "",
  );
  setOrRemoveMeta('meta[name="twitter:title"]', { name: "twitter:title" }, state.title);
  setOrRemoveMeta(
    'meta[name="twitter:description"]',
    { name: "twitter:description" },
    state.description,
  );
  setOrRemoveMeta(
    'meta[name="twitter:image"]',
    { name: "twitter:image" },
    state.hasDynamicMeta ? state.ogImage : "",
  );

  if (state.canonicalUrl) {
    ensureCanonical(state.canonicalUrl);
  } else {
    document.head
      .querySelectorAll('link[rel="canonical"][data-dynamic-seo="canonical"]')
      .forEach((node) => node.remove());
  }

  removeInjectedNodes();

  if (state.schema) {
    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.textContent = state.schema;
    schemaScript.setAttribute("data-dynamic-seo-script", "schema");
    document.head.appendChild(schemaScript);
  }

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
  const schemaTag = state.schema
    ? `\n    <script type="application/ld+json">${escapeScript(state.schema)}</script>`
    : "";
  const googleTagHeadBlock = state.googleTagHeadUrl
    ? `\n    <script async src="${escapeHtml(state.googleTagHeadUrl)}"></script>`
    : "";
  const googleTagBodyBlock = state.googleTagBodyUrl
    ? `
    ${BODY_MARKER_START}
    <iframe src="${escapeHtml(state.googleTagBodyUrl)}" height="0" width="0" style="display:none;visibility:hidden" aria-hidden="true"></iframe>
    ${BODY_MARKER_END}`
    : `
    ${BODY_MARKER_START}
    ${BODY_MARKER_END}`;

  const block = `${SEO_MARKER_START}
    ${titleTag}
    ${state.description ? `<meta name="description" content="${escapeHtml(state.description)}" />` : ""}
    ${state.keywords ? `<meta name="keywords" content="${escapeHtml(state.keywords)}" />` : ""}
    ${state.title ? `<meta property="og:title" content="${escapeHtml(state.title)}" />` : ""}
    ${state.description ? `<meta property="og:description" content="${escapeHtml(state.description)}" />` : ""}
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${escapeHtml(state.ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${escapeHtml(state.twitterSite)}" />
    ${state.title ? `<meta name="twitter:title" content="${escapeHtml(state.title)}" />` : ""}
    ${state.description ? `<meta name="twitter:description" content="${escapeHtml(state.description)}" />` : ""}
    <meta name="twitter:image" content="${escapeHtml(state.ogImage)}" />${canonicalTag}${schemaTag}${googleTagHeadBlock}
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
