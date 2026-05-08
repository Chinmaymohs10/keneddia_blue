import axios from "axios";
import API from "./Api";

export const createPropertyGoogleMapping = (data) =>
  API.post("api/v1/property-google-mapping/create", data);

export const updatePropertyGoogleMapping = (id, data) =>
  API.put(`api/v1/property-google-mapping/${id}`, data);

export const togglePropertyGoogleMappingStatus = (id, enabled) =>
  API.patch(`api/v1/property-google-mapping/${id}/status`, null, {
    params: { enabled },
  });

export const deletePropertyGoogleMapping = (id) =>
  API.delete(`api/v1/property-google-mapping/${id}`);

export const getPropertyGoogleMappingByPropertyId = (propertyId) =>
  API.get(`api/v1/property-google-mapping/property/${propertyId}`);

export const syncGoogleReviewsByPropertyId = (propertyId) =>
  API.post(`api/v1/google-reviews/sync/${propertyId}`);

export const getGooglePlaceDetails = ({
  placeId,
  key,
  fields = "name,rating,reviews",
}) =>
  axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
    params: {
      place_id: placeId,
      fields,
      key,
    },
  });

export const getGuestExperienceReviews = ({
  propertyId,
  source = "USER", 
}) =>
  API.get(`api/v1/guest-experience/reviews/property/${propertyId}`, {
    params: { source },
  });
export const updateGuestExperienceReview = (id, data) =>
  API.patch(`api/v1/guest-experience/${id}/review`, data);

// ─── PET POOJA ───────────────────────────────────────────────────────────────
export const createPropertyPetPooja = (data) =>
  API.post("api/v1/property-petpooja/create", data);

export const getPropertyPetPoojaByPropertyId = (propertyId) =>
  API.get(`api/v1/property-petpooja/${propertyId}`);

export const updatePropertyPetPooja = (propertyId, data) =>
  API.put(`api/v1/property-petpooja/${propertyId}`, data);

export const togglePropertyPetPoojaStatus = (propertyId, active) =>
  API.patch(`api/v1/property-petpooja/${propertyId}/active`, null, {
    params: { active },
  });

const PETPOOJA_DEFAULT_BASE = "http://192.168.0.135:6090";

const petPoojaBase = (baseUrl) =>
  baseUrl?.trim() ? baseUrl.trim().replace(/\/$/, "") : PETPOOJA_DEFAULT_BASE;

export const fetchPetPoojaMenus = ({ appKey, appSecret, accessToken, restID, baseUrl }) =>
  axios.post(
    `${petPoojaBase(baseUrl)}/api/v1/menu/fetch`,
    { restID },
    {
      params: {
        "app-key": appKey,
        "app-secret": appSecret,
        "access-token": accessToken,
      },
    }
  );

export const savePetPoojaOrder = ({ appKey, appSecret, accessToken, orderinfo, baseUrl }) =>
  axios.post(
    `${petPoojaBase(baseUrl)}/api/v1/order/save`,
    { app_key: appKey, app_secret: appSecret, access_token: accessToken, orderinfo }
  );

// ─── FOOD DELIVERY LINKS ──────────────────────────────────────────────────────
export const createFoodDeliveryLink = (data) =>
  API.post("api/v1/food-delivery-links/create", data);

export const getAllFoodDeliveryLinks = () =>
  API.get("api/v1/food-delivery-links");

export const getFoodDeliveryLinkById = (id) =>
  API.get(`api/v1/food-delivery-links/${id}`);

export const updateFoodDeliveryLink = (id, data) =>
  API.put(`api/v1/food-delivery-links/${id}`, data);

export const toggleFoodDeliveryLinkActive = (id, active) =>
  API.patch(`api/v1/food-delivery-links/${id}/active`, null, { params: { active } });

export const toggleFoodDeliveryZomato = (id, active) =>
  API.patch(`api/v1/food-delivery-links/${id}/zomato`, null, { params: { active } });

export const toggleFoodDeliverySwiggy = (id, active) =>
  API.patch(`api/v1/food-delivery-links/${id}/swiggy`, null, { params: { active } });

export const filterFoodDeliveryLinks = (params = {}) =>
  API.get("api/v1/food-delivery-links/filter", { params });