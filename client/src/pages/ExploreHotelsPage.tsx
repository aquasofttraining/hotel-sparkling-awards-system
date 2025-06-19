import React, { useState } from 'react';
import { useHotels } from '../hooks/useHotels';
import HotelCard from '../components/hotels/HotelCard';
import { useNavigate } from 'react-router-dom';

const ExploreHotelsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('sparklingScore');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const navigate = useNavigate();

  const { hotels, loading, error, pagination, setFilters } = useHotels({
    search: searchTerm,
    sortBy,
    sortOrder,
    limit: 12
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setFilters(prev => ({ ...prev, sortBy: newSortBy, page: 1 }));
  };

  const handleOrderChange = (newOrder: 'ASC' | 'DESC') => {
    setSortOrder(newOrder);
    setFilters(prev => ({ ...prev, sortOrder: newOrder, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">🔍 Explore Hotels</h1>
        <p className="text-gray-600">Discover the best rated hotels worldwide</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search hotels by name or location..."
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
          </div>
        </form>

        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="sparklingScore">Sparkling Score</option>
              <option value="GlobalPropertyName">Hotel Name</option>
              <option value="HotelStars">Star Rating</option>
              <option value="DistanceToTheAirport">Distance to Airport</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => handleOrderChange(e.target.value as 'ASC' | 'DESC')}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="DESC">High to Low</option>
              <option value="ASC">Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <span className="text-gray-600">{pagination.total} hotels found</span>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {hotels.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hotels found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>

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

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreHotelsPage;
