CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE review_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
    review_date DATE NOT NULL,
    helpful_votes INTEGER DEFAULT 0,
    platform VARCHAR(50) DEFAULT 'booking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(GlobalPropertyID) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


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


ALTER TABLE Hotels ADD CONSTRAINT fk_hotels_city 
    FOREIGN KEY (CityID) REFERENCES Cities(CityID);

ALTER TABLE Hotels ADD CONSTRAINT fk_hotels_region 
    FOREIGN KEY (PropertyStateProvinceID) REFERENCES Regions(PropertyStateProvinceID);


CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);
CREATE INDEX idx_review_ratings_review_id ON review_ratings(review_id);


INSERT INTO review_categories (category_name) VALUES
('Location'), ('Cleanliness'), ('Service'), ('Value'), ('Comfort');
