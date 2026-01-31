import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt as pyjwt

def verify_token(token: str) -> dict | None:
    if not token:
        return None
    try:
        jwt_secret = os.environ.get('JWT_SECRET', '')
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except Exception:
        return None

def handler(event: dict, context) -> dict:
    '''API для управления личными услугами пользователя'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    # Авторизация
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    payload = verify_token(token)
    
    if not payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    user_id = payload.get('user_id')
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            # Получить все услуги текущего пользователя
            cursor.execute(
                'SELECT * FROM t_p19021063_social_connect_platf.services WHERE user_id = %s ORDER BY created_at DESC',
                (user_id,)
            )
            services = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(s) for s in services], default=str)
            }
        
        elif method == 'POST':
            # Создать новую услугу
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO t_p19021063_social_connect_platf.services 
                (user_id, name, service_type, description, price, is_online, city, district)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                user_id,
                body.get('name'),
                body.get('service_type'),
                body.get('description'),
                body.get('price'),
                body.get('is_online', False),
                body.get('city'),
                body.get('district')
            ))
            
            service_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': service_id, 'status': 'created'})
            }
        
        elif method == 'PUT':
            # Обновить услугу
            query_params = event.get('queryStringParameters', {}) or {}
            service_id = query_params.get('id')
            body = json.loads(event.get('body', '{}'))
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Service ID required'})
                }
            
            # Проверка прав доступа
            cursor.execute(
                'SELECT user_id FROM t_p19021063_social_connect_platf.services WHERE id = %s',
                (service_id,)
            )
            service = cursor.fetchone()
            
            if not service or service['user_id'] != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'})
                }
            
            cursor.execute('''
                UPDATE t_p19021063_social_connect_platf.services SET
                    name = %s, service_type = %s, description = %s, price = %s,
                    is_online = %s, is_active = %s, city = %s, district = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body.get('name'),
                body.get('service_type'),
                body.get('description'),
                body.get('price'),
                body.get('is_online', False),
                body.get('is_active', True),
                body.get('city'),
                body.get('district'),
                service_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'})
            }
        
        elif method == 'DELETE':
            # Удалить услугу
            query_params = event.get('queryStringParameters', {}) or {}
            service_id = query_params.get('id')
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Service ID required'})
                }
            
            # Проверка прав доступа
            cursor.execute(
                'SELECT user_id FROM t_p19021063_social_connect_platf.services WHERE id = %s',
                (service_id,)
            )
            service = cursor.fetchone()
            
            if not service or service['user_id'] != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'})
                }
            
            cursor.execute(
                'DELETE FROM t_p19021063_social_connect_platf.services WHERE id = %s',
                (service_id,)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'deleted'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cursor.close()
        conn.close()
