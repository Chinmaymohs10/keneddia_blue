import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { X, Upload, Loader2, MapPin, Tag, FileText, Calendar, Clock, Image as ImageIcon, Building2, Hotel, AlignLeft, Home, Ruler, Link as LinkIcon } from 'lucide-react';
import { createDailyOffer, updateDailyOfferById, uploadMedia, getMediaById, getAllProperties } from '@/Api/Api';
import { toast } from 'react-hot-toast';

// Add styles for placeholder text
const inputStyles = `
  input::placeholder, textarea::placeholder {
    color: #9CA3AF !important;
    opacity: 1;
  }
  input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
    color: #9CA3AF !important;
    opacity: 1;
  }
  input::-moz-placeholder, textarea::-moz-placeholder {
    color: #9CA3AF !important;
    opacity: 1;
  }
`;

function CreateOfferModal({ isOpen, onClose, editingOffer }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDesc: '',
    couponCode: '',
    ctaText: 'Claim Offer',
    ctaLink: '',
    location: '',
    propertyId: null,
    propertyName: '',
    propertyType: '',
    expiresAt: '',
    availableHours: '',
    imageMediaId: null,
    image: { src: '', alt: '', width: 800, height: 600 },
    isActive: true,
    showOnHomePage: false,
    displayLocation: 'SPECIFIC_PAGE'
  });

  // Properties state
  const [availableProperties, setAvailableProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedMediaId, setUploadedMediaId] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [isInstagramBanner, setIsInstagramBanner] = useState(false);

  // Fetch properties when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  // Handle editing offer data
  useEffect(() => {
    if (editingOffer) {
      if (editingOffer.imageMediaId) {
        fetchMediaDetails(editingOffer.imageMediaId);
      }
      
      const selectedProperty = availableProperties.find(p => p.id === editingOffer.propertyId);
      
      setFormData({
        title: editingOffer.title || '',
        description: editingOffer.description || '',
        longDesc: editingOffer.longDesc || '',
        couponCode: editingOffer.couponCode || '',
        ctaText: editingOffer.ctaText || 'Claim Offer',
        ctaLink: editingOffer.ctaLink || '',
        location: selectedProperty ? `${selectedProperty.area}, ${selectedProperty.locationName}` : editingOffer.location || '',
        propertyId: editingOffer.propertyId || null,
        propertyName: selectedProperty?.propertyName || editingOffer.propertyName || '',
        propertyType: selectedProperty?.propertyTypes?.join(', ') || editingOffer.propertyType || '',
        expiresAt: editingOffer.expiresAt ? new Date(editingOffer.expiresAt).toISOString().split('T')[0] : '',
        availableHours: editingOffer.availableHours || '',
        imageMediaId: editingOffer.imageMediaId || null,
        image: {
          src: editingOffer.image?.src || '',
          alt: editingOffer.image?.alt || '',
          width: editingOffer.image?.width || 800,
          height: editingOffer.image?.height || 600
        },
        isActive: editingOffer.isActive ?? true,
        showOnHomePage: editingOffer.showOnHomePage ?? false,
        displayLocation: editingOffer.displayLocation || 'SPECIFIC_PAGE'
      });
      setUploadedMediaId(editingOffer.imageMediaId || null);
      setImagePreview(editingOffer.image?.src || null);
      
      if (editingOffer.image?.width === 1080 && editingOffer.image?.height === 1080) {
        setIsInstagramBanner(true);
        setImageDimensions({ width: 1080, height: 1080 });
      }
    } else {
      resetForm();
    }
  }, [editingOffer, isOpen, availableProperties]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await getAllProperties();
      const propertiesData = response.data?.data || response.data || response;
      
      if (Array.isArray(propertiesData)) {
        const activeProperties = propertiesData.filter(p => p.isActive);
        setAvailableProperties(activeProperties);
      } else {
        setAvailableProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
      setAvailableProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchMediaDetails = async (mediaId) => {
    try {
      const response = await getMediaById(mediaId);
      const mediaData = response.data?.data;
      
      if (mediaData) {
        setImagePreview(mediaData.url);
        setFormData(prev => ({
          ...prev,
          image: {
            src: mediaData.url,
            alt: mediaData.alt || '',
            width: mediaData.width || 800,
            height: mediaData.height || 600
          }
        }));
        
        if (mediaData.width && mediaData.height) {
          setImageDimensions({ width: mediaData.width, height: mediaData.height });
          if (mediaData.width === 1080 && mediaData.height === 1080) {
            setIsInstagramBanner(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching media details:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      longDesc: '',
      couponCode: '',
      ctaText: 'Claim Offer',
      ctaLink: '',
      location: '',
      propertyId: null,
      propertyName: '',
      propertyType: '',
      expiresAt: '',
      availableHours: '',
      imageMediaId: null,
      image: { src: '', alt: '', width: 800, height: 600 },
      isActive: true,
      showOnHomePage: false,
      displayLocation: 'SPECIFIC_PAGE'
    });
    setImagePreview(null);
    setSelectedFile(null);
    setUploadedMediaId(null);
    setImageDimensions(null);
    setIsInstagramBanner(false);
  };

  const handlePropertySelect = (propertyId) => {
    if (!propertyId) {
      setFormData(prev => ({
        ...prev,
        propertyId: null,
        propertyName: '',
        propertyType: '',
        location: ''
      }));
      return;
    }

    const selectedProperty = availableProperties.find(p => p.id === parseInt(propertyId));
    
    if (selectedProperty) {
      setFormData(prev => ({
        ...prev,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.propertyName,
        propertyType: selectedProperty.propertyTypes?.join(', ') || '',
        location: `${selectedProperty.area || ''}, ${selectedProperty.locationName || ''}`.replace(/^, |, $/g, '')
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDisplayLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      displayLocation: location,
      showOnHomePage: location === 'HOMEPAGE' || location === 'BOTH'
    }));
  };

  const detectImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const dimensions = { width: img.width, height: img.height };
        resolve(dimensions);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const dimensions = await detectImageDimensions(file);
    if (dimensions) {
      setImageDimensions(dimensions);
      
      if (dimensions.width === 1080 && dimensions.height === 1080) {
        setIsInstagramBanner(true);
        toast.success('Instagram banner detected! Text fields are now optional.');
      } else {
        setIsInstagramBanner(false);
      }
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);

    await uploadImageFile(file, dimensions);
  };

  const uploadImageFile = async (file, dimensions = null) => {
    try {
      setUploadingImage(true);
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'IMAGE');
      formDataUpload.append('alt', formData.title || 'Offer image');
      formDataUpload.append('width', dimensions?.width?.toString() || '800');
      formDataUpload.append('height', dimensions?.height?.toString() || '600');

      const response = await uploadMedia(formDataUpload);
      
      let mediaId = null;
      let mediaUrl = null;
      
      if (typeof response === 'number') {
        mediaId = response;
      } else if (typeof response?.data === 'number') {
        mediaId = response.data;
      } else if (typeof response?.data?.data === 'number') {
        mediaId = response.data.data;
      } else if (response?.data?.data?.id) {
        mediaId = response.data.data.id;
        mediaUrl = response.data.data.url;
      } else if (response?.data?.id) {
        mediaId = response.data.id;
        mediaUrl = response.data.url;
      }

      if (mediaId) {
        setUploadedMediaId(mediaId);
        setFormData(prev => ({
          ...prev,
          imageMediaId: mediaId,
          image: {
            src: mediaUrl || prev.image.src,
            alt: formData.title || 'Offer image',
            width: dimensions?.width || 800,
            height: dimensions?.height || 600
          }
        }));
        toast.success(`Image uploaded successfully (ID: ${mediaId})`);
      } else {
        throw new Error('Invalid response from upload');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload image');
      setImagePreview(null);
      setSelectedFile(null);
      setImageDimensions(null);
      setIsInstagramBanner(false);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setUploadedMediaId(null);
    setImageDimensions(null);
    setIsInstagramBanner(false);
    setFormData(prev => ({
      ...prev,
      imageMediaId: null,
      image: { src: '', alt: '', width: 800, height: 600 }
    }));
  };

  const handleSubmit = async () => {
    if (!isInstagramBanner) {
      if (!formData.title?.trim()) {
        toast.error('Please enter offer title');
        return;
      }
    }
    
    if (!formData.propertyId) {
      toast.error('Please select a property');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        title: formData.title?.trim() || '',
        description: formData.description?.trim() || '',
        longDesc: formData.longDesc?.trim() || '',
        couponCode: formData.couponCode?.trim() || '',
        ctaText: formData.ctaText?.trim() || 'Claim Offer',
        ctaLink: formData.ctaLink?.trim() || '',
        availableHours: formData.availableHours?.trim() || '',
        propertyId: formData.propertyId,
        imageMediaId: uploadedMediaId || formData.imageMediaId || null,
        expiresAt: formData.expiresAt || null,
        isActive: formData.isActive,
        showOnHomePage: formData.showOnHomePage,
        displayLocation: formData.displayLocation
      };

      if (editingOffer) {
        await updateDailyOfferById(editingOffer.id, payload);
        toast.success('Offer updated successfully');
      } else {
        await createDailyOffer(payload);
        toast.success('Offer created successfully');
      }
      
      onClose(true);
      resetForm();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error?.response?.data?.message || 'Failed to save offer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
      <style>{inputStyles}</style>
      <div 
        className="w-full h-full overflow-y-auto"
        style={{ backgroundColor: colors.contentBg }}
      >
        {/* Compact Sticky Header */}
        <div 
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b"
          style={{ 
            backgroundColor: colors.contentBg,
            borderColor: colors.border 
          }}
        >
          <div>
            <h3 
              className="text-lg font-bold m-0"
              style={{ color: colors.textPrimary }}
            >
              {editingOffer ? 'Edit Offer' : 'Assign Offer to Property'}
            </h3>
            {isInstagramBanner && (
              <p className="text-[10px] text-purple-600 mt-0.5 font-semibold">
                Instagram Banner Mode - Text fields optional
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Compact Content Area */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-7xl mx-auto">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Property Assignment - Compact */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <label 
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase"
                  style={{ color: colors.primary }}
                >
                  <Hotel size={12} /> Assign to Property
                </label>
                
                <div className="relative">
                  <select
                    value={formData.propertyId || ''}
                    onChange={(e) => handlePropertySelect(e.target.value)}
                    disabled={loadingProperties}
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                    style={{ 
                      borderColor: colors.primary,
                      backgroundColor: '#F3F4F6',
                      color: formData.propertyId ? '#000000' : '#6B7280'
                    }}
                  >
                    <option value="">
                      {loadingProperties ? 'Loading...' : 'Choose Property...'}
                    </option>
                    {availableProperties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.propertyName} - {p.locationName}
                      </option>
                    ))}
                  </select>
                  {loadingProperties && (
                    <Loader2 size={14} className="absolute right-10 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                </div>

                {formData.propertyId && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Type</label>
                      <div className="mt-0.5 px-2 py-1 rounded border text-[11px] font-bold bg-green-50 border-green-300 text-green-700">
                        {formData.propertyType || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Location</label>
                      <div className="mt-0.5 px-2 py-1 rounded border text-[11px] font-bold flex items-center gap-1 bg-blue-50 border-blue-300 text-blue-700">
                        <MapPin size={10} />
                        <span className="truncate">{formData.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Location - Compact */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-blue-700">
                  <Home size={12} /> Display Location
                </label>
                
                <div className="space-y-1.5">
                  {[
                    { value: 'HOMEPAGE', label: 'Home Page Only', desc: 'Main homepage' },
                    { value: 'SPECIFIC_PAGE', label: 'Property Page Only', desc: 'Property-specific page' },
                    { value: 'BOTH', label: 'Both Locations', desc: 'Homepage & property page' }
                  ].map(option => (
                    <label 
                      key={option.value}
                      className="flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all hover:bg-blue-100"
                      style={{
                        borderColor: formData.displayLocation === option.value ? colors.primary : colors.border,
                        backgroundColor: formData.displayLocation === option.value ? 'rgba(59, 130, 246, 0.05)' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="displayLocation"
                        value={option.value}
                        checked={formData.displayLocation === option.value}
                        onChange={(e) => handleDisplayLocationChange(e.target.value)}
                        className="w-3 h-3"
                        style={{ accentColor: colors.primary }}
                      />
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold text-gray-800">{option.label}</div>
                        <div className="text-[9px] text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Offer Title - Compact */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                  <FileText size={10} /> Offer Title {!isInstagramBanner && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  placeholder="e.g., Anniversary Special 30% Off"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: '#F3F4F6',
                    color: '#000000'
                  }}
                />
              </div>

              {/* Coupon & Hours - Compact */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    <Tag size={10} /> Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                    placeholder="SAVE30"
                    className="w-full px-3 py-2 rounded-md border uppercase font-mono text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: '#F3F4F6',
                      color: '#000000'
                    }}
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    <Clock size={10} /> Available Hours
                  </label>
                  <input
                    type="text"
                    value={formData.availableHours}
                    onChange={(e) => handleInputChange('availableHours', e.target.value)}
                    placeholder="24/7 or 9AM-5PM"
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: '#F3F4F6',
                      color: '#000000'
                    }}
                  />
                </div>
              </div>

              {/* Short Description - Compact */}
              <div>
                <label className="flex items-center justify-between gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <FileText size={10} /> Short Description
                  </span>
                  <span className={`text-[9px] font-mono ${formData.description.length > 50 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {formData.description.length}/50
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief tagline (max 50 chars)"
                  className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                  style={{ 
                    borderColor: formData.description.length > 50 ? '#EF4444' : colors.border,
                    backgroundColor: '#F3F4F6',
                    color: '#000000'
                  }}
                  maxLength={50}
                />
              </div>

              {/* Long Description - Compact */}
              <div>
                <label className="flex items-center justify-between gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <AlignLeft size={10} /> Detailed Description
                  </span>
                  <span className="text-[9px] font-mono text-gray-400">{formData.longDesc.length}/1000</span>
                </label>
                <textarea
                  value={formData.longDesc}
                  onChange={(e) => handleInputChange('longDesc', e.target.value)}
                  rows={3}
                  placeholder="Enter full offer details..."
                  className="w-full px-3 py-2 rounded-md border resize-none text-sm outline-none focus:ring-1 focus:ring-primary/20"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: '#F3F4F6',
                    color: '#000000'
                  }}
                  maxLength={1000}
                />
              </div>

              {/* Expiry & CTA - Compact */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    <Calendar size={10} /> Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: '#F3F4F6',
                      color: '#000000'
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    CTA Button
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => handleInputChange('ctaText', e.target.value)}
                    placeholder="Claim Offer"
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: '#F3F4F6',
                      color: '#000000'
                    }}
                    maxLength={30}
                  />
                </div>
              </div>

              {/* CTA Link - Compact */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase mb-1 text-gray-500">
                  <LinkIcon size={10} /> CTA Link
                </label>
                <input
                  type="text"
                  value={formData.ctaLink}
                  onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                  placeholder="https://example.com/offer"
                  className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: '#F3F4F6',
                    color: '#000000'
                  }}
                />
              </div>
            </div>

            {/* Right Column - Compact */}
            <div className="space-y-3">
              {/* Image Upload - Compact */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase mb-2 text-gray-600">
                  <ImageIcon size={12} /> Offer Visuals
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-white hover:bg-gray-50 hover:border-primary/50 transition-all ${uploadingImage ? 'pointer-events-none opacity-60' : ''}`}
                  onClick={() => !uploadingImage && document.getElementById('offer-assign-img')?.click()}
                  style={{ borderColor: colors.border }}
                >
                  <input
                    id="offer-assign-img"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <>
                      <Loader2 size={24} className="mx-auto mb-2 animate-spin text-primary" />
                      <p className="text-xs text-gray-600 font-medium">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs text-gray-600 mb-1 font-medium">Click to upload</p>
                      <p className="text-[10px] text-gray-400">PNG, JPG up to 5MB</p>
                      <p className="text-[10px] text-purple-600 font-semibold mt-1">
                        💡 1080x1080px = Instagram banner
                      </p>
                    </>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      className="w-full h-48 object-cover rounded-lg shadow"
                      alt="Preview"
                    />
                    
                    {/* Compact Badges */}
                    {imageDimensions && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] rounded flex items-center gap-1 font-mono backdrop-blur-sm">
                        <Ruler size={9} />
                        <span>{imageDimensions.width}×{imageDimensions.height}</span>
                      </div>
                    )}
                    
                    {isInstagramBanner && (
                      <div className="absolute top-2 right-10 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] rounded font-bold">
                        IG Banner
                      </div>
                    )}
                    
                    {uploadedMediaId && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[9px] rounded flex items-center gap-1 font-semibold">
                        <span>✓</span>
                        <span>ID: {uploadedMediaId}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      disabled={uploadingImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Status Toggle - Compact */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <label className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-gray-600">Status</span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold"
                      style={{ color: formData.isActive ? '#10B981' : '#EF4444' }}
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('isActive', !formData.isActive)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${
                          formData.isActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </label>
              </div>

              {/* Info Box - Compact */}
              {isInstagramBanner && (
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-purple-200 rounded">
                      <Ruler size={12} className="text-purple-700" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-purple-900 mb-0.5">Instagram Banner</h4>
                      <p className="text-[9px] text-purple-700 leading-snug">
                        1080×1080px detected. All text fields are optional.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Sticky Footer */}
        <div 
          className="sticky bottom-0 flex gap-3 px-5 py-3 border-t"
          style={{ 
            backgroundColor: colors.contentBg,
            borderColor: colors.border 
          }}
        >
          <div className="flex gap-3 max-w-7xl mx-auto w-full">
            <button
              onClick={handleClose}
              disabled={loading || uploadingImage}
              className="flex-1 py-2 rounded-md font-bold text-sm border hover:bg-gray-100 transition-all disabled:opacity-50"
              style={{ borderColor: colors.border, color: colors.textPrimary }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImage || (!isInstagramBanner && !formData.title?.trim()) || !formData.propertyId || formData.description.length > 50}
              className="flex-[2] py-2 rounded-md font-bold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : uploadingImage ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </>
              ) : (
                editingOffer ? 'Update Offer' : 'Save Offer'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOfferModal;