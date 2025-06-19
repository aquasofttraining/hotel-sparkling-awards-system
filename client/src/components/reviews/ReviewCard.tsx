import React from 'react';
import { Review } from '../../types/review';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border p-4 mb-4">
      <h4 className="text-lg font-semibold text-blue-900 mb-2">
        {review.title || 'No Title'}
      </h4>
      
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <span>Overall Rating: {'⭐'.repeat(review.overallRating || 0)}</span>
        <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {review.platform}
        </span>
      </div>
      
      <p className="text-gray-700 mb-3">{review.content}</p>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">Sentiment:</span>
        <span className={`px-2 py-1 rounded text-xs ${getSentimentColor(review.sentimentLabel)}`}>
          {review.sentimentLabel}
        </span>
        <span className="text-xs text-gray-500">
          (Score: {review.sentimentScore?.toFixed(2)}, Confidence: {review.confidence?.toFixed(2)})
        </span>
      </div>
      
      {review.helpfulVotes > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <span className="text-sm text-blue-800">
            👍 {review.helpfulVotes} people found this helpful
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
