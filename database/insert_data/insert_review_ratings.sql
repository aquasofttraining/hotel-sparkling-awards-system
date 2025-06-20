COPY review_ratings(id, review_id, category_id, rating_value, created_at)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/csv/review_ratings_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;