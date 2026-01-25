-- Создаём профиль знакомств для пользователя 9
INSERT INTO dating_profiles (
    user_id, 
    name, 
    age, 
    avatar_url,
    gender,
    is_top_ad,
    created_at,
    updated_at
) VALUES (
    9,
    'Ннн Ххх',
    18,
    'https://sun1-85.userapi.com/s/v1/ig2/iCEQQ_yyYCDVVB9qIPcIOa0Zvg1NxC46RFLFQMLxZssY_S0MHtKrmft2-hdr1F95S1hjPI_2j9KgELCt1zYTjpml.jpg?quality=95&crop=1,23,473,473&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360&ava=1&cs=50x50',
    '',
    false,
    NOW(),
    NOW()
);