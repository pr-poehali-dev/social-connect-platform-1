-- Таблица для чатов (личные, групповые, обсуждение сделок)
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.conversations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('personal', 'group', 'deal')),
    name VARCHAR(255),
    avatar_url TEXT,
    deal_status VARCHAR(50),
    deal_ad_id INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица участников чатов
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_conversations_type ON t_p19021063_social_connect_platf.conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON t_p19021063_social_connect_platf.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON t_p19021063_social_connect_platf.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON t_p19021063_social_connect_platf.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON t_p19021063_social_connect_platf.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON t_p19021063_social_connect_platf.messages(created_at DESC);
