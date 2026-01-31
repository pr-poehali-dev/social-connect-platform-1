-- Add dating_visible column to users table
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN IF NOT EXISTS dating_visible BOOLEAN DEFAULT TRUE;

-- Set default to TRUE for existing users
UPDATE t_p19021063_social_connect_platf.users 
SET dating_visible = TRUE 
WHERE dating_visible IS NULL;