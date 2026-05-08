import React, { useState } from 'react';
import { colors } from "@/lib/colors/colors";
import { Save, Upload, ImageIcon, Quote } from 'lucide-react';

function Field({ label, type = 'text', value, onChange, placeholder, maxLength, rows }) {
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
          className="w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none"
          style={{
            borderColor: focused ? colors.primary : colors.border,
            boxShadow: focused ? `0 0 0 3px ${colors.primary}18` : 'none',
            color: colors.textPrimary,
          }}
          placeholder={placeholder}
          value={value}
          rows={rows || 3}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
        />
      ) : (
        <input
          type="text"
          className="w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none"
          style={{
            borderColor: focused ? colors.primary : colors.border,
            boxShadow: focused ? `0 0 0 3px ${colors.primary}18` : 'none',
            color: colors.textPrimary,
          }}
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

export default function JourneyPullQuote() {
  const [data, setData] = useState({
    roleTag: "Founder's Voice",
    quote: "We don't build hotels. We build the places people come back to.",
    description: "From a napkin sketch on the shores of Pondicherry to five properties across India, every decision has been guided by one belief — that hospitality, at its finest, is an act of love.",
    attribution: "Arjun Mehta · Co-Founder, 2012",
    image: null,
    previewUrl: ""
  });

  const set = (field) => (e) => setData({ ...data, [field]: e.target.value });
  const handleSave = () => console.log("Save pull quote", data);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>Pull Quote Configuration</h3>
        <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Featured founder quote displayed prominently on the journey page</p>
      </div>

      {/* Main Form */}
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
      >
        <div
          className="px-5 py-3"
          style={{ backgroundColor: `${colors.primary}08`, borderBottom: `1px solid ${colors.border}` }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>Quote Details</span>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Form Fields */}
          <div className="lg:col-span-3 space-y-4">
            <Field label="Role Tag" value={data.roleTag} onChange={set('roleTag')} placeholder="e.g. Founder's Voice" maxLength={50} />
            <Field
              label="Quote"
              type="textarea"
              value={data.quote}
              onChange={set('quote')}
              placeholder="The featured quote text..."
              maxLength={200}
              rows={3}
            />
            <Field
              label="Description"
              type="textarea"
              value={data.description}
              onChange={set('description')}
              placeholder="Supporting context or story behind the quote..."
              maxLength={500}
              rows={5}
            />
            <Field label="Attribution" value={data.attribution} onChange={set('attribution')} placeholder="e.g. Arjun Mehta · Co-Founder, 2012" maxLength={80} />
          </div>

          {/* Right: Image */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>Portrait Image</label>
            <div
              className="relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-gray-50 overflow-hidden"
              style={{ borderColor: data.previewUrl ? colors.primary : colors.border, minHeight: '280px' }}
              onClick={() => document.getElementById('pullquote-img').click()}
            >
              {data.previewUrl ? (
                <>
                  <img src={data.previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white mb-1" />
                    <span className="text-white text-xs font-medium">Replace Image</span>
                  </div>
                </>
              ) : (
                <div className="py-10 space-y-2">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: `${colors.primary}18` }}>
                    <ImageIcon size={24} style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>Upload Portrait</p>
                    <p className="text-xs mt-1" style={{ color: colors.textLight }}>Recommended: square crop, min 400×400px</p>
                  </div>
                </div>
              )}
              <input
                id="pullquote-img"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    setData({ ...data, image: file, previewUrl: URL.createObjectURL(file) });
                  }
                }}
              />
            </div>
            {data.previewUrl && (
              <button
                className="mt-2 text-xs w-full text-center"
                style={{ color: colors.error }}
                onClick={() => setData({ ...data, image: null, previewUrl: '' })}
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      {(data.quote || data.roleTag) && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: '#1a1a1a', borderColor: colors.border }}
        >
          <div className="px-5 py-3" style={{ borderBottom: `1px solid #333` }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#666' }}>Preview</span>
          </div>
          <div className="p-6 flex gap-5">
            {data.previewUrl && (
              <img src={data.previewUrl} alt="" className="w-16 h-16 rounded-full object-cover shrink-0 border-2" style={{ borderColor: colors.primary }} />
            )}
            <div>
              {data.roleTag && (
                <span className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: colors.primary }}>
                  {data.roleTag}
                </span>
              )}
              {data.quote && (
                <p className="text-lg font-medium italic leading-relaxed" style={{ color: '#ffffff' }}>
                  <Quote size={16} className="inline mr-1 mb-1" style={{ color: colors.primary }} />
                  {data.quote}
                </p>
              )}
              {data.attribution && (
                <p className="text-sm mt-2" style={{ color: '#888' }}>— {data.attribution}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
        <p className="text-xs" style={{ color: colors.textLight }}>Changes are not saved automatically.</p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.success }}
        >
          <Save size={15} /> Save Pull Quote
        </button>
      </div>
    </div>
  );
}
