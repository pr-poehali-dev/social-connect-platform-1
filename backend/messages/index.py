import json
import os
import math
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def handler(event: dict, context) -> dict:
    '''API для работы с сообщениями: получение чатов, отправка сообщений'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        import jwt as pyjwt
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Server configuration error'}),
                'isBase64Encoded': False
            }
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except Exception:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'conversations')
    
    if method == 'GET' and action == 'unread_count':
        cursor.execute(f'''
            SELECT COUNT(*) as unread_count
            FROM t_p19021063_social_connect_platf.messages m
            JOIN t_p19021063_social_connect_platf.conversation_participants cp 
                ON m.conversation_id = cp.conversation_id
            WHERE cp.user_id = %s AND m.sender_id != %s AND m.is_read = FALSE
        ''', (user_id, user_id))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'unread_count': result['unread_count'] if result else 0}),
            'isBase64Encoded': False
        }
    
    if method == 'GET' and action == 'conversations':
        conv_type = params.get('type', '')
        
        query = f'''
            SELECT DISTINCT c.id, c.type, c.name, c.avatar_url, c.deal_status,
                   (SELECT content FROM {schema}.messages 
                    WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM {schema}.messages 
                    WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                   (SELECT COUNT(*) FROM {schema}.messages m 
                    WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != %s) as unread_count,
                   (SELECT COUNT(*) FROM {schema}.conversation_participants 
                    WHERE conversation_id = c.id) as participants_count,
                   (SELECT u.id FROM {schema}.users u
                    JOIN {schema}.conversation_participants cp2 ON u.id = cp2.user_id
                    WHERE cp2.conversation_id = c.id AND cp2.user_id != %s
                    LIMIT 1) as other_user_id,
                   (SELECT u.vk_id FROM {schema}.users u
                    JOIN {schema}.conversation_participants cp2 ON u.id = cp2.user_id
                    WHERE cp2.conversation_id = c.id AND cp2.user_id != %s
                    LIMIT 1) as other_user_vk_id,
                   (SELECT COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')), ''), u.nickname, u.name) FROM {schema}.users u
                    JOIN {schema}.conversation_participants cp2 ON u.id = cp2.user_id
                    WHERE cp2.conversation_id = c.id AND cp2.user_id != %s
                    LIMIT 1) as other_user_name,
                   (SELECT u.avatar_url FROM {schema}.users u
                    JOIN {schema}.conversation_participants cp2 ON u.id = cp2.user_id
                    WHERE cp2.conversation_id = c.id AND cp2.user_id != %s
                    LIMIT 1) as other_user_avatar
            FROM {schema}.conversations c
            JOIN {schema}.conversation_participants cp ON c.id = cp.conversation_id
            WHERE cp.user_id = %s
        '''
        
        if conv_type:
            query += f" AND c.type = '{conv_type}'"
        
        query += " ORDER BY last_message_time DESC NULLS LAST"
        
        cursor.execute(query, (user_id, user_id, user_id, user_id, user_id, user_id))
        conversations = cursor.fetchall()
        
        result = []
        for conv in conversations:
            # Для personal чатов берём имя и аватар из users, для остальных — из conversations
            display_name = conv.get('other_user_name') or conv['name']
            display_avatar = conv.get('other_user_avatar') or conv['avatar_url']
            
            result.append({
                'id': conv['id'],
                'type': conv['type'],
                'name': display_name,
                'avatar': display_avatar,
                'lastMessage': conv['last_message'] or '',
                'time': format_time(conv['last_message_time']) if conv['last_message_time'] else '',
                'unread': conv['unread_count'] or 0,
                'participants': conv['participants_count'],
                'dealStatus': conv['deal_status'],
                'vkId': conv['other_user_vk_id'],
                'userId': conv.get('other_user_id')
            })
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'conversations': result}),
            'isBase64Encoded': False
        }
    
    if method == 'GET' and action == 'messages':
        conversation_id = params.get('conversationId', '')
        
        if not conversation_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing conversationId'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(f'''
            SELECT m.id, m.content, m.sender_id, m.created_at, m.is_read,
                   u.name as sender_name, u.avatar_url as sender_avatar
            FROM {schema}.messages m
            JOIN {schema}.users u ON m.sender_id = u.id
            WHERE m.conversation_id = %s
            ORDER BY m.created_at ASC
        ''', (conversation_id,))
        
        messages = cursor.fetchall()
        
        cursor.execute(f'''
            UPDATE {schema}.messages 
            SET is_read = TRUE 
            WHERE conversation_id = %s AND sender_id != %s AND is_read = FALSE
        ''', (conversation_id, user_id))
        conn.commit()
        
        result = []
        for msg in messages:
            result.append({
                'id': msg['id'],
                'content': msg['content'],
                'senderId': msg['sender_id'],
                'senderName': msg['sender_name'],
                'senderAvatar': msg['sender_avatar'],
                'createdAt': msg['created_at'].isoformat() if msg['created_at'] else None,
                'isRead': msg['is_read']
            })
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'messages': result}),
            'isBase64Encoded': False
        }
    
    if method == 'POST' and action == 'create-conversation':
        data = json.loads(event.get('body', '{}'))
        participant_id = data.get('participantId')
        conv_type = data.get('type', 'personal')
        
        print(f"[DEBUG] Create conversation: user_id={user_id}, participant_id={participant_id}, data={data}")
        
        if not participant_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing participantId'}),
                'isBase64Encoded': False
            }
            
        cursor.execute(f'''
            SELECT c.id FROM {schema}.conversations c
            JOIN {schema}.conversation_participants cp1 ON c.id = cp1.conversation_id
            JOIN {schema}.conversation_participants cp2 ON c.id = cp2.conversation_id
            WHERE c.type = 'personal' 
            AND cp1.user_id = %s 
            AND cp2.user_id = %s
            LIMIT 1
        ''', (user_id, participant_id))
            
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'conversationId': existing['id']}),
                'isBase64Encoded': False
            }
        
        cursor.execute(f'''
            SELECT id, first_name, last_name, nickname, avatar_url FROM {schema}.users WHERE id = %s
        ''', (participant_id,))
        other_user = cursor.fetchone()
        
        print(f"[DEBUG] Other user found: {other_user}")
        
        if not other_user:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        # Формируем имя: first_name + last_name, если нет - nickname
        user_display_name = f"{other_user['first_name'] or ''} {other_user['last_name'] or ''}".strip()
        if not user_display_name:
            user_display_name = other_user['nickname'] or 'Пользователь'
        
        cursor.execute(f'''
            INSERT INTO {schema}.conversations 
            (type, name, avatar_url, created_by)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        ''', (conv_type, user_display_name, other_user['avatar_url'], user_id))
        
        new_conv = cursor.fetchone()
        conv_id = new_conv['id']
        
        print(f"[DEBUG] Created new conversation with ID: {conv_id} for user {user_display_name}")
        
        cursor.execute(f'''
            INSERT INTO {schema}.conversation_participants 
            (conversation_id, user_id) VALUES (%s, %s), (%s, %s)
        ''', (conv_id, user_id, conv_id, participant_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"[DEBUG] Returning conversationId: {conv_id}")
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'conversationId': conv_id}),
            'isBase64Encoded': False
        }
    
    if method == 'POST' and action not in ('create-conversation', 'sos-create', 'sos-resolve', 'sos-location'):
        data = json.loads(event.get('body', '{}'))
        conversation_id = data.get('conversationId')
        content = data.get('content', '').strip()
        
        if not conversation_id or not content:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing conversationId or content'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(f'''
            INSERT INTO {schema}.messages 
            (conversation_id, sender_id, content, created_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING id, created_at
        ''', (conversation_id, user_id, content))
        
        new_message = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': new_message['id'],
                'createdAt': new_message['created_at'].isoformat()
            }),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        data = json.loads(event.get('body', '{}'))
        action_type = data.get('action')
        
        if action_type == 'block':
            blocked_user_id = data.get('userId')
            if not blocked_user_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing userId'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f'''
                INSERT INTO {schema}.user_blocks (blocker_user_id, blocked_user_id)
                VALUES (%s, %s)
                ON CONFLICT (blocker_user_id, blocked_user_id) DO NOTHING
            ''', (user_id, blocked_user_id))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'blocked'}),
                'isBase64Encoded': False
            }
        
        elif action_type == 'unblock':
            blocked_user_id = data.get('userId')
            if not blocked_user_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing userId'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f'''
                DELETE FROM {schema}.user_blocks 
                WHERE blocker_user_id = %s AND blocked_user_id = %s
            ''', (user_id, blocked_user_id))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'unblocked'}),
                'isBase64Encoded': False
            }
        
        elif action_type == 'clear':
            conversation_id = data.get('conversationId')
            if not conversation_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing conversationId'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f'''
                DELETE FROM {schema}.messages WHERE conversation_id = %s
            ''', (conversation_id,))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'cleared'}),
                'isBase64Encoded': False
            }
    
    if method == 'DELETE':
        conversation_id = params.get('conversationId')
        
        if not conversation_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing conversationId'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(f'''
            DELETE FROM {schema}.conversation_participants 
            WHERE conversation_id = %s AND user_id = %s
        ''', (conversation_id, user_id))
        
        cursor.execute(f'''
            SELECT COUNT(*) as count FROM {schema}.conversation_participants 
            WHERE conversation_id = %s
        ''', (conversation_id,))
        
        remaining = cursor.fetchone()
        
        if remaining['count'] == 0:
            cursor.execute(f'''
                DELETE FROM {schema}.messages WHERE conversation_id = %s
            ''', (conversation_id,))
            
            cursor.execute(f'''
                DELETE FROM {schema}.conversations WHERE id = %s
            ''', (conversation_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'status': 'deleted'}),
            'isBase64Encoded': False
        }
    
    # ---- SOS actions ----
    if method == 'POST' and action == 'sos-create':
        data = json.loads(event.get('body', '{}'))
        reason = data.get('reason', '').strip()
        lat = float(data.get('latitude', 0))
        lon = float(data.get('longitude', 0))
        radius_km = int(data.get('radius_km', 5))

        if not reason:
            cursor.close(); conn.close()
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Укажите причину'}), 'isBase64Encoded': False}

        cursor.execute(f'''
            SELECT COALESCE(NULLIF(TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')), ''), nickname, name) as full_name
            FROM {schema}.users WHERE id = %s
        ''', (user_id,))
        creator = cursor.fetchone()
        creator_name = creator['full_name'] if creator else 'Пользователь'

        cursor.execute(f'''
            INSERT INTO {schema}.conversations (type, name, created_by, created_at, updated_at)
            VALUES ('sos', %s, %s, NOW(), NOW()) RETURNING id
        ''', (f'SOS: {creator_name}', user_id))
        conv_id = cursor.fetchone()['id']

        cursor.execute(f'''
            INSERT INTO {schema}.sos_requests (creator_id, reason, latitude, longitude, radius_km, conversation_id)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
        ''', (user_id, reason, lat, lon, radius_km, conv_id))
        sos_id = cursor.fetchone()['id']

        cursor.execute(f'UPDATE {schema}.conversations SET sos_request_id = %s WHERE id = %s', (sos_id, conv_id))
        cursor.execute(f'INSERT INTO {schema}.conversation_participants (conversation_id, user_id) VALUES (%s, %s)', (conv_id, user_id))

        cursor.execute(f'''
            SELECT id, last_latitude, last_longitude,
                   COALESCE(NULLIF(TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')), ''), nickname, name) as full_name
            FROM {schema}.users WHERE id != %s AND last_latitude IS NOT NULL AND last_longitude IS NOT NULL
        ''', (user_id,))
        all_users = cursor.fetchall()

        notified = 0
        for u in all_users:
            dist = haversine_km(lat, lon, float(u['last_latitude']), float(u['last_longitude']))
            if dist <= radius_km:
                notified += 1
                cursor.execute(f'INSERT INTO {schema}.conversation_participants (conversation_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING', (conv_id, u['id']))
                cursor.execute(f'''
                    INSERT INTO {schema}.notifications (user_id, type, title, content, related_user_id, related_entity_type, related_entity_id)
                    VALUES (%s, 'sos', 'SOS: Нужна помощь!', %s, %s, 'sos', %s)
                ''', (u['id'], f'Пользователю {creator_name} нужна ваша помощь. Нажмите, чтобы помочь.', user_id, conv_id))

        maps_link = f'https://maps.google.com/?q={lat},{lon}'
        first_msg = f'🆘 SOS-заявка\n\nПричина: {reason}\n\nКоординаты: {lat:.6f}, {lon:.6f}\nОтслеживать: {maps_link}'
        cursor.execute(f'INSERT INTO {schema}.messages (conversation_id, sender_id, content, is_read, created_at) VALUES (%s, %s, %s, FALSE, NOW())', (conv_id, user_id, first_msg))

        conn.commit()
        cursor.close(); conn.close()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'sosId': sos_id, 'conversationId': conv_id, 'notifiedCount': notified}), 'isBase64Encoded': False}

    if method == 'POST' and action == 'sos-resolve':
        data = json.loads(event.get('body', '{}'))
        sos_id = data.get('sosId')
        cursor.execute(f'SELECT * FROM {schema}.sos_requests WHERE id = %s', (sos_id,))
        sos = cursor.fetchone()
        if not sos:
            cursor.close(); conn.close()
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Не найдено'}), 'isBase64Encoded': False}

        cursor.execute(f'UPDATE {schema}.sos_requests SET is_resolved = TRUE, resolved_by = %s, resolved_at = NOW() WHERE id = %s', (user_id, sos_id))
        conv_id = sos['conversation_id']
        cursor.execute(f'''
            SELECT COALESCE(NULLIF(TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')), ''), nickname, name) as full_name
            FROM {schema}.users WHERE id = %s
        ''', (user_id,))
        resolver = cursor.fetchone()
        resolver_name = resolver['full_name'] if resolver else 'Пользователь'
        cursor.execute(f'INSERT INTO {schema}.messages (conversation_id, sender_id, content, is_read, created_at) VALUES (%s, %s, %s, FALSE, NOW())', (conv_id, user_id, f'✅ Проблема решена. Отметил: {resolver_name}'))
        cursor.execute(f'''
            INSERT INTO {schema}.notifications (user_id, type, title, content, related_entity_type, related_entity_id)
            VALUES (%s, 'sos_resolved', 'SOS решён', %s, 'sos', %s)
        ''', (sos['creator_id'], f'{resolver_name} отметил вашу SOS-заявку как решённую', conv_id))
        conn.commit()
        cursor.close(); conn.close()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'conversationId': conv_id}), 'isBase64Encoded': False}

    if method == 'GET' and action == 'sos-active':
        cursor.execute(f'''
            SELECT sr.id, sr.reason, sr.latitude, sr.longitude, sr.radius_km, sr.conversation_id, sr.created_at, sr.creator_id,
                   COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')), ''), u.nickname, u.name) as creator_name
            FROM {schema}.sos_requests sr
            JOIN {schema}.users u ON sr.creator_id = u.id
            JOIN {schema}.conversation_participants cp ON sr.conversation_id = cp.conversation_id
            WHERE sr.is_resolved = FALSE AND cp.user_id = %s
            ORDER BY sr.created_at DESC
        ''', (user_id,))
        rows = cursor.fetchall()
        cursor.close(); conn.close()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'requests': list(rows)}, default=str), 'isBase64Encoded': False}

    if method == 'POST' and action == 'sos-location':
        data = json.loads(event.get('body', '{}'))
        lat = float(data.get('latitude', 0))
        lon = float(data.get('longitude', 0))
        cursor.execute(f'UPDATE {schema}.users SET last_latitude = %s, last_longitude = %s WHERE id = %s', (lat, lon, user_id))
        conn.commit()
        cursor.close(); conn.close()
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}

    cursor.close()
    conn.close()
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found'}),
        'isBase64Encoded': False
    }

def format_time(dt):
    if not dt:
        return ''
    
    now = datetime.now()
    diff = now - dt
    
    if diff.days == 0:
        return dt.strftime('%H:%M')
    elif diff.days == 1:
        return 'Вчера'
    elif diff.days < 7:
        days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        return days[dt.weekday()]
    else:
        return dt.strftime('%d.%m.%Y')