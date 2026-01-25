-- Создать профили знакомств для всех существующих пользователей
INSERT INTO t_p19021063_social_connect_platf.dating_profiles (
    user_id, 
    name, 
    age, 
    is_top_ad, 
    created_at, 
    updated_at
)
SELECT 
    u.id,
    COALESCE(u.name, u.nickname, 'Пользователь'),
    COALESCE(u.age_from, 18),
    FALSE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM t_p19021063_social_connect_platf.users u
WHERE NOT EXISTS (
    SELECT 1 FROM t_p19021063_social_connect_platf.dating_profiles dp 
    WHERE dp.user_id = u.id
);