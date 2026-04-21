import React, { useState } from "react";
import { colors } from "@/lib/colors/colors";
import {
  X,
  Save,
  Loader2,
  Building2,
  MapPin,
  Plus,
  User,
  Tag,
  Layers,
  Star,
  DollarSign,
  Users,
  Percent,
  FileText,
  Hash,
  ToggleLeft,
  Sparkles,
  Navigation,
  LinkIcon,
  ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { updatePropertyById, PropertyEdiMedia } from "@/Api/Api";
import { toast } from "react-hot-toast";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white";

const Field = ({ label, icon: Icon, children, span = 1 }) => (
  <div className={span === 2 ? "col-span-2" : "col-span-1"}>
    <label className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
      {Icon && <Icon size={10} />} {label}
    </label>
    {children}
  </div>
);

const Section = ({ label, icon: Icon }) => (
  <div className="col-span-2 flex items-center gap-3 pt-3">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
      {Icon && <Icon size={11} className="text-blue-500" />}
      {label}
    </div>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const VERIFIED_USERS_SCALE = 1000000;

const isValidOptionalUrl = (value) => {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isValidOptionalEmail = (value) => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const parseCombinedRating = (value) => {
  if (value === null || value === undefined || value === "") {
    return { rating: "", verifiedUsers: "" };
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return { rating: "", verifiedUsers: "" };
  }

  const baseRating = Math.floor((numericValue + 0.0000001) * 10) / 10;
  const verifiedUsers = Math.round(
    (numericValue - baseRating) * VERIFIED_USERS_SCALE,
  );

  return {
    rating: baseRating ? baseRating.toFixed(1) : "0.0",
    verifiedUsers: verifiedUsers > 0 ? String(verifiedUsers) : "",
  };
};

const encodeCombinedRating = (ratingValue, verifiedUsersValue) => {
  if (ratingValue === "") return null;

  const rating = Number(ratingValue);
  if (Number.isNaN(rating)) return null;

  const normalizedRating = Math.round(rating * 10) / 10;
  const verifiedUsers = Math.max(0, Number(verifiedUsersValue) || 0);

  return Number(
    (normalizedRating + verifiedUsers / VERIFIED_USERS_SCALE).toFixed(6),
  );
};

function EditPropertyModal({
  item,
  propertyTypes,
  propertyCategories,
  amenities,
  admins,
  locations,
  allProperties,
  onClose,
  onSuccess,
}) {
  console.log("item", item);
  const p = item?.propertyResponseDTO || {};
  const listing = item?.propertyListingResponseDTOS?.[0] || {};
  const parsedRating = parseCombinedRating(listing.rating);
  const [locationInputMode, setLocationInputMode] = useState(
    p.addressUrl ? "addressUrl" : "coordinates",
  );

  // ── Existing media (max 3) ─────────────────────────────────────────────────
  const existingMedia = (listing.media || []).slice(0, 3);

  // ── New files to replace media ─────────────────────────────────────────────
  const [newFiles, setNewFiles] = useState([]); // File[]
  const [mediaUploading, setMediaUploading] = useState(false);

  const resolveTypeIds = () =>
    (p.propertyTypes || [])
      .map((name) => propertyTypes?.find((t) => t.typeName === name)?.id)
      .filter(Boolean);

  const resolveCategoryIds = () =>
    (p.propertyCategories || [])
      .map(
        (name) => propertyCategories?.find((c) => c.categoryName === name)?.id,
      )
      .filter(Boolean);

  const resolveAmenityIds = () =>
    (listing.amenities || [])
      .map((name) => amenities?.find((a) => a.name === name)?.id)
      .filter(Boolean);

  const [form, setForm] = useState({
    propertyName: p.propertyName || "",
    propertyTypeIds: resolveTypeIds(),
    propertyCategoryIds: resolveCategoryIds(),
    address: p.address || "",
    addressUrl: p.addressUrl || "",
    area: p.area || "",
    pincode: p.pincode || "",
    locationId: p.locationId || "",
    assignedAdminId: p.assignedAdminId || "",
    parentPropertyId: p.parentPropertyId || "",
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    isActive: p.isActive ?? true,
    dineIn: Boolean(p.dineIn),
    takeaway: Boolean(p.takeaway),
    mainHeading: listing.mainHeading || "",
    subTitle: listing.subTitle || "",
    fullAddress: listing.fullAddress || "",
    tagline: listing.tagline || "",
    rating: parsedRating.rating,
    verifiedUsers: parsedRating.verifiedUsers,
    capacity: listing.capacity ?? "",
    price: listing.price ?? "",
    gstPercentage: listing.gstPercentage ?? "",
    discountAmount: listing.discountAmount ?? "",
    bookingEngineUrl: p.bookingEngineUrl || "",
    amenitiesAndFeaturesIds: resolveAmenityIds(),
    mobileNumber: p.mobileNumber || "",
    email: p.email || "",

    // ✅ NEW FIELD
    nearbyLocations:
      p.nearbyLocations && p.nearbyLocations.length > 0
        ? p.nearbyLocations
        : [{ nearbyLocationName: "", googleMapLink: "" }],
  });

  const isHotelType = form.propertyTypeIds.some((id) => {
    const matchedType = propertyTypes?.find((type) => type.id === id);
    return String(matchedType?.typeName || "").toLowerCase() === "hotel";
  });

  const isRestaurantOrCafeType = form.propertyTypeIds.some((id) => {
    const matchedType = propertyTypes?.find((type) => type.id === id);
    const name = String(matchedType?.typeName || "").toLowerCase();
    return name === "restaurant" || name === "cafe";
  });

  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleId = (key, id) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((x) => x !== id)
        : [...prev[key], id],
    }));

  // ── Handle file selection ──────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setNewFiles(file ? [file] : []);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleNearbyChange = (index, field, value) => {
    const updated = [...form.nearbyLocations];
    updated[index][field] = value;

    setForm((prev) => ({
      ...prev,
      nearbyLocations: updated,
    }));
  };

  const addNearbyLocation = () => {
    setForm((prev) => ({
      ...prev,
      nearbyLocations: [
        ...prev.nearbyLocations,
        { nearbyLocationName: "", googleMapLink: "" },
      ],
    }));
  };

  const removeNearbyLocation = (index) => {
    const updated = form.nearbyLocations.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      nearbyLocations: updated,
    }));
  };

  const handleLocationModeChange = (mode) => {
    setLocationInputMode(mode);
    setForm((prev) => ({
      ...prev,
      addressUrl: mode === "addressUrl" ? prev.addressUrl : "",
      latitude: mode === "coordinates" ? prev.latitude : "",
      longitude: mode === "coordinates" ? prev.longitude : "",
    }));
  };

  const buildMediaFormData = () => {
    const mediaFormData = new FormData();
    mediaFormData.append("mediaType", "IMAGE");

    const existingMediaIds = (listing.media || [])
      .map((m) => m.mediaId)
      .filter(Boolean);
    existingMediaIds.forEach((id) => mediaFormData.append("mediaIds", id));
    newFiles.forEach((file) => mediaFormData.append("files", file));

    return mediaFormData;
  };

  // ── Upload media via PropertyEdiMedia ──────────────────────────────────────
  const handleMediaUpload = async () => {
    if (!newFiles.length) return true;
    if (!listing.id) {
      toast.error("No listing ID found for media upload");
      return false;
    }

    setMediaUploading(true);
    try {
      console.log("[EditPropertyModal] Uploading media", {
        listingId: listing.id,
        fileCount: newFiles.length,
        existingMediaIds: (listing.media || [])
          .map((m) => m.mediaId)
          .filter(Boolean),
      });
      await PropertyEdiMedia(listing.id, buildMediaFormData());
      toast.success("Media updated successfully");
      setNewFiles([]);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Media upload failed");
      return false;
    } finally {
      setMediaUploading(false);
    }
  };

  // ── Submit property update ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[EditPropertyModal] Save Changes clicked", {
      propertyId: p.id,
      listingId: listing.id,
      locationInputMode,
      addressUrl: form.addressUrl,
      latitude: form.latitude,
      longitude: form.longitude,
      newFilesCount: newFiles.length,
    });
    setSaving(true);
    try {
      if (!isValidOptionalEmail(form.email)) {
        toast.error("Enter a valid email address");
        console.warn("[EditPropertyModal] Submit blocked: invalid email", {
          email: form.email,
        });
        return;
      }

      if (
        locationInputMode === "addressUrl" &&
        !isValidOptionalUrl(form.addressUrl)
      ) {
        toast.error("Enter a valid address URL");
        console.warn("[EditPropertyModal] Submit blocked: invalid address URL", {
          addressUrl: form.addressUrl,
        });
        return;
      }

      if (!isValidOptionalUrl(form.bookingEngineUrl)) {
        toast.error("Enter a valid booking engine URL");
        console.warn(
          "[EditPropertyModal] Submit blocked: invalid booking engine URL",
          {
            bookingEngineUrl: form.bookingEngineUrl,
          },
        );
        return;
      }

      const invalidNearbyLocation = form.nearbyLocations.find(
        (loc) => loc.googleMapLink && !isValidOptionalUrl(loc.googleMapLink),
      );
      if (invalidNearbyLocation) {
        toast.error("Enter a valid nearby location map link");
        console.warn(
          "[EditPropertyModal] Submit blocked: invalid nearby map link",
          invalidNearbyLocation,
        );
        return;
      }

      if (locationInputMode === "coordinates") {
        const hasLatitude = form.latitude !== "" && form.latitude !== null;
        const hasLongitude = form.longitude !== "" && form.longitude !== null;
        if (hasLatitude !== hasLongitude) {
          toast.error("Enter both latitude and longitude");
          console.warn(
            "[EditPropertyModal] Submit blocked: incomplete coordinates",
          );
          return;
        }
      }

      const combinedRatingValue = isHotelType
        ? encodeCombinedRating(form.rating, form.verifiedUsers)
        : form.rating !== ""
          ? Number(form.rating)
          : null;

      const payload = {
        propertyName: form.propertyName,
        propertyTypeIds: form.propertyTypeIds,
        propertyCategoryIds: form.propertyCategoryIds,
        address: form.address,
        addressUrl:
          locationInputMode === "addressUrl" ? form.addressUrl || null : null,
        area: form.area,
        pincode: form.pincode,
        locationId: form.locationId ? Number(form.locationId) : null,
        assignedAdminId: form.assignedAdminId
          ? Number(form.assignedAdminId)
          : null,
        parentPropertyId: form.parentPropertyId
          ? Number(form.parentPropertyId)
          : null,
        childPropertyIds: null,
        latitude:
          locationInputMode === "coordinates" && form.latitude !== ""
            ? Number(form.latitude)
            : null,
        longitude:
          locationInputMode === "coordinates" && form.longitude !== ""
            ? Number(form.longitude)
            : null,
        isActive: form.isActive,
        dineIn: Boolean(form.dineIn),
        takeaway: Boolean(form.takeaway),
        mainHeading: form.mainHeading,
        subTitle: form.subTitle,
        fullAddress: form.fullAddress,
        bookingEngineUrl: form.bookingEngineUrl || "",
        tagline: form.tagline,
        rating: combinedRatingValue,
        capacity: form.capacity !== "" ? Number(form.capacity) : null,
        price: form.price !== "" ? Number(form.price) : null,
        gstPercentage:
          form.gstPercentage !== "" ? Number(form.gstPercentage) : null,
        discountAmount:
          form.discountAmount !== "" ? Number(form.discountAmount) : null,
        amenitiesAndFeaturesIds: form.amenitiesAndFeaturesIds.length
          ? form.amenitiesAndFeaturesIds
          : null,
        mobileNumber: form.mobileNumber ? Number(form.mobileNumber) : null,
        email: form.email || "",

        // ✅ CLEAN EMPTY ROWS
        nearbyLocations: form.nearbyLocations.filter(
          (loc) => loc.nearbyLocationName.trim() !== "",
        ),
      };
      console.log("[EditPropertyModal] Updating property", payload);
      await updatePropertyById(p.id, payload);

      if (newFiles.length > 0) {
        const mediaSaved = await handleMediaUpload();
        if (!mediaSaved) {
          toast.error("Property details saved, but media update failed");
          return;
        }
      }

      toast.success("Property updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  const ChipSelect = ({ items, labelKey, idKey, stateKey, color }) => (
    <div className="flex flex-wrap gap-1.5 p-2.5 border border-gray-200 rounded-lg min-h-[44px]">
      {items?.length ? (
        items.map((it) => {
          const selected = form[stateKey].includes(it[idKey]);
          return (
            <button
              key={it[idKey]}
              type="button"
              onClick={() => toggleId(stateKey, it[idKey])}
              className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wide transition-all ${
                selected
                  ? `${color} text-white shadow-sm`
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {it[labelKey]}
            </button>
          );
        })
      ) : (
        <span className="text-xs text-gray-300 self-center px-1">
          None available
        </span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh]">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-7 py-5 rounded-t-2xl shrink-0"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                Edit Property
              </h3>
              <p className="text-white/60 text-[11px] font-medium mt-0.5">
                #{p.id} — {p.propertyName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Form ────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-7 py-6">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              {/* ─── IDENTITY ─────────────────────────────────────── */}
              <Section label="Identity" icon={Building2} />

              <Field label="Property Name" icon={Building2} span={2}>
                <input
                  type="text"
                  value={form.propertyName}
                  onChange={(e) => set("propertyName", e.target.value)}
                  required
                  placeholder="e.g. Anurag's Palace"
                  className={inputCls}
                />
              </Field>

              <Field label="Property Types" icon={Tag}>
                <ChipSelect
                  items={propertyTypes}
                  labelKey="typeName"
                  idKey="id"
                  stateKey="propertyTypeIds"
                  color="bg-blue-600"
                />
              </Field>

              <Field label="Categories" icon={Layers}>
                <ChipSelect
                  items={propertyCategories}
                  labelKey="categoryName"
                  idKey="id"
                  stateKey="propertyCategoryIds"
                  color="bg-purple-600"
                />
              </Field>

              {isRestaurantOrCafeType && (
                <Field label="Service Type" icon={Tag} span={2}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "dineIn", label: "Dine In" },
                      { key: "takeaway", label: "Takeaway" },
                    ].map((option) => (
                      <label
                        key={option.key}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(form[option.key])}
                          onChange={(e) => set(option.key, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span className="text-sm font-bold text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </Field>
              )}

              <Field label="Status" icon={ToggleLeft} span={2}>
                <button
                  type="button"
                  onClick={() => set("isActive", !form.isActive)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all w-fit ${
                    form.isActive
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      form.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form.isActive ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-black uppercase tracking-widest ${
                      form.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
              </Field>

              {/* ─── LOCATION ─────────────────────────────────────── */}
              <Section label="Location" icon={MapPin} />

              <Field label="Address" icon={MapPin} span={2}>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Street address"
                  className={inputCls}
                />
              </Field>

              <Field label="Main Location Input" icon={Navigation} span={2}>
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 p-1 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => handleLocationModeChange("coordinates")}
                    className={`rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                      locationInputMode === "coordinates"
                        ? "bg-white shadow-sm"
                        : "text-gray-500"
                    }`}
                    style={{
                      color:
                        locationInputMode === "coordinates"
                          ? colors.primary
                          : undefined,
                    }}
                  >
                    Latitude / Longitude
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationModeChange("addressUrl")}
                    className={`rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                      locationInputMode === "addressUrl"
                        ? "bg-white shadow-sm"
                        : "text-gray-500"
                    }`}
                    style={{
                      color:
                        locationInputMode === "addressUrl"
                          ? colors.primary
                          : undefined,
                    }}
                  >
                    Address URL
                  </button>
                </div>
              </Field>

              {locationInputMode === "addressUrl" && (
                <Field label="Main Address URL" icon={LinkIcon} span={2}>
                  <input
                    type="text"
                    value={form.addressUrl}
                    onChange={(e) => set("addressUrl", e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className={inputCls}
                  />
                </Field>
              )}

              <Field label="Area">
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  placeholder="e.g. Central"
                  className={inputCls}
                />
              </Field>

              <Field label="Pincode" icon={Hash}>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  placeholder="e.g. 560001"
                  className={inputCls}
                />
              </Field>

              <Field label="Location" icon={MapPin}>
                {locations ? (
                  <select
                    value={form.locationId}
                    onChange={(e) => set("locationId", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">-- Select --</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.locationName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={form.locationId}
                    onChange={(e) => set("locationId", e.target.value)}
                    placeholder="Location ID"
                    className={inputCls}
                  />
                )}
              </Field>
              <Field label="Mobile Number" icon={User}>
                <input
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => set("mobileNumber", e.target.value)}
                  placeholder="9090800700"
                  className={inputCls}
                />
              </Field>

              <Field label="Email" icon={LinkIcon}>
                <input
                  type="text"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="hello@gmail.com"
                  className={inputCls}
                />
              </Field>

              <Field label="Assigned Admin" icon={User}>
                {admins ? (
                  <select
                    value={form.assignedAdminId}
                    disabled
                    className={`${inputCls} bg-gray-100 cursor-not-allowed`}
                  >
                    <option value="">-- Unassigned --</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={form.assignedAdminId}
                    disabled
                    className={`${inputCls} bg-gray-100 cursor-not-allowed`}
                  />
                )}
              </Field>

              <Field label="Booking Engine URL" icon={LinkIcon} span={2}>
                <input
                  type="text"
                  value={form.bookingEngineUrl}
                  onChange={(e) => set("bookingEngineUrl", e.target.value)}
                  placeholder="https://book.example.com/property"
                  className={inputCls}
                />
              </Field>

              {/* ─── COORDINATES ──────────────────────────────────── */}
              {locationInputMode === "coordinates" && (
                <>
                  <Section label="Coordinates" icon={Navigation} />

                  <Field label="Latitude" icon={Navigation}>
                    <input
                      type="number"
                      value={form.latitude}
                      onChange={(e) => set("latitude", e.target.value)}
                      placeholder="e.g. 12.9716"
                      step="any"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Longitude" icon={Navigation}>
                    <input
                      type="number"
                      value={form.longitude}
                      onChange={(e) => set("longitude", e.target.value)}
                      placeholder="e.g. 77.5946"
                      step="any"
                      className={inputCls}
                    />
                  </Field>
                </>
              )}
              {/* ─── NEARBY LOCATIONS ───────────────────────── */}
              <Section label="Nearby Locations" icon={MapPin} />

              <div className="col-span-2 space-y-4">
                {form.nearbyLocations.map((loc, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <input
                      type="text"
                      placeholder="Nearby Location Name"
                      className={inputCls}
                      value={loc.nearbyLocationName}
                      onChange={(e) =>
                        handleNearbyChange(
                          index,
                          "nearbyLocationName",
                          e.target.value,
                        )
                      }
                    />

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Google Map Link (optional)"
                        className={`${inputCls} flex-1`}
                        value={loc.googleMapLink}
                        onChange={(e) =>
                          handleNearbyChange(
                            index,
                            "googleMapLink",
                            e.target.value,
                          )
                        }
                      />

                      {form.nearbyLocations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNearbyLocation(index)}
                          className="px-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addNearbyLocation}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                  <Plus size={12} />
                  Add Nearby Location
                </button>
              </div>

              {/* ─── LISTING ──────────────────────────────────────── */}
              <Section label="Listing Details" icon={FileText} />

              <Field label="Description" span={2}>
                <textarea
                  value={form.mainHeading}
                  onChange={(e) => set("mainHeading", e.target.value)}
                  placeholder="Write a detailed description about the property..."
                  rows={10}
                  className={`${inputCls} resize-none leading-relaxed`}
                />
              </Field>

              <Field label="Sub Title">
                <input
                  type="text"
                  value={form.subTitle}
                  onChange={(e) => set("subTitle", e.target.value)}
                  placeholder="e.g. Premium stay in Central City"
                  className={inputCls}
                />
              </Field>

              <Field label="Tagline">
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="e.g. Comfort in the heart of the city"
                  className={inputCls}
                />
              </Field>

              <Field label="Full Address" span={2}>
                <input
                  type="text"
                  value={form.fullAddress}
                  onChange={(e) => set("fullAddress", e.target.value)}
                  placeholder="e.g. MG Road, Central City, Bengaluru - 560001"
                  className={inputCls}
                />
              </Field>

              {/* ─── PRICING & CAPACITY ───────────────────────────── */}
              <Section label="Pricing & Capacity" icon={DollarSign} />

              <Field label="Price (₹)" icon={DollarSign}>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className={inputCls}
                />
              </Field>

              <Field label="Discount Amount (₹)">
                <input
                  type="number"
                  value={form.discountAmount}
                  onChange={(e) => set("discountAmount", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className={inputCls}
                />
              </Field>

              <Field label="GST (%)" icon={Percent}>
                <input
                  type="number"
                  value={form.gstPercentage}
                  onChange={(e) => set("gstPercentage", e.target.value)}
                  placeholder="0.0"
                  min="0"
                  max="100"
                  step="0.1"
                  className={inputCls}
                />
              </Field>

              <Field label="Capacity" icon={Users}>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => set("capacity", e.target.value)}
                  placeholder="0"
                  min="0"
                  className={inputCls}
                />
              </Field>

              <Field label="Rating" icon={Star}>
                <input
                  type="number"
                  value={form.rating}
                  onChange={(e) => set("rating", e.target.value)}
                  placeholder="0.0"
                  min="0"
                  max="5"
                  step="0.1"
                  className={inputCls}
                />
              </Field>

              {isHotelType && (
                <Field label="Verified Users Rating" icon={Users}>
                  <input
                    type="number"
                    value={form.verifiedUsers}
                    onChange={(e) => set("verifiedUsers", e.target.value)}
                    placeholder="e.g. 2156"
                    min="0"
                    className={inputCls}
                  />
                </Field>
              )}

              {/* ─── AMENITIES ────────────────────────────────────── */}
              {amenities && amenities.length > 0 && (
                <>
                  <Section label="Amenities & Features" icon={Sparkles} />
                  <Field label="Select Amenities" span={2}>
                    <ChipSelect
                      items={amenities}
                      labelKey="name"
                      idKey="id"
                      stateKey="amenitiesAndFeaturesIds"
                      color="bg-emerald-600"
                    />
                  </Field>
                </>
              )}

              {/* ─── MEDIA ────────────────────────────────────────── */}
              <Section label="Media" icon={ImageIcon} />

              <div className="col-span-2 space-y-4">
                {/* Existing Media — max 3 */}
                {existingMedia.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Current Photos ({existingMedia.length})
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {existingMedia.map((media, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100"
                        >
                          <img
                            src={media.url}
                            alt={media.alt || `Media ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          {/* Fallback if image fails */}
                          <div className="absolute inset-0 items-center justify-center bg-gray-100 hidden">
                            <ImageIcon size={24} className="text-gray-300" />
                          </div>
                          {/* Index badge */}
                          <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Replace / Upload new media */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <RefreshCw size={10} />
                    {existingMedia.length > 0
                      ? "Replace Media"
                      : "Upload Media"}
                  </p>

                  {/* Drop zone — same pattern as AddPropertyModal */}
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer"
                    onClick={() =>
                      document.getElementById("edit-media-input").click()
                    }
                  >
                    <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-gray-500">
                      Click to select photo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {newFiles.length > 0
                        ? `${newFiles.length} file selected`
                        : "PNG, JPG, WEBP supported"}
                    </p>
                    <input
                      id="edit-media-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Selected file chips */}
                  {newFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {newFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100"
                        >
                          <ImageIcon size={10} />
                          <span className="max-w-[120px] truncate">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeNewFile(i)}
                            className="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Standalone upload button (for uploading media without saving the full form) */}
                  {newFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleMediaUpload}
                      disabled={mediaUploading}
                      className="mt-3 flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-all"
                    >
                      {mediaUploading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      {mediaUploading ? "Uploading..." : "Upload Now"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div className="shrink-0 flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
            <span className="text-[10px] text-gray-400 font-semibold">
              Property ID #{p.id}
              {listing.id && (
                <span className="ml-2 text-gray-300">
                  · Listing #{listing.id}
                </span>
              )}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-60"
                style={{ backgroundColor: colors.primary }}
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPropertyModal;
