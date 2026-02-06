import React, { useState } from "react";
import { PlusIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import AddEventModal from "../modals/AddEventModal";

const EventsTab = ({ data = [], propertyData, refreshData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleSave = async (formData) => {
    // Logic to call your API (createEvent or updateEvent)
    console.log("Saving Group Booking:", formData);
    // After success:
    setIsAdding(false);
    setEditingItem(null);
    refreshData();
  };

  if (isAdding || editingItem) {
    return (
      <AddEventModal
        initialData={editingItem}
        onSave={handleSave}
        onCancel={() => {
          setIsAdding(false);
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Events & Group bookings</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" /> Add Group Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((event, index) => (
          <div key={event?.id ?? index} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {event.image && (
                <img src={event.image} alt="" className="h-40 w-full object-cover" />
            )}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">{event?.header || "N/A"}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-2">{event?.description}</p>
              
              <div className="flex gap-2 border-t pt-4 mt-4">
                <button
                  onClick={() => setEditingItem(event)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsTab;