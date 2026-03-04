import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  Search,
  Edit2,
  Eye,
  Plus,
  Loader2,
  Building2,
  Tags,
  Layers,
  Power,
  User,
} from "lucide-react";
import AddPropertyModal from "../../modals/AddPropertyModal";
import AddPropertyTypeModal from "../../modals/AddPropertyTypeModal";
import AddPropertyCategoryModal from "../../modals/AddPropertyCategoryModal";
import EditPropertyModal from "./modals/EditPropertyModal";
import {
  getPropertyTypes,
  getAllPropertyCategories,
  enableProperty,
  disableProperty,
  GetAllPropertyDetails,
  updatePropertyCategoryStatus,
  updatePropertyTypeStatus,
} from "@/Api/Api";
import { toast } from "react-hot-toast";
import PropertyDetail from "./PropertyDetail";

function ManageProperties() {
  const [activeMainTab, setActiveMainTab] = useState("properties");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editTypeItem, setEditTypeItem] = useState(null);
  const [editCategoryItem, setEditCategoryItem] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyCategories, setPropertyCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propRes, typeRes, catRes] = await Promise.all([
        GetAllPropertyDetails(),
        getPropertyTypes(),
        getAllPropertyCategories(),
      ]);
      setProperties(propRes?.data || propRes || []);
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

  // ── Reset to page 1 whenever filters change ───────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  // ── Always unwrap the propertyResponseDTO wrapper ─────────────────────────
  const getPropertyData = (item) => item?.propertyResponseDTO ?? item;

  // ── Filter: search + type ─────────────────────────────────────────────────
  // API response shape: [{ propertyResponseDTO: {...}, propertyListingResponseDTOS: [...] }]
  // propertyTypes inside DTO is string[], e.g. ["Hotel"]
  const filteredProperties = properties.filter((item) => {
    const p = item?.propertyResponseDTO ?? item;
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      p.propertyName?.toLowerCase().includes(search) ||
      p.locationName?.toLowerCase().includes(search) ||
      p.assignedAdminName?.toLowerCase().includes(search);

    const matchesType =
      typeFilter === "All Types" ||
      (Array.isArray(p.propertyTypes)
        ? p.propertyTypes.includes(typeFilter)
        : p.propertyTypes === typeFilter);

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Toggle property enable / disable ──────────────────────────────────────
  const handleTogglePropertyStatus = async (item) => {
    const p = getPropertyData(item);
    if (!p?.id) return;
    if (
      !window.confirm(
        `Are you sure you want to ${p.isActive ? "disable" : "enable"} this property?`,
      )
    )
      return;

    const key = `prop-${p.id}`;
    setActionLoading(key);
    try {
      if (p.isActive) {
        await disableProperty(p.id);
        toast.success("Property deactivated");
      } else {
        await enableProperty(p.id);
        toast.success("Property activated");
      }
      fetchData();
    } catch {
      toast.error("Status update failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Toggle type enable / disable ──────────────────────────────────────────
  const handleToggleTypeStatus = async (type) => {
    if (
      !window.confirm(
        `Are you sure you want to ${type.isActive ? "disable" : "enable"} this type?`,
      )
    )
      return;

    const key = `type-${type.id}`;
    setActionLoading(key);
    try {
      await updatePropertyTypeStatus(type.id, !type.isActive);
      toast.success(`Type ${type.isActive ? "deactivated" : "activated"}`);
      fetchData();
    } catch {
      toast.error("Failed to update type status");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Toggle category enable / disable ──────────────────────────────────────
  const handleToggleCategoryStatus = async (cat) => {
    if (
      !window.confirm(
        `Are you sure you want to ${cat.isActive ? "disable" : "enable"} this category?`,
      )
    )
      return;

    const key = `cat-${cat.id}`;
    setActionLoading(key);
    try {
      await updatePropertyCategoryStatus(cat.id, !cat.isActive);
      toast.success(`Category ${cat.isActive ? "deactivated" : "activated"}`);
      fetchData();
    } catch {
      toast.error("Failed to update category status");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Table head helper ──────────────────────────────────────────────────────
  const renderTableHead = (headers) => (
    <thead className="sticky top-0 bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b z-10">
      <tr>
        {headers.map((h, i) => (
          <th key={i} className={`px-6 py-5 ${h.center ? "text-center" : ""}`}>
            {h.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  // ── Property Detail drill-down ─────────────────────────────────────────────
  if (selectedProperty) {
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
      <div className="h-full flex flex-col space-y-4 p-6 bg-gray-50/30">
        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Portfolio Manager
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Property Listings & Infrastructure
            </p>
          </div>
          <button
            onClick={() => {
              if (activeMainTab === "properties") setShowAddPropertyModal(true);
              else if (activeMainTab === "types") setShowAddTypeModal(true);
              else setShowAddCategoryModal(true);
            }}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={18} />
            Create{" "}
            {activeMainTab === "properties"
              ? "Property"
              : activeMainTab === "types"
                ? "Type"
                : "Category"}
          </button>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────────────── */}
        <div className="flex gap-8 border-b border-gray-200">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`flex items-center gap-2 px-1 py-4 text-sm font-bold transition-all border-b-2 uppercase tracking-widest ${
                activeMainTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Main Content Card ───────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* ════════════════ PROPERTIES TAB ════════════════ */}
          {activeMainTab === "properties" && (
            <>
              {/* Filters bar */}
              <div className="p-4 border-b bg-white flex flex-wrap items-center justify-between gap-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name, location or admin…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm w-80 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                  />
                </div>
                <select
                  className="text-sm border border-gray-200 rounded-xl px-4 py-2 outline-none font-bold text-gray-600"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  {propertyTypes.map((t) => (
                    <option key={t.id} value={t.typeName}>
                      {t.typeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  {renderTableHead([
                    { label: "Property & Admin" },
                    { label: "Location" },
                    { label: "Type" },
                    { label: "Status" },
                    { label: "Actions", center: true },
                  ])}
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                          <Loader2 className="animate-spin mx-auto text-blue-500" />
                        </td>
                      </tr>
                    ) : paginatedProperties.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-20 text-center text-sm text-gray-400 italic"
                        >
                          No properties match your search.
                        </td>
                      </tr>
                    ) : (
                      paginatedProperties.map((item) => {
                        const p = item?.propertyResponseDTO ?? item;
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            {/* Property name + admin */}
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">
                                {p.propertyName}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-blue-500 font-black uppercase mt-1">
                                <User size={12} />
                                {p.assignedAdminName || "Unassigned"}
                              </div>
                            </td>

                            {/* Location */}
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-gray-700">
                                {p.locationName}
                              </div>
                              <div className="text-xs text-gray-400 truncate max-w-[150px]">
                                {p.address}
                              </div>
                            </td>

                            {/* Types — array of strings */}
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {(p.propertyTypes || []).map((t, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                                  p.isActive
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {p.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => setSelectedProperty(item)}
                                  title="View Details"
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => setEditItem(item)}
                                  title="Edit Property"
                                  className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleTogglePropertyStatus(item)
                                  }
                                  title={p.isActive ? "Deactivate" : "Activate"}
                                  disabled={actionLoading === `prop-${p.id}`}
                                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                    p.isActive
                                      ? "text-orange-500 hover:bg-orange-50"
                                      : "text-green-600 hover:bg-green-50"
                                  }`}
                                >
                                  {actionLoading === `prop-${p.id}` ? (
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
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              {!loading && filteredProperties.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <p className="text-xs text-gray-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-700">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredProperties.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-700">
                      {filteredProperties.length}
                    </span>{" "}
                    properties
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════════════════ TYPES TAB ════════════════ */}
          {activeMainTab === "types" && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                {renderTableHead([
                  { label: "Type ID" },
                  { label: "Type Name" },
                  { label: "Status" },
                  { label: "Actions", center: true },
                ])}
                <tbody className="divide-y divide-gray-100">
                  {propertyTypes.map((type) => (
                    <tr
                      key={type.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        #{type.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {type.typeName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                            type.isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {type.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setEditTypeItem(type)}
                            title="Edit Type"
                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleTypeStatus(type)}
                            title={type.isActive ? "Deactivate" : "Activate"}
                            disabled={actionLoading === `type-${type.id}`}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              type.isActive
                                ? "text-orange-500 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {actionLoading === `type-${type.id}` ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Power size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ════════════════ CATEGORIES TAB ════════════════ */}
          {activeMainTab === "categories" && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                {renderTableHead([
                  { label: "Category Name" },
                  { label: "Description" },
                  { label: "Status" },
                  { label: "Actions", center: true },
                ])}
                <tbody className="divide-y divide-gray-100">
                  {propertyCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {cat.categoryName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                        {cat.description || "No description"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                            cat.isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setEditCategoryItem(cat)}
                            title="Edit Category"
                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleCategoryStatus(cat)}
                            title={cat.isActive ? "Deactivate" : "Activate"}
                            disabled={actionLoading === `cat-${cat.id}`}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              cat.isActive
                                ? "text-orange-500 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {actionLoading === `cat-${cat.id}` ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Power size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add Modals ──────────────────────────────────────────────────────── */}
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

      {/* ─── Edit Property Modal ─────────────────────────────────────────────── */}
      {editItem && (
        <EditPropertyModal
          item={editItem}
          propertyTypes={propertyTypes}
          propertyCategories={propertyCategories}
          allProperties={properties}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            fetchData();
            setEditItem(null);
          }}
        />
      )}

      {/* ─── Edit Type Modal ─────────────────────────────────────────────────── */}
      {editTypeItem && (
        <AddPropertyTypeModal
          editItem={editTypeItem}
          onClose={() => setEditTypeItem(null)}
          onSuccess={() => {
            fetchData();
            setEditTypeItem(null);
          }}
        />
      )}

      {/* ─── Edit Category Modal ─────────────────────────────────────────────── */}
      {editCategoryItem && (
        <AddPropertyCategoryModal
          editItem={editCategoryItem}
          onClose={() => setEditCategoryItem(null)}
          onSuccess={() => {
            fetchData();
            setEditCategoryItem(null);
          }}
        />
      )}
    </Layout>
  );
}

export default ManageProperties;
