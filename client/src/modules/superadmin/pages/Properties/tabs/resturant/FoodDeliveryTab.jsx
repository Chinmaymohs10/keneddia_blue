import { useCallback, useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import {
  createFoodDeliveryLink,
  getFoodDeliveryLinkById,
  updateFoodDeliveryLink,
  toggleFoodDeliveryLinkActive,
  toggleFoodDeliveryZomato,
  toggleFoodDeliverySwiggy,
  filterFoodDeliveryLinks,
} from "@/Api/externalApi";

const unwrapResponse = (res) => res?.data?.data ?? res?.data ?? res ?? null;

const emptyForm = {
  zomatoLink: "",
  swiggyLink: "",
  isZomatoActive: false,
  isSwiggyActive: false,
  isActive: false,
};

export default function FoodDeliveryTab({ propertyData }) {
  const propertyId = propertyData?.id;
  const propertyTypeId = propertyData?.propertyTypeId ?? propertyData?.propertyType?.id ?? null;

  const [record, setRecord]     = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(null); // "active" | "zomato" | "swiggy" | null

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRecord = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await filterFoodDeliveryLinks({ propertyId });
      const list = unwrapResponse(res);
      const found = Array.isArray(list) ? list[0] ?? null : list;
      setRecord(found);
      if (found) {
        setForm({
          zomatoLink:      found.zomatoLink      ?? "",
          swiggyLink:      found.swiggyLink      ?? "",
          isZomatoActive:  found.isZomatoActive  ?? false,
          isSwiggyActive:  found.isSwiggyActive  ?? false,
          isActive:        found.isActive        ?? false,
        });
      }
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  // ── Save (create / update) ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.zomatoLink && !form.swiggyLink) {
      showError("Please enter at least one delivery link.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        propertyId,
        propertyTypeId,
        zomatoLink:     form.zomatoLink     || null,
        swiggyLink:     form.swiggyLink     || null,
        isZomatoActive: form.isZomatoActive,
        isSwiggyActive: form.isSwiggyActive,
        isActive:       form.isActive,
      };
      if (record?.id) {
        await updateFoodDeliveryLink(record.id, payload);
      } else {
        await createFoodDeliveryLink(payload);
      }
      showSuccess("Food delivery links saved successfully!");
      setEditing(false);
      fetchRecord();
    } catch (err) {
      showError(err?.response?.data?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle helpers ─────────────────────────────────────────────────────────
  const handleToggle = async (type) => {
    if (!record?.id) return;
    setToggling(type);
    try {
      if (type === "active") {
        await toggleFoodDeliveryLinkActive(record.id, !record.isActive);
      } else if (type === "zomato") {
        await toggleFoodDeliveryZomato(record.id, !record.isZomatoActive);
      } else if (type === "swiggy") {
        await toggleFoodDeliverySwiggy(record.id, !record.isSwiggyActive);
      }
      showSuccess("Status updated.");
      fetchRecord();
    } catch (err) {
      showError(err?.response?.data?.message ?? "Toggle failed.");
    } finally {
      setToggling(null);
    }
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const StatusBadge = ({ active }) =>
    active ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <CheckCircleIcon className="w-3.5 h-3.5" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
        <XCircleIcon className="w-3.5 h-3.5" /> Inactive
      </span>
    );

  const ToggleButton = ({ type, label, active }) => (
    <button
      onClick={() => handleToggle(type)}
      disabled={!!toggling}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
        active
          ? "border-red-300 text-red-600 hover:bg-red-50"
          : "border-green-300 text-green-600 hover:bg-green-50"
      }`}
    >
      {toggling === type ? (
        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin inline" />
      ) : active ? (
        `Deactivate ${label}`
      ) : (
        `Activate ${label}`
      )}
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Food Delivery Links</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage Zomato & Swiggy delivery links for this property.
          </p>
        </div>
        {record && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all"
          >
            <PencilSquareIcon className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Overall status bar */}
        {record && (
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Overall Status:</span>
              <StatusBadge active={record.isActive} />
            </div>
            <ToggleButton type="active" label="Overall" active={record.isActive} />
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* Zomato */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png"
                  alt="Zomato"
                  className="h-4 object-contain"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                Zomato
              </label>
              {record && !editing && (
                <div className="flex items-center gap-2">
                  <StatusBadge active={record.isZomatoActive} />
                  <ToggleButton type="zomato" label="Zomato" active={record.isZomatoActive} />
                </div>
              )}
            </div>
            {editing || !record ? (
              <input
                type="url"
                value={form.zomatoLink}
                onChange={(e) => setForm((p) => ({ ...p, zomatoLink: e.target.value }))}
                placeholder="https://zomato.com/xyz"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            ) : (
              <a
                href={record.zomatoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {record.zomatoLink || <span className="text-gray-400 italic">Not set</span>}
              </a>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Swiggy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg"
                  alt="Swiggy"
                  className="h-4 object-contain"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                Swiggy
              </label>
              {record && !editing && (
                <div className="flex items-center gap-2">
                  <StatusBadge active={record.isSwiggyActive} />
                  <ToggleButton type="swiggy" label="Swiggy" active={record.isSwiggyActive} />
                </div>
              )}
            </div>
            {editing || !record ? (
              <input
                type="url"
                value={form.swiggyLink}
                onChange={(e) => setForm((p) => ({ ...p, swiggyLink: e.target.value }))}
                placeholder="https://swiggy.com/xyz"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            ) : (
              <a
                href={record.swiggyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {record.swiggyLink || <span className="text-gray-400 italic">Not set</span>}
              </a>
            )}
          </div>

          {/* Edit-mode toggles */}
          {(editing || !record) && (
            <>
              <div className="border-t border-gray-100" />
              <div className="flex flex-wrap gap-5">
                {[
                  { key: "isActive",       label: "Overall Active" },
                  { key: "isZomatoActive", label: "Zomato Active" },
                  { key: "isSwiggyActive", label: "Swiggy Active" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        {(editing || !record) && (
          <div className="px-5 py-4 border-t bg-gray-50 flex gap-3 justify-end">
            {editing && (
              <button
                onClick={() => { setEditing(false); fetchRecord(); }}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm px-5 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all inline-flex items-center gap-2"
            >
              {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              {record ? "Update" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
