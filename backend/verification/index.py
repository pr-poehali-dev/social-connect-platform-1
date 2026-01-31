"""API для управления верификацией пользователей"""
import json
import os
from datetime import datetime, timezone
import jwt as pyjwt
import psycopg2
from psycopg2.extras import RealDictCursor

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
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
    API для верификации пользователей.
    Позволяет отправлять заявки на верификацию и управлять ими.
    """
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': '', 'isBase64Encoded': False}

    auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    payload = verify_token(token)
    user_id = payload.get('user_id') if payload else None
    
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    
    S = get_schema()
    conn = get_connection()
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST' and action == 'request':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            comment = data.get('comment', '')
            
            cur.execute(
                f"""INSERT INTO {S}verification_requests 
                    (user_id, status, comment, created_at)
                    VALUES (%s, 'pending', %s, %s)
                    ON CONFLICT (user_id) DO UPDATE 
                    SET status = 'pending', comment = %s, updated_at = %s
                    RETURNING id""",
                (user_id, comment, datetime.now(timezone.utc), comment, datetime.now(timezone.utc))
            )
            conn.commit()
            
            return response(200, {'success': True, 'message': 'Заявка отправлена'})
        
        elif method == 'GET' and action == 'status':
            if not user_id:
                return response(401, {'error': 'Unauthorized'})
            
            cur.execute(
                f"""SELECT status, admin_comment, created_at, updated_at 
                    FROM {S}verification_requests 
                    WHERE user_id = %s""",
                (user_id,)
            )
            request = cur.fetchone()
            
            if not request:
                return response(404, {'error': 'No request found'})
            
            return response(200, dict(request))
        
        elif method == 'GET' and action == 'list':
            cur.execute(
                f"""SELECT 
                        vr.id, vr.user_id, vr.status, vr.comment, vr.admin_comment,
                        vr.created_at, vr.updated_at, vr.reviewed_at,
                        u.first_name, u.last_name, u.name, u.avatar_url, u.email
                    FROM {S}verification_requests vr
                    JOIN {S}users u ON vr.user_id = u.id
                    ORDER BY 
                        CASE vr.status 
                            WHEN 'pending' THEN 1 
                            WHEN 'approved' THEN 2 
                            WHEN 'rejected' THEN 3 
                        END,
                        vr.created_at DESC"""
            )
            requests = [dict(row) for row in cur.fetchall()]
            
            return response(200, {'requests': requests})
        
        elif method == 'POST' and action == 'review':
            body_str = event.get('body', '{}')
            try:
                data = json.loads(body_str)
            except json.JSONDecodeError:
                return response(400, {'error': 'Invalid JSON'})
            
            request_id = data.get('request_id')
            new_status = data.get('status')
            admin_comment = data.get('admin_comment', '')
            
            if not request_id or not new_status:
                return response(400, {'error': 'request_id and status are required'})
            
            if new_status not in ['approved', 'rejected']:
                return response(400, {'error': 'Invalid status'})
            
            cur.execute(
                f"""UPDATE {S}verification_requests 
                    SET status = %s, admin_comment = %s, 
                        reviewed_at = %s, updated_at = %s
                    WHERE id = %s
                    RETURNING user_id""",
                (new_status, admin_comment, datetime.now(timezone.utc), datetime.now(timezone.utc), request_id)
            )
            result = cur.fetchone()
            
            if not result:
                return response(404, {'error': 'Request not found'})
            
            if new_status == 'approved':
                cur.execute(
                    f"""UPDATE {S}users SET is_verified = TRUE WHERE id = %s""",
                    (result['user_id'],)
                )
            
            conn.commit()
            
            return response(200, {'success': True, 'message': 'Request reviewed'})
        
        else:
            return response(400, {'error': 'Invalid action'})
    
    except Exception as e:
        conn.rollback()
        return response(500, {'error': str(e)})
    
    finally:
        cur.close()
        conn.close()
