import API from "./Api";

/**
 * ============================================================================
 * WINE MODULE API DOCUMENTATION
 * ============================================================================
 * 
 * Hierarchy Flow:
 * Type (e.g., VODKA) --> Brand (e.g., Magic Moments) --> Category (e.g., Mango Flavor) --> SubCategory (e.g., 10ml, 50ml)
 * 
 * Each entity points to its parent in the hierarchy:
 * 1. WINE TYPE:
 *    Fields: wineTypeName, wineTypeDescription, active, propertyId (opt), propertyTypeId (opt), mediaId (opt)
 * 
 * 2. WINE BRAND:
 *    Fields: name, description, active, wineTypeId (opt), propertyId (opt), propertyTypeId (opt), mediaId (opt)
 * 
 * 3. WINE CATEGORY:
 *    Fields: title, description, active, wineBrandId (opt), propertyId (opt), propertyTypeId (opt), mediaId (opt)
 * 
 * 4. WINE SUBCATEGORY:
 *    Fields: title, description, active, wineCategoryId (opt), propertyId (opt), propertyTypeId (opt), mediaId (opt)
 * ============================================================================
 */

// ─────────────────────────────
// WINE TYPE
// ─────────────────────────────
export const createWineType = (data) => API.post("api/v1/wine-type/create", data);
export const getAllWineTypes = () => API.get("api/v1/wine-type/all");
export const getWineTypeById = (id) => API.get(`api/v1/wine-type/${id}`);
export const updateWineType = (id, data) => API.put(`api/v1/wine-type/${id}`, data);
export const toggleWineTypeStatus = (id, active) => API.patch(`api/v1/wine-type/${id}`, null, { params: { active } });

// ─────────────────────────────
// WINE BRAND
// ─────────────────────────────
export const createWineBrand = (data) => API.post("api/v1/wine-brand/create", data);
export const getAllWineBrands = () => API.get("api/v1/wine-brand/all");
export const getWineBrandById = (id) => API.get(`api/v1/wine-brand/${id}`);
export const getWineBrandsByPropertyId = (propertyId) => API.get(`api/v1/wine-brand/property/${propertyId}`);
export const getWineBrandsByPropertyTypeId = (propertyTypeId) => API.get(`api/v1/wine-brand/property-type/${propertyTypeId}`);
export const getWineBrandsByWineTypeId = (wineTypeId) => API.get(`api/v1/wine-brand/wine-type/${wineTypeId}`);
export const updateWineBrand = (id, data) => API.put(`api/v1/wine-brand/${id}`, data);
export const toggleWineBrandStatus = (id, active) => API.patch(`api/v1/wine-brand/${id}`, null, { params: { active } });

// ─────────────────────────────
// WINE CATEGORY
// ─────────────────────────────
export const createWineCategory = (data) => API.post("api/v1/wine-category/create", data);
export const getAllWineCategories = () => API.get("api/v1/wine-category/all");
export const getWineCategoryById = (id) => API.get(`api/v1/wine-category/${id}`);
export const getWineCategoriesByPropertyId = (propertyId) => API.get(`api/v1/wine-category/property/${propertyId}`);
export const getWineCategoriesByPropertyTypeId = (propertyTypeId) => API.get(`api/v1/wine-category/property-type/${propertyTypeId}`);
export const getWineCategoriesByBrandId = (brandId) => API.get(`api/v1/wine-category/wine-brand/${brandId}`);
export const updateWineCategory = (id, data) => API.put(`api/v1/wine-category/${id}`, data);
export const toggleWineCategoryStatus = (id, active) => API.patch(`api/v1/wine-category/${id}`, null, { params: { active } });

// ─────────────────────────────
// WINE SUBCATEGORY
// ─────────────────────────────
export const createWineSubCategory = (data) => API.post("api/v1/wine-subcategory/create", data);
export const getAllWineSubCategories = () => API.get("api/v1/wine-subcategory/all");
export const getWineSubCategoryById = (id) => API.get(`api/v1/wine-subcategory/${id}`);
export const getWineSubCategoriesByPropertyId = (propertyId) => API.get(`api/v1/wine-subcategory/property/${propertyId}`);
export const getWineSubCategoriesByPropertyTypeId = (propertyTypeId) => API.get(`api/v1/wine-subcategory/property-type/${propertyTypeId}`);
export const getWineSubCategoriesByCategoryId = (categoryId) => API.get(`api/v1/wine-subcategory/wine-category/${categoryId}`);
export const updateWineSubCategory = (id, data) => API.put(`api/v1/wine-subcategory/${id}`, data);
export const toggleWineSubCategoryStatus = (id, active) => API.patch(`api/v1/wine-subcategory/${id}`, null, { params: { active } });

// ─────────────────────────────
// WINE MASTER (HEADERS)
// ─────────────────────────────
export const createWineMaster = (data) => API.post("api/v1/wine-master/create", data);
export const getAllWineMasters = () => API.get("api/v1/wine-master/all");
export const getWineMasterById = (id) => API.get(`api/v1/wine-master/${id}`);
export const getWineMastersByBrandId = (brandId) => API.get(`api/v1/wine-master/wine-brand/${brandId}`);
export const getWineMastersByTypeId = (typeId) => API.get(`api/v1/wine-master/wine-type/${typeId}`);
export const getWineMastersByCategoryId = (categoryId) => API.get(`api/v1/wine-master/wine-category/${categoryId}`);
export const getWineMastersBySubCategoryId = (subCategoryId) => API.get(`api/v1/wine-master/wine-subcategory/${subCategoryId}`);
export const getWineMastersByPropertyTypeId = (propertyTypeId) => API.get(`api/v1/wine-master/property-type/${propertyTypeId}`);
export const updateWineMaster = (id, data) => API.put(`api/v1/wine-master/${id}`, data);
export const deleteWineMaster = (id) => API.delete(`api/v1/wine-master/${id}`);
export const toggleWineMasterStatus = (id, active) => API.patch(`api/v1/wine-master/${id}`, null, { params: { active } });

