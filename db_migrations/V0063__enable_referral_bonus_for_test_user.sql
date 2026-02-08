-- Включаем referral_bonus_available для тестового пользователя
UPDATE t_p19021063_social_connect_platf.users 
SET referral_bonus_available = true 
WHERE id = 6 AND referred_by IS NOT NULL;
