-- Enable required extension
-- (Optional depending on usage, but good to include)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Load permissions
COPY permissions(id, permission, description)
FROM '/docker-entrypoint-initdb.d/csv/permissions.csv'
DELIMITER ','
CSV HEADER;

-- Load review categories
COPY review_categories(id, category_name, created_at)
FROM '/docker-entrypoint-initdb.d/csv/review_categories.csv'
DELIMITER ','
CSV HEADER;

-- Load roles
COPY roles(id, role, permission)
FROM '/docker-entrypoint-initdb.d/csv/roles.csv'
DELIMITER ','
CSV HEADER;

-- Load users
COPY users(id, username, nationality, role_id)
FROM '/docker-entrypoint-initdb.d/csv/users.csv'
DELIMITER ','
CSV HEADER;

-- Load roles_permissions
COPY roles_permissions(role_id, permission_id)
FROM '/docker-entrypoint-initdb.d/csv/roles_permissions.csv'
DELIMITER ','
CSV HEADER;
