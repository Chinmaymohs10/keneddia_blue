// components/HeroSection.jsx
import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import { Loader2, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getHeroSectionsPaginated } from "@/Api/Api";
import { toast } from "react-hot-toast";
import AddHeroSectionModal from "../../modals/AddHeroSectionModal";

function HeroSection() {
  const [heroSections, setHeroSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  
  // Pagination from API
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Fetch hero section data with pagination
  const fetchHeroSection = useCallback(async (page = 0) => {
  try {
    setFetching(true);
    const response = await getHeroSectionsPaginated({ page, size: pageSize });

    // ✅ Fix: Access response.data.content (not response.content)
    const responseData = response?.data || response;
    
    if (responseData && responseData.content && Array.isArray(responseData.content)) {
      setHeroSections(responseData.content);
      setTotalPages(responseData.totalPages);
      setTotalElements(responseData.totalElements);
      setCurrentPage(responseData.number);
      console.log("Loaded Hero Sections:", responseData.content.length, "of", responseData.totalElements);
    } else {
      setHeroSections([]);
      setTotalPages(0);
      setTotalElements(0);
    }
  } catch (error) {
    console.error("Error fetching hero sections:", error);
    toast.error("Failed to load hero sections");
    setHeroSections([]);
  } finally {
    setFetching(false);
  }
}, [pageSize]);

  useEffect(() => {
    fetchHeroSection(currentPage);
  }, []);

  const handleAddNew = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (section) => {
    // Map API response to edit data format
    const editPayload = {
      id: section.id,
      mainTitle: section.mainTitle,
      subTitle: section.subTitle,
      ctaText: section.ctaText,
      active: section.active,
      showOnHomepage: section.showOnHomepage,
    };

    // Map background media
    if (section.backgroundAll && section.backgroundAll.length > 0) {
      editPayload.backgroundMediaAll = section.backgroundAll;
    }
    
    if (section.backgroundLight && section.backgroundLight.length > 0) {
      editPayload.backgroundMediaLight = section.backgroundLight;
    }
    
    if (section.backgroundDark && section.backgroundDark.length > 0) {
      editPayload.backgroundMediaDark = section.backgroundDark;
    }

    // Map sub media
    if (section.subAll && section.subAll.length > 0) {
      editPayload.subMediaAll = section.subAll;
    }
    
    if (section.subLight && section.subLight.length > 0) {
      editPayload.subMediaLight = section.subLight;
    }
    
    if (section.subDark && section.subDark.length > 0) {
      editPayload.subMediaDark = section.subDark;
    }

    console.log("Edit Data:", editPayload);
    setEditData(editPayload);
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
      // Refresh current page
      await fetchHeroSection(currentPage);
    } catch (error) {
      console.error("Error deleting hero section:", error);
      toast.error(error?.response?.data?.message || "Failed to delete hero section");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = async () => {
    // Refresh current page after create/update
    await fetchHeroSection(currentPage);
  };

  const goToPage = (page) => {
    const validPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(validPage);
    fetchHeroSection(validPage);
  };

  // Get first background media URL for preview
  const getPreviewMedia = (section) => {
    // Try backgroundAll first
    if (section.backgroundAll && section.backgroundAll.length > 0) {
      return {
        url: section.backgroundAll[0].url,
        type: section.backgroundAll[0].type,
      };
    }
    // Try backgroundLight
    if (section.backgroundLight && section.backgroundLight.length > 0) {
      return {
        url: section.backgroundLight[0].url,
        type: section.backgroundLight[0].type,
      };
    }
    // Try backgroundDark
    if (section.backgroundDark && section.backgroundDark.length > 0) {
      return {
        url: section.backgroundDark[0].url,
        type: section.backgroundDark[0].type,
      };
    }
    return null;
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
          <div>
            <h2 className="text-xl font-semibold m-0 mb-1" style={{ color: colors.textPrimary }}>
              Hero Sections
            </h2>
            <p className="text-xs m-0" style={{ color: colors.textSecondary }}>
              Total: {totalElements} sections
            </p>
          </div>
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
                      Homepage
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
                  {heroSections.map((section) => {
                    const previewMedia = getPreviewMedia(section);
                    return (
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
                          {previewMedia ? (
                            previewMedia.type === "IMAGE" ? (
                              <img
                                src={previewMedia.url}
                                alt="Background"
                                className="w-20 h-12 object-cover rounded"
                              />
                            ) : (
                              <video
                                src={previewMedia.url}
                                className="w-20 h-12 object-cover rounded"
                                muted
                              />
                            )
                          ) : (
                            <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                              No media
                            </div>
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
                              backgroundColor: section.showOnHomepage ? "#dbeafe" : "#f3f4f6",
                              color: section.showOnHomepage ? "#1d4ed8" : "#6b7280",
                            }}
                          >
                            {section.showOnHomepage ? "Yes" : "No"}
                          </span>
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
                              // onClick={() => handleEdit(section)}
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
                              // onClick={() => handleDelete(section.id)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs m-0" style={{ color: colors.textSecondary }}>
                  Page {currentPage + 1} of {totalPages} • Showing {heroSections.length} of {totalElements} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border-none rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.border }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 0) {
                        e.currentTarget.style.backgroundColor = colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 0) {
                        e.currentTarget.style.backgroundColor = colors.border;
                      }
                    }}
                  >
                    <ChevronLeft size={16} style={{ color: colors.textPrimary }} />
                  </button>

                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show first, last, and pages around current
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className="px-3 py-1.5 border-none rounded text-xs font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor: pageNum === currentPage ? colors.primary : colors.border,
                          color: pageNum === currentPage ? colors.sidebarText : colors.textPrimary,
                        }}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 border-none rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: colors.border }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages - 1) {
                        e.currentTarget.style.backgroundColor = colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages - 1) {
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