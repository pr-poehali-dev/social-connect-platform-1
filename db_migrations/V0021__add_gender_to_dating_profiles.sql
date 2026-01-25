-- Добавляем поле gender в dating_profiles
ALTER TABLE t_p19021063_social_connect_platf.dating_profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Копируем gender из users в dating_profiles для всех существующих анкет
UPDATE t_p19021063_social_connect_platf.dating_profiles dp
SET gender = u.gender
FROM t_p19021063_social_connect_platf.users u
WHERE dp.user_id = u.id;