import api from './api';
import { Hotel, HotelFilters } from '../types/hotel';

class HotelService {
  async getHotels(filters: HotelFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<{ data: Hotel[]; pagination: { total: number; page: number; limit: number; totalPages: number; } }>(`/hotels?${params.toString()}`);
    return response.data;
  }

  async getHotelById(id: number) {
    const response = await api.get<{ data: Hotel }>(`/hotels/${id}`);
    return response.data.data;
  }

  async createHotel(hotelData: Omit<Hotel, 'GlobalPropertyID' | 'createdAt' | 'updatedAt' | 'scoring' | 'reviews'>) {
    const response = await api.post<{ success: boolean; data: Hotel }>('/hotels', hotelData);
    return response.data.data;
  }

  async updateHotel(id: number, hotelData: Partial<Hotel>) {
    const response = await api.put<{ success: boolean; data: Hotel }>(`/hotels/${id}`, hotelData);
    return response.data.data;
  }
}

export const hotelService = new HotelService();
