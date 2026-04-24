import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  PhotoIcon,
  TrashIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { colors } from "@/lib/colors/colors";
import {
  addRoomToProperty,
  getAllRoomTypes,
  getAllAmenityFeatures,
  updateRoomAmenityHighlight,
  updateRoomById,
  uploadHeroMediaBulk,
} from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

const AddRoomModal = ({
  isOpen,
  onClose,
  propertyData,
  initialData,
  onSuccess,
}) => {
  const propId = propertyData?.id || propertyData?.propertyId;

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomTypeId: "",
    roomName: "",
    description: "",
    basePrice: "",
    discount: "",
    maxOccupancy: 2,
    roomSize: "",
    roomSizeUnit: "SQ_FT",
    floorNumber: 1,
    status: "AVAILABLE",
    bookable: true,
    active: true,
    displayOrder: "",
    amenitiesAndFeaturesIds: [],
    mediaIds: [],
  });

  const [amenities, setAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [togglingHighlightId, setTogglingHighlightId] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Media Upload State ───────────────────────────────────────────────────
  const [mediaFiles, setMediaFiles] = useState([]); // { file, preview, status: 'pending'|'uploading'|'done'|'error', mediaId, url, fileName }
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Room Status Options
  const roomStatuses = [
    { value: "AVAILABLE", label: "Available" },
    { value: "OCCUPIED", label: "Occupied" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "MAINTENANCE", label: "Maintenance" },
  ];

  // Room Size Units
  const sizeUnits = [
    { value: "SQ_FT", label: "Square Feet" },
    { value: "SQ_M", label: "Square Meters" },
  ];

  const resolveRoomTypeId = (room, availableRoomTypes = []) => {
    if (room?.roomTypeId != null) {
      return String(room.roomTypeId);
    }

    const roomTypeName = String(
      room?.roomTypeName || room?.roomType || "",
    ).trim().toLowerCase();

    if (!roomTypeName) return "";

    const matchedRoomType = availableRoomTypes.find(
      (item) => String(item.label || item.value || "").trim().toLowerCase() === roomTypeName,
    );

    return matchedRoomType?.id != null ? String(matchedRoomType.id) : "";
  };

  useEffect(() => {
    if (isOpen) {
      fetchAmenities();
      fetchRoomTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const existingAmenityIds =
          initialData.amenitiesAndFeatures?.map((a) => a.id) ||
          initialData.amenitiesAndFeaturesIds ||
          [];

        const existingMediaIds =
          initialData.media?.map((m) => m.mediaId) ||
          initialData.mediaIds ||
          [];

        setFormData({
          roomNumber: initialData.roomNumber || "",
          roomTypeId: resolveRoomTypeId(initialData),
          roomName: initialData.roomName || "",
          description: initialData.description || "",
          basePrice: initialData.basePrice || "",
          discount: initialData.discount ?? "",
          maxOccupancy: initialData.maxOccupancy || 2,
          roomSize: initialData.roomSize || "",
          roomSizeUnit: initialData.roomSizeUnit || "SQ_FT",
          floorNumber: initialData.floorNumber || 1,
          status: initialData.status || "AVAILABLE",
          bookable: initialData.bookable ?? true,
          active: initialData.active ?? true,
          displayOrder: initialData.displayOrder ?? "",
          amenitiesAndFeaturesIds: existingAmenityIds,
          mediaIds: existingMediaIds,
        });

        // Prefill already-uploaded media previews (edit mode)
        if (initialData.media && Array.isArray(initialData.media)) {
          const prefilled = initialData.media.map((m) => ({
            file: null,
            preview: m.url,
            status: "done",
            mediaId: m.mediaId,
            url: m.url,
            fileName: m.fileName,
          }));
          setMediaFiles(prefilled);
        } else {
          setMediaFiles([]);
        }
      } else {
        setFormData({
          roomNumber: "",
          roomTypeId: "",
          roomName: "",
          description: "",
          basePrice: "",
          discount: "",
          maxOccupancy: 2,
          roomSize: "",
          roomSizeUnit: "SQ_FT",
          floorNumber: 1,
          status: "AVAILABLE",
          bookable: true,
          active: true,
          displayOrder: "",
          amenitiesAndFeaturesIds: [],
          mediaIds: [],
        });
        setMediaFiles([]);
      }
    }
  }, [isOpen, initialData]);

  const fetchAmenities = async () => {
    setLoadingAmenities(true);
    try {
      const response = await getAllAmenityFeatures();
      const amenitiesData =
        response?.data?.data || response?.data || response || [];
      const normalizedAmenities = Array.isArray(amenitiesData) ? amenitiesData : [];

      if (initialData?.amenitiesAndFeatures?.length) {
        const roomAmenityMap = new Map(
          initialData.amenitiesAndFeatures.map((amenity) => [amenity.id, amenity]),
        );

        setAmenities(
          normalizedAmenities.map((amenity) => {
            const roomAmenity = roomAmenityMap.get(amenity.id);

            return roomAmenity
              ? { ...amenity, showHighlight: roomAmenity.showHighlight ?? false }
              : { ...amenity, showHighlight: false };
          }),
        );
      } else {
        setAmenities(
          normalizedAmenities.map((amenity) => ({
            ...amenity,
            showHighlight: false,
          })),
        );
      }
    } catch (error) {
      showError("Failed to load amenities");
    } finally {
      setLoadingAmenities(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData((prev) => {
      const currentIds = prev.amenitiesAndFeaturesIds;
      const isSelected = currentIds.includes(amenityId);
      return {
        ...prev,
        amenitiesAndFeaturesIds: isSelected
          ? currentIds.filter((id) => id !== amenityId)
          : [...currentIds, amenityId],
      };
    });
  };

  const fetchRoomTypes = async () => {
    setLoadingRoomTypes(true);
    try {
      const response = await getAllRoomTypes();
      const roomTypesData = response?.data?.data || response?.data || response || [];
      const normalizedRoomTypes = (Array.isArray(roomTypesData) ? roomTypesData : [])
        .filter((item) => item?.name)
        .map((item) => ({
          id: item.id,
          value: String(item.id),
          label: item.name,
          active: item.active ?? true,
        }));

      setRoomTypes(normalizedRoomTypes);
      setFormData((prev) => {
        const resolvedRoomTypeId = initialData
          ? resolveRoomTypeId(initialData, normalizedRoomTypes)
          : "";

        return {
          ...prev,
          roomTypeId:
            prev.roomTypeId ||
            resolvedRoomTypeId ||
            (normalizedRoomTypes[0]?.value ?? ""),
        };
      });
    } catch (error) {
      showError("Failed to load room types");
      setRoomTypes([]);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  const handleAmenityHighlightToggle = async (e, amenity) => {
    e.stopPropagation();

    if (!amenity?.id) return;

    const nextValue = !amenity.showHighlight;

    if (nextValue) {
      const existingHighlightedAmenity = amenities.find(
        (item) => item.id !== amenity.id && item.showHighlight,
      );

      if (existingHighlightedAmenity) {
        showError("You can add only one highlight in room");
        return;
      }
    }

    if (!initialData?.roomId) {
      setAmenities((prev) =>
        prev.map((item) =>
          item.id === amenity.id
            ? { ...item, showHighlight: nextValue }
            : item,
        ),
      );
      return;
    }

    setTogglingHighlightId(amenity.id);

    try {
      await updateRoomAmenityHighlight(initialData.roomId, amenity.id, nextValue);
      setAmenities((prev) =>
        prev.map((item) =>
          item.id === amenity.id
            ? { ...item, showHighlight: nextValue }
            : item,
        ),
      );
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to update highlight");
    } finally {
      setTogglingHighlightId(null);
    }
  };

  const incrementValue = (field) => {
    setFormData((prev) => ({ ...prev, [field]: (prev[field] || 0) + 1 }));
  };

  const decrementValue = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(1, (prev[field] || 0) - 1),
    }));
  };

  // ─── Media Upload Handlers ────────────────────────────────────────────────

  const createPreview = (file) => URL.createObjectURL(file);

  const addFilesToQueue = (files) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!imageFiles.length) {
      showError("Only image files are accepted");
      return;
    }
    const newEntries = imageFiles.map((file) => ({
      file,
      preview: createPreview(file),
      status: "pending",
      mediaId: null,
      url: null,
      fileName: file.name,
    }));
    setMediaFiles((prev) => [...prev, ...newEntries]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) {
      addFilesToQueue(e.target.files);
      e.target.value = ""; // reset so same file can be re-selected
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const uploadPendingFiles = async () => {
    const pending = mediaFiles.filter((f) => f.status === "pending");
    if (!pending.length) return;

    // Mark all pending as uploading
    setMediaFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" } : f,
      ),
    );

    // Build FormData with all pending files
    const fd = new FormData();
    pending.forEach((entry) => fd.append("files", entry.file));
    fd.append("mediaType", "IMAGE");

    try {
      // uploadHeroMediaBulk returns an array like:
      // [{ mediaId, type, url, fileName, alt, width, height }]
      const response = await uploadHeroMediaBulk(fd);
      const uploaded = response?.data || response || [];

      // Match results back by fileName order (API returns in same order)
      const uploadedArr = Array.isArray(uploaded) ? uploaded : [];

      setMediaFiles((prev) => {
        let uploadIndex = 0;
        return prev.map((f) => {
          if (f.status === "uploading") {
            const result = uploadedArr[uploadIndex++];
            if (result) {
              return {
                ...f,
                status: "done",
                mediaId: result.mediaId,
                url: result.url,
                fileName: result.fileName,
              };
            }
            return { ...f, status: "error" };
          }
          return f;
        });
      });

      // Collect all done mediaIds and update formData
      setMediaFiles((prev) => {
        const doneIds = prev
          .filter((f) => f.status === "done" && f.mediaId)
          .map((f) => f.mediaId);
        setFormData((fd_prev) => ({ ...fd_prev, mediaIds: doneIds }));
        return prev;
      });

      showSuccess(`${uploadedArr.length} image(s) uploaded successfully`);
    } catch (error) {
      showError(error?.response?.data?.message || "Media upload failed");
      // Mark uploading back to error
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading" ? { ...f, status: "error" } : f,
        ),
      );
    }
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      const doneIds = updated
        .filter((f) => f.status === "done" && f.mediaId)
        .map((f) => f.mediaId);
      setFormData((fd_prev) => ({ ...fd_prev, mediaIds: doneIds }));
      return updated;
    });
  };

  const retryUpload = async (index) => {
    const entry = mediaFiles[index];
    if (!entry?.file) return;

    setMediaFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "uploading" } : f)),
    );

    const fd = new FormData();
    fd.append("files", entry.file);
    fd.append("mediaType", "IMAGE");

    try {
      const response = await uploadHeroMediaBulk(fd);
      const uploaded = response?.data || response || [];
      const result = Array.isArray(uploaded) ? uploaded[0] : null;

      setMediaFiles((prev) => {
        const updated = prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: result ? "done" : "error",
                mediaId: result?.mediaId || null,
                url: result?.url || null,
                fileName: result?.fileName || f.fileName,
              }
            : f,
        );
        const doneIds = updated
          .filter((f) => f.status === "done" && f.mediaId)
          .map((f) => f.mediaId);
        setFormData((fd_prev) => ({ ...fd_prev, mediaIds: doneIds }));
        return updated;
      });
    } catch {
      setMediaFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error" } : f)),
      );
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propId) {
      showError("Property ID is missing");
      return;
    }

    // Auto-upload any pending files before submitting
    const pending = mediaFiles.filter((f) => f.status === "pending");
    if (pending.length > 0) {
      showError("Please upload pending images before saving the room");
      return;
    }

    if (!formData.roomTypeId) {
      showError("Please select a room type");
      return;
    }

    setSubmitting(true);

    try {
      const amenitiesPayload = formData.amenitiesAndFeaturesIds.map((amenityId) => {
        const amenity = amenities.find((item) => item.id === amenityId);

        return {
          amenityId,
          showHighlight: amenity?.showHighlight ?? false,
        };
      });

      const { amenitiesAndFeaturesIds, ...restFormData } = formData;
      const payload = {
        ...restFormData,
        basePrice: parseFloat(formData.basePrice),
        discount:
          formData.discount === "" ? null : parseFloat(formData.discount),
        maxOccupancy: parseInt(formData.maxOccupancy),
        roomSize: formData.roomSize ? parseFloat(formData.roomSize) : null,
        floorNumber: parseInt(formData.floorNumber),
        roomTypeId: parseInt(formData.roomTypeId),
        displayOrder:
          formData.displayOrder === "" ? null : parseInt(formData.displayOrder),
        amenities: amenitiesPayload,
        mediaIds: formData.mediaIds,
      };

      let response;
      if (initialData?.roomId) {
        response = await updateRoomById(initialData.roomId, payload);
        showSuccess("Room updated successfully");
      } else {
        response = await addRoomToProperty(propId, payload);
        showSuccess("Room added successfully");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Room Submission Error:", error);
      showError(error?.response?.data?.message || "Failed to save room");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const hasPending = mediaFiles.some((f) => f.status === "pending");
  const hasUploading = mediaFiles.some((f) => f.status === "uploading");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {initialData ? "Update Room Details" : "Create New Room"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Property ID: {propId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Section: Basic Info */}
            <section>
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                <span className="w-8 h-[2px] bg-blue-600"></span> Basic
                Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="e.g. 101-A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Room Type *
                  </label>
                  <select
                    name="roomTypeId"
                    value={formData.roomTypeId}
                    onChange={handleChange}
                    disabled={loadingRoomTypes}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  >
                    {loadingRoomTypes ? (
                      <option value="">Loading room types...</option>
                    ) : roomTypes.length > 0 ? (
                      roomTypes.map((t) => (
                        <option key={t.id ?? t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))
                    ) : (
                      <option value="">No room types available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    placeholder="e.g. Deluxe Garden View"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-none"
                    placeholder="Briefly describe the room features..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleNumberChange}
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    placeholder="Blank means no order"
                  />
                </div>
              </div>
            </section>

            {/* Section: Pricing & Capacity */}
            <section>
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                <span className="w-8 h-[2px] bg-blue-600"></span> Pricing &
                Capacity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Base Price (Per Night) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleNumberChange}
                      required
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Max Occupancy *
                  </label>
                  <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => decrementValue("maxOccupancy")}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-red-500 transition-colors"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="flex-1 text-center font-bold text-gray-700">
                      {formData.maxOccupancy} Persons
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementValue("maxOccupancy")}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-blue-500 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Room Size
                  </label>
                  <input
                    type="number"
                    name="roomSize"
                    value={formData.roomSize}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    placeholder="e.g. 420"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Room Size Unit
                  </label>
                  <select
                    name="roomSizeUnit"
                    value={formData.roomSizeUnit}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  >
                    {sizeUnits.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                    placeholder="e.g. 1"
                  />
                </div>
              </div>
            </section>

            {/* ─── Section: Room Media ─────────────────────────────────────── */}
            <section>
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                <span className="w-8 h-[2px] bg-blue-600"></span> Room Photos
              </h4>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-8 px-4
                  ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 scale-[1.01]"
                      : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                  }`}
              >
                <CloudArrowUpIcon
                  className={`w-10 h-10 transition-colors ${isDragging ? "text-blue-500" : "text-gray-300"}`}
                />
                <p className="text-sm font-bold text-gray-500">
                  {isDragging
                    ? "Drop images here"
                    : "Drag & drop room photos or click to browse"}
                </p>
                <p className="text-xs text-gray-400">
                  Supports JPG, PNG, WEBP — multiple files allowed
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Image Preview Grid */}
              {mediaFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaFiles.map((entry, idx) => (
                    <div
                      key={entry.mediaId || idx}
                      className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square bg-gray-50"
                    >
                      {/* Preview Image */}
                      <img
                        src={entry.preview}
                        alt={entry.fileName}
                        className="w-full h-full object-cover"
                      />

                      {/* Status Overlay */}
                      {entry.status === "uploading" && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                          <ArrowPathIcon className="w-6 h-6 text-white animate-spin" />
                          <span className="text-white text-xs font-bold">
                            Uploading...
                          </span>
                        </div>
                      )}

                      {entry.status === "done" && (
                        <div className="absolute top-1.5 left-1.5">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 drop-shadow" />
                        </div>
                      )}

                      {entry.status === "error" && (
                        <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center gap-1">
                          <span className="text-white text-xs font-bold text-center px-2">
                            Upload Failed
                          </span>
                          {entry.file && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                retryUpload(idx);
                              }}
                              className="flex items-center gap-1 text-xs bg-white text-red-600 px-2 py-1 rounded-full font-bold hover:bg-red-50 transition-colors"
                            >
                              <ArrowPathIcon className="w-3 h-3" /> Retry
                            </button>
                          )}
                        </div>
                      )}

                      {entry.status === "pending" && (
                        <div className="absolute bottom-1.5 left-1.5">
                          <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            Pending
                          </span>
                        </div>
                      )}

                      {/* Remove button — always visible on hover */}
                      {entry.status !== "uploading" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMedia(idx);
                          }}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-1 shadow hover:bg-red-50"
                        >
                          <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      )}

                      {/* File name tooltip */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-white text-[10px] truncate">
                          {entry.fileName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button — shown when there are pending files */}
              {hasPending && (
                <button
                  type="button"
                  onClick={uploadPendingFiles}
                  disabled={hasUploading}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  {hasUploading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4" />
                      Upload{" "}
                      {
                        mediaFiles.filter((f) => f.status === "pending").length
                      }{" "}
                      Image
                      {mediaFiles.filter((f) => f.status === "pending").length >
                      1
                        ? "s"
                        : ""}
                    </>
                  )}
                </button>
              )}

              {/* Upload summary */}
              {mediaFiles.length > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  {mediaFiles.filter((f) => f.status === "done").length}{" "}
                  uploaded
                  {hasPending
                    ? `, ${mediaFiles.filter((f) => f.status === "pending").length} pending`
                    : ""}
                  {mediaFiles.filter((f) => f.status === "error").length > 0
                    ? `, ${mediaFiles.filter((f) => f.status === "error").length} failed`
                    : ""}
                </p>
              )}
            </section>

            {/* Amenities Selector */}
            <section>
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                <span className="w-8 h-[2px] bg-blue-600"></span> Amenities &
                Features
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenities.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                      formData.amenitiesAndFeaturesIds.includes(amenity.id)
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 text-gray-600"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold truncate">
                        {amenity.name || amenity.featureName}
                      </span>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                          Highlight
                        </span>
                        <span
                          onClick={(e) => handleAmenityHighlightToggle(e, amenity)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            amenity.showHighlight ? "bg-amber-500" : "bg-gray-300"
                          } ${togglingHighlightId === amenity.id ? "opacity-60" : ""}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              amenity.showHighlight ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </span>
                        {amenity.showHighlight && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                            On
                          </span>
                        )}
                      </div>
                    </div>
                    {formData.amenitiesAndFeaturesIds.includes(amenity.id) && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Toggle Settings */}
            <div className="flex flex-wrap gap-8 py-4 px-6 bg-gray-50 rounded-2xl">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.bookable ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <input
                    type="checkbox"
                    name="bookable"
                    checked={formData.bookable}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.bookable ? "translate-x-7" : "translate-x-1"}`}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  Open for Booking
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.active ? "translate-x-7" : "translate-x-1"}`}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  Active Status
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 p-6 bg-white border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || hasUploading}
              className="px-10 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : initialData ? (
                "Update Room"
              ) : (
                "Create Room"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;

