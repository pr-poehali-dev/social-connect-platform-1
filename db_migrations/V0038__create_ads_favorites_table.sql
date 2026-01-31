CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.ads_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ad_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, ad_id)
);