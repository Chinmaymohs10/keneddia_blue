import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Tag,
  Layers,
  Building2,
  Globe,
} from "lucide-react";
import {
  getAllWineTypes, createWineType, updateWineType, toggleWineTypeStatus,
  getAllWineBrands, createWineBrand, updateWineBrand, toggleWineBrandStatus,
  getAllWineCategories, createWineCategory, updateWineCategory, toggleWineCategoryStatus,
  getAllWineSubCategories, createWineSubCategory, updateWineSubCategory, toggleWineSubCategoryStatus
} from "@/Api/WineApi";
import { GetAllPropertyDetails, getPropertyTypes, uploadMedia } from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "types", label: "Wine Types", icon: Wine },
  { id: "brands", label: "Brands", icon: Tag },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "subcategories", label: "Subcategories", icon: Layers },
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

  const toggleProperty = (id) => {
    const currentIds = form.propertyIds || [];
    if (currentIds.includes(id)) {
      set("propertyIds", currentIds.filter((pid) => pid !== id));
    } else {
      set("propertyIds", [...currentIds, id]);
    }
  };

  return (
    <>
      <FormField label="Scope">
        <select className={inputCls} style={inputStyle} value={form.scope} onChange={(e) => set("scope", e.target.value)}>
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormField>

      {form.scope === "propertyType" && (
        <FormField label="Property Type">
          <select className={inputCls} style={inputStyle} value={form.propertyTypeId} onChange={(e) => set("propertyTypeId", e.target.value)}>
            <option value="">Select property type</option>
            {propertyTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.typeName || pt.name}</option>
            ))}
          </select>
        </FormField>
      )}

      {form.scope === "property" && (
        <FormField label="Property Selection">
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg" style={{ borderColor: colors.border }}>
            {properties.map((p) => (
              <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className="w-5 h-5 rounded border flex items-center justify-center transition-all"
                  style={{
                    borderColor: (form.propertyIds || []).includes(p.id) ? colors.primary : colors.border,
                    backgroundColor: (form.propertyIds || []).includes(p.id) ? colors.primary : "transparent"
                  }}
                >
                  {(form.propertyIds || []).includes(p.id) && <Check size={14} className="text-white" />}
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={(form.propertyIds || []).includes(p.id)}
                    onChange={() => toggleProperty(p.id)}
                  />
                </div>
                <span className="text-sm transition-colors group-hover:text-primary" style={{ color: (form.propertyIds || []).includes(p.id) ? colors.primary : colors.textPrimary }}>
                  {p.propertyName}
                </span>
              </label>
            ))}
            {properties.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: colors.textSecondary }}>No properties available</p>
            )}
          </div>
          <p className="text-[10px] mt-1 font-semibold" style={{ color: colors.textSecondary }}>
            Selected: <span style={{ color: colors.primary }}>{(form.propertyIds || []).length}</span> properties
          </p>
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
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: active ? colors.success : colors.error }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function EmptyState({ label, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed gap-3" style={{ borderColor: colors.border }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.mainBg }}>
        <Wine size={20} style={{ color: colors.textSecondary }} />
      </div>
      <p className="text-sm" style={{ color: colors.textSecondary }}>No entries yet. {label}</p>
      {onAdd && (
        <button onClick={onAdd} className="text-sm font-semibold underline" style={{ color: colors.primary }}>
          Add your first one
        </button>
      )}
    </div>
  );
}

function ImageUpload({ mediaId, previewUrl, onUpload, uploading, dimensionHint }) {
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
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="flex flex-col items-center gap-1 text-white text-xs">
              <Upload size={18} />
              Replace
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-gray-50" style={{ borderColor: colors.border }}>
          {uploading ? (
            <Loader2 size={24} className="animate-spin" style={{ color: colors.primary }} />
          ) : (
            <>
              <Upload size={24} style={{ color: colors.textSecondary }} />
              <span className="mt-2 text-xs" style={{ color: colors.textSecondary }}>Click to upload image</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {dimensionHint && (
        <p className="text-[10px] font-semibold flex items-center gap-1" style={{ color: colors.primary }}>
          <span style={{ color: colors.textSecondary }}>Recommended size:</span> {dimensionHint}
        </p>
      )}
      {mediaId && (
        <p className="text-xs" style={{ color: colors.textSecondary }}>
          Media ID: <span style={{ color: colors.textPrimary }}>{mediaId}</span>
        </p>
      )}
    </div>
  );
}

// ─── Consolidated Detail Modal ────────────────────────────────────────────────

const CollapsibleSection = memo(function CollapsibleSection({ title, icon: Icon, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
        style={{ backgroundColor: colors.mainBg }}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} style={{ color: colors.primary }} />}
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textPrimary }}>{title}</span>
          {count !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: colors.primary + "18", color: colors.primary }}>
              {count}
            </span>
          )}
        </div>
        {open
          ? <ChevronDown size={14} style={{ color: colors.textSecondary }} />
          : <ChevronRightIcon size={14} style={{ color: colors.textSecondary }} />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
});

const DetailModal = memo(function DetailModal({ item, tab, types, brands, categories, subcategories, properties, propertyTypes, onClose }) {
  if (!item) return null;

  // Memoize all hierarchy lookups so they don't recompute on every render
  const { wineType, brandList, categoryList, subList } = useMemo(() => {
    let wineType = null, brandList = [], categoryList = [], subList = [];
    if (tab === "types") {
      wineType = item;
      brandList = brands.filter((b) => String(b.wineTypeId) === String(item.id));
      const brandIds = new Set(brandList.map((b) => String(b.id)));
      categoryList = categories.filter((c) => brandIds.has(String(c.wineBrandId)));
      const catIds = new Set(categoryList.map((c) => String(c.id)));
      subList = subcategories.filter((s) => catIds.has(String(s.wineCategoryId)));
    } else if (tab === "brands") {
      wineType = types.find((t) => String(t.id) === String(item.wineTypeId)) || null;
      brandList = [item];
      categoryList = categories.filter((c) => String(c.wineBrandId) === String(item.id));
      const catIds = new Set(categoryList.map((c) => String(c.id)));
      subList = subcategories.filter((s) => catIds.has(String(s.wineCategoryId)));
    } else if (tab === "categories") {
      const brand = brands.find((b) => String(b.id) === String(item.wineBrandId));
      wineType = brand ? types.find((t) => String(t.id) === String(brand.wineTypeId)) || null : null;
      brandList = brand ? [brand] : [];
      categoryList = [item];
      subList = subcategories.filter((s) => String(s.wineCategoryId) === String(item.id));
    } else if (tab === "subcategories") {
      const cat = categories.find((c) => String(c.id) === String(item.wineCategoryId));
      const brand = cat ? brands.find((b) => String(b.id) === String(cat.wineBrandId)) : null;
      wineType = brand ? types.find((t) => String(t.id) === String(brand.wineTypeId)) || null : null;
      brandList = brand ? [brand] : [];
      categoryList = cat ? [cat] : [];
      subList = [item];
    }
    return { wineType, brandList, categoryList, subList };
  }, [item, tab, types, brands, categories, subcategories]);

  // Memoize scope label lookup map to avoid repeated finds in render
  const propMap = useMemo(() => new Map(properties.map((p) => [String(p.id), p])), [properties]);
  const ptMap = useMemo(() => new Map(propertyTypes.map((pt) => [String(pt.id), pt])), [propertyTypes]);

  const scopeLabel = useCallback((entry) => {
    if (entry.propertyIds && entry.propertyIds.length > 0) {
      return {
        icon: Building2,
        label: entry.propertyNames?.join(", ") || `${entry.propertyIds.length} Properties`,
        sub: "Specific Properties",
        isMultiple: true,
        names: entry.propertyNames || []
      };
    }
    if (entry.propertyId) {
      const prop = propMap.get(String(entry.propertyId));
      return { icon: Building2, label: prop?.propertyName || `Property #${entry.propertyId}`, sub: "Specific Property" };
    }
    if (entry.propertyTypeId) {
      const pt = ptMap.get(String(entry.propertyTypeId));
      return { icon: Globe, label: pt?.typeName || pt?.name || `Type #${entry.propertyTypeId}`, sub: "Property Type Homepage" };
    }
    return { icon: Globe, label: "Global / Unassigned", sub: "" };
  }, [propMap, ptMap]);

  // Category → subcategory map for fast lookup
  const catSubMap = useMemo(() => {
    const m = new Map();
    for (const s of subList) {
      const key = String(s.wineCategoryId);
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(s);
    }
    return m;
  }, [subList]);

  // Brand → categories map
  const brandCatMap = useMemo(() => {
    const m = new Map();
    for (const c of categoryList) {
      const key = String(c.wineBrandId);
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(c);
    }
    return m;
  }, [categoryList]);

  const itemName = item.wineTypeName || item.name || item.title || "—";
  const tabLabel = tab === "subcategories" ? "Subcategory" : tab === "categories" ? "Category" : tab === "brands" ? "Brand" : "Wine Type";
  const itemScope = scopeLabel(item);

  // Collect all assigned-property entries across the full hierarchy
  const assignedProperties = useMemo(() => {
    const all = [item, ...brandList.filter((b) => b.id !== item.id), ...categoryList.filter((c) => c.id !== item.id), ...subList.filter((s) => s.id !== item.id)];
    return all.filter((e) => (e.propertyIds && e.propertyIds.length > 0) || e.propertyId || e.propertyTypeId).map((e) => ({
      entry: e,
      scope: scopeLabel(e),
      name: e.wineTypeName || e.name || e.title || "Item",
    }));
  }, [item, brandList, categoryList, subList, scopeLabel]);

  return (
    <div className="fixed inset-0 z-110 bg-black/70 backdrop-blur-sm flex" onClick={onClose}>
      {/* Full-screen panel — slides in from right */}
      <div
        className="ml-auto h-full bg-white flex flex-col shadow-2xl"
        style={{ width: "min(960px, 100vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div
          className="flex items-center justify-between px-8 py-5 border-b shrink-0"
          style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: colors.primary + "18" }}
            >
              {item.media?.url
                ? <img src={item.media.url} alt="" className="w-full h-full object-cover" />
                : <Wine size={20} style={{ color: colors.primary }} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold truncate" style={{ color: colors.textPrimary }}>{itemName}</h2>
                <StatusBadge active={item.active} />
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{tabLabel}</span>
                <span style={{ color: colors.border }}>·</span>
                <span className="inline-flex items-center gap-1 text-xs" style={{ color: colors.textSecondary }}>
                  <itemScope.icon size={11} style={{ color: colors.primary }} />
                  {itemScope.label}
                  {itemScope.sub && <span className="opacity-60">({itemScope.sub})</span>}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        {/* ── Two-column body — both columns scroll independently ── */}
        <div className="flex flex-1 min-h-0 divide-x" style={{ borderColor: colors.border }}>

          {/* LEFT: Item info + hierarchy tree — fixed width, scrollable */}
          <div
            className="w-72 shrink-0 overflow-y-auto p-5 flex flex-col gap-6"
            style={{ overscrollBehavior: "contain", backgroundColor: colors.mainBg }}
          >
            {/* Description */}
            {(item.wineTypeDescription || item.description) && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: colors.textSecondary }}>Description</p>
                <p className="text-sm leading-relaxed" style={{ color: colors.textPrimary }}>
                  {item.wineTypeDescription || item.description}
                </p>
              </div>
            )}

            {/* Wine Type ancestry */}
            {wineType && tab !== "types" && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>Wine Type</p>
                <div className="flex items-center gap-2.5 p-3 rounded-xl border" style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}>
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: colors.primary + "18" }}>
                    {wineType.media?.url
                      ? <img src={wineType.media.url} alt="" className="w-full h-full object-cover" />
                      : <Wine size={13} style={{ color: colors.primary }} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{wineType.wineTypeName}</p>
                    <StatusBadge active={wineType.active} />
                  </div>
                </div>
              </div>
            )}

            {/* Summary counts */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>Hierarchy Summary</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { icon: Tag, label: "Brands", count: brandList.length, show: brandList.length > 0 },
                  { icon: Layers, label: "Categories", count: categoryList.length, show: categoryList.length > 0 },
                  { icon: Layers, label: "Subcategories", count: subList.length, show: subList.length > 0 },
                ].filter((r) => r.show).map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: colors.contentBg }}>
                    <div className="flex items-center gap-2">
                      <row.icon size={13} style={{ color: colors.primary }} />
                      <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>{row.label}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.primary + "18", color: colors.primary }}>{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned properties */}
            {assignedProperties.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>
                  Assigned Properties <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px]" style={{ backgroundColor: colors.primary + "18", color: colors.primary }}>{assignedProperties.length}</span>
                </p>
                <div className="flex flex-col gap-2">
                  {assignedProperties.map(({ entry, scope: s, name }, i) => (
                    <div key={i} className="flex flex-col gap-1 px-3 py-2.5 rounded-lg border" style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}>
                      <div className="flex items-start gap-2">
                        <s.icon size={13} className="shrink-0 mt-0.5" style={{ color: colors.primary }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate" style={{ color: colors.textPrimary }}>{s.label}</p>
                          <p className="text-[10px] truncate" style={{ color: colors.textSecondary }}>{s.sub} · {name}</p>
                        </div>
                      </div>
                      {s.isMultiple && s.names.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1 pl-5">
                          {s.names.map((n, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] font-medium" style={{ color: colors.textSecondary }}>
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Full hierarchy — free scrollable, no outer border/frame */}
          <div
            className="flex-1 overflow-y-auto p-6 flex flex-col gap-8"
            style={{ overscrollBehavior: "contain" }}
          >

            {/* BRANDS */}
            {brandList.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={15} style={{ color: colors.primary }} />
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: colors.textPrimary }}>
                    Brands <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.primary + "18", color: colors.primary }}>{brandList.length}</span>
                  </h3>
                </div>
                <div className="flex flex-col gap-5">
                  {brandList.map((b) => {
                    const bCats = brandCatMap.get(String(b.id)) || [];
                    const bs = scopeLabel(b);
                    return (
                      <div key={b.id}>
                        {/* Brand row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border" style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}>
                            {b.media?.url ? <img src={b.media.url} alt="" className="w-full h-full object-cover" /> : <Tag size={14} style={{ color: colors.textSecondary }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{b.name}</span>
                              <StatusBadge active={b.active} />
                            </div>
                            {(b.propertyId || b.propertyTypeId) && (
                              <span className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: colors.textSecondary }}>
                                <bs.icon size={10} style={{ color: colors.primary }} />{bs.label}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Categories under brand */}
                        {bCats.length > 0 && (
                          <div className="ml-6 flex flex-col gap-3 border-l-2 pl-4" style={{ borderColor: colors.border }}>
                            {bCats.map((c) => {
                              const cSubs = catSubMap.get(String(c.id)) || [];
                              return (
                                <div key={c.id}>
                                  {/* Category row */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <Layers size={13} style={{ color: colors.primary }} />
                                    <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>{c.title}</span>
                                    <StatusBadge active={c.active} />
                                    {(c.propertyId || c.propertyTypeId) && (() => {
                                      const cs = scopeLabel(c);
                                      return <span className="text-[10px] ml-auto flex items-center gap-0.5" style={{ color: colors.textSecondary }}><cs.icon size={9} />{cs.label}</span>;
                                    })()}
                                  </div>

                                  {/* Subcategory chips */}
                                  {cSubs.length > 0 && (
                                    <div className="ml-5 flex flex-wrap gap-1.5">
                                      {cSubs.map((s) => (
                                        <span
                                          key={s.id}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                                          style={{ backgroundColor: colors.primary + "12", color: colors.primary }}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.active ? colors.success : colors.error }} />
                                          {s.title}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* STANDALONE CATEGORIES (category tab) */}
            {tab === "categories" && categoryList.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={15} style={{ color: colors.primary }} />
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: colors.textPrimary }}>Category</h3>
                </div>
                {categoryList.map((c) => (
                  <div key={c.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{c.title}</span>
                      <StatusBadge active={c.active} />
                    </div>
                    {subList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ml-1">
                        {subList.map((s) => (
                          <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ backgroundColor: colors.primary + "12", color: colors.primary }}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.active ? colors.success : colors.error }} />
                            {s.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* STANDALONE SUBCATEGORY */}
            {tab === "subcategories" && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={15} style={{ color: colors.primary }} />
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: colors.textPrimary }}>Subcategory</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{item.title}</span>
                  <StatusBadge active={item.active} />
                </div>
              </section>
            )}

            {/* Empty right panel */}
            {brandList.length === 0 && tab !== "categories" && tab !== "subcategories" && (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16" style={{ color: colors.textSecondary }}>
                <Layers size={32} className="opacity-20" />
                <p className="text-sm">No child items linked yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function WineManagement() {
  const [activeTab, setActiveTab] = useState("types");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingContext, setLoadingContext] = useState(true);

  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Detail modal
  const [detailItem, setDetailItem] = useState(null);
  const [detailTab, setDetailTab] = useState(null);

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toggling, setToggling] = useState({});

  const [form, setForm] = useState({
    name: "", title: "", description: "",
    wineTypeId: "", wineBrandId: "", wineCategoryId: "",
    mediaId: null, previewUrl: "",
    scope: "propertyType", propertyId: "", propertyTypeId: "",
    propertyIds: [],
    showOnHomepage: false,
  });

  const resetForm = () => {
    setForm({ name: "", title: "", description: "", wineTypeId: "", wineBrandId: "", wineCategoryId: "", mediaId: null, previewUrl: "", scope: "propertyType", propertyId: "", propertyTypeId: "", propertyIds: [], showOnHomepage: false });
    setEditingItem(null);
  };

  const fetchContext = useCallback(async () => {
    try {
      const [ptRes, pRes] = await Promise.all([getPropertyTypes(), GetAllPropertyDetails()]);
      const allTypes = toList(ptRes);
      const wineTypes = allTypes.filter((pt) => (pt.typeName || pt.name || "").toLowerCase() === "wine");
      setPropertyTypes(wineTypes.length > 0 ? wineTypes : allTypes.filter((pt) => (pt.typeName || pt.name || "").toLowerCase().includes("wine")));
      const rawList = toList(pRes);
      const flatProps = rawList.map((item) => item.propertyResponseDTO ?? item).filter((p) => p && p.isActive === true);
      setProperties(flatProps);
    } catch {
      showError("Failed to fetch location context");
    } finally {
      setLoadingContext(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [t, b, c, s] = await Promise.all([getAllWineTypes(), getAllWineBrands(), getAllWineCategories(), getAllWineSubCategories()]);
      setTypes(toList(t));
      setBrands(toList(b));
      setCategories(toList(c));
      setSubcategories(toList(s));
    } catch {
      showError("Failed to fetch wine data");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchContext(); }, [fetchContext]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredData = useMemo(() => {
    if (activeTab === "types") return types;
    if (activeTab === "brands") return brands;
    if (activeTab === "categories") return categories;
    return subcategories;
  }, [activeTab, types, brands, categories, subcategories]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

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

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || item.wineTypeName || "",
      title: item.title || item.name || "",
      description: item.description || item.wineTypeDescription || "",
      wineTypeId: item.wineTypeId || "",
      wineBrandId: item.wineBrandId || "",
      wineCategoryId: item.wineCategoryId || "",
      mediaId: item.media?.mediaId || item.mediaId || null,
      previewUrl: item.media?.url || "",
      scope: (item.propertyIds && item.propertyIds.length > 0) ? "property" : (item.propertyId ? "property" : "propertyType"),
      propertyId: item.propertyId || "",
      propertyTypeId: item.propertyTypeId || "",
      propertyIds: item.propertyIds || (item.propertyId ? [item.propertyId] : []),
      showOnHomepage: item.showOnHomepage ?? false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const isType = activeTab === "types";
    const isBrand = activeTab === "brands";
    const isCategory = activeTab === "categories";
    const isSub = activeTab === "subcategories";

    const nameVal = isType ? form.name : isBrand ? form.name : form.title;
    if (!nameVal?.trim()) return showError(`${isType || isBrand ? "Name" : "Title"} is required`);

    const payload = {
      description: form.description.trim(),
      mediaId: form.mediaId,
      ...(form.scope === "property" && { propertyIds: form.propertyIds }),
      ...(form.scope === "propertyType" && { propertyTypeId: form.propertyTypeId }),
    };

    if (isType) { payload.wineTypeName = form.name.trim(); payload.wineTypeDescription = form.description.trim(); }
    else if (isBrand) { payload.name = form.name.trim(); payload.wineTypeId = form.wineTypeId; }
    else if (isCategory) { payload.title = form.title.trim(); payload.wineBrandId = form.wineBrandId; }
    else if (isSub) {
      payload.name = form.title.trim();
      payload.wineCategoryId = form.wineCategoryId;
      payload.showOnHomepage = form.showOnHomepage;
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

  // Parent name helpers for the table
  const parentName = (item) => {
    if (activeTab === "brands") return types.find((t) => String(t.id) === String(item.wineTypeId))?.wineTypeName || item.wineTypeName || "—";
    if (activeTab === "categories") return brands.find((b) => String(b.id) === String(item.wineBrandId))?.name || item.wineBrandName || "—";
    if (activeTab === "subcategories") return categories.find((c) => String(c.id) === String(item.wineCategoryId))?.title || item.wineCategoryName || "—";
    return "Top Level";
  };

  const childCount = (item) => {
    if (activeTab === "types") return brands.filter((b) => String(b.wineTypeId) === String(item.id)).length;
    if (activeTab === "brands") return categories.filter((c) => String(c.wineBrandId) === String(item.id)).length;
    if (activeTab === "categories") return subcategories.filter((s) => String(s.wineCategoryId) === String(item.id)).length;
    return null;
  };

  return (
    <Layout>
      <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-[1600px] mx-auto h-full overflow-y-auto scroll-smooth" style={{ overscrollBehavior: "contain" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>Wine Management</h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Configure wine types, brands, categories and subcategories.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={18} />
            Add {activeTab === "categories" ? "Category" : activeTab === "subcategories" ? "Subcategory" : activeTab.slice(0, -1)}
          </button>
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
              {/* child count badge */}
              {(() => {
                const count = activeTab === tab.id ? null :
                  tab.id === "brands" ? brands.length :
                    tab.id === "categories" ? categories.length :
                      tab.id === "subcategories" ? subcategories.length :
                        types.length;
                return count !== null ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: colors.border, color: colors.textSecondary }}>{count}</span>
                ) : null;
              })()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: colors.border, contain: "layout style" }}>
          {dataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: colors.primary }} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}>
                <table className="w-full text-sm" style={{ tableLayout: "fixed", minWidth: 820 }}>
                  <colgroup>
                    <col style={{ width: 56 }} />
                    <col style={{ width: 64 }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: 96 }} />
                    <col style={{ width: 120 }} />
                  </colgroup>
                  <thead>
                    <tr style={{ backgroundColor: colors.mainBg }}>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>ID</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Image</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Name / Title</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Parent</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Children</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Scope</th>
                      <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Status</th>
                      <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[10px]" style={{ color: colors.textSecondary }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.borderLight }}>
                    {currentItems.map((item) => {
                      const cc = childCount(item);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-[10px]" style={{ color: colors.textSecondary }}>#{item.id}</td>
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center" style={{ borderColor: colors.border }}>
                              {item.media?.url
                                ? <img src={item.media.url} alt="" className="w-full h-full object-cover" />
                                : <Wine size={16} style={{ color: colors.textSecondary }} />}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                                {activeTab === "types" ? item.wineTypeName : activeTab === "brands" ? item.name : item.title}
                              </span>
                              <span className="text-[10px] max-w-[200px] truncate" style={{ color: colors.textSecondary }}>
                                {item.wineTypeDescription || item.description || "No description"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>{parentName(item)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {cc !== null ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: colors.primary + "12", color: colors.primary }}>
                                {cc} {activeTab === "types" ? "brands" : activeTab === "brands" ? "categories" : "subcategories"}
                              </span>
                            ) : <span className="text-xs" style={{ color: colors.textSecondary }}>—</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold uppercase" style={{ color: colors.primary }}>
                                {item.propertyIds?.length > 0 ? `${item.propertyIds.length} Properties` : item.propertyId ? "Specific Property" : item.propertyTypeId ? "Property Type" : "Global"}
                              </span>
                              <span className="text-xs truncate max-w-[120px]" style={{ color: colors.textSecondary }}>
                                {item.propertyIds?.length > 0 ? item.propertyNames?.join(", ") : (item.propertyName || item.propertyTypeName || "—")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><StatusBadge active={item.active} /></td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Eye → opens consolidated detail modal */}
                              <button
                                onClick={() => { setDetailItem(item); setDetailTab(activeTab); }}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: colors.primary, backgroundColor: colors.primary + "12" }}
                                title="View full hierarchy"
                              >
                                <Eye size={14} />
                              </button>
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
                      );
                    })}
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <EmptyState label={`No ${activeTab} found.`} onAdd={() => { resetForm(); setShowModal(true); }} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: colors.borderLight, backgroundColor: colors.mainBg }}>
                  <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    Showing <span style={{ color: colors.textPrimary }}>{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span style={{ color: colors.textPrimary }}>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{" "}
                    <span style={{ color: colors.textPrimary }}>{filteredData.length}</span> entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border transition-all disabled:opacity-30" style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}>
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                        style={{ backgroundColor: currentPage === i + 1 ? colors.primary : colors.contentBg, color: currentPage === i + 1 ? "white" : colors.textSecondary, border: currentPage === i + 1 ? "none" : `1px solid ${colors.border}` }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border transition-all disabled:opacity-30" style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Consolidated Detail Modal */}
      {detailItem && (
        <DetailModal
          item={detailItem}
          tab={detailTab}
          types={types}
          brands={brands}
          categories={categories}
          subcategories={subcategories}
          properties={properties}
          propertyTypes={propertyTypes}
          onClose={() => { setDetailItem(null); setDetailTab(null); }}
        />
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                <ImageUpload
                  mediaId={form.mediaId}
                  previewUrl={form.previewUrl}
                  onUpload={handleUpload}
                  uploading={uploading}
                  dimensionHint={(activeTab === "categories" || activeTab === "subcategories") ? "2736 × 3648 px (portrait)" : undefined}
                />
              </FormField>

              {(activeTab === "types" || activeTab === "brands") ? (
                <FormField label="Name *">
                  <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Enter name" />
                </FormField>
              ) : (
                <FormField label="Title *">
                  <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Enter title" />
                </FormField>
              )}

              <FormField label="Description">
                <textarea className={inputCls} style={inputStyle} rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Enter description" />
              </FormField>

              {activeTab === "brands" && (
                <FormField label="Wine Type *">
                  <select className={inputCls} style={inputStyle} value={form.wineTypeId} onChange={(e) => setForm((p) => ({ ...p, wineTypeId: e.target.value }))}>
                    <option value="">Select Wine Type</option>
                    {types.map((t) => <option key={t.id} value={t.id}>{t.wineTypeName}</option>)}
                  </select>
                </FormField>
              )}

              {activeTab === "categories" && (
                <FormField label="Wine Brand *">
                  <select className={inputCls} style={inputStyle} value={form.wineBrandId} onChange={(e) => setForm((p) => ({ ...p, wineBrandId: e.target.value }))}>
                    <option value="">Select Brand</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </FormField>
              )}

              {activeTab === "subcategories" && (
                <FormField label="Wine Category *">
                  <select className={inputCls} style={inputStyle} value={form.wineCategoryId} onChange={(e) => setForm((p) => ({ ...p, wineCategoryId: e.target.value }))}>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </FormField>
              )}

              <ScopeFields form={form} setForm={setForm} propertyTypes={propertyTypes} properties={properties} />

              {activeTab === "subcategories" && (
                <div className="flex items-center justify-between p-4 rounded-2xl border bg-gray-50/50" style={{ borderColor: colors.border }}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textPrimary }}>Show on Homepage</span>
                    <p className="text-[10px]" style={{ color: colors.textSecondary }}>Display this product in the Best Sellers section on the wine homepage.</p>
                  </div>
                  <button
                    onClick={() => setForm(p => ({ ...p, showOnHomepage: !p.showOnHomepage }))}
                    className="transition-colors"
                    style={{ color: form.showOnHomepage ? colors.success : colors.textSecondary }}
                  >
                    {form.showOnHomepage ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              )}
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
