import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Heart,
  Plus,
  Pencil,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  createItemType,
  getAllItemTypes,
  updateItemType,
  toggleItemTypeStatus,
  createMenuItem,
  updateMenuItem,
  getAllVerticalCards,
} from "@/Api/RestaurantApi";

// ── Shared input style ────────────────────────────────────────────────────────
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

// ── Image Upload ──────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, onClear }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 px-4 py-2 w-fit rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-sm text-gray-500 font-medium">
        <ImageIcon size={14} />
        {value ? "Change Image" : "Upload Image"}
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
      {value && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border shadow-sm">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Inline tag manager (types only) ──────────────────────────────────────────
function TagSelector({
  label,
  items,
  value,
  onChange,
  onAdd,
  onUpdate,
  onToggleStatus,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [localAdding, setLocalAdding] = useState(false);
  const [localUpdating, setLocalUpdating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLocalAdding(true);
    try {
      await onAdd(newName.trim());
      setNewName("");
      setShowAdd(false);
    } finally {
      setLocalAdding(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setLocalUpdating(true);
    try {
      await onUpdate(id, editName.trim(), editActive);
      setEditingId(null);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleToggle = async (item, e) => {
    e.stopPropagation();
    setTogglingId(item.id);
    try {
      await onToggleStatus(item.id, !item.isActive);
    } finally {
      setTogglingId(null);
    }
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditName(item.name);
    setEditActive(item.isActive ?? true);
    setShowAdd(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          className={inp}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select {label}...</option>
          {items
            .filter((i) => i.isActive !== false)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setShowAdd((v) => !v);
            setEditingId(null);
          }}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition-all"
        >
          <Plus size={13} /> New
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 items-center bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <input
            className="flex-1 text-sm border border-blue-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 bg-white"
            placeholder={`New ${label} name…`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={localAdding || !newName.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-blue-700 transition-all"
          >
            {localAdding ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Check size={12} />
            )}
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.id} className="group">
              {editingId === item.id ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <input
                    className="text-xs w-28 border border-amber-300 rounded-lg px-2 py-1 outline-none focus:border-amber-400 bg-white"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUpdate(item.id)
                    }
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5 border-l border-amber-200 pl-2">
                    <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider whitespace-nowrap">
                      Active
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditActive((v) => !v)}
                      className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${editActive ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${editActive ? "translate-x-4" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id)}
                    disabled={localUpdating || !editName.trim()}
                    className="text-amber-600 hover:text-amber-800 disabled:opacity-50"
                  >
                    {localUpdating ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition-all ${
                    String(value) === String(item.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : item.isActive === false
                        ? "bg-gray-50 text-gray-400 border-gray-200 opacity-60"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isActive === false ? "bg-gray-400" : "bg-green-400"}`}
                  />
                  {item.name}
                  <button
                    type="button"
                    onClick={(e) => handleToggle(item, e)}
                    disabled={togglingId === item.id}
                    title={
                      item.isActive === false ? "Set Active" : "Set Inactive"
                    }
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 disabled:opacity-50 ${
                      String(value) === String(item.id)
                        ? "text-blue-200 hover:text-white"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    {togglingId === item.id ? (
                      <Loader2 size={9} className="animate-spin" />
                    ) : item.isActive === false ? (
                      <Check size={9} />
                    ) : (
                      <X size={9} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => startEdit(item, e)}
                    title={`Edit ${item.name}`}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      String(value) === String(item.id)
                        ? "text-blue-200 hover:text-white"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Pencil size={9} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY = {
  itemName: "",
  verticalCardId: "", // replaces category_id
  type_id: "",
  description: "",
  likeCount: 0,
  foodType: "VEG",
  signatureItem: false,
  topSold: false,
  status: true,
  image: "",
  imageFile: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AddMenuItemModal({
  isOpen,
  onClose,
  initialData,
  propertyData,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [verticals, setVerticals] = useState([]); // filtered vertical cards
  const [types, setTypes] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const propertyId = propertyData?.id;
  const isEditing = !!initialData?.id;

  // ── Fetch verticals (filtered) & types ────────────────────────────────────
  const fetchMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const [vertRes, typeRes] = await Promise.all([
        getAllVerticalCards(),
        getAllItemTypes(),
      ]);

      const allVerticals = vertRes?.data?.data ?? vertRes?.data ?? [];
      setVerticals(
        (Array.isArray(allVerticals) ? allVerticals : [])
          .filter((v) => v.propertyId === propertyId && v.isActive !== false)
          .map((v) => ({ id: v.id, name: v.verticalName })),
      );

      setTypes(
        (typeRes?.data || []).map((t) => ({
          id: t.id,
          name: t.typeName,
          isActive: t.isActive,
        })),
      );
    } catch {
      // non-fatal
    } finally {
      setLoadingMeta(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (isOpen) {
      fetchMeta();
      if (initialData) {
        setForm({
          ...EMPTY,
          itemName: initialData.itemName || "",
          // support both verticalCardId and legacy category mapping
          verticalCardId: initialData.verticalCardId
            ? String(initialData.verticalCardId)
            : initialData.verticalCardResponseDTO?.id
              ? String(initialData.verticalCardResponseDTO.id)
              : "",
          type_id: initialData.type?.id ? String(initialData.type.id) : "",
          description: initialData.description || "",
          likeCount: initialData.likeCount || 0,
          foodType: initialData.foodType || "VEG",
          signatureItem: initialData.signatureItem ?? false,
          topSold: initialData.topSold ?? false,
          status: initialData.status ?? true,
          image: initialData.image?.url || initialData.media?.url || "",
          imageFile: null,
        });
      } else {
        setForm(EMPTY);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Type handlers ──────────────────────────────────────────────────────────
  const handleAddType = async (name) => {
    const res = await createItemType({ typeName: name, isActive: true });
    const created = res?.data;
    if (created) {
      const newType = {
        id: created.id,
        name: created.typeName,
        isActive: created.isActive ?? true,
      };
      setTypes((prev) => [...prev, newType]);
      set("type_id", String(created.id));
    }
  };

  const handleUpdateType = async (id, name, isActive) => {
    await updateItemType(id, { typeName: name, isActive });
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name, isActive } : t)),
    );
  };

  const handleToggleTypeStatus = async (id, newStatus) => {
    await toggleItemTypeStatus(id, { isActive: newStatus });
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: newStatus } : t)),
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.itemName.trim()) {
      setError("Item name is required.");
      return;
    }
    // if (!form.verticalCardId) {
    //   setError("Please select a vertical.");
    //   return;
    // }
    if (!form.type_id) {
      setError("Please select an item type.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("itemName", form.itemName.trim());
      fd.append("description", form.description);
      if (form.verticalCardId) {
        fd.append("verticalCardId", form.verticalCardId);
      }
      fd.append("type_id", form.type_id);
      fd.append("foodType", form.foodType);
      fd.append("signatureItem", String(form.signatureItem));
      fd.append("topSold", String(form.topSold));
      fd.append("status", String(form.status));
      fd.append("likeCount", String(form.likeCount));
      fd.append("propertyId", String(propertyId || ""));
      fd.append("propertyTypeId", String(propertyData?.propertyTypeId || ""));
      if (form.imageFile) fd.append("image", form.imageFile);

      if (isEditing) {
        await updateMenuItem(initialData.id, fd);
      } else {
        await createMenuItem(fd);
      }

      onSave?.();
      onClose(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save item. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h3 className="text-lg font-bold text-gray-800">
            {isEditing ? "Edit Menu Item" : "Add Menu Item"}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Image */}
          <Field label="Item Image">
            <ImageUpload
              value={form.image}
              onChange={(url, file) => {
                set("image", url);
                set("imageFile", file);
              }}
              onClear={() => {
                set("image", "");
                set("imageFile", null);
              }}
            />
          </Field>

          {/* Name */}
          <Field label="Item Name">
            <input
              className={inp}
              value={form.itemName}
              onChange={(e) => set("itemName", e.target.value)}
              placeholder="e.g. Paneer Butter Masala"
            />
          </Field>

          {/* Vertical Card dropdown — filtered by propertyId */}
          <Field label={`Vertical${loadingMeta ? " — Loading…" : ""}`}>
            <select
              className={inp}
              value={form.verticalCardId}
              onChange={(e) => set("verticalCardId", e.target.value)}
              disabled={loadingMeta}
            >
              <option value="">Select Vertical…</option>
              {verticals.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {!loadingMeta && verticals.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                No active verticals found for this property.
              </p>
            )}
          </Field>

          {/* Item Type */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Item Type
              {loadingMeta && (
                <span className="ml-2 text-[9px] font-normal text-gray-400 normal-case tracking-normal">
                  Loading…
                </span>
              )}
            </label>
            <TagSelector
              label="Type"
              items={types}
              value={form.type_id}
              onChange={(v) => set("type_id", v)}
              onAdd={handleAddType}
              onUpdate={handleUpdateType}
              onToggleStatus={handleToggleTypeStatus}
            />
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              className={inp}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Creamy paneer curry with aromatic spices…"
            />
          </Field>

          {/* Like Count */}
          <Field label="Like Count">
            <div className="relative max-w-[160px]">
              <Heart
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 fill-rose-400"
              />
              <input
                type="number"
                className={`${inp} pl-8`}
                value={form.likeCount}
                min={0}
                onChange={(e) =>
                  set(
                    "likeCount",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="0"
              />
            </div>
          </Field>

          {/* Food Type + Signature + Status */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {/* Food Type */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Food Type
              </span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {["VEG", "NON_VEG", "EGG"].map((ft, i) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => set("foodType", ft)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${i > 0 ? "border-l border-gray-200" : ""} ${
                      form.foodType === ft
                        ? ft === "VEG"
                          ? "bg-green-500 text-white"
                          : ft === "NON_VEG"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {ft === "VEG"
                      ? "Veg"
                      : ft === "NON_VEG"
                        ? "Non-Veg"
                        : "Egg"}
                  </button>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Signature Dish
              </span>
              <label className="flex items-center gap-2 cursor-pointer h-[34px]">
                <div
                  onClick={() => set("signatureItem", !form.signatureItem)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.signatureItem ? "bg-amber-400" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.signatureItem ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {form.signatureItem ? "⭐ Yes" : "No"}
                </span>
              </label>
            </div>

            {/* Top Sold */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Top Selling
              </span>
              <label className="flex items-center gap-2 cursor-pointer h-[34px]">
                <div
                  onClick={() => set("topSold", !form.topSold)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.topSold ? "bg-orange-400" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.topSold ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {form.topSold ? "🔥 Yes" : "No"}
                </span>
              </label>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Status
              </span>
              <label className="flex items-center gap-2 cursor-pointer h-[34px]">
                <div
                  onClick={() => set("status", !form.status)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.status ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.status ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {form.status ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={() => onClose(false)}
            className="px-5 py-2.5 rounded-lg border text-sm font-bold text-gray-600 hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.itemName.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={15} /> {isEditing ? "Update Item" : "Add Item"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMenuItemModal;
