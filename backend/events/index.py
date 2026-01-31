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
    '''API для управления мероприятиями'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
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
            user_id = query_params.get('user_id')
            action = query_params.get('action')
            
            if action == 'favorites':
                auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '') if auth_header else ''
                payload = verify_token(token)
                
                if not payload:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'})
                    }
                
                user_id_from_token = payload.get('user_id')
                
                cursor.execute('''
                    SELECT e.*
                    FROM t_p19021063_social_connect_platf.events_favorites ef
                    JOIN events e ON ef.event_id = e.id
                    WHERE ef.user_id = %s
                    ORDER BY ef.created_at DESC
                ''', (user_id_from_token,))
                
                events = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'events': [dict(e) for e in events]}, default=str)
                }
            
            if action == 'user_joined':
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id required'})
                    }
                
                cursor.execute('SELECT event_id FROM event_participants WHERE user_id = %s', (user_id,))
                rows = cursor.fetchall()
                event_ids = [row['event_id'] for row in rows]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'event_ids': event_ids})
                }
            
            if action == 'participating':
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id required'})
                    }
                
                cursor.execute('''
                    SELECT e.* FROM events e
                    INNER JOIN event_participants ep ON e.id = ep.event_id
                    WHERE ep.user_id = %s AND e.user_id != %s
                    ORDER BY e.event_date ASC, e.event_time ASC
                ''', (user_id, user_id))
                events = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(e) for e in events], default=str)
                }
            
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
            
            # Check if user is authenticated and add is_favorite field
            auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else ''
            payload = verify_token(token)
            user_id_from_token = payload.get('user_id') if payload else None
            
            events_list = [dict(e) for e in events]
            
            if user_id_from_token:
                for evt in events_list:
                    cursor.execute('''
                        SELECT EXISTS(
                            SELECT 1 FROM t_p19021063_social_connect_platf.events_favorites
                            WHERE user_id = %s AND event_id = %s
                        )
                    ''', (user_id_from_token, evt['id']))
                    evt['is_favorite'] = cursor.fetchone()['exists']
            else:
                for evt in events_list:
                    evt['is_favorite'] = False
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(events_list, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            query_params = event.get('queryStringParameters', {}) or {}
            action = body.get('action') or query_params.get('action')
            
            if action == 'favorite':
                auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '') if auth_header else ''
                payload = verify_token(token)
                
                if not payload:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'})
                    }
                
                user_id_from_token = payload.get('user_id')
                event_id = body.get('event_id')
                
                if not event_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'event_id is required'})
                    }
                
                cursor.execute('''
                    INSERT INTO t_p19021063_social_connect_platf.events_favorites (user_id, event_id, created_at)
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, event_id) DO NOTHING
                ''', (user_id_from_token, event_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'added'})
                }
            
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
            
            if action == 'leave':
                event_id = body.get('event_id')
                user_id = body.get('user_id')
                
                cursor.execute('''
                    DELETE FROM event_participants 
                    WHERE event_id = %s AND user_id = %s
                ''', (event_id, user_id))
                
                cursor.execute('''
                    UPDATE events SET participants = GREATEST(0, participants - 1)
                    WHERE id = %s
                ''', (event_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'left'})
                }
            
            cursor.execute('''
                INSERT INTO events 
                (user_id, title, description, event_date, event_time, location, city, address,
                 author_name, author_avatar, category, price, max_participants, image_url, payment_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('user_id'), body.get('title'), body.get('description'),
                body.get('event_date'), body.get('event_time'), body.get('location'),
                body.get('city'), body.get('address'), body.get('author_name'), body.get('author_avatar'),
                body.get('category'), body.get('price', 0), body.get('max_participants'),
                body.get('image_url'), body.get('payment_url')
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
                    location = %s, city = %s, address = %s, category = %s, price = %s,
                    max_participants = %s, image_url = %s, payment_url = %s, is_active = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body.get('title'), body.get('description'), body.get('event_date'),
                body.get('event_time'), body.get('location'), body.get('city'),
                body.get('address'), body.get('category'), body.get('price'), body.get('max_participants'),
                body.get('image_url'), body.get('payment_url'), body.get('is_active', True), event_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'})
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            action = query_params.get('action')
            
            if action == 'favorite':
                auth_header = event.get('headers', {}).get('Authorization', '') or event.get('headers', {}).get('authorization', '') or event.get('headers', {}).get('X-Authorization', '')
                token = auth_header.replace('Bearer ', '') if auth_header else ''
                payload = verify_token(token)
                
                if not payload:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Unauthorized'})
                    }
                
                user_id_from_token = payload.get('user_id')
                body = json.loads(event.get('body', '{}'))
                event_id = body.get('event_id')
                
                if not event_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'event_id is required'})
                    }
                
                cursor.execute('''
                    DELETE FROM t_p19021063_social_connect_platf.events_favorites
                    WHERE user_id = %s AND event_id = %s
                ''', (user_id_from_token, event_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'removed'})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cursor.close()
        conn.close()