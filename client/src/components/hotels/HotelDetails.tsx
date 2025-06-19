import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../../services/hotelService';
import { Hotel } from '../../types/hotel';
import ReviewList from '../reviews/ReviewList';
import { authService } from '../../services/authService';
import { scoringService } from '../../services/scoringService';

const HotelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const user = authService.getCurrentUser();

  const isHotelManagerOfThisHotel = user?.role === 'Hotel Manager' && user.hotelId === hotelId;
  const canCalculateScore = (user && ['Administrator', 'Data Operator'].includes(user.role)) || isHotelManagerOfThisHotel;
  const canEditHotel = (user && ['Administrator'].includes(user.role)) || isHotelManagerOfThisHotel; // Only Admin or manager of this hotel

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hotelService.getHotelById(hotelId);
      setHotel(data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied to this hotel.');
      } else {
        setError('Failed to load hotel details.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  const handleCalculateScore = async () => {
    if (!canCalculateScore) return;

    setCalculatingScore(true);
    try {
      await scoringService.calculateHotelScore(hotelId);
      await fetchHotelDetails(); // Refresh hotel data to get updated score
      alert('Hotel score calculated/updated successfully!');
    } catch (err) {
      console.error('Failed to calculate hotel score:', err);
      alert('Failed to calculate hotel score.');
    } finally {
      setCalculatingScore(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading hotel details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!hotel) return <div className="no-data">Hotel not found.</div>;

  return (
    <div className="hotel-details-page">
      <div className="hotel-details-header">
        <h2>{hotel.GlobalPropertyName}</h2>
        <div className="hotel-actions">
          {canCalculateScore && (
            <button className="btn-secondary" onClick={handleCalculateScore} disabled={calculatingScore}>
              {calculatingScore ? 'Calculating...' : 'Calculate/Update Score'}
            </button>
          )}
          {canEditHotel && (
            <button className="btn-secondary" onClick={() => navigate(`/dashboard/hotels/edit/${hotel.GlobalPropertyID}`)}>
              Edit Hotel
            </button>
          )}
        </div>
      </div>

      <div className="hotel-info-grid">
        <div className="info-block">
          <h3>Location</h3>
          <p>{hotel.PropertyAddress1}, {hotel.PropertyCity}, {hotel.PropertyState} {hotel.PropertyPostalCode}</p>
          <p>{hotel.PropertyCountry}</p>
          <p>Phone: {hotel.PropertyPhone}</p>
        </div>
        <div className="info-block">
          <h3>Overview</h3>
          <p>Stars: {'⭐'.repeat(hotel.HotelStars || 0)}</p>
          <p>Rooms: {hotel.RoomsNumber}</p>
          <p>Floors: {hotel.FloorsNumber}</p>
          {hotel.DistanceToTheAirport !== undefined && hotel.DistanceToTheAirport !== null && <p>Airport Distance: {hotel.DistanceToTheAirport} miles</p>}
        </div>
        <div className="info-block">
          <h3>Scoring</h3>
          {hotel.scoring ? (
            <>
              <p>Sparkling Score: <strong>{hotel.scoring.sparklingScore?.toFixed(2)}</strong></p>
              <p>Review Component: {hotel.scoring.reviewComponent?.toFixed(2)}</p>
              <p>Metadata Component: {hotel.scoring.metadataComponent?.toFixed(2)}</p>
              <p>Total Reviews: {hotel.scoring.totalReviews}</p>
              <p>Last Updated: {new Date(hotel.scoring.lastUpdated).toLocaleDateString()}</p>
            </>
          ) : (
            <p>No scoring data available. Click "Calculate/Update Score" to generate.</p>
          )}
        </div>
      </div>

      <div className="hotel-reviews-section">
        <h3>Recent Reviews</h3>
        <ReviewList hotelId={hotel.GlobalPropertyID} />
      </div>
    </div>
  );
};

export default HotelDetails;
