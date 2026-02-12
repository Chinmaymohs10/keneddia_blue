import React, { useState, useEffect, useCallback } from "react";
import { PlusIcon, BoltIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import AddAmenityModal from "../modals/AddAmenityModal";
import { GetAllPropertyDetails } from "@/Api/Api";

const AmenitiesTab = ({ propertyData, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localAmenities, setLocalAmenities] = useState([]);

  // --- Data Extraction Logic ---
  const extractAmenities = useCallback((rawItem) => {
    // Check if we have the new DTO structure or a flattened one
    const listings = rawItem?.propertyListingResponseDTOS || rawItem?.listings || [];
    if (!listings.length) return [];

    // Merge all amenities from all listings and remove duplicates
    const all = listings.flatMap((l) => l.amenities || []);
    return Array.from(new Set(all));
  }, []);

  // --- Fetch and Filter Logic ---
  const fetchCurrentAmenities = useCallback(async () => {
    if (!propertyData?.id) return;
    
    setLoading(true);
    try {
      const res = await GetAllPropertyDetails();
      const allProperties = res?.data || res || [];
      
      // Filter only for the current property ID
      const currentProp = allProperties.find(
        (item) => (item.propertyResponseDTO?.id || item.id) === propertyData.id
      );

      if (currentProp) {
        setLocalAmenities(extractAmenities(currentProp));
      } else {
        // Fallback to initial prop data if not found in list
        setLocalAmenities(extractAmenities(propertyData));
      }
    } catch (error) {
      console.error("Error fetching amenity details:", error);
      // Fallback on error
      setLocalAmenities(extractAmenities(propertyData));
    } finally {
      setLoading(false);
    }
  }, [propertyData, extractAmenities]);

  // Initial fetch and sync when propertyData changes
  useEffect(() => {
    fetchCurrentAmenities();
  }, [fetchCurrentAmenities]);

  const handleModalSave = () => {
    fetchCurrentAmenities(); // Refresh local tab data
    if (refreshData) refreshData(); // Trigger parent refresh if needed
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Property Amenities
            {loading && <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-500" />}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Verified features for {propertyData?.propertyName || "this property"}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all active:scale-95 shadow-sm hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" /> Manage Amenities
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {localAmenities.length > 0 ? (
          localAmenities.map((amenityName, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BoltIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {amenityName}
                  </h3>
                  <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <BoltIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No amenities linked to this property.</p>
            <p className="text-sm text-gray-400">Click "Manage Amenities" to update the list.</p>
          </div>
        )}
      </div>

      {/* Linked Modal */}
      <AddAmenityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyData={propertyData}
        data={localAmenities} // Pass the freshly fetched strings
        onSave={handleModalSave}
      />
    </div>
  );
};

export default AmenitiesTab;