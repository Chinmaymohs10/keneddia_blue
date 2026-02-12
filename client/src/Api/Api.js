import axios from "axios";

// DEV
const apiUrl = "http://192.168.0.135:6090/";

// QA (commented as requested)
// const apiUrl = "http://103.152.79.63:6090/";

const API = axios.create({ baseURL: apiUrl });

API.interceptors.request.use(
  (req) => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      AuthService.logout();
    }
    return Promise.reject(error);
  },
);

export const loginAPI = (data) => API.post("api/v1/staff/login", data);
export const createRole = (data) => API.post("api/v1/roles", data);
export const getAllRoles = () => API.get("api/v1/showAll");
export const uploadMedia = (formData) =>
  API.post("api/v1/media/upload", formData);
export const PropertyUploadMedia = (formData) =>
  API.post("api/v1/property-listings/upload-media", formData);
export const getMediaById = (id) => API.get(`api/v1/media/${id}`);
export const createUser = (data) => API.post("api/v1/users/create", data);
export const getUsersPaginated = () => API.get("api/v1/users/auth/paginated");
export const addLocation = (data) => API.post("api/v1/locations/create", data);
export const getAllLocations = () => API.get("api/v1/locations/all");
export const updateLocationById = (id, data) =>
  API.put(`api/v1/locations/${id}/edit`, data);
export const updateLocationStatus = (id, isActive) =>
  API.patch(`api/v1/locations/${id}/status`, null, { params: { isActive } });

export const addPropertyType = (data) =>
  API.post("api/v1/property-types/create", data);
export const getPropertyTypes = () => API.get("api/v1/property-types");
export const getPropertyTypeById = (id) =>
  API.get(`api/v1/property-types/${id}`);
export const getActivePropertyTypes = () =>
  API.get("api/v1/property-types/active");
export const updatePropertyTypeStatus = (id, isActive) =>
  API.patch(`api/v1/property-types/${id}/status`, null, {
    params: { isActive },
  });
export const addPropertyCategory = (data) =>
  API.post("api/v1/property-categories/add", data);
export const getAllPropertyCategories = () =>
  API.get("api/v1/property-categories/all");
export const getActivePropertyCategories = () =>
  API.get("api/v1/property-categories/all?activeOnly=true");
export const updatePropertyCategoryStatus = (id, isActive) =>
  API.patch(`api/v1/property-categories/${id}/status`, null, {
    params: { isActive },
  });
export const addProperty = (type, data) =>
  API.post(`api/v1/properties/add/${type}`, data);
export const getAllProperties = () => API.get("api/v1/properties/showAll");
export const createOrUpdateHeroSection = (formData) =>
  API.post("api/v1/hero-sections/bulk", formData);
export const getHeroSection = () => API.get("api/v1/hero-sections");

export const addAboutUs = (payload) => {
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({
      sectionTitle: payload.sectionTitle,
      subTitle: payload.subTitle,
      description: payload.description,
      videoUrl: payload.videoUrl,
      videoTitle: payload.videoTitle,
      mediaUrls: payload.mediaUrls || [],
      ctaButtonText: payload.ctaButtonText,
      ctaButtonUrl: payload.ctaButtonUrl,
    }),
  );
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  return API.post("api/v1/admin/about-us", formData);
};
export const enableAboutUs = (id) =>
  API.patch(`api/v1/admin/about-us/${id}/enable`);
export const disableAboutUs = (id) =>
  API.patch(`api/v1/admin/about-us/${id}/disable`);
export const updateAboutUsById = (id, payload) => {
  const formData = new FormData();

  // data → stringified JSON (MANDATORY, same as add)
  formData.append(
    "data",
    JSON.stringify({
      sectionTitle: payload.sectionTitle,
      subTitle: payload.subTitle,
      description: payload.description,
      videoUrl: payload.videoUrl,
      videoTitle: payload.videoTitle,
      mediaUrls: payload.mediaUrls || [],
      ctaButtonText: payload.ctaButtonText,
      ctaButtonUrl: payload.ctaButtonUrl,
    }),
  );

  // files → multipart (optional)
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  return API.put(`api/v1/admin/about-us/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAboutUsAdmin = () => API.get("api/v1/admin/about-us");
export const getAboutUsPublicById = (id) =>
  API.get(`api/v1/public/about-us/${id}`);

export const addVenture = (aboutUsId, payload) => {
  const formData = new FormData();
  formData.append("ventureName", payload.ventureName);
  if (payload.logo) {
    formData.append("logo", payload.logo);
  }
  return API.post(`api/v1/admin/about-us/${aboutUsId}/ventures`, formData);
};
export const updateVentureById = (ventureId, payload) => {
  const formData = new FormData();
  formData.append("ventureName", payload.ventureName);

  if (payload.logo) {
    formData.append("logo", payload.logo);
  }

  return API.put(`api/v1/admin/about-us/ventures/${ventureId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getVenturesByAboutUsId = (aboutUsId) =>
  API.get(`api/v1/admin/about-us/${aboutUsId}/ventures`);
export const getPublicVenturesByAboutUsId = (aboutUsId) =>
  API.get(`api/v1/public/about-us/${aboutUsId}/ventures`);

export const addRecognition = (aboutUsId, data) =>
  API.post(`api/v1/admin/about-us/${aboutUsId}/recognitions`, data);
export const updateRecognition = (recognitionId, data) =>
  API.put(`api/v1/admin/about-us/recognitions/${recognitionId}`, data);
export const getRecognitionsByAboutUsId = (aboutUsId) =>
  API.get(`api/v1/admin/about-us/${aboutUsId}/recognitions`);
export const getPublicRecognitionsByAboutUsId = (aboutUsId) =>
  API.get(`api/v1/public/about-us/${aboutUsId}/recognitions`);

export const createGuestExperienceByGuest = (formData) =>
  API.post("api/v1/guest-experience/byGuests", formData);
export const deleteGuestExperience = (id) =>
  API.delete(`api/v1/guest-experience/${id}`);
export const addGuestExperienceSection = (data) =>
  API.post("api/v1/guest-experience/section", data);
export const getGuestExperienceSection = () =>
  API.get("/api/v1/guest-experience");
export const addGuestExperienceItem = (formData) =>
  API.post("api/v1/guest-experience", formData);
export const updateGuestExperienceItem = (id, formData) =>
  API.put(`api/v1/guest-experience/${id}`, formData);

//our presence section

export const AddOurPresenceSectionItems = (data) =>
  API.post("api/v1/our-presence/admin/items", data);
export const UpdateOurPresenceSectionHeaders = (data) =>
  API.put("api/v1/our-presence/admin/section", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
export const getOurPresenceSection = () => API.get("api/v1/our-presence");
export const updateOurPresenceSectionItemsById = (id, formData) =>
  API.put(`api/v1/our-presence/admin/items/${id}`, formData);

export const createOrUpdateOurPropertiesSection = (data) =>
  API.post("api/v1/our-properties/section", data);
export const getOurPropertiesSection = () =>
  API.get("api/v1/our-properties/section");
export const addOurPropertyItem = (sectionId, formData) =>
  API.post(`api/v1/our-properties/${sectionId}/items`, formData);
export const updateOurPropertyItem = (itemId, formData) =>
  API.put(`api/v1/our-properties/items/${itemId}`, formData);
export const getOurPropertyItemsBySectionId = (sectionId) =>
  API.get(`api/v1/our-properties/${sectionId}/items`);
export const createOrUpdateKennediaGroup = (data) =>
  API.post("api/v1/kennedia-group", data);
export const updateDailyOfferById = (id, data) =>
  API.put(`api/v1/daily-offer/${id}`, data);
export const getKennediaGroup = () => API.get("api/v1/kennedia-group");
// Enable a business division
export const enableKennediaDivision = (id) =>
  API.put(`api/v1/kennedia-group/division/${id}/enable`);
export const disableKennediaDivision = (id) =>
  API.put(`api/v1/kennedia-group/division/${id}/disable`);

// offer section
export const createDailyOffer = (data) =>
  API.post("api/v1/daily-offer/create", data);
export const UpdateDailyOffer = (id, data) =>
  API.put(`api/v1/daily-offer/${id}`, data);
export const getDailyOffers = ({ page = 0, size = 10 }) =>
  API.get("api/v1/daily-offer/paginated/all", { params: { page, size } });
export const updateDailyOfferActiveStatus = (id, isActive) =>
  API.patch(`api/v1/daily-offer/${id}/status`, null, { params: { isActive } });

//events section
export const createEvent = (formData) =>
  API.post("api/v1/events-updated/events", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getEvents = ({ status = "ACTIVE", page = 0, size = 10 }) =>
  API.get("api/v1/events-updated/showAll", { params: { status, page, size } });
export const updateEventById = (id, formData) =>
  API.put(`api/v1/events-updated/events/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateEventStatus = (id, active) =>
  API.patch(`api/v1/events-updated/events/${id}/status`, null, {
    params: { active },
  });

export const createEventUpdated = (formData) =>
  API.post("api/v1/events-updated/events", formData);
export const getEventsUpdated = () => API.get("api/v1/events-updated/showAll");

export const createNews = (data) => API.post("api/v1/news/create", data);
export const getAllNews = ({ category = "", page = 0, size = 10 }) =>
  API.get("api/v1/news/showAll", { params: { category, page, size } });
export const updateNewsById = (id, data) => API.put(`api/v1/news/${id}`, data);
export const updateNewsStatus = (id, isActive) =>
  API.patch(`api/v1/news/${id}/status`, null, { params: { isActive } });

// properties
export const createPropertyByType = (typeName, data) =>
  API.post(`api/v1/properties/add/${typeName}`, data);
export const createPropertyListing = (data) =>
  API.post("api/v1/property-listings", data);
export const GetAllPropertyListing = () => API.get("api/v1/property-listings");
export const GetAllPropertyDetails = () =>
  API.get("api/v1/properties/showAllDetails");
// properties/showAllDetails
export const getPropertyListingMedia = (propertyListingId) =>
  API.get(`api/v1/property-listings/${propertyListingId}/media`);
export const GetAllPropertyDetailsByID = (id) =>
  API.get(`api/v1/properties/AllDetailsById/${id}`);
export const enableProperty = (propertyId) =>
  API.patch(`api/v1/properties/enable/${propertyId}`);
export const disableProperty = (propertyId) =>
  API.patch(`api/v1/properties/disable/${propertyId}`);
export const deletePropertyListing = (propertyListingId) =>
  API.delete(`api/v1/property-listings/${propertyListingId}`);

export const createAmenityFeature = (data) =>
  API.post("api/v1/admin/amenities-features", data);
export const getAllAmenityFeatures = () =>
  API.get("api/v1/admin/amenities-features");
export const insertAmenitiesByPropertyId = (propertyId, amenityIds) => {
  return API.put(
    `api/v1/property-listings/insertAmenitiesByPropertyId/${propertyId}`,
    amenityIds,
  );
};

// ===============================
// HERO SECTION (V2)
// ===============================
export const uploadHeroMediaBulk = (formData) =>
  API.post("api/v1/media/bulk", formData);
export const createHeroSection = (data) =>
  API.post("api/v1/hero-sections/create", data);
export const getHeroSectionsPaginated = ({ page = 0, size = 10 }) =>
  API.get("api/v1/hero-sections/paginated/all", { params: { page, size } });
export const updateHeroSectionById = (id, data) =>
  API.put(`api/v1/hero-sections/${id}`, data);
export const toggleHeroSectionActive = (id, active) =>
  API.patch(`api/v1/hero-sections/${id}/active`, null, { params: { active } });
export const toggleHeroSectionHomepage = (id, show) =>
  API.patch(`api/v1/hero-sections/${id}/homepage`, null, { params: { show } });

// property detail page
// ===============================
// POLICY OPTIONS
// ===============================
export const createPolicyOption = (data) =>
  API.post("api/v1/policy-options/create", data);
export const getAllPolicyOptions = () => API.get("api/v1/policy-options");
export const updatePolicyOptionById = (id, data) =>
  API.put(`api/v1/policy-options/${id}`, data);
export const updatePolicyOptionStatus = (id, isActive) =>
  API.patch(`api/v1/policy-options/${id}/status`, { isActive });
// ===============================
// PROPERTY POLICIES
// ===============================
export const attachPoliciesToProperty = (data) =>
  API.post("api/v1/property-policy", data);
export const updatePropertyPolicyById = (id, data) =>
  API.put(`api/v1/property-policy/${id}`, data);
export const getAllPropertyPolicies = () =>
  API.get("api/v1/property-policy/getAll");
export const updatePropertyPolicyStatus = (propertyId, isActive) =>
  API.patch(`api/v1/property-policy/property/${propertyId}/status`, {
    isActive,
  });

// ===============================
// GALLERY
// ===============================
export const uploadGalleryMedia = (formData) =>
  API.post("api/v1/gallery/upload", formData);
export const updateGalleryMedia = (galleryId, formData) =>
  API.put(`api/v1/gallery/${galleryId}/media`, formData);
export const getAllGalleries = ({ page = 0, size = 10 }) =>
  API.get("api/v1/gallery/showAll", { params: { page, size } });
export const getGalleryById = (id) => API.get(`api/v1/gallery/${id}`);
export const deleteGalleryById = (id) => API.delete(`api/v1/gallery/${id}`);

// ===============================
// ROOMS
// ===============================
export const addRoomToProperty = (propertyId, data) =>
  API.post(`api/v1/rooms/property/${propertyId}`, data);
export const updateRoomById = (roomId, data) =>
  API.put(`api/v1/rooms/${roomId}`, data);
export const getRoomById = (roomId) => API.get(`api/v1/rooms/${roomId}`);
export const getRoomsByPropertyId = (propertyId) =>
  API.get(`api/v1/rooms/property/${propertyId}`);
export const deleteOrDeactivateRoom = (roomId) =>
  API.delete(`api/v1/rooms/${roomId}`);

//hotel homepage items
export const HotelAddAboutUs = (payload) => {
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({
      sectionTitle: payload.sectionTitle,
      subTitle: payload.subTitle,
      description: payload.description,
      videoUrl: payload.videoUrl,
      videoTitle: payload.videoTitle,
      mediaUrls: payload.mediaUrls || [],
      ctaButtonText: payload.ctaButtonText,
      ctaButtonUrl: payload.ctaButtonUrl,
    }),
  );
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  return API.post("api/v1/admin/about-us", formData);
};
export const searchRooms = (payload) =>
  API.post("api/v1/rooms/search", payload);
export const getHotelHomepageHeroSection = (id) =>
  API.get(`api/v1/hero-sections/property/${id}`);
//hotel about
export const addAboutUsByPropertyType = (propertyTypeId, payload) => {
  const formData = new FormData();

  // JSON payload
  formData.append(
    "data",
    JSON.stringify({
      sectionTitle: payload.sectionTitle,
      subTitle: payload.subTitle,
      description: payload.description,
      videoUrl: payload.videoUrl,
      videoTitle: payload.videoTitle,
      mediaUrls: payload.mediaUrls || [],
      ctaButtonText: payload.ctaButtonText,
      ctaButtonUrl: payload.ctaButtonUrl,
    }),
  );

  // Files (multiple)
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  // 🔑 propertyTypeId goes in URL
  return API.post(`api/v1/admin/about-us/property/${propertyTypeId}`, formData);
};
export const getAboutUsByPropertyType = (propertyTypeId) => {
  return API.get(`api/v1/admin/about-us/property/${propertyTypeId}`);
};
export const updateAboutUsByPropertyTypeId = (aboutUsId, payload) => {
  const formData = new FormData();

  // JSON payload
  formData.append(
    "data",
    JSON.stringify({
      sectionTitle: payload.sectionTitle,
      subTitle: payload.subTitle,
      description: payload.description,
      videoUrl: payload.videoUrl,
      videoTitle: payload.videoTitle,
      mediaUrls: payload.mediaUrls || [],
      ctaButtonText: payload.ctaButtonText,
      ctaButtonUrl: payload.ctaButtonUrl,
    }),
  );

  // Files (multiple)
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  // 🔁 Update by AboutUs ID
  return API.put(`api/v1/admin/about-us/property/${aboutUsId}`, formData);
};

export default API;
