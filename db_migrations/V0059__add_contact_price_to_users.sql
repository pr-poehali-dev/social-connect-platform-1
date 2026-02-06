-- Add contact_price field to users table for monetizing contact information
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN contact_price INTEGER DEFAULT 0;

COMMENT ON COLUMN t_p19021063_social_connect_platf.users.contact_price IS 'Price in LOVE tokens to access user contacts (0 = free access)';