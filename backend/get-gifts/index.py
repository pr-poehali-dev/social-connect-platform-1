import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для получения и управления подарками пользователя"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p19021063_social_connect_platf')
    
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id')
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Создаём таблицу если не существует
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {schema}.gifts (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER NOT NULL REFERENCES {schema}.users(id),
                recipient_id INTEGER NOT NULL REFERENCES {schema}.users(id),
                gift_id INTEGER NOT NULL,
                gift_name VARCHAR(255) NOT NULL,
                gift_emoji VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                is_public BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        conn.commit()
        
        if method == 'GET':
            if not user_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            # Получаем текущего пользователя для проверки прав
            auth_header = event.get('headers', {}).get('X-Authorization', '')
            current_user_id = None
            
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.replace('Bearer ', '')
                try:
                    import jwt as pyjwt
                    jwt_secret = os.environ.get('JWT_SECRET', '')
                    if jwt_secret:
                        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
                        current_user_id = payload.get('user_id')
                except Exception:
                    pass
            
            # Если смотрит свой профиль - показываем все, если чужой - только публичные
            is_own_profile = (current_user_id == int(user_id)) if current_user_id else False
            
            if is_own_profile:
                cursor.execute(f"""
                    SELECT 
                        g.id,
                        g.sender_id,
                        u.first_name || ' ' || COALESCE(u.last_name, '') as sender_name,
                        u.avatar_url as sender_avatar,
                        g.gift_name,
                        g.gift_emoji,
                        g.price,
                        g.is_public,
                        FALSE as is_anonymous,
                        g.created_at
                    FROM {schema}.gifts g
                    JOIN {schema}.users u ON g.sender_id = u.id
                    WHERE g.recipient_id = %s
                    ORDER BY g.created_at DESC
                """, (user_id,))
            else:
                cursor.execute(f"""
                    SELECT 
                        g.id,
                        g.sender_id,
                        u.first_name || ' ' || COALESCE(u.last_name, '') as sender_name,
                        u.avatar_url as sender_avatar,
                        g.gift_name,
                        g.gift_emoji,
                        g.price,
                        g.is_public,
                        FALSE as is_anonymous,
                        g.created_at
                    FROM {schema}.gifts g
                    JOIN {schema}.users u ON g.sender_id = u.id
                    WHERE g.recipient_id = %s AND g.is_public = TRUE
                    ORDER BY g.created_at DESC
                """, (user_id,))
            
            gifts = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'gifts': [dict(g) for g in gifts]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Изменение видимости подарка
            auth_header = event.get('headers', {}).get('X-Authorization', '')
            if not auth_header or not auth_header.startswith('Bearer '):
                cursor.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            token = auth_header.replace('Bearer ', '')
            try:
                import jwt as pyjwt
                jwt_secret = os.environ.get('JWT_SECRET', '')
                if not jwt_secret:
                    raise Exception('JWT_SECRET not configured')
                payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
                current_user_id = payload.get('user_id')
            except Exception:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный токен'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            gift_id = body.get('gift_id')
            is_public = body.get('is_public', True)
            
            if not gift_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'gift_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            # Обновляем видимость только если это подарок текущего пользователя
            cursor.execute(f"""
                UPDATE {schema}.gifts
                SET is_public = %s
                WHERE id = %s AND recipient_id = %s
                RETURNING id
            """, (is_public, gift_id, current_user_id))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if result:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Подарок не найден'}),
                    'isBase64Encoded': False
                }
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }