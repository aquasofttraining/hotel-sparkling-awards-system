CREATE VIEW user_details AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.nationality,
    r.role_name,
    u.account_status,
    u.email_verified,
    u.last_login,
    u.review_count,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- Hotel manager assignments for access control
CREATE VIEW hotel_manager_assignments AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    h.GlobalPropertyID as hotel_id,
    h.GlobalPropertyName as hotel_name,
    hm.assigned_at,
    hm.expires_at,
    hm.is_active,
    hm.assignment_reason
FROM hotel_managers hm
JOIN users u ON hm.user_id = u.id
JOIN Hotels h ON hm.hotel_id = h.GlobalPropertyID
WHERE hm.is_active = true;

-- Hotel rankings with comprehensive scoring
CREATE VIEW hotel_rankings AS
SELECT 
    h.GlobalPropertyID,
    h.GlobalPropertyName,
    h.PropertyAddress1,
    c.CityName,
    c.Country,
    h.SabrePropertyRating,
    h.HotelStars,
    h.DistanceToTheAirport,
    h.FloorsNumber,
    h.RoomsNumber,
    h.sparkling_score,
    hrc.review_component_score,
    hrc.metadata_component_score,
    hrc.sentiment_component_score,
    hrc.total_reviews,
    hrc.calculated_at,
    ROW_NUMBER() OVER (ORDER BY h.sparkling_score DESC NULLS LAST) as ranking
FROM Hotels h
LEFT JOIN Cities c ON h.CityID = c.CityID
LEFT JOIN hotel_ratings_cache hrc ON h.GlobalPropertyID = hrc.hotel_id AND hrc.is_current = true;

-- Review summary for hotels
CREATE VIEW hotel_review_summary AS
SELECT 
    h.GlobalPropertyID,
    h.GlobalPropertyName,
    COUNT(r.id) as total_reviews,
    AVG(r.overall_rating) as average_rating,
    AVG(r.sentiment_score) as average_sentiment,
    COUNT(CASE WHEN r.sentiment_label = 'positive' THEN 1 END) as positive_reviews,
    COUNT(CASE WHEN r.sentiment_label = 'negative' THEN 1 END) as negative_reviews,
    COUNT(CASE WHEN r.sentiment_label = 'neutral' THEN 1 END) as neutral_reviews,
    MAX(r.review_date) as latest_review_date
FROM Hotels h
LEFT JOIN reviews r ON h.GlobalPropertyID = r.hotel_id
GROUP BY h.GlobalPropertyID, h.GlobalPropertyName;
