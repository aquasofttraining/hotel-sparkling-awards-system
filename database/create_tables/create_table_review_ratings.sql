CREATE TABLE review_ratings (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id),
    category_id INTEGER NOT NULL REFERENCES review_categories(id),
    rating_value NUMERIC(3,1) CHECK (rating_value >= 1.0 AND rating_value <= 5.0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
