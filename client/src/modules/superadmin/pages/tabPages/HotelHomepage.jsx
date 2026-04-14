import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Save,
  Loader2,
  ImageIcon,
  X,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Users,
  Building2,
} from "lucide-react";
import {
  createMenuHeaderSection,
  getMenuHeaders,
  updateMenuHeadersSection,
  toggleMenuHeadersSectionStatus,
  getMenuSectionsByPropertyTypeId,
} from "@/Api/RestaurantApi";
import {
  addGroupBooking,
  updateGroupBooking,
  getGroupBookings,
  getAllProperties,
  getPropertyTypes,
} from "@/Api/Api";
import { toast } from "react-hot-toast";

// ── Shared helpers ─────────────────────────────────────────────────────────────
const inp =
  "w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all";

const Field = ({ label, children, required }) => (
  <div>
    <label
      className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
      style={{ color: colors.textSecondary }}
    >
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

// ── Image upload helper ────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, onClear }) {
  const displayUrl = typeof value === "string" && value ? value : null;
  return (
    <div className="flex items-center gap-3">
      <label
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed text-xs font-medium cursor-pointer transition-all hover:opacity-80"
        style={{
          borderColor: colors.border,
          color: colors.textSecondary,
          backgroundColor: colors.mainBg,
        }}
      >
        <ImageIcon size={13} />
        {displayUrl ? "Change Image" : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onChange(URL.createObjectURL(file), file);
          }}
        />
      </label>
      {displayUrl && (
        <>
          <img
            src={displayUrl}
            alt="preview"
            className="w-10 h-10 rounded-lg object-cover border"
            style={{ borderColor: colors.border }}
          />
          <button
            type="button"
            onClick={onClear}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={13} />
          </button>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-TAB 1 — Menu Header
// ══════════════════════════════════════════════════════════════════════════════
function MenuHeaderTab() {
  const [form, setForm] = useState({
    part1: "",
    part2: "",
    description: "",
    isActive: true,
    propertyTypeId: "",
    existingId: null,
  });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      setLoadingPropertyTypes(true);
      try {
        const pRes = await getPropertyTypes();
        const pData = pRes.data?.data || pRes.data || pRes;
        if (Array.isArray(pData)) setPropertyTypes(pData.filter((p) => p.isActive));
      } catch {
        toast.error("Failed to load property types");
      } finally {
        setLoadingPropertyTypes(false);
      }
    };
    fetchInit();
  }, []);

  // When propertyTypeId changes, load the matching header
  useEffect(() => {
    if (!form.propertyTypeId) {
      setForm(p => ({
        ...p, part1: "", part2: "", description: "", isActive: true, existingId: null
      }));
      return;
    }

    const fetchHeader = async () => {
      setFetching(true);
      try {
        const res = await getMenuSectionsByPropertyTypeId(form.propertyTypeId);
        const data = res?.data?.data || res?.data;
        let latest = null;

        if (Array.isArray(data) && data.length > 0) {
          latest = data.find(h => h.isActive) || data[data.length - 1];
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          latest = data;
        }

        if (latest && latest.id) {
          setForm(p => ({
            ...p,
            part1: latest.part1 || "",
            part2: latest.part2 || "",
            description: latest.description || "",
            isActive: latest.isActive ?? true,
            existingId: latest.id
          }));
        } else {
          setForm(p => ({
            ...p, part1: "", part2: "", description: "", isActive: true, existingId: null
          }));
        }
      } catch (error) {
        toast.error("Failed to fetch menu section for this type");
        setForm(p => ({
          ...p, part1: "", part2: "", description: "", isActive: true, existingId: null
        }));
      } finally {
        setFetching(false);
      }
    };

    fetchHeader();
  }, [form.propertyTypeId]);

  const handleSave = async () => {
    if (!form.propertyTypeId) return toast.error("Please select a Property Type");
    if (!form.part1.trim()) return toast.error("Part 1 (heading) is required");
    
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("part1", form.part1.trim());
      fd.append("part2", form.part2.trim());
      fd.append("description", form.description.trim());
      fd.append("isActive", String(form.isActive));
      fd.append("propertyTypeId", form.propertyTypeId);
      
      if (form.existingId) {
        await updateMenuHeadersSection(form.existingId, fd);
        toast.success("Menu header updated");
      } else {
        await createMenuHeaderSection(fd);
        toast.success("Menu header created");
      }
      // Re-trigger fetch or reset
      setForm(p => ({ ...p }));
    } catch {
      toast.error("Failed to save menu header");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Menu Section Headline
          </h3>
          {form.existingId && (
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
              Editing existing
            </span>
          )}
        </div>
        <div className="p-4 space-y-4">
          <div className="w-1/2">
            <Field label="Property Type" half>
              <select
                className={inp}
                value={form.propertyTypeId}
                onChange={(e) => setForm(p => ({ ...p, propertyTypeId: e.target.value }))}
                disabled={loadingPropertyTypes || fetching}
              >
                <option value="">— Select Property Type —</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.typeName}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field label='Part 1 (e.g. "Main Menu")' half>
              <input
                className={inp}
                value={form.part1}
                onChange={(e) => setForm(p => ({ ...p, part1: e.target.value }))}
                placeholder="Main Menu"
              />
            </Field>
            <Field label='Part 2 (e.g. "South Indian")' half>
              <input
                className={inp}
                value={form.part2}
                onChange={(e) => setForm(p => ({ ...p, part2: e.target.value }))}
                placeholder="South Indian"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className={inp}
              rows={2}
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Short description here..."
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="headerActive"
              checked={form.isActive}
              onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="headerActive" className="text-xs font-semibold text-gray-600">
              Active
            </label>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Preview
            </p>
            <p className="text-xl font-serif text-gray-900">
              {form.part1 || "Part 1"}{" "}
              <em className="text-rose-600 not-italic font-serif">
                {form.part2 || "Part 2"}
              </em>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {form.description || "Description preview"}
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={14} /> Save Headline
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-TAB 2 — Group Booking Header
// ══════════════════════════════════════════════════════════════════════════════
function GroupBookingHeaderTab() {
  const EMPTY = {
    title: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    numberOfPersons: "",
    propertyId: "",
    propertyTypeId: "",
    existingId: null,
  };

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const fetchDropdowns = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      const [propRes, typeRes] = await Promise.all([getAllProperties(), getPropertyTypes()]);
      const props = propRes.data?.data || propRes.data || propRes;
      const types = typeRes.data?.data || typeRes.data || typeRes;
      if (Array.isArray(props)) setProperties(props.filter((p) => p.isActive));
      if (Array.isArray(types)) setPropertyTypes(types.filter((t) => t.isActive));
    } catch {
      toast.error("Failed to load properties/types");
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setFetching(true);
      const res = await getGroupBookings();
      const data = res?.data || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load group bookings");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
    fetchBookings();
  }, [fetchDropdowns, fetchBookings]);

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (b) => {
    setForm({
      title: b.title || "",
      description: b.description || "",
      ctaText: b.ctaText || "",
      ctaLink: b.ctaLink || "",
      numberOfPersons: b.numberOfPersons ? String(b.numberOfPersons) : "",
      propertyId: b.propertyId ? String(b.propertyId) : "",
      propertyTypeId: b.propertyTypeId ? String(b.propertyTypeId) : "",
      existingId: b.id,
    });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        ctaText: form.ctaText.trim(),
        ctaLink: form.ctaLink.trim(),
        numberOfPersons: form.numberOfPersons ? Number(form.numberOfPersons) : null,
        propertyId: form.propertyId ? Number(form.propertyId) : null,
        propertyTypeId: form.propertyTypeId ? Number(form.propertyTypeId) : null,
      };

      if (form.existingId) {
        await updateGroupBooking(form.existingId, payload);
        toast.success("Group booking header updated");
      } else {
        await addGroupBooking(payload);
        toast.success("Group booking header created");
      }
      setShowForm(false);
      setEditingId(null);
      await fetchBookings();
    } catch {
      toast.error("Failed to save group booking header");
    } finally {
      setSaving(false);
    }
  };

  const getPropertyName = (id) => properties.find((p) => p.id === Number(id))?.propertyName || "—";
  const getTypeName = (id) => propertyTypes.find((t) => t.id === Number(id))?.typeName || "—";

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
          Group Booking Headers
        </h3>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition-all"
        >
          <Plus size={14} /> Add Header
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{ color: colors.textPrimary }}>
              {editingId ? "Edit Group Booking Header" : "New Group Booking Header"}
            </span>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-black/10 transition-colors"
              style={{ color: colors.textSecondary }}
            >
              <X size={14} />
            </button>
          </div>

          <Field label="Title" required>
            <input
              className={inp}
              style={{ borderColor: colors.border, backgroundColor: colors.contentBg, color: colors.textPrimary }}
              placeholder="e.g. Plan Your Group Event"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              className={inp}
              style={{ borderColor: colors.border, backgroundColor: colors.contentBg, color: colors.textPrimary }}
              placeholder="Brief description for the group booking section..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="CTA Button Text">
              <input
                className={inp}
                style={{ borderColor: colors.border, backgroundColor: colors.contentBg, color: colors.textPrimary }}
                placeholder="e.g. Book Now"
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
              />
            </Field>
            <Field label="CTA Link">
              <input
                className={inp}
                style={{ borderColor: colors.border, backgroundColor: colors.contentBg, color: colors.textPrimary }}
                placeholder="e.g. /contact"
                value={form.ctaLink}
                onChange={(e) => set("ctaLink", e.target.value)}
              />
            </Field>
            <Field label="Min. Persons">
              <input
                type="number"
                min="1"
                className={inp}
                style={{ borderColor: colors.border, backgroundColor: colors.contentBg, color: colors.textPrimary }}
                placeholder="e.g. 10"
                value={form.numberOfPersons}
                onChange={(e) => set("numberOfPersons", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Property">
              <select
                className={inp}
                style={{ borderColor: colors.border, backgroundColor: colors.contentBg, color: colors.textPrimary }}
                value={form.propertyId}
                onChange={(e) => set("propertyId", e.target.value)}
                disabled={loadingDropdowns}
              >
                <option value="">— Select Property (optional) —</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.propertyName}</option>
                ))}
              </select>
            </Field>
            <Field label="Property Type">
              <select
                className={inp}
                style={{ borderColor: colors.border, backgroundColor: colors.contentBg, color: colors.textPrimary }}
                value={form.propertyTypeId}
                onChange={(e) => set("propertyTypeId", e.target.value)}
                disabled={loadingDropdowns}
              >
                <option value="">— Select Type (optional) —</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.typeName}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-xs border transition-colors"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {fetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" style={{ color: colors.primary }} size={28} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-sm" style={{ color: colors.textSecondary }}>
          No group booking headers yet. Click <strong>Add Header</strong> to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: colors.border }}>
          <table className="w-full text-left">
            <thead style={{ backgroundColor: colors.mainBg }}>
              <tr>
                {["Title", "CTA Text", "Min. Persons", "Property", "Type", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: colors.contentBg }}>
              {bookings.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-black/5">
                  <td className="px-4 py-3 text-sm font-medium max-w-[200px]" style={{ color: colors.textPrimary }}>
                    <span className="line-clamp-1">{b.title || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: colors.textSecondary }}>{b.ctaText || "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: colors.textSecondary }}>{b.numberOfPersons ?? "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: colors.textSecondary }}>
                    {b.propertyId ? getPropertyName(b.propertyId) : "Global"}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: colors.textSecondary }}>
                    {b.propertyTypeId ? getTypeName(b.propertyTypeId) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      style={{ color: colors.primary }}
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — Hotel Homepage Tab
// ══════════════════════════════════════════════════════════════════════════════
const SUB_TABS = [
  { id: "menu", label: "Menu Header", icon: BookOpen, component: MenuHeaderTab },
  { id: "group", label: "Group Booking Header", icon: Users, component: GroupBookingHeaderTab },
];

function HotelHomepage() {
  const [activeSubTab, setActiveSubTab] = useState("menu");
  const ActiveComponent = SUB_TABS.find((t) => t.id === activeSubTab)?.component;

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div
        className="flex gap-1 p-1 rounded-xl border"
        style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
      >
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex-1 justify-center"
              style={{
                backgroundColor: isActive ? colors.primary : "transparent",
                color: isActive ? "#fff" : colors.textSecondary,
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
      >
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

export default HotelHomepage;
