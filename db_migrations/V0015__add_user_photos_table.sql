-- Create user_photos table for photo gallery
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.user_photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    photo_url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, position)
);

CREATE INDEX idx_user_photos_user_id ON t_p19021063_social_connect_platf.user_photos(user_id);
CREATE INDEX idx_user_photos_position ON t_p19021063_social_connect_platf.user_photos(user_id, position);