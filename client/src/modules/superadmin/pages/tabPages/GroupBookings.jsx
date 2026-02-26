import { useState, useEffect, useRef, useMemo } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Loader2,
  Pencil,
  X,
  Upload,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  FilterX,
} from "lucide-react";
import {
  addGroupBooking,
  updateGroupBooking,
  getGroupBookings,
  GetAllPropertyDetails,
} from "@/Api/Api";
import { toast } from "react-hot-toast";

const EMPTY_FORM = {
  title: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  numberOfPersons: "",
  enquiryIds: "",
  propertyId: "",
  propertyTypeId: "",
};

const PAGE_SIZE = 6;

function GroupBookings() {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  // ── Filter & pagination state ─────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterPropertyId, setFilterPropertyId] = useState("");
  const [page, setPage] = useState(1);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingRes, propertyRes] = await Promise.all([
        getGroupBookings(),
        GetAllPropertyDetails(),
      ]);
      setBookings(bookingRes?.data || []);
      const propertyData = Array.isArray(propertyRes)
        ? propertyRes
        : propertyRes?.data || [];
      setProperties(propertyData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterPropertyId]);

  // ── Derived: filtered + paginated bookings ────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...bookings].sort((a, b) => b.id - a.id); // latest first

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q),
      );
    }

    if (filterPropertyId) {
      list = list.filter(
        (b) => String(b.propertyId) === String(filterPropertyId),
      );
    }

    return list;
  }, [bookings, search, filterPropertyId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters = search.trim() || filterPropertyId;

  const clearFilters = () => {
    setSearch("");
    setFilterPropertyId("");
  };

  // ── Property name lookup for display ─────────────────────────────────────
  const propertyNameById = useMemo(() => {
    const map = {};
    properties.forEach((p) => {
      const dto = p.propertyResponseDTO || p;
      map[dto.id] = dto.propertyName;
    });
    return map;
  }, [properties]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      ctaText: item.ctaText || "",
      ctaLink: item.ctaLink || "",
      numberOfPersons: item.numberOfPersons || "",
      enquiryIds: item.enquiryIds || "",
      propertyId: item.propertyId || "",
      propertyTypeId: item.propertyTypeId || "",
    });
    setFile(null);
    setPreview(item.media?.[0]?.url || null);
    setShowModal(true);
  };

  const handlePropertyChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setForm({ ...form, propertyId: "", propertyTypeId: "" });
      return;
    }
    const selectedProp = properties.find(
      (p) => (p.propertyResponseDTO?.id || p.id).toString() === selectedId,
    );
    if (selectedProp) {
      const dto = selectedProp.propertyResponseDTO || selectedProp;
      const listing = selectedProp.propertyListingResponseDTOS?.[0];
      const propertyTypeId = listing?.id ?? "";
      setForm({ ...form, propertyId: dto.id, propertyTypeId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");

    const fd = new FormData();
    if (file) fd.append("files", file);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("ctaText", form.ctaText);
    fd.append("ctaLink", form.ctaLink);
    if (form.enquiryIds) fd.append("enquiryIds", form.enquiryIds);
    if (form.numberOfPersons)
      fd.append("numberOfPersons", form.numberOfPersons);
    if (form.propertyId) fd.append("propertyId", form.propertyId);
    fd.append("propertyTypeId", form.propertyTypeId ?? "");

    try {
      setSubmitting(true);
      if (editItem) {
        await updateGroupBooking(editItem.id, fd);
        toast.success("Updated successfully");
      } else {
        await addGroupBooking(fd);
        toast.success("Created successfully");
      }
      setShowModal(false);
      fetchData();
    } catch {
      toast.error("Failed to save. Ensure all required fields are filled.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="rounded-lg p-4 sm:p-5 shadow-sm"
      style={{ backgroundColor: colors.contentBg }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Group Bookings</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Property filter */}
        <div className="relative sm:w-56">
          <Building2
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={filterPropertyId}
            onChange={(e) => setFilterPropertyId(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 bg-white appearance-none"
          >
            <option value="">All Properties</option>
            {properties.map((p) => {
              const dto = p.propertyResponseDTO || p;
              return (
                <option key={dto.id} value={dto.id}>
                  {dto.propertyName}
                </option>
              );
            })}
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <FilterX size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="text-xs text-gray-400 mb-3">
          Showing{" "}
          <span className="font-semibold text-gray-600">{filtered.length}</span>{" "}
          result{filtered.length !== 1 ? "s" : ""}
          {hasActiveFilters ? " (filtered)" : ""}
        </p>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-gray-400 w-7 h-7" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <Search size={32} className="opacity-30" />
          <p className="text-sm">No bookings found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs underline mt-1 hover:text-gray-600"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              {item.media?.[0]?.url ? (
                <img
                  src={item.media[0].url}
                  alt={item.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                  No Image
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1">
                    {item.title}
                  </h3>
                  {item.numberOfPersons && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/5 text-primary shrink-0">
                      <Users size={10} /> {item.numberOfPersons}
                    </span>
                  )}
                </div>
                {item.propertyId && propertyNameById[item.propertyId] && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                    <Building2 size={10} />
                    {propertyNameById[item.propertyId]}
                  </span>
                )}
                <p className="text-xs text-gray-500 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-auto pt-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Page <span className="font-semibold text-gray-600">{page}</span> of{" "}
            <span className="font-semibold text-gray-600">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-gray-400 text-xs"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      page === p
                        ? "text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    style={
                      page === p ? { backgroundColor: colors.primary } : {}
                    }
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800">
                {editItem ? "Edit Group Booking" : "New Group Booking"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Image
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                        alt="preview"
                      />
                    ) : (
                      <Upload size={20} className="text-gray-300" />
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        setFile(f);
                        setPreview(URL.createObjectURL(f));
                      }}
                    />
                  </div>
                </div>

                {/* Property Dropdown */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Assign Property (Optional)
                  </label>
                  <select
                    value={form.propertyId}
                    onChange={handlePropertyChange}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
                  >
                    <option value="">No Property Assigned</option>
                    {properties.map((p) => {
                      const dto = p.propertyResponseDTO || p;
                      return (
                        <option key={dto.id} value={dto.id}>
                          {dto.propertyName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Title & Persons Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                      No. of Persons
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.numberOfPersons}
                      onChange={(e) =>
                        setForm({ ...form, numberOfPersons: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
                  />
                </div>

                {/* CTA Text & CTA Link Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      value={form.ctaText}
                      onChange={(e) =>
                        setForm({ ...form, ctaText: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                      placeholder="Book Now"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                      CTA Link
                    </label>
                    <input
                      type="url"
                      value={form.ctaLink}
                      onChange={(e) =>
                        setForm({ ...form, ctaLink: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Enquiry ID */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Enquiry ID
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.enquiryIds}
                    onChange={(e) =>
                      setForm({ ...form, enquiryIds: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-lg border text-sm font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {editItem ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupBookings;
