import React from 'react';
import { Hotel } from '../../types/hotel';

interface HotelCardProps {
  hotel: Hotel;
  onClick?: (hotelId: number) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onClick }) => {
  return (
    <div className="hotel-card" onClick={() => onClick?.(hotel.GlobalPropertyID)}>
      <h3>{hotel.GlobalPropertyName}</h3>
      <p>{hotel.PropertyAddress1}, {hotel.PropertyCity}</p>
      <div className="hotel-meta">
        <span>Stars: {'⭐'.repeat(hotel.HotelStars || 0)}</span>
        <span>Rooms: {hotel.RoomsNumber}</span>
        {hotel.DistanceToTheAirport && <span>Airport: {hotel.DistanceToTheAirport} miles</span>}
      </div>
      {hotel.scoring && (
        <div className="hotel-score">
          Sparkling Score: <strong>{hotel.scoring.sparklingScore?.toFixed(2)}</strong>
        </div>
      )}
    </div>
  );
};

export default HotelCard;
