-- Обновление email главного администратора на значение из секрета ADMIN_LOGIN
-- Пароль будет обновлен через backend функцию с bcrypt хешированием

UPDATE t_p19021063_social_connect_platf.admins 
SET 
  email = 'superadmin@connecthub.ru',
  name = 'Главный администратор',
  role = 'superadmin',
  is_active = true,
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1;