import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Video,
  ImageIcon,
  Calendar,
  Pencil,
  X,
  Tag,
  Type,
} from "lucide-react";
import {
  getGuestExperienceSection,
  deleteGuestExperience,
  addGuestExperienceSectionHeader,
  getGuestExperienceSectionHeader,
  addGuestExperineceRatingHeader,
  getGuestExperineceRatingHeader,
} from "@/Api/Api";
import { toast } from "react-hot-toast";

const formatDateTime = (isoString) => {
  if (!isoString) return { date: "—", time: "—" };
  const dt = new Date(isoString);
  const date = dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = dt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
};

function GuestExp() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Header state
  const [headerData, setHeaderData] = useState(null);
  const [headerFetching, setHeaderFetching] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form, setForm] = useState({ sectionTag: "", title: "" });

  const [ratingForm, setRatingForm] = useState({ description: "", rating: "" });
  const [savingRating, setSavingRating] = useState(false);
  const [ratingData, setRatingData] = useState(null);

  // Fetch header
  const fetchHeader = useCallback(async () => {
    try {
      setHeaderFetching(true);
      const response = await getGuestExperienceSectionHeader();
      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      if (data) setHeaderData(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching header:", error);
      }
    } finally {
      setHeaderFetching(false);
    }
  }, []);

  const fetchRating = useCallback(async () => {
    try {
      const res = await getGuestExperineceRatingHeader();
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      if (data) {
        setRatingData(data);
        setRatingForm({
          description: data.description || "",
          rating: data.rating || "",
        });
      }
    } catch (err) {
      if (err.response?.status !== 404)
        console.error("Error fetching rating:", err);
    }
  }, []);
  const handleSaveRating = async () => {
    try {
      setSavingRating(true);
      await addGuestExperineceRatingHeader({
        description: ratingForm.description,
        rating: parseFloat(ratingForm.rating),
      });
      toast.success("Rating header saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save rating");
    } finally {
      setSavingRating(false);
    }
  };

  // Fetch experiences
  const fetchGuestExperience = useCallback(async () => {
    try {
      setFetching(true);
      const response = await getGuestExperienceSection();
      const items = Array.isArray(response.data) ? response.data : [];
      const sorted = [...items].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setExperiences(sorted);
    } catch (error) {
      console.error("Error fetching guest experience:", error);
      toast.error("Failed to load guest experience data");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchHeader();
    fetchGuestExperience();
  }, [fetchHeader, fetchGuestExperience]);

  const openModal = () => {
    setForm({
      sectionTag: headerData?.sectionTag || "",
      title: headerData?.title || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ sectionTag: "", title: "" });
  };

  const handleModalSubmit = async () => {
    if (!form.sectionTag.trim() || !form.title.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      setModalLoading(true);
      await addGuestExperienceSectionHeader({
        sectionTag: form.sectionTag.trim(),
        title: form.title.trim(),
      });
      toast.success(
        headerData
          ? "Header updated successfully"
          : "Header saved successfully",
      );
      await fetchHeader();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save header");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience?"))
      return;
    try {
      setLoading(true);
      await deleteGuestExperience(id);
      toast.success("Experience deleted successfully");
      fetchGuestExperience();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete experience");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(experiences.length / itemsPerPage);
  const currentExperiences = experiences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-4">
      {/* ── Header Card ── */}
      <div
        className="rounded-lg shadow-sm p-5"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-sm font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Section Header
          </h3>
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-white transition-colors hover:opacity-90"
          >
            <Pencil size={13} />
            {headerData ? "Edit Header" : "Add Header"}
          </button>
        </div>

        {headerFetching ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2
              size={14}
              className="animate-spin"
              style={{ color: colors.primary }}
            />
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              Loading header...
            </span>
          </div>
        ) : headerData ? (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Section Tag */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1"
              style={{
                backgroundColor: colors.mainBg,
                borderColor: colors.border,
              }}
            >
              <Tag size={13} style={{ color: colors.primary }} />
              <div>
                <p
                  className="text-[10px] uppercase font-semibold tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  Section Tag
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {headerData.sectionTag}
                </p>
              </div>
            </div>
            {/* Title */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-[2]"
              style={{
                backgroundColor: colors.mainBg,
                borderColor: colors.border,
              }}
            >
              <Type size={13} style={{ color: colors.primary }} />
              <div>
                <p
                  className="text-[10px] uppercase font-semibold tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  Title
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {headerData.title}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs py-2" style={{ color: colors.textSecondary }}>
            No header configured yet. Click <strong>Add Header</strong> to set
            one.
          </p>
        )}
      </div>

      {/* ── Rating Header Card ── */}
      <div
        className="rounded-lg shadow-sm p-5"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-sm font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Rating Header
          </h3>
          <button
            onClick={handleSaveRating}
            disabled={savingRating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-white hover:opacity-90 disabled:opacity-50"
          >
            {savingRating && <Loader2 size={13} className="animate-spin" />}
            Save Rating
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Description
            </label>
            <input
              type="text"
              value={ratingForm.description}
              onChange={(e) =>
                setRatingForm({ ...ratingForm, description: e.target.value })
              }
              placeholder="Excellent stay experience with great service."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              style={{
                backgroundColor: colors.mainBg,
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Rating (0 – 5)
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={ratingForm.rating}
              onChange={(e) =>
                setRatingForm({ ...ratingForm, rating: e.target.value })
              }
              placeholder="4.5"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              style={{
                backgroundColor: colors.mainBg,
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-lg shadow-sm overflow-hidden"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="p-5 border-b" style={{ borderColor: colors.border }}>
          <h3
            className="text-sm font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Guest Experiences List
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: colors.mainBg }}>
                <th
                  className="p-4 text-xs font-semibold uppercase"
                  style={{ color: colors.textSecondary }}
                >
                  Media
                </th>
                <th
                  className="p-4 text-xs font-semibold uppercase"
                  style={{ color: colors.textSecondary }}
                >
                  Details
                </th>
                <th
                  className="p-4 text-xs font-semibold uppercase"
                  style={{ color: colors.textSecondary }}
                >
                  Author
                </th>
                <th
                  className="p-4 text-xs font-semibold uppercase"
                  style={{ color: colors.textSecondary }}
                >
                  Added On
                </th>
                <th
                  className="p-4 text-xs font-semibold uppercase text-right"
                  style={{ color: colors.textSecondary }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: colors.border }}>
              {fetching ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <Loader2
                      className="animate-spin mx-auto mb-2"
                      style={{ color: colors.primary }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Fetching experiences...
                    </span>
                  </td>
                </tr>
              ) : currentExperiences.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    No experiences found.
                  </td>
                </tr>
              ) : (
                currentExperiences.map((exp) => {
                  const { date, time } = formatDateTime(exp.createdAt);
                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-black/5 transition-colors"
                    >
                      {/* Media */}
                      <td className="p-4">
                        <div
                          className="w-16 h-12 rounded bg-gray-200 overflow-hidden border flex items-center justify-center"
                          style={{ borderColor: colors.border }}
                        >
                          {exp.videoUrl ? (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                              <Video
                                size={16}
                                className="text-white opacity-70"
                              />
                              <span className="absolute bottom-0.5 right-1 text-[8px] text-white font-bold">
                                MP4
                              </span>
                            </div>
                          ) : exp.imageUrl ? (
                            <img
                              src={exp.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* Details */}
                      <td className="p-4">
                        <div
                          className="text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {exp.title}
                        </div>
                        <div
                          className="text-xs line-clamp-1 max-w-[300px]"
                          style={{ color: colors.textSecondary }}
                        >
                          {exp.description}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-4">
                        <div
                          className="text-sm font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {exp.author}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: colors.textSecondary }}
                        >
                          {exp.authorEmail || "No Email"}
                        </div>
                      </td>

                      {/* Added On */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            size={12}
                            style={{ color: colors.textSecondary }}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.textPrimary }}
                          >
                            {date}
                          </span>
                        </div>
                        <div
                          className="text-[10px] mt-0.5 pl-[18px]"
                          style={{ color: colors.textSecondary }}
                        >
                          {time}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          disabled={loading}
                          className="p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          style={{ color: "#ef4444" }}
                          title="Delete Experience"
                        >
                          {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="p-4 flex items-center justify-between border-t"
          style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}
        >
          <span className="text-xs" style={{ color: colors.textSecondary }}>
            Showing {currentExperiences.length} of {experiences.length} items
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border disabled:opacity-30"
              style={{ borderColor: colors.border, color: colors.textPrimary }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="text-xs font-medium"
              style={{ color: colors.textPrimary }}
            >
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded border disabled:opacity-30"
              style={{ borderColor: colors.border, color: colors.textPrimary }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Box */}
          <div
            className="relative w-full max-w-md rounded-xl shadow-2xl z-10"
            style={{ backgroundColor: colors.contentBg }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <h4
                className="text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {headerData ? "Edit Section Header" : "Add Section Header"}
              </h4>
              <button
                onClick={closeModal}
                className="p-1.5 rounded hover:bg-black/10 transition-colors"
                style={{ color: colors.textSecondary }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 py-4 space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  Section Tag
                </label>
                <input
                  type="text"
                  value={form.sectionTag}
                  onChange={(e) =>
                    setForm({ ...form, sectionTag: e.target.value })
                  }
                  placeholder="e.g. Guest Experience"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={{
                    backgroundColor: colors.mainBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: colors.textSecondary }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Welcome to Our Hotel"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={{
                    backgroundColor: colors.mainBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-end gap-2 px-5 py-4 border-t"
              style={{ borderColor: colors.border }}
            >
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-black/5"
                style={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={modalLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white disabled:opacity-50 transition-colors"
              >
                {modalLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Pencil size={14} />
                )}
                {headerData ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestExp;
