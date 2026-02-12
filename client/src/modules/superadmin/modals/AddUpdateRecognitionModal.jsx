import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { X, Loader2 } from 'lucide-react';
import { addRecognition, updateRecognition } from '@/Api/Api';
import { toast } from 'react-hot-toast';

function AddUpdateRecognitionModal({ isOpen, onClose, editData = null, aboutUsId }) {
  const [formData, setFormData] = useState({ value: '', title: '', subTitle: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        value: editData.value || '',
        title: editData.title || '',
        subTitle: editData.subTitle || ''
      });
    } else if (!isOpen) {
      setFormData({ value: '', title: '', subTitle: '' });
    }
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.value.trim() || !formData.title.trim()) return toast.error('Required fields missing');
    try {
      setLoading(true);
      const payload = {
        value: formData.value.trim(),
        title: formData.title.trim(),
        subTitle: formData.subTitle.trim()
      };

      if (editData?.id) {
        await updateRecognition(editData.id, payload);
        toast.success('Updated successfully!');
      } else {
        await addRecognition(aboutUsId, payload);
        toast.success('Created successfully!');
      }
      onClose(true);
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={() => onClose(false)}>
      <div className="rounded-lg p-5 shadow-xl bg-white w-[60%] max-w-[800px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <h3 className="text-base font-bold">{editData ? 'Edit Recognition' : 'Add Recognition'}</h3>
          <button onClick={() => onClose(false)}><X size={18} /></button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['value', 'title', 'subTitle'].map((field) => (
            <div key={field}>
              <label className="block text-[10px] font-semibold uppercase mb-1 text-gray-500">{field} {field !== 'subTitle' && '*'}</label>
              <input type="text" value={formData[field]} onChange={(e) => setFormData({...formData, [field]: e.target.value})} className="w-full px-3 py-2 rounded-md border text-sm outline-none bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4 pt-3 border-t">
          <button onClick={() => onClose(false)} className="flex-1 py-2 border rounded-md text-sm font-bold">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-primary text-white py-2 rounded-md text-sm font-bold flex justify-center items-center gap-2">
            {loading && <Loader2 className="animate-spin" size={16} />} {editData ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUpdateRecognitionModal;