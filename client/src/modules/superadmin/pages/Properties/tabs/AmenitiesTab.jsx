import React from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon, BoltIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const AmenitiesTab = ({ data, onEdit, onAdd, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" /> Add Amenity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BoltIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
               <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 transition-colors">
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
         {data.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            No amenities added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AmenitiesTab;
