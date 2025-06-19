import React from 'react';
import { Hotel } from '../../types/hotel';

interface HotelCardProps {
  hotel: Hotel;
  onClick?: (hotelId: number) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer border"
      onClick={() => onClick?.(hotel.GlobalPropertyID)}
    >
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        {hotel.GlobalPropertyName}
      </h3>
      
      <p className="text-gray-600 text-sm mb-3">
        {hotel.PropertyAddress1}, {hotel.PropertyCity}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
          Stars: {'⭐'.repeat(hotel.HotelStars || 0)}
        </span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          Rooms: {hotel.RoomsNumber}
        </span>
        {hotel.DistanceToTheAirport && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
            Airport: {hotel.DistanceToTheAirport} miles
          </span>
        )}
      </div>
      
      {hotel.scoring && (
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-3 rounded text-center">
          <span className="text-sm text-gray-600">Sparkling Score: </span>
          <span className="text-lg font-bold text-orange-700">
            {hotel.scoring.sparklingScore?.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default HotelCard;
