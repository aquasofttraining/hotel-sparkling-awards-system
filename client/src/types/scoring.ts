export interface HotelScoring {
  id: number;
  ranking: number;
  hotelId: number;
  hotelName: string;
  location: string;
  sparklingScore: number;
  reviewComponent: number;
  metadataComponent: number;
  totalReviews: number;
  hotelStars: number;
  distanceToAirport: number;
  roomsNumber: number;
  amenitiesRate: number;
  cleanlinessRate: number;
  foodBeverage: number;
  sleepQuality: number;
  internetQuality: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoringFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
