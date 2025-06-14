-- Link hotels to their cities with proper referential actions
ALTER TABLE Hotels 
ADD CONSTRAINT fk_hotels_city 
FOREIGN KEY (CityID) REFERENCES Cities(CityID) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Link hotels to their regions with proper referential actions
ALTER TABLE Hotels 
ADD CONSTRAINT fk_hotels_region 
FOREIGN KEY (PropertyStateProvinceID) REFERENCES Regions(PropertyStateProvinceID)
ON DELETE SET NULL ON UPDATE CASCADE;