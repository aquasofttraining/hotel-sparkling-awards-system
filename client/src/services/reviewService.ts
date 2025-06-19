import api from './api';
import { Review } from '../types/review';

class ReviewService {
  async getReviewsByHotel(hotelId: number) {
    const response = await api.get<{ data: Review[] }>(`/reviews/${hotelId}`);
    return response.data.data;
  }
}

export const reviewService = new ReviewService();
