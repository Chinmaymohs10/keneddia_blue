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
  getHotelHomepageHeroSection,
  getPropertyTypes,
} from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";
import AddHeroSectionModal from "../../modals/AddHeroSectionModal";

const ENABLED_PROPERTY_TYPE_TABS = [
  "hotel",
  "restaurant",
  "resturant",
  "cafe",
  "wine",
  "wines",
  "winedine",
  "wine&dine",
  "wineanddine",
];

function HeroSection() {
  const [activeTab, setActiveTab] = useState("homepage");
  const [heroSections, setHeroSections] = useState([]);
  const [propertyHeroSections, setPropertyHeroSections] = useState({});
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [heroPropertyTypes, setHeroPropertyTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchMetadata = useCallback(async () => {
    try {
      const response = await getPropertyTypes();
      const data = response?.data || response;
      if (Array.isArray(data)) {
        setHeroPropertyTypes(
          data.filter(
            (type) =>
              type.isActive &&
              ENABLED_PROPERTY_TYPE_TABS.includes(
                type.typeName?.toLowerCase(),
              ),
          ),
        );
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

  const fetchPropertyTypeHero = useCallback(async (propertyTypeId) => {
    if (!propertyTypeId) return;

    try {
      setFetching(true);
      const response = await getHotelHomepageHeroSection(propertyTypeId);
      const data = response?.data || response;
      if (Array.isArray(data)) {
        const sortedData = [...data].sort((a, b) => b.id - a.id);
        setPropertyHeroSections((prev) => ({
          ...prev,
          [propertyTypeId]: sortedData,
        }));
      }
    } catch (error) {
      showError("Failed to load property-type hero sections");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (activeTab === "homepage") {
      fetchHomepageHero(currentPage);
      return;
    }

    const selectedType = heroPropertyTypes.find(
      (type) => String(type.id) === String(activeTab),
    );
    if (selectedType) {
      fetchPropertyTypeHero(selectedType.id);
    }
  }, [
    activeTab,
    currentPage,
    fetchHomepageHero,
    fetchPropertyTypeHero,
    heroPropertyTypes,
  ]);

  const handleEdit = (section) => {
    setActiveTab(
      section.propertyTypeId ? String(section.propertyTypeId) : "homepage",
    );
    setEditData({
      id: section.id,
      mainTitle: section.mainTitle,
      subTitle: section.subTitle,
      ctaText: section.ctaText,
      ctaLink: section.ctaLink,
      active: section.active,
      showOnHomepage: section.showOnHomepage,
      showOnMobilePage: section.showOnMobilePage,
      propertyTypeId: section.propertyTypeId || null,
      sequence: section.sequence ?? null,
      backgroundMediaAll: section.backgroundAll || [],
      backgroundMediaLight: section.backgroundLight || [],
      backgroundMediaDark: section.backgroundDark || [],
      subMediaAll: section.subAll || [],
      subMediaLight: section.subLight || [],
      subMediaDark: section.subDark || [],
    });
    setIsModalOpen(true);
  };

  const truncateText = (text, limit = 50) => {
    if (!text) return "";
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  };

  const renderStatusBadge = (value, activeLabel = "On", inactiveLabel = "Off") => (
    <span
      className={`inline-flex min-w-[88px] justify-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        value
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {value ? activeLabel : inactiveLabel}
    </span>
  );

  const activeTableData = useMemo(() => {
    if (activeTab === "homepage") return heroSections;
    return propertyHeroSections[Number(activeTab)] || [];
  }, [activeTab, heroSections, propertyHeroSections]);

  const refetchActiveTab = useCallback(() => {
    if (activeTab === "homepage") {
      fetchHomepageHero(currentPage);
      return;
    }

    fetchPropertyTypeHero(Number(activeTab));
  }, [activeTab, currentPage, fetchHomepageHero, fetchPropertyTypeHero]);

  const renderTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: colors.border }}>
            <th className="text-center px-4 py-3 text-xs font-semibold">Seq</th>
            <th className="text-left px-4 py-3 text-xs font-semibold">ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold">Preview</th>
            <th className="text-left px-4 py-3 text-xs font-semibold">Titles</th>
            <th className="text-center px-4 py-3 text-xs font-semibold">Active Status</th>
            <th className="text-center px-4 py-3 text-xs font-semibold">Desktop View</th>
            <th className="text-center px-4 py-3 text-xs font-semibold">Mobile View</th>
            <th className="text-center px-4 py-3 text-xs font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((section) => {
            const previewMedia =
              section.backgroundAll?.[0] ||
              section.backgroundLight?.[0] ||
              section.backgroundDark?.[0];
            return (
              <tr
                key={section.id}
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <td className="px-4 py-3 text-center">
                  {section.sequence != null ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black text-white" style={{ backgroundColor: "#E53935" }}>
                      {section.sequence}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-300 font-mono">—</span>
                  )}
                </td>
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
                <td className="px-4 py-3 text-center">
                  {renderStatusBadge(section.active, "Active", "Inactive")}
                </td>
                <td className="px-4 py-3 text-center">
                  {renderStatusBadge(section.showOnHomepage, "Visible", "Hidden")}
                </td>
                <td className="px-4 py-3 text-center">
                  {renderStatusBadge(section.showOnMobilePage, "Visible", "Hidden")}
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
          <div className="flex gap-4 mt-4 flex-wrap">
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
            {heroPropertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveTab(String(type.id))}
                className="pb-2 text-sm font-bold transition-colors cursor-pointer flex items-center gap-2"
                style={{
                  borderBottom:
                    String(activeTab) === String(type.id)
                      ? "2px solid #E53935"
                      : "2px solid transparent",
                  color:
                    String(activeTab) === String(type.id)
                      ? "#E53935"
                      : "#9CA3AF",
                }}
              >
                <Building2 size={16} /> {type.typeName} Page Hero
              </button>
            ))}
          </div>
        </div>
        <div className="relative group/addbtn">
          <button
            onClick={() => {
              if (activeTableData.length >= 4) return;
              setEditData(null);
              setIsModalOpen(true);
            }}
            disabled={activeTableData.length >= 4}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#E53935", color: "#FFFFFF" }}
          >
            <Plus size={16} /> Add Hero
          </button>
          {activeTableData.length >= 4 && (
            <div className="absolute right-0 top-full mt-2 z-10 w-52 bg-gray-900 text-white text-[11px] font-medium rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover/addbtn:opacity-100 transition-opacity pointer-events-none">
              Limit reached — max 4 hero slides per section. Edit an existing one instead.
            </div>
          )}
        </div>
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
          {activeTableData.length > 0 ? renderTable(activeTableData) : <EmptyState />}
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
        onSuccess={refetchActiveTab}
        editData={editData}
        defaultPropertyTypeId={
          activeTab === "homepage" ? null : Number(activeTab)
        }
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
