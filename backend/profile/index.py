import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt

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
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Server configuration error'}),
                'isBase64Encoded': False
            }
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Токен истёк'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
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
                cur.execute('''
                    SELECT id, email, name, nickname, bio, avatar_url,
                           gender, age_from, age_to, city, district, height,
                           body_type, marital_status, children, financial_status,
                           has_car, has_housing, dating_goal, interests, profession,
                           created_at, updated_at
                    FROM t_p19021063_social_connect_platf.users
                    WHERE id = %s
                ''', (user_id,))
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
            
            fields = []
            values = []
            
            allowed_fields = [
                'nickname', 'bio', 'avatar_url', 'gender', 'age_from', 'age_to',
                'city', 'district', 'height', 'body_type', 'marital_status',
                'children', 'financial_status', 'has_car', 'has_housing',
                'dating_goal', 'interests', 'profession'
            ]
            
            for field in allowed_fields:
                if field in data:
                    fields.append(f"{field} = %s")
                    values.append(data[field])
            
            if not fields:
                return {
                    'statusCode': 400,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            values.append(user_id)
            
            with conn.cursor() as cur:
                query = f'''
                    UPDATE t_p19021063_social_connect_platf.users 
                    SET {', '.join(fields)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                '''
                cur.execute(query, values)
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