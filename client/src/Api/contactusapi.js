import API from "./Api";

export const createInquiry = (data) => API.post("api/v1/inquiry/add", data);

export const getAllInquiries = () => API.get("api/v1/inquiry/all");

export const getInquiryById = (id) => API.get(`api/v1/inquiry/${id}`);

export const filterInquiries = ({
  propertyId,
  propertyTypeId,
  locationId,
} = {}) =>
  API.get("api/v1/inquiry/filter", {
    params: {
      propertyId,
      propertyTypeId,
      locationId,
    },
  });

export const getPropertyContactById = (propertyId) =>
  API.get(`api/v1/properties/contacts/${propertyId}`);

// Contact page - "Get in Touch" section (uses buffet section headers API)
export const getAllContactTouchHeaders = () =>
  API.get("api/v1/buffet-section-headers/showAll");
export const createContactTouchHeader = (data) =>
  API.post("api/v1/buffet-section-headers", data);
export const updateContactTouchHeader = (id, data) =>
  API.put(`api/v1/buffet-section-headers/${id}`, data);

// Contact page - hero/header section (uses restaurant-about API)
export const getAllContactHeroHeaders = () =>
  API.get("api/v1/restaurant-about/showAll");
export const createContactHeroHeader = (data) =>
  API.post("api/v1/restaurant-about", data);
export const updateContactHeroHeader = (id, data) =>
  API.put(`api/v1/restaurant-about/${id}`, data);
