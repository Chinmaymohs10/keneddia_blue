import React, { useState, useEffect, useCallback, useRef } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import {
  createOrUpdateKennediaGroup,
  getKennediaGroup,
  enableKennediaDivision,
  disableKennediaDivision,
  uploadMedia,
} from "@/Api/Api";
import { toast } from "react-hot-toast";

// ── Small helpers ──────────────────────────────────────────────────────────
const RequiredLabel = ({ children }) => (
  <label
    className="block text-xs font-semibold mb-1"
    style={{ color: colors.textPrimary }}
  >
    {children} <span className="text-red-500">*</span>
  </label>
);

const OptionalLabel = ({ children }) => (
  <label
    className="block text-xs font-semibold mb-1"
    style={{ color: colors.textPrimary }}
  >
    {children}
  </label>
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-[11px] text-red-500 font-medium">{msg}</p>
  ) : null;

const fieldCls = (hasError) =>
  `w-full px-3 py-2 rounded border text-sm transition-colors outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 bg-red-50 focus:ring-red-200"
      : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

// ── Image Upload Widget ────────────────────────────────────────────────────
/**
 * Props:
 *   label        – field label string
 *   required     – show red asterisk
 *   previewUrl   – existing image URL (from fetched data)
 *   mediaId      – existing mediaId
 *   onUploaded   – callback({ mediaId, url }) after successful upload
 *   size         – "sm" | "md" (default "md")
 */
function ImageUploader({
  label,
  required = false,
  previewUrl,
  mediaId,
  onUploaded,
  size = "md",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const displayUrl = localPreview || previewUrl || null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadMedia(formData);

      // Response is directly the mediaId number (e.g. 926)
      const newMediaId = res?.data ?? res;

      if (!newMediaId) throw new Error("No mediaId returned from upload");

      // URL not returned — keep local objectUrl as preview
      onUploaded({ mediaId: newMediaId, url: objectUrl });
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed. Please try again.");
      setLocalPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setLocalPreview(null);
    onUploaded({ mediaId: null, url: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  const thumbSize = size === "sm" ? "w-14 h-14" : "w-20 h-20";
  const btnText = mediaId || localPreview ? "Change" : "Upload";

  return (
    <div>
      {required ? (
        <OptionalLabel>{label}</OptionalLabel>
      ) : (
        <OptionalLabel>{label}</OptionalLabel>
      )}

      <div className="flex items-center gap-3">
        {/* Thumbnail preview */}
        <div
          className={`${thumbSize} rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative`}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-blue-400" />
          ) : displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <ImageIcon size={20} className="text-gray-300" />
          )}
        </div>

        {/* Upload button */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Upload size={12} />
            {uploading ? "Uploading…" : btnText}
          </button>
          {mediaId && (
            <span className="text-[10px] text-gray-400">
              Media ID: {mediaId}
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
function KennediaGroup() {
  const [headerSettings, setHeaderSettings] = useState({
    mainTitle: "",
    subTitle: "",
  });
  const [centerLogoSettings, setCenterLogoSettings] = useState({
    logoText: "",
    logoSubText: "",
  });

  // Header logo image
  const [headerIcon, setHeaderIcon] = useState({
    mediaId: null,
    url: null,
  });

  const [businessDivisions, setBusinessDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingData, setExistingData] = useState(null);
  const [errors, setErrors] = useState({});

  const clearError = (key) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchKennediaGroup = useCallback(async () => {
    try {
      setFetching(true);
      const response = await getKennediaGroup();
      if (response.data) {
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        if (data) {
          setExistingData(data);
          setHeaderSettings({
            mainTitle: data.mainTitle || "",
            subTitle: data.subTitle || "",
          });
          setCenterLogoSettings({
            logoText: data.logoText || "",
            logoSubText: data.logoSubText || "",
          });

          // Restore header icon
          if (data.icon?.mediaId) {
            setHeaderIcon({
              mediaId: data.icon.mediaId,
              url: data.icon.url || null,
            });
          }

          if (data.divisions && Array.isArray(data.divisions)) {
            setBusinessDivisions(
              data.divisions.map((div) => ({
                id: div.id,
                icon: div.icon || "",
                // Restore per-division icon image
                iconMediaId: div.icons?.mediaId || null,
                iconUrl: div.icons?.url || null,
                title: div.title || "",
                description: div.description || "",
                ctaLink: div.ctaLink || "",
                displayOrder: div.displayOrder || 1,
                isActive: div.active !== undefined ? div.active : true,
                isExisting: true,
              })),
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Kennedia Group:", error);
      if (error.response?.status !== 404)
        toast.error("Failed to load Kennedia Group data");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchKennediaGroup();
  }, [fetchKennediaGroup]);

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!headerSettings.mainTitle.trim())
      newErrors.mainTitle = "Main title is required";
    if (!headerSettings.subTitle.trim())
      newErrors.subTitle = "Subtitle is required";
    if (!centerLogoSettings.logoText.trim())
      newErrors.logoText = "Logo text is required";
    if (!centerLogoSettings.logoSubText.trim())
      newErrors.logoSubText = "Logo subtext is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleToggleStatus = async (division) => {
    if (!division.isExisting) {
      toast.error("Please save the group first before toggling status");
      return;
    }
    try {
      setLoading(true);
      if (division.isActive) {
        await disableKennediaDivision(division.id);
        toast.success(`${division.title} disabled successfully`);
      } else {
        await enableKennediaDivision(division.id);
        toast.success(`${division.title} enabled successfully`);
      }
      await fetchKennediaGroup();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDivision = () => {
    if (businessDivisions.length >= 5) {
      toast.error("You can only add up to 5 business divisions");
      return;
    }
    setBusinessDivisions([
      ...businessDivisions,
      {
        id: Date.now(),
        icon: "",
        iconMediaId: null,
        iconUrl: null,
        title: "",
        description: "",
        ctaLink: "",
        displayOrder: businessDivisions.length + 1,
        isActive: true,
        isExisting: false,
      },
    ]);
  };

  const handleDivisionChange = (id, field, value) =>
    setBusinessDivisions(
      businessDivisions.map((d) =>
        d.id === id ? { ...d, [field]: value } : d,
      ),
    );

  // Called when division icon image is uploaded
  const handleDivisionIconUploaded = (divId, { mediaId, url }) => {
    setBusinessDivisions((prev) =>
      prev.map((d) =>
        d.id === divId ? { ...d, iconMediaId: mediaId, iconUrl: url } : d,
      ),
    );
  };

  const handleMoveDivision = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === businessDivisions.length - 1)
    )
      return;
    const newDivisions = [...businessDivisions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newDivisions[index], newDivisions[targetIndex]] = [
      newDivisions[targetIndex],
      newDivisions[index],
    ];
    newDivisions.forEach((div, idx) => {
      div.displayOrder = idx + 1;
    });
    setBusinessDivisions(newDivisions);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        mainTitle: headerSettings.mainTitle,
        subTitle: headerSettings.subTitle,
        logoText: centerLogoSettings.logoText,
        logoSubText: centerLogoSettings.logoSubText,
        // Include header icon mediaId only if set
        iconMediaId: headerIcon.mediaId ?? null,
        divisions: businessDivisions.map((div) => ({
          icon: div.icon,
          title: div.title,
          description: div.description,
          ctaLink: div.ctaLink,
          displayOrder: div.displayOrder,
          // Include division icon mediaId only if set
          iconMediaId: div.iconMediaId ?? null,
        })),
      };
      await createOrUpdateKennediaGroup(payload);
      toast.success("Kennedia Group saved successfully!");
      setErrors({});
      await fetchKennediaGroup();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save Kennedia Group",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div
        className="rounded-lg p-6 flex items-center justify-center h-[400px]"
        style={{ backgroundColor: colors.contentBg }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: colors.primary }}
        />
      </div>
    );

  return (
    <div className="space-y-3">
      {/* ── Header Settings ─────────────────────────────────────────────── */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center gap-2 mb-4">
          <h3
            className="text-sm font-semibold m-0"
            style={{ color: colors.textPrimary }}
          >
            Header Settings
          </h3>
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
            * Required
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <RequiredLabel>Main Title</RequiredLabel>
            <input
              type="text"
              value={headerSettings.mainTitle}
              onChange={(e) => {
                setHeaderSettings({
                  ...headerSettings,
                  mainTitle: e.target.value,
                });
                if (e.target.value.trim()) clearError("mainTitle");
              }}
              className={fieldCls(errors.mainTitle)}
              placeholder="e.g. The Kennedia Group"
            />
            <ErrorMsg msg={errors.mainTitle} />
          </div>

          <div>
            <RequiredLabel>Subtitle</RequiredLabel>
            <input
              type="text"
              value={headerSettings.subTitle}
              onChange={(e) => {
                setHeaderSettings({
                  ...headerSettings,
                  subTitle: e.target.value,
                });
                if (e.target.value.trim()) clearError("subTitle");
              }}
              className={fieldCls(errors.subTitle)}
              placeholder="e.g. A Legacy of Excellence"
            />
            <ErrorMsg msg={errors.subTitle} />
          </div>
        </div>
      </div>

      {/* ── Center Logo Settings ─────────────────────────────────────────── */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center gap-2 mb-4">
          <h3
            className="text-sm font-semibold m-0"
            style={{ color: colors.textPrimary }}
          >
            Center Logo Settings
          </h3>
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
            * Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <RequiredLabel>Logo Text</RequiredLabel>
            <input
              type="text"
              value={centerLogoSettings.logoText}
              onChange={(e) => {
                setCenterLogoSettings({
                  ...centerLogoSettings,
                  logoText: e.target.value,
                });
                if (e.target.value.trim()) clearError("logoText");
              }}
              className={fieldCls(errors.logoText)}
              placeholder="e.g. KENNEDIA"
            />
            <ErrorMsg msg={errors.logoText} />
          </div>

          <div>
            <RequiredLabel>Logo Subtext</RequiredLabel>
            <input
              type="text"
              value={centerLogoSettings.logoSubText}
              onChange={(e) => {
                setCenterLogoSettings({
                  ...centerLogoSettings,
                  logoSubText: e.target.value,
                });
                if (e.target.value.trim()) clearError("logoSubText");
              }}
              className={fieldCls(errors.logoSubText)}
              placeholder="e.g. GROUP"
            />
            <ErrorMsg msg={errors.logoSubText} />
          </div>
        </div>

        {/* Header / Group Logo Image */}
        <div
          className="rounded-lg p-3 border"
          style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}
        >
          <ImageUploader
            label="Group Logo Image (replaces logo text in center circle)"
            previewUrl={headerIcon.url}
            mediaId={headerIcon.mediaId}
            onUploaded={({ mediaId, url }) => setHeaderIcon({ mediaId, url })}
            size="md"
          />
        </div>
      </div>

      {/* ── Business Divisions ───────────────────────────────────────────── */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-sm font-semibold m-0"
            style={{ color: colors.textPrimary }}
          >
            Business Divisions ({businessDivisions.length}/5)
          </h3>
          <button
            onClick={handleAddDivision}
            disabled={businessDivisions.length >= 5}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-white disabled:opacity-50 transition-colors"
          >
            <Plus size={16} /> Add Division
          </button>
        </div>

        <div className="space-y-3">
          {businessDivisions.map((division, index) => (
            <div
              key={division.id}
              className="rounded-lg p-4 border transition-all"
              style={{
                backgroundColor: colors.mainBg,
                borderColor: colors.border,
                opacity: division.isActive ? 1 : 0.6,
              }}
            >
              {/* Row 1: icon key, title, description, display order */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={division.icon}
                  onChange={(e) =>
                    handleDivisionChange(division.id, "icon", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 rounded border text-sm border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Icon key (e.g. HOTEL)"
                />
                <input
                  type="text"
                  value={division.title}
                  onChange={(e) =>
                    handleDivisionChange(division.id, "title", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 rounded border text-sm border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={division.description}
                  onChange={(e) =>
                    handleDivisionChange(
                      division.id,
                      "description",
                      e.target.value,
                    )
                  }
                  className="w-full px-2.5 py-1.5 rounded border text-sm border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={division.displayOrder}
                  readOnly
                  className="w-full px-2.5 py-1.5 rounded border text-sm bg-muted opacity-50"
                />
              </div>

              {/* Row 2: CTA Link */}
              <div className="mt-3">
                <input
                  type="text"
                  value={division.ctaLink}
                  onChange={(e) =>
                    handleDivisionChange(division.id, "ctaLink", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 rounded border text-sm border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="CTA Link (e.g. https://example.com)"
                />
              </div>

              {/* Row 3: Division Icon Image Upload */}
              <div
                className="mt-3 p-3 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.contentBg,
                }}
              >
                <ImageUploader
                  label="Division Icon Image (overrides icon key fallback)"
                  previewUrl={division.iconUrl}
                  mediaId={division.iconMediaId}
                  onUploaded={(payload) =>
                    handleDivisionIconUploaded(division.id, payload)
                  }
                  size="sm"
                />
              </div>

              {/* Row 4: order controls + status toggle */}
              <div
                className="flex items-center justify-between mt-3 pt-3 border-t"
                style={{ borderColor: colors.border }}
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveDivision(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded border disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveDivision(index, "down")}
                    disabled={index === businessDivisions.length - 1}
                    className="p-1.5 rounded border disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleStatus(division)}
                  disabled={loading || !division.isExisting}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all shadow-sm ${
                    !division.isExisting
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : division.isActive
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {division.isActive ? (
                    <Power size={14} />
                  ) : (
                    <PowerOff size={14} />
                  )}
                  {division.isActive ? "Active" : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        {Object.keys(errors).length > 0 && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-bold text-red-600 mb-1">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.values(errors).map((msg, i) => (
                <li key={i} className="text-xs text-red-500">
                  {msg}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold bg-primary text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : existingData ? (
            "Update Kennedia Group"
          ) : (
            "Save Kennedia Group"
          )}
        </button>
      </div>
    </div>
  );
}

export default KennediaGroup;
