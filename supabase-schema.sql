-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  technology VARCHAR(255),
  category VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('active', 'completed', 'on-hold')) DEFAULT 'active',
  priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  order_index INTEGER DEFAULT 1,
  is_shown BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT NULL, -- For portfolio display ordering (1-5 for shown projects)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(user_id, order_index);

-- Enable Row Level Security (RLS) - Optional since we're using custom JWT auth
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- For this setup, we'll handle authorization in the API routes instead of RLS
-- Comment out RLS policies since we're using custom authentication

-- Create RLS policies (COMMENTED OUT - using API-level auth instead)
-- CREATE POLICY "Users can view own profile" ON users
--   FOR SELECT USING (auth.uid()::text = id::text);

-- CREATE POLICY "Users can update own profile" ON users
--   FOR UPDATE USING (auth.uid()::text = id::text);

-- CREATE POLICY "Users can view own projects" ON projects
--   FOR SELECT USING (auth.uid()::text = user_id::text);

-- CREATE POLICY "Users can insert own projects" ON projects
--   FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- CREATE POLICY "Users can update own projects" ON projects
--   FOR UPDATE USING (auth.uid()::text = user_id::text);

-- CREATE POLICY "Users can delete own projects" ON projects
--   FOR DELETE USING (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a default admin user (change password after setup)
INSERT INTO users (email, password_hash, first_name, last_name, is_active)
VALUES (
  'admin@sachinthya.dev',
  '$2a$10$rXK8k6QQr6k6QQr6k6QQr6k6QQr6k6QQr6k6QQr6k6QQr6k6QQr6k',
  'Admin',
  'User',
  true
) ON CONFLICT (email) DO NOTHING;