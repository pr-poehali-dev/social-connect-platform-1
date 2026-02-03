import json
import os
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Получение и управление уведомлениями пользователя'''
    
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    # Получение токена авторизации
    auth_header = event.get('headers', {}).get('Authorization') or event.get('headers', {}).get('X-Authorization', '')
    
    if not auth_header:
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Authorization header is required'}),
            'isBase64Encoded': False
        }
    
    token = auth_header.replace('Bearer ', '')
    
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
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid token'}),
                'isBase64Encoded': False
            }
    
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Token has expired'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database configuration error'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            # Получение уведомлений пользователя
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = f'''
                    SELECT 
                        n.id,
                        n.type,
                        n.title,
                        n.content,
                        n.is_read,
                        n.created_at,
                        n.related_user_id,
                        n.related_entity_type,
                        n.related_entity_id,
                        u.first_name as related_user_first_name,
                        u.last_name as related_user_last_name,
                        u.avatar_url as related_user_avatar
                    FROM t_p19021063_social_connect_platf.notifications n
                    LEFT JOIN t_p19021063_social_connect_platf.users u ON n.related_user_id = u.id
                    WHERE n.user_id = {user_id}
                    ORDER BY n.created_at DESC
                    LIMIT 50
                '''
                cur.execute(query)
                notifications = cur.fetchall()
                
                # Форматирование даты
                for notif in notifications:
                    if notif['created_at']:
                        notif['created_at'] = notif['created_at'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'notifications': notifications}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            # Пометка уведомления как прочитанного
            body = json.loads(event.get('body', '{}'))
            notification_id = body.get('notification_id')
            
            if not notification_id:
                return {
                    'statusCode': 400,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'notification_id is required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                query = f'''
                    UPDATE t_p19021063_social_connect_platf.notifications
                    SET is_read = TRUE
                    WHERE id = {notification_id} AND user_id = {user_id}
                '''
                cur.execute(query)
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            # Пометить все уведомления как прочитанные
            with conn.cursor() as cur:
                query = f'''
                    UPDATE t_p19021063_social_connect_platf.notifications
                    SET is_read = TRUE
                    WHERE user_id = {user_id} AND is_read = FALSE
                '''
                cur.execute(query)
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True}),
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
