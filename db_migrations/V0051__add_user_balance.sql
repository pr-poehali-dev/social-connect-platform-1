-- Добавляем поле для основного баланса пользователя
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL;

-- Создаем индекс для быстрого поиска
CREATE INDEX idx_users_balance ON t_p19021063_social_connect_platf.users(balance);