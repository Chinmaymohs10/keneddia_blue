import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const AddEditOverviewModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: '',
    locationName: '',
    latitude: '',
    longitude: '',
    propertyType: 'Hotel',
    isActive: true,
    // Primary Listing Data
    price: 0,
    capacity: 0,
    rating: 0,
    tagline: '',
    gstPercentage: 18,
    discountAmount: 0
  });

  useEffect(() => {
    if (initialData) {
      // Mapping the complex JSON structure to a flat form state
      const primaryListing = initialData.listings?.[0] || {};
      setFormData({
        ...initialData,
        price: primaryListing.price || 0,
        capacity: primaryListing.capacity || 0,
        rating: primaryListing.rating || 0,
        tagline: primaryListing.tagline || '',
        gstPercentage: primaryListing.gstPercentage || 18,
        discountAmount: primaryListing.discountAmount || 0
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct the payload back to match your API structure
    const payload = {
      ...formData,
      listings: [
        {
          ...(initialData?.listings?.[0] || {}),
          price: Number(formData.price),
          capacity: Number(formData.capacity),
          rating: Number(formData.rating),
          tagline: formData.tagline,
          gstPercentage: Number(formData.gstPercentage),
          discountAmount: Number(formData.discountAmount),
        }
      ]
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Refine Property Details</h3>
            <p className="text-xs text-gray-500 font-medium">Updating ID: {formData.id || 'New'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto">
          {/* Basic Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               General Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  name="propertyName"
                  value={formData.propertyName}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g. Hotel Amritsariya"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Restaurant">Restaurant</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    Property is Active
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location & Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Location</label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info / Listing Section */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               Additional Details (Extra Info)
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Catchy tagline for the property"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-9 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Pax)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm active:scale-95 transition-all"
              style={{ backgroundColor: colors.primary }}
            >
              Save Property Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditOverviewModal;