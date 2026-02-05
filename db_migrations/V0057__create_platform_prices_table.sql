-- Создание таблицы для хранения цен на услуги платформы
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.platform_prices (
    id SERIAL PRIMARY KEY,
    service_key VARCHAR(100) UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Вставка начальных значений цен
INSERT INTO t_p19021063_social_connect_platf.platform_prices (service_key, service_name, price, category, description) VALUES
-- Premium подписка
('premium_month', '1 месяц Premium', 299, 'premium', 'Premium-статус на 1 месяц'),
('premium_3months', '3 месяца Premium', 699, 'premium', 'Premium-статус на 3 месяца'),
('premium_6months', '6 месяцев Premium', 1199, 'premium', 'Premium-статус на 6 месяцев'),
('premium_year', '1 год Premium', 1999, 'premium', 'Premium-статус на 1 год'),

-- Поднятие анкеты
('profile_boost_1day', 'Поднятие на 1 день', 49, 'boost', 'Поднятие анкеты в топ на 1 день'),
('profile_boost_3days', 'Поднятие на 3 дня', 99, 'boost', 'Поднятие анкеты в топ на 3 дня'),
('profile_boost_week', 'Поднятие на 7 дней', 199, 'boost', 'Поднятие анкеты в топ на 7 дней'),

-- Подарки
('gift_rose', 'Роза', 29, 'gifts', 'Виртуальный подарок - роза'),
('gift_heart', 'Сердце', 49, 'gifts', 'Виртуальный подарок - сердце'),
('gift_kiss', 'Поцелуй', 79, 'gifts', 'Виртуальный подарок - поцелуй'),
('gift_teddy', 'Мишка', 149, 'gifts', 'Виртуальный подарок - плюшевый мишка'),
('gift_champagne', 'Шампанское', 249, 'gifts', 'Виртуальный подарок - шампанское'),
('gift_diamond', 'Бриллиант', 499, 'gifts', 'Виртуальный подарок - бриллиант')
ON CONFLICT (service_key) DO NOTHING;

-- Создание индекса для быстрого поиска по категории
CREATE INDEX IF NOT EXISTS idx_platform_prices_category ON t_p19021063_social_connect_platf.platform_prices(category);
