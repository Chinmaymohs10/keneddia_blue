import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';
import { 
  createPolicyOption, 
  getAllPolicyOptions, 
  attachPoliciesToProperty 
} from '@/Api/Api';
import { showError, showSuccess } from '@/lib/toasters/toastUtils';

const EditPoliciesModal = ({ isOpen, onClose, propertyData, initialData, onSave }) => {
  // --- State Declarations ---
  const [formData, setFormData] = useState({
    selectedPolicyIds: [],
    checkInTime: '',
    checkOutTime: '',
    cancellationPolicy: ''
  });

  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [loading, setLoading] = useState(false); // Fixed: Added missing loading state
  const [showNewPolicyInput, setShowNewPolicyInput] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  // --- Helpers for Time Formatting ---
  
  // Converts "14:00 PM" (API format) to "14:00" (Input format)
  const formatToInputTime = (timeStr) => {
    if (!timeStr) return '';
    // Removes any AM/PM suffixes to satisfy <input type="time" />
    return timeStr.replace(/\s?[APM]{2}$/i, '').trim();
  };

  // Converts "14:00" (Input format) to "14:00 PM" (API payload format)
  const formatToPayloadTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours] = timeStr.split(':');
    const suffix = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${timeStr} ${suffix}`;
  };

  // --- Effects ---
  useEffect(() => {
    if (isOpen) {
      fetchAvailablePolicies();
      
      setFormData({
        selectedPolicyIds: initialData?.policies?.map(p => p.id) || [],
        checkInTime: formatToInputTime(initialData?.checkInTime),
        checkOutTime: formatToInputTime(initialData?.checkOutTime),
        cancellationPolicy: initialData?.cancellationPolicy || ''
      });
    }
  }, [isOpen, initialData]);

  // --- API Actions ---
  const fetchAvailablePolicies = async () => {
    setLoadingPolicies(true);
    try {
      const response = await getAllPolicyOptions();
      const policyList = response?.data || [];
      setAvailablePolicies(policyList);
    } catch (error) {
      console.error("Error fetching policies:", error);
      showError("Failed to load policies");
    } finally {
      setLoadingPolicies(false);
    }
  };

  const handleCreatePolicy = async () => {
    const trimmedName = newPolicyName.trim();
    if (!trimmedName) return;

    setIsCreatingPolicy(true);
    try {
      const response = await createPolicyOption({ name: trimmedName });
      const newPolicy = response?.data || response;

      if (newPolicy?.id) {
        setAvailablePolicies(prev => [...prev, newPolicy]);
        setFormData(prev => ({
          ...prev,
          selectedPolicyIds: [...prev.selectedPolicyIds, newPolicy.id]
        }));
        setNewPolicyName('');
        setShowNewPolicyInput(false);
      }
    } catch (error) {
      showError("Failed to create policy");
    } finally {
      setIsCreatingPolicy(false);
    }
  };

  const handlePolicyToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      selectedPolicyIds: prev.selectedPolicyIds.includes(id)
        ? prev.selectedPolicyIds.filter(item => item !== id)
        : [...prev.selectedPolicyIds, id]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyData?.id) return;

    setLoading(true);
    try {
      const payload = {
        propertyId: propertyData.id,
        policyOptionIds: formData.selectedPolicyIds,
        checkInTime: formatToPayloadTime(formData.checkInTime),
        checkOutTime: formatToPayloadTime(formData.checkOutTime),
        cancellationPolicy: formData.cancellationPolicy
      };

      await attachPoliciesToProperty(payload);
      onSave();
      onClose();
    } catch (error) {
      showError("Failed to save policies");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Property Policies</h3>
            <p className="text-xs text-gray-500">{propertyData?.propertyName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Time Pickers & Cancellation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> CHECK-IN TIME
              </label>
              <input 
                type="time" 
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> CHECK-OUT TIME
              </label>
              <input 
                type="time" 
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
              />
            </div>
            <div className="col-span-full space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <DocumentTextIcon className="w-4 h-4" /> CANCELLATION POLICY
              </label>
              <textarea 
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                rows="2"
                placeholder="e.g. Free cancellation up to 48 hours..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Create Custom Policy */}
          <div>
            <button
              type="button"
              onClick={() => setShowNewPolicyInput(!showNewPolicyInput)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              {showNewPolicyInput ? "Close Input" : "Create a Custom Policy Tag"}
            </button>

            {showNewPolicyInput && (
              <div className="mt-3 flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="e.g. No Smoking"
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleCreatePolicy}
                  disabled={isCreatingPolicy}
                  style={{ backgroundColor: colors.primary }}
                  className="px-4 py-2 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isCreatingPolicy ? "..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Policy List */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Available Policies ({availablePolicies.length})
            </h4>

            {loadingPolicies ? (
              <div className="flex flex-col items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePolicies.map((policy) => (
                  <label
                    key={policy.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.selectedPolicyIds.includes(policy.id)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedPolicyIds.includes(policy.id)}
                      onChange={() => handlePolicyToggle(policy.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className={`text-sm font-medium ${
                      formData.selectedPolicyIds.includes(policy.id) ? "text-blue-900" : "text-gray-700"
                    }`}>
                      {policy.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
          <span className="text-sm text-gray-500 font-medium">
            {formData.selectedPolicyIds.length} policies selected
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: colors.primary }}
              className="px-6 py-2 text-white rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? "Saving..." : "Apply Selection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPoliciesModal;