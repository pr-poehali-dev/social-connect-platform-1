-- Создание таблицы для анкет знакомств
CREATE TABLE IF NOT EXISTS dating_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    city VARCHAR(255),
    district VARCHAR(255),
    interests TEXT[],
    bio TEXT,
    avatar_url TEXT,
    height INTEGER,
    body_type VARCHAR(100),
    marital_status VARCHAR(100),
    has_children VARCHAR(50),
    education VARCHAR(255),
    work VARCHAR(255),
    financial_status VARCHAR(100),
    has_car VARCHAR(50),
    has_housing VARCHAR(100),
    dating_goal VARCHAR(255),
    is_top_ad BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_dating_profiles_user_id ON dating_profiles(user_id);
CREATE INDEX idx_dating_profiles_city ON dating_profiles(city);
CREATE INDEX idx_dating_profiles_age ON dating_profiles(age);
CREATE INDEX idx_dating_profiles_is_top_ad ON dating_profiles(is_top_ad);

-- Таблица для лайков/избранного в знакомствах
CREATE TABLE IF NOT EXISTS dating_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, profile_id)
);

CREATE INDEX idx_dating_favorites_user_id ON dating_favorites(user_id);

-- Таблица для заявок в друзья
CREATE TABLE IF NOT EXISTS dating_friend_requests (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL,
    to_profile_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_user_id, to_profile_id)
);

CREATE INDEX idx_dating_friend_requests_from_user ON dating_friend_requests(from_user_id);
CREATE INDEX idx_dating_friend_requests_to_profile ON dating_friend_requests(to_profile_id);