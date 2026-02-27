import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Calendar,
  Clock,
  Phone,
  User,
  Inbox,
  MessageSquare,
} from "lucide-react";
import {
  getAllJoiningUs,
  getAllGroupBookingEnquiries,
} from "@/Api/RestaurantApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ── Reusable pagination ───────────────────────────────────────────────────────
function Pagination({ safePage, totalPages, searched, onPageChange }) {
  if (searched === 0) return null;
  return (
    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
      <p className="text-[11px] text-gray-400">
        Showing{" "}
        <span className="font-bold text-gray-600">
          {(safePage - 1) * PAGE_SIZE + 1}–
          {Math.min(safePage * PAGE_SIZE, searched)}
        </span>{" "}
        of <span className="font-bold text-gray-600">{searched}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
          )
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-gray-400 text-xs"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  safePage === p
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-500 hover:bg-white"
                }`}
              >
                {p}
              </button>
            ),
          )}
        <button
          onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — Reservation Enquiries
// ─────────────────────────────────────────────────────────────────────────────
function ReservationEnquiries({ propertyId }) {
  const [allEnquiries, setAllEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllJoiningUs();
      const raw = res?.data || [];
      const list = Array.isArray(raw) ? raw : raw.content || [];
      const filtered = list
        .filter((e) => !propertyId || e.propertyId === propertyId)
        .sort((a, b) => b.id - a.id);
      setAllEnquiries(filtered);
    } catch {
      setError("Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const q = search.trim().toLowerCase();
  const searched = q
    ? allEnquiries.filter(
        (e) =>
          e.guestName?.toLowerCase().includes(q) ||
          e.contactNumber?.toLowerCase().includes(q) ||
          e.date?.includes(q),
      )
    : allEnquiries;

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = searched.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const handleSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayCount = allEnquiries.filter((e) => e.date === today).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total",
            value: allEnquiries.length,
            color: "text-gray-700",
            bg: "bg-gray-50",
          },
          {
            label: "Today",
            value: todayCount,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Showing",
            value: searched.length,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-xl px-4 py-3 border border-white`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {s.label}
            </p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, phone, or date…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none transition-all"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                { icon: <span className="text-gray-300">#</span>, label: "ID" },
                { icon: <User size={11} />, label: "Guest Name" },
                { icon: <Phone size={11} />, label: "Contact" },
                { icon: <Calendar size={11} />, label: "Date" },
                { icon: <Clock size={11} />, label: "Time" },
                { icon: <Users size={11} />, label: "Guests" },
              ].map(({ icon, label }) => (
                <th
                  key={label}
                  className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
                >
                  <span className="flex items-center gap-1.5">
                    {icon}
                    {label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <RefreshCw
                    size={20}
                    className="animate-spin mx-auto mb-2 text-gray-300"
                  />
                  <p className="text-xs text-gray-400">Loading enquiries…</p>
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-sm text-red-400"
                >
                  {error}{" "}
                  <button
                    onClick={fetchData}
                    className="text-blue-500 underline font-semibold ml-1"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}
            {!loading && !error && paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Inbox size={28} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm text-gray-400">
                    {search
                      ? "No enquiries match your search."
                      : "No enquiries found."}
                  </p>
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              paginated.map((enquiry, idx) => (
                <tr
                  key={enquiry.id}
                  className="bg-white hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 w-12">
                    <span className="text-[11px] font-mono text-gray-400">
                      {(safePage - 1) * PAGE_SIZE + idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-violet-600">
                          {enquiry.guestName?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">
                        {enquiry.guestName || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-600 font-mono">
                      {enquiry.contactNumber || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${enquiry.date === today ? "text-blue-600" : "text-gray-700"}`}
                    >
                      {formatDate(enquiry.date)}
                    </span>
                    {enquiry.date === today && (
                      <span className="ml-1.5 text-[8px] font-black uppercase bg-blue-100 text-blue-500 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {formatTime(enquiry.time)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                      <Users size={12} className="text-gray-400" />
                      {enquiry.totalGuest ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination
          safePage={safePage}
          totalPages={totalPages}
          searched={searched.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — Group Booking Enquiries
// ─────────────────────────────────────────────────────────────────────────────
function GroupBookingEnquiries({ propertyId }) {
  const [allEnquiries, setAllEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null); // for queries expansion

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllGroupBookingEnquiries();
      const raw = res?.data || [];
      const list = Array.isArray(raw) ? raw : raw.content || [];
      const filtered = list
        .filter((e) => !propertyId || e.propertyId === propertyId)
        .sort((a, b) => b.id - a.id);
      setAllEnquiries(filtered);
    } catch {
      setError("Failed to load group booking enquiries.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const q = search.trim().toLowerCase();
  const searched = q
    ? allEnquiries.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.phoneNumber?.toLowerCase().includes(q) ||
          e.emailAddress?.toLowerCase().includes(q) ||
          e.queries?.toLowerCase().includes(q) ||
          e.enquiryDate?.includes(q),
      )
    : allEnquiries;

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = searched.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const handleSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayCount = allEnquiries.filter((e) => e.enquiryDate === today).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total",
            value: allEnquiries.length,
            color: "text-gray-700",
            bg: "bg-gray-50",
          },
          {
            label: "Today",
            value: todayCount,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Showing",
            value: searched.length,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-xl px-4 py-3 border border-white`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {s.label}
            </p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, phone, email, or query…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none transition-all"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                { icon: <span className="text-gray-300">#</span>, label: "ID" },
                { icon: <User size={11} />, label: "Name" },
                { icon: <Phone size={11} />, label: "Phone" },
                { icon: <Calendar size={11} />, label: "Enquiry Date" },
                { icon: <MessageSquare size={11} />, label: "Queries" },
              ].map(({ icon, label }) => (
                <th
                  key={label}
                  className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap"
                >
                  <span className="flex items-center gap-1.5">
                    {icon}
                    {label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <RefreshCw
                    size={20}
                    className="animate-spin mx-auto mb-2 text-gray-300"
                  />
                  <p className="text-xs text-gray-400">
                    Loading group enquiries…
                  </p>
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-sm text-red-400"
                >
                  {error}{" "}
                  <button
                    onClick={fetchData}
                    className="text-blue-500 underline font-semibold ml-1"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}
            {!loading && !error && paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <Inbox size={28} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm text-gray-400">
                    {search
                      ? "No enquiries match your search."
                      : "No group booking enquiries found."}
                  </p>
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              paginated.map((enquiry, idx) => {
                const isExpanded = expandedId === enquiry.id;
                return (
                  <tr
                    key={enquiry.id}
                    className="bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 w-12">
                      <span className="text-[11px] font-mono text-gray-400">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </span>
                    </td>

                    {/* Name + Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-blue-600">
                            {enquiry.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm leading-tight">
                            {enquiry.name || "—"}
                          </p>
                          {enquiry.emailAddress && (
                            <p className="text-[10px] text-gray-400 leading-tight">
                              {enquiry.emailAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-mono">
                        {enquiry.phoneNumber || "—"}
                      </span>
                    </td>

                    {/* Enquiry Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-sm font-semibold ${enquiry.enquiryDate === today ? "text-blue-600" : "text-gray-700"}`}
                      >
                        {formatDate(enquiry.enquiryDate)}
                      </span>
                      {enquiry.enquiryDate === today && (
                        <span className="ml-1.5 text-[8px] font-black uppercase bg-blue-100 text-blue-500 px-1.5 py-0.5 rounded">
                          Today
                        </span>
                      )}
                    </td>

                    {/* Queries — expandable */}
                    <td className="px-4 py-3 max-w-[260px]">
                      {enquiry.queries ? (
                        <div>
                          <p
                            className={`text-xs text-gray-600 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
                          >
                            {enquiry.queries}
                          </p>
                          {enquiry.queries.length > 80 && (
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : enquiry.id)
                              }
                              className="text-[10px] font-bold text-blue-500 hover:text-blue-700 mt-0.5"
                            >
                              {isExpanded ? "Show less" : "Show more"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <Pagination
          safePage={safePage}
          totalPages={totalPages}
          searched={searched.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function EnquiriesTab({ propertyData }) {
  const propertyId = propertyData?.id ?? propertyData?.propertyId ?? "";
  const [activeTab, setActiveTab] = useState("reservation");

  const tabs = [
    { key: "reservation", label: "Reservation Enquiries" },
    { key: "group", label: "Group Booking Enquiries" },
  ];

  // shared refresh — each sub-component manages its own fetch via key reset
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Enquiries</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage reservation and group booking enquiries
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === t.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {activeTab === "reservation" ? (
        <ReservationEnquiries
          key={`res-${refreshKey}`}
          propertyId={propertyId}
        />
      ) : (
        <GroupBookingEnquiries
          key={`grp-${refreshKey}`}
          propertyId={propertyId}
        />
      )}
    </div>
  );
}

export default EnquiriesTab;
