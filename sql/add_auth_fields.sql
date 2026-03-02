-- Add auth fields to visitors table
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS email TEXT;
