-- =======================
-- CREATE TABLES
-- =======================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS roles_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255),
    password_hash TEXT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    nationality VARCHAR(100),
    role_id INTEGER REFERENCES roles(id),
    account_status VARCHAR(50),
    email_verified BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
    GlobalPropertyID INTEGER PRIMARY KEY,
    GlobalPropertyName VARCHAR(255),
    PropertyAddress1 TEXT,
    CityID INTEGER,
    PropertyStateProvinceID INTEGER,
    PropertyLatitude DOUBLE PRECISION,
    PropertyLongitude DOUBLE PRECISION,
    SabrePropertyRating NUMERIC(3,1),
    HotelStars INTEGER,
    DistanceToTheAirport NUMERIC(5,2),
    FloorsNumber INTEGER,
    RoomsNumber INTEGER,
    sparkling_score NUMERIC(5,2),
    last_updated TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(GlobalPropertyID),
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    overall_rating NUMERIC(3,2),
    review_date DATE,
    helpful_votes INTEGER DEFAULT 0,
    platform VARCHAR(100),
    sentiment_score NUMERIC(3,2),
    sentiment_label VARCHAR(20),
    confidence NUMERIC(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_ratings (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    category_id INTEGER NOT NULL,
    rating_value NUMERIC(3,1) CHECK (rating_value >= 1.0 AND rating_value <= 5.0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotel_managers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    hotel_id INTEGER NOT NULL REFERENCES hotels(GlobalPropertyID),
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS hotel_scoring_table (
    ranking INTEGER PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(GlobalPropertyID),
    hotel_name VARCHAR(255) NOT NULL,
    location TEXT,
    sparkling_score NUMERIC(5,2),
    review_component NUMERIC(5,2),
    metadata_component NUMERIC(5,2),
    sentiment_score NUMERIC(5,2),
    total_reviews INTEGER,
    hotel_stars INTEGER,
    distance_to_airport NUMERIC(5,2),
    floors_number INTEGER,
    rooms_number INTEGER,
    amenities_rate NUMERIC(5,2),
    cleanliness_rate NUMERIC(5,2),
    food_beverage NUMERIC(5,2),
    sleep_quality NUMERIC(5,2),
    internet_quality NUMERIC(5,2),
    last_updated TIMESTAMP
);

-- =======================
-- INSERT BASE DATA
-- =======================

-- Roles
COPY roles(id, role, description)
FROM '/docker-entrypoint-initdb.d/csv/roles_sparkling_awards.csv'
DELIMITER ',' 
CSV HEADER;

-- Permissions
INSERT INTO permissions (permission_name, description) VALUES
('read_users', 'View users'),
('write_users', 'Create/Update/Delete users'),
('read_hotels', 'View hotels'),
('write_hotels', 'Create/Update/Delete hotels'),
('read_reviews', 'View reviews'),
('write_reviews', 'Create/Update/Delete reviews');

-- Role-Permission mapping
-- Administrator has all permissions
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 3, id FROM permissions;

-- Hotel Manager: read/write hotels, read reviews
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE permission_name IN ('read_hotels', 'write_hotels', 'read_reviews');

-- Traveler: read/write reviews
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE permission_name IN ('read_reviews', 'write_reviews');

-- Data Operator: read everything
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE permission_name LIKE 'read_%';

COPY public.users(id, username, email, password_hash, first_name, last_name, nationality, role_id, account_status, email_verified, review_count, created_at)
FROM '/docker-entrypoint-initdb.d/csv/users_sparkling_awards.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '\N');


COPY public.hotels(GlobalPropertyID, GlobalPropertyName, PropertyAddress1, CityID, PropertyStateProvinceID, PropertyLatitude, PropertyLongitude, SabrePropertyRating, HotelStars, DistanceToTheAirport, FloorsNumber, RoomsNumber, sparkling_score, last_updated)
FROM '/docker-entrypoint-initdb.d/csv/hotels_sparkling_awards.csv' 
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '\N');

COPY public.hotel_managers(id, user_id, hotel_id, assigned_by, assigned_at, is_active)
FROM '/docker-entrypoint-initdb.d/csv/hotel_managers_sparkling_awards.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '\N');

COPY public.reviews(id, hotel_id, user_id, title, content, overall_rating, review_date, helpful_votes, platform, sentiment_score, sentiment_label, confidence, created_at)
FROM '/docker-entrypoint-initdb.d/csv/reviews_sparkling_awards.csv' 
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '\N');

COPY public.review_ratings(id, review_id, category_id, rating_value, created_at)
FROM '/docker-entrypoint-initdb.d/csv/review_ratings_sparkling_awards.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '\N');

COPY public.hotel_scoring_table(ranking, hotel_id, hotel_name, location, sparkling_score, review_component, metadata_component, sentiment_score, total_reviews, hotel_stars, distance_to_airport, floors_number, rooms_number, amenities_rate, cleanliness_rate, food_beverage, sleep_quality, internet_quality, last_updated)
FROM '/docker-entrypoint-initdb.d/csv/hotel_scoring_table_structured.csv' 
WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8', NULL '\N');
