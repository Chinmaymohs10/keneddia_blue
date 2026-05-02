import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  MessageCircle,
  Image,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
  Check,
  Upload,
} from "lucide-react";
import {
  createWhatsAppInfo,
  getAllWhatsAppInfo,
  updateWhatsAppInfo,
  toggleWhatsAppInfoStatus,
  createIconUpload,
  getAllIconUploads,
  updateIconUpload,
  toggleIconUploadStatus,
  toggleIconUploadHeaderStatus,
  toggleIconUploadFooterStatus,
} from "@/Api/utilsApi";
import { GetAllPropertyDetails, getPropertyTypes, uploadMedia, getMediaById } from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCOPE_OPTIONS = [
  { label: "Main Homepage", value: "main" },
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
        <FormField label="Property Type *">
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
        <FormField label="Property *">
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

function EmptyState({ label }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed gap-3"
      style={{ borderColor: colors.border }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.mainBg }}
      >
        <Plus size={20} style={{ color: colors.textSecondary }} />
      </div>
      <p className="text-sm" style={{ color: colors.textSecondary }}>
        No entries yet. {label}
      </p>
    </div>
  );
}

// ─── Image Upload Component ───────────────────────────────────────────────────

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

// ─── WhatsApp Tab ─────────────────────────────────────────────────────────────

const WA_EMPTY = { phoneNumber: "", title: "", description: "", scope: "main", propertyTypeId: "", propertyId: "" };

function WhatsAppTab({ propertyTypes, properties }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState({});
  const [form, setForm] = useState(WA_EMPTY);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setItems(toList(await getAllWhatsAppInfo()));
    } catch {
      showError("Failed to fetch WhatsApp info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditing(null); setForm(WA_EMPTY); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      phoneNumber: item.phoneNumber || "",
      title: item.title || "",
      description: item.description || "",
      scope: item.propertyId ? "property" : item.propertyTypeId ? "propertyType" : "main",
      propertyTypeId: item.propertyTypeId || "",
      propertyId: item.propertyId || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.phoneNumber.trim()) return showError("Phone number is required");
    if (!form.title.trim()) return showError("Title is required");
    if (form.scope === "propertyType" && !form.propertyTypeId) return showError("Select a property type");
    if (form.scope === "property" && !form.propertyId) return showError("Select a property");

    const payload = {
      phoneNumber: form.phoneNumber.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      ...(form.scope === "propertyType" && { propertyTypeId: form.propertyTypeId }),
      ...(form.scope === "property" && { propertyId: form.propertyId }),
    };

    setSaving(true);
    try {
      editing ? await updateWhatsAppInfo(editing.id, payload) : await createWhatsAppInfo(payload);
      showSuccess(editing ? "Updated successfully" : "Created successfully");
      setShowModal(false);
      fetch();
    } catch (e) {
      showError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    setToggling((p) => ({ ...p, [item.id]: true }));
    try {
      await toggleWhatsAppInfoStatus(item.id, !item.active);
      showSuccess(item.active ? "Deactivated" : "Activated");
      fetch();
    } catch {
      showError("Failed to update status");
    } finally {
      setToggling((p) => ({ ...p, [item.id]: false }));
    }
  };

  const scopeLabel = (item) => {
    if (item.propertyId) {
      const p = properties.find((x) => String(x.id) === String(item.propertyId));
      return p?.propertyName || `Property #${item.propertyId}`;
    }
    if (item.propertyTypeId) {
      const pt = propertyTypes.find((x) => String(x.id) === String(item.propertyTypeId));
      return pt?.typeName || pt?.name || `Type #${item.propertyTypeId}`;
    }
    return "Main Homepage";
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>WhatsApp Numbers</h3>
          <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
            Manage WhatsApp contact numbers displayed across the site.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={16} /> Add Number
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: colors.primary }} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState label='Click "Add Number" to get started.' />
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: colors.border }}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: colors.mainBg }}>
                {["Title", "Phone Number", "Scope", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: colors.textSecondary, borderBottom: `1px solid ${colors.border}` }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? colors.contentBg : colors.previewBg,
                    borderBottom: `1px solid ${colors.borderLight}`,
                  }}
                >
                  <td className="px-5 py-4">
                    <span className="font-medium" style={{ color: colors.textPrimary }}>{item.title}</span>
                  </td>
                  <td className="px-5 py-4" style={{ color: colors.textPrimary }}>{item.phoneNumber}</td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: colors.mainBg, color: colors.textSecondary }}
                    >
                      {scopeLabel(item)}
                    </span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge active={item.active} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
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
                        {toggling[item.id]
                          ? <Loader2 size={14} className="animate-spin" />
                          : item.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-md" style={{ backgroundColor: colors.contentBg }}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: colors.border }}>
              <h3 className="font-bold text-base" style={{ color: colors.textPrimary }}>
                {editing ? "Edit WhatsApp Info" : "Add WhatsApp Info"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg" style={{ color: colors.textSecondary }}>
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <FormField label="Title *">
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Main Support"
                />
              </FormField>
              <FormField label="Phone Number *">
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="+91 99999 99999"
                />
              </FormField>
              <FormField label="Description">
                <textarea
                  className={inputCls + " resize-none"}
                  style={inputStyle}
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </FormField>
              <ScopeFields form={form} setForm={setForm} propertyTypes={propertyTypes} properties={properties} />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm border font-medium"
                style={{ borderColor: colors.border, color: colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Icon / Logo Tab ──────────────────────────────────────────────────────────

const ICON_EMPTY = {
  mediaId: null,
  previewUrl: "",
  description: "",
  showOnHeader: false,
  showOnFooter: false,
  scope: "main",
  propertyTypeId: "",
  propertyId: "",
};

function IconTab({ propertyTypes, properties }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toggling, setToggling] = useState({});
  const [form, setForm] = useState(ICON_EMPTY);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setItems(toList(await getAllIconUploads()));
    } catch {
      showError("Failed to fetch icon uploads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditing(null); setForm(ICON_EMPTY); setShowModal(true); };

  const openEdit = async (item) => {
    setEditing(item);
    let previewUrl = "";
    if (item.mediaId) {
      try {
        const res = await getMediaById(item.mediaId);
        previewUrl = res?.data?.url || res?.data?.data?.url || "";
      } catch { /* no preview */ }
    }
    setForm({
      mediaId: item.mediaId || null,
      previewUrl,
      description: item.description || "",
      showOnHeader: item.showOnHeader || false,
      showOnFooter: item.showOnFooter || false,
      scope: item.propertyId ? "property" : item.propertyTypeId ? "propertyType" : "main",
      propertyTypeId: item.propertyTypeId || "",
      propertyId: item.propertyId || "",
    });
    setShowModal(true);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const mediaId = typeof res.data === "number" ? res.data : (res.data?.id || res.data?.data?.id || res.data);
      const previewUrl = res.data?.url || res.data?.data?.url || URL.createObjectURL(file);
      setForm((p) => ({ ...p, mediaId, previewUrl }));
      showSuccess("Image uploaded successfully");
    } catch {
      showError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.mediaId) return showError("Please upload an image");
    if (form.scope === "propertyType" && !form.propertyTypeId) return showError("Select a property type");
    if (form.scope === "property" && !form.propertyId) return showError("Select a property");

    const payload = {
      mediaId: form.mediaId,
      description: form.description.trim(),
      showOnHeader: form.showOnHeader,
      showOnFooter: form.showOnFooter,
      ...(form.scope === "propertyType" && { propertyTypeId: form.propertyTypeId }),
      ...(form.scope === "property" && { propertyId: form.propertyId }),
    };

    setSaving(true);
    try {
      editing ? await updateIconUpload(editing.id, payload) : await createIconUpload(payload);
      showSuccess(editing ? "Updated successfully" : "Created successfully");
      setShowModal(false);
      fetch();
    } catch (e) {
      showError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    const key = `a_${item.id}`;
    setToggling((p) => ({ ...p, [key]: true }));
    try {
      await toggleIconUploadStatus(item.id, !item.active);
      showSuccess(item.active ? "Deactivated" : "Activated");
      fetch();
    } catch { showError("Failed"); }
    finally { setToggling((p) => ({ ...p, [key]: false })); }
  };

  const handleToggleHeader = async (item) => {
    const key = `h_${item.id}`;
    setToggling((p) => ({ ...p, [key]: true }));
    try {
      await toggleIconUploadHeaderStatus(item.id, !item.showOnHeader);
      showSuccess(`Header ${!item.showOnHeader ? "enabled" : "disabled"}`);
      fetch();
    } catch { showError("Failed"); }
    finally { setToggling((p) => ({ ...p, [key]: false })); }
  };

  const handleToggleFooter = async (item) => {
    const key = `f_${item.id}`;
    setToggling((p) => ({ ...p, [key]: true }));
    try {
      await toggleIconUploadFooterStatus(item.id, !item.showOnFooter);
      showSuccess(`Footer ${!item.showOnFooter ? "enabled" : "disabled"}`);
      fetch();
    } catch { showError("Failed"); }
    finally { setToggling((p) => ({ ...p, [key]: false })); }
  };

  const scopeLabel = (item) => {
    if (item.propertyId) {
      const p = properties.find((x) => String(x.id) === String(item.propertyId));
      return p?.propertyName || `Property #${item.propertyId}`;
    }
    if (item.propertyTypeId) {
      const pt = propertyTypes.find((x) => String(x.id) === String(item.propertyTypeId));
      return pt?.typeName || pt?.name || `Type #${item.propertyTypeId}`;
    }
    return "Main Homepage";
  };

  const PillToggle = ({ on, loading: l, onClick, label }) => (
    <button
      onClick={onClick}
      disabled={l}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
      style={{
        borderColor: on ? colors.success : colors.border,
        color: on ? colors.success : colors.textSecondary,
        backgroundColor: on ? colors.success + "12" : "transparent",
      }}
    >
      {l
        ? <Loader2 size={11} className="animate-spin" />
        : on ? <ToggleRight size={13} /> : <ToggleLeft size={13} />
      }
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>Logo / Icon Uploads</h3>
          <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
            Manage logos and icons displayed in headers and footers.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={16} /> Add Logo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: colors.primary }} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState label='Click "Add Logo" to get started.' />
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: colors.border }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: colors.mainBg }}>
                {["Preview", "Scope", "Header", "Footer", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: colors.textSecondary, borderBottom: `1px solid ${colors.border}` }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? colors.contentBg : colors.previewBg,
                    borderBottom: `1px solid ${colors.borderLight}`,
                  }}
                >
                  <td className="px-5 py-4">
                    <IconPreviewCell mediaId={item.mediaId} description={item.description} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: colors.mainBg, color: colors.textSecondary }}
                    >
                      {scopeLabel(item)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <PillToggle
                      on={item.showOnHeader}
                      loading={toggling[`h_${item.id}`]}
                      onClick={() => handleToggleHeader(item)}
                      label="Header"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <PillToggle
                      on={item.showOnFooter}
                      loading={toggling[`f_${item.id}`]}
                      onClick={() => handleToggleFooter(item)}
                      label="Footer"
                    />
                  </td>
                  <td className="px-5 py-4"><StatusBadge active={item.active} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg"
                        style={{ color: colors.info, backgroundColor: colors.info + "12" }}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={toggling[`a_${item.id}`]}
                        className="p-2 rounded-lg"
                        style={{
                          color: item.active ? colors.error : colors.success,
                          backgroundColor: item.active ? colors.error + "12" : colors.success + "12",
                        }}
                        title={item.active ? "Deactivate" : "Activate"}
                      >
                        {toggling[`a_${item.id}`]
                          ? <Loader2 size={14} className="animate-spin" />
                          : item.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ backgroundColor: colors.contentBg }}>
            <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0" style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}>
              <h3 className="font-bold text-base" style={{ color: colors.textPrimary }}>
                {editing ? "Edit Logo / Icon" : "Add Logo / Icon"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg" style={{ color: colors.textSecondary }}>
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <FormField label="Logo Image *">
                <ImageUpload
                  mediaId={form.mediaId}
                  previewUrl={form.previewUrl}
                  onUpload={handleUpload}
                  uploading={uploading}
                />
              </FormField>
              <FormField label="Description">
                <textarea
                  className={inputCls + " resize-none"}
                  style={inputStyle}
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional label or description"
                />
              </FormField>
              <div
                className="flex items-center gap-6 px-4 py-3 rounded-xl"
                style={{ backgroundColor: colors.mainBg }}
              >
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium" style={{ color: colors.textPrimary }}>
                  <input
                    type="checkbox"
                    checked={form.showOnHeader}
                    onChange={(e) => setForm((p) => ({ ...p, showOnHeader: e.target.checked }))}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  Show on Header
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium" style={{ color: colors.textPrimary }}>
                  <input
                    type="checkbox"
                    checked={form.showOnFooter}
                    onChange={(e) => setForm((p) => ({ ...p, showOnFooter: e.target.checked }))}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  Show on Footer
                </label>
              </div>
              <ScopeFields form={form} setForm={setForm} propertyTypes={propertyTypes} properties={properties} />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm border font-medium"
                style={{ borderColor: colors.border, color: colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: colors.primary, opacity: saving || uploading ? 0.7 : 1 }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Lazy image preview in table rows — fetches URL only when needed
function IconPreviewCell({ mediaId, description }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!mediaId) return;
    getMediaById(mediaId)
      .then((res) => setUrl(res?.data?.url || res?.data?.data?.url || null))
      .catch(() => {});
  }, [mediaId]);

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border"
        style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}
      >
        {url
          ? <img src={url} alt="icon" className="w-full h-full object-contain" />
          : <Image size={16} style={{ color: colors.textSecondary }} />
        }
      </div>
      {description && (
        <span className="text-xs truncate max-w-[120px]" style={{ color: colors.textSecondary }}>
          {description}
        </span>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "icon", label: "Logo / Icon", icon: Image },
];

function Utils() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    Promise.all([getPropertyTypes(), GetAllPropertyDetails()])
      .then(([ptRes, pRes]) => {
        setPropertyTypes(toList(ptRes));
        const pRaw = Array.isArray(pRes) ? pRes : pRes?.data || [];
        // normalize: each item has propertyResponseDTO.id / propertyResponseDTO.propertyName
        const pData = pRaw.map((item) => ({
          id: item.propertyResponseDTO?.id ?? item.id,
          propertyName: item.propertyResponseDTO?.propertyName ?? item.propertyName ?? item.name,
        }));
        setProperties(pData);
      })
      .catch(() => {});
  }, []);

  return (
    <Layout role="superadmin" showActions={false}>
      <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
        {/* Page Header */}
        <div>
          <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Utils</h2>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Configure site-wide WhatsApp contacts and logo/icon assets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl w-fit"
          style={{ backgroundColor: colors.mainBg, border: `1px solid ${colors.border}` }}
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: active ? colors.contentBg : "transparent",
                  color: active ? colors.primary : colors.textSecondary,
                  boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.contentBg, border: `1px solid ${colors.border}` }}
        >
          {activeTab === "whatsapp" && (
            <WhatsAppTab propertyTypes={propertyTypes} properties={properties} />
          )}
          {activeTab === "icon" && (
            <IconTab propertyTypes={propertyTypes} properties={properties} />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Utils;
