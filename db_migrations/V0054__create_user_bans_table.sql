-- Создаем таблицу для банов пользователей
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.user_bans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    banned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    banned_until TIMESTAMP NOT NULL,
    ban_count INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON t_p19021063_social_connect_platf.user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON t_p19021063_social_connect_platf.user_bans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_bans_until ON t_p19021063_social_connect_platf.user_bans(banned_until);

-- Добавляем поле is_banned в таблицу users
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;