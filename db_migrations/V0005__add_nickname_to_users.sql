-- Add nickname column with unique constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- Create unique index on nickname
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nickname_unique ON users(nickname) WHERE nickname IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);