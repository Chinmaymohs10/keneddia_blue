import React, { useState, useEffect } from 'react';
import { PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const AddEventModal = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    header: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    image: null
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Logic to handle image upload preview or storage
      setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white">
      <div className="flex items-center gap-4 mb-6 border-b pb-4">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <h3 className="text-xl font-bold text-gray-900">
          {initialData ? 'Edit Group Booking' : 'Add Group Booking Item'}
        </h3>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
        {/* Image Upload Area */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
          {formData.image ? (
            <img src={formData.image} alt="Preview" className="h-40 w-full object-cover rounded-lg mb-4" />
          ) : (
            <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
          )}
          <label className="cursor-pointer">
            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">Upload an image</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Header / Title</label>
          <input 
            type="text" 
            name="header" 
            value={formData.header} 
            onChange={handleChange} 
            placeholder="e.g. Wedding Packages"
            required 
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={4}
            placeholder="Describe the group booking offer..."
            className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Text</label>
            <input 
              type="text" 
              name="ctaText" 
              value={formData.ctaText} 
              onChange={handleChange} 
              placeholder="e.g. Inquire Now"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Link</label>
            <input 
              type="text" 
              name="ctaLink" 
              value={formData.ctaLink} 
              onChange={handleChange} 
              placeholder="https://..."
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90" style={{ backgroundColor: colors.primary }}>
            Save Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEventModal;