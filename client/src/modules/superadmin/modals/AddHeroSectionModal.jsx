import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import { Upload, X, Loader2, Sun, Moon, Home, Building2 } from "lucide-react";
import {
  showSuccess,
  showInfo,
  showError,
  showWarning,
} from "@/lib/toasters/toastUtils";
import {
  uploadHeroMediaBulk,
  createHeroSection,
  updateHeroSectionById,
  getPropertyTypes,
  toggleHeroSectionHomepage,
  toggleHeroSectionMobile,
  toggleHeroSectionActive

} from "@/Api/Api";

const HERO_BACKGROUND_RECOMMENDATION = {
  label: "Recommended: 1920 x 1080 (16:9 landscape)",
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
};

const HERO_SUBMEDIA_RECOMMENDATION = {
  label: "Recommended: 1080 x 1350 (4:5 portrait)",
  width: 1080,
  height: 1350,
  aspectRatio: 1080 / 1350,
};

const aspectRatioWithinTolerance = (width, height, targetRatio, tolerance = 0.12) => {
  if (!width || !height) return false;
  return Math.abs(width / height - targetRatio) <= tolerance;
};

const readMediaDimensions = (file) =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth || null,
          height: video.videoHeight || null,
        });
        URL.revokeObjectURL(objectUrl);
      };
      video.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(objectUrl);
      };
      video.src = objectUrl;
      return;
    }

    if (file.type.startsWith("image/")) {
      const image = new Image();
      image.onload = () => {
        resolve({
          width: image.naturalWidth || null,
          height: image.naturalHeight || null,
        });
        URL.revokeObjectURL(objectUrl);
      };
      image.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(objectUrl);
      };
      image.src = objectUrl;
      return;
    }

    resolve(null);
    URL.revokeObjectURL(objectUrl);
  });

function AddHeroSectionModal({
  isOpen,
  onClose,
  onSuccess,
  editData = null,
  defaultPropertyTypeId = null,
}) {
  // 1. Defaults & State
  const [formData, setFormData] = useState({
    mainTitle: "",
    subTitle: "",
    ctaText: "",
    ctaLink: "",
    active: false,
    showOnHomepage: false,
    showOnMobilePage: false,
    propertyTypeId: null,
  });

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [backgroundMedia, setBackgroundMedia] = useState({
    theme: "ALL",
    allFiles: [],
    allPreviews: [],
      allMediaTypes: [],
      allMediaIds: [],
      allDimensions: [],
      lightFiles: [],
      lightPreviews: [],
      lightMediaTypes: [],
      lightMediaIds: [],
      lightDimensions: [],
      darkFiles: [],
      darkPreviews: [],
      darkMediaTypes: [],
      darkMediaIds: [],
      darkDimensions: [],
    });

  const [subMedia, setSubMedia] = useState({
    theme: "ALL",
    allFiles: [],
    allPreviews: [],
    allMediaTypes: [],
    allMediaIds: [],
    allDimensions: [],
    lightFiles: [],
    lightPreviews: [],
    lightMediaTypes: [],
    lightMediaIds: [],
    lightDimensions: [],
    darkFiles: [],
    darkPreviews: [],
    darkMediaTypes: [],
    darkMediaIds: [],
    darkDimensions: [],
  });

  const [previewTheme, setPreviewTheme] = useState("LIGHT");
  const [loading, setLoading] = useState(false);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  // Check if property type is selected (simplified mode)
  const isPropertyTypeSelected = formData.propertyTypeId !== null;

  // 2. Fetch Property Types
  useEffect(() => {
    if (isOpen) {
      fetchPropertyTypes();
    }
  }, [isOpen]);

  const fetchPropertyTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await getPropertyTypes();
      const data = response?.data || response;
      if (Array.isArray(data)) {
        const activeTypes = data.filter((type) => type.isActive);
        setPropertyTypes(activeTypes);
      } else {
        setPropertyTypes([]);
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
      showError("Failed to load property types");
      setPropertyTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  // 3. Form Reset & Initialization
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        mainTitle: "",
        subTitle: "",
        ctaText: "",
        ctaLink: "",
        active: false,
        showOnHomepage: false,
        showOnMobilePage: false,
        propertyTypeId: null,
      });
      const resetMedia = {
        theme: "ALL",
        allFiles: [],
        allPreviews: [],
        allMediaTypes: [],
        allMediaIds: [],
        allDimensions: [],
        lightFiles: [],
        lightPreviews: [],
        lightMediaTypes: [],
        lightMediaIds: [],
        lightDimensions: [],
        darkFiles: [],
        darkPreviews: [],
        darkMediaTypes: [],
        darkMediaIds: [],
        darkDimensions: [],
      };
      setBackgroundMedia(resetMedia);
      setSubMedia(resetMedia);
      setLoading(false);
      setPreviewTheme("LIGHT");
      setCurrentBackgroundIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !editData) {
      setFormData({
        mainTitle: "",
        subTitle: "",
        ctaText: "",
        ctaLink: "",
        active: false,
        showOnHomepage: false,
        showOnMobilePage: false,
        propertyTypeId: defaultPropertyTypeId,
      });
    }
  }, [defaultPropertyTypeId, editData, isOpen]);

  // 4. Edit Data Population
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        mainTitle: editData.mainTitle || "",
        subTitle: editData.subTitle || "",
        ctaText: editData.ctaText || "",
        ctaLink: editData.ctaLink || "",
        active: editData.active ?? false,
        showOnHomepage: editData.showOnHomepage ?? false,
        showOnMobilePage: editData.showOnMobilePage ?? false,
        propertyTypeId: editData.propertyTypeId || null,
      });

      // Background Media Logic
      if (editData.backgroundMediaAll?.length > 0) {
        setBackgroundMedia((prev) => ({
          ...prev,
          theme: "ALL",
          allPreviews: editData.backgroundMediaAll.map((m) => m.url),
          allMediaTypes: editData.backgroundMediaAll.map((m) => m.type),
          allMediaIds: editData.backgroundMediaAll.map((m) => m.mediaId),
          allDimensions: editData.backgroundMediaAll.map((m) => ({
            width: m.width ?? null,
            height: m.height ?? null,
          })),
        }));
      } else if (editData.backgroundAll?.length > 0) {
        setBackgroundMedia((prev) => ({
          ...prev,
          theme: "ALL",
          allPreviews: editData.backgroundAll.map((m) => m.url),
          allMediaTypes: editData.backgroundAll.map((m) => m.type),
          allMediaIds: editData.backgroundAll.map((m) => m.mediaId),
          allDimensions: editData.backgroundAll.map((m) => ({
            width: m.width ?? null,
            height: m.height ?? null,
          })),
        }));
      } else {
        setBackgroundMedia((prev) => ({
          ...prev,
          theme: "SPLIT",
          lightPreviews:
            editData.backgroundMediaLight?.map((m) => m.url) ||
            editData.backgroundLight?.map((m) => m.url) ||
            [],
          lightMediaTypes:
            editData.backgroundMediaLight?.map((m) => m.type) ||
            editData.backgroundLight?.map((m) => m.type) ||
            [],
          lightMediaIds:
            editData.backgroundMediaLight?.map((m) => m.mediaId) ||
            editData.backgroundLight?.map((m) => m.mediaId) ||
            [],
          lightDimensions:
            editData.backgroundMediaLight?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            editData.backgroundLight?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            [],
          darkPreviews:
            editData.backgroundMediaDark?.map((m) => m.url) ||
            editData.backgroundDark?.map((m) => m.url) ||
            [],
          darkMediaTypes:
            editData.backgroundMediaDark?.map((m) => m.type) ||
            editData.backgroundDark?.map((m) => m.type) ||
            [],
          darkMediaIds:
            editData.backgroundMediaDark?.map((m) => m.mediaId) ||
            editData.backgroundDark?.map((m) => m.mediaId) ||
            [],
          darkDimensions:
            editData.backgroundMediaDark?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            editData.backgroundDark?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            [],
        }));
      }

      // Sub Media Logic
      if (editData.subMediaAll?.length > 0) {
        setSubMedia((prev) => ({
          ...prev,
          theme: "ALL",
          allPreviews: editData.subMediaAll.map((m) => m.url),
          allMediaTypes: editData.subMediaAll.map((m) => m.type),
          allMediaIds: editData.subMediaAll.map((m) => m.mediaId),
          allDimensions: editData.subMediaAll.map((m) => ({
            width: m.width ?? null,
            height: m.height ?? null,
          })),
        }));
      } else if (editData.subAll?.length > 0) {
        setSubMedia((prev) => ({
          ...prev,
          theme: "ALL",
          allPreviews: editData.subAll.map((m) => m.url),
          allMediaTypes: editData.subAll.map((m) => m.type),
          allMediaIds: editData.subAll.map((m) => m.mediaId),
          allDimensions: editData.subAll.map((m) => ({
            width: m.width ?? null,
            height: m.height ?? null,
          })),
        }));
      } else {
        setSubMedia((prev) => ({
          ...prev,
          theme: "SPLIT",
          lightPreviews:
            editData.subMediaLight?.map((m) => m.url) ||
            editData.subLight?.map((m) => m.url) ||
            [],
          lightMediaTypes:
            editData.subMediaLight?.map((m) => m.type) ||
            editData.subLight?.map((m) => m.type) ||
            [],
          lightMediaIds:
            editData.subMediaLight?.map((m) => m.mediaId) ||
            editData.subLight?.map((m) => m.mediaId) ||
            [],
          lightDimensions:
            editData.subMediaLight?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            editData.subLight?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            [],
          darkPreviews:
            editData.subMediaDark?.map((m) => m.url) ||
            editData.subDark?.map((m) => m.url) ||
            [],
          darkMediaTypes:
            editData.subMediaDark?.map((m) => m.type) ||
            editData.subDark?.map((m) => m.type) ||
            [],
          darkMediaIds:
            editData.subMediaDark?.map((m) => m.mediaId) ||
            editData.subDark?.map((m) => m.mediaId) ||
            [],
          darkDimensions:
            editData.subMediaDark?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            editData.subDark?.map((m) => ({
              width: m.width ?? null,
              height: m.height ?? null,
            })) ||
            [],
        }));
      }
    }
  }, [editData, isOpen]);

  // Auto-rotate background preview
  useEffect(() => {
    const getActiveBackgrounds = () => {
      if (
        backgroundMedia.theme === "ALL" &&
        backgroundMedia.allPreviews.length > 0
      ) {
        return backgroundMedia.allPreviews;
      }
      if (backgroundMedia.theme === "SPLIT") {
        if (
          previewTheme === "LIGHT" &&
          backgroundMedia.lightPreviews.length > 0
        ) {
          return backgroundMedia.lightPreviews;
        }
        if (
          previewTheme === "DARK" &&
          backgroundMedia.darkPreviews.length > 0
        ) {
          return backgroundMedia.darkPreviews;
        }
      }
      return [];
    };

    const backgrounds = getActiveBackgrounds();
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [backgroundMedia, previewTheme]);

  // 5. Input Handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultipleFilesChange = async (
    mediaType,
    theme,
    files,
    isBackground = true,
  ) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);
    const newPreviews = [],
      newMediaTypes = [],
      newFiles = [],
      newDimensions = [];

    for (const file of filesArray) {
      const type = file.type.startsWith("image/") ? "IMAGE" : "VIDEO";
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
      newMediaTypes.push(type);
      const dimensions = await readMediaDimensions(file);
      newDimensions.push(dimensions);

      if (
        isBackground &&
        file.type.startsWith("image/") &&
        dimensions &&
        !aspectRatioWithinTolerance(
          dimensions.width,
          dimensions.height,
          HERO_BACKGROUND_RECOMMENDATION.aspectRatio,
        )
      ) {
        showWarning(
          `${file.name}: hero background works best at ${HERO_BACKGROUND_RECOMMENDATION.width} x ${HERO_BACKGROUND_RECOMMENDATION.height} (16:9).`,
        );
      }
    }

    const setter = isBackground ? setBackgroundMedia : setSubMedia;
    const key = theme === "LIGHT" ? "light" : theme === "DARK" ? "dark" : "all";

    setter((prev) => ({
      ...prev,
      [`${key}Files`]: [...prev[`${key}Files`], ...newFiles],
      [`${key}Previews`]: [...prev[`${key}Previews`], ...newPreviews],
      [`${key}MediaTypes`]: [...prev[`${key}MediaTypes`], ...newMediaTypes],
      [`${key}Dimensions`]: [...prev[`${key}Dimensions`], ...newDimensions],
    }));
  };

  const removeMediaAtIndex = (theme, index, isBackground = true) => {
    const setter = isBackground ? setBackgroundMedia : setSubMedia;
    const key = theme === "LIGHT" ? "light" : theme === "DARK" ? "dark" : "all";
    setter((prev) => ({
      ...prev,
      [`${key}Files`]: prev[`${key}Files`].filter((_, i) => i !== index),
      [`${key}Previews`]: prev[`${key}Previews`].filter((_, i) => i !== index),
      [`${key}MediaTypes`]: prev[`${key}MediaTypes`].filter(
        (_, i) => i !== index,
      ),
      [`${key}MediaIds`]: prev[`${key}MediaIds`].filter((_, i) => i !== index),
      [`${key}Dimensions`]: prev[`${key}Dimensions`].filter((_, i) => i !== index),
    }));
  };

  const handleThemeChange = (newTheme, isBackground = true) => {
    const setter = isBackground ? setBackgroundMedia : setSubMedia;
    setter((prev) => ({ ...prev, theme: newTheme }));
  };

  // Get preview background based on theme
  const getPreviewBackground = () => {
    if (
      backgroundMedia.theme === "ALL" &&
      backgroundMedia.allPreviews.length > 0
    ) {
      return {
        url: backgroundMedia.allPreviews[currentBackgroundIndex],
        type: backgroundMedia.allMediaTypes[currentBackgroundIndex],
      };
    }

    if (backgroundMedia.theme === "SPLIT") {
      if (
        previewTheme === "LIGHT" &&
        backgroundMedia.lightPreviews.length > 0
      ) {
        return {
          url: backgroundMedia.lightPreviews[currentBackgroundIndex],
          type: backgroundMedia.lightMediaTypes[currentBackgroundIndex],
        };
      }
      if (previewTheme === "DARK" && backgroundMedia.darkPreviews.length > 0) {
        return {
          url: backgroundMedia.darkPreviews[currentBackgroundIndex],
          type: backgroundMedia.darkMediaTypes[currentBackgroundIndex],
        };
      }
    }

    return null;
  };

  // 6. API Logic
  const processUpload = async (files) => {
    if (!files || files.length === 0) return [];
    const uploadData = new FormData();
    files.forEach((f) => uploadData.append("files", f));
    const type = files[0].type.startsWith("image/") ? "IMAGE" : "VIDEO";
    uploadData.append("mediaType", type);

    const response = await uploadHeroMediaBulk(uploadData);
    const data = response?.data?.data || response?.data || response;
    return Array.isArray(data) ? data.map((m) => m.mediaId) : [];
  };

  const validateForm = () => {
    const hasBg =
      backgroundMedia.allPreviews.length > 0 ||
      backgroundMedia.lightPreviews.length > 0 ||
      backgroundMedia.darkPreviews.length > 0;
    if (!hasBg) {
      showError("Please upload at least one background image");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
  if (!validateForm()) return;
  setLoading(true);

  try {
    // ── Helper: did any non-toggle field change? ──────────────────────────
    const hasNonToggleChanges = () => {
      if (!editData) return true; // always POST for new sections

      const textChanged =
        (formData.mainTitle || null) !== (editData.mainTitle || null) ||
        (formData.subTitle || null) !== (editData.subTitle || null) ||
        (formData.ctaText || null) !== (editData.ctaText || null) ||
        (formData.ctaLink || null) !== (editData.ctaLink || null) ||
        (formData.propertyTypeId || null) !== (editData.propertyTypeId || null);

      if (textChanged) return true;

      // New files were picked → media will change
      const hasNewFiles =
        backgroundMedia.allFiles.length > 0 ||
        backgroundMedia.lightFiles.length > 0 ||
        backgroundMedia.darkFiles.length > 0 ||
        subMedia.allFiles.length > 0 ||
        subMedia.lightFiles.length > 0 ||
        subMedia.darkFiles.length > 0;

      if (hasNewFiles) return true;

      // Existing media was removed (id arrays differ in length)
      const originalBgAllLen   = (editData.backgroundMediaAll ?? editData.backgroundAll ?? []).length;
      const originalBgLightLen = (editData.backgroundMediaLight ?? editData.backgroundLight ?? []).length;
      const originalBgDarkLen  = (editData.backgroundMediaDark ?? editData.backgroundDark ?? []).length;
      const originalSubAllLen  = (editData.subMediaAll ?? editData.subAll ?? []).length;
      const originalSubLightLen= (editData.subMediaLight ?? editData.subLight ?? []).length;
      const originalSubDarkLen = (editData.subMediaDark ?? editData.subDark ?? []).length;

      if (
        backgroundMedia.allMediaIds.length   !== originalBgAllLen   ||
        backgroundMedia.lightMediaIds.length !== originalBgLightLen ||
        backgroundMedia.darkMediaIds.length  !== originalBgDarkLen  ||
        subMedia.allMediaIds.length          !== originalSubAllLen  ||
        subMedia.lightMediaIds.length        !== originalSubLightLen||
        subMedia.darkMediaIds.length         !== originalSubDarkLen
      ) return true;

      return false;
    };

    const syncHeroStatusFlags = async (heroId) => {
      const originalFlags = editData
        ? {
            active: editData.active ?? false,
            showOnHomepage: editData.showOnHomepage ?? false,
            showOnMobilePage: editData.showOnMobilePage ?? false,
          }
        : { active: false, showOnHomepage: false, showOnMobilePage: false };

      const toggleTasks = [];

      if (originalFlags.active !== formData.active) {
        toggleTasks.push({
          label: "Active status",
          task: toggleHeroSectionActive(heroId, formData.active),
        });
      }
      if (originalFlags.showOnHomepage !== formData.showOnHomepage) {
        toggleTasks.push({
          label: "Desktop view",
          task: toggleHeroSectionHomepage(heroId, formData.showOnHomepage),
        });
      }
      if (originalFlags.showOnMobilePage !== formData.showOnMobilePage) {
        toggleTasks.push({
          label: "Mobile view",
          task: toggleHeroSectionMobile(heroId, formData.showOnMobilePage),
        });
      }

      if (!toggleTasks.length) return [];

      const results = await Promise.allSettled(toggleTasks.map((t) => t.task));
      return results
        .map((result, i) => ({ ...result, label: toggleTasks[i].label }))
        .filter((r) => r.status === "rejected");
    };

    // ── EDIT path ─────────────────────────────────────────────────────────
    if (editData?.id) {
      const toggleFailures = await syncHeroStatusFlags(editData.id);

      if (toggleFailures.length > 0) {
        showWarning(
          `${toggleFailures.map((f) => f.label).join(", ")} could not be updated.`
        );
      }

      // Only call updateHeroSectionById when something beyond toggles changed
      if (hasNonToggleChanges()) {
        const uploadResults = await Promise.all([
          processUpload(backgroundMedia.allFiles),
          processUpload(backgroundMedia.lightFiles),
          processUpload(backgroundMedia.darkFiles),
          processUpload(subMedia.allFiles),
          processUpload(subMedia.lightFiles),
          processUpload(subMedia.darkFiles),
        ]);
        const [bgAll, bgLight, bgDark, subAll, subLight, subDark] = uploadResults;

        const payload = {
          mainTitle: formData.mainTitle || null,
          subTitle: formData.subTitle || null,
          ctaText: formData.ctaText || null,
          ctaLink: formData.ctaLink || null,
          active: editData.active ?? false,
          showOnHomepage: editData.showOnHomepage ?? false,
          showOnMobilePage: editData.showOnMobilePage ?? false,
          propertyTypeId: formData.propertyTypeId,
          backgroundAll:
            backgroundMedia.theme === "ALL"
              ? [...backgroundMedia.allMediaIds, ...bgAll]
              : [],
          backgroundLight:
            backgroundMedia.theme === "SPLIT"
              ? [...backgroundMedia.lightMediaIds, ...bgLight]
              : [],
          backgroundDark:
            backgroundMedia.theme === "SPLIT"
              ? [...backgroundMedia.darkMediaIds, ...bgDark]
              : [],
          subAll:
            subMedia.theme === "ALL" ? [...subMedia.allMediaIds, ...subAll] : [],
          subLight:
            subMedia.theme === "SPLIT"
              ? [...subMedia.lightMediaIds, ...subLight]
              : [],
          subDark:
            subMedia.theme === "SPLIT"
              ? [...subMedia.darkMediaIds, ...subDark]
              : [],
        };

        await updateHeroSectionById(editData.id, payload);
      }

      showSuccess("Hero Section updated successfully!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);

    // ── CREATE path ───────────────────────────────────────────────────────
    } else {
      const uploadResults = await Promise.all([
        processUpload(backgroundMedia.allFiles),
        processUpload(backgroundMedia.lightFiles),
        processUpload(backgroundMedia.darkFiles),
        processUpload(subMedia.allFiles),
        processUpload(subMedia.lightFiles),
        processUpload(subMedia.darkFiles),
      ]);
      const [bgAll, bgLight, bgDark, subAll, subLight, subDark] = uploadResults;

      const payload = {
        mainTitle: formData.mainTitle || null,
        subTitle: formData.subTitle || null,
        ctaText: formData.ctaText || null,
        ctaLink: formData.ctaLink || null,
        active: false,
        showOnHomepage: false,
        showOnMobilePage: false,
        propertyTypeId: formData.propertyTypeId,
        backgroundAll:
          backgroundMedia.theme === "ALL"
            ? [...backgroundMedia.allMediaIds, ...bgAll]
            : [],
        backgroundLight:
          backgroundMedia.theme === "SPLIT"
            ? [...backgroundMedia.lightMediaIds, ...bgLight]
            : [],
        backgroundDark:
          backgroundMedia.theme === "SPLIT"
            ? [...backgroundMedia.darkMediaIds, ...bgDark]
            : [],
        subAll:
          subMedia.theme === "ALL" ? [...subMedia.allMediaIds, ...subAll] : [],
        subLight:
          subMedia.theme === "SPLIT"
            ? [...subMedia.lightMediaIds, ...subLight]
            : [],
        subDark:
          subMedia.theme === "SPLIT"
            ? [...subMedia.darkMediaIds, ...subDark]
            : [],
      };

      const response = await createHeroSection(payload);
      const createdHeroId = response?.data?.id || response?.id;

      if (!createdHeroId) {
        throw new Error("Hero section created, but no ID was returned.");
      }

      const toggleFailures = await syncHeroStatusFlags(createdHeroId);
      if (toggleFailures.length > 0) {
        showWarning(
          `${toggleFailures.map((f) => f.label).join(", ")} could not be updated.`
        );
      }

      showSuccess("Hero Section created successfully!");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    }
  } catch (error) {
    console.error("Error saving hero section:", error);
    setLoading(false);
    showError(
      error.response?.data?.message ||
        "Failed to save hero section. Please try again."
    );
  }
};

  if (!isOpen) return null;

  const previewBg = getPreviewBackground();
  const selectedPropertyType = propertyTypes.find(
    (pt) => pt.id === formData.propertyTypeId,
  );

  return (
    <div
      className="admin-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="admin-modal-surface w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-xl shadow-2xl flex flex-col"
        style={{ backgroundColor: colors.contentBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <div>
            <h2
              className="text-xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              {editData ? "Edit Hero Section" : "Add Hero Section"}
            </h2>
            {selectedPropertyType && (
              <p className="text-xs mt-1 text-primary font-medium">
                For {selectedPropertyType.typeName} hero pages
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-t"
            style={{ borderColor: colors.border }}
          >
            {/* Left Column: Form */}
            <div
              className="flex flex-col divide-y"
              style={{ borderColor: colors.border }}
            >
              {/* Display Location Selector */}
              <div className="p-6 bg-blue-50/50">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                  Where to Display?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Homepage Option */}
                  <button
                    type="button"
                    onClick={() => handleInputChange("propertyTypeId", null)}
                    className="p-4 rounded-lg border-2 transition-all text-left"
                    style={{
                      borderColor:
                        formData.propertyTypeId === null
                          ? "#E53935"
                          : "#E5E7EB",
                      backgroundColor:
                        formData.propertyTypeId === null
                          ? "rgba(229, 57, 53, 0.05)"
                          : "#FFFFFF",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Home
                        size={16}
                        style={{
                          color:
                            formData.propertyTypeId === null
                              ? "#E53935"
                              : "#9CA3AF",
                        }}
                      />
                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            formData.propertyTypeId === null
                              ? "#E53935"
                              : "#374151",
                        }}
                      >
                        Homepage
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Main website hero
                    </p>
                  </button>

                  {/* Property Type Selector */}
                  <div className="relative">
                    <select
                      value={formData.propertyTypeId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "propertyTypeId",
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className={`w-full h-full p-4 rounded-lg border-2 text-sm font-bold cursor-pointer transition-all ${
                        formData.propertyTypeId !== null
                          ? "border-primary bg-primary/5 text-primary shadow-md"
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
                <p className="text-[10px] text-gray-500 mt-2 italic">
                  {isPropertyTypeSelected
                    ? "Property-type mode: this hero will be shown for the selected vertical"
                    : "Homepage mode: All options available"}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Desktop View and Mobile View can be controlled independently.
                </p>
              </div>

              {/* Text Fields Section */}
              <div className="p-6 space-y-4">
                {/* Main Title - Always shown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={formData.mainTitle}
                    onChange={(e) =>
                      handleInputChange("mainTitle", e.target.value)
                    }
                    placeholder="Discover Amazing Places"
                    className="px-4 py-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* Subtitle - Always shown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subTitle}
                    onChange={(e) =>
                      handleInputChange("subTitle", e.target.value)
                    }
                    placeholder="Book your next experience"
                    className="px-4 py-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* CTA Button and Link - Always shown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    CTA Button
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) =>
                      handleInputChange("ctaText", e.target.value)
                    }
                    placeholder="Explore"
                    className="px-4 py-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    CTA Link
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) =>
                      handleInputChange("ctaLink", e.target.value)
                    }
                    placeholder="/hotels | https://example.com"
                    className="px-4 py-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              {/* Background Media */}
              <div className="p-6 bg-gray-50/50">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-sm font-bold flex items-center gap-1">
                    Background Media <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={backgroundMedia.theme}
                    onChange={(e) => handleThemeChange(e.target.value, true)}
                    className="px-3 py-2 border rounded-lg text-xs font-bold bg-white shadow-sm outline-none cursor-pointer hover:border-primary transition-colors"
                  >
                    <option value="ALL">All Themes</option>
                    <option value="SPLIT">Separate for Light & Dark</option>
                  </select>
                </div>
                {backgroundMedia.theme === "ALL" ? (
                  <MediaUploader
                    label="All Themes"
                    previews={backgroundMedia.allPreviews}
                    types={backgroundMedia.allMediaTypes}
                    dimensions={backgroundMedia.allDimensions}
                    recommendation={HERO_BACKGROUND_RECOMMENDATION}
                    onUpload={(f) =>
                      handleMultipleFilesChange("bg", "ALL", f, true)
                    }
                    onRemove={(i) => removeMediaAtIndex("ALL", i, true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MediaUploader
                      label="Light Theme"
                      previews={backgroundMedia.lightPreviews}
                      types={backgroundMedia.lightMediaTypes}
                      dimensions={backgroundMedia.lightDimensions}
                      recommendation={HERO_BACKGROUND_RECOMMENDATION}
                      onUpload={(f) =>
                        handleMultipleFilesChange("bg", "LIGHT", f, true)
                      }
                      onRemove={(i) => removeMediaAtIndex("LIGHT", i, true)}
                    />
                    <MediaUploader
                      label="Dark Theme"
                      previews={backgroundMedia.darkPreviews}
                      types={backgroundMedia.darkMediaTypes}
                      dimensions={backgroundMedia.darkDimensions}
                      recommendation={HERO_BACKGROUND_RECOMMENDATION}
                      onUpload={(f) =>
                        handleMultipleFilesChange("bg", "DARK", f, true)
                      }
                      onRemove={(i) => removeMediaAtIndex("DARK", i, true)}
                    />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-sm font-bold">
                    Sub Media (Optional)
                  </label>
                  <select
                    value={subMedia.theme}
                    onChange={(e) => handleThemeChange(e.target.value, false)}
                    className="px-3 py-2 border rounded-lg text-xs font-bold bg-white shadow-sm outline-none cursor-pointer"
                  >
                    <option value="ALL">All Themes</option>
                    <option value="SPLIT">Separate for Light & Dark</option>
                  </select>
                </div>
                {subMedia.theme === "ALL" ? (
                  <MediaUploader
                    label="All Themes"
                    previews={subMedia.allPreviews}
                    types={subMedia.allMediaTypes}
                    dimensions={subMedia.allDimensions}
                    recommendation={HERO_SUBMEDIA_RECOMMENDATION}
                    onUpload={(f) =>
                      handleMultipleFilesChange("sub", "ALL", f, false)
                    }
                    onRemove={(i) => removeMediaAtIndex("ALL", i, false)}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MediaUploader
                      label="Light Theme"
                      previews={subMedia.lightPreviews}
                      types={subMedia.lightMediaTypes}
                      dimensions={subMedia.lightDimensions}
                      recommendation={HERO_SUBMEDIA_RECOMMENDATION}
                      onUpload={(f) =>
                        handleMultipleFilesChange("sub", "LIGHT", f, false)
                      }
                      onRemove={(i) => removeMediaAtIndex("LIGHT", i, false)}
                    />
                    <MediaUploader
                      label="Dark Theme"
                      previews={subMedia.darkPreviews}
                      types={subMedia.darkMediaTypes}
                      dimensions={subMedia.darkDimensions}
                      recommendation={HERO_SUBMEDIA_RECOMMENDATION}
                      onUpload={(f) =>
                        handleMultipleFilesChange("sub", "DARK", f, false)
                      }
                      onRemove={(i) => removeMediaAtIndex("DARK", i, false)}
                    />
                  </div>
                )}
              </div>

              {/* Switches Section */}
              <div className="p-6 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      handleInputChange("active", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                    Set as Active
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) =>
                      handleInputChange("showOnHomepage", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                    Desktop View
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.showOnMobilePage}
                    onChange={(e) =>
                      handleInputChange("showOnMobilePage", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                    Show on Mobile View
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column: Live Preview */}
            <div
              className={`p-8 flex flex-col gap-6 border-l transition-colors duration-300 ${
                previewTheme === "DARK" ? "bg-gray-900" : "bg-gray-100"
              }`}
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest ${
                    previewTheme === "DARK" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Live Preview
                </h3>
                <button
                  onClick={() =>
                    setPreviewTheme((t) => (t === "LIGHT" ? "DARK" : "LIGHT"))
                  }
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all ${
                    previewTheme === "DARK"
                      ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {previewTheme === "DARK" ? (
                    <>
                      <Moon size={12} /> Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun size={12} /> Light Mode
                    </>
                  )}
                </button>
              </div>

              <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-2xl border-4 border-white">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                  {previewBg ? (
                    previewBg.type === "VIDEO" ? (
                      <video
                        src={previewBg.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={previewBg.url}
                        alt="Background"
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <p className="text-white/30 text-xs">
                        No background media
                      </p>
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 z-10 flex flex-col items-start justify-center text-left px-8">
                  <h1 className="text-2xl font-bold mb-2 leading-tight text-white drop-shadow-lg">
                    {formData.mainTitle || "Discover Amazing Places"}
                  </h1>
                  <p className="text-[10px] uppercase tracking-[0.3em] mb-4 text-white/80 drop-shadow-md">
                    {formData.subTitle || "Book your next experience"}
                  </p>
                  {(formData.ctaText || "Explore") && (
                    <button className="px-5 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 shadow-lg">
                      {formData.ctaText || "Explore"}
                    </button>
                  )}
                </div>

                {/* Slide indicator */}
                {previewBg &&
                  (backgroundMedia.allPreviews.length > 1 ||
                    (previewTheme === "LIGHT" &&
                      backgroundMedia.lightPreviews.length > 1) ||
                    (previewTheme === "DARK" &&
                      backgroundMedia.darkPreviews.length > 1)) && (
                    <div className="absolute bottom-3 right-3 z-20 flex gap-1">
                      {Array.from({
                        length:
                          backgroundMedia.theme === "ALL"
                            ? backgroundMedia.allPreviews.length
                            : previewTheme === "LIGHT"
                              ? backgroundMedia.lightPreviews.length
                              : backgroundMedia.darkPreviews.length,
                      }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 rounded-full transition-all ${
                            i === currentBackgroundIndex
                              ? "w-6 bg-white"
                              : "w-1 bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t flex justify-end gap-3 bg-gray-50"
          style={{ borderColor: colors.border }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border font-bold text-sm hover:bg-white transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 rounded-lg font-bold text-sm text-white bg-primary disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {editData ? "Updating..." : "Creating..."}
              </>
            ) : editData ? (
              "Update Hero"
            ) : (
              "Create Hero"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Media Uploader helper
function MediaUploader({
  label,
  previews,
  types,
  dimensions = [],
  recommendation,
  onUpload,
  onRemove,
}) {
  const inputId = React.useId();
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
          {label}
        </p>
        {recommendation?.label && (
          <p className="mt-1 text-[10px] text-amber-600">{recommendation.label}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {previews.map((p, i) => (
          <div
            key={i}
            className="relative w-20 h-20 rounded-lg border-2 overflow-hidden group bg-white shadow-sm border-white"
          >
            {types[i] === "IMAGE" ? (
              <img src={p} className="w-full h-full object-cover" alt="Media" />
            ) : (
              <video src={p} className="w-full h-full object-cover" muted />
            )}
            <button
              onClick={() => onRemove(i)}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
            {dimensions[i]?.width && dimensions[i]?.height ? (
              <div className="absolute inset-x-0 bottom-0 bg-black/65 px-1 py-0.5 text-[8px] font-medium text-white">
                {dimensions[i].width} x {dimensions[i].height}
              </div>
            ) : null}
          </div>
        ))}
        <label
          htmlFor={inputId}
          className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-300 hover:text-primary hover:border-primary cursor-pointer transition-all hover:bg-white"
        >
          <Upload size={18} />
          <span className="text-[8px] mt-1">Add</span>
          <input
            type="file"
            id={inputId}
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={(e) => onUpload(e.target.files)}
          />
        </label>
      </div>
    </div>
  );
}

export default AddHeroSectionModal;
