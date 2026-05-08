import React, { useState, useEffect, useCallback, useMemo } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  Wine, Plus, Edit2, Loader2, X, Check, Trash2, Tag, Layers, Search, Globe, ChevronRight, ChevronDown
} from "lucide-react";
import {
  getAllWineMasters, createWineMaster, updateWineMaster, deleteWineMaster,
  getAllWineTypes, getAllWineBrands, getAllWineCategories, getAllWineSubCategories
} from "@/Api/WineApi";
import { getPropertyTypes } from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";

const toList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all";
const inputStyle = (hasError) => ({
  borderColor: hasError ? colors.error : colors.border,
  color: colors.textPrimary,
  backgroundColor: colors.contentBg
});
const ENTRY_NAME_OPTIONS = [
  { label: "Category", value: "category_header" },
  { label: "Brands", value: "brands_header" },
];

export default function WineHeaders() {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showHierarchyScoping, setShowHierarchyScoping] = useState(false);

  // Context data
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    descriptionTwo: "",
    tags: "",
    wineTypeId: "",
    wineBrandId: "",
    wineCategoryId: "",
    wineSubCategoryId: "",
    propertyTypeId: "",
    isActive: true,
    scopingLevel: "TYPE", // Default scoping level
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, b, c, s, pt] = await Promise.all([
        getAllWineMasters(),
        getAllWineTypes(),
        getAllWineBrands(),
        getAllWineCategories(),
        getAllWineSubCategories(),
        getPropertyTypes()
      ]);
      setMasters(toList(m).sort((a, b) => (b.id || 0) - (a.id || 0)));
      setTypes(toList(t));
      setBrands(toList(b));
      setCategories(toList(c));
      setSubcategories(toList(s));
      setPropertyTypes(toList(pt));
    } catch (e) {
      showError("Failed to fetch liquor data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Automatically select "WINE" type if available
  useEffect(() => {
    if (types.length > 0 && !form.wineTypeId) {
      const wineType = types.find(t => t.wineTypeName?.toUpperCase().includes("WINE"));
      if (wineType) {
        setForm(prev => ({ ...prev, wineTypeId: String(wineType.id) }));
      }
    }
  }, [types, form.wineTypeId]);

  useEffect(() => {
    if (propertyTypes.length > 0 && !form.propertyTypeId) {
      const winePropertyType = propertyTypes.find(
        (pt) => String(pt.typeName || pt.name || "").toUpperCase().includes("WINE"),
      );
      if (winePropertyType) {
        setForm((prev) => ({ ...prev, propertyTypeId: String(winePropertyType.id) }));
      }
    }
  }, [propertyTypes, form.propertyTypeId]);

  const filteredMasters = useMemo(() => {
    const s = search.toLowerCase();
    return masters.filter(m =>
      !search ||
      m.name?.toLowerCase().includes(s) ||
      m.description?.toLowerCase().includes(s) ||
      m.tags?.toLowerCase().includes(s)
    );
  }, [masters, search]);

  const usedEntryNames = useMemo(() => new Set(masters.map(m => m.name)), [masters]);
  const allEntryNamesFilled = ENTRY_NAME_OPTIONS.every(opt => usedEntryNames.has(opt.value));
  const availableEntryOptions = editingItem
    ? ENTRY_NAME_OPTIONS
    : ENTRY_NAME_OPTIONS.filter(opt => !usedEntryNames.has(opt.value));

  const handleSave = async () => {
    if (!form.name.trim()) return showError("Name is required");

    setSaving(true);
    try {
      const hierarchyPayload = showHierarchyScoping
        ? {
          wineTypeId: form.wineTypeId || null,
          wineBrandId: form.wineBrandId || null,
          wineCategoryId: form.wineCategoryId || null,
          wineSubCategoryId: form.wineSubCategoryId || null,
        }
        : {
          wineTypeId: null,
          wineBrandId: null,
          wineCategoryId: null,
          wineSubCategoryId: null,
        };

      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        descriptionTwo: (form.descriptionTwo || "").trim() || null,
        tags: form.tags.trim(),
        ...hierarchyPayload,
        propertyTypeId: form.propertyTypeId || null,
      };

      if (editingItem) {
        await updateWineMaster(editingItem.id, payload);
      } else {
        await createWineMaster(payload);
      }
      showSuccess(editingItem ? "Header updated" : "Header created");
      setShowModal(false);
      fetchData();
    } catch (e) {
      showError(e?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete? This action cannot be undone.")) return;
    try {
      await deleteWineMaster(id);
      showSuccess("Deleted successfully");
      fetchData();
    } catch (e) {
      showError("Delete failed");
    }
  };

  const resetForm = () => {
    setForm({
      name: "", description: "", descriptionTwo: "", tags: "",
      wineTypeId: "", wineBrandId: "", wineCategoryId: "", wineSubCategoryId: "",
      propertyTypeId: "", isActive: true,
      scopingLevel: "TYPE"
    });
    setShowHierarchyScoping(false);
    setEditingItem(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    // Detect deepest scoping level
    let level = "TYPE";
    if (item.wineSubCategoryId) level = "SUBCATEGORY";
    else if (item.wineCategoryId) level = "CATEGORY";
    else if (item.wineBrandId) level = "BRAND";

    setForm({
      name: item.name || "",
      description: item.description || "",
      descriptionTwo: item.descriptionTwo || "",
      tags: item.tags || "",
      wineTypeId: item.wineTypeId || "",
      wineBrandId: item.wineBrandId || "",
      wineCategoryId: item.wineCategoryId || "",
      wineSubCategoryId: item.wineSubCategoryId || "",
      propertyTypeId: item.propertyTypeId || "",
      isActive: item.isActive ?? true,
      scopingLevel: level,
    });
    setShowHierarchyScoping(
      Boolean(item.wineTypeId || item.wineBrandId || item.wineCategoryId || item.wineSubCategoryId),
    );
    setShowModal(true);
  };

  // Hierarchy filter helpers
  const availableBrands = brands.filter(b => !form.wineTypeId || String(b.wineTypeId) === String(form.wineTypeId));
  const availableCategories = categories.filter(c => !form.wineBrandId || String(c.wineBrandId) === String(form.wineBrandId));
  const availableSubCategories = subcategories.filter(s => !form.wineCategoryId || String(s.wineCategoryId) === String(form.wineCategoryId));
  const winePropertyTypes = useMemo(
    () =>
      propertyTypes.filter(
        (pt) => String(pt.typeName || pt.name || "").toUpperCase().includes("WINE"),
      ),
    [propertyTypes],
  );

  return (
    <Layout>
      <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-2">
              <Wine size={14} />
              <span>Wine Management</span>
              <ChevronRight size={12} className="text-gray-400" />
              <span className="text-gray-500">Liquor Page Headers</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
              Liquor Page Headers
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: colors.textSecondary }}>
              Configure and scope high-level page entries for the wine module.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name, tags..."
                className="pl-12 pr-6 py-3 border rounded-2xl text-sm outline-none focus:ring-4 transition-all w-64 lg:w-80 shadow-sm"
                style={{ borderColor: colors.border, focusRingColor: colors.primary + "20" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {!allEntryNamesFilled && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                style={{ backgroundColor: colors.primary }}
              >
                <Plus size={20} strokeWidth={3} />
                Create Header
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} style={{ color: colors.primary }} />
            <p className="text-sm font-bold animate-pulse" style={{ color: colors.textSecondary }}>Syncing liquor data...</p>
          </div>
        ) : filteredMasters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-[40px] border-4 border-dashed gap-6" style={{ borderColor: colors.border }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-50">
              <Wine size={40} className="text-gray-300" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>No Headers Found</h3>
              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Try adjusting your search or create a new header entry.</p>
            </div>
            {!allEntryNamesFilled && (
              <button onClick={openAdd} className="font-bold text-primary hover:underline" style={{ color: colors.primary }}>
                Add your first header
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredMasters.map((m) => (
              <div
                key={m.id}
                className="group bg-white rounded-[32px] border transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col"
                style={{ borderColor: colors.border }}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ backgroundColor: colors.primary + "10", color: colors.primary }}>
                          ID: #{m.id}
                        </span>
                        {m.isActive ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                            <Check size={10} strokeWidth={3} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-error">
                            <X size={10} strokeWidth={3} /> Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors" style={{ color: colors.textPrimary }}>
                        {m.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm line-clamp-2 min-h-[40px] mb-6" style={{ color: colors.textSecondary }}>
                    {m.description || "No description provided for this liquor header."}
                  </p>

                  <div className="space-y-3">
                    {/* <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm">
                        <Wine size={14} className="text-primary" style={{ color: colors.primary }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Type & Brand</p>
                        <p className="text-xs font-bold truncate" style={{ color: colors.textPrimary }}>
                          {types.find(t => String(t.id) === String(m.wineTypeId))?.wineTypeName || "—"} / {brands.find(b => String(b.id) === String(m.wineBrandId))?.name || "—"}
                        </p>
                      </div>
                    </div> */}

                    {/* <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm">
                        <Globe size={14} className="text-primary" style={{ color: colors.primary }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Property Type</p>
                        <p className="text-xs font-bold truncate" style={{ color: colors.textPrimary }}>
                          {propertyTypes.find(pt => String(pt.id) === String(m.propertyTypeId))?.typeName || propertyTypes.find(pt => String(pt.id) === String(m.propertyTypeId))?.name || "Global"}
                        </p>
                      </div>
                    </div> */}
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex items-center justify-between gap-4" style={{ borderColor: colors.border }}>
                  <div className="flex -space-x-1 overflow-hidden">
                    {m.tags?.split(',').slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-gray-100 border border-white" style={{ color: colors.textSecondary }}>
                        {tag.trim()}
                      </span>
                    ))}
                    {(m.tags?.split(',').length || 0) > 3 && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-gray-100 border border-white" style={{ color: colors.textSecondary }}>
                        +{(m.tags?.split(',').length || 0) - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">
              <div className="px-10 py-8 border-b flex items-center justify-between shrink-0" style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">{editingItem ? "Update Header" : "Create Header"}</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">Configure your liquor page header entry details.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 rounded-2xl hover:bg-gray-200 transition-colors">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField label="Entry Name">
                    <select
                      className={inputCls}
                      style={inputStyle(!form.name && saving)}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    >
                      <option value="">Select Homepage Header Section</option>
                      {availableEntryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] font-bold text-gray-400">
                      Stored as a fixed key for wine homepage section headers.
                    </p>
                  </FormField>
                  <FormField label="Tags (comma separated)">
                    <input
                      type="text"
                      className={inputCls}
                      style={inputStyle()}
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="e.g. fresh, sweet, chilled"
                    />
                  </FormField>
                </div>

                <FormField label="Description">
                  <textarea
                    className={inputCls}
                    style={{ ...inputStyle(), minHeight: '100px' }}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide a compelling description for this liquor entry..."
                  />
                </FormField>

                <FormField label="Description Two">
                  <textarea
                    className={inputCls}
                    style={{ ...inputStyle(), minHeight: '100px' }}
                    value={form.descriptionTwo}
                    onChange={(e) => setForm({ ...form, descriptionTwo: e.target.value })}
                    placeholder="Provide a secondary description or detail..."
                  />
                </FormField>

                {/* <div className="bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowHierarchyScoping((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-4 p-8 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 shadow-inner">
                        <Layers size={20} className="text-primary" style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Hierarchy Scoping</h3>
                        <p className="text-[10px] font-bold text-gray-400">
                          Optional. Keep this closed for wine homepage header entries.
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gray-500 transition-transform ${showHierarchyScoping ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showHierarchyScoping && (
                    <div className="px-8 pb-8 border-t border-gray-100">
                      <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField label="Scoping Target">
                          <select
                            className={inputCls}
                            style={inputStyle()}
                            value={form.scopingLevel}
                            onChange={(e) => setForm({
                              ...form,
                              scopingLevel: e.target.value,
                              wineBrandId: "",
                              wineCategoryId: "",
                              wineSubCategoryId: "",
                            })}
                          >
                            <option value="TYPE">By Wine Type</option>
                            <option value="BRAND">By Wine Brand</option>
                            <option value="CATEGORY">By Wine Category</option>
                            <option value="SUBCATEGORY">By Wine SubCategory</option>
                          </select>
                        </FormField>

                        <div className="hidden md:block" />

                        {form.scopingLevel === "TYPE" && (
                          <FormField label="Wine Type">
                            <select
                              className={inputCls}
                              style={{ ...inputStyle(), cursor: "not-allowed", opacity: 0.7 }}
                              value={form.wineTypeId}
                              disabled={true}
                            >
                              <option value="">Select Wine Type</option>
                              {types.map((t) => <option key={t.id} value={t.id}>{t.wineTypeName}</option>)}
                            </select>
                            <p className="text-[9px] font-bold text-primary mt-1">LOCKED TO WINE</p>
                          </FormField>
                        )}

                        {form.scopingLevel === "BRAND" && (
                          <FormField label="Wine Brand">
                            <select
                              className={inputCls}
                              style={inputStyle()}
                              value={form.wineBrandId}
                              onChange={(e) => setForm({ ...form, wineBrandId: e.target.value })}
                            >
                              <option value="">Select Brand</option>
                              {availableBrands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          </FormField>
                        )}

                        {form.scopingLevel === "CATEGORY" && (
                          <FormField label="Wine Category">
                            <select
                              className={inputCls}
                              style={inputStyle()}
                              value={form.wineCategoryId}
                              onChange={(e) => setForm({ ...form, wineCategoryId: e.target.value })}
                            >
                              <option value="">Select Category</option>
                              {availableCategories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                          </FormField>
                        )}

                        {form.scopingLevel === "SUBCATEGORY" && (
                          <FormField label="Wine SubCategory">
                            <select
                              className={inputCls}
                              style={inputStyle()}
                              value={form.wineSubCategoryId}
                              onChange={(e) => setForm({ ...form, wineSubCategoryId: e.target.value })}
                            >
                              <option value="">Select SubCategory</option>
                              {availableSubCategories.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                          </FormField>
                        )}
                      </div>
                    </div>
                  )}
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField label="Property Type Scoping">
                    <select
                      className={inputCls}
                      style={{ ...inputStyle(), cursor: "not-allowed", opacity: 0.8 }}
                      value={form.propertyTypeId}
                      onChange={(e) => setForm({ ...form, propertyTypeId: e.target.value })}
                    >
                      <option value="">Select Wine Property Type</option>
                      {winePropertyTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.typeName || pt.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] font-bold text-gray-400">
                      Only the wine property type is available here.
                    </p>
                  </FormField>
                  <FormField label="Visibility Status">
                    <div className="flex items-center gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${form.isActive ? 'border-primary' : 'border-gray-300'}`}>
                          {form.isActive && <div className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: colors.primary }} />}
                        </div>
                        <input type="radio" className="hidden" checked={form.isActive} onChange={() => setForm({ ...form, isActive: true })} />
                        <span className={`text-sm font-bold ${form.isActive ? 'text-gray-900' : 'text-gray-400'}`}>Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!form.isActive ? 'border-primary' : 'border-gray-300'}`}>
                          {!form.isActive && <div className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: colors.primary }} />}
                        </div>
                        <input type="radio" className="hidden" checked={!form.isActive} onChange={() => setForm({ ...form, isActive: false })} />
                        <span className={`text-sm font-bold ${!form.isActive ? 'text-gray-900' : 'text-gray-400'}`}>Inactive</span>
                      </label>
                    </div>
                  </FormField>
                </div>
              </div>

              <div className="px-10 py-8 border-t bg-gray-50/50 flex items-center justify-end gap-4 shrink-0" style={{ borderColor: colors.border }}>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-3 px-10 py-3 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} strokeWidth={3} />}
                  {editingItem ? "Update Header" : "Initialize Header"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
