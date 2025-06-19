import React from 'react';
import { Review } from '../../types/review';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="review-card">
      <h4>{review.title || 'No Title'}</h4>
      <div className="review-meta">
        <span>Overall Rating: {'⭐'.repeat(review.overallRating || 0)}</span>
        <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
        <span>Platform: {review.platform}</span>
      </div>
      <p className="review-content">{review.content}</p>
      <div className="review-sentiment">
        Sentiment: <span className={`sentiment-${review.sentimentLabel?.toLowerCase()}`}>{review.sentimentLabel}</span>
        (Score: {review.sentimentScore?.toFixed(2)}, Confidence: {review.confidence?.toFixed(2)})
      </div>
      {review.helpfulVotes > 0 && <span className="helpful-votes">{review.helpfulVotes} people found this helpful</span>}
    </div>
  );
};

export default ReviewCard;
