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
    '''API для управления услугами пользователей'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action')
            service_id = query_params.get('id')
            
            if action == 'favorites':
                auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '') if auth_header else ''
                payload = verify_token(token)
                
                if not payload:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'services': []}, default=str)
                }
            
            if service_id:
                cursor.execute('SELECT * FROM services WHERE id = %s', (service_id,))
                service = cursor.fetchone()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(service) if service else {})
                }
            
            service_type = query_params.get('service_type', '')
            city = query_params.get('city', '')
            is_online = query_params.get('is_online', 'false') == 'true'
            
            query = 'SELECT * FROM services WHERE is_active = TRUE'
            params = []
            
            if service_type and service_type != 'all':
                query += ' AND service_type = %s'
                params.append(service_type)
            if city:
                query += ' AND city = %s'
                params.append(city)
            if is_online:
                query += ' AND is_online = TRUE'
            
            query += ' ORDER BY created_at DESC LIMIT 100'
            
            cursor.execute(query, params)
            services = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(s) for s in services], default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO services 
                (user_id, name, nickname, age, city, district, avatar_url, rating, reviews,
                 service_type, description, price, is_online)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('user_id'), body.get('name'), body.get('nickname'),
                body.get('age'), body.get('city'), body.get('district'),
                body.get('avatar_url'), body.get('rating', 0), body.get('reviews', 0),
                body.get('service_type'), body.get('description'), body.get('price'),
                body.get('is_online', False)
            ))
            
            service_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': service_id, 'status': 'created'})
            }
        
        elif method == 'PUT':
            query_params = event.get('queryStringParameters', {}) or {}
            service_id = query_params.get('id')
            body = json.loads(event.get('body', '{}'))
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Service ID required'})
                }
            
            cursor.execute('''
                UPDATE services SET
                    name = %s, nickname = %s, age = %s, city = %s, district = %s,
                    avatar_url = %s, rating = %s, reviews = %s, service_type = %s,
                    description = %s, price = %s, is_online = %s, is_active = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body.get('name'), body.get('nickname'), body.get('age'),
                body.get('city'), body.get('district'), body.get('avatar_url'),
                body.get('rating'), body.get('reviews'), body.get('service_type'),
                body.get('description'), body.get('price'), body.get('is_online'),
                body.get('is_active', True), service_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'})
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