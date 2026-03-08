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
  return Array.isArray(pageData?.content) ? pageData.content : [];
};

const normalizeOffers = (response) => {
  const rawData = response?.data?.data || response?.data || [];
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
    .filter((o) => {
      const notExpired =
        !o.expiresAt || new Date(o.expiresAt).getTime() > now;

      const isDayActive =
        !Array.isArray(o.activeDays) ||
        o.activeDays.length === 0 ||
        o.activeDays.includes(todayName);

      return (
        o.isActive &&
        notExpired &&
        o.showOnHomepage === true &&
        isDayActive
      );
    })
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

const normalizeProperties = (response) => {
  const rawData = response?.data?.data || response?.data || [];
  if (!Array.isArray(rawData)) return [];

  const formatted = rawData.flatMap((item) => {
    const parent = item.propertyResponseDTO;
    const listings = item.propertyListingResponseDTOS || [];

    if (!parent || parent.isActive !== true) return [];

    return listings.filter((l) => l.isActive === true).map((l) => ({
      id: l.id,
      propertyId: parent?.id,
      listingId: l.id,
      propertyName: parent?.propertyName || "Unnamed Property",
      propertyType: l.propertyType || parent?.propertyTypes?.[0] || "Property",
      city: parent?.locationName,
      mainHeading: l.mainHeading || "",
      subTitle: l.subTitle || "",
      fullAddress: l.fullAddress || parent?.address,
      tagline: l.tagline || "",
      rating: l.rating ?? 0,
      capacity: l.capacity ?? 0,
      price: l.price ?? 0,
      gstPercentage: l.gstPercentage ?? 0,
      discountAmount: l.discountAmount ?? 0,
      amenities: l.amenities || [],
      isActive: true,
      media: l.media || [],
      bookingEngineUrl: parent?.bookingEngineUrl || null,
    }));
  });

  return [...formatted].reverse();
};

const normalizeAbout = async (response) => {
  const data = response?.data || response;
  if (!Array.isArray(data)) return defaultHomePageData.aboutData;

  const homepageOnly = data.filter(
    (item) => item.propertyTypeId == null && item.isActive,
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

  const now = Date.now();

  return rawEvents
    .filter((event) => {
      const eventTime = new Date(event.eventDate).getTime();
      return event.active === true && eventTime >= now;
    })
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() -
        new Date(a.eventDate).getTime(),
    );
};

const normalizeNews = (response) => {
  const data = response?.data?.content || response?.content || [];
  if (!Array.isArray(data)) return [];
  return [...data]
    .sort((a, b) => new Date(b.dateBadge).getTime() - new Date(a.dateBadge).getTime())
    .slice(0, 6);
};

const normalizeStory = (experiencesRes, headerRes, ratingRes) => {
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
    fetchSafe(() => getDailyOffers({ page: 0, size: 100 }), null),
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
          .filter((div) => !!(div.title?.trim() && div.icon?.trim()))
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
    storyData: normalizeStory(storyExperiencesRes, storyHeaderRes, storyRatingRes),
    globalData: normalizeGlobal(locationsRes, presenceRes),
  };
};
