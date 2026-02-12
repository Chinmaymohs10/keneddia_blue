// Layout.jsx - Updated
import React, { useState, useEffect } from 'react';
import { colors } from '@/lib/colors/colors';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Menu } from 'lucide-react';

function Layout({ children, title, subtitle, showActions = true, role = 'admin' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: colors.mainBg }}
    >
      <Sidebar role={role} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarOpen && !isMobile ? 'ml-60' : 'ml-0'
      }`}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <div 
            className="flex items-center p-4 border-b"
            style={{ 
              backgroundColor: colors.contentBg,
              borderColor: colors.border 
            }}
          >
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md transition-colors"
              style={{ color: colors.textPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.mainBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Menu size={24} />
            </button>
            <h1 
              className="text-lg font-semibold ml-3"
              style={{ color: colors.textPrimary }}
            >
              Hotel Kennedia
            </h1>
          </div>
        )}

        {(title || subtitle) && (
          <Navbar 
            title={title}
            subtitle={subtitle}
            showActions={showActions}
            onMenuClick={toggleSidebar}
            isMobile={isMobile}
          />
        )}
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;