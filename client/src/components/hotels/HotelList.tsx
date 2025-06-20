import React, { useState } from 'react';
import { useHotels } from '../../hooks/useHotels';
import HotelCard from './HotelCard';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

interface HotelListProps {
  onlyManagedByUser?: boolean;
  searchMode?: boolean;
}

const HotelList: React.FC<HotelListProps> = ({ onlyManagedByUser = false, searchMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const { hotels, loading, error, pagination, setFilters } = useHotels({
    search: searchMode ? searchTerm : undefined,
    managedByUser: onlyManagedByUser ? user?.userId : undefined,
  });

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const canAddHotel = user && ['Administrator', 'administrator',  'Data Operator' ,'data operator'].includes(user.role);

  if (loading) return <div className="text-center py-8">Loading hotels...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {searchMode && (
        <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Search
          </button>
        </form>
      )}

      {!searchMode && !onlyManagedByUser && canAddHotel && (
        <div className="mb-6 text-right">
          <button
            onClick={() => navigate('/hotels/add')}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add New Hotel
          </button>
        </div>
      )}

      {hotels.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {onlyManagedByUser ? 'No managed hotels found.' : 'No hotels found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <HotelCard
              key={hotel.GlobalPropertyID}
              hotel={hotel}
              onClick={(hotelId) => navigate(`/hotels/${hotelId}`)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-2 rounded ${
                pagination.page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
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
