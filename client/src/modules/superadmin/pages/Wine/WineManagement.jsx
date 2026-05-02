import React, { useState, useEffect, useCallback, useMemo } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  Wine,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
  Check,
  Upload,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  FilterX
} from "lucide-react";
import {
  getAllWineTypes, createWineType, updateWineType, toggleWineTypeStatus,
  getAllWineBrands, createWineBrand, updateWineBrand, toggleWineBrandStatus,
  getAllWineCategories, createWineCategory, updateWineCategory, toggleWineCategoryStatus,
  getAllWineSubCategories, createWineSubCategory, updateWineSubCategory, toggleWineSubCategoryStatus
} from "@/Api/WineApi";
import { GetAllPropertyDetails, getPropertyTypes, uploadMedia, getMediaById } from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "types", label: "Wine Types", icon: Wine },
  { id: "brands", label: "Brands", icon: Wine },
  { id: "categories", label: "Categories", icon: Wine },
  { id: "subcategories", label: "Subcategories", icon: Wine },
];

const SCOPE_OPTIONS = [
  { label: "Property Type Homepage", value: "propertyType" },
  { label: "Specific Property", value: "property" },
];

const toList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

// ─── Shared Components ────────────────────────────────────────────────────────

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 transition-all";
const inputStyle = { borderColor: colors.border, color: colors.textPrimary };

function ScopeFields({ form, setForm, propertyTypes, properties }) {
  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  return (
    <>
      <FormField label="Scope">
        <select
          className={inputCls}
          style={inputStyle}
          value={form.scope}
          onChange={(e) => set("scope", e.target.value)}
        >
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormField>

      {form.scope === "propertyType" && (
        <FormField label="Property Type">
          <select
            className={inputCls}
            style={inputStyle}
            value={form.propertyTypeId}
            onChange={(e) => set("propertyTypeId", e.target.value)}
          >
            <option value="">Select property type</option>
            {propertyTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.typeName || pt.name}</option>
            ))}
          </select>
        </FormField>
      )}

      {form.scope === "property" && (
        <FormField label="Property">
          <select
            className={inputCls}
            style={inputStyle}
            value={form.propertyId}
            onChange={(e) => set("propertyId", e.target.value)}
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.propertyName}</option>
            ))}
          </select>
        </FormField>
      )}
    </>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: active ? colors.success + "18" : colors.error + "18",
        color: active ? colors.success : colors.error,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: active ? colors.success : colors.error }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function EmptyState({ label, onAdd }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed gap-3"
      style={{ borderColor: colors.border }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.mainBg }}
      >
        <Wine size={20} style={{ color: colors.textSecondary }} />
      </div>
      <p className="text-sm" style={{ color: colors.textSecondary }}>
        No entries yet. {label}
      </p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="text-sm font-semibold underline"
          style={{ color: colors.primary }}
        >
          Add your first one
        </button>
      )}
    </div>
  );
}

function ImageUpload({ mediaId, previewUrl, onUpload, uploading }) {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {previewUrl ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border" style={{ borderColor: colors.border }}>
          <img src={previewUrl} alt="preview" className="w-full h-full object-contain bg-gray-50" />
          <label
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div className="flex flex-col items-center gap-1 text-white text-xs">
              <Upload size={18} />
              Replace
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-gray-50"
          style={{ borderColor: colors.border }}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" style={{ color: colors.primary }} />
          ) : (
            <>
              <Upload size={24} style={{ color: colors.textSecondary }} />
              <span className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                Click to upload image
              </span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {mediaId && (
        <p className="text-xs" style={{ color: colors.textSecondary }}>
          Media ID: <span style={{ color: colors.textPrimary }}>{mediaId}</span>
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function WineManagement() {
  const [activeTab, setActiveTab] = useState("types");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingContext, setLoadingContext] = useState(true);

  // Data State
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter / Drill Down State
  const [drillDown, setDrillDown] = useState({
    typeId: null,
    brandId: null,
    categoryId: null,
    label: ""
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toggling, setToggling] = useState({});

  // Form State
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    wineTypeId: "",
    wineBrandId: "",
    wineCategoryId: "",
    mediaId: null,
    previewUrl: "",
    scope: "propertyType",
    propertyId: "",
    propertyTypeId: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      title: "",
      description: "",
      wineTypeId: drillDown.typeId || "",
      wineBrandId: drillDown.brandId || "",
      wineCategoryId: drillDown.categoryId || "",
      mediaId: null,
      previewUrl: "",
      scope: "propertyType",
      propertyId: "",
      propertyTypeId: "",
    });
    setEditingItem(null);
  };

  const fetchContext = useCallback(async () => {
    try {
      const [ptRes, pRes] = await Promise.all([getPropertyTypes(), GetAllPropertyDetails()]);
      setPropertyTypes(toList(ptRes));
      setProperties(toList(pRes));
    } catch {
      showError("Failed to fetch location context");
    } finally {
      setLoadingContext(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [t, b, c, s] = await Promise.all([
        getAllWineTypes(),
        getAllWineBrands(),
        getAllWineCategories(),
        getAllWineSubCategories()
      ]);
      setTypes(toList(t));
      setBrands(toList(b));
      setCategories(toList(c));
      setSubcategories(toList(s));
    } catch {
      showError(`Failed to fetch wine data`);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchContext(); }, [fetchContext]);
  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived Data with Drill Down filtering
  const filteredData = useMemo(() => {
    let base = [];
    if (activeTab === "types") base = types;
    else if (activeTab === "brands") {
      base = brands;
      if (drillDown.typeId) base = base.filter(x => String(x.wineTypeId) === String(drillDown.typeId));
    } else if (activeTab === "categories") {
      base = categories;
      if (drillDown.brandId) base = base.filter(x => String(x.wineBrandId) === String(drillDown.brandId));
    } else if (activeTab === "subcategories") {
      base = subcategories;
      if (drillDown.categoryId) base = base.filter(x => String(x.wineCategoryId) === String(drillDown.categoryId));
    }
    return base;
  }, [activeTab, types, brands, categories, subcategories, drillDown]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [activeTab, drillDown]);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const mediaId = typeof res.data === "number" ? res.data : (res.data?.id || res.data?.data?.id || res.data);
      const previewUrl = res.data?.url || res.data?.data?.url || URL.createObjectURL(file);
      setForm((p) => ({ ...p, mediaId, previewUrl }));
      showSuccess("Image uploaded");
    } catch {
      showError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = async (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || item.wineTypeName || "",
      title: item.title || "",
      description: item.description || item.wineTypeDescription || "",
      wineTypeId: item.wineTypeId || "",
      wineBrandId: item.wineBrandId || "",
      wineCategoryId: item.wineCategoryId || "",
      mediaId: item.media?.mediaId || item.mediaId || null,
      previewUrl: item.media?.url || "",
      scope: item.propertyId ? "property" : "propertyType",
      propertyId: item.propertyId || "",
      propertyTypeId: item.propertyTypeId || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const isType = activeTab === "types";
    const isBrand = activeTab === "brands";
    const isCategory = activeTab === "categories";
    const isSub = activeTab === "subcategories";

    const nameVal = isType ? form.name : (isBrand ? form.name : form.title);
    if (!nameVal?.trim()) return showError(`${isType || isBrand ? "Name" : "Title"} is required`);

    const payload = {
      description: form.description.trim(),
      mediaId: form.mediaId,
      ...(form.scope === "property" && { propertyId: form.propertyId }),
      ...(form.scope === "propertyType" && { propertyTypeId: form.propertyTypeId }),
    };

    if (isType) {
      payload.wineTypeName = form.name.trim();
      payload.wineTypeDescription = form.description.trim();
    } else if (isBrand) {
      payload.name = form.name.trim();
      payload.wineTypeId = form.wineTypeId;
    } else if (isCategory) {
      payload.title = form.title.trim();
      payload.wineBrandId = form.wineBrandId;
    } else if (isSub) {
      payload.title = form.title.trim();
      payload.wineCategoryId = form.wineCategoryId;
    }

    setSaving(true);
    try {
      if (isType) editingItem ? await updateWineType(editingItem.id, payload) : await createWineType(payload);
      if (isBrand) editingItem ? await updateWineBrand(editingItem.id, payload) : await createWineBrand(payload);
      if (isCategory) editingItem ? await updateWineCategory(editingItem.id, payload) : await createWineCategory(payload);
      if (isSub) editingItem ? await updateWineSubCategory(editingItem.id, payload) : await createWineSubCategory(payload);

      showSuccess("Saved successfully");
      setShowModal(false);
      fetchData();
    } catch (e) {
      showError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    setToggling((p) => ({ ...p, [item.id]: true }));
    try {
      if (activeTab === "types") await toggleWineTypeStatus(item.id, !item.active);
      if (activeTab === "brands") await toggleWineBrandStatus(item.id, !item.active);
      if (activeTab === "categories") await toggleWineCategoryStatus(item.id, !item.active);
      if (activeTab === "subcategories") await toggleWineSubCategoryStatus(item.id, !item.active);
      showSuccess("Status updated");
      fetchData();
    } catch {
      showError("Toggle failed");
    } finally {
      setToggling((p) => ({ ...p, [item.id]: false }));
    }
  };

  const handleDrillDown = (item) => {
    if (activeTab === "types") {
      setDrillDown({ typeId: item.id, brandId: null, categoryId: null, label: item.wineTypeName });
      setActiveTab("brands");
    } else if (activeTab === "brands") {
      setDrillDown(prev => ({ ...prev, brandId: item.id, categoryId: null, label: item.name }));
      setActiveTab("categories");
    } else if (activeTab === "categories") {
      setDrillDown(prev => ({ ...prev, categoryId: item.id, label: item.title }));
      setActiveTab("subcategories");
    }
  };

  const clearDrillDown = () => {
    setDrillDown({ typeId: null, brandId: null, categoryId: null, label: "" });
  };

  return (
    <Layout>
      <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
              Wine Management
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Configure wine types, brands, categories and subcategories.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {drillDown.label && (
              <button
                onClick={clearDrillDown}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: colors.error, color: colors.error }}
              >
                <FilterX size={16} /> Clear Filter ({drillDown.label})
              </button>
            )}
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus size={18} /> Add {activeTab === "categories" ? "Category" : activeTab === "subcategories" ? "Subcategory" : activeTab.slice(0, -1)}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border" style={{ backgroundColor: colors.mainBg, borderColor: colors.border }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? colors.contentBg : "transparent",
                color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                boxShadow: activeTab === tab.id ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: colors.border }}>
          {dataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: colors.primary }} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: colors.mainBg }}>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>ID</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Avatar</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Name / Title</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Parent</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Scope</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Status</th>
                      <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.borderLight }}>
                    {currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px]" style={{ color: colors.textSecondary }}>#{item.id}</td>
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center" style={{ borderColor: colors.border }}>
                            {item.media?.url ? (
                              <img src={item.media.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Wine size={16} style={{ color: colors.textSecondary }} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold" style={{ color: colors.textPrimary }}>
                              {item.wineTypeName || item.name || item.title}
                            </span>
                            <span className="text-[10px] max-w-[200px] truncate" style={{ color: colors.textSecondary }}>
                              {item.wineTypeDescription || item.description || "No description"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                            {activeTab === "brands" && (item.wineTypeName || "N/A")}
                            {activeTab === "categories" && (item.wineBrandName || "N/A")}
                            {activeTab === "subcategories" && (item.wineCategoryName || "N/A")}
                            {activeTab === "types" && "Top Level"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>
                              {item.propertyId ? "Specific Property" : item.propertyTypeId ? "Property Type" : "Main"}
                            </span>
                            <span className="text-xs truncate max-w-[120px]" style={{ color: colors.textSecondary }}>
                              {item.propertyName || item.propertyTypeName || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge active={item.active} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab !== "subcategories" && (
                              <button
                                onClick={() => handleDrillDown(item)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: colors.primary, backgroundColor: colors.primary + "12" }}
                                title="View Sub-items"
                              >
                                <Eye size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(item)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: colors.info, backgroundColor: colors.info + "12" }}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleToggle(item)}
                              disabled={toggling[item.id]}
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                color: item.active ? colors.error : colors.success,
                                backgroundColor: item.active ? colors.error + "12" : colors.success + "12",
                              }}
                              title={item.active ? "Deactivate" : "Activate"}
                            >
                              {toggling[item.id] ? <Loader2 size={14} className="animate-spin" /> : item.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState label={`No ${activeTab} found.`} onAdd={() => { resetForm(); setShowModal(true); }} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: colors.borderLight, backgroundColor: colors.mainBg }}>
                  <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    Showing <span style={{ color: colors.textPrimary }}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span style={{ color: colors.textPrimary }}>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span style={{ color: colors.textPrimary }}>{filteredData.length}</span> entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border transition-all disabled:opacity-30"
                      style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                        style={{
                          backgroundColor: currentPage === i + 1 ? colors.primary : colors.contentBg,
                          color: currentPage === i + 1 ? "white" : colors.textSecondary,
                          border: currentPage === i + 1 ? "none" : `1px solid ${colors.border}`
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border transition-all disabled:opacity-30"
                      style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: colors.border }}>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                {editingItem ? "Edit" : "Add New"} {activeTab === "categories" ? "Category" : activeTab === "subcategories" ? "Subcategory" : activeTab.slice(0, -1).toUpperCase()}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={20} style={{ color: colors.textSecondary }} />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <FormField label="Image">
                <ImageUpload mediaId={form.mediaId} previewUrl={form.previewUrl} onUpload={handleUpload} uploading={uploading} />
              </FormField>

              {(activeTab === "types" || activeTab === "brands") ? (
                <FormField label="Name *">
                  <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter name" />
                </FormField>
              ) : (
                <FormField label="Title *">
                  <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Enter title" />
                </FormField>
              )}

              <FormField label="Description">
                <textarea className={inputCls} style={inputStyle} rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter description" />
              </FormField>

              {activeTab === "brands" && (
                <FormField label="Wine Type *">
                  <select className={inputCls} style={inputStyle} value={form.wineTypeId} onChange={(e) => setForm(p => ({ ...p, wineTypeId: e.target.value }))}>
                    <option value="">Select Wine Type</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.wineTypeName}</option>)}
                  </select>
                </FormField>
              )}

              {activeTab === "categories" && (
                <FormField label="Wine Brand *">
                  <select className={inputCls} style={inputStyle} value={form.wineBrandId} onChange={(e) => setForm(p => ({ ...p, wineBrandId: e.target.value }))}>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </FormField>
              )}

              {activeTab === "subcategories" && (
                <FormField label="Wine Category *">
                  <select className={inputCls} style={inputStyle} value={form.wineCategoryId} onChange={(e) => setForm(p => ({ ...p, wineCategoryId: e.target.value }))}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </FormField>
              )}

              <ScopeFields form={form} setForm={setForm} propertyTypes={propertyTypes} properties={properties} />
            </div>

            <div className="px-8 py-6 border-t flex justify-end gap-4" style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50" style={{ borderColor: colors.border, color: colors.textSecondary }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {editingItem ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
