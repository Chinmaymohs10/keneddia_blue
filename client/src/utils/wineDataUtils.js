// Rotating accent palette for dynamic wine type names
const ACCENT_PALETTE = [
  { color: "#8B1A2A", light: "#FDF2F4", dot: "#C4485A" },
  { color: "#8A6A18", light: "#FBF7ED", dot: "#C9A030" },
  { color: "#A8456A", light: "#FDF0F5", dot: "#D4789A" },
  { color: "#9A7A10", light: "#FBF8E8", dot: "#D4B035" },
  { color: "#2E7A8E", light: "#EDF6F9", dot: "#52B0C8" },
  { color: "#5A3E8E", light: "#F0EDF9", dot: "#8A6ACC" },
  { color: "#3E7A5A", light: "#EDF9F0", dot: "#52C87A" },
];

/**
 * Build a map of wineTypeName → accent from the live wine types list.
 */
export function buildTypeAccents(wineTypes = []) {
  const map = {};
  wineTypes.forEach((t, i) => {
    if (t.wineTypeName) {
      map[t.wineTypeName] = ACCENT_PALETTE[i % ACCENT_PALETTE.length];
    }
  });
  return map;
}

/**
 * Given a propertyId and the full properties list (from getAllProperties),
 * return the property's location name (city / area).
 * Fallback chain: locationName → city → address → name
 */
export function getPropertyLocation(propertyId, properties = []) {
  if (!propertyId || !properties.length) return null;
  const prop = properties.find((p) => p.id === propertyId);
  if (!prop) return null;
  return prop.locationName || prop.city || prop.address || prop.name || null;
}

function pickImage(brand, typeById, brandCategories = []) {
  if (brand.media?.url) return brand.media.url;
  const type = brand.wineTypeId ? typeById[brand.wineTypeId] : null;
  if (type?.media?.url) return type.media.url;
  const catWithImage = brandCategories.find((c) => c.media?.url);
  return catWithImage?.media?.url ?? null;
}

/**
 * Main generator — combines all four wine API responses + full properties list
 * into card-ready objects. All fields fall back to "_" when data is missing.
 *
 * @param {{ brands, wineTypes, categories, subCategories, properties }} param
 * @returns card[]
 */
export function generateWineCards({
  brands = [],
  wineTypes = [],
  categories = [],
  subCategories = [],
  properties = [],
}) {
  const typeById = Object.fromEntries(wineTypes.map((t) => [t.id, t]));

  const categoriesByBrand = categories.reduce((acc, c) => {
    if (c.wineBrandId != null) {
      (acc[c.wineBrandId] = acc[c.wineBrandId] || []).push(c);
    }
    return acc;
  }, {});

  const subCatsByCategory = subCategories.reduce((acc, s) => {
    if (s.wineCategoryId != null) {
      (acc[s.wineCategoryId] = acc[s.wineCategoryId] || []).push(s);
    }
    return acc;
  }, {});

  return brands
    .filter((b) => b.active !== false)
    .map((brand) => {
      const type = brand.wineTypeId ? typeById[brand.wineTypeId] : null;
      const brandCategories = categoriesByBrand[brand.id] || [];
      const firstCat = brandCategories[0] ?? null;
      const firstSubCat = firstCat
        ? (subCatsByCategory[firstCat.id] || [])[0] ?? null
        : null;

      // Resolve the property id to look up real location
      const resolvedPropertyId =
        brand.propertyId ?? firstCat?.propertyId ?? type?.propertyId ?? null;

      // Real location from the properties list (locationName field)
      const resolvedLocation = getPropertyLocation(resolvedPropertyId, properties);

      // Property display name shown in the header row of the card
      const propertyName =
        brand.propertyName ||
        type?.propertyName ||
        firstCat?.propertyName ||
        null;

      // Filter key: use resolved location when available, fall back to propertyName only
      const filterLocation = resolvedLocation || brand.propertyName || null;

      const typeName = brand.wineTypeName || type?.wineTypeName || null;

      return {
        id: brand.id,
        name: brand.name || "_",
        subtitle: firstCat?.title || brand.description || "_",
        type: typeName || "_",
        tag: typeName || "_",
        property: propertyName || "_",
        // location drives the filter dropdown
        location: filterLocation || "_",
        // locationDisplay is what shows in the MapPin badge on the card
        locationDisplay: resolvedLocation || propertyName || "_",
        tasting:
          brand.description ||
          firstCat?.description ||
          firstSubCat?.description ||
          "_",
        body: firstSubCat?.description || firstCat?.description || "_",
        image: pickImage(brand, typeById, brandCategories),
        propertyId: resolvedPropertyId,
        propertyTypeId:
          brand.propertyTypeId ?? firstCat?.propertyTypeId ?? null,
      };
    });
}

/**
 * Extract sorted, unique filter option arrays from generated cards.
 */
export function extractWineFilters(cards = []) {
  const locationSet = new Set();
  const typeSet = new Set();

  cards.forEach((c) => {
    if (c.location && c.location !== "_") locationSet.add(c.location);
    if (c.type && c.type !== "_") typeSet.add(c.type);
  });

  return {
    locations: ["All Locations", ...[...locationSet].sort()],
    types: ["All Types", ...[...typeSet].sort()],
  };
}
