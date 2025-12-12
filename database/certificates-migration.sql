-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  link TEXT,
  issued_date DATE NOT NULL,
  credential_type VARCHAR(20) NOT NULL DEFAULT 'certification' CHECK (credential_type IN ('badge', 'certification')),
  order_index INTEGER DEFAULT 0,
  is_shown BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

-- Create index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_certificates_order ON certificates(order_index);

-- Create index on is_shown for filtering visible certificates
CREATE INDEX IF NOT EXISTS idx_certificates_shown ON certificates(is_shown);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certificates_updated_at
BEFORE UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION update_certificates_updated_at();

-- Enable Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
CREATE POLICY "Service role can manage certificates"
ON certificates
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow authenticated users to read visible certificates
CREATE POLICY "Anyone can view visible certificates"
ON certificates
FOR SELECT
USING (is_shown = true);

-- Grant permissions
GRANT ALL ON certificates TO service_role;
GRANT SELECT ON certificates TO anon;
GRANT SELECT ON certificates TO authenticated;
