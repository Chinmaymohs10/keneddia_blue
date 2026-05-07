import React, { useState } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, Save, Upload } from 'lucide-react';

export default function JourneyStickyChapters() {
  const [chapters, setChapters] = useState([
    { id: 1, index: '01', year: '2012', label: 'The Idea', headline: 'A belief before\na building.', body: '', accentColor: '#FF8C00', image: null, previewUrl: '' }
  ]);

  const handleAdd = () => {
    const newIdx = String(chapters.length + 1).padStart(2, '0');
    setChapters([...chapters, { id: Date.now(), index: newIdx, year: '', label: '', headline: '', body: '', accentColor: '#0A2357', image: null, previewUrl: '' }]);
  };

  const handleRemove = (id) => {
    setChapters(chapters.filter(c => c.id !== id));
  };

  const handleChange = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleSave = () => {
    console.log("Save sticky chapters", chapters);
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
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 h-full min-h-[220px]" style={{ borderColor: colors.border }} onClick={() => document.getElementById(`chapter-img-${chapter.id}`).click()}>
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
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-white rounded-md text-sm transition-colors" style={{ backgroundColor: colors.success }}>
          <Save size={16} /> Save Chapters
        </button>
      </div>
    </div>
  );
}
