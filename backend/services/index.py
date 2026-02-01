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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
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
            
            if action == 'categories':
                cursor.execute('SELECT * FROM service_categories ORDER BY name')
                categories = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(c) for c in categories], default=str)
                }
            
            if action == 'subcategories':
                category_id = query_params.get('category_id')
                if category_id:
                    cursor.execute('SELECT * FROM service_subcategories WHERE category_id = %s ORDER BY name', (category_id,))
                    subcategories = cursor.fetchall()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps([dict(s) for s in subcategories], default=str)
                    }
            
            if action == 'my_services':
                auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '') if auth_header else ''
                payload = verify_token(token)
                
                if not payload:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'})
                    }
                
                user_id = payload.get('id')
                cursor.execute('''
                    SELECT s.*, sc.name as category_name, ss.name as subcategory_name
                    FROM services s
                    LEFT JOIN service_categories sc ON s.category_id = sc.id
                    LEFT JOIN service_subcategories ss ON s.subcategory_id = ss.id
                    WHERE s.user_id = %s
                    ORDER BY s.created_at DESC
                ''', (user_id,))
                services = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(s) for s in services], default=str)
                }
            
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
            
            category_id = query_params.get('category_id', '')
            subcategory_id = query_params.get('subcategory_id', '')
            city = query_params.get('city', '')
            is_online = query_params.get('is_online', 'false') == 'true'
            
            query = '''
                SELECT s.*, sc.name as category_name, ss.name as subcategory_name,
                       u.name as user_name, u.avatar_url as user_avatar
                FROM services s
                LEFT JOIN service_categories sc ON s.category_id = sc.id
                LEFT JOIN service_subcategories ss ON s.subcategory_id = ss.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.is_active = TRUE
            '''
            params = []
            
            if category_id:
                query += ' AND s.category_id = %s'
                params.append(category_id)
            if subcategory_id:
                query += ' AND s.subcategory_id = %s'
                params.append(subcategory_id)
            if city:
                query += ' AND s.city = %s'
                params.append(city)
            if is_online:
                query += ' AND s.is_online = TRUE'
            
            query += ' ORDER BY s.created_at DESC LIMIT 100'
            
            cursor.execute(query, params)
            services = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(s) for s in services], default=str)
            }
        
        elif method == 'POST':
            auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else ''
            payload = verify_token(token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'})
                }
            
            user_id = payload.get('id')
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO services 
                (user_id, category_id, subcategory_id, title, description, price, city, district, is_online)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                user_id, body.get('category_id'), body.get('subcategory_id'),
                body.get('title'), body.get('description'), body.get('price'),
                body.get('city'), body.get('district'), body.get('is_online', False)
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
                    category_id = %s, subcategory_id = %s, title = %s,
                    description = %s, price = %s, city = %s, district = %s,
                    is_online = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body.get('category_id'), body.get('subcategory_id'), body.get('title'),
                body.get('description'), body.get('price'), body.get('city'),
                body.get('district'), body.get('is_online'), body.get('is_active', True),
                service_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'})
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            service_id = query_params.get('id')
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Service ID required'})
                }
            
            cursor.execute('UPDATE services SET is_active = FALSE WHERE id = %s', (service_id,))
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