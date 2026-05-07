import React, { useState } from 'react';
import { colors } from "@/lib/colors/colors";
import Layout from '@/modules/layout/Layout';
import { Image, List, Quote, Users } from 'lucide-react';
import JourneyHeroSection from '../tabPages/OurJourneyTabs/JourneyHeroSection';
import JourneyMarquee from '../tabPages/OurJourneyTabs/JourneyMarquee';
import JourneyPullQuote from '../tabPages/OurJourneyTabs/JourneyPullQuote';
import JourneyTeamSection from '../tabPages/OurJourneyTabs/JourneyTeamSection';

const tabs = [
  { id: 'hero', label: 'Story Hero', icon: Image, component: JourneyHeroSection, description: 'Hero cards shown on the journey page' },
  { id: 'marquee', label: 'Marquee', icon: List, component: JourneyMarquee, description: 'Scrolling stats & highlights strip' },
  { id: 'pullquote', label: 'Pull Quote', icon: Quote, component: JourneyPullQuote, description: "Founder's featured quote section" },
  { id: 'team', label: 'Team Section', icon: Users, component: JourneyTeamSection, description: 'Leadership & team member cards' },
];

function OurJourney() {
  const [activeTab, setActiveTab] = useState('hero');
  const activeTabData = tabs.find(t => t.id === activeTab);
  const ActiveComponent = activeTabData?.component || JourneyHeroSection;

  return (
    <Layout
      title="Our Journey Management"
      role="superadmin"
      showActions={false}
    >
      <div className="flex flex-col h-full">
        {/* Tab Bar */}
        <div
          className="shrink-0 sticky top-0 z-20"
          style={{ backgroundColor: colors.contentBg, borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex overflow-x-auto px-4 sm:px-6 scrollbar-thin">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200"
                  style={{
                    color: isActive ? colors.primary : colors.textSecondary,
                    borderBottom: `2px solid ${isActive ? colors.primary : 'transparent'}`,
                    backgroundColor: 'transparent',
                  }}
                >
                  <tab.icon size={15} className="shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Header */}
        {activeTabData && (
          <div
            className="shrink-0 px-6 py-3 flex items-center gap-3"
            style={{ backgroundColor: colors.contentBg, borderBottom: `1px solid ${colors.border}` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary}18` }}
            >
              <activeTabData.icon size={16} style={{ color: colors.primary }} />
            </div>
            <div>
              <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{activeTabData.label}</span>
              <span className="ml-2 text-xs" style={{ color: colors.textSecondary }}>{activeTabData.description}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.mainBg }}>
          <div className="p-4 sm:p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default OurJourney;
