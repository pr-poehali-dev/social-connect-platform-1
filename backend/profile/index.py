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
        user_id = payload.get('user_id')
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
                query = f'''
                    SELECT id, email, first_name, last_name, nickname, bio, avatar_url,
                           gender, age_from, age_to, city, district, height,
                           body_type, marital_status, children, financial_status,
                           has_car, has_housing, dating_goal, interests, profession,
                           zodiac_sign, status_text, phone, telegram, instagram,
                           created_at, updated_at
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
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps(dict(user), default=str, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            
            updates = []
            
            # Строковые поля
            string_fields = ['first_name', 'last_name', 'nickname', 'bio', 'avatar_url', 'gender', 'city', 'district',
                           'body_type', 'marital_status', 'children', 'financial_status',
                           'dating_goal', 'profession', 'zodiac_sign', 'status_text', 'phone', 'telegram', 'instagram']
            
            for field in string_fields:
                if field in data and data[field] is not None:
                    value = data[field].replace("'", "''") if isinstance(data[field], str) else str(data[field])
                    updates.append(f"{field} = '{value}'")
            
            # Числовые поля (integer)
            int_fields = ['age_from', 'age_to', 'height']
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
            bool_fields = ['has_car', 'has_housing']
            for field in bool_fields:
                if field in data:
                    if data[field] == '' or data[field] is None:
                        updates.append(f"{field} = NULL")
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