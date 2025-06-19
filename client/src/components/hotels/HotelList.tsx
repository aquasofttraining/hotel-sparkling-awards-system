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

  const canAddHotel = user && ['Administrator', 'Data Operator'].includes(user.role);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;

  return (
    <div>
      {searchMode && (
        <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Search hotels by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button 
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded"
          >
            Search
          </button>
        </form>
      )}

      {!searchMode && !onlyManagedByUser && canAddHotel && (
        <div className="mb-4">
          <button 
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
            onClick={() => navigate('/hotels/add')}
          >
            Add New Hotel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {hotels.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">
              {onlyManagedByUser ? 'No managed hotels found.' : 'No hotels found.'}
            </p>
          </div>
        ) : (
          hotels.map(hotel => (
            <HotelCard
              key={hotel.GlobalPropertyID}
              hotel={hotel}
              onClick={() => navigate(`/hotels/${hotel.GlobalPropertyID}`)}
            />
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-2 rounded ${
                pagination.page === i + 1
                  ? 'bg-blue-800 text-white'
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
