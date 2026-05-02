import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Building2,
  MapPin,
  Star,
  Users,
  DollarSign,
  Tag,
  Plus,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Trash2,
  CheckCircle2,
  Link as LinkIcon,
  Info,
  ChevronRight,
  Save,
} from "lucide-react";
import { colors } from "@/lib/colors/colors";
import {
  getPropertyTypes,
  getAllLocations,
  getUsersPaginated,
  createPropertyListing,
  getAllAmenityFeatures,
  PropertyUploadMedia,
  createPropertyByType,
  PropertyListingAddMedia
} from "@/Api/Api";
import { toast } from "react-hot-toast";

function AddPropertyModal({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationInputMode, setLocationInputMode] = useState("coordinates");
  const [errors, setErrors] = useState({});

  // --- STEP 1: Parent Property State ---
  const [parentData, setParentData] = useState({
    propertyName: "",
    propertyTypeIds: "",
    propertyRating: "",
    propertyCategoryIds: [],
    address: "",
    addressUrl: null,
    area: "",
    pincode: "",
    locationId: "",
    assignedAdminId: "",
    latitude: "",
    longitude: "",
    bookingEngineUrl: "",
    parentPropertyId: null,
    childPropertyIds: null,
    isActive: true,
    dineIn: false,
    takeaway: false,
    mobileNumber: "",
    email: "",

    // ✅ NEW FIELD
    nearbyLocations: [
      {
        nearbyLocationName: "",
        googleMapLink: "",
      },
    ],
  });

  // --- STEP 2: Listing Details State ---
  const [listingData, setListingData] = useState({
    mainHeading: "",
    subTitle: "",
    fullAddress: "",
    tagline: "",
    rating: "", // Updated from null to empty string for input handling
    capacity: "", // Updated from null to empty string for input handling
    price: "",
    gstPercentage: "", // Added
    discountAmount: "", // Added
    // amenitiesAndFeaturesIds: [],
    isActive: true,
  });

  // --- STEP 3: Media States ---
  const [selectedFiles, setSelectedFiles] = useState([]);

  // --- Dropdown States ---
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [availableAmenities, setAvailableAmenities] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);
  const handleNearbyChange = (index, field, value) => {
    const updated = [...parentData.nearbyLocations];
    updated[index][field] = value;

    setParentData({
      ...parentData,
      nearbyLocations: updated,
    });
  };

  const addNearbyLocation = () => {
    setParentData({
      ...parentData,
      nearbyLocations: [
        ...parentData.nearbyLocations,
        { nearbyLocationName: "", googleMapLink: "" },
      ],
    });
  };

  const removeNearbyLocation = (index) => {
    const updated = parentData.nearbyLocations.filter((_, i) => i !== index);
    setParentData({
      ...parentData,
      nearbyLocations: updated,
    });
  };

  const fetchDropdownData = async () => {
    try {
      const [typesRes, locationsRes, adminsRes, amenitiesRes] =
        await Promise.all([
          getPropertyTypes(),
          getAllLocations(),
          getUsersPaginated({ page: 1, size: 100 }),
          getAllAmenityFeatures(),
        ]);

      setPropertyTypes(typesRes?.data || typesRes || []);
      setLocations(locationsRes?.data || locationsRes || []);
      setAdmins(
        (adminsRes?.data?.content || adminsRes?.content || []).filter(
          (u) => u.roleName === "ROLE_ADMIN",
        ),
      );
      setAvailableAmenities(
        (amenitiesRes?.data || amenitiesRes || []).filter((a) => a.isActive),
      );
    } catch (err) {
      toast.error("Failed to load initial data");
    }
  };

  const selectedPropertyTypeName = propertyTypes.find(
    (type) => String(type.id) === String(parentData.propertyTypeIds),
  )?.typeName;

  const isRestaurantType =
    String(selectedPropertyTypeName || "").trim().toLowerCase() ===
    "restaurant";
  const isHotelType =
    String(selectedPropertyTypeName || "").trim().toLowerCase() === "hotel";

  const handleLocationModeChange = (mode) => {
    setLocationInputMode(mode);
    setParentData((prev) => ({
      ...prev,
      addressUrl: mode === "addressUrl" ? prev.addressUrl : null,
      latitude: mode === "coordinates" ? prev.latitude : "",
      longitude: mode === "coordinates" ? prev.longitude : "",
    }));
  };

  const handleFinalSubmit = async () => {
    let hasErrors = false;
    let stepToFocus = 0;
    const newErrors = { ...errors };

    // Validate Step 1 Mandatory Fields
    if (!parentData.propertyName) { newErrors.propertyName = "Property Name is required"; hasErrors = true; stepToFocus = stepToFocus || 1; }
    if (!parentData.propertyTypeIds) { newErrors.propertyTypeIds = "Property Type is required"; hasErrors = true; stepToFocus = stepToFocus || 1; }
    if (!parentData.locationId) { newErrors.locationId = "Location is required"; hasErrors = true; stepToFocus = stepToFocus || 1; }

    if (locationInputMode === "coordinates") {
      if (!parentData.latitude) { newErrors.latitude = "Latitude is required"; hasErrors = true; stepToFocus = stepToFocus || 1; }
      if (!parentData.longitude) { newErrors.longitude = "Longitude is required"; hasErrors = true; stepToFocus = stepToFocus || 1; }
    } else {
      if (!parentData.addressUrl) { newErrors.addressUrl = "Address URL is required"; hasErrors = true; stepToFocus = stepToFocus || 1; }
    }

    // Validate Step 2 Mandatory Fields
    if (!listingData.mainHeading) { newErrors.mainHeading = "Listing Description is required"; hasErrors = true; stepToFocus = stepToFocus || 2; }

    // Preserve existing format errors
    if (errors.propertyName && errors.propertyName !== "Property Name is required" && errors.propertyName !== "Name should not contain numbers or special characters") {
      // already caught by format check
      hasErrors = true;
      stepToFocus = stepToFocus || 1;
    } else if (errors.propertyName === "Name should not contain numbers or special characters") {
      hasErrors = true;
      stepToFocus = stepToFocus || 1;
    }
    if (errors.mobileNumber) { hasErrors = true; stepToFocus = stepToFocus || 1; }
    if (errors.email) { hasErrors = true; stepToFocus = stepToFocus || 1; }

    if (hasErrors) {
      setErrors(newErrors);
      setCurrentStep(stepToFocus || 1);
      return toast.error(`Please fix the validation errors in Step ${stepToFocus || 1}`);
    }

    setLoading(true);
    const toastId = toast.loading("Processing full property setup...");

    try {
      // PHASE 1: Create Base Property
      const selectedTypeObj = propertyTypes.find(
        (t) => t.id.toString() === parentData.propertyTypeIds.toString(),
      );
      const typeName = selectedTypeObj.typeName;

      const parentPayload = {
        ...parentData,
        propertyTypeIds: [parseInt(parentData.propertyTypeIds)],
        propertyRating:
          isHotelType && parentData.propertyRating !== ""
            ? Number(parentData.propertyRating)
            : null,
        locationId: parseInt(parentData.locationId),
        assignedAdminId: parseInt(parentData.assignedAdminId),
        addressUrl:
          locationInputMode === "addressUrl" ? parentData.addressUrl : null,
        latitude:
          locationInputMode === "coordinates" && parentData.latitude
            ? parseFloat(parentData.latitude)
            : null,
        longitude:
          locationInputMode === "coordinates" && parentData.longitude
            ? parseFloat(parentData.longitude)
            : null,

        // ✅ CLEAN EMPTY LOCATIONS
        nearbyLocations: parentData.nearbyLocations.filter(
          (loc) => loc.nearbyLocationName.trim() !== "",
        ),
        dineIn: Boolean(parentData.dineIn),
        takeaway: Boolean(parentData.takeaway),
      };

      const parentRes = await createPropertyByType(typeName, parentPayload);
      const newBasePropertyId = parentRes?.data?.id || parentRes?.id;

      // PHASE 2: Create Listing
      const listingPayload = {
        ...listingData,
        propertyId: newBasePropertyId,
        assignedAdminId: parseInt(parentData.assignedAdminId),
        price: listingData.price ? parseFloat(listingData.price) : 0,
        rating: listingData.rating ? parseFloat(listingData.rating) : null,
        capacity: listingData.capacity ? parseInt(listingData.capacity) : null,
        gstPercentage: listingData.gstPercentage
          ? parseFloat(listingData.gstPercentage)
          : 0,
        discountAmount: listingData.discountAmount
          ? parseFloat(listingData.discountAmount)
          : 0,
      };

      const listingRes = await createPropertyListing(listingPayload);
      const newListingId = listingRes?.data?.id || listingRes?.id;

      // PHASE 3: Upload Media
      if (selectedFiles.length > 0) {
        const mediaFormData = new FormData();
        mediaFormData.append("mediaType", "IMAGE");
        mediaFormData.append("propertyListingId", newListingId);
        selectedFiles.forEach((file) => mediaFormData.append("files", file));

        await PropertyUploadMedia(mediaFormData);
      }

      toast.success("Setup Complete!", { id: toastId });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Process failed during step completion", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Add Property Portfolio
            </h2>
            <p className="text-xs text-gray-500">
              Fill all details across tabs before submitting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* CLICKABLE TABS */}
        <div className="flex px-6 bg-gray-50 border-b">
          {[
            { id: 1, label: "Base Info", icon: <Building2 size={16} /> },
            { id: 2, label: "Listing Details", icon: <Sparkles size={16} /> },
            { id: 3, label: "Gallery", icon: <ImageIcon size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentStep(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${currentStep === tab.id
                  ? "border-primary text-primary bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              style={{
                borderBottomColor:
                  currentStep === tab.id ? colors.primary : "transparent",
                color: currentStep === tab.id ? colors.primary : "",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* STEP 1: BASE PROPERTY */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Property Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.propertyName ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                  value={parentData.propertyName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setParentData({
                      ...parentData,
                      propertyName: value,
                    });
                    if (value && !/^[a-zA-Z\s]*$/.test(value)) {
                      setErrors((prev) => ({ ...prev, propertyName: "Name should not contain numbers or special characters" }));
                    } else {
                      setErrors((prev) => ({ ...prev, propertyName: "" }));
                    }
                  }}
                  placeholder="Grand Palace"
                />
                {errors.propertyName && <p className="text-red-500 text-xs mt-1">{errors.propertyName}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.propertyTypeIds ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                  value={parentData.propertyTypeIds}
                  onChange={(e) => {
                    setParentData({
                      ...parentData,
                      propertyTypeIds: e.target.value,
                    });
                    if (e.target.value) setErrors((prev) => ({ ...prev, propertyTypeIds: "" }));
                  }}
                >
                  <option value="">Select Type</option>
                  {propertyTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.typeName}
                    </option>
                  ))}
                </select>
                {errors.propertyTypeIds && <p className="text-red-500 text-xs mt-1">{errors.propertyTypeIds}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.locationId ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                  value={parentData.locationId}
                  onChange={(e) => {
                    setParentData({ ...parentData, locationId: e.target.value });
                    if (e.target.value) setErrors((prev) => ({ ...prev, locationId: "" }));
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.locationName}
                    </option>
                  ))}
                </select>
                {errors.locationId && <p className="text-red-500 text-xs mt-1">{errors.locationId}</p>}
              </div>
              {isHotelType && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                    Property Star Rating
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border rounded-xl"
                    value={parentData.propertyRating}
                    onChange={(e) =>
                      setParentData({
                        ...parentData,
                        propertyRating: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Star Rating</option>
                    {[3, 4, 5].map((star) => (
                      <option key={star} value={star}>
                        {star} Star
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {isRestaurantType && (
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">
                    Restaurant Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "dineIn", label: "Dine In" },
                      { key: "takeaway", label: "Takeaway" },
                    ].map((option) => (
                      <label
                        key={option.key}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(parentData[option.key])}
                          onChange={(e) =>
                            setParentData((prev) => ({
                              ...prev,
                              [option.key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">
                  Main Location Input
                </label>
                <div className="grid grid-cols-2 gap-3 rounded-xl border p-1 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => handleLocationModeChange("coordinates")}
                    className={`rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${locationInputMode === "coordinates"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500"
                      }`}
                    style={{
                      color:
                        locationInputMode === "coordinates"
                          ? colors.primary
                          : undefined,
                    }}
                  >
                    Latitude / Longitude
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationModeChange("addressUrl")}
                    className={`rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${locationInputMode === "addressUrl"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500"
                      }`}
                    style={{
                      color:
                        locationInputMode === "addressUrl"
                          ? colors.primary
                          : undefined,
                    }}
                  >
                    Address URL
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={parentData.address}
                  onChange={(e) =>
                    setParentData({ ...parentData, address: e.target.value })
                  }
                />
              </div>
              {locationInputMode === "addressUrl" ? (
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                    Main Address URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.addressUrl ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                    value={parentData.addressUrl ?? ""}
                    onChange={(e) => {
                      setParentData({
                        ...parentData,
                        addressUrl: e.target.value || null,
                      });
                      if (e.target.value) setErrors((prev) => ({ ...prev, addressUrl: "" }));
                    }}
                    placeholder="https://maps.google.com/..."
                  />
                  {errors.addressUrl && <p className="text-red-500 text-xs mt-1">{errors.addressUrl}</p>}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.latitude ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                      value={parentData.latitude}
                      onChange={(e) => {
                        setParentData({
                          ...parentData,
                          latitude: e.target.value,
                        });
                        if (e.target.value) setErrors((prev) => ({ ...prev, latitude: "" }));
                      }}
                      placeholder="e.g. 28.6139"
                    />
                    {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.longitude ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                      value={parentData.longitude}
                      onChange={(e) => {
                        setParentData({
                          ...parentData,
                          longitude: e.target.value,
                        });
                        if (e.target.value) setErrors((prev) => ({ ...prev, longitude: "" }));
                      }}
                      placeholder="e.g. 77.2090"
                    />
                    {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
                  </div>
                </>
              )}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.mobileNumber ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                  value={parentData.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setParentData({
                        ...parentData,
                        mobileNumber: value,
                      });
                      if (value && value.length !== 10) {
                        setErrors((prev) => ({ ...prev, mobileNumber: "Mobile number must be exactly 10 digits" }));
                      } else {
                        setErrors((prev) => ({ ...prev, mobileNumber: "" }));
                      }
                    }
                  }}
                  maxLength="10"
                  placeholder="9090800700"
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Email
                </label>

                <input
                  type="email"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.email ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                  value={parentData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setParentData({
                      ...parentData,
                      email: value,
                    });
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (value && !emailRegex.test(value)) {
                      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
                    } else {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="hello@gmail.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Booking Engine URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={parentData.bookingEngineUrl}
                  onChange={(e) =>
                    setParentData({
                      ...parentData,
                      bookingEngineUrl: e.target.value,
                    })
                  }
                  placeholder="https://book.example.com/property"
                />
              </div>
              <div className="col-span-2 mt-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">
                  Nearby Locations
                </label>

                <div className="space-y-4">
                  {parentData.nearbyLocations.map((location, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-4 items-center border p-4 rounded-xl bg-gray-50"
                    >
                      <input
                        type="text"
                        placeholder="Nearby Location Name"
                        className="px-4 py-2.5 border rounded-xl"
                        value={location.nearbyLocationName}
                        onChange={(e) =>
                          handleNearbyChange(
                            index,
                            "nearbyLocationName",
                            e.target.value,
                          )
                        }
                      />

                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Google Map Link (optional)"
                          className="flex-1 px-4 py-2.5 border rounded-xl"
                          value={location.googleMapLink}
                          onChange={(e) =>
                            handleNearbyChange(
                              index,
                              "googleMapLink",
                              e.target.value,
                            )
                          }
                        />

                        {parentData.nearbyLocations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNearbyLocation(index)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addNearbyLocation}
                    className="flex items-center gap-2 text-xs font-bold text-primary"
                  >
                    <Plus size={14} /> Add Another Location
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Admin
                </label>
                <select
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={parentData.assignedAdminId}
                  onChange={(e) =>
                    setParentData({
                      ...parentData,
                      assignedAdminId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Admin</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: LISTING DETAILS */}
          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Listing Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none ${errors.mainHeading ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                  value={listingData.mainHeading}
                  onChange={(e) => {
                    setListingData({
                      ...listingData,
                      mainHeading: e.target.value,
                    });
                    if (e.target.value) setErrors((prev) => ({ ...prev, mainHeading: "" }));
                  }}
                  placeholder="Exclusive Suite at Grand Palace"
                />
                {errors.mainHeading && <p className="text-red-500 text-xs mt-1">{errors.mainHeading}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Tagline
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={listingData.tagline}
                  onChange={(e) =>
                    setListingData({ ...listingData, tagline: e.target.value })
                  }
                  placeholder="Experience luxury like never before"
                />
              </div>
              {/* NEW FIELDS STEP 2 */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Price (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={listingData.price}
                  onChange={(e) =>
                    setListingData({ ...listingData, price: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  GST (%)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={listingData.gstPercentage}
                  onChange={(e) =>
                    setListingData({
                      ...listingData,
                      gstPercentage: e.target.value,
                    })
                  }
                  placeholder="18"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={listingData.discountAmount}
                  onChange={(e) =>
                    setListingData({
                      ...listingData,
                      discountAmount: e.target.value,
                    })
                  }
                  placeholder="500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="5"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={listingData.rating}
                  onChange={(e) =>
                    setListingData({ ...listingData, rating: e.target.value })
                  }
                  placeholder="4.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Capacity (Guests)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border rounded-xl"
                  value={listingData.capacity}
                  onChange={(e) =>
                    setListingData({ ...listingData, capacity: e.target.value })
                  }
                  placeholder="2"
                />
              </div>
            </div>
          )}

          {/* STEP 3: MEDIA */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div
                className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center hover:bg-gray-50 transition-all cursor-pointer"
                onClick={() => document.getElementById("media-inp").click()}
              >
                <Upload size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-sm font-bold text-gray-600">
                  Drag or Click to select photos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Files selected: {selectedFiles.length}
                </p>
                <input
                  id="media-inp"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 flex items-center gap-2"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-white flex justify-between items-center">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl disabled:opacity-30"
          >
            Previous
          </button>

          <div className="flex gap-3">
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-8 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-10 py-2.5 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                style={{ backgroundColor: colors.primary }}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Submit All Details
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPropertyModal;
