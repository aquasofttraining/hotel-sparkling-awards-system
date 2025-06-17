COPY review_ratings(id, review_id, category_id, rating_value, created_at)
FROM '/docker-entrypoint-initdb.d/csv/review_ratings_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;