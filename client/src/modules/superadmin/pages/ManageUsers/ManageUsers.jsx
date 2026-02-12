import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import Layout from "@/modules/layout/Layout";
import {
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AddUserModal from "../../modals/AddUserModal";
import { getUsersPaginated } from "@/Api/Api";

function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const itemsPerPage = 5;

  const roleOptions = [
    // "All Roles",
    "ROLE_SUPERADMIN",
    "ROLE_ADMIN",
    // "ROLE_MANAGER",
    // "ROLE_HotelManager",
  ];
  const statusOptions = ["All Status", "Active", "Inactive"];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsersPaginated({
        page: currentPage,
        size: itemsPerPage,
      });

      console.log("Full API Response:", response);

      // Handle different response structures
      let data = response;

      // If response is wrapped in data property (axios)
      if (response?.data) {
        data = response.data;
      }

      console.log("Parsed data:", data);

      if (data && data.content) {
        setUsers(data.content);
        setHasNext(data.hasNext || false);
        console.log("Users set:", data.content);
      } else if (Array.isArray(data)) {
        // If API returns array directly
        setUsers(data);
        setHasNext(false);
      } else {
        console.warn("Unexpected response structure:", data);
        setUsers([]);
        setHasNext(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowRoleDropdown(false);
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getFilteredUsers = () => {
    let filtered = [...users];

    // 1. Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(lowerSearch) ||
          u.email?.toLowerCase().includes(lowerSearch) ||
          u.userName?.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Role Filter
    if (roleFilter !== "All Roles") {
      filtered = filtered.filter(
        (u) => u.roleName?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // 3. Status Filter
    if (statusFilter !== "All Status") {
      const isActiveTarget = statusFilter === "Active";
      filtered = filtered.filter((u) => u.isActive === isActiveTarget);
    }

    return filtered;
  };

  const displayUsers = getFilteredUsers();

  const handlePageChange = (newPage) => {
    if (newPage >= 1) setCurrentPage(newPage);
  };

  const handleDeleteUser = (userId) => {
    // TODO: Implement delete API call
    console.log("Delete user:", userId);
    setShowDeleteConfirm(null);
    // After successful delete, refresh the list
    // fetchUsers();
  };

  return (
    <Layout role="superadmin" showActions={false}>
      <div className="h-full overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-xl font-semibold mb-1"
                  style={{ color: colors.textPrimary }}
                >
                  User Management
                </h2>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Manage your Users
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                + Add User
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between gap-4">
              <h3
                className="text-base font-semibold"
                style={{ color: colors.textPrimary }}
              >
                All Users ({users.length})
              </h3>
              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: colors.textSecondary }}
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 w-64"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.background,
                    }}
                  />
                </div>

                {/* Role Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(!showRoleDropdown);
                      setShowStatusDropdown(false);
                    }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 min-w-[160px] justify-between"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: "white",
                    }}
                  >
                    {roleFilter === "All Roles"
                      ? "All Roles"
                      : roleFilter.replace("ROLE_", "")}
                    <ChevronDown size={16} />
                  </button>
                  {showRoleDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-lg border z-10"
                      style={{ borderColor: colors.border }}
                    >
                      {roleOptions.map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setRoleFilter(role);
                            setShowRoleDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                          style={{
                            backgroundColor:
                              roleFilter === role ? colors.background : "white",
                            color: "#111827",
                          }}
                        >
                          {role === "All Roles"
                            ? role
                            : role.replace("ROLE_", "")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowRoleDropdown(false);
                    }}
                    className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 min-w-[140px] justify-between"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: "white",
                    }}
                  >
                    {statusFilter}
                    <ChevronDown size={16} />
                  </button>
                  {showStatusDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-lg border z-10"
                      style={{ borderColor: colors.border }}
                    >
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                          style={{
                            backgroundColor:
                              statusFilter === status
                                ? colors.background
                                : "white",
                            color: "#111827",
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: colors.primary }}
                ></div>
              </div>
            ) : displayUsers.length === 0 ? (
              <div
                className="text-center py-20 text-sm"
                style={{ color: colors.textSecondary }}
              >
                No users found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: colors.background }}>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      User
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Role
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Contact
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Location
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
                            style={{
                              backgroundColor: colors.primary + "20",
                              color: colors.primary,
                            }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: colors.textPrimary }}
                            >
                              {user.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: "#3b82f615",
                            color: "#3b82f6",
                          }}
                        >
                          {user.roleName?.replace("ROLE_", "") || "N/A"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.textPrimary }}
                      >
                        {user.contact || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.textPrimary }}
                      >
                        {user.locationName || "Not Assigned"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: user.isActive
                              ? "#10b98115"
                              : "#ef444415",
                            color: user.isActive ? "#10b981" : "#ef4444",
                          }}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Edit2 size={16} style={{ color: colors.primary }} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Page {currentPage} • Showing {displayUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-50">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext || loading}
                className="p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: colors.textPrimary }}
            >
              Delete User
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                style={{ borderColor: colors.border }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
                style={{ backgroundColor: "#ef4444" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchUsers();
            setShowAddModal(false);
          }}
        />
      )}
    </Layout>
  );
}

export default ManageUsers;