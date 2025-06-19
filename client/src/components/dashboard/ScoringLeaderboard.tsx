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

  if (loading) return <div className="loading-spinner">Loading scores...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="scoring-leaderboard">
      <div className="leaderboard-header">
        <h2>Hotel Sparkling Awards Leaderboard</h2>
        {canRecalculate && (
          <button className="btn-primary" onClick={handleRecalculate} disabled={recalculating}>
            {recalculating ? 'Calculating...' : 'Recalculate All Scores'}
          </button>
        )}
      </div>

      <div className="leaderboard-controls">
        <select
          value={filters.sortBy || 'sparklingScore'}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'sparklingScore' | 'totalReviews' | 'hotelName' }))}
        >
          <option value="sparklingScore">Sparkling Score</option>
          <option value="totalReviews">Total Reviews</option>
          <option value="hotelName">Hotel Name</option>
        </select>
        <select
          value={filters.sortOrder || 'DESC'}
          onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'ASC' | 'DESC' }))}
        >
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>
      </div>

      <div className="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Hotel</th>
              <th>Sparkling Score</th>
              <th>Review Score</th>
              <th>Metadata Score</th>
              <th>Stars</th>
              <th>Reviews</th>
            </tr>
          </thead>
          <tbody>
            {scoringData.map((hotel, index) => (
              <tr key={hotel.hotelId} className={`rank-${hotel.ranking <= 3 ? hotel.ranking : 'other'}`}>
                <td className="rank-cell">
                  <span className="rank-number">#{hotel.ranking}</span>
                  {hotel.ranking === 1 && <span className="medal">🥇</span>}
                  {hotel.ranking === 2 && <span className="medal">🥈</span>}
                  {hotel.ranking === 3 && <span className="medal">🥉</span>}
                </td>
                <td className="hotel-name">{hotel.hotelName}</td>
                <td className="score-primary">{hotel.sparklingScore?.toFixed(2)}</td>
                <td>{hotel.reviewComponent?.toFixed(2)}</td>
                <td>{hotel.metadataComponent?.toFixed(2)}</td>
                <td>{'⭐'.repeat(hotel.hotelStars || 0)}</td>
                <td>{hotel.totalReviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoringLeaderboard;
