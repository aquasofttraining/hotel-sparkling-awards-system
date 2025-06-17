CREATE TABLE review_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    weight DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table with enhanced fields
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
    review_date DATE NOT NULL,
    helpful_votes INTEGER DEFAULT 0,
    platform VARCHAR(50) DEFAULT 'booking_sparkling_awards',
    
    -- Sentiment analysis fields
    sentiment_score DECIMAL(3,2),
    sentiment_label VARCHAR(20),
    confidence DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (hotel_id) REFERENCES Hotels(GlobalPropertyID) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Review ratings for individual categories
CREATE TABLE review_ratings (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    rating_value DECIMAL(2,1) NOT NULL CHECK (rating_value >= 1.0 AND rating_value <= 5.0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES review_categories(id) ON DELETE CASCADE,
    UNIQUE(review_id, category_id)
);

-- Hotel ratings cache for performance
CREATE TABLE hotel_ratings_cache (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES Hotels(GlobalPropertyID) ON DELETE CASCADE,
    sparkling_score DECIMAL(5,2) NOT NULL CHECK (sparkling_score >= 0 AND sparkling_score <= 100),
    review_component_score DECIMAL(5,2),
    metadata_component_score DECIMAL(5,2),
    sentiment_component_score DECIMAL(5,2),
    
    -- Category breakdown scores
    amenities_score DECIMAL(5,2),
    cleanliness_score DECIMAL(5,2),
    food_beverage_score DECIMAL(5,2),
    sleep_quality_score DECIMAL(5,2),
    internet_quality_score DECIMAL(5,2),
    
    total_reviews INTEGER DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT TRUE,
    
    UNIQUE(hotel_id, is_current) DEFERRABLE INITIALLY DEFERRED
);
