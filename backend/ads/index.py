import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

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
    
    user_id = event.get('queryStringParameters', {}).get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id is required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    SELECT a.id, a.user_id, a.action, a.schedule, a.status, 
                           a.created_at, a.updated_at,
                           u.name, u.nickname, u.avatar_url,
                           EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.created_at))::int as age
                    FROM ads a
                    JOIN users u ON a.user_id = u.id
                    WHERE a.user_id = %s
                    ORDER BY a.created_at DESC
                ''', (user_id,))
                ads = cur.fetchall()
                
                for ad in ads:
                    cur.execute('''
                        SELECT event_type, details 
                        FROM ad_events 
                        WHERE ad_id = %s
                    ''', (ad['id'],))
                    ad['events'] = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(ad) for ad in ads], default=str)
                }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            action = data.get('action')
            schedule = data.get('schedule')
            events = data.get('events', [])
            
            if not action or not schedule or not events:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'action, schedule, and events are required'})
                }
            
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO ads (user_id, action, schedule, status)
                    VALUES (%s, %s, %s, 'active')
                    RETURNING id
                ''', (user_id, action, schedule))
                ad_id = cur.fetchone()[0]
                
                for event in events:
                    cur.execute('''
                        INSERT INTO ad_events (ad_id, event_type, details)
                        VALUES (%s, %s, %s)
                    ''', (ad_id, event['type'], event.get('details', '')))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': ad_id, 'status': 'created'})
                }
        
        elif method == 'PUT':
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
                    UPDATE ads 
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
