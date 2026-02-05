-- Добавляем поле для хранения финансового пароля (хешированного)
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN financial_password VARCHAR(255);

-- Создаем индекс
CREATE INDEX idx_users_financial_password ON t_p19021063_social_connect_platf.users(financial_password);