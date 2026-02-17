import json
import os
import base64
import boto3
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

def resp(status_code, body):
    return {
        'statusCode': status_code,
        'headers': HEADERS,
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }

def handler(event: dict, context) -> dict:
    """API для управления галереей фотографий и альбомами пользователя"""
    
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
    
    if method in ['POST', 'DELETE'] and not user_id:
        return resp(401, {'error': 'Требуется авторизация'})
    
    dsn = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p19021063_social_connect_platf')
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # ===== АЛЬБОМЫ =====
        
        if method == 'GET' and action == 'albums':
            target_user_id = params.get('user_id') or user_id
            if not target_user_id:
                return resp(400, {'error': 'user_id обязателен'})
            
            is_owner = user_id and int(target_user_id) == int(user_id)
            
            cursor.execute(f"""
                SELECT a.id, a.name, a.type, a.created_at,
                    CASE WHEN %s THEN a.access_key ELSE NULL END as access_key,
                    COUNT(p.id) as photos_count
                FROM {schema}.photo_albums a
                LEFT JOIN {schema}.user_photos p ON p.album_id = a.id
                WHERE a.user_id = %s
                GROUP BY a.id
                ORDER BY a.created_at ASC
            """, (is_owner, target_user_id))
            
            albums = [dict(a) for a in cursor.fetchall()]
            cursor.close()
            conn.close()
            return resp(200, {'albums': albums})
        
        elif method == 'POST' and action == 'create-album':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name', '').strip()
            album_type = body.get('type', 'open')
            access_key = body.get('access_key', '').strip() or None
            
            if not name:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'Название альбома обязательно'})
            
            if album_type not in ('open', 'private'):
                cursor.close()
                conn.close()
                return resp(400, {'error': 'Тип альбома: open или private'})
            
            if album_type == 'private' and not access_key:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'Для закрытого альбома нужен ключ доступа'})
            
            cursor.execute(f"""
                SELECT COUNT(*) as cnt FROM {schema}.photo_albums WHERE user_id = %s
            """, (user_id,))
            if cursor.fetchone()['cnt'] >= 10:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'Максимум 10 альбомов'})
            
            cursor.execute(f"""
                INSERT INTO {schema}.photo_albums (user_id, name, type, access_key)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, type, access_key, created_at
            """, (user_id, name, album_type, access_key))
            
            album = dict(cursor.fetchone())
            conn.commit()
            cursor.close()
            conn.close()
            return resp(200, {'album': album})
        
        elif method == 'POST' and action == 'update-album':
            body = json.loads(event.get('body', '{}'))
            album_id = body.get('album_id')
            name = body.get('name', '').strip()
            album_type = body.get('type')
            access_key = body.get('access_key')
            
            if not album_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'album_id обязателен'})
            
            updates = []
            values = []
            if name:
                updates.append("name = %s")
                values.append(name)
            if album_type in ('open', 'private'):
                updates.append("type = %s")
                values.append(album_type)
            if access_key is not None:
                updates.append("access_key = %s")
                values.append(access_key.strip() if access_key else None)
            
            updates.append("updated_at = NOW()")
            
            if not updates:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'Нечего обновлять'})
            
            values.extend([album_id, user_id])
            cursor.execute(f"""
                UPDATE {schema}.photo_albums
                SET {', '.join(updates)}
                WHERE id = %s AND user_id = %s
                RETURNING id, name, type, access_key, created_at
            """, values)
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if result:
                return resp(200, {'album': dict(result)})
            return resp(404, {'error': 'Альбом не найден'})
        
        elif method == 'POST' and action == 'delete-album':
            body = json.loads(event.get('body', '{}'))
            album_id = body.get('album_id')
            
            if not album_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'album_id обязателен'})
            
            cursor.execute(f"""
                UPDATE {schema}.user_photos SET album_id = NULL
                WHERE album_id = %s AND user_id = %s
            """, (album_id, user_id))
            
            cursor.execute(f"""
                UPDATE {schema}.photo_albums SET name = '[удалён]', type = 'open', access_key = NULL
                WHERE id = %s AND user_id = %s
                RETURNING id
            """, (album_id, user_id))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if result:
                return resp(200, {'success': True})
            return resp(404, {'error': 'Альбом не найден'})
        
        elif method == 'POST' and action == 'verify-key':
            body = json.loads(event.get('body', '{}'))
            album_id = body.get('album_id')
            key = body.get('key', '').strip()
            
            if not album_id or not key:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'album_id и key обязательны'})
            
            cursor.execute(f"""
                SELECT access_key FROM {schema}.photo_albums
                WHERE id = %s AND type = 'private'
            """, (album_id,))
            
            album = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not album:
                return resp(404, {'error': 'Альбом не найден'})
            
            if album['access_key'] == key:
                return resp(200, {'success': True, 'access': True})
            return resp(200, {'success': True, 'access': False})
        
        # ===== ФОТО =====
        
        elif method == 'GET' and action == 'list':
            target_user_id = params.get('user_id') or user_id
            album_id = params.get('album_id')
            
            if not target_user_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'user_id обязателен'})
            
            is_owner = user_id and int(target_user_id) == int(user_id)
            
            has_access = False
            if user_id and not is_owner:
                cursor.execute(f"""
                    SELECT COUNT(*) as cnt FROM {schema}.photo_access
                    WHERE user_id = %s AND granted_to_user_id = %s
                """, (target_user_id, user_id))
                has_access = cursor.fetchone()['cnt'] > 0
            
            where_extra = ""
            extra_params = []
            
            if album_id:
                if not is_owner and not has_access:
                    cursor.execute(f"""
                        SELECT type FROM {schema}.photo_albums WHERE id = %s
                    """, (album_id,))
                    album_row = cursor.fetchone()
                    if album_row and album_row['type'] == 'private':
                        cursor.close()
                        conn.close()
                        return resp(200, {'photos': [], 'locked': True})
                
                where_extra = " AND p.album_id = %s"
                extra_params = [album_id]
            
            cursor.execute(f"""
                SELECT 
                    p.id, p.photo_url, p.position, p.created_at, p.is_private, p.album_id,
                    COUNT(DISTINCT pl.id) as likes_count,
                    CASE WHEN %s IS NOT NULL THEN 
                        EXISTS(SELECT 1 FROM {schema}.photo_likes WHERE photo_id = p.id AND user_id = %s)
                    ELSE FALSE END as is_liked
                FROM {schema}.user_photos p
                LEFT JOIN {schema}.photo_likes pl ON pl.photo_id = p.id
                WHERE p.user_id = %s AND (%s OR NOT p.is_private OR %s){where_extra}
                GROUP BY p.id, p.photo_url, p.position, p.created_at, p.is_private, p.album_id
                ORDER BY p.position ASC
            """, [user_id, user_id, target_user_id, is_owner, has_access] + extra_params)
            
            photos = [dict(p) for p in cursor.fetchall()]
            cursor.close()
            conn.close()
            return resp(200, {'photos': photos})
        
        elif method == 'POST' and action == 'upload':
            body = json.loads(event.get('body', '{}'))
            image_base64 = body.get('image')
            position = body.get('position', 0)
            is_private = body.get('is_private', False)
            album_id = body.get('album_id')
            
            if not image_base64:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'Изображение не предоставлено'})
            
            if album_id:
                cursor.execute(f"""
                    SELECT id, type FROM {schema}.photo_albums
                    WHERE id = %s AND user_id = %s
                """, (album_id, user_id))
                album = cursor.fetchone()
                if not album:
                    cursor.close()
                    conn.close()
                    return resp(404, {'error': 'Альбом не найден'})
                is_private = album['type'] == 'private'
            
            cursor.execute(f"""
                SELECT COUNT(*) as count FROM {schema}.user_photos
                WHERE user_id = %s AND is_private = %s
            """, (user_id, is_private))
            count = cursor.fetchone()['count']
            
            max_photos = 30 if is_private else 9
            if count >= max_photos:
                cursor.close()
                conn.close()
                return resp(400, {'error': f'Максимум {max_photos} фотографий в {"закрытом" if is_private else "открытом"} альбоме'})
            
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            
            image_data = base64.b64decode(image_base64)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
            file_key = f'photos/user_{user_id}_{timestamp}.jpg'
            
            s3.put_object(Bucket='files', Key=file_key, Body=image_data, ContentType='image/jpeg')
            
            photo_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
            
            cursor.execute(f"""
                INSERT INTO {schema}.user_photos (user_id, photo_url, position, is_private, album_id)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (user_id, position) DO UPDATE 
                SET photo_url = EXCLUDED.photo_url, is_private = EXCLUDED.is_private, album_id = EXCLUDED.album_id
                RETURNING id, photo_url, position, is_private, album_id, created_at
            """, (user_id, photo_url, position, is_private, album_id))
            
            new_photo = dict(cursor.fetchone())
            conn.commit()
            cursor.close()
            conn.close()
            return resp(200, {'photo': new_photo})
        
        elif method == 'POST' and action == 'like':
            body = json.loads(event.get('body', '{}'))
            photo_id = body.get('photo_id')
            
            if not photo_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'ID фото не указан'})
            
            cursor.execute(f"""
                INSERT INTO {schema}.photo_likes (photo_id, user_id)
                VALUES (%s, %s)
                ON CONFLICT (photo_id, user_id) DO NOTHING
                RETURNING id
            """, (photo_id, user_id))
            
            result = cursor.fetchone()
            
            if result:
                cursor.execute(f"SELECT user_id FROM {schema}.user_photos WHERE id = %s", (photo_id,))
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
            
            cursor.execute(f"SELECT COUNT(*) as likes_count FROM {schema}.photo_likes WHERE photo_id = %s", (photo_id,))
            likes_count = cursor.fetchone()['likes_count']
            cursor.close()
            conn.close()
            return resp(200, {'success': True, 'likes_count': likes_count, 'liked': result is not None})
        
        elif method == 'POST' and action == 'unlike':
            body = json.loads(event.get('body', '{}'))
            photo_id = body.get('photo_id')
            
            if not photo_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'ID фото не указан'})
            
            cursor.execute(f"""
                DELETE FROM {schema}.photo_likes
                WHERE photo_id = %s AND user_id = %s
            """, (photo_id, user_id))
            
            cursor.execute(f"""
                SELECT COUNT(*) as likes_count FROM {schema}.photo_likes WHERE photo_id = %s
            """, (photo_id,))
            likes_count = cursor.fetchone()['likes_count']
            
            conn.commit()
            cursor.close()
            conn.close()
            return resp(200, {'success': True, 'likes_count': likes_count})
        
        elif method == 'POST' and action == 'toggle-privacy':
            body = json.loads(event.get('body', '{}'))
            photo_id = body.get('photo_id')
            
            if not photo_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'ID фото не указан'})
            
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
                return resp(200, {'success': True, 'is_private': result['is_private']})
            return resp(404, {'error': 'Фото не найдено'})
        
        elif method == 'POST' and action == 'grant-access':
            body = json.loads(event.get('body', '{}'))
            granted_to_user_id = body.get('granted_to_user_id')
            
            if not granted_to_user_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'ID пользователя не указан'})
            
            cursor.execute(f"""
                INSERT INTO {schema}.photo_access (user_id, granted_to_user_id)
                VALUES (%s, %s)
                ON CONFLICT (user_id, granted_to_user_id) DO NOTHING
            """, (user_id, granted_to_user_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            return resp(200, {'success': True})
        
        elif method == 'POST' and action == 'revoke-access':
            body = json.loads(event.get('body', '{}'))
            granted_to_user_id = body.get('granted_to_user_id')
            
            if not granted_to_user_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'ID пользователя не указан'})
            
            cursor.execute(f"""
                DELETE FROM {schema}.photo_access
                WHERE user_id = %s AND granted_to_user_id = %s
            """, (user_id, granted_to_user_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            return resp(200, {'success': True})
        
        elif method == 'GET' and action == 'access-list':
            cursor.execute(f"""
                SELECT pa.granted_to_user_id, u.first_name, u.last_name, u.nickname, u.avatar_url
                FROM {schema}.photo_access pa
                JOIN {schema}.users u ON pa.granted_to_user_id = u.id
                WHERE pa.user_id = %s
            """, (user_id,))
            
            users = [dict(u) for u in cursor.fetchall()]
            cursor.close()
            conn.close()
            return resp(200, {'users': users})
        
        elif method == 'DELETE':
            photo_id = params.get('photo_id')
            
            if not photo_id:
                cursor.close()
                conn.close()
                return resp(400, {'error': 'ID фото не указан'})
            
            cursor.execute(f"""
                DELETE FROM {schema}.photo_likes WHERE photo_id = %s
            """, (photo_id,))
            cursor.execute(f"""
                DELETE FROM {schema}.user_photos
                WHERE id = %s AND user_id = %s
                RETURNING id
            """, (photo_id, user_id))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if result:
                return resp(200, {'success': True})
            return resp(404, {'error': 'Фото не найдено'})
        
        else:
            cursor.close()
            conn.close()
            return resp(400, {'error': 'Неверный метод или действие'})
    
    except Exception as e:
        return resp(500, {'error': str(e)})