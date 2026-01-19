import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """Удаление пользователя со всеми связанными данными"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'DELETE':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT rt.user_id 
            FROM t_p19021063_social_connect_platf.refresh_tokens rt
            WHERE rt.token = %s AND rt.expires_at > NOW()
            LIMIT 1
        """, (token,))
        
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid or expired token'})
            }
        
        user_id = result['user_id']
        
        cur.execute("""
            DELETE FROM t_p19021063_social_connect_platf.refresh_tokens WHERE user_id = %s
        """, (user_id,))
        
        cur.execute("""
            DELETE FROM t_p19021063_social_connect_platf.email_verification_tokens WHERE user_id = %s
        """, (user_id,))
        
        cur.execute("""
            DELETE FROM t_p19021063_social_connect_platf.password_reset_tokens WHERE user_id = %s
        """, (user_id,))
        
        cur.execute("""
            DELETE FROM t_p19021063_social_connect_platf.ads WHERE user_id = %s
        """, (user_id,))
        
        cur.execute("""
            DELETE FROM t_p19021063_social_connect_platf.users WHERE id = %s
        """, (user_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'User deleted successfully'})
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
