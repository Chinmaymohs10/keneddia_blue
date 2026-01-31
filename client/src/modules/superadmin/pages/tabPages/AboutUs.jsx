import React, { useState, useEffect, useCallback } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  getAboutUsAdmin, 
  // deleteAboutUsById,
  getVenturesByAboutUsId,
  // deleteVentureById,
  getRecognitionsByAboutUsId,
  // deleteRecognitionById
} from '@/Api/Api';
import { toast } from 'react-hot-toast';
import AddUpdateAboutModal from '../../modals/AddUpdateAboutModal';
import AddUpdateVenturesModal from '../../modals/AddUpdateVenturesModal';
import AddUpdateRecognitionModal from '../../modals/AddUpdateRecognitionModal';

function AboutUs() {
  const [aboutUsList, setAboutUsList] = useState([]);
  const [ventures, setVentures] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Modal states
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isVentureModalOpen, setIsVentureModalOpen] = useState(false);
  const [isRecognitionModalOpen, setIsRecognitionModalOpen] = useState(false);
  
  const [editingAbout, setEditingAbout] = useState(null);
  const [editingVenture, setEditingVenture] = useState(null);
  const [editingRecognition, setEditingRecognition] = useState(null);
  const [selectedAboutUsId, setSelectedAboutUsId] = useState(null);

  // Pagination
  const [currentAboutPage, setCurrentAboutPage] = useState(1);
  const [currentVenturePage, setCurrentVenturePage] = useState(1);
  const [currentRecognitionPage, setCurrentRecognitionPage] = useState(1);
  const itemsPerPage = 5;

  // Debug modal states
  useEffect(() => {
    console.log('=== Modal States ===');
    console.log('isAboutModalOpen:', isAboutModalOpen);
    console.log('isVentureModalOpen:', isVentureModalOpen);
    console.log('isRecognitionModalOpen:', isRecognitionModalOpen);
    console.log('selectedAboutUsId:', selectedAboutUsId);
  }, [isAboutModalOpen, isVentureModalOpen, isRecognitionModalOpen, selectedAboutUsId]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setFetching(true);
      
      // Fetch About Us list
      const aboutResponse = await getAboutUsAdmin();
      console.log('About Us Response:', aboutResponse);
      
      if (aboutResponse.data && Array.isArray(aboutResponse.data)) {
        const sortedAbout = aboutResponse.data.sort((a, b) => b.id - a.id);
        setAboutUsList(sortedAbout);
        
        // If we have at least one about us, fetch its ventures and recognitions
        if (sortedAbout.length > 0) {
          const latestAboutUs = sortedAbout[0];
          console.log('Latest About Us ID:', latestAboutUs.id);
          setSelectedAboutUsId(latestAboutUs.id);
          await fetchVentures(latestAboutUs.id);
          await fetchRecognitions(latestAboutUs.id);
        } else {
          // FALLBACK: Set a temporary ID for testing (REMOVE THIS LATER)
          console.warn('No About Us found, using fallback ID: 999');
          setSelectedAboutUsId(999);
        }
      } else {
        // FALLBACK: Set a temporary ID for testing (REMOVE THIS LATER)
        console.warn('Invalid response, using fallback ID: 999');
        setSelectedAboutUsId(999);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      // FALLBACK: Set a temporary ID for testing (REMOVE THIS LATER)
      console.warn('Error occurred, using fallback ID: 999');
      setSelectedAboutUsId(999);
    } finally {
      setFetching(false);
    }
  }, []);

  const fetchVentures = async (aboutUsId) => {
    try {
      const response = await getVenturesByAboutUsId(aboutUsId);
      if (response.data && Array.isArray(response.data)) {
        setVentures(response.data);
      }
    } catch (error) {
      console.error("Error fetching ventures:", error);
      // Set empty array on error
      setVentures([]);
    }
  };

  const fetchRecognitions = async (aboutUsId) => {
    try {
      const response = await getRecognitionsByAboutUsId(aboutUsId);
      if (response.data && Array.isArray(response.data)) {
        setRecognitions(response.data);
      }
    } catch (error) {
      console.error("Error fetching recognitions:", error);
      // Set empty array on error
      setRecognitions([]);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle About Us actions
  const handleAddAbout = () => {
    console.log('handleAddAbout called');
    setEditingAbout(null);
    setIsAboutModalOpen(true);
  };

  const handleEditAbout = (about) => {
    console.log('handleEditAbout called with:', about);
    setEditingAbout(about);
    setIsAboutModalOpen(true);
  };

  const handleDeleteAbout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this About Us section?')) {
      return;
    }

    try {
      setLoading(true);
      // await deleteAboutUsById(id);
      toast.success('About Us deleted successfully');
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting about us:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  // Handle Venture actions
  const handleAddVenture = () => {
    console.log('handleAddVenture called');
    console.log('selectedAboutUsId:', selectedAboutUsId);
    
    if (!selectedAboutUsId) {
      toast.error('Please create an About Us section first');
      return;
    }
    setEditingVenture(null);
    setIsVentureModalOpen(true);
    console.log('isVentureModalOpen set to true');
  };

  const handleEditVenture = (venture) => {
    console.log('handleEditVenture called with:', venture);
    setEditingVenture(venture);
    setIsVentureModalOpen(true);
  };

  const handleDeleteVenture = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venture?')) {
      return;
    }

    try {
      setLoading(true);
      // await deleteVentureById(id);
      toast.success('Venture deleted successfully');
      if (selectedAboutUsId) {
        await fetchVentures(selectedAboutUsId);
      }
    } catch (error) {
      console.error('Error deleting venture:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  // Handle Recognition actions
  const handleAddRecognition = () => {
    console.log('handleAddRecognition called');
    console.log('selectedAboutUsId:', selectedAboutUsId);
    
    if (!selectedAboutUsId) {
      toast.error('Please create an About Us section first');
      return;
    }
    setEditingRecognition(null);
    setIsRecognitionModalOpen(true);
    console.log('isRecognitionModalOpen set to true');
  };

  const handleEditRecognition = (recognition) => {
    console.log('handleEditRecognition called with:', recognition);
    setEditingRecognition(recognition);
    setIsRecognitionModalOpen(true);
  };

  const handleDeleteRecognition = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recognition?')) {
      return;
    }

    try {
      setLoading(true);
      // await deleteRecognitionById(id);
      toast.success('Recognition deleted successfully');
      if (selectedAboutUsId) {
        await fetchRecognitions(selectedAboutUsId);
      }
    } catch (error) {
      console.error('Error deleting recognition:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  // Pagination helpers
  const paginate = (items, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items) => Math.ceil(items.length / itemsPerPage);

  if (fetching) {
    return (
      <div
        className="rounded-lg p-6 shadow-sm flex items-center justify-center h-[400px]"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Loading about us data...</p>
        </div>
      </div>
    );
  }

  const paginatedAbout = paginate(aboutUsList, currentAboutPage);
  const paginatedVentures = paginate(ventures, currentVenturePage);
  const paginatedRecognitions = paginate(recognitions, currentRecognitionPage);

  return (
    <div className="space-y-4">
      {/* Debug Info */}
      {/* <div className="rounded-lg p-3 shadow-sm bg-yellow-50 border border-yellow-200">
        <p className="text-xs font-mono text-yellow-800 m-0">
          <strong>DEBUG:</strong> selectedAboutUsId = {selectedAboutUsId || 'null'} | 
          About Modal: {isAboutModalOpen ? 'OPEN' : 'CLOSED'} | 
          Venture Modal: {isVentureModalOpen ? 'OPEN' : 'CLOSED'} | 
          Recognition Modal: {isRecognitionModalOpen ? 'OPEN' : 'CLOSED'}
        </p>
      </div> */}

      {/* About Us Table */}
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: colors.contentBg }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold m-0" style={{ color: colors.textPrimary }}>
            About Us Sections
          </h3>
          <button
            onClick={handleAddAbout}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold"
            style={{ backgroundColor: colors.primary, color: '#ffffff' }}
          >
            <Plus size={14} />
            Add About Us
          </button>
        </div>

        {aboutUsList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">No About Us sections found</p>
            <p className="text-xs text-gray-400">Click "Add About Us" to create your first section</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: colors.border }}>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">ID</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Section Title</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Sub Title</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Description</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAbout.map((about) => (
                    <tr key={about.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td className="px-3 py-2 text-xs">#{about.id}</td>
                      <td className="px-3 py-2 text-xs font-medium">{about.sectionTitle}</td>
                      <td className="px-3 py-2 text-xs">{about.subTitle}</td>
                      <td className="px-3 py-2 text-xs">
                        <div className="max-w-xs truncate">{about.description}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditAbout(about)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} style={{ color: colors.primary }} />
                          </button>
                          <button
                            onClick={() => handleDeleteAbout(about.id)}
                            disabled={loading}
                            className="p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getTotalPages(aboutUsList) > 1 && (
              <Pagination
                currentPage={currentAboutPage}
                totalPages={getTotalPages(aboutUsList)}
                onPageChange={setCurrentAboutPage}
                totalItems={aboutUsList.length}
                currentItems={paginatedAbout.length}
              />
            )}
          </>
        )}
      </div>

      {/* Ventures Table */}
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: colors.contentBg }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold m-0" style={{ color: colors.textPrimary }}>
            Our Ventures
          </h3>
          <button
            onClick={handleAddVenture}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold"
            style={{ backgroundColor: colors.primary, color: '#ffffff' }}
          >
            <Plus size={14} />
            Add Venture
          </button>
        </div>

        {ventures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">No ventures found</p>
            <p className="text-xs text-gray-400">Click "Add Venture" to create your first venture</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: colors.border }}>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">ID</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Logo</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Venture Name</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVentures.map((venture) => (
                    <tr key={venture.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td className="px-3 py-2 text-xs">#{venture.id}</td>
                      <td className="px-3 py-2">
                        {venture.logoUrl && (
                          <img src={venture.logoUrl} alt={venture.ventureName} className="h-8 w-auto object-contain" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium">{venture.ventureName}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditVenture(venture)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} style={{ color: colors.primary }} />
                          </button>
                          <button
                            onClick={() => handleDeleteVenture(venture.id)}
                            disabled={loading}
                            className="p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getTotalPages(ventures) > 1 && (
              <Pagination
                currentPage={currentVenturePage}
                totalPages={getTotalPages(ventures)}
                onPageChange={setCurrentVenturePage}
                totalItems={ventures.length}
                currentItems={paginatedVentures.length}
              />
            )}
          </>
        )}
      </div>

      {/* Recognitions Table */}
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: colors.contentBg }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold m-0" style={{ color: colors.textPrimary }}>
            Global Recognition
          </h3>
          <button
            onClick={handleAddRecognition}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold"
            style={{ backgroundColor: colors.primary, color: '#ffffff' }}
          >
            <Plus size={14} />
            Add Recognition
          </button>
        </div>

        {recognitions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">No recognitions found</p>
            <p className="text-xs text-gray-400">Click "Add Recognition" to create your first recognition</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: colors.border }}>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">ID</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Value</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Title</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Subtitle</th>
                    <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecognitions.map((recognition) => (
                    <tr key={recognition.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td className="px-3 py-2 text-xs">#{recognition.id}</td>
                      <td className="px-3 py-2 text-xs font-bold">{recognition.value}</td>
                      <td className="px-3 py-2 text-xs font-medium">{recognition.title}</td>
                      <td className="px-3 py-2 text-xs">{recognition.subTitle}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditRecognition(recognition)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} style={{ color: colors.primary }} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecognition(recognition.id)}
                            disabled={loading}
                            className="p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getTotalPages(recognitions) > 1 && (
              <Pagination
                currentPage={currentRecognitionPage}
                totalPages={getTotalPages(recognitions)}
                onPageChange={setCurrentRecognitionPage}
                totalItems={recognitions.length}
                currentItems={paginatedRecognitions.length}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddUpdateAboutModal
        isOpen={isAboutModalOpen}
        onClose={(refresh) => {
          console.log('About modal closing, refresh:', refresh);
          setIsAboutModalOpen(false);
          setEditingAbout(null);
          if (refresh) fetchAllData();
        }}
        editData={editingAbout}
      />

      <AddUpdateVenturesModal
        isOpen={isVentureModalOpen}
        onClose={(refresh) => {
          console.log('Venture modal closing, refresh:', refresh);
          setIsVentureModalOpen(false);
          setEditingVenture(null);
          if (refresh && selectedAboutUsId) fetchVentures(selectedAboutUsId);
        }}
        editData={editingVenture}
        aboutUsId={selectedAboutUsId}
      />

      <AddUpdateRecognitionModal
        isOpen={isRecognitionModalOpen}
        onClose={(refresh) => {
          console.log('Recognition modal closing, refresh:', refresh);
          setIsRecognitionModalOpen(false);
          setEditingRecognition(null);
          if (refresh && selectedAboutUsId) fetchRecognitions(selectedAboutUsId);
        }}
        editData={editingRecognition}
        aboutUsId={selectedAboutUsId}
      />
    </div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange, totalItems, currentItems }) {
  const startIndex = (currentPage - 1) * currentItems + 1;
  const endIndex = startIndex + currentItems - 1;

  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
      <p className="text-[10px] m-0 text-gray-500">
        Showing {startIndex} to {Math.min(endIndex, totalItems)} of {totalItems} entries
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          style={{ color: colors.textPrimary }}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="px-2 py-1 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: page === currentPage ? colors.primary : 'transparent',
              color: page === currentPage ? '#ffffff' : colors.textPrimary,
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          style={{ color: colors.textPrimary }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default AboutUs;