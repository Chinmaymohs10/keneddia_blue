// routes/SuperAdminRoutes.jsx
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Existing Pages
import HomePageDashboard from '@/modules/superadmin/pages/Homepage/HomePageDashboard';
import SuperAdminDashboard from '@/modules/superadmin/pages/Dashboard/SuperAdminDashboard';

// Top-Level Pages
import Location from '@/modules/superadmin/pages/Location/Location';
import ManageUsers from '@/modules/superadmin/pages/ManageUsers/ManageUsers';
import Analytics from '@/modules/superadmin/pages/Analytics/Analytics';
import Reports from '@/modules/superadmin/pages/Reports/Reports';
import ManageProperties from '@/modules/superadmin/pages/Properties/ManageProperties';

// Hotel Module
import Hotel from '@/modules/superadmin/pages/Hotel/Hotel';
import Rooms from '@/modules/superadmin/pages/Hotel/Rooms';
import Amenities from '@/modules/superadmin/pages/Hotel/Amenities';
import Bookings from '@/modules/superadmin/pages/Hotel/Bookings';
import Pricing from '@/modules/superadmin/pages/Hotel/Pricing';

// Cafe Module
import Cafe from '@/modules/superadmin/pages/Cafe/Cafe';
import CafeMenu from '@/modules/superadmin/pages/Cafe/Menu';
import CafeOrders from '@/modules/superadmin/pages/Cafe/Orders';
import Tables from '@/modules/superadmin/pages/Cafe/Tables';
import Inventory from '@/modules/superadmin/pages/Cafe/Inventory';

// Restaurant Module
import Restaurant from '@/modules/superadmin/pages/Restaurant/Restaurant';
import RestaurantMenu from '@/modules/superadmin/pages/Restaurant/Menu';
import Reservations from '@/modules/superadmin/pages/Restaurant/Reservations';
import RestaurantOrders from '@/modules/superadmin/pages/Restaurant/Orders';
import Kitchen from '@/modules/superadmin/pages/Restaurant/Kitchen';

// Wine & Dine Module
import WineDine from '@/modules/superadmin/pages/WineDine/WineDine';
import WineList from '@/modules/superadmin/pages/WineDine/WineList';
import Packages from '@/modules/superadmin/pages/WineDine/Packages';
import Events from '@/modules/superadmin/pages/WineDine/Events';

const SuperAdminRoutes = [
  // Existing Routes
  <Route
    key="super-admin-dashboard"
    path="/Dashboard"
    element={
      <ProtectedRoute requiredRole="ROLE_SUPERADMIN">
        <SuperAdminDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-Homepage-dashboard"
    path="/Homepage-Dashboard"
    element={
      <ProtectedRoute>
        <HomePageDashboard />
      </ProtectedRoute>
    }
  />,

  // Top-Level Routes
  <Route
    key="super-admin-location"
    path="/Location"
    element={
      <ProtectedRoute>
        <Location />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-manage-users"
    path="/ManageUsers"
    element={
      <ProtectedRoute requiredRole="ROLE_SUPERADMIN">
        <ManageUsers />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-manage-properties"
    path="/Properties"
    element={
      <ProtectedRoute requiredRole="ROLE_SUPERADMIN">
        <ManageProperties />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-analytics"
    path="/Analytics"
    element={
      <ProtectedRoute requiredRole="ROLE_SUPERADMIN">
        <Analytics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-reports"
    path="/Reports"
    element={
      <ProtectedRoute requiredRole="ROLE_SUPERADMIN">
        <Reports />
      </ProtectedRoute>
    }
  />,

  // Hotel Module Routes
  <Route
    key="super-admin-hotel"
    path="/Hotel"
    element={
      <ProtectedRoute>
        <Hotel />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-hotel-rooms"
    path="/Hotel/Rooms"
    element={
      <ProtectedRoute>
        <Rooms />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-hotel-amenities"
    path="/Hotel/Amenities"
    element={
      <ProtectedRoute>
        <Amenities />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-hotel-bookings"
    path="/Hotel/Bookings"
    element={
      <ProtectedRoute>
        <Bookings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-hotel-pricing"
    path="/Hotel/Pricing"
    element={
      <ProtectedRoute requiredRole="ROLE_SUPERADMIN">
        <Pricing />
      </ProtectedRoute>
    }
  />,

  // Cafe Module Routes
  <Route
    key="super-admin-cafe"
    path="/Cafe"
    element={
      <ProtectedRoute>
        <Cafe />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-cafe-menu"
    path="/Cafe/Menu"
    element={
      <ProtectedRoute>
        <CafeMenu />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-cafe-orders"
    path="/Cafe/Orders"
    element={
      <ProtectedRoute>
        <CafeOrders />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-cafe-tables"
    path="/Cafe/Tables"
    element={
      <ProtectedRoute>
        <Tables />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-cafe-inventory"
    path="/Cafe/Inventory"
    element={
      <ProtectedRoute>
        <Inventory />
      </ProtectedRoute>
    }
  />,

  // Restaurant Module Routes
  <Route
    key="super-admin-restaurant"
    path="/Restaurant"
    element={
      <ProtectedRoute>
        <Restaurant />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-restaurant-menu"
    path="/Restaurant/Menu"
    element={
      <ProtectedRoute>
        <RestaurantMenu />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-restaurant-reservations"
    path="/Restaurant/Reservations"
    element={
      <ProtectedRoute>
        <Reservations />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-restaurant-orders"
    path="/Restaurant/Orders"
    element={
      <ProtectedRoute>
        <RestaurantOrders />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-restaurant-kitchen"
    path="/Restaurant/Kitchen"
    element={
      <ProtectedRoute>
        <Kitchen />
      </ProtectedRoute>
    }
  />,

  // Wine & Dine Module Routes
  <Route
    key="super-admin-winedine"
    path="/WineDine"
    element={
      <ProtectedRoute>
        <WineDine />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-winedine-winelist"
    path="/WineDine/WineList"
    element={
      <ProtectedRoute>
        <WineList />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-winedine-packages"
    path="/WineDine/Packages"
    element={
      <ProtectedRoute>
        <Packages />
      </ProtectedRoute>
    }
  />,
  <Route
    key="super-admin-winedine-events"
    path="/WineDine/Events"
    element={
      <ProtectedRoute>
        <Events />
      </ProtectedRoute>
    }
  />,
];

export default SuperAdminRoutes;