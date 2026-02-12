// components/HeroSection.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Loader2,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  AlertCircle,
} from "lucide-react";
import {
  getHeroSectionsPaginated,
  toggleHeroSectionActive,
  toggleHeroSectionHomepage,
  getHotelHomepageHeroSection,
  getPropertyTypes,
} from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";
import AddHeroSectionModal from "../../modals/AddHeroSectionModal";

function HeroSection() {
  const [activeTab, setActiveTab] = useState("homepage"); // "homepage" or "hotel"
  const [heroSections, setHeroSections] = useState([]);
  const [hotelHeroSections, setHotelHeroSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState({});
  const [hotelTypeId, setHotelTypeId] = useState(null);

  // Pagination for Homepage Tab
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // 1. Fetch Property Types to find "Hotel"
  const fetchMetadata = useCallback(async () => {
    try {
      const response = await getPropertyTypes();
      const data = response?.data || response;
      if (Array.isArray(data)) {
        const hotelType = data.find(
          (type) => type.isActive && type.typeName?.toLowerCase() === "hotel",
        );
        if (hotelType) setHotelTypeId(hotelType.id);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }, []);

  // 2. Fetch Generic Paginated Sections (Homepage Tab)
  const fetchHomepageHero = useCallback(
    async (page = 0) => {
      try {
        setFetching(true);
        const response = await getHeroSectionsPaginated({
          page,
          size: pageSize,
        });
        const responseData = response?.data || response;

        if (responseData?.content) {
          // Sort to ensure latest (higher ID) comes first
          const sortedData = [...responseData.content].sort(
            (a, b) => b.id - a.id,
          );
          setHeroSections(sortedData);
          setTotalPages(responseData.totalPages);
          setTotalElements(responseData.totalElements);
          setCurrentPage(responseData.number);
        }
      } catch (error) {
        showError("Failed to load homepage hero sections");
      } finally {
        setFetching(false);
      }
    },
    [pageSize],
  );

  // 3. Fetch Hotel Specific Sections (Hotel Tab)
  const fetchHotelHero = useCallback(async () => {
    if (!hotelTypeId) return;
    try {
      setFetching(true);
      const response = await getHotelHomepageHeroSection(hotelTypeId);
      const data = response?.data || response;
      if (Array.isArray(data)) {
        // Sort latest first
        const sortedHotelData = [...data].sort((a, b) => b.id - a.id);
        setHotelHeroSections(sortedHotelData);
      }
    } catch (error) {
      showError("Failed to load hotel hero sections");
    } finally {
      setFetching(false);
    }
  }, [hotelTypeId]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (activeTab === "homepage") {
      fetchHomepageHero(currentPage);
    } else {
      fetchHotelHero();
    }
  }, [activeTab, currentPage, fetchHomepageHero, fetchHotelHero]);

  // Enhanced Status Toggle with confirmation
  const handleToggleActive = async (id, currentStatus) => {
    const actionName = currentStatus ? "Disable" : "Enable";
    const confirmMessage = `Are you sure you want to ${actionName} this hero section?`;

    if (!window.confirm(confirmMessage)) return;

    const key = `active-${id}`;
    try {
      setTogglingStatus((prev) => ({ ...prev, [key]: true }));
      await toggleHeroSectionActive(id, !currentStatus);
      showSuccess(
        `Hero section successfully ${currentStatus ? "disabled" : "enabled"}`,
      );
      activeTab === "homepage"
        ? fetchHomepageHero(currentPage)
        : fetchHotelHero();
    } catch (error) {
      showError("Update failed");
    } finally {
      setTogglingStatus((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleToggleHomepage = async (id, currentStatus) => {
    const key = `homepage-${id}`;
    try {
      setTogglingStatus((prev) => ({ ...prev, [key]: true }));
      await toggleHeroSectionHomepage(id, !currentStatus);
      showSuccess(`Homepage visibility updated`);
      activeTab === "homepage"
        ? fetchHomepageHero(currentPage)
        : fetchHotelHero();
    } catch (error) {
      showError("Update failed");
    } finally {
      setTogglingStatus((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleEdit = (section) => {
    const editPayload = {
      id: section.id,
      mainTitle: section.mainTitle,
      subTitle: section.subTitle,
      ctaText: section.ctaText,
      active: section.active,
      showOnHomepage: section.showOnHomepage,
      backgroundMediaAll: section.backgroundAll || [],
      backgroundMediaLight: section.backgroundLight || [],
      backgroundMediaDark: section.backgroundDark || [],
      subMediaAll: section.subAll || [],
      subMediaLight: section.subLight || [],
      subMediaDark: section.subDark || [],
    };
    setEditData(editPayload);
    setIsModalOpen(true);
  };

  const getPreviewMedia = (section) => {
    const media =
      section.backgroundAll?.[0] ||
      section.backgroundLight?.[0] ||
      section.backgroundDark?.[0];
    return media ? { url: media.url, type: media.type } : null;
  };

  const renderTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: colors.border }}>
            <th className="text-left px-4 py-3 text-xs font-semibold">ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold">
              Preview
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold">
              Titles
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold">
              Homepage
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold">
              Status Action
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((section) => {
            const previewMedia = getPreviewMedia(section);
            const isTogglingActive = togglingStatus[`active-${section.id}`];
            const isTogglingHome = togglingStatus[`homepage-${section.id}`];

            return (
              <tr
                key={section.id}
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                  #{section.id}
                </td>
                <td className="px-4 py-3">
                  {previewMedia ? (
                    previewMedia.type === "IMAGE" ? (
                      <img
                        src={previewMedia.url}
                        className="w-16 h-10 object-cover rounded"
                        alt=""
                      />
                    ) : (
                      <video
                        src={previewMedia.url}
                        className="w-16 h-10 object-cover rounded"
                        muted
                      />
                    )
                  ) : (
                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px]">
                      No Media
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs font-bold">
                    {section.mainTitle || "No Title"}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[150px]">
                    {section.subTitle || "No Subtitle"}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() =>
                      handleToggleHomepage(section.id, section.showOnHomepage)
                    }
                    disabled={isTogglingHome}
                    className="relative inline-flex items-center h-5 w-10 rounded-full transition-colors cursor-pointer"
                    style={{
                      backgroundColor: section.showOnHomepage
                        ? colors.primary
                        : colors.border,
                    }}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${section.showOnHomepage ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() =>
                      handleToggleActive(section.id, section.active)
                    }
                    disabled={isTogglingActive}
                    className="px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer border"
                    style={{
                      backgroundColor: section.active ? "#FEE2E2" : "#D1FAE5",
                      color: section.active ? "#DC2626" : "#059669",
                      borderColor: section.active ? "#FECACA" : "#A7F3D0",
                    }}
                  >
                    {isTogglingActive ? (
                      <Loader2 className="animate-spin mx-auto" size={12} />
                    ) : section.active ? (
                      "Disable"
                    ) : (
                      "Enable"
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-1.5 rounded transition-colors cursor-pointer"
                    style={{
                      color: "#374151",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className="rounded-lg p-6 shadow-sm"
      style={{ backgroundColor: colors.contentBg }}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2
            className="text-xl font-semibold m-0"
            style={{ color: colors.textPrimary }}
          >
            Hero Management
          </h2>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab("homepage")}
              className="pb-2 text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
              style={{
                borderBottom:
                  activeTab === "homepage"
                    ? "2px solid #E53935"
                    : "2px solid transparent",
                color: activeTab === "homepage" ? "#E53935" : "#9CA3AF",
              }}
            >
              <Home size={16} /> Homepage Hero
            </button>
            <button
              onClick={() => setActiveTab("hotel")}
              className="pb-2 text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
              style={{
                borderBottom:
                  activeTab === "hotel"
                    ? "2px solid #E53935"
                    : "2px solid transparent",
                color: activeTab === "hotel" ? "#E53935" : "#9CA3AF",
              }}
            >
              <Building2 size={16} /> Hotel Page Hero
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer"
          style={{
            backgroundColor: "#E53935",
            color: "#FFFFFF",
          }}
        >
          <Plus size={16} /> Add Hero
        </button>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-xs text-gray-400">
            Fetching latest hero sections...
          </p>
        </div>
      ) : (
        <>
          {activeTab === "homepage" ? (
            heroSections.length > 0 ? (
              renderTable(heroSections)
            ) : (
              <EmptyState />
            )
          ) : hotelHeroSections.length > 0 ? (
            renderTable(hotelHeroSections)
          ) : (
            <EmptyState />
          )}

          {activeTab === "homepage" && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-gray-400">
                Page {currentPage + 1} of {totalPages} • Total {totalElements}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 rounded border border-gray-200 disabled:opacity-30 cursor-pointer bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 rounded border border-gray-200 disabled:opacity-30 cursor-pointer bg-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <AddHeroSectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() =>
          activeTab === "homepage"
            ? fetchHomepageHero(currentPage)
            : fetchHotelHero()
        }
        editData={editData}
      />
    </div>
  );
}

// Simple Empty State Sub-component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-xl">
    <AlertCircle size={32} className="text-gray-200 mb-2" />
    <p className="text-sm text-gray-400">
      No hero sections found for this category.
    </p>
  </div>
);

export default HeroSection;
