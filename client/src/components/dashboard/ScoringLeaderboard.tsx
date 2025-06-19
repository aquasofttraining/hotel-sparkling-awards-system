import React from 'react';
import { useScoring } from '../../hooks/useScoring';
import { scoringService } from '../../services/scoringService';
import { authService } from '../../services/authService';

const ScoringLeaderboard: React.FC = () => {
  const { scoringData, loading, error, filters, setFilters, refreshScoring } = useScoring();
  const [recalculating, setRecalculating] = React.useState(false);
  const user = authService.getCurrentUser();
  const canRecalculate = user && ['Administrator', 'Data Operator'].includes(user.role);

  const handleRecalculate = async () => {
    if (!recalculating) return;

    setRecalculating(true);
    try {
      await scoringService.recalculateAllScores();
      await refreshScoring();
      alert('Scores recalculated successfully!');
    } catch (err) {
      console.error('Recalculation failed:', err);
      alert('Failed to recalculate scores.');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
          <span className="mr-3">🏆</span>
          Hotel Sparkling Awards Leaderboard
        </h2>
        
        {canRecalculate && (
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            {recalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calculating...
              </>
            ) : (
              'Recalculate All Scores'
            )}
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Sort by:</label>
          <select
            value={filters.sortBy || 'sparklingScore'}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="sparklingScore">Sparkling Score</option>
            <option value="totalReviews">Total Reviews</option>
            <option value="hotelName">Hotel Name</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Order:</label>
          <select
            value={filters.sortOrder || 'DESC'}
            onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="DESC">High to Low</option>
            <option value="ASC">Low to High</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
        <div className="overflow-x-auto">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scoringData.map((hotel, index) => (
                <tr 
                  key={hotel.hotelId}
                  className={`hover:bg-blue-50 transition-colors ${
                    hotel.ranking === 1 ? 'bg-yellow-50' :
                    hotel.ranking === 2 ? 'bg-gray-50' :
                    hotel.ranking === 3 ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-900">#{hotel.ranking}</span>
                      {hotel.ranking === 1 && <span className="text-2xl">🥇</span>}
                      {hotel.ranking === 2 && <span className="text-2xl">🥈</span>}
                      {hotel.ranking === 3 && <span className="text-2xl">🥉</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-blue-900">{hotel.hotelName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-orange-700">
                      {hotel.sparklingScore?.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {hotel.reviewComponent?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {hotel.metadataComponent?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg">{'⭐'.repeat(hotel.hotelStars || 0)}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {hotel.totalReviews}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScoringLeaderboard;
