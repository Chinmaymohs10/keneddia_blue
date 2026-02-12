import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import { X, Upload, Loader2 } from "lucide-react";
import { addVenture, updateVentureById } from "@/Api/Api";
import { toast } from "react-hot-toast";

function AddUpdateVenturesModal({ isOpen, onClose, editData = null, aboutUsId }) {
  const [formData, setFormData] = useState({ ventureName: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({ ventureName: editData.ventureName || "" });
      setLogoPreview(editData.logoUrl || null);
    } else if (!isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({ ventureName: "" });
    setLogoPreview(null);
    setLogoFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // In the component - handleSubmit function
const handleSubmit = async () => {
  if (!formData.ventureName.trim()) {
    return toast.error("Venture name is required");
  }

  if (!editData && !logoFile) {
    return toast.error("Logo is required");
  }

  try {
    setLoading(true);
    
    // Pass as object instead of FormData
    const payload = {
      ventureName: formData.ventureName.trim(),
      logo: logoFile
    };

    if (editData?.id) {
      await updateVentureById(editData.id, payload);
      toast.success("Venture updated successfully!");
    } else {
      await addVenture(aboutUsId, payload);
      toast.success("Venture created successfully!");
    }
    onClose(true);
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to save venture");
    console.error("Save error:", error);
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={() => onClose(false)}
    >
      <div 
        className="rounded-lg p-5 w-[60%] max-w-3xl shadow-xl bg-white" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <h3 className="text-base font-bold">
            {editData ? "Edit Venture" : "Add Venture"}
          </h3>
          <button onClick={() => onClose(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase mb-1">
              Venture Name *
            </label>
            <input 
              type="text" 
              value={formData.ventureName} 
              onChange={(e) => setFormData({...formData, ventureName: e.target.value})} 
              className="w-full px-3 py-2 rounded-md border text-sm outline-none bg-gray-100"
              placeholder="Enter venture name"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase mb-1">
              Logo {!editData && "*"}
            </label>
            {logoPreview ? (
              <div className="relative border rounded-lg p-3">
                <img 
                  src={logoPreview} 
                  className="w-full h-24 object-contain" 
                  alt="Logo Preview" 
                />
                <button 
                  onClick={() => {
                    setLogoPreview(null);
                    setLogoFile(null);
                  }} 
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label 
                htmlFor="v-logo" 
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg text-sm cursor-pointer hover:border-primary hover:bg-gray-50"
              >
                <Upload size={16} />
                <span>Choose Logo</span>
                <input 
                  type="file" 
                  id="v-logo" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect} 
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t">
          <button 
            onClick={() => onClose(false)} 
            className="flex-1 py-2 border rounded-md text-sm font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="flex-[2] py-2 bg-primary text-white rounded-md text-sm font-bold flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {editData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUpdateVenturesModal;