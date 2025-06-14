-- Create the main database with UTF8 encoding for international hotel names
CREATE DATABASE hotel_management_db
    WITH 
    OWNER postgres
    ENCODING 'UTF8'
    TEMPLATE template0;

-- Simple description for the database
COMMENT ON DATABASE hotel_management_db IS 'MiniSprint 2: Hotel Management Database';

-- Grant full access to postgres user
GRANT ALL PRIVILEGES ON DATABASE hotel_management_db TO postgres;

-- Set timezone to UTC for consistent datetime handling
ALTER DATABASE hotel_management_db SET timezone TO 'UTC';