import React, { useState, useEffect, useCallback } from "react";
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon, 
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import { getRoomsByPropertyId, deleteOrDeactivateRoom } from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import AddRoomModal from "../modals/AddRoomModal";

const RoomsTab = ({ propertyData }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const propId = propertyData?.id || propertyData?.propertyId;

  const fetchRooms = useCallback(async () => {
    if (!propId) return;
    setLoading(true);
    try {
      const response = await getRoomsByPropertyId(propId);
      // Accessing response.data based on your shared snippet
      const data = response?.data || response;
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Rooms Fetch Error:", error);
      showError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, [propId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete/deactivate this room?")) return;
    
    setDeletingId(roomId);
    try {
      await deleteOrDeactivateRoom(roomId);
      showSuccess("Room status updated successfully");
      await fetchRooms(); // Refresh the list
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete room");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter logic: Only show active rooms unless showDeleted is true
  const filteredRooms = rooms.filter(room => showDeleted || room.active);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Rooms & Suites</h2>
          <p className="text-xs text-gray-500">Showing {filteredRooms.length} rooms</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Trash Toggle */}
          {/* <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              showDeleted ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            {showDeleted ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
            {showDeleted ? "Showing Deactivated" : "Show Deactivated"}
          </button> */}

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg transition-all hover:shadow-md active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <PlusIcon className="w-5 h-5" /> Add Room
          </button>
        </div>
      </div>

      <div className="overflow-hidden border rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Room Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {loading && filteredRooms.length === 0 ? (
               <tr>
                <td colSpan="6" className="px-6 py-10 text-center">
                  <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                </td>
               </tr>
            ) : filteredRooms.map((room) => (
              <tr 
                key={room.roomId} 
                className={`hover:bg-gray-50 transition-colors ${!room.active ? "bg-red-50/30 opacity-70 grayscale-[0.5]" : ""}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-gray-900">
                      {room.roomName || "Unnamed Room"}
                    </div>
                    {!room.active && (
                      <span className="bg-red-100 text-red-700 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Deactivated</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">#{room.roomNumber} | {room.roomSize} {room.roomSizeUnit}</div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenitiesAndFeatures?.slice(0, 3).map((amenity) => (
                      <span key={amenity.id} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {amenity.name}
                      </span>
                    ))}
                    {room.amenitiesAndFeatures?.length > 3 && (
                      <span className="text-[10px] text-gray-400 self-center">+{room.amenitiesAndFeatures.length - 3}</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  {room.roomType}
                </td>

                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  ₹{room.basePrice?.toLocaleString()}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {room.maxOccupancy} Guests
                </td>

                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    room.status === "AVAILABLE" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {room.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.roomId)}
                      disabled={deletingId === room.roomId}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === room.roomId ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <TrashIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filteredRooms.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                   No rooms available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyData={propertyData}
          initialData={selectedRoom}
          onSuccess={() => {
            fetchRooms();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default RoomsTab;