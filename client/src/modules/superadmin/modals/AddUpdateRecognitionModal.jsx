import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { X, Loader2 } from 'lucide-react';
import { addRecognition, updateRecognition } from '@/Api/Api';
import { toast } from 'react-hot-toast';

function AddUpdateRecognitionModal({ isOpen, onClose, editData = null, aboutUsId }) {
  const [formData, setFormData] = useState({
    value: '',
    title: '',
    subTitle: ''
  });

  const [loading, setLoading] = useState(false);

  // Debug log
  useEffect(() => {
    console.log('RecognitionModal - isOpen:', isOpen);
    console.log('RecognitionModal - aboutUsId:', aboutUsId);
    console.log('RecognitionModal - editData:', editData);
  }, [isOpen, aboutUsId, editData]);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        value: editData.value || '',
        title: editData.title || '',
        subTitle: editData.subTitle || ''
      });
    } else if (!isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({
      value: '',
      title: '',
      subTitle: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.value.trim()) {
      toast.error('Value is required');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!editData?.id && !aboutUsId) {
      toast.error('About Us ID is required. Please create an About Us section first.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        value: formData.value.trim(),
        title: formData.title.trim(),
        subTitle: formData.subTitle.trim()
      };

      if (editData?.id) {
        await updateRecognition(editData.id, payload);
        toast.success('Recognition updated successfully!');
      } else {
        await addRecognition(aboutUsId, payload);
        toast.success('Recognition created successfully!');
      }

      onClose(true);
      resetForm();
    } catch (error) {
      console.error('Error saving recognition:', error);
      toast.error(error?.response?.data?.message || 'Failed to save recognition');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose(false);
  };

  // Don't render if not open
  if (!isOpen) {
    console.log('RecognitionModal - Not rendering, isOpen is false');
    return null;
  }

  console.log('RecognitionModal - Rendering modal');

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleClose}
    >
      <div 
        className="rounded-lg p-5 shadow-xl"
        style={{ 
          backgroundColor: colors.contentBg,
          width: '60%',
          maxWidth: '800px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-base font-bold m-0" style={{ color: colors.textPrimary }}>
            {editData ? 'Edit Recognition' : 'Add Recognition'}
          </h3>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} style={{ color: colors.textPrimary }} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
              Value <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              placeholder="e.g., 98/100, 25+, $1M+"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
              style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Years of Excellence"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
              style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subTitle}
              onChange={(e) => handleInputChange('subTitle', e.target.value)}
              placeholder="e.g., Trusted globally"
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
              style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2 rounded-md font-bold text-sm border hover:bg-gray-100 transition-all disabled:opacity-50"
            style={{ borderColor: colors.border, color: colors.textPrimary }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.value.trim() || !formData.title.trim()}
            className="flex-[2] py-2 rounded-md font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              editData ? 'Update Recognition' : 'Create Recognition'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUpdateRecognitionModal;
