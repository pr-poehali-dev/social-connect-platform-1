-- Добавляем уникальный индекс чтобы избежать дубликатов профилей в будущем
CREATE UNIQUE INDEX IF NOT EXISTS idx_dating_profiles_user_id 
ON t_p19021063_social_connect_platf.dating_profiles(user_id);

-- Добавляем уникальный индекс на заявки в друзья (от одного пользователя к одному профилю только одна заявка)
CREATE UNIQUE INDEX IF NOT EXISTS idx_dating_friend_requests_unique 
ON t_p19021063_social_connect_platf.dating_friend_requests(from_user_id, to_profile_id);