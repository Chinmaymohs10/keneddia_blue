// routes/AuthRoutes.jsx
import { Route } from 'react-router-dom';

import Login from '../modules/Auth/Login.jsx';
// import Unauthorized from '../modules/Auth/components/Unauthorized.jsx';

const AuthRoutes = [
  <Route key="login" path="/login" element={<Login />} />,
  // <Route key="unauthorized" path="/unauthorized" element={<Unauthorized />} />,
];

export default AuthRoutes;
