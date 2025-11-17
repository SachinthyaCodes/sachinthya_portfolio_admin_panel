-- Add 2FA columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

-- Create 2FA sessions table for temporary codes during login
CREATE TABLE IF NOT EXISTS two_factor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  temp_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique active sessions per user
  UNIQUE(user_id, temp_token)
);

-- Create index for cleanup and performance
CREATE INDEX IF NOT EXISTS idx_two_factor_sessions_expires_at ON two_factor_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_two_factor_sessions_user_id ON two_factor_sessions(user_id);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_sessions 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically cleanup expired sessions
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_2fa_sessions()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_expired_2fa_sessions();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs cleanup periodically
DROP TRIGGER IF EXISTS trigger_cleanup_2fa_sessions ON two_factor_sessions;
CREATE TRIGGER trigger_cleanup_2fa_sessions
  AFTER INSERT ON two_factor_sessions
  EXECUTE FUNCTION trigger_cleanup_expired_2fa_sessions();