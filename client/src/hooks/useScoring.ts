import { useState, useEffect, useCallback } from 'react';
import { scoringService } from '../services/scoringService';
import { HotelScoring, ScoringFilters } from '../types/scoring';

export const useScoring = (initialFilters: ScoringFilters = { sortBy: 'sparklingScore', sortOrder: 'DESC' }) => {
  const [scoringData, setScoringData] = useState<HotelScoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [filters, setFilters] = useState<ScoringFilters>(initialFilters);

  const fetchScoring = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scoringService.getHotelScoring(filters);
      setScoringData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to fetch scoring data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchScoring();
  }, [fetchScoring]);

  return { scoringData, loading, error, pagination, filters, setFilters, refreshScoring: fetchScoring };
};
