import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Power,
  ImageIcon,
  Clock,
  RefreshCw,
  Zap,
  Filter,
  Video,
  Save,
} from "lucide-react";
import CreateOfferModal from "@/modules/superadmin/modals/CreateOfferModal";
import { getDailyOffers, updateDailyOfferById } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";
import {
  createOfferHeader,
  getOfferHeaderById,
  updateOfferHeader,
  toggleOfferHeaderActive,
} from "@/Api/RestaurantApi";

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalize = (v = "") => v.trim().toLowerCase();

const formatExpiry = (dateStr) => {
  if (!dateStr) return null;

  const d = new Date(dateStr);
  if (isNaN(d)) return null;

  // 👉 FIX: set expiry to end of day
  d.setHours(23, 59, 59, 999);

  const now = new Date();
  const diff = d.getTime() - now.getTime();

  if (diff <= 0) return { label: "Expired", expired: true };

  const days = Math.floor(diff / 86400000);
  if (days > 0) return { label: `${days}d left`, expired: false };

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);

  return { label: `${h}h ${m}m`, expired: false };
};

const buildDefaultTypeFilter = (propertyData) => {
  const types = propertyData?.propertyTypes ?? [];
  return [...new Set([...types.map(normalize)])];
};
const headerIdKey = (propertyId) => `offer_header_id_${propertyId}`;

// ─────────────────────────────────────────────────────────────────────────────
// HEADER EDITOR
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_HEADER = {
  id: null,
  headLine1: "",
  headLine2: "",
  description: "",
  isActive: true,
};

function HeaderEditor({ propertyId, onSaved }) {
  const [form, setForm] = useState(EMPTY_HEADER);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Load existing header using stored ID
  useEffect(() => {
    (async () => {
      try {
        const storedId = localStorage.getItem(headerIdKey(propertyId));
        if (storedId) {
          const res = await getOfferHeaderById(storedId);
          const existing = res.data?.data ?? res.data;
          if (existing) {
            setForm({
              id: existing.id ?? storedId,
              headLine1: existing.headLine1 ?? "",
              headLine2: existing.headLine2 ?? "",
              description: existing.description ?? "",
              isActive: existing.isActive ?? true,
            });
          }
        }
      } catch (e) {
        console.error("Failed to load offer header", e);
        // If fetch fails (e.g. stale ID), clear stored ID so we create fresh
        localStorage.removeItem(headerIdKey(propertyId));
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        headLine1: form.headLine1,
        headLine2: form.headLine2,
        description: form.description,
        isActive: form.isActive,
        propertyId,
      };

      if (form.id) {
        await updateOfferHeader(form.id, payload);
      } else {
        const res = await createOfferHeader(payload);
        const newId = res.data?.data?.id ?? res.data?.id;
        if (newId) {
          localStorage.setItem(headerIdKey(propertyId), newId);
          setForm((p) => ({ ...p, id: newId }));
        }
      }
      showSuccess("Header saved successfully");
      onSaved?.();
    } catch (e) {
      console.error("Failed to save offer header", e);
      showError("Failed to save header. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!form.id) return;
    try {
      await toggleOfferHeaderActive(form.id, { isActive: !form.isActive });
      set("isActive", !form.isActive);
      showSuccess(`Header ${!form.isActive ? "activated" : "deactivated"}`);
    } catch (e) {
      console.error("Failed to toggle header status", e);
      showError("Failed to toggle header status");
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        Loading header…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Section Header
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <Field label='Headline Part 1 (normal, e.g. "Today&apos;s")' half>
              <input
                className={inp}
                value={form.headLine1}
                onChange={(e) => set("headLine1", e.target.value)}
                placeholder="Today's"
              />
            </Field>
            <Field label='Headline Part 2 (italic accent, e.g. "Deals")' half>
              <input
                className={inp}
                value={form.headLine2}
                onChange={(e) => set("headLine2", e.target.value)}
                placeholder="Deals"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className={inp}
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short description shown below the heading..."
            />
          </Field>

          {/* Active toggle */}
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <div
              onClick={
                form.id
                  ? handleToggleActive
                  : () => set("isActive", !form.isActive)
              }
              className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600">Active</span>
          </label>

          {/* Live preview */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Preview
            </p>
            <p className="text-xl font-serif text-gray-900">
              {form.headLine1 || "Today's"}{" "}
              <em className="text-rose-600 not-italic font-serif">
                {form.headLine2 || "Deals"}
              </em>
            </p>
            <p className="text-xs text-gray-500 mt-1">{form.description}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Save size={14} /> Save Header
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ResturantOffers({ propertyData, refreshData }) {
  const propertyId = propertyData?.id ?? propertyData?.propertyId ?? 1;

  const [allOffers, setAllOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showTypePanel, setShowTypePanel] = useState(false);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [activePanel, setActivePanel] = useState("offers");

  const defaultTypeFilter = buildDefaultTypeFilter(propertyData);
  const [activeTypeFilters, setActiveTypeFilters] = useState(defaultTypeFilter);

  // ── Fetch offers ──────────────────────────────────────────────────────────
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDailyOffers({ page: 0, size: 100 });
      const raw = res.data?.data || res.data || [];
      const list = Array.isArray(raw) ? raw : raw.content || [];
      setAllOffers(list);
      const types = [
        ...new Set(list.map((o) => o.propertyTypeName).filter(Boolean)),
      ];
      setAvailableTypes(types);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
      showError("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (offer) => {
    try {
      await updateDailyOfferById(offer.id, {
        ...offer,
        isActive: !offer.isActive,
      });
      showSuccess(`Offer ${!offer.isActive ? "activated" : "deactivated"}`);
      fetchOffers();
    } catch {
      showError("Failed to update offer status");
    }
  };

  // ── Modal ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingOffer(null);
    setModalOpen(true);
  };
  const openEdit = (offer) => {
    setEditingOffer(offer);
    setModalOpen(true);
  };
  const handleModalClose = (didSave) => {
    setModalOpen(false);
    setEditingOffer(null);
    if (didSave) fetchOffers();
  };

  // ── Type filter toggle ────────────────────────────────────────────────────
  const toggleType = (typeName) => {
    const n = normalize(typeName);
    setActiveTypeFilters((prev) =>
      prev.includes(n) ? prev.filter((t) => t !== n) : [...prev, n],
    );
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const typeFiltered = allOffers.filter((o) =>
    activeTypeFilters.length === 0
      ? true
      : activeTypeFilters.includes(normalize(o.propertyTypeName || "")),
  );

  const filtered = typeFiltered.filter((o) => {
    if (statusFilter === "active") return o.isActive;
    if (statusFilter === "inactive") return !o.isActive;
    if (statusFilter === "quick") return !!o.quickOfferActive;
    return true;
  });

  const activeCount = typeFiltered.filter((o) => o.isActive).length;
  const inactiveCount = typeFiltered.filter((o) => !o.isActive).length;
  const quickCount = typeFiltered.filter((o) => !!o.quickOfferActive).length;

  return (
    <div className="space-y-4">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Offers Section</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage the section header and deal offer cards shown on the website
          </p>
        </div>
        {activePanel === "offers" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTypePanel((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                showTypePanel
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 border-gray-200"
              }`}
            >
              <Filter size={13} /> Filter Types
            </button>
            <button
              onClick={fetchOffers}
              disabled={loading}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
            >
              <Plus size={14} /> Add Offer
            </button>
          </div>
        )}
      </div>

      {/* ── Panel switcher ────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: "header", label: "Header" },
          { key: "offers", label: `Offers (${typeFiltered.length})` },
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

      {/* ── HEADER PANEL ──────────────────────────────────────────────────── */}
      {activePanel === "header" && (
        <HeaderEditor propertyId={propertyId} onSaved={refreshData} />
      )}

      {/* ── OFFERS PANEL ──────────────────────────────────────────────────── */}
      {activePanel === "offers" && (
        <>
          {/* Type filter panel */}
          {showTypePanel && (
            <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Filter by propertyTypeName
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTypeFilters(defaultTypeFilter)}
                    className="text-[10px] font-bold text-blue-500 hover:underline"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={() => setActiveTypeFilters([])}
                    className="text-[10px] font-bold text-gray-400 hover:underline"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() =>
                      setActiveTypeFilters(availableTypes.map(normalize))
                    }
                    className="text-[10px] font-bold text-gray-400 hover:underline"
                  >
                    Select All
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map((typeName) => {
                  const isOn = activeTypeFilters.includes(normalize(typeName));
                  const isDefault = defaultTypeFilter.includes(
                    normalize(typeName),
                  );
                  return (
                    <button
                      key={typeName}
                      onClick={() => toggleType(typeName)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                        isOn
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {typeName}
                      {isDefault && (
                        <span
                          className={`text-[8px] font-black uppercase ${isOn ? "opacity-70" : "text-blue-400"}`}
                        >
                          default
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                label: "Showing",
                value: typeFiltered.length,
                color: "text-gray-700",
                bg: "bg-gray-50",
              },
              {
                label: "Active",
                value: activeCount,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Inactive",
                value: inactiveCount,
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                label: "Quick",
                value: quickCount,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-xl px-4 py-3 border border-white`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {s.label}
                </p>
                <p className={`text-xl font-bold mt-0.5 ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {[
              { key: "all", label: `All (${typeFiltered.length})` },
              { key: "active", label: `Active (${activeCount})` },
              { key: "inactive", label: `Inactive (${inactiveCount})` },
              { key: "quick", label: `Quick (${quickCount})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === t.key
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Visual",
                    "Title / Meta",
                    "Property Type",
                    "Hours",
                    "Expiry",
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
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <RefreshCw
                        size={20}
                        className="animate-spin mx-auto mb-2 text-gray-300"
                      />
                      <p className="text-xs text-gray-400">Loading offers...</p>
                    </td>
                  </tr>
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      {typeFiltered.length === 0 ? (
                        <>
                          No offers match the selected type filter.{" "}
                          <button
                            onClick={() => setActiveTypeFilters([])}
                            className="text-blue-500 underline font-semibold"
                          >
                            Show all types
                          </button>
                        </>
                      ) : (
                        "No offers match the selected status filter."
                      )}
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((offer) => {
                    const expiry = formatExpiry(offer.expiresAt);
                    const isVideo = offer.image?.type === "VIDEO";

                    return (
                      <tr
                        key={offer.id}
                        className="bg-white hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Thumbnail */}
                        <td className="px-4 py-3 w-16">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center relative shrink-0">
                            {offer.image?.url ? (
                              isVideo ? (
                                <>
                                  <video
                                    src={offer.image.url}
                                    className="w-full h-full object-cover"
                                    muted
                                  />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <Video size={12} className="text-white" />
                                  </div>
                                </>
                              ) : (
                                <img
                                  src={offer.image.url}
                                  alt={offer.title}
                                  className="w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <ImageIcon size={14} className="text-gray-300" />
                            )}
                          </div>
                        </td>

                        {/* Title + meta */}
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="font-semibold text-gray-800 truncate text-sm leading-tight">
                            {offer.title || "Untitled"}
                          </p>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {offer.couponCode && (
                              <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                {offer.couponCode}
                              </span>
                            )}
                            {offer.quickOfferActive && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 flex items-center gap-0.5">
                                <Zap size={8} /> Quick
                              </span>
                            )}
                          </div>
                          {offer.propertyName && (
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                              {offer.propertyName}
                            </p>
                          )}
                        </td>

                        {/* Property type */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {offer.propertyTypeName || "—"}
                          </span>
                        </td>

                        {/* Hours */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock
                              size={10}
                              className="text-gray-400 shrink-0"
                            />
                            {offer.availableHours || "—"}
                          </span>
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {expiry ? (
                            <span
                              className={`text-[11px] font-semibold ${expiry.expired ? "text-red-400" : "text-emerald-500"}`}
                            >
                              {expiry.label}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-300">
                              No expiry
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-full ${
                              offer.isActive
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {offer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(offer)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-all"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(offer)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                offer.isActive
                                  ? "bg-red-50 text-red-500 hover:bg-red-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              <Power size={12} />
                              {offer.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* Table footer */}
            {!loading && filtered.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">
                  Showing{" "}
                  <span className="font-bold text-gray-600">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-600">
                    {allOffers.length}
                  </span>{" "}
                  total offers
                </p>
                <p className="text-[11px] text-gray-400">
                  Type filter:{" "}
                  <span className="font-semibold text-gray-500">
                    {activeTypeFilters.length === 0
                      ? "All"
                      : activeTypeFilters.join(", ")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <CreateOfferModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editingOffer={editingOffer}
      />
    </div>
  );
}

export default ResturantOffers;
