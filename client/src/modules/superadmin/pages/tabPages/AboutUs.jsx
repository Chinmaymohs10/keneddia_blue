import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Loader2,
  Info,
  Briefcase,
  Award,
  Pencil,
  Building2,
  Home,
} from "lucide-react";
import {
  getAboutUsAdmin,
  getVenturesByAboutUsId,
  getRecognitionsByAboutUsId,
  enableAboutUs,
  disableAboutUs,
  getAboutUsByPropertyType,
  getPropertyTypes,
} from "@/Api/Api";
import {
  showSuccess,
  showInfo,
  showError,
  showWarning,
} from "@/lib/toasters/toastUtils";
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
  const [selectedEditData, setSelectedEditData] = useState(null);

  const [currentAboutPage, setCurrentAboutPage] = useState(1);
  const itemsPerPage = 5;

  // Property Type State
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState(null); // null = show all
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);

  // Fetch Property Types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setLoadingPropertyTypes(true);
        const response = await getPropertyTypes();
        const data = response?.data || response;

        if (Array.isArray(data)) {
          const activeTypes = data.filter(
            (type) => type.isActive && normalize(type.typeName) !== "both",
          );

          setPropertyTypes(activeTypes);
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
        showError("Failed to load property types");
      } finally {
        setLoadingPropertyTypes(false);
      }
    };

    fetchPropertyTypes();
  }, []);
  const normalize = (val = "") =>
    val.toString().trim().replace(/\s+/g, "").toLowerCase();

  const fetchAboutList = useCallback(async () => {
    try {
      setFetching(true);

      let data = [];

      if (selectedPropertyTypeId !== null) {
        // Property-specific About Us
        const res = await getAboutUsByPropertyType(selectedPropertyTypeId);
        data = res?.data || res;
      } else {
        // Homepage About Us (exclude property-specific entries)
        const res = await getAboutUsAdmin();
        const allData = res?.data || res;

        data = Array.isArray(allData)
          ? allData.filter((item) => item.propertyTypeId == null)
          : [];
      }

      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setAboutUsList(sorted);

        // Auto-select first item
        if (sorted.length > 0 && !selectedAboutUsId) {
          setSelectedAboutUsId(sorted[0].id);
        } else if (sorted.length === 0) {
          setSelectedAboutUsId(null);
        }
      } else {
        setAboutUsList([]);
        setSelectedAboutUsId(null);
      }
    } catch (error) {
      console.error("Failed to load About Us list:", error);
      showError("Failed to load About Us list");
      setAboutUsList([]);
      setSelectedAboutUsId(null);
    } finally {
      setFetching(false);
    }
  }, [selectedPropertyTypeId, selectedAboutUsId]);

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

  const handleToggleStatus = async (about) => {
    try {
      setLoading(true);
      if (about.isActive) {
        await disableAboutUs(about.id);
      } else {
        await enableAboutUs(about.id);
      }
      showSuccess("Status updated successfully");
      fetchAboutList();
    } catch (error) {
      console.error("Toggle status error:", error);
      showError("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (type, item) => {
    setSelectedEditData(item);
    if (type === "about") setIsAboutModalOpen(true);
    if (type === "venture") setIsVentureModalOpen(true);
    if (type === "recognition") setIsRecognitionModalOpen(true);
  };

  const handlePropertyTypeChange = (typeId) => {
    setSelectedPropertyTypeId(typeId);
    setSelectedAboutUsId(null); // Reset selection when filter changes
    setCurrentAboutPage(1); // Reset pagination
  };

  const paginate = (items, page) =>
    items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getSelectedPropertyTypeName = () => {
    if (selectedPropertyTypeId === null) return "Home page";
    const type = propertyTypes.find((pt) => pt.id === selectedPropertyTypeId);
    return type ? type.typeName : "Unknown";
  };

  if (fetching && propertyTypes.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-medium text-muted-foreground">
          Initializing Admin Panel...
        </p>
      </div>
    );
  }

  const totalAboutPages = Math.ceil(aboutUsList.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Property Type Filter */}
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-muted-foreground" />
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Filter by Property Type:
            </label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Home page Button */}
            <button
              onClick={() => handlePropertyTypeChange(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedPropertyTypeId === null
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Home size={14} />
              Home page
            </button>

            {/* Property Type Buttons */}
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handlePropertyTypeChange(type.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedPropertyTypeId === type.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {type.typeName}
              </button>
            ))}
          </div>

          {loadingPropertyTypes && (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Active Filter Indicator */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Currently viewing:{" "}
            <span className="font-bold text-foreground">
              {getSelectedPropertyTypeName()}
            </span>
            {aboutUsList.length > 0 && (
              <span className="ml-2">
                ({aboutUsList.length}{" "}
                {aboutUsList.length === 1 ? "section" : "sections"} found)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
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
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-card border rounded-xl shadow-sm min-h-[400px]">
        {activeTab === "about" && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">
                Manage Content Sections
                {selectedPropertyTypeId !== null && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    for {getSelectedPropertyTypeName()}
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setSelectedEditData(null);
                  setIsAboutModalOpen(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            {fetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : aboutUsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info size={48} className="text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">
                  No content sections found
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedPropertyTypeId !== null
                    ? `No sections available for ${getSelectedPropertyTypeName()}`
                    : "Create your first content section to get started"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 text-[10px] font-bold uppercase text-muted-foreground">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Title</th>
                        <th className="p-4">Property Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginate(aboutUsList, currentAboutPage).map((about) => (
                        <tr
                          key={about.id}
                          onClick={() => setSelectedAboutUsId(about.id)}
                          className={`cursor-pointer transition-colors ${
                            selectedAboutUsId === about.id
                              ? "bg-primary/5"
                              : "hover:bg-muted/20"
                          }`}
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
                            {about.propertyTypeId ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-100 text-blue-700">
                                <Building2 size={10} />
                                {propertyTypes.find(
                                  (pt) => pt.id === about.propertyTypeId,
                                )?.typeName || "Unknown"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gray-100 text-gray-600">
                                <Home size={10} />
                                General
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                about.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {about.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit("about", about);
                              }}
                              className="p-1.5 hover:bg-muted rounded-md text-primary transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(about);
                              }}
                              disabled={loading}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                about.isActive
                                  ? "border-red-200 text-red-600 hover:bg-red-50"
                                  : "border-green-200 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {loading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : about.isActive ? (
                                "Disable"
                              ) : (
                                "Enable"
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalAboutPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Showing {(currentAboutPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentAboutPage * itemsPerPage,
                        aboutUsList.length,
                      )}{" "}
                      of {aboutUsList.length} sections
                    </p>
                    <div className="flex gap-2">
                      {[...Array(totalAboutPages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentAboutPage(idx + 1)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            currentAboutPage === idx + 1
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "ventures" && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-sm font-bold">
                Ventures for Content #{selectedAboutUsId}
              </h3>
              <button
                onClick={() => {
                  setSelectedEditData(null);
                  setIsVentureModalOpen(true);
                }}
                disabled={!selectedAboutUsId || ventures.length >= 5}
                className={`p-2 rounded-lg transition-all ${
                  !selectedAboutUsId || ventures.length >= 5
                    ? "bg-muted cursor-not-allowed opacity-50"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
                title={
                  !selectedAboutUsId
                    ? "Select an About Us section first"
                    : ventures.length >= 5
                      ? "Maximum 5 ventures reached"
                      : "Add venture"
                }
              >
                <Plus size={18} />
              </button>
            </div>
            {fetchingTab ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ventures.length === 0 ? (
                  <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                    {selectedAboutUsId
                      ? "No Ventures Found"
                      : "Select an About Us section to view ventures"}
                  </p>
                ) : (
                  ventures.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 border rounded-xl flex items-center justify-between gap-4 bg-white group hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={v.logoUrl}
                          className="w-12 h-12 rounded-full border object-cover"
                          alt={v.ventureName}
                        />
                        <p className="font-bold text-sm truncate">
                          {v.ventureName}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenEdit("venture", v)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted rounded-md transition-all text-primary"
                      >
                        <Pencil size={14} />
                      </button>
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
                onClick={() => {
                  setSelectedEditData(null);
                  setIsRecognitionModalOpen(true);
                }}
                disabled={!selectedAboutUsId || recognitions.length >= 5}
                className={`p-2 rounded-lg transition-all ${
                  !selectedAboutUsId || recognitions.length >= 5
                    ? "bg-muted cursor-not-allowed opacity-50"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
                title={
                  !selectedAboutUsId
                    ? "Select an About Us section first"
                    : recognitions.length >= 5
                      ? "Maximum 5 recognitions reached"
                      : "Add recognition"
                }
              >
                <Plus size={18} />
              </button>
            </div>
            {fetchingTab ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recognitions.length === 0 ? (
                  <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                    {selectedAboutUsId
                      ? "No Recognitions Found"
                      : "Select an About Us section to view recognitions"}
                  </p>
                ) : (
                  recognitions.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 border rounded-xl bg-white text-center relative group hover:border-primary/50 transition-all"
                    >
                      <button
                        onClick={() => handleOpenEdit("recognition", r)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-muted rounded-md transition-all text-primary"
                      >
                        <Pencil size={14} />
                      </button>
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

      {/* Modals */}
      <AddUpdateAboutModal
        isOpen={isAboutModalOpen}
        editData={selectedEditData}
        onClose={(refresh) => {
          setIsAboutModalOpen(false);
          setSelectedEditData(null);
          if (refresh) fetchAboutList();
        }}
      />
      <AddUpdateVenturesModal
        isOpen={isVentureModalOpen}
        editData={selectedEditData}
        aboutUsId={selectedAboutUsId}
        onClose={(refresh) => {
          setIsVentureModalOpen(false);
          setSelectedEditData(null);
          if (refresh) fetchTabData();
        }}
      />
      <AddUpdateRecognitionModal
        isOpen={isRecognitionModalOpen}
        editData={selectedEditData}
        aboutUsId={selectedAboutUsId}
        onClose={(refresh) => {
          setIsRecognitionModalOpen(false);
          setSelectedEditData(null);
          if (refresh) fetchTabData();
        }}
      />
    </div>
  );
}

export default AboutUs;
