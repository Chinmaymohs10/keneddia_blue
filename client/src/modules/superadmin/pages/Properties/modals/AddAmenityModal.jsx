import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';
import { getAllAmenityFeatures, insertAmenitiesByPropertyId, createAmenityFeature } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

const AddAmenityModal = ({ isOpen, onClose, propertyData, data, onSave }) => {
  const [allFeatures, setAllFeatures] = useState([]); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Custom Amenity State
  const [customAmenity, setCustomAmenity] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchMasterList = async () => {
    setLoading(true);
    try {
      const res = await getAllAmenityFeatures();
      const amenityArray = res?.data || (Array.isArray(res) ? res : []);
      setAllFeatures(amenityArray);
      
      if (data && Array.isArray(data)) {
        setSelectedIds(data.map(item => item.id));
      }
    } catch (err) {
      showError("Failed to load amenities master list");
      setAllFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchMasterList();
  }, [isOpen, data]);

  const toggleAmenity = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateCustom = async () => {
    if (!customAmenity.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await createAmenityFeature({ 
        name: customAmenity.trim(), 
        isActive: true 
      });
      
      const newAmenity = res?.data || res;
      
      showSuccess(`"${customAmenity}" created and added to list`);
      
      // Update local master list and auto-select it
      setAllFeatures(prev => [newAmenity, ...prev]);
      setSelectedIds(prev => [...prev, newAmenity.id]);
      setCustomAmenity(''); // Reset input
    } catch (err) {
      showError("Failed to create custom amenity");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyData?.id) {
      showError("Property ID missing");
      return;
    }

    setLoading(true);
    try {
      await insertAmenitiesByPropertyId(propertyData.id, selectedIds);
      showSuccess("Amenities updated successfully");
      onSave(); 
      onClose();
    } catch (err) {
      showError("Failed to link amenities");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Amenities</h3>
            <p className="text-xs text-gray-500 font-medium">Link or create features for this property</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Custom Amenity Input (Quick Add) */}
        <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100">
            <label className="block text-[10px] font-bold text-blue-600 uppercase mb-2 tracking-widest">
                Create New Custom Amenity
            </label>
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="e.g. Infinity Pool"
                    className="flex-1 rounded-lg border-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCustom()}
                />
                <button
                    onClick={handleCreateCustom}
                    disabled={isCreating || !customAmenity.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                    {isCreating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                    Add
                </button>
            </div>
        </div>
        
        {/* Master List Container */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {loading && allFeatures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowPathIcon className="w-10 h-10 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Fetching list...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Select from available features
              </label>
              {Array.isArray(allFeatures) && allFeatures.map((feature) => {
                const isSelected = selectedIds.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => toggleAmenity(feature.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20 shadow-sm' 
                        : 'border-white bg-white hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckIcon className={`w-4 h-4 transition-transform ${isSelected ? 'scale-110' : 'scale-0'}`} />
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {feature.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-black text-blue-600">SELECTED</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-white flex justify-between items-center px-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {selectedIds.length} Selected
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md disabled:opacity-50 active:scale-95 transition-all"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAmenityModal;