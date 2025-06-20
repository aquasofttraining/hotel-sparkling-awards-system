import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoring } from '../hooks/useScoring';
import { authService } from '../services/authService';
import { scoringService } from '../services/scoringService';

const HotelLeaderboardPage: React.FC = () => {
  const { scoringData, loading, error, filters, setFilters, refreshScoring } = useScoring();
  const [viewMode, setViewMode] = useState<'table' | 'detailed'>('table');
  const [isProcessing, setIsProcessing] = useState(false);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleRecalculate = async (hotelId: number) => {
    try {
      const userRole = user?.role;
      if (!userRole || !['Administrator', 'Data Operator', 'Hotel Manager'].includes(userRole)) {
        alert('Access denied: Insufficient permissions to recalculate scores');
        return;
      }
      
      setIsProcessing(true);
      await scoringService.calculateHotelScore(hotelId);
      alert('Score recalculated successfully');
      await refreshScoring();
      
    } catch (error) {
      console.error('Recalculate error:', error);
      alert('Failed to recalculate score');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (!window.confirm('Recalculate all hotel scores? This may take several minutes.')) return;
    
    try {
      const userRole = user?.role;
      if (!userRole || !['Administrator', 'Data Operator'].includes(userRole)) {
        alert('Access denied: Only administrators and data operators can recalculate all scores');
        return;
      }
      
      setIsProcessing(true);
      await scoringService.recalculateAllScores();
      alert('All scores recalculated successfully');
      await refreshScoring();
      
    } catch (error) {
      console.error('Recalculate all error:', error);
      alert('Failed to recalculate scores');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewHotel = (hotelId: number) => {
    navigate(`/hotels/${hotelId}`);
  };

  const handleUpdateHotel = (hotelId: number) => {
    navigate(`/hotels/${hotelId}/edit`);
  };

  const handleAddHotel = () => {
    const userRole = user?.role;
    if (!userRole || !['Administrator', 'Data Operator'].includes(userRole)) {
      alert('Access denied: Only administrators and data operators can add hotels');
      return;
    }
    navigate('/hotels/add');
  };

  const getRoleActions = (hotel: any) => {
    const actions: React.ReactElement[] = [];
    const hotelId = hotel.hotel_id || hotel.hotelId;
    const hotelName = hotel.hotel_name || hotel.hotelName;

    if (!hotelId || !user) {
      return actions;
    }

    actions.push(
      <button
        key="view"
        onClick={() => handleViewHotel(hotelId)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm mr-1 hover:bg-blue-700 transition-colors"
        disabled={isProcessing}
        title={`View details for ${hotelName}`}
      >
        View
      </button>
    );

    const userRole = user.role;

    if (['Hotel Manager', 'Administrator', 'Data Operator'].includes(userRole)) {
      actions.push(
        <button
          key="update"
          onClick={() => handleUpdateHotel(hotelId)}
          className="bg-orange-600 text-white px-3 py-1 rounded text-sm mr-1 hover:bg-orange-700 transition-colors"
          disabled={isProcessing}
          title="Update hotel data"
        >
          Update
        </button>
      );
      
      actions.push(
        <button
          key="recalc"
          onClick={() => handleRecalculate(hotelId)}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm mr-1 hover:bg-purple-700 transition-colors"
          disabled={isProcessing}
          title="Recalculate hotel score"
        >
          Recalculate
        </button>
      );
    }

    return actions;
  };

  const getHotelValue = (hotel: any, field: string, fallback: any = 0) => {
    const value = hotel[field] || hotel[field.toLowerCase()] || hotel[field.replace(/([A-Z])/g, '_$1').toLowerCase()];
    return value !== undefined && value !== null ? value : fallback;
  };

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
      <span>Loading hotel rankings...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <strong>Error: </strong>{error}
      <button 
        onClick={() => refreshScoring()}
        className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-lg">Processing... Please wait</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Hotel Sparkling Awards Leaderboard</h1>
        <p className="text-gray-600">
          Rankings based on review sentiment analysis and hotel metadata ({scoringData?.length || 0} hotels)
        </p>
        
        {user && (
          <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            Logged in as: {user.username || user.email} ({user.role})
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
              <select
                value={filters.sortBy || 'sparkling_score'}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              >
                <option value="sparkling_score">Sparkling Score</option>
                <option value="review_component">Review Score</option>
                <option value="metadata_component">Metadata Score</option>
                <option value="ranking">Ranking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
              <select
                value={filters.sortOrder || 'DESC'}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'ASC' | 'DESC' })}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              >
                <option value="DESC">High to Low</option>
                <option value="ASC">Low to High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={isProcessing}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={isProcessing}
            >
              Detailed
            </button>
          </div>
        </div>

        {user?.role && ['Administrator', 'Data Operator'].includes(user.role) && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Administrative Actions:</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleAddHotel}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-medium"
                disabled={isProcessing}
                title="Add new hotel"
              >
                Add Hotel
              </button>
              <button
                onClick={handleRecalculateAll}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors font-medium"
                disabled={isProcessing}
                title="Recalculate all hotel scores"
              >
                Recalculate All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Scoring Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-blue-800">Review Component (70% weight):</strong>
            <div className="text-gray-700 mt-1">
              Amenities • Cleanliness • Food & Beverage • Sleep Quality • Internet Quality
            </div>
          </div>
          <div>
            <strong className="text-blue-800">Metadata Component (30% weight):</strong>
            <div className="text-gray-700 mt-1">
              Distance to Airport • Hotel Star Rating • Number of Rooms • Number of Floors
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
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
                {scoringData?.map((hotel: any, index: number) => {
                  const hotelId = hotel.hotel_id || hotel.hotelId;
                  const hotelName = hotel.hotel_name || hotel.hotelName;
                  const ranking = hotel.ranking || (index + 1);
                  
                  return (
                    <tr 
                      key={hotelId || index}
                      className={`hover:bg-blue-50 transition-colors ${
                        ranking === 1 ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                        ranking === 2 ? 'bg-gray-50 border-l-4 border-gray-400' :
                        ranking === 3 ? 'bg-orange-50 border-l-4 border-orange-400' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-900">#{ranking}</span>
                          {ranking === 1 && <span className="text-2xl">🥇</span>}
                          {ranking === 2 && <span className="text-2xl">🥈</span>}
                          {ranking === 3 && <span className="text-2xl">🥉</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-900">{hotelName || 'Unnamed Hotel'}</div>
                        <div className="text-xs text-gray-500">ID: {hotelId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xl font-bold text-orange-700">
                          {Number(getHotelValue(hotel, 'sparklingScore')).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {Number(getHotelValue(hotel, 'reviewComponent')).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {Number(getHotelValue(hotel, 'metadataComponent')).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-lg">
                          {'⭐'.repeat(getHotelValue(hotel, 'hotelStars', 0))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {getHotelValue(hotel, 'totalReviews')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {getRoleActions(hotel)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {scoringData?.map((hotel: any, index: number) => {
            const hotelId = hotel.hotel_id || hotel.hotelId;
            const hotelName = hotel.hotel_name || hotel.hotelName;
            const ranking = hotel.ranking || (index + 1);
            
            return (
              <div key={hotelId || index} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-blue-900">#{ranking}</span>
                      {ranking <= 3 && (
                        <span className="text-4xl">
                          {ranking === 1 ? '🥇' : ranking === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <h3 className="text-2xl font-bold text-blue-900">{hotelName || 'Unnamed Hotel'}</h3>
                    </div>
                    <div className="text-lg text-orange-700 font-semibold mb-1">
                      Sparkling Score: {Number(getHotelValue(hotel, 'sparklingScore')).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {getRoleActions(hotel)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <span className="block font-medium text-gray-600">Review Score</span>
                    <div className="text-2xl font-bold text-green-600">
                      {Number(getHotelValue(hotel, 'reviewComponent')).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="block font-medium text-gray-600">Metadata Score</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {Number(getHotelValue(hotel, 'metadataComponent')).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="block font-medium text-gray-600">Hotel Stars</span>
                    <div className="text-2xl">
                      {'⭐'.repeat(getHotelValue(hotel, 'hotelStars', 0))}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="block font-medium text-gray-600">Total Reviews</span>
                    <div className="text-2xl font-bold text-purple-600">
                      {getHotelValue(hotel, 'totalReviews')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && (!scoringData || scoringData.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hotels Found</h3>
          <p className="text-gray-500">No hotel data available to display rankings.</p>
          {user?.role && ['Administrator', 'Data Operator'].includes(user.role) && (
            <button
              onClick={handleAddHotel}
              className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add First Hotel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelLeaderboardPage;
