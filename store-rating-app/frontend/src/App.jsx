import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login    from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import AdminStores    from './pages/admin/Stores';

import UserDashboard  from './pages/user/Dashboard';

import OwnerDashboard from './pages/owner/Dashboard';

// Role-based guard
const RequireAuth = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Redirect logged-in users to their dashboard
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'owner') return <Navigate to="/owner" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/users"  element={<RequireAuth roles={['admin']}><AdminUsers /></RequireAuth>} />
          <Route path="/admin/stores" element={<RequireAuth roles={['admin']}><AdminStores /></RequireAuth>} />

          {/* User */}
          <Route path="/dashboard" element={<RequireAuth roles={['user']}><UserDashboard /></RequireAuth>} />

          {/* Owner */}
          <Route path="/owner" element={<RequireAuth roles={['owner']}><OwnerDashboard /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
