import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import { Review } from '../types/review';

export const useReviews = (hotelId?: number) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!hotelId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await reviewService.getReviewsByHotel(hotelId);
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch reviews.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    if (hotelId) {
      fetchReviews();
    }
  }, [hotelId, fetchReviews]);

  return { 
    reviews, 
    loading, 
    error, 
    refreshReviews: fetchReviews 
  };
};
