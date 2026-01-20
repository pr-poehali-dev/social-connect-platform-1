-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(72) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    created_by INTEGER REFERENCES admins(id)
);

-- Таблица для логов действий администраторов
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для истории входов пользователей
CREATE TABLE IF NOT EXISTS user_login_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true
);

-- Расширение таблицы users для VIP-статуса и блокировки
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_by INTEGER REFERENCES admins(id);

-- Таблица для фильтров и настроек разделов
CREATE TABLE IF NOT EXISTS site_filters (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    filter_key VARCHAR(100) NOT NULL,
    filter_label VARCHAR(255) NOT NULL,
    filter_type VARCHAR(50) NOT NULL,
    options JSONB,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section, filter_key)
);

-- Таблица для настроек разделов сайта
CREATE TABLE IF NOT EXISTS site_sections (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(50) NOT NULL UNIQUE,
    section_name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    settings JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES admins(id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_login_at ON user_login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
CREATE INDEX IF NOT EXISTS idx_users_is_vip ON users(is_vip);
CREATE INDEX IF NOT EXISTS idx_site_filters_section ON site_filters(section, is_active);

-- Вставляем первого супер-админа (пароль: admin123, нужно сменить!)
INSERT INTO admins (email, password_hash, name, role) 
VALUES ('admin@connecthub.ru', '$2b$10$rHZQ8yZxJ.hY5kN7Z3iNyOCXqR5K6rGfB8qF3qN5L6xN8qF3qN5L6', 'Главный администратор', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Вставляем базовые разделы сайта
INSERT INTO site_sections (section_key, section_name, is_enabled) VALUES
('dating', 'Знакомства', true),
('ads', 'Объявления', true),
('services', 'Услуги', true),
('events', 'Мероприятия', true)
ON CONFLICT (section_key) DO NOTHING;