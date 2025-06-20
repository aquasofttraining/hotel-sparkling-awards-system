import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold">
              Hotel Awards
            </Link>
            
            <div className="flex space-x-4">
              <Link to="/dashboard" className="hover:text-blue-200">
                Dashboard
              </Link>
              <Link to="/explore-hotels" className="hover:text-blue-200">
                Explore Hotels
              </Link>
              <Link to="/scoring-leaderboard" className="hover:text-blue-200">
                Rankings
              </Link>
              <Link to="/profile" className="hover:text-blue-200">
                Profile
              </Link>

              {user.roleId === 3 && (
                <>
                  <Link to="/users" className="hover:text-blue-200">
                    Users
                  </Link>
                  <Link to="/hotels/add" className="hover:text-blue-200">
                    Add Hotel
                  </Link>
                </>
              )}

              {user.roleId === 1 && (
                <Link to="/my-hotels" className="hover:text-blue-200">
                  My Hotels
                </Link>
              )}

              {user.roleId === 4 && (
                <Link to="/hotels/add" className="hover:text-blue-200">
                  Add Hotel
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user.username} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
