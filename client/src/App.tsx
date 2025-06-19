import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import Layout from './components/common/Layout';
import UserProfile from './components/users/UserProfile';
import UserList from './components/users/UserList';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected layout for authenticated users */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3, 4]} redirectTo="/login">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Admin-only section */}
        <Route
          path="admin"
          element={
            <RoleGuard allowedRoles={['Administrator']}>
              <h2>Admin Panel (WIP)</h2>
            </RoleGuard>
          }
        />

        <Route path="profile-details" element={<UserProfile />} />
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={['Administrator']}>
              <UserList />
            </RoleGuard>
          }
        />
      </Route>

      {/* Unauthorized fallback */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
