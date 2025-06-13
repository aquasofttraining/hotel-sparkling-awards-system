CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    nationality VARCHAR(50),
    role_id INTEGER REFERENCES roles(id)
);