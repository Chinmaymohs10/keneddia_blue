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

export const defaultHotelsPageData = {
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

const fetchSafe = async (fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    console.error("Hotels SSR data fetch error:", error);
    return fallback;
  }
};

const mapApiToHotelUI = (item) => {
  const parent = item.propertyResponseDTO;
  const listing = item.propertyListingResponseDTOS?.find((l) => l.isActive);
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
    amenities: Array.isArray(listing?.amenities) ? listing.amenities : [],
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

const normalizeHeroSlides = (data) => {
  const filteredContent = (Array.isArray(data) ? data : []).filter(
    (item) => item.active === true,
  );
  return filteredContent
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map((item) => {
      const mediaObj =
        item.backgroundAll?.[0] ||
        item.backgroundLight?.[0] ||
        item.backgroundDark?.[0];
      return {
        id: item.id,
        type: (mediaObj?.type?.toLowerCase() || "image"),
        media: mediaObj?.url || "",
        title: item.mainTitle || "",
        subtitle: item.subTitle || "",
        backgroundAll: item.backgroundAll || [],
        backgroundLight: item.backgroundLight || [],
        backgroundDark: item.backgroundDark || [],
      };
    });
};

const normalizeAboutSections = (data) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => item.isActive === true && item.showOnPropertyPage === true)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

const normalizeHotelOffers = async (offersRes) => {
  const normalize = (v) => (v || "").trim().toLowerCase().replace(/\s+/g, " ");
  const rawData = offersRes?.data?.data || offersRes?.data || [];
  const list = Array.isArray(rawData) ? rawData : rawData.content || [];
  const now = Date.now();

  const DAYS = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const todayName = DAYS[new Date().getDay()];

  const filtered = await Promise.all(
    list.map(async (o) => {
      if (!o.isActive) return null;

      if (!["PROPERTY_PAGE", "BOTH"].includes(o.displayLocation)) return null;

      if (!o.propertyTypeId) return null;

      const notExpired =
        !o.expiresAt || new Date(o.expiresAt).getTime() > now;
      if (!notExpired) return null;

      const isDayActive =
        !Array.isArray(o.activeDays) ||
        o.activeDays.length === 0 ||
        o.activeDays.includes(todayName);
      if (!isDayActive) return null;

      const propertyTypeRes = await fetchSafe(
        () => getPropertyTypeById(o.propertyTypeId),
        { data: null },
      );

      const propertyType = propertyTypeRes?.data;
      if (!propertyType?.isActive) return null;

      const typeName = normalize(propertyType.typeName);
      if (typeName !== "hotel" && typeName !== "both") return null;

      return { ...o, propertyTypeName: propertyType.typeName };
    }),
  );

  return filtered
    .filter(Boolean)
    .map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      couponCode: o.couponCode,
      ctaText: o.ctaText || "",
      ctaLink: o.ctaUrl || o.ctaLink || null,
      expiresAt: o.expiresAt,
      propertyType: o.propertyTypeName || "",
      image: o.image?.url
        ? {
          src: o.image.url,
          type: o.image.type,
          width: o.image.width,
          height: o.image.height,
          fileName: o.image.fileName,
          alt: o.title,
        }
        : null,
    }));
};

const normalizeHotelNews = (res) => {
  const data = res?.content || res?.data?.content || [];
  return Array.isArray(data)
    ? data
      .filter((item) => item.active === true && item.badgeType?.toLowerCase() === "hotel")
      .sort(
        (a, b) =>
          new Date(b.newsDate || b.dateBadge).getTime() -
          new Date(a.newsDate || a.dateBadge).getTime(),
      )
      .slice(0, 6)
    : [];
};

const normalizeGroupEvents = (eventResponse) => {
  const rawEvents = Array.isArray(eventResponse?.data)
    ? eventResponse.data
    : Array.isArray(eventResponse)
      ? eventResponse
      : [];

  const now = Date.now();

  return rawEvents
    .filter((e) => {
      const eventTime = new Date(e.eventDate).getTime();
      return (
        e.typeName === "Hotel" &&
        e.status === "ACTIVE" &&
        e.active === true &&
        eventTime >= now
      );
    })
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() -
        new Date(a.eventDate).getTime(),
    );
};

const normalizeGroupBookings = (bookingResponse) => {
  const rawBookings = bookingResponse?.data || bookingResponse || [];
  return (Array.isArray(rawBookings) ? rawBookings : [])
    .filter((b) => b.propertyTypeName !== "Restaurant")
    .sort((a, b) => b.id - a.id);
};

const normalizeHotelReviews = (experiencesRes, headerRes, ratingRes) => {
  const rawData =
    experiencesRes?.data?.data || experiencesRes?.data || experiencesRes || [];
  const guestExperiences = Array.isArray(rawData)
    ? [...rawData].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return Number(b.id) - Number(a.id);
    })
    : [];
  const headerData = Array.isArray(headerRes?.data) ? headerRes.data[0] : headerRes?.data;
  const ratingData = Array.isArray(ratingRes?.data) ? ratingRes.data[0] : ratingRes?.data;

  return {
    guestExperiences,
    sectionHeader: headerData || null,
    ratingHeader: ratingData || null,
  };
};

const normalizeHotelCollection = (res) => {
  const rawData = res?.data?.data || res?.data || [];
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((item) => mapApiToHotelUI(item))
    .filter((hotel) => hotel.isActive && hotel.type?.toLowerCase() === "hotel")
    .reverse();
};

const normalizeHotelLocations = (res) => {
  const data = res?.data || res || [];
  return (Array.isArray(data) ? data : []).filter((l) => l.isActive);
};

export const fetchHotelsPageData = async () => {
  const propertyTypesRes = await fetchSafe(() => getPropertyTypes(), []);
  const propertyTypes = propertyTypesRes?.data || propertyTypesRes || [];
  const hotelType = Array.isArray(propertyTypes)
    ? propertyTypes.find((type) => type.isActive && type.typeName?.toLowerCase() === "hotel")
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
    hotelTypeId ? fetchSafe(() => getHotelHomepageHeroSection(hotelTypeId), []) : [],
    hotelTypeId ? fetchSafe(() => getAboutUsByPropertyType(hotelTypeId), []) : [],
    fetchSafe(() => getDailyOffers({ page: 0, size: 100 }), null),
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
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
    aboutSections: normalizeAboutSections(aboutRes?.data || aboutRes || []),
    hotelOffers: offersRes ? await normalizeHotelOffers(offersRes) : [],
    hotelNews: newsRes ? normalizeHotelNews(newsRes) : [],
    groupEvents: groupEventsRes ? normalizeGroupEvents(groupEventsRes) : [],
    groupBookings: groupBookingsRes ? normalizeGroupBookings(groupBookingsRes) : [],
    hotelReviews: normalizeHotelReviews(
      reviewExperiencesRes,
      reviewHeaderRes,
      reviewRatingRes,
    ),
    hotelCollection: collectionRes ? normalizeHotelCollection(collectionRes) : [],
    hotelLocations: normalizeHotelLocations(locationsRes),
  };
};
