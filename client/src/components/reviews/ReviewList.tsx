import React from 'react';
import { useReviews } from '../../hooks/useReviews';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  hotelId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ hotelId }) => {
  const { reviews, loading, error } = useReviews(hotelId);

  if (loading) return <div className="loading-spinner">Loading reviews...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="review-list-container">
      {reviews.length === 0 ? (
        <p>No reviews available for this hotel.</p>
      ) : (
        reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))
      )}
    </div>
  );
};

export default ReviewList;
