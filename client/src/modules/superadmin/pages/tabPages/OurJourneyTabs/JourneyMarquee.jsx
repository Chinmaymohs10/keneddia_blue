import React, { useState } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, Save, GripVertical, Eye } from 'lucide-react';

export default function JourneyMarquee() {
  const [items, setItems] = useState(["+ Team", "5 Hotels", "12 Outlets", "10+ Years", "25,000+ Events"]);
  const [showPreview, setShowPreview] = useState(false);

  const handleAdd = () => setItems(["", ...items]);
  const handleRemove = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };
  const handleChange = (index, val) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
  };
  const handleSave = () => console.log("Save marquee", items);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>Marquee Items</h3>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{items.length} item{items.length !== 1 ? 's' : ''} · scrolls continuously on the page</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: showPreview ? colors.primary : colors.border,
              color: showPreview ? colors.primary : colors.textSecondary,
              backgroundColor: showPreview ? `${colors.primary}10` : 'transparent',
            }}
          >
            <Eye size={14} /> Preview
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div
          className="rounded-xl p-4 border overflow-hidden"
          style={{ backgroundColor: '#1a1a1a', borderColor: colors.border }}
        >
          <p className="text-xs mb-3 font-medium" style={{ color: colors.textLight }}>Live Preview</p>
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-marquee-slow text-sm font-semibold" style={{ color: '#ffffff' }}>
              {[...items, ...items].filter(Boolean).map((item, i) => (
                <span key={i}>
                  <span style={{ color: colors.primary }}>{item}</span>
                  <span className="mx-4 opacity-30">·</span>
                </span>
              ))}
            </span>
          </div>
        </div>
      )}

      {/* Items List */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ backgroundColor: `${colors.primary}08`, borderBottom: `1px solid ${colors.border}` }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>Item Text</span>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>Actions</span>
        </div>

        <div className="divide-y" style={{ borderColor: colors.border }}>
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3">
              <GripVertical size={16} className="shrink-0 cursor-grab" style={{ color: colors.textLight }} />
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: `${colors.primary}18`, color: colors.primary }}
              >
                {index + 1}
              </div>
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none"
                style={{ borderColor: colors.border, color: colors.textPrimary }}
                placeholder="e.g. 5 Hotels"
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = colors.border}
              />
              <button
                onClick={() => handleRemove(index)}
                disabled={items.length === 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: colors.error, backgroundColor: `${colors.error}10` }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs" style={{ color: colors.textLight }}>
        Tip: Use a short symbol prefix like <strong>+</strong> or emoji to make items stand out in the marquee.
      </p>

      {/* Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
        <p className="text-xs" style={{ color: colors.textLight }}>Changes are not saved automatically.</p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.success }}
        >
          <Save size={15} /> Save Marquee
        </button>
      </div>
    </div>
  );
}
