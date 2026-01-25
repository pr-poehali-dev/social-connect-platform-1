-- Создаём профили знакомств для всех пользователей, у которых их нет
INSERT INTO dating_profiles (
    user_id, 
    name, 
    age, 
    avatar_url,
    gender,
    is_top_ad,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.name,
    18,
    u.avatar_url,
    COALESCE(u.gender, ''),
    false,
    NOW(),
    NOW()
FROM users u
LEFT JOIN dating_profiles dp ON u.id = dp.user_id
WHERE dp.id IS NULL;