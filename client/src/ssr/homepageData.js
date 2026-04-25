import {
  GetAllPropertyDetails,
  getAboutUsAdmin,
  getAllLocations,
  getAllNews,
  getDailyOffers,
  getEventsUpdated,
  getGuestExperienceSection,
  getGuestExperienceSectionHeader,
  getGuestExperineceRatingHeader,
  getHeroSectionsPaginated,
  getKennediaGroup,
  getOurPresenceSection,
  getPublicRecognitionsByAboutUsId,
  getVenturesByAboutUsId,
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

export const defaultHomePageData = {
  heroData: [],
  dailyOffers: [],
  properties: [],
  aboutData: {
    aboutUsData: null,
    ventures: [],
    recognitions: [],
  },
  businessData: null,
  eventsData: [],
  newsData: [],
  storyData: {
    guestExperiences: [],
    sectionHeader: null,
    ratingHeader: null,
  },
  globalData: {
    locations: [],
    sectionData: null,
  },
};

const fetchSafe = async (fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    console.error("Homepage SSR data fetch error:", error);
    return fallback;
  }
};

const normalizeHero = (response) => {
  const pageData = response?.data?.data || response?.data || response;
  const content = Array.isArray(pageData?.content) ? pageData.content : [];

  return [...content]
    .filter((item) => item.active === true)
    .sort((a, b) => b.id - a.id)
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
      const isBackgroundVideo = backgroundMedia?.type === "VIDEO";

      let thumbnailUrl = "";
      if (subMedia?.type === "IMAGE") {
        thumbnailUrl = subMedia.url;
      } else if (subMedia?.type === "VIDEO") {
        thumbnailUrl = isBackgroundVideo ? "" : backgroundMedia?.url || "";
      } else {
        thumbnailUrl = backgroundMedia?.url || "";
      }

      return {
        id: item.id,
        type: isBackgroundVideo ? "video" : "image",
        mobileMediaType: isBackgroundVideo ? "video" : "image",
        media: backgroundMedia?.url || "",
        mobileMedia: backgroundMedia?.url || "",
        thumbnail: subMedia?.url || thumbnailUrl,
        thumbnailType: subMedia?.type === "VIDEO" ? "video" : "image",
        title: item.mainTitle || "",
        subtitle: item.subTitle || "",
        cta: item.ctaText ?? undefined,
        ctaLink: item.ctaLink ?? null,
        showOnHomepage: item.showOnHomepage,
        showOnMobilePage: item.showOnMobilePage ?? null,
      };
    });
};

const normalizeOffers = (response) => {
  const rawData = response?.data?.data || response?.data || [];
  const list = Array.isArray(rawData) ? rawData : rawData.content || [];
  const now = Date.now();
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

      return (
        offer.isActive === true &&
        offer.showOnHomepage === true &&
        isDayActive &&
        notExpired
      );
    })
    .map((offer) => ({
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

const normalizeProperties = (response) => {
  const rawData = response?.data?.data || response?.data || [];
  if (!Array.isArray(rawData)) return [];

  const formatted = rawData.flatMap((item) => {
    const parent = item.propertyResponseDTO;
    const listings = item.propertyListingResponseDTOS || [];

    if (!parent || parent.isActive !== true) return [];

    return listings
      .filter((listing) => listing.isActive === true)
      .map((listing) => ({
        id: listing.id,
        propertyId: parent?.id,
        listingId: listing.id,
        propertyName: parent?.propertyName || "Unnamed Property",
        propertyType:
          listing.propertyType || parent?.propertyTypes?.[0] || "Property",
        city: parent?.locationName,
        mainHeading: listing.mainHeading || "",
        subTitle: listing.subTitle || "",
        fullAddress: listing.fullAddress || parent?.address,
        tagline: listing.tagline || "",
        rating: listing.rating ?? 0,
        capacity: listing.capacity ?? 0,
        price: listing.price ?? 0,
        gstPercentage: listing.gstPercentage ?? 0,
        discountAmount: listing.discountAmount ?? 0,
        amenities: (listing.amenities || [])
          .map((amenity) => getAmenityName(amenity))
          .filter(Boolean),
        isActive: true,
        media: listing.media || [],
        bookingEngineUrl: parent?.bookingEngineUrl || null,
        mobileNumber: parent?.mobileNumber || null,
        email: parent?.email || null,
      }));
  });

  return [...formatted].reverse();
};

const normalizeAbout = async (response) => {
  const data = response?.data || response;
  if (!Array.isArray(data)) return defaultHomePageData.aboutData;

  const homepageOnly = data.filter(
    (item) => item.propertyTypeId == null && item.isActive === true,
  );

  if (homepageOnly.length === 0) return defaultHomePageData.aboutData;

  const aboutUsData = [...homepageOnly].sort((a, b) => b.id - a.id)[0];

  const [venturesRes, recognitionsRes] = await Promise.all([
    fetchSafe(() => getVenturesByAboutUsId(aboutUsData.id), { data: [] }),
    fetchSafe(() => getPublicRecognitionsByAboutUsId(aboutUsData.id), {
      data: [],
    }),
  ]);

  return {
    aboutUsData,
    ventures: Array.isArray(venturesRes?.data) ? venturesRes.data : [],
    recognitions: Array.isArray(recognitionsRes?.data)
      ? recognitionsRes.data
      : [],
  };
};

const normalizeEvents = (response) => {
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
      return event.active === true && eventDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    );
};

const normalizeNews = (response) => {
  const data = response?.data?.content || response?.content || [];
  if (!Array.isArray(data)) return [];

  return [...data]
    .filter((item) => item.active === true)
    .sort(
      (a, b) =>
        new Date(b.dateBadge).getTime() - new Date(a.dateBadge).getTime(),
    )
    .slice(0, 6);
};

const normalizeStory = (experiencesRes, headerRes, ratingRes) => {
  const rawData =
    experiencesRes?.data?.data || experiencesRes?.data || experiencesRes || [];

  return {
    guestExperiences: Array.isArray(rawData) ? rawData : [],
    sectionHeader: Array.isArray(headerRes?.data)
      ? headerRes.data[0] || null
      : headerRes?.data || null,
    ratingHeader: Array.isArray(ratingRes?.data)
      ? ratingRes.data[0] || null
      : ratingRes?.data || null,
  };
};

const normalizeGlobal = (locationsRes, presenceRes) => {
  const locationsRaw = Array.isArray(locationsRes?.data) ? locationsRes.data : [];
  const locations = locationsRaw
    .filter((location) => location.isActive)
    .map((location) => ({
      state: location.state,
      city: location.locationName,
    }));

  return {
    locations,
    sectionData: presenceRes?.data || null,
  };
};

export const fetchHomePageData = async () => {
  const [
    heroRes,
    offersRes,
    propertiesRes,
    aboutRes,
    businessRes,
    eventsRes,
    newsRes,
    storyExperiencesRes,
    storyHeaderRes,
    storyRatingRes,
    locationsRes,
    presenceRes,
  ] = await Promise.all([
    fetchSafe(() => getHeroSectionsPaginated({ page: 0, size: 100 }), null),
    fetchSafe(() => getDailyOffers({ targetType: "GLOBAL", page: 0, size: 100 }), null),
    fetchSafe(() => GetAllPropertyDetails(), null),
    fetchSafe(() => getAboutUsAdmin(), null),
    fetchSafe(() => getKennediaGroup(), null),
    fetchSafe(() => getEventsUpdated(), null),
    fetchSafe(() => getAllNews({ category: "", page: 0, size: 10 }), null),
    fetchSafe(() => getGuestExperienceSection({ size: 20 }), null),
    fetchSafe(() => getGuestExperienceSectionHeader(), null),
    fetchSafe(() => getGuestExperineceRatingHeader(), null),
    fetchSafe(() => getAllLocations(), null),
    fetchSafe(() => getOurPresenceSection(), null),
  ]);

  const aboutData = aboutRes
    ? await normalizeAbout(aboutRes)
    : defaultHomePageData.aboutData;

  const businessPayload = businessRes?.divisions ? businessRes : businessRes?.data;
  const businessData =
    businessPayload && Array.isArray(businessPayload.divisions)
      ? {
          ...businessPayload,
          divisions: businessPayload.divisions
            .filter((div) => !!(div.title?.trim() && (div.icon?.trim() || div.icons?.url)))
            .slice(0, 5),
        }
      : null;

  return {
    heroData: heroRes ? normalizeHero(heroRes) : [],
    dailyOffers: offersRes ? normalizeOffers(offersRes) : [],
    properties: propertiesRes ? normalizeProperties(propertiesRes) : [],
    aboutData,
    businessData,
    eventsData: eventsRes ? normalizeEvents(eventsRes) : [],
    newsData: newsRes ? normalizeNews(newsRes) : [],
    storyData: normalizeStory(
      storyExperiencesRes,
      storyHeaderRes,
      storyRatingRes,
    ),
    globalData: normalizeGlobal(locationsRes, presenceRes),
  };
};
