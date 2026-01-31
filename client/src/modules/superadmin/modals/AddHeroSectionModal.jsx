// components/modals/AddHeroSectionModal.jsx
import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import { Upload, X, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

function AddHeroSectionModal({ isOpen, onClose, onSuccess, editData = null }) {
  const [formData, setFormData] = useState({
    mainTitle: "",
    subTitle: "",
    ctaText: "",
    active: true,
  });

  const [backgroundMedia, setBackgroundMedia] = useState({
    theme: "ALL", // ALL, LIGHT, DARK
    lightFile: null,
    lightPreview: null,
    lightMediaType: "IMAGE",
    darkFile: null,
    darkPreview: null,
    darkMediaType: "IMAGE",
    allFile: null,
    allPreview: null,
    allMediaType: "IMAGE",
  });

  const [subMedia, setSubMedia] = useState({
    theme: "ALL",
    lightFile: null,
    lightPreview: null,
    lightMediaType: "IMAGE",
    darkFile: null,
    darkPreview: null,
    darkMediaType: "IMAGE",
    allFile: null,
    allPreview: null,
    allMediaType: "IMAGE",
  });

  const [showPreview, setShowPreview] = useState(true);
  const [previewTheme, setPreviewTheme] = useState("LIGHT"); // LIGHT or DARK
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        mainTitle: "",
        subTitle: "",
        ctaText: "",
        active: true,
      });
      setBackgroundMedia({
        theme: "ALL",
        lightFile: null,
        lightPreview: null,
        lightMediaType: "IMAGE",
        darkFile: null,
        darkPreview: null,
        darkMediaType: "IMAGE",
        allFile: null,
        allPreview: null,
        allMediaType: "IMAGE",
      });
      setSubMedia({
        theme: "ALL",
        lightFile: null,
        lightPreview: null,
        lightMediaType: "IMAGE",
        darkFile: null,
        darkPreview: null,
        darkMediaType: "IMAGE",
        allFile: null,
        allPreview: null,
        allMediaType: "IMAGE",
      });
      setShowPreview(true);
      setPreviewTheme("LIGHT");
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
      });

      // Set background media
      if (editData.backgroundPreview) {
        setBackgroundMedia({
          theme: "ALL",
          allPreview: editData.backgroundPreview,
          allMediaType: editData.backgroundMediaType || "IMAGE",
          allFile: null,
          lightFile: null,
          lightPreview: null,
          lightMediaType: "IMAGE",
          darkFile: null,
          darkPreview: null,
          darkMediaType: "IMAGE",
        });
      }

      // Set sub media
      if (editData.subPreview) {
        setSubMedia({
          theme: "ALL",
          allPreview: editData.subPreview,
          allMediaType: editData.subMediaType || "IMAGE",
          allFile: null,
          lightFile: null,
          lightPreview: null,
          lightMediaType: "IMAGE",
          darkFile: null,
          darkPreview: null,
          darkMediaType: "IMAGE",
        });
      }
    }
  }, [editData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (mediaType, theme, file, isBackground = true) => {
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Please select a valid image or video file");
      return;
    }

    const fileMediaType = isImage ? "IMAGE" : "VIDEO";
    const previewUrl = URL.createObjectURL(file);

    const setter = isBackground ? setBackgroundMedia : setSubMedia;

    if (theme === "LIGHT") {
      setter((prev) => ({
        ...prev,
        lightFile: file,
        lightPreview: previewUrl,
        lightMediaType: fileMediaType,
      }));
    } else if (theme === "DARK") {
      setter((prev) => ({
        ...prev,
        darkFile: file,
        darkPreview: previewUrl,
        darkMediaType: fileMediaType,
      }));
    } else {
      setter((prev) => ({
        ...prev,
        allFile: file,
        allPreview: previewUrl,
        allMediaType: fileMediaType,
      }));
    }
  };

  const removeMedia = (theme, isBackground = true) => {
    const setter = isBackground ? setBackgroundMedia : setSubMedia;

    if (theme === "LIGHT") {
      setter((prev) => ({
        ...prev,
        lightFile: null,
        lightPreview: null,
        lightMediaType: "IMAGE",
      }));
    } else if (theme === "DARK") {
      setter((prev) => ({
        ...prev,
        darkFile: null,
        darkPreview: null,
        darkMediaType: "IMAGE",
      }));
    } else {
      setter((prev) => ({
        ...prev,
        allFile: null,
        allPreview: null,
        allMediaType: "IMAGE",
      }));
    }
  };

  const handleThemeChange = (newTheme, isBackground = true) => {
    const setter = isBackground ? setBackgroundMedia : setSubMedia;
    const currentMedia = isBackground ? backgroundMedia : subMedia;

    // Clear media when switching themes to avoid confusion
    if (currentMedia.theme !== newTheme) {
      setter({
        theme: newTheme,
        lightFile: null,
        lightPreview: null,
        lightMediaType: "IMAGE",
        darkFile: null,
        darkPreview: null,
        darkMediaType: "IMAGE",
        allFile: null,
        allPreview: null,
        allMediaType: "IMAGE",
      });
    }
  };

  const validateForm = () => {
    // Background media is required
    if (backgroundMedia.theme === "ALL") {
      if (!backgroundMedia.allFile && !backgroundMedia.allPreview) {
        toast.error("Background media is required");
        return false;
      }
    } else {
      // If LIGHT or DARK theme selected, both are required
      const hasLight = backgroundMedia.lightFile || backgroundMedia.lightPreview;
      const hasDark = backgroundMedia.darkFile || backgroundMedia.darkPreview;

      if (!hasLight || !hasDark) {
        toast.error("Both Light and Dark theme background media are required");
        return false;
      }
    }

    // Sub media validation (if theme is SPLIT, both are required)
    if (subMedia.theme !== "ALL") {
      const hasLight = subMedia.lightFile || subMedia.lightPreview;
      const hasDark = subMedia.darkFile || subMedia.darkPreview;

      if ((hasLight && !hasDark) || (!hasLight && hasDark)) {
        toast.error("If using theme-specific sub media, both Light and Dark are required");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();

      // Add text fields (optional)
      if (formData.mainTitle) payload.append("heroSections[0].mainTitle", formData.mainTitle);
      if (formData.subTitle) payload.append("heroSections[0].subTitle", formData.subTitle);
      if (formData.ctaText) payload.append("heroSections[0].ctaText", formData.ctaText);
      payload.append("heroSections[0].active", String(formData.active));

      // Handle background media
      if (backgroundMedia.theme === "ALL") {
        payload.append("heroSections[0].backgroundMediaType", backgroundMedia.allMediaType);
        payload.append("heroSections[0].backgroundTheme", "ALL");

        if (backgroundMedia.allFile) {
          payload.append("backgroundMedia[0]", backgroundMedia.allFile);
        } else if (backgroundMedia.allPreview && backgroundMedia.allPreview.startsWith("http")) {
          const response = await fetch(backgroundMedia.allPreview);
          const blob = await response.blob();
          const filename = backgroundMedia.allPreview.split("/").pop() || "background-all";
          const file = new File([blob], filename, { type: blob.type });
          payload.append("backgroundMedia[0]", file);
        }
      } else {
        // Light and Dark themes
        payload.append("heroSections[0].backgroundTheme", "SPLIT");

        // Light background
        payload.append("heroSections[0].backgroundMediaType_LIGHT", backgroundMedia.lightMediaType);
        if (backgroundMedia.lightFile) {
          payload.append("backgroundMedia_LIGHT[0]", backgroundMedia.lightFile);
        } else if (backgroundMedia.lightPreview && backgroundMedia.lightPreview.startsWith("http")) {
          const response = await fetch(backgroundMedia.lightPreview);
          const blob = await response.blob();
          const filename = backgroundMedia.lightPreview.split("/").pop() || "background-light";
          const file = new File([blob], filename, { type: blob.type });
          payload.append("backgroundMedia_LIGHT[0]", file);
        }

        // Dark background
        payload.append("heroSections[0].backgroundMediaType_DARK", backgroundMedia.darkMediaType);
        if (backgroundMedia.darkFile) {
          payload.append("backgroundMedia_DARK[0]", backgroundMedia.darkFile);
        } else if (backgroundMedia.darkPreview && backgroundMedia.darkPreview.startsWith("http")) {
          const response = await fetch(backgroundMedia.darkPreview);
          const blob = await response.blob();
          const filename = backgroundMedia.darkPreview.split("/").pop() || "background-dark";
          const file = new File([blob], filename, { type: blob.type });
          payload.append("backgroundMedia_DARK[0]", file);
        }
      }

      // Handle sub media (optional)
      if (subMedia.theme === "ALL" && (subMedia.allFile || subMedia.allPreview)) {
        payload.append("heroSections[0].subMediaType", subMedia.allMediaType);
        payload.append("heroSections[0].subTheme", "ALL");

        if (subMedia.allFile) {
          payload.append("subMedia[0]", subMedia.allFile);
        } else if (subMedia.allPreview && subMedia.allPreview.startsWith("http")) {
          const response = await fetch(subMedia.allPreview);
          const blob = await response.blob();
          const filename = subMedia.allPreview.split("/").pop() || "sub-all";
          const file = new File([blob], filename, { type: blob.type });
          payload.append("subMedia[0]", file);
        }
      } else if (subMedia.theme !== "ALL" && ((subMedia.lightFile || subMedia.lightPreview) && (subMedia.darkFile || subMedia.darkPreview))) {
        payload.append("heroSections[0].subTheme", "SPLIT");

        // Light sub media
        if (subMedia.lightFile || subMedia.lightPreview) {
          payload.append("heroSections[0].subMediaType_LIGHT", subMedia.lightMediaType);
          if (subMedia.lightFile) {
            payload.append("subMedia_LIGHT[0]", subMedia.lightFile);
          } else if (subMedia.lightPreview && subMedia.lightPreview.startsWith("http")) {
            const response = await fetch(subMedia.lightPreview);
            const blob = await response.blob();
            const filename = subMedia.lightPreview.split("/").pop() || "sub-light";
            const file = new File([blob], filename, { type: blob.type });
            payload.append("subMedia_LIGHT[0]", file);
          }
        }

        // Dark sub media
        if (subMedia.darkFile || subMedia.darkPreview) {
          payload.append("heroSections[0].subMediaType_DARK", subMedia.darkMediaType);
          if (subMedia.darkFile) {
            payload.append("subMedia_DARK[0]", subMedia.darkFile);
          } else if (subMedia.darkPreview && subMedia.darkPreview.startsWith("http")) {
            const response = await fetch(subMedia.darkPreview);
            const blob = await response.blob();
            const filename = subMedia.darkPreview.split("/").pop() || "sub-dark";
            const file = new File([blob], filename, { type: blob.type });
            payload.append("subMedia_DARK[0]", file);
          }
        }
      }

      // Log payload for debugging
      console.log("=== FormData Payload ===");
      for (let pair of payload.entries()) {
        console.log(pair[0], pair[1]);
      }

      await onSuccess(payload);

      toast.success(editData ? "Hero section updated successfully!" : "Hero section created successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving hero section:", error);
      toast.error(error?.response?.data?.message || "Failed to save hero section");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get preview background based on current theme
  const getPreviewBackground = () => {
    if (backgroundMedia.theme === "ALL") {
      return backgroundMedia.allPreview;
    }
    // Show based on preview theme toggle
    if (previewTheme === "LIGHT") {
      return backgroundMedia.lightPreview;
    }
    return backgroundMedia.darkPreview;
  };

  const getPreviewBackgroundType = () => {
    if (backgroundMedia.theme === "ALL") {
      return backgroundMedia.allMediaType;
    }
    if (previewTheme === "LIGHT") {
      return backgroundMedia.lightMediaType;
    }
    return backgroundMedia.darkMediaType;
  };

  const getPreviewSubMedia = () => {
    if (subMedia.theme === "ALL") {
      return subMedia.allPreview;
    }
    if (previewTheme === "LIGHT") {
      return subMedia.lightPreview;
    }
    return subMedia.darkPreview;
  };

  const getPreviewSubMediaType = () => {
    if (subMedia.theme === "ALL") {
      return subMedia.allMediaType;
    }
    if (previewTheme === "LIGHT") {
      return subMedia.lightMediaType;
    }
    return subMedia.darkMediaType;
  };

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
                  onChange={(e) => handleInputChange("mainTitle", e.target.value)}
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
                  onChange={(e) => handleInputChange("subTitle", e.target.value)}
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
              <div className="flex flex-col gap-3 p-4 rounded-md" style={{ backgroundColor: colors.border }}>
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
                  <MediaUpload
                    label="Background Media (All Themes)"
                    file={backgroundMedia.allFile}
                    preview={backgroundMedia.allPreview}
                    mediaType={backgroundMedia.allMediaType}
                    onFileChange={(file) => handleFileChange("background", "ALL", file, true)}
                    onRemove={() => removeMedia("ALL", true)}
                    required={true}
                  />
                ) : (
                  <>
                    <MediaUpload
                      label="Background Media (Light Theme)"
                      file={backgroundMedia.lightFile}
                      preview={backgroundMedia.lightPreview}
                      mediaType={backgroundMedia.lightMediaType}
                      onFileChange={(file) => handleFileChange("background", "LIGHT", file, true)}
                      onRemove={() => removeMedia("LIGHT", true)}
                      required={true}
                    />
                    <MediaUpload
                      label="Background Media (Dark Theme)"
                      file={backgroundMedia.darkFile}
                      preview={backgroundMedia.darkPreview}
                      mediaType={backgroundMedia.darkMediaType}
                      onFileChange={(file) => handleFileChange("background", "DARK", file, true)}
                      onRemove={() => removeMedia("DARK", true)}
                      required={true}
                    />
                  </>
                )}
              </div>

              {/* Sub Media Section */}
              <div className="flex flex-col gap-3 p-4 rounded-md" style={{ backgroundColor: colors.border }}>
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
                  <MediaUpload
                    label="Sub Media (All Themes)"
                    file={subMedia.allFile}
                    preview={subMedia.allPreview}
                    mediaType={subMedia.allMediaType}
                    onFileChange={(file) => handleFileChange("sub", "ALL", file, false)}
                    onRemove={() => removeMedia("ALL", false)}
                    required={false}
                  />
                ) : (
                  <>
                    <MediaUpload
                      label="Sub Media (Light Theme)"
                      file={subMedia.lightFile}
                      preview={subMedia.lightPreview}
                      mediaType={subMedia.lightMediaType}
                      onFileChange={(file) => handleFileChange("sub", "LIGHT", file, false)}
                      onRemove={() => removeMedia("LIGHT", false)}
                      required={false}
                    />
                    <MediaUpload
                      label="Sub Media (Dark Theme)"
                      file={subMedia.darkFile}
                      preview={subMedia.darkPreview}
                      mediaType={subMedia.darkMediaType}
                      onFileChange={(file) => handleFileChange("sub", "DARK", file, false)}
                      onRemove={() => removeMedia("DARK", false)}
                      required={false}
                    />
                  </>
                )}
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => handleInputChange("active", e.target.checked)}
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
            </div>

            {/* Right Column - Preview */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-semibold m-0"
                  style={{ color: colors.textPrimary }}
                >
                  Preview
                </h3>
                <div className="flex items-center gap-2">
                  {/* Theme Toggle for Preview */}
                  {(backgroundMedia.theme === "SPLIT" || subMedia.theme === "SPLIT") && (
                    <div className="flex items-center gap-1 p-1 rounded-md" style={{ backgroundColor: colors.border }}>
                      <button
                        onClick={() => setPreviewTheme("LIGHT")}
                        className="px-3 py-1 border-none rounded text-xs font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor: previewTheme === "LIGHT" ? colors.primary : "transparent",
                          color: previewTheme === "LIGHT" ? colors.sidebarText : colors.textPrimary,
                        }}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setPreviewTheme("DARK")}
                        className="px-3 py-1 border-none rounded text-xs font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor: previewTheme === "DARK" ? colors.primary : "transparent",
                          color: previewTheme === "DARK" ? colors.sidebarText : colors.textPrimary,
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
                      backgroundColor: showPreview ? colors.primary : colors.border,
                      color: showPreview ? colors.sidebarText : colors.textPrimary,
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
                    {getPreviewBackground() ? (
                      <>
                        {getPreviewBackgroundType() === "VIDEO" ? (
                          <video
                            key={getPreviewBackground()}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ filter: "brightness(0.7)" }}
                          >
                            <source src={getPreviewBackground()} type="video/mp4" />
                          </video>
                        ) : (
                          <div
                            className="absolute inset-0 w-full h-full bg-cover bg-center"
                            style={{
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${getPreviewBackground()}')`,
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                    )}

                    {/* Theme Indicator Badge */}
                    {(backgroundMedia.theme === "SPLIT" || subMedia.theme === "SPLIT") && (
                      <div
                        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium z-20"
                        style={{
                          backgroundColor: previewTheme === "LIGHT" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)",
                          color: previewTheme === "LIGHT" ? "#000" : "#fff",
                        }}
                      >
                        {previewTheme === "LIGHT" ? "☀️ Light Theme" : "🌙 Dark Theme"}
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
                  {getPreviewSubMedia() && (
                    <div className="mt-4">
                      <p
                        className="text-xs font-medium mb-2"
                        style={{ color: colors.textSecondary }}
                      >
                        Sub Media Preview:
                      </p>
                      <div className="rounded-md overflow-hidden">
                        {getPreviewSubMediaType() === "IMAGE" ? (
                          <img
                            src={getPreviewSubMedia()}
                            alt="Sub media"
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <video
                            key={getPreviewSubMedia()}
                            controls
                            className="w-full h-40 object-cover"
                            playsInline
                          >
                            <source src={getPreviewSubMedia()} type="video/mp4" />
                          </video>
                        )}
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
                  <strong>💡 Theme Selection Guide:</strong>
                </p>
                <ul className="text-xs m-0 pl-4" style={{ color: colors.textSecondary }}>
                  <li className="mb-1">
                    <strong>All Themes:</strong> Use the same media for both light and dark themes
                  </li>
                  <li className="mb-1">
                    <strong>Separate for Light & Dark:</strong> Upload different media optimized for each theme. Both are required.
                  </li>
                  <li>
                    <strong>Text Fields:</strong> Optional - leave empty if your video/image contains all info
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

// Media Upload Component
function MediaUpload({ label, file, preview, mediaType, onFileChange, onRemove, required }) {
  const inputId = `media-${label.replace(/\s/g, "-").toLowerCase()}`;

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-[11px] font-medium"
        style={{ color: colors.textSecondary }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>

      {preview ? (
        <div
          className="flex items-center gap-3 p-3 border rounded-md"
          style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}
        >
          {mediaType === "IMAGE" ? (
            <img
              src={preview}
              alt={label}
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <video src={preview} className="w-16 h-16 object-cover rounded" muted />
          )}
          <div className="flex-1">
            <p
              className="text-xs font-medium m-0"
              style={{ color: colors.textPrimary }}
            >
              {mediaType}
            </p>
            {file && (
              <p
                className="text-[10px] m-0"
                style={{ color: colors.textSecondary }}
              >
                {file.name}
              </p>
            )}
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 border-none rounded cursor-pointer transition-colors"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fee";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={16} style={{ color: "#ef4444" }} />
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            id={inputId}
            accept="image/*,video/*"
            onChange={(e) => onFileChange(e.target.files[0])}
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
            <span>Choose Media</span>
          </label>
        </div>
      )}
    </div>
  );
}

export default AddHeroSectionModal;