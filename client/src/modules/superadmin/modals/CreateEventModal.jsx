import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import {
  X,
  Upload,
  Loader2,
  MapPin,
  Tag,
  FileText,
  Calendar as CalendarIcon,
  Building2,
  Image as ImageIcon,
  AlignLeft,
  Home,
} from "lucide-react";
import {
  createEvent,
  updateEventById,
  getAllLocations,
  getPropertyTypes,
  GetAllPropertyDetails,
} from "@/Api/Api";
import { showSuccess, showError, showWarning } from "@/lib/toasters/toastUtils";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const HOMEPAGE_EVENT_RECOMMENDATION = {
  width: 1080,
  height: 1350,
  label: "Recommended: 1080 x 1350 (4:5 portrait). Taller reel-style images also fit.",
};

function CreateEventModal({ isOpen, onClose, editingEvent }) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    locationId: "",
    propertyTypeId: "",
    propertyId: "",
    eventDate: "",
    description: "",
    longDesc: "",
    status: "ACTIVE",
    ctaText: "",
    ctaLink: "",
    active: true,
    mediaId: "",
  });

  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [mediaType, setMediaType] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchLocations();
      fetchPropertyTypes();
      fetchProperties();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingEvent) {
      // Mapping all existing fields from the response format provided
      setFormData({
        title: editingEvent.title || "",
        slug: editingEvent.slug || "",
        locationId: editingEvent.locationId?.toString() || "",
        propertyTypeId: editingEvent.propertyTypeId?.toString() || "",
        propertyId: editingEvent.propertyId?.toString() || "",
        eventDate: editingEvent.eventDate || "",
        description: editingEvent.description || "",
        longDesc: editingEvent.longDesc || "",
        status: editingEvent.status || "ACTIVE",
        ctaText: editingEvent.ctaText || "",
        ctaLink: editingEvent.ctaLink || "",
        active: editingEvent.active ?? true,
        mediaId: editingEvent.image?.mediaId?.toString() || "",
      });

      if (editingEvent.image?.url) {
        setImagePreview(editingEvent.image.url);
        setUploadMethod("upload"); // Default to upload view to show existing image
        setMediaType(editingEvent.image.type);
        if (editingEvent.image.width && editingEvent.image.height) {
          setImageDimensions({
            width: editingEvent.image.width,
            height: editingEvent.image.height,
          });
        }
      }
    } else if (isOpen) {
      clearForm();
    }
  }, [editingEvent, isOpen]);

  const fetchProperties = async () => {
    try {
      const response = await GetAllPropertyDetails();
      // Supporting both nested propertyResponseDTO and flat structures
      const data = Array.isArray(response) ? response : response?.data || [];
      setProperties(data);
    } catch (error) {
      console.error("Property fetch error", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await getAllLocations();
      if (response?.data) setLocations(response.data.filter((l) => l.isActive));
    } catch (error) {
      showError("Failed to load locations");
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await getPropertyTypes();
      if (response?.data)
        setPropertyTypes(response.data.filter((t) => t.isActive));
    } catch (error) {
      showError("Failed to load property types");
    }
  };

  // AUTOMATED TYPE SELECTION: Sets Type and Location based on Property
  const handlePropertyChange = (propId) => {
    const selectedProp = properties.find(
      (p) => (p.id || p.propertyResponseDTO?.id)?.toString() === propId,
    );

    if (selectedProp) {
      const actualProp = selectedProp.propertyResponseDTO || selectedProp;
      setFormData((prev) => ({
        ...prev,
        propertyId: propId,
        // Auto-match the Property Type and Location if IDs exist in the property detail
        propertyTypeId:
          actualProp.propertyTypeId?.toString() || prev.propertyTypeId,
        locationId: actualProp.locationId?.toString() || prev.locationId,
      }));
    } else {
      setFormData((prev) => ({ ...prev, propertyId: propId }));
    }
  };

  const buildFormData = () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    if (selectedFile) {
      data.append("image", selectedFile);
    } else if (imageUrl && uploadMethod === "url") {
      data.append("imageMediaUrl", imageUrl);
    } else if (formData.mediaId) {
      data.append("mediaId", formData.mediaId);
    }
    return data;
  };

  const hasRecommendedEventRatio = (dimensions) => {
    if (!dimensions?.width || !dimensions?.height) return false;
    return dimensions.width / dimensions.height <= 0.85;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = buildFormData();
      if (editingEvent) {
        await updateEventById(editingEvent.id, payload);
        showSuccess("Event updated successfully");
      } else {
        await createEvent(payload);
        showSuccess("Event created successfully");
      }
      onClose(true);
    } catch (error) {
      showError("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      title: "",
      slug: "",
      locationId: "",
      propertyTypeId: "",
      propertyId: "",
      eventDate: "",
      description: "",
      longDesc: "",
      status: "ACTIVE",
      ctaText: "",
      ctaLink: "",
      active: true,
      mediaId: "",
    });
    setImagePreview(null);
    setSelectedFile(null);
    setImageUrl("");
    setImageDimensions(null);
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="admin-modal-surface rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div
          className="flex items-center justify-between mb-6 border-b pb-4"
          style={{ borderColor: colors.border }}
        >
          <h3
            className="text-xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {editingEvent ? "Edit Event" : "Create New Event"}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            {/* Title & Slug */}
            <div>
              <label
                className="text-xs font-semibold uppercase mb-2 block"
                style={{ color: colors.textSecondary }}
              >
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    title: e.target.value,
                    slug: p.slug || "",
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border outline-none"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
              />
            </div>

            {/* Property Selector - Triggers Auto-Type Selection */}
            <div>
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                style={{ color: colors.textSecondary }}
              >
                <Home size={14} /> Link to Property
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border outline-none"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
              >
                <option value="">Select Property</option>
                {properties.map((p) => {
                  const id = p.id || p.propertyResponseDTO?.id;
                  const name =
                    p.propertyName || p.propertyResponseDTO?.propertyName;
                  return (
                    <option key={id} value={id?.toString()}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Auto-filled Location & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="text-xs font-semibold uppercase mb-2 block"
                  style={{ color: colors.textSecondary }}
                >
                  Property Type
                </label>
                <select
                  value={formData.propertyTypeId}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      propertyTypeId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                  }}
                >
                  <option value="">Select Type</option>
                  {propertyTypes.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.typeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase mb-2 block"
                  style={{ color: colors.textSecondary }}
                >
                  Location
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, locationId: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id.toString()}>
                      {l.locationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="text-xs font-semibold uppercase mb-2 block"
                  style={{ color: colors.textSecondary }}
                >
                  <CalendarIcon size={14} className="inline mr-1" /> Event Date
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, eventDate: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase mb-2 block"
                  style={{ color: colors.textSecondary }}
                >
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, status: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="SOLD_OUT">Sold Out</option>
                </select>
              </div>
            </div>

            {/* CTA Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="text-xs font-semibold uppercase mb-2 block"
                  style={{ color: colors.textSecondary }}
                >
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ctaText: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                  }}
                  placeholder="e.g. Read More"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase mb-2 block"
                  style={{ color: colors.textSecondary }}
                >
                  CTA Link
                </label>
                <input
                  type="text"
                  value={formData.ctaLink}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ctaLink: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label
                className="text-xs font-semibold uppercase mb-2 block"
                style={{ color: colors.textSecondary }}
              >
                Short Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.mainBg,
                }}
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold uppercase mb-2 block"
                style={{ color: colors.textSecondary }}
              >
                Detailed Description
              </label>
              <textarea
                value={formData.longDesc}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, longDesc: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border resize-none"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.mainBg,
                }}
              />
            </div>
          </div>

          {/* Media Section */}
          <div className="space-y-5">
            <div
              className="border rounded-xl p-5 h-full"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
              }}
            >
              <label
                className="text-xs font-semibold uppercase mb-4 block"
                style={{ color: colors.textSecondary }}
              >
                Event Media
              </label>

              <div className="flex bg-gray-100 p-1 rounded-lg mb-4"></div>

              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById("file-upload")?.click()}
                style={{ borderColor: colors.border }}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (
                        file.type.startsWith("image/") &&
                        file.size > MAX_IMAGE_SIZE_BYTES
                      ) {
                        showWarning("Image size must not exceed 5 MB.");
                        e.target.value = "";
                        return;
                      }
                      setSelectedFile(file);
                      setFormData((p) => ({ ...p, mediaId: "" }));
                      setImagePreview(URL.createObjectURL(file));
                      if (file.type.startsWith("image/")) {
                        const image = new Image();
                        const objectUrl = URL.createObjectURL(file);
                        image.onload = () => {
                          const dims = {
                            width: image.naturalWidth,
                            height: image.naturalHeight,
                          };
                          setImageDimensions(dims);
                          if (!hasRecommendedEventRatio(dims)) {
                            showWarning(
                              `Event image should ideally be ${HOMEPAGE_EVENT_RECOMMENDATION.width} x ${HOMEPAGE_EVENT_RECOMMENDATION.height} or another portrait ratio.`,
                            );
                          }
                          URL.revokeObjectURL(objectUrl);
                        };
                        image.onerror = () => {
                          setImageDimensions(null);
                          URL.revokeObjectURL(objectUrl);
                        };
                        image.src = objectUrl;
                      } else {
                        setImageDimensions(null);
                      }
                    }
                  }}
                />

                <Upload size={30} className="mx-auto mb-2 opacity-20" />

                <p className="text-xs text-gray-500">
                  {selectedFile
                    ? selectedFile.name
                    : HOMEPAGE_EVENT_RECOMMENDATION.label}
                </p>
              </div>

              {imageDimensions && (
                <div
                  className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
                    hasRecommendedEventRatio(imageDimensions)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <p className="font-semibold">
                    Current upload: {imageDimensions.width} x {imageDimensions.height}
                  </p>
                  <p className="mt-1">{HOMEPAGE_EVENT_RECOMMENDATION.label}</p>
                </div>
              )}

              {imagePreview && (
                <div className="mt-6 relative group">
                  {selectedFile?.type?.startsWith("video") ||
                  mediaType === "VIDEO" ? (
                    <video
                      src={imagePreview}
                      controls
                      className="w-full h-52 object-cover rounded-xl border"
                    />
                  ) : (
                    <img
                      src={imagePreview}
                      className="w-full h-52 object-cover rounded-xl border"
                      alt="Preview"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                      setImageUrl("");
                      setMediaType(null);
                      setFormData((p) => ({ ...p, mediaId: "" }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex gap-4 mt-8 pt-6 border-t"
          style={{ borderColor: colors.border }}
        >
          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex-1 py-3 rounded-lg font-bold text-sm border"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : editingEvent ? (
              "Update Event"
            ) : (
              "Publish Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
