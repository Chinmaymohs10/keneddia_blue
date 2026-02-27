import React, { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  createTestimonialHeader,
  getActiveTestimonialHeaders,
  getTestimonialHeaderById,
  updateTestimonialHeader,
} from "@/Api/RestaurantApi";
import {
  createVisualGalleryHeader,
  getVisualGallerieHeaders,
  getActiveVisualGalleriesHeader,
  getVisualGalleryHeaderById,
  updateVisualGalleryHeader,
} from "@/Api/RestaurantApi";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none bg-white transition-all";

const Field = ({ label, children }) => (
  <div className="w-full">
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
      {label}
    </label>
    {children}
  </div>
);

// ── Feedback banners ──────────────────────────────────────────────────────────
const ErrorBanner = ({ msg }) =>
  msg ? (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
      <AlertCircle size={13} className="shrink-0" /> {msg}
    </div>
  ) : null;

const SuccessBanner = ({ msg }) =>
  msg ? (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-bold">
      <CheckCircle2 size={13} className="shrink-0" /> {msg}
    </div>
  ) : null;

// ── Pill badge ────────────────────────────────────────────────────────────────
const EditingBadge = ({ show }) =>
  show ? (
    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
      Editing existing
    </span>
  ) : (
    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
      New record
    </span>
  );

// ── Live preview strip ────────────────────────────────────────────────────────
function HeadlinePreview({ part1, part2, description, accentColor = "text-rose-600" }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
        Preview
      </p>
      <p className="text-xl font-serif text-gray-900">
        {part1 || <span className="text-gray-300">Part 1</span>}{" "}
        <em className={`not-italic font-serif ${accentColor}`}>
          {part2 || <span className="text-gray-300">Part 2</span>}
        </em>
      </p>
      {description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VISUAL GALLERY HEADER EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function VisualGalleryHeaderEditor({ propertyId }) {
  const EMPTY = { header1: "", header2: "", description: "", isActive: true, existingId: null };
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVisualGallerieHeaders();
      const all = res?.data || [];
      // filter by propertyId, pick latest
      const matched = all
        .filter((h) => h.propertyId === propertyId)
        .sort((a, b) => b.id - a.id);
      const latest = matched[0] || null;
      if (latest) {
        setForm({
          header1: latest.header1 || "",
          header2: latest.header2 || "",
          description: latest.description || "",
          isActive: latest.isActive ?? true,
          existingId: latest.id,
        });
      } else {
        setForm(EMPTY);
      }
    } catch {
      setError("Failed to load visual gallery header.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        header1: form.header1,
        header2: form.header2,
        description: form.description,
        isActive: form.isActive,
        propertyId,
      };
      if (form.existingId) {
        await updateVisualGalleryHeader(form.existingId, payload);
      } else {
        const res = await createVisualGalleryHeader(payload);
        set("existingId", res?.data?.id || null);
      }
      setSuccess("Visual gallery header saved successfully.");
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 justify-center text-gray-400 text-sm">
        <Loader2 size={15} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
            3D Gallery / Visual Gallery Header
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Headline shown at the top of the 3D gallery section
          </p>
        </div>
        <EditingBadge show={!!form.existingId} />
      </div>

      <div className="p-4 space-y-3">
        {/* Part 1 + Part 2 */}
        <div className="flex gap-3">
          <Field label='Header Part 1 (e.g. "Welcome to")'>
            <input
              className={inp}
              value={form.header1}
              onChange={(e) => set("header1", e.target.value)}
              placeholder="Welcome to"
            />
          </Field>
          <Field label='Header Part 2 — accent (e.g. "Kennedia.")'>
            <input
              className={inp}
              value={form.header2}
              onChange={(e) => set("header2", e.target.value)}
              placeholder="Kennedia."
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description">
          <textarea
            className={inp}
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A cinematic intersection of our finest spaces…"
          />
        </Field>

        {/* Active */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <div
            onClick={() => set("isActive", !form.isActive)}
            className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-semibold text-gray-600">Active</span>
        </label>

        {/* Preview */}
        <HeadlinePreview
          part1={form.header1}
          part2={form.header2}
          description={form.description}
          accentColor="text-violet-600"
        />

        <ErrorBanner msg={error} />
        <SuccessBanner msg={success} />

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold bg-violet-600 hover:bg-violet-700 transition-all disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={14} /> Save Gallery Header</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIAL HEADER EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialHeaderEditor({ propertyId }) {
  const EMPTY = {
    testimonialName1: "",
    testimonialName2: "",
    description: "",
    isActive: true,
    existingId: null,
  };
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActiveTestimonialHeaders();
      const all = res?.data || [];
      const matched = all
        .filter((h) => h.propertyId === propertyId)
        .sort((a, b) => b.id - a.id);
      const latest = matched[0] || null;
      if (latest) {
        setForm({
          // API response uses header1/header2 even for testimonials
          testimonialName1: latest.testimonialName1 || latest.header1 || "",
          testimonialName2: latest.testimonialName2 || latest.header2 || "",
          description: latest.description || "",
          isActive: latest.isActive ?? true,
          existingId: latest.id,
        });
      } else {
        setForm(EMPTY);
      }
    } catch {
      setError("Failed to load testimonial header.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        testimonialName1: form.testimonialName1,
        testimonialName2: form.testimonialName2,
        description: form.description,
        isActive: form.isActive,
        propertyId,
      };
      if (form.existingId) {
        await updateTestimonialHeader(form.existingId, payload);
      } else {
        const res = await createTestimonialHeader(payload);
        set("existingId", res?.data?.id || null);
      }
      setSuccess("Testimonial header saved successfully.");
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 justify-center text-gray-400 text-sm">
        <Loader2 size={15} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
            Testimonials Section Header
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Headline shown at the top of the guest testimonials section
          </p>
        </div>
        <EditingBadge show={!!form.existingId} />
      </div>

      <div className="p-4 space-y-3">
        {/* Name1 + Name2 */}
        <div className="flex gap-3">
          <Field label='Part 1 (e.g. "Voices of")'>
            <input
              className={inp}
              value={form.testimonialName1}
              onChange={(e) => set("testimonialName1", e.target.value)}
              placeholder="Voices of"
            />
          </Field>
          <Field label='Part 2 — accent (e.g. "Delight.")'>
            <input
              className={inp}
              value={form.testimonialName2}
              onChange={(e) => set("testimonialName2", e.target.value)}
              placeholder="Delight."
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description">
          <textarea
            className={inp}
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Real moments shared by our guests…"
          />
        </Field>

        {/* Active */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <div
            onClick={() => set("isActive", !form.isActive)}
            className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-semibold text-gray-600">Active</span>
        </label>

        {/* Preview */}
        <HeadlinePreview
          part1={form.testimonialName1}
          part2={form.testimonialName2}
          description={form.description}
          accentColor="text-amber-500"
        />

        <ErrorBanner msg={error} />
        <SuccessBanner msg={success} />

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold bg-amber-500 hover:bg-amber-600 transition-all disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={14} /> Save Testimonial Header</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY3D — MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function Gallery3d({ propertyData }) {
  const propertyId = propertyData?.id ?? propertyData?.propertyId ?? "";

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div>
        <h2 className="text-base font-bold text-gray-800">Gallery & Testimonials</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage the section headlines for the 3D visual gallery and guest testimonials
        </p>
      </div>

      {/* Two editors stacked */}
      <VisualGalleryHeaderEditor propertyId={propertyId} />
      <TestimonialHeaderEditor  propertyId={propertyId} />
    </div>
  );
}

export default Gallery3d;