COPY hotel_managers(id, user_id, hotel_id, assigned_at, is_active)
FROM '/docker-entrypoint-initdb.d/csv/hotel_managers_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;
