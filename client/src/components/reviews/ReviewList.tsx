import React from 'react';
import { useReviews } from '../../hooks/useReviews';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  hotelId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ hotelId }) => {
  const { reviews, loading, error } = useReviews(hotelId);

  if (loading) return <div className="text-center py-8">Loading reviews...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews available for this hotel.
        </div>
      ) : (
        reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))
      )}
    </div>
  );
};

export default ReviewList;
