import axios from "axios";
import API from "./Api";

export const createPropertyGoogleMapping = (data) =>
  API.post("api/v1/property-google-mapping", data);

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
