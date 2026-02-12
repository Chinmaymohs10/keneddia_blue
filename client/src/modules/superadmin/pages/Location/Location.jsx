import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  MapPin,
  Search,
  Edit2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import AddLocationModal from "../../modals/AddLocationModal";
import { getAllLocations, updateLocationStatus } from "@/Api/Api";
import { showSuccess, showInfo, showError, showWarning } from "@/lib/toasters/toastUtils";

function Location() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const statusOptions = ["All Status", "Active", "Inactive"];

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await getAllLocations();
      let data = response?.data || response;
      if (Array.isArray(data)) {
        setLocations(data);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      showError("Failed to load locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleToggleStatus = async (location) => {
    try {
      setToggleLoading(location.id);
      await updateLocationStatus(location.id, !location.isActive);
      showSuccess(`Location marked as ${!location.isActive ? 'Active' : 'Inactive'}`);
      fetchLocations();
    } catch (error) {
      console.error("Error toggling status:", error);
      showError("Failed to update status");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleEditClick = (location) => {
    setEditingLocation(location);
    setShowAddModal(true);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getFilteredAndSortedLocations = () => {
    let filteredLocations = [...locations];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredLocations = filteredLocations.filter(
        (location) =>
          location.locationName?.toLowerCase().includes(lowerSearch) ||
          location.state?.toLowerCase().includes(lowerSearch) ||
          location.country?.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "All Status") {
      const isActiveTarget = statusFilter === "Active";
      filteredLocations = filteredLocations.filter(
        (location) => location.isActive === isActiveTarget
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredLocations.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return filteredLocations;
  };

  const filteredLocations = getFilteredAndSortedLocations();
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <Layout role="superadmin" showActions={false}>
      <div className="h-full overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Locations
                </h2>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Manage your locations ({filteredLocations.length} total)
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingLocation(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                + Add Location
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b" style={{ borderColor: colors.border }}>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by location, state, or country..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ borderColor: colors.border }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors min-w-[140px]"
                  style={{ borderColor: colors.border }}
                >
                  <span>{statusFilter}</span>
                  <ChevronDown size={16} />
                </button>

                {showStatusDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusDropdown(false)}
                    />
                    <div
                      className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20"
                      style={{ borderColor: colors.border }}
                    >
                      {statusOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setStatusFilter(option);
                            setShowStatusDropdown(false);
                            setCurrentPage(1); // Reset to first page on filter change
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          style={{
                            backgroundColor:
                              statusFilter === option ? colors.mainBg : "transparent",
                            color: colors.textPrimary,
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2
                  size={32}
                  className="animate-spin"
                  style={{ color: colors.primary }}
                />
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MapPin
                  size={48}
                  style={{ color: colors.textSecondary }}
                  className="mb-3 opacity-30"
                />
                <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  No locations found
                </p>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  {searchTerm || statusFilter !== "All Status"
                    ? "Try adjusting your filters"
                    : "Create your first location to get started"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: colors.mainBg }}>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                      S.No
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      style={{ color: colors.textSecondary }}
                      onClick={() => handleSort("locationName")}
                    >
                      <div className="flex items-center gap-2">
                        Location Name
                        {sortConfig.key === "locationName" && (
                          <span className="text-xs">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      style={{ color: colors.textSecondary }}
                      onClick={() => handleSort("state")}
                    >
                      <div className="flex items-center gap-2">
                        State
                        {sortConfig.key === "state" && (
                          <span className="text-xs">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      style={{ color: colors.textSecondary }}
                      onClick={() => handleSort("country")}
                    >
                      <div className="flex items-center gap-2">
                        Country
                        {sortConfig.key === "country" && (
                          <span className="text-xs">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedLocations.map((location, index) => (
                    <tr
                      key={location.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ opacity: location.isActive ? 1 : 0.6 }}
                    >
                      {/* Serial Number */}
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: colors.textSecondary }}>
                        {startIndex + index + 1}
                      </td>

                      {/* Location Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <MapPin size={16} style={{ color: colors.primary }} />
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                            {location.locationName || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* State */}
                      <td className="px-6 py-4 text-sm" style={{ color: colors.textPrimary }}>
                        {location.state || "N/A"}
                      </td>

                      {/* Country */}
                      <td className="px-6 py-4 text-sm" style={{ color: colors.textPrimary }}>
                        {location.country || "N/A"}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(location)}
                          disabled={toggleLoading === location.id}
                          className="flex items-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {toggleLoading === location.id ? (
                            <Loader2 size={20} className="animate-spin text-gray-400" />
                          ) : location.isActive ? (
                            <ToggleRight size={24} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={24} className="text-gray-400" />
                          )}
                          <span
                            className="text-xs font-medium"
                            style={{ color: location.isActive ? "#10b981" : "#ef4444" }}
                          >
                            {location.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(location)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit location"
                          >
                            <Edit2 size={16} style={{ color: colors.primary }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && filteredLocations.length > 0 && totalPages > 1 && (
            <div
              className="flex items-center justify-between px-6 py-4 border-t"
              style={{ borderColor: colors.border }}
            >
              <div className="text-xs" style={{ color: colors.textSecondary }}>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredLocations.length)} of{" "}
                {filteredLocations.length} locations
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border transition-all disabled:opacity-30 hover:bg-gray-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    // Calculate which pages to show
                    let pageNumber;
                    if (totalPages <= 5) {
                      // Show all pages if 5 or fewer
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      // Show first 5 pages
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // Show last 5 pages
                      pageNumber = totalPages - 4 + index;
                    } else {
                      // Show current page in middle
                      pageNumber = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                        style={{
                          backgroundColor:
                            currentPage === pageNumber ? colors.primary : colors.mainBg,
                          color:
                            currentPage === pageNumber ? "#ffffff" : colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border transition-all disabled:opacity-30 hover:bg-gray-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddLocationModal
          initialData={editingLocation}
          onClose={() => {
            setShowAddModal(false);
            setEditingLocation(null);
          }}
          onSuccess={() => {
            fetchLocations();
            setShowAddModal(false);
            setEditingLocation(null);
          }}
        />
      )}
    </Layout>
  );
}

export default Location;