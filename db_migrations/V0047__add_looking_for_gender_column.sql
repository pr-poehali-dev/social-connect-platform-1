-- Добавление поля для хранения предпочитаемого пола партнера
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN IF NOT EXISTS looking_for_gender VARCHAR(20);

COMMENT ON COLUMN t_p19021063_social_connect_platf.users.looking_for_gender IS 'Предпочитаемый пол партнера (male/female/any)';
