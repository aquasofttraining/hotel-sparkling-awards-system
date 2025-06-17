COPY reviews(id, hotel_id, user_id, title, content, overall_rating, review_date, helpful_votes, platform, sentiment_score, sentiment_label, confidence, created_at)
FROM '/docker-entrypoint-initdb.d/csv/reviews_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;
