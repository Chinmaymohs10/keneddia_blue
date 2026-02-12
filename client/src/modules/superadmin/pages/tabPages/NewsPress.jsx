import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  Tag,
  User,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getAllNews, updateNewsStatus } from "@/Api/Api";
import {
  showSuccess,
  showInfo,
  showError,
  showWarning,
} from "@/lib/toasters/toastUtils";
import CreateNewsModal from "../../modals/CreateNewsModal";

function NewsPress() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log("--- API Call Start ---");

      // Fetch all categories (PRESS, NEWS, ANNOUNCEMENT)
      const categories = ["PRESS", "NEWS", "ANNOUNCEMENT"];
      const allNewsPromises = categories.map((category) =>
        getAllNews({ category, page: 0, size: 50 }),
      );

      const responses = await Promise.all(allNewsPromises);
      console.log("1. Raw API Responses:", responses);

      let newsData = [];

      // Combine all responses
      responses.forEach((response, index) => {
        console.log(`Processing category: ${categories[index]}`);
        const source = response?.data ? response.data : response;

        if (source?.content && Array.isArray(source.content)) {
          newsData = [...newsData, ...source.content];
          console.log(
            `2. Success: Extracted ${source.content.length} items from ${categories[index]}`,
          );
        } else if (Array.isArray(source)) {
          newsData = [...newsData, ...source];
          console.log(
            `2. Success: Extracted ${source.length} items from ${categories[index]}`,
          );
        } else {
          console.error(
            `2. Failure: Could not find array in ${categories[index]} response. Structure:`,
            source,
          );
        }
      });

      console.log("3. Combined Array for State:", newsData);
      console.log(`Total items fetched: ${newsData.length}`);

      if (newsData.length > 0) {
        const normalizedNews = newsData.map((item) => {
          return {
            ...item,

            // ✅ NORMALIZE BADGE FIELD
            badgeTypeName:
              item.badgeTypeName ||
              item.badgeType ||
              item.badge?.name ||
              item.badgeName ||
              null,

            // ✅ NORMALIZE CATEGORY (safety)
            category: item.category || item.newsCategory || "NEWS",

            // ✅ NORMALIZE IMAGE
            imageUrl:
              item.imageUrl || item.image || item.media?.[0]?.url || null,
          };
        });

        // Don't filter by active status - show all news items
        const sortedNews = normalizedNews.sort((a, b) => {
          const dateA = new Date(a.newsDate || a.dateBadge || a.createdAt);
          const dateB = new Date(b.newsDate || b.dateBadge || b.createdAt);
          return dateB - dateA;
        });

        console.log("✅ FINAL NORMALIZED NEWS:", sortedNews);
        setNewsItems(sortedNews);
      } else {
        setNewsItems([]);
      }
    } catch (error) {
      console.error("API Error details:", error);
      showError("Failed to load news");
      setNewsItems([]);
    } finally {
      setLoading(false);
      console.log("--- API Call End ---");
    }
  };

  useEffect(() => {
    console.log("NewsPress component mounted, calling fetchNews...");
    fetchNews();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = newsItems.slice(startIndex, endIndex);

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      setStatusLoading(id);
      const nextStatus = !currentStatus;

      await updateNewsStatus(id, nextStatus);

      showSuccess(`News ${nextStatus ? "Activated" : "Deactivated"}`);

      // ✅ Re-fetch from backend to refresh list
      await fetchNews();
    } catch (error) {
      console.error("Failed to update status:", error);
      showError("Failed to update status");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleEdit = (news) => {
    setEditingNews(news);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingNews(null);
    setShowModal(true);
  };

  const handleCloseModal = (shouldRefresh) => {
    setShowModal(false);
    setEditingNews(null);
    if (shouldRefresh) {
      fetchNews();
    }
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

  const getCategoryBadge = (category) => {
    const categoryColors = {
      PRESS: colors.primary,
      NEWS: colors.warning,
      ANNOUNCEMENT: colors.success,
    };

    return (
      <span
        className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block"
        style={{
          backgroundColor: categoryColors[category] || colors.textSecondary,
          color: "#ffffff",
        }}
      >
        {category}
      </span>
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
              News & Press
            </h2>
            <p
              className="text-xs mt-1 mb-0"
              style={{ color: colors.textSecondary }}
            >
              Manage news articles and press releases
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: "#ffffff",
            }}
          >
            <Plus size={16} />
            Add News
          </button>
        </div>
      </div>

      {/* Table View */}
      <div
        className="rounded-lg shadow-sm overflow-hidden"
        style={{ backgroundColor: colors.contentBg }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.primary }}
            />
          </div>
        ) : newsItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Calendar
              size={48}
              style={{ color: colors.textSecondary }}
              className="mb-3 opacity-50"
            />
            <p
              className="text-sm font-medium mb-1"
              style={{ color: colors.textPrimary }}
            >
              No news articles found
            </p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Create your first news article to get started
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: colors.mainBg,
                      borderColor: colors.border,
                    }}
                  >
                    <th
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Image
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Article Details
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Category
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Author
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Date
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Badge Type
                    </th>
                    <th
                      className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((news, index) => (
                    <tr
                      key={news.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: colors.border,
                        opacity: news.active === false ? 0.6 : 1,
                      }}
                    >
                      {/* Image */}
                      <td className="px-4 py-3">
                        <div
                          className="w-16 h-16 rounded-lg overflow-hidden border relative"
                          style={{ borderColor: colors.border }}
                        >
                          {news.imageUrl || news.image ? (
                            <img
                              src={news.imageUrl || news.image}
                              alt={news.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: colors.mainBg }}
                            >
                              <ImageIcon
                                size={20}
                                style={{ color: colors.textSecondary }}
                              />
                            </div>
                          )}
                          {news.active === false && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white bg-red-500 px-1 py-0.5 rounded">
                                INACTIVE
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Article Details */}
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <h3
                            className="text-sm font-bold mb-1 line-clamp-1"
                            style={{ color: colors.textPrimary }}
                          >
                            {news.title}
                          </h3>
                          <p
                            className="text-xs line-clamp-2 mb-1"
                            style={{ color: colors.textSecondary }}
                          >
                            {news.description}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        {getCategoryBadge(news.category)}
                      </td>

                      {/* Author */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          {news.authorName ? (
                            <>
                              <div className="flex items-center gap-1.5 mb-1">
                                <User
                                  size={12}
                                  style={{ color: colors.textSecondary }}
                                />
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: colors.textPrimary }}
                                >
                                  {news.authorName}
                                </span>
                              </div>
                              {news.readTime && (
                                <div className="flex items-center gap-1.5">
                                  <Clock
                                    size={12}
                                    style={{ color: colors.textSecondary }}
                                  />
                                  <span
                                    className="text-xs"
                                    style={{ color: colors.textSecondary }}
                                  >
                                    {news.readTime}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              N/A
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium"
                          style={{ color: colors.textPrimary }}
                        >
                          {formatDate(news.newsDate || news.dateBadge)}
                        </span>
                      </td>

                      {/* Badge Type */}
                      <td className="px-4 py-3">
                        {news.badgeTypeName ? (
                          <div
                            className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[10px] font-bold"
                            style={{ color: colors.textSecondary }}
                          >
                            <Tag size={10} />
                            {news.badgeTypeName}
                          </div>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() =>
                              handleStatusToggle(news.id, news.active)
                            }
                            disabled={statusLoading === news.id}
                            className="p-2 rounded-lg border transition-all hover:shadow-sm bg-white"
                            style={{
                              borderColor: colors.border,
                              color: news.active
                                ? colors.success
                                : colors.textSecondary,
                            }}
                            title={
                              news.active
                                ? "Click to remove"
                                : "Click to Activate"
                            }
                          >
                            {statusLoading === news.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : news.active ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(news)}
                            className="p-2 rounded border transition-colors hover:bg-gray-100"
                            style={{
                              borderColor: colors.border,
                              color: colors.primary,
                            }}
                            title="Edit News"
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

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-3">
              {currentItems.map((news) => (
                <div
                  key={news.id}
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: colors.mainBg,
                    borderColor: colors.border,
                    opacity: news.active === false ? 0.6 : 1,
                  }}
                >
                  <div className="flex gap-3 mb-3">
                    <div
                      className="w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0 relative"
                      style={{ borderColor: colors.border }}
                    >
                      {news.imageUrl || news.image ? (
                        <img
                          src={news.imageUrl || news.image}
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: colors.contentBg }}
                        >
                          <ImageIcon
                            size={24}
                            style={{ color: colors.textSecondary }}
                          />
                        </div>
                      )}
                      {news.active === false && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white bg-red-500 px-1 py-0.5 rounded">
                            INACTIVE
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="mb-2">
                        {getCategoryBadge(news.category)}
                      </div>
                      <h3
                        className="text-sm font-bold mb-1"
                        style={{ color: colors.textPrimary }}
                      >
                        {news.title}
                      </h3>
                      <p
                        className="text-xs mb-2 line-clamp-2"
                        style={{ color: colors.textSecondary }}
                      >
                        {news.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    {news.authorName && (
                      <div className="flex items-center gap-1">
                        <User
                          size={12}
                          style={{ color: colors.textSecondary }}
                        />
                        <span style={{ color: colors.textSecondary }}>
                          {news.authorName}
                        </span>
                      </div>
                    )}
                    <div
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {formatDate(news.newsDate || news.dateBadge)}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between pt-2 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <div className="flex items-center gap-2">
                      {news.badgeTypeName && (
                        <div
                          className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[10px] font-bold"
                          style={{ color: colors.textSecondary }}
                        >
                          <Tag size={10} />
                          {news.badgeTypeName}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle Button */}
                      <button
                        onClick={() => handleStatusToggle(news.id, news.active)}
                        disabled={statusLoading === news.id}
                        className="p-2 rounded-lg border transition-all bg-white"
                        style={{
                          borderColor: colors.border,
                          color: news.active
                            ? colors.success
                            : colors.textSecondary,
                        }}
                        title={news.active ? "Deactivate" : "Activate"}
                      >
                        {statusLoading === news.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : news.active ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(news)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors hover:bg-gray-50"
                        style={{
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        }}
                      >
                        <Edit size={12} /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-4 sm:px-6 py-4 border-t"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, newsItems.length)} of {newsItems.length}{" "}
                  articles
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                          onClick={() => setCurrentPage(pageNumber)}
                          className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                          style={{
                            backgroundColor:
                              currentPage === pageNumber
                                ? colors.primary
                                : colors.mainBg,
                            color:
                              currentPage === pageNumber
                                ? "#ffffff"
                                : colors.textPrimary,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
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
          </>
        )}
      </div>

      {/* Modal - Add/Edit News */}
      {showModal && (
        <CreateNewsModal
          isOpen={showModal}
          onClose={handleCloseModal}
          editingNews={editingNews}
        />
      )}
    </div>
  );
}

export default NewsPress;
