import { useState, useEffect, useRef } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  X,
  Upload,
  ExternalLink,
} from "lucide-react";
import {
  addGroupBooking,
  updateGroupBooking,
  getGroupBookings,
} from "@/Api/Api";
import { toast } from "react-hot-toast";

const EMPTY_FORM = { title: "", description: "", ctaText: "", ctaLink: "" };

function GroupBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getGroupBookings();
      setBookings(res?.data || []);
    } catch {
      toast.error("Failed to load group bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      ctaText: item.ctaText || "",
      ctaLink: item.ctaLink || "",
    });
    setFile(null);
    setPreview(item.media?.[0]?.url || null);
    setShowModal(true);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");

    const fd = new FormData();
    if (file) fd.append("files", file);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("ctaText", form.ctaText);
    fd.append("ctaLink", form.ctaLink);

    try {
      setSubmitting(true);
      if (editItem) {
        await updateGroupBooking(editItem.id, fd);
        toast.success("Updated successfully");
      } else {
        await addGroupBooking(fd);
        toast.success("Created successfully");
      }
      setShowModal(false);
      fetchAll();
    } catch {
      toast.error("Failed to save group booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      // await deleteGroupBooking(id);
      // toast.success("Deleted");
      fetchAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div
      className="rounded-lg p-4 sm:p-5 shadow-sm"
      style={{ backgroundColor: colors.contentBg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Group Bookings</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-gray-400 w-7 h-7" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No group bookings yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((item) => {
            const img = item.media?.[0]?.url;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
              >
                {img ? (
                  <img
                    src={img}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                    No Image
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.ctaLink && (
                    <a
                      href={item.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:underline"
                    >
                      {item.ctaText || "Visit Link"} <ExternalLink size={10} />
                    </a>
                  )}
                  <div className="mt-auto pt-3 flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    {/* <button
                      // onClick={() => handleDelete(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={12} /> Delete
                    </button> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800">
                {editItem ? "Edit Group Booking" : "New Group Booking"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                {/* File Upload */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Image
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition overflow-hidden"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-300 mb-1" />
                        <span className="text-xs text-gray-400">
                          Click to upload image
                        </span>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. ABC"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="e.g. water bottle"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

                {/* CTA Text */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    CTA Text
                  </label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) =>
                      setForm({ ...form, ctaText: e.target.value })
                    }
                    placeholder="e.g. Book Now"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CTA Link */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    CTA Link
                  </label>
                  <input
                    type="url"
                    value={form.ctaLink}
                    onChange={(e) =>
                      setForm({ ...form, ctaLink: e.target.value })
                    }
                    placeholder="https://www.example.com"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {editItem ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupBookings;
