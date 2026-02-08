-- Добавляем настройку для скрытия наставника (пригласителя)
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN hide_mentor BOOLEAN DEFAULT FALSE;