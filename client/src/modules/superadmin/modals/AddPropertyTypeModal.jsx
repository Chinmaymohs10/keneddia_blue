import React, { useState } from "react";
import { X } from "lucide-react";
import { colors } from "@/lib/colors/colors";
import { addPropertyType } from "@/Api/Api";

function AddPropertyTypeModal({ onClose, onSuccess }) {
  const [typeName, setTypeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await addPropertyType({ typeName });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add property type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: colors.border }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Add Property Type
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.textPrimary }}
            >
              Type Name *
            </label>
            <input
              type="text"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              required
              placeholder="e.g., Wine & Dine"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: colors.border }}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
              style={{ borderColor: colors.border }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? "Adding..." : "Add Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPropertyTypeModal;