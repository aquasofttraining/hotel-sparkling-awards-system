import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ScoringLeaderboard from '../components/dashboard/ScoringLeaderboard';
import QuickActions from '../components/dashboard/QuickActions';
import HotelList from '../components/hotels/HotelList';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.username}
          </h1>
          <p className="text-gray-600">
            Role: <span className="font-semibold text-blue-600">{user.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {user.roleId === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Browse Hotels</h2>
                  <HotelList searchMode={true} />
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
                  <ScoringLeaderboard />
                </div>
              </div>
            )}

            {user.roleId === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Your Hotels</h2>
                <HotelList onlyManagedByUser={true} />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <QuickActions roleId={user.roleId} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
