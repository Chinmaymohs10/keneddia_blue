import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Edit,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Video,
} from "lucide-react";
import { toast } from "react-hot-toast";
import CreateEventModal from "../../modals/CreateEventModal";
import { getEventsUpdated, updateEventStatus } from "@/Api/Api";

function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getEventsUpdated();
      // Based on your latest format, the data is directly in res.data or res
      const data = res?.data || res;

      if (data && Array.isArray(data)) {
        // We keep both active and inactive so they can be managed
        const allEvents = [...data].reverse();
        setEvents(allEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = events.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      setStatusLoading(id);
      const nextStatus = !currentStatus;
      await updateEventStatus(id, nextStatus);

      toast.success(`Event ${nextStatus ? "Activated" : "Deactivated"}`);

      setEvents((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, active: nextStatus } : ev)),
      );
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setShowModal(false);
    setEditingEvent(null);
    if (shouldRefresh) fetchEvents();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status, isActive) => {
    const statusColors = {
      ACTIVE: colors.success,
      COMING_SOON: colors.warning,
      SOLD_OUT: colors.error,
      CANCELLED: colors.textSecondary,
    };

    return (
      <div className="flex flex-col items-center gap-1">
        <span
          className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block min-w-[85px] text-center"
          style={{
            backgroundColor: statusColors[status] || colors.textSecondary,
            color: "#ffffff",
          }}
        >
          {status ? status.replace("_", " ") : "UNKNOWN"}
        </span>
        {!isActive && (
          <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">
            Inactive
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm mb-3"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-base sm:text-lg font-semibold m-0"
              style={{ color: colors.textPrimary }}
            >
              Upcoming Events
            </h2>
            <p
              className="text-xs mt-1 mb-0"
              style={{ color: colors.textSecondary }}
            >
              Manage and toggle events for the guest application
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs sm:text-sm font-bold text-white transition-all active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div
        className="rounded-lg shadow-sm overflow-hidden"
        style={{ backgroundColor: colors.contentBg }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.primary }}
            />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar
              size={48}
              style={{ color: colors.textSecondary }}
              className="mb-3 opacity-30"
            />
            <p
              className="text-sm font-medium"
              style={{ color: colors.textPrimary }}
            >
              No events found
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: colors.mainBg,
                      borderColor: colors.border,
                    }}
                  >
                    <th
                      className="text-left px-4 py-4 text-xs font-bold uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      Media
                    </th>
                    <th
                      className="text-left px-4 py-4 text-xs font-bold uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      Event Info
                    </th>
                    <th
                      className="text-left px-4 py-4 text-xs font-bold uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      Location
                    </th>
                    <th
                      className="text-left px-4 py-4 text-xs font-bold uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      Date
                    </th>
                    <th
                      className="text-center px-4 py-4 text-xs font-bold uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      Status
                    </th>
                    <th
                      className="text-center px-4 py-4 text-xs font-bold uppercase"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b transition-colors hover:bg-gray-50/50"
                      style={{
                        borderColor: colors.border,
                        opacity: event.active ? 1 : 0.65,
                      }}
                    >
                      <td className="px-4 py-3">
                        <div
                          className="w-14 h-14 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center"
                          style={{ borderColor: colors.border }}
                        >
                          {event.image?.url ? (
                            event.image.type === "VIDEO" ? (
                              <div className="relative w-full h-full bg-black">
                                <video
                                  src={event.image.url}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                />

                                {/* Video badge */}
                                <div className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1 rounded">
                                  VIDEO
                                </div>
                              </div>
                            ) : (
                              <img
                                src={event.image.url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <ImageIcon size={20} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px]">
                          <h3
                            className="text-sm font-bold truncate"
                            style={{ color: colors.textPrimary }}
                          >
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                              {event.typeName || "General"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          <MapPin size={12} className="text-gray-400" />
                          {event.locationName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {formatDate(event.eventDate)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(event.status, event.active)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleStatusToggle(event.id, event.active)
                            }
                            disabled={statusLoading === event.id}
                            className="p-2 rounded-lg border transition-all hover:shadow-sm bg-white"
                            style={{
                              borderColor: colors.border,
                              color: event.active
                                ? colors.success
                                : colors.textSecondary,
                            }}
                            title={
                              event.active
                                ? "Click to Deactivate"
                                : "Click to Activate"
                            }
                          >
                            {statusLoading === event.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : event.active ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 rounded-lg border bg-white transition-all hover:shadow-sm"
                            style={{
                              borderColor: colors.border,
                              color: colors.primary,
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-6 py-4 border-t"
                style={{ borderColor: colors.border }}
              >
                <span className="text-xs font-medium text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1.5 rounded-md border disabled:opacity-30 hover:bg-gray-50"
                    style={{ borderColor: colors.border }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1.5 rounded-md border disabled:opacity-30 hover:bg-gray-50"
                    style={{ borderColor: colors.border }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <CreateEventModal
          isOpen={showModal}
          onClose={handleCloseModal}
          editingEvent={editingEvent}
        />
      )}
    </div>
  );
}

export default UpcomingEvents;
