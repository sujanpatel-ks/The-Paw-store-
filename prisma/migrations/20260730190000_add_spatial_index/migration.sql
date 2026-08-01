-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateIndex
CREATE INDEX "PartnerStore_lat_lng_idx" ON "PartnerStore"("lat", "lng");
