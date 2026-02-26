import API from "./Api";

// vertical headers
export const createVerticalSectionHeader = (data) =>API.post("api/v1/vertical-sections", data);
export const updateVerticalSectionHeader = (id, data) =>API.put(`api/v1/vertical-sections/${id}`, data);
export const getAllVerticalSectionsHeader = () =>API.get("api/v1/vertical-sections/showAll");
export const getVerticalSectionHeaderById = (id) =>API.get(`api/v1/vertical-sections/${id}`);
export const toggleVerticalSectionHeaderStatus = (id, active) =>API.patch(`api/v1/vertical-sections/${id}/status`, null, {params: { active },});

//vertical cards
export const createVerticalCard = (data) =>API.post("api/v1/vertical-cards", data);
export const updateVerticalCard = (id, data) =>API.put(`api/v1/vertical-cards/${id}`, data);
export const getAllVerticalCards = () =>API.get("api/v1/vertical-cards/showAll");
export const getVerticalCardById = (id) =>API.get(`api/v1/vertical-cards/${id}`);
export const toggleVerticalCardStatus = (id, active) =>API.patch(`api/v1/vertical-cards/${id}/status`, null, {params: { active },});

// buffet section headers
export const createBuffetSectionHeader = (data) =>API.post("api/v1/buffet-section-headers", data);
export const updateBuffetSectionHeader = (id, data) =>API.put(`api/v1/buffet-section-headers/${id}`, data);
export const getAllBuffetSectionHeaders = () =>API.get("api/v1/buffet-section-headers/showAll");
export const getBuffetSectionHeaderById = (id) =>API.get(`api/v1/buffet-section-headers/${id}`);
export const toggleBuffetSectionHeaderStatus = (id, active) =>API.patch(`api/v1/buffet-section-headers/${id}/status`, null, {params: { active },});

// buffet items
export const createBuffetItem = (data) =>API.post("api/v1/buffet-items", data);
export const updateBuffetItem = (id, data) =>API.put(`api/v1/buffet-items/${id}`, data);
export const getAllBuffetItems = () =>API.get("api/v1/buffet-items");
export const getBuffetItemById = (id) =>API.get(`api/v1/buffet-items/${id}`);
export const toggleBuffetItemStatus = (id, active) =>API.patch(`api/v1/buffet-items/${id}/status`, null, {params: { active },});

// restaurant offer header section
export const createOfferHeader = (data) =>API.post("api/v1/offer-sections/createOffer", data);
export const getOfferHeaderById = (id) =>API.get(`api/v1/offer-sections/getOfferById/${id}`);
export const updateOfferHeader = (id, data) =>API.patch(`api/v1/offer-sections/updateOffer/${id}`, data);
export const toggleOfferHeaderActive = (id, data) =>API.patch(`api/v1/offer-sections/toggleActive/${id}`, data);

// restaurant about us content
export const updateRestaurantAbout = (id, data) =>API.put(`api/v1/restaurant-about/${id}`, data);
export const getAllRestaurantAbout = () =>API.get("api/v1/restaurant-about/showAll");
export const getRestaurantAboutById = (id) =>API.get(`api/v1/restaurant-about/${id}`);
export const toggleRestaurantAboutStatus = (id, active) =>API.patch(`api/v1/restaurant-about/${id}/status`, null, {params: { active },});

// global social platforms
export const createSocialPlatform = (data) =>API.post("api/v1/social-platform/create", data);
export const getAllSocialPlatforms = () =>API.get("api/v1/social-platform/all");
export const getSocialPlatformById = (id) =>API.get(`api/v1/social-platform/${id}`);
export const updateSocialPlatform = (id, data) =>API.put(`api/v1/social-platform/${id}`, data);
export const toggleSocialPlatformStatus = (id, active) =>API.patch(`api/v1/social-platform/${id}/status`, null, {params: { active },});

// restaurant image & social content
export const createRestaurantImageSocial = (data) =>API.post("api/v1/restaurant/image-social", data);
export const getRestaurantImageSocialByProperty = (propertyId) =>API.get(`api/v1/restaurant/image-social/property/${propertyId}`);
export const updateRestaurantImageSocial = (propertyId, data) =>API.put(`api/v1/restaurant/image-social/property/${propertyId}`, data);
export const toggleRestaurantImageSocialStatus = (propertyId, active) =>API.patch(`api/v1/restaurant/image-social/property/${propertyId}/status`,null,{ params: { active } });

// attach social media links to restaurant/property
export const addRestaurantSocialLink = (propertyId, data) =>API.post(`api/v1/restaurant/social-link`, data, {params: { propertyId },});
export const getRestaurantSocialLinksByProperty = (propertyId) =>API.get(`api/v1/restaurant/social-link/property/${propertyId}`);
export const updateRestaurantSocialLink = (id, data) =>API.put(`api/v1/restaurant/social-link/${id}`, data);
export const toggleRestaurantSocialLinkStatus = (id, active) =>API.patch(`api/v1/restaurant/social-link/${id}/status`,null,{ params: { active } });

// restaurant about us - connect section

export const createRestaurantConnect = (data) =>API.post("api/v1/restaurant/connect", data);
export const getRestaurantConnectByProperty = (propertyId) =>API.get(`api/v1/restaurant/connect/property/${propertyId}`);
export const updateRestaurantConnect = (id, data) =>API.put(`api/v1/restaurant/connect/${id}`, data);

// dynamic dropdown gallery (gallery categories)

export const createGalleryDropdown = (data) =>API.post("api/v1/dynamic-dropdown-gallery/create", data);
export const getAllGalleryDropdown = () =>API.get("api/v1/dynamic-dropdown-gallery/all");
export const getGalleryDropdownById = (id) =>API.get(`api/v1/dynamic-dropdown-gallery/${id}`);
export const updateGalleryDropdown = (id, data) =>API.put(`api/v1/dynamic-dropdown-gallery/${id}`, data);
export const toggleGalleryDropdownStatus = (id, isActive) =>API.patch(`api/v1/dynamic-dropdown-gallery/${id}/status`,null,{ params: { isActive } });

// ─────────────────────────────
// create menu item
// ─────────────────────────────

export const createMenuItem = (formData) =>API.post("api/v1/menu-items/createMenuItem", formData, {headers: {"Content-Type": "multipart/form-data",},});
export const getMenuItems = () =>API.get("api/v1/menu-items/getMenuItems");
export const getActiveMenuItems = () =>API.get("api/v1/menu-items/getActiveMenuItems");
export const getMenuItemById = (id) =>API.get(`api/v1/menu-items/getMenuItemById/${id}`);
export const updateMenuItem = (id, data) =>API.patch(`api/v1/menu-items/updateMenuItem/${id}`, data);
export const toggleMenuItemStatus = (id) =>API.patch(`api/v1/menu-items/toggleActive/${id}`);

// ─────────────────────────────
// ITEM CATEGORY
// ─────────────────────────────
export const createItemCategory = (data) =>API.post("api/v1/item-category/createItemCategory", data);
export const getAllActiveItemCategory = () =>API.get("api/v1/item-category/getAllActiveItemCategory");
export const getItemCategoryById = (id) =>API.get(`api/v1/item-category/getItemCategoryById/${id}`);
export const updateItemCategory = (id, data) =>API.patch(`api/v1/item-category/updateItemCategory/${id}`, data);
export const toggleItemCategoryStatus = (id, data) =>API.patch(`api/v1/item-category/toggleActive/${id}`, data);

// ─────────────────────────────
// ITEM TYPE
// ─────────────────────────────
export const createItemType = (data) =>API.post("api/v1/item-type/createItemType", data);
export const getAllItemTypes = () =>API.get("api/v1/item-type/getAllItemType");
export const getItemTypeById = (id) =>API.get(`api/v1/item-type/getItemTypeById/${id}`);
export const updateItemType = (id, data) =>API.patch(`api/v1/item-type/updateItemType/${id}`, data);
export const toggleItemTypeStatus = (id, data) =>API.patch(`api/v1/item-type/toggleActive/${id}`, data);

// ─────────────────────────────
// CHEF REMARKS
// ─────────────────────────────
export const createChefRemark = (formData, remarkParam) =>API.post("api/v1/chef-remarks/createChefRemark",formData,{params: { remark: remarkParam },headers: { "Content-Type": "multipart/form-data" },});
export const getChefRemarks = () =>API.get("api/v1/chef-remarks/getChefRemarks");
export const getChefRemarkById = (id) =>API.get(`api/v1/chef-remarks/getChefRemarkById/${id}`);
export const updateChefRemark = (id, data) =>API.patch(`api/v1/chef-remarks/updateChefRemark/${id}`, data);
export const toggleChefRemarkStatus = (id, data) =>API.patch(`api/v1/chef-remarks/toggleActive/${id}`, data);

// ─────────────────────────────
// MENU SECTION HEADERS (MENU SECTIONS)
// ─────────────────────────────
export const createMenuHeaderSection = (formData) =>API.post("api/v1/menu-sections/createMenu", formData, {headers: { "Content-Type": "multipart/form-data" },});
export const getMenuHeaders = () =>API.get("api/v1/menu-sections/getMenus");
export const getMenuHeadersById = (id) =>API.get(`api/v1/menu-sections/getMenuById/${id}`);
export const updateMenuHeadersSection = (id, data) =>API.patch(`api/v1/menu-sections/updateMenu/${id}`, data);
export const toggleMenuHeadersSectionStatus = (id, data) =>API.patch(`api/v1/menu-sections/toggleActive/${id}`, data);