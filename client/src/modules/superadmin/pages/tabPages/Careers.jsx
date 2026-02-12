import React, { useState, useEffect } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Edit,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Briefcase,
  Clock,
  GraduationCap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import CreateCareerModal from "../../modals/CreateCareerModal";

// Mock Data for UI Testing
const MOCK_JOBS = [
  {
    id: 1,
    title: "General Manager",
    slug: "general-manager-mumbai",
    location: "Mumbai, India",
    city: "Mumbai",
    department: "Management",
    employmentType: "FULL_TIME",
    experienceLevel: "10+ years",
    description: "Responsible for overall hotel operations...",
    isActive: true
  },
  {
    id: 2,
    title: "Executive Chef",
    slug: "executive-chef-pune",
    location: "Pune, India",
    city: "Pune",
    department: "Kitchen",
    employmentType: "FULL_TIME",
    experienceLevel: "8+ years",
    description: "Leading culinary excellence across our properties...",
    isActive: true
  }
];

function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      // Simulating a minor delay for realistic loading feel
      setTimeout(() => {
        setJobs(MOCK_JOBS);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Failed to load careers:", error);
      toast.error("Failed to load job listings");
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = jobs.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const getEmploymentBadge = (type) => {
    const labels = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
    };
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase" style={{ color: colors.primary }}>
        <Clock size={10} /> {labels[type] || type.replace("_", " ")}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="rounded-lg p-4 sm:p-5 shadow-sm mb-3" style={{ backgroundColor: colors.contentBg }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold m-0" style={{ color: colors.textPrimary }}>
              Career Management
            </h2>
            <p className="text-xs mt-1 mb-0" style={{ color: colors.textSecondary }}>
              Post and manage job openings across all hotel departments
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors"
            style={{ backgroundColor: colors.primary, color: "#ffffff" }}
          >
            <Plus size={16} /> Post Job
          </button>
        </div>
      </div>

      {/* Table/Content View */}
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: colors.contentBg }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin" style={{ color: colors.primary }} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Briefcase size={48} style={{ color: colors.textSecondary }} className="mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>No job openings</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Start by adding a new position</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: colors.mainBg, borderColor: colors.border }}>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Job Details</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Department</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Location</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Exp. Level</th>
                    <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: colors.border }}>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <h3 className="text-sm font-bold mb-0.5" style={{ color: colors.textPrimary }}>{job.title}</h3>
                          {getEmploymentBadge(job.employmentType)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: colors.textSecondary }}>
                        {job.department}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs" style={{ color: colors.textPrimary }}>
                          <MapPin size={12} style={{ color: colors.textSecondary }} />
                          {job.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs" style={{ color: colors.textPrimary }}>
                          <GraduationCap size={14} style={{ color: colors.textSecondary }} />
                          {job.experienceLevel}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-2 rounded border transition-colors hover:bg-gray-100"
                          style={{ borderColor: colors.border, color: colors.textPrimary }}
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden p-4 space-y-3">
              {currentJobs.map((job) => (
                <div key={job.id} className="rounded-lg border p-4" style={{ backgroundColor: colors.mainBg, borderColor: colors.border }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>{job.title}</h3>
                      <p className="text-[10px] uppercase font-bold" style={{ color: colors.primary }}>{job.department}</p>
                    </div>
                    {getEmploymentBadge(job.employmentType)}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-xs" style={{ color: colors.textSecondary }}>
                      <MapPin size={12} /> {job.city}
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: colors.textSecondary }}>
                      <GraduationCap size={12} /> {job.experienceLevel}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(job)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded border text-xs font-medium transition-colors"
                    style={{ borderColor: colors.border, color: colors.textPrimary }}
                  >
                    <Edit size={14} /> Edit Listing
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: colors.border }}>
                <p className="text-xs text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, jobs.length)} of {jobs.length} roles
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-1.5 rounded-full border disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold">{currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-1.5 rounded-full border disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <CreateCareerModal
          isOpen={showModal}
          onClose={(shouldRefresh) => { 
            setShowModal(false); 
            if(shouldRefresh) fetchCareers(); 
          }}
          editingJob={editingJob}
        />
      )}
    </div>
  );
}

export default Careers;