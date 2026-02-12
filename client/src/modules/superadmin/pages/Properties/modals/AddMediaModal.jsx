import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';
import { uploadGalleryMedia } from '@/Api/Api';
import { showSuccess, showError } from '@/lib/toasters/toastUtils';

const AddMediaModal = ({ isOpen, onClose, propertyData, onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState('ROOM');
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const propId = propertyData?.id || propertyData?.propertyId;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setPreviews([]);
      setCategory('ROOM');
    }
  }, [isOpen]);

  // Generate preview URLs when files are selected
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Cleanup preview URLs on unmount
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Filter valid image/video files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length !== files.length) {
      showError('Some files were skipped. Only images and videos are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propId) {
      showError('Property ID is missing');
      return;
    }

    if (selectedFiles.length === 0) {
      showError('Please select at least one file');
      return;
    }

    setUploading(true);

    try {
      // Create FormData matching the Postman structure
      const formData = new FormData();
      
      // Append each file with the key "files"
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Append category and propertyId as text fields
      formData.append('category', category);
      formData.append('propertyId', propId.toString());

      // Call the API
      const response = await uploadGalleryMedia(formData);

      console.log('✅ Upload Response:', response);
      showSuccess(`Successfully uploaded ${selectedFiles.length} file(s)`);
      
      // Trigger parent refresh and close modal
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('❌ Upload Error:', error);
      showError(error?.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Upload Gallery Media</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 transition-colors"
            disabled={uploading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={uploading}
              >
                <option value="ROOM">Room</option>
                <option value="PROPERTY">Property</option>
                <option value="FOOD">Food</option>
                <option value="EVENT">Event</option>
                <option value="AMENITY">Amenity</option>
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    Images and videos (Multiple files supported)
                  </span>
                </label>
              </div>
            </div>

            {/* File Previews */}
            {selectedFiles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selected Files ({selectedFiles.length})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100"
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={previews[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          <span className="text-xs text-gray-500 mt-2">Video</span>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        disabled={uploading}
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>

                      {/* File Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                `Upload ${selectedFiles.length} file(s)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMediaModal;