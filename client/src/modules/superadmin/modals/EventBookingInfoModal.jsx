import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Ticket,
  Users,
  Phone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Hash,
  UserCheck,
  BookOpen,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { getEventInterestByEventId } from "@/Api/Api";
import { colors } from "@/lib/colors/colors";

const PAGE_SIZE = 8;

const AVATAR_PALETTE = [
  "#E33E33",
  "#0A66C2",
  "#25D366",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

function getInitials(name) {
  return (name || "")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
}

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++)
    hash = (name || "").charCodeAt(i) + hash * 31;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getRecordDate(record) {
  return (
    record?.bookingDate ||
    record?.selectedDate ||
    record?.date ||
    record?.eventDate ||
    record?.createdAt ||
    record?.createdDate ||
    null
  );
}

function formatRecordDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RecordRow({ record, index, type }) {
  const bg = avatarColor(record.name);
  const initials = getInitials(record.name);
  const selectedDate = formatRecordDate(getRecordDate(record));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.2 }}
      className="flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0 transition-colors hover:bg-gray-50/60"
      style={{ borderColor: colors.border }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-sm"
        style={{ backgroundColor: bg }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: colors.textPrimary }}>
          {record.name}
        </p>
        <p className="text-[11px] truncate mt-0.5" style={{ color: colors.textSecondary }}>
          {record.emailId || "—"}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <Phone size={11} style={{ color: colors.textSecondary }} />
        <span className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
          {record.phoneNumber}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-1.5 shrink-0 min-w-[90px]">
        <Calendar size={11} style={{ color: colors.textSecondary }} />
        <span className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
          {selectedDate}
        </span>
      </div>

      {type === "BOOK" ? (
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200">
            <Users size={11} className="text-green-600" />
            <span className="text-[11px] font-black text-green-700">
              {record.guestNumber ?? 1}{" "}
              {(record.guestNumber ?? 1) !== 1 ? "guests" : "guest"}
            </span>
          </div>
          {record.bookCount !== null && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E33E33]/10 border border-[#E33E33]/20">
              <Hash size={10} className="text-[#E33E33]" />
              <span className="text-[11px] font-black text-[#E33E33]">
                {record.bookCount}
              </span>
            </div>
          )}
        </div>
      ) : (
        record.interestCount !== null && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 shrink-0">
            <Heart size={10} className="text-rose-500" fill="currentColor" />
            <span className="text-[11px] font-black text-rose-600">
              {record.interestCount}
            </span>
          </div>
        )
      )}
    </motion.div>
  );
}

function EmptyState({ type }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {type === "INTERESTED" ? (
        <Heart size={36} className="text-gray-200" />
      ) : (
        <Ticket size={36} className="text-gray-200" />
      )}
      <p className="text-sm font-bold" style={{ color: colors.textSecondary }}>
        No {type === "INTERESTED" ? "interest" : "booking"} records yet
      </p>
    </div>
  );
}

function EventBookingInfoModal({ isOpen, onClose, eventId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("INTERESTED");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await getEventInterestByEventId(eventId);
      const data = res?.data?.data ?? res?.data ?? res ?? [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch interest/booking data:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setPage(1);
      setActiveTab("INTERESTED");
    }
  }, [isOpen, fetchData]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const filtered = records.filter((r) => r.interactionType === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const interestedCount = records.filter((r) => r.interactionType === "INTERESTED").length;
  const bookCount = records.filter((r) => r.interactionType === "BOOK").length;

  const bookRecords = records.filter(
    (r) => r.interactionType === "BOOK" && r.bookCount !== null
  );
  const latestBookCount =
    bookRecords.length > 0
      ? Math.max(...bookRecords.map((r) => r.bookCount))
      : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-stretch justify-stretch">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="admin-modal-overlay absolute inset-0"
          />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="admin-modal-surface relative z-10 flex flex-col bg-white shadow-2xl overflow-hidden w-full h-full"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b shrink-0"
              style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#E33E3318" }}
                >
                  <BookOpen size={16} style={{ color: "#E33E33" }} />
                </div>
                <div>
                  <h2
                    className="text-sm font-black leading-none"
                    style={{ color: colors.textPrimary }}
                  >
                    Interest & Bookings
                  </h2>
                  <p className="text-[10px] mt-0.5" style={{ color: colors.textSecondary }}>
                    Event ID: {eventId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 rounded-lg border transition-all hover:bg-gray-50 disabled:opacity-40"
                  style={{ borderColor: colors.border }}
                  title="Refresh"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                    style={{ color: colors.textSecondary }}
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg border transition-all hover:bg-red-50"
                  style={{ borderColor: colors.border }}
                >
                  <X size={14} style={{ color: colors.textSecondary }} />
                </button>
              </div>
            </div>

            {/* Summary Pills */}
            <div
              className="flex items-center gap-3 px-6 py-3 border-b shrink-0 flex-wrap"
              style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200">
                <Heart size={11} className="text-rose-500" fill="currentColor" />
                <span className="text-[11px] font-black text-rose-700">
                  {interestedCount} interested
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                <Ticket size={11} className="text-green-600" />
                <span className="text-[11px] font-black text-green-700">
                  {bookCount} booked
                </span>
              </div>
              {latestBookCount !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E33E33]/10 border border-[#E33E33]/20">
                  <Hash size={10} className="text-[#E33E33]" />
                  <span className="text-[11px] font-black text-[#E33E33]">
                    Last booking #{latestBookCount}
                  </span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 border-b" style={{ borderColor: colors.border }}>
              {["INTERESTED", "BOOK"].map((tab) => {
                const isActive = activeTab === tab;
                const count = tab === "INTERESTED" ? interestedCount : bookCount;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold transition-colors"
                    style={{
                      color: isActive ? "#E33E33" : colors.textSecondary,
                      backgroundColor: isActive ? "#E33E3308" : "transparent",
                    }}
                  >
                    {tab === "INTERESTED" ? (
                      <Heart size={13} fill={isActive ? "currentColor" : "none"} />
                    ) : (
                      <UserCheck size={13} />
                    )}
                    {tab === "INTERESTED" ? "Interested" : "Bookings"}
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                      style={{
                        backgroundColor: isActive ? "#E33E33" : colors.border,
                        color: isActive ? "#fff" : colors.textSecondary,
                      }}
                    >
                      {count}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E33E33]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Column Headers */}
            <div
              className="flex items-center px-5 py-2.5 border-b shrink-0 gap-4"
              style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}
            >
              <div className="w-9 shrink-0" />
              <span
                className="flex-1 text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.textSecondary }}
              >
                Guest
              </span>
              <span
                className="hidden sm:block text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.textSecondary }}
              >
                Phone
              </span>
              <span
                className="hidden md:block min-w-[90px] text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.textSecondary }}
              >
                Date
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.textSecondary }}
              >
                {activeTab === "BOOK" ? "Guests / #" : "Count"}
              </span>
            </div>

            {/* Records */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin" style={{ color: "#E33E33" }} />
                </div>
              ) : paginated.length === 0 ? (
                <EmptyState type={activeTab} />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-${page}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {paginated.map((record, i) => (
                      <RecordRow key={record.id} record={record} index={i} type={activeTab} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div
                className="flex items-center justify-between px-6 py-3.5 border-t shrink-0"
                style={{ borderColor: colors.border, backgroundColor: colors.contentBg }}
              >
                <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 hover:bg-gray-50 active:scale-95"
                    style={{ borderColor: colors.border, color: colors.textPrimary }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span
                    className="text-xs font-black px-2"
                    style={{ color: colors.textPrimary }}
                  >
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 hover:bg-gray-50 active:scale-95"
                    style={{ borderColor: colors.border, color: colors.textPrimary }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default EventBookingInfoModal;
