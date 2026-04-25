import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import {
  BuildingOffice2Icon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { showError } from "@/lib/toasters/toastUtils";
import {
  getRoomsByPropertyId,
  getAllGalleries,
  getGalleryByPropertyId,
  getAllPropertyPolicies,
} from "@/Api/Api";

// Import Tabs
import OverviewTab from "./tabs/OverviewTab";
import RoomsTab from "./tabs/RoomsTab";
import AmenitiesTab from "./tabs/AmenitiesTab";
import GalleryTab from "./tabs/GalleryTab";
import PricingTab from "./tabs/PricingTab";
import PoliciesTab from "./tabs/PoliciesTab";
import FoodDiningTab from "./tabs/FoodDiningTab";
import BookingPartnersTab from "./tabs/BookingPartnersTab";
import ConfigTab from "./tabs/ConfigTab";

import ResturantVerticals from "./tabs/resturant/ResturantVerticals";
import EventsTab from "./tabs/resturant/EventsTab";
import MenuTab from "./tabs/resturant/MenuTab";
import TablesTab from "./tabs/TablesTab";
import BuffetSection from "./tabs/resturant/BuffetSection";
import ResturantOffers from "./tabs/resturant/ResturantOffers";
import ResturantAbout from "./tabs/resturant/ResturantAbout";
import GroupBookingSection from "./tabs/resturant/GroupBookingSection";
import Gallery3d from "./tabs/resturant/Gallery3d";
import EnquiriesTab from "./tabs/resturant/EnquiriesTab";
import CommentReviewsTab from "./tabs/CommentReviewsTab";
// Import Modals
import AddEditOverviewModal from "./modals/AddEditOverviewModal";
import AddRoomModal from "./modals/AddRoomModal";
import AddAmenityModal from "./modals/AddAmenityModal";
import AddMediaModal from "./modals/AddMediaModal";
import AddPricingModal from "./modals/AddPricingModal";
import EditPoliciesModal from "./modals/EditPoliciesModal";
import AddMenuItemModal from "./modals/AddMenuItemModal";
import AddTableModal from "./modals/AddTableModal";

const PropertyDetail = ({ property, onBack }) => {
  const normalizeProperty = (property) => {
    const base = property?.propertyResponseDTO ?? property;
    const listing = property?.propertyListingResponseDTOS?.[0] ?? {};

    return {
      id: base?.id,
      propertyName: base?.propertyName,
      propertyTypes: base?.propertyTypes ?? [],
      propertyTypeIds: base?.propertyTypeIds ?? [],
      propertyCategories: base?.propertyCategories ?? [],
      address: base?.address,
      area: base?.area,
      pincode: base?.pincode,
      locationId: base?.locationId,
      locationName: base?.locationName,
      latitude: base?.latitude,
      longitude: base?.longitude,
      assignedAdminId: base?.assignedAdminId,
      assignedAdminName: base?.assignedAdminName,
      parentPropertyId: base?.parentPropertyId,
      parentPropertyName: base?.parentPropertyName,
      childProperties: base?.childProperties ?? [],
      isActive: base?.isActive,
      // ---- Listing (flattened) ----
      propertyType: listing?.propertyType || base?.propertyTypes?.[0] || "",
      propertyTypeId: base?.propertyTypeIds?.[0] ?? null,
      city: listing?.city || base?.locationName,
      mainHeading: listing?.mainHeading,
      subTitle: listing?.subTitle,
      fullAddress: listing?.fullAddress || base?.address,
      tagline: listing?.tagline,
      rating: listing?.rating,
      capacity: listing?.capacity,
      price: listing?.price,
      gstPercentage: listing?.gstPercentage,
      discountAmount: listing?.discountAmount,
      amenities: listing?.amenities ?? [],
      media: listing?.media ?? [],
      listingId: listing?.id,
    };
  };

  // Normalize the base property data immediately
  const normalizedProperty = normalizeProperty(property);
  const propId = normalizedProperty?.id;

  const extractAmenitiesFromProperty = (property) => {
    const listings = property?.propertyListingResponseDTOS || [];

    if (!listings.length) return [];

    // Merge + dedupe amenities
    return Array.from(new Set(listings.flatMap((l) => l.amenities || [])));
  };

  const [data, setData] = useState({
    overview: {
      ...normalizedProperty,
      propertyName: normalizedProperty.propertyName || "Unnamed Property",
      city: normalizedProperty.city || "N/A",
      propertyType: normalizedProperty.propertyType,
    },
    rooms: [],
    amenities: normalizedProperty.amenities,
    gallery: normalizedProperty.media,
    events: [],
    pricing: [],
    policies: {},
    menu: [],
    tables: [],
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);
  const [modals, setModals] = useState({
    overview: false,
    room: false,
    amenity: false,
    media: false,
    pricing: false,
    policy: false,
    menu: false,
    table: false,
  });

  const [selectedItem, setSelectedItem] = useState(null);

  const fetchAllData = useCallback(async () => {
    if (!propId) return;

    setIsSyncing(true);

    try {
      const [roomsRes, galleryRes, policiesRes] = await Promise.all([
        getRoomsByPropertyId(propId),
        getGalleryByPropertyId(propId),
        getAllPropertyPolicies(propId),
      ]);

      setData((prev) => ({
        ...prev,
        rooms: Array.isArray(roomsRes) ? roomsRes : [],
        gallery:
          galleryRes?.data?.content ||
          galleryRes?.content ||
          galleryRes?.data ||
          (Array.isArray(galleryRes) ? galleryRes : []),
        policies: policiesRes || {},
        amenities: extractAmenitiesFromProperty(property),
      }));
    } catch (error) {
      console.error("Sync Error:", error);
      showError("Failed to sync some property details");
    } finally {
      setIsSyncing(false);
    }
  }, [propId]);

  useEffect(() => {
    if (!propId) return;

    fetchAllData();

    const normalized = normalizeProperty(property);

    setData((prev) => ({
      ...prev,
      overview: normalized,
      amenities: normalized.amenities,
      gallery: normalized.media,
    }));
  }, [propId, fetchAllData, property]);

  useEffect(() => {
    setActiveTab("overview");
  }, [propId]);

  const toggleModal = (modalName, isOpen, item = null) => {
    setSelectedItem(item);
    setModals((prev) => ({ ...prev, [modalName]: isOpen }));
  };

  const propertyType = data.overview.propertyType;
  // AFTER
  const tabsByPropertyType = {
    Hotel: [
      "overview",
      "config",
      "rooms",
      "amenities",
      "food&dining",
      "booking partners",
      "gallery",
      "policies",
      "comment reviews",
    ],
    Cafe: ["overview", "config", "menu", "gallery","offers section", "comment reviews","amenities","Header items","enquiries",],
    Restaurant: [
      "overview",
      "config",
      "gallery",
      "verticals",
      "buffet section",
      "amenities",
      "policies",
      "offers section",
      "menu",
      "about",
      // "events",
      // "group bookings",
      "Header items",
      "enquiries",
      // "comment reviews",
    ],
  };

  const currentTabs =
    tabsByPropertyType[propertyType] || tabsByPropertyType["Hotel"];

  const getModalNameForTab = (tab) => {
    const map = {
      rooms: "room",
      amenities: "amenity",
      gallery: "media",
      pricing: "pricing",
      menu: "menu",
      tables: "table",
    };
    return map[tab];
  };

  const renderTabContent = () => {
    // Current property state for all tabs to use
    const currentPropertyInfo = data.overview;

    const commonProps = {
      propertyData: currentPropertyInfo,
      data: data[activeTab],
      onEdit: (item) => toggleModal(getModalNameForTab(activeTab), true, item),
      onAdd: () => toggleModal(getModalNameForTab(activeTab), true),
      onDelete: (id) => console.log("Delete", id),
      refreshData: fetchAllData,
    };

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            data={currentPropertyInfo}
            propertyData={currentPropertyInfo}
            onEdit={() => toggleModal("overview", true, currentPropertyInfo)}
          />
        );
      case "config":
        return (
          <ConfigTab
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );
      case "rooms":
        return <RoomsTab {...commonProps} />;
      case "amenities":
        return <AmenitiesTab {...commonProps} />;
      case "food&dining":
        return (
          <FoodDiningTab
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );
      case "booking partners":
        return (
          <BookingPartnersTab
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );
      case "gallery":
        return (
          <GalleryTab {...commonProps} propertyData1={currentPropertyInfo} />
        );
      case "events":
        return (
          <EventsTab
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );
      case "pricing":
        return <PricingTab {...commonProps} />;
      case "policies":
        return (
          <PoliciesTab
            data={data.policies}
            propertyData={currentPropertyInfo}
            onEdit={() => toggleModal("policy", true, data.policies)}
          />
        );
      case "menu":
        return <MenuTab {...commonProps} />;
      case "tables":
        return <TablesTab {...commonProps} />;
      case "verticals":
        return (
          <ResturantVerticals
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );

      case "buffet section":
        return (
          <BuffetSection
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );

      case "offers section":
        return (
          <ResturantOffers
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );

      case "about":
        return (
          <ResturantAbout
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );

      case "group bookings":
        return (
          <GroupBookingSection
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );

      case "Header items":
        return (
          <Gallery3d
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
          // EnquiriesTab
        );
      case "enquiries":
        return (
          <EnquiriesTab
            propertyData={currentPropertyInfo}
            refreshData={fetchAllData}
          />
        );
      case "comment reviews":
        return (
          <CommentReviewsTab
            propertyData={currentPropertyInfo}
            propertyId={currentPropertyInfo?.id}
            refreshData={fetchAllData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navbar Section */}
      <div className="flex-shrink-0 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="w-6 h-6 rotate-180" />
          </button>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 relative">
            <BuildingOffice2Icon className="w-8 h-8" />
            {isSyncing && (
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {data.overview.propertyName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium uppercase">
                {propertyType}
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" /> {data.overview.city}
              </span>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${data.overview.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {data.overview.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Tab Switcher */}
        <div className="max-w-7xl w-full mx-auto px-6 pt-6 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto border-b pb-3 flex-nowrap">
            {currentTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "bg-white border-x border-t text-blue-600 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                style={
                  activeTab === tab
                    ? { color: colors.primary, borderColor: "#e5e7eb" }
                    : {}
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto px-6 py-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals - All receiving the latest data.overview */}
      <AddEditOverviewModal
        isOpen={modals.overview}
        onClose={() => toggleModal("overview", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddRoomModal
        isOpen={modals.room}
        onClose={() => toggleModal("room", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      {/* ... (Repeat for all other modals ensuring they use data.overview) */}
      <AddAmenityModal
        isOpen={modals.amenity}
        onClose={() => toggleModal("amenity", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddMediaModal
        isOpen={modals.media}
        onClose={() => toggleModal("media", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddPricingModal
        isOpen={modals.pricing}
        onClose={() => toggleModal("pricing", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <EditPoliciesModal
        isOpen={modals.policy}
        onClose={() => toggleModal("policy", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddMenuItemModal
        isOpen={modals.menu}
        onClose={() => toggleModal("menu", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddTableModal
        isOpen={modals.table}
        onClose={() => toggleModal("table", false)}
        propertyData={data.overview}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
    </div>
  );
};

export default PropertyDetail;
