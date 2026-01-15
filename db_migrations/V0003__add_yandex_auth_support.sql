-- Добавление поддержки Яндекс авторизации
ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_users_yandex_id ON users(yandex_id);

-- Делаем email и password_hash nullable для OAuth провайдеров
-- Используем SET DEFAULT для существующих NOT NULL полей
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';
UPDATE users SET password_hash = '' WHERE password_hash IS NULL;

-- Создаём уникальный индекс для yandex_id (где не NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_yandex_id_unique ON users(yandex_id) WHERE yandex_id IS NOT NULL;