import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import { X, MapPin } from "lucide-react";
import { addLocation, updateLocationById } from "@/Api/Api";
import { toast } from "react-hot-toast";

function AddLocationModal({ onClose, onSuccess, initialData }) {
  const [formData, setFormData] = useState({
    locationName: "",
    state: "",
    country: "India",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if we are in Edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        locationName: initialData.locationName || "",
        state: initialData.state || "",
        country: initialData.country || "India",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.locationName.trim()) newErrors.locationName = "Required";
    if (!formData.state.trim()) newErrors.state = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      
      if (initialData) {
        // Edit Mode
        await updateLocationById(initialData.id, payload);
        toast.success("Location updated successfully");
      } else {
        // Add Mode
        await addLocation(payload);
        toast.success("Location added successfully");
      }
      onSuccess();
    } catch (error) {
      setErrors({ submit: error?.response?.data?.message || "Operation failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{initialData ? "Edit Location" : "Add Location"}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{errors.submit}</div>}
          
          <div>
            <label className="block text-sm font-medium mb-1">Location Name</label>
            <input name="locationName" value={formData.locationName} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input name="state" value={formData.state} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="isActive" value={formData.isActive.toString()} onChange={handleChange} className="w-full p-2 border rounded-lg">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {isSubmitting ? "Processing..." : initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLocationModal;