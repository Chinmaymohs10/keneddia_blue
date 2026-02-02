// routes/AppRoutes.jsx
import { Routes } from "react-router-dom";

import WebsiteRoutes from "./WebsiteRoutes";
import SuperAdminRoutes from "./SuperAdminRoutes";
import AuthRoutes from "./AuthRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      {AuthRoutes}

      {/* Website */}
      {WebsiteRoutes}

      {/* Super Admin (Protected) */}
      {SuperAdminRoutes}
    </Routes>
  );
};

export default AppRoutes;