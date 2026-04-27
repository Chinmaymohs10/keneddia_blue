import {
  GetAllPropertyDetails,
  getAboutUsByPropertyType,
  getAllLocations,
  getAllNews,
  getDailyOffers,
  getEventsUpdated,
  getGroupBookings,
  getGuestExperienceSection,
  getGuestExperienceSectionHeader,
  getGuestExperineceRatingHeader,
  getHotelHomepageHeroSection,
  getPropertyTypeById,
  getPropertyTypes,
  getPublicRecognitionsByAboutUsId,
} from "@/Api/Api";
import { getMenuItemsByTopSoldV2 } from "@/Api/RestaurantApi";

const fetchSafe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const isRestaurantType = (value) =>
  ["restaurant", "resturant"].includes(normalize(value));

// ── Hero slides ───────────────────────────────────────────────────────────────
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

      const subMedia =
        item.subAll?.[0] ||
        item.subLight?.[0] ||
        item.subDark?.[0] ||
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
        thumbnail: subMedia?.url || backgroundMedia.url,
        thumbnailIsVideo: subMedia?.type === "VIDEO",
        bgTitle: primaryWord.toUpperCase(),
        ctaText: item.ctaText || null,
        ctaLink: item.ctaLink || null,
        showOnHomepage: item.showOnHomepage === true,
        showOnMobilePage: item.showOnMobilePage ?? null,
      };
    })
    .filter(Boolean);

// ── Offers ────────────────────────────────────────────────────────────────────
const normalizeOffers = async (offersRes) => {
  const rawData = offersRes?.data?.data || offersRes?.data || [];
  const list = Array.isArray(rawData) ? rawData : rawData.content || [];
  const now = Date.now();
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayName = days[new Date().getDay()];

  const results = await Promise.all(
    list.map(async (offer) => {
      if (!offer?.isActive || offer?.showOnHomepage !== true) return null;
      if (offer.expiresAt) {
        const expiry = new Date(`${offer.expiresAt}T23:59:59`);
        if (expiry.getTime() < now) return null;
      }
      if (offer.activeDays?.length && !offer.activeDays.includes(todayName)) return null;
      if (!offer.propertyTypeId) return null;

      const typeRes = await fetchSafe(() => getPropertyTypeById(offer.propertyTypeId), { data: null });
      const propertyType = typeRes?.data;
      if (!propertyType?.isActive || normalize(propertyType.typeName) !== "restaurant") return null;

      return {
        id: offer.id,
        title: offer.title || "",
        description: offer.description || "",
        ctaText: offer.ctaText || "",
        link: offer.ctaUrl || offer.ctaLink || null,
        location: offer.location || offer.locationName || offer.propertyName || "",
      };
    }),
  );
  return results.filter(Boolean);
};

// ── Restaurant properties ─────────────────────────────────────────────────────
const getAmenityName = (amenity) =>
  typeof amenity === "string"
    ? amenity
    : amenity && typeof amenity === "object" && "name" in amenity
      ? amenity.name
      : null;

const normalizeProperties = (response) => {
  const rawData = response?.data?.data || response?.data || [];
  if (!Array.isArray(rawData)) return [];
  return rawData
    .map((item) => {
      const parent = item?.propertyResponseDTO;
      const listing = item?.propertyListingResponseDTOS?.find((e) => e?.isActive);
      const amenities = Array.isArray(listing?.amenities)
        ? listing.amenities.map(getAmenityName).filter(Boolean)
        : [];
      const hasServiceAvailability = Boolean(
        parent?.dineIn || parent?.takeaway || parent?.bookingEngineUrl,
      );
      const highlightedAmenities = [];
      if (parent?.dineIn) highlightedAmenities.push("Dine In");
      if (parent?.takeaway) highlightedAmenities.push("Takeaway");
      highlightedAmenities.push(
        hasServiceAvailability ? "Reservation Available" : "Walk-in Only",
      );
      return {
        id: listing?.id ? `${parent?.id}-${listing.id}` : `property-${parent?.id}`,
        propertyId: parent?.id,
        name: parent?.propertyName || "Unnamed Restaurant",
        dineIn: Boolean(parent?.dineIn),
        takeaway: Boolean(parent?.takeaway),
        city: parent?.locationName || listing?.city || "Unknown",
        location: listing?.fullAddress || parent?.address || "N/A",
        type: listing?.propertyType || parent?.propertyTypes?.[0] || "Restaurant",
        serviceTag: parent?.dineIn ? "Dining" : "Dining",
        reservationAvailable: hasServiceAvailability,
        image: { src: listing?.media?.[0]?.url || listing?.media?.[0] || "", alt: parent?.propertyName || "Restaurant" },
        rating: listing?.rating || 0,
        description: listing?.mainHeading || listing?.tagline || listing?.subTitle || "",
        cuisines: amenities.slice(0, 6),
        highlightedAmenities: highlightedAmenities.filter(Boolean),
        nearbyLocation: parent?.nearbyLocations?.[0]?.nearbyLocationName || parent?.locationName || "",
        area: parent?.area || null,
        serviceHours: "Open Daily",
        googleMapLink: parent?.nearbyLocations?.[0]?.googleMapLink || parent?.addressUrl || "",
        isActive: parent?.isActive && (listing ? listing?.isActive : true),
      };
    })
    .filter((r) => r.isActive && isRestaurantType(r.type))
    .reverse();
};

// ── Best sellers ──────────────────────────────────────────────────────────────
const toTag = (foodType) => {
  if (!foodType) return "Veg";
  return foodType.toUpperCase() === "NON_VEG" ? "Non-Veg" : "Veg";
};

const normalizeBestSellers = (data, restaurantTypeId) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => {
      // Basic safety check: if we have a typeId, ensure it matches
      return restaurantTypeId != null ? Number(item?.propertyTypeId) === Number(restaurantTypeId) : true;
    })
    .map((item) => ({
      id: item.id,
      title: item.itemName,
      description: item.description || "",
      image: item.image?.url || item.media?.url || "",
      tags: [toTag(item.foodType), "Best Seller"],
      category: item.type?.typeName || item.verticalCardResponseDTO?.verticalName || "",
      likes: item.likeCount || 0,
    }));

// ── News ──────────────────────────────────────────────────────────────────────
const normalizeNews = (newsRes, restaurantTypeId) => {
  const rawNews =
    newsRes?.data?.content || newsRes?.content || newsRes?.data || newsRes || [];
  return (Array.isArray(rawNews) ? rawNews : [])
    .filter((item) => {
      const badgeName = item?.badgeTypeName || item?.badgeType || item?.badge?.typeName || item?.badge?.name || "";
      const byName = isRestaurantType(badgeName);
      const byId = restaurantTypeId != null && Number(item?.badgeTypeId) === restaurantTypeId;
      return item?.active === true && (byName || byId);
    })
    .sort((a, b) => new Date(b?.newsDate || b?.dateBadge || 0) - new Date(a?.newsDate || a?.dateBadge || 0))
    .slice(0, 6)
    .map((item) => ({
      id: item?.id,
      category: item?.category || "NEWS",
      title: item?.title || "News",
      description: item?.description || "",
      dateBadge: item?.newsDate || item?.dateBadge || new Date().toISOString().split("T")[0],
      badgeType: item?.badgeTypeName || item?.badgeType || item?.badge?.typeName || "Restaurant",
      ctaText: item?.ctaText || "Read Story",
      ctaLink: item?.slug ? `/news/${item.slug}` : item?.id ? `/news/${item.id}` : "/news",
      imageUrl: item?.imageUrl || item?.image || item?.media?.[0]?.url || "",
    }));
};

// ── Events ────────────────────────────────────────────────────────────────────
const normalizeEvents = (eventsRes, restaurantTypeId) => {
  const rawEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rawEvents
    .filter((item) => {
      const eventDate = new Date(item?.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      const byTypeName = isRestaurantType(item?.typeName);
      const byTypeId = restaurantTypeId != null && Number(item?.propertyTypeId) === restaurantTypeId;
      return (
        item?.active === true &&
        normalize(item?.status) === "active" &&
        (byTypeName || byTypeId) &&
        !Number.isNaN(eventDate.getTime()) &&
        eventDate >= today
      );
    })
    .sort((a, b) => new Date(a?.eventDate) - new Date(b?.eventDate))
    .slice(0, 8)
    .map((item) => {
      const media = item?.image || item?.media?.[0] || null;
      return {
        id: item?.id,
        title: item?.title || "Event",
        description: item?.description || "",
        date: item?.eventDate || "",
        location: item?.locationName || "Restaurant Venue",
        detailPath: item?.slug ? `/events/${item.slug}` : item?.id ? `/events/${item.id}` : "/events",
        media: {
          type: media?.type || "IMAGE",
          src: media?.url || "",
          alt: media?.alt || item?.title || "Event media",
          width: media?.width ?? null,
          height: media?.height ?? null,
        },
      };
    })
    .filter((item) => item?.media?.src);
};

const normalizeGroupBookings = (bookingsRes, restaurantTypeId) => {
  const rawBookings = bookingsRes?.data || bookingsRes || [];
  return (Array.isArray(rawBookings) ? rawBookings : [])
    .filter((item) => {
      if (item?.isActive === false) return false;
      if (item?.showOnHomepage !== true) return false;
      const byTypeName = isRestaurantType(item?.propertyTypeName);
      const byTypeId = restaurantTypeId != null && Number(item?.propertyTypeId) === restaurantTypeId;
      return byTypeName || byTypeId;
    })
    .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
    .slice(0, 4)
    .map((item) => ({
      id: item?.id,
      title: item?.title || "Group Booking",
      description: item?.description || null,
      ctaLink: item?.ctaLink || "",
      imageUrl: item?.media?.[0]?.url || null,
      propertyId: item?.propertyId || null,
      propertyName: item?.propertyName || null,
    }));
};

// ── About sections ────────────────────────────────────────────────────────────
const mapSection = (section, recognitions = []) => ({
  id: section?.id,
  subTitle: section?.subTitle || "Restaurant Experience",
  sectionTitle: section?.sectionTitle || "Dining With Signature Hospitality",
  description: section?.description || "",
  image: section?.media?.find((item) => item?.type === "IMAGE")?.url || "",
  recognitions: recognitions
    .filter((item) => item?.isActive)
    .map((item) => ({
      id: item.id,
      value: item.value,
      title: item.title,
      subTitle: item.subTitle,
      isActive: item.isActive,
    })),
});

const normalizeAboutSections = async (aboutRes, restaurantTypeId) => {
  if (!restaurantTypeId) return null;
  const aboutData = aboutRes?.data || aboutRes;
  const activeSections = Array.isArray(aboutData)
    ? aboutData
        .filter((item) => item?.isActive === true && item?.showOnPropertyPage === true)
        .sort((a, b) => b.id - a.id)
        .slice(0, 3)
    : [];

  if (activeSections.length === 0) return null;

  const recognitionGroups = await Promise.all(
    activeSections.map(async (section) => {
      if (Array.isArray(section?.recognitions) && section.recognitions.length > 0) {
        return section.recognitions;
      }
      const res = await fetchSafe(() => getPublicRecognitionsByAboutUsId(section.id), { data: [] });
      return res?.data || [];
    }),
  );

  return activeSections.map((section, index) =>
    mapSection(section, recognitionGroups[index] || []),
  );
};

// ── Guest experiences ─────────────────────────────────────────────────────────
const normalizeGuestExperiences = (res, restaurantTypeId) => {
  const rawData = res?.data?.data || res?.data || res || [];
  const list = Array.isArray(rawData) ? rawData : rawData?.content || [];
  return list
    .filter((item) =>
      item?.isActive !== false &&
      (restaurantTypeId != null
        ? Number(item?.propertyTypeId) === Number(restaurantTypeId)
        : false),
    )
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
};

// ── Locations ─────────────────────────────────────────────────────────────────
const normalizeLocations = (res) => {
  const data = res?.data ?? [];
  return (Array.isArray(data) ? data : [])
    .filter((l) => l.name || l.locationName)
    .map((l) => ({ value: l.name || l.locationName, label: l.name || l.locationName }));
};

// ── Main export ───────────────────────────────────────────────────────────────
export const defaultRestaurantHomepageData = {
  restaurantTypeId: null,
  heroSlides: [],
  restaurantOffers: [],
  restaurantProperties: [],
  bestSellers: [],
  restaurantNews: [],
  restaurantEvents: [],
  groupBookings: [],
  aboutSections: null,
  guestExperiences: [],
  sectionHeader: null,
  ratingHeader: null,
  locations: [],
};

export const fetchRestaurantHomepageData = async () => {
  // First resolve restaurant type id — needed for several other fetches
  const typesRes = await fetchSafe(() => getPropertyTypes(), { data: [] });
  const types = typesRes?.data || typesRes || [];
  const restaurantType = Array.isArray(types)
    ? types.find((t) => t?.isActive && isRestaurantType(t?.typeName))
    : null;
  const restaurantTypeId = restaurantType?.id ? Number(restaurantType.id) : null;

  const [
    heroRes,
    offersRes,
    propertiesRes,
    bestSellersRes,
    newsRes,
    eventsRes,
    bookingsRes,
    aboutRes,
    experiencesRes,
    sectionHeaderRes,
    ratingHeaderRes,
    locationsRes,
  ] = await Promise.all([
    restaurantTypeId
      ? fetchSafe(() => getHotelHomepageHeroSection(restaurantTypeId), { data: [] })
      : { data: [] },
    fetchSafe(() => getDailyOffers({ targetType: "GLOBAL", page: 0, size: 100 }), null),
    fetchSafe(() => GetAllPropertyDetails(), null),
    fetchSafe(() => getMenuItemsByTopSoldV2({ topSold: true, propertyTypeId: restaurantTypeId }), { data: [] }),
    fetchSafe(() => getAllNews({ category: "", page: 0, size: 50 }), null),
    fetchSafe(() => getEventsUpdated(), null),
    fetchSafe(() => getGroupBookings(), null),
    restaurantTypeId
      ? fetchSafe(() => getAboutUsByPropertyType(restaurantTypeId), { data: [] })
      : { data: [] },
    fetchSafe(() => getGuestExperienceSection({ size: 100 }), null),
    fetchSafe(() => getGuestExperienceSectionHeader(), null),
    fetchSafe(() => getGuestExperineceRatingHeader(), null),
    fetchSafe(() => getAllLocations(), null),
  ]);

  const aboutSections = await normalizeAboutSections(aboutRes, restaurantTypeId);

  return {
    restaurantTypeId,
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
    restaurantOffers: offersRes ? await normalizeOffers(offersRes) : [],
    restaurantProperties: propertiesRes ? normalizeProperties(propertiesRes) : [],
    bestSellers: normalizeBestSellers(bestSellersRes?.data ?? [], restaurantTypeId),
    restaurantNews: newsRes ? normalizeNews(newsRes, restaurantTypeId) : [],
    restaurantEvents: eventsRes ? normalizeEvents(eventsRes, restaurantTypeId) : [],
    groupBookings: bookingsRes ? normalizeGroupBookings(bookingsRes, restaurantTypeId) : [],
    aboutSections,
    guestExperiences: experiencesRes
      ? normalizeGuestExperiences(experiencesRes, restaurantTypeId)
      : [],
    sectionHeader: Array.isArray(sectionHeaderRes?.data)
      ? sectionHeaderRes.data[0] || null
      : sectionHeaderRes?.data || null,
    ratingHeader: Array.isArray(ratingHeaderRes?.data)
      ? ratingHeaderRes.data[0] || null
      : ratingHeaderRes?.data || null,
    locations: locationsRes ? normalizeLocations(locationsRes) : [],
  };
};
