import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import {
  createBookingChannelPartner,
  getBookingChannelPartnersByPropertyId,
  updateBookingChannelPartner,
  updateBookingChannelPartnerStatus,
  uploadMedia,
  getPropertyTypes,
} from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";

const EMPTY_FORM = {
  title: "",
  url: "",
  textField: "",
  iconFile: null,
  iconPreview: "",
  iconMediaId: "",
};

const getUploadedMediaId = (raw) => {
  if (typeof raw === "number") return raw;
  return raw?.id ?? raw?.mediaId ?? raw?.data?.id ?? raw?.data ?? null;
};

const getUploadedMediaUrl = (raw) => {
  if (typeof raw === "string") return raw;
  return raw?.url ?? raw?.data?.url ?? "";
};

const BookingPartnersTab = ({ propertyData }) => {
  const propertyId = propertyData?.id || propertyData?.propertyId;
  const propertyTypeName =
    propertyData?.propertyType || propertyData?.propertyTypes?.[0] || "";

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const propertyTypeId = useMemo(() => {
    if (propertyData?.propertyTypeId) return propertyData.propertyTypeId;
    const matchedType = propertyTypes.find(
      (item) =>
        String(item?.typeName || "").trim().toLowerCase() ===
        String(propertyTypeName || "").trim().toLowerCase(),
    );
    return matchedType?.id ?? null;
  }, [propertyData?.propertyTypeId, propertyTypeName, propertyTypes]);

  const fetchPropertyTypes = useCallback(async () => {
    try {
      const res = await getPropertyTypes();
      const data = res?.data || res || [];
      setPropertyTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Booking partner property types fetch error:", error);
      showError("Failed to load property types");
    }
  }, []);

  const fetchPartners = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await getBookingChannelPartnersByPropertyId(propertyId);
      const data = res?.data?.data || res?.data || res || [];
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (error) {
      console.error("Booking partner fetch error:", error);
      showError("Failed to load booking partners");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchPropertyTypes();
  }, [fetchPropertyTypes]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingItem(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item?.title || "",
      url: item?.url || "",
      textField: item?.textField || "",
      iconFile: null,
      iconPreview: item?.icon?.url || item?.iconUrl || "",
      iconMediaId: item?.iconMediaId || item?.icon?.mediaId || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleIconUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const raw = res?.data;
      const mediaId = getUploadedMediaId(raw);
      const mediaUrl = getUploadedMediaUrl(raw) || URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        iconFile: file,
        iconPreview: mediaUrl,
        iconMediaId: mediaId || "",
      }));
      if (!mediaId) {
        showError("Icon uploaded but media id was not returned");
      }
    } catch (error) {
      console.error("Booking partner icon upload error:", error);
      showError("Failed to upload icon");
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    iconMediaId: Number(form.iconMediaId),
    url: form.url.trim(),
    textField: form.textField.trim(),
    propertyId: Number(propertyId),
    propertyTypeId: Number(propertyTypeId),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyId) return showError("Property id is missing");
    if (!propertyTypeId) return showError("Property type id is missing");
    if (!form.title.trim()) return showError("Title is required");
    if (!form.url.trim()) return showError("URL is required");

    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingItem?.id) {
        await updateBookingChannelPartner(editingItem.id, payload);
        showSuccess("Booking partner updated successfully");
      } else {
        await createBookingChannelPartner(payload);
        showSuccess("Booking partner created successfully");
      }
      closeModal();
      await fetchPartners();
    } catch (error) {
      console.error("Booking partner save error:", error);
      showError(
        error?.response?.data?.message || "Failed to save booking partner",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    if (!item?.id) return;
    setTogglingId(item.id);
    try {
      await updateBookingChannelPartnerStatus(item.id, !(item?.isActive ?? true));
      showSuccess("Booking partner status updated");
      await fetchPartners();
    } catch (error) {
      console.error("Booking partner toggle error:", error);
      showError(
        error?.response?.data?.message || "Failed to update partner status",
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Booking Partners</h2>
          <p className="text-xs text-gray-500 font-medium">
            Manage OTA and booking channel partner links for this hotel.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" />
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-14 text-center">
            <ArrowPathIcon className="w-7 h-7 animate-spin mx-auto text-blue-500" />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-14 w-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    {item?.icon?.url || item?.iconUrl ? (
                      <img
                        src={item.icon?.url || item.iconUrl}
                        alt={item.title || "Partner icon"}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <PhotoIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {item.title || "Untitled Partner"}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {item.textField || "—"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="break-all">
                  <span className="font-semibold text-gray-800">URL:</span>{" "}
                  {item.url || "—"}
                </p>
                {/* <p>
                  <span className="font-semibold text-gray-800">Property ID:</span>{" "}
                  {item.propertyId || "—"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Property Type ID:</span>{" "}
                  {item.propertyTypeId || "—"}
                </p> */}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => openEditModal(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(item)}
                  disabled={togglingId === item.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    item.isActive
                      ? "border border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                      : "border border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                  } disabled:opacity-60`}
                >
                  {togglingId === item.id ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : item.isActive ? (
                    <XCircleIcon className="w-4 h-4" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4" />
                  )}
                  {item.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            No booking partners found for this hotel.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? "Edit Booking Partner" : "Create Booking Partner"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Property ID: {propertyId} | Property Type ID: {propertyTypeId || "—"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                    // placeholder="Happy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Text Field
                  </label>
                  <input
                    type="text"
                    value={form.textField}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, textField: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                    // placeholder="RDCGFSDTvha"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  placeholder="https://www.google.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-5 items-start">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Partner Icon
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-600">
                    <PhotoIcon className="w-5 h-5" />
                    {uploading ? "Uploading..." : "Upload Icon"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleIconUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                  {/* <p className="mt-2 text-[11px] text-gray-400">
                    Upload uses `uploadMedia`; returned raw id is sent as `iconMediaId`.
                  </p> */}
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 h-36 overflow-hidden flex items-center justify-center">
                  {form.iconPreview ? (
                    <img
                      src={form.iconPreview}
                      alt="Partner icon preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <PhotoIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
              </div>

              {/* <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 space-y-1">
                <p>
                  <span className="font-semibold">iconMediaId:</span>{" "}
                  {form.iconMediaId || "Not uploaded yet"}
                </p>
                <p className="break-all">
                  <span className="font-semibold">Property:</span> {propertyId}
                </p>
                <p>
                  <span className="font-semibold">Property Type:</span>{" "}
                  {propertyTypeId || "—"}
                </p>
              </div> */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  {saving ? "Saving..." : editingItem ? "Update Partner" : "Create Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPartnersTab;
