import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const OverviewTab = ({ data, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-md hover:opacity-90 transition-colors"
          style={{ backgroundColor: colors.primary }}
        >
          <PencilSquareIcon className="w-4 h-4" /> Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Property Name</label>
            <p className="mt-1 text-base text-gray-900">{data.propertyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Address</label>
            <p className="mt-1 text-base text-gray-900">{data.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">City</label>
            <p className="mt-1 text-base text-gray-900">{data.city}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Description</label>
            <p className="mt-1 text-base text-gray-900">{data.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Coordinates</label>
            <p className="mt-1 text-base text-gray-900 font-mono text-sm">
              Lat: {data.coordinates.lat}, Lng: {data.coordinates.lng}
            </p>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-500">Type</label>
             <p className="mt-1 text-base text-gray-900">{data.propertyType || 'Hotel'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
