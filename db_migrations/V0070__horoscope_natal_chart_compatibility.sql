
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.daily_horoscopes (
    id SERIAL PRIMARY KEY,
    zodiac_sign VARCHAR(20) NOT NULL,
    horoscope_type VARCHAR(20) NOT NULL DEFAULT 'general',
    horoscope_date DATE NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 0,
    lucky_number INTEGER,
    lucky_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(zodiac_sign, horoscope_type, horoscope_date)
);

CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.natal_charts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME,
    birth_city VARCHAR(200),
    birth_lat DECIMAL(10,7),
    birth_lng DECIMAL(10,7),
    sun_sign VARCHAR(30),
    moon_sign VARCHAR(30),
    rising_sign VARCHAR(30),
    mercury_sign VARCHAR(30),
    venus_sign VARCHAR(30),
    mars_sign VARCHAR(30),
    jupiter_sign VARCHAR(30),
    saturn_sign VARCHAR(30),
    ai_interpretation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.compatibility_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    love_score INTEGER CHECK (love_score >= 0 AND love_score <= 100),
    friendship_score INTEGER CHECK (friendship_score >= 0 AND friendship_score <= 100),
    business_score INTEGER CHECK (business_score >= 0 AND business_score <= 100),
    communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
    ai_analysis TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_horoscopes_date_sign ON t_p19021063_social_connect_platf.daily_horoscopes(horoscope_date, zodiac_sign);
CREATE INDEX IF NOT EXISTS idx_natal_charts_user ON t_p19021063_social_connect_platf.natal_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_user ON t_p19021063_social_connect_platf.compatibility_results(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_target ON t_p19021063_social_connect_platf.compatibility_results(target_user_id);
