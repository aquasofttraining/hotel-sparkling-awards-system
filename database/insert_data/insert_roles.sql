COPY roles(id, role, description)
FROM '/docker-entrypoint-initdb.d/csv/roles_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;
