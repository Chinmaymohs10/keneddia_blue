import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import {
  X,
  Loader2,
  Trash2,
  Plus,
  Image as ImageIcon,
  Building2,
  Home,
} from "lucide-react";
import {
  addAboutUs,
  updateAboutUsById,
  addAboutUsByPropertyType,
  getPropertyTypes,
  updateAboutUsByPropertyTypeId,
} from "@/Api/Api";
import {
  showSuccess,
  showInfo,
  showError,
  showWarning,
} from "@/lib/toasters/toastUtils";

// Normalize function to handle case-insensitive comparison
const normalize = (str) => {
  if (!str) return "";
  return str.toLowerCase().trim();
};

function AddUpdateAboutModal({ isOpen, onClose, editData = null }) {
  const [formData, setFormData] = useState({
    sectionTitle: "",
    subTitle: "",
    description: "",
    videoUrl: "",
    videoTitle: "",
    ctaButtonText: "More Details →",
    ctaButtonUrl: "",
    propertyTypeId: null, // null = general, number = property-specific
  });

  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);

  // Check if property type is selected (simplified mode)
  const isPropertyTypeSelected = formData.propertyTypeId !== null;

  // Fetch Property Types
  useEffect(() => {
    if (isOpen) {
      fetchPropertyTypes();
    }
  }, [isOpen]);

  const fetchPropertyTypes = async () => {
    try {
      setLoadingPropertyTypes(true);
      const response = await getPropertyTypes();
      const data = response?.data || response;

      if (Array.isArray(data)) {
        const activeTypes = data.filter(
          (type) => type.isActive && normalize(type.typeName) !== "both",
        );
        setPropertyTypes(activeTypes);
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
      showError("Failed to load property types");
    } finally {
      setLoadingPropertyTypes(false);
    }
  };

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        sectionTitle: editData.sectionTitle || "",
        subTitle: editData.subTitle || "",
        description: editData.description || "",
        videoUrl: editData.videoUrl || "",
        videoTitle: editData.videoTitle || "",
        ctaButtonText: editData.ctaButtonText || "More Details →",
        ctaButtonUrl: editData.ctaButtonUrl || "",
        propertyTypeId: editData.propertyTypeId || null,
      });

      if (editData.media && Array.isArray(editData.media)) {
        setMediaItems(
          editData.media.map((m) => ({
            id: m.mediaId || m.id,
            url: m.url,
            file: null,
            isExisting: true,
          })),
        );
      }
    } else if (!isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({
      sectionTitle: "",
      subTitle: "",
      description: "",
      videoUrl: "",
      videoTitle: "",
      ctaButtonText: "More Details →",
      ctaButtonUrl: "",
      propertyTypeId: null,
    });
    mediaItems.forEach((item) => {
      if (item.url && item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });
    setMediaItems([]);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeChange = (typeId) => {
    setFormData((prev) => ({
      ...prev,
      propertyTypeId: typeId,
      // Clear video and CTA fields when switching to property-specific
      ...(typeId !== null && {
        videoUrl: "",
        videoTitle: "",
        ctaButtonText: "",
        ctaButtonUrl: "",
      }),
    }));
  };

  const handleAddMediaSlot = () => {
    setMediaItems((prev) => [
      ...prev,
      { id: Date.now(), url: "", file: null, isExisting: false },
    ]);
  };

  const handleRemoveMediaItem = (id) => {
    setMediaItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleFileSelect = (id, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, file: file, url: previewUrl } : item,
      ),
    );
  };

  const handleSubmit = async () => {
    if (editData && formData.propertyTypeId !== null) {
      showWarning(
        "Property-specific About Us update is temporarily disabled. Please try again later.",
      );
      return;
    }
    // Validation
    if (!formData.sectionTitle.trim() || !formData.subTitle.trim()) {
      showError("Section title and subtitle are required");
      return;
    }

    if (!formData.description.trim()) {
      showError("Description is required");
      return;
    }

    try {
      setLoading(true);

      const existingMediaUrls = mediaItems
        .filter((item) => item.isExisting && item.url)
        .map((item) => item.url);

      const newFiles = mediaItems
        .filter((item) => item.file instanceof File)
        .map((item) => item.file);

      const payload = {
        sectionTitle: formData.sectionTitle.trim(),
        subTitle: formData.subTitle.trim(),
        description: formData.description.trim(),
        mediaUrls: existingMediaUrls,
        files: newFiles,
      };

      // Add optional fields only for general mode
      if (!isPropertyTypeSelected) {
        payload.videoUrl = formData.videoUrl.trim();
        payload.videoTitle = formData.videoTitle.trim();
        payload.ctaButtonText = formData.ctaButtonText.trim();
        payload.ctaButtonUrl = formData.ctaButtonUrl.trim();
      }

      if (editData?.id) {
        // Update existing
        if (isPropertyTypeSelected) {
          // Use property-specific update API
          await updateAboutUsByPropertyTypeId(
            editData.id,
            formData.propertyTypeId,
            payload,
          );
          showSuccess("Property-specific About Us updated successfully");
        } else {
          // Use general update API
          await updateAboutUsById(editData.id, payload);
          showSuccess("About Us updated successfully");
        }
      } else {
        // Create new
        if (isPropertyTypeSelected) {
          // Use property-specific create API
          await addAboutUsByPropertyType(formData.propertyTypeId, payload);
          showSuccess("Property-specific About Us created successfully");
        } else {
          // Use general create API
          await addAboutUs(payload);
          showSuccess("About Us created successfully");
        }
      }

      onClose(true);
      resetForm();
    } catch (error) {
      console.error("Save error:", error);
      showError(error?.response?.data?.message || "Failed to save section");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedPropertyType = propertyTypes.find(
    (pt) => pt.id === formData.propertyTypeId,
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => onClose(false)}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h3 className="text-xl font-bold">
              {editData ? "Update About Us" : "Add About Us"}
            </h3>
            {selectedPropertyType && (
              <p className="text-xs mt-1 text-primary font-medium">
                For {selectedPropertyType.typeName} Pages
              </p>
            )}
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Property Type Selector - Only show when creating new */}
          {!editData && (
            <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
              <label className="text-xs font-bold uppercase text-gray-500 mb-3 block flex items-center gap-2">
                <Building2 size={14} />
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* General/Homepage Option */}
                <button
                  type="button"
                  onClick={() => handlePropertyTypeChange(null)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.propertyTypeId === null
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Home
                      size={16}
                      className={
                        formData.propertyTypeId === null
                          ? "text-primary"
                          : "text-gray-400"
                      }
                    />
                    <span
                      className={`text-sm font-bold ${
                        formData.propertyTypeId === null
                          ? "text-primary"
                          : "text-gray-700"
                      }`}
                    >
                      General
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    For main website / all pages
                  </p>
                </button>

                {/* Property Type Selector */}
                <div className="relative">
                  <select
                    value={formData.propertyTypeId || ""}
                    onChange={(e) =>
                      handlePropertyTypeChange(
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                    className={`w-full h-full p-4 rounded-lg border-2 text-sm font-bold cursor-pointer transition-all ${
                      formData.propertyTypeId !== null
                        ? "border-primary bg-primary/10 text-primary shadow-md"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                    style={{ appearance: "none" }}
                  >
                    <option value="">Select Property Type</option>
                    {propertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.typeName}
                      </option>
                    ))}
                  </select>
                  <Building2
                    size={16}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                      formData.propertyTypeId !== null
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-3 italic">
                {isPropertyTypeSelected
                  ? "Property mode: Only basic fields (title, subtitle, description, images)"
                  : "General mode: All fields available (including video and CTA links)"}
              </p>
            </div>
          )}

          {/* Property Type Display - Show when editing */}
          {editData && isPropertyTypeSelected && (
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                <p className="text-sm font-bold text-blue-900">
                  Property Type: {selectedPropertyType?.typeName || "Unknown"}
                </p>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                This is a property-specific About Us section. Only basic fields
                are editable.
              </p>
            </div>
          )}

          {/* Basic Fields - Always shown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                Section Title <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.sectionTitle}
                onChange={(e) =>
                  handleInputChange("sectionTitle", e.target.value)
                }
                placeholder="e.g., About Kennedia Hotels"
                className="w-full px-4 py-2 rounded-lg border text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                Sub Title <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.subTitle}
                onChange={(e) => handleInputChange("subTitle", e.target.value)}
                placeholder="e.g., Building Excellence"
                className="w-full px-4 py-2 rounded-lg border text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your section..."
                className="w-full px-4 py-2 rounded-lg border text-sm resize-none bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          {/* YouTube Video Feature - Only for general mode */}
          {!isPropertyTypeSelected && (
            <div className="p-4 rounded-xl border border-dashed border-gray-300">
              <h4 className="text-xs font-bold uppercase mb-4 text-primary flex items-center gap-2">
                YouTube Video Feature (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Video Title"
                  value={formData.videoTitle}
                  onChange={(e) =>
                    handleInputChange("videoTitle", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <input
                  placeholder="YouTube URL"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    handleInputChange("videoUrl", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          )}

          {/* CTA Button Fields - Only for general mode */}
          {!isPropertyTypeSelected && (
            <div className="p-4 rounded-xl border border-dashed border-gray-300">
              <h4 className="text-xs font-bold uppercase mb-4 text-primary flex items-center gap-2">
                Call-to-Action Button (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Button Text (e.g., More Details →)"
                  value={formData.ctaButtonText}
                  onChange={(e) =>
                    handleInputChange("ctaButtonText", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <input
                  placeholder="Button URL (e.g., /about-us)"
                  value={formData.ctaButtonUrl}
                  onChange={(e) =>
                    handleInputChange("ctaButtonUrl", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          )}

          {/* Image Gallery - Always shown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-primary">
                Image Gallery
              </h4>
              <button
                onClick={handleAddMediaSlot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold text-primary border-primary hover:bg-primary/5 transition-colors"
              >
                <Plus size={14} /> Add Image Slot
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mediaItems.length === 0 ? (
                <div className="col-span-full text-center py-8 border-2 border-dashed rounded-lg">
                  <ImageIcon size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    No images added yet. Click "Add Image Slot" to begin.
                  </p>
                </div>
              ) : (
                mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative p-3 rounded-xl border bg-gray-50 group hover:border-primary/50 transition-all"
                  >
                    <button
                      onClick={() => handleRemoveMediaItem(item.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="space-y-3">
                      {!item.isExisting && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-2 min-h-[100px] border-gray-300 hover:border-primary transition-colors">
                          {item.url ? (
                            <img
                              src={item.url}
                              alt="Preview"
                              className="h-20 w-full object-cover rounded-lg"
                            />
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center">
                              <ImageIcon className="text-gray-400" size={24} />
                              <span className="text-[10px] mt-1 text-gray-500">
                                Choose File
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileSelect(item.id, e.target.files[0])
                                }
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}
                      {item.isExisting && (
                        <div className="relative">
                          <img
                            src={item.url}
                            alt="Saved"
                            className="h-24 w-full object-cover rounded-lg border"
                          />
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded">
                            Saved
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3 bg-gray-50">
          <button
            onClick={() => onClose(false)}
            className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-primary disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {editData ? "Updating..." : "Creating..."}
              </>
            ) : editData ? (
              "Update Section"
            ) : (
              "Save Section"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUpdateAboutModal;
