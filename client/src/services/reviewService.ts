import api from './api';
import { Review, ReviewFilters } from '../types/review';

class ReviewService {
  async getAllReviews(filters: ReviewFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<{ 
      success: boolean; 
      data: Review[]; 
      pagination?: { total: number; page: number; limit: number; totalPages: number; } 
    }>(`/reviews?${params.toString()}`);
    return response.data;
  }

  async getReviewsByHotel(hotelId: number) {
    const response = await api.get<{ success: boolean; data: Review[] }>(`/reviews/hotel/${hotelId}`);
    return response.data.data;
  }

  async createReview(reviewData: Partial<Review>) {
    const response = await api.post<{ success: boolean; data: Review }>('/reviews', reviewData);
    return response.data.data;
  }

  async updateReview(id: number, reviewData: Partial<Review>) {
    const response = await api.put<{ success: boolean; data: Review }>(`/reviews/${id}`, reviewData);
    return response.data.data;
  }

  async deleteReview(id: number) {
    const response = await api.delete<{ success: boolean; message: string }>(`/reviews/${id}`);
    return response.data;
  }
}

export const reviewService = new ReviewService();
