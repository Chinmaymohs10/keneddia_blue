import React, { useState, useEffect } from "react";
import {
  Save,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  Link,
  RefreshCw,
} from "lucide-react";
import {
  updateRestaurantAbout,
  getAllRestaurantAbout,
  getRestaurantAboutById,
  toggleRestaurantAboutStatus,
  createRestaurantImageSocial,
  getRestaurantImageSocialByProperty,
  updateRestaurantImageSocial,
  createRestaurantConnect,
  getRestaurantConnectByProperty,
  updateRestaurantConnect,
  createSocialPlatform,
  getAllSocialPlatforms,
  // ── NEW ──
  updateRestaurantSocialLink,
  toggleRestaurantSocialLinkStatus,
} from "@/Api/RestaurantApi";
import { uploadMedia } from "@/Api/Api";

// ── Shared styles ─────────────────────────────────────────────────────────────
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

const Section = ({ title, children }) => (
  <div className="border border-gray-100 rounded-xl overflow-hidden">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
        {title}
      </h3>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

// ── Image Upload with uploadMedia ─────────────────────────────────────────────
function ImageUpload({ value, onChange, onClear, className = "" }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const raw = res.data;
      const mediaId =
        typeof raw === "number"
          ? raw
          : (raw?.id ?? raw?.mediaId ?? raw?.data?.id ?? null);
      const url =
        typeof raw === "object" && (raw?.url ?? raw?.data?.url)
          ? (raw?.url ?? raw?.data?.url)
          : URL.createObjectURL(file);
      onChange(url, mediaId);
    } catch {
      onChange(URL.createObjectURL(file), null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center gap-2 px-4 py-2 w-fit rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-sm text-gray-500 font-medium">
        <ImageIcon size={14} />
        {uploading ? "Uploading…" : value ? "Change Image" : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFile}
        />
      </label>
      {value ? (
        <div className="relative w-full h-52 rounded-xl overflow-hidden border shadow-sm">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
          <ImageIcon size={24} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}

// ── Social icon map ───────────────────────────────────────────────────────────
const platformIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("instagram")) return <Instagram size={14} />;
  if (n.includes("facebook")) return <Facebook size={14} />;
  if (n.includes("twitter") || n === "x") return <Twitter size={14} />;
  if (n.includes("whatsapp")) return <MessageCircle size={14} />;
  return <Link size={14} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// LIVE PREVIEW
// ─────────────────────────────────────────────────────────────────────────────
function LivePreview({ form }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
        Live Preview
      </p>
      <div className="bg-white rounded-xl border p-5 flex gap-6 shadow-sm">
        <div className="w-32 h-28 rounded-xl overflow-hidden border shrink-0 bg-gray-100 flex items-center justify-center">
          {form.image ? (
            <img
              src={form.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={20} className="text-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
            <MapPin size={9} /> {form.badgeLabel}
          </p>
          <p className="text-sm font-serif text-gray-800 leading-tight">
            {form.headlineLine1}
          </p>
          <p className="text-sm font-serif italic text-gray-400 leading-tight">
            {form.headlineLine2}
          </p>
          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
            {form.description}
          </p>
          <div className="flex gap-4 pt-1">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                Availability
              </p>
              <p className="text-xs font-semibold text-gray-700">
                {form.openTime} — {form.closeTime}
              </p>
              <p className="text-[9px] uppercase text-gray-400">{form.days}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                {form.connectLabel}
              </p>
              <p className="text-xs font-semibold text-gray-700">
                {form.connectTitle}
              </p>
              <p className="text-[9px] uppercase text-gray-400">
                {form.connectSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_ABOUT = {
  id: null,
  badgeLabel: "",
  headlineLine1: "",
  headlineLine2: "",
  description: "",
  openTime: "11:00",
  closeTime: "23:30",
  days: "Monday — Sunday",
  isActive: true,
};

function ContentPanel({ propertyId, sharedImage, sharedConnectForm }) {
  const [form, setForm] = useState(EMPTY_ABOUT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllRestaurantAbout();
        const list = res.data?.data ?? res.data ?? [];
        const existing =
          (Array.isArray(list) ? list : []).find(
            (a) => a.propertyId === propertyId,
          ) ?? list[0];
        if (existing) {
          setForm({
            id: existing.id ?? null,
            badgeLabel: existing.badgeLabel ?? "",
            headlineLine1: existing.headlineLine1 ?? "",
            headlineLine2: existing.headlineLine2 ?? "",
            description: existing.description ?? "",
            openTime: existing.openingTime?.slice(0, 5) ?? "11:00",
            closeTime: existing.closingTime?.slice(0, 5) ?? "23:30",
            days: existing.days ?? "Monday — Sunday",
            isActive: existing.isActive ?? true,
          });
        }
      } catch (e) {
        console.error("Failed to load about content", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        badgeLabel: form.badgeLabel,
        headlineLine1: form.headlineLine1,
        headlineLine2: form.headlineLine2,
        description: form.description,
        openingTime: form.openTime + ":00",
        closingTime: form.closeTime + ":00",
        days: form.days,
        propertyId,
        isActive: form.isActive,
      };
      await updateRestaurantAbout(form.id, payload);
    } catch (e) {
      console.error("Failed to save about content", e);
      alert("Failed to save content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        Loading content…
      </div>
    );

  return (
    <div className="space-y-4">
      <Section title="Badge & Location">
        <Field label="Badge Label (shown in red above headline)">
          <div className="relative">
            <MapPin
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400"
            />
            <input
              className={`${inp} pl-8`}
              value={form.badgeLabel}
              onChange={(e) => set("badgeLabel", e.target.value)}
              placeholder="KENNEDIA BLU RESTAURANT GHAZIABAD"
            />
          </div>
        </Field>
      </Section>

      <Section title="Headline">
        <Field label='Line 1 (normal serif, e.g. "Experience elegance, taste")'>
          <input
            className={inp}
            value={form.headlineLine1}
            onChange={(e) => set("headlineLine1", e.target.value)}
            placeholder="Experience elegance, taste"
          />
        </Field>
        <Field label='Line 2 (italic/muted, e.g. "and unforgettable dining.")'>
          <input
            className={inp}
            value={form.headlineLine2}
            onChange={(e) => set("headlineLine2", e.target.value)}
            placeholder="and unforgettable dining."
          />
        </Field>
      </Section>

      <Section title="Description">
        <p className="text-[10px] text-gray-400 mb-1">
          Use <code className="bg-gray-100 px-1 rounded">**text**</code> for
          bold and <code className="bg-gray-100 px-1 rounded">*text*</code> for
          italic (rendered on website).
        </p>
        <textarea
          className={inp}
          rows={5}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="We believe dining is more than just a meal…"
        />
      </Section>

      <Section title="Availability">
        <div className="flex gap-3">
          <Field label="Opening Time" half>
            <div className="relative">
              <Clock
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="time"
                className={`${inp} pl-8`}
                value={form.openTime}
                onChange={(e) => set("openTime", e.target.value)}
              />
            </div>
          </Field>
          <Field label="Closing Time" half>
            <div className="relative">
              <Clock
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="time"
                className={`${inp} pl-8`}
                value={form.closeTime}
                onChange={(e) => set("closeTime", e.target.value)}
              />
            </div>
          </Field>
        </div>
        <Field label="Days (e.g. Monday — Sunday)">
          <input
            className={inp}
            value={form.days}
            onChange={(e) => set("days", e.target.value)}
            placeholder="Monday — Sunday"
          />
        </Field>
      </Section>

      {/* Active toggle */}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <div
          onClick={() => set("isActive", !form.isActive)}
          className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600">Active</span>
      </label>

      <LivePreview
        form={{
          ...form,
          image: sharedImage,
          connectLabel: sharedConnectForm.sectionLabel,
          connectTitle: sharedConnectForm.title,
          connectSubtitle: sharedConnectForm.subtitle,
        }}
      />

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
              <Save size={14} /> Save Content
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA PANEL  — Restaurant images + social links
// Social links: existing ones use updateRestaurantSocialLink (PUT by id)
//               toggle uses toggleRestaurantSocialLinkStatus (PATCH by id)
//               new links are added via updateRestaurantImageSocial payload
//               Save Image button only saves images
// ─────────────────────────────────────────────────────────────────────────────
function MediaPanel({ propertyId, onImageChange }) {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingImages, setSavingImages] = useState(false);
  const [savingLinkId, setSavingLinkId] = useState(null); // which link row is saving
  const [newPlatformName, setNewPlatformName] = useState("");
  const [creatingPlatform, setCreatingPlatform] = useState(false);

  // Images — each: { localId, mediaId, url, uploading }
  const [images, setImages] = useState([]);

  // Social links — each: { localId, serverId (real DB id), platformId, platformName,
  //                         iconMediaId, iconUrl, url, displayOrder, isActive, isDirty }
  // isDirty = user has edited the row since last save
  const [links, setLinks] = useState([]);

  const [recordExists, setRecordExists] = useState(false);

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [platRes, imgRes] = await Promise.all([
          getAllSocialPlatforms(),
          getRestaurantImageSocialByProperty(propertyId).catch(() => null),
        ]);

        const platList = platRes.data?.data ?? platRes.data ?? [];
        setPlatforms(Array.isArray(platList) ? platList : []);

        if (imgRes) {
          const data = imgRes.data?.data ?? imgRes.data;
          if (data) {
            setRecordExists(true);

            const imgList = Array.isArray(data.images) ? data.images : [];
            setImages(
              imgList.map((img) => ({
                localId: img.mediaId ?? img.id,
                mediaId: img.mediaId ?? img.id,
                url: img.url ?? "",
                uploading: false,
              })),
            );
            if (imgList[0]?.url) onImageChange?.(imgList[0].url);

            const slList = Array.isArray(data.socialLinks)
              ? data.socialLinks
              : [];
            setLinks(
              slList.map((l) => ({
                localId: l.id, // use real DB id as localId for existing rows
                serverId: l.id, // the id used for PUT /social-link/:id
                platformId: l.platformId,
                platformName: l.platformName ?? "",
                iconMediaId: l.icon?.id ?? null,
                iconUrl: l.icon?.url ?? "",
                url: l.url ?? "",
                displayOrder: l.displayOrder ?? 1,
                isActive: l.isActive ?? true,
                isDirty: false,
                isNew: false, // existing record from server
              })),
            );
          }
        }
      } catch (e) {
        console.error("Failed to load media/social data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  // ── Image management ─────────────────────────────────────────────────────
  const handleAddImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localId = `img_${Date.now()}`;
    const preview = URL.createObjectURL(file);
    setImages((prev) => [
      ...prev,
      { localId, mediaId: null, url: preview, uploading: true },
    ]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const raw = res.data;
      const mediaId =
        typeof raw === "number"
          ? raw
          : (raw?.id ?? raw?.mediaId ?? raw?.data?.id ?? null);
      const url =
        typeof raw === "object" && (raw?.url ?? raw?.data?.url)
          ? (raw?.url ?? raw?.data?.url)
          : preview;
      setImages((prev) =>
        prev.map((img) =>
          img.localId === localId
            ? { ...img, mediaId, url, uploading: false }
            : img,
        ),
      );
      onImageChange?.(url);
    } catch {
      setImages((prev) =>
        prev.map((img) =>
          img.localId === localId ? { ...img, uploading: false } : img,
        ),
      );
    }
  };

  const removeImage = (localId) =>
    setImages((prev) => prev.filter((img) => img.localId !== localId));

  // ── Save IMAGES only (via updateRestaurantImageSocial / create) ──────────
  const handleSaveImages = async () => {
    if (images.some((img) => img.uploading)) {
      alert("Please wait for all images to finish uploading.");
      return;
    }
    setSavingImages(true);
    try {
      const payload = {
        propertyId,
        mediaIds: images.filter((img) => img.mediaId).map((img) => img.mediaId),
        isActive: true,
        // pass existing social link ids so they aren't wiped server-side
        socialLinks: links
          .filter((l) => !l.isNew && l.serverId)
          .map((l) => ({
            platformId: l.platformId,
            iconMediaId: l.iconMediaId ?? null,
            url: l.url,
            displayOrder: l.displayOrder,
            isActive: l.isActive,
          })),
      };
      if (recordExists) {
        await updateRestaurantImageSocial(propertyId, payload);
      } else {
        await createRestaurantImageSocial(payload);
        setRecordExists(true);
      }
    } catch (e) {
      console.error("Failed to save images", e);
      alert("Failed to save images. Please try again.");
    } finally {
      setSavingImages(false);
    }
  };

  // ── Social link field change — mark row as dirty ─────────────────────────
  const updateLink = (localId, field, val) =>
    setLinks((prev) =>
      prev.map((l) =>
        l.localId === localId ? { ...l, [field]: val, isDirty: true } : l,
      ),
    );

  // ── Toggle isActive — calls API immediately for existing rows ────────────
  const handleToggleActive = async (link) => {
    const newActive = !link.isActive;

    // Optimistic UI update
    setLinks((prev) =>
      prev.map((l) =>
        l.localId === link.localId ? { ...l, isActive: newActive } : l,
      ),
    );

    if (link.serverId) {
      // Existing server record — call toggle API immediately
      try {
        await toggleRestaurantSocialLinkStatus(link.serverId, newActive);
      } catch (e) {
        console.error("Failed to toggle social link status", e);
        // Revert on error
        setLinks((prev) =>
          prev.map((l) =>
            l.localId === link.localId ? { ...l, isActive: !newActive } : l,
          ),
        );
        alert("Failed to update status. Please try again.");
      }
    }
    // For new (unsaved) rows just update local state — will be sent on save
  };

  // ── Save a single social link row (PUT by serverId) ──────────────────────
  const handleSaveLink = async (link) => {
    if (!link.serverId) {
      alert("This is a new link — please use 'Add Social Link via API' flow.");
      return;
    }
    setSavingLinkId(link.localId);
    try {
      await updateRestaurantSocialLink(link.serverId, {
        platformId: link.platformId,
        iconMediaId: link.iconMediaId ?? null,
        url: link.url,
        displayOrder: link.displayOrder,
        isActive: link.isActive,
      });
      // Clear dirty flag
      setLinks((prev) =>
        prev.map((l) =>
          l.localId === link.localId ? { ...l, isDirty: false } : l,
        ),
      );
    } catch (e) {
      console.error("Failed to update social link", e);
      alert("Failed to save link. Please try again.");
    } finally {
      setSavingLinkId(null);
    }
  };

  // ── Add a new (local-only) link row ──────────────────────────────────────
  const addLinkRow = () => {
    setLinks((prev) => [
      ...prev,
      {
        localId: `new_${Date.now()}`,
        serverId: null, // no server id yet
        platformId: platforms[0]?.id ?? null,
        platformName: platforms[0]?.name ?? "",
        iconMediaId: null,
        iconUrl: "",
        url: "",
        displayOrder: prev.length + 1,
        isActive: true,
        isDirty: true,
        isNew: true,
      },
    ]);
  };

  const removeLink = (localId) =>
    setLinks((prev) => prev.filter((l) => l.localId !== localId));

  // ── Create new platform master ────────────────────────────────────────────
  const handleCreatePlatform = async () => {
    if (!newPlatformName.trim()) return;
    setCreatingPlatform(true);
    try {
      const res = await createSocialPlatform({
        name: newPlatformName.trim(),
        isActive: true,
      });
      const created = res.data?.data ?? res.data;
      setPlatforms((prev) => [...prev, created]);
      setNewPlatformName("");
    } catch (e) {
      console.error("Failed to create platform", e);
      alert("Failed to create platform.");
    } finally {
      setCreatingPlatform(false);
    }
  };

  if (loading)
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        Loading media & social…
      </div>
    );

  return (
    <div className="space-y-4">
      {/* ── Restaurant Images ─────────────────────────────────────────────── */}
      <Section title="Restaurant Images (shown on left side)">
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.localId}
              className="relative w-24 h-24 rounded-xl overflow-hidden border shadow-sm shrink-0"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
              {img.uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                </div>
              )}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => removeImage(img.localId)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all shrink-0 gap-1">
            <Plus size={18} className="text-gray-300" />
            <span className="text-[10px] text-gray-400 font-semibold">
              Add Image
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAddImage}
            />
          </label>
        </div>
        {images.length === 0 && (
          <p className="text-[11px] text-gray-400">
            No images yet — click Add Image above.
          </p>
        )}
        {/* Save Images button — ONLY saves images */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveImages}
            disabled={savingImages || images.some((img) => img.uploading)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60"
          >
            {savingImages ? (
              "Saving…"
            ) : (
              <>
                <Save size={13} /> Save Images
              </>
            )}
          </button>
        </div>
      </Section>

      {/* ── Platform Master ───────────────────────────────────────────────── */}
      <Section title="Social Platforms (Master List)">
        <p className="text-[10px] text-gray-400">
          Platforms available:{" "}
          {platforms.map((p) => p.name).join(", ") || "None yet"}
        </p>
        <div className="flex gap-2">
          <input
            className={`${inp} flex-1`}
            value={newPlatformName}
            onChange={(e) => setNewPlatformName(e.target.value)}
            placeholder="New platform name (e.g. TikTok)"
          />
          <button
            onClick={handleCreatePlatform}
            disabled={creatingPlatform || !newPlatformName.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-bold hover:bg-gray-700 transition-all disabled:opacity-60 shrink-0"
          >
            {creatingPlatform ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            Add Platform
          </button>
        </div>
      </Section>

      {/* ── Social Links ─────────────────────────────────────────────────── */}
      <Section title="Social Links (shown as icon buttons on image)">
        <div className="space-y-3">
          {links.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
              No social links yet — click Add below.
            </p>
          )}

          {links.map((link) => (
            <div
              key={link.localId}
              className={`border rounded-xl p-3 space-y-2 bg-white transition-colors ${
                link.isDirty
                  ? "border-amber-300 bg-amber-50/30"
                  : "border-gray-100"
              }`}
            >
              {/* Row header: id badge + dirty indicator */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {link.serverId ? (
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      ID: {link.serverId}
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                  {link.isDirty && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                      Unsaved changes
                    </span>
                  )}
                </div>
                {/* <button
                  onClick={() => removeLink(link.localId)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button> */}
              </div>

              <div className="flex gap-2 items-center">
                {/* Platform selector */}
                <select
                  className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700 bg-white outline-none focus:border-blue-400 shrink-0 w-36"
                  value={link.platformId ?? ""}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    const plat = platforms.find((p) => p.id === pid);
                    updateLink(link.localId, "platformId", pid);
                    updateLink(link.localId, "platformName", plat?.name ?? "");
                  }}
                >
                  <option value="">Select platform</option>
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Icon preview */}
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border shrink-0 text-gray-500">
                  {link.iconUrl ? (
                    <img
                      src={link.iconUrl}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    platformIcon(link.platformName)
                  )}
                </div>

                {/* URL */}
                <input
                  className={`${inp} flex-1`}
                  value={link.url}
                  onChange={(e) =>
                    updateLink(link.localId, "url", e.target.value)
                  }
                  placeholder="https://..."
                />

                {/* Display order */}
                <input
                  type="number"
                  min={1}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-sm w-16 text-center outline-none focus:border-blue-400 shrink-0"
                  value={link.displayOrder}
                  onChange={(e) =>
                    updateLink(
                      link.localId,
                      "displayOrder",
                      Number(e.target.value),
                    )
                  }
                />

                {/* Active toggle — calls API immediately for existing rows */}
                <div
                  onClick={() => handleToggleActive(link)}
                  title={link.isActive ? "Click to disable" : "Click to enable"}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
                    link.isActive ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      link.isActive ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>

                {/* Save this link row (only for existing server rows) */}
                {link.serverId && (
                  <button
                    onClick={() => handleSaveLink(link)}
                    disabled={savingLinkId === link.localId || !link.isDirty}
                    title="Save this link"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-xs font-bold bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-40 shrink-0"
                  >
                    {savingLinkId === link.localId ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addLinkRow}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all w-fit mt-1"
        >
          <Plus size={13} /> Add Social Link
        </button>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_CONNECT = {
  id: null,
  sectionLabel: "CONNECT",
  title: "Get In Touch",
  subtitle: "DIRECT RESERVATION",
  whatsappContact: "",
  phoneNumber: "",
  isActive: true,
};

function ConnectPanel({ propertyId, form, setForm }) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const res = await getRestaurantConnectByProperty(propertyId);
        const data = res.data?.data ?? res.data;
        const item = Array.isArray(data) ? data[0] : data;
        if (item) {
          setForm({
            id: item.id ?? null,
            sectionLabel: item.sectionLabel ?? "CONNECT",
            title: item.title ?? "Get In Touch",
            subtitle: item.subtitle ?? "DIRECT RESERVATION",
            whatsappContact: item.whatsappContact ?? "",
            phoneNumber: item.phoneNumber ?? "",
            isActive: item.isActive ?? true,
          });
        }
      } catch (e) {
        console.error("Failed to load connect data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        sectionLabel: form.sectionLabel,
        title: form.title,
        subtitle: form.subtitle,
        whatsappContact: form.whatsappContact,
        phoneNumber: form.phoneNumber,
        propertyId,
        isActive: form.isActive,
      };
      if (form.id) {
        await updateRestaurantConnect(form.id, payload);
      } else {
        const res = await createRestaurantConnect(payload);
        const newId = res.data?.data?.id ?? res.data?.id;
        setForm((p) => ({ ...p, id: newId }));
      }
    } catch (e) {
      console.error("Failed to save connect", e);
      alert("Failed to save connect info.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        Loading connect info…
      </div>
    );

  return (
    <div className="space-y-4">
      <Section title="Connect Card (shown beside Availability)">
        <div className="flex gap-3">
          <Field label="Section Label (small caps above)" half>
            <input
              className={inp}
              value={form.sectionLabel}
              onChange={(e) => set("sectionLabel", e.target.value)}
              placeholder="CONNECT"
            />
          </Field>
          <Field label="Title" half>
            <input
              className={inp}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Get In Touch"
            />
          </Field>
        </div>
        <Field label="Subtitle (small caps below title)">
          <input
            className={inp}
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="DIRECT RESERVATION"
          />
        </Field>
      </Section>

      <Section title="Quick Connect Methods">
        <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle size={15} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">WhatsApp</p>
              <p className="text-[10px] text-gray-400">Instant Chat</p>
            </div>
          </div>
          <Field label="WhatsApp Number / Link">
            <div className="relative">
              <MessageCircle
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500"
              />
              <input
                className={`${inp} pl-8`}
                value={form.whatsappContact}
                onChange={(e) => set("whatsappContact", e.target.value)}
                placeholder="+91 9876543210 or https://wa.me/..."
              />
            </div>
          </Field>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <Phone size={15} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Direct Call</p>
              <p className="text-[10px] text-gray-400">Speak to Host</p>
            </div>
          </div>
          <Field label="Phone Number">
            <div className="relative">
              <Phone
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500"
              />
              <input
                className={`${inp} pl-8`}
                value={form.phoneNumber}
                onChange={(e) => set("phoneNumber", e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
          </Field>
        </div>
      </Section>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <div
          onClick={() => set("isActive", !form.isActive)}
          className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600">Active</span>
      </label>

      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
          Quick Connect Preview
        </p>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">
            Quick Connect
          </p>
          <p className="text-[10px] text-gray-400">Choose preferred method</p>
          <div className="flex gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs font-bold text-green-700">
              <MessageCircle size={12} /> WhatsApp
              <span className="text-[9px] font-normal text-green-500">
                Instant Chat
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
              <Phone size={12} /> Direct Call
              <span className="text-[9px] font-normal text-rose-400">
                Speak to Host
              </span>
            </div>
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
              <Save size={14} /> Save Connect
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
function ResturantAbout({ propertyData, refreshData }) {
  const propertyId = propertyData?.id ?? propertyData?.propertyId ?? 1;

  const [sharedImage, setSharedImage] = useState("");
  const [connectForm, setConnectForm] = useState(EMPTY_CONNECT);
  const [activePanel, setActivePanel] = useState("content");

  const panels = [
    { key: "content", label: "Content" },
    { key: "media", label: "Image & Social" },
    { key: "connect", label: "Connect" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-gray-800">About Section</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage the restaurant story, image, social links, and contact details
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {panels.map((t) => (
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

      {activePanel === "content" && (
        <ContentPanel
          propertyId={propertyId}
          sharedImage={sharedImage}
          sharedConnectForm={connectForm}
        />
      )}
      {activePanel === "media" && (
        <MediaPanel propertyId={propertyId} onImageChange={setSharedImage} />
      )}
      {activePanel === "connect" && (
        <ConnectPanel
          propertyId={propertyId}
          form={connectForm}
          setForm={setConnectForm}
        />
      )}
    </div>
  );
}

export default ResturantAbout;
