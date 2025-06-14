-- Essential indexes for the required API endpoints

-- Hotel name search for GET /hotels/:name endpoint
CREATE INDEX idx_hotels_name ON Hotels (GlobalPropertyName);

-- Rating sorting for "best hotels" queries
CREATE INDEX idx_hotels_rating ON Hotels (SabrePropertyRating DESC);

-- Foreign key indexes for efficient joins
CREATE INDEX idx_hotels_city ON Hotels (CityID);
CREATE INDEX idx_hotels_region ON Hotels (PropertyStateProvinceID);

-- Lookup indexes for city and region name searches
CREATE INDEX idx_cities_name ON Cities (CityName);
CREATE INDEX idx_regions_name ON Regions (PropertyStateProvinceName);

-- Composite index for common search pattern: hotels in city sorted by rating
-- This supports queries like "best hotels in NYC"
CREATE INDEX idx_hotels_search_performance ON Hotels (CityID, SabrePropertyRating DESC);

