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
import UserManagement from './pages/UserManagement';

import Layout from './components/common/Layout';
import UserProfile from './components/users/UserProfile';
import HotelDetails from './components/hotels/HotelDetails';
import HotelForm from './components/hotels/HotelForm';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected layout for authenticated users */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3, 4]} redirectTo="/login">
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Main application routes */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile-details" element={<UserProfile />} />
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

          {/* Hotel Manager specific routes */}
          <Route 
            path="my-hotels" 
            element={
              <RoleGuard allowedRoles={[1]}> {/* Hotel Manager only */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">My Hotels</h2>
                  <p>Hotel management dashboard coming soon...</p>
                </div>
              </RoleGuard>
            } 
          />

          {/* Administrator routes */}
          <Route path="admin">
            <Route 
              index 
              element={
                <RoleGuard allowedRoles={[3]}> {/* Administrator only */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">👥 User Management</h3>
                        <p className="text-gray-600 mb-4">Manage system users and roles</p>
                        <a href="/admin/users" className="text-blue-600 hover:text-blue-800">
                          Go to User Management →
                        </a>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">🏨 Hotel Management</h3>
                        <p className="text-gray-600 mb-4">Manage hotels and properties</p>
                        <a href="/admin/hotels" className="text-blue-600 hover:text-blue-800">
                          Go to Hotel Management →
                        </a>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">⚙️ System Settings</h3>
                        <p className="text-gray-600 mb-4">Configure system settings</p>
                        <a href="/admin/system" className="text-blue-600 hover:text-blue-800">
                          Go to Settings →
                        </a>
                      </div>
                    </div>
                  </div>
                </RoleGuard>
              } 
            />
            
            <Route 
              path="users" 
              element={
                <RoleGuard allowedRoles={[3]}> {/* Administrator only */}
                  <UserManagement />
                </RoleGuard>
              } 
            />
            
            <Route 
              path="hotels" 
              element={
                <RoleGuard allowedRoles={[3]}> {/* Administrator only */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Hotel Management</h2>
                    <p>Hotel administration features coming soon...</p>
                  </div>
                </RoleGuard>
              } 
            />
            
            <Route 
              path="system" 
              element={
                <RoleGuard allowedRoles={[3]}> {/* Administrator only */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">System Settings</h2>
                    <p>System configuration features coming soon...</p>
                  </div>
                </RoleGuard>
              } 
            />
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
