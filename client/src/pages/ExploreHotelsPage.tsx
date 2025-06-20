import React, { useState } from 'react';
import { useHotels } from '../hooks/useHotels';
import HotelCard from '../components/hotels/HotelCard';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ExploreHotelsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [sortBy, setSortBy] = useState('sparkling_score');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const { hotels, loading, error, pagination, setFilters } = useHotels({
    search: activeSearch,
    sortBy,
    sortOrder,
    limit: 12
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
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

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setFilters(prev => ({ ...prev, search: '', page: 1 }));
  };

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
      <span>Loading hotels...</span>
    </div>
  );

  if (error) return (
    <div className="text-red-600 text-center py-8">{error}</div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Explore Hotels</h1>
        <p className="text-gray-600 text-lg">
          Discover and analyze hotels worldwide with detailed scoring
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search hotels by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {activeSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sparkling_score">Sparkling Score</option>
                <option value="GlobalPropertyName">Hotel Name</option>
                <option value="HotelStars">Star Rating</option>
                <option value="RoomsNumber">Number of Rooms</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => handleOrderChange(e.target.value as 'ASC' | 'DESC')}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DESC">High to Low</option>
                <option value="ASC">Low to High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {activeSearch && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Search Results for "{activeSearch}"
          </h2>
          <p className="text-gray-600">{hotels.length} hotels found</p>
        </div>
      )}

      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hotels Found</h3>
          <p className="text-gray-500">
            {activeSearch ? 'Try searching for: Milan, Paris, London, Barcelona, or New York' : 'Try adjusting your search criteria'}
          </p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {hotels.map(hotel => (
              <HotelCard
                key={hotel.GlobalPropertyID}
                hotel={hotel}
                onClick={(hotelId) => navigate(`/hotels/${hotelId}`)}
              />
            ))}
          </div>

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
        </>
      )}
    </div>
  );
};

export default ExploreHotelsPage;
