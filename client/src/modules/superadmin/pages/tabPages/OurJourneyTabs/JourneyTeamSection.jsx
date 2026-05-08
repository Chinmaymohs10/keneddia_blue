import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, Save, Upload, ImageIcon, UserCircle2, Loader2 } from 'lucide-react';
import { getAllTeamMembers, saveTeamMember, updateTeamMember, deleteTeamMember } from "@/Api/OurJourneyApi";
import { uploadMedia } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";

function MemberCard({ member, index, onRemove, onChange, canRemove }) {
  const [focused, setFocused] = useState(null);

  const inputStyle = (field) => ({
    borderColor: focused === field ? colors.primary : colors.border,
    boxShadow: focused === field ? `0 0 0 3px ${colors.primary}18` : 'none',
    color: colors.textPrimary,
  });

  return (
    <div
      className="rounded-xl border shadow-sm overflow-hidden flex flex-col"
      style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: `${colors.primary}08`, borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: colors.primary }}
          >
            {index + 1}
          </span>
          <span className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
            {member.name || `Member ${index + 1}`}
          </span>
          {member.role && (
            <span className="text-xs px-2 py-0.5 rounded-full hidden sm:inline-block" style={{ backgroundColor: colors.border, color: colors.textSecondary }}>
              {member.role}
            </span>
          )}
        </div>
        <button
          onClick={onRemove}
          disabled={!canRemove}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
          style={{ color: colors.error }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 flex gap-4 flex-1">
        {/* Image Upload */}
        <div className="shrink-0">
          <div
            className="relative w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-gray-50"
            style={{ borderColor: member.previewUrl ? colors.primary : colors.border }}
            onClick={() => document.getElementById(`team-img-${member.id}`).click()}
          >
            {member.previewUrl ? (
              <>
                <img src={member.previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={16} className="text-white" />
                </div>
              </>
            ) : (
              <div className="text-center p-2">
                <UserCircle2 size={28} style={{ color: colors.textLight }} className="mx-auto mb-1" />
                <span className="text-[10px]" style={{ color: colors.textLight }}>Photo</span>
              </div>
            )}
            <input
              id={`team-img-${member.id}`}
              type="file"
              className="hidden"
              accept="image/*"
              onClick={(e) => e.stopPropagation()}
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  onChange('previewUrl', URL.createObjectURL(file));
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    const { uploadMedia } = await import('@/Api/Api');
                    const res = await uploadMedia(fd);
                    const newMediaId = typeof res.data === "number" ? res.data : (res.data?.id || res.data?.data?.id);
                    onChange('image', file);
                    onChange('mediaId', newMediaId);
                  } catch (err) {
                    console.error(err);
                  }
                  e.target.value = null;
                }
              }}
            />
          </div>
          {member.previewUrl && (
            <button
              className="mt-1 text-[10px] w-full text-center"
              style={{ color: colors.error }}
              onClick={() => { onChange('image', null); onChange('previewUrl', ''); }}
            >
              Remove
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors"
                style={inputStyle('name')}
                placeholder="e.g. Arjun Mehta"
                value={member.name}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                onChange={e => onChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Role / Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors"
                style={inputStyle('role')}
                placeholder="e.g. Co-Founder & CEO"
                value={member.role}
                onFocus={() => setFocused('role')}
                onBlur={() => setFocused(null)}
                onChange={e => onChange('role', e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-semibold" style={{ color: colors.textSecondary }}>Quote</label>
              <span className="text-[10px]" style={{ color: member.quote.length > 140 ? colors.warning : colors.textLight }}>
                {member.quote.length}/160
              </span>
            </div>
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors resize-none"
              style={inputStyle('quote')}
              placeholder="A short personal quote or philosophy..."
              value={member.quote}
              rows={2}
              maxLength={160}
              onFocus={() => setFocused('quote')}
              onBlur={() => setFocused(null)}
              onChange={e => onChange('quote', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JourneyTeamSection() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await getAllTeamMembers();
      const data = response.data?.data || response.data || [];
      const mapped = Array.isArray(data) ? data.map((d, index) => ({
        id: d.id,
        name: d.name || '',
        role: d.roleTitle || d.role || '',
        quote: d.quote || '',
        mediaId: d.photo?.mediaId || d.mediaId || null,
        previewUrl: d.photo?.url || d.mediaDTO?.url || d.mediaUrl || d.media?.url || '',
        sequence: d.sequence || index + 1,
        image: null,
        isNew: false
      })) : [];
      setMembers(mapped);
    } catch (error) {
      showError("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => setMembers([{ id: Date.now(), name: '', role: '', quote: '', image: null, previewUrl: '', isNew: true }, ...members]);
  
  const handleRemove = async (id) => {
    const member = members.find(m => m.id === id);
    if (member && !member.isNew && member.id) {
      try {
        await deleteTeamMember(member.id);
        showSuccess("Member deleted");
      } catch (error) {
        showError("Failed to delete member");
        return;
      }
    }
    setMembers(members.filter(m => m.id !== id));
  };
  
  const handleChange = (index, field, value) => {
    const newM = [...members];
    newM[index][field] = value;
    setMembers(newM);
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        let mediaId = member.mediaId;
        
        if (member.image) {
          const fd = new FormData();
          fd.append("file", member.image);
          const res = await uploadMedia(fd);
          mediaId = typeof res.data === "number" ? res.data : (res.data?.id || res.data?.data?.id);
        }
        
        const payload = {
          name: member.name,
          roleTitle: member.role,
          quote: member.quote,
          photoMediaId: mediaId,
          sequence: member.sequence,
          active: true
        };

        if (member.id && !member.isNew) {
           await updateTeamMember(member.id, payload);
        } else {
           await saveTeamMember(payload);
        }
      }
      showSuccess("Team members saved successfully");
      fetchMembers();
    } catch (error) {
      showError("Failed to save team members");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: colors.textPrimary }}>Team Members</h3>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{members.length} member{members.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {members.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            index={index}
            canRemove={true}
            onRemove={() => handleRemove(member.id)}
            onChange={(field, value) => handleChange(index, field, value)}
          />
        ))}
      </div>

      {/* Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
        <p className="text-xs" style={{ color: colors.textLight }}>Changes are not saved automatically.</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: colors.success }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Team
        </button>
      </div>
    </div>
  );
}
