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

export const fetchPetPoojaMenus = ({ appKey, appSecret, accessToken, restID }) =>
  axios.post(
    "https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1/mapped_restaurant_menus",
    { restID },
    {
      headers: {
        "app-key": appKey,
        "app-secret": appSecret,
        "access-token": accessToken,
        "Content-Type": "application/json",
      },
    }
  );

export const savePetPoojaOrder = ({ appKey, appSecret, accessToken, orderinfo }) =>
  axios.post(
    "https://47pfzh5sf2.execute-api.ap-southeast-1.amazonaws.com/V1/save_order",
    { "app-key": appKey, "app-secret": appSecret, "access-token": accessToken, orderinfo }
  );