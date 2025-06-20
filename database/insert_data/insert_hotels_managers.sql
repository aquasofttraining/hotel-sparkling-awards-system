COPY hotel_managers(id, user_id, hotel_id, assigned_at, is_active)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/csv/hotel_managers_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;
