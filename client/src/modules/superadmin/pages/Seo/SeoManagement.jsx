import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/modules/layout/Layout";
import { colors } from "@/lib/colors/colors";
import {
  addGoogleTag,
  addMetaData,
  deleteGoogleTag,
  deleteMetaData,
  getAllGoogleTags,
  getAllMetaData,
  GetAllPropertyDetails,
  getPropertyTypes,
  updateGoogleTag,
  updateMetaData,
} from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import { Globe, Loader2, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";

const META_INITIAL = {
  targetType: "property",
  propertyId: "",
  propertyTypeId: "",
  metaTitle: "",
  metaDescription: "",
  skima: "",
  metaKeywords: "",
  url: "",
};

const GOOGLE_INITIAL = {
  headerUrl: "",
  bodyUrl: "",
};

const toList = (response) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizePropertyItem = (item) => {
  if (!item) return null;

  if (item.propertyResponseDTO) {
    return {
      ...item.propertyResponseDTO,
      propertyListings: item.propertyListingResponseDTOS || [],
    };
  }

  return item;
};

const getItemId = (item) => String(item?.id ?? "");
const propertyLabel = (item) => item?.propertyName || item?.name || `Property #${item?.id}`;
const typeLabel = (item) => item?.typeName || item?.name || item?.propertyType || `Type #${item?.id}`;

const buildTargetPayload = (form) =>
  form.targetType === "propertyType"
    ? { propertyTypeId: Number(form.propertyTypeId), propertyId: null }
    : { propertyId: Number(form.propertyId), propertyTypeId: null };

function SeoManagement() {
  const [activeSection, setActiveSection] = useState("meta");
  const [loading, setLoading] = useState(true);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [metaList, setMetaList] = useState([]);
  const [googleList, setGoogleList] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [metaForm, setMetaForm] = useState(META_INITIAL);
  const [googleForm, setGoogleForm] = useState(GOOGLE_INITIAL);
  const [editingMetaId, setEditingMetaId] = useState(null);
  const [editingGoogleId, setEditingGoogleId] = useState(null);
  const [metaSearch, setMetaSearch] = useState("");
  const [googleSearch, setGoogleSearch] = useState("");

  const propertyOptions = useMemo(
    () => properties.map((item) => ({ value: getItemId(item), label: propertyLabel(item) })),
    [properties],
  );
  const propertyTypeOptions = useMemo(
    () => propertyTypes.map((item) => ({ value: getItemId(item), label: typeLabel(item) })),
    [propertyTypes],
  );
  const propertyMap = useMemo(
    () => Object.fromEntries(propertyOptions.map((item) => [item.value, item.label])),
    [propertyOptions],
  );
  const propertyTypeMap = useMemo(
    () => Object.fromEntries(propertyTypeOptions.map((item) => [item.value, item.label])),
    [propertyTypeOptions],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [metaRes, googleRes, propertyRes, propertyTypeRes] = await Promise.all([
        getAllMetaData(),
        getAllGoogleTags(),
        GetAllPropertyDetails(),
        getPropertyTypes(),
      ]);
      setMetaList(toList(metaRes));
      setGoogleList(toList(googleRes));
      setProperties(toList(propertyRes).map(normalizePropertyItem).filter(Boolean));
      setPropertyTypes(toList(propertyTypeRes));
    } catch (error) {
      console.error("SEO load error:", error);
      showError("Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetMetaForm = () => {
    setMetaForm(META_INITIAL);
    setEditingMetaId(null);
  };

  const resetGoogleForm = () => {
    setGoogleForm(GOOGLE_INITIAL);
    setEditingGoogleId(null);
  };

  const targetLabel = (item) => {
    if (item?.propertyTypeId) {
      return propertyTypeMap[String(item.propertyTypeId)] || `Type #${item.propertyTypeId}`;
    }
    if (item?.propertyId) {
      return propertyMap[String(item.propertyId)] || `Property #${item.propertyId}`;
    }
    return "Not linked";
  };

  const targetTypeLabel = (item) =>
    item?.propertyTypeId ? "Property Type (Homepage)" : "Property";

  const filteredMeta = useMemo(() => {
    const query = metaSearch.trim().toLowerCase();
    if (!query) return metaList;
    return metaList.filter((item) =>
      [
        item.metaTitle,
        item.metaDescription,
        item.metaKeywords,
        item.skima,
        item.url,
        targetLabel(item),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [metaList, metaSearch, propertyMap, propertyTypeMap]);

  const filteredGoogle = useMemo(() => {
    const query = googleSearch.trim().toLowerCase();
    if (!query) return googleList;
    return googleList.filter((item) =>
      [item.category, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [googleList, googleSearch]);

  const hasGoogleEntry = googleList.length > 0;
  const canCreateGoogle = !hasGoogleEntry || Boolean(editingGoogleId);

  const saveMeta = async (event) => {
    event.preventDefault();
    if (metaForm.targetType === "property" && !metaForm.propertyId) return showError("Select a property");
    if (metaForm.targetType === "propertyType" && !metaForm.propertyTypeId) return showError("Select a property type");
    if (!metaForm.metaTitle.trim()) return showError("Meta title is required");
    if (!metaForm.metaDescription.trim()) return showError("Meta description is required");

    const payload = {
      ...buildTargetPayload(metaForm),
      metaTitle: metaForm.metaTitle.trim(),
      metaDescription: metaForm.metaDescription.trim(),
      skima: metaForm.skima.trim(),
      metaKeywords: metaForm.metaKeywords.trim(),
      url: metaForm.url.trim(),
    };

    try {
      setSavingMeta(true);
      if (editingMetaId) {
        await updateMetaData(editingMetaId, payload);
        showSuccess("Meta tag updated successfully");
      } else {
        await addMetaData(payload);
        showSuccess("Meta tag created successfully");
      }
      resetMetaForm();
      loadData();
    } catch (error) {
      console.error("Meta save error:", error);
      showError(error?.response?.data?.message || "Failed to save meta tag");
    } finally {
      setSavingMeta(false);
    }
  };

  const saveGoogle = async (event) => {
    event.preventDefault();
    if (!canCreateGoogle) return showError("Only one Google tag section is allowed");
    if (!googleForm.headerUrl.trim() && !googleForm.bodyUrl.trim()) {
      return showError("At least one URL is required");
    }

    const payload = {
      category: googleForm.headerUrl.trim(),
      description: googleForm.bodyUrl.trim(),
    };

    try {
      setSavingGoogle(true);
      if (editingGoogleId) {
        await updateGoogleTag(editingGoogleId, payload);
        showSuccess("Google tag updated successfully");
      } else {
        await addGoogleTag(payload);
        showSuccess("Google tag created successfully");
      }
      resetGoogleForm();
      loadData();
    } catch (error) {
      console.error("Google save error:", error);
      showError(error?.response?.data?.message || "Failed to save Google tag");
    } finally {
      setSavingGoogle(false);
    }
  };

  const editMeta = (item) => {
    setActiveSection("meta");
    setEditingMetaId(item.id);
    setMetaForm({
      targetType: item.propertyTypeId ? "propertyType" : "property",
      propertyId: item.propertyId ? String(item.propertyId) : "",
      propertyTypeId: item.propertyTypeId ? String(item.propertyTypeId) : "",
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      skima: item.skima || "",
      metaKeywords: item.metaKeywords || "",
      url: item.url || "",
    });
  };

  const editGoogle = (item) => {
    setActiveSection("google");
    setEditingGoogleId(item.id);
    setGoogleForm({
      headerUrl: item.category || "",
      bodyUrl: item.description || "",
    });
  };

  const removeMeta = async (id) => {
    try {
      setDeletingId(`meta-${id}`);
      await deleteMetaData(id);
      showSuccess("Meta tag deleted successfully");
      if (editingMetaId === id) resetMetaForm();
      loadData();
    } catch (error) {
      console.error("Meta delete error:", error);
      showError(error?.response?.data?.message || "Failed to delete meta tag");
    } finally {
      setDeletingId("");
    }
  };

  const removeGoogle = async (id) => {
    try {
      setDeletingId(`google-${id}`);
      await deleteGoogleTag(id);
      showSuccess("Google tag deleted successfully");
      if (editingGoogleId === id) resetGoogleForm();
      loadData();
    } catch (error) {
      console.error("Google delete error:", error);
      showError(error?.response?.data?.message || "Failed to delete Google tag");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Layout role="superadmin" showActions={false}>
      <div className="h-full overflow-y-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: colors.border }}>
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>SEO Management</h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Manage meta tags and a single global Google tag configuration.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SectionTab active={activeSection === "meta"} onClick={() => setActiveSection("meta")} icon={Tag} label="Meta Tag" />
                <SectionTab active={activeSection === "google"} onClick={() => setActiveSection("google")} icon={Globe} label="Google Tag" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: colors.primary }} />
            </div>
          ) : (
            <div className="p-4 md:p-6">
              {activeSection === "meta" ? (
                <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
                  <SeoFormCard
                    title={editingMetaId ? "Edit Meta Tag" : "Create Meta Tag"}
                    subtitle="Configure metadata for a property page or homepage type."
                    clearable={Boolean(editingMetaId)}
                    onClear={resetMetaForm}
                  >
                    <form onSubmit={saveMeta} className="space-y-4">
                      <TargetSelector
                        form={metaForm}
                        onFormChange={setMetaForm}
                        propertyOptions={propertyOptions}
                        propertyTypeOptions={propertyTypeOptions}
                        prefix="meta"
                      />
                      <Field label="Meta Title" value={metaForm.metaTitle} onChange={(value) => setMetaForm((prev) => ({ ...prev, metaTitle: value }))} />
                      <TextAreaField label="Meta Description" rows={4} value={metaForm.metaDescription} onChange={(value) => setMetaForm((prev) => ({ ...prev, metaDescription: value }))} />
                      <Field label="Schema" value={metaForm.skima} onChange={(value) => setMetaForm((prev) => ({ ...prev, skima: value }))} />
                      <Field label="Meta Keywords" value={metaForm.metaKeywords} onChange={(value) => setMetaForm((prev) => ({ ...prev, metaKeywords: value }))} />
                      <Field label="URL" type="url" placeholder="https://example.com/page" value={metaForm.url} onChange={(value) => setMetaForm((prev) => ({ ...prev, url: value }))} />
                      <SubmitButton loading={savingMeta} label={editingMetaId ? "Update Meta Tag" : "Add Meta Tag"} />
                    </form>
                  </SeoFormCard>

                  <SeoTableCard
                    title="Meta Tags"
                    count={filteredMeta.length}
                    searchValue={metaSearch}
                    onSearchChange={setMetaSearch}
                    searchPlaceholder="Search meta tags..."
                    emptyMessage="No meta tags found."
                  >
                    <table className="w-full min-w-[920px]">
                      <thead>
                        <tr style={{ backgroundColor: colors.mainBg }}>
                          <Th>Target</Th><Th>Type</Th><Th>Title</Th><Th>Description</Th><Th>Keywords</Th><Th>URL</Th><Th>Status</Th><Th align="right">Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMeta.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <Td>{targetLabel(item)}</Td>
                            <Td>{targetTypeLabel(item)}</Td>
                            <Td>{item.metaTitle || "-"}</Td>
                            <Td>{item.metaDescription || "-"}</Td>
                            <Td>{item.metaKeywords || "-"}</Td>
                            <Td>{item.url || "-"}</Td>
                            <Td><StatusBadge active={item.active ?? item.status} /></Td>
                            <Td align="right">
                              <ActionButtons
                                onEdit={() => editMeta(item)}
                                onDelete={() => removeMeta(item.id)}
                                deleting={deletingId === `meta-${item.id}`}
                              />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </SeoTableCard>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
                  <SeoFormCard
                    title={editingGoogleId ? "Edit Google Tag" : "Create Google Tag"}
                    subtitle={
                      canCreateGoogle
                        ? "Store one global Google tag entry with separate header and body URLs."
                        : "A Google tag entry already exists. Use edit or delete from the table."
                    }
                    clearable={Boolean(editingGoogleId)}
                    onClear={resetGoogleForm}
                  >
                    <form onSubmit={saveGoogle} className="space-y-4">
                      <Field
                        label="Header URL"
                        type="url"
                        placeholder="https://example.com/header-tag.js"
                        value={googleForm.headerUrl}
                        onChange={(value) => setGoogleForm((prev) => ({ ...prev, headerUrl: value }))}
                        disabled={!canCreateGoogle}
                      />
                      <Field
                        label="Body URL"
                        type="url"
                        placeholder="https://example.com/body-tag"
                        value={googleForm.bodyUrl}
                        onChange={(value) => setGoogleForm((prev) => ({ ...prev, bodyUrl: value }))}
                        disabled={!canCreateGoogle}
                      />
                      <SubmitButton
                        loading={savingGoogle}
                        label={editingGoogleId ? "Update Google Tag" : "Add Google Tag"}
                        disabled={!canCreateGoogle}
                      />
                    </form>
                  </SeoFormCard>

                  <SeoTableCard
                    title="Google Tags"
                    count={filteredGoogle.length}
                    searchValue={googleSearch}
                    onSearchChange={setGoogleSearch}
                    searchPlaceholder="Search Google tags..."
                    emptyMessage="No Google tags found."
                  >
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr style={{ backgroundColor: colors.mainBg }}>
                          <Th>Header URL</Th><Th>Body URL</Th><Th>Status</Th><Th align="right">Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredGoogle.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <Td>{item.category || "-"}</Td>
                            <Td>{item.description || "-"}</Td>
                            <Td><StatusBadge active={item.active ?? item.status} /></Td>
                            <Td align="right">
                              <ActionButtons
                                onEdit={() => editGoogle(item)}
                                onDelete={() => removeGoogle(item.id)}
                                deleting={deletingId === `google-${item.id}`}
                              />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </SeoTableCard>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function SectionTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
      style={{
        borderColor: active ? colors.primary : colors.border,
        color: active ? colors.primary : colors.textPrimary,
        backgroundColor: active ? `${colors.primary}10` : "#fff",
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function SeoFormCard({ title, subtitle, clearable, onClear, children }) {
  return (
    <div className="bg-[#fcfcfc] rounded-xl border p-5 h-fit" style={{ borderColor: colors.border }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{title}</h3>
          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{subtitle}</p>
        </div>
        {clearable ? (
          <button type="button" onClick={onClear} className="text-xs font-medium" style={{ color: colors.primary }}>
            Clear
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function SeoTableCard({
  title,
  count,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  emptyMessage,
  children,
}) {
  const rowCount = React.Children.count(children?.props?.children?.[1]?.props?.children);

  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
      <div className="p-5 border-b" style={{ borderColor: colors.border }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>{title}</h3>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{count} entries available</p>
          </div>
          <SearchBox value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
        </div>
      </div>
      {rowCount > 0 ? (
        <div className="overflow-x-auto">{children}</div>
      ) : (
        <div className="py-16 text-center text-sm" style={{ color: colors.textSecondary }}>
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

function TargetSelector({
  form,
  onFormChange,
  propertyOptions,
  propertyTypeOptions,
  prefix,
}) {
  const changeTargetType = (targetType) =>
    onFormChange((prev) => ({
      ...prev,
      targetType,
      propertyId: "",
      propertyTypeId: "",
    }));

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Target Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => changeTargetType("property")}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium"
            style={{
              borderColor: form.targetType === "property" ? colors.primary : colors.border,
              color: form.targetType === "property" ? colors.primary : colors.textPrimary,
              backgroundColor: form.targetType === "property" ? `${colors.primary}10` : "#fff",
            }}
          >
            Property
          </button>
          <button
            type="button"
            onClick={() => changeTargetType("propertyType")}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium"
            style={{
              borderColor: form.targetType === "propertyType" ? colors.primary : colors.border,
              color: form.targetType === "propertyType" ? colors.primary : colors.textPrimary,
              backgroundColor: form.targetType === "propertyType" ? `${colors.primary}10` : "#fff",
            }}
          >
            Property Type (Homepage)
          </button>
        </div>
      </div>

      {form.targetType === "property" ? (
        <SelectField
          id={`${prefix}-property`}
          label="Property"
          value={form.propertyId}
          onChange={(value) => onFormChange((prev) => ({ ...prev, propertyId: value }))}
          options={propertyOptions}
          placeholder="Select property"
        />
      ) : (
        <SelectField
          id={`${prefix}-property-type`}
          label="Property Type"
          value={form.propertyTypeId}
          onChange={(value) => onFormChange((prev) => ({ ...prev, propertyTypeId: value }))}
          options={propertyTypeOptions}
          placeholder="Select property type"
        />
      )}
    </>
  );
}

function SelectField({ id, label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
        style={{ borderColor: colors.border, color: colors.textPrimary }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        style={{ borderColor: colors.border, color: colors.textPrimary }}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
        style={{ borderColor: colors.border, color: colors.textPrimary }}
      />
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full md:w-72">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textSecondary }} />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none"
        style={{ borderColor: colors.border, color: colors.textPrimary }}
      />
    </div>
  );
}

function SubmitButton({ loading, label, disabled = false }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-70"
      style={{ backgroundColor: colors.primary }}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      {label}
    </button>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${align === "right" ? "text-right" : "text-left"}`}
      style={{ color: colors.textSecondary }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }) {
  return (
    <td
      className={`px-4 py-4 text-sm align-top ${align === "right" ? "text-right" : "text-left"}`}
      style={{ color: colors.textPrimary }}
    >
      {children}
    </td>
  );
}

function StatusBadge({ active }) {
  const isActive = Boolean(active);
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: isActive ? "#10b98115" : "#ef444415",
        color: isActive ? "#10b981" : "#ef4444",
      }}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function ActionButtons({ onEdit, onDelete, deleting }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={onEdit} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Pencil size={15} style={{ color: colors.primary }} />
      </button>
      <button
        type="button"
        disabled={deleting}
        onClick={() => {
          if (window.confirm("Delete this SEO entry?")) onDelete();
        }}
        className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        {deleting ? <Loader2 size={15} className="animate-spin text-red-500" /> : <Trash2 size={15} className="text-red-500" />}
      </button>
    </div>
  );
}

export default SeoManagement;
