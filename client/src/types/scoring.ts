export interface HotelScoring {
  ranking: number;
  hotel_id: number;
  hotel_name: string;
  location?: string;
  sparkling_score: number;
  review_component: number;
  metadata_component: number;
  sentiment_score?: number;
  total_reviews: number;
  hotel_stars: number;
  distance_to_airport?: number;
  floors_number?: number;
  rooms_number?: number;
  amenities_rate?: number;
  cleanliness_rate?: number;
  food_beverage?: number;
  sleep_quality?: number;
  internet_quality?: number;
  last_updated?: string;
}

export interface ScoringFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ScoringResponse {
  success: boolean;
  data: HotelScoring[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
