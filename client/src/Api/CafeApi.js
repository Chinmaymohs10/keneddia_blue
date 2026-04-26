import API from "./Api";

/**
 * Cafe Story Sections (Art of Slow Brewing)
 * These match the /api/v1/cafe-sections endpoints shown in Postman.
 */

// Create a new cafe section with entries
export const createCafeSection = (data) =>
  API.post("api/v1/cafe-sections/create", data);

// Update a cafe section (full update or status/active toggle)
export const updateCafeSection = (id, data) =>
  API.put(`api/v1/cafe-sections/${id}`, data);

// Get full section details including entries
export const getCafeSectionById = (id) =>
  API.get(`api/v1/cafe-sections/${id}/full`);

// Get sections by property ID (Filtered by specific property)
export const getCafeSectionsByProperty = (propertyId) =>
  API.get(`api/v1/cafe-sections/by-property/${propertyId}`);

// Get sections by property type ID (Global for that type)
export const getCafeSectionsByPropertyType = (propertyTypeId) =>
  API.get(`api/v1/cafe-sections/by-property-type/${propertyTypeId}`);


// Delete a cafe section
export const deleteCafeSection = (id) =>
  API.delete(`api/v1/cafe-sections/${id}`);

// Toggle specific entry status within a section (extracted from Image 4 pattern)
export const updateCafeSectionEntryStatus = (sectionId, entryId, isActive) =>
  API.put(`api/v1/cafe-sections/${sectionId}`, {
    entries: [{ id: entryId, active: isActive }]
  });
