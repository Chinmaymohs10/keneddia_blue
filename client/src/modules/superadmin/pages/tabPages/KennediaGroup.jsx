import React, { useState, useEffect, useCallback } from "react";
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createOrUpdateKennediaGroup, getKennediaGroup } from "@/Api/Api";
import { toast } from "react-hot-toast";

function KennediaGroup() {
  const [headerSettings, setHeaderSettings] = useState({
    mainTitle: "",
    subTitle: "",
  });

  const [centerLogoSettings, setCenterLogoSettings] = useState({
    logoText: "",
    logoSubText: "",
  });

  const [businessDivisions, setBusinessDivisions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingData, setExistingData] = useState(null);

  // Fetch Kennedia Group data
  const fetchKennediaGroup = useCallback(async () => {
    try {
      setFetching(true);
      const response = await getKennediaGroup();

      if (response.data) {
        // Handle both single object and array responses
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (data) {
          setExistingData(data);

          // Populate header settings
          setHeaderSettings({
            mainTitle: data.mainTitle || "",
            subTitle: data.subTitle || "",
          });

          // Populate center logo settings
          setCenterLogoSettings({
            logoText: data.logoText || "",
            logoSubText: data.logoSubText || "",
          });

          // Populate business divisions
          if (data.divisions && Array.isArray(data.divisions)) {
            setBusinessDivisions(
              data.divisions.map((div) => ({
                id: div.id || Date.now() + Math.random(),
                icon: div.icon || "",
                title: div.title || "",
                description: div.description || "",
                displayOrder: div.displayOrder || 1,
                isExisting: true,
              })),
            );
          }

          console.log("Kennedia Group Data:", data);
        }
      } else {
        // Set default values if no data
        setHeaderSettings({
          mainTitle: "Kennedia Group",
          subTitle: "A Diverse ecosystem of luxury hospitality brands",
        });

        setCenterLogoSettings({
          logoText: "KB",
          logoSubText: "Group",
        });
      }
    } catch (error) {
      console.error("Error fetching Kennedia Group:", error);
      // Don't show error toast on initial load if no data exists
      if (error.response?.status !== 404) {
        toast.error("Failed to load Kennedia Group data");
      }

      // Set default values on error
      setHeaderSettings({
        mainTitle: "Kennedia Group",
        subTitle: "A Diverse ecosystem of luxury hospitality brands",
      });

      setCenterLogoSettings({
        logoText: "KB",
        logoSubText: "Group",
      });
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchKennediaGroup();
  }, []);

  const handleAddDivision = () => {
    if (businessDivisions.length >= 5) {
      toast.error("You can only add up to 5 business divisions");
      return;
    }
    const newDivision = {
      id: Date.now(),
      icon: "",
      title: "",
      description: "",
      displayOrder: businessDivisions.length + 1,
      isExisting: false,
    };
    setBusinessDivisions([...businessDivisions, newDivision]);
  };

  const handleDeleteDivision = (id) => {
    setBusinessDivisions(businessDivisions.filter((d) => d.id !== id));
  };

  const handleDivisionChange = (id, field, value) => {
    setBusinessDivisions(
      businessDivisions.map((d) =>
        d.id === id ? { ...d, [field]: value } : d,
      ),
    );
  };

  const handleMoveDivision = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === businessDivisions.length - 1)
    ) {
      return;
    }

    const newDivisions = [...businessDivisions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap divisions
    [newDivisions[index], newDivisions[targetIndex]] = [
      newDivisions[targetIndex],
      newDivisions[index],
    ];

    // Update display orders
    newDivisions.forEach((div, idx) => {
      div.displayOrder = idx + 1;
    });

    setBusinessDivisions(newDivisions);
  };

  const handleSubmit = async () => {
    // Validation
    if (!headerSettings.mainTitle.trim()) {
      toast.error("Main title is required");
      return;
    }
    if (!headerSettings.subTitle.trim()) {
      toast.error("Subtitle is required");
      return;
    }
    if (!centerLogoSettings.logoText.trim()) {
      toast.error("Logo text is required");
      return;
    }
    if (!centerLogoSettings.logoSubText.trim()) {
      toast.error("Logo subtext is required");
      return;
    }

    // Validate divisions
    if (businessDivisions.length === 0) {
      toast.error("At least one business division is required");
      return;
    }

    for (const division of businessDivisions) {
      if (!division.icon.trim()) {
        toast.error("All divisions must have an icon");
        return;
      }
      if (!division.title.trim()) {
        toast.error("All divisions must have a title");
        return;
      }
      if (!division.description.trim()) {
        toast.error("All divisions must have a description");
        return;
      }
    }

    try {
      setLoading(true);

      // Prepare payload
      const payload = {
        mainTitle: headerSettings.mainTitle,
        subTitle: headerSettings.subTitle,
        logoText: centerLogoSettings.logoText,
        logoSubText: centerLogoSettings.logoSubText,
        divisions: businessDivisions.map((div) => ({
          icon: div.icon,
          title: div.title,
          description: div.description,
          displayOrder: div.displayOrder,
        })),
      };

      const response = await createOrUpdateKennediaGroup(payload);

      toast.success("Kennedia Group saved successfully!");
      console.log("Response:", response.data);

      // Refresh data after successful save
      await fetchKennediaGroup();
    } catch (error) {
      console.error("Error saving Kennedia Group:", error);
      toast.error(
        error.response?.data?.message || "Failed to save Kennedia Group",
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching
  if (fetching) {
    return (
      <div
        className="rounded-lg p-6 shadow-sm flex items-center justify-center h-[400px]"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: colors.primary }}
          />
          <p style={{ color: colors.textSecondary }}>
            Loading Kennedia Group data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Settings */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: colors.textPrimary }}
        >
          Header Settings
        </h3>

        <div className="space-y-3">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Main Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={headerSettings.mainTitle}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  mainTitle: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
                color: colors.textPrimary,
              }}
              placeholder="Kennedia Group"
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Subtitle <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={headerSettings.subTitle}
              onChange={(e) =>
                setHeaderSettings({
                  ...headerSettings,
                  subTitle: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
                color: colors.textPrimary,
              }}
              placeholder="A Diverse ecosystem of luxury hospitality brands"
            />
          </div>
        </div>
      </div>

      {/* Center Logo Settings */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: colors.textPrimary }}
        >
          Center Logo Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Logo Text <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={centerLogoSettings.logoText}
              onChange={(e) =>
                setCenterLogoSettings({
                  ...centerLogoSettings,
                  logoText: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
                color: colors.textPrimary,
              }}
              placeholder="KB"
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Logo Subtext <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={centerLogoSettings.logoSubText}
              onChange={(e) =>
                setCenterLogoSettings({
                  ...centerLogoSettings,
                  logoSubText: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
                color: colors.textPrimary,
              }}
              placeholder="Group"
            />
          </div>
        </div>
      </div>

      {/* Business Divisions */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-sm font-semibold m-0"
            style={{ color: colors.textPrimary }}
          >
            Business Divisions
          </h3>
          <button
            onClick={handleAddDivision}
            disabled={businessDivisions.length >= 5}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: "#ffffff",
            }}
          >
            <Plus size={16} />
            Add Division
          </button>
        </div>

        {businessDivisions.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: colors.textSecondary }}
          >
            No divisions added yet. Click "Add Division" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {businessDivisions.map((division, index) => (
              <div
                key={division.id}
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: colors.mainBg,
                  borderColor: colors.border,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Icon <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={division.icon}
                      onChange={(e) =>
                        handleDivisionChange(
                          division.id,
                          "icon",
                          e.target.value,
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded border text-sm"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                        color: colors.textPrimary,
                      }}
                      placeholder="HOTEL"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Title <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={division.title}
                      onChange={(e) =>
                        handleDivisionChange(
                          division.id,
                          "title",
                          e.target.value,
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded border text-sm"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                        color: colors.textPrimary,
                      }}
                      placeholder="Hotels & Resorts"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Description <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={division.description}
                      onChange={(e) =>
                        handleDivisionChange(
                          division.id,
                          "description",
                          e.target.value,
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded border text-sm"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                        color: colors.textPrimary,
                      }}
                      placeholder="Luxury stays globally"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={division.displayOrder}
                      onChange={(e) =>
                        handleDivisionChange(
                          division.id,
                          "displayOrder",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded border text-sm"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                        color: colors.textPrimary,
                      }}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <div
                  className="flex items-center justify-between mt-3 pt-3 border-t"
                  style={{ borderColor: colors.border }}
                >
                  {/* Reorder buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveDivision(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                      }}
                      title="Move up"
                    >
                      <ChevronLeft
                        size={16}
                        style={{ color: colors.textSecondary }}
                      />
                    </button>
                    <button
                      onClick={() => handleMoveDivision(index, "down")}
                      disabled={index === businessDivisions.length - 1}
                      className="p-1.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                      }}
                      title="Move down"
                    >
                      <ChevronRight
                        size={16}
                        style={{ color: colors.textSecondary }}
                      />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteDivision(division.id)}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: colors.danger,
                      color: "#ffffff",
                    }}
                  >
                    <Trash2 size={14} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border-none rounded-md text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: colors.primary,
            color: colors.sidebarText,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = colors.primary;
            }
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>
              {existingData ? "Update Kennedia Group" : "Save Kennedia Group"}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default KennediaGroup;
