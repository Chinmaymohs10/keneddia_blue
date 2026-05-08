import React, { useState, useRef, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, Save, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { getAllStoryHeroCards, saveStoryHeroCard, updateStoryHeroCard, deleteStoryHeroCard } from "@/Api/OurJourneyApi";
import { uploadMedia } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

const inputClass = "w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none";
const inputStyle = (focused) => ({
  borderColor: focused ? colors.primary : colors.border,
  boxShadow: focused ? `0 0 0 3px ${colors.primary}18` : 'none',
  color: colors.textPrimary,
});

function CardField({ label, type = 'text', value, onChange, placeholder, maxLength, rows }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="block text-xs font-semibold" style={{ color: colors.textSecondary }}>{label}</label>
        {maxLength && (
          <span className="text-[10px]" style={{ color: value.length > maxLength * 0.85 ? colors.warning : colors.textLight }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {type === 'textarea' ? (
        <textarea
          className={inputClass}
          style={inputStyle(focused)}
          placeholder={placeholder}
          value={value}
          rows={rows || 4}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
        />
      ) : (
        <input
          type="text"
          className={inputClass}
          style={inputStyle(focused)}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export default function JourneyHeroSection() {
  const [cards, setCards] = useState([]);
  const topRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await getAllStoryHeroCards();
      const data = response.data?.data || response.data || [];
      const mapped = Array.isArray(data) ? data.map(d => ({
        id: d.id,
        title: d.title || '',
        subtitle: d.subtitle || '',
        text: d.description || '',
        mediaId: d.mediaId || null,
        previewUrl: d.mediaDTO?.url || d.mediaUrl || d.media?.url || '',
        image: null,
        isNew: false
      })) : [];
      setCards(mapped);
    } catch (error) {
      showError("Failed to fetch hero cards");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCards([{ id: Date.now(), title: '', subtitle: '', text: '', image: null, previewUrl: '', isNew: true }, ...cards]);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleRemove = async (id) => {
    const card = cards.find(c => c.id === id);
    if (card && !card.isNew && card.id) {
      try {
        await deleteStoryHeroCard(card.id);
        showSuccess("Card deleted");
      } catch (error) {
        showError("Failed to delete card");
        return;
      }
    }
    setCards(cards.filter(c => c.id !== id));
  };

  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        let mediaId = card.mediaId;
        
        if (card.image) {
          const fd = new FormData();
          fd.append("file", card.image);
          const res = await uploadMedia(fd);
          mediaId = typeof res.data === "number" ? res.data : (res.data?.id || res.data?.data?.id);
        }
        
        const payload = {
          title: card.title,
          subtitle: card.subtitle,
          description: card.text,
          mediaId: mediaId,
          active: true
        };

        if (card.id && !card.isNew) {
           payload.id = card.id;
           await updateStoryHeroCard(payload);
        } else {
           await saveStoryHeroCard(payload);
        }
      }
      showSuccess("Cards saved successfully");
      fetchCards();
    } catch (error) {
      showError("Failed to save cards");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>Story Hero Cards</h3>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{cards.length} card{cards.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={15} /> Add Card
        </button>
      </div>

      {/* Cards */}
      <div ref={topRef} />
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="rounded-xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
        >
          {/* Card Header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ backgroundColor: `${colors.primary}08`, borderBottom: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {index + 1}
              </span>
              <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                {card.title || `Card ${index + 1}`}
              </span>
              {card.subtitle && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.border, color: colors.textSecondary }}>
                  {card.subtitle}
                </span>
              )}
            </div>
            <button
              onClick={() => handleRemove(card.id)}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
              style={{ color: colors.error }}
              title="Remove card"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Text Fields */}
            <div className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CardField
                  label="Title"
                  value={card.title}
                  placeholder="e.g. The Idea"
                  maxLength={60}
                  onChange={e => updateCard(index, 'title', e.target.value)}
                />
                <CardField
                  label="Subtitle / Year · Location"
                  value={card.subtitle}
                  placeholder="e.g. 2012 · Pondicherry"
                  maxLength={80}
                  onChange={e => updateCard(index, 'subtitle', e.target.value)}
                />
              </div>
              <CardField
                label="Description Text"
                type="textarea"
                value={card.text}
                placeholder="Tell the story of this milestone..."
                maxLength={400}
                rows={5}
                onChange={e => updateCard(index, 'text', e.target.value)}
              />
            </div>

            {/* Right: Image Upload */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>Cover Image</label>
              <div
                className="relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-gray-50 overflow-hidden"
                style={{ borderColor: card.previewUrl ? colors.primary : colors.border, minHeight: '200px' }}
                onClick={() => document.getElementById(`hero-img-${card.id}`).click()}
              >
                {card.previewUrl ? (
                  <>
                    <img src={card.previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload size={20} className="text-white mb-1" />
                      <span className="text-white text-xs font-medium">Replace Image</span>
                    </div>
                  </>
                ) : (
                  <div className="py-8 space-y-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: `${colors.primary}18` }}>
                      <ImageIcon size={22} style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>Click to upload</p>
                      <p className="text-xs mt-1" style={{ color: colors.textLight }}>PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  id={`hero-img-${card.id}`}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      updateCard(index, 'image', file);
                      updateCard(index, 'previewUrl', URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
              {card.previewUrl && (
                <button
                  className="mt-2 text-xs w-full text-center transition-colors"
                  style={{ color: colors.error }}
                  onClick={(e) => { e.stopPropagation(); updateCard(index, 'image', null); updateCard(index, 'previewUrl', ''); }}
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Save Bar */}
      <div
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: colors.border }}
      >
        <p className="text-xs" style={{ color: colors.textLight }}>
          Changes are not saved automatically.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: colors.success }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
        </button>
      </div>
    </div>
  );
}
