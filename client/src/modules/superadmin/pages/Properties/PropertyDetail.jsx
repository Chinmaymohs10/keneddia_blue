import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import {
  BuildingOffice2Icon,
  MapPinIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";
import {
  getRoomsByPropertyId,
  getAllGalleries,
  getAllPropertyPolicies,
} from "@/Api/Api";

// Import Tabs
import OverviewTab from "./tabs/OverviewTab";
import RoomsTab from "./tabs/RoomsTab";
import AmenitiesTab from "./tabs/AmenitiesTab";
import GalleryTab from "./tabs/GalleryTab";
import EventsTab from "./tabs/EventsTab";
import PricingTab from "./tabs/PricingTab";
import PoliciesTab from "./tabs/PoliciesTab";
import MenuTab from "./tabs/MenuTab";
import TablesTab from "./tabs/TablesTab";

// Import Modals
import AddEditOverviewModal from "./modals/AddEditOverviewModal";
import AddRoomModal from "./modals/AddRoomModal";
import AddAmenityModal from "./modals/AddAmenityModal";
import AddMediaModal from "./modals/AddMediaModal";
import AddEventModal from "./modals/AddEventModal";
import AddPricingModal from "./modals/AddPricingModal";
import EditPoliciesModal from "./modals/EditPoliciesModal";
import AddMenuItemModal from "./modals/AddMenuItemModal";
import AddTableModal from "./modals/AddTableModal";

const PropertyDetail = ({ property, onBack }) => {
  // Use 'id' from your JSON payload
  const propId = property?.id;

  const [data, setData] = useState({
    overview: {
      ...property,
      propertyName: property.propertyName || "Unnamed Property",
      city: property.locationName || "N/A",
      propertyType: property.propertyTypes?.[0] || "Hotel",
    },
    rooms: [],
    amenities: [],
    gallery: [],
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
    event: false,
    pricing: false,
    policy: false,
    menu: false,
    table: false,
  });

  const [selectedItem, setSelectedItem] = useState(null);

  // Unified Fetch function
  const fetchAllData = useCallback(async () => {
    if (!propId) return;

    setIsSyncing(true);
    try {
      console.log("🚀 Syncing detailed data for property:", propId);
      const [roomsRes, galleryRes, policiesRes] = await Promise.all([
        getRoomsByPropertyId(propId),
        getAllGalleries(propId),
        getAllPropertyPolicies(propId),
      ]);

      setData((prev) => ({
        ...prev,
        rooms: Array.isArray(roomsRes) ? roomsRes : [],
        gallery:
          galleryRes?.content || (Array.isArray(galleryRes) ? galleryRes : []),
        policies: policiesRes || {},
      }));
    } catch (error) {
      console.error("Sync Error:", error);
      showError("Failed to sync some property details");
    } finally {
      setIsSyncing(false);
    }
  }, [propId]);

  // Effect to trigger fetch when ID changes
  useEffect(() => {
    if (propId) {
      fetchAllData();
    }
  }, [propId, fetchAllData]);

  // Reset tab if property changes
  useEffect(() => {
    setActiveTab("overview");
  }, [propId]);

  const toggleModal = (modalName, isOpen, item = null) => {
    setSelectedItem(item);
    setModals((prev) => ({ ...prev, [modalName]: isOpen }));
  };

  const updateData = (section, newData, isEdit = false, id = null) => {
    setData((prev) => {
      if (section === "overview" || section === "policies") {
        return { ...prev, [section]: { ...prev[section], ...newData } };
      }
      const list = prev[section];
      if (isEdit && id) {
        return {
          ...prev,
          [section]: list.map((item) =>
            item.id === id ? { ...item, ...newData } : item,
          ),
        };
      }
      return {
        ...prev,
        [section]: [...list, { ...newData, id: `new_${Date.now()}` }],
      };
    });
  };

  const propertyType = data.overview.propertyType;
  const tabsByPropertyType = {
    Hotel: [
      "overview",
      "rooms",
      "amenities",
      "gallery",
      "events",
      "pricing",
      "policies",
    ],
    Cafe: ["overview", "menu", "tables", "gallery"],
    Restaurant: ["overview", "menu", "gallery", "events"],
  };

  const currentTabs =
    tabsByPropertyType[propertyType] || tabsByPropertyType["Hotel"];

  const getModalNameForTab = (tab) => {
    const map = {
      rooms: "room",
      amenities: "amenity",
      gallery: "media",
      events: "event",
      pricing: "pricing",
      menu: "menu",
      tables: "table",
    };
    return map[tab];
  };

  const renderTabContent = () => {
    const commonProps = {
      propertyData: property,
      data: data[activeTab],
      onEdit: (item) => toggleModal(getModalNameForTab(activeTab), true, item),
      onAdd: () => toggleModal(getModalNameForTab(activeTab), true),
      onDelete: (id) => console.log("Delete", id),
      refreshData: fetchAllData, // Pass refresh capability to tabs
    };

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            data={data.overview}
            propertyData={property}
            onEdit={() => toggleModal("overview", true, data.overview)}
          />
        );
      case "rooms":
        return <RoomsTab {...commonProps} />;
      case "amenities":
        return <AmenitiesTab {...commonProps} />;
      case "gallery":
        return <GalleryTab {...commonProps} />;
      case "events":
        return <EventsTab {...commonProps} />;
      case "pricing":
        return <PricingTab {...commonProps} />;
      case "policies":
        return (
          <PoliciesTab
            data={data.policies}
            propertyData={property}
            onEdit={() => toggleModal("policy", true, data.policies)}
          />
        );
      case "menu":
        return <MenuTab {...commonProps} />;
      case "tables":
        return <TablesTab {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - Fixed height */}
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
                {data.overview.isActive ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )}
                {data.overview.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-6 pt-6 flex-shrink-0">
          {/* Tabs - Horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto border-b pb-1 flex-nowrap scrollbar-hide">
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

        {/* Content Area - This is where scrolling happens */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto px-6 py-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain the same */}
      <AddEditOverviewModal
        isOpen={modals.overview}
        onClose={() => toggleModal("overview", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddRoomModal
        isOpen={modals.room}
        onClose={() => toggleModal("room", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddAmenityModal
        isOpen={modals.amenity}
        onClose={() => toggleModal("amenity", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddMediaModal
        isOpen={modals.media}
        onClose={() => toggleModal("media", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddEventModal
        isOpen={modals.event}
        onClose={() => toggleModal("event", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddPricingModal
        isOpen={modals.pricing}
        onClose={() => toggleModal("pricing", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <EditPoliciesModal
        isOpen={modals.policy}
        onClose={() => toggleModal("policy", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddMenuItemModal
        isOpen={modals.menu}
        onClose={() => toggleModal("menu", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
      <AddTableModal
        isOpen={modals.table}
        onClose={() => toggleModal("table", false)}
        propertyData={property}
        initialData={selectedItem}
        onSave={fetchAllData}
      />
    </div>
  );
};

export default PropertyDetail;
