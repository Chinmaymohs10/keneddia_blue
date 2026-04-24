import React, { useState, useEffect, useCallback } from "react";
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon, 
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import {
  createRoomType,
  deleteOrDeactivateRoom,
  deleteRoomType,
  getAllRoomTypes,
  getRoomsByPropertyId,
} from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import AddRoomModal from "../modals/AddRoomModal";

const sortRoomsByDisplayOrder = (roomList) =>
  [...roomList].sort((a, b) => {
    const orderA = Number.isFinite(Number(a.displayOrder))
      ? Number(a.displayOrder)
      : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(Number(b.displayOrder))
      ? Number(b.displayOrder)
      : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return Number(a.roomId || 0) - Number(b.roomId || 0);
  });

const RoomsTab = ({ propertyData }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [newRoomTypeName, setNewRoomTypeName] = useState("");
  const [savingRoomType, setSavingRoomType] = useState(false);
  const [deletingRoomTypeId, setDeletingRoomTypeId] = useState(null);

  const propId = propertyData?.id || propertyData?.propertyId;

  const fetchRooms = useCallback(async () => {
    if (!propId) return;
    setLoading(true);
    try {
      const response = await getRoomsByPropertyId(propId);
      // Accessing response.data based on your shared snippet
      const data = response?.data || response;
      setRooms(Array.isArray(data) ? sortRoomsByDisplayOrder(data) : []);
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

  const fetchRoomTypes = useCallback(async () => {
    setLoadingRoomTypes(true);
    try {
      const response = await getAllRoomTypes();
      const data = response?.data?.data || response?.data || response || [];
      setRoomTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Room Types Fetch Error:", error);
      showError("Failed to load room types");
    } finally {
      setLoadingRoomTypes(false);
    }
  }, []);

  useEffect(() => {
    if (isRoomTypeModalOpen) {
      fetchRoomTypes();
    }
  }, [isRoomTypeModalOpen, fetchRoomTypes]);

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleCreateRoomType = async () => {
    const name = newRoomTypeName.trim().toUpperCase();
    if (!name) return;

    setSavingRoomType(true);
    try {
      await createRoomType({ name, active: true });
      showSuccess("Room type added successfully");
      setNewRoomTypeName("");
      await fetchRoomTypes();
    } catch (error) {
      console.error("Create Room Type Error:", error);
      showError(error?.response?.data?.message || "Failed to create room type");
    } finally {
      setSavingRoomType(false);
    }
  };

  const handleDeleteRoomType = async (roomTypeId) => {
    if (!window.confirm("Are you sure you want to delete this room type?")) return;

    setDeletingRoomTypeId(roomTypeId);
    try {
      await deleteRoomType(roomTypeId);
      showSuccess("Room type deleted successfully");
      await fetchRoomTypes();
    } catch (error) {
      console.error("Delete Room Type Error:", error);
      showError(error?.response?.data?.message || "Failed to delete room type");
    } finally {
      setDeletingRoomTypeId(null);
    }
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
  const filteredRooms = sortRoomsByDisplayOrder(
    rooms.filter(room => showDeleted || room.active),
  );
  const getRoomPreviewImage = (room) =>
    room?.media?.find((item) => item?.type === "IMAGE" && item?.url)?.url ||
    room?.media?.find((item) => item?.url)?.url ||
    "";

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
            onClick={() => setIsRoomTypeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            Manage Room Types
          </button>

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
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Settings</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {loading && filteredRooms.length === 0 ? (
               <tr>
                <td colSpan="7" className="px-6 py-10 text-center">
                  <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                </td>
               </tr>
            ) : filteredRooms.map((room) => (
              <tr 
                key={room.roomId} 
                className={`hover:bg-gray-50 transition-colors ${!room.active ? "bg-red-50/30 opacity-70 grayscale-[0.5]" : ""}`}
              >
                <td className="px-6 py-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                      {getRoomPreviewImage(room) ? (
                        <img
                          src={getRoomPreviewImage(room)}
                          alt={room.roomName || "Room"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-bold text-gray-900">
                          {room.roomName || "Unnamed Room"}
                        </div>
                        {!room.active && (
                          <span className="bg-red-100 text-red-700 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Deactivated</span>
                        )}
                      </div>

                      <div className="text-[10px] text-gray-400 font-medium mt-1">
                        Room ID: {room.roomId} | Property ID: {room.propertyId}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        #{room.roomNumber} | Floor {room.floorNumber} | Order {room.displayOrder ?? "Not set"} | {room.roomSize ?? "N/A"} {room.roomSizeUnit || "SQ_FT"}
                      </div>

                      {room.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {room.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.amenitiesAndFeatures?.map((amenity) => (
                          <span key={amenity.id} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  <div className="space-y-1">
                    <div>{room.roomType}</div>
                    {room.roomTypeName && (
                      <div className="text-[10px] text-gray-400">{room.roomTypeName}</div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  <div className="space-y-1">
                    <div>{`${room.basePrice?.toLocaleString()}`}</div>
                    <div className="text-[11px] font-medium text-emerald-600">
                      {`Discount: ${Number(room.discount || 0).toLocaleString()}%`}
                    </div>
                  </div>
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

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
                      room.bookable ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {room.bookable ? "Bookable" : "Not Bookable"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
                      room.active ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                    }`}>
                      {room.active ? "Active" : "Inactive"}
                    </span>
                  </div>
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
                <td colSpan="7" className="px-6 py-20 text-center text-gray-500">
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

      {isRoomTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Room Types</h3>
                <p className="text-xs text-gray-500 mt-1">Create and delete room type entries used in room forms.</p>
              </div>
              <button
                onClick={() => setIsRoomTypeModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newRoomTypeName}
                  onChange={(e) => setNewRoomTypeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateRoomType();
                    }
                  }}
                  placeholder="Enter room type name"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
                <button
                  onClick={handleCreateRoomType}
                  disabled={savingRoomType || !newRoomTypeName.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {savingRoomType ? "Saving..." : "Add Type"}
                </button>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 bg-gray-50 border-b">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Room Type</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Action</span>
                </div>

                {loadingRoomTypes ? (
                  <div className="py-10 text-center">
                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  </div>
                ) : roomTypes.length > 0 ? (
                  roomTypes.map((type) => (
                    <div
                      key={type.id}
                      className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 border-b last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">{type.name}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                          {type.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteRoomType(type.id)}
                        disabled={deletingRoomTypeId === type.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingRoomTypeId === type.id ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <TrashIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-sm text-gray-500">
                    No room types available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsTab;
