-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    related_user_id INTEGER,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON t_p19021063_social_connect_platf.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON t_p19021063_social_connect_platf.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON t_p19021063_social_connect_platf.notifications(created_at DESC);