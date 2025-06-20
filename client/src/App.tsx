// App.tsx - This is correct, no changes needed
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ExploreHotelsPage from './pages/ExploreHotelsPage';
import HotelLeaderboardPage from './pages/HotelLeaderBoardPage';

import Layout from './components/common/Layout';
import UserProfile from './components/users/UserProfile';
import UserList from './components/users/UserList';
import HotelDetails from './components/hotels/HotelDetails';
import HotelForm from './components/hotels/HotelForm';

const App: React.FC = () => {
  return (
    <AuthProvider>
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
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="explore-hotels" element={<ExploreHotelsPage />} />
            <Route path="scoring-leaderboard" element={<HotelLeaderboardPage />} />
            
            {/* Hotel routes */}
            <Route path="hotels/:id" element={<HotelDetails />} />
            <Route 
              path="hotels/add" 
              element={
                <RoleGuard allowedRoles={[3, 4]}> {/* Administrator, Data Operator */}
                  <HotelForm />
                </RoleGuard>
              } 
            />
            <Route 
              path="hotels/:id/edit" 
              element={
                <RoleGuard allowedRoles={[1, 3]}> {/* Hotel Manager, Administrator */}
                  <HotelForm />
                </RoleGuard>
              } 
            />

            {/* Admin-only routes */}
            <Route
              path="admin"
              element={
                <RoleGuard allowedRoles={[3]}> {/* Administrator only */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
                    <p>Administrative features coming soon...</p>
                  </div>
                </RoleGuard>
              }
            />

            <Route path="profile-details" element={<UserProfile />} />
            <Route
              path="users"
              element={
                <RoleGuard allowedRoles={[3]}> {/* Administrator only */}
                  <UserList />
                </RoleGuard>
              }
            />
          </Route>

          {/* Unauthorized fallback */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
  );
};

export default App;
