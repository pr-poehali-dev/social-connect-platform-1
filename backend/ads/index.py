import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt as pyjwt

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
    '''API для управления объявлениями пользователей'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    query_params = event.get('queryStringParameters') or {}
    user_id = query_params.get('user_id')
    action_param = query_params.get('action')
    action_filter = query_params.get('action') if action_param != 'favorites' else None
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Автоматическое удаление объявлений в статусе 'stopped' старше 14 дней
                cur.execute('''
                    DELETE FROM t_p19021063_social_connect_platf.ads
                    WHERE status = 'stopped' 
                    AND updated_at < NOW() - INTERVAL '14 days'
                ''')
                conn.commit()
                
                # GET favorites
                if action_param == 'favorites':
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
                        'body': json.dumps({'ads': []}, default=str)
                    }
                
                if user_id:
                    cur.execute('''
                        SELECT a.id, a.user_id, a.action, a.schedule, a.status, 
                               a.created_at, a.updated_at, a.photos,
                               u.name, u.nickname, u.avatar_url, u.gender, u.city, u.birth_date,
                               EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.created_at))::int as age
                        FROM t_p19021063_social_connect_platf.ads a
                        JOIN t_p19021063_social_connect_platf.users u ON a.user_id = u.id
                        WHERE a.user_id = %s
                        ORDER BY a.created_at DESC
                    ''', (user_id,))
                elif action_filter:
                    cur.execute('''
                        SELECT a.id, a.user_id, a.action, a.schedule, a.status, 
                               a.created_at, a.updated_at, a.photos,
                               u.name, u.nickname, u.avatar_url, u.gender, u.city, u.birth_date,
                               EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.created_at))::int as age
                        FROM t_p19021063_social_connect_platf.ads a
                        JOIN t_p19021063_social_connect_platf.users u ON a.user_id = u.id
                        WHERE a.action = %s AND a.status = 'active'
                        ORDER BY a.created_at DESC
                    ''', (action_filter,))
                else:
                    cur.execute('''
                        SELECT a.id, a.user_id, a.action, a.schedule, a.status, 
                               a.created_at, a.updated_at, a.photos,
                               u.name, u.nickname, u.avatar_url, u.gender, u.city, u.birth_date,
                               EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.created_at))::int as age
                        FROM t_p19021063_social_connect_platf.ads a
                        JOIN t_p19021063_social_connect_platf.users u ON a.user_id = u.id
                        WHERE a.status = 'active'
                        ORDER BY a.created_at DESC
                    ''')
                ads = cur.fetchall()
                
                for ad in ads:
                    cur.execute('''
                        SELECT event_type, details 
                        FROM t_p19021063_social_connect_platf.ad_events 
                        WHERE ad_id = %s
                    ''', (ad['id'],))
                    ad['events'] = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(ad) for ad in ads], default=str)
                }
        
        elif method == 'POST':
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'})
                }
            
            data = json.loads(event.get('body', '{}'))
            action = data.get('action')
            schedule = data.get('schedule')
            events = data.get('events', [])
            photos = data.get('photos', [])
            
            if not action or not schedule or not events:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'action, schedule, and events are required'})
                }
            
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO t_p19021063_social_connect_platf.ads (user_id, action, schedule, status, photos)
                    VALUES (%s, %s, %s, 'active', %s)
                    RETURNING id
                ''', (user_id, action, schedule, photos))
                ad_id = cur.fetchone()[0]
                
                for event in events:
                    cur.execute('''
                        INSERT INTO t_p19021063_social_connect_platf.ad_events (ad_id, event_type, details)
                        VALUES (%s, %s, %s)
                    ''', (ad_id, event['type'], event.get('details', '')))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': ad_id, 'status': 'created'})
                }
        
        elif method == 'PUT':
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'})
                }
            
            data = json.loads(event.get('body', '{}'))
            ad_id = data.get('id')
            status = data.get('status')
            
            if not ad_id or not status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id and status are required'})
                }
            
            with conn.cursor() as cur:
                cur.execute('''
                    UPDATE t_p19021063_social_connect_platf.ads 
                    SET status = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s AND user_id = %s
                ''', (status, ad_id, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'updated'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        conn.close()