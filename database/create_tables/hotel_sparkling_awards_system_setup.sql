-- hotel_sparkling_awards_system_setup.sql
-- Complete database setup for Hotel Sparkling Awards System
-- Run this file with: psql -U postgres -f hotel_sparkling_awards_system_setup.sql

-- =============================================================================
-- 1. DATABASE CREATION
-- =============================================================================

DROP DATABASE IF EXISTS hotel_sparkling_awards_system;
CREATE DATABASE hotel_sparkling_awards_system;

-- Connect to the new database
\c hotel_sparkling_awards_system;

-- =============================================================================
-- 2. TABLE CREATION (in dependency order)
-- =============================================================================

-- Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Create permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Create roles_permissions junction table
CREATE TABLE roles_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- Create hotels table
CREATE TABLE hotels (
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

-- Create users table (with hotel_id column)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    nationality VARCHAR(100),
    role_id INTEGER REFERENCES roles(id),
    hotel_id INTEGER REFERENCES hotels(GlobalPropertyID),
    account_status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hotel_managers table
CREATE TABLE hotel_managers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    hotel_id INTEGER NOT NULL REFERENCES hotels(GlobalPropertyID),
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create review_categories table (needed for review_ratings)
CREATE TABLE review_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create reviews table
CREATE TABLE reviews (
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

-- Create review_ratings table
CREATE TABLE review_ratings (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    category_id INTEGER NOT NULL REFERENCES review_categories(id),
    rating_value NUMERIC(3,1) CHECK (rating_value >= 1.0 AND rating_value <= 5.0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hotel_scoring_table
CREATE TABLE hotel_scoring_table (
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

-- =============================================================================
-- 3. INSERT REVIEW CATEGORIES FIRST
-- =============================================================================

INSERT INTO review_categories (id, category_name, description) VALUES
(1, 'Amenities', 'Hotel amenities rating'),
(2, 'Cleanliness', 'Cleanliness rating'),
(3, 'Service', 'Service quality rating'),
(4, 'Food & Beverage', 'Food and beverage rating'),
(5, 'Sleep Quality', 'Sleep quality rating'),
(6, 'Internet Quality', 'Internet connection rating');

-- =============================================================================
-- 4. LOAD DATA FROM CSV FILES
-- =============================================================================

-- **IMPORTANT**: Update these paths to match your actual CSV file locations
-- Replace '/path/to/your/csv/' with the actual path to your CSV files

-- Load roles (handle column name mismatch)
CREATE TEMP TABLE temp_roles (
    id INTEGER,
    role_name VARCHAR(50),
    description TEXT
);

COPY temp_roles(id, role_name, description)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/database/csv/roles_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;

INSERT INTO roles (id, role, description)
SELECT id, role_name, description FROM temp_roles;

DROP TABLE temp_roles;

-- Load permissions
INSERT INTO permissions (permission_name, description) VALUES
('view_users', 'Can view user accounts'),
('create_users', 'Can create user accounts'),
('update_users', 'Can update user accounts'),
('delete_users', 'Can delete user accounts'),
('view_hotels', 'Can view hotel pages and scores'),
('manage_assigned_hotels', 'Can manage hotels assigned to this manager'),
('assign_managers', 'Can assign hotel managers to hotels'),
('export_data', 'Can export hotel and review data');

-- Load roles_permissions relationships
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 3, id FROM permissions; -- Administrator gets all permissions

INSERT INTO roles_permissions (role_id, permission_id) VALUES
(1, 1), (1, 5), (1, 6), -- Hotel Manager
(2, 5), -- Traveler
(4, 5), (4, 8); -- Data Operator

-- Load hotels
COPY hotels(GlobalPropertyID, GlobalPropertyName, PropertyAddress1, CityID, PropertyStateProvinceID, PropertyLatitude, PropertyLongitude, SabrePropertyRating, HotelStars, DistanceToTheAirport, FloorsNumber, RoomsNumber, sparkling_score, last_updated)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/database/csv/hotels_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;

-- Load users
COPY users(id, username, email, password_hash, first_name, last_name, nationality, role_id, account_status, email_verified, review_count, created_at)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/database/csv/users_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;

-- Update admin passwords to real hashed passwords (password: "admin123")
UPDATE users 
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMBRAkKK1bPB6MG'
WHERE role_id = 3;

-- Load hotel managers
COPY hotel_managers(id, user_id, hotel_id, assigned_by, assigned_at, is_active)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/database/csv/hotel_managers_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;

-- Load reviews
COPY reviews(id, hotel_id, user_id, title, content, overall_rating, review_date, helpful_votes, platform, sentiment_score, sentiment_label, confidence, created_at)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/database/csv/reviews_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;

-- Load review ratings
COPY review_ratings(id, review_id, category_id, rating_value, created_at)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/database/csv/review_ratings_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;

-- Load hotel scoring
COPY hotel_scoring_table(ranking, hotel_id, hotel_name, location, sparkling_score, review_component, metadata_component, sentiment_score, total_reviews, hotel_stars, distance_to_airport, floors_number, rooms_number, amenities_rate, cleanliness_rate, food_beverage, sleep_quality, internet_quality, last_updated)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/database/csv/hotel_scoring_table_structured.csv'
DELIMITER ','
CSV HEADER;

-- =============================================================================
-- 5. RESET SEQUENCES (Important after loading data with explicit IDs)
-- =============================================================================

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('hotel_managers_id_seq', (SELECT MAX(id) FROM hotel_managers));
SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
SELECT setval('review_ratings_id_seq', (SELECT MAX(id) FROM review_ratings));
SELECT setval('review_categories_id_seq', (SELECT MAX(id) FROM review_categories));

-- =============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_hotel_id ON users(hotel_id);

-- Review indexes
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_sentiment_score ON reviews(sentiment_score);

-- Hotel scoring indexes
CREATE INDEX idx_hotel_scoring_ranking ON hotel_scoring_table(ranking);
CREATE INDEX idx_hotel_scoring_sparkling_score ON hotel_scoring_table(sparkling_score);

-- Review ratings indexes
CREATE INDEX idx_review_ratings_review_id ON review_ratings(review_id);
CREATE INDEX idx_review_ratings_category_id ON review_ratings(category_id);

-- =============================================================================
-- 7. VERIFICATION QUERIES
-- =============================================================================

-- Verify data was loaded correctly
SELECT 'Roles' as table_name, COUNT(*) as row_count FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Hotels', COUNT(*) FROM hotels
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Review Ratings', COUNT(*) FROM review_ratings
UNION ALL
SELECT 'Hotel Managers', COUNT(*) FROM hotel_managers
UNION ALL
SELECT 'Hotel Scoring', COUNT(*) FROM hotel_scoring_table;

-- Verify admin user
SELECT 
    u.id, 
    u.username, 
    u.email, 
    r.role,
    u.account_status
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'admin1@sparklingawards.com';

-- Display role distribution
SELECT 
    r.role,
    COUNT(u.id) as user_count
FROM roles r 
LEFT JOIN users u ON r.id = u.role_id 
GROUP BY r.id, r.role 
ORDER BY r.id;

-- =============================================================================
-- 8. SUCCESS MESSAGE
-- =============================================================================

\echo 'Database setup completed successfully!'
\echo 'Admin credentials: admin1@sparklingawards.com / admin123'
\echo 'Database name: hotel_sparkling_awards_system'
\echo ''
\echo 'Run your Express API with these database settings:'
\echo 'DB_HOST=localhost'
\echo 'DB_PORT=5432'
\echo 'DB_NAME=hotel_sparkling_awards_system'
\echo 'DB_USERNAME=postgres'
