-- PostGIS updates for Priority Algorithm
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location geometry column for better performance and spatial queries
ALTER TABLE voz_complaints ADD COLUMN IF NOT EXISTS location GEOMETRY(Point, 4326);
UPDATE voz_complaints SET location = ST_SetSRID(ST_Point(lng, lat), 4326) WHERE location IS NULL;
CREATE INDEX IF NOT EXISTS voz_idx_complaints_location_geom ON voz_complaints USING GIST (location);

-- Add urgency_level for manual administrative priority
ALTER TABLE voz_complaints ADD COLUMN IF NOT EXISTS urgency_level INTEGER DEFAULT 0;
