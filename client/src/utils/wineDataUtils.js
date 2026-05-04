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
 * Given a propertyId (or array of propertyIds) and the full properties list,
 * return the property's location name (city / area).
 * Handles both single ID and array of IDs.
 */
export function getPropertyLocation(propertyId, properties = []) {
  if (!propertyId || !properties.length) return null;
  
  const ids = Array.isArray(propertyId) ? propertyId : [propertyId];
  const foundLocations = ids
    .map(id => {
      // Handle potential nested structure in properties list
      const prop = properties.find((p) => (p.id === id || p.propertyResponseDTO?.id === id));
      const target = prop?.propertyResponseDTO ?? prop;
      return target?.locationName || target?.city || target?.address || target?.name || null;
    })
    .filter(loc => loc != null);

  if (foundLocations.length === 0) return null;
  // Return unique locations joined by comma
  return [...new Set(foundLocations)].join(", ");
}

// Priority: subcategory image → category image → brand image → type image
function pickImage(brand, typeById, brandCategories = [], firstSubCat = null, firstCat = null) {
  if (firstSubCat?.media?.url) return firstSubCat.media.url;
  if (firstCat?.media?.url) return firstCat.media.url;
  if (brand.media?.url) return brand.media.url;
  const type = brand.wineTypeId ? typeById[brand.wineTypeId] : null;
  if (type?.media?.url) return type.media.url;
  return null;
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
  homepageOnly = false, // When true, only shows items with showOnHomepage: true
}) {
  const typeById = Object.fromEntries(wineTypes.map((t) => [t.id, t]));
  const brandById = Object.fromEntries(brands.map((b) => [b.id, b]));
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  // We now iterate over subcategories (products) as they are the individual items
  return subCategories
    .filter((s) => {
      if (!s.active) return false;
      if (homepageOnly && !s.showOnHomepage) return false;
      return true;
    })
    .flatMap((sub) => {
      const cat = sub.wineCategoryId ? catById[sub.wineCategoryId] : null;
      const brand = cat?.wineBrandId ? brandById[cat.wineBrandId] : null;
      const type = brand?.wineTypeId ? typeById[brand.wineTypeId] : null;

      // Determine property source (Subcategory -> Category -> Brand -> Type)
      let sourcePropertyIds = sub.propertyIds?.length > 0 ? sub.propertyIds : (sub.propertyId ? [sub.propertyId] : []);
      let sourcePropertyNames = sub.propertyNames?.length > 0 ? sub.propertyNames : (sub.propertyName ? [sub.propertyName] : []);

      if (sourcePropertyIds.length === 0 && cat) {
        sourcePropertyIds = cat.propertyIds?.length > 0 ? cat.propertyIds : (cat.propertyId ? [cat.propertyId] : []);
        sourcePropertyNames = cat.propertyNames?.length > 0 ? cat.propertyNames : (cat.propertyName ? [cat.propertyName] : []);
      }

      if (sourcePropertyIds.length === 0 && brand) {
        sourcePropertyIds = brand.propertyIds?.length > 0 ? brand.propertyIds : (brand.propertyId ? [brand.propertyId] : []);
        sourcePropertyNames = brand.propertyNames?.length > 0 ? brand.propertyNames : (brand.propertyName ? [brand.propertyName] : []);
      }

      if (sourcePropertyIds.length === 0 && type) {
        sourcePropertyIds = type.propertyIds?.length > 0 ? type.propertyIds : (type.propertyId ? [type.propertyId] : []);
        sourcePropertyNames = type.propertyNames?.length > 0 ? type.propertyNames : (type.propertyName ? [type.propertyName] : []);
      }

      const activeIds = sourcePropertyIds.length > 0 ? sourcePropertyIds : [null];

      const typeName = sub.wineTypeName || brand?.wineTypeName || type?.wineTypeName || null;
      const baseTasting = sub.description || cat?.description || brand?.description || type?.wineTypeDescription || "_";
      
      // Image fallback hierarchy
      const baseImage = sub.media?.url || cat?.media?.url || brand?.media?.url || type?.media?.url || null;

      return activeIds.map((pid, idx) => {
        const resolvedLocation = pid ? getPropertyLocation(pid, properties) : null;
        let specificPropertyName = sourcePropertyNames[idx] || null;
        if (!specificPropertyName && pid) {
          const propObj = properties.find(p => (p.id === pid || p.propertyResponseDTO?.id === pid));
          const target = propObj?.propertyResponseDTO ?? propObj;
          specificPropertyName = target?.propertyName || target?.name || null;
        }

        const filterLocation = resolvedLocation || specificPropertyName || null;

        return {
          id: `${sub.id}-${pid || 'global'}-${idx}`,
          subCategoryId: sub.id,
          brandId: brand?.id,
          name: brand?.name || "_",
          subtitle: sub.name || sub.title || "", // The product name
          type: typeName || "_",
          tag: typeName || "_",
          property: specificPropertyName || "_",
          location: filterLocation || "_",
          locationDisplay: resolvedLocation || specificPropertyName || "_",
          tasting: baseTasting,
          body: sub.description || cat?.description || "_",
          category: cat?.title || null,
          image: baseImage,
          propertyId: pid,
          propertyTypeId: sub.propertyTypeId ?? cat?.propertyTypeId ?? brand?.propertyTypeId ?? null,
        };
      });
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
