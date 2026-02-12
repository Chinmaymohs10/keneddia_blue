import React, { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import { getAllPropertyPolicies } from "@/Api/Api";
import { showError } from "@/lib/toasters/toastUtils";
import EditPoliciesModal from "../modals/EditPoliciesModal";

const PoliciesTab = ({ propertyData }) => {
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPolicies = async () => {
    if (!propertyData?.id) return;

    setLoading(true);
    try {
      const response = await getAllPropertyPolicies(propertyData.id);
      const actualData = response?.data || response;

      // --- DEBUG LOGS ---
      console.log("DEBUG: Target Property ID:", propertyData.id);
      console.log("DEBUG: Full API Response Array:", actualData);

      if (Array.isArray(actualData)) {
        // FILTER logic: Find the specific object matching current propertyId
        const matchedPolicy = actualData.find(
          (p) => Number(p.propertyId) === Number(propertyData.id),
        );

        console.log("DEBUG: Matched Policy Object:", matchedPolicy);

        if (matchedPolicy) {
          setPolicyData(matchedPolicy);
        } else {
          console.warn(
            `DEBUG: No policy found matching ID ${propertyData.id}. Defaulting to null.`,
          );
          setPolicyData(null);
        }
      } else if (actualData && typeof actualData === "object") {
        // If the API returns a single object instead of an array
        setPolicyData(actualData);
      } else {
        setPolicyData(null);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      showError("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [propertyData?.id]);

  // DERIVED DATA (Matches your JSON format)
  const attachedPolicies = policyData?.policies || [];
  const checkInTime = policyData?.checkInTime;
  const checkOutTime = policyData?.checkOutTime;
  const cancellationPolicy = policyData?.cancellationPolicy;

  const hasPolicies = attachedPolicies.length > 0;
  const hasTiming = !!(checkInTime || checkOutTime);
  const hasCancellation = !!(
    cancellationPolicy && cancellationPolicy !== "null"
  );

  // A property is considered "Empty" only if all major fields are missing
  const isEmpty = !hasPolicies && !hasTiming && !hasCancellation;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <ArrowPathIcon className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">
          Loading property policies...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Property Policies
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Rules and timing for{" "}
              <span className="text-blue-600">
                @{policyData?.propertyName || propertyData?.propertyName}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 whitespace-nowrap"
          style={{ backgroundColor: colors.primary }}
        >
          <PencilSquareIcon className="w-4 h-4" />
          {isEmpty ? "Configure Policies" : "Edit Policies"}
        </button>
      </div>

      {isEmpty ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">No policies found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Configure check-in/out times and cancellation rules to provide
            clarity to your guests.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm"
          >
            Add Policies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rules & Policies Tags */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">
                    General Rules
                  </h3>
                </div>
                {policyData?.isActive && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="p-6">
                {hasPolicies ? (
                  <div className="flex flex-wrap gap-2.5">
                    {attachedPolicies.map((policy) => (
                      <div
                        key={policy.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-white hover:border-blue-300 transition-all"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {policy.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic text-sm flex items-center gap-2">
                    <InformationCircleIcon className="w-4 h-4" />
                    No policy tags assigned.
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Policy Detail */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">
                  Cancellation Policy
                </h3>
              </div>
              <div className="p-6">
                {hasCancellation ? (
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <p className="text-gray-800 font-medium leading-relaxed text-sm">
                      {cancellationPolicy}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Default cancellation terms apply.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timing Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">
                  Check-in / Out
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">
                      Check-in After
                    </span>
                    <span className="text-xl font-black text-gray-900">
                      {checkInTime || "--:--"}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <ArrowPathIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">
                      Check-out Before
                    </span>
                    <span className="text-xl font-black text-gray-900">
                      {checkOutTime || "--:--"}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-400">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-indigo-50/50 rounded-lg flex gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <p className="text-[11px] text-indigo-800 leading-tight">
                      Ensure guests are notified of these timings at the time of
                      booking confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <EditPoliciesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyData={propertyData}
        initialData={policyData}
        onSave={fetchPolicies}
      />
    </div>
  );
};

export default PoliciesTab;
