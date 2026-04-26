import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  BookOpen,
  Pencil,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Building2,
  Home,
  AlertCircle,
} from "lucide-react";
import {
  createCafeSection,
  updateCafeSection,
  getCafeSectionById,
  deleteCafeSection,
  getCafeSectionsByPropertyType
} from "@/Api/CafeApi";
import { getPropertyTypes, uploadMedia } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";
import { colors } from "@/lib/colors/colors";

const ENABLED_PROPERTY_TYPE_TABS = ["cafe"];

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none bg-white transition-all";

const Field = ({ label, children, half }) => (
  <div className={half ? "flex-1" : "w-full"}>
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
      {label}
    </label>
    {children}
  </div>
);

function ImageUpload({ value, onChange, onClear }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      const mediaId = typeof res.data === "number" ? res.data : (res.data?.id || res.data?.data?.id);
      const url = res.data?.url || res.data?.data?.url || URL.createObjectURL(file);
      onChange(url, mediaId);
    } catch {
      showError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all text-sm text-gray-500 font-medium shrink-0">
        <ImageIcon size={14} />
        {uploading ? "Uploading…" : "Upload"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      {value && (
        <div className="relative">
          <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border shadow" />
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
  entries: [],
  active: true
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

export default function Story() {
  const [activeTab, setActiveTab] = useState("cafe"); // Default to cafe for now
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(true);
  
  const [stories, setStories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStory, setCurrentStory] = useState(EMPTY_STORY);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  const normalize = (val = "") => val.toString().trim().replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  const fetchPropertyTypes = async () => {
    try {
      setLoadingPropertyTypes(true);
      const response = await getPropertyTypes();
      const data = response?.data || response;
      if (Array.isArray(data)) {
        const activeTypes = data.filter(type => 
          type.isActive && ENABLED_PROPERTY_TYPE_TABS.includes(normalize(type.typeName))
        );
        setPropertyTypes(activeTypes);
        // Find default tab
        const cafeType = activeTypes.find(t => normalize(t.typeName) === 'cafe');
        if (cafeType) setActiveTab(String(cafeType.id));
        else if (activeTypes.length > 0) setActiveTab(String(activeTypes[0].id));
      }
    } catch {
      showError("Failed to load property types");
    } finally {
      setLoadingPropertyTypes(false);
    }
  };

  const fetchStories = useCallback(async () => {
    if (!activeTab || activeTab === "homepage") return;
    setFetching(true);
    try {
      // Use getCafeSectionsByPropertyType with ActiveTab (propertyTypeId) as requested
      const res = await getCafeSectionsByPropertyType(activeTab);
      const data = res?.data?.data || res?.data;
      // Backend returns an array for this endpoint
      setStories(Array.isArray(data) ? data : (data ? [data] : []));
    } catch {
      setStories([]);
    } finally {
      setFetching(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleCreateNew = () => {
    setCurrentStory({ ...EMPTY_STORY });
    setIsEditing(true);
  };

  const handleEdit = async (story) => {
    try {
      setFetching(true);
      const res = await getCafeSectionById(story.id);
      const data = res?.data?.data || res?.data;
      setCurrentStory({
        ...data,
        active: data.active ?? true,
        entries: (data.entries || []).map(e => ({
          ...e,
          active: e.active ?? true,
          mediaUrl: e.imageUrl || e.media?.url || e.mediaUrl || ""
        }))
      });
      setIsEditing(true);
    } catch {
      showError("Failed to load story details");
    } finally {
      setFetching(false);
    }
  };

  const handleSaveStory = async () => {
    setSaving(true);
    try {
      const payload = {
        propertyTypeId: Number(activeTab),
        propertyId: null, // Global for this type
        heading: currentStory.heading,
        highlight: currentStory.highlight,
        description: currentStory.description,
        entries: currentStory.entries.map(e => ({
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
        })),
        active: currentStory.active
      };

      if (currentStory.id) {
        await updateCafeSection(currentStory.id, payload);
        showSuccess("Story updated");
      } else {
        await createCafeSection(payload);
        showSuccess("Story created");
      }
      setIsEditing(false);
      fetchStories();
    } catch {
      showError("Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this story header and all entries?")) return;
    try {
      await deleteCafeSection(id);
      showSuccess("Deleted successfully");
      fetchStories();
    } catch {
      showError("Failed to delete");
    }
  };

  const handleAddEntry = () => {
    setEditingEntry({ ...EMPTY_ENTRY, displayOrder: currentStory.entries.length + 1 });
  };

  const handleSaveEntry = () => {
    if (!editingEntry) return;
    let up;
    if (editingEntry.id || editingEntry.tempId) {
      up = currentStory.entries.map(e => (e.id === editingEntry.id && e.id !== null) || (e.tempId === editingEntry.tempId && e.tempId !== undefined) ? editingEntry : e);
    } else {
      up = [...currentStory.entries, { ...editingEntry, tempId: Date.now() }];
    }
    up.sort((a,b) => a.displayOrder - b.displayOrder);
    setCurrentStory(p => ({ ...p, entries: up }));
    setEditingEntry(null);
  };

  const toggleEntryActive = (idx) => {
    setCurrentStory(prev => {
      const up = [...prev.entries];
      up[idx] = { ...up[idx], active: !up[idx].active };
      return { ...prev, entries: up };
    });
  };

  return (
    <div className="space-y-6">
      {/* Property Type Tabs */}
      <div className="bg-white border rounded-xl p-3 flex flex-wrap gap-2 shadow-sm">
        {propertyTypes.map(type => (
          <button
            key={type.id}
            onClick={() => { setActiveTab(String(type.id)); setIsEditing(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === String(type.id) ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {type.typeName} Page
          </button>
        ))}
        {loadingPropertyTypes && <Loader2 size={16} className="animate-spin text-gray-400 self-center" />}
      </div>

      {isEditing ? (
        <div className="bg-white border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={18} /> {currentStory.id ? "Edit Story Content" : "New Story Content"}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Heading">
              <input className={inp} value={currentStory.heading} onChange={e => setCurrentStory(p => ({ ...p, heading: e.target.value }))} placeholder="The Art of Slow Brewing" />
            </Field>
            <Field label="Highlight">
              <input className={inp} value={currentStory.highlight} onChange={e => setCurrentStory(p => ({ ...p, highlight: e.target.value }))} placeholder="Discovery" />
            </Field>
          </div>
          <div className="flex gap-4 items-center">
            <Field label="Section Description" half>
              <textarea className={inp} rows={2} value={currentStory.description} onChange={e => setCurrentStory(p => ({ ...p, description: e.target.value }))} />
            </Field>
            <div className="flex flex-col gap-1 pt-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Section Status</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentStory.active} 
                  onChange={e => setCurrentStory(p => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary"
                />
                <span className="text-xs font-bold text-gray-700">{currentStory.active ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Story Entries ({currentStory.entries.length})</h4>
              <button 
                onClick={handleAddEntry}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-100"
              >
                + Add Entry
              </button>
            </div>

            {editingEntry && (
              <div className="p-4 border-2 border-blue-50 rounded-xl bg-blue-50/20 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title" half><input className={inp} value={editingEntry.title} onChange={e => setEditingEntry(p => ({...p, title: e.target.value}))} /></Field>
                  <Field label="Subtitle" half><input className={inp} value={editingEntry.subtitle} onChange={e => setEditingEntry(p => ({...p, subtitle: e.target.value}))} /></Field>
                </div>
                <Field label="Description"><textarea className={inp} rows={2} value={editingEntry.description} onChange={e => setEditingEntry(p => ({...p, description: e.target.value}))} /></Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Profile Text"><input className={inp} value={editingEntry.profileText} onChange={e => setEditingEntry(p => ({...p, profileText: e.target.value}))} /></Field>
                  <Field label="High Label"><input className={inp} value={editingEntry.high} onChange={e => setEditingEntry(p => ({...p, high: e.target.value}))} /></Field>
                  <Field label="Display Order"><input type="number" className={inp} value={editingEntry.displayOrder} onChange={e => setEditingEntry(p => ({...p, displayOrder: parseInt(e.target.value)}))} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <Field label="Image">
                    <ImageUpload value={editingEntry.mediaUrl} onChange={(url, id) => setEditingEntry(p => ({...p, mediaUrl: url, mediaId: id}))} onClear={() => setEditingEntry(p => ({...p, mediaUrl: "", mediaId: null}))} />
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
                  <button onClick={() => setEditingEntry(null)} className="px-3 py-1.5 text-xs font-bold text-gray-400">Cancel</button>
                  <button onClick={handleSaveEntry} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Done</button>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              {currentStory.entries.map((e, idx) => (
                <div key={e.id || idx} className="flex items-center gap-3 p-2 bg-gray-50 border rounded-lg group">
                  <div className="w-10 h-10 bg-white rounded border overflow-hidden flex-shrink-0">
                    {e.mediaUrl ? <img src={e.mediaUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-2.5 text-gray-200" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{e.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{e.description}</p>
                  </div>
                  <div className="flex items-center gap-2 pr-2">
                    <button
                      onClick={() => toggleEntryActive(idx)}
                      className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
                        e.active ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                          e.active ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                    <button onClick={() => setEditingEntry(e)} className="p-1.5 hover:bg-white rounded text-blue-500"><Pencil size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
            <button onClick={handleSaveStory} disabled={saving} className="px-8 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Story Content
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Story Sections</h3>
            {stories.length === 0 && (
              <button 
                onClick={handleCreateNew}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold uppercase transition-all shadow hover:opacity-90"
              >
                + Add Section
              </button>
            )}
          </div>
          
          <div className="p-0">
            {fetching ? (
              <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : stories.length === 0 ? (
              <div className="p-20 text-center text-gray-400 flex flex-col items-center gap-2">
                <AlertCircle size={40} className="opacity-20" />
                <p className="text-sm font-medium">No story sections found for this page.</p>
              </div>
            ) : (
              <div className="divide-y">
                {stories.map(story => (
                  <div key={story.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{story.heading}</span>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide">{story.highlight}</span>
                      </div>
                      <p className="text-xs text-gray-400 max-w-md truncate">{story.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 mr-4">
                        <div className={`w-2 h-2 rounded-full ${story.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{story.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <button onClick={() => handleEdit(story)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(story.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
