
CREATE TABLE t_p19021063_social_connect_platf.photo_albums (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    name VARCHAR(100) NOT NULL DEFAULT 'Основной',
    type VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (type IN ('open', 'private')),
    access_key VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_photo_albums_user_id ON t_p19021063_social_connect_platf.photo_albums(user_id);

ALTER TABLE t_p19021063_social_connect_platf.user_photos 
ADD COLUMN album_id INTEGER REFERENCES t_p19021063_social_connect_platf.photo_albums(id);

CREATE INDEX idx_user_photos_album_id ON t_p19021063_social_connect_platf.user_photos(album_id);

INSERT INTO t_p19021063_social_connect_platf.photo_albums (user_id, name, type)
SELECT DISTINCT user_id, 'Основной', 'open'
FROM t_p19021063_social_connect_platf.user_photos
WHERE is_private = false;

UPDATE t_p19021063_social_connect_platf.user_photos up
SET album_id = pa.id
FROM t_p19021063_social_connect_platf.photo_albums pa
WHERE up.user_id = pa.user_id AND pa.type = 'open' AND up.is_private = false;

INSERT INTO t_p19021063_social_connect_platf.photo_albums (user_id, name, type)
SELECT DISTINCT user_id, 'Закрытый', 'private'
FROM t_p19021063_social_connect_platf.user_photos
WHERE is_private = true;

UPDATE t_p19021063_social_connect_platf.user_photos up
SET album_id = pa.id
FROM t_p19021063_social_connect_platf.photo_albums pa
WHERE up.user_id = pa.user_id AND pa.type = 'private' AND up.is_private = true;
