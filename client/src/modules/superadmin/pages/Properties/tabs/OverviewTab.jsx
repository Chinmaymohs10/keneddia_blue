import React from 'react';
import { 
  PencilSquareIcon, 
  MapPinIcon, 
  UserIcon, 
  HomeIcon, 
  CurrencyRupeeIcon, 
  StarIcon, 
  UsersIcon,
  InformationCircleIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';
import AddEditOverviewModal from '../modals/AddEditOverviewModal';

const OverviewTab = ({ data, onEdit }) => {
  console.log(data, "Property Data");
  
  const combinedAddress = [data.address, data.area].filter(Boolean).join(', ');

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
          <p className="text-sm text-gray-500 font-medium">ID: {data.id || 'N/A'}</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-md hover:opacity-90 transition-all active:scale-95 shadow-sm"
          style={{ backgroundColor: colors.primary }}
        >
          <PencilSquareIcon className="w-4 h-4" /> Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Left Column: Basic Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Property Name</label>
            <p className="mt-1 text-base font-medium text-gray-900">{data.propertyName || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Admin</label>
            <div className="mt-1 flex items-center gap-2 text-gray-900">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <p className="text-base">{data.assignedAdminName || 'Not Assigned'}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Property Types</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.propertyTypes?.length > 0 ? (
                data.propertyTypes.map((type, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">No types specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Location Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Address</label>
            <div className="mt-1 flex items-start gap-2 text-gray-900">
              <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base leading-tight">{data.fullAddress || combinedAddress || 'N/A'}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {data.locationName || data.city} {data.pincode && `- ${data.pincode}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Coordinates</label>
              <p className="mt-1 text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                {data.latitude}, {data.longitude}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${data.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-900">{data.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Details Section */}
      <div className="pt-8 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-900">
            <InformationCircleIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">More Details</h3>
        </div>
        
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Thumbnail Preview */}
                <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Thumbnail</label>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 border border-gray-300">
                        {data.media?.[0]?.url ? (
                            <img 
                                src={data.media[0].url} 
                                alt={data.media[0].alt || "Property thumbnail"} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <PhotoIcon className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Commercial Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Starting Price</label>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">₹{data.price?.toLocaleString()}</span>
                            {data.discountAmount > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                                    - ₹{data.discountAmount}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Includes {data.gstPercentage}% GST</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Main Heading</label>
                        <p className="text-sm font-medium text-gray-700">{data.mainHeading || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tagline</label>
                        <p className="text-sm italic text-gray-600">"{data.tagline || 'No tagline provided'}"</p>
                    </div>
                </div>

                {/* Technical/Capacity Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Metrics</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold">{data.rating || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                <UsersIcon className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-semibold">{data.capacity || '0'} Pax</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subtitle</label>
                        <p className="text-xs text-gray-600">{data.subTitle || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Internal Reference</label>
                        <p className="text-xs font-mono text-gray-500">Listing ID: {data.listingId || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Linked Child Properties */}
      {data.childProperties?.length > 0 && (
        <div className="pt-6 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Linked Child Properties</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.childProperties.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-md">
                    <HomeIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{child.propertyName}</p>
                    <p className="text-[10px] text-gray-500">ID: {child.id}</p>
                  </div>
                </div>
                {child.isActive && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Active</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;