-- Обновляем имена в существующих диалогах на основе first_name + last_name
UPDATE t_p19021063_social_connect_platf.conversations c
SET name = CASE 
    WHEN TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) != '' 
    THEN TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, ''))
    ELSE COALESCE(u.nickname, 'Пользователь')
END
FROM (
    SELECT DISTINCT ON (c2.id) c2.id as conv_id, u2.first_name, u2.last_name, u2.nickname
    FROM t_p19021063_social_connect_platf.conversations c2
    JOIN t_p19021063_social_connect_platf.conversation_participants cp ON c2.id = cp.conversation_id
    JOIN t_p19021063_social_connect_platf.users u2 ON cp.user_id = u2.id
    WHERE c2.type = 'personal' AND cp.user_id != c2.created_by
) u
WHERE c.id = u.conv_id AND c.type = 'personal';