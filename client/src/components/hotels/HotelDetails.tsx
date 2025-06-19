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
  const canEditHotel = (user && ['Administrator'].includes(user.role)) || isHotelManagerOfThisHotel;

  useEffect(() => {
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

    fetchHotelDetails();
  }, [hotelId]);

  const handleCalculateScore = async () => {
    if (!canCalculateScore) return;

    setCalculatingScore(true);
    try {
      await scoringService.calculateHotelScore(hotelId);
      alert('Hotel score calculated/updated successfully!');
    } catch (err) {
      console.error('Failed to calculate hotel score:', err);
      alert('Failed to calculate hotel score.');
    } finally {
      setCalculatingScore(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  if (!hotel) return <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">Hotel not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-blue-900">{hotel.GlobalPropertyName}</h1>
          <div className="flex gap-2">
            {canCalculateScore && (
              <button 
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={handleCalculateScore}
                disabled={calculatingScore}
              >
                {calculatingScore ? 'Calculating...' : 'Calculate Score'}
              </button>
            )}
            {canEditHotel && (
              <button 
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
                onClick={() => navigate(`/dashboard/hotels/edit/${hotel.GlobalPropertyID}`)}
              >
                Edit Hotel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Location */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📍 Location</h3>
          <p className="text-gray-700">{hotel.PropertyAddress1}, {hotel.PropertyCity}, {hotel.PropertyState} {hotel.PropertyPostalCode}</p>
          <p className="text-gray-700">{hotel.PropertyCountry}</p>
          <p className="text-gray-700">Phone: {hotel.PropertyPhone}</p>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🏨 Overview</h3>
          <p className="text-gray-700">Stars: {'⭐'.repeat(hotel.HotelStars || 0)}</p>
          <p className="text-gray-700">Rooms: {hotel.RoomsNumber}</p>
          <p className="text-gray-700">Floors: {hotel.FloorsNumber}</p>
          {hotel.DistanceToTheAirport !== undefined && hotel.DistanceToTheAirport !== null && (
            <p className="text-gray-700">Airport Distance: {hotel.DistanceToTheAirport} miles</p>
          )}
        </div>

        {/* Scoring */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">✨ Scoring</h3>
          {hotel.scoring ? (
            <div>
              <div className="text-center bg-orange-50 p-3 rounded mb-3">
                <div className="text-2xl font-bold text-orange-700">{hotel.scoring.sparklingScore?.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Sparkling Score</div>
              </div>
              <p className="text-sm text-gray-700">Review Component: {hotel.scoring.reviewComponent?.toFixed(2)}</p>
              <p className="text-sm text-gray-700">Metadata Component: {hotel.scoring.metadataComponent?.toFixed(2)}</p>
              <p className="text-sm text-gray-700">Total Reviews: {hotel.scoring.totalReviews}</p>
              <p className="text-xs text-gray-500 mt-2">Last Updated: {new Date(hotel.scoring.lastUpdated).toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="text-gray-600">No scoring data available. Click "Calculate Score" to generate.</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">📝 Recent Reviews</h3>
        <ReviewList hotelId={hotel.GlobalPropertyID} />
      </div>
    </div>
  );
};

export default HotelDetails;
