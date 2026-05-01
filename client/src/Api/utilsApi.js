import API from "./Api";

/**
 * ============================================================================
 * UTILITIES API DOCUMENTATION (WhatsApp Info & Icon Upload)
 * ============================================================================
 * 
 * 1. WHATSAPP INFO:
 *    Fields: phoneNumber, title, description, active, propertyId (opt), propertyTypeId (opt)
 * 
 * 2. ICON UPLOAD:
 *    Fields: mediaId, description, active, showOnHeader, showOnFooter, propertyId (opt), propertyTypeId (opt)
 * ============================================================================
 */

// ─────────────────────────────
// WHATSAPP INFO (LINK)
// ─────────────────────────────
export const createWhatsAppInfo = (data) => API.post("api/v1/whatsapp-info/create", data);
export const getAllWhatsAppInfo = () => API.get("api/v1/whatsapp-info/all");
export const getWhatsAppInfoById = (id) => API.get(`api/v1/whatsapp-info/${id}`);
export const getWhatsAppInfoByPropertyId = (propertyId) => API.get(`api/v1/whatsapp-info/property/${propertyId}`);
export const getWhatsAppInfoByPropertyTypeId = (propertyTypeId) => API.get(`api/v1/whatsapp-info/property-type/${propertyTypeId}`);
export const updateWhatsAppInfo = (id, data) => API.put(`api/v1/whatsapp-info/${id}`, data);
export const toggleWhatsAppInfoStatus = (id, active) => API.patch(`api/v1/whatsapp-info/${id}/active`, null, { params: { active } });

// ─────────────────────────────
// ICON UPLOAD
// ─────────────────────────────
export const createIconUpload = (data) => API.post("api/v1/icon-upload/create", data);
export const getAllIconUploads = () => API.get("api/v1/icon-upload/all");
export const getIconUploadById = (id) => API.get(`api/v1/icon-upload/${id}`);
export const getIconUploadByPropertyId = (propertyId) => API.get(`api/v1/icon-upload/property/${propertyId}`);
export const getIconUploadByPropertyTypeId = (propertyTypeId) => API.get(`api/v1/icon-upload/property-type/${propertyTypeId}`);
export const updateIconUpload = (id, data) => API.put(`api/v1/icon-upload/${id}`, data);
export const toggleIconUploadStatus = (id, active) => API.patch(`api/v1/icon-upload/${id}/active`, null, { params: { active } });
export const toggleIconUploadHeaderStatus = (id, showOnHeader) => API.patch(`api/v1/icon-upload/${id}/header`, null, { params: { showOnHeader } });
export const toggleIconUploadFooterStatus = (id, showOnFooter) => API.patch(`api/v1/icon-upload/${id}/footer`, null, { params: { showOnFooter } });
