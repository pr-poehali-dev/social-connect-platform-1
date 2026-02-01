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
            
            if action == 'cities':
                cursor.execute('SELECT * FROM cities ORDER BY name')
                cities = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(c) for c in cities], default=str)
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
                    SELECT s.*, sc.name as category_name, ss.name as subcategory_name,
                           c.name as city_name
                    FROM services s
                    LEFT JOIN service_categories sc ON s.category_id = sc.id
                    LEFT JOIN service_subcategories ss ON s.subcategory_id = ss.id
                    LEFT JOIN cities c ON s.city_id = c.id
                    WHERE s.user_id = %s
                    ORDER BY s.created_at DESC
                ''', (user_id,))
                services = cursor.fetchall()
                
                # Load portfolio for each service
                for service in services:
                    cursor.execute('SELECT image_url FROM service_portfolio WHERE service_id = %s ORDER BY id', (service['id'],))
                    portfolio = cursor.fetchall()
                    service['portfolio'] = [p['image_url'] for p in portfolio]
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
                       u.name as user_name, u.avatar_url as user_avatar, c.name as city_name
                FROM services s
                LEFT JOIN service_categories sc ON s.category_id = sc.id
                LEFT JOIN service_subcategories ss ON s.subcategory_id = ss.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN cities c ON s.city_id = c.id
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
                query += ' AND s.city_id = %s'
                params.append(city)
            if is_online:
                query += ' AND s.is_online = TRUE'
            
            query += ' ORDER BY s.created_at DESC LIMIT 100'
            
            cursor.execute(query, params)
            services = cursor.fetchall()
            
            # Load portfolio for each service
            for service in services:
                cursor.execute('SELECT image_url FROM service_portfolio WHERE service_id = %s ORDER BY id LIMIT 1', (service['id'],))
                portfolio = cursor.fetchall()
                service['portfolio'] = [p['image_url'] for p in portfolio]
            
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
                (user_id, category_id, subcategory_id, title, description, price, city_id, district, is_online)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                user_id, body.get('category_id'), body.get('subcategory_id'),
                body.get('title'), body.get('description'), body.get('price'),
                body.get('city_id'), body.get('district'), body.get('is_online', False)
            ))
            
            service_id = cursor.fetchone()['id']
            
            # Upload portfolio images
            portfolio = body.get('portfolio', [])
            if portfolio and len(portfolio) > 0:
                s3 = boto3.client('s3',
                    endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                )
                
                for idx, img_data in enumerate(portfolio[:10]):  # Max 10 photos
                    if img_data.startswith('data:image'):
                        # Extract base64 data
                        header, encoded = img_data.split(',', 1)
                        img_bytes = base64.b64decode(encoded)
                        
                        # Determine content type
                        if 'jpeg' in header or 'jpg' in header:
                            content_type = 'image/jpeg'
                            ext = 'jpg'
                        elif 'png' in header:
                            content_type = 'image/png'
                            ext = 'png'
                        else:
                            content_type = 'image/jpeg'
                            ext = 'jpg'
                        
                        # Upload to S3
                        key = f'services/{service_id}/{idx}.{ext}'
                        s3.put_object(Bucket='files', Key=key, Body=img_bytes, ContentType=content_type)
                        
                        # Save to database
                        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
                        cursor.execute(
                            'INSERT INTO service_portfolio (service_id, image_url) VALUES (%s, %s)',
                            (service_id, cdn_url)
                        )
            
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
                UPDATE services SET
                    category_id = %s, subcategory_id = %s, title = %s,
                    description = %s, price = %s, city_id = %s, district = %s,
                    is_online = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            ''', (
                body.get('category_id'), body.get('subcategory_id'), body.get('title'),
                body.get('description'), body.get('price'), body.get('city_id'),
                body.get('district'), body.get('is_online'), body.get('is_active', True),
                service_id, user_id
            ))
            
            # Update portfolio if provided
            portfolio = body.get('portfolio', [])
            if portfolio is not None:
                # Delete old portfolio
                cursor.execute('DELETE FROM service_portfolio WHERE service_id = %s', (service_id,))
                
                if len(portfolio) > 0:
                    s3 = boto3.client('s3',
                        endpoint_url='https://bucket.poehali.dev',
                        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                    )
                    
                    for idx, img_data in enumerate(portfolio[:10]):  # Max 10 photos
                        if img_data.startswith('data:image'):
                            header, encoded = img_data.split(',', 1)
                            img_bytes = base64.b64decode(encoded)
                            
                            if 'jpeg' in header or 'jpg' in header:
                                content_type = 'image/jpeg'
                                ext = 'jpg'
                            elif 'png' in header:
                                content_type = 'image/png'
                                ext = 'png'
                            else:
                                content_type = 'image/jpeg'
                                ext = 'jpg'
                            
                            key = f'services/{service_id}/{idx}.{ext}'
                            s3.put_object(Bucket='files', Key=key, Body=img_bytes, ContentType=content_type)
                            
                            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
                            cursor.execute(
                                'INSERT INTO service_portfolio (service_id, image_url) VALUES (%s, %s)',
                                (service_id, cdn_url)
                            )
                        elif img_data.startswith('https://cdn.poehali.dev'):
                            # Existing image URL, just insert
                            cursor.execute(
                                'INSERT INTO service_portfolio (service_id, image_url) VALUES (%s, %s)',
                                (service_id, img_data)
                            )
            
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