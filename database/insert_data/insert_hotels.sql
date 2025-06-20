COPY hotels(
    GlobalPropertyID, GlobalPropertyName, PropertyAddress1, CityID, PropertyStateProvinceID,
    PropertyLatitude, PropertyLongitude, SabrePropertyRating, HotelStars,
    DistanceToTheAirport, FloorsNumber, RoomsNumber, sparkling_score, last_updated
)
FROM '/Users/alexandru/Desktop/minisprint-004/hotel-sparkling-awards-system/csv/hotels_sparkling_awards.csv'
DELIMITER ','
CSV HEADER;