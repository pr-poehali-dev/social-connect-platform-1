import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt as pyjwt
import base64
import boto3

def verify_token(token: str) -> dict | None:
    if not token:
        return None
    try:
        jwt_secret = os.environ.get('JWT_SECRET', '')
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except Exception:
        return None

def escape_sql(value):
    """Escape single quotes for SQL"""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"

def handler(event: dict, context) -> dict:
    '''API для управления услугами пользователей. Фильтрует тестовые услуги и тестовых пользователей.'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
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
                    'body': json.dumps([dict(c) for c in categories], default=str),
                    'isBase64Encoded': False
                }
            
            if action == 'cities':
                cursor.execute('SELECT * FROM cities ORDER BY name')
                cities = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(c) for c in cities], default=str),
                    'isBase64Encoded': False
                }
            
            if action == 'subcategories':
                category_id = query_params.get('category_id')
                if category_id:
                    cursor.execute(f'SELECT * FROM service_subcategories WHERE category_id = {escape_sql(category_id)} ORDER BY name')
                    subcategories = cursor.fetchall()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps([dict(s) for s in subcategories], default=str),
                        'isBase64Encoded': False
                    }
            
            if action == 'my_services':
                auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '') if auth_header else ''
                payload = verify_token(token)
                
                if not payload:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'}),
                        'isBase64Encoded': False
                    }
                
                user_id = payload.get('id')
                cursor.execute(f'''
                    SELECT s.*, sc.name as category_name, ss.name as subcategory_name,
                           c.name as city_name
                    FROM services s
                    LEFT JOIN service_categories sc ON s.category_id = sc.id
                    LEFT JOIN service_subcategories ss ON s.subcategory_id = ss.id
                    LEFT JOIN cities c ON s.city_id = c.id
                    WHERE s.user_id = {escape_sql(user_id)}
                    ORDER BY s.created_at DESC
                ''')
                services = cursor.fetchall()
                
                # Load portfolio for each service
                for service in services:
                    cursor.execute(f"SELECT image_url FROM service_portfolio WHERE service_id = {escape_sql(service['id'])} ORDER BY id")
                    portfolio = cursor.fetchall()
                    service['portfolio'] = [p['image_url'] for p in portfolio]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(s) for s in services], default=str),
                    'isBase64Encoded': False
                }
            
            if action == 'favorites':
                auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '') if auth_header else ''
                payload = verify_token(token)
                
                if not payload:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'services': []}, default=str),
                    'isBase64Encoded': False
                }
            
            if service_id:
                cursor.execute(f'SELECT * FROM services WHERE id = {escape_sql(service_id)}')
                service = cursor.fetchone()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(service) if service else {}),
                    'isBase64Encoded': False
                }
            
            category_id = query_params.get('category_id', '')
            subcategory_id = query_params.get('subcategory_id', '')
            city = query_params.get('city', '')
            is_online = query_params.get('is_online', 'false') == 'true'
            
            query = '''
                SELECT s.*, sc.name as category_name, ss.name as subcategory_name,
                       u.name as user_name, u.avatar_url as user_avatar, c.name as city_name
                FROM services s
                LEFT JOIN service_categories sc ON s.category_id = sc.id
                LEFT JOIN service_subcategories ss ON s.subcategory_id = ss.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN cities c ON s.city_id = c.id
                WHERE s.is_active = TRUE 
                  AND s.title IS NOT NULL 
                  AND s.title != ''''
                  AND u.email NOT LIKE ''%test%''
                  AND u.name NOT LIKE ''%test%''
                  AND u.name NOT LIKE ''%Test%''
            '''
            
            if category_id:
                query += f' AND s.category_id = {escape_sql(category_id)}'
            if subcategory_id:
                query += f' AND s.subcategory_id = {escape_sql(subcategory_id)}'
            if city:
                query += f' AND s.city_id = {escape_sql(city)}'
            if is_online:
                query += ' AND s.is_online = TRUE'
            
            query += ' ORDER BY s.created_at DESC LIMIT 100'
            
            cursor.execute(query)
            services = cursor.fetchall()
            
            # Load portfolio for each service
            for service in services:
                cursor.execute(f"SELECT image_url FROM service_portfolio WHERE service_id = {escape_sql(service['id'])} ORDER BY id LIMIT 1")
                portfolio = cursor.fetchall()
                service['portfolio'] = [p['image_url'] for p in portfolio]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(s) for s in services], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else ''
            payload = verify_token(token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            user_id = payload.get('id')
            body = json.loads(event.get('body', '{}'))
            
            # Create service
            title = escape_sql(body.get('title', ''))
            description = escape_sql(body.get('description', ''))
            price = escape_sql(body.get('price', ''))
            price_list = body.get('price_list', [])
            price_list_json = escape_sql(json.dumps(price_list) if price_list else None)
            category_id = escape_sql(body.get('category_id') or None)
            subcategory_id = escape_sql(body.get('subcategory_id') or None)
            city_id = escape_sql(body.get('city_id') or None)
            district = escape_sql(body.get('district', ''))
            is_online = escape_sql(body.get('is_online', False))
            
            cursor.execute(f'''
                INSERT INTO services (user_id, title, description, price, price_list, category_id, subcategory_id, city_id, district, is_online, is_active)
                VALUES ({escape_sql(user_id)}, {title}, {description}, {price}, {price_list_json}::jsonb, {category_id}, {subcategory_id}, {city_id}, {district}, {is_online}, TRUE)
                RETURNING id
            ''')
            service_id = cursor.fetchone()['id']
            
            # Handle portfolio images
            portfolio = body.get('portfolio', [])
            if portfolio:
                s3 = boto3.client('s3',
                    endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                )
                
                for idx, img_data in enumerate(portfolio[:10]):
                    try:
                        img_bytes = base64.b64decode(img_data.split(',')[1] if ',' in img_data else img_data)
                        key = f'services/{service_id}/portfolio_{idx}.jpg'
                        s3.put_object(Bucket='files', Key=key, Body=img_bytes, ContentType='image/jpeg')
                        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
                        cursor.execute(f"INSERT INTO service_portfolio (service_id, image_url) VALUES ({escape_sql(service_id)}, {escape_sql(cdn_url)})")
                    except Exception as e:
                        print(f'Error uploading image: {e}')
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': service_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else ''
            payload = verify_token(token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            user_id = payload.get('id')
            query_params = event.get('queryStringParameters', {}) or {}
            service_id = query_params.get('id')
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Service ID required'}),
                    'isBase64Encoded': False
                }
            
            # Check ownership
            cursor.execute(f'SELECT user_id FROM services WHERE id = {escape_sql(service_id)}')
            service = cursor.fetchone()
            
            if not service or service['user_id'] != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            
            title = escape_sql(body.get('title'))
            description = escape_sql(body.get('description'))
            price = escape_sql(body.get('price'))
            price_list = body.get('price_list', [])
            price_list_json = escape_sql(json.dumps(price_list) if price_list else None)
            category_id = escape_sql(body.get('category_id'))
            subcategory_id = escape_sql(body.get('subcategory_id'))
            city_id = escape_sql(body.get('city_id'))
            district = escape_sql(body.get('district', ''))
            is_online = escape_sql(body.get('is_online', False))
            is_active = escape_sql(body.get('is_active', True))
            
            cursor.execute(f'''
                UPDATE services SET
                    title = {title},
                    description = {description},
                    price = {price},
                    price_list = {price_list_json}::jsonb,
                    category_id = {category_id},
                    subcategory_id = {subcategory_id},
                    city_id = {city_id},
                    district = {district},
                    is_online = {is_online},
                    is_active = {is_active},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = {escape_sql(service_id)}
            ''')
            
            # Handle portfolio updates
            if 'portfolio' in body:
                cursor.execute(f'DELETE FROM service_portfolio WHERE service_id = {escape_sql(service_id)}')
                
                portfolio = body.get('portfolio', [])
                if portfolio:
                    s3 = boto3.client('s3',
                        endpoint_url='https://bucket.poehali.dev',
                        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                    )
                    
                    for idx, img_data in enumerate(portfolio[:10]):
                        try:
                            if img_data.startswith('http'):
                                cursor.execute(f"INSERT INTO service_portfolio (service_id, image_url) VALUES ({escape_sql(service_id)}, {escape_sql(img_data)})")
                            else:
                                img_bytes = base64.b64decode(img_data.split(',')[1] if ',' in img_data else img_data)
                                key = f'services/{service_id}/portfolio_{idx}.jpg'
                                s3.put_object(Bucket='files', Key=key, Body=img_bytes, ContentType='image/jpeg')
                                cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
                                cursor.execute(f"INSERT INTO service_portfolio (service_id, image_url) VALUES ({escape_sql(service_id)}, {escape_sql(cdn_url)})")
                        except Exception as e:
                            print(f'Error uploading image: {e}')
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else ''
            payload = verify_token(token)
            
            if not payload:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            user_id = payload.get('id')
            query_params = event.get('queryStringParameters', {}) or {}
            service_id = query_params.get('id')
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Service ID required'}),
                    'isBase64Encoded': False
                }
            
            # Check ownership
            cursor.execute(f'SELECT user_id FROM services WHERE id = {escape_sql(service_id)}')
            service = cursor.fetchone()
            
            if not service or service['user_id'] != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f'DELETE FROM service_portfolio WHERE service_id = {escape_sql(service_id)}')
            cursor.execute(f'DELETE FROM services WHERE id = {escape_sql(service_id)}')
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'deleted'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()