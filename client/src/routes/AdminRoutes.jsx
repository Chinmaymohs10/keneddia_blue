// routes/AdminRoutes.jsx
import { Route } from 'react-router-dom';
import { AdminRoute } from '../modules/Auth/components/ProtectedRoute.jsx';

// Pages
import Dashboard from '../modules/Admin/pages/Dashboard.jsx';
import ManageUsers from '../modules/Admin/pages/ManageUsers.jsx';

const AdminRoutes = [
  <Route
    key="admin-dashboard"
    path="/Dashboard"
    element={
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    }
  />,

  <Route
    key="manage-users"
    path="/ManageUsers"
    element={
      <AdminRoute>
        <ManageUsers />
      </AdminRoute>
    }
  />,
];

export default AdminRoutes;
