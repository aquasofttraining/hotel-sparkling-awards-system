CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    nationality VARCHAR(100),
    role_id INTEGER REFERENCES roles(id),
    account_status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add the hotel_id column to your existing table
ALTER TABLE users ADD COLUMN hotel_id INTEGER REFERENCES hotels(id);

-- Make it nullable since not all users will be hotel managers
ALTER TABLE users ALTER COLUMN hotel_id SET DEFAULT NULL;
