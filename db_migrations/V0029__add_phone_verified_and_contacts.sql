-- Добавляем колонку phone_verified в dating_profiles
ALTER TABLE t_p19021063_social_connect_platf.dating_profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Добавляем колонку phone если её нет
ALTER TABLE t_p19021063_social_connect_platf.dating_profiles
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Добавляем колонку telegram если её нет
ALTER TABLE t_p19021063_social_connect_platf.dating_profiles
ADD COLUMN IF NOT EXISTS telegram VARCHAR(100);

-- Добавляем колонку instagram если её нет
ALTER TABLE t_p19021063_social_connect_platf.dating_profiles
ADD COLUMN IF NOT EXISTS instagram VARCHAR(100);
