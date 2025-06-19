import React, { useState } from 'react';
import { useHotels } from '../../hooks/useHotels';
import HotelCard from './HotelCard';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

interface HotelListProps {
  searchMode?: boolean;
}

const HotelList: React.FC<HotelListProps> = ({ searchMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { hotels, loading, error, pagination, setFilters } = useHotels({
    search: searchMode ? searchTerm : undefined,
  });
  const user = authService.getCurrentUser();

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const canAddHotel = user && ['Administrator', 'Data Operator'].includes(user.role);

  if (loading) return <div className="loading-spinner">Loading hotels...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="hotel-list">
      <div className="hotel-list-header">
        <h2>{searchMode ? 'Find Hotels' : 'Hotels Overview'}</h2>
        {searchMode && (
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <input
              type="text"
              placeholder="Search by hotel name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        )}
        {!searchMode && canAddHotel && (
          <button className="btn-primary" onClick={() => navigate('/dashboard/hotels/add')}>
            Add New Hotel
          </button>
        )}
      </div>

      <div className="hotels-grid">
        {hotels.length === 0 ? (
          <p>No hotels found.</p>
        ) : (
          hotels.map(hotel => (
            <HotelCard
              key={hotel.GlobalPropertyID}
              hotel={hotel}
              onClick={() => navigate(`/dashboard/hotels/${hotel.GlobalPropertyID}`)}
            />
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelList;
