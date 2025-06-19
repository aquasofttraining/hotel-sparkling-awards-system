import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoring } from '../hooks/useScoring';
import { authService } from '../services/authService';
import { scoringService } from '../services/scoringService';

const HotelLeaderboardPage: React.FC = () => {
  const { scoringData, loading, error, filters, setFilters } = useScoring();
  const [viewMode, setViewMode] = useState<'table' | 'detailed'>('table');
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleRecalculate = async (hotelId: number) => {
    try {
      await scoringService.calculateHotelScore(hotelId);
      window.location.reload();
      alert('Score recalculated successfully');
    } catch (error) {
      alert('Failed to recalculate score');
    }
  };

  const handleRecalculateAll = async () => {
    if (!window.confirm('Recalculate all hotel scores?')) return;
    try {
      await scoringService.recalculateAllScores();
      window.location.reload();
      alert('All scores recalculated successfully');
    } catch (error) {
      alert('Failed to recalculate scores');
    }
  };

  const getRoleActions = (hotel: any) => {
    const actions = [];

    actions.push(
      <button
        key="view"
        onClick={() => navigate(`/hotels/${hotel.hotelId}`)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm mr-1"
      >
        View
      </button>
    );

    if (user?.roleId === 1 && user.hotelId === hotel.hotelId) {
      actions.push(
        <button
          key="manage"
          onClick={() => navigate(`/hotels/edit/${hotel.hotelId}`)}
          className="bg-orange-600 text-white px-3 py-1 rounded text-sm mr-1"
        >
          Manage
        </button>
      );
    }

    if (user?.roleId === 2) {
      actions.push(
        <button
          key="book"
          onClick={() => window.open(`https://booking.com`, '_blank')}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-1"
        >
          Book
        </button>
      );
    }

    if (user?.roleId === 3) {
      actions.push(
        <button
          key="edit"
          onClick={() => navigate(`/hotels/edit/${hotel.hotelId}`)}
          className="bg-orange-600 text-white px-3 py-1 rounded text-sm mr-1"
        >
          Edit
        </button>
      );
      actions.push(
        <button
          key="recalc"
          onClick={() => handleRecalculate(hotel.hotelId)}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm mr-1"
        >
          Recalculate
        </button>
      );
    }

    if (user?.roleId === 4) {
      actions.push(
        <button
          key="update"
          onClick={() => handleRecalculate(hotel.hotelId)}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm mr-1"
        >
          Update
        </button>
      );
    }

    return actions;
  };

  if (loading) return <div className="flex justify-center py-8">Loading hotel rankings...</div>;
  if (error) return <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Hotel Sparkling Awards Leaderboard</h1>
        <p className="text-gray-600">Rankings based on review sentiment analysis and hotel metadata ({scoringData.length} hotels)</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
              <select
                value={filters.sortBy || 'sparklingScore'}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="sparklingScore">Sparkling Score</option>
                <option value="reviewComponent">Review Score</option>
                <option value="metadataComponent">Metadata Score</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
              <select
                value={filters.sortOrder || 'DESC'}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'ASC' | 'DESC' })}
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
              className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded ${viewMode === 'detailed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Detailed
            </button>
          </div>
        </div>

        {user?.roleId === 3 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/hotels/add')}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Add Hotel
              </button>
              <button
                onClick={handleRecalculateAll}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Recalculate All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Review Score (60% weight):</strong>
            <div className="text-gray-700">Amenities • Cleanliness • Food/Beverage • Sleep Quality • Internet Quality</div>
          </div>
          <div>
            <strong>Metadata Score (40% weight):</strong>
            <div className="text-gray-700">Airport Distance • Hotel Stars • Rooms Count • Floors Count</div>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-100 to-blue-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Hotel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Sparkling Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Review Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Metadata Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Stars</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Reviews</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scoringData.map((hotel: any) => (
                <tr 
                  key={hotel.hotelId}
                  className={`hover:bg-blue-50 ${
                    hotel.ranking === 1 ? 'bg-yellow-50' :
                    hotel.ranking === 2 ? 'bg-gray-50' :
                    hotel.ranking === 3 ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-900">#{hotel.ranking}</span>
                      {hotel.ranking === 1 && <span className="text-xl">🥇</span>}
                      {hotel.ranking === 2 && <span className="text-xl">🥈</span>}
                      {hotel.ranking === 3 && <span className="text-xl">🥉</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-blue-900">{hotel.hotelName}</div>
                    <div className="text-xs text-gray-500">ID: {hotel.hotelId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xl font-bold text-orange-700">
                      {Number(hotel.sparklingScore).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {Number(hotel.reviewComponent).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {Number(hotel.metadataComponent).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-lg">{'⭐'.repeat(hotel.hotelStars || 0)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {hotel.totalReviews}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {getRoleActions(hotel)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {scoringData.map((hotel: any) => (
            <div key={hotel.hotelId} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-blue-900">#{hotel.ranking}</span>
                    {hotel.ranking <= 3 && (
                      <span className="text-3xl">
                        {hotel.ranking === 1 ? '🥇' : hotel.ranking === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-blue-900">{hotel.hotelName}</h3>
                  </div>
                  <div className="text-lg text-orange-700 font-semibold">
                    Sparkling Score: {Number(hotel.sparklingScore).toFixed(2)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {getRoleActions(hotel)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Review Features (60%)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Amenities:</span>
                      <span className="font-medium">{Number(hotel.amenitiesRate).toFixed(2)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cleanliness:</span>
                      <span className="font-medium">{Number(hotel.cleanlinessRate).toFixed(2)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food & Beverage:</span>
                      <span className="font-medium">{Number(hotel.foodBeverage).toFixed(2)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sleep Quality:</span>
                      <span className="font-medium">{Number(hotel.sleepQuality).toFixed(2)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Internet Quality:</span>
                      <span className="font-medium">{Number(hotel.internetQuality).toFixed(2)}/5</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Review Score:</span>
                      <span className="text-blue-700">{Number(hotel.reviewComponent).toFixed(2)}/5</span>
                    </div>
                  </div>
                </div>

                <div className="border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">Metadata Features (40%)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Distance to Airport:</span>
                      <span className="font-medium">{hotel.distanceToAirport} miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hotel Stars:</span>
                      <span className="font-medium">{'⭐'.repeat(hotel.hotelStars)} ({hotel.hotelStars}/5)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span className="font-medium">{hotel.roomsNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Reviews:</span>
                      <span className="font-medium">{hotel.totalReviews}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Metadata Score:</span>
                      <span className="text-orange-700">{Number(hotel.metadataComponent).toFixed(2)}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelLeaderboardPage;
