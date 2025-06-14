-- Fix all problematic columns at once
ALTER TABLE Hotels ALTER COLUMN GlobalPropertyName TYPE VARCHAR(255);
ALTER TABLE Hotels ALTER COLUMN PropertyZipPostal TYPE VARCHAR(50);
ALTER TABLE Hotels ALTER COLUMN PropertyPhoneNumber TYPE VARCHAR(50);  
ALTER TABLE Hotels ALTER COLUMN PropertyFaxNumber TYPE VARCHAR(50);

-- Also increase these for safety
ALTER TABLE Hotels ALTER COLUMN GlobalChainCode TYPE VARCHAR(20);
ALTER TABLE Hotels ALTER COLUMN PrimaryAirportCode TYPE VARCHAR(20);
ALTER TABLE Hotels ALTER COLUMN SourceGroupCode TYPE VARCHAR(20);