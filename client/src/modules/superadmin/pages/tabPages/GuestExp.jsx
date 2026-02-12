import React, { useState, useEffect, useCallback } from 'react';
import { colors } from "@/lib/colors/colors";
import { ChevronLeft, ChevronRight, Loader2, Trash2, Video, ImageIcon } from 'lucide-react';
import { 
  getGuestExperienceSection,
  deleteGuestExperience
} from '@/Api/Api';
import { toast } from 'react-hot-toast';

function GuestExp() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchGuestExperience = useCallback(async () => {
    try {
      setFetching(true);
      const response = await getGuestExperienceSection();
      
      /** * REFACTORED: Handling direct array response.
       * The API returns [ {...}, {...} ], so we use response.data directly.
       */
      const items = Array.isArray(response.data) ? response.data : [];
      
      setExperiences(items);
    } catch (error) {
      console.error("Error fetching guest experience:", error);
      toast.error("Failed to load guest experience data");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchGuestExperience();
  }, [fetchGuestExperience]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    
    try {
      setLoading(true);
      await deleteGuestExperience(id);
      toast.success("Experience deleted successfully");
      fetchGuestExperience(); // Refresh the list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete experience");
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(experiences.length / itemsPerPage);
  const currentExperiences = experiences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Experiences Table */}
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: colors.contentBg }}>
        <div className="p-5 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Guest Experiences List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: colors.mainBg }}>
                <th className="p-4 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Media</th>
                <th className="p-4 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Details</th>
                <th className="p-4 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Author</th>
                <th className="p-4 text-xs font-semibold uppercase text-right" style={{ color: colors.textSecondary }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: colors.border }}>
              {fetching ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2" style={{ color: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Fetching experiences...</span>
                  </td>
                </tr>
              ) : currentExperiences.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-sm" style={{ color: colors.textSecondary }}>
                    No experiences found.
                  </td>
                </tr>
              ) : (
                currentExperiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden border flex items-center justify-center" style={{ borderColor: colors.border }}>
                        {exp.videoUrl ? (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                            <Video size={16} className="text-white opacity-70" />
                            <span className="absolute bottom-0.5 right-1 text-[8px] text-white font-bold">MP4</span>
                          </div>
                        ) : exp.imageUrl ? (
                          <img src={exp.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>{exp.title}</div>
                      <div className="text-xs line-clamp-1 max-w-[300px]" style={{ color: colors.textSecondary }}>
                        {exp.description}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>{exp.author}</div>
                      <div className="text-[10px]" style={{ color: colors.textSecondary }}>{exp.authorEmail || 'No Email'}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(exp.id)}
                        disabled={loading}
                        className="p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50" 
                        style={{ color: '#ef4444' }} 
                        title="Delete Experience"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: colors.border, backgroundColor: colors.mainBg }}>
          <span className="text-xs" style={{ color: colors.textSecondary }}>
            Showing {currentExperiences.length} of {experiences.length} items
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border disabled:opacity-30"
              style={{ borderColor: colors.border, color: colors.textPrimary }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded border disabled:opacity-30"
              style={{ borderColor: colors.border, color: colors.textPrimary }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestExp;