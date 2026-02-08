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
    if action in ['favorite', 'unfavorite', 'favorites', 'friend-request', 'cancel-friend-request', 'friend-requests', 'friends', 'accept-friend-request', 'reject-friend-request', 'remove-friend'] and not user_id:
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
            district = query_params.get('district', '')
            height_from = query_params.get('heightFrom', '')
            height_to = query_params.get('heightTo', '')
            body_type = query_params.get('bodyType', '')
            marital_status = query_params.get('maritalStatus', '')
            has_children = query_params.get('hasChildren', '')
            financial_status = query_params.get('financialStatus', '')
            has_car = query_params.get('hasCar', '')
            has_housing = query_params.get('hasHousing', '')
            dating_goal = query_params.get('datingGoal', '')
            online = query_params.get('online', '') == 'true'
            with_photo = query_params.get('withPhoto', '') == 'true'
            
            where_conditions = []
            
            # Показывать только профили с включенной видимостью
            where_conditions.append("u.dating_visible = TRUE")
            
            if gender:
                where_conditions.append(f"u.gender = '{gender}'")
            if age_from:
                where_conditions.append(f"EXTRACT(YEAR FROM AGE(u.birth_date)) >= {age_from}")
            if age_to:
                where_conditions.append(f"EXTRACT(YEAR FROM AGE(u.birth_date)) <= {age_to}")
            if city:
                where_conditions.append(f"LOWER(u.city) LIKE LOWER('%{city}%')")
            if district:
                where_conditions.append(f"LOWER(u.district) LIKE LOWER('%{district}%')")
            if height_from:
                where_conditions.append(f"u.height >= {height_from}")
            if height_to:
                where_conditions.append(f"u.height <= {height_to}")
            if body_type:
                where_conditions.append(f"u.body_type = '{body_type}'")
            if marital_status:
                where_conditions.append(f"u.marital_status = '{marital_status}'")
            if has_children:
                where_conditions.append(f"u.children = '{has_children}'")
            if financial_status:
                where_conditions.append(f"u.financial_status = '{financial_status}'")
            if has_car:
                where_conditions.append(f"u.has_car = '{has_car}'")
            if has_housing:
                where_conditions.append(f"u.has_housing = '{has_housing}'")
            if dating_goal:
                where_conditions.append(f"u.dating_goal = '{dating_goal}'")
            if with_photo:
                where_conditions.append("u.avatar_url IS NOT NULL AND u.avatar_url != ''")
            if online:
                where_conditions.append("u.last_login_at > NOW() - INTERVAL '15 minutes'")
            
            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
            
            favorites_check = f"EXISTS(SELECT 1 FROM {S}dating_favorites df JOIN {S}dating_profiles dp ON df.profile_id = dp.id WHERE df.user_id = {user_id} AND dp.user_id = u.id)" if user_id else "FALSE"
            friend_request_check = f"EXISTS(SELECT 1 FROM {S}dating_friend_requests dfr JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id WHERE dfr.from_user_id = {user_id} AND dp.user_id = u.id AND dfr.status = 'pending')" if user_id else "FALSE"
            is_friend_check = f"EXISTS(SELECT 1 FROM {S}dating_friend_requests dfr JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id WHERE dfr.from_user_id = {user_id} AND dp.user_id = u.id AND dfr.status = 'accepted')" if user_id else "FALSE"
            
            is_current_user_check = f"u.id = {user_id}" if user_id else "FALSE"
            
            cur.execute(f"""
                SELECT 
                    dp.id, dp.user_id,
                    COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), u.name, dp.name) as name,
                    EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                    u.birth_date,
                    COALESCE(u.city, dp.city) as city,
                    COALESCE(u.district, dp.district) as district,
                    COALESCE(u.interests, dp.interests) as interests,
                    COALESCE(u.bio, dp.bio) as bio,
                    COALESCE(u.avatar_url, dp.avatar_url) as avatar_url,
                    u.height,
                    u.body_type,
                    u.gender,
                    u.is_verified,
                    u.last_login_at,
                    u.status_text,
                    CASE 
                        WHEN u.last_login_at > NOW() - INTERVAL '15 minutes' THEN TRUE
                        ELSE FALSE
                    END as is_online,
                    COALESCE(dp.is_top_ad, u.is_vip, FALSE) as is_top_ad,
                    u.is_vip,
                    u.profile_background,
                    {favorites_check} as is_favorite,
                    {friend_request_check} as friend_request_sent,
                    {is_friend_check} as is_friend,
                    {is_current_user_check} as is_current_user
                FROM {S}dating_profiles dp
                JOIN {S}users u ON dp.user_id = u.id
                WHERE {where_clause}
                ORDER BY dp.is_top_ad DESC NULLS LAST, dp.created_at DESC
                LIMIT 50
            """)
            
            profiles = [dict(row) for row in cur.fetchall()]
            
            return response(200, {'profiles': profiles})
        
        # GET /favorites - получить список избранных профилей
        elif method == 'GET' and action == 'favorites':
            cur.execute(f"""
                SELECT 
                    dp.id, dp.user_id,
                    COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), u.name, dp.name) as name,
                    EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                    u.birth_date,
                    COALESCE(u.city, dp.city) as city,
                    COALESCE(u.district, dp.district) as district,
                    COALESCE(u.interests, dp.interests) as interests,
                    COALESCE(u.bio, dp.bio) as bio,
                    COALESCE(u.avatar_url, dp.avatar_url) as image,
                    u.height,
                    u.body_type,
                    u.gender,
                    u.is_verified,
                    u.last_login_at,
                    u.status_text,
                    CASE 
                        WHEN u.last_login_at > NOW() - INTERVAL '15 minutes' THEN TRUE
                        ELSE FALSE
                    END as is_online,
                    u.nickname,
                    TRUE as is_favorite
                FROM {S}dating_favorites df
                JOIN {S}dating_profiles dp ON df.profile_id = dp.id
                JOIN {S}users u ON dp.user_id = u.id
                WHERE df.user_id = %s
                ORDER BY df.created_at DESC
            """, (user_id,))
            
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
                    ON CONFLICT (user_id, profile_id) DO NOTHING
                    RETURNING id""",
                (user_id, profile_id, datetime.now(timezone.utc))
            )
            result = cur.fetchone()
            
            if result:
                cur.execute(f"SELECT user_id FROM {S}dating_profiles WHERE id = %s", (profile_id,))
                profile_owner = cur.fetchone()
                if profile_owner:
                    owner_id = profile_owner['user_id']
                    cur.execute(f"SELECT first_name, last_name FROM {S}users WHERE id = %s", (user_id,))
                    user_info = cur.fetchone()
                    user_name = f"{user_info['first_name'] or ''} {user_info['last_name'] or ''}".strip() if user_info else 'Пользователь'
                    
                    cur.execute(
                        f"""INSERT INTO {S}notifications (user_id, type, title, content, related_user_id, related_entity_type, related_entity_id)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                        (owner_id, 'favorite', 'Вас добавили в избранное', f'{user_name} добавил вашу анкету в избранное', user_id, 'dating_profile', profile_id)
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
                    dp.id, dp.user_id,
                    COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), u.name, dp.name) as name,
                    EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                    COALESCE(u.city, dp.city) as city,
                    COALESCE(u.district, dp.district) as district,
                    COALESCE(u.interests, dp.interests) as interests,
                    COALESCE(u.bio, dp.bio) as bio,
                    u.avatar_url as image,
                    COALESCE(u.height, dp.height) as height,
                    COALESCE(u.body_type, dp.body_type) as bodyType,
                    COALESCE(u.gender, dp.gender) as gender,
                    CASE 
                        WHEN u.last_login_at > NOW() - INTERVAL '15 minutes' THEN TRUE
                        ELSE FALSE
                    END as isOnline,
                    u.last_login_at as lastLoginAt,
                    u.status_text,
                    u.is_verified,
                    u.phone,
                    u.telegram,
                    u.instagram,
                    u.marital_status,
                    u.children,
                    u.financial_status,
                    u.has_car,
                    u.has_housing,
                    u.dating_goal,
                    u.profession,
                    u.is_vip,
                    u.profile_background,
                    u.contact_price,
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
                    ON CONFLICT DO NOTHING
                    RETURNING id""",
                (user_id, to_profile_id)
            )
            result = cur.fetchone()
            
            if result:
                cur.execute(f"SELECT first_name, last_name FROM {S}users WHERE id = %s", (user_id,))
                user_info = cur.fetchone()
                user_name = f"{user_info['first_name'] or ''} {user_info['last_name'] or ''}".strip() if user_info else 'Пользователь'
                
                cur.execute(
                    f"""INSERT INTO {S}notifications (user_id, type, title, content, related_user_id, related_entity_type, related_entity_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (to_user_id, 'friend_request', 'Новая заявка в друзья', f'{user_name} отправил вам заявку в друзья', user_id, 'friend_request', result['id'])
                )
            
            conn.commit()
            
            return response(200, {'success': True, 'message': 'Friend request sent'})
        
        # POST /cancel-friend-request - отменить заявку в друзья
        elif method == 'POST' and action == 'cancel-friend-request':
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
            
            # Удаляем заявку в друзья
            cur.execute(
                f"""DELETE FROM {S}dating_friend_requests 
                    WHERE from_user_id = %s AND to_profile_id = %s AND status = 'pending'""",
                (user_id, to_profile_id)
            )
            conn.commit()
            
            return response(200, {'success': True, 'message': 'Friend request cancelled'})
        
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
        
        # GET /friend-requests - получить заявки в друзья (входящие и исходящие)
        elif method == 'GET' and action == 'friend-requests':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            request_type = query_params.get('type', 'incoming')  # incoming или outgoing
            
            if request_type == 'incoming':
                # Входящие заявки
                cur.execute(f"""
                    SELECT 
                        dfr.id as request_id,
                        dfr.created_at,
                        dfr.status,
                        u.id as user_id,
                        COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), u.name) as name,
                        u.nickname,
                        EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                        u.city,
                        u.avatar_url,
                        u.gender,
                        CASE 
                            WHEN u.last_login_at > NOW() - INTERVAL '15 minutes' THEN TRUE
                            ELSE FALSE
                        END as is_online
                    FROM {S}dating_friend_requests dfr
                    JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id
                    JOIN {S}users u ON dfr.from_user_id = u.id
                    WHERE dp.user_id = %s AND dfr.status = 'pending'
                    ORDER BY dfr.created_at DESC
                """, (user_id,))
            else:
                # Исходящие заявки
                cur.execute(f"""
                    SELECT 
                        dfr.id as request_id,
                        dfr.created_at,
                        dfr.status,
                        u.id as user_id,
                        COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), u.name) as name,
                        u.nickname,
                        EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                        u.city,
                        u.avatar_url,
                        u.gender,
                        CASE 
                            WHEN u.last_login_at > NOW() - INTERVAL '15 minutes' THEN TRUE
                            ELSE FALSE
                        END as is_online
                    FROM {S}dating_friend_requests dfr
                    JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id
                    JOIN {S}users u ON dp.user_id = u.id
                    WHERE dfr.from_user_id = %s AND dfr.status = 'pending'
                    ORDER BY dfr.created_at DESC
                """, (user_id,))
            
            requests_list = [dict(row) for row in cur.fetchall()]
            return response(200, {'requests': requests_list})
        
        # GET /friends - получить список друзей
        elif method == 'GET' and action == 'friends':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            cur.execute(f"""
                SELECT 
                    u.id as user_id,
                    COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), u.name) as name,
                    u.nickname,
                    EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                    u.city,
                    u.avatar_url,
                    u.gender,
                    CASE 
                        WHEN u.last_login_at > NOW() - INTERVAL '15 minutes' THEN TRUE
                        ELSE FALSE
                    END as is_online
                FROM {S}dating_friend_requests dfr
                JOIN {S}dating_profiles dp ON dfr.to_profile_id = dp.id
                JOIN {S}users u ON dp.user_id = u.id
                WHERE dfr.from_user_id = %s AND dfr.status = 'accepted'
                UNION
                SELECT 
                    u.id as user_id,
                    COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), u.name) as name,
                    u.nickname,
                    EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
                    u.city,
                    u.avatar_url,
                    u.gender,
                    CASE 
                        WHEN u.last_login_at > NOW() - INTERVAL '15 minutes' THEN TRUE
                        ELSE FALSE
                    END as is_online
                FROM {S}dating_friend_requests dfr
                JOIN {S}dating_profiles dp_from ON dfr.to_profile_id = dp_from.id
                JOIN {S}users u ON dfr.from_user_id = u.id
                JOIN {S}dating_profiles dp_to ON dp_to.user_id = u.id
                WHERE dp_from.user_id = %s AND dfr.status = 'accepted'
                ORDER BY is_online DESC, name ASC
            """, (user_id, user_id))
            
            friends_list = [dict(row) for row in cur.fetchall()]
            return response(200, {'friends': friends_list})
        
        # POST /accept-friend-request - принять заявку в друзья
        elif method == 'POST' and action == 'accept-friend-request':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            request_id = data.get('request_id')
            if not request_id:
                return response(400, {'error': 'request_id is required'})
            
            cur.execute(
                f"""UPDATE {S}dating_friend_requests 
                    SET status = 'accepted'
                    WHERE id = %s AND to_profile_id IN (SELECT id FROM {S}dating_profiles WHERE user_id = %s)
                    RETURNING id""",
                (request_id, user_id)
            )
            result = cur.fetchone()
            
            if not result:
                return response(404, {'error': 'Request not found'})
            
            conn.commit()
            return response(200, {'success': True, 'message': 'Friend request accepted'})
        
        # POST /reject-friend-request - отклонить заявку в друзья
        elif method == 'POST' and action == 'reject-friend-request':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            request_id = data.get('request_id')
            if not request_id:
                return response(400, {'error': 'request_id is required'})
            
            cur.execute(
                f"""DELETE FROM {S}dating_friend_requests 
                    WHERE id = %s AND to_profile_id IN (SELECT id FROM {S}dating_profiles WHERE user_id = %s)
                    RETURNING id""",
                (request_id, user_id)
            )
            result = cur.fetchone()
            
            if not result:
                return response(404, {'error': 'Request not found'})
            
            conn.commit()
            return response(200, {'success': True, 'message': 'Friend request rejected'})
        
        # POST /remove-friend - удалить из друзей
        elif method == 'POST' and action == 'remove-friend':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            friend_user_id = data.get('friend_user_id')
            if not friend_user_id:
                return response(400, {'error': 'friend_user_id is required'})
            
            # Удаляем дружбу в обе стороны
            cur.execute(f"""
                DELETE FROM {S}dating_friend_requests 
                WHERE status = 'accepted' AND (
                    (from_user_id = %s AND to_profile_id IN (SELECT id FROM {S}dating_profiles WHERE user_id = %s))
                    OR
                    (from_user_id = %s AND to_profile_id IN (SELECT id FROM {S}dating_profiles WHERE user_id = %s))
                )
                RETURNING id
            """, (user_id, friend_user_id, friend_user_id, user_id))
            
            result = cur.fetchone()
            
            if not result:
                return response(404, {'error': 'Friendship not found'})
            
            conn.commit()
            return response(200, {'success': True, 'message': 'Friend removed'})
        
        else:
            return response(400, {'error': 'Invalid request'})
    
    except Exception as e:
        conn.rollback()
        return response(500, {'error': 'Internal server error', 'details': str(e)})
    
    finally:
        conn.close()