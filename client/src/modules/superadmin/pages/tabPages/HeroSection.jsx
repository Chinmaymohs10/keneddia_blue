// components/HeroSection.jsx
import React, { useState, useEffect, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState("homepage");
  const [heroSections, setHeroSections] = useState([]);
  const [hotelHeroSections, setHotelHeroSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState({});
  const [hotelTypeId, setHotelTypeId] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

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

  const fetchHotelHero = useCallback(async () => {
    if (!hotelTypeId) return;
    try {
      setFetching(true);
      const response = await getHotelHomepageHeroSection(hotelTypeId);
      const data = response?.data || response;
      if (Array.isArray(data)) {
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
    if (activeTab === "homepage") fetchHomepageHero(currentPage);
    else fetchHotelHero();
  }, [activeTab, currentPage, fetchHomepageHero, fetchHotelHero]);

  /** * Restored handleEdit function
   * Sets the editData state with section details and opens the modal
   */
  const handleEdit = (section) => {
    setEditData({
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
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id, currentStatus, showOnHomepage) => {
    const nextStatus = !currentStatus;

    // 🚨 If trying to disable while homepage is enabled
    if (nextStatus === false && showOnHomepage === true) {
      showError(
        "Please disable Homepage visibility before turning off Action Status.",
      );
      return;
    }

    const actionName = currentStatus ? "Disable" : "Enable";

    if (
      !window.confirm(
        `Are you sure you want to ${actionName} this hero section?`,
      )
    )
      return;

    const key = `active-${id}`;

    try {
      setTogglingStatus((prev) => ({ ...prev, [key]: true }));

      await toggleHeroSectionActive(id, nextStatus);

      showSuccess(
        `Hero section successfully ${currentStatus ? "disabled" : "enabled"}`,
      );

      activeTab === "homepage"
        ? fetchHomepageHero(currentPage)
        : fetchHotelHero();
    } catch (error) {
      console.log("❌ ACTIVE TOGGLE FAILED:", error?.response?.data);
      showError(error?.response?.data?.message || "Update failed");
    } finally {
      setTogglingStatus((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleToggleHomepage = async (
    id,
    currentHomepageStatus,
    sectionActive,
  ) => {
    console.log("🔵 handleToggleHomepage CALLED");
    console.log("ID:", id);
    console.log("currentHomepageStatus:", currentHomepageStatus);
    console.log("sectionActive:", sectionActive);
    console.log("Type of sectionActive:", typeof sectionActive);

    const nextHomepageState = !currentHomepageStatus;

    console.log("nextHomepageState:", nextHomepageState);

    if (sectionActive !== true && nextHomepageState === true) {
      console.log("⛔ BLOCKED in frontend");
      showError(
        "To enable the Homepage, please set the Action Status to Active/On.",
      );
      return;
    }

    console.log("🚀 API WILL BE CALLED");

    const key = `homepage-${id}`;

    try {
      setTogglingStatus((prev) => ({ ...prev, [key]: true }));

      await toggleHeroSectionHomepage(id, nextHomepageState);

      showSuccess("Homepage visibility updated");

      activeTab === "homepage"
        ? fetchHomepageHero(currentPage)
        : fetchHotelHero();
    } catch (error) {
      console.log("❌ API FAILED:", error?.response?.data);
      showError(error?.response?.data?.message || "Update failed");
    } finally {
      setTogglingStatus((prev) => ({ ...prev, [key]: false }));
    }
  };

  const truncateText = (text, limit = 50) => {
    if (!text) return "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
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
            {activeTab === "homepage" && (
              <th className="text-center px-4 py-3 text-xs font-semibold">
                Homepage
              </th>
            )}

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
            const previewMedia =
              section.backgroundAll?.[0] || section.backgroundLight?.[0];
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
                  <div className="text-xs font-bold" title={section.mainTitle}>
                    {truncateText(section.mainTitle || "No Title", 50)}
                  </div>
                  <div
                    className="text-[10px] text-gray-400"
                    title={section.subTitle}
                  >
                    {truncateText(section.subTitle || "No Subtitle", 50)}
                  </div>
                </td>

                {activeTab === "homepage" && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        console.log("🟢 Homepage toggle clicked");
                        console.log("Section ID:", section.id);
                        console.log("showOnHomepage:", section.showOnHomepage);
                        console.log("section.active:", section.active);

                        handleToggleHomepage(
                          section.id,
                          section.showOnHomepage,
                          section.active,
                        );
                      }}
                      disabled={isTogglingHome}
                      className="relative inline-flex items-center h-5 w-10 rounded-full transition-colors cursor-pointer outline-none"
                      style={{
                        backgroundColor: section.showOnHomepage
                          ? colors.primary
                          : colors.border,
                      }}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          section.showOnHomepage
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                )}

                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() =>
                        handleToggleActive(section.id, section.active)
                      }
                      disabled={isTogglingActive}
                      className="relative inline-flex items-center h-6 w-12 rounded-full transition-all cursor-pointer outline-none border-2"
                      style={{
                        backgroundColor: section.active ? "#059669" : "#9CA3AF",
                        borderColor: section.active ? "#059669" : "#9CA3AF",
                      }}
                    >
                      {isTogglingActive ? (
                        <Loader2
                          className="animate-spin text-white mx-auto"
                          size={12}
                        />
                      ) : (
                        <>
                          <span
                            className={`absolute text-[8px] font-bold text-white transition-opacity ${section.active ? "left-1.5 opacity-100" : "opacity-0"}`}
                          >
                            ON
                          </span>
                          <span
                            className={`absolute text-[8px] font-bold text-white transition-opacity ${!section.active ? "right-1.5 opacity-100" : "opacity-0"}`}
                          >
                            OFF
                          </span>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${section.active ? "translate-x-6" : "translate-x-0.5"}`}
                          />
                        </>
                      )}
                    </button>
                    <span
                      className={`text-[9px] font-bold uppercase ${section.active ? "text-green-600" : "text-gray-400"}`}
                    >
                      {section.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-600"
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
          style={{ backgroundColor: "#E53935", color: "#FFFFFF" }}
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
          {(activeTab === "homepage" ? heroSections : hotelHeroSections)
            .length > 0 ? (
            renderTable(
              activeTab === "homepage" ? heroSections : hotelHeroSections,
            )
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

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-xl">
    <AlertCircle size={32} className="text-gray-200 mb-2" />
    <p className="text-sm text-gray-400">
      No hero sections found for this category.
    </p>
  </div>
);

export default HeroSection;
