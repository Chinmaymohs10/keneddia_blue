import React, { useState, useEffect, useCallback } from "react";
import {
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import {
  getAllGalleries,
  deleteGalleryById,
  getGalleryByPropertyId,
  updateGalleryMedia,
} from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import AddMediaModal from "../modals/AddMediaModal";

const GalleryTab = ({ propertyData }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  // Get property ID from propertyData
  const propId = propertyData?.id ?? propertyData?.propertyId;
  const fetchGallery = useCallback(async () => {
    if (!propId) {
      console.error("❌ Property ID is MISSING!");
      console.log("propertyData:", propertyData);
      showError("Property ID is missing");
      return;
    }

    setLoading(true);

    try {
      // Fetch gallery directly by propertyId
      const response = await getGalleryByPropertyId(propId);

      const rawData = response?.data?.data || response?.data || response;

      const items = rawData?.content || (Array.isArray(rawData) ? rawData : []);

      setGalleryItems(items);
      setTotalElements(items.length);
    } catch (error) {
      console.error("❌ Gallery fetch error:", error);
      showError("Failed to load gallery");
      setGalleryItems([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [propId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;
    setDeletingId(id);

    try {
      await deleteGalleryById(id);
      showSuccess("Media deleted successfully");

      // Refresh gallery after deletion
      await fetchGallery(currentPage);
    } catch (error) {
      console.error("❌ Delete error:", error);
      showError(error?.response?.data?.message || "Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter items based on active status
  const filteredItems = showDeleted
    ? galleryItems
    : galleryItems.filter((item) => item.isActive);
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Property Gallery</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {loading ? (
              <span className="flex items-center gap-2">
                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                Refreshing gallery...
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-bold text-blue-600">
                  {filteredItems.length}
                </span>{" "}
                of <span className="font-bold">{totalElements}</span> items
                {!showDeleted &&
                  galleryItems.length !== filteredItems.length && (
                    <span className="text-orange-600 ml-1">
                      ({galleryItems.length - filteredItems.length} inactive
                      hidden)
                    </span>
                  )}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Show/Hide Inactive Toggle */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showDeleted
                ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {showDeleted ? (
              <>
                <EyeIcon className="w-4 h-4" />
                Hide Inactive
              </>
            ) : (
              <>
                <EyeSlashIcon className="w-4 h-4" />
                Show Inactive
              </>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="List View"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg active:scale-95 transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <PlusIcon className="w-5 h-5" /> Upload Media
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading && galleryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <ArrowPathIcon className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-gray-400 font-medium">Loading gallery...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all shadow-sm hover:shadow-xl ${
                  !item.isActive
                    ? "opacity-60 grayscale border-red-300"
                    : "hover:border-blue-400"
                }`}
              >
                {/* Image */}
                <img
                  src={item.media?.url}
                  alt={item.category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Inactive Badge */}
                {!item.isActive && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase shadow-lg">
                    Inactive
                  </div>
                )}

                {/* Display Order Bar — always visible at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/65 backdrop-blur-sm px-2.5 py-1.5 flex items-center justify-between z-10">
                  <span className="text-[10px] text-gray-300 font-medium">
                    Order
                  </span>
                  <span className="text-xs font-bold text-white bg-white/20 border border-white/30 rounded px-2 py-0.5 min-w-[28px] text-center">
                    {item.displayOrder ?? "—"}
                  </span>
                </div>
                {/* Delete Button Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                  {/* ── EDIT ── */}
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-3 bg-white text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 shadow-xl"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  {/* ── DELETE ── */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-3 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === item.id ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <TrashIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 text-xs font-bold text-gray-600 uppercase border-b-2">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Property ID</th>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4 text-center">Display Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-3 text-xs font-mono text-gray-500">
                      {item.id}
                    </td>
                    <td className="px-6 py-3">
                      <img
                        src={item.media?.url}
                        className="w-20 h-14 object-cover rounded-lg border-2 border-gray-200 shadow-sm bg-gray-50"
                        alt={item.category}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-sm text-gray-700 uppercase tracking-tight bg-gray-100 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {item.propertyId}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-600 font-medium">
                      {item.media?.fileName || "Unknown"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                        {item.displayOrder ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wide ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === item.id ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <TrashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === item.id ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Empty State
        <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50/20 flex flex-col items-center">
          <PhotoIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-gray-900 font-bold text-lg">No Media Found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {showDeleted
              ? `No gallery items found for Property ID: ${propId}`
              : "No active media items. Toggle 'Show Inactive' to see all."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-md hover:shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <PlusIcon className="w-5 h-5" /> Upload First Media
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <AddMediaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          propertyData={propertyData}
          editingItem={editingItem}
          onSuccess={() => {
            fetchGallery(currentPage);
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default GalleryTab;
