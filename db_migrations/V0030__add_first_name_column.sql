-- Добавляем колонку first_name для имени пользователя
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN first_name VARCHAR(255);

-- Копируем данные из name в first_name для существующих пользователей
UPDATE t_p19021063_social_connect_platf.users 
SET first_name = name 
WHERE name IS NOT NULL;