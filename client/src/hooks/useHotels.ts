import { useState, useEffect, useCallback } from 'react';
import { hotelService } from '../services/hotelService';
import { Hotel, HotelFilters } from '../types/hotel';

export const useHotels = (initialFilters: HotelFilters = {}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filters, setFilters] = useState<HotelFilters>(initialFilters);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hotelService.getHotels(filters);
      setHotels(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to fetch hotels.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return { hotels, loading, error, pagination, filters, setFilters, refreshHotels: fetchHotels };
};
