COPY hotels(
    GlobalPropertyID, GlobalPropertyName, PropertyAddress1, CityID, PropertyStateProvinceID,
    PropertyLatitude, PropertyLongitude, SabrePropertyRating, HotelStars,
    DistanceToTheAirport, FloorsNumber, RoomsNumber, sparkling_score, last_updated
)
FROM '/docker-entrypoint-initdb.d/csv/hotels_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;