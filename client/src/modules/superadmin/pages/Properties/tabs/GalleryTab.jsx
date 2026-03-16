import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PencilIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import { deleteGalleryById, getGalleryByPropertyId } from "@/Api/Api";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import AddMediaModal from "../modals/AddMediaModal";

const PAGE_SIZE_OPTIONS = [12, 24, 48];

// ── HEIC detection ────────────────────────────────────────────────────────────
function isHeicUrl(url = "") {
  const lower = (url || "").toLowerCase();
  return lower.endsWith(".heic") || lower.endsWith(".heif");
}

// ── HEIC-aware image component ────────────────────────────────────────────────
function MediaImage({ src, alt = "", className = "", thumbMode = false }) {
  if (isHeicUrl(src)) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}
      >
        <PhotoIcon
          className={`text-gray-400 ${thumbMode ? "w-5 h-5" : "w-8 h-8"}`}
        />
        <span
          className={`font-semibold text-gray-500 uppercase tracking-wide mt-1 ${
            thumbMode ? "text-[8px]" : "text-[10px]"
          }`}
        >
          HEIC
        </span>
        {!thumbMode && (
          <span className="text-[9px] text-gray-400">Preview unavailable</span>
        )}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} />;
}

/* ── tiny helpers ──────────────────────────────────────────────────────────── */
const Badge = ({ label, color = "blue" }) => {
  const map = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${map[color] ?? map.gray}`}
    >
      {label}
    </span>
  );
};

const Pill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
      active
        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
        : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
    }`}
  >
    {children}
  </button>
);

/* ── main component ─────────────────────────────────────────────────────────── */
const GalleryTab = ({ propertyData }) => {
  const propId = propertyData?.id ?? propertyData?.propertyId;

  /* ── state ── */
  const [allItems, setAllItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState("");
  const [filterVertical, setFilterVertical] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("active");
  const [sortBy, setSortBy] = useState("displayOrder");
  const [sortDir, setSortDir] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const topRef = useRef(null);

  /* ── fetch ── */
  const fetchGallery = useCallback(async () => {
    if (!propId) {
      showError("Property ID is missing");
      return;
    }
    setLoading(true);
    try {
      const response = await getGalleryByPropertyId(propId);
      const rawData = response?.data?.data || response?.data || response;
      const items = rawData?.content || (Array.isArray(rawData) ? rawData : []);
      setAllItems(items);
    } catch {
      showError("Failed to load gallery");
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [propId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  /* ── derived filter options ── */
  const verticals = useMemo(() => {
    const map = {};
    allItems.forEach((item) => {
      const v = item.vertical;
      if (v?.id) map[v.id] = v.verticalName;
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [allItems]);

  const categories = useMemo(() => {
    const set = new Set();
    allItems.forEach((item) => {
      if (item.categoryName) set.add(item.categoryName);
    });
    return [...set].sort();
  }, [allItems]);

  /* ── filtered + sorted + paginated ── */
  const processed = useMemo(() => {
    let list = [...allItems];

    if (filterStatus === "active") list = list.filter((i) => i.isActive);
    else if (filterStatus === "inactive")
      list = list.filter((i) => !i.isActive);

    if (filterVertical !== "all")
      list = list.filter((i) => String(i.vertical?.id) === filterVertical);

    if (filterCategory !== "all")
      list = list.filter((i) => i.categoryName === filterCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.media?.fileName?.toLowerCase().includes(q) ||
          i.categoryName?.toLowerCase().includes(q) ||
          i.vertical?.verticalName?.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      let va, vb;
      if (sortBy === "displayOrder") {
        va = a.displayOrder ?? 9999;
        vb = b.displayOrder ?? 9999;
      } else if (sortBy === "id") {
        va = a.id;
        vb = b.id;
      } else if (sortBy === "category") {
        va = a.categoryName ?? "";
        vb = b.categoryName ?? "";
      } else {
        va = 0;
        vb = 0;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [
    allItems,
    filterStatus,
    filterVertical,
    filterCategory,
    search,
    sortBy,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = processed.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  useEffect(() => {
    setPage(0);
  }, [filterStatus, filterVertical, filterCategory, search, pageSize]);

  const scrollToTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goPage = (p) => {
    setPage(p);
    scrollToTop();
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media item?")) return;
    setDeletingId(id);
    try {
      await deleteGalleryById(id);
      showSuccess("Deleted successfully");
      await fetchGallery();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── active filter count ── */
  const activeFilterCount = [
    filterVertical !== "all",
    filterCategory !== "all",
    filterStatus !== "active",
    search.trim() !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterVertical("all");
    setFilterCategory("all");
    setFilterStatus("active");
    setSearch("");
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const verticalColors = ["blue", "purple", "amber", "green"];
  const verticalColorMap = useMemo(() => {
    const m = {};
    verticals.forEach((v, i) => {
      m[v.id] = verticalColors[i % verticalColors.length];
    });
    return m;
  }, [verticals]);

  /* ───────────────────────────── render ──────────────────────────────────── */
  return (
    <div className="space-y-5" ref={topRef}>
      {/* ── TOP BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-blue-500" />
            Property Gallery
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <ArrowPathIcon className="w-3 h-3 animate-spin" /> Loading…
              </span>
            ) : (
              <>
                <span className="font-bold text-blue-600">
                  {processed.length}
                </span>{" "}
                filtered
                {" · "}
                <span className="font-bold">{allItems.length}</span> total
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-44"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <XMarkIcon className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <FunnelIcon className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              ["grid", <Squares2X2Icon className="w-4 h-4" />],
              ["list", <ListBulletIcon className="w-4 h-4" />],
            ].map(([mode, icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === mode
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Upload */}
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: colors.primary }}
          >
            <PlusIcon className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>

      {/* ── FILTER PANEL ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20">
              Status
            </span>
            <div className="flex gap-2 flex-wrap">
              {[
                ["active", "Active"],
                ["inactive", "Inactive"],
                ["all", "All"],
              ].map(([val, label]) => (
                <Pill
                  key={val}
                  active={filterStatus === val}
                  onClick={() => setFilterStatus(val)}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Vertical */}
          {verticals.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20 flex items-center gap-1">
                <BuildingStorefrontIcon className="w-3.5 h-3.5" /> Vertical
              </span>
              <div className="flex gap-2 flex-wrap">
                <Pill
                  active={filterVertical === "all"}
                  onClick={() => setFilterVertical("all")}
                >
                  All
                </Pill>
                {verticals.map((v) => (
                  <Pill
                    key={v.id}
                    active={filterVertical === String(v.id)}
                    onClick={() => setFilterVertical(String(v.id))}
                  >
                    {v.name}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          {categories.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20 flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5" /> Category
              </span>
              <div className="flex gap-2 flex-wrap">
                <Pill
                  active={filterCategory === "all"}
                  onClick={() => setFilterCategory("all")}
                >
                  All
                </Pill>
                {categories.map((c) => (
                  <Pill
                    key={c}
                    active={filterCategory === c}
                    onClick={() => setFilterCategory(c)}
                  >
                    {c}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {/* Sort + Clear */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <ArrowsUpDownIcon className="w-3.5 h-3.5" /> Sort
              </span>
              {[
                ["displayOrder", "Order"],
                ["id", "ID"],
                ["category", "Category"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => toggleSort(val)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    sortBy === val
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {label}
                  {sortBy === val && (
                    <span className="text-[10px]">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs text-red-600 font-semibold hover:underline"
              >
                <XMarkIcon className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── PAGE SIZE ── */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          {processed.length > 0 && (
            <p className="text-[11px] text-gray-400">
              Showing {safePage * pageSize + 1}–
              {Math.min((safePage + 1) * pageSize, processed.length)} of{" "}
              {processed.length}
            </p>
          )}
        </p>
      </div>

      {/* ── CONTENT ── */}
      {loading && allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-blue-400" />
          <p className="text-gray-400 text-sm font-medium">Loading gallery…</p>
        </div>
      ) : paginated.length > 0 ? (
        viewMode === "grid" ? (
          /* ── GRID ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-2xl overflow-hidden border-2 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  !item.isActive
                    ? "opacity-60 grayscale border-red-200"
                    : "border-gray-100 hover:border-blue-300"
                }`}
              >
                {/* Image / HEIC placeholder */}
                <div className="aspect-[4/3] overflow-hidden">
                  <MediaImage
                    src={item.media?.url}
                    alt={item.categoryName || "gallery"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Meta strip */}
                <div className="px-3 py-2.5 space-y-1.5 border-t border-gray-100">
                  {item.vertical?.verticalName && (
                    <div className="flex items-center gap-1.5">
                      <BuildingStorefrontIcon className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-700 truncate">
                        {item.vertical.verticalName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-1">
                    <Badge
                      label={item.categoryName || "—"}
                      color={item.isActive ? "blue" : "red"}
                    />
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                      #{item.displayOrder ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-green-500" : "bg-red-400"}`}
                    />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-2xl">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 bg-white text-blue-600 rounded-full hover:bg-blue-600 hover:text-white shadow-lg transition-all hover:scale-110"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2.5 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── LIST ── */
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">
                    <button
                      onClick={() => toggleSort("id")}
                      className="flex items-center gap-1 hover:text-gray-800"
                    >
                      ID{" "}
                      {sortBy === "id" && (
                        <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">Vertical</th>
                  <th className="px-4 py-3">
                    <button
                      onClick={() => toggleSort("category")}
                      className="flex items-center gap-1 hover:text-gray-800"
                    >
                      Category{" "}
                      {sortBy === "category" && (
                        <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleSort("displayOrder")}
                      className="flex items-center gap-1 mx-auto hover:text-gray-800"
                    >
                      Order{" "}
                      {sortBy === "displayOrder" && (
                        <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-blue-50/30 ${!item.isActive ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      {/* List thumbnail — HEIC-aware */}
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                        <MediaImage
                          src={item.media?.url}
                          alt=""
                          className="w-full h-full object-cover"
                          thumbMode
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-400">
                      {item.id}
                    </td>
                    <td className="px-4 py-3">
                      {item.vertical?.verticalName ? (
                        <Badge
                          label={item.vertical.verticalName}
                          color={verticalColorMap[item.vertical.id] || "blue"}
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.categoryName ? (
                        <Badge label={item.categoryName} color="gray" />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate font-medium">
                      {item.media?.fileName || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                        {item.displayOrder ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
                          item.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-green-500" : "bg-red-400"}`}
                        />
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === item.id ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* ── EMPTY ── */
        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center gap-3">
          <PhotoIcon className="w-14 h-14 text-gray-300" />
          <div>
            <p className="font-bold text-gray-700">No media found</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeFilterCount > 0
                ? "Try adjusting your filters"
                : `No gallery items for property ${propId}`}
            </p>
          </div>
          {activeFilterCount > 0 ? (
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <PlusIcon className="w-4 h-4" /> Upload Media
            </button>
          )}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => goPage(safePage - 1)}
            disabled={safePage === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" /> Prev
          </button>

          <span className="text-xs text-gray-500 font-medium">
            Page <span className="font-bold text-gray-800">{safePage + 1}</span>{" "}
            of {totalPages}
          </span>

          <button
            onClick={() => goPage(safePage + 1)}
            disabled={safePage === totalPages - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── MODAL ── */}
      {isModalOpen && (
        <AddMediaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          propertyData={propertyData}
          editingItem={editingItem}
          onSuccess={() => {
            fetchGallery();
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default GalleryTab;