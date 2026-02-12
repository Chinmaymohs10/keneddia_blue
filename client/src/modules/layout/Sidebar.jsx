// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { colors } from "../../lib/colors/colors";
import {
  Home,
  MapPin,
  Users,
  Building2,
  Coffee,
  UtensilsCrossed,
  Wine,
  Settings,
  LogOut,
  ChevronDown,
  X,
  LayoutDashboard,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AuthService from "../auth/authService";

function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Get user data from session/local storage on mount
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Role-based menu items
  const getMenuItemsByRole = (userRole) => {
    const superAdminMenus = [
      // { icon: LayoutDashboard, label: "Dashboard", path: "/Dashboard" },
      { icon: Home, label: "Homepage", path: "/Homepage-Dashboard" },
      { icon: Building2, label: "Properties", path: "/Properties" },
      { icon: MapPin, label: "Location", path: "/Location" },
      { icon: Users, label: "Manage Users", path: "/ManageUsers" },
      // { icon: BarChart3, label: "Analytics", path: "/Analytics" },
      {
        icon: Building2,
        label: "Hotel",
        path: "/Hotel",
        hasSubmenu: true,
        submenu: [
          { name: "Homepage", path: "/Hotel-homepage" },
          { name: "Amenities", path: "/Hotel/Amenities" },
          { name: "Bookings", path: "/Hotel/Bookings" },
          { name: "Pricing", path: "/Hotel/Pricing" },
        ],
      },
      // {
      //   icon: Coffee,
      //   label: "Cafe",
      //   path: "/Cafe",
      //   hasSubmenu: true,
      //   submenu: [
      //     { name: "Menu", path: "/Cafe/Menu" },
      //     { name: "Orders", path: "/Cafe/Orders" },
      //     { name: "Tables", path: "/Cafe/Tables" },
      //     { name: "Inventory", path: "/Cafe/Inventory" },
      //   ],
      // },
      // {
      //   icon: UtensilsCrossed,
      //   label: "Restaurant",
      //   path: "/Restaurant",
      //   hasSubmenu: true,
      //   submenu: [
      //     { name: "Menu", path: "/Restaurant/Menu" },
      //     { name: "Reservations", path: "/Restaurant/Reservations" },
      //     { name: "Orders", path: "/Restaurant/Orders" },
      //     { name: "Kitchen", path: "/Restaurant/Kitchen" },
      //   ],
      // },
      // {
      //   icon: Wine,
      //   label: "Wine & Dine",
      //   path: "/WineDine",
      //   hasSubmenu: true,
      //   submenu: [
      //     { name: "Wine List", path: "/WineDine/WineList" },
      //     { name: "Packages", path: "/WineDine/Packages" },
      //     { name: "Events", path: "/WineDine/Events" },
      //   ],
      // },
      // { icon: FileText, label: "Reports", path: "/Reports" },
    ];

    const adminMenus = [
      { icon: Home, label: "Homepage", path: "/Homepage-Dashboard" },
      { icon: Building2, label: "Properties", path: "/Properties" },
      { icon: MapPin, label: "Location", path: "/Location" },
      {
        icon: Building2,
        label: "Hotel",
        path: "/Hotel",
        hasSubmenu: true,
        submenu: [
          { name: "Rooms", path: "/Hotel/Rooms" },
          { name: "Amenities", path: "/Hotel/Amenities" },
          { name: "Bookings", path: "/Hotel/Bookings" },
        ],
      },
      // {
      //   icon: Coffee,
      //   label: "Cafe",
      //   path: "/Cafe",
      //   hasSubmenu: true,
      //   submenu: [
      //     { name: "Menu", path: "/Cafe/Menu" },
      //     { name: "Orders", path: "/Cafe/Orders" },
      //     { name: "Tables", path: "/Cafe/Tables" },
      //   ],
      // },
      // {
      //   icon: UtensilsCrossed,
      //   label: "Restaurant",
      //   path: "/Restaurant",
      //   hasSubmenu: true,
      //   submenu: [
      //     { name: "Menu", path: "/Restaurant/Menu" },
      //     { name: "Reservations", path: "/Restaurant/Reservations" },
      //     { name: "Orders", path: "/Restaurant/Orders" },
      //   ],
      // },
      // {
      //   icon: Wine,
      //   label: "Wine & Dine",
      //   path: "/WineDine",
      //   hasSubmenu: true,
      //   submenu: [
      //     { name: "Wine List", path: "/WineDine/WineList" },
      //     { name: "Events", path: "/WineDine/Events" },
      //   ],
      // },
    ];

    return userRole === "ROLE_SUPERADMIN" ? superAdminMenus : adminMenus;
  };

  // Determine user role and get menu items
  const userRole = currentUser?.roleName || "ROLE_ADMIN";
  const menuItems = getMenuItemsByRole(userRole);

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavigation = (path, hasSubmenu, label) => {
    if (hasSubmenu) {
      toggleMenu(label);
    } else if (path && path !== "#") {
      navigate(path);
    }
  };

  const handleSubmenuClick = (path) => {
    if (path && path !== "#") {
      navigate(path);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getRoleBadge = (userRole) => {
    return userRole === "ROLE_SUPERADMIN" ? "Super Admin" : "Admin";
  };

  const getRoleBadgeColor = (userRole) => {
    return userRole === "ROLE_SUPERADMIN" ? colors.primary : colors.info;
  };

  // Get display name (fallback to username if name is not available)
  const getDisplayName = () => {
    if (!currentUser) return "Guest";
    return currentUser.name || currentUser.userName || "User";
  };

  return (
    <>
      {/* Overlay for mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-60 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: colors.sidebarBg }}
      >
        {/* Logo/Brand Section with Close Button */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: colors.sidebarActive }}
        >
          <h2
            className="text-lg font-semibold m-0"
            style={{ color: colors.sidebarText }}
          >
            Hotel Kennedia
          </h2>
          {/* Close button for both mobile and desktop */}
          <button
            onClick={onToggle}
            className="p-1 rounded transition-colors"
            style={{ color: colors.sidebarText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.sidebarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* User Profile with Role */}
        <div
          className="p-5 flex items-center gap-3 border-b relative"
          style={{ borderColor: colors.sidebarActive }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.sidebarActive }}
          >
            <span className="text-xl">👋</span>
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs"
              style={{ color: colors.sidebarTextSecondary }}
            >
              Hello 👋
            </div>
            <div
              className="text-sm font-medium mt-0.5 truncate"
              style={{ color: colors.sidebarText }}
            >
              {getDisplayName()}
            </div>
            <div
              className="text-[10px] font-medium mt-1 px-2 py-0.5 rounded inline-block"
              style={{
                backgroundColor: getRoleBadgeColor(userRole) + "20",
                color: getRoleBadgeColor(userRole),
              }}
            >
              {getRoleBadge(userRole)}
            </div>
          </div>
          <div
            className="w-2 h-2 rounded-full absolute top-6 right-5"
            style={{ 
              backgroundColor: currentUser?.isActive ? colors.success : colors.textSecondary 
            }}
          ></div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-5 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              <div
                className={`flex items-center px-5 py-3 cursor-pointer transition-all gap-3 relative ${
                  isActive(item.path) ? "border-l-[3px]" : ""
                }`}
                style={{
                  color: colors.sidebarText,
                  backgroundColor: isActive(item.path)
                    ? colors.sidebarActive
                    : "transparent",
                  borderColor: isActive(item.path)
                    ? colors.primary
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = colors.sidebarHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                onClick={() =>
                  handleNavigation(item.path, item.hasSubmenu, item.label)
                }
              >
                <item.icon size={20} className="min-w-5 shrink-0" />
                <span className="text-sm flex-1 truncate">{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform shrink-0 ${
                      expandedMenus[item.label] ? "rotate-180" : "rotate-0"
                    }`}
                  />
                )}
              </div>

              {/* Submenu */}
              {item.hasSubmenu && expandedMenus[item.label] && (
                <div
                  className="pl-[52px]"
                  style={{ backgroundColor: colors.sidebarActive }}
                >
                  {item.submenu.map((subItem) => (
                    <div
                      key={subItem.name}
                      className="py-2 px-5 text-[13px] cursor-pointer transition-colors truncate"
                      style={{ color: colors.sidebarTextSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.sidebarText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color =
                          colors.sidebarTextSecondary;
                      }}
                      onClick={() => handleSubmenuClick(subItem.path)}
                    >
                      {subItem.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div
          className="border-t py-5"
          style={{ borderColor: colors.sidebarActive }}
        >
          <div
            className="flex items-center px-5 py-3 cursor-pointer transition-all gap-3"
            style={{ color: colors.sidebarText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.sidebarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={() => navigate("#")}
          >
            <Settings size={20} className="min-w-5 shrink-0" />
            <span className="text-sm truncate">Settings</span>
          </div>
          <div
            className="flex items-center px-5 py-3 cursor-pointer transition-all gap-3"
            style={{ color: colors.sidebarText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.sidebarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={() => {
              AuthService.logout(); // clears session + local storage & redirects
            }}
          >
            <LogOut size={20} className="min-w-5 shrink-0" />
            <span className="text-sm truncate">Logout</span>
          </div>
        </div>
      </div>

      {/* Toggle Button when Sidebar is Closed (Desktop) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 p-2 rounded-r-lg shadow-lg transition-all items-center justify-center"
          style={{
            backgroundColor: colors.sidebarBg,
            color: colors.sidebarText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.sidebarHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.sidebarBg;
          }}
        >
          <ChevronRight size={20} />
        </button>
      )}
    </>
  );
}

export default Sidebar;