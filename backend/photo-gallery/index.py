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
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', 'list')
    
    # Для просмотра галереи другого пользователя авторизация не нужна
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    user_id = None
    
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.replace('Bearer ', '')
        try:
            import jwt as pyjwt
            jwt_secret = os.environ.get('JWT_SECRET', '')
            if jwt_secret:
                payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
                user_id = payload.get('user_id')
        except Exception:
            pass
    
    # Для модификации требуется авторизация
    if method in ['POST', 'DELETE'] and not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p19021063_social_connect_platf')
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET' and action == 'list':
            # Если передан user_id в параметрах - показываем фото этого пользователя
            target_user_id = params.get('user_id') or user_id
            
            if not target_user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем, есть ли доступ к закрытым фото
            has_access = False
            if user_id and user_id != target_user_id:
                cursor.execute(f"""
                    SELECT COUNT(*) as cnt FROM {schema}.photo_access
                    WHERE user_id = %s AND granted_to_user_id = %s
                """, (target_user_id, user_id))
                has_access = cursor.fetchone()['cnt'] > 0
            
            # Владелец видит все фото, другие пользователи - только публичные (или с доступом)
            is_owner = (user_id == int(target_user_id))
            
            cursor.execute(f"""
                SELECT 
                    p.id, 
                    p.photo_url, 
                    p.position, 
                    p.created_at,
                    p.is_private,
                    COUNT(DISTINCT pl.id) as likes_count,
                    CASE WHEN %s IS NOT NULL THEN 
                        EXISTS(SELECT 1 FROM {schema}.photo_likes WHERE photo_id = p.id AND user_id = %s)
                    ELSE FALSE END as is_liked
                FROM {schema}.user_photos p
                LEFT JOIN {schema}.photo_likes pl ON pl.photo_id = p.id
                WHERE p.user_id = %s AND (%s OR NOT p.is_private OR %s)
                GROUP BY p.id, p.photo_url, p.position, p.created_at, p.is_private
                ORDER BY p.position ASC
            """, (user_id, user_id, target_user_id, is_owner, has_access))
            
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
            is_private = body.get('is_private', False)
            
            if not image_base64:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Изображение не предоставлено'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем лимит для каждого альбома отдельно
            cursor.execute(f"""
                SELECT COUNT(*) as count FROM {schema}.user_photos
                WHERE user_id = %s AND is_private = %s
            """, (user_id, is_private))
            count = cursor.fetchone()['count']
            
            max_photos = 30 if is_private else 9
            error_msg = f'Максимум {max_photos} фотографий в {"закрытом" if is_private else "открытом"} альбоме'
            
            if count >= max_photos:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': error_msg}),
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
                INSERT INTO {schema}.user_photos (user_id, photo_url, position, is_private)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id, position) DO UPDATE SET photo_url = EXCLUDED.photo_url, is_private = EXCLUDED.is_private
                RETURNING id, photo_url, position, is_private, created_at
            """, (user_id, photo_url, position, is_private))
            
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
        
        elif method == 'POST' and action == 'like':
            photo_id = body.get('photo_id') if 'body' in locals() else json.loads(event.get('body', '{}')).get('photo_id')
            
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
                INSERT INTO {schema}.photo_likes (photo_id, user_id)
                VALUES (%s, %s)
                ON CONFLICT (photo_id, user_id) DO NOTHING
                RETURNING id
            """, (photo_id, user_id))
            
            result = cursor.fetchone()
            
            if result:
                cursor.execute(f"""
                    SELECT up.user_id FROM {schema}.user_photos up
                    WHERE up.id = %s
                """, (photo_id,))
                photo_owner = cursor.fetchone()
                
                if photo_owner and photo_owner['user_id'] != user_id:
                    owner_id = photo_owner['user_id']
                    cursor.execute(f"SELECT first_name, last_name FROM {schema}.users WHERE id = %s", (user_id,))
                    user_info = cursor.fetchone()
                    user_name = f"{user_info['first_name'] or ''} {user_info['last_name'] or ''}".strip() if user_info else 'Пользователь'
                    
                    cursor.execute(f"""
                        INSERT INTO {schema}.notifications (user_id, type, title, content, related_user_id, related_entity_type, related_entity_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (owner_id, 'photo_like', 'Лайк на фото', f'{user_name} оценил ваше фото', user_id, 'photo', photo_id))
            
            conn.commit()
            
            cursor.execute(f"""
                SELECT COUNT(*) as likes_count FROM {schema}.photo_likes
                WHERE photo_id = %s
            """, (photo_id,))
            
            likes_count = cursor.fetchone()['likes_count']
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'likes_count': likes_count, 'liked': result is not None}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'unlike':
            photo_id = body.get('photo_id') if 'body' in locals() else json.loads(event.get('body', '{}')).get('photo_id')
            
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
                DELETE FROM {schema}.photo_likes
                WHERE photo_id = %s AND user_id = %s
            """, (photo_id, user_id))
            
            conn.commit()
            
            cursor.execute(f"""
                SELECT COUNT(*) as likes_count FROM {schema}.photo_likes
                WHERE photo_id = %s
            """, (photo_id,))
            
            likes_count = cursor.fetchone()['likes_count']
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'likes_count': likes_count}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'toggle-privacy':
            body = json.loads(event.get('body', '{}'))
            photo_id = body.get('photo_id')
            
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
                UPDATE {schema}.user_photos
                SET is_private = NOT is_private
                WHERE id = %s AND user_id = %s
                RETURNING id, is_private
            """, (photo_id, user_id))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if result:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'is_private': result['is_private']}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Фото не найдено'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST' and action == 'grant-access':
            body = json.loads(event.get('body', '{}'))
            granted_to_user_id = body.get('granted_to_user_id')
            
            if not granted_to_user_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID пользователя не указан'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f"""
                INSERT INTO {schema}.photo_access (user_id, granted_to_user_id)
                VALUES (%s, %s)
                ON CONFLICT (user_id, granted_to_user_id) DO NOTHING
                RETURNING id
            """, (user_id, granted_to_user_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'revoke-access':
            body = json.loads(event.get('body', '{}'))
            granted_to_user_id = body.get('granted_to_user_id')
            
            if not granted_to_user_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID пользователя не указан'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f"""
                DELETE FROM {schema}.photo_access
                WHERE user_id = %s AND granted_to_user_id = %s
            """, (user_id, granted_to_user_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'access-list':
            # Список пользователей с доступом к закрытым фото
            cursor.execute(f"""
                SELECT pa.granted_to_user_id, u.first_name, u.last_name, u.nickname, u.avatar_url
                FROM {schema}.photo_access pa
                JOIN {schema}.users u ON pa.granted_to_user_id = u.id
                WHERE pa.user_id = %s
            """, (user_id,))
            
            users = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': [dict(u) for u in users]}, default=str),
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