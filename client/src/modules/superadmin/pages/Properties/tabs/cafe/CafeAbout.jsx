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
  createRestaurantAbout,
  getAllRestaurantAbout,
  createRestaurantImageSocial,
  getRestaurantImageSocialByProperty,
  updateRestaurantImageSocial,
  createRestaurantConnect,
  getRestaurantConnectByProperty,
  updateRestaurantConnect,
  createSocialPlatform,
  getAllSocialPlatforms,
  addRestaurantSocialLink,
  updateRestaurantSocialLink,
  toggleRestaurantSocialLinkStatus,
} from "@/Api/RestaurantApi";
import { uploadMedia } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

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
  openTime: "07:00",
  closeTime: "23:00",
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
            openTime: existing.openingTime?.slice(0, 5) ?? "07:00",
            closeTime: existing.closingTime?.slice(0, 5) ?? "23:00",
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

      if (!form.id) {
        const res = await createRestaurantAbout(payload);
        const created = res.data?.data ?? res.data;
        setForm((prev) => ({ ...prev, id: created.id }));
        showSuccess("Cafe About created successfully");
      } else {
        await updateRestaurantAbout(form.id, payload);
        showSuccess("Cafe About updated successfully");
      }
    } catch (e) {
      console.error("Failed to save about content", e);
      showError("Failed to save content.");
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
      <Section title="Header & Badge">
        <Field label="Sub Title / Badge (e.g. Our Roots — Est. 2018)">
          <div className="relative">
            <MapPin
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400"
            />
            <input
              className={`${inp} pl-8`}
              value={form.badgeLabel}
              onChange={(e) => set("badgeLabel", e.target.value)}
              placeholder="Our Roots — Est. 2018"
            />
          </div>
        </Field>
        <Field label="Section Title (e.g. A Cafe Built On Craft & Community)">
          <input
            className={inp}
            value={form.headlineLine1}
            onChange={(e) => set("headlineLine1", e.target.value)}
            placeholder="A Cafe Built On Craft & Community"
          />
        </Field>
      </Section>

      <Section title="Description">
        <textarea
          className={inp}
          rows={5}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Our cafe was born from a simple belief..."
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
          {saving ? "Saving…" : <><Save size={14} /> Save Content</>}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA PANEL
// ─────────────────────────────────────────────────────────────────────────────
function MediaPanel({ propertyId, onImageChange }) {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingImages, setSavingImages] = useState(false);
  const [savingLinkId, setSavingLinkId] = useState(null);
  const [images, setImages] = useState([]);
  const [links, setLinks] = useState([]);
  const [recordExists, setRecordExists] = useState(false);

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
            setImages(imgList.map((img) => ({
              localId: img.mediaId ?? img.id,
              mediaId: img.mediaId ?? img.id,
              url: img.url ?? "",
              uploading: false,
            })));
            if (imgList[0]?.url) onImageChange?.(imgList[0].url);

            const slList = Array.isArray(data.socialLinks) ? data.socialLinks : [];
            setLinks(slList.map((l) => ({
              localId: l.id,
              serverId: l.id,
              platformId: l.platformId,
              platformName: l.platformName ?? "",
              iconMediaId: l.icon?.id ?? null,
              iconUrl: l.icon?.url ?? "",
              url: l.url ?? "",
              displayOrder: l.displayOrder ?? 1,
              isActive: l.isActive ?? true,
              isDirty: false,
              isNew: false,
            })));
          }
        }
      } catch (e) {
        console.error("Failed to load media", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const handleAddImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localId = `img_${Date.now()}`;
    const preview = URL.createObjectURL(file);
    setImages((p) => [...p, { localId, mediaId: null, url: preview, uploading: true }]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const raw = res.data;
      const mediaId = typeof raw === "number" ? raw : (raw?.id ?? raw?.mediaId ?? raw?.data?.id ?? null);
      const url = typeof raw === "object" && (raw?.url ?? raw?.data?.url) ? (raw?.url ?? raw?.data?.url) : preview;
      setImages((p) => p.map((img) => img.localId === localId ? { ...img, mediaId, url, uploading: false } : img));
      onImageChange?.(url);
    } catch {
      setImages((p) => p.map((img) => img.localId === localId ? { ...img, uploading: false } : img));
    }
  };

  const removeImage = (id) => setImages((p) => p.filter((img) => img.localId !== id));

  const handleSaveImages = async () => {
    setSavingImages(true);
    try {
      const payload = {
        propertyId,
        mediaIds: images.filter((img) => img.mediaId).map((img) => img.mediaId),
        isActive: true,
        socialLinks: links.filter((l) => !l.isNew && l.serverId).map((l) => ({
          platformId: l.platformId,
          iconMediaId: l.iconMediaId ?? null,
          url: l.url,
          displayOrder: l.displayOrder,
          isActive: l.isActive,
        })),
      };
      if (recordExists) await updateRestaurantImageSocial(propertyId, payload);
      else {
        await createRestaurantImageSocial(payload);
        setRecordExists(true);
      }
      showSuccess("Images saved");
    } catch (e) {
      showError("Failed to save images");
    } finally {
      setSavingImages(false);
    }
  };

  const updateLink = (id, field, val) =>
    setLinks((p) => p.map((l) => l.localId === id ? { ...l, [field]: val, isDirty: true } : l));

  const handleSaveLink = async (link) => {
    setSavingLinkId(link.localId);
    try {
      if (!link.serverId) {
        const res = await addRestaurantSocialLink(propertyId, {
          platformId: link.platformId,
          url: link.url,
          displayOrder: link.displayOrder,
          isActive: link.isActive,
        });
        const created = res.data?.data ?? res.data;
        setLinks((p) => p.map((l) => l.localId === link.localId ? { ...l, serverId: created.id, localId: created.id, isDirty: false, isNew: false } : l));
      } else {
        await updateRestaurantSocialLink(link.serverId, {
          platformId: link.platformId,
          url: link.url,
          displayOrder: link.displayOrder,
          isActive: link.isActive,
        });
        setLinks((p) => p.map((l) => l.localId === link.localId ? { ...l, isDirty: false } : l));
      }
      showSuccess("Social link saved");
    } catch (e) {
      showError("Failed to save link");
    } finally {
      setSavingLinkId(null);
    }
  };

  const addLinkRow = () => {
    setLinks((p) => [...p, {
      localId: `new_${Date.now()}`,
      serverId: null,
      platformId: platforms[0]?.id ?? null,
      platformName: platforms[0]?.name ?? "",
      url: "",
      displayOrder: p.length + 1,
      isActive: true,
      isDirty: true,
      isNew: true,
    }]);
  };

  if (loading) return <div className="py-10 text-center text-sm text-gray-400">Loading media…</div>;

  return (
    <div className="space-y-4">
      <Section title="Cafe Images (for carousel)">
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.localId} className="relative w-24 h-24 rounded-xl overflow-hidden border shadow-sm shrink-0">
              <img src={img.url} className="w-full h-full object-cover" alt="" />
              {img.uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><RefreshCw size={16} className="animate-spin text-blue-500" /></div>}
              {!img.uploading && <button onClick={() => removeImage(img.localId)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={10} /></button>}
            </div>
          ))}
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all shrink-0 gap-1">
            <Plus size={18} className="text-gray-300" />
            <span className="text-[10px] text-gray-400 font-semibold">Add Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
          </label>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={handleSaveImages} disabled={savingImages} className="text-xs font-bold text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-all disabled:opacity-50">
            {savingImages ? "Saving..." : "Save Gallery Images"}
          </button>
        </div>
      </Section>

      <Section title="Social Networks">
        <div className="space-y-2">
          {links.map((l) => (
            <div key={l.localId} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${l.isDirty ? "border-blue-200 bg-blue-50/20" : "border-gray-100 bg-white"}`}>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">{platformIcon(l.platformName)}</div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <select className={inp} value={l.platformId} onChange={(e) => {
                  const plat = platforms.find((p) => p.id === parseInt(e.target.value));
                  updateLink(l.localId, "platformId", plat?.id);
                  updateLink(l.localId, "platformName", plat?.name);
                }}>
                  {platforms.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <input className={inp} value={l.url} onChange={(e) => updateLink(l.localId, "url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateLink(l.localId, "isActive", !l.isActive)} className={`relative w-8 h-4 rounded-full transition-colors ${l.isActive ? "bg-green-500" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${l.isActive ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
                {l.isDirty && (
                  <button onClick={() => handleSaveLink(l)} disabled={savingLinkId === l.localId} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
                    {savingLinkId === l.localId ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                )}
                <button onClick={() => removeImage(l.localId)} className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          <button onClick={addLinkRow} className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"><Plus size={12} /> Add New Social Link</button>
        </div>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECT PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ConnectPanel({ propertyId, onFormChange }) {
  const [form, setForm] = useState({
    id: null,
    sectionLabel: "Connect",
    title: "+91 98765 43210",
    subtitle: "Reservations & Private Tables",
    whatsappContact: "",
    phoneNumber: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRestaurantConnectByProperty(propertyId);
        const data = res.data?.data ?? res.data;
        if (data) {
          const f = {
            id: data.id,
            sectionLabel: data.sectionLabel || "Connect",
            title: data.title || "",
            subtitle: data.subtitle || "",
            whatsappContact: data.whatsappContact || "",
            phoneNumber: data.phoneNumber || "",
            isActive: data.isActive ?? true,
          };
          setForm(f);
          onFormChange?.(f);
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
      const payload = { ...form, propertyId };
      if (!form.id) {
        const res = await createRestaurantConnect(payload);
        const created = res.data?.data ?? res.data;
        setForm((p) => ({ ...p, id: created.id }));
      } else {
        await updateRestaurantConnect(form.id, payload);
      }
      showSuccess("Connect info saved");
    } catch (e) {
      showError("Failed to save connect info");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Section title="Quick Connect Details">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Connect Section Label (e.g. Connect)">
          <input className={inp} value={form.sectionLabel} onChange={(e) => setForm({ ...form, sectionLabel: e.target.value })} />
        </Field>
        <Field label="Phone/Title (e.g. +91 98765 43210)">
          <input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
      </div>
      <Field label="Sub Title (e.g. Reservations & Private Tables)">
        <input className={inp} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Internal WhatsApp Number">
          <input className={inp} value={form.whatsappContact} onChange={(e) => setForm({ ...form, whatsappContact: e.target.value })} />
        </Field>
        <Field label="Internal Phone Number">
          <input className={inp} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving} className="text-xs font-bold text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-all disabled:opacity-50">
          {saving ? "Saving..." : "Save Connect Info"}
        </button>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function CafeAbout({ propertyData }) {
  const propertyId = propertyData?.id || propertyData?.propertyId;
  const [activePanel, setActivePanel] = useState("content");
  const [sharedImage, setSharedImage] = useState("");
  const [sharedConnectForm, setSharedConnectForm] = useState({
    sectionLabel: "Connect",
    title: "",
    subtitle: "",
  });

  return (
    <div className="max-w-5xl">
      <div className="flex gap-2 mb-6 p-1 bg-gray-50 w-fit rounded-xl border border-gray-100">
        {[
          { id: "content", label: "About Content" },
          { id: "media", label: "Gallery & Social" },
          { id: "connect", label: "Quick Connect" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActivePanel(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activePanel === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>{tab.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {activePanel === "content" && (
          <ContentPanel propertyId={propertyId} sharedImage={sharedImage} sharedConnectForm={sharedConnectForm} />
        )}
        {activePanel === "media" && (
          <MediaPanel propertyId={propertyId} onImageChange={setSharedImage} />
        )}
        {activePanel === "connect" && (
          <ConnectPanel propertyId={propertyId} onFormChange={setSharedConnectForm} />
        )}
      </div>
    </div>
  );
}
