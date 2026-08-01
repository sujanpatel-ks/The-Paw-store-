-- Add searchVector generated column to Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(array_to_string(tags, ' '), '')
    )
  ) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");
