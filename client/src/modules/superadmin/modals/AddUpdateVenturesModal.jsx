import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { X, Upload, Loader2 } from 'lucide-react';
import { addVenture, updateVentureById, uploadMedia } from '@/Api/Api';
import { toast } from 'react-hot-toast';

function AddUpdateVenturesModal({ isOpen, onClose, editData = null, aboutUsId }) {
  const [formData, setFormData] = useState({
    ventureName: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState(null);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        ventureName: editData.ventureName || ''
      });
      setLogoPreview(editData.logoUrl || null);
      setUploadedMediaId(editData.logoMediaId || null);
    } else if (!isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({ ventureName: '' });
    setLogoFile(null);
    setLogoPreview(null);
    setUploadedMediaId(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    // Upload immediately
    await uploadLogoFile(file);
  };

  const uploadLogoFile = async (file) => {
    try {
      setUploadingLogo(true);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'IMAGE');
      formDataUpload.append('alt', formData.ventureName || 'Venture logo');

      const response = await uploadMedia(formDataUpload);

      let mediaId = null;
      if (typeof response === 'number') {
        mediaId = response;
      } else if (typeof response?.data === 'number') {
        mediaId = response.data;
      } else if (typeof response?.data?.data === 'number') {
        mediaId = response.data.data;
      } else if (response?.data?.data?.id) {
        mediaId = response.data.data.id;
      } else if (response?.data?.id) {
        mediaId = response.data.id;
      }

      if (mediaId) {
        setUploadedMediaId(mediaId);
        toast.success('Logo uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      setLogoFile(null);
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setUploadedMediaId(null);
  };

  const handleSubmit = async () => {
    if (!formData.ventureName.trim()) {
      toast.error('Venture name is required');
      return;
    }

    // Only validate aboutUsId for new ventures
    if (!editData?.id && !aboutUsId) {
      toast.error('About Us ID is required. Please create an About Us section first.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ventureName: formData.ventureName.trim(),
        logoMediaId: uploadedMediaId || null
      };

      if (editData?.id) {
        await updateVentureById(editData.id, payload);
        toast.success('Venture updated successfully!');
      } else {
        await addVenture(aboutUsId, payload);
        toast.success('Venture created successfully!');
      }

      onClose(true);
      resetForm();
    } catch (error) {
      console.error('Error saving venture:', error);
      toast.error(error?.response?.data?.message || 'Failed to save venture');
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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="rounded-lg p-5 w-[60%] max-w-3xl shadow-xl"
        style={{ backgroundColor: colors.contentBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-base font-bold m-0" style={{ color: colors.textPrimary }}>
            {editData ? 'Edit Venture' : 'Add Venture'}
          </h3>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} style={{ color: colors.textPrimary }} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
              Venture Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ventureName}
              onChange={(e) => handleInputChange('ventureName', e.target.value)}
              placeholder="e.g., HOTEL, RESTAURANT, SPA"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
              style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
              Logo
            </label>
            
            {logoPreview ? (
              <div className="relative border rounded-lg p-3" style={{ borderColor: colors.border }}>
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-full h-24 object-contain rounded"
                />
                {uploadedMediaId && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[9px] rounded font-semibold">
                    ✓ ID: {uploadedMediaId}
                  </div>
                )}
                <button
                  onClick={removeLogo}
                  disabled={uploadingLogo}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="venture-logo-upload"
                  onChange={handleFileSelect}
                  disabled={uploadingLogo}
                />
                <label
                  htmlFor="venture-logo-upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg text-sm cursor-pointer hover:border-primary/50 transition-colors"
                  style={{ borderColor: colors.border, color: colors.textSecondary }}
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Choose Logo</span>
                    </>
                  )}
                </label>
                <p className="text-[9px] text-gray-400 mt-1">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={handleClose}
            disabled={loading || uploadingLogo}
            className="flex-1 py-2 rounded-md font-bold text-sm border hover:bg-gray-100 transition-all disabled:opacity-50"
            style={{ borderColor: colors.border, color: colors.textPrimary }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingLogo || !formData.ventureName.trim()}
            className="flex-[2] py-2 rounded-md font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              editData ? 'Update Venture' : 'Create Venture'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUpdateVenturesModal;