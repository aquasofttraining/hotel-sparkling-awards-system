import React from 'react';
import { Review } from '../../types/review';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-semibold mb-2">
        {review.title || 'No Title'}
      </h3>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-yellow-500">
          Overall Rating: {'⭐'.repeat(review.overall_rating || 0)}
        </span>
        <span className="text-gray-500 text-sm">
          {new Date(review.review_date).toLocaleDateString()}
        </span>
      </div>

      {review.platform && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
          {review.platform}
        </span>
      )}

      <p className="text-gray-700 mb-3">{review.content}</p>

      {review.sentiment_label && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Sentiment:</span>
          <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(review.sentiment_label)}`}>
            {review.sentiment_label}
          </span>
          {review.sentiment_score && review.confidence && (
            <span className="text-xs text-gray-500">
              (Score: {review.sentiment_score.toFixed(2)}, Confidence: {review.confidence.toFixed(2)})
            </span>
          )}
        </div>
      )}

      {review.helpful_votes > 0 && (
        <div className="text-sm text-gray-600">
          👍 {review.helpful_votes} people found this helpful
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
