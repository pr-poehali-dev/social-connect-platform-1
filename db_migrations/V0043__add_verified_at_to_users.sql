-- Добавляем поле для хранения времени верификации
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN IF NOT EXISTS verified_at timestamp without time zone NULL;

-- Обновляем существующих верифицированных пользователей
UPDATE t_p19021063_social_connect_platf.users 
SET verified_at = CURRENT_TIMESTAMP 
WHERE is_verified = true AND verified_at IS NULL;