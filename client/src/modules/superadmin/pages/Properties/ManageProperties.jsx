import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  Search,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Building2,
  Tags,
  Layers,
  Power,
  User,
  AlertCircle,
} from "lucide-react";
import AddPropertyModal from "../../modals/AddPropertyModal";
import AddPropertyTypeModal from "../../modals/AddPropertyTypeModal";
import AddPropertyCategoryModal from "../../modals/AddPropertyCategoryModal";
import {
  getPropertyTypes,
  getAllPropertyCategories,
  enableProperty,
  disableProperty,
  GetAllPropertyDetails, // Updated API Import
} from "@/Api/Api";
import { toast } from "react-hot-toast";
import PropertyDetail from "./PropertyDetail";

function ManageProperties() {
  const [activeMainTab, setActiveMainTab] = useState("properties");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyCategories, setPropertyCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propRes, typeRes, catRes] = await Promise.all([
        GetAllPropertyDetails(), // Using the latest API for details
        getPropertyTypes(),
        getAllPropertyCategories(),
      ]);

      const propData = propRes?.data || propRes || [];
      setProperties(Array.isArray(propData) ? propData : []);
      setPropertyTypes(typeRes?.data || typeRes || []);
      setPropertyCategories(catRes?.data || catRes || []);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  // --- Logic Helpers ---
  const flattenProperty = (item) => {
    if (!item) return null;

    const p = item.propertyResponseDTO || {};
    const listings = item.propertyListingResponseDTOS || [];

    return {
      // --- Core Property ---
      id: p.id,
      propertyName: p.propertyName,
      propertyTypes: p.propertyTypes || [],
      propertyCategories: p.propertyCategories || [],
      address: p.address,
      area: p.area,
      pincode: p.pincode,
      locationId: p.locationId,
      locationName: p.locationName,
      latitude: p.latitude,
      longitude: p.longitude,
      assignedAdminId: p.assignedAdminId,
      assignedAdminName: p.assignedAdminName,
      parentPropertyId: p.parentPropertyId,
      parentPropertyName: p.parentPropertyName,
      childProperties: p.childProperties || [],
      isActive: p.isActive,

      // --- Listings ---
      listings: listings.map((l) => ({
        id: l.id,
        propertyId: l.propertyId,
        mainHeading: l.mainHeading,
        subTitle: l.subTitle,
        fullAddress: l.fullAddress,
        tagline: l.tagline,
        rating: l.rating,
        capacity: l.capacity,
        price: l.price,
        gstPercentage: l.gstPercentage,
        discountAmount: l.discountAmount,
        amenities: l.amenities || [],
        isActive: l.isActive,
        media: l.media || [],
      })),
    };
  };

  // Normalizes access to the core property data from the new DTO structure
  const getPropertyData = (item) => {
    console.log('item',item);
    // flattened object
    if (item?.listings) return item;

    // API DTO object
    if (item?.propertyResponseDTO) return item.propertyResponseDTO;

    return item;
  };

  const handleToggleStatus = async (item) => {
    const p = getPropertyData(item);
    const pId = p?.id;

    if (!pId) {
      toast.error("Invalid property ID");
      return;
    }

    setActionLoading(pId);
    try {
      if (p.isActive) {
        await disableProperty(pId);
        toast.success("Property deactivated");
      } else {
        await enableProperty(pId);
        toast.success("Property activated");
      }
      fetchData();
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Status update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredProperties = () => {
    if (!Array.isArray(properties)) return [];

    return properties.filter((item) => {
      const p = getPropertyData(item);
      if (!p || !p.id) return false;

      const matchesSearch =
        !searchTerm ||
        [
          p?.propertyName,
          p?.locationName,
          p?.assignedAdminName,
          p?.address,
        ].some((val) => val?.toLowerCase().includes(searchTerm.toLowerCase()));

      const propertyTypesArray = Array.isArray(p?.propertyTypes)
        ? p.propertyTypes
        : [];
      const matchesType =
        typeFilter === "All Types" ||
        propertyTypesArray.some(
          (t) => t?.toLowerCase() === typeFilter.toLowerCase(),
        );

      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Active"
          ? p?.isActive === true
          : p?.isActive === false);

      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredData = getFilteredProperties();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedProperties = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // --- Detail View Render ---
  if (selectedProperty) {
    const pData = getPropertyData(selectedProperty);
    // Pass the full item if PropertyDetail needs listing data, otherwise pData
    return (
      <Layout role="superadmin" showActions={false}>
        <PropertyDetail
          property={selectedProperty}
          onBack={() => {
            setSelectedProperty(null);
            fetchData();
          }}
        />
      </Layout>
    );
  }

  const mainTabs = [
    { id: "properties", label: "Portfolio", icon: <Building2 size={18} /> },
    { id: "types", label: "Types", icon: <Tags size={18} /> },
    { id: "categories", label: "Categories", icon: <Layers size={18} /> },
  ];

  return (
    <Layout role="superadmin" showActions={false}>
      <div className="h-full overflow-hidden flex flex-col space-y-4 p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Portfolio Manager
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Property Listings & Infrastructure
            </p>
          </div>
          <button
            onClick={() => {
              if (activeMainTab === "properties") setShowAddPropertyModal(true);
              if (activeMainTab === "types") setShowAddTypeModal(true);
              if (activeMainTab === "categories") setShowAddCategoryModal(true);
            }}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={18} strokeWidth={3} /> Create{" "}
            {activeMainTab === "properties"
              ? "Property"
              : activeMainTab === "types"
                ? "Type"
                : "Category"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-black transition-all border-b-2 uppercase tracking-widest ${
                activeMainTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50/30"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {activeMainTab === "properties" && (
            <>
              {/* Filter Bar */}
              <div className="p-4 border-b bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search name, location, or admin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-xl border-none ring-1 ring-gray-200 text-sm w-80 outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="text-sm border-none ring-1 ring-gray-200 rounded-xl px-4 py-2.5 outline-none bg-white font-bold text-gray-600 shadow-sm cursor-pointer"
                  >
                    <option value="All Types">All Types</option>
                    {propertyTypes.map((t) => (
                      <option key={t.id} value={t.typeName}>
                        {t.typeName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border-none ring-1 ring-gray-200 rounded-xl px-4 py-2.5 outline-none bg-white font-bold text-gray-600 shadow-sm cursor-pointer"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Portfolio Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b z-10">
                    <tr>
                      <th className="px-6 py-5">Property & Admin</th>
                      <th className="px-6 py-5">Location</th>
                      <th className="px-6 py-5">Metadata</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-24 text-center">
                          <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8" />
                        </td>
                      </tr>
                    ) : paginatedProperties.length > 0 ? (
                      paginatedProperties.map((item, index) => {
                        const p = getPropertyData(item);

                        if (!p || !p.id) return null;

                        const propertyTypesArray = Array.isArray(
                          p.propertyTypes,
                        )
                          ? p.propertyTypes
                          : [];
                        const propertyCategoriesArray = Array.isArray(
                          p.propertyCategories,
                        )
                          ? p.propertyCategories
                          : [];

                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-blue-50/10 transition-colors group"
                          >
                            <td className="px-6 py-5">
                              <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {p.propertyName || "N/A"}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-black mt-1.5 uppercase">
                                <User size={12} strokeWidth={3} />
                                {p.assignedAdminName || "Unassigned"}
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div className="text-sm font-bold text-gray-700">
                                {p.locationName || "N/A"}
                              </div>
                              <div className="text-[11px] text-gray-400 font-medium truncate max-w-[180px] mt-0.5">
                                {p.address || "N/A"}
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex flex-wrap gap-1.5">
                                {propertyTypesArray.map((t, idx) => (
                                  <span
                                    key={`t-${idx}`}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-black uppercase"
                                  >
                                    {t}
                                  </span>
                                ))}
                                {propertyCategoriesArray.map((c, idx) => (
                                  <span
                                    key={`c-${idx}`}
                                    className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase"
                                  >
                                    {c}
                                  </span>
                                ))}
                                {!propertyTypesArray.length &&
                                  !propertyCategoriesArray.length && (
                                    <span className="text-gray-300 text-[10px]">
                                      ---
                                    </span>
                                  )}
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  p.isActive
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {p.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-center">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    setSelectedProperty(flattenProperty(item))
                                  }
                                  className="p-2 text-blue-600 bg-white border border-gray-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(item)}
                                  disabled={actionLoading === p.id}
                                  className={`p-2 rounded-xl border border-gray-100 transition-all shadow-sm bg-white ${
                                    p.isActive
                                      ? "text-orange-500 hover:bg-orange-500 hover:text-white"
                                      : "text-green-600 hover:bg-green-600 hover:text-white"
                                  } disabled:opacity-50`}
                                >
                                  {actionLoading === p.id ? (
                                    <Loader2
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Power size={15} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-24 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
                        >
                          No Results Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="p-4 border-t bg-gray-50/50 flex items-center justify-between">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                    Showing{" "}
                    {Math.min(
                      filteredData.length,
                      (currentPage - 1) * itemsPerPage + 1,
                    )}
                    -{Math.min(filteredData.length, currentPage * itemsPerPage)}{" "}
                    of {filteredData.length}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-20 shadow-sm transition-all hover:border-blue-300"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="text-sm font-black w-10 h-10 flex items-center justify-center bg-white border border-blue-100 rounded-xl shadow-sm text-blue-600">
                      {currentPage}
                    </div>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-20 shadow-sm transition-all hover:border-blue-300"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Render logic for activeMainTab === "types" and "categories" remains the same... */}
        </div>
      </div>

      {/* Modals */}
      {showAddPropertyModal && (
        <AddPropertyModal
          onClose={() => setShowAddPropertyModal(false)}
          onSuccess={() => {
            fetchData();
            setShowAddPropertyModal(false);
          }}
        />
      )}
      {showAddTypeModal && (
        <AddPropertyTypeModal
          onClose={() => setShowAddTypeModal(false)}
          onSuccess={() => {
            fetchData();
            setShowAddTypeModal(false);
          }}
        />
      )}
      {showAddCategoryModal && (
        <AddPropertyCategoryModal
          onClose={() => setShowAddCategoryModal(false)}
          onSuccess={() => {
            fetchData();
            setShowAddCategoryModal(false);
          }}
        />
      )}
    </Layout>
  );
}

export default ManageProperties;
