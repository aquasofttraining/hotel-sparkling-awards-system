-- Administrator (id = 3) - all permissions
INSERT INTO roles_permissions (role_id, permission_id)
SELECT 3, id FROM permissions;

-- Hotel Manager (id = 1) 
INSERT INTO roles_permissions (role_id, permission_id) VALUES
(1, 1), -- view_users
(1, 5), -- view_hotels
(1, 6); -- manage_assigned_hotels

-- Traveler (id = 2)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
(2, 5); -- view_hotels

-- Data Operator (id = 4)
INSERT INTO roles_permissions (role_id, permission_id) VALUES
(4, 5),  -- view_hotels
(4, 8);  -- export_data
