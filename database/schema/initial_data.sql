-- Insert initial roles
INSERT INTO roles (role_name, description) VALUES
('hotel_manager', 'Manages assigned hotels and views analytics'),
('traveler', 'Books hotels and writes reviews'),
('administrator', 'Full system access and user management'),
('data_operator', 'Manages hotel data and generates reports');

-- Insert permissions
INSERT INTO permissions (permission, description, category) VALUES
-- Hotel management permissions
('read_hotel_data', 'Read hotel information', 'hotels'),
('write_hotel_data', 'Create and update hotels', 'hotels'),
('delete_hotel_data', 'Delete hotels', 'hotels'),
('manage_property', 'Manage assigned hotels only', 'hotels'),

-- User management permissions
('read_users', 'Read user profiles', 'users'),
('write_users', 'Create and update users', 'users'),
('delete_users', 'Delete users', 'users'),
('assign_roles', 'Assign roles to users', 'users'),

-- Review management permissions
('read_reviews', 'Read reviews', 'reviews'),
('write_reviews', 'Write reviews', 'reviews'),
('moderate_reviews', 'Moderate reviews', 'reviews'),

-- Analytics permissions
('view_analytics', 'View analytics dashboards', 'analytics'),
('export_data', 'Export analytics data', 'analytics'),

-- System administration permissions
('full_access', 'Full system administration', 'system'),
('user_management', 'User account management', 'system'),
('system_config', 'System configuration', 'system'),
('data_analysis', 'Data analysis access', 'system');

-- Assign permissions to roles
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE (r.role_name = 'administrator' AND p.category IN ('hotels', 'users', 'reviews', 'analytics', 'system'))
   OR (r.role_name = 'hotel_manager' AND p.permission IN ('read_hotel_data', 'manage_property', 'view_analytics', 'read_reviews'))
   OR (r.role_name = 'traveler' AND p.permission IN ('read_hotel_data', 'read_reviews', 'write_reviews'))
   OR (r.role_name = 'data_operator' AND p.permission IN ('read_hotel_data', 'view_analytics', 'export_data', 'data_analysis'));

-- Insert review categories for sparkling awards
INSERT INTO review_categories (category_name, description, weight) VALUES
('AmenitiesRate', 'Guest ratings for amenities (pool, gym)', 0.20),
('CleanlinessRate', 'Guest ratings for cleanliness', 0.25),
('FoodBeverage', 'Guest ratings for food and beverage services', 0.15),
('SleepQuality', 'Guest ratings for sleep experience', 0.20),
('InternetQuality', 'Guest ratings for internet quality', 0.10);

-- Insert sample cities (will be populated by scraper)
INSERT INTO Cities (CityName, Country) VALUES
('Paris', 'France'),
('London', 'United Kingdom'),
('Rome', 'Italy'),
('Madrid', 'Spain'),
('Amsterdam', 'Netherlands'),
('Brussels', 'Belgium'),
('Istanbul', 'Turkey'),
('Warsaw', 'Poland'),
('Dubai', 'UAE'),
('Cape Town', 'South Africa'),
('Beirut', 'Lebanon');

-- Insert sample regions (will be populated by scraper)
INSERT INTO Regions (PropertyStateProvinceName) VALUES
('Île-de-France'),
('Greater London'),
('Lazio'),
('Community of Madrid'),
('North Holland'),
('Brussels-Capital Region'),
('Istanbul Province'),
('Masovian Voivodeship'),
('Dubai Emirate'),
('Western Cape'),
('Beirut Governorate');
