import {
  GetAllPropertyDetails,
  getAllBookingChannelPartners,
  getAllDiningByPropertyId,
  getAllGoogleTags,
  getAllMetaData,
  getAllPropertyPolicies,
  getGalleryByPropertyId,
  searchGallery,
  getRoomsByPropertyId,
} from "@/Api/Api";
import { createCitySlug, createHotelSlug } from "@/lib/HotelSlug";
import { getAllVerticalCards, getMenuItems } from "@/Api/RestaurantApi";

const VERIFIED_REVIEWS_SCALE = 1000000;

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

const parseCombinedRatingMeta = (value) => {
  if (value === null || value === undefined || value === "") {
    return { rating: null, verifiedReviews: null };
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return { rating: null, verifiedReviews: null };
  }

  const rating = Math.floor((numericValue + 0.0000001) * 10) / 10;
  const verifiedReviews = Math.round(
    (numericValue - rating) * VERIFIED_REVIEWS_SCALE,
  );

  return {
    rating: Number.isNaN(rating) ? null : rating,
    verifiedReviews:
      Number.isNaN(verifiedReviews) || verifiedReviews <= 0
        ? null
        : verifiedReviews,
  };
};

const normalizeDiningList = (response) => {
  const data = response?.data?.data || response?.data || response || [];
  return Array.isArray(data) ? data : [];
};

const normalizeGalleryMedia = (galleryResponse) => {
  const rawGallery =
    galleryResponse?.data?.content ||
    galleryResponse?.data ||
    galleryResponse ||
    [];

  return (Array.isArray(rawGallery) ? rawGallery : [])
    .filter(
      (item) =>
        item?.isActive &&
        item?.media?.url &&
        !item?.vertical &&
        String(item?.categoryName || "").toLowerCase() !== "3d",
    )
    .map((item) => item.media)
    .filter((media) => Boolean(media?.url));
};

const mapDiningItem = (item) => ({
  id: item?.id ?? `dining-${item?.attachRestaurantId ?? "item"}`,
  name: item?.part1 || "",
  cuisine: item?.attachRestaurantName || item?.part2 || "",
  timings: item?.time || "",
  image: item?.image?.url || undefined,
  description: item?.part2 || "",
  attachedRestaurantName: item?.attachRestaurantName || "",
  attachRestaurantId: item?.attachRestaurantId ?? undefined,
});

const buildRestaurantPathMap = (rawData) => {
  return (Array.isArray(rawData) ? rawData : []).reduce((acc, item) => {
    const parent = item?.propertyResponseDTO;
    const listings = item?.propertyListingResponseDTOS || [];
    const listing =
      listings.find((entry) => entry?.isActive) || listings[0] || null;
    const typeName = String(
      listing?.propertyType || parent?.propertyTypes?.[0] || "",
    )
      .trim()
      .toLowerCase();

    if (!parent?.id || !["restaurant", "resturant"].includes(typeName)) {
      return acc;
    }

    const cityName =
      listing?.city || parent?.locationName || parent?.city || "restaurant";
    const propertyName =
      listing?.propertyName?.trim() ||
      listing?.mainHeading ||
      parent?.propertyName ||
      "restaurant";

    acc[String(parent.id)] =
      `/${createCitySlug(cityName)}/${createHotelSlug(propertyName, parent.id)}`;

    return acc;
  }, {});
};

const generateSlug = (name) => name?.toLowerCase().trim().replace(/\s+/g, "-");

const CARD_BG_COLORS = [
  { bgColor: "bg-orange-50", hoverBg: "hover:bg-orange-100" },
  { bgColor: "bg-blue-50", hoverBg: "hover:bg-blue-100" },
  { bgColor: "bg-red-50", hoverBg: "hover:bg-red-100" },
  { bgColor: "bg-emerald-50", hoverBg: "hover:bg-emerald-100" },
];

const flattenPropertyDetails = (rawData) =>
  (Array.isArray(rawData) ? rawData : []).flatMap((item) => {
    const parent = item?.propertyResponseDTO;
    const listings = item?.propertyListingResponseDTOS || [];

    return listings.length === 0
      ? [{ parent, listing: null }]
      : listings.map((listing) => ({ parent, listing }));
  });

const findPropertyById = (rawData, propertyId) => {
  return flattenPropertyDetails(rawData).find(
    (entry) =>
      Number(entry?.parent?.id) === Number(propertyId) &&
      (entry?.listing?.isActive === true || entry?.listing == null),
  );
};

const selectSeoRecord = (list, propertyId) =>
  (Array.isArray(list) ? list : [])
    .filter((item) => {
      const isActive = Boolean(item?.active ?? item?.status);
      return (
        isActive &&
        String(item?.propertyId ?? "") === String(propertyId ?? "")
      );
    })
    .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null;

const selectGlobalGoogleTag = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((item) => Boolean(item?.active ?? item?.status))
    .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null;

const fetchSeoForProperty = async (propertyId) => {
  try {
    const [metaRes, googleRes] = await Promise.all([
      getAllMetaData().catch(() => null),
      getAllGoogleTags().catch(() => null),
    ]);

    const metaList = metaRes?.data || metaRes || [];
    const googleList = googleRes?.data || googleRes || [];

    return {
      metaTag: selectSeoRecord(metaList, propertyId),
      googleTag: selectGlobalGoogleTag(googleList),
    };
  } catch {
    return { metaTag: null, googleTag: null };
  }
};

const isRestaurantType = (parent, listing) => {
  const parentTypes = parent?.propertyTypes || [];
  const listingTypes = [listing?.propertyType].filter(Boolean);

  return [...parentTypes, ...listingTypes]
    .map((value) => String(value).toLowerCase().trim())
    .some((value) =>
      [
        "restaurant",
        "resturant",
        "cafe",
        "wine & dine",
        "winedine",
        "dining",
      ].includes(value),
    );
};

const mapRooms = (response) => {
  const rawRooms = response?.data || response || [];

  return Array.isArray(rawRooms)
    ? rawRooms.map((room) => {
        const originalBasePrice = Number(room.basePrice ?? room.price ?? 0);
        const discountPercentage = Number(room.discount ?? 0);
        const discountedPrice =
          originalBasePrice > 0
            ? Math.max(
                0,
                originalBasePrice -
                  (originalBasePrice * discountPercentage) / 100,
              )
            : 0;
        const resolvedDiscountPercent =
          originalBasePrice > 0 && discountPercentage > 0
            ? Math.round(discountPercentage)
            : 0;

        return {
          id: String(room.roomId),
          name: room.roomName || room.roomNumber,
          type: room.roomTypeName || room.roomType,
          description: room.description || "",
          basePrice: discountedPrice,
          originalPrice: originalBasePrice > 0 ? originalBasePrice : null,
          strikePrice: originalBasePrice > 0 ? originalBasePrice : null,
          discount: discountPercentage > 0 ? discountPercentage : null,
          discountPercent:
            resolvedDiscountPercent > 0 ? resolvedDiscountPercent : null,
          maxOccupancy: room.maxOccupancy || 1,
          roomSize: room.roomSize ?? null,
          roomSizeUnit: room.roomSizeUnit || "SQ_FT",
          isAvailable: room.status === "AVAILABLE",
          amenities: room.amenitiesAndFeatures || [],
          highlightedAmenities:
            room.amenitiesAndFeatures?.filter((amenity) =>
              Boolean(amenity.showHighlight),
            ) || [],
          image: {
            src:
              room.media?.find((item) => item.type === "IMAGE")?.url ||
              room.media?.[0]?.url ||
              "/images/room-placeholder.jpg",
            alt: room.roomName,
          },
        };
      })
    : [];
};

const mapHotelGallery = (response) => {
  const raw = response?.data?.content || response?.data || response || [];

  return (Array.isArray(raw) ? raw : [])
    .filter((item) => item?.isActive && item?.media?.url)
    .sort((a, b) => {
      const orderA = a?.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b?.displayOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
};

const mapPolicies = (response, propertyId) => {
  const data = response?.data || response || [];
  return Array.isArray(data)
    ? data.find((item) => Number(item?.propertyId) === Number(propertyId)) || null
    : data || null;
};

const mapBookingPartners = (response, propertyId) => {
  const raw = response?.data || response || [];
  const list = Array.isArray(raw) ? raw : raw?.content || [];

  return list.filter(
    (item) =>
      String(item?.propertyId || "") === String(propertyId) &&
      item?.isActive !== false,
  );
};

const mapRestaurantPageData = async (parent, listing) => {
  const galleryRes = await getGalleryByPropertyId(parent.id);
  const rawGallery =
    galleryRes?.data?.content || galleryRes?.data || galleryRes || [];
  const galleryData = (Array.isArray(rawGallery) ? rawGallery : []).filter(
    (item) =>
      item?.isActive &&
      item?.media?.url &&
      !item?.vertical &&
      String(item?.categoryName || "").toLowerCase() !== "3d",
  );

  return {
    propertyData: {
      ...parent,
      ...listing,
      id: parent.id,
      propertyId: parent.id,
      name: listing?.propertyName?.trim() || parent?.propertyName,
      description: listing?.mainHeading || "",
      location: listing?.fullAddress || parent?.address,
      city: listing?.city || parent?.locationName,
      media:
        listing?.media?.length > 0 ? listing.media : parent?.media || [],
      coordinates:
        parent?.latitude && parent?.longitude
          ? {
              lat: Number(parent.latitude),
              lng: Number(parent.longitude),
            }
          : null,
    },
    galleryData,
  };
};

const mapHotelPageData = async (parent, listing, rawData) => {
  const coords =
    parent?.latitude && parent?.longitude
      ? { lat: Number(parent.latitude), lng: Number(parent.longitude) }
      : null;
  const displayName = listing?.propertyName?.trim()
    ? listing.propertyName
    : listing?.mainHeading || parent?.propertyName;
  const ratingMeta = parseCombinedRatingMeta(listing?.rating);

  const [roomsRes, galleryRes, diningRes, bookingPartnersRes, policiesRes] =
    await Promise.all([
      getRoomsByPropertyId(parent.id).catch(() => null),
      getGalleryByPropertyId(parent.id).catch(() => null),
      getAllDiningByPropertyId(parent.id).catch(() => null),
      getAllBookingChannelPartners().catch(() => null),
      getAllPropertyPolicies(parent.id).catch(() => null),
    ]);

  const policies = mapPolicies(policiesRes, parent.id);
  const rooms = mapRooms(roomsRes);
  const galleryData = mapHotelGallery(galleryRes);
  const bookingPartners = mapBookingPartners(bookingPartnersRes, parent.id);
  const restaurantPaths = buildRestaurantPathMap(rawData);

  const diningItems = await Promise.all(
    normalizeDiningList(diningRes)
      .filter((item) => item?.isActive ?? true)
      .map(async (item) => {
        const mappedItem = mapDiningItem(item);
        const ownSlides = mappedItem.image
          ? [
              {
                mediaId: null,
                type: "IMAGE",
                url: mappedItem.image,
                fileName: null,
                alt: mappedItem.name || null,
                width: null,
                height: null,
              },
            ]
          : [];

        if (!mappedItem.attachRestaurantId) {
          return { ...mappedItem, mediaSlides: ownSlides };
        }

        try {
          const restaurantGalleryRes = await getGalleryByPropertyId(
            Number(mappedItem.attachRestaurantId),
          );
          const restaurantGallerySlides =
            normalizeGalleryMedia(restaurantGalleryRes);

          return {
            ...mappedItem,
            mediaSlides:
              restaurantGallerySlides.length > 0
                ? restaurantGallerySlides
                : ownSlides,
          };
        } catch {
          return { ...mappedItem, mediaSlides: ownSlides };
        }
      }),
  );

  return {
    hotel: {
      id: listing?.id || parent.id,
      propertyId: parent.id,
      locationId: parent.locationId,
      name: displayName,
      addressUrl: parent.addressUrl || null,
      location: listing?.fullAddress || parent.address,
      city: parent.locationName,
      type: listing?.propertyType || parent?.propertyTypes?.[0] || "Property",
      description: listing?.mainHeading || "",
      tagline: listing?.tagline || "",
      rating: ratingMeta.rating,
      verifiedReviews: ratingMeta.verifiedReviews,
      price: `Rs.${(listing?.price || 0).toLocaleString()}`,
      media: listing?.media || [],
      coordinates: coords,
      amenities: (listing?.amenities || [])
        .map((amenity) => getAmenityName(amenity))
        .filter(Boolean),
      bookingEngineUrl: parent.bookingEngineUrl || null,
      checkIn: policies?.checkInTime || "2:00 PM",
      checkOut: policies?.checkOutTime || "11:00 AM",
      image: { src: listing?.media?.[0]?.url || "", alt: displayName },
      nearbyPlaces:
        parent?.nearbyLocations?.length > 0
          ? parent.nearbyLocations.map((item) => ({
              name: item.nearbyLocationName,
              googleMapLink: item.googleMapLink,
            }))
          : [],
    },
    rooms,
    galleryData,
    diningItems,
    bookingPartners,
    policies,
    restaurantPaths,
    selectedRoomId: rooms.find((room) => room.isAvailable)?.id || null,
  };
};

export async function fetchPropertyDetailPageData(pathname) {
  const match = pathname.match(/^\/([^/]+)\/([^/]+-\d+)\/?$/);
  if (!match) return null;

  const propertySlug = match[2];
  const slugTail = propertySlug.split("-").pop() || "";
  const propertyId = Number(slugTail);

  if (!propertyId) return null;

  const response = await GetAllPropertyDetails();
  const rawData = response?.data || response || [];
  const matched = findPropertyById(rawData, propertyId);

  if (!matched) {
    return {
      propertyId,
      propertyType: "not-found",
      pageData: null,
    };
  }

  const { parent, listing } = matched;
  const propertyType = isRestaurantType(parent, listing)
    ? "restaurant"
    : "hotel";
  const seo = await fetchSeoForProperty(parent.id);

  const pageData =
    propertyType === "restaurant"
      ? await mapRestaurantPageData(parent, listing)
      : await mapHotelPageData(parent, listing, rawData);

  return {
    propertyId: parent.id,
    propertyType,
    pageData,
    seo,
  };
}

export async function fetchPropertyCategoryPageData(pathname) {
  const match = pathname.match(/^\/([^/]+)\/([^/]+-\d+)\/([^/]+)\/?$/);
  if (!match) return null;

  const [, paramCitySlug, routePropertySlug, categoryType] = match;
  const slugTail = routePropertySlug.split("-").pop() || "";
  const propertyId = Number(slugTail);

  if (!propertyId) return null;

  const propertyRes = await GetAllPropertyDetails();
  const rawData = propertyRes?.data || propertyRes || [];
  const matchedProperty = findPropertyById(rawData, propertyId);

  if (!matchedProperty) {
    return {
      propertyId,
      categoryType,
      pageData: {
        propertyData: null,
        currentCategory: null,
        otherVerticals: [],
        apiMenuItems: [],
        galleryData: [],
        loading: false,
        notFound: true,
        citySlug: paramCitySlug || "hotel",
      },
    };
  }

  const { parent, listing } = matchedProperty;
  const propertyData = {
    ...parent,
    ...listing,
    id: parent.id,
    propertyId: parent.id,
    name: listing?.propertyName?.trim() || parent.propertyName,
    description: listing?.mainHeading || "",
    location: listing?.fullAddress || parent.address,
    city: listing?.city || parent.locationName,
    media: listing?.media?.length > 0 ? listing.media : parent.media || [],
  };
  const citySlug = createCitySlug(
    propertyData.city || propertyData.locationName || propertyData.propertyName,
  );

  const cardsRes = await getAllVerticalCards();
  const cards = cardsRes?.data || cardsRes || [];
  const filtered = cards
    .filter(
      (card) => String(card.propertyId) === String(propertyId) && card.isActive,
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const mappedVerticals = filtered.map((card, index) => {
    const slug = generateSlug(card.verticalName);
    const fallback = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

    return {
      slug,
      id: card.id,
      title: card.verticalName || card.itemName,
      description: card.description || "",
      image: card.media?.url || "",
      link: card.link || "",
      ctaButtonText: card.showOrderButton ? card.extraText || "" : null,
      lightBgColor: card.cardBackgroundColor || null,
      bgColor: fallback.bgColor,
      hoverBg: fallback.hoverBg,
      isHexColor: !!card.cardBackgroundColor,
      heroImage: card.media?.url || "",
      themeColor: card.cardBackgroundColor || null,
    };
  });

  const normalizedSlug = categoryType?.toLowerCase().trim();
  const currentCategory =
    mappedVerticals.find((item) => item.slug === normalizedSlug) || null;
  const otherVerticals = mappedVerticals.filter(
    (item) => item.slug !== normalizedSlug,
  );

  const menuRes = await getMenuItems();
  const allItems = menuRes?.data || menuRes || [];
  const apiMenuItems = allItems.filter(
    (item) =>
      String(item.propertyId) === String(propertyId) && item.status !== false,
  );

  let galleryData = [];
  if (currentCategory) {
    const galleryRes = await searchGallery({
      propertyId,
      verticalId: currentCategory.id,
    }).catch(() => null);

    const rawGallery =
      galleryRes?.data?.content || galleryRes?.data || galleryRes || [];

    galleryData = (Array.isArray(rawGallery) ? rawGallery : [])
      .filter((item) => item.isActive && item.media?.url)
      .map((item) => ({
        id: item.id,
        media: {
          mediaId: item.media.mediaId,
          url: item.media.url,
          type: item.media.type ?? "IMAGE",
          fileName: item.media.fileName ?? "",
          alt: item.media.alt ?? "",
        },
        isActive: item.isActive,
        categoryName: item.categoryName ?? null,
        displayOrder: item.displayOrder ?? 999,
      }));
  }

  return {
    propertyId,
    categoryType,
    pageData: {
      propertyData,
      currentCategory,
      otherVerticals,
      apiMenuItems,
      galleryData,
      loading: false,
      notFound: !currentCategory,
      citySlug,
    },
  };
}
