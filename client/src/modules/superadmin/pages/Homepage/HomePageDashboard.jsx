import React, { useState } from 'react';
import { colors } from "@/lib/colors/colors";
import Layout from '@/modules/layout/Layout';
import { 
  Home, 
  DollarSign, 
  Building, 
  Info, 
  Building2, 
  Calendar, 
  Newspaper, 
  Star,
} from 'lucide-react';
import HeroSection from '../tabPages/HeroSection';
import DailyOffers from '../tabPages/DailyOffers';
import OurPresence from '../tabPages/OurPresence';
import AboutUs from '../tabPages/AboutUs';
import KennediaGroup from '../tabPages/KennediaGroup';
import UpcomingEvents from '../tabPages/UpcomingEvents';
import NewsPress from '../tabPages/NewsPress';
import GuestExp from '../tabPages/GuestExp';

function HomePageDashboard() {
  const [activeTab, setActiveTab] = useState('hero');

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Home, component: HeroSection },
    { id: 'offers', label: 'Daily Offers', icon: DollarSign, component: DailyOffers },
    { id: 'about', label: 'About Us', icon: Info, component: AboutUs },
    { id: 'kennedia', label: 'Kennedia Group', icon: Building2, component: KennediaGroup },
    { id: 'events', label: 'Upcoming Events', icon: Calendar, component: UpcomingEvents },
    { id: 'news', label: 'News & Press', icon: Newspaper, component: NewsPress },
    { id: 'guest', label: 'Guest Exp', icon: Star, component: GuestExp },
    { id: 'presence', label: 'Our Presence', icon: Building, component: OurPresence },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || HeroSection;

  return (
    <Layout 
      title="Home Page Management"
      subtitle="Control what visitors see on your hotel's homepage"
      role="superadmin" 
      showActions={false}
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div 
          className="flex gap-0.5 px-4 sm:px-6 overflow-x-auto sticky top-0 z-20 shrink-0 scrollbar-thin"
          style={{ 
            backgroundColor: colors.contentBg,
            borderBottom: `1px solid ${colors.border}`
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-200"
                style={{
                  color: isActive ? colors.primary : colors.textSecondary,
                  borderBottom: `2px solid ${isActive ? colors.primary : 'transparent'}`,
                  backgroundColor: 'transparent',
                }}
              >
                <tab.icon size={14} className="shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
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

export default HomePageDashboard;