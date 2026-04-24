import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  XCircleIcon,
  PencilIcon,
  PlusIcon,
  CheckIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import { uploadGalleryMedia, updateGalleryMedia } from "@/Api/Api";
import {
  createGalleryDropdown,
  getAllGalleryDropdown,
  updateGalleryDropdown,
  toggleGalleryDropdownStatus,
  getAllVerticalCards,
} from "@/Api/RestaurantApi";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

const unwrap = (res) => (Array.isArray(res) ? res : (res?.data ?? []));

// ============================================================================
// CATEGORY MANAGER
// ============================================================================
const CategoryManager = ({ onClose, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const inputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllGalleryDropdown();
      setCategories(unwrap(res));
    } catch {
      showError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await createGalleryDropdown({ name, isActive: true });
      showSuccess(`Category "${name}" created`);
      setNewName("");
      await load();
      onCategoryChange();
    } catch {
      showError("Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (id) => {
    const name = editName.trim();
    if (!name) return;
    setSavingId(id);
    try {
      await updateGalleryDropdown(id, { name });
      showSuccess("Category updated");
      setEditId(null);
      await load();
      onCategoryChange();
    } catch {
      showError("Failed to update category");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggle = async (cat) => {
    setTogglingId(cat.id);
    try {
      await toggleGalleryDropdownStatus(cat.id, !cat.isActive);
      showSuccess(
        `Category "${cat.name}" ${!cat.isActive ? "enabled" : "disabled"}`,
      );
      await load();
      onCategoryChange();
    } catch {
      showError("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-base font-semibold text-gray-900">
            Manage Categories
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New category name…"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            disabled={creating}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            {creating ? <Spinner /> : <PlusIcon className="w-4 h-4" />}
            Add
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="w-6 h-6 text-gray-400" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            No categories yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${cat.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}
              >
                {editId === cat.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(cat.id);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 text-sm rounded border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      disabled={savingId === cat.id}
                      className="p-1.5 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                    >
                      {savingId === cat.id ? (
                        <Spinner className="w-3.5 h-3.5" />
                      ) : (
                        <CheckIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="p-1.5 text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}
                    >
                      {cat.isActive ? "Active" : "Disabled"}
                    </span>
                    <button
                      onClick={() => {
                        setEditId(cat.id);
                        setEditName(cat.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggle(cat)}
                      disabled={togglingId === cat.id}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${cat.isActive ? "bg-green-500" : "bg-gray-300"} ${togglingId === cat.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                      title={cat.isActive ? "Disable" : "Enable"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${cat.isActive ? "translate-x-4" : "translate-x-0"}`}
                      />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-5 py-3 border-t bg-gray-50 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SPINNER
// ============================================================================
const Spinner = ({ className = "w-4 h-4" }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============================================================================
// MAIN MODAL  —  supports both upload (editingItem=null) and edit (editingItem=GalleryItem)
// ============================================================================
const AddMediaModal = ({
  isOpen,
  onClose,
  propertyData,
  onSuccess,
  editingItem = null,
}) => {
  const isEditMode = !!editingItem;

  // ── upload state (only used in create mode) ───────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [previews, setPreviews] = useState([]);

  // ── edit state (only used in edit mode) ───────────────────────────────────
  const [editDisplayOrder, setEditDisplayOrder] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [editPreviewObjectUrl, setEditPreviewObjectUrl] = useState("");

  // ── shared ────────────────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const propId = propertyData?.id || propertyData?.propertyId;

  const [verticals, setVerticals] = useState([]);
  const [verticalId, setVerticalId] = useState("");

  const isRestaurant =
    propertyData?.propertyType === "Restaurant" ||
    propertyData?.propertyTypes?.includes("Restaurant");

  const loadVerticals = async () => {
    if (!isRestaurant || !propId) return;
    try {
      const res = await getAllVerticalCards();
      const all = res?.data?.data ?? res?.data ?? [];
      setVerticals(
        (Array.isArray(all) ? all : []).filter(
          (v) =>
            Number(v.propertyId) === Number(propId) && v.isActive !== false,
        ),
      );
    } catch {
      showError("Failed to load verticals");
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getAllGalleryDropdown();
      const all = unwrap(res);
      const active = all.filter((c) => c.isActive);
      setCategories(active);
      setCategoryId((prev) => (active.find((c) => c.id === prev) ? prev : ""));
    } catch {
      showError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Hydrate when opening
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadVerticals();
      if (isEditMode) {
        setCategoryId(editingItem.categoryId ?? "");
        setVerticalId(
          editingItem.vertical?.id
            ? String(editingItem.vertical.id)
            : editingItem.verticalId
              ? String(editingItem.verticalId)
              : "",
        );
        setEditDisplayOrder(editingItem.displayOrder ?? "");
        setEditPreview(editingItem.media?.url ?? "");
        setEditFile(null);
      }
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setPreviews([]);
      setDisplayOrders([]);
      setEditFile(null);
      setEditPreview("");
      setEditPreviewObjectUrl("");
      setEditDisplayOrder("");
      setShowCategoryManager(false);
      setVerticalId("");
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (editPreviewObjectUrl) URL.revokeObjectURL(editPreviewObjectUrl);
    };
  }, [editPreviewObjectUrl]);

  // Preview URLs for create mode
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  // ── Create mode: file selection ───────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const valid = files.filter((f) => {
      // const ext = f.name.split(".").pop()?.toLowerCase();

      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const heicMimes = [
        "image/heic",
        "image/heif",
        "image/heic-sequence",
        "image/heif-sequence",
      ];
      const isImage =
        f.type.startsWith("image/") ||
        heicMimes.includes(f.type) ||
        ext === "heic" ||
        ext === "heif";

      const isVideo = f.type.startsWith("video/");

      return isImage || isVideo;
    });
    if (valid.length !== files.length)
      showError("Some files were skipped. Only images and videos are allowed.");
    setSelectedFiles((prev) => {
      const updated = [...prev, ...valid];
      setDisplayOrders((prevOrders) => [
        ...prevOrders,
        ...valid.map((_, i) => prevOrders.length + prev.length + i + 1),
      ]);
      return updated;
    });
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setDisplayOrders((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Edit mode: replacement file ───────────────────────────────────────────
  const handleEditFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const heicMimes = [
      "image/heic",
      "image/heif",
      "image/heic-sequence",
      "image/heif-sequence",
    ];
    const isImage =
      file.type.startsWith("image/") ||
      heicMimes.includes(file.type) ||
      ext === "heic" ||
      ext === "heif";

    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      showError("Only images and videos are allowed.");
      return;
    }
    if (editPreviewObjectUrl) URL.revokeObjectURL(editPreviewObjectUrl);
    const nextPreviewUrl = URL.createObjectURL(file);
    setEditFile(file);
    setEditPreview(nextPreviewUrl);
    setEditPreviewObjectUrl(nextPreviewUrl);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      // ── EDIT ──
      setUploading(true);
      try {
        const formData = new FormData();

        if (categoryId) formData.append("categoryId", categoryId.toString());

        formData.append("propertyId", propId.toString());

        if (isRestaurant && verticalId)
          formData.append("verticalId", verticalId.toString());

        if (editDisplayOrder !== "")
          formData.append("displayOrder", editDisplayOrder.toString());

        if (editFile) formData.append("file", editFile);

        await updateGalleryMedia(editingItem.id, formData);
        showSuccess("Media updated successfully");
        onSuccess?.();
        onClose();
      } catch (error) {
        showError(error?.response?.data?.message || "Failed to update media");
      } finally {
        setUploading(false);
      }
    } else {
      // ── CREATE ──
      if (!propId) return showError("Property ID is missing");
      if (!selectedFiles.length)
        return showError("Please select at least one file");

      setUploading(true);
      try {
        const formData = new FormData();
        selectedFiles.forEach((f) => formData.append("files", f));
        if (categoryId) formData.append("categoryId", categoryId.toString());
        formData.append("propertyId", propId.toString());
        if (isRestaurant && verticalId)
          formData.append("verticalId", verticalId.toString());
        selectedFiles.forEach((_, i) =>
          formData.append("displayOrders", displayOrders[i] ?? i + 1),
        );

        await uploadGalleryMedia(formData);
        showSuccess(`Successfully uploaded ${selectedFiles.length} file(s)`);
        onSuccess?.();
        onClose();
      } catch (error) {
        showError(error?.response?.data?.message || "Failed to upload media");
      } finally {
        setUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  const isSubmitDisabled =
    uploading || categoriesLoading || (!isEditMode && !selectedFiles.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`flex gap-3 w-full max-w-4xl transition-all duration-300`}
      >
        {/* ── MAIN PANEL ── */}
        <div
          className={`bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300 ${showCategoryManager ? "w-[55%]" : "w-full max-w-2xl mx-auto"}`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? "Edit Gallery Media" : "Upload Gallery Media"}
            </h3>
            <button
              onClick={onClose}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto flex flex-col"
          >
            <div className="p-6 space-y-6 flex-1">
              {/* Category row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  {categoriesLoading ? (
                    <div className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 flex items-center gap-2 text-sm text-gray-400">
                      <Spinner /> Loading…
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="flex-1 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-sm text-red-500">
                      No active categories — add one using the button →
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) =>
                        setCategoryId(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      disabled={uploading}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                    >
                      <option value="">Select Category</option>

                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCategoryManager((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${showCategoryManager ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                  >
                    <TagIcon className="w-3.5 h-3.5" />
                    {showCategoryManager ? "Hide" : "Manage"}
                  </button>
                </div>
              </div>
              {isRestaurant && verticals.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vertical
                  </label>
                  <select
                    value={verticalId}
                    onChange={(e) => setVerticalId(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                  >
                    <option value="">Select Vertical…</option>
                    {verticals.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.verticalName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isEditMode ? (
                /* ── EDIT MODE BODY ── */
                <>
                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editDisplayOrder}
                      onChange={(e) =>
                        setEditDisplayOrder(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      disabled={uploading}
                      className="w-32 px-3 py-2 text-sm rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="e.g. 1"
                    />
                  </div>

                  {/* Current / replacement media */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media{" "}
                      {editFile ? (
                        <span className="text-blue-600 text-xs font-normal ml-1">
                          (new file selected)
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs font-normal ml-1">
                          (leave unchanged to keep current)
                        </span>
                      )}
                    </label>

                    {/* Preview */}
                    {editPreview && (
                      <div
                        className="relative mb-3 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100"
                        style={{ aspectRatio: "16/9", maxHeight: 260 }}
                      >
                        {editFile?.type?.startsWith("video/") ||
                        (!editFile && editingItem?.media?.type === "VIDEO") ? (
                          <video
                            src={editPreview}
                            className="w-full h-full object-cover"
                            muted
                            controls
                          />
                        ) : (
                          <img
                            src={editPreview}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {editFile && (
                          <button
                            type="button"
                            onClick={() => {
                              if (editPreviewObjectUrl)
                                URL.revokeObjectURL(editPreviewObjectUrl);
                              setEditFile(null);
                              setEditPreviewObjectUrl("");
                              setEditPreview(editingItem?.media?.url ?? "");
                            }}
                            disabled={uploading}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Replace file button */}
                    <label
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <PhotoIcon className="w-4 h-4 text-gray-400" />
                      Replace Media (optional)
                      <input
                        type="file"
                        accept="image/*,image/heic,image/heif,video/*"
                        className="hidden"
                        onChange={handleEditFileSelect}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </>
              ) : (
                /* ── CREATE MODE BODY ── */
                <>
                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Files <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*,image/heic,image/heif,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500">
                          Images and videos (Multiple files supported)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Previews */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Selected Files ({selectedFiles.length})
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedFiles.map((file, index) => {
                          const ext =
                            file.name.split(".").pop()?.toLowerCase() ?? "";
                          const isHeic =
                            ext === "heic" ||
                            ext === "heif" ||
                            file.type === "image/heic" ||
                            file.type === "image/heif" ||
                            file.type === "image/heic-sequence" ||
                            file.type === "image/heif-sequence";
                          const isVideo = file.type.startsWith("video/");
                          const isImage =
                            !isVideo &&
                            !isHeic &&
                            file.type.startsWith("image/");

                          return (
                            <div
                              key={index}
                              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100"
                            >
                              {isImage ? (
                                <img
                                  src={previews[index]}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : isHeic ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                                  <PhotoIcon className="w-10 h-10 text-gray-400" />
                                  <span className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                                    HEIC
                                  </span>
                                  <span className="text-[10px] text-gray-400 mt-0.5">
                                    Preview unavailable
                                  </span>
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                                  <svg
                                    className="w-12 h-12 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                  <span className="text-xs text-gray-500 mt-2">
                                    Video
                                  </span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                disabled={uploading}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>

                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1.5 flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-300 shrink-0">
                                  Order
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  value={displayOrders[index] ?? ""}
                                  onChange={(e) =>
                                    setDisplayOrders((prev) => {
                                      const u = [...prev];
                                      u[index] =
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value);
                                      return u;
                                    })
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={uploading}
                                  className="w-12 px-1 py-0.5 text-xs text-center bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:bg-white/30 disabled:opacity-50"
                                />
                                <span className="text-[10px] text-gray-400 truncate flex-1 text-right">
                                  {file.name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                {uploading ? (
                  <>
                    <Spinner /> {isEditMode ? "Saving…" : "Uploading…"}
                  </>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  `Upload ${selectedFiles.length} file(s)`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Category Manager Panel */}
        {showCategoryManager && (
          <div className="w-[45%] bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-right-4 duration-200">
            <CategoryManager
              onClose={() => setShowCategoryManager(false)}
              onCategoryChange={loadCategories}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMediaModal;
