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
  Globe,
  Image as ImageIcon,
  AlignLeft,
  Link as LinkIcon,
} from "lucide-react";
import {
  createEvent,
  updateEventById,
  getAllLocations,
  getPropertyTypes,
} from "@/Api/Api";
import { showSuccess, showInfo, showError, showWarning } from "@/lib/toasters/toastUtils";

function CreateEventModal({ isOpen, onClose, editingEvent }) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    locationId: "",
    propertyTypeId: "",
    eventDate: "",
    description: "",
    longDesc: "",
    status: "ACTIVE",
    ctaText: "",
    ctaLink: "",
    active: true,
  });

  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "IMAGE" | "VIDEO"
  const [imageUrl, setImageUrl] = useState("");

  // Validation state
  const [touchedFields, setTouchedFields] = useState({});

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  useEffect(() => {
    if (isOpen) {
      fetchLocations();
      fetchPropertyTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || "",
        slug: editingEvent.slug || "",
        locationId: editingEvent.locationId?.toString() || "",
        propertyTypeId: editingEvent.propertyTypeId?.toString() || "",
        eventDate: editingEvent.eventDate || "",
        description: editingEvent.description || "",
        longDesc: editingEvent.longDesc || "",
        status: editingEvent.status || "ACTIVE",
        ctaText: editingEvent.ctaText || "",
        ctaLink: editingEvent.ctaLink || "",
        active: editingEvent.active ?? true,
      });

      // Handle existing image
      if (editingEvent.image?.url) {
        setImagePreview(editingEvent.image.url);
        setImageUrl(editingEvent.image.url);
        setUploadMethod("url");
        setMediaType(editingEvent.image.type || "IMAGE");
      }
    } else if (isOpen) {
      // Clear form when creating new event
      clearForm();
    }
  }, [editingEvent, isOpen]);

  const fetchLocations = async () => {
    try {
      const response = await getAllLocations();
      if (response?.data && Array.isArray(response.data)) {
        const activeLocations = response.data.filter((loc) => loc.isActive);
        setLocations(activeLocations);
      }
    } catch (error) {
      console.error("Failed to load locations:", error);
      showError("Failed to load locations");
      setLocations([]);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await getPropertyTypes();
      if (response?.data && Array.isArray(response.data)) {
        const activeTypes = response.data.filter((type) => type.isActive);
        setPropertyTypes(activeTypes);
      }
    } catch (error) {
      console.error("Failed to load property types:", error);
      showError("Failed to load property types");
      setPropertyTypes([]);
    }
  };

  const handleTitleChange = (val) => {
    const trimmedVal = val.slice(0, 200);
    setFormData((prev) => ({
      ...prev,
      title: trimmedVal,
      slug: generateSlug(trimmedVal),
    }));
    setTouchedFields((prev) => ({ ...prev, title: true }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      showError("Unsupported file type");
      return;
    }

    // Size limits
    if (isImage && file.size > 5 * 1024 * 1024) {
      showError("Image size should be less than 5MB");
      return;
    }

    if (isVideo && file.size > 50 * 1024 * 1024) {
      showError("Video size should be less than 50MB");
      return;
    }

    setSelectedFile(file);
    setImageUrl("");
    setMediaType(isVideo ? "VIDEO" : "IMAGE");
    setTouchedFields((prev) => ({ ...prev, image: true }));

    // Preview
    if (isVideo) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url) => {
    setImageUrl(url);
    setTouchedFields((prev) => ({ ...prev, image: true }));

    if (!url.trim()) {
      setImagePreview(null);
      setMediaType(null);
      return;
    }

    const isVideoUrl = /\.(mp4|webm|ogg)$/i.test(url);

    setMediaType(isVideoUrl ? "VIDEO" : "IMAGE");
    setImagePreview(url);
    setSelectedFile(null);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title?.trim()) {
      errors.push("Event Title");
    }
    if (!formData.locationId) {
      errors.push("Location");
    }
    if (!formData.propertyTypeId) {
      errors.push("Property Type");
    }
    if (!formData.eventDate) {
      errors.push("Event Date");
    }
    if (!formData.description?.trim()) {
      errors.push("Short Description");
    }
    if (formData.description.length > 50) {
      errors.push("Short Description (must be ≤50 chars)");
    }
    if (!formData.ctaText?.trim()) {
      errors.push("CTA Button Text");
    }
    if (!selectedFile && !imageUrl) {
      errors.push("Event Image");
    }

    return errors;
  };

  const isFormValid = () => {
    const errors = validateForm();
    return errors.length === 0;
  };

  const buildFormData = () => {
    const formDataToSend = new FormData();

    // Core text fields
    formDataToSend.append("title", formData.title.trim());
    formDataToSend.append("slug", formData.slug);
    formDataToSend.append("locationId", formData.locationId);
    formDataToSend.append("propertyTypeId", formData.propertyTypeId);
    formDataToSend.append("eventDate", formData.eventDate);
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("longDesc", formData.longDesc.trim() || "");
    formDataToSend.append("status", formData.status);
    formDataToSend.append("ctaText", formData.ctaText.trim());
    formDataToSend.append("ctaLink", formData.ctaLink.trim() || "");
    formDataToSend.append("active", formData.active.toString());

    // Image handling - Priority: File > URL
    if (selectedFile) {
      // Direct file upload
      formDataToSend.append("image", selectedFile);
    } else if (imageUrl) {
      // External URL
      formDataToSend.append("imageMediaUrl", imageUrl);
    }

    return formDataToSend;
  };

  const handleButtonClick = () => {
    // Mark all fields as touched
    setTouchedFields({
      title: true,
      locationId: true,
      propertyTypeId: true,
      eventDate: true,
      description: true,
      ctaText: true,
      image: true,
    });

    const errors = validateForm();

    if (errors.length > 0) {
      showError(`Please fill required fields: ${errors.join(", ")}`);
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formDataToSend = buildFormData();

      // Debug: Log FormData contents
      console.log("Submitting FormData:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(
          `${key}:`,
          value instanceof File ? `File: ${value.name}` : value,
        );
      }

      if (editingEvent) {
        await updateEventById(editingEvent.id, formDataToSend);
        showSuccess("Event updated successfully");
      } else {
        const response = await createEvent(formDataToSend);
        console.log("Create event response:", response);
        showSuccess("Event created successfully");
      }

      onClose(true);
      clearForm();
    } catch (error) {
      console.error("Error saving event:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save event";
      showError(errorMessage);
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
      eventDate: "",
      description: "",
      longDesc: "",
      status: "ACTIVE",
      ctaText: "",
      ctaLink: "",
      active: true,
    });
    setImagePreview(null);
    setSelectedFile(null);
    setImageUrl("");
    setUploadMethod("upload");
    setMediaType(null);
    setTouchedFields({});
  };

  const handleClose = () => {
    clearForm();
    onClose(false);
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setSelectedFile(null);
    setImageUrl("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: colors.contentBg }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-6 border-b pb-4"
          style={{ borderColor: colors.border }}
        >
          <div>
            <h3
              className="text-xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h3>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Fill in the event details and upload an image
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form Fields */}
          <div className="space-y-5">
            {/* Event Title */}
            <div>
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                style={{ color: colors.textSecondary }}
              >
                <Tag size={14} /> Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => setTouchedFields((prev) => ({ ...prev, title: true }))}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  touchedFields.title && !formData.title.trim()
                    ? "border-red-500 border-2"
                    : ""
                }`}
                style={{
                  borderColor:
                    touchedFields.title && !formData.title.trim()
                      ? "#EF4444"
                      : colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
                placeholder="e.g., Summer Wine Festival"
                maxLength={200}
              />
            </div>

            {/* Property Type & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <Building2 size={14} /> Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.propertyTypeId}
                  onChange={(e) =>
                    handleInputChange("propertyTypeId", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedFields((prev) => ({ ...prev, propertyTypeId: true }))
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    touchedFields.propertyTypeId && !formData.propertyTypeId
                      ? "border-red-500 border-2"
                      : ""
                  }`}
                  style={{
                    borderColor:
                      touchedFields.propertyTypeId && !formData.propertyTypeId
                        ? "#EF4444"
                        : colors.border,
                    backgroundColor: colors.mainBg,
                    color: formData.propertyTypeId
                      ? colors.textPrimary
                      : "#9CA3AF",
                  }}
                >
                  <option value="">Select Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id.toString()}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <MapPin size={14} /> Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) =>
                    handleInputChange("locationId", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedFields((prev) => ({ ...prev, locationId: true }))
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    touchedFields.locationId && !formData.locationId
                      ? "border-red-500 border-2"
                      : ""
                  }`}
                  style={{
                    borderColor:
                      touchedFields.locationId && !formData.locationId
                        ? "#EF4444"
                        : colors.border,
                    backgroundColor: colors.mainBg,
                    color: formData.locationId ? colors.textPrimary : "#9CA3AF",
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id.toString()}>
                      {loc.locationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event Date & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <CalendarIcon size={14} /> Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    handleInputChange("eventDate", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedFields((prev) => ({ ...prev, eventDate: true }))
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    touchedFields.eventDate && !formData.eventDate
                      ? "border-red-500 border-2"
                      : ""
                  }`}
                  style={{
                    borderColor:
                      touchedFields.eventDate && !formData.eventDate
                        ? "#EF4444"
                        : colors.border,
                    backgroundColor: colors.mainBg,
                    color: colors.textPrimary,
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="SOLD_OUT">Sold Out</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Short Description (max 50 chars) */}
            <div>
              <label
                className="flex items-center justify-between gap-2 text-xs font-semibold uppercase mb-2"
                style={{ color: colors.textSecondary }}
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} /> Short Description <span className="text-red-500">*</span>
                </span>
                <span
                  className={`text-[10px] font-mono ${formData.description.length > 50 ? "text-red-500 font-bold" : "text-gray-400"}`}
                >
                  {formData.description.length}/50
                </span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                onBlur={() =>
                  setTouchedFields((prev) => ({ ...prev, description: true }))
                }
                placeholder="Brief event tagline (max 50 characters)"
                className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  (touchedFields.description && !formData.description.trim()) ||
                  formData.description.length > 50
                    ? "border-red-500 border-2"
                    : ""
                }`}
                style={{
                  borderColor:
                    (touchedFields.description && !formData.description.trim()) ||
                    formData.description.length > 50
                      ? "#EF4444"
                      : colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
                maxLength={50}
              />
              {formData.description.length > 50 && (
                <p className="text-xs text-red-500 mt-1">
                  Description must be 50 characters or less
                </p>
              )}
            </div>

            {/* Long Description */}
            <div>
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                style={{ color: colors.textSecondary }}
              >
                <AlignLeft size={14} /> Detailed Description
              </label>
              <textarea
                value={formData.longDesc}
                onChange={(e) => handleInputChange("longDesc", e.target.value)}
                rows={4}
                placeholder="Enter full event details, agenda, terms & conditions..."
                className="w-full px-4 py-2.5 rounded-lg border outline-none resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-400">
                  Complete event information with all details
                </p>
                <span className="text-[10px] font-mono text-gray-400">
                  {formData.longDesc.length}/1000
                </span>
              </div>
            </div>

            {/* CTA Text & CTA Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  CTA Button Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Book Now"
                  value={formData.ctaText}
                  onChange={(e) => handleInputChange("ctaText", e.target.value)}
                  onBlur={() =>
                    setTouchedFields((prev) => ({ ...prev, ctaText: true }))
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    touchedFields.ctaText && !formData.ctaText.trim()
                      ? "border-red-500 border-2"
                      : ""
                  }`}
                  style={{
                    borderColor:
                      touchedFields.ctaText && !formData.ctaText.trim()
                        ? "#EF4444"
                        : colors.border,
                    backgroundColor: colors.mainBg,
                    color: colors.textPrimary,
                  }}
                  maxLength={30}
                />
              </div>

              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <LinkIcon size={14} /> CTA Link
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/"
                  value={formData.ctaLink}
                  onChange={(e) => handleInputChange("ctaLink", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                    color: colors.textPrimary,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Image Upload */}
          <div className="space-y-5">
            <div
              className="border rounded-xl p-5 h-full"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
              }}
            >
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-4"
                style={{ color: colors.textSecondary }}
              >
                <ImageIcon size={14} /> Event Image <span className="text-red-500">*</span>
              </label>

              {/* Upload Method Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod("upload")}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                    uploadMethod === "upload"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-600"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                    uploadMethod === "url"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-600"
                  }`}
                >
                  Image URL
                </button>
              </div>

              {/* Upload Method Content */}
              {uploadMethod === "upload" ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all ${
                    touchedFields.image && !selectedFile && !imageUrl
                      ? "border-red-500"
                      : ""
                  }`}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  style={{
                    borderColor:
                      touchedFields.image && !selectedFile && !imageUrl
                        ? "#EF4444"
                        : colors.border,
                  }}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />

                  <Upload size={30} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-medium text-gray-600">
                    {selectedFile ? selectedFile.name : "Click to upload image"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 5MB | Video up to 50MB
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      touchedFields.image && !selectedFile && !imageUrl
                        ? "border-red-500 border-2"
                        : ""
                    }`}
                    style={{
                      borderColor:
                        touchedFields.image && !selectedFile && !imageUrl
                          ? "#EF4444"
                          : colors.border,
                      backgroundColor: "white",
                    }}
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    Enter a direct image URL (must start with http:// or
                    https://)
                  </p>
                </div>
              )}

              {/* Image / Video Preview */}
              {imagePreview && (
                <div className="mt-6 relative">
                  {mediaType === "VIDEO" ? (
                    <video
                      src={imagePreview}
                      className="w-full h-56 object-cover rounded-xl shadow-lg border"
                      style={{ borderColor: colors.border }}
                      controls
                      muted
                      playsInline
                      onError={() => {
                        showError("Failed to load video preview");
                        setImagePreview(null);
                        setMediaType(null);
                      }}
                    />
                  ) : (
                    <img
                      src={imagePreview}
                      className="w-full h-56 object-cover rounded-xl shadow-lg border"
                      style={{ borderColor: colors.border }}
                      alt="Event preview"
                      onError={() => {
                        showError("Failed to load image preview");
                        setImagePreview(null);
                        setMediaType(null);
                      }}
                    />
                  )}

                  {/* Upload source badge */}
                  {selectedFile && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1 shadow">
                      <Upload size={12} />
                      <span>File Ready</span>
                    </div>
                  )}

                  {imageUrl && !selectedFile && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1 shadow">
                      <LinkIcon size={12} />
                      <span>URL</span>
                    </div>
                  )}

                  {/* Media type badge */}
                  <div
                    className={`absolute bottom-2 left-2 px-2 py-1 text-white text-[10px] font-bold rounded-full shadow ${
                      mediaType === "VIDEO" ? "bg-purple-600" : "bg-black/70"
                    }`}
                  >
                    {mediaType === "VIDEO" ? "VIDEO" : "IMAGE"}
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    aria-label="Remove media"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="flex gap-4 mt-8 pt-6 border-t"
          style={{ borderColor: colors.border }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-3 rounded-lg font-bold text-sm border hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: colors.border, color: colors.textPrimary }}
          >
            Cancel
          </button>

          {/* Wrapper div to capture clicks even when button is disabled */}
          <div onClick={handleButtonClick} className="flex-[2]">
            <button
              type="button"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                loading || !isFormValid()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90 cursor-pointer"
              }`}
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {editingEvent ? "Updating..." : "Creating..."}
                </>
              ) : editingEvent ? (
                "Update Event"
              ) : (
                "Publish Event"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;