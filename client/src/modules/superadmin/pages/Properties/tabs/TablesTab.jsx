import React from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const TablesTab = ({ data, onEdit, onAdd, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tables Management</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" /> Add Table
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2 relative group">
             <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                 {item.capacity}
             </div>
             <p className="font-semibold text-gray-900">{item.tableNumber}</p>
             <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.isActive ? 'Active' : 'Inactive'}
             </span>
             
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                 <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-blue-600 bg-white rounded shadow-sm"><PencilSquareIcon className="w-4 h-4" /></button>
                 <button onClick={() => onDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600 bg-white rounded shadow-sm"><TrashIcon className="w-4 h-4" /></button>
             </div>
          </div>
        ))}
         {data.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            No tables configured.
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesTab;
