import React, { useEffect, useMemo, useState } from "react";
import { colors } from "@/lib/colors/colors";
import {
  getAllPolicyPages,
  createPolicyPage,
  updatePolicyPage,
  deletePolicyPage,
  addPolicySection,
  updatePolicySection,
  updatePolicySectionActive,
  reorderPolicySections,
  saveOrUpdateDocument,
  saveOrUpdateLegalDisclaimerDocument,
  getLegalDisclaimerDocumentByLegalDisclaimerId,
} from "@/Api/policypagesapi";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

const inputBaseClass =
  "w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors";
const mutedButtonClass =
  "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors";
const labelClass = "block text-[11px] font-semibold mb-1";

const emptySection = {
  title: "",
  description: "",
  highlightTextDescription: "",
  active: true,
  sequence: 1,
};

const emptyForm = {
  mainTitle: "",
  mainTitleLine1: "",
  mainTitleLine2: "",
  mainDescription: "",
  highlightTextDescription: "",
  disclaimerText: "",
  lastModifiedTitle: "",
  updatedDate: "",
  effectiveDate: "",
  lastUpdated: "",
  version: "",
  sections: [{ ...emptySection }],
};

export default function Policies() {
  const [policyTypeTab, setPolicyTypeTab] = useState("privacy");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [legalDocumentFile, setLegalDocumentFile] = useState(null);
  const [legalDocumentMap, setLegalDocumentMap] = useState({});

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (b?.id || 0) - (a?.id || 0)),
    [items],
  );

  const policyTypeFlags = useMemo(() => {
    if (policyTypeTab === "privacy") {
      return {
        showOnPrivacyPolicy: true,
        showOnLegalDisclaimer: false,
      };
    }

    return {
      showOnPrivacyPolicy: false,
      showOnLegalDisclaimer: true,
    };
  }, [policyTypeTab]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      if (policyTypeTab === "privacy") return item?.showOnPrivacyPolicy === true;
      return item?.showOnLegalDisclaimer === true;
    });
  }, [policyTypeTab, sortedItems]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await getAllPolicyPages();
      const data = res?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError("Failed to fetch policy pages");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    const loadLegalDocs = async () => {
      if (policyTypeTab !== "legal" || filteredItems.length === 0) {
        setLegalDocumentMap({});
        return;
      }
      const nextMap = {};
      await Promise.all(
        filteredItems.map(async (item) => {
          try {
            const res = await getLegalDisclaimerDocumentByLegalDisclaimerId(item.id);
            const data = res?.data;
            const mapping = Array.isArray(data) ? data[0] : data;
            nextMap[item.id] = mapping || null;
          } catch (error) {
            nextMap[item.id] = null;
          }
        }),
      );
      setLegalDocumentMap(nextMap);
    };

    loadLegalDocs();
  }, [policyTypeTab, filteredItems]);

  const resetForm = () => {
    setForm(emptyForm);
    setLegalDocumentFile(null);
    setEditingItem(null);
    setIsEditModalOpen(false);
  };

  const mapItemToForm = (item) => {
    setForm({
      mainTitle: item.mainTitle || "",
      mainTitleLine1:
        (item.mainTitle || "").trim().split(/\s+/).filter(Boolean)[0] || "",
      mainTitleLine2:
        item.highlightTextDescription ||
        (item.mainTitle || "").trim().split(/\s+/).filter(Boolean).slice(1).join(" ") ||
        "",
      mainDescription: item.mainDescription || "",
      highlightTextDescription: item.highlightTextDescription || "",
      disclaimerText: item.disclaimerText || "",
      lastModifiedTitle: item.lastModifiedTitle || "",
      updatedDate: item.updatedDate || "",
      effectiveDate: item.effectiveDate || "",
      lastUpdated: item.lastUpdated || "",
      version: item.version || "",
      sections:
        Array.isArray(item.sections) && item.sections.length
          ? item.sections.map((s, idx) => ({
              id: s.id,
              title: s.title || "",
              description: s.description || "",
              highlightTextDescription:
                s.highlightTextDescription || s.highlightText || "",
              active: typeof s.active === "boolean" ? s.active : true,
              sequence: s.sequence || idx + 1,
            }))
          : [{ ...emptySection }],
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
    mapItemToForm(item);
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSectionChange = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.sections];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, sections: next };
    });
  };

  const addSectionRow = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { ...emptySection, sequence: prev.sections.length + 1 },
      ],
    }));
  };

  const removeSectionRow = (index) => {
    setForm((prev) => {
      const next = prev.sections.filter((_, i) => i !== index);
      return {
        ...prev,
        sections: next.length ? next : [{ ...emptySection }],
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem && filteredItems.length > 0) {
      showError("Only one policy page is allowed per type. Please edit the existing one.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        mainTitle: [form.mainTitleLine1, form.mainTitleLine2]
          .filter(Boolean)
          .join(" ")
          .trim(),
        mainDescription: form.mainDescription,
        highlightTextDescription: form.mainTitleLine2 || form.highlightTextDescription,
        disclaimerText: form.disclaimerText || null,
        lastModifiedTitle: form.lastModifiedTitle || null,
        updatedDate: form.updatedDate || null,
        effectiveDate: form.effectiveDate,
        lastUpdated: form.lastUpdated,
        version: form.version,
        ...policyTypeFlags,
        sections: form.sections.map((s, index) => ({
          title: s.title,
          description: s.description,
          highlightTextDescription: s.highlightTextDescription || null,
          highlightText: s.highlightTextDescription || null,
          active: typeof s.active === "boolean" ? s.active : true,
          sequence: Number(s.sequence || index + 1),
        })),
      };

      let savedPolicyId = editingItem?.id || null;

      if (editingItem?.id) {
        const updateRes = await updatePolicyPage(editingItem.id, payload);
        savedPolicyId = updateRes?.data?.id || editingItem.id;
        showSuccess("Policy page updated");
      } else {
        const createRes = await createPolicyPage(payload);
        savedPolicyId = createRes?.data?.id || null;
        showSuccess("Policy page created");
      }

      if (policyTypeTab === "legal" && legalDocumentFile && savedPolicyId) {
        setUploadingDoc(true);
        let mappingId = null;
        let existingDocumentId = null;
        try {
          const existingMappingRes =
            await getLegalDisclaimerDocumentByLegalDisclaimerId(savedPolicyId);
          mappingId = existingMappingRes?.data?.id || null;
          existingDocumentId =
            existingMappingRes?.data?.documentId ||
            existingMappingRes?.data?.document?.id ||
            null;
        } catch (mappingError) {
          mappingId = null;
          existingDocumentId = null;
        }

        const uploadRes = await saveOrUpdateDocument(
          legalDocumentFile,
          existingDocumentId || undefined,
        );
        const uploadedDocumentId =
          uploadRes?.data?.id || uploadRes?.data?.documentId || null;

        if (!uploadedDocumentId) {
          throw new Error("Document uploaded but document id not found in response");
        }

        await saveOrUpdateLegalDisclaimerDocument({
          ...(mappingId ? { id: mappingId } : {}),
          legalDisclaimerId: savedPolicyId,
          documentId: uploadedDocumentId,
        });
        showSuccess("Legal disclaimer document linked");
      }

      resetForm();
      fetchPolicies();
    } catch (error) {
      console.error(error);
      showError("Failed to save policy page");
    } finally {
      setUploadingDoc(false);
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this policy? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deletePolicyPage(id);
      showSuccess("Policy page deleted");
      fetchPolicies();
      if (editingItem?.id === id) resetForm();
    } catch (error) {
      console.error(error);
      showError("Failed to delete policy page");
    }
  };

  const handleToggleSection = async (sectionId, currentValue) => {
    try {
      await updatePolicySectionActive(sectionId, !currentValue);
      showSuccess("Section status updated");
      fetchPolicies();
    } catch (error) {
      console.error(error);
      showError("Failed to update section status");
    }
  };

  const handleQuickReorder = async (item) => {
    try {
      const sectionIds = (item.sections || [])
        .slice()
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        .map((s) => s.id)
        .filter(Boolean);

      if (!sectionIds.length) {
        showError("No section ids available to reorder");
        return;
      }

      await reorderPolicySections(item.id, sectionIds);
      showSuccess("Section order synced");
      fetchPolicies();
    } catch (error) {
      console.error(error);
      showError("Failed to reorder sections");
    }
  };

  const handleInlineSectionUpdate = async (section) => {
    try {
      await updatePolicySection(section.id, {
        title: section.title,
        description: section.description,
        highlightTextDescription: section.highlightTextDescription || null,
        highlightText: section.highlightTextDescription || null,
      });
      showSuccess("Section updated");
      fetchPolicies();
    } catch (error) {
      console.error(error);
      showError("Failed to update section");
    }
  };

  const handleAddSectionToPolicy = async (policyId) => {
    try {
      await addPolicySection(policyId, {
        title: "",
        description: "",
        highlightTextDescription: null,
        highlightText: null,
      });
      showSuccess("Section added");
      fetchPolicies();
    } catch (error) {
      console.error(error);
      showError("Failed to add section");
    }
  };

  const getHeroTitleLines = (item) => {
    const words = (item?.mainTitle || "").trim().split(/\s+/).filter(Boolean);
    const line1 = words[0] || "--";
    const line2 =
      item?.highlightTextDescription || words.slice(1).join(" ") || "--";
    return { line1, line2 };
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-5 shadow-sm border border-border/50"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              Policies
            </h2>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Manage privacy policies and legal disclaimer pages
            </p>
          </div>
        </div>
        <div
          className="mt-4 inline-flex rounded-lg p-1 border"
          style={{ backgroundColor: colors.mainBg, borderColor: colors.border }}
        >
          <button
            type="button"
            onClick={() => {
              setPolicyTypeTab("privacy");
              resetForm();
            }}
            className="px-3 py-1.5 text-xs rounded-md font-semibold transition-colors"
            style={{
              backgroundColor: policyTypeTab === "privacy" ? colors.primary : "transparent",
              color: policyTypeTab === "privacy" ? "#fff" : colors.textPrimary,
            }}
          >
            Privacy Policies
          </button>
          <button
            type="button"
            onClick={() => {
              setPolicyTypeTab("legal");
              resetForm();
            }}
            className="px-3 py-1.5 text-xs rounded-md font-semibold transition-colors"
            style={{
              backgroundColor: policyTypeTab === "legal" ? colors.primary : "transparent",
              color: policyTypeTab === "legal" ? "#fff" : colors.textPrimary,
            }}
          >
            Legal Disclaimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-4 shadow-sm border border-border/50"
          style={{ backgroundColor: colors.contentBg }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {editingItem
                ? `Edit #${editingItem.id}`
                : policyTypeTab === "privacy"
                  ? "Create Privacy Policy"
                  : "Create Legal Disclaimer"}
            </h3>
          </div>

          {filteredItems.length > 0 && !editingItem ? (
            <div
              className="rounded-lg border px-3 py-2.5 text-sm font-semibold"
              style={{
                borderColor: "#FCA5A5",
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
              }}
            >
              Warning: One {policyTypeTab === "privacy" ? "privacy policy" : "legal disclaimer"} already exists. Edit the existing item/sections from the right panel.
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className={labelClass} style={{ color: colors.textPrimary }}>
                Main Title (Line 1)
              </label>
              <input
                className={inputBaseClass}
                style={{ borderColor: colors.border }}
                placeholder="e.g. Privacy"
                value={form.mainTitleLine1}
                onChange={(e) => handleFormChange("mainTitleLine1", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: colors.textPrimary }}>
                Main Title (Line 2 / Highlight)
              </label>
              <input
                className={inputBaseClass}
                style={{ borderColor: colors.border }}
                placeholder="e.g. Matters"
                value={form.mainTitleLine2}
                onChange={(e) => handleFormChange("mainTitleLine2", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: colors.textPrimary }}>
                Main Description
              </label>
              <textarea
                className={inputBaseClass}
                style={{ borderColor: colors.border }}
                rows={3}
                placeholder="Short hero description shown under title"
                value={form.mainDescription}
                onChange={(e) => handleFormChange("mainDescription", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelClass} style={{ color: colors.textPrimary }}>
                  Effective Date
                </label>
                <input type="date" className={inputBaseClass} style={{ borderColor: colors.border }} value={form.effectiveDate} onChange={(e) => handleFormChange("effectiveDate", e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={{ color: colors.textPrimary }}>
                  Last Updated
                </label>
                <input type="date" className={inputBaseClass} style={{ borderColor: colors.border }} value={form.lastUpdated} onChange={(e) => handleFormChange("lastUpdated", e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={{ color: colors.textPrimary }}>
                  Version
                </label>
                <input className={inputBaseClass} style={{ borderColor: colors.border }} placeholder="Version" value={form.version} onChange={(e) => handleFormChange("version", e.target.value)} />
              </div>
            </div>

            {policyTypeTab === "legal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className={labelClass} style={{ color: colors.textPrimary }}>
                    Last Modified Title
                  </label>
                  <input
                    className={inputBaseClass}
                    style={{ borderColor: colors.border }}
                    placeholder="e.g. LAST MODIFIED"
                    value={form.lastModifiedTitle}
                    onChange={(e) => handleFormChange("lastModifiedTitle", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ color: colors.textPrimary }}>
                    Updated Date (Display)
                  </label>
                  <input
                    type="date"
                    className={inputBaseClass}
                    style={{ borderColor: colors.border }}
                    value={form.updatedDate}
                    onChange={(e) => handleFormChange("updatedDate", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} style={{ color: colors.textPrimary }}>
                    Disclaimer Text
                  </label>
                  <textarea
                    className={inputBaseClass}
                    style={{ borderColor: colors.border }}
                    rows={3}
                    placeholder="Footer legal disclaimer text"
                    value={form.disclaimerText}
                    onChange={(e) => handleFormChange("disclaimerText", e.target.value)}
                  />
                </div>
              </div>
            )}

            {policyTypeTab === "legal" && (
              <div>
                <label className={labelClass} style={{ color: colors.textPrimary }}>
                  Legal Disclaimer Document
                </label>
                <input
                  type="file"
                  className={inputBaseClass}
                  style={{ borderColor: colors.border }}
                  onChange={(e) => setLegalDocumentFile(e.target.files?.[0] || null)}
                />
                <p className="text-[11px] mt-1" style={{ color: colors.textSecondary }}>
                  Uploading a file will save/update document and link it to this legal disclaimer.
                </p>
              </div>
            )}

            <div className="border rounded-xl p-3" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.textPrimary }}>Sections</p>
                <button type="button" onClick={addSectionRow} className={mutedButtonClass} style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}>
                  <Plus size={13} /> Add Section
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                {form.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-2.5 space-y-1.5" style={{ borderColor: colors.border }}>
                    <div>
                      <label className={labelClass} style={{ color: colors.textPrimary }}>
                        Section Title
                      </label>
                      <input className="w-full border rounded-md px-2.5 py-1.5 text-xs" style={{ borderColor: colors.border }} placeholder="Title" value={section.title} onChange={(e) => handleSectionChange(index, "title", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: colors.textPrimary }}>
                        Description
                      </label>
                      <textarea className="w-full border rounded-md px-2.5 py-1.5 text-xs" style={{ borderColor: colors.border }} rows={2} placeholder="Description" value={section.description} onChange={(e) => handleSectionChange(index, "description", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      <div>
                        <label className={labelClass} style={{ color: colors.textPrimary }}>
                          Highlight Text Description
                        </label>
                        <textarea className="border rounded-md px-2 py-1 text-xs w-full" style={{ borderColor: colors.border }} rows={2} placeholder="Highlight text description" value={section.highlightTextDescription || ""} onChange={(e) => handleSectionChange(index, "highlightTextDescription", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass} style={{ color: colors.textPrimary }}>
                          Sequence
                        </label>
                      <input type="number" disabled className="border rounded-md px-2 py-1 text-xs w-full max-w-[140px] bg-gray-100 cursor-not-allowed" style={{ borderColor: colors.border }} value={section.sequence} />
                      </div>
                      <label className="text-xs flex items-center gap-2 px-2 font-medium">
                        <input type="checkbox" checked={!!section.active} onChange={(e) => handleSectionChange(index, "active", e.target.checked)} /> Active
                      </label>
                    </div>
                    <button type="button" onClick={() => removeSectionRow(index)} className="text-[11px] font-medium text-red-600">Remove section</button>
                  </div>
                ))}
              </div>
            </div>

            <button disabled={saving || uploadingDoc || (!editingItem && filteredItems.length > 0)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm disabled:opacity-70" style={{ backgroundColor: colors.primary }}>
              <Save size={15} /> {saving || uploadingDoc ? "Saving..." : editingItem ? "Update Policy" : "Create Policy"}
            </button>
          </form>
        </div>

        <div
          className="rounded-xl p-4 shadow-sm border border-border/50"
          style={{ backgroundColor: colors.contentBg }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: colors.textPrimary }}>
            {policyTypeTab === "privacy" ? "Existing Privacy Policies" : "Existing Legal Disclaimers"}
          </h3>

          {loading ? (
            <p className="text-sm" style={{ color: colors.textSecondary }}>Loading...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-sm" style={{ color: colors.textSecondary }}>No policy pages found.</p>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
              {filteredItems.map((item) => {
                const { line1, line2 } = getHeroTitleLines(item);
                return (
                <div key={item.id} className="border rounded-xl p-3" style={{ borderColor: colors.border }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                        {item.mainTitle}
                        <span className="text-xs font-medium"> #{item.id}</span>
                      </p>
                      {item.mainDescription ? (
                        <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>
                          {item.mainDescription}
                        </p>
                      ) : null}
                      <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                        Effective: {item.effectiveDate} | Updated: {item.lastUpdated} | Version: {item.version}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded-md" style={{ backgroundColor: colors.mainBg }}><Edit size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                    <div className="relative min-h-[160px] sm:min-h-[200px]">
                      <img
                        src={
                          item?.showOnLegalDisclaimer
                            ? "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1600"
                            : "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1600"
                        }
                        alt="Policy preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-white/85" />
                      <div className="relative z-10 px-3 sm:px-4 py-3 sm:py-4 text-center">
                        <h4 className="text-2xl sm:text-4xl font-serif text-white leading-[0.95]">
                          {line1}
                        </h4>
                        <p className="text-2xl sm:text-4xl font-serif italic text-primary leading-[0.95] mt-0.5">
                          {line2}
                        </p>
                        {item.mainDescription ? (
                          <p className="mt-2 text-[11px] sm:text-sm font-medium text-white/95 max-w-xl mx-auto">
                            {item.mainDescription}
                          </p>
                        ) : null}
                        <div className="mt-2 h-0.5 w-14 bg-primary mx-auto" />
                        <div className="mt-2 flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-white font-semibold">
                          <span>• Effective: {item.effectiveDate || "-"}</span>
                          <span>• Updated: {item.lastUpdated || "-"}</span>
                          <span>• Version: {item.version || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f6f7f8] px-3 sm:px-4 py-3 sm:py-4 space-y-3">
                      {(item.sections || [])
                        .slice()
                        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                        .slice(0, 2)
                        .map((section, idx) => (
                          <div key={`preview-${section.id || idx}`} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-lg font-serif text-[#e8c9ce]">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <p className="text-sm sm:text-lg font-serif text-[#0A2357]">
                                {section.title || "--"}
                              </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f2f4] border border-[#e6e9ed] p-3 sm:p-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#ea2e2e] mb-2" />
                              <p className="text-xs sm:text-sm text-[#344e6f] leading-relaxed">
                                {section.description || "--"}
                              </p>
                            </div>
                            {section.highlightTextDescription ? (
                              <div className="rounded-xl bg-[#f8eff0] border-l-4 border-[#ea2e2e] p-3 sm:p-4">
                                <p className="italic text-xs sm:text-sm text-[#1F3B64] leading-relaxed">
                                  {section.highlightTextDescription}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        ))}
                    </div>
                  </div>

                  {policyTypeTab === "legal" && (
                    <div className="mt-2.5 rounded-lg border p-3" style={{ borderColor: colors.border }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: colors.textPrimary }}>
                        Attached Document
                      </p>
                      {legalDocumentMap[item.id]?.document?.url ? (
                        <div className="space-y-2">
                          <p className="text-xs" style={{ color: colors.textSecondary }}>
                            {legalDocumentMap[item.id]?.document?.originalName || "Document"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={legalDocumentMap[item.id].document.url}
                              target="_blank"
                              rel="noreferrer"
                              className={mutedButtonClass}
                              style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}
                            >
                              Open
                            </a>
                            <a
                              href={legalDocumentMap[item.id].document.url}
                              download={legalDocumentMap[item.id]?.document?.originalName || "document"}
                              className={mutedButtonClass}
                              style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}
                            >
                              Download
                            </a>
                          </div>
                          {String(legalDocumentMap[item.id]?.document?.contentType || "").includes("pdf") ? (
                            <iframe
                              title={`legal-document-preview-${item.id}`}
                              src={legalDocumentMap[item.id].document.url}
                              className="w-full h-[320px] rounded-md border"
                              style={{ borderColor: colors.border }}
                            />
                          ) : (
                            <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                              Preview is available for PDF files only.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                          No document linked yet.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-2.5 space-y-1.5">
                    {(item.sections || []).map((section) => (
                      <div key={section.id} className="rounded-lg border px-2.5 py-2" style={{ borderColor: colors.border }}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
                            {section.title} (seq:{section.sequence})
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleSection(section.id, section.active)}
                              className="text-[10px] px-2 py-1 rounded-md font-semibold border"
                              style={{
                                borderColor: colors.border,
                                backgroundColor: "#f3f4f6",
                                color: "#111827",
                              }}
                            >
                              {section.active ? "Disable" : "Enable"}
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px]" style={{ color: colors.textSecondary }}>{section.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-3xl rounded-xl shadow-xl border max-h-[90vh] overflow-y-auto scrollbar-thin"
            style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
          >
            <div
              className="sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between"
              style={{ backgroundColor: colors.contentBg, borderColor: colors.border }}
            >
              <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                Edit Policy #{editingItem.id}
              </h3>
              <button
                onClick={resetForm}
                className={mutedButtonClass}
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  backgroundColor: colors.mainBg,
                }}
              >
                <X size={14} /> Close
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3 p-4">
              <input className={inputBaseClass} style={{ borderColor: colors.border }} placeholder="Main Title (Line 1)" value={form.mainTitleLine1} onChange={(e) => handleFormChange("mainTitleLine1", e.target.value)} />
              <input className={inputBaseClass} style={{ borderColor: colors.border }} placeholder="Main Title (Line 2 / Highlight)" value={form.mainTitleLine2} onChange={(e) => handleFormChange("mainTitleLine2", e.target.value)} />
              <textarea className={inputBaseClass} style={{ borderColor: colors.border }} rows={3} placeholder="Main Description" value={form.mainDescription} onChange={(e) => handleFormChange("mainDescription", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input type="date" className={inputBaseClass} style={{ borderColor: colors.border }} value={form.effectiveDate} onChange={(e) => handleFormChange("effectiveDate", e.target.value)} />
                <input type="date" className={inputBaseClass} style={{ borderColor: colors.border }} value={form.lastUpdated} onChange={(e) => handleFormChange("lastUpdated", e.target.value)} />
                <input className={inputBaseClass} style={{ borderColor: colors.border }} placeholder="Version" value={form.version} onChange={(e) => handleFormChange("version", e.target.value)} />
              </div>

              {policyTypeTab === "legal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    className={inputBaseClass}
                    style={{ borderColor: colors.border }}
                    placeholder="Last Modified Title"
                    value={form.lastModifiedTitle}
                    onChange={(e) => handleFormChange("lastModifiedTitle", e.target.value)}
                  />
                  <input
                    type="date"
                    className={inputBaseClass}
                    style={{ borderColor: colors.border }}
                    value={form.updatedDate}
                    onChange={(e) => handleFormChange("updatedDate", e.target.value)}
                  />
                  <textarea
                    className={inputBaseClass + " md:col-span-2"}
                    style={{ borderColor: colors.border }}
                    rows={3}
                    placeholder="Disclaimer Text"
                    value={form.disclaimerText}
                    onChange={(e) => handleFormChange("disclaimerText", e.target.value)}
                  />
                </div>
              )}

              {policyTypeTab === "legal" && (
                <div>
                  <label className={labelClass} style={{ color: colors.textPrimary }}>
                    Legal Disclaimer Document
                  </label>
                  <input
                    type="file"
                    className={inputBaseClass}
                    style={{ borderColor: colors.border }}
                    onChange={(e) => setLegalDocumentFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-[11px] mt-1" style={{ color: colors.textSecondary }}>
                    Uploading a new file will update the linked legal disclaimer document.
                  </p>
                </div>
              )}

              <div className="border rounded-xl p-3" style={{ borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.textPrimary }}>Sections</p>
                  <button type="button" onClick={addSectionRow} className={mutedButtonClass} style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}>
                    <Plus size={13} /> Add Section
                  </button>
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin">
                  {form.sections.map((section, index) => (
                    <div key={index} className="border rounded-lg p-2.5 space-y-1.5" style={{ borderColor: colors.border }}>
                      <input className="w-full border rounded-md px-2.5 py-1.5 text-xs" style={{ borderColor: colors.border }} placeholder="Title" value={section.title} onChange={(e) => handleSectionChange(index, "title", e.target.value)} />
                      <textarea className="w-full border rounded-md px-2.5 py-1.5 text-xs" style={{ borderColor: colors.border }} rows={2} placeholder="Description" value={section.description} onChange={(e) => handleSectionChange(index, "description", e.target.value)} />
                      <div className="grid grid-cols-1 gap-1.5">
                        <textarea className="border rounded-md px-2 py-1 text-xs" style={{ borderColor: colors.border }} rows={2} placeholder="Highlight text description" value={section.highlightTextDescription || ""} onChange={(e) => handleSectionChange(index, "highlightTextDescription", e.target.value)} />
                        <input type="number" disabled className="border rounded-md px-2 py-1 text-xs w-full max-w-[140px] bg-gray-100 cursor-not-allowed" style={{ borderColor: colors.border }} value={section.sequence} />
                        <label className="text-xs flex items-center gap-2 font-medium">
                          <input type="checkbox" checked={!!section.active} onChange={(e) => handleSectionChange(index, "active", e.target.checked)} /> Active
                        </label>
                      </div>
                      <button type="button" onClick={() => removeSectionRow(index)} className="text-[11px] font-medium text-red-600">Remove section</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button disabled={saving || uploadingDoc} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm disabled:opacity-70" style={{ backgroundColor: colors.primary }}>
                  <Save size={15} /> {saving || uploadingDoc ? "Saving..." : "Update Policy"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={mutedButtonClass}
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.textSecondary,
                    backgroundColor: colors.mainBg,
                  }}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
