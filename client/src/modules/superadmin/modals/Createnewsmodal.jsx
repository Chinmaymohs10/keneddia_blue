import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import {
  X,
  Upload,
  Loader2,
  Tag,
  FileText,
  Calendar,
  Clock,
  User,
  Hash,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import {
  createNews,
  updateNewsById,
  uploadMedia,
  getPropertyTypes,
  getMediaById,
} from "@/Api/Api";
import { toast } from "react-hot-toast";

function CreateNewsModal({ isOpen, onClose, editingNews }) {
  console.log(editingNews);
  const [formData, setFormData] = useState({
    category: "PRESS",
    title: "",
    slug: "",
    description: "",
    longDesc: "",
    dateBadge: "",
    badgeTypeId: "",
    ctaText: "Read Story",
    ctaLink: "",
    authorName: "",
    authorDescription: "",
    readTime: "",
    tags: "",
    newsDate: "",
    active: true,
  });

  const [badgeTypes, setBadgeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedMediaId, setUploadedMediaId] = useState(null);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Fetch Badge Types on Open
  useEffect(() => {
    if (isOpen) {
      fetchBadgeTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingNews && isOpen) {
      const matchedBadge = badgeTypes.find(
        (b) =>
          b.typeName?.toLowerCase() === editingNews.badgeType?.toLowerCase(),
      );

      setFormData({
        category: editingNews.category || "PRESS",
        title: editingNews.title || "",
        slug: editingNews.slug || "",
        description: editingNews.description || "",
        longDesc: editingNews.longDesc || "",
        dateBadge: getTodayDate(),
        badgeTypeId: matchedBadge
          ? matchedBadge.id
          : editingNews.badgeTypeId || "",
        ctaText: editingNews.ctaText || "Read Story",
        ctaLink: editingNews.ctaLink || "",
        authorName: editingNews.authorName || "",
        authorDescription: editingNews.authorDescription || "",
        readTime: editingNews.readTime || "",
        tags: editingNews.tags || "",
        newsDate: editingNews.newsDate || "",
        active: editingNews.active ?? true,
      });

      // Fix: Properly set the media ID for editing
      if (editingNews.imageMediaId) {
        setUploadedMediaId(editingNews.imageMediaId); // Store actual numeric ID
        fetchExistingMedia(editingNews.imageMediaId);
      } else if (editingNews.imageUrl) {
        setImagePreview(editingNews.imageUrl);
        // Set to null to indicate image exists but ID is missing
        setUploadedMediaId(null);
      }
    }
  }, [editingNews, isOpen, badgeTypes]);

  const fetchExistingMedia = async (id) => {
    try {
      const response = await getMediaById(id);
      const url =
        response?.data?.url || response?.url || response?.data?.imageUrl;
      if (url) setImagePreview(url);
    } catch (error) {
      console.error("Failed to fetch media details:", error);
    }
  };

  const fetchBadgeTypes = async () => {
    try {
      const response = await getPropertyTypes();
      if (response?.data && Array.isArray(response.data)) {
        const activeTypes = response.data.filter((type) => type.isActive);
        setBadgeTypes(activeTypes);
      }
    } catch (error) {
      console.error("Failed to load badge types:", error);
      toast.error("Failed to load badge types");
    }
  };

  const resetForm = () => {
    setFormData({
      category: "PRESS",
      title: "",
      slug: "",
      description: "",
      longDesc: "",
      dateBadge: "",
      badgeTypeId: "",
      ctaText: "Read Story",
      ctaLink: "",
      authorName: "",
      authorDescription: "",
      readTime: "",
      tags: "",
      newsDate: "",
      active: true,
    });
    setImagePreview(null);
    setSelectedFile(null);
    setUploadedMediaId(null);
  };

  const handleTitleChange = (val) => {
    const trimmedVal = val.slice(0, 200);
    setFormData((prev) => ({
      ...prev,
      title: trimmedVal,
      slug: generateSlug(trimmedVal),
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    await uploadImageFile(file);
  };

  const uploadImageFile = async (file) => {
    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "IMAGE");
      formDataUpload.append("alt", formData.title || "News image");

      const response = await uploadMedia(formDataUpload);
      const mediaId =
        response?.data?.id || response?.id || response?.data || response;

      if (mediaId && typeof mediaId !== "object") {
        setUploadedMediaId(mediaId);
        toast.success(`Image uploaded`);
      }
    } catch (error) {
      toast.error("Failed to upload image");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setUploadedMediaId(null);
  };

  // Validation helper - returns array of missing fields
  const getValidationErrors = () => {
    const errors = [];

    if (!formData.title?.trim()) {
      errors.push("Title");
    }
    if (!formData.badgeTypeId) {
      errors.push("Badge Type");
    }
    if (!formData.description?.trim()) {
      errors.push("Description");
    }

    // Image validation - must have a valid numeric ID
    const hasValidImageId =
      uploadedMediaId !== null &&
      uploadedMediaId !== undefined &&
      typeof uploadedMediaId === "number";

    if (!hasValidImageId) {
      errors.push("Image (upload required)");
    }

    return errors;
  };

  // Check if form is valid
  const isFormValid = () => {
    return getValidationErrors().length === 0;
  };

  // Get validation message for display
  const getValidationMessage = () => {
    const errors = getValidationErrors();
    if (errors.length === 0) return null;

    if (errors.length === 1) {
      return `Missing: ${errors[0]}`;
    }

    return `Missing: ${errors.slice(0, -1).join(", ")} and ${errors[errors.length - 1]}`;
  };

  const handleSubmit = async () => {
    const errors = getValidationErrors();

    if (errors.length > 0) {
      toast.error(`Please fill required fields: ${errors.join(", ")}`);
      return;
    }

    // Double-check image ID is a valid number
    if (typeof uploadedMediaId !== "number") {
      toast.error("Please upload an image. A valid image ID is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        category: formData.category,
        title: formData.title.trim(),
        slug: formData.slug,
        description: formData.description.trim(),
        longDesc: formData.longDesc?.trim() || "",
        dateBadge: getTodayDate(),
        badgeTypeId: parseInt(formData.badgeTypeId),
        ctaText: formData.ctaText?.trim() || "Read Story",
        authorName: formData.authorName?.trim() || "",
        authorDescription: formData.authorDescription?.trim() || "",
        readTime: formData.readTime?.trim() || "",
        tags: formData.tags?.trim() || "",
        newsDate: formData.newsDate,
        imageMediaId: uploadedMediaId, // Must be a numeric ID
        active: formData.active,
      };

      if (editingNews) {
        await updateNewsById(editingNews.id, payload);
        toast.success("News updated successfully");
      } else {
        await createNews(payload);
        toast.success("News created successfully");
      }
      onClose(true);
      resetForm();
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(error.response?.data?.message || "Failed to save news");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  if (!isOpen) return null;

  const validationMessage = getValidationMessage();
  const formValid = isFormValid();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div
          className="flex items-center justify-between mb-6 border-b pb-4"
          style={{ borderColor: colors.border }}
        >
          <div>
            <h3
              className="text-xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              {editingNews ? "Edit News" : "Create News Article"}
            </h3>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Fill in the news details and upload an image
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <Tag size={14} /> Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-lg border outline-none"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="PRESS">PRESS</option>
                  <option value="NEWS">NEWS</option>
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                </select>
              </div>

              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Badge Type *
                </label>
                <select
                  value={formData.badgeTypeId}
                  onChange={(e) =>
                    handleInputChange("badgeTypeId", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none ${
                    !formData.badgeTypeId ? "border-red-300" : ""
                  }`}
                  style={{
                    borderColor: !formData.badgeTypeId
                      ? "#FCA5A5"
                      : colors.border,
                    backgroundColor: colors.mainBg,
                    color: formData.badgeTypeId
                      ? colors.textPrimary
                      : "#9CA3AF",
                  }}
                >
                  <option value="">Select Badge</option>
                  {badgeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                style={{ color: colors.textSecondary }}
              >
                <FileText size={14} /> News Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none ${
                  !formData.title?.trim() ? "border-red-300" : ""
                }`}
                style={{
                  borderColor: !formData.title?.trim()
                    ? "#FCA5A5"
                    : colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
                placeholder="e.g., Expansion Plans for 2026"
                maxLength={200}
              />
              {/* <div
                className="mt-2 flex items-center gap-2 text-[10px] font-mono p-2 rounded bg-gray-50 border border-dashed"
                style={{
                  color: colors.textSecondary,
                  borderColor: colors.border,
                }}
              >
                <Globe size={12} />{" "}
                <span className="truncate">
                  {window.location.origin}/news/
                  {formData.slug || "slug-preview"}
                </span>
              </div> */}
            </div>

            <div>
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                style={{ color: colors.textSecondary }}
              >
                Short Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none resize-none ${
                  !formData.description?.trim() ? "border-red-300" : ""
                }`}
                style={{
                  borderColor: !formData.description?.trim()
                    ? "#FCA5A5"
                    : colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
                placeholder="Brief summary of the news article"
                maxLength={200}
              />
            </div>

            <div>
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                style={{ color: colors.textSecondary }}
              >
                Full Article Content
              </label>
              <textarea
                value={formData.longDesc}
                onChange={(e) => handleInputChange("longDesc", e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border outline-none resize-none"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.mainBg,
                  color: colors.textPrimary,
                }}
                placeholder="Full article content..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <User size={14} /> Author Name
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) =>
                    handleInputChange("authorName", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-lg border outline-none"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                    color: colors.textPrimary,
                  }}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <Clock size={14} /> Read Time
                </label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) =>
                    handleInputChange("readTime", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-lg border outline-none"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.mainBg,
                    color: colors.textPrimary,
                  }}
                  placeholder="5 min read"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className={`border rounded-xl p-5 ${
                typeof uploadedMediaId !== "number"
                  ? "border-red-300 bg-red-50/30"
                  : ""
              }`}
              style={{
                borderColor:
                  typeof uploadedMediaId !== "number"
                    ? "#FCA5A5"
                    : colors.border,
                backgroundColor:
                  typeof uploadedMediaId !== "number"
                    ? "#FEF2F2"
                    : colors.mainBg,
              }}
            >
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase mb-4"
                style={{ color: colors.textSecondary }}
              >
                <ImageIcon size={14} /> News Image *
                {typeof uploadedMediaId !== "number" && (
                  <span className="text-red-500 font-normal normal-case ml-2">
                    (Required - Please upload)
                  </span>
                )}
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-all ${uploadingImage ? "opacity-60" : ""}`}
                onClick={() =>
                  !uploadingImage &&
                  document.getElementById("news-file-upload")?.click()
                }
                style={{
                  borderColor:
                    typeof uploadedMediaId !== "number"
                      ? "#F87171"
                      : colors.border,
                }}
              >
                <input
                  id="news-file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                {uploadingImage ? (
                  <Loader2
                    size={30}
                    className="mx-auto animate-spin text-primary"
                  />
                ) : (
                  <>
                    <Upload
                      size={30}
                      className={`mx-auto mb-2 ${typeof uploadedMediaId !== "number" ? "text-red-400" : "opacity-20"}`}
                    />
                    <p
                      className={`text-xs font-medium ${typeof uploadedMediaId !== "number" ? "text-red-600" : "text-gray-600"}`}
                    >
                      {selectedFile
                        ? selectedFile.name
                        : typeof uploadedMediaId !== "number"
                          ? "Click to upload image (Required)"
                          : "Click to upload image"}
                    </p>
                  </>
                )}
              </div>

              {imagePreview && (
                <div className="mt-6 relative">
                  <img
                    src={imagePreview}
                    className="w-full h-56 object-cover rounded-xl border"
                    style={{ borderColor: colors.border }}
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  {/* Show warning if image exists but no valid ID */}
                  {imagePreview && typeof uploadedMediaId !== "number" && (
                    <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                      <AlertCircle size={14} />
                      <span>
                        Image ID missing. Please re-upload this image.
                      </span>
                    </div>
                  )}

                  {/* Show success indicator if valid ID */}
                  {typeof uploadedMediaId === "number" && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg">
                      ✓ Image ID: {uploadedMediaId}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="border rounded-xl p-5"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
              }}
            >
              <label className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold uppercase"
                  style={{ color: colors.textSecondary }}
                >
                  Status
                </span>
                <button
                  type="button"
                  onClick={() => handleInputChange("active", !formData.active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.active ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </label>
            </div>

            {/* Validation Summary Card */}
            {validationMessage && (
              <div
                className="border rounded-xl p-4 bg-amber-50 border-amber-200"
                style={{}}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase mb-1">
                      Cannot {editingNews ? "Update" : "Publish"} Yet
                    </p>
                    <p className="text-xs text-amber-700">
                      {validationMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex gap-4 mt-8 pt-6 border-t"
          style={{ borderColor: colors.border }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 rounded-lg font-bold border hover:bg-gray-50 transition-colors"
            style={{ borderColor: colors.border, color: colors.textPrimary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploadingImage || !formValid}
            className="flex-[2] py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative group"
            style={{
              backgroundColor: formValid ? colors.primary : "#9CA3AF",
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : uploadingImage ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Uploading Image...
              </>
            ) : editingNews ? (
              "Update News"
            ) : (
              "Publish News"
            )}

            {/* Tooltip on hover when disabled */}
            {!formValid && !loading && !uploadingImage && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {validationMessage}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateNewsModal;
