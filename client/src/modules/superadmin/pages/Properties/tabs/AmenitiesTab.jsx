import React from "react";
import { 
  PencilSquareIcon, 
  PlusIcon, 
  BoltIcon 
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";

const AmenitiesTab = ({ propertyData, data = [], onAdd }) => {
  console.log('propertyData',propertyData);
  // Ensure data is always an array to prevent .map crashes
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Property Amenities</h2>
          <p className="text-xs text-gray-500 font-medium">Features linked to {propertyData?.propertyName}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all active:scale-95 shadow-sm hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" /> Manage Amenities
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeData.map((item, index) => (
          <div
            key={item?.id ?? index}
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BoltIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item?.name || "N/A"}</h3>
                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}

        {safeData.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <BoltIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No amenities linked to this property.</p>
            <p className="text-sm text-gray-400">Click the button above to select features.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmenitiesTab;