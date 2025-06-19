export interface Review {
  id: number;
  hotelId: number;
  userId: number; // Assuming a user is associated with a review
  title: string;
  content: string;
  overallRating: number;
  amenitiesRate: number;
  cleanlinessRate: number;
  foodBeverage: number;
  sleepQuality: number;
  internetQuality: number;
  reviewDate: string;
  helpfulVotes: number;
  platform: string;
  sentimentScore: number;
  sentimentLabel: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}
