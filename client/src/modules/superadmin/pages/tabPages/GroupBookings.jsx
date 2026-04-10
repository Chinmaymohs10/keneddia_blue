import { useEffect, useMemo, useRef, useState } from "react";
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
  RefreshCw,
  Inbox,
  User,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  addGroupBooking,
  updateGroupBooking,
  updateGroupBookingActiveStatus,
  getGroupBookings,
  GetAllPropertyDetails,
  getPropertyTypes,
} from "@/Api/Api";
import { getAllGroupBookingEnquiries } from "@/Api/RestaurantApi";
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

const PAGE_SIZE = 5;
const ENQUIRY_PAGE_SIZE = 7;

function formatEnquiryDetails(rawQuery) {
  if (!rawQuery) return [];
  return String(rawQuery)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label, ...rest] = item.split(":");
      if (rest.length === 0) {
        return { label: "Details", value: label };
      }
      return {
        label: label.trim(),
        value: rest.join(":").trim() || "—",
      };
    });
}

function getPrimaryPropertyTypeName(propertyLike) {
  if (!propertyLike) return "";
  const dto = propertyLike.propertyResponseDTO || propertyLike;
  const rawType = Array.isArray(dto?.propertyTypes)
    ? dto.propertyTypes[0]
    : dto?.propertyTypes || "";

  if (typeof rawType === "string") return rawType;
  if (rawType && typeof rawType === "object") {
    return rawType.typeName || rawType.name || rawType.propertyType || "";
  }

  return "";
}

export default function GroupBookings() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const [search, setSearch] = useState("");
  const [filterPropertyId, setFilterPropertyId] = useState("");
  const [filterPropertyTypeId, setFilterPropertyTypeId] = useState("");
  const [page, setPage] = useState(1);
  const [enquiriesSearch, setEnquiriesSearch] = useState("");
  const [enquiriesPropertyTypeId, setEnquiriesPropertyTypeId] = useState("");
  const [enquiryPage, setEnquiryPage] = useState(1);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [bookingRes, propertyRes, propertyTypeRes] = await Promise.all([
        getGroupBookings(),
        GetAllPropertyDetails(),
        getPropertyTypes(),
      ]);
      setBookings(bookingRes?.data || []);
      setProperties(
        Array.isArray(propertyRes) ? propertyRes : propertyRes?.data || [],
      );
      setPropertyTypes(
        Array.isArray(propertyTypeRes)
          ? propertyTypeRes
          : propertyTypeRes?.data || [],
      );
    } catch {
      toast.error("Failed to load group bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      setEnquiriesLoading(true);
      const res = await getAllGroupBookingEnquiries();
      const raw = res?.data || res || [];
      const list = Array.isArray(raw) ? raw : raw.content || [];
      setEnquiries(list.sort((a, b) => b.id - a.id));
    } catch {
      toast.error("Failed to load enquiries");
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchEnquiries();
  }, []);

  useEffect(() => setPage(1), [search, filterPropertyId, filterPropertyTypeId]);
  useEffect(
    () => setEnquiryPage(1),
    [enquiriesSearch, enquiriesPropertyTypeId],
  );

  const propertyNameById = useMemo(() => {
    const map = {};
    properties.forEach((p) => {
      const dto = p.propertyResponseDTO || p;
      map[dto.id] = dto.propertyName;
    });
    return map;
  }, [properties]);

  const propertyTypeByPropertyId = useMemo(() => {
    const map = {};
    properties.forEach((p) => {
      const dto = p.propertyResponseDTO || p;
      const firstType = getPrimaryPropertyTypeName(dto);
      map[dto.id] = firstType;
    });
    return map;
  }, [properties]);

  const propertyTypeIdByName = useMemo(() => {
    const map = {};
    propertyTypes.forEach((type) => {
      const name = String(type?.typeName || type?.name || type?.propertyType || "")
        .trim()
        .toLowerCase();
      const id = type?.id;
      if (name && id) {
        map[name] = id;
      }
    });
    return map;
  }, [propertyTypes]);

  const propertyTypeOptions = useMemo(() => {
    return Array.from(
      new Set(
        [
          ...properties.map((p) => {
            return getPrimaryPropertyTypeName(p);
          }),
          ...enquiries.map((e) => e.propertyTypeName),
        ].filter(Boolean),
      ),
    ).sort((a, b) => String(a).localeCompare(String(b)));
  }, [enquiries, properties]);

  const propertyTypeByName = useMemo(() => {
    const map = {};
    properties.forEach((p) => {
      const dto = p.propertyResponseDTO || p;
      const name = dto.propertyName;
      const firstType = getPrimaryPropertyTypeName(dto);
      if (name && firstType) map[String(name).trim().toLowerCase()] = firstType;
    });
    return map;
  }, [properties]);

  const filteredBookings = useMemo(() => {
    let list = [...bookings].sort((a, b) => b.id - a.id);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q),
      );
    }
    if (filterPropertyId) {
      list = list.filter((b) => String(b.propertyId) === String(filterPropertyId));
    }
    if (filterPropertyTypeId) {
      list = list.filter((b) => {
        if (b.propertyTypeName) {
          return String(b.propertyTypeName) === String(filterPropertyTypeId);
        }
        if (b.propertyId && propertyTypeByPropertyId[b.propertyId]) {
          return (
            String(propertyTypeByPropertyId[b.propertyId]) ===
            String(filterPropertyTypeId)
          );
        }
        return false;
      });
    }
    return list;
  }, [
    bookings,
    search,
    filterPropertyId,
    filterPropertyTypeId,
    propertyTypeByPropertyId,
  ]);

  const filteredEnquiries = useMemo(() => {
    const q = enquiriesSearch.trim().toLowerCase();
    return enquiries.filter((e) => {
      const derivedType =
        e.propertyTypeName ||
        (e.propertyId ? propertyTypeByPropertyId[e.propertyId] : "") ||
        (e.propertyName
          ? propertyTypeByName[String(e.propertyName).trim().toLowerCase()]
          : "");

      const matchesType = enquiriesPropertyTypeId
        ? String(derivedType || "") === String(enquiriesPropertyTypeId)
        : true;

      const matchesSearch = !q
        ? true
        : [
            e.name,
            e.phoneNumber,
            e.emailAddress,
            e.propertyName,
            derivedType,
            e.queries,
            e.enquiryDate,
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [
    enquiries,
    enquiriesPropertyTypeId,
    enquiriesSearch,
    propertyTypeByPropertyId,
    propertyTypeByName,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const enquiryTotalPages = Math.max(
    1,
    Math.ceil(filteredEnquiries.length / ENQUIRY_PAGE_SIZE),
  );
  const paginatedEnquiries = filteredEnquiries.slice(
    (enquiryPage - 1) * ENQUIRY_PAGE_SIZE,
    enquiryPage * ENQUIRY_PAGE_SIZE,
  );
  const today = new Date().toISOString().split("T")[0];
  const todayEnquiryCount = enquiries.filter((e) => e.enquiryDate === today).length;

  useEffect(() => {
    setPage((prev) =>
      Math.min(prev, Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE))),
    );
  }, [filteredBookings.length]);

  useEffect(() => {
    setEnquiryPage((prev) =>
      Math.min(
        prev,
        Math.max(1, Math.ceil(filteredEnquiries.length / ENQUIRY_PAGE_SIZE)),
      ),
    );
  }, [filteredEnquiries.length]);

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
    if (!selectedProp) return;
    const dto = selectedProp.propertyResponseDTO || selectedProp;
    const propertyTypeName = getPrimaryPropertyTypeName(dto);
    const matchedPropertyTypeId =
      propertyTypeIdByName[String(propertyTypeName).trim().toLowerCase()] || "";

    setForm({
      ...form,
      propertyId: dto.id,
      propertyTypeId: matchedPropertyTypeId,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");

    const selectedProp = form.propertyId
      ? properties.find(
          (p) =>
            String(p.propertyResponseDTO?.id || p.id) === String(form.propertyId),
        )
      : null;
    const selectedDto = selectedProp?.propertyResponseDTO || selectedProp || null;
    const selectedPropertyTypeName = getPrimaryPropertyTypeName(selectedDto);
    const resolvedPropertyTypeId = selectedPropertyTypeName
      ? propertyTypeIdByName[String(selectedPropertyTypeName).trim().toLowerCase()] || ""
      : "";

    const fd = new FormData();
    if (file) fd.append("files", file);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("ctaText", form.ctaText);
    fd.append("ctaLink", form.ctaLink);
    if (form.enquiryIds) fd.append("enquiryIds", form.enquiryIds);
    if (form.numberOfPersons) fd.append("numberOfPersons", form.numberOfPersons);
    if (form.propertyId) fd.append("propertyId", form.propertyId);
    fd.append("propertyTypeId", resolvedPropertyTypeId || form.propertyTypeId || "");

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
      fetchBookings();
    } catch {
      toast.error("Failed to save. Ensure all required fields are filled.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item) => {
    const currentActive = item?.isActive ?? item?.active ?? true;
    const nextActive = !currentActive;

    try {
      setStatusUpdatingId(item.id);
      await updateGroupBookingActiveStatus(item.id, nextActive);
      toast.success(
        `Group booking ${nextActive ? "activated" : "deactivated"} successfully`,
      );
      await fetchBookings();
    } catch {
      toast.error("Failed to update booking status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="rounded-lg p-4 sm:p-5 shadow-sm" style={{ backgroundColor: colors.contentBg }}>
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <h2 className="text-lg font-bold text-gray-800">Group Bookings</h2>
        {activeTab === "bookings" ? (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={16} /> Add New
          </button>
        ) : (
          <button
            onClick={fetchEnquiries}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-white"
          >
            <RefreshCw size={16} className={enquiriesLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {["bookings", "enquiries"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab
                ? "text-blue-600 border-blue-600"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            {tab === "bookings" ? "Bookings" : "Enquiries"}
          </button>
        ))}
      </div>

      {activeTab === "bookings" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white"
              />
            </div>
          <div className="relative sm:w-56">
            <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterPropertyId}
                onChange={(e) => setFilterPropertyId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white appearance-none"
              >
                <option value="">All Properties</option>
                {properties.map((p) => {
                  const dto = p.propertyResponseDTO || p;
                  return <option key={dto.id} value={dto.id}>{dto.propertyName}</option>;
                })}
              </select>
            </div>
            <div className="relative sm:w-56">
              <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterPropertyTypeId}
                onChange={(e) => setFilterPropertyTypeId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white appearance-none"
              >
                <option value="">All Property Types</option>
                {propertyTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {(search.trim() || filterPropertyId || filterPropertyTypeId) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterPropertyId("");
                  setFilterPropertyTypeId("");
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <FilterX size={14} /> Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-gray-400 w-7 h-7" />
            </div>
          ) : paginatedBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <Search size={32} className="opacity-30" />
              <p className="text-sm">No bookings found</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        { label: "ID" },
                        // { label: "Image" },
                        { label: "Title" },
                        { label: "Property" },
                        { label: "Property Type" },
                        { label: "Persons" },
                        { label: "Description" },
                        { label: "Action" },
                      ].map(({ label }) => (
                        <th
                          key={label}
                          className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedBookings.map((item, index) => (
                      (() => {
                        const isBookingActive =
                          item?.isActive ?? item?.active ?? true;
                        return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isBookingActive
                            ? "bg-white hover:bg-gray-50/50"
                            : "bg-red-50/70 hover:bg-red-50"
                        }`}
                      >
                        <td className="px-4 py-3 text-[11px] font-mono text-gray-400 whitespace-nowrap">
                          {(page - 1) * PAGE_SIZE + index + 1}
                        </td>
                        {/* <td className="px-4 py-3">
                          {item.media?.[0]?.url ? (
                            <img
                              src={item.media[0].url}
                              alt={item.title}
                              className="h-12 w-16 rounded-md object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="flex h-12 w-16 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 text-[10px] text-gray-300">
                              No Image
                            </div>
                          )}
                        </td> */}
                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                          {item.title || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                          {item.propertyId && propertyNameById[item.propertyId]
                            ? propertyNameById[item.propertyId]
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {item.propertyTypeName ||
                            (item.propertyId
                              ? propertyTypeByPropertyId[item.propertyId]
                              : "") ||
                            "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.numberOfPersons ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary">
                              <Users size={10} /> {item.numberOfPersons}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[280px]">
                          <p className="line-clamp-2">{item.description || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(item)}
                              disabled={statusUpdatingId === item.id}
                              className={`inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity ${
                                statusUpdatingId === item.id
                                  ? "cursor-not-allowed opacity-60"
                                  : "cursor-pointer hover:opacity-90"
                              }`}
                              style={{
                                backgroundColor: isBookingActive
                                  ? "#16A34A"
                                  : "#DC2626",
                              }}
                            >
                              {statusUpdatingId === item.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : null}
                              {isBookingActive ? "Active" : "Inactive"}
                            </button>
                          </div>
                        </td>
                      </tr>
                        );
                      })()
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-400">
                    Page <span className="font-semibold text-gray-600">{page}</span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-600">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                      )
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={`booking-ellipsis-${idx}`}
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
                            style={page === p ? { backgroundColor: colors.primary } : {}}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "enquiries" && (
        <div className="space-y-4">
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Total", value: enquiries.length, color: "text-gray-700", bg: "bg-gray-50" },
              { label: "Today", value: todayEnquiryCount, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Showing", value: filteredEnquiries.length, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-white`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div> */}

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={enquiriesSearch}
              onChange={(e) => setEnquiriesSearch(e.target.value)}
              placeholder="Search by name, phone, email, property, or query…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white"
            />
          </div>
          <div className="relative sm:w-56">
            <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={enquiriesPropertyTypeId}
              onChange={(e) => setEnquiriesPropertyTypeId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white appearance-none"
            >
              <option value="">All Property Types</option>
              {propertyTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    { icon: <span className="text-gray-300">#</span>, label: "ID" },
                    { icon: <User size={11} />, label: "Name" },
                    { icon: <Phone size={11} />, label: "Phone" },
                    { icon: <Mail size={11} />, label: "Email" },
                    { icon: <Calendar size={11} />, label: "Date" },
                    { icon: <Building2 size={11} />, label: "Property" },
                    { icon: <MessageSquare size={11} />, label: "Queries" },
                  ].map(({ icon, label }) => (
                    <th key={label} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">{icon}{label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enquiriesLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Loader2 className="animate-spin text-gray-300 w-6 h-6 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Loading enquiries…</p>
                    </td>
                  </tr>
                )}
                {!enquiriesLoading && paginatedEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Inbox size={28} className="mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-gray-400">
                        {enquiriesSearch ? "No enquiries match your search." : "No group booking enquiries found."}
                      </p>
                    </td>
                  </tr>
                )}
                {!enquiriesLoading &&
                  paginatedEnquiries.map((item, index) => (
                    <tr key={item.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-[11px] font-mono text-gray-400">
                        {(enquiryPage - 1) * ENQUIRY_PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{item.phoneNumber || "—"}</td>
                      <td className="px-4 py-3 text-xs text-blue-600 font-medium">{item.emailAddress || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{item.enquiryDate || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        <div className="flex flex-col">
                          <span>{item.propertyName || "—"}</span>
                          <span className="text-gray-400">{item.propertyTypeName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[280px]">
                        {item.queries ? (
                          <div className="space-y-1">
                            {formatEnquiryDetails(item.queries).map(
                              (detail, detailIndex) => (
                                <p
                                  key={`${item.id}-${detail.label}-${detailIndex}`}
                                  className="leading-relaxed"
                                >
                                  <span className="font-semibold text-gray-700">
                                    {detail.label}:
                                  </span>{" "}
                                  <span>{detail.value}</span>
                                </p>
                              ),
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!enquiriesLoading && enquiryTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400">
                  Page{" "}
                  <span className="font-semibold text-gray-600">
                    {enquiryPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-600">
                    {enquiryTotalPages}
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEnquiryPage((p) => Math.max(1, p - 1))}
                    disabled={enquiryPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: enquiryTotalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === enquiryTotalPages ||
                        Math.abs(p - enquiryPage) <= 1,
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`enquiry-ellipsis-${idx}`}
                          className="px-2 text-gray-400 text-xs"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setEnquiryPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                            enquiryPage === p
                              ? "text-white shadow-sm"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                          style={
                            enquiryPage === p
                              ? { backgroundColor: colors.primary }
                              : {}
                          }
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() =>
                      setEnquiryPage((p) => Math.min(enquiryTotalPages, p + 1))
                    }
                    disabled={enquiryPage === enquiryTotalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="admin-modal-surface bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800">
                {editItem ? "Edit Group Booking" : "New Group Booking"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Image</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden"
                  >
                    {preview ? (
                      <img src={preview} className="w-full h-full object-cover" alt="preview" />
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
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Assign Property (Optional)</label>
                  <select
                    value={form.propertyId}
                    onChange={handlePropertyChange}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white"
                  >
                    <option value="">No Property Assigned</option>
                    {properties.map((p) => {
                      const dto = p.propertyResponseDTO || p;
                      return <option key={dto.id} value={dto.id}>{dto.propertyName}</option>;
                    })}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                    placeholder="Title"
                  />
                  <input
                    type="number"
                    min="1"
                    value={form.numberOfPersons}
                    onChange={(e) => setForm({ ...form, numberOfPersons: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                    placeholder="No. of Persons"
                  />
                </div>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                    placeholder="CTA Text"
                  />
                  <input
                    type="url"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                    placeholder="CTA Link"
                  />
                </div>
                {/* <input
                  type="number"
                  min="1"
                  value={form.enquiryIds}
                  onChange={(e) => setForm({ ...form, enquiryIds: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none"
                  placeholder="Enquiry ID"
                /> */}
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg border text-sm font-semibold text-gray-600">
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
