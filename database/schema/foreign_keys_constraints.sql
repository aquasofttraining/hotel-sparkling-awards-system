-- Add foreign key constraints
ALTER TABLE Hotels 
ADD CONSTRAINT fk_hotels_city 
FOREIGN KEY (CityID) REFERENCES Cities(CityID) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE Hotels 
ADD CONSTRAINT fk_hotels_region 
FOREIGN KEY (PropertyStateProvinceID) REFERENCES Regions(PropertyStateProvinceID) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create essential indexes for performance
CREATE INDEX idx_hotels_name ON Hotels (GlobalPropertyName);
CREATE INDEX idx_hotels_rating ON Hotels (SabrePropertyRating DESC);
CREATE INDEX idx_hotels_sparkling_score ON Hotels (sparkling_score DESC);
CREATE INDEX idx_hotels_city ON Hotels (CityID);
CREATE INDEX idx_hotels_region ON Hotels (PropertyStateProvinceID);
CREATE INDEX idx_hotels_coordinates ON Hotels (PropertyLatitude, PropertyLongitude);

-- Authentication indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(account_status);

-- Hotel managers indexes
CREATE INDEX idx_hotel_managers_user ON hotel_managers(user_id);
CREATE INDEX idx_hotel_managers_hotel ON hotel_managers(hotel_id);
CREATE INDEX idx_hotel_managers_active ON hotel_managers(is_active);

-- Reviews indexes
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating DESC);
CREATE INDEX idx_reviews_date ON reviews(review_date DESC);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment_score DESC);

-- Review ratings indexes
CREATE INDEX idx_review_ratings_review ON review_ratings(review_id);
CREATE INDEX idx_review_ratings_category ON review_ratings(category_id);

-- Hotel ratings cache indexes
CREATE INDEX idx_hotel_ratings_score ON hotel_ratings_cache(sparkling_score DESC);
CREATE INDEX idx_hotel_ratings_hotel ON hotel_ratings_cache(hotel_id);
CREATE INDEX idx_hotel_ratings_current ON hotel_ratings_cache(is_current);

-- Session management indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
