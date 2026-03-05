import React, { useState, useEffect, useCallback } from "react";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { colors } from "@/lib/colors/colors";
import AddMenuItemModal from "../../modals/AddMenuItemModal";
import AddMenuthumnailModal from "../../modals/AddMenuthumnailModal";
import {
  Heart,
  Save,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  createChefRemark,
  getChefRemarks,
  updateChefRemark,
} from "@/Api/RestaurantApi";
import {
  createMenuHeaderSection,
  getMenuHeaders,
  updateMenuHeadersSection,
  getItemLikes,
} from "@/Api/RestaurantApi";
import { getMenuItems, toggleMenuItemStatus } from "@/Api/RestaurantApi";
import { getAllMenuThumbnails } from "@/Api/RestaurantApi";

// ── Shared input style ────────────────────────────────────────────────────────
const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none bg-white transition-all";

const Field = ({ label, children, half }) => (
  <div className={half ? "flex-1 min-w-0" : "w-full"}>
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
      {label}
    </label>
    {children}
  </div>
);

// ── Chef image upload helper ──────────────────────────────────────────────────
function ChefImageUpload({ value, onChange, onClear }) {
  const displayUrl = typeof value === "string" ? value : null;
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-xs text-gray-500 font-medium shrink-0">
        <ImageIcon size={13} />
        {displayUrl ? "Change" : "Upload"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onChange(URL.createObjectURL(file), file);
          }}
        />
      </label>
      {displayUrl ? (
        <>
          <img
            src={displayUrl}
            alt="Chef"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow shrink-0"
          />
          <button
            type="button"
            onClick={onClear}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={13} />
          </button>
        </>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border shrink-0">
          <ImageIcon size={14} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}

// ── Header & Chef Remark Editor ───────────────────────────────────────────────
function HeaderEditor({ propertyId }) {
  const [headerForm, setHeaderForm] = useState({
    part1: "",
    part2: "",
    description: "",
    isActive: true,
    imageUrl: "",
    imageFile: null,
    existingId: null,
  });
  const [remarkForm, setRemarkForm] = useState({
    remark: "",
    description: "",
    isActive: true,
    imageUrl: "",
    imageFile: null,
    existingId: null,
  });
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingRemark, setSavingRemark] = useState(false);
  const [headerError, setHeaderError] = useState(null);
  const [remarkError, setRemarkError] = useState(null);
  const [headerSuccess, setHeaderSuccess] = useState(false);
  const [remarkSuccess, setRemarkSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setHeaderError(null);
    setRemarkError(null);
    try {
      const [headersRes, remarksRes] = await Promise.all([
        getMenuHeaders(),
        getChefRemarks(),
      ]);
      const headers = (headersRes?.data || []).filter(
        (h) => h.propertyId === propertyId,
      );
      const remarks = (remarksRes?.data || []).filter(
        (r) => r.propertyId === propertyId,
      );
      const latestHeader = headers[headers.length - 1] || null;
      const latestRemark = remarks[remarks.length - 1] || null;
      if (latestHeader) {
        setHeaderForm({
          part1: latestHeader.part1 || "",
          part2: latestHeader.part2 || "",
          description: latestHeader.description || "",
          isActive: latestHeader.isActive ?? true,
          imageUrl: latestHeader.image?.url || "",
          imageFile: null,
          existingId: latestHeader.id,
        });
      }
      if (latestRemark) {
        setRemarkForm({
          remark: latestRemark.remark || "",
          description: latestRemark.description || "",
          isActive: latestRemark.isActive ?? true,
          imageUrl: latestRemark.image?.url || "",
          imageFile: null,
          existingId: latestRemark.id,
        });
      }
    } catch {
      setHeaderError("Failed to load header/remark data.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setH = (k, v) => setHeaderForm((p) => ({ ...p, [k]: v }));
  const setR = (k, v) => setRemarkForm((p) => ({ ...p, [k]: v }));

  const handleSaveHeader = async () => {
    setSavingHeader(true);
    setHeaderError(null);
    setHeaderSuccess(false);
    try {
      const fd = new FormData();
      fd.append("part1", headerForm.part1);
      fd.append("part2", headerForm.part2);
      fd.append("description", headerForm.description);
      fd.append("isActive", String(headerForm.isActive));
      fd.append("propertyId", String(propertyId));
      if (headerForm.imageFile) fd.append("image", headerForm.imageFile);
      if (headerForm.existingId) {
        await updateMenuHeadersSection(headerForm.existingId, fd);
      } else {
        const res = await createMenuHeaderSection(fd);
        setH("existingId", res?.data?.id || res?.data?.[0]?.id || null);
      }
      setHeaderSuccess(true);
      setTimeout(() => setHeaderSuccess(false), 3000);
      const headersRes = await getMenuHeaders();
      const headers = (headersRes?.data || []).filter(
        (h) => h.propertyId === propertyId,
      );
      const latest = headers[headers.length - 1] || null;
      if (latest)
        setHeaderForm((p) => ({
          ...p,
          part1: latest.part1 || "",
          part2: latest.part2 || "",
          description: latest.description || "",
          isActive: latest.isActive ?? true,
          imageUrl: latest.image?.url || "",
          imageFile: null,
          existingId: latest.id,
        }));
    } catch {
      setHeaderError("Failed to save section headline. Please try again.");
    } finally {
      setSavingHeader(false);
    }
  };

  const handleSaveRemark = async () => {
    setSavingRemark(true);
    setRemarkError(null);
    setRemarkSuccess(false);

    try {
      const fd = new FormData();
      fd.append("remark", remarkForm.remark); // ✅ ADD THIS
      fd.append("description", remarkForm.description);
      fd.append("isActive", String(remarkForm.isActive));
      fd.append("propertyId", String(propertyId));

      if (remarkForm.imageFile) {
        fd.append("image", remarkForm.imageFile);
      }

      if (remarkForm.existingId) {
        await updateChefRemark(remarkForm.existingId, fd);
      } else {
        const res = await createChefRemark(fd);
        setR("existingId", res?.data?.id || null);
      }
      setRemarkSuccess(true);
      setTimeout(() => setRemarkSuccess(false), 3000);
      const remarksRes = await getChefRemarks();
      const remarks = (remarksRes?.data || []).filter(
        (r) => r.propertyId === propertyId,
      );
      const latest = remarks[remarks.length - 1] || null;
      if (latest)
        setRemarkForm((p) => ({
          ...p,
          remark: latest.remark || "",
          description: latest.description || "",
          isActive: latest.isActive ?? true,
          imageUrl: latest.img || "",
          imageFile: null,
          existingId: latest.id,
        }));
    } catch {
      setRemarkError("Failed to save chef remark. Please try again.");
    } finally {
      setSavingRemark(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading header data…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section headline */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Section Headline
          </h3>
          {headerForm.existingId && (
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
              Editing existing
            </span>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <Field label='Part 1 (e.g. "Signature")' half>
              <input
                className={inp}
                value={headerForm.part1}
                onChange={(e) => setH("part1", e.target.value)}
                placeholder="Signature"
              />
            </Field>
            <Field label='Part 2 (accent, e.g. "Masterpieces")' half>
              <input
                className={inp}
                value={headerForm.part2}
                onChange={(e) => setH("part2", e.target.value)}
                placeholder="Masterpieces"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className={inp}
              rows={2}
              value={headerForm.description}
              onChange={(e) => setH("description", e.target.value)}
              placeholder="Short description below the heading..."
            />
          </Field>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="headerActive"
              checked={headerForm.isActive}
              onChange={(e) => setH("isActive", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="headerActive"
              className="text-xs font-semibold text-gray-600"
            >
              Active
            </label>
          </div>
          {/* <Field label="Section Image">
            <ChefImageUpload
              value={headerForm.imageUrl}
              onChange={(url, file) => {
                setH("imageUrl", url);
                setH("imageFile", file);
              }}
              onClear={() => {
                setH("imageUrl", "");
                setH("imageFile", null);
              }}
            />
          </Field> */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Preview
            </p>
            <p className="text-xl font-serif text-gray-900">
              {headerForm.part1 || "Part 1"}{" "}
              <em className="text-rose-600 not-italic font-serif">
                {headerForm.part2 || "Part 2"}
              </em>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {headerForm.description}
            </p>
          </div>
          {headerError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              {headerError}
            </div>
          )}
          {headerSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-600 font-bold">
              ✓ Section headline saved successfully.
            </div>
          )}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveHeader}
              disabled={savingHeader}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              {savingHeader ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={14} /> Save Headline
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chef's remark card */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Chef's Remark Card
          </h3>
          {remarkForm.existingId && (
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
              Editing existing
            </span>
          )}
        </div>
        <div className="p-4 space-y-3">
          <Field label="Remark (short label, e.g. Low salt preference)">
            <input
              className={inp}
              value={remarkForm.remark}
              onChange={(e) => setR("remark", e.target.value)}
              placeholder="e.g. Low salt preference"
            />
          </Field>
          <Field label="Description / Quote Text">
            <textarea
              className={inp}
              rows={2}
              value={remarkForm.description}
              onChange={(e) => setR("description", e.target.value)}
              placeholder="Customer requested less salt in dishes"
            />
          </Field>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remarkActive"
                checked={remarkForm.isActive}
                onChange={(e) => setR("isActive", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remarkActive"
                className="text-xs font-semibold text-gray-600"
              >
                Active
              </label>
            </div>
            <div className="flex-1">
              <Field label="Chef Photo">
                <ChefImageUpload
                  value={remarkForm.imageUrl}
                  onChange={(url, file) => {
                    setR("imageUrl", url);
                    setR("imageFile", file);
                  }}
                  onClear={() => {
                    setR("imageUrl", "");
                    setR("imageFile", null);
                  }}
                />
              </Field>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Card Preview
            </p>
            <div className="flex items-start gap-3 bg-white rounded-xl p-3 border shadow-sm max-w-sm">
              <div className="relative shrink-0">
                {remarkForm.imageUrl ? (
                  <img
                    src={remarkForm.imageUrl}
                    alt="Chef"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border">
                    <ImageIcon size={16} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px] font-black">❝</span>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 mb-1">
                  {remarkForm.remark || "CHEF'S REMARK"}
                </p>
                <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-2">
                  {remarkForm.description || "Add your description here…"}
                </p>
              </div>
            </div>
          </div>
          {remarkError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              {remarkError}
            </div>
          )}
          {remarkSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-600 font-bold">
              ✓ Chef remark saved successfully.
            </div>
          )}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveRemark}
              disabled={savingRemark}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold bg-rose-600 hover:bg-rose-700 transition-all disabled:opacity-60"
            >
              {savingRemark ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={14} /> Save Chef Remark
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MENU ITEMS TABLE
// modal state is lifted to MenuTab so the top-bar "Add Item" button works
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

function MenuItemsPanel({
  propertyId,
  propertyData,
  modalOpen,
  editingItem,
  onModalClose,
  onOpenEdit,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMenuItems();
      const all = res?.data || [];
      const filtered = all
        .filter((i) => i.propertyId === propertyId)
        .sort((a, b) => b.id - a.id);
      setItems(filtered);
    } catch {
      setError("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Re-fetch after modal saves
  const handleModalClose = (didSave) => {
    onModalClose();
    if (didSave) fetchItems();
  };

  const allCategories = [
    ...new Set(items.map((i) => i.category?.categoryName).filter(Boolean)),
  ];

  const filtered = items.filter((item) => {
    const matchSearch =
      !search || item.itemName?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      !categoryFilter || item.category?.categoryName === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const goToPage = (p) => setPage(Math.max(0, Math.min(p, totalPages - 1)));
  const handleSearch = (v) => {
    setSearch(v);
    setPage(0);
  };
  const handleCat = (v) => {
    setCategoryFilter(v);
    setPage(0);
  };

  const handleToggleStatus = async (item) => {
    setTogglingId(item.id);
    try {
      await toggleMenuItemStatus(item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: !i.status } : i)),
      );
    } catch {
      alert("Failed to toggle status.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading menu items…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          className={`${inp} max-w-xs`}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search items..."
        />
        <select
          className={`${inp} max-w-[180px]`}
          value={categoryFilter}
          onChange={(e) => handleCat(e.target.value)}
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || categoryFilter) && (
          <button
            onClick={() => {
              handleSearch("");
              handleCat("");
            }}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Image",
                "Name",
                "Category",
                "Type",
                "Food",
                "Likes",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-16 text-center text-sm text-gray-400"
                >
                  No menu items found. Click <strong>"Add Item"</strong> above
                  to create one.
                </td>
              </tr>
            )}
            {paginated.map((item) => (
              <tr
                key={item.id}
                className="bg-white hover:bg-gray-50/50 transition-colors"
              >
                {/* Image */}
                <td className="px-4 py-3 w-16">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center shrink-0">
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={14} className="text-gray-300" />
                    )}
                  </div>
                </td>
                {/* Name */}
                <td className="px-4 py-3 max-w-[140px]">
                  <p className="font-semibold text-gray-800 truncate text-sm">
                    {item.itemName}
                  </p>
                  {item.signatureItem && (
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                      ★ Signature
                    </span>
                  )}
                </td>
                {/* Category */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {item.category?.categoryName || "—"}
                  </span>
                </td>
                {/* Type */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-[10px] text-gray-500">
                    {item.type?.typeName || "—"}
                  </span>
                </td>
                {/* Food type */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      item.foodType === "VEG"
                        ? "bg-green-100 text-green-700"
                        : item.foodType === "NON_VEG"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.foodType || "—"}
                  </span>
                </td>
                {/* Likes */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                    <Heart size={12} className="fill-rose-500" />
                    {item.likeCount?.toLocaleString() || 0}+
                  </span>
                </td>
                {/* Status toggle */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    disabled={togglingId === item.id}
                    className={`text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-full transition-all ${
                      item.status
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    {togglingId === item.id
                      ? "…"
                      : item.status
                        ? "Active"
                        : "Inactive"}
                  </button>
                </td>
                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => onOpenEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-all"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Showing{" "}
              <span className="font-bold text-gray-600">
                {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-600">{filtered.length}</span>{" "}
              items
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${i === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal — controlled by parent MenuTab */}
      <AddMenuItemModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        initialData={editingItem}
        propertyData={propertyData}
        onSave={() => fetchItems()}
      />
    </div>
  );
}
function ItemLikesPanel({ propertyId }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getItemLikes();
        const all = res?.data || [];
        setLikes(all.filter((l) => l.propertyId === propertyId));
      } catch {
        setError("Failed to load likes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading likes…
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );

  const filtered = likes.filter(
    (l) =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      String(l.mobileNumber).includes(search),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          className={`${inp} max-w-xs`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by name, item or mobile…"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(0);
            }}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 underline"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400 font-semibold">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["#", "User", "Mobile", "Item","Note"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-sm text-gray-400"
                >
                  No likes data found.
                </td>
              </tr>
            )}
            {paginated.map((l, idx) => (
              <tr
                key={l.id}
                className="bg-white hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-xs text-gray-400 font-bold">
                  {page * PAGE_SIZE + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800 text-sm">
                    {l.name || "—"}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                  {l.mobileNumber || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {l.itemName || "—"}
                  </span>
                </td>
                {/* <td className="px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                    <Heart size={12} className="fill-rose-500" />
                    {l.totalLikeCount?.toLocaleString() || 0}
                  </span>
                </td> */}
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="text-xs text-gray-400 italic truncate">
                    {l.description || "—"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > PAGE_SIZE && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Showing{" "}
              <span className="font-bold text-gray-600">
                {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-600">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${i === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function MenuThumbnailsPanel({ propertyId, propertyData }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchThumbnails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllMenuThumbnails(propertyId);
      const data = res?.data || [];
      const all = Array.isArray(data) ? data : [];
      // Filter to only this property's thumbnails
      setThumbnails(all.filter((t) => t.propertyId === propertyId));
    } catch {
      setError("Failed to load menu thumbnails.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchThumbnails();
  }, [fetchThumbnails]);

  const handleModalClose = (didSave) => {
    setModalOpen(false);
    setEditingId(null);
    if (didSave) fetchThumbnails();
  };

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };
  const openEdit = (id) => {
    setEditingId(id);
    setModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading thumbnails…
      </div>
    );

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {thumbnails.length} thumbnail{thumbnails.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg bg-purple-600 hover:bg-purple-700 transition-all"
        >
          <PlusIcon className="w-4 h-4" /> Add Thumbnail
        </button>
      </div>

      {thumbnails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 gap-2">
          <ImageIcon size={28} className="text-gray-200" />
          <p className="text-sm">No thumbnails yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {thumbnails.map((thumb) => (
            <div
              key={thumb.id}
              className="group relative rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
            >
              {/* Media */}
              <div className="aspect-video bg-gray-100 overflow-hidden">
                {thumb.media?.type === "VIDEO" ? (
                  <video
                    src={thumb.media.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : thumb.media?.url ? (
                  <img
                    src={thumb.media.url}
                    alt={thumb.tag}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={20} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-gray-800 truncate capitalize">
                    {thumb.tag || "—"}
                  </p>
                  <span
                    className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                      thumb.active
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {thumb.active ? "Active" : "Off"}
                  </span>
                </div>
                {thumb.itemType?.typeName && (
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    {thumb.itemType.typeName}
                  </span>
                )}
              </div>

              {/* Edit overlay */}
              <button
                onClick={() => openEdit(thumb.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-lg shadow text-blue-600 hover:bg-blue-50"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddMenuthumnailModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        propertyData={propertyData}
        thumbnailId={editingId}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MENU TAB — MAIN
// ─────────────────────────────────────────────────────────────────────────────
const MenuTab = ({
  data,
  onEdit,
  onAdd,
  onDelete,
  propertyData,
  refreshData,
}) => {
  const propertyId = propertyData?.id;
  const [activePanel, setActivePanel] = useState("items");

  // Modal state lives here — top-bar "Add Item" button opens it directly
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setEditingItem(null);
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Menu</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage the section header, chef remark, and all menu items
          </p>
        </div>

        {activePanel === "items" && (
          <div className="flex items-center gap-2">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <PlusIcon className="w-4 h-4" /> Add Item
            </button>
          </div>
        )}
      </div>

      {/* ── Panel switcher ───────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: "header", label: "Header & Chef" },
          { key: "items", label: "Menu Items" },
          { key: "thumbnails", label: "Menu Thumbnails" },
          { key: "likes", label: "Likes" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActivePanel(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePanel === t.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HEADER PANEL ─────────────────────────────────────────────────── */}
      {activePanel === "header" && <HeaderEditor propertyId={propertyId} />}
      {activePanel === "likes" && <ItemLikesPanel propertyId={propertyId} />}
      {activePanel === "thumbnails" && (
        <MenuThumbnailsPanel
          propertyId={propertyId}
          propertyData={propertyData}
        />
      )}

      {/* ── ITEMS PANEL ──────────────────────────────────────────────────── */}
      {activePanel === "items" && (
        <MenuItemsPanel
          propertyId={propertyId}
          propertyData={propertyData}
          modalOpen={modalOpen}
          editingItem={editingItem}
          onModalClose={closeModal}
          onOpenEdit={openEdit}
        />
      )}
    </div>
  );
};

export default MenuTab;
