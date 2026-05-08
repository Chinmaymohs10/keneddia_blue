import API from "./Api";

// Legal Disclaimer / Policy Pages APIs
export const createPolicyPage = (data) =>
  API.post("api/v1/legal-disclaimer/add", data);

export const updatePolicyPage = (id, data) =>
  API.put(`api/v1/legal-disclaimer/${id}`, data);

export const deletePolicyPage = (id) =>
  API.delete(`api/v1/legal-disclaimer/${id}`);

export const getPolicyPageById = (id) =>
  API.get(`api/v1/legal-disclaimer/${id}`);

export const getAllPolicyPages = () =>
  API.get("api/v1/legal-disclaimer/all");

// Add a section to a policy page
export const addPolicySection = (policyId, data) =>
  API.patch(`api/v1/legal-disclaimer/${policyId}/section`, data);

// Update a particular section
export const updatePolicySection = (sectionId, data) =>
  API.patch(`api/v1/legal-disclaimer/section/${sectionId}`, data);

// Activate/deactivate a particular section
export const updatePolicySectionActive = (sectionId, active) =>
  API.patch(`api/v1/legal-disclaimer/section/${sectionId}/active`, null, {
    params: { active },
  });

// Reorder section ids for a policy page
export const reorderPolicySections = (policyId, sectionIds) =>
  API.patch(`api/v1/legal-disclaimer/${policyId}/reorder`, sectionIds);

// Documents APIs
export const saveOrUpdateDocument = (file, id) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("api/v1/documents/saveOrUpdate", formData, {
    params: id ? { id } : undefined,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getDocumentById = (id) => API.get(`api/v1/documents/${id}`);

// Legal Disclaimer <-> Document mapping APIs
export const saveOrUpdateLegalDisclaimerDocument = (data) =>
  API.post("api/v1/legal-disclaimer-documents/saveOrUpdate", data);

export const getLegalDisclaimerDocumentByLegalDisclaimerId = (legalDisclaimerId) =>
  API.get(`api/v1/legal-disclaimer-documents/legalDisclaimer/${legalDisclaimerId}`);

export const deleteLegalDisclaimerDocument = (id) =>
  API.delete(`api/v1/legal-disclaimer-documents/${id}`);
