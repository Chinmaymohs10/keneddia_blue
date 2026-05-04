import {
  GetAllPropertyDetails,
  getGalleryByPropertyId,
  getPropertyTypes,
  getAllProperties
} from "@/Api/Api";
import {
  getActiveTestimonialHeaders,
  getPrimaryConversionsHeader,
  getEventsHeaderByProperty,
  getMenuSectionsByPropertyTypeId
} from "@/Api/RestaurantApi";
import {
  getAllWineTypes,
  getAllWineBrands,
  getAllWineCategories,
  getAllWineSubCategories
} from "@/Api/WineApi";
import { generateWineCards } from "@/utils/wineDataUtils";

const fetchSafe = async (fn, fallback) => {
  try {
    const res = await fn();
    return res;
  } catch (err) {
    return fallback;
  }
};

const generateSlug = (text) =>
  text?.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");

export async function fetchWineDetailPageData(pathname) {
  // Pattern: /wine-detail/:citySlug/:propertySlug
  const match = pathname.match(/^\/wine-detail\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;

  const propertySlug = match[2];
  const slugParts = propertySlug.split("-");
  const slugId = Number(slugParts[slugParts.length - 1]);

  const [propRes, typesRes, brandsRes, catsRes, subCatsRes, propsRes, propTypesRes] = await Promise.all([
    fetchSafe(() => GetAllPropertyDetails(), { data: [] }),
    fetchSafe(() => getAllWineTypes(), { data: [] }),
    fetchSafe(() => getAllWineBrands(), { data: [] }),
    fetchSafe(() => getAllWineCategories(), { data: [] }),
    fetchSafe(() => getAllWineSubCategories(), { data: [] }),
    fetchSafe(() => getAllProperties(), { data: [] }),
    fetchSafe(() => getPropertyTypes(), { data: [] }),
  ]);

  const rawData = propRes?.data ?? propRes ?? [];
  const flattened = (Array.isArray(rawData) ? rawData : []).flatMap((item) => {
    const parent = item.propertyResponseDTO;
    const listings = item.propertyListingResponseDTOS || [];
    return listings.length === 0
      ? [{ parent, listing: null }]
      : listings.map((listing) => ({ parent, listing }));
  });

  const matched = flattened.find(({ parent, listing }) => {
    if (!isNaN(slugId) && slugId > 0) return Number(parent?.id) === slugId;
    return generateSlug(listing?.propertyName || parent?.propertyName || "") === propertySlug.toLowerCase();
  });

  if (!matched) return null;
  const { parent, listing } = matched;
  const propertyId = parent.id;

  const combinedProperty = {
    id: propertyId,
    propertyId,
    name: listing?.propertyName?.trim() || parent.propertyName,
    location: listing?.fullAddress || parent.address,
    city: listing?.city || parent.locationName,
    media: listing?.media?.length > 0 ? listing.media : parent.media || [],
  };

  const [galleryRes, testimonialRes, conversionRes, eventsRes, wineTypeHeaderRes] = await Promise.all([
    fetchSafe(() => getGalleryByPropertyId(propertyId), { data: [] }),
    fetchSafe(() => getActiveTestimonialHeaders(), { data: [] }),
    fetchSafe(() => getPrimaryConversionsHeader(), { data: [] }),
    fetchSafe(() => getEventsHeaderByProperty(propertyId), { data: {} }),
    (async () => {
       const wineTypeObj = (propTypesRes?.data || []).find(t => t.typeName?.toLowerCase() === "wine");
       if (!wineTypeObj) return { data: [] };
       return fetchSafe(() => getMenuSectionsByPropertyTypeId(wineTypeObj.id), { data: [] });
    })()
  ]);

  const testimonials = testimonialRes?.data ?? [];
  const conversions = conversionRes?.data ?? [];
  const eventsData = eventsRes?.data;
  const headers = wineTypeHeaderRes?.data || [];

  const signaturesHeader = testimonials
    .filter((h) => String(h.propertyId) === String(propertyId) && h.isActive)
    .sort((a, b) => b.id - a.id)[0] ?? null;

  const collectionsHeader = conversions
    .filter((h) => h.propertyId === propertyId && h.isActive)
    .sort((a, b) => b.id - a.id)[0] ?? null;

  const brandsHeader = Array.isArray(eventsData)
    ? eventsData.sort((a, b) => b.id - a.id)[0] ?? null
    : eventsData ?? null;

  const showcaseHeader = headers.find(h => h.isActive && (h.part1?.includes("Showcase") || h.part1?.includes("Collection"))) ?? null;

  const allCards = generateWineCards({
    brands: brandsRes?.data ?? [],
    wineTypes: typesRes?.data ?? [],
    categories: catsRes?.data ?? [],
    subCategories: subCatsRes?.data ?? [],
    properties: propsRes?.data ?? [],
  });

  return {
    propertyData: combinedProperty,
    galleryData: galleryRes?.data ?? [],
    sectionHeaders: {
      signatures: signaturesHeader,
      collections: collectionsHeader,
      brands: brandsHeader,
    },
    headerData: showcaseHeader,
    allCards,
  };
}

export async function fetchWineCategoryPageData(pathname) {
  // Pattern: /wine-categories/:slug OR /wine-detail/:citySlug/:propertySlug/:slug
  let match = pathname.match(/^\/wine-categories\/([^/]+)\/?$/);
  if (!match) {
    match = pathname.match(/^\/wine-detail\/([^/]+)\/([^/]+)\/([^/]+)\/?$/);
  }
  if (!match) return null;

  const [typesRes, brandsRes, catsRes, subCatsRes, propsRes] = await Promise.all([
    fetchSafe(() => getAllWineTypes(), { data: [] }),
    fetchSafe(() => getAllWineBrands(), { data: [] }),
    fetchSafe(() => getAllWineCategories(), { data: [] }),
    fetchSafe(() => getAllWineSubCategories(), { data: [] }),
    fetchSafe(() => getAllProperties(), { data: [] }),
  ]);

  const allCards = generateWineCards({
    wineTypes: typesRes?.data ?? [],
    brands: brandsRes?.data ?? [],
    categories: catsRes?.data ?? [],
    subCategories: subCatsRes?.data ?? [],
    properties: propsRes?.data ?? [],
    homepageOnly: false
  });

  return {
    wineTypes: typesRes?.data ?? [],
    brands: brandsRes?.data ?? [],
    categories: catsRes?.data ?? [],
    subCategories: subCatsRes?.data ?? [],
    properties: propsRes?.data ?? [],
    allCards,
  };
}

export async function fetchWineSubCategoryPageData(pathname) {
  // Pattern: /wine-subcategory/:slug OR /wine-detail/:citySlug/:propertySlug/sub/:slug
  let match = pathname.match(/^\/wine-subcategory\/([^/]+)\/?$/);
  if (!match) {
    match = pathname.match(/^\/wine-detail\/([^/]+)\/([^/]+)\/sub\/([^/]+)\/?$/);
  }
  if (!match) return null;

  const slug = match[match.length - 1];
  const numericId = parseInt(slug, 10);

  const [typesRes, brandsRes, catsRes, subCatsRes, propsRes] = await Promise.all([
    fetchSafe(() => getAllWineTypes(), { data: [] }),
    fetchSafe(() => getAllWineBrands(), { data: [] }),
    fetchSafe(() => getAllWineCategories(), { data: [] }),
    fetchSafe(() => getAllWineSubCategories(), { data: [] }),
    fetchSafe(() => getAllProperties(), { data: [] }),
  ]);

  const subCats = subCatsRes?.data ?? [];
  const subCategory = subCats.find(s => s.id === numericId) ?? null;

  const allCards = generateWineCards({
    wineTypes: typesRes?.data ?? [],
    brands: brandsRes?.data ?? [],
    categories: catsRes?.data ?? [],
    subCategories: subCats,
    properties: propsRes?.data ?? [],
    homepageOnly: false
  });

  return {
    subCategory,
    allCards,
  };
}
