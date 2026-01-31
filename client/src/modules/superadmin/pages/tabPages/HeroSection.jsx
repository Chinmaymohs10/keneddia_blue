// components/HeroSection.jsx
import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import { Loader2, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { createOrUpdateHeroSection, getHeroSection } from "@/Api/Api";
import { toast } from "react-hot-toast";
import AddHeroSectionModal from "../../modals/AddHeroSectionModal";

function HeroSection() {
  const [heroSections, setHeroSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch hero section data
  const fetchHeroSection = useCallback(async () => {
    try {
      setFetching(true);
      const response = await getHeroSection();

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Sort by ID descending (latest first)
        const sortedData = [...response.data].sort((a, b) => b.id - a.id);
        setHeroSections(sortedData);
        console.log("Loaded Hero Sections:", sortedData.length);
      } else {
        setHeroSections([]);
      }
    } catch (error) {
      console.error("Error fetching hero section:", error);
      toast.error("Failed to load hero sections");
      setHeroSections([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroSection();
  }, [fetchHeroSection]);

  const handleAddNew = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (section) => {
    setEditData({
      id: section.id,
      mainTitle: section.mainTitle,
      subTitle: section.subTitle,
      ctaText: section.ctaText,
      backgroundPreview: section.backgroundMediaUrl,
      backgroundMediaType: section.backgroundMediaType,
      subPreview: section.subMediaUrl,
      subMediaType: section.subMediaType,
      active: section.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero section?")) {
      return;
    }

    try {
      setLoading(true);
      // await deleteHeroSection(id);
      toast.success("Hero section deleted successfully!");
      await fetchHeroSection();
    } catch (error) {
      console.error("Error deleting hero section:", error);
      toast.error(error?.response?.data?.message || "Failed to delete hero section");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = async (payload) => {
    try {
      await createOrUpdateHeroSection(payload);
      await fetchHeroSection();
    } catch (error) {
      throw error;
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(heroSections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = heroSections.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (fetching) {
    return (
      <div
        className="rounded-lg p-6 shadow-sm flex items-center justify-center h-[600px]"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Loading hero sections...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: colors.contentBg }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold m-0" style={{ color: colors.textPrimary }}>
            Hero Sections
          </h2>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 border-none rounded-md text-sm font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: colors.sidebarText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            <Plus size={16} />
            <span>Add Hero Section</span>
          </button>
        </div>

        {/* Table */}
        {heroSections.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: colors.textSecondary }}
          >
            <p className="text-sm">No hero sections found. Create your first one!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: colors.border }}>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      ID
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      Preview
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      Main Title
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      Subtitle
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      CTA Text
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      Status
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((section, index) => (
                    <tr
                      key={section.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <td className="px-4 py-3 text-xs" style={{ color: colors.textPrimary }}>
                        #{section.id}
                      </td>
                      <td className="px-4 py-3">
                        {section.backgroundMediaUrl && (
                          section.backgroundMediaType === "IMAGE" ? (
                            <img
                              src={section.backgroundMediaUrl}
                              alt="Background"
                              className="w-20 h-12 object-cover rounded"
                            />
                          ) : (
                            <video
                              src={section.backgroundMediaUrl}
                              className="w-20 h-12 object-cover rounded"
                              muted
                            />
                          )
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: colors.textPrimary }}>
                        {section.mainTitle || <span style={{ color: colors.textSecondary }}>-</span>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: colors.textPrimary }}>
                        {section.subTitle || <span style={{ color: colors.textSecondary }}>-</span>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: colors.textPrimary }}>
                        {section.ctaText || <span style={{ color: colors.textSecondary }}>-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: section.active ? "#dcfce7" : "#fee",
                            color: section.active ? "#16a34a" : "#ef4444",
                          }}
                        >
                          {section.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(section)}
                            className="p-1.5 border-none rounded cursor-pointer transition-colors"
                            style={{ backgroundColor: "transparent" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.border;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            title="Edit"
                          >
                            <Edit2 size={14} style={{ color: colors.primary }} />
                          </button>
                          <button
                            onClick={() => handleDelete(section.id)}
                            disabled={loading}
                            className="p-1.5 border-none rounded cursor-pointer transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "transparent" }}
                            onMouseEnter={(e) => {
                              if (!loading) {
                                e.currentTarget.style.backgroundColor = "#fee";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: "#ef4444" }} />
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
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs m-0" style={{ color: colors.textSecondary }}>
                  Showing {startIndex + 1} to {Math.min(endIndex, heroSections.length)} of{" "}
                  {heroSections.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border-none rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.border }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = colors.border;
                      }
                    }}
                  >
                    <ChevronLeft size={16} style={{ color: colors.textPrimary }} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className="px-3 py-1.5 border-none rounded text-xs font-medium cursor-pointer transition-colors"
                      style={{
                        backgroundColor: page === currentPage ? colors.primary : colors.border,
                        color: page === currentPage ? colors.sidebarText : colors.textPrimary,
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border-none rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.border }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = colors.border;
                      }
                    }}
                  >
                    <ChevronRight size={16} style={{ color: colors.textPrimary }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AddHeroSectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSuccess={handleModalSuccess}
        editData={editData}
      />
    </>
  );
}

export default HeroSection;