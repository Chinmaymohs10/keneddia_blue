import {
  GetAllPropertyDetails,
  getAboutUsByPropertyType,
  getAllNews,
  getDailyOffers,
  getEventsUpdated,
  getGroupBookings,
  getGuestExperienceSection,
  getGuestExperienceSectionHeader,
  getGuestExperineceRatingHeader,
  getHotelHomepageHeroSection,
  getLocationsByType,
  getPropertyTypeById,
  getPropertyTypes,
} from "@/Api/Api";

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const getAmenityName = (amenity) => {
  if (typeof amenity === "string") return amenity;
  if (
    amenity &&
    typeof amenity === "object" &&
    "name" in amenity &&
    typeof amenity.name === "string"
  ) {
    return amenity.name;
  }

  return null;
};

export const defaultHotelsPageData = {
  hotelTypeId: null,
  heroSlides: [],
  aboutSections: [],
  hotelOffers: [],
  hotelNews: [],
  groupEvents: [],
  groupBookings: [],
  hotelReviews: {
    guestExperiences: [],
    sectionHeader: null,
    ratingHeader: null,
  },
  hotelCollection: [],
  hotelLocations: [],
};

const shouldSuppressFetchError = (error, options = {}) => {
  const status = error?.response?.status;

  if (options.silent) return true;
  if (options.silent404 && status === 404) return true;

  return false;
};

const fetchSafe = async (fn, fallback, options = {}) => {
  try {
    return await fn();
  } catch (error) {
    if (!shouldSuppressFetchError(error, options)) {
      console.error(
        options.label ? `${options.label}:` : "Hotels SSR data fetch error:",
        error,
      );
    }
    return fallback;
  }
};

const mapApiToHotelUI = (item) => {
  const parent = item.propertyResponseDTO;
  const listing = item.propertyListingResponseDTOS?.find((entry) => entry.isActive);
  const basePrice = listing?.price || 0;
  const discount = listing?.discountAmount || 0;
  const gstPercent = listing?.gstPercentage || 0;
  const discountPercent =
    basePrice > 0 ? Math.round((discount / basePrice) * 100) : 0;

  return {
    id: listing?.id ? `${parent?.id}-${listing.id}` : `property-${parent?.id}`,
    propertyId: parent?.id,
    listingId: listing?.id,
    name: parent?.propertyName || "Unnamed Property",
    location: listing?.fullAddress || parent?.address || "N/A",
    city: parent?.locationName || "Unknown",
    type: listing?.propertyType || parent?.propertyTypes?.[0] || "Hotel",
    bookingEngineUrl: parent?.bookingEngineUrl || null,
    image: {
      src: listing?.media?.[0]?.url || listing?.media?.[0] || "",
      alt: parent?.propertyName,
    },
    rating: listing?.rating || 0,
    description:
      listing?.tagline ||
      listing?.subTitle ||
      "Luxury comfort in the heart of the city",
    amenities: Array.isArray(listing?.amenities)
      ? listing.amenities
          .map((amenity) => getAmenityName(amenity))
          .filter(Boolean)
      : [],
    rooms: listing?.capacity || 1,
    capacity: listing?.capacity || parent?.capacity || 0,
    pricing: {
      basePrice,
      discount,
      discountPercent,
      gstPercent,
    },
    coordinates: {
      lat: parent?.latitude || 20.5937,
      lng: parent?.longitude || 78.9629,
    },
    isActive: parent?.isActive && (listing ? listing.isActive : true),
  };
};

const normalizeHeroSlides = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => item.active === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map((item) => {
      const mediaObj =
        item.backgroundAll?.[0] ||
        item.backgroundLight?.[0] ||
        item.backgroundDark?.[0];

      return {
        id: item.id,
        type: mediaObj?.type?.toLowerCase() || "image",
        media: mediaObj?.url || "",
        title: item.mainTitle || "",
        subtitle: item.subTitle || "",
        backgroundAll: item.backgroundAll || [],
        backgroundLight: item.backgroundLight || [],
        backgroundDark: item.backgroundDark || [],
      };
    });

const normalizeAboutSections = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => item.isActive === true && item.showOnPropertyPage === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

const normalizeHotelOffers = async (offersRes) => {
  const rawData = offersRes?.data?.data || offersRes?.data || [];
  const list = Array.isArray(rawData) ? rawData : rawData.content || [];
  const todayName = DAYS[new Date().getDay()];
  const propertyTypeCache = new Map();

  const filtered = await Promise.all(
    list.map(async (offer) => {
      if (!offer?.isActive) return null;
      if (!["PROPERTY_PAGE", "BOTH"].includes(offer.displayLocation)) return null;
      if (!offer.propertyTypeId) return null;

      let notExpired = true;
      if (offer.expiresAt) {
        const expiry = new Date(`${offer.expiresAt}T23:59:59`);
        notExpired = expiry.getTime() >= Date.now();
      }
      if (!notExpired) return null;

      const isDayActive =
        !offer.activeDays?.length || offer.activeDays.includes(todayName);
      if (!isDayActive) return null;

      if (!propertyTypeCache.has(offer.propertyTypeId)) {
        const propertyTypeRes = await fetchSafe(
          () => getPropertyTypeById(offer.propertyTypeId),
          { data: null },
          {
            label: "Hotels SSR property type lookup skipped",
            silent404: true,
          },
        );
        propertyTypeCache.set(offer.propertyTypeId, propertyTypeRes?.data || null);
      }

      const propertyType = propertyTypeCache.get(offer.propertyTypeId);
      const typeName = propertyType?.typeName?.trim().toLowerCase();

      if (!propertyType?.isActive) return null;
      if (typeName !== "hotel" && typeName !== "both") return null;

      return {
        ...offer,
        propertyTypeName: propertyType.typeName,
      };
    }),
  );

  return filtered.filter(Boolean).map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description,
    couponCode: offer.couponCode,
    ctaText: offer.ctaText || "",
    ctaLink: offer.ctaUrl || offer.ctaLink || null,
    expiresAt: offer.expiresAt,
    propertyType: offer.propertyTypeName || "",
    image: offer.image?.url
      ? {
          src: offer.image.url,
          type: offer.image.type,
          width: offer.image.width,
          height: offer.image.height,
          fileName: offer.image.fileName,
          alt: offer.title,
        }
      : null,
  }));
};

const normalizeHotelNews = (response) => {
  const data = response?.content || response?.data?.content || [];
  if (!Array.isArray(data)) return [];

  return [...data]
    .filter(
      (item) =>
        item.active === true && item.badgeType?.toLowerCase() === "hotel",
    )
    .sort(
      (a, b) =>
        new Date(b.newsDate || b.dateBadge).getTime() -
        new Date(a.newsDate || a.dateBadge).getTime(),
    )
    .slice(0, 6);
};

const normalizeGroupEvents = (response) => {
  const rawEvents = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rawEvents
    .filter((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      return (
        event.typeName === "Hotel" &&
        event.status === "ACTIVE" &&
        event.active === true &&
        eventDate >= today
      );
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    );
};

const normalizeGroupBookings = (response, propertyTypeId) => {
  const rawBookings = response?.data || response || [];
  if (!Array.isArray(rawBookings)) return [];

  return rawBookings
    .filter((booking) => {
      if (booking?.isActive === false) return false;
      if (booking.propertyTypeName === "Restaurant") return false;

      if (!propertyTypeId) {
        return booking.propertyTypeName !== "Restaurant";
      }

      return (
        booking.propertyTypeId == null ||
        Number(booking.propertyTypeId) === Number(propertyTypeId)
      );
    })
    .sort((a, b) => b.id - a.id);
};

const normalizeHotelReviews = (
  experiencesRes,
  headerRes,
  ratingRes,
  hotelTypeId,
) => {
  const rawData =
    experiencesRes?.data?.data || experiencesRes?.data || experiencesRes || [];
  const list = Array.isArray(rawData) ? rawData : [];

  return {
    guestExperiences: list
      .filter((item) =>
        hotelTypeId != null
          ? Number(item?.propertyTypeId) === Number(hotelTypeId)
          : false,
      )
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime(),
      ),
    sectionHeader: Array.isArray(headerRes?.data)
      ? headerRes.data[0] || null
      : headerRes?.data || null,
    ratingHeader: Array.isArray(ratingRes?.data)
      ? ratingRes.data[0] || null
      : ratingRes?.data || null,
  };
};

const normalizeHotelCollection = (response) => {
  const rawData = response?.data?.data || response?.data || [];
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((item) => mapApiToHotelUI(item))
    .filter((hotel) => hotel.isActive && hotel.type?.toLowerCase() === "hotel")
    .reverse();
};

const normalizeHotelLocations = (response) => {
  const data = response?.data || response || [];
  return (Array.isArray(data) ? data : []).filter((item) => item.isActive);
};

export const fetchHotelsPageData = async () => {
  const propertyTypesRes = await fetchSafe(() => getPropertyTypes(), []);
  const propertyTypes = propertyTypesRes?.data || propertyTypesRes || [];
  const hotelType = Array.isArray(propertyTypes)
    ? propertyTypes.find(
        (type) =>
          type.isActive && type.typeName?.trim().toLowerCase() === "hotel",
      )
    : null;
  const hotelTypeId = hotelType?.id || null;

  const [
    heroRes,
    aboutRes,
    offersRes,
    newsRes,
    groupEventsRes,
    groupBookingsRes,
    reviewExperiencesRes,
    reviewHeaderRes,
    reviewRatingRes,
    collectionRes,
    locationsRes,
  ] = await Promise.all([
    hotelTypeId
      ? fetchSafe(() => getHotelHomepageHeroSection(hotelTypeId), [])
      : [],
    hotelTypeId
      ? fetchSafe(() => getAboutUsByPropertyType(hotelTypeId), [])
      : [],
    fetchSafe(() => getDailyOffers({ targetType: "GLOBAL", page: 0, size: 100 }), null),
    fetchSafe(() => getAllNews({ category: "", page: 0, size: 20 }), null),
    fetchSafe(() => getEventsUpdated(), null),
    fetchSafe(() => getGroupBookings(), null),
    fetchSafe(() => getGuestExperienceSection({ size: 20 }), null),
    fetchSafe(() => getGuestExperienceSectionHeader(), null),
    fetchSafe(() => getGuestExperineceRatingHeader(), null),
    fetchSafe(() => GetAllPropertyDetails(), null),
    fetchSafe(() => getLocationsByType("Hotel"), []),
  ]);

  return {
    hotelTypeId,
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
    aboutSections: normalizeAboutSections(aboutRes?.data || aboutRes || []),
    hotelOffers: offersRes ? await normalizeHotelOffers(offersRes) : [],
    hotelNews: newsRes ? normalizeHotelNews(newsRes) : [],
    groupEvents: groupEventsRes ? normalizeGroupEvents(groupEventsRes) : [],
    groupBookings: groupBookingsRes
      ? normalizeGroupBookings(groupBookingsRes, hotelTypeId)
      : [],
    hotelReviews: normalizeHotelReviews(
      reviewExperiencesRes,
      reviewHeaderRes,
      reviewRatingRes,
      hotelTypeId,
    ),
    hotelCollection: collectionRes ? normalizeHotelCollection(collectionRes) : [],
    hotelLocations: normalizeHotelLocations(locationsRes),
  };
};
