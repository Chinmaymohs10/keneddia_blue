import React, { useState } from 'react';
import Layout from '@/modules/layout/Layout';
import { colors } from '@/lib/colors/colors';
import { 
  Home, 
  Tag, 
  Building2, 
  Info, 
  Gift, 
  Calendar, 
  Newspaper, 
  Star 
} from 'lucide-react';
import HeroSectionTab from './tabs/HeroSectionTab';
import QuickOfferTab from './tabs/QuickOfferTab';
import OurCollectionTab from './tabs/OurCollectionTab';
import AboutHotelTab from './tabs/AboutHotelTab';
import HotelOffersTab from './tabs/HotelOffersTab';
import EventsCelebrations from './tabs/EventsCelebrations';
import NewsSectionTab from './tabs/NewsSectionTab';
import GuestExperienceTab from './tabs/GuestExperienceTab';

function HotelHomepage() {
  const [activeTab, setActiveTab] = useState('hero');
  
  // Get user role from context/props/store
  const userRole = 'superadmin'; // or 'admin'

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Home, component: HeroSectionTab },
    { id: 'quickoffer', label: 'Quick Offer', icon: Tag, component: QuickOfferTab },
    { id: 'collection', label: 'Our Collection', icon: Building2, component: OurCollectionTab },
    { id: 'about', label: 'About Hotel', icon: Info, component: AboutHotelTab },
    { id: 'offers', label: 'Hotel Offers', icon: Gift, component: HotelOffersTab },
    { id: 'events', label: 'Events & Celebrations', icon: Calendar, component: EventsCelebrations },
    { id: 'news', label: 'News Section', icon: Newspaper, component: NewsSectionTab },
    { id: 'guest', label: 'Guest Experience', icon: Star, component: GuestExperienceTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || HeroSectionTab;

  return (
    <Layout 
      title="Hotel Homepage Management"
      subtitle="Control what visitors see on your hotel's homepage"
      role="superadmin"
      showActions={false}
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div 
          className="flex gap-0.5 px-4 sm:px-6 border-b overflow-x-auto sticky top-0 z-20 shrink-0 scrollbar-thin"
          style={{ 
            backgroundColor: colors.contentBg,
            borderColor: colors.border
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-transparent border-none border-b-2 text-[11px] sm:text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                borderColor: activeTab === tab.id ? colors.primary : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={14} className="shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: colors.mainBg }}
        >
          <div className="p-2 sm:p-2">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HotelHomepage;