import {
  GetAllPropertyDetails,
  getHotelHomepageHeroSection,
  getPropertyTypes,
} from "@/Api/Api";

const fetchSafe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const isCafeType = (value) => normalize(value) === "cafe";

const getAmenityName = (amenity) =>
  typeof amenity === "string"
    ? amenity
    : amenity && typeof amenity === "object" && "name" in amenity
      ? amenity.name
      : null;

const normalizeHeroSlides = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => item.active === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map((item) => {
      const backgroundMedia =
        item.backgroundAll?.[0] ||
        item.backgroundLight?.[0] ||
        item.backgroundDark?.[0] ||
        null;
      if (!backgroundMedia?.url) return null;
      const primaryWord = item.mainTitle?.trim()?.split(/\s+/)?.[0] || "";
      return {
        id: item.id,
        tag: item.ctaText || null,
        title: item.mainTitle || null,
        desc: item.subTitle || null,
        img: backgroundMedia.url,
        isVideo: backgroundMedia.type === "VIDEO",
        bgTitle: primaryWord.toUpperCase(),
        ctaText: item.ctaText || null,
      };
    })
    .filter(Boolean);

const normalizeProperties = (response) => {
  const rawData = response?.data?.data || response?.data || [];
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((item) => {
      const parent = item?.propertyResponseDTO;
      const listing = item?.propertyListingResponseDTOS?.find((entry) => entry?.isActive);
      const amenities = Array.isArray(listing?.amenities)
        ? listing.amenities.map(getAmenityName).filter(Boolean)
        : [];
      const reservationAvailable = Boolean(
        parent?.dineIn || parent?.takeaway || parent?.bookingEngineUrl,
      );
      const highlightedAmenities = [];

      if (parent?.dineIn) highlightedAmenities.push("Dine In");
      if (parent?.takeaway) highlightedAmenities.push("Takeaway");
      highlightedAmenities.push(
        reservationAvailable ? "Reservation Available" : "Walk-in Only",
      );
      highlightedAmenities.push(...amenities.slice(0, 3));

      return {
        id: listing?.id ? `${parent?.id}-${listing.id}` : `property-${parent?.id}`,
        propertyId: parent?.id,
        name: parent?.propertyName || "Unnamed Cafe",
        dineIn: Boolean(parent?.dineIn),
        takeaway: Boolean(parent?.takeaway),
        city: parent?.locationName || listing?.city || "Unknown",
        location: listing?.fullAddress || parent?.address || "N/A",
        type: listing?.propertyType || parent?.propertyTypes?.[0] || "Cafe",
        serviceTag: parent?.dineIn
          ? "Dine In"
          : parent?.takeaway
            ? "Takeaway"
            : listing?.propertyCategoryName || "Cafe",
        reservationAvailable,
        image: {
          src: listing?.media?.[0]?.url || listing?.media?.[0] || "",
          alt: parent?.propertyName || "Cafe",
        },
        rating: listing?.rating || 0,
        description:
          listing?.mainHeading ||
          listing?.tagline ||
          listing?.subTitle ||
          "Cafe experience with signature beverages and relaxed hospitality.",
        cuisines: amenities.slice(0, 6),
        highlightedAmenities: highlightedAmenities.filter(Boolean),
        nearbyLocation:
          parent?.nearbyLocations?.[0]?.nearbyLocationName ||
          listing?.landmark ||
          parent?.locationName ||
          "Prime location",
        area: parent?.area || null,
        serviceHours: "Open Daily",
        googleMapLink: parent?.nearbyLocations?.[0]?.googleMapLink || parent?.addressUrl || "",
        isActive: parent?.isActive && (listing ? listing?.isActive : true),
      };
    })
    .filter((item) => item.isActive && isCafeType(item.type))
    .reverse();
};

export const defaultCafeHomepageData = {
  cafeTypeId: null,
  heroSlides: [],
  cafeProperties: [],
};

export const fetchCafeHomepageData = async () => {
  const typesRes = await fetchSafe(() => getPropertyTypes(), { data: [] });
  const types = typesRes?.data || typesRes || [];
  const cafeType = Array.isArray(types)
    ? types.find((t) => t?.isActive && isCafeType(t?.typeName))
    : null;
  const cafeTypeId = cafeType?.id ? Number(cafeType.id) : null;

  const [heroRes, propertiesRes] = await Promise.all([
    cafeTypeId
      ? fetchSafe(() => getHotelHomepageHeroSection(cafeTypeId), { data: [] })
      : { data: [] },
    fetchSafe(() => GetAllPropertyDetails(), null),
  ]);

  return {
    cafeTypeId,
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
    cafeProperties: propertiesRes ? normalizeProperties(propertiesRes) : [],
  };
};
