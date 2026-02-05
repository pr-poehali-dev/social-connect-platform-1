-- Добавляем поле для бонусного баланса
ALTER TABLE t_p19021063_social_connect_platf.users 
ADD COLUMN bonus_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL;

-- Создаем индекс для быстрого поиска
CREATE INDEX idx_users_bonus_balance ON t_p19021063_social_connect_platf.users(bonus_balance);