import React, { useState, useEffect } from "react";
import { X, Upload, Building2, MapPin, Star, Users, DollarSign, Tag, Plus, Sparkles, Image as ImageIcon, Loader2, Trash2, CheckCircle2, Link as LinkIcon, Info, ChevronRight, Save } from "lucide-react";
import { colors } from "@/lib/colors/colors";
import {
  getPropertyTypes,
  getAllLocations,
  getUsersPaginated,
  createPropertyListing,
  getAllAmenityFeatures,
  PropertyUploadMedia,
  createPropertyByType
} from "@/Api/Api";
import { toast } from "react-hot-toast";

function AddPropertyModal({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- STEP 1: Parent Property State ---
  const [parentData, setParentData] = useState({
    propertyName: "",
    propertyTypeIds: "",
    propertyCategoryIds: [],
    address: "",
    area: "",
    pincode: "",
    locationId: "",
    assignedAdminId: "",
    latitude: "", // Added
    longitude: "", // Added
    parentPropertyId: null,
    childPropertyIds: null,
    isActive: true
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
    isActive: true
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

  const handleFinalSubmit = async () => {
    if (!parentData.propertyName || !parentData.propertyTypeIds || !parentData.locationId) {
      setCurrentStep(1);
      return toast.error("Please complete the required fields in Step 1");
    }
    if (!listingData.mainHeading || !listingData.price) {
      setCurrentStep(2);
      return toast.error("Please complete the required fields in Step 2");
    }

    setLoading(true);
    const toastId = toast.loading("Processing full property setup...");

    try {
      // PHASE 1: Create Base Property
      const selectedTypeObj = propertyTypes.find(t => t.id.toString() === parentData.propertyTypeIds.toString());
      const typeName = selectedTypeObj.typeName;
      
      const parentPayload = {
        ...parentData,
        propertyTypeIds: [parseInt(parentData.propertyTypeIds)],
        locationId: parseInt(parentData.locationId),
        assignedAdminId: parseInt(parentData.assignedAdminId),
        latitude: parentData.latitude ? parseFloat(parentData.latitude) : null,
        longitude: parentData.longitude ? parseFloat(parentData.longitude) : null,
      };

      const parentRes = await createPropertyByType(typeName, parentPayload);
      const newBasePropertyId = parentRes?.data?.id || parentRes?.id;

      // PHASE 2: Create Listing
      const listingPayload = {
        ...listingData,
        propertyId: newBasePropertyId,
        assignedAdminId: parseInt(parentData.assignedAdminId),
        price: parseFloat(listingData.price),
        rating: listingData.rating ? parseFloat(listingData.rating) : null,
        capacity: listingData.capacity ? parseInt(listingData.capacity) : null,
        gstPercentage: listingData.gstPercentage ? parseFloat(listingData.gstPercentage) : 0,
        discountAmount: listingData.discountAmount ? parseFloat(listingData.discountAmount) : 0,
      };

      const listingRes = await createPropertyListing(listingPayload);
      const newListingId = listingRes?.data?.id || listingRes?.id;

      // PHASE 3: Upload Media
      if (selectedFiles.length > 0) {
        const mediaFormData = new FormData();
        mediaFormData.append('propertyListingId', newListingId);
        mediaFormData.append('mediaType', 'IMAGE');
        selectedFiles.forEach(file => mediaFormData.append('files', file));
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
            <h2 className="text-xl font-bold text-gray-800">Add Property Portfolio</h2>
            <p className="text-xs text-gray-500">Fill all details across tabs before submitting</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        {/* CLICKABLE TABS */}
        <div className="flex px-6 bg-gray-50 border-b">
          {[
            { id: 1, label: "Base Info", icon: <Building2 size={16} /> },
            { id: 2, label: "Listing Details", icon: <Sparkles size={16} /> },
            { id: 3, label: "Gallery", icon: <ImageIcon size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentStep(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                currentStep === tab.id ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              style={{ 
                borderBottomColor: currentStep === tab.id ? colors.primary : 'transparent', 
                color: currentStep === tab.id ? colors.primary : '' 
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
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Property Name *</label>
                <input type="text" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" value={parentData.propertyName} onChange={e => setParentData({...parentData, propertyName: e.target.value})} placeholder="Grand Palace" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Property Type *</label>
                <select className="w-full px-4 py-2.5 border rounded-xl" value={parentData.propertyTypeIds} onChange={e => setParentData({...parentData, propertyTypeIds: e.target.value})}>
                  <option value="">Select Type</option>
                  {propertyTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Location *</label>
                <select className="w-full px-4 py-2.5 border rounded-xl" value={parentData.locationId} onChange={e => setParentData({...parentData, locationId: e.target.value})}>
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.locationName}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Address</label>
                <input type="text" className="w-full px-4 py-2.5 border rounded-xl" value={parentData.address} onChange={e => setParentData({...parentData, address: e.target.value})} />
              </div>
              {/* NEW FIELDS STEP 1 */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Latitude</label>
                <input type="number" step="any" className="w-full px-4 py-2.5 border rounded-xl" value={parentData.latitude} onChange={e => setParentData({...parentData, latitude: e.target.value})} placeholder="e.g. 28.6139" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Longitude</label>
                <input type="number" step="any" className="w-full px-4 py-2.5 border rounded-xl" value={parentData.longitude} onChange={e => setParentData({...parentData, longitude: e.target.value})} placeholder="e.g. 77.2090" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Admin</label>
                <select className="w-full px-4 py-2.5 border rounded-xl" value={parentData.assignedAdminId} onChange={e => setParentData({...parentData, assignedAdminId: e.target.value})}>
                  <option value="">Select Admin</option>
                  {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: LISTING DETAILS */}
          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Listing Heading *</label>
                <input type="text" className="w-full px-4 py-2.5 border rounded-xl" value={listingData.mainHeading} onChange={e => setListingData({...listingData, mainHeading: e.target.value})} placeholder="Exclusive Suite at Grand Palace" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tagline</label>
                <input type="text" className="w-full px-4 py-2.5 border rounded-xl" value={listingData.tagline} onChange={e => setListingData({...listingData, tagline: e.target.value})} placeholder="Experience luxury like never before" />
              </div>
              {/* NEW FIELDS STEP 2 */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Price (₹) *</label>
                <input type="number" className="w-full px-4 py-2.5 border rounded-xl" value={listingData.price} onChange={e => setListingData({...listingData, price: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">GST (%)</label>
                <input type="number" className="w-full px-4 py-2.5 border rounded-xl" value={listingData.gstPercentage} onChange={e => setListingData({...listingData, gstPercentage: e.target.value})} placeholder="18" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Discount Amount (₹)</label>
                <input type="number" className="w-full px-4 py-2.5 border rounded-xl" value={listingData.discountAmount} onChange={e => setListingData({...listingData, discountAmount: e.target.value})} placeholder="500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Rating (1-5)</label>
                <input type="number" step="0.1" max="5" className="w-full px-4 py-2.5 border rounded-xl" value={listingData.rating} onChange={e => setListingData({...listingData, rating: e.target.value})} placeholder="4.5" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Capacity (Guests)</label>
                <input type="number" className="w-full px-4 py-2.5 border rounded-xl" value={listingData.capacity} onChange={e => setListingData({...listingData, capacity: e.target.value})} placeholder="2" />
              </div>
              {/* <div className="bg-gray-50 p-4 rounded-xl border col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Amenities</label>
                <div className="grid grid-cols-3 gap-2 h-40 overflow-y-auto pr-2">
                  {availableAmenities.map(a => (
                    <button key={a.id} type="button" onClick={() => {
                      const ids = listingData.amenitiesAndFeaturesIds.includes(a.id) 
                        ? listingData.amenitiesAndFeaturesIds.filter(id => id !== a.id)
                        : [...listingData.amenitiesAndFeaturesIds, a.id];
                      setListingData({...listingData, amenitiesAndFeaturesIds: ids});
                    }} className={`p-2 rounded-lg border text-left text-[10px] font-bold transition-all ${listingData.amenitiesAndFeaturesIds.includes(a.id) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'}`} style={listingData.amenitiesAndFeaturesIds.includes(a.id) ? { backgroundColor: colors.primary } : {}}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          )}

          {/* STEP 3: MEDIA */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center hover:bg-gray-50 transition-all cursor-pointer" onClick={() => document.getElementById('media-inp').click()}>
                  <Upload size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-sm font-bold text-gray-600">Drag or Click to select photos</p>
                  <p className="text-xs text-gray-400 mt-1">Files selected: {selectedFiles.length}</p>
                  <input id="media-inp" type="file" multiple className="hidden" onChange={e => setSelectedFiles(Array.from(e.target.files))} />
               </div>
               <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 flex items-center gap-2">
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
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl disabled:opacity-30"
          >
            Previous
          </button>
          
          <div className="flex gap-3">
            {currentStep < 3 ? (
              <button 
                onClick={() => setCurrentStep(prev => prev + 1)}
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
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Submit All Details</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPropertyModal;