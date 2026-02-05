-- Добавляем поля для реферальной системы
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN referral_code VARCHAR(20) UNIQUE,
ADD COLUMN referred_by INTEGER REFERENCES t_p19021063_social_connect_platf.users(id);

-- Создаем индекс для быстрого поиска по реферальному коду
CREATE INDEX idx_users_referral_code ON t_p19021063_social_connect_platf.users(referral_code);
CREATE INDEX idx_users_referred_by ON t_p19021063_social_connect_platf.users(referred_by);

-- Генерируем уникальные реферальные коды для существующих пользователей
UPDATE t_p19021063_social_connect_platf.users 
SET referral_code = 'REF' || LPAD(id::TEXT, 8, '0') || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)
WHERE referral_code IS NULL;