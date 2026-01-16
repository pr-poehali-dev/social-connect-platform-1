-- Объявления (Топ объявления)
CREATE TABLE dating_ads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    gender VARCHAR(50),
    age INTEGER,
    location VARCHAR(255),
    city VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dating_ads_user_id ON dating_ads(user_id);
CREATE INDEX idx_dating_ads_gender ON dating_ads(gender);
CREATE INDEX idx_dating_ads_city ON dating_ads(city);
CREATE INDEX idx_dating_ads_is_active ON dating_ads(is_active);
CREATE INDEX idx_dating_ads_created_at ON dating_ads(created_at DESC);

-- Услуги пользователей
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    age INTEGER,
    city VARCHAR(255),
    district VARCHAR(255),
    avatar_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    service_type VARCHAR(100),
    description TEXT,
    price VARCHAR(255),
    is_online BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_services_service_type ON services(service_type);
CREATE INDEX idx_services_is_online ON services(is_online);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Мероприятия
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255),
    city VARCHAR(255),
    author_name VARCHAR(255),
    author_avatar TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) DEFAULT 0,
    participants INTEGER DEFAULT 0,
    max_participants INTEGER,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_is_active ON events(is_active);

-- Таблица участников мероприятий
CREATE TABLE event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);