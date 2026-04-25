import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Info,
  Briefcase,
  Award,
  Pencil,
  Building2,
  Home,
  AlertCircle,
} from "lucide-react";
import {
  getAboutUsAdmin,
  getVenturesByAboutUsId,
  getRecognitionsByAboutUsId,
  getAboutUsByPropertyType,
  getPropertyTypes,
} from "@/Api/Api";
import { enableAboutUs, disableAboutUs } from "@/Api/Api";
import { showSuccess, showError } from "@/lib/toasters/toastUtils";
import AddUpdateAboutModal from "../../modals/AddUpdateAboutModal";
import AddUpdateVenturesModal from "../../modals/AddUpdateVenturesModal";
import AddUpdateRecognitionModal from "../../modals/AddUpdateRecognitionModal";

const ENABLED_PROPERTY_TYPE_TABS = ["hotel", "restaurant", "cafe"];

function AboutUs() {
  const [activeTab, setActiveTab] = useState("homepage");
  const [contentTab, setContentTab] = useState("about");
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

  // Property Type State
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);

  const normalize = (val = "") =>
    val.toString().trim().replace(/\s+/g, "").toLowerCase();

  // Fetch Property Types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setLoadingPropertyTypes(true);
        const response = await getPropertyTypes();
        const data = response?.data || response;

        if (Array.isArray(data)) {
          const activeTypes = data.filter(
            (type) =>
              type.isActive &&
              ENABLED_PROPERTY_TYPE_TABS.includes(normalize(type.typeName)),
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

  const fetchAboutList = useCallback(async () => {
    try {
      setFetching(true);

      let data = [];

      if (activeTab !== "homepage") {
        const res = await getAboutUsByPropertyType(Number(activeTab));
        data = res?.data || res;
      } else {
        const res = await getAboutUsAdmin();
        const allData = res?.data || res;
        data = Array.isArray(allData)
          ? allData.filter((item) => item.propertyTypeId == null)
          : [];
      }

      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setAboutUsList(sorted);

        setSelectedAboutUsId((currentSelectedId) => {
          if (sorted.length === 0) return null;
          const hasCurrentSelection = sorted.some(
            (item) => Number(item.id) === Number(currentSelectedId),
          );
          return hasCurrentSelection ? currentSelectedId : sorted[0].id;
        });
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
  }, [activeTab]);
  const handleToggleStatus = async (about) => {
    try {
      setLoading(true);

      if (about.isActive) {
        await disableAboutUs(about.id);
        showSuccess("Disabled successfully");
      } else {
        await enableAboutUs(about.id);
        showSuccess("Enabled successfully");
      }

      // refresh list
      fetchAboutList();
    } catch (error) {
      console.error("Toggle status error:", error);
      showError("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = useCallback(async () => {
    if (!selectedAboutUsId) return;
    try {
      setFetchingTab(true);
      if (contentTab === "ventures") {
        const res = await getVenturesByAboutUsId(selectedAboutUsId);
        setVentures(res?.data || []);
      } else if (contentTab === "recognitions") {
        const res = await getRecognitionsByAboutUsId(selectedAboutUsId);
        setRecognitions(res?.data || []);
      }
    } catch (error) {
      console.error("Tab fetch error", error);
    } finally {
      setFetchingTab(false);
    }
  }, [contentTab, selectedAboutUsId]);

  useEffect(() => {
    fetchAboutList();
  }, [fetchAboutList]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  // const handleToggleStatus = async (about) => {
  //   try {
  //     setLoading(true);
  //     if (about.isActive) {
  //       await disableAboutUs(about.id);
  //     } else {
  //       await enableAboutUs(about.id);
  //     }
  //     showSuccess("Status updated successfully");
  //     fetchAboutList();
  //   } catch (error) {
  //     console.error("Toggle status error:", error);
  //     showError("Failed to update status");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleOpenEdit = (type, item) => {
    setSelectedEditData(item);
    if (type === "about") setIsAboutModalOpen(true);
    if (type === "venture") setIsVentureModalOpen(true);
    if (type === "recognition") setIsRecognitionModalOpen(true);
  };

  const handlePropertyTypeChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedAboutUsId(null);
  };

  const selectedPropertyTypeId =
    activeTab === "homepage" ? null : Number(activeTab);

  const getSelectedPropertyTypeName = () => {
    if (selectedPropertyTypeId === null) return "Homepage";
    const type = propertyTypes.find((pt) => pt.id === selectedPropertyTypeId);
    return type ? type.typeName : "Unknown";
  };

  const isRestaurantTab =
    activeTab !== "homepage" &&
    propertyTypes.some(
      (pt) =>
        String(pt.id) === activeTab && normalize(pt.typeName) === "restaurant",
    );

  const propertyTypeTabs = useMemo(
    () => [
      { id: "homepage", label: "Homepage", icon: Home },
      ...propertyTypes.map((type) => ({
        id: String(type.id),
        label: `${type.typeName} Page`,
        icon: Building2,
      })),
    ],
    [propertyTypes],
  );

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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {propertyTypeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handlePropertyTypeChange(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
          {loadingPropertyTypes && (
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <AlertCircle size={14} />
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
          {
            id: "recognitions",
            label: isRestaurantTab ? "Section 3" : "Recognitions",
            icon: Award,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setContentTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase transition-all ${
              contentTab === tab.id
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
        {contentTab === "about" && (
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
              {/* Show Add button only when fewer than 2 sections exist */}
              {aboutUsList.length < 2 && (
                <button
                  onClick={() => {
                    setSelectedEditData(null);
                    setIsAboutModalOpen(true);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Plus size={14} /> Add New
                </button>
              )}
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
                    {aboutUsList.map((about, index) => {
                      const isSelected =
                        Number(selectedAboutUsId) === Number(about.id);

                      return (
                        <tr
                          key={about.id}
                          onClick={() => setSelectedAboutUsId(about.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10"
                              : index === 0
                                ? "bg-primary/5"
                                : "hover:bg-muted/40"
                          }`}
                        >
                          <td className="p-4 font-mono text-xs">
                            <span className="mr-2 text-primary">●</span>#
                            {about.id}
                          </td>
                          <td className="p-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span>{about.sectionTitle}</span>
                              {isSelected && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                  Selected
                                </span>
                              )}
                            </div>
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
                          <td className="p-4 text-right flex justify-end items-center gap-3">
                            {/* Toggle Switch */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(about);
                              }}
                              disabled={loading}
                              className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                about.isActive ? "bg-green-500" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                                  about.isActive ? "translate-x-5" : ""
                                }`}
                              />
                            </button>

                            {/* Edit Button */}
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {contentTab === "ventures" && (
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

        {contentTab === "recognitions" && (
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
        defaultPropertyTypeId={selectedPropertyTypeId}
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
