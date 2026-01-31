import React, { useState, useEffect } from "react";
import { X, Upload, Building2, MapPin, Star, Users, DollarSign, Tag, Plus, Sparkles, Image as ImageIcon, Loader2, Trash2, CheckCircle2, Link as LinkIcon, Info } from "lucide-react";
import { colors } from "@/lib/colors/colors";
import {
  getAllProperties,
  getPropertyTypes,
  getAllLocations,
  getUsersPaginated,
  createPropertyListing,
  createAmenityFeature,
  getAllAmenityFeatures,
  PropertyUploadMedia,
  createPropertyByType
} from "@/Api/Api";
import { toast } from "react-hot-toast";

function AddPropertyModal({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Base Property, 2: Listing Details, 3: Media
  const [createdPropertyListingId, setCreatedPropertyListingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- STEP 1: Parent Property State ---
  const [parentData, setParentData] = useState({
    propertyName: "",
    propertyTypeIds: "", // Used to get typeName and then passed in array
    propertyCategoryIds: [1],
    address: "",
    area: "",
    pincode: "",
    locationId: "",
    assignedAdminId: "",
    parentPropertyId: null,
    childPropertyIds: null,
    isActive: true
  });

  // --- STEP 2: Listing Details State ---
  const [listingData, setListingData] = useState({
    propertyId: "",
    assignedAdminId: "",
    propertyName: "",
    propertyType: "",
    city: "",
    mainHeading: "",
    subTitle: "",
    fullAddress: "",
    tagline: "",
    rating: null,
    capacity: null,
    price: "",
    amenitiesAndFeaturesIds: [],
    isActive: true
  });

  // --- STEP 3: Media States ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([""]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // --- Dropdown States ---
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [availableAmenities, setAvailableAmenities] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [typesRes, locationsRes, adminsRes, amenitiesRes] = await Promise.all([
        getPropertyTypes(),
        getAllLocations(),
        getUsersPaginated({ page: 1, size: 100 }),
        getAllAmenityFeatures()
      ]);

      setPropertyTypes(typesRes?.data || typesRes || []);
      setLocations(locationsRes?.data || locationsRes || []);
      setAdmins((adminsRes?.data?.content || adminsRes?.content || []).filter(u => u.roleName === "ROLE_ADMIN"));
      setAvailableAmenities((amenitiesRes?.data || amenitiesRes || []).filter(a => a.isActive));
    } catch (err) {
      toast.error("Failed to load initial data");
    }
  };

  // --- Handle Step 1: Create Base Property ---
  const handleParentSubmit = async (e) => {
    e.preventDefault();
    
    const selectedTypeObj = propertyTypes.find(t => t.id.toString() === parentData.propertyTypeIds.toString());
    
    if (!parentData.propertyName || !selectedTypeObj || !parentData.locationId) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      // API Format: createPropertyByType(typeName, data)
      const typeName = selectedTypeObj.typeName; 
      const payload = {
        propertyName: parentData.propertyName,
        propertyTypeIds: [parseInt(parentData.propertyTypeIds)],
        propertyCategoryIds: parentData.propertyCategoryIds,
        address: parentData.address,
        area: parentData.area,
        pincode: parentData.pincode,
        locationId: parseInt(parentData.locationId),
        assignedAdminId: parseInt(parentData.assignedAdminId),
        parentPropertyId: null,
        childPropertyIds: null,
        isActive: true
      };

      const res = await createPropertyByType(typeName, payload);
      const newBaseProperty = res?.data || res;
      
      toast.success(`${typeName} Property Created!`);

      // AUTO-POPULATE Step 2
      const selectedLoc = locations.find(l => l.id.toString() === parentData.locationId.toString());

      setListingData(prev => ({
        ...prev,
        propertyId: newBaseProperty.id,
        propertyName: parentData.propertyName,
        assignedAdminId: parentData.assignedAdminId,
        fullAddress: parentData.address,
        city: selectedLoc?.locationName || "",
        propertyType: typeName,
        mainHeading: parentData.propertyName
      }));

      setCurrentStep(2);
    } catch (err) {
      toast.error("Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Step 2: Create Listing ---
  const handleListingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...listingData,
        propertyId: parseInt(listingData.propertyId),
        assignedAdminId: parseInt(listingData.assignedAdminId),
        price: parseFloat(listingData.price),
        rating: listingData.rating ? parseFloat(listingData.rating) : null,
        capacity: listingData.capacity ? parseInt(listingData.capacity) : null,
      };

      const response = await createPropertyListing(payload);
      setCreatedPropertyListingId(response?.data?.id || response?.id);
      
      toast.success("Listing details saved");
      setCurrentStep(3);
    } catch (err) {
      toast.error("Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  // --- Media Upload Logic (Step 3) ---
  const handleMediaUpload = async () => {
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('propertyListingId', createdPropertyListingId);
      formData.append('mediaType', 'IMAGE');
      selectedFiles.forEach(file => formData.append('files', file));

      await PropertyUploadMedia(formData);
      toast.success("Setup Complete!");
      onSuccess();
    } catch (err) {
      toast.error("Media upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: colors.contentBg }}>
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-white">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {currentStep === 1 ? "1. Create Base Property" : currentStep === 2 ? "2. Add Listing Details" : "3. Upload Media"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {/* Step Indicator */}
        <div className="flex border-b bg-gray-50">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`flex-1 text-center py-3 text-xs font-bold uppercase tracking-widest ${currentStep === step ? 'border-b-2 text-primary bg-white' : 'text-gray-400'}`} style={{ borderBottomColor: currentStep === step ? colors.primary : 'transparent', color: currentStep === step ? colors.primary : '' }}>
              Step {step}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <form onSubmit={handleParentSubmit} className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Property Name *</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" value={parentData.propertyName} onChange={e => setParentData({...parentData, propertyName: e.target.value})} placeholder="Grand Palace" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Property Type *</label>
                <select className="w-full px-4 py-2 border rounded-lg" value={parentData.propertyTypeIds} onChange={e => setParentData({...parentData, propertyTypeIds: e.target.value})}>
                  <option value="">Select Type</option>
                  {propertyTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Location *</label>
                <select className="w-full px-4 py-2 border rounded-lg" value={parentData.locationId} onChange={e => setParentData({...parentData, locationId: e.target.value})}>
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.locationName}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Address</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" value={parentData.address} onChange={e => setParentData({...parentData, address: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Area</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" value={parentData.area} onChange={e => setParentData({...parentData, area: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Pincode</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" value={parentData.pincode} onChange={e => setParentData({...parentData, pincode: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Admin</label>
                <select className="w-full px-4 py-2 border rounded-lg" value={parentData.assignedAdminId} onChange={e => setParentData({...parentData, assignedAdminId: e.target.value})}>
                  <option value="">Select Admin</option>
                  {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2" style={{ backgroundColor: colors.primary }}>
                  {loading ? <Loader2 className="animate-spin" /> : "Create Property & Next"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <form onSubmit={handleListingSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                  <Info className="text-blue-500" size={20} />
                  <p className="text-xs text-blue-700">Property Details linked. Now add listing specifics.</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Main Heading *</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg" value={listingData.mainHeading} onChange={e => setListingData({...listingData, mainHeading: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tagline *</label>
                  <textarea className="w-full px-4 py-2 border rounded-lg h-20 resize-none" value={listingData.tagline} onChange={e => setListingData({...listingData, tagline: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Price *</label>
                     <input type="number" className="w-full px-4 py-2 border rounded-lg" value={listingData.price} onChange={e => setListingData({...listingData, price: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Rating</label>
                     <input type="number" step="0.1" className="w-full px-4 py-2 border rounded-lg" value={listingData.rating || ""} onChange={e => setListingData({...listingData, rating: e.target.value})} />
                   </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <label className="text-xs font-bold uppercase text-gray-500 mb-4 block">Amenities</label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                   {availableAmenities.map(a => (
                     <button type="button" key={a.id} onClick={() => {
                        const ids = listingData.amenitiesAndFeaturesIds.includes(a.id) 
                            ? listingData.amenitiesAndFeaturesIds.filter(id => id !== a.id)
                            : [...listingData.amenitiesAndFeaturesIds, a.id];
                        setListingData({...listingData, amenitiesAndFeaturesIds: ids});
                     }} className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${listingData.amenitiesAndFeaturesIds.includes(a.id) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`} style={listingData.amenitiesAndFeaturesIds.includes(a.id) ? { backgroundColor: colors.primary } : {}}>
                       {a.name}
                     </button>
                   ))}
                </div>
              </div>

              <div className="col-span-2 flex justify-end mt-4 pt-6 border-t">
                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2" style={{ backgroundColor: colors.primary }}>
                   {loading ? <Loader2 className="animate-spin" /> : "Next: Media"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer" onClick={() => document.getElementById('media-inp').click()}>
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm font-bold text-gray-600">Select Media for Listing #{createdPropertyListingId}</p>
                  <input id="media-inp" type="file" multiple className="hidden" onChange={e => setSelectedFiles(Array.from(e.target.files))} />
               </div>
               <div className="flex justify-end gap-3 mt-8">
                  <button onClick={handleMediaUpload} disabled={uploadingMedia} className="px-8 py-2 bg-primary text-white font-bold rounded-lg" style={{ backgroundColor: colors.primary }}>
                    {uploadingMedia ? "Uploading..." : "Finish Setup"}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddPropertyModal;