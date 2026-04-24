import {
  // GetAllPropertyDetails,
  getHotelHomepageHeroSection,
  getPropertyTypes,
} from "@/Api/Api";
import cafeParisian from "@assets/generated_images/parisian_style_cafe_interior.png";
import cafeMinimalist from "@assets/generated_images/modern_minimalist_coffee_shop.png";
import cafeGarden from "@assets/generated_images/garden_terrace_cafe.png";
import cafeLibrary from "@assets/generated_images/cozy_library_cafe.png";

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
        ctaLink: item.ctaLink || null,
        showOnMobilePage: item.showOnMobilePage ?? null,
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

const fallbackCafeProperties = [
  {
    id: "fallback-cafe-ghaziabad",
    propertyId: 9001,
    name: "Kennedia Blu Cafe Ghaziabad",
    dineIn: true,
    takeaway: true,
    city: "Ghaziabad",
    location: "Raj Nagar District Centre, Ghaziabad",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: { src: cafeParisian, alt: "Kennedia Blu Cafe Ghaziabad" },
    rating: 4.8,
    description:
      "A refined neighbourhood cafe for slow mornings, crafted coffee, fresh bakes, and relaxed evening conversations.",
    cuisines: ["Specialty Coffee", "Artisan Bakery", "All Day Breakfast", "Desserts"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Wi-Fi"],
    nearbyLocation: "RDC Ghaziabad",
    area: "Raj Nagar",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Ghaziabad",
    isActive: true,
  },
  {
    id: "fallback-cafe-noida",
    propertyId: 9002,
    name: "Kennedia Blu Cafe Noida",
    dineIn: true,
    takeaway: true,
    city: "Noida",
    location: "Sector 18, Noida",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: { src: cafeMinimalist, alt: "Kennedia Blu Cafe Noida" },
    rating: 4.7,
    description:
      "A modern cafe space with clean interiors, single-origin brews, working lunches, and signature comfort plates.",
    cuisines: ["Single-Origin Coffee", "Continental", "Sandwiches", "Healthy Bowls"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Work Friendly"],
    nearbyLocation: "Sector 18 Metro",
    area: "Sector 18",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Noida",
    isActive: true,
  },
  {
    id: "fallback-cafe-delhi",
    propertyId: 9003,
    name: "Kennedia Blu Cafe Delhi",
    dineIn: true,
    takeaway: true,
    city: "Delhi",
    location: "Connaught Place, New Delhi",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: { src: cafeLibrary, alt: "Kennedia Blu Cafe Delhi" },
    rating: 4.9,
    description:
      "A calm city cafe with lounge seating, curated teas, handcrafted desserts, and a quiet premium setting.",
    cuisines: ["Coffee", "High Tea", "Desserts", "Light Meals"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Lounge Seating"],
    nearbyLocation: "Connaught Place",
    area: "CP",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Delhi",
    isActive: true,
  },
  {
    id: "fallback-cafe-bangalore",
    propertyId: 9004,
    name: "Kennedia Blu Cafe Bangalore",
    dineIn: true,
    takeaway: true,
    city: "Bangalore",
    location: "Indiranagar, Bangalore",
    type: "Cafe",
    serviceTag: "Dine In",
    reservationAvailable: true,
    image: { src: cafeGarden, alt: "Kennedia Blu Cafe Bangalore" },
    rating: 4.8,
    description:
      "A garden-inspired cafe for premium coffee, brunch plates, relaxed meetings, and evening desserts.",
    cuisines: ["Coffee", "Brunch", "Bakery", "Small Plates"],
    highlightedAmenities: ["Dine In", "Takeaway", "Reservation Available", "Outdoor Seating"],
    nearbyLocation: "Indiranagar",
    area: "Indiranagar",
    serviceHours: "Open Daily",
    googleMapLink: "https://www.google.com/maps/search/Kennedia+Blu+Cafe+Bangalore",
    isActive: true,
  },
];

export const defaultCafeHomepageData = {
  cafeTypeId: null,
  heroSlides: [],
  cafeProperties: fallbackCafeProperties,
};

export const fetchCafeHomepageData = async () => {
  const typesRes = await fetchSafe(() => getPropertyTypes(), { data: [] });
  const types = typesRes?.data || typesRes || [];
  const cafeType = Array.isArray(types)
    ? types.find((t) => t?.isActive && isCafeType(t?.typeName))
    : null;
  const cafeTypeId = cafeType?.id ? Number(cafeType.id) : null;

  const [heroRes] = await Promise.all([
    cafeTypeId
      ? fetchSafe(() => getHotelHomepageHeroSection(cafeTypeId), { data: [] })
      : { data: [] },
    // Uncomment this when cafe homepage properties should load from the API again.
    // fetchSafe(() => GetAllPropertyDetails(), null),
  ]);

  return {
    cafeTypeId,
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
    // cafeProperties: propertiesRes ? normalizeProperties(propertiesRes) : fallbackCafeProperties,
    cafeProperties: fallbackCafeProperties,
  };
};
