import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  createCafeSection,
  updateCafeSection,
  getCafeSectionById,
  getCafeSectionsByProperty
} from "@/Api/CafeApi";
import { uploadMedia } from "@/Api/Api";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none bg-white transition-all";

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

const Field = ({ label, children, half }) => (
  <div className={half ? "flex-1" : "w-full"}>
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
      {label}
    </label>
    {children}
  </div>
);

function ImageUpload({ value, onChange, onClear, rounded = false }) {
  const [uploading, setUploading] = useState(false);
  const cls = rounded ? "rounded-full" : "rounded-lg";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const mediaId = typeof res.data === "number" 
        ? res.data 
        : (res.data?.id || res.data?.data?.id);
      const url = res.data?.url || res.data?.data?.url || URL.createObjectURL(file);
      onChange(url, mediaId);
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-sm text-gray-500 font-medium shrink-0">
        <ImageIcon size={14} />
        {uploading ? "Uploading…" : "Upload Image"}
        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
      </label>
      {value && (
        <div className="relative">
          <img src={value} alt="" className={`w-12 h-12 ${cls} object-cover border shadow`} />
          <button onClick={onClear} className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full p-0.5">
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

const EMPTY_STORY = {
  id: null,
  heading: "",
  highlight: "",
  description: "",
  entries: []
};

const EMPTY_ENTRY = {
  id: null,
  title: "",
  subtitle: "",
  description: "",
  profileText: "",
  high: "",
  tag1: "",
  tag2: "",
  mediaId: null,
  mediaUrl: "",
  displayOrder: 1,
  active: true
};

export default function CafeStoryTab({ propertyData, refreshData }) {
  const propertyId = propertyData?.id || propertyData?.propertyId;
  const propertyTypeId = propertyData?.propertyTypeId || 1; // Default to 1 if not found

  const [story, setStory] = useState(EMPTY_STORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    fetchStory();
  }, [propertyId]);

  const fetchStory = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      // Typically we'd fetch settings for this property. 
      // Following the pattern, we might get all and find one, or hit a specific property endpoint.
      const res = await getCafeSectionsByProperty(propertyId);
      const data = res.data?.data || res.data;
      
      // If the backend returns a list, find the one for this property or use the first one if it's broad.
      // Re-fetch full details if needed
      const existing = Array.isArray(data) ? data[0] : data;
      
      if (existing?.id) {
        const fullRes = await getCafeSectionById(existing.id);
        const fullData = fullRes.data?.data || fullRes.data;
        setStory({
          id: fullData.id,
          heading: fullData.heading || "",
          highlight: fullData.highlight || "",
          description: fullData.description || "",
          active: fullData.active ?? true,
          entries: (fullData.entries || []).map(e => ({
            ...e,
            active: e.active ?? true,
            mediaUrl: e.imageUrl || e.media?.url || e.mediaUrl || ""
          }))
        });
      }
    } catch (error) {
      console.error("Failed to fetch cafe story", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      const payload = {
        propertyId,
        heading: story.heading,
        highlight: story.highlight,
        description: story.description,
        active: story.active,
        entries: story.entries.map(e => ({
            id: e.id,
            title: e.title,
            subtitle: e.subtitle,
            description: e.description,
            profileText: e.profileText,
            high: e.high,
            tag1: e.tag1,
            tag2: e.tag2,
            mediaId: e.mediaId,
            displayOrder: e.displayOrder,
            active: e.active
        }))
      };

      if (story.id) {
        await updateCafeSection(story.id, payload);
      } else {
        const res = await createCafeSection(payload);
        const newId = res.data?.data?.id || res.data?.id;
        setStory(p => ({ ...p, id: newId }));
      }
      alert("Story header saved successfully!");
    } catch (error) {
      console.error("Save error", error);
      alert("Failed to save story header.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddEntry = () => {
    setEditingEntry({ ...EMPTY_ENTRY, displayOrder: story.entries.length + 1 });
  };

  const handleSaveEntry = async () => {
    if (!editingEntry) return;

    let updatedEntries;
    if (editingEntry.tempId || editingEntry.id) {
        updatedEntries = story.entries.map(e => 
            (e.id === editingEntry.id && e.id !== null) || (e.tempId === editingEntry.tempId && e.tempId !== undefined)
            ? editingEntry : e
        );
    } else {
        updatedEntries = [...story.entries, { ...editingEntry, tempId: Date.now() }];
    }

    // Sort by displayOrder
    updatedEntries.sort((a,b) => a.displayOrder - b.displayOrder);

    // Save entire section as per the API patterns shown (creating/updating section saves entries too)
    const payload = {
        propertyId,
        heading: story.heading,
        highlight: story.highlight,
        description: story.description,
        active: story.active,
        entries: updatedEntries.map(e => ({
            id: typeof e.id === 'number' ? e.id : null,
            title: e.title,
            subtitle: e.subtitle,
            description: e.description,
            profileText: e.profileText,
            high: e.high,
            tag1: e.tag1,
            tag2: e.tag2,
            mediaId: e.mediaId,
            displayOrder: e.displayOrder,
            active: e.active
        }))
    };

    setSaving(true);
    try {
        if (story.id) {
            await updateCafeSection(story.id, payload);
        } else {
            const res = await createCafeSection(payload);
            const newId = res.data?.data?.id || res.data?.id;
            setStory(p => ({ ...p, id: newId }));
        }
        await fetchStory(); // Re-fetch to get IDs from database
        setEditingEntry(null);
    } catch (error) {
        console.error("Entry save error", error);
        alert("Failed to save entry.");
    } finally {
        setSaving(false);
    }
  };

  const toggleEntryStatus = (idx) => {
    const updated = [...story.entries];
    updated[idx] = { ...updated[idx], active: !updated[idx].active };
    setStory(p => ({ ...p, entries: updated }));
  };

  if (loading) return <div className="py-10 text-center text-gray-500">Loading Story Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Cafe Story (The Art of Slow Brewing)</h2>
        <button
          onClick={handleSaveHeader}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Story Header"}
        </button>
      </div>

      <Section title="Main Content">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Heading">
            <input className={inp} value={story.heading} onChange={e => setStory(p => ({...p, heading: e.target.value}))} placeholder="e.g. The Art of Slow Brewing" />
          </Field>
          <Field label="Highlight">
            <input className={inp} value={story.highlight} onChange={e => setStory(p => ({...p, highlight: e.target.value}))} placeholder="e.g. Discovery" />
          </Field>
        </div>
        <div className="flex gap-4 items-center">
          <Field label="Description" half>
            <textarea className={inp} rows={2} value={story.description} onChange={e => setStory(p => ({...p, description: e.target.value}))} placeholder="Short section description..." />
          </Field>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Status</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStory(p => ({ ...p, active: !p.active }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                  story.active ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                    story.active ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-gray-700">{story.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      </Section>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-700">Story Entries</h3>
          <button onClick={handleAddEntry} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all">
            <Plus size={14} /> Add Entry
          </button>
        </div>

        {editingEntry && (
          <div className="border-2 border-blue-100 rounded-xl bg-blue-50/30 p-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase">Editing Entry</span>
                <button onClick={() => setEditingEntry(null)}><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title" half>
                <input className={inp} value={editingEntry.title} onChange={e => setEditingEntry(p => ({...p, title: e.target.value}))} />
              </Field>
              <Field label="Subtitle" half>
                <input className={inp} value={editingEntry.subtitle} onChange={e => setEditingEntry(p => ({...p, subtitle: e.target.value}))} />
              </Field>
            </div>
            <Field label="Description">
              <textarea className={inp} rows={2} value={editingEntry.description} onChange={e => setEditingEntry(p => ({...p, description: e.target.value}))} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Profile Text">
                <input className={inp} value={editingEntry.profileText} onChange={e => setEditingEntry(p => ({...p, profileText: e.target.value}))} />
              </Field>
              <Field label="High (label)">
                <input className={inp} value={editingEntry.high} onChange={e => setEditingEntry(p => ({...p, high: e.target.value}))} />
              </Field>
              <Field label="Display Order">
                <input type="number" className={inp} value={editingEntry.displayOrder} onChange={e => setEditingEntry(p => ({...p, displayOrder: parseInt(e.target.value)}))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tag 1">
                <input className={inp} value={editingEntry.tag1} onChange={e => setEditingEntry(p => ({...p, tag1: e.target.value}))} />
              </Field>
              <Field label="Tag 2">
                <input className={inp} value={editingEntry.tag2} onChange={e => setEditingEntry(p => ({...p, tag2: e.target.value}))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <Field label="Image">
                <ImageUpload 
                  value={editingEntry.mediaUrl} 
                  onChange={(url, id) => setEditingEntry(p => ({...p, mediaUrl: url, mediaId: id}))} 
                  onClear={() => setEditingEntry(p => ({...p, mediaUrl: "", mediaId: null}))}
                />
              </Field>
              <div className="flex flex-col gap-2 pb-1">
                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Entry Status</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingEntry(p => ({ ...p, active: !p.active }))}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      editingEntry.active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        editingEntry.active ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-gray-700">{editingEntry.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingEntry(null)} className="px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
              <button onClick={handleSaveEntry} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                {saving ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          {story.entries.map((entry, idx) => (
            <div key={entry.id || idx} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl group">
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border">
                {entry.mediaUrl ? <img src={entry.mediaUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-800">{entry.title}</h4>
                    <span className="text-[10px] text-gray-400 font-medium">#{entry.displayOrder}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{entry.description}</p>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={() => toggleEntryStatus(idx)}
                  className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
                    entry.active ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                      entry.active ? "translate-x-4" : ""
                    }`}
                  />
                </button>
                <button onClick={() => setEditingEntry(entry)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-transform hover:scale-110"><Pencil size={14} /></button>
              </div>
            </div>
          ))}
          {story.entries.length === 0 && !editingEntry && (
            <div className="py-8 text-center text-gray-400 text-xs border border-dashed rounded-xl">No entries added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
