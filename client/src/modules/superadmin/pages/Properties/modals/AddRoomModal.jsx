import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon,ArrowPathIcon} from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';
import { addRoomToProperty, getAllAmenityFeatures, updateRoomById } from '@/Api/Api';
import { showSuccess, showError } from '@/lib/toasters/toastUtils';

const AddRoomModal = ({ isOpen, onClose, propertyData, initialData, onSuccess }) => {
  const propId = propertyData?.id || propertyData?.propertyId;

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'DELUXE',
    roomName: '',
    description: '',
    basePrice: '',
    maxOccupancy: 2,
    roomSize: '',
    roomSizeUnit: 'SQ_FT',
    floorNumber: 1,
    status: 'AVAILABLE',
    bookable: true,
    active: true,
    amenitiesAndFeaturesIds: []
  });

  const [amenities, setAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Room Type Options
  const roomTypes = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'DOUBLE', label: 'Double' },
    { value: 'DELUXE', label: 'Deluxe' },
    { value: 'SUITE', label: 'Suite' }
  ];

  // Room Status Options
  const roomStatuses = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'OCCUPIED', label: 'Occupied' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'MAINTENANCE', label: 'Maintenance' }
  ];

  // Room Size Units
  const sizeUnits = [
    { value: 'SQ_FT', label: 'Square Feet' },
    { value: 'SQ_M', label: 'Square Meters' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchAmenities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Extract IDs from full amenity objects if initialData provides them as objects
        const existingAmenityIds = initialData.amenitiesAndFeatures?.map(a => a.id) || 
                                  initialData.amenitiesAndFeaturesIds || [];

        setFormData({
          roomNumber: initialData.roomNumber || '',
          roomType: initialData.roomType || 'DELUXE',
          roomName: initialData.roomName || '',
          description: initialData.description || '',
          basePrice: initialData.basePrice || '',
          maxOccupancy: initialData.maxOccupancy || 2,
          roomSize: initialData.roomSize || '',
          roomSizeUnit: initialData.roomSizeUnit || 'SQ_FT',
          floorNumber: initialData.floorNumber || 1,
          status: initialData.status || 'AVAILABLE',
          bookable: initialData.bookable ?? true,
          active: initialData.active ?? true,
          amenitiesAndFeaturesIds: existingAmenityIds
        });
      } else {
        setFormData({
          roomNumber: '',
          roomType: 'DELUXE',
          roomName: '',
          description: '',
          basePrice: '',
          maxOccupancy: 2,
          roomSize: '',
          roomSizeUnit: 'SQ_FT',
          floorNumber: 1,
          status: 'AVAILABLE',
          bookable: true,
          active: true,
          amenitiesAndFeaturesIds: []
        });
      }
    }
  }, [isOpen, initialData]);

  const fetchAmenities = async () => {
    setLoadingAmenities(true);
    try {
      const response = await getAllAmenityFeatures();
      const amenitiesData = response?.data?.data || response?.data || response || [];
      setAmenities(Array.isArray(amenitiesData) ? amenitiesData : []);
    } catch (error) {
      showError('Failed to load amenities');
    } finally {
      setLoadingAmenities(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => {
      const currentIds = prev.amenitiesAndFeaturesIds;
      const isSelected = currentIds.includes(amenityId);
      return {
        ...prev,
        amenitiesAndFeaturesIds: isSelected
          ? currentIds.filter(id => id !== amenityId)
          : [...currentIds, amenityId]
      };
    });
  };

  const incrementValue = (field) => {
    setFormData(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }));
  };

  const decrementValue = (field) => {
    setFormData(prev => ({ ...prev, [field]: Math.max(1, (prev[field] || 0) - 1) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propId) {
      showError('Property ID is missing');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        maxOccupancy: parseInt(formData.maxOccupancy),
        roomSize: formData.roomSize ? parseFloat(formData.roomSize) : null,
        floorNumber: parseInt(formData.floorNumber),
      };

      let response;
      if (initialData?.roomId) {
        // Edit Mode: Update existing room
        response = await updateRoomById(initialData.roomId, payload);
        showSuccess('Room updated successfully');
      } else {
        // Add Mode: Create new room
        response = await addRoomToProperty(propId, payload);
        showSuccess('Room added successfully');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Room Submission Error:', error);
      showError(error?.response?.data?.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {initialData ? 'Update Room Details' : 'Create New Room'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Property ID: {propId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            
            {/* Section: Basic Info */}
            <section>
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                <span className="w-8 h-[2px] bg-blue-600"></span> Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Number *</label>
                  <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g. 101-A" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Type *</label>
                  <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none">
                    {roomTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Name *</label>
                  <input type="text" name="roomName" value={formData.roomName} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" placeholder="e.g. Deluxe Garden View" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-none" placeholder="Briefly describe the room features..." />
                </div>
              </div>
            </section>

            {/* Section: Pricing & Capacity */}
            <section>
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                <span className="w-8 h-[2px] bg-blue-600"></span> Pricing & Capacity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Base Price (Per Night) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input type="number" name="basePrice" value={formData.basePrice} onChange={handleNumberChange} required className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Occupancy *</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <button type="button" onClick={() => decrementValue('maxOccupancy')} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-red-500 transition-colors"><MinusIcon className="w-5 h-5" /></button>
                    <span className="flex-1 text-center font-bold text-gray-700">{formData.maxOccupancy} Persons</span>
                    <button type="button" onClick={() => incrementValue('maxOccupancy')} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-blue-500 transition-colors"><PlusIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </section>

            {/* Amenities Selector */}
            <section>
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-6">
                <span className="w-8 h-[2px] bg-blue-600"></span> Amenities & Features
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenities.map(amenity => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                      formData.amenitiesAndFeaturesIds.includes(amenity.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="text-xs font-bold truncate">{amenity.name || amenity.featureName}</span>
                    {formData.amenitiesAndFeaturesIds.includes(amenity.id) && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Toggle Settings */}
            <div className="flex flex-wrap gap-8 py-4 px-6 bg-gray-50 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.bookable ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <input type="checkbox" name="bookable" checked={formData.bookable} onChange={handleChange} className="sr-only" />
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.bookable ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">Open for Booking</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="sr-only" />
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.active ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">Active Status</span>
                </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 p-6 bg-white border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                </div>
              ) : initialData ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;