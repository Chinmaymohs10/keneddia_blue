import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const PoliciesTab = ({ data, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-gray-900">Property Policies</h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-md hover:opacity-90 transition-colors"
          style={{ backgroundColor: colors.primary }}
        >
          <PencilSquareIcon className="w-4 h-4" /> Edit Policies
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg border">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Check-in / Check-out</label>
            <div className="flex items-center gap-4">
                 <div className="bg-white px-4 py-2 border rounded shadow-sm">
                     <span className="text-xs text-gray-500 block">Check-in</span>
                     <span className="text-lg font-semibold text-gray-900">{data.checkInTime}</span>
                 </div>
                 <div className="text-gray-400">→</div>
                 <div className="bg-white px-4 py-2 border rounded shadow-sm">
                     <span className="text-xs text-gray-500 block">Check-out</span>
                     <span className="text-lg font-semibold text-gray-900">{data.checkOutTime}</span>
                 </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Pets Policy</label>
             <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${data.petsAllowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {data.petsAllowed ? 'Pets Allowed' : 'No Pets Allowed'}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Cancellation Policy</label>
            <div className="bg-white p-4 border rounded shadow-sm">
                <p className="text-gray-700">{data.cancellationPolicy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesTab;
