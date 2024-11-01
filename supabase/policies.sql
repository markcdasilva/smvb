-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for anon" ON companies;
DROP POLICY IF EXISTS "Enable all operations for anon" ON file_uploads;

-- Companies policies
CREATE POLICY "Enable insert for anyone" ON companies
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Enable read access for own company" ON companies
FOR SELECT TO anon
USING (created_at >= NOW() - INTERVAL '24 hours');

CREATE POLICY "Enable update for own company" ON companies
FOR UPDATE TO anon
USING (created_at >= NOW() - INTERVAL '24 hours')
WITH CHECK (true);

-- File uploads policies
CREATE POLICY "Enable insert for company owners" ON file_uploads
FOR INSERT TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM companies
    WHERE id = file_uploads.company_id
    AND created_at >= NOW() - INTERVAL '24 hours'
  )
);

CREATE POLICY "Enable read for company owners" ON file_uploads
FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM companies
    WHERE id = file_uploads.company_id
    AND created_at >= NOW() - INTERVAL '24 hours'
  )
);