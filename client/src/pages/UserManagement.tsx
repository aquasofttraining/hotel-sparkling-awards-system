import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  userManagementService,
  type User,
  type Role, 
  type Hotel 
} from '../services/userManagementService';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State declarations - ALL HOOKS MUST BE AT THE TOP
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Form state for modal
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '',
    accountStatus: 'active',
    hotelIds: [] as number[]
  });

  // ✅ Calculate isAdministrator outside useCallback to avoid dependency issues
  const isAdministrator = user && (
    user.role === 'Administrator' || 
    user.roleId === 3 ||
    user.role === 'administrator'
  );

  // Debug logging
  console.log('🔍 UserManagement Debug:', {
    user: user,
    userRole: user?.role,
    userRoleId: user?.roleId,
    isAdmin: isAdministrator
  });

  // ✅ Fixed fetchData function with proper dependencies
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !isAdministrator) {
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching user management data...');

      const [usersResponse, rolesResponse, hotelsResponse] = await Promise.all([
        userManagementService.getUsers({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined
        }),
        userManagementService.getRoles(),
        userManagementService.getHotels()
      ]);

      console.log('🔍 API Responses:', {
        users: usersResponse,
        roles: rolesResponse,
        hotels: hotelsResponse
      });

      if (usersResponse?.data) {
        setUsers(usersResponse.data.users || []);
        setTotalPages(usersResponse.data.pagination?.totalPages || 1);
        setTotalUsers(usersResponse.data.pagination?.total || 0);
      }
      
      if (rolesResponse?.data) {
        setRoles(rolesResponse.data.roles || []);
      }
      
      if (hotelsResponse?.data) {
        setHotels(hotelsResponse.data.hotels || []);
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, isAdministrator, currentPage, searchTerm, roleFilter, statusFilter]);

  // UseEffect hook - MUST BE BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    if (user && isAdministrator) {
      fetchData();
    }
  }, [fetchData, user, isAdministrator]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Event handlers
  const handleCreateUser = (): void => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      roleId: '',
      accountStatus: 'active',
      hotelIds: []
    });
    setShowModal(true);
  };

  const handleEditUser = (userToEdit: User): void => {
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username || '',
      email: userToEdit.email || '',
      password: '',
      firstName: userToEdit.firstName || '',
      lastName: userToEdit.lastName || '',
      roleId: userToEdit.roleId?.toString() || '',
      accountStatus: userToEdit.accountStatus || 'active',
      hotelIds: userToEdit.managedHotels?.map(hm => hm.hotelId) || []
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userManagementService.deleteUser(userId);
        setSuccess('User deactivated successfully');
        await fetchData();
      } catch (err) {
        console.error('❌ Delete error:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const handleModalClose = (): void => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      roleId: '',
      accountStatus: 'active',
      hotelIds: []
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roleId: Number(formData.roleId),
        accountStatus: formData.accountStatus,
        hotelIds: formData.hotelIds,
        ...(formData.password && { password: formData.password })
      };

      if (editingUser) {
        await userManagementService.updateUser(editingUser.id, userData);
        setSuccess('User updated successfully');
      } else {
        if (!formData.password) {
          setError('Password is required for new users');
          return;
        }
        await userManagementService.createUser({ ...userData, password: formData.password });
        setSuccess('User created successfully');
      }

      handleModalClose();
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHotelChange = (hotelId: number, checked: boolean): void => {
    setFormData(prev => ({
      ...prev,
      hotelIds: checked 
        ? [...prev.hotelIds, hotelId]
        : prev.hotelIds.filter(id => id !== hotelId)
    }));
  };

  const getStatusBadge = (status: string): React.ReactElement => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const isHotelManager = roles.find(r => r.id === Number(formData.roleId))?.role === 'Hotel Manager';

  // Conditional returns AFTER all hooks
  if (!user || !isAdministrator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm text-left max-w-md">
            <strong>Debug Info:</strong>
            <pre className="text-xs mt-2">{JSON.stringify({ 
              hasUser: !!user, 
              role: user?.role, 
              roleId: user?.roleId,
              isAdmin: isAdministrator 
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600">Manage system users and their roles</p>
            </div>
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create New User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.role}>
                    {role.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="px-6 py-4 bg-green-50 border-l-4 border-green-500">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotels Managed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {(userItem.firstName?.[0] || userItem.username[0]).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userItem.username} • {userItem.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {userItem.role?.role || 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(userItem.accountStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {userItem.managedHotels && userItem.managedHotels.length > 0 ? (
                      <div className="text-sm text-gray-900">
                        {userItem.managedHotels.length} hotel{userItem.managedHotels.length !== 1 ? 's' : ''}
                        <div className="text-xs text-gray-500">
                          {userItem.managedHotels.slice(0, 2).map(hm => hm.hotel.GlobalPropertyName).join(', ')}
                          {userItem.managedHotels.length > 2 && `... +${userItem.managedHotels.length - 2} more`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(userItem.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(userItem)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        disabled={userItem.accountStatus === 'inactive'}
                      >
                        {userItem.accountStatus === 'inactive' ? 'Deactivated' : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {totalUsers} total users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <select
                  name="accountStatus"
                  value={formData.accountStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {isHotelManager && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Hotels
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {hotels.map(hotel => (
                      <label key={hotel.GlobalPropertyID} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={formData.hotelIds.includes(hotel.GlobalPropertyID)}
                          onChange={(e) => handleHotelChange(hotel.GlobalPropertyID, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{hotel.GlobalPropertyName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={modalLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
