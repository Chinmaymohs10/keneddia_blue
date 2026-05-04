import {
  getAboutUsByPropertyType,
  getAllNews,
  getHotelHomepageHeroSection,
  getPropertyTypes,
  getPublicRecognitionsByAboutUsId,
  getAllProperties
} from "@/Api/Api";
import {
  getMenuSectionsByPropertyTypeId
} from "@/Api/RestaurantApi";
import {
  getAllWineTypes,
  getAllWineBrands,
  getAllWineCategories,
  getAllWineSubCategories
} from "@/Api/WineApi";
import { generateWineCards } from "@/utils/wineDataUtils";
import { buildNewsDetailPath } from "@/modules/website/utils/newsSlug";

const fetchSafe = async (fn, fallback) => {
  try {
    const res = await fn();
    return res;
  } catch (err) {
    return fallback;
  }
};

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const isWineType = (value = "") =>
  ["wine", "wines", "wine and dine", "wine & dine", "winedine"].includes(
    normalize(value),
  );

const normalizeHeroSlides = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => item?.active === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map((item) => {
      const backgroundMedia =
        item.backgroundAll?.[0] ||
        item.backgroundLight?.[0] ||
        item.backgroundDark?.[0] ||
        null;
      const subMedia =
        item.subAll?.[0] ||
        item.subLight?.[0] ||
        item.subDark?.[0] ||
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
        thumbnail: subMedia?.url || backgroundMedia.url,
        thumbnailIsVideo: subMedia?.type === "VIDEO",
        bgTitle: primaryWord.toUpperCase(),
        ctaText: item.ctaText || null,
        ctaLink: item.ctaLink || null,
        showOnHomepage: item.showOnHomepage === true,
        showOnMobilePage: item.showOnMobilePage ?? null,
      };
    })
    .filter(Boolean);

const normalizeNews = (newsRes, wineTypeId) => {
  const rawNews =
    newsRes?.data?.content || newsRes?.content || newsRes?.data || newsRes || [];

  return (Array.isArray(rawNews) ? rawNews : [])
    .filter((item) => {
      const badgeName =
        item?.badgeTypeName ||
        item?.badgeType ||
        item?.badge?.typeName ||
        item?.badge?.name ||
        "";
      const byName = isWineType(badgeName);
      const byId = wineTypeId != null && Number(item?.badgeTypeId) === wineTypeId;
      return item?.active === true && (byName || byId);
    })
    .sort((a, b) => {
      const dateA = new Date(a?.newsDate || a?.dateBadge || a?.createdAt || 0);
      const dateB = new Date(b?.newsDate || b?.dateBadge || b?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 6)
    .map((item) => ({
      id: item?.id,
      category: item?.category || "NEWS",
      title: item?.title || "News",
      description: item?.description || "",
      dateBadge:
        item?.newsDate || item?.dateBadge || new Date().toISOString().split("T")[0],
      badgeType:
        item?.badgeTypeName || item?.badgeType || item?.badge?.typeName || "Wine",
      ctaText: item?.ctaText || "Read Story",
      ctaLink: buildNewsDetailPath(item),
      imageUrl: item?.imageUrl || item?.image || item?.media?.[0]?.url || "",
    }));
};

const mapAboutSection = (section, recognitions = []) => ({
  id: section?.id,
  subTitle: section?.subTitle || "Wine Experience",
  sectionTitle: section?.sectionTitle || "Fine Wines. Signature Hospitality.",
  description:
    section?.description ||
    "Curated wine-led experiences with elevated hospitality and thoughtfully designed spaces.",
  image: section?.media?.find((item) => item?.type === "IMAGE")?.url || "",
  recognitions: recognitions
    .filter((item) => item?.isActive)
    .map((item) => ({
      id: item?.id,
      value: item?.value,
      title: item?.title,
      subTitle: item?.subTitle,
      isActive: item?.isActive,
    })),
});

const normalizeAboutSections = async (aboutRes) => {
  const aboutData = aboutRes?.data || aboutRes;
  const activeSections = Array.isArray(aboutData)
    ? aboutData
        .filter((item) => item?.isActive === true && item?.showOnPropertyPage === true)
        .sort((a, b) => b.id - a.id)
        .slice(0, 3)
    : [];

  if (activeSections.length === 0) return [];

  const recognitionGroups = await Promise.all(
    activeSections.map(async (section) => {
      if (Array.isArray(section?.recognitions) && section.recognitions.length > 0) {
        return section.recognitions;
      }
      const recognitionResponse = await fetchSafe(
        () => getPublicRecognitionsByAboutUsId(section.id),
        { data: [] },
      );
      return recognitionResponse?.data || [];
    }),
  );

  return activeSections.map((section, index) =>
    mapAboutSection(section, recognitionGroups[index] || []),
  );
};

export const defaultWineHomepageData = {
  wineTypeId: null,
  heroSlides: [],
  wineAboutSections: [],
  wineNews: [],
  headerData: null,
  allWineData: {
    types: [],
    brands: [],
    categories: [],
    subCategories: [],
    properties: [],
    allCards: [],
  },
};

export const fetchWineHomepageData = async () => {
  const propertyTypesRes = await fetchSafe(() => getPropertyTypes(), { data: [] });
  const propertyTypes = propertyTypesRes?.data || propertyTypesRes || [];
  const wineType = Array.isArray(propertyTypes)
    ? propertyTypes.find((type) => type?.isActive && isWineType(type?.typeName))
    : null;
  const wineTypeId = wineType?.id ? Number(wineType.id) : null;

  const [newsRes, heroRes, aboutRes, wineTypesRes, wineBrandsRes, wineCatsRes, wineSubCatsRes, propsRes] = await Promise.all([
    fetchSafe(() => getAllNews({ category: "", page: 0, size: 50 }), null),
    wineTypeId != null
      ? fetchSafe(() => getHotelHomepageHeroSection(wineTypeId), { data: [] })
      : { data: [] },
    wineTypeId != null
      ? fetchSafe(() => getAboutUsByPropertyType(wineTypeId), { data: [] })
      : { data: [] },
    fetchSafe(() => getAllWineTypes(), { data: [] }),
    fetchSafe(() => getAllWineBrands(), { data: [] }),
    fetchSafe(() => getAllWineCategories(), { data: [] }),
    fetchSafe(() => getAllWineSubCategories(), { data: [] }),
    fetchSafe(() => getAllProperties(), { data: [] }),
  ]);

  const wineAboutSections = await normalizeAboutSections(aboutRes);

  const wineTypeObj = propertyTypes.find(t => t.typeName?.toLowerCase() === "wine");
  let headerData = null;
  if (wineTypeObj) {
    const headerRes = await fetchSafe(() => getMenuSectionsByPropertyTypeId(wineTypeObj.id), { data: [] });
    headerData = (headerRes?.data || []).find(h => h.isActive) || null;
  }

  const allCards = generateWineCards({
    brands: wineBrandsRes?.data ?? [],
    wineTypes: wineTypesRes?.data ?? [],
    categories: wineCatsRes?.data ?? [],
    subCategories: wineSubCatsRes?.data ?? [],
    properties: propsRes?.data ?? [],
  });

  return {
    wineTypeId,
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
    wineAboutSections,
    wineNews: newsRes ? normalizeNews(newsRes, wineTypeId) : [],
    headerData,
    allWineData: {
      types: wineTypesRes?.data ?? [],
      brands: wineBrandsRes?.data ?? [],
      categories: wineCatsRes?.data ?? [],
      subCategories: wineSubCatsRes?.data ?? [],
      properties: propsRes?.data ?? [],
      allCards,
    },
  };
};
