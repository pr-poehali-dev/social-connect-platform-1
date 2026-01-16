import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления мероприятиями'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            event_id = query_params.get('id')
            
            if event_id:
                cursor.execute('SELECT * FROM events WHERE id = %s', (event_id,))
                evt = cursor.fetchone()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(evt) if evt else {}, default=str)
                }
            
            category = query_params.get('category', '')
            city = query_params.get('city', '')
            
            query = 'SELECT * FROM events WHERE is_active = TRUE'
            params = []
            
            if category and category != 'all':
                query += ' AND category = %s'
                params.append(category)
            if city:
                query += ' AND city = %s'
                params.append(city)
            
            query += ' ORDER BY event_date ASC, event_time ASC LIMIT 100'
            
            cursor.execute(query, params)
            events = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(e) for e in events], default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'join':
                event_id = body.get('event_id')
                user_id = body.get('user_id')
                
                cursor.execute('''
                    INSERT INTO event_participants (event_id, user_id)
                    VALUES (%s, %s)
                    ON CONFLICT (event_id, user_id) DO NOTHING
                ''', (event_id, user_id))
                
                cursor.execute('''
                    UPDATE events SET participants = participants + 1
                    WHERE id = %s
                ''', (event_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'joined'})
                }
            
            cursor.execute('''
                INSERT INTO events 
                (user_id, title, description, event_date, event_time, location, city,
                 author_name, author_avatar, category, price, max_participants, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('user_id'), body.get('title'), body.get('description'),
                body.get('event_date'), body.get('event_time'), body.get('location'),
                body.get('city'), body.get('author_name'), body.get('author_avatar'),
                body.get('category'), body.get('price', 0), body.get('max_participants'),
                body.get('image_url')
            ))
            
            event_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': event_id, 'status': 'created'})
            }
        
        elif method == 'PUT':
            query_params = event.get('queryStringParameters', {}) or {}
            event_id = query_params.get('id')
            body = json.loads(event.get('body', '{}'))
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'})
                }
            
            cursor.execute('''
                UPDATE events SET
                    title = %s, description = %s, event_date = %s, event_time = %s,
                    location = %s, city = %s, category = %s, price = %s,
                    max_participants = %s, image_url = %s, is_active = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body.get('title'), body.get('description'), body.get('event_date'),
                body.get('event_time'), body.get('location'), body.get('city'),
                body.get('category'), body.get('price'), body.get('max_participants'),
                body.get('image_url'), body.get('is_active', True), event_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
