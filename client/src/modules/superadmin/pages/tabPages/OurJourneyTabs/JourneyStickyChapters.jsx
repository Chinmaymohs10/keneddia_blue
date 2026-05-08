import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, Save, Upload, Loader2 } from 'lucide-react';
import { getAllStickyChapters, saveStickyChapter, updateStickyChapter, deleteStickyChapter } from "@/Api/OurJourneyApi";
import { uploadMedia } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

export default function JourneyStickyChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await getAllStickyChapters();
      const data = response.data?.data || response.data || [];
      const mapped = Array.isArray(data) ? data.map(d => ({
        id: d.id,
        index: d.chapterIndex || d.index || '',
        year: d.year || '',
        label: d.label || '',
        headline: d.headline || '',
        body: d.body || '',
        accentColor: d.accentColor || '#0A2357',
        mediaId: d.mediaId || null,
        previewUrl: d.mediaDTO?.url || d.mediaUrl || d.media?.url || '',
        image: null,
        isNew: false
      })) : [];
      setChapters(mapped);
    } catch (error) {
      showError("Failed to fetch sticky chapters");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newIdx = String(chapters.length + 1).padStart(2, '0');
    setChapters([...chapters, { id: Date.now(), index: newIdx, year: '', label: '', headline: '', body: '', accentColor: '#0A2357', image: null, previewUrl: '', isNew: true }]);
  };

  const handleRemove = async (id) => {
    const chapter = chapters.find(c => c.id === id);
    if (chapter && !chapter.isNew && chapter.id) {
      try {
        await deleteStickyChapter(chapter.id);
        showSuccess("Chapter deleted");
      } catch (error) {
        showError("Failed to delete chapter");
        return;
      }
    }
    setChapters(chapters.filter(c => c.id !== id));
  };

  const handleChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        let mediaId = chapter.mediaId;
        
        if (chapter.image) {
          const fd = new FormData();
          fd.append("file", chapter.image);
          const res = await uploadMedia(fd);
          mediaId = typeof res.data === "number" ? res.data : (res.data?.id || res.data?.data?.id);
        }
        
        const payload = {
          chapterIndex: chapter.index,
          year: chapter.year,
          label: chapter.label,
          accentColor: chapter.accentColor,
          headline: chapter.headline,
          body: chapter.body,
          mediaId: mediaId,
          active: true
        };

        if (chapter.id && !chapter.isNew) {
           payload.id = chapter.id;
           await updateStickyChapter(payload);
        } else {
           await saveStickyChapter(payload);
        }
      }
      showSuccess("Chapters saved successfully");
      fetchChapters();
    } catch (error) {
      showError("Failed to save chapters");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Sticky Chapters</h3>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 text-white rounded-md text-sm transition-colors" style={{ backgroundColor: colors.primary }}>
          <Plus size={16} /> Add Chapter
        </button>
      </div>

      <div className="space-y-6">
        {chapters.map((chapter, i) => (
          <div key={chapter.id} className="p-5 rounded-lg border bg-white shadow-sm" style={{ borderColor: colors.border }}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Chapter {i + 1}</h4>
              <button onClick={() => handleRemove(chapter.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Text Fields */}
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Index</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1" placeholder="e.g. 01" value={chapter.index} onChange={e => handleChange(i, 'index', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Year</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1" placeholder="e.g. 2012" value={chapter.year} onChange={e => handleChange(i, 'year', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Label</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1" placeholder="e.g. The Idea" value={chapter.label} onChange={e => handleChange(i, 'label', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" className="h-9 w-12 cursor-pointer border rounded-md" value={chapter.accentColor} onChange={e => handleChange(i, 'accentColor', e.target.value)} />
                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1" placeholder="#FF8C00" value={chapter.accentColor} onChange={e => handleChange(i, 'accentColor', e.target.value)} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1 text-gray-700">Headline</label>
                  <textarea className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 h-16" placeholder="A belief before a building..." value={chapter.headline} onChange={e => handleChange(i, 'headline', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1 text-gray-700">Body</label>
                  <textarea className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 h-24" placeholder="Body text here..." value={chapter.body} onChange={e => handleChange(i, 'body', e.target.value)} />
                </div>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-4">
                <label className="block text-xs font-medium mb-1 text-gray-700">Cover Image</label>
                <div className="relative overflow-hidden border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 h-full min-h-[220px]" style={{ borderColor: colors.border }} onClick={() => document.getElementById(`chapter-img-${chapter.id}`).click()}>
                  {!chapter.previewUrl ? (
                    <>
                      <Upload size={24} className="mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500">Upload Image</span>
                    </>
                  ) : (
                    <img src={chapter.previewUrl} alt="Preview" className="w-full h-full absolute inset-0 object-cover rounded p-1" />
                  )}
                  <input id={`chapter-img-${chapter.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => {
                    if(e.target.files && e.target.files[0]) {
                       const file = e.target.files[0];
                       const newChapters = [...chapters];
                       newChapters[i].image = file;
                       newChapters[i].previewUrl = URL.createObjectURL(file);
                       setChapters(newChapters);
                    }
                  }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t" style={{ borderColor: colors.border }}>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 text-white rounded-md text-sm transition-colors disabled:opacity-50" style={{ backgroundColor: colors.success }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Chapters
        </button>
      </div>
    </div>
  );
}
