import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ScoringLeaderboard from '../components/dashboard/ScoringLeaderboard';
import QuickActions from '../components/dashboard/QuickActions';
import HotelList from '../components/hotels/HotelList';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Welcome back, {user.username}
          </h1>
          <p className="text-gray-600">
            Role: <span className="font-semibold text-orange-700">{user.role}</span>
          </p>
        </div>

        <QuickActions roleId={user.roleId} />

        {(user.roleId === 3 || user.roleId === 4) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Hotel Scoring Leaderboard</h2>
            <ScoringLeaderboard />
          </div>
        )}

        {user.roleId === 1 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Your Hotels</h2>
            <HotelList onlyManagedByUser={true} />
          </div>
        )}

        {user.roleId === 2 && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Top Performers</h2>
              <ScoringLeaderboard />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Browse Hotels</h2>
              <HotelList searchMode={true} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
