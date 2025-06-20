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
    if (recalculating) return;
    
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

  const safeToFixed = (value: any, decimals: number = 2): string => {
    if (!value && value !== 0) return 'N/A';
    const num = Number(value);
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
      <span>Loading rankings...</span>
    </div>
  );

  if (error) return (
    <div className="text-red-600 text-center py-8">{error}</div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hotel Sparkling Awards Leaderboard</h1>
        
        {canRecalculate && (
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {recalculating ? 'Recalculating...' : 'Recalculate All Scores'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-100 to-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sparkling Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metadata Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stars
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scoringData?.map((hotel, index) => (
                <tr 
                  key={hotel.hotel_id || index}
                  className={`hover:bg-gray-50 ${
                    hotel.ranking === 1 ? 'bg-yellow-50' :
                    hotel.ranking === 2 ? 'bg-gray-50' :
                    hotel.ranking === 3 ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <span className="text-lg font-bold">#{hotel.ranking}</span>
                      {hotel.ranking === 1 && <span className="ml-2 text-2xl">🥇</span>}
                      {hotel.ranking === 2 && <span className="ml-2 text-2xl">🥈</span>}
                      {hotel.ranking === 3 && <span className="ml-2 text-2xl">🥉</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {hotel.hotel_name || 'Unknown Hotel'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {hotel.hotel_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-orange-600">
                      {safeToFixed(hotel.sparkling_score)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {safeToFixed(hotel.review_component)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {safeToFixed(hotel.metadata_component)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-yellow-500">
                      {'⭐'.repeat(hotel.hotel_stars || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {hotel.total_reviews || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(!scoringData || scoringData.length === 0) && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hotels Found</h3>
          <p className="text-gray-500">No scoring data available to display rankings.</p>
        </div>
      )}
    </div>
  );
};

export default ScoringLeaderboard;
