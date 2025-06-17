COPY users(id, username, email, password_hash, first_name, last_name, nationality, role_id, account_status, email_verified, review_count, created_at)
FROM '/docker-entrypoint-initdb.d/csv/users_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;
