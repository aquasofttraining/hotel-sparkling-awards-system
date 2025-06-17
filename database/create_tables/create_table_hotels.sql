CREATE TABLE hotels (
    GlobalPropertyID INTEGER PRIMARY KEY,
    GlobalPropertyName VARCHAR(255),
    PropertyAddress1 TEXT,
    CityID INTEGER,
    PropertyStateProvinceID INTEGER,
    PropertyLatitude DOUBLE PRECISION,
    PropertyLongitude DOUBLE PRECISION,
    SabrePropertyRating NUMERIC(3,1),
    HotelStars INTEGER,
    DistanceToTheAirport NUMERIC(5,2),
    FloorsNumber INTEGER,
    RoomsNumber INTEGER,
    sparkling_score NUMERIC(5,2),
    last_updated TIMESTAMP
);
