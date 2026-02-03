-- Создание таблицы для лайков фотографий
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.photo_likes (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(photo_id, user_id)
);

CREATE INDEX idx_photo_likes_photo_id ON t_p19021063_social_connect_platf.photo_likes(photo_id);
CREATE INDEX idx_photo_likes_user_id ON t_p19021063_social_connect_platf.photo_likes(user_id);