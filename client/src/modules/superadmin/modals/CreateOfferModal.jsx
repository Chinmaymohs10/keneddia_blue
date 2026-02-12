import React, { useState, useEffect, useMemo } from "react";
import { colors } from "@/lib/colors/colors";
import {
  X,
  Upload,
  Loader2,
  Building2,
  Clock,
  Image as ImageIcon,
  Link as LinkIcon,
  Instagram,
  Check,
  Ruler,
} from "lucide-react";
import {
  createDailyOffer,
  updateDailyOfferById,
  uploadMedia,
  getMediaById,
  getAllProperties,
  getPropertyTypes,
} from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

const inputStyles = `
  input::placeholder, textarea::placeholder {
    color: #9CA3AF !important;
    opacity: 1;
  }
  .custom-modal-container {
    width: 80% !important;
    max-width: 80% !important;
  }
`;

const MEDIA_DETECTION_RULES = {
  instagramBannerReel: {
    label: "Instagram Banner / Reel",
    aspectRatio: "9:16",
    allowedDimensions: [
      { width: 1080, height: 1920 },
      { width: 900, height: 1600 },
      { width: 720, height: 1280 },
      { width: 450, height: 800 },
    ],
    minHeight: 800,
    ratioTolerance: 0.01,
    detectBy: ["exactDimensionMatch", "aspectRatioMatch"],
    uiState: {
      badge: "Banner detected",
      color: "success",
      icon: "instagram",
    },
  },
};

function CreateOfferModal({ isOpen, onClose, editingOffer }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDesc: "",
    couponCode: "",
    ctaText: "Claim Offer",
    ctaLink: "",
    location: "",
    propertyId: null,
    propertyTypeId: null,
    propertyName: "",
    propertyType: "",
    expiresAt: "",
    availableHours: "",
    imageMediaId: null,
    isActive: false,
    showOnHomePage: false,
    displayLocation: "PROPERTY_PAGE",
  });

  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("22:00");
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedMediaId, setUploadedMediaId] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const [imageDimensions, setImageDimensions] = useState(null);
  const [detectedBannerType, setDetectedBannerType] = useState(null);
  const [isBannerDetected, setIsBannerDetected] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      fetchTypes();
    }
  }, [isOpen]);

  const convert12to24 = (time12h) => {
    if (!time12h) return "10:00";
    try {
      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":");
      if (hours === "12") hours = "00";
      if (modifier === "PM") hours = parseInt(hours, 10) + 12;
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    } catch (e) {
      return "10:00";
    }
  };

  useEffect(() => {
    if (editingOffer && isOpen) {
      if (editingOffer.imageMediaId)
        fetchMediaDetails(editingOffer.imageMediaId);

      if (editingOffer.availableHours?.includes(" - ")) {
        const parts = editingOffer.availableHours.split(" - ");
        setStartTime(convert12to24(parts[0]));
        setEndTime(convert12to24(parts[1]));
      }

      setFormData({
        ...editingOffer,
        expiresAt: editingOffer.expiresAt
          ? new Date(editingOffer.expiresAt).toISOString().split("T")[0]
          : "",
        displayLocation: editingOffer.displayLocation || "PROPERTY_PAGE",
        isActive: editingOffer.isActive ?? false,
        ctaLink: editingOffer.ctaLink || "",
      });
      setUploadedMediaId(editingOffer.imageMediaId || null);
      setImagePreview(
        editingOffer.image?.url || editingOffer.image?.src || null,
      );

      if (editingOffer.image?.width && editingOffer.image?.height) {
        const dims = {
          width: editingOffer.image.width,
          height: editingOffer.image.height,
        };
        setImageDimensions(dims);
        detectBannerType(dims);
      }
    } else if (isOpen) {
      resetForm();
    }
  }, [editingOffer, isOpen]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await getAllProperties();
      const propertiesData = response.data?.data || response.data || response;
      if (Array.isArray(propertiesData))
        setAvailableProperties(propertiesData.filter((p) => p.isActive));
    } catch (error) {
      showError("Failed to load properties");
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await getPropertyTypes();
      const typesData = response.data?.data || response.data || response;
      if (Array.isArray(typesData)) setPropertyTypes(typesData);
    } catch (error) {
      console.error("Failed to fetch property types");
    }
  };

  const fetchMediaDetails = async (mediaId) => {
    try {
      const response = await getMediaById(mediaId);
      const mediaData = response.data?.data;
      if (mediaData) {
        setImagePreview(mediaData.url);
        setUploadedMediaId(mediaId);
        if (mediaData.width && mediaData.height) {
          const dims = { width: mediaData.width, height: mediaData.height };
          setImageDimensions(dims);
          detectBannerType(dims);
        }
      }
    } catch (error) {
      console.error("Error fetching media details:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      longDesc: "",
      couponCode: "",
      ctaText: "Claim Offer",
      ctaLink: "",
      location: "",
      propertyId: null,
      propertyTypeId: null,
      propertyName: "",
      propertyType: "",
      expiresAt: "",
      availableHours: "",
      imageMediaId: null,
      isActive: false,
      showOnHomePage: false,
      displayLocation: "PROPERTY_PAGE",
    });
    setImagePreview(null);
    setUploadedMediaId(null);
    setImageDimensions(null);
    setDetectedBannerType(null);
    setIsBannerDetected(false);
    setMediaType(null);
    setStartTime("10:00");
    setEndTime("22:00");
    setTouchedFields({});
  };

  const aspectRatioMatches = (width, height, targetRatio, tolerance = 0.01) => {
    const [targetW, targetH] = targetRatio.split(":").map(Number);
    return Math.abs(width / height - targetW / targetH) <= tolerance;
  };

  const detectBannerType = (dimensions) => {
    if (!dimensions?.width || !dimensions?.height) {
      setIsBannerDetected(false);
      return null;
    }
    const { width, height } = dimensions;
    const igRule = MEDIA_DETECTION_RULES.instagramBannerReel;
    const isInstagramBanner =
      igRule.allowedDimensions.some(
        (d) => d.width === width && d.height === height,
      ) ||
      (aspectRatioMatches(width, height, igRule.aspectRatio) &&
        height >= igRule.minHeight);

    setIsBannerDetected(isInstagramBanner);
    if (isInstagramBanner) {
      setDetectedBannerType({
        label: igRule.label,
        badge: igRule.uiState.badge,
        dimensions: { width, height },
        aspectRatio: "9:16",
      });
    }
    return isInstagramBanner ? "instagramBannerReel" : null;
  };

  const handlePropertySelect = (propertyId) => {
    const selectedProperty = availableProperties.find(
      (p) => p.id === parseInt(propertyId),
    );

    if (selectedProperty) {
      // Extract the first property type name from the array
      const propertyTypeName = selectedProperty.propertyTypes?.[0] || "";

      // Find matching type from propertyTypes list by name
      const matchedType = propertyTypes.find(
        (t) => t.typeName?.toLowerCase() === propertyTypeName.toLowerCase(),
      );

      setFormData((prev) => ({
        ...prev,
        propertyId: selectedProperty.id,
        propertyTypeId: matchedType?.id || null,
        propertyName: selectedProperty.propertyName,
        propertyType: matchedType?.typeName || propertyTypeName || "",
        location:
          `${selectedProperty.area || ""}, ${selectedProperty.locationName || ""}`.replace(
            /^, |, $/g,
            "",
          ),
      }));
      setTouchedFields((prev) => ({ ...prev, propertyId: true }));
    }
  };

  const formatTimeTo12h = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "VIDEO" : "IMAGE");
    setImagePreview(URL.createObjectURL(file));
    setTouchedFields((prev) => ({ ...prev, image: true }));

    if (!isVideo) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const dims = { width: img.naturalWidth, height: img.naturalHeight };
        setImageDimensions(dims);
        const bannerType = detectBannerType(dims);
        uploadMediaFile(file, "IMAGE", dims, bannerType);
      };
    } else {
      uploadMediaFile(file, "VIDEO");
    }
  };

  const uploadMediaFile = async (file, type, dimensions = null) => {
    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      if (dimensions) {
        fd.append("width", dimensions.width.toString());
        fd.append("height", dimensions.height.toString());
      }
      const response = await uploadMedia(fd);
      const mediaId = response?.data;
      if (mediaId) {
        setUploadedMediaId(mediaId);
        showSuccess(`${type} uploaded successfully`);
      }
    } catch (error) {
      showError("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ IMPROVED VALIDATION LOGIC
  const isPropertyRequired =
    formData.displayLocation === "PROPERTY_PAGE" ||
    formData.displayLocation === "BOTH";

  const formValidation = useMemo(() => {
    const errors = [];
    if (!uploadedMediaId && !formData.imageMediaId) errors.push("visual");
    if (isPropertyRequired && !formData.propertyId) errors.push("property");
    if (!isBannerDetected && !formData.title?.trim()) errors.push("title");
    return { isValid: errors.length === 0, errors };
  }, [
    uploadedMediaId,
    formData.imageMediaId,
    formData.propertyId,
    formData.title,
    isBannerDetected,
    isPropertyRequired,
  ]);

  const handleButtonClick = () => {
    setTouchedFields({ title: true, propertyId: true, image: true });
    if (!formValidation.isValid) {
      showError(`Please complete: ${formValidation.errors.join(", ")}`);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const timeString = `${formatTimeTo12h(startTime)} - ${formatTimeTo12h(endTime)}`;

      const resolvedType = resolvePropertyTypeForPayload();

      const payload = {
        ...formData,

        // ✅ force correct property type mapping
        propertyTypeId: resolvedType.propertyTypeId,
        propertyType: resolvedType.propertyType,

        title: formData.title.trim() || "Untitled Offer",
        availableHours: timeString,
        propertyId: parseInt(formData.propertyId) || null,
        imageMediaId: uploadedMediaId || formData.imageMediaId,
      };

      if (editingOffer) {
        await updateDailyOfferById(editingOffer.id, payload);
        showSuccess("Offer updated");
      } else {
        await createDailyOffer(payload);
        showSuccess("Offer created");
      }

      onClose(true);
    } catch (error) {
      showError("Failed to save offer");
    } finally {
      setLoading(false);
    }
  };

  const resolvePropertyTypeForPayload = () => {
    if (formData.displayLocation === "BOTH") {
      const bothType = propertyTypes.find(
        (t) => t.typeName?.toLowerCase() === "both",
      );

      return {
        propertyTypeId: bothType?.id || null,
        propertyType: bothType?.typeName || "both",
      };
    }

    // Normal property page case
    return {
      propertyTypeId: formData.propertyTypeId,
      propertyType: formData.propertyType,
    };
  };

  const bothTypeAvailable = propertyTypes.some(
    (t) => t.typeName?.toLowerCase() === "both",
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style>{inputStyles}</style>
      <div className="custom-modal-container h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">
              {editingOffer ? "Update Offer" : "Create Offer"}
            </h3>
            {isBannerDetected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-full text-xs font-bold animate-pulse">
                <Instagram size={14} /> <span>{detectedBannerType?.badge}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Building2 size={12} /> Select Property{" "}
                  {isPropertyRequired && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  value={formData.propertyId || ""}
                  onChange={(e) => handlePropertySelect(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border bg-[#F3F4F6] text-sm outline-none ${isPropertyRequired && touchedFields.propertyId && !formData.propertyId ? "border-red-500 border-2" : ""}`}
                >
                  <option value="">Choose a property...</option>
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.propertyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Offer Title{" "}
                    {!isBannerDetected && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    className={`w-full p-2.5 rounded-lg border bg-[#F3F4F6] text-sm ${!isBannerDetected && touchedFields.title && !formData.title ? "border-red-500 border-2" : ""}`}
                    placeholder="Weekend Special"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        couponCode: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full p-2.5 rounded-lg border bg-[#F3F4F6] text-sm font-mono"
                    placeholder="WKND20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Clock size={12} /> Validity Hours
                </label>
                <div className="flex items-center gap-3 p-2 bg-[#F3F4F6] border rounded-lg">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-transparent text-sm font-medium outline-none"
                  />
                  <span className="text-gray-400 font-bold text-xs">TO</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-transparent text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Short Tagline
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-lg border bg-[#F3F4F6] text-sm"
                  maxLength={50}
                />
              </div>

              {/* {bothTypeAvailable && (
                <div
                  className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-lg cursor-pointer group mt-auto"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      displayLocation:
                        p.displayLocation === "BOTH" ? "PROPERTY_PAGE" : "BOTH",
                    }))
                  }
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${formData.displayLocation === "BOTH" ? "bg-blue-600 border-blue-600" : "bg-white border-blue-200"}`}
                  >
                    {formData.displayLocation === "BOTH" && (
                      <Check size={16} className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 leading-none">
                      Show in both pages
                    </p>
                    <p className="text-[10px] text-blue-600 mt-1 uppercase font-semibold">
                      Home page & Property page
                    </p>
                  </div>
                </div>
              )} */}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <ImageIcon size={14} /> Offer Visual{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() =>
                    document.getElementById("offer-img-upload")?.click()
                  }
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-all bg-[#F3F4F6] ${touchedFields.image && !uploadedMediaId && !formData.imageMediaId ? "border-red-500" : "border-gray-200"}`}
                >
                  <input
                    id="offer-img-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />
                  {uploadingImage ? (
                    <Loader2
                      className="animate-spin mx-auto text-primary"
                      size={32}
                    />
                  ) : (
                    <Upload className="mx-auto text-gray-300" size={32} />
                  )}
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    Square Banner or Reel Recommended
                  </p>
                </div>
                {imagePreview && (
                  <div className="mt-4 relative group rounded-xl overflow-hidden border shadow-lg">
                    {mediaType === "VIDEO" ? (
                      <video
                        src={imagePreview}
                        className="w-full h-48 object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <img
                        src={imagePreview}
                        className="w-full h-48 object-cover"
                        alt="Preview"
                      />
                    )}
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setUploadedMediaId(null);
                        setIsBannerDetected(false);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 border rounded-lg bg-[#F3F4F6] flex items-center justify-between">
                <p className="text-xs font-bold uppercase text-gray-600">
                  Active Status
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, isActive: !p.isActive }))
                  }
                  className={`h-6 w-11 rounded-full relative transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${formData.isActive ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Expires On
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, expiresAt: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-lg border bg-[#F3F4F6] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Detailed Description
                </label>
                <textarea
                  value={formData.longDesc}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, longDesc: e.target.value }))
                  }
                  rows={4}
                  className="w-full p-2.5 rounded-lg border bg-[#F3F4F6] text-sm resize-none"
                  placeholder="Enter full offer details..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => onClose(false)}
            className="px-6 py-2.5 rounded-lg border font-bold text-gray-600 hover:bg-white transition-all"
          >
            Cancel
          </button>
          <div onClick={handleButtonClick}>
            <button
              disabled={loading || uploadingImage || !formValidation.isValid}
              className={`px-10 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all ${loading || uploadingImage || !formValidation.isValid ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : editingOffer ? (
                "Update Offer"
              ) : (
                "Create Offer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOfferModal;
