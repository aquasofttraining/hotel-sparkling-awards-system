import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Hotel } from '../../types/hotel';
import { hotelService } from '../../services/hotelService';
import { scoringService } from '../../services/scoringService';
import { useAuth } from '../../hooks/useAuth';

const HotelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeToFixed = (value: any, decimals: number = 2): string => {
    if (!value && value !== 0) return 'N/A';
    const num = Number(value);
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;
      try {
        const hotelData = await hotelService.getHotelById(Number(id));
        setHotel(hotelData);
      } catch (err) {
        setError('Failed to fetch hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const handleCalculateScore = async () => {
    if (!hotel) return;
    try {
      await scoringService.calculateHotelScore(hotel.GlobalPropertyID);
      const updatedHotel = await hotelService.getHotelById(hotel.GlobalPropertyID);
      setHotel(updatedHotel);
    } catch (err) {
      console.error('Failed to calculate score:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!hotel) return <div className="text-center py-8">Hotel not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {hotel.GlobalPropertyName}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Hotel Information</h2>
            <p className="text-gray-600 mb-2">{hotel.PropertyAddress1}</p>
            <p className="text-yellow-500 mb-2">
              Stars: {'⭐'.repeat(hotel.HotelStars || 0)}
            </p>
            <p className="text-gray-600 mb-2">Rooms: {hotel.RoomsNumber}</p>
            <p className="text-gray-600 mb-2">Floors: {hotel.FloorsNumber}</p>
            {hotel.DistanceToTheAirport !== undefined && hotel.DistanceToTheAirport !== null && (
              <p className="text-gray-600 mb-2">
                Airport Distance: {hotel.DistanceToTheAirport} miles
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Scoring Information</h2>
            {hotel.scoring ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-orange-700">
                  Sparkling Score: {safeToFixed(hotel.scoring.sparkling_score)}
                </p>
                <p className="text-gray-600">
                  Review Component: {safeToFixed(hotel.scoring.review_component)}
                </p>
                <p className="text-gray-600">
                  Metadata Component: {safeToFixed(hotel.scoring.metadata_component)}
                </p>
                <p className="text-gray-600">
                  Total Reviews: {hotel.scoring.total_reviews || 0}
                </p>
                <p className="text-gray-600">
                  Last Updated: {hotel.scoring.last_updated 
                    ? new Date(hotel.scoring.last_updated).toLocaleDateString() 
                    : 'Unknown'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                No scoring data available. Click "Calculate Score" to generate.
              </p>
            )}

            {user && ['Administrator', 'Data Operator', 'Hotel Manager'].includes(user.role) && (
              <button
                onClick={handleCalculateScore}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Calculate Score
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
