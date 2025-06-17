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
