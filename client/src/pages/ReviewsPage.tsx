import React from 'react';
import ReviewList from '../components/reviews/ReviewList';

const ReviewsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">📝 Reviews</h1>
      {/* Pass hotelId if needed, or modify ReviewList to fetch all reviews */}
      <ReviewList hotelId={0} /> {/* Replace 0 with a valid hotelId or modify logic */}
    </div>
  );
};

export default ReviewsPage;