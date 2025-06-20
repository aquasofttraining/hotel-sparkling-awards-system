import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  allowedRoles: number[];
}

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // Define main navigation items with role-based access
  const mainNavItems: NavigationItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', allowedRoles: [1, 2, 3, 4] },
    { path: '/explore-hotels', label: 'Explore Hotels', icon: '🏨', allowedRoles: [1, 2, 3, 4] },
    { path: '/scoring-leaderboard', label: 'Rankings', icon: '🏆', allowedRoles: [1, 2, 3, 4] },
    { path: '/profile', label: 'Profile', icon: '👤', allowedRoles: [1, 2, 3, 4] },
  ];

  // Role-specific navigation items
  const roleSpecificItems: NavigationItem[] = [
    // Hotel Manager specific
    { path: '/my-hotels', label: 'My Hotels', icon: '🏨', allowedRoles: [1] },
    
    // Data Operator specific
    { path: '/hotels/add', label: 'Add Hotel', icon: '➕', allowedRoles: [3, 4] },
  ];

  // Administrator dropdown items
  const adminDropdownItems: NavigationItem[] = [
    { path: '/admin/users', label: 'User Management', icon: '👥', allowedRoles: [3] },
    { path: '/admin/hotels', label: 'Hotel Management', icon: '🏨', allowedRoles: [3] },
    { path: '/admin/system', label: 'System Settings', icon: '⚙️', allowedRoles: [3] },
  ];

  // Helper function to check if user can access a navigation item
  const canAccess = (allowedRoles: number[]): boolean => {
    return allowedRoles.includes(user.roleId);
  };

  // Helper function to check if current path is active
  const isActivePath = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get role display name
  const getRoleDisplayName = (roleId: number): string => {
    const roleMap: { [key: number]: string } = {
      1: 'Hotel Manager',
      2: 'Traveler',
      3: 'Administrator',
      4: 'Data Operator'
    };
    return roleMap[roleId] || 'Unknown';
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="text-xl font-bold hover:text-blue-200 transition-colors"
            >
              🏆 Hotel Awards
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {/* Main navigation items */}
              {mainNavItems
                .filter(item => canAccess(item.allowedRoles))
                .map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-100 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                  </Link>
                ))
              }

              {/* Role-specific navigation items */}
              {roleSpecificItems
                .filter(item => canAccess(item.allowedRoles))
                .map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-100 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.label}
                  </Link>
                ))
              }

              {/* Administrator dropdown */}
              {canAccess([3]) && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-100 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <span className="mr-1">⚙️</span>
                    Admin
                    <svg 
                      className={`ml-1 h-4 w-4 transition-transform ${showAdminDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showAdminDropdown && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                      {adminDropdownItems.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowAdminDropdown(false)}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActivePath(item.path)
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.icon && <span className="mr-2">{item.icon}</span>}
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium">{user.username}</div>
              <div className="text-xs text-blue-200">{getRoleDisplayName(user.roleId)}</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="p-2 rounded-full hover:bg-blue-700 transition-colors"
                title="Profile Settings"
                style={{ width: '40px', height: '40px' }} 
              >
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ maxWidth: '20px', maxHeight: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {[...mainNavItems, ...roleSpecificItems]
              .filter(item => canAccess(item.allowedRoles))
              .map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1 rounded text-sm ${
                    isActivePath(item.path)
                      ? 'bg-blue-900 text-white'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
