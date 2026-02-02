import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const AddRoomModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    maxOccupancy: '',
    size: '',
    amenities: [],
    available: true
  });
  
  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        basePrice: '',
        maxOccupancy: '',
        size: '',
        amenities: [],
        available: true
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddAmenity = (e) => {
      e.preventDefault();
      if(amenityInput.trim()) {
          setFormData(prev => ({ ...prev, amenities: [...prev.amenities, amenityInput.trim()] }));
          setAmenityInput('');
      }
  };

  const removeAmenity = (index) => {
      setFormData(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
        ...formData, 
        basePrice: Number(formData.basePrice),
        maxOccupancy: Number(formData.maxOccupancy) 
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Room' : 'Add Room'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                    <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy</label>
                    <input type="number" name="maxOccupancy" value={formData.maxOccupancy} onChange={handleChange} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Room Size</label>
                 <input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="e.g. 350 sq.ft" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={amenityInput} 
                        onChange={(e) => setAmenityInput(e.target.value)} 
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                        placeholder="Add amenity..." 
                    />
                    <button type="button" onClick={handleAddAmenity} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                            {amenity}
                            <button type="button" onClick={() => removeAmenity(idx)} className="hover:text-blue-900"><XMarkIcon className="w-3 h-3" /></button>
                        </span>
                    ))}
                </div>
            </div>

             <div className="flex items-center gap-2">
                <input type="checkbox" name="available" id="available" checked={formData.available} onChange={handleChange} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">Available for booking</label>
             </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90" style={{ backgroundColor: colors.primary }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
