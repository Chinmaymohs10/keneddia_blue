import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Briefcase,
  Award,
} from "lucide-react";
import {
  getAboutUsAdmin,
  getVenturesByAboutUsId,
  getRecognitionsByAboutUsId,
  enableAboutUs,
  disableAboutUs,
} from "@/Api/Api";
import { toast } from "react-hot-toast";
import AddUpdateAboutModal from "../../modals/AddUpdateAboutModal";
import AddUpdateVenturesModal from "../../modals/AddUpdateVenturesModal";
import AddUpdateRecognitionModal from "../../modals/AddUpdateRecognitionModal";

function AboutUs() {
  const [activeTab, setActiveTab] = useState("about");
  const [aboutUsList, setAboutUsList] = useState([]);
  const [ventures, setVentures] = useState([]);
  const [recognitions, setRecognitions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingTab, setFetchingTab] = useState(false);

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isVentureModalOpen, setIsVentureModalOpen] = useState(false);
  const [isRecognitionModalOpen, setIsRecognitionModalOpen] = useState(false);

  const [selectedAboutUsId, setSelectedAboutUsId] = useState(null);

  const [currentAboutPage, setCurrentAboutPage] = useState(1);
  const itemsPerPage = 5;

  const fetchAboutList = useCallback(async () => {
    try {
      setFetching(true);
      const res = await getAboutUsAdmin();
      const data = res?.data || res;

      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setAboutUsList(sorted);

        if (sorted.length > 0 && !selectedAboutUsId) {
          setSelectedAboutUsId(sorted[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to load About Us list");
    } finally {
      setFetching(false);
    }
  }, [selectedAboutUsId]);

  const fetchTabData = useCallback(async () => {
    if (!selectedAboutUsId) return;

    try {
      setFetchingTab(true);
      if (activeTab === "ventures") {
        const res = await getVenturesByAboutUsId(selectedAboutUsId);
        setVentures(res?.data || []);
      } else if (activeTab === "recognitions") {
        const res = await getRecognitionsByAboutUsId(selectedAboutUsId);
        setRecognitions(res?.data || []);
      }
    } catch (error) {
      console.error("Tab fetch error", error);
    } finally {
      setFetchingTab(false);
    }
  }, [activeTab, selectedAboutUsId]);

  useEffect(() => {
    fetchAboutList();
  }, [fetchAboutList]);
  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  // FIXED: Removed the ": any" type annotation for JSX compatibility
  const handleToggleStatus = async (about) => {
    try {
      setLoading(true);
      if (about.isActive) await disableAboutUs(about.id);
      else await enableAboutUs(about.id);

      toast.success("Status updated");
      fetchAboutList();
    } catch (error) {
      toast.error("Toggle failed");
    } finally {
      setLoading(false);
    }
  };

  const paginate = (items, page) =>
    items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (fetching)
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-medium text-muted-foreground">
          Initializing Admin Panel...
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex bg-card border rounded-xl overflow-hidden p-1 gap-1">
        {[
          { id: "about", label: "About Sections", icon: Info },
          { id: "ventures", label: "Ventures", icon: Briefcase },
          { id: "recognitions", label: "Recognitions", icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-xl shadow-sm min-h-[400px]">
        {activeTab === "about" && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">Manage Content Sections</h3>
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50 text-[10px] font-bold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginate(aboutUsList, currentAboutPage).map((about) => (
                    <tr
                      key={about.id}
                      onClick={() => setSelectedAboutUsId(about.id)}
                      className={`cursor-pointer transition-colors ${selectedAboutUsId === about.id ? "bg-primary/5" : "hover:bg-muted/20"}`}
                    >
                      <td className="p-4 font-mono text-xs">
                        {selectedAboutUsId === about.id && (
                          <span className="mr-2 text-primary">●</span>
                        )}
                        #{about.id}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {about.sectionTitle}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${about.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {about.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(about);
                          }}
                          disabled={loading}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            about.isActive
                              ? "border-red-200 text-red-600"
                              : "border-green-200 text-green-600"
                          }`}
                        >
                          {about.isActive ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "ventures" && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-sm font-bold">
                  Ventures for Content #{selectedAboutUsId}
                </h3>
              </div>
              <button
                onClick={() => setIsVentureModalOpen(true)}
                disabled={ventures.length >= 5} // Disable if more than or equal to 5
                title={
                  ventures.length >= 5
                    ? "Maximum 5 ventures allowed"
                    : "Add Venture"
                }
                className={`p-2 rounded-lg transition-all ${
                  ventures.length >= 5
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-primary text-white hover:opacity-90"
                }`}
              >
                <Plus size={18} />
              </button>
            </div>
            {fetchingTab ? (
              <Loader2 className="animate-spin mx-auto mt-10 text-primary" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ventures.length === 0 ? (
                  <p className="col-span-full text-center text-sm">
                    No Ventures Found
                  </p>
                ) : (
                  ventures.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 border rounded-xl flex items-center gap-4 bg-white"
                    >
                      <img
                        src={v.logoUrl}
                        className="w-12 h-12 rounded-full border"
                        alt={v.ventureName}
                      />
                      <p className="font-bold text-sm truncate">
                        {v.ventureName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "recognitions" && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-sm font-bold">
                Recognitions for Content #{selectedAboutUsId}
              </h3>
              <button
                onClick={() => setIsRecognitionModalOpen(true)}
                disabled={recognitions.length >= 5} // Disable if more than or equal to 5
                title={
                  recognitions.length >= 5
                    ? "Maximum 5 recognitions allowed"
                    : "Add Recognition"
                }
                className={`p-2 rounded-lg transition-all ${
                  recognitions.length >= 5
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-primary text-white hover:opacity-90"
                }`}
              >
                <Plus size={18} />
              </button>
            </div>
            {fetchingTab ? (
              <Loader2 className="animate-spin mx-auto mt-10 text-primary" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recognitions.length === 0 ? (
                  <p className="col-span-full text-center text-sm">
                    No Recognitions Found
                  </p>
                ) : (
                  recognitions.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 border rounded-xl bg-white text-center"
                    >
                      <div className="text-2xl font-serif font-bold text-primary mb-1">
                        {r.value}
                      </div>
                      <div className="text-xs font-bold uppercase">
                        {r.title}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-1">
                        {r.subTitle}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AddUpdateAboutModal
        isOpen={isAboutModalOpen}
        onClose={(refresh) => {
          setIsAboutModalOpen(false);
          if (refresh) fetchAboutList();
        }}
      />
      <AddUpdateVenturesModal
        isOpen={isVentureModalOpen}
        aboutUsId={selectedAboutUsId}
        onClose={(refresh) => {
          setIsVentureModalOpen(false);
          if (refresh) fetchTabData();
        }}
      />
      <AddUpdateRecognitionModal
        isOpen={isRecognitionModalOpen}
        aboutUsId={selectedAboutUsId}
        onClose={(refresh) => {
          setIsRecognitionModalOpen(false);
          if (refresh) fetchTabData();
        }}
      />
    </div>
  );
}

export default AboutUs;
