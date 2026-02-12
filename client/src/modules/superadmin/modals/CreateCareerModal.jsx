import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import { X, Save, Loader2, Briefcase, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateCareerModal({ isOpen, onClose, editingJob }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    location: "",
    city: "",
    country: "India",
    department: "Management",
    employmentType: "FULL_TIME",
    description: "",
    experienceLevel: "",
    isActive: true
  });

  useEffect(() => {
    if (editingJob) {
      setFormData({ ...editingJob });
    } else {
      setFormData({
        title: "",
        slug: "",
        location: "",
        city: "",
        country: "India",
        department: "Management",
        employmentType: "FULL_TIME",
        description: "",
        experienceLevel: "",
        isActive: true
      });
    }
  }, [editingJob, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: val };
      if (name === "title" && !editingJob) {
        newData.slug = value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      console.log("Form Data Submitted:", formData);
      toast.success(editingJob ? "Listing updated (Demo)" : "Job posted (Demo)");
      setLoading(false);
      onClose(true);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Updated Container: 
          - max-w-[80%] for width 
          - max-h-[85vh] to decrease total height and keep it within viewport
      */}
      <div className="w-full max-w-[80%] max-h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Fixed Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Briefcase size={20} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              {editingJob ? "Edit Job Listing" : "Post New Career"}
            </h3>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: colors.textSecondary }}>Job Title</label>
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. General Manager"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                  style={{ borderColor: colors.border }}
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: colors.textSecondary }}>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all text-sm bg-white"
                  style={{ borderColor: colors.border }}
                >
                  <option value="Management">Management</option>
                  <option value="Kitchen">Kitchen & Culinary</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Front Office">Front Office</option>
                  <option value="F&B Service">F&B Service</option>
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: colors.textSecondary }}>Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all text-sm bg-white"
                  style={{ borderColor: colors.border }}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: colors.textSecondary }}>City</label>
                <input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: colors.border }}
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: colors.textSecondary }}>Experience Level</label>
                <input
                  required
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  placeholder="e.g. 10+ years"
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                  style={{ borderColor: colors.border }}
                />
              </div>

              {/* Location (Full string) */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: colors.textSecondary }}>Full Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textSecondary }} />
                  <input
                    required
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, India"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary text-sm"
                    style={{ borderColor: colors.border }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase mb-1.5" style={{ color: colors.textSecondary }}>Job Description</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                  style={{ borderColor: colors.border }}
                  placeholder="Responsible for overall hotel operations..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer" style={{ color: colors.textPrimary }}>
                  Active Listing
                </label>
              </div>
            </div>
          </div>

          {/* Fixed Modal Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-end gap-3 shrink-0" style={{ borderColor: colors.border }}>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.border, color: colors.textPrimary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all hover:shadow-lg disabled:opacity-70"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingJob ? "Update Listing" : "Post Opening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}