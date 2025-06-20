import React from 'react';
import { Hotel } from '../../types/hotel';

interface HotelCardProps {
  hotel: Hotel;
  onClick?: (hotelId: number) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onClick }) => {
  const safeToFixed = (value: any, decimals: number = 2): string => {
    if (!value && value !== 0) return 'N/A';
    const num = Number(value);
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick?.(hotel.GlobalPropertyID)}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {hotel.GlobalPropertyName}
      </h3>
      <p className="text-gray-600 mb-2">
        {hotel.PropertyAddress1}
      </p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-yellow-500">
          Stars: {'⭐'.repeat(hotel.HotelStars || 0)}
        </span>
        <span className="text-gray-600">
          Rooms: {hotel.RoomsNumber}
        </span>
      </div>
      {hotel.DistanceToTheAirport && (
        <p className="text-gray-600 mb-2">
          Airport: {hotel.DistanceToTheAirport} miles
        </p>
      )}
      {hotel.scoring && (
        <div className="bg-orange-50 p-2 rounded">
          <span className="text-orange-700 font-semibold">
            Sparkling Score: {safeToFixed(hotel.scoring.sparkling_score)}
          </span>
        </div>
      )}
    </div>
  );
};

export default HotelCard;
