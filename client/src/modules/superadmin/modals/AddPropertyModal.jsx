import React, { useState, useEffect } from "react";
import { 
  X, Upload, Building2, MapPin, DollarSign, Tag, 
  Plus, Sparkles, Image as ImageIcon, Loader2, 
  CheckCircle2, Info, ChevronRight, Save, Percent 
} from "lucide-react";
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

  // --- STEP 1: Base Property State ---
  const [parentData, setParentData] = useState({
    propertyName: "",
    propertyTypeIds: "",
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

  // --- STEP 2: Listing Details State (Updated with GST/Discount) ---
  const [listingData, setListingData] = useState({
    mainHeading: "",
    subTitle: "",
    fullAddress: "",
    tagline: "",
    rating: null,
    capacity: null,
    price: "",           // Base Price
    gstPercentage: 18,    // Default GST
    discountAmount: 0,   // Flat Discount
    amenitiesAndFeaturesIds: [],
    isActive: true
  });

  // --- STEP 3: Media State ---
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

  // --- Real-time Price Calculation ---
  const calculateTotal = () => {
    const base = parseFloat(listingData.price) || 0;
    const gst = (base * (parseFloat(listingData.gstPercentage) || 0)) / 100;
    const disc = parseFloat(listingData.discountAmount) || 0;
    return (base + gst - disc).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  // --- Final Submission Chain ---
  const handleFinalSubmit = async () => {
    // Basic Validation
    if (!parentData.propertyName || !parentData.propertyTypeIds || !parentData.locationId) {
      setCurrentStep(1);
      return toast.error("Please fill required fields in Base Info");
    }
    if (!listingData.mainHeading || !listingData.price) {
      setCurrentStep(2);
      return toast.error("Please fill required fields in Listing Details");
    }

    setLoading(true);
    const toastId = toast.loading("Creating property portfolio...");

    try {
      // 1. Create Base Property
      const selectedTypeObj = propertyTypes.find(t => t.id.toString() === parentData.propertyTypeIds.toString());
      const typeName = selectedTypeObj.typeName;
      
      const parentPayload = {
        ...parentData,
        propertyTypeIds: [parseInt(parentData.propertyTypeIds)],
        locationId: parseInt(parentData.locationId),
        assignedAdminId: parseInt(parentData.assignedAdminId)
      };

      const parentRes = await createPropertyByType(typeName, parentPayload);
      const newPropertyId = parentRes?.data?.id || parentRes?.id;

      // 2. Create Listing
      const listingPayload = {
        ...listingData,
        propertyId: newPropertyId,
        assignedAdminId: parseInt(parentData.assignedAdminId),
        price: parseFloat(listingData.price),
        gstPercentage: parseFloat(listingData.gstPercentage),
        discountAmount: parseFloat(listingData.discountAmount),
      };

      const listingRes = await createPropertyListing(listingPayload);
      const newListingId = listingRes?.data?.id || listingRes?.id;

      // 3. Upload Media
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('propertyListingId', newListingId);
        formData.append('mediaType', 'IMAGE');
        selectedFiles.forEach(file => formData.append('files', file));
        await PropertyUploadMedia(formData);
      }

      toast.success("Property Setup Successfully!", { id: toastId });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Process failed. Please check inputs.", { id: toastId });
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
            <h2 className="text-xl font-bold text-gray-800">Add New Property</h2>
            <p className="text-xs text-gray-500">Configure your property listing across all tabs</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {/* Clickable Tabs */}
        <div className="flex px-6 bg-gray-50 border-b overflow-x-auto scrollbar-hide">
          {[
            { id: 1, label: "Base Info", icon: <Building2 size={16} /> },
            { id: 2, label: "Listing Details", icon: <Sparkles size={16} /> },
            { id: 3, label: "Gallery", icon: <ImageIcon size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentStep(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap flex-shrink-0 ${
                currentStep === tab.id ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              style={{ borderBottomColor: currentStep === tab.id ? colors.primary : 'transparent', color: currentStep === tab.id ? colors.primary : '' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* STEP 1: BASE INFO */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Property Name *</label>
                <input type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary" value={parentData.propertyName} onChange={e => setParentData({...parentData, propertyName: e.target.value})} placeholder="e.g. Grand Palace Hotel" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Type *</label>
                <select className="w-full px-4 py-2.5 border rounded-xl outline-none" value={parentData.propertyTypeIds} onChange={e => setParentData({...parentData, propertyTypeIds: e.target.value})}>
                  <option value="">Select Type</option>
                  {propertyTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Location *</label>
                <select className="w-full px-4 py-2.5 border rounded-xl outline-none" value={parentData.locationId} onChange={e => setParentData({...parentData, locationId: e.target.value})}>
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.locationName}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Admin</label>
                <select className="w-full px-4 py-2.5 border rounded-xl outline-none" value={parentData.assignedAdminId} onChange={e => setParentData({...parentData, assignedAdminId: e.target.value})}>
                  <option value="">Select Admin</option>
                  {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: LISTING DETAILS (Updated Pricing Section) */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-in fade-in duration-300">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Main Heading *</label>
                <input type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:border-primary" value={listingData.mainHeading} onChange={e => setListingData({...listingData, mainHeading: e.target.value})} placeholder="Luxurious Suite with View" />
              </div>

              {/* Pricing breakdown card */}
              <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Base Price (₹) *</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" className="w-full pl-9 pr-4 py-2 border rounded-lg focus:border-blue-500 outline-none" value={listingData.price} onChange={e => setListingData({...listingData, price: e.target.value})} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">GST (%)</label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" className="w-full pl-9 pr-4 py-2 border rounded-lg focus:border-blue-500 outline-none" value={listingData.gstPercentage} onChange={e => setListingData({...listingData, gstPercentage: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Discount (₹)</label>
                  <div className="relative">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" className="w-full pl-9 pr-4 py-2 border rounded-lg focus:border-blue-500 outline-none" value={listingData.discountAmount} onChange={e => setListingData({...listingData, discountAmount: e.target.value})} />
                  </div>
                </div>
                <div className="md:col-span-3 pt-4 border-t border-blue-100 flex items-center justify-between">
                   <span className="text-xs font-bold uppercase text-blue-600">Final Price (Incl. GST)</span>
                   <span className="text-xl font-black text-gray-900">₹{calculateTotal()}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-40 overflow-y-auto pr-2 bg-gray-50 p-4 rounded-xl border">
                  {availableAmenities.map(a => (
                    <button key={a.id} type="button" onClick={() => {
                      const ids = listingData.amenitiesAndFeaturesIds.includes(a.id) 
                        ? listingData.amenitiesAndFeaturesIds.filter(id => id !== a.id)
                        : [...listingData.amenitiesAndFeaturesIds, a.id];
                      setListingData({...listingData, amenitiesAndFeaturesIds: ids});
                    }} className={`p-2 rounded-lg border text-left text-[10px] font-bold transition-all ${listingData.amenitiesAndFeaturesIds.includes(a.id) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`} style={listingData.amenitiesAndFeaturesIds.includes(a.id) ? { backgroundColor: colors.primary, borderColor: colors.primary } : {}}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GALLERY */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
               <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center hover:bg-gray-50 transition-all cursor-pointer group" onClick={() => document.getElementById('media-inp').click()}>
                  <Upload size={48} className="mx-auto text-gray-300 mb-4 group-hover:text-primary transition-colors" />
                  <p className="text-sm font-bold text-gray-600">Select property photos to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP supported</p>
                  <input id="media-inp" type="file" multiple className="hidden" onChange={e => setSelectedFiles(Array.from(e.target.files))} />
               </div>
               
               {selectedFiles.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 flex items-center gap-2">
                        {file.name}
                        <button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))}><X size={12}/></button>
                      </div>
                    ))}
                 </div>
               )}
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
                className="px-8 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-black transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleFinalSubmit} 
                disabled={loading}
                className="px-10 py-2.5 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Finish Setup</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPropertyModal;