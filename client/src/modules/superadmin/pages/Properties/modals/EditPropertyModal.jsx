import React, { useState } from "react";
import { colors } from "@/lib/colors/colors";
import {
  X,
  Save,
  Loader2,
  Building2,
  MapPin,
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
  LinkIcon
} from "lucide-react";
import { updatePropertyById } from "@/Api/Api";
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
  console.log(item);
  const p = item?.propertyResponseDTO || {};
  const listing = item?.propertyListingResponseDTOS?.[0] || {};

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
    area: p.area || "",
    pincode: p.pincode || "",
    locationId: p.locationId || "",
    assignedAdminId: p.assignedAdminId || "",
    parentPropertyId: p.parentPropertyId || "",
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    isActive: p.isActive ?? true,
    mainHeading: listing.mainHeading || "",
    subTitle: listing.subTitle || "",
    fullAddress: listing.fullAddress || "",
    tagline: listing.tagline || "",
    rating: listing.rating ?? "",
    capacity: listing.capacity ?? "",
    price: listing.price ?? "",
    gstPercentage: listing.gstPercentage ?? "",
    discountAmount: listing.discountAmount ?? "",
    bookingEngineUrl: p.bookingEngineUrl || "",
    amenitiesAndFeaturesIds: resolveAmenityIds(),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        propertyName: form.propertyName,
        propertyTypeIds: form.propertyTypeIds,
        propertyCategoryIds: form.propertyCategoryIds,
        address: form.address,
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
        latitude: form.latitude !== "" ? Number(form.latitude) : null,
        longitude: form.longitude !== "" ? Number(form.longitude) : null,
        isActive: form.isActive,
        mainHeading: form.mainHeading,
        subTitle: form.subTitle,
        fullAddress: form.fullAddress,
        bookingEngineUrl: form.bookingEngineUrl || null,
        tagline: form.tagline,
        rating: form.rating !== "" ? Number(form.rating) : null,
        capacity: form.capacity !== "" ? Number(form.capacity) : null,
        price: form.price !== "" ? Number(form.price) : null,
        gstPercentage:
          form.gstPercentage !== "" ? Number(form.gstPercentage) : null,
        discountAmount:
          form.discountAmount !== "" ? Number(form.discountAmount) : null,
        amenitiesAndFeaturesIds: form.amenitiesAndFeaturesIds.length
          ? form.amenitiesAndFeaturesIds
          : null,
      };

      await updatePropertyById(p.id, payload);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh]">
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

              <Field label="Assigned Admin" icon={User}>
                {admins ? (
                  <select
                    value={form.assignedAdminId}
                    onChange={(e) => set("assignedAdminId", e.target.value)}
                    className={inputCls}
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
                    onChange={(e) => set("assignedAdminId", e.target.value)}
                    placeholder="Admin ID"
                    className={inputCls}
                  />
                )}
              </Field>
              <Field label="Booking Engine URL" icon={LinkIcon} span={2}>
                <input
                  type="url"
                  value={form.bookingEngineUrl}
                  onChange={(e) => set("bookingEngineUrl", e.target.value)}
                  placeholder="https://book.example.com/property"
                  className={inputCls}
                />
              </Field>

              {/* ─── COORDINATES ──────────────────────────────────── */}
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

              {/* ─── LISTING ──────────────────────────────────────── */}
              <Section label="Listing Details" icon={FileText} />

              <Field label="Main Heading" span={2}>
                <input
                  type="text"
                  value={form.mainHeading}
                  onChange={(e) => set("mainHeading", e.target.value)}
                  placeholder="e.g. Grand Palace Hotel"
                  className={inputCls}
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
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div className="shrink-0 flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
            <span className="text-[10px] text-gray-400 font-semibold">
              Property ID #{p.id}
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
