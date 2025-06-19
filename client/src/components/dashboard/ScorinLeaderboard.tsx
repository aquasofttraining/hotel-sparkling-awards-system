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
    if (!canRecalculate) return;

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

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">🏆 Hotel Sparkling Awards Leaderboard</h2>
        {canRecalculate && (
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            {recalculating ? 'Calculating...' : 'Recalculate All Scores'}
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <select
          value={filters.sortBy || 'sparklingScore'}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="sparklingScore">Sparkling Score</option>
          <option value="totalReviews">Total Reviews</option>
          <option value="hotelName">Hotel Name</option>
        </select>
        <select
          value={filters.sortOrder || 'DESC'}
          onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="DESC">High to Low</option>
          <option value="ASC">Low to High</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-3 text-left text-blue-900 font-semibold">Rank</th>
              <th className="px-4 py-3 text-left text-blue-900 font-semibold">Hotel</th>
              <th className="px-4 py-3 text-left text-blue-900 font-semibold">Sparkling Score</th>
              <th className="px-4 py-3 text-left text-blue-900 font-semibold">Review Score</th>
              <th className="px-4 py-3 text-left text-blue-900 font-semibold">Metadata Score</th>
              <th className="px-4 py-3 text-left text-blue-900 font-semibold">Stars</th>
              <th className="px-4 py-3 text-left text-blue-900 font-semibold">Reviews</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scoringData.map((hotel) => (
              <tr key={hotel.hotelId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900">#{hotel.ranking}</span>
                    {hotel.ranking === 1 && <span>🥇</span>}
                    {hotel.ranking === 2 && <span>🥈</span>}
                    {hotel.ranking === 3 && <span>🥉</span>}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-blue-900">{hotel.hotelName}</td>
                <td className="px-4 py-3 font-bold text-orange-700">{hotel.sparklingScore?.toFixed(2)}</td>
                <td className="px-4 py-3">{hotel.reviewComponent?.toFixed(2)}</td>
                <td className="px-4 py-3">{hotel.metadataComponent?.toFixed(2)}</td>
                <td className="px-4 py-3">{'⭐'.repeat(hotel.hotelStars || 0)}</td>
                <td className="px-4 py-3">{hotel.totalReviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoringLeaderboard;
