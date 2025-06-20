COPY reviews(id, hotel_id, user_id, title, content, overall_rating, review_date, helpful_votes, platform, sentiment_score, sentiment_label, confidence, created_at)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/csv/reviews_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;
