import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import AddPropertyModal from "../../modals/AddPropertyModal";
import AddPropertyTypeModal from "../../modals/AddPropertyTypeModal";
import AddPropertyCategoryModal from "../../modals/AddPropertyCategoryModal";
import {
  getPropertyTypes,
  getAllProperties,
  getAllPropertyCategories,
} from "@/Api/Api";

import PropertyDetail from "./PropertyDetail";

// Static fallback data
const STATIC_PROPERTIES = [
  {
    id: 1,
    propertyName: "Grand Plaza Hotel",
    address: "123 Main Street",
    area: "Downtown",
    locationName: "New Delhi",
    pincode: "110001",
    propertyTypes: ["Hotel", "Restaurant"],
    propertyCategories: ["Luxury", "Business", "Premium"],
    assignedAdminName: "John Doe",
    assignedAdminId: "ADM001",
    parentPropertyName: null,
    parentPropertyId: null,
    isActive: true
  },
  {
    id: 2,
    propertyName: "Sunset Cafe",
    address: "456 Beach Road",
    area: "Seaside",
    locationName: "Mumbai",
    pincode: "400001",
    propertyTypes: ["Cafe"],
    propertyCategories: ["Casual Dining", "Outdoor Seating"],
    assignedAdminName: "Jane Smith",
    assignedAdminId: "ADM002",
    parentPropertyName: "Grand Plaza Hotel",
    parentPropertyId: 1,
    isActive: true
  },
  {
    id: 3,
    propertyName: "Royal Banquet Hall",
    address: "789 Garden Avenue",
    area: "Green Park",
    locationName: "Bangalore",
    pincode: "560001",
    propertyTypes: ["Banquet Hall"],
    propertyCategories: ["Events", "Weddings", "Corporate"],
    assignedAdminName: "Mike Johnson",
    assignedAdminId: "ADM003",
    parentPropertyName: null,
    parentPropertyId: null,
    isActive: true
  },
  {
    id: 4,
    propertyName: "Wellness Spa Resort",
    address: "321 Hill Road",
    area: "Mountain View",
    locationName: "Manali",
    pincode: "175131",
    propertyTypes: ["Hotel", "Spa"],
    propertyCategories: ["Wellness", "Luxury", "Resort"],
    assignedAdminName: "Sarah Williams",
    assignedAdminId: "ADM004",
    parentPropertyName: null,
    parentPropertyId: null,
    isActive: false
  },
  {
    id: 5,
    propertyName: "Downtown Bistro",
    address: "567 Central Plaza",
    area: "City Center",
    locationName: "Pune",
    pincode: "411001",
    propertyTypes: ["Restaurant"],
    propertyCategories: ["Fine Dining", "Italian Cuisine"],
    assignedAdminName: "Robert Brown",
    assignedAdminId: "ADM005",
    parentPropertyName: "Grand Plaza Hotel",
    parentPropertyId: 1,
    isActive: true
  },
  {
    id: 6,
    propertyName: "Luxury Apartments",
    address: "890 Skyline Drive",
    area: "Tech Park",
    locationName: "Hyderabad",
    pincode: "500001",
    propertyTypes: ["Apartment"],
    propertyCategories: ["Residential", "Luxury", "Furnished"],
    assignedAdminName: "Emily Davis",
    assignedAdminId: "ADM006",
    parentPropertyName: null,
    parentPropertyId: null,
    isActive: true
  },
  {
    id: 7,
    propertyName: "Beachside Lounge",
    address: "234 Ocean View",
    area: "Coastal Area",
    locationName: "Goa",
    pincode: "403001",
    propertyTypes: ["Lounge", "Bar"],
    propertyCategories: ["Entertainment", "Nightlife"],
    assignedAdminName: "David Wilson",
    assignedAdminId: "ADM007",
    parentPropertyName: null,
    parentPropertyId: null,
    isActive: true
  },
  {
    id: 8,
    propertyName: "Heritage Palace",
    address: "678 Royal Street",
    area: "Old City",
    locationName: "Jaipur",
    pincode: "302001",
    propertyTypes: ["Hotel", "Heritage Property"],
    propertyCategories: ["Heritage", "Luxury", "Cultural"],
    assignedAdminName: "Lisa Anderson",
    assignedAdminId: "ADM008",
    parentPropertyName: null,
    parentPropertyId: null,
    isActive: true
  }
];

const STATIC_PROPERTY_TYPES = [
  { id: 1, typeName: "Hotel", isActive: true },
  { id: 2, typeName: "Restaurant", isActive: true },
  { id: 3, typeName: "Cafe", isActive: true },
  { id: 4, typeName: "Banquet Hall", isActive: true },
  { id: 5, typeName: "Spa", isActive: true },
  { id: 6, typeName: "Apartment", isActive: true },
  { id: 7, typeName: "Lounge", isActive: false },
  { id: 8, typeName: "Bar", isActive: true },
  { id: 9, typeName: "Heritage Property", isActive: true }
];

const STATIC_PROPERTY_CATEGORIES = [
  { id: 1, categoryName: "Luxury", isActive: true },
  { id: 2, categoryName: "Business", isActive: true },
  { id: 3, categoryName: "Premium", isActive: true },
  { id: 4, categoryName: "Casual Dining", isActive: true },
  { id: 5, categoryName: "Outdoor Seating", isActive: true },
  { id: 6, categoryName: "Events", isActive: true },
  { id: 7, categoryName: "Weddings", isActive: true },
  { id: 8, categoryName: "Corporate", isActive: true },
  { id: 9, categoryName: "Wellness", isActive: true },
  { id: 10, categoryName: "Resort", isActive: true },
  { id: 11, categoryName: "Fine Dining", isActive: true },
  { id: 12, categoryName: "Italian Cuisine", isActive: false },
  { id: 13, categoryName: "Residential", isActive: true },
  { id: 14, categoryName: "Furnished", isActive: true },
  { id: 15, categoryName: "Entertainment", isActive: true },
  { id: 16, categoryName: "Nightlife", isActive: true },
  { id: 17, categoryName: "Heritage", isActive: true },
  { id: 18, categoryName: "Cultural", isActive: true }
];

function ManageProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Modal states
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // State for PropertyDetail view
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Data states - Initialize with static data
  const [properties, setProperties] = useState(STATIC_PROPERTIES);
  const [propertyTypes, setPropertyTypes] = useState(STATIC_PROPERTY_TYPES);
  const [propertyCategories, setPropertyCategories] = useState(STATIC_PROPERTY_CATEGORIES);

  // Loading states
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = ["All Status", "Active", "Inactive"];

  // Fetch all data
  const fetchProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await getAllProperties();
      const data = response?.data || response;
      
      // If API returns data, use it; otherwise keep static data
      if (data && Array.isArray(data) && data.length > 0) {
        setProperties(data);
      } else {
        console.log("Using static properties data (API returned empty or failed)");
        // Keep existing static data
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      console.log("Using static properties data (API error)");
      // Keep existing static data
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchPropertyTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await getPropertyTypes();
      const data = response?.data || response;
      
      // If API returns data, use it; otherwise keep static data
      if (data && Array.isArray(data) && data.length > 0) {
        setPropertyTypes(data);
      } else {
        console.log("Using static property types data (API returned empty or failed)");
        // Keep existing static data
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
      console.log("Using static property types data (API error)");
      // Keep existing static data
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchPropertyCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getAllPropertyCategories();
      const data = response?.data || response;
      
      // If API returns data, use it; otherwise keep static data
      if (data && Array.isArray(data) && data.length > 0) {
        setPropertyCategories(data);
      } else {
        console.log("Using static property categories data (API returned empty or failed)");
        // Keep existing static data
      }
    } catch (error) {
      console.error("Error fetching property categories:", error);
      console.log("Using static property categories data (API error)");
      // Keep existing static data
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchPropertyTypes();
    fetchPropertyCategories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowTypeDropdown(false);
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getFilteredProperties = () => {
    let filtered = [...properties];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.propertyName?.toLowerCase().includes(lowerSearch) ||
          p.address?.toLowerCase().includes(lowerSearch) ||
          p.location?.locationName?.toLowerCase().includes(lowerSearch) ||
          p.locationName?.toLowerCase().includes(lowerSearch)
      );
    }

    if (typeFilter !== "All Types") {
      filtered = filtered.filter((p) => 
        p.propertyTypes?.some(type => type.toLowerCase() === typeFilter.toLowerCase())
      );
    }

    if (statusFilter !== "All Status") {
      const isActiveTarget = statusFilter === "Active";
      filtered = filtered.filter((p) => p.isActive === isActiveTarget);
    }

    return filtered;
  };

  const displayProperties = getFilteredProperties();
  const totalPages = Math.ceil(displayProperties.length / itemsPerPage);
  const paginatedProperties = displayProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const typeFilterOptions = [
    "All Types",
    ...propertyTypes.map((type) => type.typeName),
  ];

  const handleDeleteProperty = (propertyId) => {
    // Remove from static data for now
    setProperties(properties.filter(p => p.id !== propertyId));
    setShowDeleteConfirm(null);
    // TODO: Implement actual delete API call when backend is ready
    console.log("Delete property:", propertyId);
  };

  const refreshAllData = () => {
    fetchProperties();
    fetchPropertyTypes();
    fetchPropertyCategories();
  };

  return (
    <Layout role="superadmin" showActions={false}>
      {selectedProperty ? (
        <PropertyDetail 
            property={selectedProperty} 
            onBack={() => setSelectedProperty(null)} 
        />
      ) : (
      <>
      <div className="h-full overflow-y-auto">
        {/* Debug Banner - Remove this later */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800 font-medium">
            ⚠️ Using static data - API integration pending. Remove static data constants when backend is ready.
          </p>
        </div>

        {/* Main Properties Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-xl font-semibold mb-1"
                  style={{ color: colors.textPrimary }}
                >
                  Property Management
                </h2>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Manage your Properties
                </p>
              </div>
              <button
                onClick={() => setShowAddPropertyModal(true)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                + Add Property
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between gap-4">
              <h3
                className="text-base font-semibold"
                style={{ color: colors.textPrimary }}
              >
                All Properties ({displayProperties.length})
              </h3>
              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: colors.textSecondary }}
                  />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 w-64"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.background,
                    }}
                  />
                </div>

                {/* Type Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setShowTypeDropdown(!showTypeDropdown);
                      setShowStatusDropdown(false);
                    }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 min-w-[160px] justify-between"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: "white",
                    }}
                  >
                    {typeFilter}
                    <ChevronDown size={16} />
                  </button>
                  {showTypeDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-lg border z-10"
                      style={{ borderColor: colors.border }}
                    >
                      {typeFilterOptions.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setTypeFilter(type);
                            setShowTypeDropdown(false);
                            setCurrentPage(1);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                          style={{
                            backgroundColor:
                              typeFilter === type ? colors.background : "white",
                            color: colors.textPrimary,
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowTypeDropdown(false);
                    }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 min-w-[140px] justify-between"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: "white",
                    }}
                  >
                    {statusFilter}
                    <ChevronDown size={16} />
                  </button>
                  {showStatusDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-lg border z-10"
                      style={{ borderColor: colors.border }}
                    >
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowStatusDropdown(false);
                            setCurrentPage(1);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                          style={{
                            backgroundColor:
                              statusFilter === status
                                ? colors.background
                                : "white",
                            color: colors.textPrimary,
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Properties Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {loadingProperties ? (
              <div className="flex justify-center items-center py-20">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: colors.primary }}
                ></div>
              </div>
            ) : paginatedProperties.length === 0 ? (
              <div
                className="text-center py-20 text-sm"
                style={{ color: colors.textSecondary }}
              >
                No properties found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: colors.background }}>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Property
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Location
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Categories
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Admin
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Parent Property
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedProperties.map((property) => (
                    <tr
                      key={property.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
                            style={{
                              backgroundColor: colors.primary + "20",
                              color: colors.primary,
                            }}
                          >
                            {getInitials(property.propertyName)}
                          </div>
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: colors.textPrimary }}
                            >
                              {property.propertyName || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {property.address || "N/A"}
                              {property.area && `, ${property.area}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {property.propertyTypes &&
                          property.propertyTypes.length > 0 ? (
                            property.propertyTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: "#3b82f615",
                                  color: "#3b82f6",
                                }}
                              >
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">N/A</span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.textPrimary }}
                      >
                        <div>
                          <div className="font-medium">
                            {property.locationName || "N/A"}
                          </div>
                          {property.pincode && (
                            <div className="text-xs text-gray-500">
                              {property.pincode}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {property.propertyCategories &&
                          property.propertyCategories.length > 0 ? (
                            property.propertyCategories
                              .slice(0, 2)
                              .map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: "#10b98115",
                                    color: "#10b981",
                                  }}
                                >
                                  {cat}
                                </span>
                              ))
                          ) : (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                          {property.propertyCategories &&
                            property.propertyCategories.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{property.propertyCategories.length - 2}
                              </span>
                            )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.textPrimary }}
                      >
                        <div>
                          <div className="font-medium">
                            {property.assignedAdminName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {property.assignedAdminId || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.textPrimary }}
                      >
                        {property.parentPropertyName ? (
                          <div>
                            <div className="font-medium">
                              {property.parentPropertyName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {property.parentPropertyId}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Root Property
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: property.isActive
                              ? "#10b98115"
                              : "#ef444415",
                            color: property.isActive ? "#10b981" : "#ef4444",
                          }}
                        >
                          {property.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setSelectedProperty(property)}
                          >
                            <Edit2
                              size={16}
                              style={{ color: colors.primary }}
                            />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(property.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Page {currentPage} of {totalPages || 1} • Showing{" "}
              {paginatedProperties.length} of {displayProperties.length}{" "}
              properties
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loadingProperties}
                className="p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-50">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loadingProperties}
                className="p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Property Types and Categories Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Types Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <h3
                className="text-base font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Property Types ({propertyTypes.length})
              </h3>
              <button
                onClick={() => setShowAddTypeModal(true)}
                className="p-2 rounded-lg text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="overflow-x-auto max-h-[300px]">
              {loadingTypes ? (
                <div className="flex justify-center items-center py-10">
                  <div
                    className="animate-spin rounded-full h-6 w-6 border-b-2"
                    style={{ borderColor: colors.primary }}
                  ></div>
                </div>
              ) : propertyTypes.length === 0 ? (
                <div
                  className="text-center py-10 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  No property types found.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: colors.background }}>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: colors.textSecondary }}
                      >
                        Type Name
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: colors.textSecondary }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {propertyTypes.map((type) => (
                      <tr
                        key={type.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td
                          className="px-4 py-3 text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {type.typeName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: type.isActive
                                ? "#10b98115"
                                : "#ef444415",
                              color: type.isActive ? "#10b981" : "#ef4444",
                            }}
                          >
                            {type.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Property Categories Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <h3
                className="text-base font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Property Categories ({propertyCategories.length})
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="p-2 rounded-lg text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="overflow-x-auto max-h-[300px]">
              {loadingCategories ? (
                <div className="flex justify-center items-center py-10">
                  <div
                    className="animate-spin rounded-full h-6 w-6 border-b-2"
                    style={{ borderColor: colors.primary }}
                  ></div>
                </div>
              ) : propertyCategories.length === 0 ? (
                <div
                  className="text-center py-10 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  No categories found.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: colors.background }}>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: colors.textSecondary }}
                      >
                        Category Name
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: colors.textSecondary }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {propertyCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td
                          className="px-4 py-3 text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {category.categoryName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: category.isActive
                                ? "#10b98115"
                                : "#ef444415",
                              color: category.isActive ? "#10b981" : "#ef4444",
                            }}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: colors.textPrimary }}
            >
              Delete Property
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Are you sure you want to delete this property? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                style={{ borderColor: colors.border }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProperty(showDeleteConfirm)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: "#ef4444" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddPropertyModal && (
        <AddPropertyModal
          onClose={() => setShowAddPropertyModal(false)}
          onSuccess={() => {
            refreshAllData();
            setShowAddPropertyModal(false);
          }}
        />
      )}

      {showAddTypeModal && (
        <AddPropertyTypeModal
          onClose={() => setShowAddTypeModal(false)}
          onSuccess={() => {
            refreshAllData();
            setShowAddTypeModal(false);
          }}
        />
      )}

      {showAddCategoryModal && (
        <AddPropertyCategoryModal
          onClose={() => setShowAddCategoryModal(false)}
          onSuccess={() => {
            refreshAllData();
            setShowAddCategoryModal(false);
          }}
        />
      )}
      </>
      )}
    </Layout>
  );
}

export default ManageProperties;