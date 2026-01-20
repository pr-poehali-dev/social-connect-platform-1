-- Обновление пароля администратора на правильный хеш для пароля admin123
UPDATE admins 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ND2EJ.VNBgKq'
WHERE email = 'admin@connecthub.ru';