import {
  GetAllPropertyDetails,
  getAboutUsByPropertyType,
  getAllNews,
  getDailyOffers,
  getEventsUpdated,
  getGroupBookings,
  getHotelHomepageHeroSection,
  getPropertyTypes,
  getPublicRecognitionsByAboutUsId,
  getGuestExperienceSection,
  getGuestExperienceSectionHeader,
  getGuestExperineceRatingHeader,
} from "@/Api/Api";
import { buildNewsDetailPath } from "@/modules/website/utils/newsSlug";
import { buildEventDetailPath } from "@/modules/website/utils/eventSlug";
import { getCafeSectionById, getCafeSectionsByPropertyType } from "@/Api/CafeApi";
import { getMenuItemsByTopSoldV2 } from "@/Api/RestaurantApi";
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
      const reservationAvailable = Boolean(parent?.bookingEngineUrl);
      const highlightedAmenities = [];

      if (parent?.dineIn) highlightedAmenities.push("Dine In");
      if (parent?.takeaway) highlightedAmenities.push("Takeaway");

      highlightedAmenities.push(...amenities.slice(0, 3));

      return {
        id: listing?.id ? `${parent?.id}-${listing.id}` : `property-${parent?.id}`,
        propertyId: parent?.id,
        name: parent?.propertyName || "",
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
          listing?.mainHeading || listing?.tagline || listing?.subTitle || "",
        cuisines: amenities.slice(0, 6),
        highlightedAmenities: highlightedAmenities.filter(Boolean),
        nearbyLocation:
          parent?.nearbyLocations?.[0]?.nearbyLocationName ||
          listing?.landmark ||
          parent?.locationName ||
          "",
        area: parent?.area || null,
        serviceHours: parent?.serviceHours || "",
        googleMapLink: parent?.nearbyLocations?.[0]?.googleMapLink || parent?.addressUrl || "",
        isActive: parent?.isActive && (listing ? listing?.isActive : true),
      };
    })
    .filter((item) => item.isActive && isCafeType(item.type))
    .reverse();
};

const mapSection = (section, recognitions = []) => ({
  id: section?.id,
  subTitle: section?.subTitle || "Neighbourhood Cafe",
  sectionTitle: section?.sectionTitle || "Coffee First. Atmosphere Always.",
  description:
    section?.description ||
    "Our cafe concept blends specialty coffee, bakery-led comfort, and softer hospitality.",
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

const normalizeAboutSections = async (aboutRes, cafeTypeId) => {
  if (!cafeTypeId) return null;

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
      const recognitionRes = await fetchSafe(
        () => getPublicRecognitionsByAboutUsId(section.id),
        { data: [] },
      );
      return recognitionRes?.data || [];
    }),
  );

  return activeSections.map((section, index) =>
    mapSection(section, recognitionGroups[index] || []),
  );
};

const normalizeNews = (newsRes, cafeTypeId) => {
  const rawNews =
    newsRes?.data?.content || newsRes?.content || newsRes?.data || newsRes || [];

  return (Array.isArray(rawNews) ? rawNews : [])
    .filter((item) => {
      const badgeName =
        item?.badgeTypeName ||
        item?.badgeType ||
        item?.badge?.typeName ||
        item?.badge?.name ||
        "";
      const byName = isCafeType(badgeName);
      const byId =
        cafeTypeId != null && Number(item?.badgeTypeId) === Number(cafeTypeId);
      return item?.active === true && (byName || byId);
    })
    .sort(
      (a, b) =>
        new Date(b?.newsDate || b?.dateBadge || 0) -
        new Date(a?.newsDate || a?.dateBadge || 0),
    )
    .slice(0, 6)
    .map((item) => ({
      id: item?.id,
      category: item?.category || "NEWS",
      title: item?.title || "News",
      description: item?.description || "",
      dateBadge:
        item?.newsDate || item?.dateBadge || new Date().toISOString().split("T")[0],
      badgeType:
        item?.badgeTypeName ||
        item?.badgeType ||
        item?.badge?.typeName ||
        "Cafe",
      ctaText: item?.ctaText || "Read Story",
      ctaLink: buildNewsDetailPath(item),
      imageUrl: item?.imageUrl || item?.image || item?.media?.[0]?.url || "",
    }));
};

const formatDate = (value) => {
  if (!value) return "Upcoming";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Upcoming";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeEvents = (eventsRes, cafeTypeId) => {
  const rawEvents = Array.isArray(eventsRes?.data)
    ? eventsRes.data
    : Array.isArray(eventsRes)
      ? eventsRes
      : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rawEvents
    .filter((item) => {
      const eventDate = new Date(item?.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      const byTypeName = isCafeType(item?.typeName);
      const byTypeId =
        cafeTypeId != null && Number(item?.propertyTypeId) === Number(cafeTypeId);

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
      let detailPath = "/events";
      try {
        detailPath = buildEventDetailPath(item);
      } catch {
        detailPath = item?.slug ? `/events/${item.slug}` : "/events";
      }

      return {
        id: item?.id,
        type: "Event",
        title: item?.title || "Event",
        description: item?.description || "",
        image: media?.url
          ? {
              url: media.url,
              type: media?.type || "IMAGE",
            }
          : "",
        date: formatDate(item?.eventDate),
        location: item?.locationName || "Cafe Venue",
        detailPath,
        ctaText: item?.ctaText || "",
        ctaLink: item?.ctaLink || item?.ctaUrl || "",
      };
    })
    .filter((item) => item.image);
};

const toFoodTag = (foodType) => {
  if (!foodType) return "Veg";
  return foodType.toUpperCase() === "NON_VEG" ? "Non-Veg" : "Veg";
};

const normalizeBestSellers = (data, cafeTypeId) =>
  (Array.isArray(data) ? data : [])
    .filter((item) => {
      return cafeTypeId != null && Number(item?.propertyTypeId) === Number(cafeTypeId);
    })
    .map((item) => ({
      id: item.id,
      title: item.itemName,
      description: item.description || "",
      image: item.image?.url || item.media?.url || "",
      tags: [toFoodTag(item.foodType), "Best Seller"],
      category: item.type?.typeName || item.verticalCardResponseDTO?.verticalName || "Cafe Signature",
      likes: item.likeCount || 0,
    }));

const normalizeOffers = (offersRes, cafeTypeId) => {
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

  return list
    .filter((offer) => {
      let notExpired = true;
      if (offer.expiresAt) {
        const expiry = new Date(offer.expiresAt);
        expiry.setHours(23, 59, 59, 999);
        notExpired = expiry.getTime() > now;
      }

      const isDayActive =
        !offer.activeDays?.length || offer.activeDays.includes(todayName);

      const byTypeName = isCafeType(offer.propertyTypeName);
      const byTypeId =
        cafeTypeId != null && Number(offer.propertyTypeId) === Number(cafeTypeId);

      return (
        offer.isActive === true &&
        offer.showOnHomepage === true &&
        isDayActive &&
        notExpired &&
        (byTypeName || byTypeId)
      );
    })
    .map((offer) => ({
      id: offer.id,
      type: "Offer",
      title: offer.title || "Special Offer",
      description: offer.description || "",
      image: offer.image?.url
        ? {
            url: offer.image.url,
            type: offer.image?.type || "IMAGE",
          }
        : "",
      date: offer.expiresAt ? `Valid until ${formatDate(offer.expiresAt)}` : "Limited Time",
      location: offer.locationName || "All Outlets",
      slug: offer.slug || `offer-${offer.id}`,
      ctaText: offer.ctaText || "",
      ctaLink: offer.ctaUrl || offer.ctaLink || "",
    }))
    .filter((item) => item.image);
};

const normalizeCoffeeStory = (storyRes) => {
  const rawData = storyRes?.data || storyRes || [];
  const activeSection = Array.isArray(rawData)
    ? rawData.find((section) => section.active === true)
    : null;

  if (!activeSection) return null;

  return {
    heading: activeSection.heading,
    highlight: activeSection.highlight,
    description: activeSection.description,
    entries: activeSection.entries || [],
  };
};



const normalizeGroupBookings = (bookingsRes, cafeTypeId) => {
  const rawBookings = bookingsRes?.data || bookingsRes || [];
  return (Array.isArray(rawBookings) ? rawBookings : [])
    .filter((item) => {
      if (item?.isActive === false) return false;
      if (item?.showOnHomepage !== true) return false;
      const byTypeName = isCafeType(item?.propertyTypeName);
      const byTypeId =
        cafeTypeId != null && Number(item?.propertyTypeId) === Number(cafeTypeId);
      return byTypeName || byTypeId;
    })
    .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
    .slice(0, 4)
    .map((item) => ({
      id: item?.id,
      title: item?.title || "Group Booking",
      description: item?.description || "",
      image: item?.media?.[0]?.url || "",
      ctaLink: item?.ctaLink || "",
    }))
    .filter((item) => item.image);
};



export const defaultCafeHomepageData = {
  cafeTypeId: null,
  heroSlides: [],
  cafeProperties: [],
  aboutSections: null,
  cafeNews: [],
  cafeEvents: [],
  cafeOffers: [],
  groupBookings: [],
  guestExperiences: [],
  guestExperienceSectionHeader: null,
  guestExperienceRatingHeader: null,
  bestSellers: [],
};

export const fetchCafeHomepageData = async () => {
  const typesRes = await fetchSafe(() => getPropertyTypes(), { data: [] });
  const types = typesRes?.data || typesRes || [];
  const cafeType = Array.isArray(types)
    ? types.find((t) => t?.isActive && isCafeType(t?.typeName))
    : null;
  const cafeTypeId = cafeType?.id ? Number(cafeType.id) : null;

  const [
    heroRes,
    propertiesRes,
    aboutRes,
    newsRes,
    eventsRes,
    offersRes,
    bookingsRes,
    storyRes,
    guestExpRes,
    guestHeaderRes,
    guestRatingRes,
    bestSellersRes,
  ] = await Promise.all([
    cafeTypeId
      ? fetchSafe(() => getHotelHomepageHeroSection(cafeTypeId), { data: [] })
      : { data: [] },
    fetchSafe(() => GetAllPropertyDetails(), null),
    cafeTypeId
      ? fetchSafe(() => getAboutUsByPropertyType(cafeTypeId), { data: [] })
      : { data: [] },
    fetchSafe(() => getAllNews({ category: "", page: 0, size: 50 }), null),
    fetchSafe(() => getEventsUpdated(), null),
    fetchSafe(() => getDailyOffers({ page: 0, size: 50 }), null),
    fetchSafe(() => getGroupBookings(), null),
    cafeTypeId
      ? fetchSafe(() => getCafeSectionsByPropertyType(cafeTypeId), { data: [] })
      : { data: [] },
    fetchSafe(() => getGuestExperienceSection({ size: 100 }), null),
    fetchSafe(() => getGuestExperienceSectionHeader(), null),
    fetchSafe(() => getGuestExperineceRatingHeader(), null),
    fetchSafe(() => getMenuItemsByTopSoldV2({ topSold: true, propertyTypeId: cafeTypeId }), { data: [] }),
  ]);

  const aboutSections = await normalizeAboutSections(aboutRes, cafeTypeId);

  return {
    cafeTypeId,
    heroSlides: normalizeHeroSlides(heroRes?.data || heroRes || []),
    cafeProperties: propertiesRes ? normalizeProperties(propertiesRes) : [],
    aboutSections,
    cafeNews: newsRes ? normalizeNews(newsRes, cafeTypeId) : [],
    cafeEvents: eventsRes ? normalizeEvents(eventsRes, cafeTypeId) : [],
    cafeOffers: offersRes ? normalizeOffers(offersRes, cafeTypeId) : [],
    groupBookings: bookingsRes
      ? normalizeGroupBookings(bookingsRes, cafeTypeId)
      : [],
    coffeeStory: normalizeCoffeeStory(storyRes),
    guestExperiences: (() => {
      const rawData = guestExpRes?.data?.data || guestExpRes?.data || guestExpRes || [];
      const list = Array.isArray(rawData) ? rawData : rawData?.content || [];
      return list
        .filter((item) =>
          item?.isActive !== false &&
          (cafeTypeId != null
            ? Number(item?.propertyTypeId) === Number(cafeTypeId)
            : false)
        )
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || 0).getTime();
          const dateB = new Date(b?.createdAt || 0).getTime();
          return dateB - dateA;
        });
    })(),
    guestExperienceSectionHeader: (() => {
      const headerRes = guestHeaderRes;
      const sectionData = Array.isArray(headerRes?.data) ? headerRes.data[0] : headerRes?.data;
      return sectionData || null;
    })(),
    guestExperienceRatingHeader: (() => {
      const ratingRes = guestRatingRes;
      const ratingData = Array.isArray(ratingRes?.data) ? ratingRes.data[0] : ratingRes?.data;
      return ratingData || null;
    })(),
    bestSellers: normalizeBestSellers(bestSellersRes?.data ?? [], cafeTypeId),
  };
};
