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
  highlightText: "",
  active: true,
  sequence: 1,
};

const emptyForm = {
  mainTitle: "",
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
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingItem(null);
    setIsEditModalOpen(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
    setForm({
      mainTitle: item.mainTitle || "",
      effectiveDate: item.effectiveDate || "",
      lastUpdated: item.lastUpdated || "",
      version: item.version || "",
      sections:
        Array.isArray(item.sections) && item.sections.length
          ? item.sections.map((s, idx) => ({
              id: s.id,
              title: s.title || "",
              description: s.description || "",
              highlightText: s.highlightText || "",
              active: typeof s.active === "boolean" ? s.active : true,
              sequence: s.sequence || idx + 1,
            }))
          : [{ ...emptySection }],
    });
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
    try {
      setSaving(true);
      const payload = {
        mainTitle: form.mainTitle,
        effectiveDate: form.effectiveDate,
        lastUpdated: form.lastUpdated,
        version: form.version,
        ...policyTypeFlags,
        sections: form.sections.map((s, index) => ({
          title: s.title,
          description: s.description,
          highlightText: s.highlightText || null,
          active: typeof s.active === "boolean" ? s.active : true,
          sequence: Number(s.sequence || index + 1),
        })),
      };

      if (editingItem?.id) {
        await updatePolicyPage(editingItem.id, payload);
        showSuccess("Policy page updated");
      } else {
        await createPolicyPage(payload);
        showSuccess("Policy page created");
      }

      resetForm();
      fetchPolicies();
    } catch (error) {
      console.error(error);
      showError("Failed to save policy page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
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
        highlightText: section.highlightText || null,
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
        title: "New Section",
        description: "Add description",
        highlightText: null,
      });
      showSuccess("Section added");
      fetchPolicies();
    } catch (error) {
      console.error(error);
      showError("Failed to add section");
    }
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

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className={labelClass} style={{ color: colors.textPrimary }}>
                Main Title
              </label>
              <input className={inputBaseClass} style={{ borderColor: colors.border }} placeholder="Main Title" value={form.mainTitle} onChange={(e) => handleFormChange("mainTitle", e.target.value)} />
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
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <label className={labelClass} style={{ color: colors.textPrimary }}>
                          Highlight Text
                        </label>
                        <input className="border rounded-md px-2 py-1 text-xs w-full" style={{ borderColor: colors.border }} placeholder="Highlight text" value={section.highlightText || ""} onChange={(e) => handleSectionChange(index, "highlightText", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass} style={{ color: colors.textPrimary }}>
                          Sequence
                        </label>
                        <input type="number" className="border rounded-md px-2 py-1 text-xs w-full" style={{ borderColor: colors.border }} value={section.sequence} onChange={(e) => handleSectionChange(index, "sequence", e.target.value)} />
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

            <button disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm disabled:opacity-70" style={{ backgroundColor: colors.primary }}>
              <Save size={15} /> {saving ? "Saving..." : "Create Policy"}
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
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-xl p-3" style={{ borderColor: colors.border }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{item.mainTitle} <span className="text-xs font-medium">#{item.id}</span></p>
                      <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                        Effective: {item.effectiveDate} | Updated: {item.lastUpdated} | Version: {item.version}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded-md" style={{ backgroundColor: colors.mainBg }}><Edit size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="mt-2.5 flex gap-1.5 flex-wrap">
                    <button onClick={() => handleAddSectionToPolicy(item.id)} className={mutedButtonClass} style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}>+ Section</button>
                    <button onClick={() => handleQuickReorder(item)} className={mutedButtonClass} style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}>Sync Reorder</button>
                  </div>

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
                            <button
                              onClick={() => handleInlineSectionUpdate(section)}
                              className="text-[10px] px-2 py-1 rounded-md font-semibold border"
                              style={{
                                borderColor: colors.border,
                                backgroundColor: "#f3f4f6",
                                color: "#111827",
                              }}
                            >
                              Update
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px]" style={{ color: colors.textSecondary }}>{section.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
              <input className={inputBaseClass} style={{ borderColor: colors.border }} placeholder="Main Title" value={form.mainTitle} onChange={(e) => handleFormChange("mainTitle", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input type="date" className={inputBaseClass} style={{ borderColor: colors.border }} value={form.effectiveDate} onChange={(e) => handleFormChange("effectiveDate", e.target.value)} />
                <input type="date" className={inputBaseClass} style={{ borderColor: colors.border }} value={form.lastUpdated} onChange={(e) => handleFormChange("lastUpdated", e.target.value)} />
                <input className={inputBaseClass} style={{ borderColor: colors.border }} placeholder="Version" value={form.version} onChange={(e) => handleFormChange("version", e.target.value)} />
              </div>

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
                      <div className="grid grid-cols-3 gap-1">
                        <input className="border rounded-md px-2 py-1 text-xs" style={{ borderColor: colors.border }} placeholder="Highlight text" value={section.highlightText || ""} onChange={(e) => handleSectionChange(index, "highlightText", e.target.value)} />
                        <input type="number" className="border rounded-md px-2 py-1 text-xs" style={{ borderColor: colors.border }} value={section.sequence} onChange={(e) => handleSectionChange(index, "sequence", e.target.value)} />
                        <label className="text-xs flex items-center gap-2 px-2 font-medium">
                          <input type="checkbox" checked={!!section.active} onChange={(e) => handleSectionChange(index, "active", e.target.checked)} /> Active
                        </label>
                      </div>
                      <button type="button" onClick={() => removeSectionRow(index)} className="text-[11px] font-medium text-red-600">Remove section</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm disabled:opacity-70" style={{ backgroundColor: colors.primary }}>
                  <Save size={15} /> {saving ? "Saving..." : "Update Policy"}
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
