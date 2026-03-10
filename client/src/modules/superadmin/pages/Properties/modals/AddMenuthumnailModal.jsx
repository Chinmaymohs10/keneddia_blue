import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Loader2,
  Film,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import {
  getAllItemTypes,
  addMenuThumbnail,
  getMenuThumbnailById,
  updateMenuThumbnail,
  getAllVerticalCards,
} from "@/Api/RestaurantApi";

const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none bg-white transition-all";

function AddMenuThumbnailModal({ isOpen, onClose, propertyData, thumbnailId }) {
  const propertyId = propertyData?.id;
  const isEditing = !!thumbnailId;

  const [verticals, setVerticals] = useState([]);
  const [types, setTypes] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const [formData, setFormData] = useState({
    itemTypeId: "",
    verticalCardId: "",
    tag: "",
    file: null,
    active: true,
  });
  const [preview, setPreview] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch verticals (filtered by propertyId) + types ──────────────────────
  const fetchMeta = async () => {
    setLoadingMeta(true);
    try {
      const [typeRes, vertRes] = await Promise.all([
        getAllItemTypes(),
        getAllVerticalCards(),
      ]);

      setTypes(typeRes?.data || []);

      const allVerticals = vertRes?.data?.data ?? vertRes?.data ?? [];
      setVerticals(
        (Array.isArray(allVerticals) ? allVerticals : [])
          .filter((v) => v.propertyId === propertyId && v.isActive !== false)
          .map((v) => ({ id: v.id, name: v.verticalName })),
      );
    } catch {
      console.error("Failed to load types/verticals");
    } finally {
      setLoadingMeta(false);
    }
  };

  // ── Fetch existing thumbnail for edit mode ────────────────────────────────
  const fetchThumbnail = async () => {
    try {
      const res = await getMenuThumbnailById(thumbnailId);
      const data = res?.data;
      setFormData({
        itemTypeId: data?.itemTypeId ? String(data.itemTypeId) : "",
        verticalCardId: data?.verticalCardResponseDTO?.id
          ? String(data.verticalCardResponseDTO.id)
          : data?.verticalCardId
            ? String(data.verticalCardId)
            : "",
        tag: data?.tag || "",
        file: null,
        active: data?.active ?? true,
      });
      const url = data?.media?.url || "";
      const isVid =
        data?.media?.type === "VIDEO" || /\.(mp4|webm|mov)(\?|$)/i.test(url);
      setPreview(url);
      setMediaType(isVid ? "video" : "image");
    } catch {
      setError("Failed to load thumbnail data.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setFormData({ itemTypeId: "", verticalCardId: "", tag: "", file: null, active: true });
    setPreview("");
    setMediaType("image");
    fetchMeta();
    if (thumbnailId) fetchThumbnail();
  }, [isOpen]);

  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleFile = (file) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, file }));
    setPreview(URL.createObjectURL(file));
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
  };

  const handleSubmit = async () => {
    if (!formData.itemTypeId) { setError("Please select an item type."); return; }
    if (!isEditing && !formData.file) { setError("Please upload an image or video."); return; }

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("itemTypeId", formData.itemTypeId);
      if (formData.verticalCardId) fd.append("verticalCardId", formData.verticalCardId);
      if (formData.tag?.trim()) fd.append("tag", formData.tag.trim());
      if (isEditing) fd.append("active", String(formData.active));
      if (formData.file) fd.append("file", formData.file);

      if (isEditing) {
        await updateMenuThumbnail(propertyId, thumbnailId, fd);
      } else {
        await addMenuThumbnail(propertyId, fd);
      }

      onClose(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h3 className="text-lg font-bold text-gray-800">
            {isEditing ? "Edit Menu Thumbnail" : "Add Menu Thumbnail"}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* Media Upload */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Thumbnail Media <span className="text-red-400">*</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2 w-fit rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-sm text-gray-500 font-medium">
              {mediaType === "video" ? <Film size={14} /> : <ImageIcon size={14} />}
              {preview ? "Change Media" : "Upload Image / Video"}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>

            {preview && (
              <div className="relative mt-3 w-full h-32 rounded-xl overflow-hidden border shadow-sm bg-black">
                {mediaType === "video" ? (
                  <video src={preview} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/60 text-white backdrop-blur-sm">
                  {mediaType === "video" ? "Video" : "Image"}
                </span>
                <button
                  type="button"
                  onClick={() => { setPreview(""); setFormData((p) => ({ ...p, file: null })); setMediaType("image"); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Item Type */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Item Type <span className="text-red-400">*</span>
              {loadingMeta && <span className="ml-2 text-[9px] font-normal normal-case tracking-normal">Loading…</span>}
            </label>
            <select
              className={inp}
              value={formData.itemTypeId}
              onChange={(e) => handleChange("itemTypeId", e.target.value)}
              disabled={loadingMeta}
            >
              <option value="">Select Type…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.typeName}</option>
              ))}
            </select>
          </div>

          {/* Vertical Card — same pattern as AddMenuItemModal */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Vertical
              {loadingMeta && <span className="ml-2 text-[9px] font-normal normal-case tracking-normal">Loading…</span>}
            </label>
            <select
              className={inp}
              value={formData.verticalCardId}
              onChange={(e) => handleChange("verticalCardId", e.target.value)}
              disabled={loadingMeta}
            >
              <option value="">Select Vertical…</option>
              {verticals.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {!loadingMeta && verticals.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                No active verticals found for this property.
              </p>
            )}
          </div>

          {/* Tag */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Tag
            </label>
            <input
              className={inp}
              value={formData.tag}
              onChange={(e) => handleChange("tag", e.target.value)}
              placeholder="e.g. brunch, dinner, specials"
            />
          </div>

          {/* Active toggle — edit mode only */}
          {isEditing && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleChange("active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-600">Active</label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={() => onClose(false)}
            className="px-5 py-2.5 rounded-lg border text-sm font-bold text-gray-600 hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={15} /> {isEditing ? "Update" : "Add Thumbnail"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMenuThumbnailModal;