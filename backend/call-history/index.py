"""API для управления историей звонков"""
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
    API для управления историей VK звонков.
    Позволяет сохранять звонки и получать историю звонков пользователя.
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
        
        if method == 'POST':
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            recipient_id = data.get('recipient_id')
            call_type = data.get('call_type', 'audio')
            status = data.get('status', 'initiated')
            
            if not recipient_id:
                return response(400, {'error': 'recipient_id is required'})
            
            if call_type not in ['audio', 'video']:
                return response(400, {'error': 'call_type must be audio or video'})
            
            if status not in ['initiated', 'connected', 'ended', 'missed', 'declined', 'failed']:
                return response(400, {'error': 'Invalid status'})
            
            cur.execute(
                f"""INSERT INTO {S}call_history 
                    (caller_id, recipient_id, call_type, status, started_at, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, caller_id, recipient_id, call_type, status, 
                              duration_seconds, started_at, ended_at, created_at""",
                (user_id, recipient_id, call_type, status, 
                 datetime.now(timezone.utc), datetime.now(timezone.utc))
            )
            
            call = cur.fetchone()
            conn.commit()
            
            return response(200, {'call': dict(call)})
        
        elif method == 'PUT':
            call_id = query_params.get('id')
            if not call_id:
                return response(400, {'error': 'Call ID is required'})
            
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            status = data.get('status')
            duration_seconds = data.get('duration_seconds')
            
            if status and status not in ['initiated', 'connected', 'ended', 'missed', 'declined', 'failed']:
                return response(400, {'error': 'Invalid status'})
            
            updates = []
            params = []
            
            if status:
                updates.append('status = %s')
                params.append(status)
            
            if duration_seconds is not None:
                updates.append('duration_seconds = %s')
                params.append(duration_seconds)
            
            if status in ['ended', 'missed', 'declined', 'failed']:
                updates.append('ended_at = %s')
                params.append(datetime.now(timezone.utc))
            
            if not updates:
                return response(400, {'error': 'No fields to update'})
            
            params.extend([call_id, user_id])
            
            cur.execute(
                f"""UPDATE {S}call_history 
                    SET {', '.join(updates)}
                    WHERE id = %s AND caller_id = %s
                    RETURNING id, caller_id, recipient_id, call_type, status, 
                              duration_seconds, started_at, ended_at, created_at""",
                params
            )
            
            call = cur.fetchone()
            if not call:
                return response(404, {'error': 'Call not found or access denied'})
            
            conn.commit()
            
            return response(200, {'call': dict(call)})
        
        elif method == 'GET' and action == 'history':
            limit = int(query_params.get('limit', '50'))
            offset = int(query_params.get('offset', '0'))
            
            cur.execute(
                f"""SELECT 
                        ch.id, ch.caller_id, ch.recipient_id, ch.call_type, ch.status,
                        ch.duration_seconds, ch.started_at, ch.ended_at, ch.created_at,
                        u1.name as caller_name, u1.avatar_url as caller_avatar,
                        u2.name as recipient_name, u2.avatar_url as recipient_avatar
                    FROM {S}call_history ch
                    JOIN {S}users u1 ON ch.caller_id = u1.id
                    JOIN {S}users u2 ON ch.recipient_id = u2.id
                    WHERE ch.caller_id = %s OR ch.recipient_id = %s
                    ORDER BY ch.started_at DESC
                    LIMIT %s OFFSET %s""",
                (user_id, user_id, limit, offset)
            )
            
            calls = [dict(row) for row in cur.fetchall()]
            
            return response(200, {'calls': calls, 'total': len(calls)})
        
        else:
            return response(400, {'error': 'Invalid request'})
    
    except Exception as e:
        conn.rollback()
        return response(500, {'error': 'Internal server error', 'details': str(e)})
    
    finally:
        conn.close()
