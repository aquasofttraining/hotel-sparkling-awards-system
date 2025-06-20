import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID</label>
            <p className="text-gray-900">{user.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="text-gray-900">{user.username}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900">{user.role} (ID: {user.roleId})</p>
          </div>
          
          {user.hotelId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Hotel ID</label>
              <p className="text-gray-900">{user.hotelId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
