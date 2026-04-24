import axios from "axios";
import AuthService from "@/modules/auth/authService";

// QA / DEV URL options. Uncomment and use whichever is needed.
const apiUrl = "http://192.168.0.135:6090/";
// const apiUrl = "http://103.152.79.63:6090/";
// const apiUrl = "https://backend.kennediablu.com/";

// Active SSR config required by the server team.
// const apiUrl =
//   typeof window === "undefined"
//     ? "http://127.0.0.1:6090"
//     : "https://backend.kennediablu.com";

const API = axios.create({ baseURL: apiUrl });
const isBrowser = typeof window !== "undefined";

const getStoredToken = () => {
  if (!isBrowser) return null;

  return (
    window.sessionStorage.getItem("accessToken") ||
    window.localStorage.getItem("accessToken")
  );
};

API.interceptors.request.use(
  (req) => {
    const token = getStoredToken();
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isBrowser && error.response?.status === 401) {
      // Token expired or invalid - logout user
      AuthService.logout();
    }
    return Promise.reject(error);
  },
);

export const loginAPI = (data) => API.post("api/v1/staff/login", data);
export const createRole = (data) => API.post("api/v1/roles", data);
export const getAllRoles = () => API.get("api/v1/showAll");
export const uploadMedia = (formData) =>API.post("api/v1/media/upload", formData);
export const PropertyUploadMedia = (formData) =>API.post("api/v1/property-listings/upload-media", formData);
export const PropertyEdiMedia = (listingId, formData) =>
  API.put(`api/v1/property-listings/${listingId}/edit-media`, formData);
export const getMediaById = (id) => API.get(`api/v1/media/${id}`);
export const createUser = (data) => API.post("api/v1/users/create", data);
export const getUsersPaginated = ({ page = 1, size = 10 } = {}) =>
  API.get("api/v1/users/auth/paginated", {
    params: { page, size },
  });
export const updateUser = (id, data) => API.put(`api/v1/users/${id}`, data);
export const activateUser = (id) => API.put(`api/v1/users/activate/${id}`);
export const disableUser = (id) => API.put(`api/v1/users/disable/${id}`);
export const deleteUser = (id) => API.delete(`api/v1/users/delete/${id}`);
export const addLocation = (data) => API.post("api/v1/locations/create", data);
export const getLocationsByType = (type) =>
  API.get("/api/v1/locations", {
    params: { type },
  });

export const getAllLocations = () => API.get("api/v1/locations/all");
export const updateLocationById = (id, data) =>API.put(`api/v1/locations/${id}/edit`, data);
export const updateLocationStatus = (id, isActive) =>API.patch(`api/v1/locations/${id}/status`, null, { params: { isActive } });

export const addPropertyType = (data) =>API.post("api/v1/property-types/create", data);
export const updatePropertyType = (id,data) =>API.put(`api/v1/property-types/${id}`, data);
export const getPropertyTypes = () => API.get("api/v1/property-types");
export const getPropertyTypeById = (id) =>API.get(`api/v1/property-types/${id}`);
export const getActivePropertyTypes = () =>API.get("api/v1/property-types/active");
export const updatePropertyTypeStatus = (id, isActive) =>
  API.patch(`api/v1/property-types/${id}/status`, null, {
    params: { isActive },
  });
  
export const addPropertyCategory = (data) =>API.post("api/v1/property-categories/add", data);
export const updatePropertyCategory = (id,data) =>API.put(`api/v1/property-categories/update/${id}`, data);
export const getAllPropertyCategories = () =>API.get("api/v1/property-categories/all");
export const getActivePropertyCategories = () =>API.get("api/v1/property-categories/all?activeOnly=true");
export const updatePropertyCategoryStatus = (id, isActive) =>
  API.patch(`api/v1/property-categories/${id}/status`, null, {
    params: { isActive },
  });

export const addProperty = (type, data) =>API.post(`api/v1/properties/add/${type}`, data);
export const getAllProperties = () => API.get("api/v1/properties/showAll");
export const createOrUpdateHeroSection = (formData) =>API.post("api/v1/hero-sections/bulk", formData);
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
export const enableAboutUs = (id) =>API.patch(`api/v1/admin/about-us/${id}/enable`);
export const disableAboutUs = (id) =>API.patch(`api/v1/admin/about-us/${id}/disable`);

export const updateAboutUsById = (id, payload) => {
  const formData = new FormData();

  // 1. Separate files from the JSON data
  const { files, ...jsonData } = payload;

  // 2. Append the JSON part as "data" (Matches your Postman screenshot)
  formData.append("data", JSON.stringify(jsonData));

  // 3. Append actual files as "files"
  if (files && files.length > 0) {
    files.forEach((file) => {
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
export const getAboutUsPublicById = (id) =>API.get(`api/v1/public/about-us/${id}`);

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

export const getVenturesByAboutUsId = (aboutUsId) =>API.get(`api/v1/admin/about-us/${aboutUsId}/ventures`);
export const getPublicVenturesByAboutUsId = (aboutUsId) =>API.get(`api/v1/public/about-us/${aboutUsId}/ventures`);

export const addRecognition = (aboutUsId, data) =>API.post(`api/v1/admin/about-us/${aboutUsId}/recognitions`, data);
export const updateRecognition = (recognitionId, data) =>API.put(`api/v1/admin/about-us/recognitions/${recognitionId}`, data);
export const getRecognitionsByAboutUsId = (aboutUsId) =>API.get(`api/v1/admin/about-us/${aboutUsId}/recognitions`);
export const getPublicRecognitionsByAboutUsId = (aboutUsId) =>API.get(`api/v1/public/about-us/${aboutUsId}/recognitions`);

export const addGuestExperienceSectionHeader = (data) =>API.post("api/v1/guest-experience/section", data);
export const getGuestExperienceSectionHeader = () =>API.get("/api/v1/guest-experience/section");
export const createGuestExperienceByGuest = (formData) =>API.post("api/v1/guest-experience/byGuests", formData);
export const deleteGuestExperience = (id) =>API.delete(`api/v1/guest-experience/${id}`);
export const addGuestExperienceSection = (data) =>API.post("api/v1/guest-experience/section", data);
export const getGuestExperienceSection = () =>API.get("/api/v1/guest-experience");
export const addGuestExperienceItem = (formData) =>API.post("api/v1/guest-experience", formData);
export const updateGuestExperienceItem = (id, formData) =>API.put(`api/v1/guest-experience/${id}`, formData);

//our presence section

export const AddOurPresenceSectionItems = (data) =>API.post("api/v1/our-presence/admin/items", data);
export const UpdateOurPresenceSectionHeaders = (data) =>
  API.put("api/v1/our-presence/admin/section", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
export const getOurPresenceSection = () => API.get("api/v1/our-presence");
export const updateOurPresenceSectionItemsById = (id, formData) =>API.put(`api/v1/our-presence/admin/items/${id}`, formData);

export const addGuestExperineceRatingHeader = (data) =>API.post("/api/v1/ratings", data);
export const EditGuestExperineceRatingHeader = (id,data) =>API.put(`/api/v1/ratings/${id}`, data);
export const getGuestExperineceRatingHeader  = (id) =>API.get("/api/v1/ratings");



export const createOrUpdateOurPropertiesSection = (data) =>API.post("api/v1/our-properties/section", data);
export const getOurPropertiesSection = () =>API.get("api/v1/our-properties/section");
export const addOurPropertyItem = (sectionId, formData) =>API.post(`api/v1/our-properties/${sectionId}/items`, formData);
export const updateOurPropertyItem = (itemId, formData) =>API.put(`api/v1/our-properties/items/${itemId}`, formData);
export const getOurPropertyItemsBySectionId = (sectionId) =>API.get(`api/v1/our-properties/${sectionId}/items`);
export const createOrUpdateKennediaGroup = (data) =>API.post("api/v1/kennedia-group", data);
export const updateDailyOfferById = (id, data) =>API.put(`api/v1/daily-offer/${id}`, data);
export const getKennediaGroup = () => API.get("api/v1/kennedia-group");
// Enable a business division
export const enableKennediaDivision = (id) =>API.put(`api/v1/kennedia-group/division/${id}/enable`);
export const disableKennediaDivision = (id) =>API.put(`api/v1/kennedia-group/division/${id}/disable`);

// offer section
export const createDailyOffer = (data) =>API.post("api/v1/daily-offer/create", data);
export const UpdateDailyOffer = (id, data) =>API.put(`api/v1/daily-offer/${id}`, data);
export const getDailyOffers = ({ page = 0, size = 10 }) =>API.get("api/v1/daily-offer/paginated/all", { params: { page, size } });
export const updateDailyOfferActiveStatus = (id, isActive) =>API.patch(`api/v1/daily-offer/${id}/status`, null, { params: { isActive } });

//events section
export const createEvent = (formData) =>
  API.post("api/v1/events-updated/events", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getEvents = ({ status = "ACTIVE", page = 0, size = 10 }) =>API.get("api/v1/events-updated/showAll", { params: { status, page, size } });
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

export const createEventUpdated = (formData) =>API.post("api/v1/events-updated/events", formData);
export const getEventsUpdated = () => API.get("api/v1/events-updated/showAll");

export const createNews = (data) => API.post("api/v1/news/create", data);
export const getAllNews = ({ category = "", page = 0, size = 10 }) =>API.get("api/v1/news/showAll", { params: { category, page, size } });
export const updateNewsById = (id, data) => API.put(`api/v1/news/${id}`, data);
export const updateNewsStatus = (id, isActive) =>API.patch(`api/v1/news/${id}/status`, null, { params: { isActive } });

// properties
export const createPropertyByType = (typeName, data) =>API.post(`api/v1/properties/add/${typeName}`, data);
export const createPropertyListing = (data) =>API.post("api/v1/property-listings", data);
export const GetAllPropertyListing = () => API.get("api/v1/property-listings");

export const GetAllPropertyDetails = () =>API.get("api/v1/properties/showAllDetails");
export const updatePropertyById = (propertyId, payload) =>API.put(`api/v1/properties/edit/${propertyId}`, payload);

// properties/showAllDetails
export const getPropertyListingMedia = (propertyListingId) =>API.get(`api/v1/property-listings/${propertyListingId}/media`);
export const GetAllPropertyDetailsByID = (id) =>API.get(`api/v1/properties/AllDetailsById/${id}`);
export const enableProperty = (propertyId) =>API.patch(`api/v1/properties/enable/${propertyId}`);
export const disableProperty = (propertyId) =>API.patch(`api/v1/properties/disable/${propertyId}`);
export const deletePropertyListing = (propertyListingId) =>API.delete(`api/v1/property-listings/${propertyListingId}`);

export const createAmenityFeature = (data) =>API.post("api/v1/admin/amenities-features", data);
export const updateAmenityFeature = (id, data) =>API.put(`/api/v1/admin/amenities-features/${id}`, data);
export const amenitiesHighlight = (id, showHighlight) =>
  API.patch(`/api/v1/admin/amenities-features/${id}/highlight`, null, {
    params: { showHighlight },
  });
export const getAllAmenityFeatures = () =>API.get("api/v1/admin/amenities-features");
export const insertAmenitiesByPropertyId = (propertyId, amenityIds) => {
  return API.put(
    `api/v1/property-listings/insertAmenitiesByPropertyId/${propertyId}`,
    amenityIds,
  );
};

// ===============================
// HERO SECTION (V2)
// ===============================
export const uploadHeroMediaBulk = (formData) =>API.post("api/v1/media/bulk", formData);
export const createHeroSection = (data) =>API.post("api/v1/hero-sections/create", data);
export const getHeroSectionsPaginated = ({ page = 0, size = 10 }) =>API.get("api/v1/hero-sections/paginated/all", { params: { page, size } });
export const updateHeroSectionById = (id, data) =>API.put(`api/v1/hero-sections/${id}`, data);
export const toggleHeroSectionActive = (id, active) =>API.patch(`api/v1/hero-sections/${id}/active`, null, { params: { active } });
export const toggleHeroSectionHomepage = (id, show) =>API.patch(`api/v1/hero-sections/${id}/homepage`, null, { params: { show } });
export const toggleHeroSectionMobile = (id, show) =>API.patch(`api/v1/hero-sections/${id}/mobile`, null, { params: { show } });

// property detail page
// ===============================
// POLICY OPTIONS
// ===============================
export const createPolicyOption = (data) =>API.post("api/v1/policy-options/create", data);
export const getAllPolicyOptions = () => API.get("api/v1/policy-options");
export const updatePolicyOptionById = (id, data) =>API.put(`api/v1/policy-options/${id}`, data);
export const updatePolicyOptionStatus = (id, isActive) =>API.patch(`api/v1/policy-options/${id}/status`, { isActive });
// ===============================
// PROPERTY POLICIES
// ===============================
export const attachPoliciesToProperty = (data) =>API.post("api/v1/property-policy", data);
export const updatePropertyPolicyById = (id, data) =>API.put(`api/v1/property-policy/${id}`, data);
export const getAllPropertyPolicies = () =>API.get("api/v1/property-policy/getAll");
export const updatePropertyPolicyStatus = (propertyId, isActive) =>
  API.patch(`api/v1/property-policy/property/${propertyId}/status`, {
    isActive,
  });

// ===============================
// GALLERY
// ===============================
export const uploadGalleryMedia = (formData) =>API.post("api/v1/gallery/upload", formData);
export const updateGalleryMedia = (galleryId, formData) =>API.put(`api/v1/gallery/${galleryId}/media`, formData);
export const getAllGalleries = ({ page = 0, size = 100 }) =>API.get("api/v1/gallery/showAll", { params: { page, size } });
export const getGalleryById = (id) => API.get(`api/v1/gallery/${id}`);
export const getGalleryByPropertyId = (propertyId) => API.get(`api/v1/gallery/property/${propertyId}`);
export const deleteGalleryById = (id) => API.delete(`api/v1/gallery/${id}`);
export const searchGallery = ({ propertyId, verticalId }) =>
  API.get("api/v1/gallery/search", {
    params: {
      propertyId,
      verticalId,
    },
  });

// Add Group Booking
export const addGroupBooking = (data) =>API.post("/api/v1/group-bookings", data);
export const updateGroupBooking = (id, data) =>API.put(`/api/v1/group-bookings/${id}`, data);
export const getGroupBookings = () =>API.get("/api/v1/group-bookings");
export const updateGroupBookingActiveStatus = (id, active) =>
  API.patch(`/api/v1/group-bookings/${id}/active`, null, {
    params: { active },
  });
export const updateGroupBookingShowOnHomepage = (id, showOnHomepage) =>
  API.patch(`/api/v1/group-bookings/${id}/show-on-homepage`, null, {
    params: { showOnHomepage },
  });


// ===============================
// ROOMS
// ===============================
export const createRoomType = (data) =>API.post("api/v1/room-types", data);
export const getAllRoomTypes = () =>API.get("api/v1/room-types");
export const deleteRoomType = (id) =>API.delete(`api/v1/room-types/${id}`);
export const addRoomToProperty = (propertyId, data) =>API.post(`api/v1/rooms/property/${propertyId}`, data);
export const updateRoomById = (roomId, data) =>API.put(`api/v1/rooms/${roomId}`, data);
export const updateRoomAmenityHighlight = (roomId, amenityId, showHighlight) =>
  API.put(`api/v1/rooms/${roomId}/amenities/${amenityId}/highlight`, null, {
    params: { showHighlight },
  });
export const getRoomById = (roomId) => API.get(`api/v1/rooms/${roomId}`);
export const getRoomsByPropertyId = (propertyId) =>API.get(`api/v1/rooms/property/${propertyId}`);
export const deleteOrDeactivateRoom = (roomId) =>API.delete(`api/v1/rooms/${roomId}`);

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
export const searchRooms = (payload) =>API.post("api/v1/rooms/search", payload);
export const getHotelHomepageHeroSection = (id) =>API.get(`api/v1/hero-sections/property/${id}`);
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
      sectionTitle: payload.sectionTitle || "",
      subTitle: payload.subTitle || "",
      description: payload.description || "",
      videoUrl: payload.videoUrl || "",
      videoTitle: payload.videoTitle || "",
      mediaUrls: payload.mediaUrls || [],
      ctaButtonText: payload.ctaButtonText || "",
      ctaButtonUrl: payload.ctaButtonUrl || "",
    }),
  );

  // Files (multiple)
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  // 🔁 Update by AboutUs ID
  return API.put(`api/v1/admin/about-us/${aboutUsId}`, formData);
};

// ─────────────────────────────
// COMMENTS
// ─────────────────────────────

// create main comment
export const createComment = (data) =>API.post("api/v1/comments/create", data);
// add admin reply to comment
export const addCommentReply = (data) =>API.post("api/v1/comments/admin/reply", data);
// get entire comment thread by comment id
export const getCommentThread = (commentId) =>API.get(`api/v1/comments/${commentId}`);
// get comments by property id
export const getCommentsByProperty = (propertyId) =>API.get(`api/v1/comments/property/${propertyId}`);
// get comments by property type id
export const getCommentsByPropertyType = (propertyTypeId) =>API.get(`api/v1/comments/property-type/${propertyTypeId}`);
// get comments by news id
export const getCommentsByNews = (newsId) =>API.get(`api/v1/comments/news/${newsId}`);
// delete comment (hard delete with replies)
export const deleteComment = (commentId) =>API.delete(`api/v1/comments/${commentId}`);
// toggle main comment enable/disable
export const toggleCommentStatus = (data) =>API.put("api/v1/comments/admin/toggle-status", data);
// toggle reply enable/disable
export const toggleCommentReplyStatus = (replyId) =>API.put(`api/v1/comments/admin/toggle-reply-status/${replyId}`);

//Event-extra data and post event images api's
export const uploadEventGallery = (formData) =>API.post("api/v1/event-gallery-upload/upload", formData, {headers: {"Content-Type": "multipart/form-data",},});
export const getAllUploadedEventFiles = (formData) =>API.get("api/v1/event-gallery-upload/getAllUploadedFiles", {data: formData,});
export const getEventFilesByUploadedId = (id) =>API.get(`api/v1/event-gallery-upload/getGalleryEventUploadsByEventId/${id}`);
export const replaceEventGalleryMedia = (galleryUploadId, mediaId, payload) =>
  API.patch(
    `api/v1/event-gallery-upload/replaceMedia/${galleryUploadId}/${mediaId}`,
    payload
  );
export const deleteEventGalleryMedia = (galleryUploadId, mediaId) =>
  API.delete(
    `api/v1/event-gallery-upload/deleteMedia/${galleryUploadId}/${mediaId}`
  );
// ─────────────────────────────
// EVENT DETAIL CARD INFO
// ─────────────────────────────
export const addEventDetailInfo = (formData) =>API.post("api/v1/event-card/addCard", formData, {headers: {"Content-Type": "multipart/form-data",},});
export const getEventDetailInfo = () =>API.get("api/v1/event-card/getCards");
export const getEventDetailInfoById = (id) =>API.get(`api/v1/event-card/getCardsByEventId/${id}`);
export const updateEventDetailInfo = (id, formData) =>API.patch(`api/v1/event-card/updateCard/${id}`, formData, {headers: {"Content-Type": "multipart/form-data",},});

// ─────────────────────────────
// EVENT INTEREST & BOOKING
// ─────────────────────────────

export const addEventInterest = (data) =>API.post("api/v1/book-interested/addInterest", data);
export const addEventBooking = (data) =>API.post("api/v1/book-interested/addBookNow", data);
export const getEventInterestByEventId = (eventId) =>API.get(`api/v1/book-interested/getByEventId/${eventId}`);
export const getBookByEventId = (eventId) =>API.get(`api/v1/book-interested/getBookByEventId/${eventId}`);
export const getBookInterestedById = (id) =>API.get(`api/v1/book-interested/getByBookInterestedId/${id}`);

//hotel dining section
// ================= DINING APIs =================

// CREATE Dining
export const createDining = (formData) =>API.post("api/v1/dining/createDining", formData);
// GET all Dining
export const getAllDining = () =>API.get("api/v1/dining/getAllDining");
// GET Dining by Property ID
export const getAllDiningByPropertyId = (propertyId) =>API.get(`api/v1/dining/getAllDiningByPropertyId/${propertyId}`);
// TOGGLE Dining (Active/Inactive + update fields)
export const toggleDining = (id, formData) =>API.patch(`api/v1/dining/toggle/${id}`, formData);
// UPDATE Dining
export const updateDining = (id, formData) =>API.put(`api/v1/dining/updateDining/${id}`, formData);

// ================= BOOKING CHANNEL PARTNER APIs =================

// CREATE
export const createBookingChannelPartner = (data) =>API.post("api/v1/booking-channel-partners", data);
// GET ALL
export const getAllBookingChannelPartners = () =>API.get("api/v1/booking-channel-partners");
// GET BY PROPERTY
export const getBookingChannelPartnersByPropertyId = (propertyId) =>API.get(`api/v1/booking-channel-partners/property/${propertyId}`);
// UPDATE
export const updateBookingChannelPartner = (id, data) =>API.put(`api/v1/booking-channel-partners/${id}`, data);
// TOGGLE STATUS (Active / Inactive)
export const updateBookingChannelPartnerStatus = (id, isActive) =>API.patch(`api/v1/booking-channel-partners/${id}/status`,null,{
params: { isActive },});

//SEO API'S
export const addGoogleTag = (data) =>API.post("api/v1/google-tag/addGoogleTag", data);
export const getAllGoogleTags = () =>API.get("api/v1/google-tag/getAllGoogleTag");
export const getAllActiveGoogleTags = () =>API.get("api/v1/google-tag/getAllActiveGoogleTag");
export const getGoogleTagById = (id) =>API.get(`api/v1/google-tag/getGoogleTagById/${id}`);
export const updateGoogleTag = (id, data) =>API.patch(`api/v1/google-tag/updateGoogleTag/${id}`, data);
export const deleteGoogleTag = (id) =>API.delete(`api/v1/google-tag/deleteGoogleTag/${id}`);
// ----------------
// ================= META DATA APIs =================

export const addMetaData = (data) =>API.post("api/v1/meta-data/addMetaData", data);
// GET all Meta Data
export const getAllMetaData = () =>API.get("api/v1/meta-data/getAllMetaData");
export const getAllActiveMetaData = () =>API.get("api/v1/meta-data/getAllActiveMetaData");
export const getMetaDataById = (id) =>API.get(`api/v1/meta-data/getMetaDataById/${id}`);
export const updateMetaData = (id, data) =>API.patch(`api/v1/meta-data/updateMetaData/${id}`, data);
export const toggleMetaDataById = (id) =>API.patch(`api/v1/meta-data/toggleMetaDataById/${id}`);
export const deleteMetaData = (id) =>API.delete(`api/v1/meta-data/deleteMetaData/${id}`);

export default API;
