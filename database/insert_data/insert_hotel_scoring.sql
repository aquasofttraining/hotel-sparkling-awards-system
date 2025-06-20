COPY hotel_scoring_table(
    ranking, hotel_id, hotel_name, location, sparkling_score, review_component,
    metadata_component, sentiment_score, total_reviews, hotel_stars,
    distance_to_airport, floors_number, rooms_number, amenities_rate,
    cleanliness_rate, food_beverage, sleep_quality, internet_quality, last_updated
)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/csv/hotel_scoring_table_structured.csv'
DELIMITER ','
CSV HEADER;
