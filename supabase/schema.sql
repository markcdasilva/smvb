-- Drop existing tables if they exist
DROP TABLE IF EXISTS file_uploads;
DROP TABLE IF EXISTS companies;
DROP TYPE IF EXISTS status;

-- Create status enum
CREATE TYPE status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR');

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    company_name TEXT NOT NULL,
    cvr TEXT NOT NULL,
    employees INTEGER NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    data_period_start DATE NOT NULL,
    data_period_end DATE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status status DEFAULT 'PENDING' NOT NULL
);

-- Create file_uploads table
CREATE TABLE file_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id)
);

-- Create indexes
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_created_at ON companies(created_at);
CREATE INDEX idx_file_uploads_company_id ON file_uploads(company_id);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at);

-- Create storage bucket for file uploads if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'kreditorlister'
    ) THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('kreditorlister', 'kreditorlister', false);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies (dropping existing ones first)
DROP POLICY IF EXISTS "Enable insert for anyone" ON companies;
DROP POLICY IF EXISTS "Enable read access for own company" ON companies;
DROP POLICY IF EXISTS "Enable update for own company" ON companies;
DROP POLICY IF EXISTS "Enable insert for company owners" ON file_uploads;
DROP POLICY IF EXISTS "Enable read for company owners" ON file_uploads;

-- Recreate policies
CREATE POLICY "Enable insert for anyone" ON companies FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Enable read access for own company" ON companies FOR SELECT TO anon USING (created_at >= NOW() - INTERVAL '24 hours');
CREATE POLICY "Enable update for own company" ON companies FOR UPDATE TO anon USING (created_at >= NOW() - INTERVAL '24 hours') WITH CHECK (true);

CREATE POLICY "Enable insert for company owners" ON file_uploads FOR INSERT TO anon WITH CHECK (
    EXISTS (
        SELECT 1 FROM companies
        WHERE id = file_uploads.company_id
        AND created_at >= NOW() - INTERVAL '24 hours'
    )
);

CREATE POLICY "Enable read for company owners" ON file_uploads FOR SELECT TO anon USING (
    EXISTS (
        SELECT 1 FROM companies
        WHERE id = file_uploads.company_id
        AND created_at >= NOW() - INTERVAL '24 hours'
    )
);

-- Storage policies (dropping existing ones first)
DROP POLICY IF EXISTS "Enable upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable download for file owners" ON storage.objects;

-- Recreate storage policies
CREATE POLICY "Enable upload for authenticated users" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'kreditorlister');
CREATE POLICY "Enable download for file owners" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'kreditorlister');