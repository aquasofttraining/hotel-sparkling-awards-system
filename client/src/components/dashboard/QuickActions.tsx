import React from 'react';
import { Link } from 'react-router-dom';

interface QuickActionsProps {
  roleId: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({ roleId }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      
      <div className="space-y-4">
        {roleId === 3 && (
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium text-blue-700 mb-2">Admin Actions</h3>
            <div className="space-y-2">
              <Link 
                to="/users" 
                className="block text-blue-600 hover:text-blue-800 text-sm"
              >
                Manage Users
              </Link>
              <Link 
                to="/hotels/add" 
                className="block text-blue-600 hover:text-blue-800 text-sm"
              >
                Add Hotel
              </Link>
              <Link 
                to="/scoring-leaderboard" 
                className="block text-blue-600 hover:text-blue-800 text-sm"
              >
                View Rankings
              </Link>
            </div>
          </div>
        )}

        {roleId === 1 && (
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium text-green-700 mb-2">Manager Actions</h3>
            <div className="space-y-2">
              <Link 
                to="/my-hotels" 
                className="block text-green-600 hover:text-green-800 text-sm"
              >
                View Assigned Hotels
              </Link>
              <Link 
                to="/scoring-leaderboard" 
                className="block text-green-600 hover:text-green-800 text-sm"
              >
                Hotel Rankings
              </Link>
            </div>
          </div>
        )}

        {roleId === 2 && (
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-medium text-purple-700 mb-2">Traveler Actions</h3>
            <div className="space-y-2">
              <Link 
                to="/explore-hotels" 
                className="block text-purple-600 hover:text-purple-800 text-sm"
              >
                Browse Hotels
              </Link>
              <Link 
                to="/scoring-leaderboard" 
                className="block text-purple-600 hover:text-purple-800 text-sm"
              >
                View Rankings
              </Link>
            </div>
          </div>
        )}

        {roleId === 4 && (
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-medium text-orange-700 mb-2">Data Operator Actions</h3>
            <div className="space-y-2">
              <Link 
                to="/hotels/add" 
                className="block text-orange-600 hover:text-orange-800 text-sm"
              >
                Add Hotel
              </Link>
              <Link 
                to="/scoring-leaderboard" 
                className="block text-orange-600 hover:text-orange-800 text-sm"
              >
                View Reports
              </Link>
              <Link 
                to="/users" 
                className="block text-orange-600 hover:text-orange-800 text-sm"
              >
                Export Data
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActions;
