import { getAllGoogleTags, getAllMetaData } from "@/Api/Api";

const DEFAULT_TITLE = "Kennedia Hotels | Redefining Luxury Across India";
const DEFAULT_DESCRIPTION =
  "Experience unparalleled luxury at Kennedia Hotels. From Bangalore to Varanasi, discover world-class hospitality, fine dining, and exclusive experiences.";
const DEFAULT_OG_IMAGE = "/og-image.png";
const DEFAULT_TWITTER_SITE = "@kennediahotels";
const SEO_MARKER_START = "<!-- dynamic-seo:start -->";
const SEO_MARKER_END = "<!-- dynamic-seo:end -->";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeScript = (value = "") => String(value).replace(/<\/script/gi, "<\\/script");

const isActiveSeo = (item) => Boolean(item?.active ?? item?.status);

const selectSeoRecord = (list, propertyId) =>
  (Array.isArray(list) ? list : [])
    .filter(
      (item) =>
        isActiveSeo(item) &&
        String(item?.propertyId ?? "") === String(propertyId ?? ""),
    )
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
      googleTag: selectSeoRecord(googleList, propertyId),
    };
  } catch {
    return { metaTag: null, googleTag: null };
  }
}

export function buildSeoState(seo) {
  const metaTag = seo?.metaTag || null;
  const googleTag = seo?.googleTag || null;
  const title = metaTag?.metaTitle?.trim() || DEFAULT_TITLE;
  const description = metaTag?.metaDescription?.trim() || DEFAULT_DESCRIPTION;
  const keywords = metaTag?.metaKeywords?.trim() || "";
  const canonicalUrl = metaTag?.url?.trim() || "";
  const schema = metaTag?.skima?.trim() || "";

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    schema,
    googleTagHtml: googleTag?.description?.trim() || "",
    ogImage: DEFAULT_OG_IMAGE,
    twitterSite: DEFAULT_TWITTER_SITE,
  };
}

const ensureMeta = (selector, attrs, content) => {
  let element = document.head.querySelector(selector);
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
};

const injectGoogleTagHtml = (html) => {
  if (!html) return;

  const container = document.createElement("div");
  container.innerHTML = html;

  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      return;
    }

    if (node.nodeName.toLowerCase() === "script") {
      const script = document.createElement("script");
      Array.from(node.attributes || []).forEach((attr) =>
        script.setAttribute(attr.name, attr.value),
      );
      script.textContent = node.textContent || "";
      script.setAttribute("data-dynamic-seo-script", "google-tag");
      document.head.appendChild(script);
      return;
    }

    const clone = node.cloneNode(true);
    if (clone.nodeType === Node.ELEMENT_NODE) {
      clone.setAttribute("data-dynamic-seo-script", "google-tag");
    }
    document.head.appendChild(clone);
  });
};

export function applySeoToDocument(seo) {
  const state = buildSeoState(seo);
  document.title = state.title;

  ensureMeta('meta[name="description"]', { name: "description" }, state.description);
  ensureMeta('meta[name="keywords"]', { name: "keywords" }, state.keywords);
  ensureMeta('meta[property="og:title"]', { property: "og:title" }, state.title);
  ensureMeta(
    'meta[property="og:description"]',
    { property: "og:description" },
    state.description,
  );
  ensureMeta('meta[property="og:type"]', { property: "og:type" }, "website");
  ensureMeta('meta[property="og:image"]', { property: "og:image" }, state.ogImage);
  ensureMeta(
    'meta[name="twitter:card"]',
    { name: "twitter:card" },
    "summary_large_image",
  );
  ensureMeta(
    'meta[name="twitter:site"]',
    { name: "twitter:site" },
    state.twitterSite,
  );
  ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" }, state.title);
  ensureMeta(
    'meta[name="twitter:description"]',
    { name: "twitter:description" },
    state.description,
  );
  ensureMeta(
    'meta[name="twitter:image"]',
    { name: "twitter:image" },
    state.ogImage,
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

  injectGoogleTagHtml(state.googleTagHtml);
}

export function resetSeoDocument() {
  applySeoToDocument({ metaTag: null, googleTag: null });
}

export function injectSeoIntoHtml(template, seo) {
  const state = buildSeoState(seo);
  const canonicalTag = state.canonicalUrl
    ? `\n    <link rel="canonical" href="${escapeHtml(state.canonicalUrl)}" />`
    : "";
  const schemaTag = state.schema
    ? `\n    <script type="application/ld+json">${escapeScript(state.schema)}</script>`
    : "";
  const googleTagBlock = state.googleTagHtml ? `\n    ${state.googleTagHtml}` : "";

  const block = `${SEO_MARKER_START}
    <title>${escapeHtml(state.title)}</title>
    <meta name="description" content="${escapeHtml(state.description)}" />
    <meta name="keywords" content="${escapeHtml(state.keywords)}" />
    <meta property="og:title" content="${escapeHtml(state.title)}" />
    <meta property="og:description" content="${escapeHtml(state.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${escapeHtml(state.ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${escapeHtml(state.twitterSite)}" />
    <meta name="twitter:title" content="${escapeHtml(state.title)}" />
    <meta name="twitter:description" content="${escapeHtml(state.description)}" />
    <meta name="twitter:image" content="${escapeHtml(state.ogImage)}" />${canonicalTag}${schemaTag}${googleTagBlock}
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
