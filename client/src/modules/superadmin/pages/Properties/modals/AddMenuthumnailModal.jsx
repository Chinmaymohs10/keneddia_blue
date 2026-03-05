import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Loader2,
  Upload,
  Film,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import {
  getAllItemTypes,
  addMenuThumbnail,
  getMenuThumbnailById,
  updateMenuThumbnail,
  getAllActiveItemCategory,
} from "@/Api/RestaurantApi";

const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none bg-white transition-all";

function AddMenuThumbnailModal({ isOpen, onClose, propertyData, thumbnailId }) {
  const propertyId = propertyData?.id;
  const isEditing = !!thumbnailId;
  const [categories, setCategories] = useState([]);

  const [types, setTypes] = useState([]);
  const [formData, setFormData] = useState({
    itemTypeId: "",
    itemCategoryId: "", // ← add
    tag: "",
    file: null,
  });
  const [preview, setPreview] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setFormData({ itemTypeId: "", tag: "", file: null });
    setPreview("");
    setMediaType("image");
    fetchTypes();
    if (thumbnailId) fetchThumbnail();
  }, [isOpen]);

  const fetchTypes = async () => {
    try {
      const [typeRes, catRes] = await Promise.all([
        getAllItemTypes(),
        getAllActiveItemCategory(),
      ]);
      setTypes(typeRes?.data || []);
      setCategories(
        (catRes?.data || [])
          .filter((c) => c.isActive !== false)
          .map((c) => ({ id: c.id, name: c.categoryName })),
      );
    } catch {
      console.error("Failed to load types/categories");
    }
  };

  const fetchThumbnail = async () => {
    try {
      const res = await getMenuThumbnailById(thumbnailId);
      const data = res?.data;
      setFormData({
        itemTypeId: data?.itemTypeId ? String(data.itemTypeId) : "",
        itemCategoryId: data?.itemCategoryId ? String(data.itemCategoryId) : "", // ← add
        tag: data?.tag || "",
        file: null,
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

  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleFile = (file) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, file }));
    setPreview(URL.createObjectURL(file));
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
  };
  const handleSubmit = async () => {
    if (!formData.itemTypeId) {
      setError("Please select an item type.");
      return;
    }
    if (!formData.tag.trim()) {
      setError("Tag is required.");
      return;
    }
    if (!isEditing && !formData.file) {
      setError("Please upload an image or video.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("itemTypeId", formData.itemTypeId);
      fd.append("itemCategoryId", formData.itemCategoryId); // ← add
      fd.append("tag", formData.tag.trim());
      if (formData.file) fd.append("file", formData.file);

      if (isEditing) {
        await updateMenuThumbnail(propertyId, thumbnailId, fd); // ← fixed: 3 args
      } else {
        await addMenuThumbnail(propertyId, fd);
      }

      onClose(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
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
        <div className="p-6 space-y-5">
          {/* Error */}
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
              {mediaType === "video" ? (
                <Film size={14} />
              ) : (
                <ImageIcon size={14} />
              )}
              {preview ? "Change Media" : "Upload Image / Video"}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>

            {preview && (
              <div className="relative mt-3 w-full h-44 rounded-xl overflow-hidden border shadow-sm bg-black">
                {mediaType === "video" ? (
                  <video
                    src={preview}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/60 text-white backdrop-blur-sm">
                  {mediaType === "video" ? "Video" : "Image"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPreview("");
                    setFormData((p) => ({ ...p, file: null }));
                    setMediaType("image");
                  }}
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
            </label>
            <select
              className={inp}
              value={formData.itemTypeId}
              onChange={(e) => handleChange("itemTypeId", e.target.value)}
            >
              <option value="">Select Type…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.typeName}
                </option>
              ))}
            </select>
          </div>
          {/* Item Category */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Item Category
            </label>
            <select
              className={inp}
              value={formData.itemCategoryId}
              onChange={(e) => handleChange("itemCategoryId", e.target.value)}
            >
              <option value="">Select Category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Tag <span className="text-red-400">*</span>
            </label>
            <input
              className={inp}
              value={formData.tag}
              onChange={(e) => handleChange("tag", e.target.value)}
              placeholder="e.g. brunch, dinner, specials"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
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
              <>
                <Loader2 size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={15} /> {isEditing ? "Update" : "Add Thumbnail"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMenuThumbnailModal;
