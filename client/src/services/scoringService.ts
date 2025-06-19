import api from './api';
import { HotelScoring, ScoringFilters } from '../types/scoring';

class ScoringService {
  async getHotelScoring(filters: ScoringFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<{ data: HotelScoring[]; pagination: { total: number; page: number; limit: number; totalPages: number; } }>(`/scoring?${params.toString()}`);
    return response.data;
  }

  async recalculateAllScores() {
    const response = await api.post<{ success: boolean; message: string }>('/scoring/recalculate-all');
    return response.data;
  }

  async calculateHotelScore(hotelId: number, weights?: any) {
    const response = await api.post<{ success: boolean; data: any }>(`/scoring/calculate/${hotelId}`, { weights });
    return response.data;
  }
}

export const scoringService = new ScoringService();
