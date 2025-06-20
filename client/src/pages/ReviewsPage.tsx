import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewList from '../components/reviews/ReviewList';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useHotels } from '../hooks/useHotels';

const ReviewsPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [selectedHotelId, setSelectedHotelId] = useState<number | undefined>(
    hotelId ? Number(hotelId) : undefined
  );
  
  const { hotels, loading: hotelsLoading } = useHotels({ limit: 100 });

  const handleHotelSelect = (id: number) => {
    setSelectedHotelId(id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Hotel Reviews</h1>
        
        {!hotelId && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select a Hotel</h2>
            {hotelsLoading ? (
              <div className="text-center py-4">Loading hotels...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotels.map(hotel => (
                  <button
                    key={hotel.GlobalPropertyID}
                    onClick={() => handleHotelSelect(hotel.GlobalPropertyID)}
                    className={`p-4 border rounded-lg text-left hover:bg-blue-50 transition-colors ${
                      selectedHotelId === hotel.GlobalPropertyID 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">
                      {hotel.GlobalPropertyName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {hotel.PropertyAddress1}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-yellow-500">
                        {'⭐'.repeat(hotel.HotelStars || 0)}
                      </span>
                      {hotel.scoring && (
                        <span className="text-sm text-orange-600 font-medium">
                          Score: {Number(hotel.scoring.sparkling_score).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedHotelId && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Reviews for {hotels.find(h => h.GlobalPropertyID === selectedHotelId)?.GlobalPropertyName || `Hotel ${selectedHotelId}`}
              </h2>
            </div>
            <ReviewList hotelId={selectedHotelId} />
          </div>
        )}

        {!selectedHotelId && !hotelId && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Hotel</h3>
            <p className="text-gray-500">Choose a hotel from the list above to view its reviews.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewsPage;
