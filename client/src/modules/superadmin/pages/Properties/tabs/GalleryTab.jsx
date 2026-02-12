import React, { useState, useEffect, useCallback } from "react";
import { 
  TrashIcon, 
  PlusIcon, 
  PhotoIcon, 
  ArrowPathIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import { getAllGalleries, deleteGalleryById } from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import AddMediaModal from "../modals/AddMediaModal";

const GalleryTab = ({ propertyData }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Get property ID from propertyData
  const propId = propertyData?.id || propertyData?.propertyId;
  const fetchGallery = useCallback(async (page = 0) => {
    if (!propId) {
      console.error("❌ Property ID is MISSING!");
      console.log("propertyData:", propertyData);
      showError("Property ID is missing");
      return;
    }
    setLoading(true);
    
    try {
      // Fetch all galleries with pagination
      const response = await getAllGalleries({ page, size: 50 });
      // Extract data from response
      const rawData = response?.data?.data || response?.data || response;
      const allItems = rawData?.content || (Array.isArray(rawData) ? rawData : []);
      allItems.slice(0, 3).forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          id: item.id,
          propertyId: item.propertyId,
          propertyIdType: typeof item.propertyId,
          category: item.category,
          propertyName: item.propertyName
        });
      });
      const propertyGallery = allItems.filter(item => {
        const itemPropId = item.propertyId;
        const numericPropId = Number(propId);
        const numericItemPropId = Number(itemPropId);
        
        const matches = numericItemPropId === numericPropId;
        return matches;
      });

      setGalleryItems(propertyGallery);
      setTotalElements(propertyGallery.length);
    } catch (error) {
      showError("Failed to load gallery");
      setGalleryItems([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [propId, propertyData]);

  // Initial fetch
  useEffect(() => {
    fetchGallery(currentPage);
  }, [fetchGallery, currentPage]);

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
    : galleryItems.filter(item => item.isActive);
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
                Showing <span className="font-bold text-blue-600">{filteredItems.length}</span> of{" "}
                <span className="font-bold">{totalElements}</span> items
                {!showDeleted && galleryItems.length !== filteredItems.length && (
                  <span className="text-orange-600 ml-1">
                    ({galleryItems.length - filteredItems.length} inactive hidden)
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
                
                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-lg">
                    {item.category}
                  </span>
                </div>

                {/* Inactive Badge */}
                {!item.isActive && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase shadow-lg">
                    Inactive
                  </div>
                )}
                
                {/* Delete Button Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
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
                    <td className="px-6 py-3 text-xs font-mono text-gray-500">{item.id}</td>
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
                    <td className="px-6 py-3">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wide ${
                        item.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
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
          onClose={() => setIsModalOpen(false)}
          propertyData={propertyData}
          onSuccess={() => {
            fetchGallery(currentPage);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default GalleryTab;