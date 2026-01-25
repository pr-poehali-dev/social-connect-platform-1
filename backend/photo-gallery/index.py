import json
import os
import base64
import boto3
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления галереей фотографий пользователя"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    if not auth_header.startswith('Bearer '):
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
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Server configuration error'}),
                'isBase64Encoded': False
            }
        
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid token'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 't_p19021063_social_connect_platf')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action', 'list')
        
        if method == 'GET' and action == 'list':
            cursor.execute(f"""
                SELECT id, photo_url, position, created_at
                FROM {schema}.user_photos
                WHERE user_id = %s
                ORDER BY position ASC
            """, (user_id,))
            
            photos = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'photos': [dict(p) for p in photos]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'upload':
            body = json.loads(event.get('body', '{}'))
            image_base64 = body.get('image')
            position = body.get('position', 0)
            
            if not image_base64:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Изображение не предоставлено'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f"""
                SELECT COUNT(*) as count FROM {schema}.user_photos
                WHERE user_id = %s
            """, (user_id,))
            count = cursor.fetchone()['count']
            
            if count >= 9:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Максимум 9 фотографий'}),
                    'isBase64Encoded': False
                }
            
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            
            image_data = base64.b64decode(image_base64)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
            file_key = f'photos/user_{user_id}_{timestamp}.jpg'
            
            s3.put_object(
                Bucket='files',
                Key=file_key,
                Body=image_data,
                ContentType='image/jpeg'
            )
            
            photo_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
            
            cursor.execute(f"""
                INSERT INTO {schema}.user_photos (user_id, photo_url, position)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, position) DO UPDATE SET photo_url = EXCLUDED.photo_url
                RETURNING id, photo_url, position, created_at
            """, (user_id, photo_url, position))
            
            new_photo = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'photo': dict(new_photo)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            photo_id = params.get('photo_id')
            
            if not photo_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID фото не указан'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f"""
                DELETE FROM {schema}.user_photos
                WHERE id = %s AND user_id = %s
            """, (photo_id, user_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный метод или действие'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }