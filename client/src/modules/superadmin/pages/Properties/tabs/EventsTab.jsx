import React from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const EventsTab = ({ data, onEdit, onAdd, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((event) => (
          <div key={event.id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gray-100 relative">
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                   {event.tag}
               </div>
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                         <div className="flex items-center text-sm text-gray-500 gap-2 mb-4">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 border-t pt-4 mt-2">
                    <button 
                        onClick={() => onEdit(event)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => onDelete(event.id)}
                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
          </div>
        ))}
         {data.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
            No upcoming events.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsTab;
