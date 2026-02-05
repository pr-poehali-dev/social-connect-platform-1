-- Добавляем поле is_private для закрытого альбома
ALTER TABLE t_p19021063_social_connect_platf.user_photos 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- Создаём таблицу для управления доступом к закрытым фото
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.photo_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    granted_to_user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, granted_to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_photo_access_granted_to ON t_p19021063_social_connect_platf.photo_access(granted_to_user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_private ON t_p19021063_social_connect_platf.user_photos(user_id, is_private);