import json
import os
import random
import string
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt as pyjwt
from datetime import datetime, timedelta

SCHEMA = 't_p19021063_social_connect_platf'

def verify_token(token: str) -> dict | None:
    if not token:
        return None
    try:
        jwt_secret = os.environ.get('JWT_SECRET', '')
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except Exception:
        return None

def escape_sql(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

ROLES_CONFIG = {
    4: {'mafia': 1, 'doctor': 1, 'detective': 0, 'civilian': 2},
    5: {'mafia': 1, 'doctor': 1, 'detective': 1, 'civilian': 2},
    6: {'mafia': 2, 'doctor': 1, 'detective': 1, 'civilian': 2},
    7: {'mafia': 2, 'doctor': 1, 'detective': 1, 'civilian': 3},
    8: {'mafia': 2, 'doctor': 1, 'detective': 1, 'civilian': 4},
    9: {'mafia': 3, 'doctor': 1, 'detective': 1, 'civilian': 4},
    10: {'mafia': 3, 'doctor': 1, 'detective': 1, 'civilian': 5},
}

def assign_roles(player_count):
    config = ROLES_CONFIG.get(player_count)
    if not config:
        closest = min(ROLES_CONFIG.keys(), key=lambda x: abs(x - player_count))
        config = ROLES_CONFIG[closest]
    roles = []
    for role, count in config.items():
        roles.extend([role] * count)
    while len(roles) < player_count:
        roles.append('civilian')
    roles = roles[:player_count]
    random.shuffle(roles)
    return roles

def get_auth(event):
    headers = event.get('headers', {}) or {}
    auth = (headers.get('X-Authorization') or headers.get('x-authorization')
            or headers.get('Authorization') or headers.get('authorization') or '')
    token = auth.replace('Bearer ', '') if auth else ''
    return verify_token(token)

def get_user_id(payload):
    if not payload:
        return None
    return payload.get('user_id') or payload.get('sub') or payload.get('id')

def json_response(status, body):
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }

def T(table):
    return f"{SCHEMA}.{table}"

def check_game_end(cursor, room_id):
    cursor.execute(f"SELECT role, is_alive FROM {T('mafia_players')} WHERE room_id = {room_id}")
    players = cursor.fetchall()
    alive_mafia = sum(1 for p in players if p['is_alive'] and p['role'] == 'mafia')
    alive_town = sum(1 for p in players if p['is_alive'] and p['role'] != 'mafia')
    if alive_mafia == 0:
        return 'town'
    if alive_mafia >= alive_town:
        return 'mafia'
    return None

def process_night(cursor, room_id, day_number):
    cursor.execute(f"""
        SELECT ma.action_type, ma.actor_id, ma.target_id, mp.role as actor_role
        FROM {T('mafia_actions')} ma
        JOIN {T('mafia_players')} mp ON mp.room_id = ma.room_id AND mp.user_id = ma.actor_id
        WHERE ma.room_id = {room_id} AND ma.day_number = {day_number} AND ma.phase = 'night'
    """)
    actions = cursor.fetchall()

    mafia_targets = {}
    doctor_target = None
    detective_target = None

    for a in actions:
        if a['action_type'] == 'kill' and a['target_id']:
            tid = a['target_id']
            mafia_targets[tid] = mafia_targets.get(tid, 0) + 1
        elif a['action_type'] == 'heal' and a['target_id']:
            doctor_target = a['target_id']
        elif a['action_type'] == 'check' and a['target_id']:
            detective_target = a['target_id']

    killed_id = None
    if mafia_targets:
        killed_id = max(mafia_targets, key=mafia_targets.get)
        if killed_id == doctor_target:
            cursor.execute(f"""
                INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
                VALUES ({room_id}, 'Доктор спас жителя этой ночью!', TRUE, 'night')
            """)
            killed_id = None

    if killed_id:
        cursor.execute(f"UPDATE {T('mafia_players')} SET is_alive = FALSE WHERE room_id = {room_id} AND user_id = {killed_id}")
        cursor.execute(f"SELECT first_name FROM {T('users')} WHERE id = {killed_id}")
        victim = cursor.fetchone()
        name = victim['first_name'] if victim else 'Игрок'
        cursor.execute(f"""
            INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
            VALUES ({room_id}, {escape_sql(f'Этой ночью был убит {name}')}, TRUE, 'night')
        """)
    else:
        if not mafia_targets:
            cursor.execute(f"""
                INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
                VALUES ({room_id}, 'Ночь прошла спокойно. Никто не пострадал.', TRUE, 'night')
            """)

    detective_result = None
    if detective_target:
        cursor.execute(f"SELECT role FROM {T('mafia_players')} WHERE room_id = {room_id} AND user_id = {detective_target}")
        checked = cursor.fetchone()
        if checked:
            is_mafia = checked['role'] == 'mafia'
            detective_result = {'target_id': detective_target, 'is_mafia': is_mafia}

    return killed_id, detective_result

def handler(event: dict, context) -> dict:
    '''API для онлайн-игры Мафия: лобби, комнаты, игровая логика'''
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

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')

        if method == 'GET':
            if action == 'rooms':
                cursor.execute(f"""
                    SELECT r.*, u.first_name as host_name, u.avatar_url as host_avatar,
                           (SELECT COUNT(*) FROM {T('mafia_players')} WHERE room_id = r.id) as player_count
                    FROM {T('mafia_rooms')} r
                    JOIN {T('users')} u ON r.host_id = u.id
                    WHERE r.status IN ('waiting', 'playing')
                    ORDER BY r.created_at DESC
                    LIMIT 50
                """)
                rooms = cursor.fetchall()
                return json_response(200, [dict(r) for r in rooms])

            if action == 'room':
                room_id = query_params.get('room_id')
                if not room_id:
                    return json_response(400, {'error': 'room_id required'})

                payload = get_auth(event)
                user_id = get_user_id(payload)

                cursor.execute(f"""
                    SELECT r.*, u.first_name as host_name
                    FROM {T('mafia_rooms')} r
                    JOIN {T('users')} u ON r.host_id = u.id
                    WHERE r.id = {escape_sql(room_id)}
                """)
                room = cursor.fetchone()
                if not room:
                    return json_response(404, {'error': 'Room not found'})

                cursor.execute(f"""
                    SELECT mp.*, u.first_name, u.last_name, u.avatar_url, u.nickname
                    FROM {T('mafia_players')} mp
                    JOIN {T('users')} u ON mp.user_id = u.id
                    WHERE mp.room_id = {escape_sql(room_id)}
                    ORDER BY mp.joined_at
                """)
                players = cursor.fetchall()

                my_player = None
                for p in players:
                    p_dict = dict(p)
                    if room['status'] != 'finished' and str(p_dict['user_id']) != str(user_id):
                        p_dict['role'] = None
                    if str(p_dict['user_id']) == str(user_id):
                        my_player = p_dict
                    players[players.index(p)] = p_dict

                cursor.execute(f"""
                    SELECT mm.*, u.first_name as author_name, u.avatar_url as author_avatar
                    FROM {T('mafia_messages')} mm
                    LEFT JOIN {T('users')} u ON mm.user_id = u.id
                    WHERE mm.room_id = {escape_sql(room_id)}
                    ORDER BY mm.created_at DESC
                    LIMIT 100
                """)
                messages = cursor.fetchall()
                messages.reverse()

                my_actions = []
                if user_id and room['day_number'] > 0:
                    cursor.execute(f"""
                        SELECT action_type, target_id FROM {T('mafia_actions')}
                        WHERE room_id = {escape_sql(room_id)} AND actor_id = {escape_sql(user_id)}
                          AND day_number = {room['day_number']} AND phase = {escape_sql(room['phase'])}
                    """)
                    my_actions = [dict(a) for a in cursor.fetchall()]

                return json_response(200, {
                    'room': dict(room),
                    'players': [dict(p) for p in players],
                    'messages': [dict(m) for m in messages],
                    'my_player': my_player,
                    'my_actions': my_actions
                })

            if action == 'my_rooms':
                payload = get_auth(event)
                if not payload:
                    return json_response(401, {'error': 'Unauthorized'})
                user_id = get_user_id(payload)
                cursor.execute(f"""
                    SELECT r.*, (SELECT COUNT(*) FROM {T('mafia_players')} WHERE room_id = r.id) as player_count
                    FROM {T('mafia_rooms')} r
                    JOIN {T('mafia_players')} mp ON mp.room_id = r.id
                    WHERE mp.user_id = {escape_sql(user_id)}
                    ORDER BY r.updated_at DESC
                    LIMIT 20
                """)
                rooms = cursor.fetchall()
                return json_response(200, [dict(r) for r in rooms])

        if method == 'POST':
            payload = get_auth(event)
            if not payload:
                return json_response(401, {'error': 'Unauthorized'})
            user_id = get_user_id(payload)
            if not user_id:
                return json_response(401, {'error': 'Invalid token'})
            body = json.loads(event.get('body', '{}') or '{}')

            if action == 'create':
                name = body.get('name', 'Комната')[:100]
                max_players = min(max(int(body.get('max_players', 8)), 4), 10)
                code = generate_code()

                cursor.execute(f"""
                    INSERT INTO {T('mafia_rooms')} (code, host_id, name, max_players)
                    VALUES ({escape_sql(code)}, {escape_sql(user_id)}, {escape_sql(name)}, {max_players})
                    RETURNING id
                """)
                room_id = cursor.fetchone()['id']

                cursor.execute(f"""
                    INSERT INTO {T('mafia_players')} (room_id, user_id, is_ready)
                    VALUES ({room_id}, {escape_sql(user_id)}, FALSE)
                """)

                cursor.execute(f"SELECT first_name FROM {T('users')} WHERE id = {escape_sql(user_id)}")
                u = cursor.fetchone()
                cursor.execute(f"""
                    INSERT INTO {T('mafia_messages')} (room_id, message, is_system)
                    VALUES ({room_id}, {escape_sql(f"{u['first_name'] if u else 'Игрок'} создал комнату")}, TRUE)
                """)

                conn.commit()
                return json_response(201, {'id': room_id, 'code': code})

            if action == 'join':
                code = body.get('code', '').strip().upper()
                room_id = body.get('room_id')

                if code:
                    cursor.execute(f"SELECT * FROM {T('mafia_rooms')} WHERE code = {escape_sql(code)} AND status = 'waiting'")
                elif room_id:
                    cursor.execute(f"SELECT * FROM {T('mafia_rooms')} WHERE id = {escape_sql(room_id)} AND status = 'waiting'")
                else:
                    return json_response(400, {'error': 'code or room_id required'})

                room = cursor.fetchone()
                if not room:
                    return json_response(404, {'error': 'Room not found or already started'})

                cursor.execute(f"SELECT COUNT(*) as cnt FROM {T('mafia_players')} WHERE room_id = {room['id']}")
                count = cursor.fetchone()['cnt']
                if count >= room['max_players']:
                    return json_response(400, {'error': 'Room is full'})

                cursor.execute(f"SELECT id FROM {T('mafia_players')} WHERE room_id = {room['id']} AND user_id = {escape_sql(user_id)}")
                if cursor.fetchone():
                    return json_response(200, {'id': room['id'], 'already_joined': True})

                cursor.execute(f"""
                    INSERT INTO {T('mafia_players')} (room_id, user_id) VALUES ({room['id']}, {escape_sql(user_id)})
                """)

                cursor.execute(f"SELECT first_name FROM {T('users')} WHERE id = {escape_sql(user_id)}")
                u = cursor.fetchone()
                cursor.execute(f"""
                    INSERT INTO {T('mafia_messages')} (room_id, message, is_system)
                    VALUES ({room['id']}, {escape_sql(f"{u['first_name'] if u else 'Игрок'} присоединился")}, TRUE)
                """)

                conn.commit()
                return json_response(200, {'id': room['id']})

            if action == 'ready':
                room_id = body.get('room_id')
                if not room_id:
                    return json_response(400, {'error': 'room_id required'})

                cursor.execute(f"""
                    UPDATE {T('mafia_players')} SET is_ready = NOT is_ready
                    WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
                """)
                conn.commit()
                return json_response(200, {'ok': True})

            if action == 'start':
                room_id = body.get('room_id')
                if not room_id:
                    return json_response(400, {'error': 'room_id required'})

                cursor.execute(f"SELECT * FROM {T('mafia_rooms')} WHERE id = {escape_sql(room_id)} AND host_id = {escape_sql(user_id)} AND status = 'waiting'")
                room = cursor.fetchone()
                if not room:
                    return json_response(403, {'error': 'Not host or already started'})

                cursor.execute(f"SELECT * FROM {T('mafia_players')} WHERE room_id = {room_id}")
                players = cursor.fetchall()
                if len(players) < 4:
                    return json_response(400, {'error': 'Minimum 4 players required'})

                not_ready = [p for p in players if not p['is_ready'] and str(p['user_id']) != str(user_id)]
                if not_ready:
                    return json_response(400, {'error': 'Not all players are ready'})

                roles = assign_roles(len(players))
                for i, p in enumerate(players):
                    cursor.execute(f"""
                        UPDATE {T('mafia_players')} SET role = {escape_sql(roles[i])}
                        WHERE id = {p['id']}
                    """)

                phase_end = datetime.utcnow() + timedelta(seconds=60)
                cursor.execute(f"""
                    UPDATE {T('mafia_rooms')} SET status = 'playing', phase = 'night', day_number = 1,
                           phase_end_at = {escape_sql(phase_end.isoformat())},
                           updated_at = CURRENT_TIMESTAMP
                    WHERE id = {room_id}
                """)

                cursor.execute(f"""
                    INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
                    VALUES ({room_id}, 'Игра началась! Город засыпает... Мафия просыпается.', TRUE, 'night')
                """)

                conn.commit()
                return json_response(200, {'ok': True})

            if action == 'action':
                room_id = body.get('room_id')
                target_id = body.get('target_id')
                action_type = body.get('action_type')

                if not room_id or not action_type:
                    return json_response(400, {'error': 'room_id and action_type required'})

                cursor.execute(f"SELECT * FROM {T('mafia_rooms')} WHERE id = {escape_sql(room_id)} AND status = 'playing'")
                room = cursor.fetchone()
                if not room:
                    return json_response(404, {'error': 'Game not found'})

                cursor.execute(f"SELECT * FROM {T('mafia_players')} WHERE room_id = {room_id} AND user_id = {escape_sql(user_id)} AND is_alive = TRUE")
                player = cursor.fetchone()
                if not player:
                    return json_response(403, {'error': 'Not in game or dead'})

                phase = room['phase']
                day_num = room['day_number']

                if phase == 'night':
                    if player['role'] == 'mafia' and action_type == 'kill':
                        pass
                    elif player['role'] == 'doctor' and action_type == 'heal':
                        pass
                    elif player['role'] == 'detective' and action_type == 'check':
                        pass
                    else:
                        return json_response(403, {'error': 'Invalid action for your role'})

                elif phase == 'day':
                    if action_type != 'vote':
                        return json_response(403, {'error': 'Only voting during day'})
                else:
                    return json_response(400, {'error': 'Invalid phase'})

                cursor.execute(f"""
                    SELECT id FROM {T('mafia_actions')}
                    WHERE room_id = {room_id} AND actor_id = {escape_sql(user_id)}
                      AND day_number = {day_num} AND phase = {escape_sql(phase)} AND action_type = {escape_sql(action_type)}
                """)
                existing = cursor.fetchone()
                if existing:
                    cursor.execute(f"""
                        UPDATE {T('mafia_actions')} SET target_id = {escape_sql(target_id)}
                        WHERE id = {existing['id']}
                    """)
                else:
                    cursor.execute(f"""
                        INSERT INTO {T('mafia_actions')} (room_id, day_number, phase, actor_id, target_id, action_type)
                        VALUES ({room_id}, {day_num}, {escape_sql(phase)}, {escape_sql(user_id)}, {escape_sql(target_id)}, {escape_sql(action_type)})
                    """)

                conn.commit()
                return json_response(200, {'ok': True})

            if action == 'next_phase':
                room_id = body.get('room_id')
                if not room_id:
                    return json_response(400, {'error': 'room_id required'})

                cursor.execute(f"SELECT * FROM {T('mafia_rooms')} WHERE id = {escape_sql(room_id)} AND status = 'playing'")
                room = cursor.fetchone()
                if not room:
                    return json_response(404, {'error': 'Game not found'})

                phase = room['phase']
                day_num = room['day_number']

                if phase == 'night':
                    killed_id, detective_result = process_night(cursor, room_id, day_num)

                    winner = check_game_end(cursor, room_id)
                    if winner:
                        w_text = 'Мирные жители победили!' if winner == 'town' else 'Мафия победила!'
                        cursor.execute(f"""
                            UPDATE {T('mafia_rooms')} SET status = 'finished', winner = {escape_sql(winner)},
                                   phase = NULL, updated_at = CURRENT_TIMESTAMP
                            WHERE id = {room_id}
                        """)
                        cursor.execute(f"""
                            INSERT INTO {T('mafia_messages')} (room_id, message, is_system)
                            VALUES ({room_id}, {escape_sql(w_text)}, TRUE)
                        """)
                        conn.commit()
                        return json_response(200, {'ok': True, 'winner': winner, 'detective_result': detective_result})

                    phase_end = datetime.utcnow() + timedelta(seconds=90)
                    cursor.execute(f"""
                        UPDATE {T('mafia_rooms')} SET phase = 'day', phase_end_at = {escape_sql(phase_end.isoformat())},
                               updated_at = CURRENT_TIMESTAMP
                        WHERE id = {room_id}
                    """)
                    cursor.execute(f"""
                        INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
                        VALUES ({room_id}, 'Наступил день. Обсуждайте и голосуйте!', TRUE, 'day')
                    """)

                    conn.commit()
                    return json_response(200, {'ok': True, 'detective_result': detective_result})

                elif phase == 'day':
                    cursor.execute(f"""
                        SELECT target_id, COUNT(*) as votes FROM {T('mafia_actions')}
                        WHERE room_id = {room_id} AND day_number = {day_num} AND phase = 'day' AND action_type = 'vote'
                          AND target_id IS NOT NULL
                        GROUP BY target_id ORDER BY votes DESC LIMIT 1
                    """)
                    result = cursor.fetchone()

                    if result and result['votes'] > 0:
                        voted_out = result['target_id']
                        cursor.execute(f"UPDATE {T('mafia_players')} SET is_alive = FALSE WHERE room_id = {room_id} AND user_id = {voted_out}")
                        cursor.execute(f"SELECT first_name FROM {T('users')} WHERE id = {voted_out}")
                        v = cursor.fetchone()
                        cursor.execute(f"SELECT role FROM {T('mafia_players')} WHERE room_id = {room_id} AND user_id = {voted_out}")
                        role_data = cursor.fetchone()
                        role_name = {'mafia': 'Мафия', 'doctor': 'Доктор', 'detective': 'Детектив', 'civilian': 'Мирный'}.get(role_data['role'], 'Неизвестный') if role_data else '?'
                        cursor.execute(f"""
                            INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
                            VALUES ({room_id}, {escape_sql(f"Город решил казнить {v['first_name'] if v else 'игрока'}. Роль: {role_name}")}, TRUE, 'day')
                        """)
                    else:
                        cursor.execute(f"""
                            INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
                            VALUES ({room_id}, 'Город не пришёл к решению. Никто не казнён.', TRUE, 'day')
                        """)

                    winner = check_game_end(cursor, room_id)
                    if winner:
                        w_text = 'Мирные жители победили!' if winner == 'town' else 'Мафия победила!'
                        cursor.execute(f"""
                            UPDATE {T('mafia_rooms')} SET status = 'finished', winner = {escape_sql(winner)},
                                   phase = NULL, updated_at = CURRENT_TIMESTAMP
                            WHERE id = {room_id}
                        """)
                        cursor.execute(f"""
                            INSERT INTO {T('mafia_messages')} (room_id, message, is_system)
                            VALUES ({room_id}, {escape_sql(w_text)}, TRUE)
                        """)
                        conn.commit()
                        return json_response(200, {'ok': True, 'winner': winner})

                    new_day = day_num + 1
                    phase_end = datetime.utcnow() + timedelta(seconds=60)
                    cursor.execute(f"""
                        UPDATE {T('mafia_rooms')} SET phase = 'night', day_number = {new_day},
                               phase_end_at = {escape_sql(phase_end.isoformat())},
                               updated_at = CURRENT_TIMESTAMP
                        WHERE id = {room_id}
                    """)
                    cursor.execute(f"""
                        INSERT INTO {T('mafia_messages')} (room_id, message, is_system, phase)
                        VALUES ({room_id}, {escape_sql(f'Наступила ночь {new_day}. Город засыпает...')}, TRUE, 'night')
                    """)

                    conn.commit()
                    return json_response(200, {'ok': True})

            if action == 'chat':
                room_id = body.get('room_id')
                message = body.get('message', '').strip()[:500]
                if not room_id or not message:
                    return json_response(400, {'error': 'room_id and message required'})

                cursor.execute(f"SELECT * FROM {T('mafia_rooms')} WHERE id = {escape_sql(room_id)}")
                room = cursor.fetchone()
                if not room:
                    return json_response(404, {'error': 'Room not found'})

                cursor.execute(f"SELECT * FROM {T('mafia_players')} WHERE room_id = {room_id} AND user_id = {escape_sql(user_id)}")
                player = cursor.fetchone()
                if not player:
                    return json_response(403, {'error': 'Not in room'})

                if room['status'] == 'playing' and room['phase'] == 'night' and player['is_alive']:
                    if player['role'] != 'mafia':
                        return json_response(403, {'error': 'Only mafia can chat at night'})

                cursor.execute(f"""
                    INSERT INTO {T('mafia_messages')} (room_id, user_id, message, phase)
                    VALUES ({room_id}, {escape_sql(user_id)}, {escape_sql(message)}, {escape_sql(room.get('phase'))})
                    RETURNING id
                """)
                msg_id = cursor.fetchone()['id']
                conn.commit()
                return json_response(201, {'id': msg_id})

            if action == 'leave':
                room_id = body.get('room_id')
                if not room_id:
                    return json_response(400, {'error': 'room_id required'})

                cursor.execute(f"SELECT * FROM {T('mafia_rooms')} WHERE id = {escape_sql(room_id)}")
                room = cursor.fetchone()
                if not room:
                    return json_response(404, {'error': 'Room not found'})

                if room['status'] == 'playing':
                    cursor.execute(f"UPDATE {T('mafia_players')} SET is_alive = FALSE WHERE room_id = {room_id} AND user_id = {escape_sql(user_id)}")
                else:
                    cursor.execute(f"DELETE FROM {T('mafia_players')} WHERE room_id = {room_id} AND user_id = {escape_sql(user_id)}")
                    cursor.execute(f"SELECT COUNT(*) as cnt FROM {T('mafia_players')} WHERE room_id = {room_id}")
                    cnt = cursor.fetchone()['cnt']
                    if cnt == 0:
                        cursor.execute(f"UPDATE {T('mafia_rooms')} SET status = 'finished' WHERE id = {room_id}")

                conn.commit()
                return json_response(200, {'ok': True})

        return json_response(404, {'error': 'Unknown action'})

    except Exception as e:
        conn.rollback()
        print(f'MAFIA ERROR: {e}')
        return json_response(500, {'error': str(e)})
    finally:
        cursor.close()
        conn.close()
