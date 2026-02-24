import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления профилем пользователя'''
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Access-Control-Max-Age': '86400'},
            'body': '',
            'isBase64Encoded': False
        }
    
    # Получаем токен из заголовка
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    token = auth_header.replace('Bearer ', '')
    
    # Декодируем токен
    try:
        import jwt as pyjwt
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Server configuration error'}),
                'isBase64Encoded': False
            }
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload.get('user_id') or payload.get('sub')
    except pyjwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Токен истёк'}),
            'isBase64Encoded': False
        }
    except pyjwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"UPDATE t_p19021063_social_connect_platf.users SET last_login_at = NOW() WHERE id = {user_id}")
                conn.commit()

                # Авто-создание анкеты знакомств если её нет
                cur.execute(f"SELECT id FROM t_p19021063_social_connect_platf.dating_profiles WHERE user_id = {user_id}")
                if not cur.fetchone():
                    cur.execute(f"""
                        SELECT COALESCE(NULLIF(TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')), ''), nickname, 'Пользователь') as display_name
                        FROM t_p19021063_social_connect_platf.users WHERE id = {user_id}
                    """)
                    name_row = cur.fetchone()
                    display_name = name_row['display_name'] if name_row else 'Пользователь'
                    cur.execute(f"""
                        INSERT INTO t_p19021063_social_connect_platf.dating_profiles (user_id, name, age, is_top_ad)
                        VALUES ({user_id}, '{display_name.replace("'", "''")}', 0, FALSE)
                        ON CONFLICT (user_id) DO NOTHING
                    """)
                    conn.commit()

                query = f'''
                    SELECT id, email, first_name, last_name, nickname, bio, avatar_url,
                           gender, birth_date, city, district, height,
                           body_type, marital_status, children, financial_status,
                           has_car, has_housing, dating_goal, interests, profession,
                           zodiac_sign, status_text, phone, telegram, instagram,
                           dating_visible, is_verified, verified_at,
                           looking_for_gender, age_from, age_to, contact_price, hide_mentor,
                           is_banned, created_at, updated_at, is_vip, vip_expires_at
                    FROM t_p19021063_social_connect_platf.users
                    WHERE id = {user_id}
                '''
                cur.execute(query)
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                user_data = dict(user)

                # Автоматически сбрасываем is_vip если срок истёк
                from datetime import datetime, timezone
                if user_data.get('is_vip') and user_data.get('vip_expires_at'):
                    expires = user_data['vip_expires_at']
                    if isinstance(expires, str):
                        from dateutil import parser as dp
                        expires = dp.parse(expires)
                    if expires.tzinfo is None:
                        expires = expires.replace(tzinfo=timezone.utc)
                    if expires < datetime.now(timezone.utc):
                        cur.execute(f"UPDATE t_p19021063_social_connect_platf.users SET is_vip = false WHERE id = {user_id}")
                        conn.commit()
                        user_data['is_vip'] = False

                cur.execute(f'''
                    SELECT
                        (SELECT COUNT(*) FROM t_p19021063_social_connect_platf.dating_friend_requests
                         WHERE (from_user_id = {user_id} OR to_profile_id = {user_id}) AND status = 'accepted') AS friends_count,
                        (SELECT COUNT(*) FROM t_p19021063_social_connect_platf.ads
                         WHERE user_id = {user_id}) AS ads_count,
                        (SELECT COUNT(*) FROM t_p19021063_social_connect_platf.services
                         WHERE user_id = {user_id}) AS services_count,
                        (SELECT COUNT(*) FROM t_p19021063_social_connect_platf.events
                         WHERE user_id = {user_id}) AS events_count
                ''')
                counts = cur.fetchone()
                user_data['friends_count'] = counts['friends_count'] if counts else 0
                user_data['ads_count'] = counts['ads_count'] if counts else 0
                user_data['services_count'] = counts['services_count'] if counts else 0
                user_data['events_count'] = counts['events_count'] if counts else 0

                # Проверяем активный бан
                if user_data.get('is_banned'):
                    cur.execute(f'''
                        SELECT reason, banned_at, banned_until, ban_count
                        FROM t_p19021063_social_connect_platf.user_bans
                        WHERE user_id = {user_id} AND is_active = true
                        ORDER BY banned_at DESC
                        LIMIT 1
                    ''')
                    ban_info = cur.fetchone()
                    
                    if ban_info:
                        user_data['ban_info'] = {
                            'reason': ban_info['reason'],
                            'banned_at': ban_info['banned_at'].isoformat() if ban_info['banned_at'] else None,
                            'banned_until': ban_info['banned_until'].isoformat() if ban_info['banned_until'] else None,
                            'ban_count': ban_info['ban_count']
                        }
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps(user_data, default=str, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            
            updates = []
            
            # Строковые поля
            string_fields = ['first_name', 'last_name', 'nickname', 'bio', 'avatar_url', 'gender', 'city', 'district',
                           'body_type', 'marital_status', 'children', 'financial_status',
                           'dating_goal', 'profession', 'zodiac_sign', 'status_text', 'phone', 'telegram', 'instagram', 'lookingForGender']
            
            for field in string_fields:
                if field in data and data[field] is not None:
                    db_field = 'looking_for_gender' if field == 'lookingForGender' else field
                    value = data[field].replace("'", "''") if isinstance(data[field], str) else str(data[field])
                    updates.append(f"{db_field} = '{value}'")
            
            # Поле даты birth_date
            if 'birth_date' in data:
                if data['birth_date'] == '' or data['birth_date'] is None:
                    updates.append("birth_date = NULL")
                else:
                    value = data['birth_date'].replace("'", "''") if isinstance(data['birth_date'], str) else str(data['birth_date'])
                    updates.append(f"birth_date = '{value}'")
            
            # Числовые поля (integer)
            int_fields = ['height', 'age_from', 'age_to', 'contact_price']
            for field in int_fields:
                if field in data:
                    # Пропускаем пустые строки
                    if data[field] == '' or data[field] is None:
                        updates.append(f"{field} = NULL")
                    else:
                        try:
                            val = int(data[field])
                            updates.append(f"{field} = {val}")
                        except (ValueError, TypeError):
                            updates.append(f"{field} = NULL")
            
            # Булевы поля
            bool_fields = ['has_car', 'has_housing', 'dating_visible', 'hide_mentor']
            for field in bool_fields:
                if field in data:
                    if data[field] == '' or data[field] is None:
                        updates.append(f"{field} = NULL")
                    else:
                        # Обработка строк "true"/"false" и булевых значений
                        if isinstance(data[field], str):
                            val = 'TRUE' if data[field].lower() == 'true' else 'FALSE'
                        else:
                            val = 'TRUE' if data[field] else 'FALSE'
                        updates.append(f"{field} = {val}")
            
            # Массив интересов
            if 'interests' in data:
                if data['interests'] is None or data['interests'] == []:
                    updates.append("interests = NULL")
                else:
                    # Экранируем каждый элемент массива
                    escaped_interests = [item.replace("'", "''") for item in data['interests']]
                    interests_str = "ARRAY[" + ", ".join([f"'{item}'" for item in escaped_interests]) + "]"
                    updates.append(f"interests = {interests_str}")
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                query = f'''
                    UPDATE t_p19021063_social_connect_platf.users 
                    SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = {user_id}
                '''
                cur.execute(query)
                
                # Обновляем имена в диалогах, если изменилось first_name или last_name
                if 'first_name' in data or 'last_name' in data:
                    # Получаем актуальные данные пользователя
                    cur.execute(f'''
                        SELECT first_name, last_name, nickname 
                        FROM t_p19021063_social_connect_platf.users 
                        WHERE id = {user_id}
                    ''')
                    user_data = cur.fetchone()
                    
                    if user_data:
                        # Формируем новое имя
                        new_name = f"{user_data[0] or ''} {user_data[1] or ''}".strip()
                        if not new_name:
                            new_name = user_data[2] or 'Пользователь'
                        
                        # Обновляем имя во всех диалогах, где этот пользователь является собеседником
                        escaped_name = new_name.replace("'", "''")
                        cur.execute(f'''
                            UPDATE t_p19021063_social_connect_platf.conversations c
                            SET name = '{escaped_name}'
                            FROM t_p19021063_social_connect_platf.conversation_participants cp
                            WHERE c.id = cp.conversation_id 
                            AND c.type = 'personal'
                            AND cp.user_id = {user_id}
                            AND c.created_by != {user_id}
                        ''')
                
                # Обновляем аватар в диалогах, если изменился avatar_url
                if 'avatar_url' in data:
                    avatar_url = data['avatar_url']
                    if avatar_url:
                        escaped_url = avatar_url.replace("'", "''") if isinstance(avatar_url, str) else str(avatar_url)
                        cur.execute(f'''
                            UPDATE t_p19021063_social_connect_platf.conversations c
                            SET avatar_url = '{escaped_url}'
                            FROM t_p19021063_social_connect_platf.conversation_participants cp
                            WHERE c.id = cp.conversation_id 
                            AND c.type = 'personal'
                            AND cp.user_id = {user_id}
                            AND c.created_by != {user_id}
                        ''')
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'status': 'updated'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()