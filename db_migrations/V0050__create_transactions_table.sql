-- Таблица для хранения транзакций пополнений
CREATE TABLE t_p19021063_social_connect_platf.transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'bonus', 'withdrawal')),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    referrer_id INTEGER REFERENCES t_p19021063_social_connect_platf.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_transactions_user_id ON t_p19021063_social_connect_platf.transactions(user_id);
CREATE INDEX idx_transactions_referrer_id ON t_p19021063_social_connect_platf.transactions(referrer_id);
CREATE INDEX idx_transactions_type ON t_p19021063_social_connect_platf.transactions(type);
CREATE INDEX idx_transactions_created_at ON t_p19021063_social_connect_platf.transactions(created_at);