INSERT INTO t_p19021063_social_connect_platf.dating_profiles (user_id, name, age, is_top_ad)
SELECT 
    u.id,
    COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')), ''), u.nickname, 'Пользователь') as name,
    0,
    FALSE
FROM t_p19021063_social_connect_platf.users u
WHERE NOT EXISTS (
    SELECT 1 FROM t_p19021063_social_connect_platf.dating_profiles dp WHERE dp.user_id = u.id
);