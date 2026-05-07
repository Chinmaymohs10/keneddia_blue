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
