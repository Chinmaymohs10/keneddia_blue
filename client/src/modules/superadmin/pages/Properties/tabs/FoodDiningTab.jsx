import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import {
  createDining,
  getAllDiningByPropertyId,
  GetAllPropertyDetails,
  getPropertyTypes,
  toggleDining,
  updateDining,
} from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";

const getBaseProperty = (item) => item?.propertyResponseDTO ?? item ?? {};

const getPrimaryListing = (item) => item?.propertyListingResponseDTOS?.[0] ?? {};

const normalizeDiningList = (response) => {
  const data = response?.data?.data || response?.data || response || [];
  return Array.isArray(data) ? data : [];
};

const FoodDiningTab = ({ propertyData }) => {
  const propertyId = propertyData?.id || propertyData?.propertyId;
  const propertyTypeName =
    propertyData?.propertyType || propertyData?.propertyTypes?.[0] || "";

  const [items, setItems] = useState([]);
  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    part1: "",
    part2: "",
    time: "",
    attachRestaurantId: "",
    isActive: true,
    imageFile: null,
    imagePreview: "",
  });

  const resetForm = useCallback(() => {
    setFormData({
      part1: "",
      part2: "",
      time: "",
      attachRestaurantId: "",
      isActive: true,
      imageFile: null,
      imagePreview: "",
    });
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      part1: item?.part1 || "",
      part2: item?.part2 || "",
      time: item?.time || "",
      attachRestaurantId: item?.attachRestaurantId ? String(item.attachRestaurantId) : "",
      isActive: item?.isActive ?? true,
      imageFile: null,
      imagePreview: item?.image?.url || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const fetchDiningItems = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    try {
      const response = await getAllDiningByPropertyId(propertyId);
      setItems(normalizeDiningList(response));
    } catch (error) {
      console.error("Dining Fetch Error:", error);
      showError("Failed to load dining data");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const fetchRestaurantProperties = useCallback(async () => {
    try {
      const response = await GetAllPropertyDetails();
      const allProperties = response?.data || response || [];
      const normalized = (Array.isArray(allProperties) ? allProperties : [])
        .map((item) => {
          const base = getBaseProperty(item);
          const listing = getPrimaryListing(item);

          return {
            id: base?.id,
            name:
              listing?.propertyName ||
              listing?.mainHeading ||
              base?.propertyName ||
              "Unnamed Restaurant",
            propertyTypes: base?.propertyTypes || [],
          };
        })
        .filter((item) =>
          item.id &&
          item.propertyTypes.some(
            (type) => String(type).trim().toLowerCase() === "restaurant",
          ),
        );

      setRestaurantOptions(normalized);
    } catch (error) {
      console.error("Restaurant Properties Fetch Error:", error);
      showError("Failed to load restaurant properties");
    }
  }, []);

  const fetchPropertyTypeOptions = useCallback(async () => {
    try {
      const response = await getPropertyTypes();
      const data = response?.data || response || [];
      setPropertyTypeOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Property Types Fetch Error:", error);
      showError("Failed to load property types");
    }
  }, []);

  useEffect(() => {
    fetchDiningItems();
    fetchRestaurantProperties();
    fetchPropertyTypeOptions();
  }, [fetchDiningItems, fetchRestaurantProperties, fetchPropertyTypeOptions]);

  const resolvedPropertyTypeId = useMemo(() => {
    const matchedType = propertyTypeOptions.find(
      (item) =>
        String(item?.typeName || "").trim().toLowerCase() ===
        String(propertyTypeName || "").trim().toLowerCase(),
    );

    return matchedType?.id ?? "";
  }, [propertyTypeName, propertyTypeOptions]);

  const buildPayload = (nextIsActive = formData.isActive) => {
    const payload = new FormData();
    payload.append("part1", formData.part1.trim());
    payload.append("part2", formData.part2.trim());
    payload.append("time", formData.time.trim());
    payload.append("propertyId", String(propertyId));
    payload.append("propertyTypeId", String(resolvedPropertyTypeId));
    payload.append("attachRestaurantId", String(formData.attachRestaurantId));
    payload.append("isActive", String(nextIsActive));

    if (formData.imageFile) {
      payload.append("image", formData.imageFile);
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyId) {
      showError("Property ID is missing");
      return;
    }

    if (!resolvedPropertyTypeId) {
      showError("Property type ID is missing");
      return;
    }

    if (!formData.attachRestaurantId) {
      showError("Please select a restaurant");
      return;
    }

    if (!editingItem && !formData.imageFile) {
      showError("Please upload a dining image");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();

      if (editingItem?.id) {
        await updateDining(editingItem.id, payload);
        showSuccess("Dining item updated successfully");
      } else {
        await createDining(payload);
        showSuccess("Dining item created successfully");
      }

      closeModal();
      await fetchDiningItems();
    } catch (error) {
      console.error("Dining Save Error:", error);
      showError(error?.response?.data?.message || "Failed to save dining item");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    if (!item?.id) return;

    setTogglingId(item.id);
    try {
      const payload = new FormData();
      payload.append("part1", item.part1 || "");
      payload.append("part2", item.part2 || "");
      payload.append("time", item.time || "");
      payload.append("propertyId", String(item.propertyId || propertyId));
      payload.append(
        "propertyTypeId",
        String(item.propertyTypeId || resolvedPropertyTypeId || ""),
      );
      payload.append(
        "attachRestaurantId",
        String(item.attachRestaurantId || ""),
      );
      payload.append("isActive", String(!(item.isActive ?? true)));

      await toggleDining(item.id, payload);
      showSuccess("Dining status updated successfully");
      await fetchDiningItems();
    } catch (error) {
      console.error("Dining Toggle Error:", error);
      showError(
        error?.response?.data?.message || "Failed to update dining status",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const activeRestaurantName = useMemo(() => {
    if (!formData.attachRestaurantId) return "";
    return (
      restaurantOptions.find(
        (item) => String(item.id) === String(formData.attachRestaurantId),
      )?.name || ""
    );
  }, [formData.attachRestaurantId, restaurantOptions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Food & Dining</h2>
          <p className="text-xs text-gray-500 font-medium">
            Manage dining highlights for this hotel.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" />
          Add Dining
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
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="h-44 bg-gray-100">
                {item.image?.url ? (
                  <img
                    src={item.image.url}
                    alt={item.part1 || "Dining"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <PhotoIcon className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {item.part1 || "Untitled Dining"}
                    </h3>
                    {item.part2 && (
                      <p className="text-sm text-gray-500 mt-1">{item.part2}</p>
                    )}
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

                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-800">Time:</span>{" "}
                    {item.time || "—"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Restaurant:
                    </span>{" "}
                    {item.attachRestaurantName || "—"}
                  </p>
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
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            No dining entries found for this hotel.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? "Edit Dining Entry" : "Create Dining Entry"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Property ID: {propertyId}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Part 1
                  </label>
                  <input
                    type="text"
                    value={formData.part1}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, part1: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                    placeholder="Delux Dining"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Part 2
                  </label>
                  <input
                    type="text"
                    value={formData.part2}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, part2: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                    placeholder="BalconyExperience"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Time
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, time: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                    placeholder="7 PM - 11 PM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Attach Restaurant
                  </label>
                  <select
                    value={formData.attachRestaurantId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        attachRestaurantId: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  >
                    <option value="">Select restaurant</option>
                    {restaurantOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeRestaurantName && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Selected restaurant:{" "}
                  <span className="font-semibold">{activeRestaurantName}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-end">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData((prev) => ({
                        ...prev,
                        imageFile: file,
                        imagePreview: file ? URL.createObjectURL(file) : prev.imagePreview,
                      }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                  />
                </div>

                <label className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Active
                  </span>
                </label>
              </div>

              {formData.imagePreview && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={formData.imagePreview}
                    alt="Dining preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}

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
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  {saving ? "Saving..." : editingItem ? "Update Dining" : "Create Dining"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDiningTab;
