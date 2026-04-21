import { getHotelHomepageHeroSection, getPropertyTypes } from "@/Api/Api";

const fetchSafe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const isCafeType = (value) =>
  String(value).trim().toLowerCase() === "cafe";

const normalizeHeroSlides = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => item.active === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map((item) => {
      const backgroundMedia =
        item.backgroundAll?.[0] ||
        item.backgroundLight?.[0] ||
        item.backgroundDark?.[0] ||
        null;
      if (!backgroundMedia?.url) return null;
      const primaryWord = item.mainTitle?.trim()?.split(/\s+/)?.[0] || "";
      return {
        id: item.id,
        tag: item.ctaText || null,
        title: item.mainTitle || null,
        desc: item.subTitle || null,
        img: backgroundMedia.url,
        isVideo: backgroundMedia.type === "VIDEO",
        bgTitle: primaryWord.toUpperCase(),
        ctaText: item.ctaText || null,
      };
    })
    .filter(Boolean);

export const defaultCafeHomepageData = {
  cafeTypeId: null,
  heroSlides: [],
};

export const fetchCafeHomepageData = async () => {
  const typesRes = await fetchSafe(() => getPropertyTypes(), { data: [] });
  const types = typesRes?.data || typesRes || [];
  const cafeType = Array.isArray(types)
    ? types.find((t) => t?.isActive && isCafeType(t?.typeName))
    : null;
  const cafeTypeId = cafeType?.id ? Number(cafeType.id) : null;

  const heroRes = cafeTypeId
    ? await fetchSafe(() => getHotelHomepageHeroSection(cafeTypeId), { data: [] })
    : { data: [] };

  return {
    cafeTypeId,
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
  };
};
