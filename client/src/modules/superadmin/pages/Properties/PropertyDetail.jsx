import React, { useState } from 'react';
import { colors } from '@/lib/colors/colors';
import { 
  BuildingOffice2Icon, 
  MapPinIcon, 
  TrashIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// Import Tabs
import OverviewTab from './tabs/OverviewTab';
import RoomsTab from './tabs/RoomsTab';
import AmenitiesTab from './tabs/AmenitiesTab';
import GalleryTab from './tabs/GalleryTab';
import EventsTab from './tabs/EventsTab';
import PricingTab from './tabs/PricingTab';
import PoliciesTab from './tabs/PoliciesTab';
import MenuTab from './tabs/MenuTab';
import TablesTab from './tabs/TablesTab';
import BookingsTab from './tabs/BookingsTab';

// Import Modals
import AddEditOverviewModal from './modals/AddEditOverviewModal';
import AddRoomModal from './modals/AddRoomModal';
import AddAmenityModal from './modals/AddAmenityModal';
import AddMediaModal from './modals/AddMediaModal';
import AddEventModal from './modals/AddEventModal';
import AddPricingModal from './modals/AddPricingModal';
import EditPoliciesModal from './modals/EditPoliciesModal';
import AddMenuItemModal from './modals/AddMenuItemModal';
import AddTableModal from './modals/AddTableModal';

const PropertyDetail = ({ property, onBack }) => {
  // Static Data Init
  const defaultData = {
    overview: {
      propertyName: "Kennedia Blu Mumbai",
      address: "Colaba, Mumbai",
      city: "Mumbai",
      coordinates: { lat: 18.922, lng: 72.8347 },
      description: "Luxury hotel in South Mumbai",
      isActive: true,
      propertyType: "Hotel"
    },
    rooms: [
      {
        id: "room_1",
        name: "Deluxe Room",
        basePrice: 12500,
        maxOccupancy: 2,
        size: "350 sq.ft",
        amenities: ["WiFi", "AC", "Sea View"],
        available: true
      }
    ],
    amenities: [
      { id: "a1", name: "Free WiFi", isActive: true },
      { id: "a2", name: "Swimming Pool", isActive: true }
    ],
    gallery: [
      {
        id: "m1",
        mediaType: "image",
        category: "Property",
        url: "/static/hotel1.jpg"
      }
    ],
    events: [
      {
        id: "e1",
        title: "New Year Gala",
        date: "2026-12-31",
        time: "8:00 PM",
        tag: "Special Event"
      }
    ],
    pricing: [
      {
        id: "p1",
        season: "Peak",
        pricePerNight: 15000,
        startDate: "2026-12-01",
        endDate: "2026-12-31"
      }
    ],
    policies: {
      checkInTime: "2:00 PM",
      checkOutTime: "12:00 PM",
      petsAllowed: false,
      cancellationPolicy: "Free cancellation till 48 hours"
    },
    menu: [
      {
        id: "m1",
        itemName: "Pasta Alfredo",
        price: 750,
        category: "Main Course",
        isVeg: true,
        isAvailable: true
      }
    ],
    tables: [
      {
        id: "t1",
        tableNumber: "T01",
        capacity: 4,
        isActive: true
      }
    ],
    bookings: [
      {
        id: "b1",
        guestName: "Rahul Sharma",
        roomName: "Deluxe Room",
        checkIn: "2026-02-10",
        checkOut: "2026-02-12",
        status: "Confirmed"
      }
    ]
  };

  const getInitialData = () => {
      if (!property) return defaultData;
      // Merge passed property info into default overview
      return {
          ...defaultData,
          overview: {
              ...defaultData.overview,
              propertyName: property.propertyName || defaultData.overview.propertyName,
              address: property.address || defaultData.overview.address,
              city: property.locationName || defaultData.overview.city, // Assuming locationName maps to city
              propertyType: property.propertyType || defaultData.overview.propertyType,
              isActive: property.isActive !== undefined ? property.isActive : defaultData.overview.isActive
          }
      };
  };

  const [data, setData] = useState(getInitialData());
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal States
  const [modals, setModals] = useState({
    overview: false,
    room: false,
    amenity: false,
    media: false,
    event: false,
    pricing: false,
    policy: false,
    menu: false,
    table: false
  });
  
  const [selectedItem, setSelectedItem] = useState(null); // For editing

  // Handlers
  const toggleModal = (modalName, isOpen, item = null) => {
    setSelectedItem(item);
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
  };

  const updateData = (section, newData, isEdit = false, id = null) => {
    setData(prev => {
      // Handle object updates (overview, policies)
      if (section === 'overview' || section === 'policies') {
        return { ...prev, [section]: { ...prev[section], ...newData } };
      }
      // Handle array updates
      const list = prev[section];
      if (isEdit && id) {
        return { ...prev, [section]: list.map(item => item.id === id ? { ...item, ...newData } : item) };
      }
      return { ...prev, [section]: [...list, { ...newData, id: `new_${Date.now()}` }] };
    });
  };

  // Tab Config
  const tabsByPropertyType = {
    "Hotel": ["overview", "rooms", "amenities", "gallery", "events", "pricing", "policies", "bookings"],
    "Cafe": ["overview", "menu", "tables", "gallery"],
    "Restaurant": ["overview", "menu", "gallery", "events"]
  };

  const currentTabs = tabsByPropertyType[data.overview.propertyType] || tabsByPropertyType["Hotel"];

  const renderTabContent = () => {
    const props = {
      data: data[activeTab],
      onEdit: (item) => toggleModal(getModalNameForTab(activeTab), true, item),
      onAdd: () => toggleModal(getModalNameForTab(activeTab), true),
      onDelete: (id) => {/* Delete Logic */},
    };

    switch (activeTab) {
      case 'overview': return <OverviewTab data={data.overview} onEdit={() => toggleModal('overview', true, data.overview)} />;
      case 'rooms': return <RoomsTab {...props} />;
      case 'amenities': return <AmenitiesTab {...props} />;
      case 'gallery': return <GalleryTab {...props} />;
      case 'events': return <EventsTab {...props} />;
      case 'pricing': return <PricingTab {...props} />;
      case 'policies': return <PoliciesTab data={data.policies} onEdit={() => toggleModal('policy', true, data.policies)} />;
      case 'menu': return <MenuTab {...props} />;
      case 'tables': return <TablesTab {...props} />;
      case 'bookings': return <BookingsTab data={data.bookings} />;
      default: return null;
    }
  };

  const getModalNameForTab = (tab) => {
    const map = {
      rooms: 'room',
      amenities: 'amenity',
      gallery: 'media',
      events: 'event',
      pricing: 'pricing',
      menu: 'menu',
      tables: 'table'
    };
    return map[tab];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <BuildingOffice2Icon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.overview.propertyName}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
                {data.overview.propertyType}
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" /> {data.overview.city}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${data.overview.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {data.overview.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                {data.overview.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
            onClick={() => updateData('overview', { isActive: !data.overview.isActive })}
           >
             {data.overview.isActive ? 'Deactivate' : 'Activate'}
           </button>
           <button 
             className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
             title="Delete Property"
           >
             <TrashIcon className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="flex gap-2 overflow-x-auto border-b mb-6 pb-1">
          {currentTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white border-x border-t text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              style={activeTab === tab ? { color: colors.primary, borderColor: '#e5e7eb' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border min-h-[500px] p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <AddEditOverviewModal 
        isOpen={modals.overview} 
        onClose={() => toggleModal('overview', false)} 
        initialData={selectedItem} 
        onSave={(updated) => updateData('overview', updated)} 
      />
      <AddRoomModal
        isOpen={modals.room}
        onClose={() => toggleModal('room', false)}
        initialData={selectedItem}
        onSave={(updated) => updateData('rooms', updated, !!selectedItem, selectedItem?.id)}
      />
      <AddAmenityModal
        isOpen={modals.amenity}
        onClose={() => toggleModal('amenity', false)}
        initialData={selectedItem}
        onSave={(updated) => updateData('amenities', updated, !!selectedItem, selectedItem?.id)}
      />
      <AddMediaModal
         isOpen={modals.media}
         onClose={() => toggleModal('media', false)}
         initialData={selectedItem}
         onSave={(updated) => updateData('gallery', updated, !!selectedItem, selectedItem?.id)}
      />
      <AddEventModal
         isOpen={modals.event}
         onClose={() => toggleModal('event', false)}
         initialData={selectedItem}
         onSave={(updated) => updateData('events', updated, !!selectedItem, selectedItem?.id)}
      />
      <AddPricingModal
         isOpen={modals.pricing}
         onClose={() => toggleModal('pricing', false)}
         initialData={selectedItem}
         onSave={(updated) => updateData('pricing', updated, !!selectedItem, selectedItem?.id)}
      />
      <EditPoliciesModal
         isOpen={modals.policy}
         onClose={() => toggleModal('policy', false)}
         initialData={selectedItem}
         onSave={(updated) => updateData('policies', updated)}
      />
      <AddMenuItemModal
         isOpen={modals.menu}
         onClose={() => toggleModal('menu', false)}
         initialData={selectedItem}
         onSave={(updated) => updateData('menu', updated, !!selectedItem, selectedItem?.id)}
      />
       <AddTableModal
         isOpen={modals.table}
         onClose={() => toggleModal('table', false)}
         initialData={selectedItem}
         onSave={(updated) => updateData('tables', updated, !!selectedItem, selectedItem?.id)}
      />

    </div>
  );
};

export default PropertyDetail;
