CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(30) NOT NULL UNIQUE,
    permission VARCHAR(50) REFERENCES permissions(permission) 
);

