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
  const [galleryData, setGalleryData] = useState({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New States for View and Filtering
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [showDeleted, setShowDeleted] = useState(false);
  
  const propId = propertyData?.id || propertyData?.propertyId;

  const fetchGallery = useCallback(async () => {
    if (!propId) return;
    setLoading(true);
    try {
      const response = await getAllGalleries(propId);
      const rawData = response?.data?.data || response?.data || response;
      const content = rawData?.content || (Array.isArray(rawData) ? rawData : []);
      
      setGalleryData({
        content: content,
        totalElements: rawData?.totalElements || content.length,
      });
    } catch (error) {
      console.error("Gallery Fetch Error:", error);
      showError("Failed to load gallery images");
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
      const response = await deleteGalleryById(id);
      if (response) {
        showSuccess("Media deleted successfully");
        await fetchGallery();
      }
    } catch (error) {
      showError("Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  };

  // Logic: Filter items based on isActive and showDeleted toggle
  const filteredItems = galleryData.content.filter(item => showDeleted || item.isActive);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Property Gallery</h2>
          <p className="text-xs text-gray-500">Showing {filteredItems.length} media items</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Trash Toggle */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showDeleted ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            {showDeleted ? <EyeIcon size={14} className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
            {showDeleted ? "Showing Inactive" : "Show Inactive"}
          </button>

          {/* View Mode Switcher */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-gray-100 text-blue-600" : "text-gray-400"}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-gray-100 text-blue-600" : "text-gray-400"}`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg hover:shadow-md transition-all active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <PlusIcon className="w-5 h-5" /> Upload
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading && filteredItems.length === 0 ? (
        <div className="flex justify-center py-20"><ArrowPathIcon className="w-10 h-10 animate-spin text-blue-500" /></div>
      ) : filteredItems.length > 0 ? (
        viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className={`group relative aspect-square rounded-xl overflow-hidden border bg-gray-50 transition-all ${!item.isActive ? "opacity-60 border-red-100" : "hover:border-blue-400 shadow-sm"}`}>
                <img src={item.media?.url} alt={item.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                {!item.isActive && <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Inactive</div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all">
                    {deletingId === item.id ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <TrashIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <img src={item.media?.url} className="w-16 h-12 object-cover rounded-lg border" alt="" />
                    </td>
                    <td className="px-6 py-3 font-semibold text-sm text-gray-700">{item.category}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-gray-50/50">
          <PhotoIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No media found matching your filters.</p>
        </div>
      )}

      {isModalOpen && (
        <AddMediaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyData={propertyData}
          onSuccess={() => { fetchGallery(); setIsModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default GalleryTab;