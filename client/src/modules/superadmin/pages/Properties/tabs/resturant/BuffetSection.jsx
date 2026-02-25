import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  IndianRupee,
} from "lucide-react";
import {
  createBuffetSectionHeader,
  updateBuffetSectionHeader,
  getAllBuffetSectionHeaders,
  getBuffetSectionHeaderById,
  toggleBuffetSectionHeaderStatus,
  createBuffetItem,
  updateBuffetItem,
  getAllBuffetItems,
  getBuffetItemById,
  toggleBuffetItemStatus,
} from "@/Api/RestaurantApi";
import { uploadMedia } from "@/Api/Api";

// ── Shared styles ─────────────────────────────────────────────────────────────

const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none bg-white transition-all";

const Field = ({ label, children, half }) => (
  <div className={half ? "flex-1 min-w-0" : "w-full"}>
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div className="border border-gray-100 rounded-xl overflow-hidden">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
        {title}
      </h3>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

// ── Image Upload Button ───────────────────────────────────────────────────────

function ImageUpload({ value, onChange, onClear, size = "md" }) {
  const dim = size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const raw = res.data;

      // API returns plain number (e.g. 582), or { id }, or { data: { id } }
      const mediaId =
        typeof raw === "number"
          ? raw
          : (raw?.id ?? raw?.mediaId ?? raw?.data?.id ?? null);

      const url =
        typeof raw === "object"
          ? (raw?.url ?? raw?.data?.url ?? URL.createObjectURL(file))
          : URL.createObjectURL(file);

      onChange(url, mediaId);
    } catch {
      onChange(URL.createObjectURL(file), null);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-sm text-gray-500 font-medium shrink-0">
        <ImageIcon size={14} />
        {uploading ? "Uploading…" : value ? "Change" : "Upload"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFile}
        />
      </label>
      {value ? (
        <>
          <img
            src={value}
            alt=""
            className={`${dim} rounded-lg object-cover border shadow shrink-0`}
          />
          <button
            type="button"
            onClick={onClear}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <div
          className={`${dim} rounded-lg bg-gray-100 flex items-center justify-center border shrink-0`}
        >
          <ImageIcon size={16} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER EDITOR
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_HEADER = {
  id: null,
  headlinePart1: "",
  headlinePart2: "",
  description: "",
  isActive: true,
};

function HeaderEditor({ propertyId, onSaved }) {
  const [form, setForm] = useState(EMPTY_HEADER);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Load existing header
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllBuffetSectionHeaders();
        const list = res.data?.data ?? res.data ?? [];
        const existing = Array.isArray(list)
          ? (list.find((h) => h.propertyId === propertyId) ?? list[0])
          : list;
        if (existing) {
          setForm({
            id: existing.id ?? null,
            headlinePart1: existing.headlinePart1 ?? "",
            headlinePart2: existing.headlinePart2 ?? "",
            description: existing.description ?? "",
            isActive: existing.isActive ?? true,
          });
        }
      } catch (e) {
        console.error("Failed to load buffet header", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        headlinePart1: form.headlinePart1,
        headlinePart2: form.headlinePart2,
        description: form.description,
        propertyId,
        isActive: form.isActive,
      };

      if (form.id) {
        await updateBuffetSectionHeader(form.id, payload);
      } else {
        const res = await createBuffetSectionHeader(payload);
        const newId = res.data?.data?.id ?? res.data?.id;
        setForm((p) => ({ ...p, id: newId }));
      }
      onSaved?.();
    } catch (e) {
      console.error("Failed to save buffet header", e);
      alert("Failed to save header. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        Loading header…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Section title="Section Header">
        <div className="flex gap-3">
          <Field label='Headline Part 1 (normal, e.g. "Buffet")' half>
            <input
              className={inp}
              value={form.headlinePart1}
              onChange={(e) => set("headlinePart1", e.target.value)}
              placeholder="Buffet"
            />
          </Field>
          <Field label='Headline Part 2 (italic accent, e.g. "Selection")' half>
            <input
              className={inp}
              value={form.headlinePart2}
              onChange={(e) => set("headlinePart2", e.target.value)}
              placeholder="Selection"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className={inp}
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short description shown below the heading..."
          />
        </Field>

        {/* Active toggle */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <div
            onClick={() => set("isActive", !form.isActive)}
            className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600">Active</span>
        </label>

        {/* Live preview */}
        <div className="mt-1 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Preview
          </p>
          <p className="text-xl font-serif text-gray-900">
            {form.headlinePart1 || "Buffet"}{" "}
            <em className="text-rose-600 not-italic font-serif">
              {form.headlinePart2 || "Selection"}
            </em>
          </p>
          <p className="text-xs text-gray-500 mt-1">{form.description}</p>
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Save size={14} /> Save Header
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUFFET ITEM FORM
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_ITEM = {
  id: null,
  itemName: "",
  description: "",
  price: "",
  ctaButtonText: "Book Now",
  ctaLink: "",
  mediaId: null,
  mediaUrl: "",
  displayOrder: 1,
  isActive: true,
};

function ItemForm({ initial, propertyId, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        itemName: form.itemName,
        displayOrder: form.displayOrder,
        description: form.description,
        price: Number(form.price),
        ctaButtonText: form.ctaButtonText,
        ctaLink: form.ctaLink,
        mediaId: form.mediaId,
        propertyId,
        isActive: form.isActive,
      };

      if (form.id) {
        await updateBuffetItem(form.id, payload);
        onSave({ ...form });
      } else {
        const res = await createBuffetItem(payload);
        const created = res.data?.data ?? res.data;
        onSave({ ...form, id: created?.id ?? Date.now() });
      }
    } catch (e) {
      console.error("Failed to save buffet item", e);
      alert("Failed to save item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50/30 p-4 space-y-4">
      {/* Name + Order */}
      <div className="flex gap-3">
        <Field label="Item Name" half>
          <input
            className={inp}
            value={form.itemName}
            onChange={(e) => set("itemName", e.target.value)}
            placeholder="e.g. Grand Indian Buffet"
          />
        </Field>
        <Field label="Display Order" half>
          <input
            type="number"
            className={inp}
            value={form.displayOrder}
            min={1}
            onChange={(e) => set("displayOrder", Number(e.target.value))}
          />
        </Field>
      </div>

      {/* Description */}
      <Field label="Description">
        <textarea
          className={inp}
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Short description of this buffet offering..."
        />
      </Field>

      {/* Price + CTA text */}
      <div className="flex gap-3">
        <Field label="Price (₹)" half>
          <div className="relative">
            <IndianRupee
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className={`${inp} pl-8`}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="700"
            />
          </div>
        </Field>
        <Field label="CTA Button Text" half>
          <input
            className={inp}
            value={form.ctaButtonText}
            onChange={(e) => set("ctaButtonText", e.target.value)}
            placeholder="Book Now"
          />
        </Field>
      </div>

      <Field label="CTA Link / URL">
        <input
          className={inp}
          value={form.ctaLink}
          onChange={(e) => set("ctaLink", e.target.value)}
          placeholder="/buffet/indian or https://..."
        />
      </Field>

      {/* Image upload */}
      <Field label="Buffet Image">
        <ImageUpload
          value={form.mediaUrl}
          onChange={(url, mediaId) => {
            set("mediaUrl", url);
            set("mediaId", mediaId ?? null); // always set, even null — removes stale value
          }}
          onClear={() => {
            set("mediaUrl", "");
            set("mediaId", null);
          }}
        />
      </Field>

      {/* Active toggle */}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <div
          onClick={() => set("isActive", !form.isActive)}
          className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600">Active</span>
      </label>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          <Save size={13} />{" "}
          {saving ? "Saving…" : form.id ? "Update Item" : "Add Item"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ITEM ROW
// ─────────────────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleBuffetItemStatus(item.id, !item.isActive);
      onToggleStatus(item.id, !item.isActive);
    } catch (e) {
      console.error("Failed to toggle status", e);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all group">
      {/* Thumbnail */}
      {item.mediaUrl ? (
        <img
          src={item.mediaUrl}
          alt={item.itemName}
          className="w-12 h-12 rounded-lg object-cover border shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border shrink-0">
          <ImageIcon size={14} className="text-gray-300" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-800 truncate">
            {item.itemName || "Unnamed"}
          </span>
          {item.price && (
            <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              ₹{item.price}
            </span>
          )}
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${item.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">
          {item.description}
        </p>
        {item.ctaButtonText && (
          <p className="text-[10px] text-blue-400 mt-0.5 font-medium">
            CTA: {item.ctaButtonText}
          </p>
        )}
      </div>

      {/* Order badge */}
      <span className="text-[10px] font-black text-gray-300 shrink-0">
        #{item.displayOrder}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition-all"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition-all"
        >
          <ChevronDown size={14} />
        </button>
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={item.isActive ? "Deactivate" : "Activate"}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-50"
        >
          {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-all"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function BuffetSection({ propertyData, refreshData }) {
  const propertyId = propertyData?.id ?? propertyData?.propertyId ?? 1;

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [activePanel, setActivePanel] = useState("items");

  // ── Load buffet items ─────────────────────────────────────────────────────
  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const res = await getAllBuffetItems();
      const list = res.data?.data ?? res.data ?? [];
      const mapped = (Array.isArray(list) ? list : [])
        .filter((i) => !propertyId || i.propertyId === propertyId)
        .map((i) => ({
          id: i.id,
          itemName: i.itemName ?? "",
          description: i.description ?? "",
          price: i.price ?? "",
          ctaButtonText: i.ctaButtonText ?? "Book Now",
          ctaLink: i.ctaLink ?? "",
          mediaId: i.mediaId ?? null,
          mediaUrl: i.media?.url ?? i.mediaUrl ?? "",
          displayOrder: i.displayOrder ?? 1,
          isActive: i.isActive ?? true,
        }));
      setItems(mapped);
    } catch (e) {
      console.error("Failed to load buffet items", e);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [propertyId]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const handleSaveItem = (saved) => {
    setItems((prev) =>
      prev.some((i) => i.id === saved.id)
        ? prev.map((i) => (i.id === saved.id ? saved : i))
        : [...prev, saved],
    );
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this buffet item?")) return;
    try {
      await toggleBuffetItemStatus(id, false);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
      alert("Failed to delete item.");
    }
  };

  const handleToggleStatus = (id, newStatus) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isActive: newStatus } : i)),
    );
  };

  const moveItem = (id, dir) => {
    setItems((prev) => {
      const arr = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = arr.findIndex((i) => i.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      const tmp = arr[idx].displayOrder;
      arr[idx] = { ...arr[idx], displayOrder: arr[swapIdx].displayOrder };
      arr[swapIdx] = { ...arr[swapIdx], displayOrder: tmp };
      // Persist order in background
      updateBuffetItem(arr[idx].id, {
        displayOrder: arr[idx].displayOrder,
        propertyId,
      }).catch(console.error);
      updateBuffetItem(arr[swapIdx].id, {
        displayOrder: arr[swapIdx].displayOrder,
        propertyId,
      }).catch(console.error);
      return arr;
    });
  };

  const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div>
        <h2 className="text-base font-bold text-gray-800">Buffet Section</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage the buffet heading and all buffet offering cards shown on the
          website
        </p>
      </div>

      {/* Panel switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: "header", label: "Header" },
          { key: "items", label: `Buffet Items (${items.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActivePanel(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePanel === t.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HEADER PANEL ──────────────────────────────────────────────────── */}
      {activePanel === "header" && (
        <HeaderEditor propertyId={propertyId} onSaved={refreshData} />
      )}

      {/* ── ITEMS PANEL ───────────────────────────────────────────────────── */}
      {activePanel === "items" && (
        <div className="space-y-3">
          {editingId !== "new" && (
            <div className="flex justify-end">
              <button
                onClick={() => setEditingId("new")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
              >
                <Plus size={14} /> Add Buffet Item
              </button>
            </div>
          )}

          {editingId === "new" && (
            <ItemForm
              initial={{ ...EMPTY_ITEM, displayOrder: items.length + 1 }}
              propertyId={propertyId}
              onSave={handleSaveItem}
              onCancel={() => setEditingId(null)}
            />
          )}

          <div className="space-y-2">
            {loadingItems ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                Loading items…
              </div>
            ) : sorted.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm border-2 border-dashed rounded-xl">
                No buffet items yet — click <strong>Add Buffet Item</strong> to
                get started.
              </div>
            ) : (
              sorted.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {editingId === item.id ? (
                    <ItemForm
                      initial={item}
                      propertyId={propertyId}
                      onSave={handleSaveItem}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <ItemRow
                      item={item}
                      isFirst={idx === 0}
                      isLast={idx === sorted.length - 1}
                      onEdit={() => setEditingId(item.id)}
                      onDelete={() => handleDelete(item.id)}
                      onToggleStatus={handleToggleStatus}
                      onMoveUp={() => moveItem(item.id, -1)}
                      onMoveDown={() => moveItem(item.id, 1)}
                    />
                  )}
                </React.Fragment>
              ))
            )}
          </div>

          {items.length > 0 && (
            <p className="text-[11px] text-gray-400 text-right">
              {items.filter((i) => i.isActive).length} active ·{" "}
              {items.filter((i) => !i.isActive).length} inactive
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default BuffetSection;
