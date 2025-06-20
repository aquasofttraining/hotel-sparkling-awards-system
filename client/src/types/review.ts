export interface Review {
  id: number;
  hotel_id: number;
  user_id: number;
  title?: string;
  content: string;
  overall_rating: number;
  review_date: string;
  helpful_votes: number;
  platform?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  confidence?: number;
  created_at: string;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  hotelId?: number;
  userId?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
