import React, { useState } from 'react';
import { useScoring } from '../hooks/useScoring';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const HotelLeaderboardPage: React.FC = () => {
  const { scoringData, loading, error, filters, setFilters } = useScoring();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  // Helper function to safely format numbers - FIXES THE toFixed ERROR
  const safeToFixed = (value: any, decimals: number = 2): string => {
    if (!value && value !== 0) return 'N/A';
    const num = Number(value);
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  const getRoleBasedActions = (hotel: any) => {
    const actions = [];

    // View Details - available to all
    actions.push(
      <button
        key="view"
        onClick={() => navigate(`/hotels/${hotel.hotelId}`)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
      >
        View
      </button>
    );

    // Role-specific actions
    switch (user?.roleId) {
      case 1: // Hotel Manager
        if (user.hotelId === hotel.hotelId) {
          actions.push(
            <button
              key="manage"
              onClick={() => navigate(`/hotels/edit/${hotel.hotelId}`)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
            >
              Manage
            </button>
          );
        }
        break;

      case 2: // Traveler
        actions.push(
          <button
            key="book"
            onClick={() => {/* Booking logic */}}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
          >
            Book
          </button>
        );
        break;

      case 3: // Administrator
        actions.push(
          <button
            key="edit"
            onClick={() => navigate(`/hotels/edit/${hotel.hotelId}`)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
          >
            Edit
          </button>
        );
        actions.push(
          <button
            key="recalc"
            onClick={() => {/* Recalculate logic */}}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
          >
            Recalc
          </button>
        );
        break;

      case 4: // Data Operator
        actions.push(
          <button
            key="update"
            onClick={() => {/* Update score logic */}}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
          >
            Update
          </button>
        );
        break;
    }

    return actions;
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Hotel Sparkling Awards Leaderboard</h1>
        <p className="text-gray-600">Official rankings based on Sparkling Score algorithm</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
              <select
                value={filters.sortBy || 'sparklingScore'}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="sparklingScore">Sparkling Score</option>
                <option value="totalReviews">Total Reviews</option>
                <option value="hotelName">Hotel Name</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
              <select
                value={filters.sortOrder || 'DESC'}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="DESC">High to Low</option>
                <option value="ASC">Low to High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Card View
            </button>
            <button
              onClick={() => navigate('/explore-hotels')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              Explore Hotels
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-100 to-blue-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Hotel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Sparkling Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Review Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Metadata Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Stars</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Reviews</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scoringData.map((hotel) => (
                <tr 
                  key={hotel.hotelId}
                  className={`hover:bg-blue-50 transition-colors ${
                    hotel.ranking === 1 ? 'bg-yellow-50' :
                    hotel.ranking === 2 ? 'bg-gray-50' :
                    hotel.ranking === 3 ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-900">#{hotel.ranking}</span>
                      {hotel.ranking === 1 && <span className="text-2xl">🥇</span>}
                      {hotel.ranking === 2 && <span className="text-2xl">🥈</span>}
                      {hotel.ranking === 3 && <span className="text-2xl">🥉</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-blue-900">{hotel.hotelName}</div>
                    <div className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xl font-bold text-orange-700">

                      {safeToFixed(hotel.sparklingScore)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {safeToFixed(hotel.reviewComponent)}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {safeToFixed(hotel.metadataComponent)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg">{'⭐'.repeat(hotel.hotelStars || 0)}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {hotel.totalReviews || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {getRoleBasedActions(hotel)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scoringData.map((hotel) => (
            <div 
              key={hotel.hotelId}
              className={`bg-white rounded-lg shadow-md p-6 ${
                hotel.ranking <= 3 ? 'border-2 border-orange-300' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-blue-900">#{hotel.ranking}</span>
                    {hotel.ranking === 1 && <span className="text-3xl">🥇</span>}
                    {hotel.ranking === 2 && <span className="text-3xl">🥈</span>}
                    {hotel.ranking === 3 && <span className="text-3xl">🥉</span>}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900">{hotel.hotelName}</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-700">
                    {safeToFixed(hotel.sparklingScore)}
                  </div>
                  <div className="text-sm text-gray-600">Sparkling Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Review Score:</span>
                  <span className="ml-1">
                    {safeToFixed(hotel.reviewComponent)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Metadata Score:</span>
                  <span className="ml-1">
                    {safeToFixed(hotel.metadataComponent)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Stars:</span>
                  <span className="ml-1">{'⭐'.repeat(hotel.hotelStars || 0)}</span>
                </div>
                <div>
                  <span className="font-medium">Reviews:</span>
                  <span className="ml-1">{hotel.totalReviews || 0}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {getRoleBasedActions(hotel)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelLeaderboardPage;
