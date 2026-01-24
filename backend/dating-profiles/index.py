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

    auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    payload = verify_token(token)
    if not payload:
        return response(401, {'error': 'Unauthorized'})
    
    user_id = payload.get('user_id')
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')

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
            
            where_conditions = [f"dp.user_id != {user_id}"]
            
            if gender:
                where_conditions.append(f"u.gender = '{gender}'")
            if age_from:
                where_conditions.append(f"dp.age >= {age_from}")
            if age_to:
                where_conditions.append(f"dp.age <= {age_to}")
            if city:
                where_conditions.append(f"LOWER(dp.city) LIKE LOWER('%{city}%')")
            if with_photo:
                where_conditions.append("dp.avatar_url IS NOT NULL")
            
            where_clause = " AND ".join(where_conditions)
            
            cur.execute(f"""
                SELECT 
                    dp.id, dp.user_id, dp.name, dp.age, dp.city, dp.district,
                    dp.interests, dp.bio, dp.avatar_url, dp.height, dp.body_type,
                    u.gender, u.avatar_url as user_avatar,
                    FALSE as is_online,
                    dp.is_top_ad,
                    EXISTS(SELECT 1 FROM {S}dating_favorites WHERE user_id = {user_id} AND profile_id = dp.id) as is_favorite,
                    EXISTS(SELECT 1 FROM {S}dating_friend_requests WHERE from_user_id = {user_id} AND to_user_id = dp.user_id AND status = 'pending') as friend_request_sent,
                    EXISTS(SELECT 1 FROM {S}dating_friend_requests WHERE from_user_id = {user_id} AND to_user_id = dp.user_id AND status = 'accepted') as is_friend
                FROM {S}dating_profiles dp
                JOIN {S}users u ON dp.user_id = u.id
                WHERE {where_clause}
                ORDER BY dp.is_top_ad DESC, dp.created_at DESC
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
            
            cur.execute(
                f"""INSERT INTO {S}dating_friend_requests 
                    (from_user_id, to_user_id, status, created_at)
                    VALUES (%s, %s, 'pending', %s)
                    ON CONFLICT (from_user_id, to_user_id) DO NOTHING""",
                (user_id, to_user_id, datetime.now(timezone.utc))
            )
            conn.commit()
            
            return response(200, {'success': True})
        
        else:
            return response(400, {'error': 'Invalid request'})
    
    except Exception as e:
        conn.rollback()
        return response(500, {'error': 'Internal server error', 'details': str(e)})
    
    finally:
        conn.close()
