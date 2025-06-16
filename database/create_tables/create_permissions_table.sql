CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    permission VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);