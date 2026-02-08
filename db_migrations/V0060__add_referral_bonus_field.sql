-- Добавляем поле для отслеживания доступности реферального бонуса
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN IF NOT EXISTS referral_bonus_available BOOLEAN DEFAULT false;

-- Добавляем комментарий
COMMENT ON COLUMN t_p19021063_social_connect_platf.users.referral_bonus_available 
IS 'Доступен ли бонус "7 дней Premium за 1 руб" для нового пользователя по реферальной ссылке';