import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const AddMediaModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    mediaType: 'image',
    category: 'Property',
    url: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
        setFormData({ mediaType: 'image', category: 'Property', url: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Media' : 'Upload Media'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                <select name="mediaType" value={formData.mediaType} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="Property">Property</option>
                    <option value="Room">Room</option>
                    <option value="Food">Food</option>
                    <option value="Event">Event</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input type="text" name="url" value={formData.url} onChange={handleChange} placeholder="/static/..." required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
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

export default AddMediaModal;
