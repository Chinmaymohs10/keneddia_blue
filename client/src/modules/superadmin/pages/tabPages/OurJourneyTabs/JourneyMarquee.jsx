import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, Save, GripVertical, Eye, Loader2 } from 'lucide-react';
import { getAllMarquees, saveMarquee, updateMarquee, deleteMarquee, toggleMarqueeStatus } from "@/Api/OurJourneyApi";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

export default function JourneyMarquee() {
  const [items, setItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMarquees();
  }, []);

  const fetchMarquees = async () => {
    setLoading(true);
    try {
      const response = await getAllMarquees();
      const data = response.data?.data || response.data || [];
      const sorted = Array.isArray(data) ? [...data].sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0)) : [];
      setItems(sorted);
    } catch (error) {
      showError("Failed to fetch marquees");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => setItems([...items, { text: "", sequenceNo: items.length + 1, active: true, isNew: true }]);
  
  const handleRemove = async (index) => {
    const item = items[index];
    if (!item.isNew && item.id) {
      try {
        await deleteMarquee(item.id);
        showSuccess("Item deleted");
      } catch (error) {
        showError("Failed to delete item");
        return;
      }
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleToggleActive = async (index) => {
    const item = items[index];
    if (!item || item.isNew) return;
    const next = !item.active;
    setItems(prev => prev.map((it, i) => i === index ? { ...it, active: next } : it));
    try {
      await toggleMarqueeStatus(item.id, next);
    } catch {
      setItems(prev => prev.map((it, i) => i === index ? { ...it, active: !next } : it));
      showError("Failed to update status");
    }
  };

  const handleChange = (index, val) => {
    const newItems = [...items];
    newItems[index].text = val;
    setItems(newItems);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const validItems = items.filter(item => item.text.trim() !== "");
      for (let i = 0; i < validItems.length; i++) {
        const payload = {
          text: validItems[i].text,
          sequenceNo: i + 1,
          active: validItems[i].active !== undefined ? validItems[i].active : true
        };
        
        if (validItems[i].id && !validItems[i].isNew) {
          payload.id = validItems[i].id;
          await updateMarquee(payload);
        } else {
          await saveMarquee(payload);
        }
      }
      showSuccess("Marquee saved successfully");
      fetchMarquees();
    } catch (error) {
      showError("Failed to save marquee");
    } finally {
      setSaving(false);
    }
  };


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
              {[...items, ...items].filter(item => item && item.text).map((item, i) => (
                <span key={i}>
                  <span style={{ color: colors.primary }}>{item.text}</span>
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
                value={item.text || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                onFocus={e => e.target.style.borderColor = colors.primary}
                onBlur={e => e.target.style.borderColor = colors.border}
              />
              <button
                onClick={() => handleToggleActive(index)}
                disabled={item.isNew}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all disabled:opacity-40 shrink-0"
                style={{
                  backgroundColor: item.active !== false ? '#dcfce7' : '#f3f4f6',
                  color: item.active !== false ? '#16a34a' : colors.textSecondary,
                  border: `1px solid ${item.active !== false ? '#86efac' : colors.border}`,
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.active !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                {item.active !== false ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => handleRemove(index)}
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
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: colors.success }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Marquee
        </button>
      </div>
    </div>
  );
}
