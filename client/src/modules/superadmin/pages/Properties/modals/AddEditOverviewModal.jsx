import React, { useState, useEffect } from 'react';
import { XMarkIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';
import { updatePropertyById } from '@/Api/Api';
import { toast } from 'react-hot-toast'; // Optional: for feedback
import { Send, Loader2 } from 'lucide-react';
const AddEditOverviewModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    locationName: '',
    latitude: '',
    longitude: '',
    propertyType: 'Hotel',
    isActive: true,
    price: 0,
    capacity: 0,
    rating: 0,
    tagline: '',
    gstPercentage: 18,
    discountAmount: 0,
    // Fields required by your body format
    mainHeading: '',
    subTitle: '',
    fullAddress: '',
    pincode: '',
    area: ''
  });

  useEffect(() => {
    if (initialData) {
      const primaryListing = initialData.listings?.[0] || {};
      setFormData({
        ...initialData,
        // Mapping existing data to form fields
        propertyName: initialData.propertyName || '',
        address: initialData.address || '',
        locationName: initialData.locationName || '',
        mainHeading: initialData.mainHeading || initialData.propertyName || '',
        subTitle: initialData.subTitle || '',
        fullAddress: initialData.fullAddress || initialData.address || '',
        price: primaryListing.price || initialData.price || 0,
        capacity: primaryListing.capacity || initialData.capacity || 0,
        rating: primaryListing.rating || initialData.rating || 0,
        tagline: primaryListing.tagline || initialData.tagline || '',
        gstPercentage: primaryListing.gstPercentage || initialData.gstPercentage || 18,
        discountAmount: primaryListing.discountAmount || initialData.discountAmount || 0,
        isActive: initialData.isActive ?? true,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Constructing the payload exactly as your API format
    const payload = {
      propertyName: formData.propertyName,
      propertyTypeIds: formData.propertyTypeIds || [2], // Defaulting as per your example
      propertyCategoryIds: formData.propertyCategoryIds || [1],
      address: formData.address,
      area: formData.area || "Central",
      pincode: formData.pincode || "560001",
      locationId: formData.locationId || 2,
      assignedAdminId: formData.assignedAdminId || 2,
      parentPropertyId: formData.parentPropertyId || 1,
      isActive: formData.isActive,
      mainHeading: formData.mainHeading || formData.propertyName,
      subTitle: formData.subTitle,
      fullAddress: formData.fullAddress || formData.address,
      tagline: formData.tagline,
      rating: Number(formData.rating),
      capacity: Number(formData.capacity),
      price: Number(formData.price),
      gstPercentage: Number(formData.gstPercentage),
      discountAmount: Number(formData.discountAmount),
      amenitiesAndFeaturesIds: formData.amenitiesAndFeaturesIds || []
    };

    try {
      if (initialData?.id) {
        // API Call
        const response = await updatePropertyById(initialData.id, payload);
        
        if (response.status === 200 || response.data) {
          toast.success('Property updated successfully');
          onSave(response.data); // Notify parent to refresh list
          onClose();
        }
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
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
          {/* General Section */}
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
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Title</label>
                <input
                  type="text"
                  name="subTitle"
                  value={formData.subTitle}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Premium stay in Central City"
                />
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
                  <span className="text-sm font-medium text-gray-700">Property is Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing & Listing Section */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing & Listing</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="w-full pl-9 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <input
                  type="number"
                  name="rating"
                  step="0.1"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? 'Saving...' : 'Save Property Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditOverviewModal;