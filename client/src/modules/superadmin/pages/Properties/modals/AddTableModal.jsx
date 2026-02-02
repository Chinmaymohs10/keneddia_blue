import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const AddTableModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    isActive: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
        setFormData({ tableNumber: '', capacity: '', isActive: true });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Table' : 'Add Table'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number/Name</label>
                <input type="text" name="tableNumber" value={formData.tableNumber} onChange={handleChange} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

             <div className="flex items-center gap-2">
                <input type="checkbox" name="isActive" id="isActiveTable" checked={formData.isActive} onChange={handleChange} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="isActiveTable" className="text-sm font-medium text-gray-700">Active</label>
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

export default AddTableModal;
