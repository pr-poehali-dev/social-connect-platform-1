"""API для работы с профилями знакомств"""
import json
import os
from datetime import datetime, timezone
import jwt as pyjwt
import psycopg2
from psycopg2.extras import RealDictCursor

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
}


def get_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema():
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    return f"{schema}." if schema else ""


def verify_token(token: str) -> dict | None:
    if not token:
        return None
    try:
        jwt_secret = os.environ.get('JWT_SECRET', '')
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except Exception:
        return None


def response(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': HEADERS,
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }


def handler(event: dict, context) -> dict:
    """
    API для управления профилями знакомств.
    Позволяет получать список профилей, добавлять/удалять в избранное, отправлять заявки в друзья.
    """
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': '', 'isBase64Encoded': False}

    auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    payload = verify_token(token)
    user_id = payload.get('user_id') if payload else None
    
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    
    # Действия требующие авторизации
    if action in ['favorite', 'unfavorite', 'friend-request'] and not user_id:
        return response(401, {'error': 'Unauthorized'})

    S = get_schema()
    conn = get_connection()
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # GET /profiles - получить список профилей с фильтрами
        if method == 'GET' and action == 'profiles':
            # Фильтры
            gender = query_params.get('gender', '')
            age_from = query_params.get('ageFrom', '')
            age_to = query_params.get('ageTo', '')
            city = query_params.get('city', '')
            online = query_params.get('online', '') == 'true'
            with_photo = query_params.get('withPhoto', '') == 'true'
            
            where_conditions = []
            
            if user_id:
                where_conditions.append(f"u.id != {user_id}")
            
            if gender:
                where_conditions.append(f"dp.gender = '{gender}'")
            if age_from:
                where_conditions.append(f"COALESCE(u.age_from, 25) >= {age_from}")
            if age_to:
                where_conditions.append(f"COALESCE(u.age_from, 25) <= {age_to}")
            if city:
                where_conditions.append(f"LOWER(u.city) LIKE LOWER('%{city}%')")
            if with_photo:
                where_conditions.append("u.avatar_url IS NOT NULL AND u.avatar_url != ''")
            
            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
            
            favorites_check = f"EXISTS(SELECT 1 FROM {S}dating_favorites df JOIN {S}dating_profiles dp ON df.profile_id = dp.id WHERE df.user_id = {user_id} AND dp.user_id = u.id)" if user_id else "FALSE"
            friend_request_check = f"EXISTS(SELECT 1 FROM {S}dating_friend_requests dfr JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id WHERE dfr.from_user_id = {user_id} AND dp.user_id = u.id AND dfr.status = 'pending')" if user_id else "FALSE"
            is_friend_check = f"EXISTS(SELECT 1 FROM {S}dating_friend_requests dfr JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id WHERE dfr.from_user_id = {user_id} AND dp.user_id = u.id AND dfr.status = 'accepted')" if user_id else "FALSE"
            
            cur.execute(f"""
                SELECT 
                    dp.id, dp.user_id, dp.name, 
                    dp.age,
                    u.birth_date,
                    dp.city, dp.district,
                    dp.interests, dp.bio, 
                    COALESCE(
                        (SELECT photo_url FROM {S}user_photos WHERE user_id = dp.user_id ORDER BY position LIMIT 1),
                        dp.avatar_url, 
                        u.avatar_url
                    ) as avatar_url,
                    dp.height, dp.body_type, dp.gender,
                    FALSE as is_online,
                    COALESCE(dp.is_top_ad, u.is_vip, FALSE) as is_top_ad,
                    {favorites_check} as is_favorite,
                    {friend_request_check} as friend_request_sent,
                    {is_friend_check} as is_friend
                FROM {S}dating_profiles dp
                JOIN {S}users u ON dp.user_id = u.id
                WHERE {where_clause}
                ORDER BY dp.is_top_ad DESC NULLS LAST, dp.created_at DESC
                LIMIT 50
            """)
            
            profiles = [dict(row) for row in cur.fetchall()]
            
            return response(200, {'profiles': profiles})
        
        # POST /favorites - добавить в избранное
        elif method == 'POST' and action == 'favorite':
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            profile_id = data.get('profile_id')
            if not profile_id:
                return response(400, {'error': 'profile_id is required'})
            
            cur.execute(
                f"""INSERT INTO {S}dating_favorites (user_id, profile_id, created_at)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, profile_id) DO NOTHING""",
                (user_id, profile_id, datetime.now(timezone.utc))
            )
            conn.commit()
            
            return response(200, {'success': True})
        
        # DELETE /favorites - удалить из избранного
        elif method == 'POST' and action == 'unfavorite':
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            profile_id = data.get('profile_id')
            if not profile_id:
                return response(400, {'error': 'profile_id is required'})
            
            cur.execute(
                f"DELETE FROM {S}dating_favorites WHERE user_id = %s AND profile_id = %s",
                (user_id, profile_id)
            )
            conn.commit()
            
            return response(200, {'success': True})
        
        # GET /profile - получить конкретный профиль
        elif method == 'GET' and action == 'profile':
            target_id = query_params.get('id')
            if not target_id:
                return response(400, {'error': 'id is required'})
            
            favorites_check = f"EXISTS(SELECT 1 FROM {S}dating_favorites df JOIN {S}dating_profiles dp ON df.profile_id = dp.id WHERE df.user_id = {user_id} AND dp.user_id = u.id)" if user_id else "FALSE"
            friend_request_check = f"EXISTS(SELECT 1 FROM {S}dating_friend_requests dfr JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id WHERE dfr.from_user_id = {user_id} AND dp.user_id = u.id AND dfr.status = 'pending')" if user_id else "FALSE"
            is_friend_check = f"EXISTS(SELECT 1 FROM {S}dating_friend_requests dfr JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id WHERE dfr.from_user_id = {user_id} AND dp.user_id = u.id AND dfr.status = 'accepted')" if user_id else "FALSE"
            
            cur.execute(f"""
                SELECT 
                    dp.id, dp.user_id, dp.name, 
                    dp.age, dp.city, dp.district,
                    dp.interests, dp.bio, 
                    COALESCE(
                        (SELECT photo_url FROM {S}user_photos WHERE user_id = dp.user_id ORDER BY position LIMIT 1),
                        dp.avatar_url, 
                        u.avatar_url
                    ) as image,
                    dp.height, dp.body_type as bodyType, dp.gender,
                    FALSE as isOnline,
                    u.last_login_at as lastLoginAt,
                    u.status_text,
                    {favorites_check} as is_favorite,
                    {friend_request_check} as friend_request_sent,
                    {is_friend_check} as is_friend
                FROM {S}dating_profiles dp
                JOIN {S}users u ON dp.user_id = u.id
                WHERE dp.user_id = {target_id} OR dp.id = {target_id}
            """)
            
            profile = cur.fetchone()
            
            if not profile:
                return response(404, {'error': 'Profile not found'})
            
            return response(200, dict(profile))
        
        # POST /friend-request - отправить заявку в друзья
        elif method == 'POST' and action == 'friend-request':
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            to_user_id = data.get('to_user_id')
            if not to_user_id:
                return response(400, {'error': 'to_user_id is required'})
            
            # Находим profile_id по user_id
            cur.execute(
                f"""SELECT id FROM {S}dating_profiles WHERE user_id = %s""",
                (to_user_id,)
            )
            profile_result = cur.fetchone()
            
            if not profile_result:
                return response(404, {'error': 'Profile not found'})
            
            to_profile_id = profile_result['id']
            
            # Вставляем заявку в друзья
            cur.execute(
                f"""INSERT INTO {S}dating_friend_requests 
                    (from_user_id, to_profile_id, status, created_at)
                    VALUES (%s, %s, 'pending', CURRENT_TIMESTAMP)
                    ON CONFLICT DO NOTHING""",
                (user_id, to_profile_id)
            )
            conn.commit()
            
            return response(200, {'success': True, 'message': 'Friend request sent'})
        
        # POST /boost - поднять профиль в выдаче
        elif method == 'POST' and action == 'boost':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            # Обновляем created_at профиля на текущее время (профиль поднимется в выдаче)
            cur.execute(
                f"""UPDATE {S}dating_profiles 
                    SET created_at = CURRENT_TIMESTAMP 
                    WHERE user_id = %s
                    RETURNING id""",
                (user_id,)
            )
            result = cur.fetchone()
            
            if not result:
                return response(404, {'error': 'Profile not found'})
            
            conn.commit()
            
            return response(200, {'success': True, 'message': 'Profile boosted'})
        
        else:
            return response(400, {'error': 'Invalid request'})
    
    except Exception as e:
        conn.rollback()
        return response(500, {'error': 'Internal server error', 'details': str(e)})
    
    finally:
        conn.close()