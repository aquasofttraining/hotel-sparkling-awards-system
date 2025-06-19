import React from 'react';
import { useReviews } from '../../hooks/useReviews';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  hotelId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ hotelId }) => {
  const { reviews, loading, error } = useReviews(hotelId);

  if (loading) return <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mx-auto"></div></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;

  return (
    <div>
      {reviews.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No reviews available for this hotel.</p>
      ) : (
        reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))
      )}
    </div>
  );
};

export default ReviewList;
