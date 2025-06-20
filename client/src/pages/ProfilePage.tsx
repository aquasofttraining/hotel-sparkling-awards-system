import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-gray-900">{user.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-gray-900">{user.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role} (ID: {user.roleId})
                  </span>
                </div>
              </div>

              {user.firstName  && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="mt-1 text-gray-900">{user.firstName || 'Not provided'}</p>
                </div>
              )}

              {user.lastName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-gray-900">{user.lastName}</p>
                </div>
              )}

              {user.hotelId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Hotel ID</label>
                  <p className="mt-1 text-gray-900">{user.hotelId}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <p className="mt-1 text-gray-900 capitalize">{user.accountStatus}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                <p className="mt-1 text-gray-900">{user.emailVerified ? 'Yes' : 'No'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Review Count</label>
                <p className="mt-1 text-gray-900">{user.reviewCount || 0}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Role Permissions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {user.roleId === 1 && (
                  <div>
                    <h4 className="font-medium text-green-700">Hotel Manager</h4>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                      <li>View and manage assigned hotels</li>
                      <li>Update hotel information</li>
                      <li>View hotel scoring and reviews</li>
                    </ul>
                  </div>
                )}
                
                {user.roleId === 2 && (
                  <div>
                    <h4 className="font-medium text-purple-700">Traveler</h4>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Browse and explore hotels</li>
                      <li>View hotel rankings and scores</li>
                      <li>Access hotel reviews</li>
                    </ul>
                  </div>
                )}
                
                {user.roleId === 3 && (
                  <div>
                    <h4 className="font-medium text-blue-700">Administrator</h4>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Full system access</li>
                      <li>User management</li>
                      <li>Hotel management and creation</li>
                      <li>Scoring system administration</li>
                    </ul>
                  </div>
                )}
                
                {user.roleId === 4 && (
                  <div>
                    <h4 className="font-medium text-orange-700">Data Operator</h4>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Hotel data management</li>
                      <li>Scoring system operations</li>
                      <li>Data export capabilities</li>
                      <li>Review data analysis</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
