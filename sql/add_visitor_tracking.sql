-- 1. Add visitor_id column to kaspi_payment_requests
ALTER TABLE kaspi_payment_requests ADD COLUMN IF NOT EXISTS visitor_id TEXT;

-- 2. Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  visitor_id TEXT PRIMARY KEY,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on visitors
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous insert/update/select on visitors
CREATE POLICY "Allow anonymous insert on visitors" ON visitors
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update on visitors" ON visitors
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous select on visitors" ON visitors
  FOR SELECT TO anon USING (true);

-- 5. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_kaspi_requests_visitor_id ON kaspi_payment_requests (visitor_id);
