import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { X, Upload, Loader2, Plus, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { addAboutUs, updateAboutUsById, uploadMedia } from '@/Api/Api';
import { toast } from 'react-hot-toast';

function AddUpdateAboutModal({ isOpen, onClose, editData = null }) {
  const [formData, setFormData] = useState({
    sectionTitle: '',
    subTitle: '',
    description: '',
    videoUrl: '',
    videoTitle: '',
    ctaButtonText: 'More Details →',
    ctaButtonUrl: ''
  });

  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState({});

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        sectionTitle: editData.sectionTitle || '',
        subTitle: editData.subTitle || '',
        description: editData.description || '',
        videoUrl: editData.videoUrl || '',
        videoTitle: editData.videoTitle || '',
        ctaButtonText: editData.ctaButtonText || 'More Details →',
        ctaButtonUrl: editData.ctaButtonUrl || ''
      });

      // Load existing media items if any
      if (editData.mediaItems && Array.isArray(editData.mediaItems)) {
        setMediaItems(editData.mediaItems);
      }
    } else if (!isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({
      sectionTitle: '',
      subTitle: '',
      description: '',
      videoUrl: '',
      videoTitle: '',
      ctaButtonText: 'More Details →',
      ctaButtonUrl: ''
    });
    setMediaItems([]);
    setUploadingMedia({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMediaItem = (type) => {
    const newItem = {
      id: Date.now(),
      type, // 'IMAGE' or 'VIDEO'
      url: '',
      file: null,
      mediaId: null,
      isNew: true
    };
    setMediaItems(prev => [...prev, newItem]);
  };

  const handleRemoveMediaItem = (id) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
    const newUploadingMedia = { ...uploadingMedia };
    delete newUploadingMedia[id];
    setUploadingMedia(newUploadingMedia);
  };

  const handleMediaUrlChange = (id, url) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, url } : item
    ));
  };

  const handleFileSelect = async (id, file) => {
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Please select a valid image or video file');
      return;
    }

    // Validate file size (max 10MB for videos, 5MB for images)
    const maxSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size should be less than ${isVideo ? '10MB' : '5MB'}`);
      return;
    }

    try {
      setUploadingMedia(prev => ({ ...prev, [id]: true }));

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setMediaItems(prev => prev.map(item => 
        item.id === id ? { ...item, file, url: previewUrl } : item
      ));

      // Upload media
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', isImage ? 'IMAGE' : 'VIDEO');
      formDataUpload.append('alt', formData.sectionTitle || 'About media');

      const response = await uploadMedia(formDataUpload);
      
      // Extract media ID
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
        setMediaItems(prev => prev.map(item => 
          item.id === id ? { ...item, mediaId } : item
        ));
        toast.success('Media uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
      handleRemoveMediaItem(id);
    } finally {
      setUploadingMedia(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.sectionTitle.trim()) {
      toast.error('Section title is required');
      return;
    }
    if (!formData.subTitle.trim()) {
      toast.error('Subtitle is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        sectionTitle: formData.sectionTitle.trim(),
        subTitle: formData.subTitle.trim(),
        description: formData.description.trim(),
        videoUrl: formData.videoUrl.trim(),
        videoTitle: formData.videoTitle.trim(),
        ctaButtonText: formData.ctaButtonText.trim(),
        ctaButtonUrl: formData.ctaButtonUrl.trim(),
        mediaItems: mediaItems.map(item => ({
          type: item.type,
          url: item.url,
          mediaId: item.mediaId
        }))
      };

      if (editData?.id) {
        await updateAboutUsById(editData.id, payload);
        toast.success('About Us updated successfully!');
      } else {
        await addAboutUs(payload);
        toast.success('About Us created successfully!');
      }

      onClose(true);
      resetForm();
    } catch (error) {
      console.error('Error saving about us:', error);
      toast.error(error?.response?.data?.message || 'Failed to save about us');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-0">
      <div className="w-full h-full overflow-y-auto" style={{ backgroundColor: colors.contentBg }}>
        {/* Header */}
        <div 
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b"
          style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
        >
          <h3 className="text-lg font-bold m-0" style={{ color: colors.textPrimary }}>
            {editData ? 'Edit About Us' : 'Add About Us'}
          </h3>
          <button onClick={() => onClose(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} style={{ color: colors.textPrimary }} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Basic Information */}
            <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
                Basic Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    Section Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sectionTitle}
                    onChange={(e) => handleInputChange('sectionTitle', e.target.value)}
                    placeholder="About Kennedia Blu"
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    Sub Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subTitle}
                    onChange={(e) => handleInputChange('subTitle', e.target.value)}
                    placeholder="Kennedia Blu"
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    placeholder="Describe your company..."
                    className="w-full px-3 py-2 rounded-md border text-sm resize-none outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                  />
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
                Main Video Section
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    YouTube Video URL
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=example"
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={formData.videoTitle}
                    onChange={(e) => handleInputChange('videoTitle', e.target.value)}
                    placeholder="Discover Kennedia Blu"
                    className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaButtonText}
                      onChange={(e) => handleInputChange('ctaButtonText', e.target.value)}
                      placeholder="Learn More"
                      className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                      style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                      CTA Button URL
                    </label>
                    <input
                      type="text"
                      value={formData.ctaButtonUrl}
                      onChange={(e) => handleInputChange('ctaButtonUrl', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-1 focus:ring-primary/20"
                      style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                    />
                  </div>
                </div>

                {/* Video Preview */}
                {formData.videoUrl && (
                  <div className="mt-2">
                    <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">
                      Video Preview
                    </label>
                    <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={formData.videoUrl.replace('watch?v=', 'embed/')}
                        title={formData.videoTitle || "Video preview"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Media Items */}
            <div className="p-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold m-0" style={{ color: colors.textPrimary }}>
                  Additional Media (Images/Videos/Links)
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddMediaItem('IMAGE')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border"
                    style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: 'transparent' }}
                  >
                    <ImageIcon size={12} />
                    Add Image
                  </button>
                  <button
                    onClick={() => handleAddMediaItem('VIDEO')}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold"
                    style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                  >
                    <LinkIcon size={12} />
                    Add Link
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {mediaItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: colors.border }}>
                    <div className="flex-1">
                      {item.type === 'IMAGE' ? (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`media-${item.id}`}
                            onChange={(e) => e.target.files && handleFileSelect(item.id, e.target.files[0])}
                          />
                          <label
                            htmlFor={`media-${item.id}`}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded border text-xs cursor-pointer"
                            style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}
                          >
                            {uploadingMedia[item.id] ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                <span>{item.file ? item.file.name : 'Choose Image'}</span>
                              </>
                            )}
                          </label>
                          {item.url && !uploadingMedia[item.id] && (
                            <img src={item.url} alt="Preview" className="w-full h-24 object-cover rounded" />
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleMediaUrlChange(item.id, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=example or image URL"
                          className="w-full px-3 py-2 rounded border text-sm outline-none"
                          style={{ borderColor: colors.border, backgroundColor: '#F3F4F6', color: '#000000' }}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMediaItem(item.id)}
                      className="p-2 rounded"
                      style={{ backgroundColor: '#fee', color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="sticky bottom-0 flex gap-3 px-5 py-3 border-t"
          style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
        >
          <button
            onClick={() => onClose(false)}
            disabled={loading}
            className="flex-1 py-2 rounded-md font-bold text-sm border hover:bg-gray-100 transition-all disabled:opacity-50"
            style={{ borderColor: colors.border, color: colors.textPrimary }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-2 rounded-md font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              editData ? 'Update About Us' : 'Create About Us'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUpdateAboutModal;