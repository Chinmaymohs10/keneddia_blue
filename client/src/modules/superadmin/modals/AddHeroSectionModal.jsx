// components/modals/AddHeroSectionModal.jsx
import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import { Upload, X, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  uploadHeroMediaBulk,
  createHeroSection,
  updateHeroSectionById,
} from "@/Api/Api";

function AddHeroSectionModal({ isOpen, onClose, onSuccess, editData = null }) {
  const [formData, setFormData] = useState({
    mainTitle: "",
    subTitle: "",
    ctaText: "",
    active: true,
    showOnHomepage: false,
  });

  const [backgroundMedia, setBackgroundMedia] = useState({
    theme: "ALL", // ALL, SPLIT
    // For ALL theme
    allFiles: [], // Array of files
    allPreviews: [], // Array of preview URLs
    allMediaTypes: [], // Array of media types
    allMediaIds: [], // Array of uploaded media IDs (for edit mode)

    // For SPLIT theme
    lightFiles: [],
    lightPreviews: [],
    lightMediaTypes: [],
    lightMediaIds: [],

    darkFiles: [],
    darkPreviews: [],
    darkMediaTypes: [],
    darkMediaIds: [],
  });

  const [subMedia, setSubMedia] = useState({
    theme: "ALL",
    allFiles: [],
    allPreviews: [],
    allMediaTypes: [],
    allMediaIds: [],

    lightFiles: [],
    lightPreviews: [],
    lightMediaTypes: [],
    lightMediaIds: [],

    darkFiles: [],
    darkPreviews: [],
    darkMediaTypes: [],
    darkMediaIds: [],
  });

  const [showPreview, setShowPreview] = useState(true);
  const [previewTheme, setPreviewTheme] = useState("LIGHT");
  const [loading, setLoading] = useState(false);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [currentSubIndex, setCurrentSubIndex] = useState(0);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        mainTitle: "",
        subTitle: "",
        ctaText: "",
        active: true,
        showOnHomepage: false,
      });
      setBackgroundMedia({
        theme: "ALL",
        allFiles: [],
        allPreviews: [],
        allMediaTypes: [],
        allMediaIds: [],
        lightFiles: [],
        lightPreviews: [],
        lightMediaTypes: [],
        lightMediaIds: [],
        darkFiles: [],
        darkPreviews: [],
        darkMediaTypes: [],
        darkMediaIds: [],
      });
      setSubMedia({
        theme: "ALL",
        allFiles: [],
        allPreviews: [],
        allMediaTypes: [],
        allMediaIds: [],
        lightFiles: [],
        lightPreviews: [],
        lightMediaTypes: [],
        lightMediaIds: [],
        darkFiles: [],
        darkPreviews: [],
        darkMediaTypes: [],
        darkMediaIds: [],
      });
      setShowPreview(true);
      setPreviewTheme("LIGHT");
      setCurrentBackgroundIndex(0);
      setCurrentSubIndex(0);
    }
  }, [isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        mainTitle: editData.mainTitle || "",
        subTitle: editData.subTitle || "",
        ctaText: editData.ctaText || "",
        active: editData.active ?? true,
        showOnHomepage: editData.showOnHomepage ?? false,
      });

      // Set background media from edit data
      if (
        editData.backgroundMediaAll &&
        editData.backgroundMediaAll.length > 0
      ) {
        setBackgroundMedia((prev) => ({
          ...prev,
          theme: "ALL",
          allPreviews: editData.backgroundMediaAll.map((m) => m.url),
          allMediaTypes: editData.backgroundMediaAll.map((m) => m.mediaType),
          allMediaIds: editData.backgroundMediaAll.map((m) => m.id),
        }));
      } else if (
        editData.backgroundMediaLight &&
        editData.backgroundMediaDark
      ) {
        setBackgroundMedia((prev) => ({
          ...prev,
          theme: "SPLIT",
          lightPreviews: editData.backgroundMediaLight.map((m) => m.url),
          lightMediaTypes: editData.backgroundMediaLight.map(
            (m) => m.mediaType,
          ),
          lightMediaIds: editData.backgroundMediaLight.map((m) => m.id),
          darkPreviews: editData.backgroundMediaDark.map((m) => m.url),
          darkMediaTypes: editData.backgroundMediaDark.map((m) => m.mediaType),
          darkMediaIds: editData.backgroundMediaDark.map((m) => m.id),
        }));
      }

      // Set sub media from edit data
      if (editData.subMediaAll && editData.subMediaAll.length > 0) {
        setSubMedia((prev) => ({
          ...prev,
          theme: "ALL",
          allPreviews: editData.subMediaAll.map((m) => m.url),
          allMediaTypes: editData.subMediaAll.map((m) => m.mediaType),
          allMediaIds: editData.subMediaAll.map((m) => m.id),
        }));
      } else if (editData.subMediaLight && editData.subMediaDark) {
        setSubMedia((prev) => ({
          ...prev,
          theme: "SPLIT",
          lightPreviews: editData.subMediaLight.map((m) => m.url),
          lightMediaTypes: editData.subMediaLight.map((m) => m.mediaType),
          lightMediaIds: editData.subMediaLight.map((m) => m.id),
          darkPreviews: editData.subMediaDark.map((m) => m.url),
          darkMediaTypes: editData.subMediaDark.map((m) => m.mediaType),
          darkMediaIds: editData.subMediaDark.map((m) => m.id),
        }));
      }
    }
  }, [editData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultipleFilesChange = (
    mediaType,
    theme,
    files,
    isBackground = true,
  ) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const newPreviews = [];
    const newMediaTypes = [];
    const newFiles = [];

    filesArray.forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error("Please select valid image or video files");
        return;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
      newMediaTypes.push(isImage ? "IMAGE" : "VIDEO");
    });

    if (newFiles.length === 0) return;

    const setter = isBackground ? setBackgroundMedia : setSubMedia;

    if (theme === "LIGHT") {
      setter((prev) => ({
        ...prev,
        lightFiles: [...prev.lightFiles, ...newFiles],
        lightPreviews: [...prev.lightPreviews, ...newPreviews],
        lightMediaTypes: [...prev.lightMediaTypes, ...newMediaTypes],
      }));
    } else if (theme === "DARK") {
      setter((prev) => ({
        ...prev,
        darkFiles: [...prev.darkFiles, ...newFiles],
        darkPreviews: [...prev.darkPreviews, ...newPreviews],
        darkMediaTypes: [...prev.darkMediaTypes, ...newMediaTypes],
      }));
    } else {
      setter((prev) => ({
        ...prev,
        allFiles: [...prev.allFiles, ...newFiles],
        allPreviews: [...prev.allPreviews, ...newPreviews],
        allMediaTypes: [...prev.allMediaTypes, ...newMediaTypes],
      }));
    }
  };

  const removeMediaAtIndex = (theme, index, isBackground = true) => {
    const setter = isBackground ? setBackgroundMedia : setSubMedia;

    if (theme === "LIGHT") {
      setter((prev) => ({
        ...prev,
        lightFiles: prev.lightFiles.filter((_, i) => i !== index),
        lightPreviews: prev.lightPreviews.filter((_, i) => i !== index),
        lightMediaTypes: prev.lightMediaTypes.filter((_, i) => i !== index),
        lightMediaIds: prev.lightMediaIds.filter((_, i) => i !== index),
      }));
    } else if (theme === "DARK") {
      setter((prev) => ({
        ...prev,
        darkFiles: prev.darkFiles.filter((_, i) => i !== index),
        darkPreviews: prev.darkPreviews.filter((_, i) => i !== index),
        darkMediaTypes: prev.darkMediaTypes.filter((_, i) => i !== index),
        darkMediaIds: prev.darkMediaIds.filter((_, i) => i !== index),
      }));
    } else {
      setter((prev) => ({
        ...prev,
        allFiles: prev.allFiles.filter((_, i) => i !== index),
        allPreviews: prev.allPreviews.filter((_, i) => i !== index),
        allMediaTypes: prev.allMediaTypes.filter((_, i) => i !== index),
        allMediaIds: prev.allMediaIds.filter((_, i) => i !== index),
      }));
    }
  };

  const handleThemeChange = (newTheme, isBackground = true) => {
    const setter = isBackground ? setBackgroundMedia : setSubMedia;
    setter((prev) => ({
      ...prev,
      theme: newTheme,
      // Clear files when switching themes
      allFiles: [],
      allPreviews: [],
      allMediaTypes: [],
      lightFiles: [],
      lightPreviews: [],
      lightMediaTypes: [],
      darkFiles: [],
      darkPreviews: [],
      darkMediaTypes: [],
    }));
  };

  const validateForm = () => {
    // Background media is required
    if (backgroundMedia.theme === "ALL") {
      if (
        backgroundMedia.allPreviews.length === 0 &&
        backgroundMedia.allMediaIds.length === 0
      ) {
        toast.error("Background media is required");
        return false;
      }
    } else {
      const hasLight =
        backgroundMedia.lightPreviews.length > 0 ||
        backgroundMedia.lightMediaIds.length > 0;
      const hasDark =
        backgroundMedia.darkPreviews.length > 0 ||
        backgroundMedia.darkMediaIds.length > 0;

      if (!hasLight || !hasDark) {
        toast.error("Both Light and Dark theme background media are required");
        return false;
      }
    }

    return true;
  };

  const uploadMediaFiles = async (files) => {
    if (files.length === 0) return [];

    const formData = new FormData();

    // Determine mediaType from first file
    const firstFile = files[0];
    const isImage = firstFile.type.startsWith("image/");
    const mediaType = isImage ? "IMAGE" : "VIDEO";

    // Append all files with key 'files' (not 'media')
    files.forEach((file) => {
      formData.append("files", file); // ✅ Correct key name
    });

    // Append mediaType
    formData.append("mediaType", mediaType); // ✅ Add mediaType

    try {
      const response = await uploadHeroMediaBulk(formData);
      if (response.success && response.data) {
        return response.data; // Array of { id, mediaType, url }
      }
      return [];
    } catch (error) {
      console.error("Media upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Step 1: Collect all files that need to be uploaded
      const allFilesToUpload = [
        ...backgroundMedia.allFiles,
        ...backgroundMedia.lightFiles,
        ...backgroundMedia.darkFiles,
        ...subMedia.allFiles,
        ...subMedia.lightFiles,
        ...subMedia.darkFiles,
      ];

      let uploadedMedia = [];

      // Step 2: Upload media if there are new files
      if (allFilesToUpload.length > 0) {
        // Separate files by type (API requires same type per request)
        const imageFiles = allFilesToUpload.filter((f) =>
          f.type.startsWith("image/"),
        );
        const videoFiles = allFilesToUpload.filter((f) =>
          f.type.startsWith("video/"),
        );

        // Upload images
        if (imageFiles.length > 0) {
          try {
            const imageFormData = new FormData();
            imageFiles.forEach((file) => {
              imageFormData.append("files", file);
            });
            imageFormData.append("mediaType", "IMAGE");

            console.log(`Uploading ${imageFiles.length} images...`);
            const imageResponse = await uploadHeroMediaBulk(imageFormData);

            // ✅ Handle both {success, data: [...]} and direct array [...] formats
            const responseData = imageResponse?.data || imageResponse;
            if (Array.isArray(responseData) && responseData.length > 0) {
              uploadedMedia.push(...responseData);
              console.log(
                `✅ Uploaded ${responseData.length} images`,
                responseData,
              );
            } else {
              console.warn("No images returned from API");
            }
          } catch (error) {
            console.error("Image upload failed:", error);
            throw new Error("Failed to upload images");
          }
        }

        // Upload videos
        if (videoFiles.length > 0) {
          try {
            const videoFormData = new FormData();
            videoFiles.forEach((file) => {
              videoFormData.append("files", file);
            });
            videoFormData.append("mediaType", "VIDEO");

            console.log(`Uploading ${videoFiles.length} videos...`);
            const videoResponse = await uploadHeroMediaBulk(videoFormData);

            // ✅ Handle both {success, data: [...]} and direct array [...] formats
            const responseData = videoResponse?.data || videoResponse;
            if (Array.isArray(responseData) && responseData.length > 0) {
              uploadedMedia.push(...responseData);
              console.log(
                `✅ Uploaded ${responseData.length} videos`,
                responseData,
              );
            } else {
              console.warn("No videos returned from API");
            }
          } catch (error) {
            console.error("Video upload failed:", error);
            throw new Error("Failed to upload videos");
          }
        }
      }

      console.log("=== All Uploaded Media ===");
      console.log(JSON.stringify(uploadedMedia, null, 2));

      // Step 3: Map uploaded media IDs back to their original file positions
      // Create arrays to track which files came from which category
      const fileCategories = [];

      // Track background ALL files
      backgroundMedia.allFiles.forEach((file) => {
        fileCategories.push({
          file,
          category: "backgroundAll",
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        });
      });

      // Track background LIGHT files
      backgroundMedia.lightFiles.forEach((file) => {
        fileCategories.push({
          file,
          category: "backgroundLight",
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        });
      });

      // Track background DARK files
      backgroundMedia.darkFiles.forEach((file) => {
        fileCategories.push({
          file,
          category: "backgroundDark",
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        });
      });

      // Track sub ALL files
      subMedia.allFiles.forEach((file) => {
        fileCategories.push({
          file,
          category: "subAll",
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        });
      });

      // Track sub LIGHT files
      subMedia.lightFiles.forEach((file) => {
        fileCategories.push({
          file,
          category: "subLight",
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        });
      });

      // Track sub DARK files
      subMedia.darkFiles.forEach((file) => {
        fileCategories.push({
          file,
          category: "subDark",
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        });
      });

      // Map uploaded media back to files
      const uploadedIdsByCategory = {
        backgroundAll: [],
        backgroundLight: [],
        backgroundDark: [],
        subAll: [],
        subLight: [],
        subDark: [],
      };

      // ✅ Separate uploaded media by type - API returns 'type' not 'mediaType'
      const uploadedImages = uploadedMedia.filter((m) => m.type === "IMAGE");
      const uploadedVideos = uploadedMedia.filter((m) => m.type === "VIDEO");

      let imageIndex = 0;
      let videoIndex = 0;

      // ✅ Match each file to its uploaded media ID - use 'mediaId' not 'id'
      fileCategories.forEach(({ category, type }) => {
        if (type === "IMAGE") {
          if (imageIndex < uploadedImages.length) {
            uploadedIdsByCategory[category].push(
              uploadedImages[imageIndex].mediaId,
            );
            imageIndex++;
          }
        } else {
          if (videoIndex < uploadedVideos.length) {
            uploadedIdsByCategory[category].push(
              uploadedVideos[videoIndex].mediaId,
            );
            videoIndex++;
          }
        }
      });

      console.log("=== Uploaded IDs by Category ===");
      console.log(JSON.stringify(uploadedIdsByCategory, null, 2));

      // Step 4: Combine existing media IDs with newly uploaded ones
      const backgroundAllIds = [
        ...backgroundMedia.allMediaIds,
        ...uploadedIdsByCategory.backgroundAll,
      ];

      const backgroundLightIds = [
        ...backgroundMedia.lightMediaIds,
        ...uploadedIdsByCategory.backgroundLight,
      ];

      const backgroundDarkIds = [
        ...backgroundMedia.darkMediaIds,
        ...uploadedIdsByCategory.backgroundDark,
      ];

      const subAllIds = [
        ...subMedia.allMediaIds,
        ...uploadedIdsByCategory.subAll,
      ];

      const subLightIds = [
        ...subMedia.lightMediaIds,
        ...uploadedIdsByCategory.subLight,
      ];

      const subDarkIds = [
        ...subMedia.darkMediaIds,
        ...uploadedIdsByCategory.subDark,
      ];

      // Step 5: Build the hero section payload
      const payload = {
        mainTitle: formData.mainTitle || null,
        subTitle: formData.subTitle || null,
        ctaText: formData.ctaText || null,
        backgroundAll: backgroundMedia.theme === "ALL" ? backgroundAllIds : [],
        backgroundLight:
          backgroundMedia.theme === "SPLIT" ? backgroundLightIds : [],
        backgroundDark:
          backgroundMedia.theme === "SPLIT" ? backgroundDarkIds : [],
        subAll: subMedia.theme === "ALL" ? subAllIds : [],
        subLight: subMedia.theme === "SPLIT" ? subLightIds : [],
        subDark: subMedia.theme === "SPLIT" ? subDarkIds : [],
        showOnHomepage: formData.showOnHomepage,
        active: formData.active,
      };

      console.log("=== Hero Section Payload ===");
      console.log(JSON.stringify(payload, null, 2));

      // Step 6: Create or update hero section
      if (editData?.id) {
        await updateHeroSectionById(editData.id, payload);
        toast.success("Hero section updated successfully!");
      } else {
        await createHeroSection(payload);
        toast.success("Hero section created successfully!");
      }

      // Step 7: Trigger parent refresh and close modal
      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error saving hero section:", error);

      // More specific error messages
      if (error.message === "Failed to upload images") {
        toast.error("Failed to upload images. Please try again.");
      } else if (error.message === "Failed to upload videos") {
        toast.error("Failed to upload videos. Please try again.");
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save hero section. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  // Get preview background based on current theme
  const getPreviewBackgrounds = () => {
    if (backgroundMedia.theme === "ALL") {
      return backgroundMedia.allPreviews;
    }
    if (previewTheme === "LIGHT") {
      return backgroundMedia.lightPreviews;
    }
    return backgroundMedia.darkPreviews;
  };

  const getPreviewBackgroundTypes = () => {
    if (backgroundMedia.theme === "ALL") {
      return backgroundMedia.allMediaTypes;
    }
    if (previewTheme === "LIGHT") {
      return backgroundMedia.lightMediaTypes;
    }
    return backgroundMedia.darkMediaTypes;
  };

  const getPreviewSubMedias = () => {
    if (subMedia.theme === "ALL") {
      return subMedia.allPreviews;
    }
    if (previewTheme === "LIGHT") {
      return subMedia.lightPreviews;
    }
    return subMedia.darkPreviews;
  };

  const getPreviewSubMediaTypes = () => {
    if (subMedia.theme === "ALL") {
      return subMedia.allMediaTypes;
    }
    if (previewTheme === "LIGHT") {
      return subMedia.lightMediaTypes;
    }
    return subMedia.darkMediaTypes;
  };

  const previewBackgrounds = getPreviewBackgrounds();
  const previewBackgroundTypes = getPreviewBackgroundTypes();
  const currentBackground = previewBackgrounds[currentBackgroundIndex] || null;
  const currentBackgroundType =
    previewBackgroundTypes[currentBackgroundIndex] || "IMAGE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg"
        style={{ backgroundColor: colors.contentBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{
            backgroundColor: colors.contentBg,
            borderColor: colors.border,
          }}
        >
          <h2
            className="text-xl font-semibold m-0"
            style={{ color: colors.textPrimary }}
          >
            {editData ? "Edit Hero Section" : "Add Hero Section"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 border-none rounded cursor-pointer transition-colors"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} style={{ color: colors.textPrimary }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="flex flex-col gap-5">
              {/* Text Fields */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Main Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.mainTitle}
                  onChange={(e) =>
                    handleInputChange("mainTitle", e.target.value)
                  }
                  placeholder="e.g., Where Luxury Meets Experience"
                  className="px-3 py-2.5 border rounded-md text-sm outline-none transition-colors"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: "#F3F4F6",
                    color: "#000000",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) =>
                    handleInputChange("subTitle", e.target.value)
                  }
                  placeholder="e.g., KENNEDIA BLU GROUP"
                  className="px-3 py-2.5 border rounded-md text-sm outline-none transition-colors"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: "#F3F4F6",
                    color: "#000000",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Call-to-Action Button Text (Optional)
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => handleInputChange("ctaText", e.target.value)}
                  placeholder="e.g., Explore →"
                  className="px-3 py-2.5 border rounded-md text-sm outline-none transition-colors"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: "#F3F4F6",
                    color: "#000000",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>

              {/* Background Media Section */}
              <div
                className="flex flex-col gap-3 p-4 rounded-md"
                style={{ backgroundColor: colors.border }}
              >
                <div className="flex items-center justify-between">
                  <label
                    className="text-[13px] font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    Background Media <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={backgroundMedia.theme}
                    onChange={(e) => handleThemeChange(e.target.value, true)}
                    className="px-3 py-1.5 border rounded-md text-xs outline-none"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.contentBg,
                      color: colors.textPrimary,
                    }}
                  >
                    <option value="ALL">All Themes (Both Light & Dark)</option>
                    <option value="SPLIT">Separate for Light & Dark</option>
                  </select>
                </div>

                {backgroundMedia.theme === "ALL" ? (
                  <MultiMediaUpload
                    label="Background Media (All Themes)"
                    previews={backgroundMedia.allPreviews}
                    mediaTypes={backgroundMedia.allMediaTypes}
                    onFilesChange={(files) =>
                      handleMultipleFilesChange(
                        "background",
                        "ALL",
                        files,
                        true,
                      )
                    }
                    onRemove={(index) => removeMediaAtIndex("ALL", index, true)}
                    required={true}
                  />
                ) : (
                  <>
                    <MultiMediaUpload
                      label="Background Media (Light Theme)"
                      previews={backgroundMedia.lightPreviews}
                      mediaTypes={backgroundMedia.lightMediaTypes}
                      onFilesChange={(files) =>
                        handleMultipleFilesChange(
                          "background",
                          "LIGHT",
                          files,
                          true,
                        )
                      }
                      onRemove={(index) =>
                        removeMediaAtIndex("LIGHT", index, true)
                      }
                      required={true}
                    />
                    <MultiMediaUpload
                      label="Background Media (Dark Theme)"
                      previews={backgroundMedia.darkPreviews}
                      mediaTypes={backgroundMedia.darkMediaTypes}
                      onFilesChange={(files) =>
                        handleMultipleFilesChange(
                          "background",
                          "DARK",
                          files,
                          true,
                        )
                      }
                      onRemove={(index) =>
                        removeMediaAtIndex("DARK", index, true)
                      }
                      required={true}
                    />
                  </>
                )}
              </div>

              {/* Sub Media Section */}
              <div
                className="flex flex-col gap-3 p-4 rounded-md"
                style={{ backgroundColor: colors.border }}
              >
                <div className="flex items-center justify-between">
                  <label
                    className="text-[13px] font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    Sub Media (Optional)
                  </label>
                  <select
                    value={subMedia.theme}
                    onChange={(e) => handleThemeChange(e.target.value, false)}
                    className="px-3 py-1.5 border rounded-md text-xs outline-none"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.contentBg,
                      color: colors.textPrimary,
                    }}
                  >
                    <option value="ALL">All Themes (Both Light & Dark)</option>
                    <option value="SPLIT">Separate for Light & Dark</option>
                  </select>
                </div>

                {subMedia.theme === "ALL" ? (
                  <MultiMediaUpload
                    label="Sub Media (All Themes)"
                    previews={subMedia.allPreviews}
                    mediaTypes={subMedia.allMediaTypes}
                    onFilesChange={(files) =>
                      handleMultipleFilesChange("sub", "ALL", files, false)
                    }
                    onRemove={(index) =>
                      removeMediaAtIndex("ALL", index, false)
                    }
                    required={false}
                  />
                ) : (
                  <>
                    <MultiMediaUpload
                      label="Sub Media (Light Theme)"
                      previews={subMedia.lightPreviews}
                      mediaTypes={subMedia.lightMediaTypes}
                      onFilesChange={(files) =>
                        handleMultipleFilesChange("sub", "LIGHT", files, false)
                      }
                      onRemove={(index) =>
                        removeMediaAtIndex("LIGHT", index, false)
                      }
                      required={false}
                    />
                    <MultiMediaUpload
                      label="Sub Media (Dark Theme)"
                      previews={subMedia.darkPreviews}
                      mediaTypes={subMedia.darkMediaTypes}
                      onFilesChange={(files) =>
                        handleMultipleFilesChange("sub", "DARK", files, false)
                      }
                      onRemove={(index) =>
                        removeMediaAtIndex("DARK", index, false)
                      }
                      required={false}
                    />
                  </>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) =>
                      handleInputChange("active", e.target.checked)
                    }
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: colors.primary }}
                  />
                  <label
                    htmlFor="active"
                    className="text-[13px] font-medium cursor-pointer"
                    style={{ color: colors.textSecondary }}
                  >
                    Set as Active
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showOnHomepage"
                    checked={formData.showOnHomepage}
                    onChange={(e) =>
                      handleInputChange("showOnHomepage", e.target.checked)
                    }
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: colors.primary }}
                  />
                  <label
                    htmlFor="showOnHomepage"
                    className="text-[13px] font-medium cursor-pointer"
                    style={{ color: colors.textSecondary }}
                  >
                    Show on Homepage
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-semibold m-0"
                  style={{ color: colors.textPrimary }}
                >
                  Preview{" "}
                  {previewBackgrounds.length > 1 &&
                    `(${currentBackgroundIndex + 1}/${previewBackgrounds.length})`}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Theme Toggle for Preview */}
                  {(backgroundMedia.theme === "SPLIT" ||
                    subMedia.theme === "SPLIT") && (
                    <div
                      className="flex items-center gap-1 p-1 rounded-md"
                      style={{ backgroundColor: colors.border }}
                    >
                      <button
                        onClick={() => setPreviewTheme("LIGHT")}
                        className="px-3 py-1 border-none rounded text-xs font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor:
                            previewTheme === "LIGHT"
                              ? colors.primary
                              : "transparent",
                          color:
                            previewTheme === "LIGHT"
                              ? colors.sidebarText
                              : colors.textPrimary,
                        }}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setPreviewTheme("DARK")}
                        className="px-3 py-1 border-none rounded text-xs font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor:
                            previewTheme === "DARK"
                              ? colors.primary
                              : "transparent",
                          color:
                            previewTheme === "DARK"
                              ? colors.sidebarText
                              : colors.textPrimary,
                        }}
                      >
                        Dark
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-3 py-1.5 border-none rounded-md text-xs font-medium cursor-pointer transition-colors"
                    style={{
                      backgroundColor: showPreview
                        ? colors.primary
                        : colors.border,
                      color: showPreview
                        ? colors.sidebarText
                        : colors.textPrimary,
                    }}
                  >
                    {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showPreview ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              {showPreview && (
                <>
                  <div
                    className="w-full h-[500px] rounded-lg flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: "#1a1a2e" }}
                  >
                    {/* Background Media */}
                    {currentBackground ? (
                      <>
                        {currentBackgroundType === "VIDEO" ? (
                          <video
                            key={currentBackground}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ filter: "brightness(0.7)" }}
                          >
                            <source src={currentBackground} type="video/mp4" />
                          </video>
                        ) : (
                          <div
                            className="absolute inset-0 w-full h-full bg-cover bg-center"
                            style={{
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${currentBackground}')`,
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                    )}

                    {/* Navigation arrows for multiple backgrounds */}
                    {previewBackgrounds.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentBackgroundIndex((prev) =>
                              prev === 0
                                ? previewBackgrounds.length - 1
                                : prev - 1,
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white border-none cursor-pointer"
                        >
                          ←
                        </button>
                        <button
                          onClick={() =>
                            setCurrentBackgroundIndex(
                              (prev) => (prev + 1) % previewBackgrounds.length,
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white border-none cursor-pointer"
                        >
                          →
                        </button>
                      </>
                    )}

                    {/* Theme Indicator Badge */}
                    {(backgroundMedia.theme === "SPLIT" ||
                      subMedia.theme === "SPLIT") && (
                      <div
                        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium z-20"
                        style={{
                          backgroundColor:
                            previewTheme === "LIGHT"
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(0,0,0,0.9)",
                          color: previewTheme === "LIGHT" ? "#000" : "#fff",
                        }}
                      >
                        {previewTheme === "LIGHT"
                          ? "☀️ Light Theme"
                          : "🌙 Dark Theme"}
                      </div>
                    )}

                    {/* Content Overlay */}
                    <div className="text-center p-10 z-10 relative">
                      {formData.mainTitle && (
                        <h1
                          className="text-[32px] font-bold m-0 mb-2"
                          style={{
                            color: colors.sidebarText,
                            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                          }}
                        >
                          {formData.mainTitle}
                        </h1>
                      )}
                      {formData.subTitle && (
                        <p
                          className="text-sm font-medium m-0 mb-6 tracking-[2px]"
                          style={{ color: colors.sidebarText }}
                        >
                          {formData.subTitle}
                        </p>
                      )}
                      {formData.ctaText && (
                        <button
                          className="px-8 py-3 border-none rounded-md text-sm font-semibold cursor-pointer transition-colors"
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.sidebarText,
                          }}
                        >
                          {formData.ctaText}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub Media Preview */}
                  {getPreviewSubMedias().length > 0 && (
                    <div className="mt-4">
                      <p
                        className="text-xs font-medium mb-2"
                        style={{ color: colors.textSecondary }}
                      >
                        Sub Media Preview:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {getPreviewSubMedias().map((preview, index) => (
                          <div
                            key={index}
                            className="rounded-md overflow-hidden"
                          >
                            {getPreviewSubMediaTypes()[index] === "IMAGE" ? (
                              <img
                                src={preview}
                                alt={`Sub media ${index + 1}`}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <video
                                src={preview}
                                controls
                                className="w-full h-32 object-cover"
                                playsInline
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Info */}
              <div
                className="p-4 rounded-md"
                style={{ backgroundColor: colors.border }}
              >
                <p
                  className="text-xs m-0 mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  <strong>💡 Guide:</strong>
                </p>
                <ul
                  className="text-xs m-0 pl-4"
                  style={{ color: colors.textSecondary }}
                >
                  <li className="mb-1">
                    Multiple media supported - upload several images/videos
                  </li>
                  <li className="mb-1">
                    Theme selection: Same media for all themes or separate for
                    light/dark
                  </li>
                  <li>
                    Text fields optional - use if media doesn't contain all info
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t"
          style={{
            backgroundColor: colors.contentBg,
            borderColor: colors.border,
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 border rounded-md text-sm font-medium cursor-pointer transition-colors"
            style={{
              borderColor: colors.border,
              backgroundColor: "transparent",
              color: colors.textPrimary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border-none rounded-md text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.primary,
              color: colors.sidebarText,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = colors.primary;
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{editData ? "Update" : "Create"} Hero Section</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Multi Media Upload Component
function MultiMediaUpload({
  label,
  previews,
  mediaTypes,
  onFilesChange,
  onRemove,
  required,
}) {
  const inputId = `media-${label.replace(/\s/g, "-").toLowerCase()}`;

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-[11px] font-medium"
        style={{ color: colors.textSecondary }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>

      {/* Display uploaded media */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group border rounded-md overflow-hidden"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.contentBg,
              }}
            >
              {mediaTypes[index] === "IMAGE" ? (
                <img
                  src={preview}
                  alt={`${label} ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <video
                  src={preview}
                  className="w-full h-24 object-cover"
                  muted
                />
              )}
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 p-1 border-none rounded-full cursor-pointer transition-opacity opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.9)" }}
              >
                <X size={12} style={{ color: "#fff" }} />
              </button>
              <div
                className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[9px] font-medium text-center"
                style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
              >
                {mediaTypes[index]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          type="file"
          id={inputId}
          accept="image/*,video/*"
          multiple
          onChange={(e) => onFilesChange(e.target.files)}
          className="hidden"
        />
        <label
          htmlFor={inputId}
          className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed rounded-md text-xs font-medium cursor-pointer transition-colors"
          style={{
            borderColor: colors.border,
            color: colors.textSecondary,
            backgroundColor: colors.contentBg,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.color = colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.color = colors.textSecondary;
          }}
        >
          <Upload size={16} />
          <span>{previews.length > 0 ? "Add More Media" : "Choose Media"}</span>
        </label>
      </div>
    </div>
  );
}

export default AddHeroSectionModal;
