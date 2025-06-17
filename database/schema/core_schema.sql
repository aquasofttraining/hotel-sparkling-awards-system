CREATE DATABASE hotel_sparkling_awards_db
WITH 
    OWNER postgres
    ENCODING 'UTF8'
    TEMPLATE template0;

COMMENT ON DATABASE hotel_sparkling_awards_db IS 'Hotel Sparkling Awards System Database';
GRANT ALL PRIVILEGES ON DATABASE hotel_sparkling_awards_db TO postgres;
ALTER DATABASE hotel_sparkling_awards_db SET timezone TO 'UTC';

-- Cities table stores location data for hotels
CREATE TABLE Cities (
    CityID SERIAL PRIMARY KEY,
    CityName VARCHAR(100) NOT NULL,
    Country VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_cities_name_country UNIQUE(CityName, Country)
);

-- Regions table stores state/province information  
CREATE TABLE Regions (
    PropertyStateProvinceID SERIAL PRIMARY KEY,
    PropertyStateProvinceName VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_regions_name UNIQUE(PropertyStateProvinceName)
);

-- Hotels table with enhanced fields for sparkling awards
CREATE TABLE Hotels (
    GlobalPropertyID SERIAL PRIMARY KEY,
    SourcePropertyID VARCHAR(50),
    GlobalPropertyName VARCHAR(255) NOT NULL,
    GlobalChainCode VARCHAR(20),
    PropertyAddress1 TEXT,
    PropertyAddress2 TEXT,
    PrimaryAirportCode VARCHAR(20),
    CityID INTEGER,
    PropertyStateProvinceID INTEGER,
    PropertyZipPostal VARCHAR(50),
    PropertyPhoneNumber VARCHAR(50),
    PropertyFaxNumber VARCHAR(50),
    SabrePropertyRating DECIMAL(3,1),
    PropertyLatitude DECIMAL(9,6),
    PropertyLongitude DECIMAL(9,6),
    SourceGroupCode VARCHAR(20),
    
    -- metadata fields for sparkling awards
    HotelStars INTEGER CHECK (HotelStars >= 1 AND HotelStars <= 5),
    DistanceToTheAirport DECIMAL(5,2),
    FloorsNumber INTEGER,
    RoomsNumber INTEGER,
    sparkling_score DECIMAL(5,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT ck_hotels_name_not_empty CHECK (LENGTH(TRIM(GlobalPropertyName)) > 0),
    CONSTRAINT ck_hotels_rating_range CHECK (SabrePropertyRating IS NULL OR (SabrePropertyRating >= 0 AND SabrePropertyRating <= 10)),
    CONSTRAINT ck_hotels_latitude_range CHECK (PropertyLatitude IS NULL OR (PropertyLatitude >= -90 AND PropertyLatitude <= 90)),
    CONSTRAINT ck_hotels_longitude_range CHECK (PropertyLongitude IS NULL OR (PropertyLongitude >= -180 AND PropertyLongitude <= 180)),
    CONSTRAINT ck_hotels_sparkling_score CHECK (sparkling_score IS NULL OR (sparkling_score >= 0 AND sparkling_score <= 100))
);
