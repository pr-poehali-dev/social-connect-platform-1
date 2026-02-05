-- Добавляем поле для фона профиля Premium-пользователей
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN profile_background VARCHAR(255) DEFAULT 'gradient-purple';

COMMENT ON COLUMN t_p19021063_social_connect_platf.users.profile_background IS 'Фон анкеты для Premium-пользователей (gradient-purple, gradient-pink, gradient-blue, gradient-sunset, gradient-ocean, gradient-forest, или URL изображения)';