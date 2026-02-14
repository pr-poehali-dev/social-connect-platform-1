import json
import os
import random
import string
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt as pyjwt
from datetime import datetime, timedelta

SCHEMA = 't_p19021063_social_connect_platf'

SUITS = ['h', 'd', 'c', 's']
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
RANK_VALUES = {r: i for i, r in enumerate(RANKS)}
HAND_RANKINGS = {
    'Royal Flush': 9, 'Straight Flush': 8, 'Four of a Kind': 7,
    'Full House': 6, 'Flush': 5, 'Straight': 4, 'Three of a Kind': 3,
    'Two Pair': 2, 'One Pair': 1, 'High Card': 0
}

def make_deck():
    deck = [r + s for s in SUITS for r in RANKS]
    random.shuffle(deck)
    return deck

def parse_cards(s):
    if not s:
        return []
    return s.split(',')

def cards_to_str(cards):
    return ','.join(cards)

def evaluate_hand(cards):
    if len(cards) < 5:
        return ('High Card', (0,))
    best = None
    from itertools import combinations
    for combo in combinations(cards, 5):
        result = _eval_five(list(combo))
        if best is None or result[1] > best[1]:
            best = result
    return best

def _eval_five(cards):
    ranks = sorted([RANK_VALUES[c[0]] for c in cards], reverse=True)
    suits = [c[1] for c in cards]
    is_flush = len(set(suits)) == 1
    is_straight = False
    straight_high = 0

    unique_ranks = sorted(set(ranks), reverse=True)
    if len(unique_ranks) == 5:
        if unique_ranks[0] - unique_ranks[4] == 4:
            is_straight = True
            straight_high = unique_ranks[0]
        if unique_ranks == [12, 3, 2, 1, 0]:
            is_straight = True
            straight_high = 3

    counts = {}
    for r in ranks:
        counts[r] = counts.get(r, 0) + 1
    groups = sorted(counts.items(), key=lambda x: (x[1], x[0]), reverse=True)

    if is_flush and is_straight:
        if straight_high == 12:
            return ('Royal Flush', (9, 12))
        return ('Straight Flush', (8, straight_high))
    if groups[0][1] == 4:
        return ('Four of a Kind', (7, groups[0][0], groups[1][0]))
    if groups[0][1] == 3 and groups[1][1] == 2:
        return ('Full House', (6, groups[0][0], groups[1][0]))
    if is_flush:
        return ('Flush', (5,) + tuple(ranks))
    if is_straight:
        return ('Straight', (4, straight_high))
    if groups[0][1] == 3:
        kickers = sorted([g[0] for g in groups[1:]], reverse=True)
        return ('Three of a Kind', (3, groups[0][0]) + tuple(kickers))
    if groups[0][1] == 2 and groups[1][1] == 2:
        pairs = sorted([groups[0][0], groups[1][0]], reverse=True)
        kicker = [g[0] for g in groups if g[1] == 1]
        return ('Two Pair', (2, pairs[0], pairs[1], kicker[0] if kicker else 0))
    if groups[0][1] == 2:
        kickers = sorted([g[0] for g in groups[1:]], reverse=True)
        return ('One Pair', (1, groups[0][0]) + tuple(kickers))
    return ('High Card', (0,) + tuple(ranks))


def verify_token(token):
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

def get_auth(event):
    headers = event.get('headers', {}) or {}
    auth = (headers.get('X-Authorization') or headers.get('x-authorization')
            or headers.get('Authorization') or headers.get('authorization') or '')
    token = auth.replace('Bearer ', '') if auth else ''
    return verify_token(token)

def json_response(status, body):
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)

def get_user_id(payload):
    return payload.get('user_id') or payload.get('sub')

def get_user_balance(cur, user_id):
    cur.execute(f"SELECT COALESCE(balance, 0) + COALESCE(bonus_balance, 0) AS total FROM {SCHEMA}.users WHERE id = {escape_sql(user_id)}")
    row = cur.fetchone()
    return float(row['total']) if row else 0

def deduct_love(cur, user_id, amount):
    cur.execute(f"SELECT COALESCE(balance, 0) AS bal, COALESCE(bonus_balance, 0) AS bonus FROM {SCHEMA}.users WHERE id = {escape_sql(user_id)}")
    row = cur.fetchone()
    if not row:
        return False
    bal = float(row['bal'])
    bonus = float(row['bonus'])
    total = bal + bonus
    if total < amount:
        return False
    from_bonus = min(bonus, amount)
    from_main = amount - from_bonus
    cur.execute(f"""
        UPDATE {SCHEMA}.users
        SET balance = balance - {escape_sql(from_main)}, bonus_balance = bonus_balance - {escape_sql(from_bonus)}
        WHERE id = {escape_sql(user_id)}
    """)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.transactions (user_id, amount, type, status, description)
        VALUES ({escape_sql(user_id)}, {escape_sql(-amount)}, 'game_buyin', 'completed', 'Покер: buy-in')
    """)
    return True

def credit_love(cur, user_id, amount):
    if amount <= 0:
        return
    cur.execute(f"""
        UPDATE {SCHEMA}.users SET balance = balance + {escape_sql(amount)}
        WHERE id = {escape_sql(user_id)}
    """)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.transactions (user_id, amount, type, status, description)
        VALUES ({escape_sql(user_id)}, {escape_sql(amount)}, 'game_cashout', 'completed', 'Покер: выигрыш')
    """)

def handler(event, context):
    """Покер Texas Hold'em — создание комнат, подключение, игровой процесс. Ставки в LOVE токенах."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    qs = event.get('queryStringParameters', {}) or {}
    action = qs.get('action', '')

    if action == 'rooms':
        return handle_rooms()
    elif action == 'create':
        return handle_create(event)
    elif action == 'join':
        return handle_join(event)
    elif action == 'room':
        return handle_room(event, qs)
    elif action == 'ready':
        return handle_ready(event)
    elif action == 'start':
        return handle_start(event)
    elif action == 'action':
        return handle_action(event)
    elif action == 'chat':
        return handle_chat(event)
    elif action == 'leave':
        return handle_leave(event)
    elif action == 'balance':
        return handle_balance(event)

    return json_response(200, {'status': 'poker-api', 'actions': ['rooms', 'create', 'join', 'room', 'ready', 'start', 'action', 'chat', 'leave', 'balance']})

def handle_balance(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT COALESCE(balance, 0) AS balance, COALESCE(bonus_balance, 0) AS bonus_balance FROM {SCHEMA}.users WHERE id = {escape_sql(user_id)}")
    row = cur.fetchone()
    conn.close()
    if not row:
        return json_response(404, {'error': 'Пользователь не найден'})
    return json_response(200, {
        'balance': float(row['balance']),
        'bonus_balance': float(row['bonus_balance']),
        'total': float(row['balance']) + float(row['bonus_balance'])
    })

def handle_rooms():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"""
        SELECT r.id, r.code, r.name, r.max_players, r.small_blind, r.big_blind,
               r.start_chips, r.buy_in, r.status, r.created_at,
               u.first_name || ' ' || COALESCE(u.last_name, '') AS host_name,
               u.avatar_url AS host_avatar,
               (SELECT COUNT(*) FROM {SCHEMA}.poker_players pp WHERE pp.room_id = r.id AND pp.is_active = TRUE) AS player_count
        FROM {SCHEMA}.poker_rooms r
        JOIN {SCHEMA}.users u ON u.id = r.host_id
        WHERE r.status IN ('waiting', 'playing')
        ORDER BY r.created_at DESC
        LIMIT 50
    """)
    rooms = cur.fetchall()
    conn.close()
    return json_response(200, rooms)

def handle_create(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    body = json.loads(event.get('body', '{}') or '{}')
    name = body.get('name', 'Покер').strip()[:100]
    max_players = min(max(int(body.get('max_players', 8)), 2), 8)
    small_blind = max(int(body.get('small_blind', 10)), 1)
    big_blind = max(int(body.get('big_blind', small_blind * 2)), small_blind * 2)
    buy_in = max(int(body.get('buy_in', 100)), big_blind * 5)
    start_chips = buy_in
    code = generate_code()

    conn = get_conn()
    cur = conn.cursor()

    user_bal = get_user_balance(cur, user_id)
    if user_bal < buy_in:
        conn.close()
        return json_response(400, {'error': f'Недостаточно LOVE токенов. Нужно {buy_in}, у вас {int(user_bal)}'})

    if not deduct_love(cur, user_id, buy_in):
        conn.close()
        return json_response(400, {'error': 'Не удалось списать LOVE токены'})

    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_rooms (code, host_id, name, max_players, small_blind, big_blind, start_chips, buy_in)
        VALUES ({escape_sql(code)}, {escape_sql(user_id)}, {escape_sql(name)},
                {escape_sql(max_players)}, {escape_sql(small_blind)}, {escape_sql(big_blind)}, 
                {escape_sql(start_chips)}, {escape_sql(buy_in)})
        RETURNING id
    """)
    room_id = cur.fetchone()['id']
    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_players (room_id, user_id, seat, chips, love_invested)
        VALUES ({escape_sql(room_id)}, {escape_sql(user_id)}, 0, {escape_sql(start_chips)}, {escape_sql(buy_in)})
    """)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
        VALUES ({escape_sql(room_id)}, {escape_sql('Комната создана. Buy-in: ' + str(buy_in) + ' LOVE')}, TRUE)
    """)
    conn.commit()
    conn.close()
    return json_response(200, {'id': room_id, 'code': code})

def handle_join(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    body = json.loads(event.get('body', '{}') or '{}')
    code = body.get('code', '').strip().upper()
    room_id = body.get('room_id')

    conn = get_conn()
    cur = conn.cursor()

    if room_id:
        cur.execute(f"SELECT * FROM {SCHEMA}.poker_rooms WHERE id = {escape_sql(room_id)} AND status = 'waiting'")
    else:
        cur.execute(f"SELECT * FROM {SCHEMA}.poker_rooms WHERE code = {escape_sql(code)} AND status IN ('waiting', 'playing')")
    room = cur.fetchone()
    if not room:
        conn.close()
        return json_response(404, {'error': 'Комната не найдена'})

    cur.execute(f"SELECT * FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room['id'])} AND user_id = {escape_sql(user_id)}")
    existing = cur.fetchone()
    if existing:
        conn.close()
        return json_response(200, {'id': room['id']})

    cur.execute(f"SELECT COUNT(*) AS cnt FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room['id'])} AND is_active = TRUE")
    count = cur.fetchone()['cnt']
    if count >= room['max_players']:
        conn.close()
        return json_response(400, {'error': 'Комната заполнена'})

    buy_in = room['buy_in']
    user_bal = get_user_balance(cur, user_id)
    if user_bal < buy_in:
        conn.close()
        return json_response(400, {'error': f'Недостаточно LOVE токенов. Buy-in: {buy_in}, у вас {int(user_bal)}'})

    if not deduct_love(cur, user_id, buy_in):
        conn.close()
        return json_response(400, {'error': 'Не удалось списать LOVE токены'})

    cur.execute(f"SELECT seat FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room['id'])} ORDER BY seat")
    taken_seats = [r['seat'] for r in cur.fetchall()]
    next_seat = 0
    for i in range(room['max_players']):
        if i not in taken_seats:
            next_seat = i
            break

    cur.execute(f"SELECT first_name FROM {SCHEMA}.users WHERE id = {escape_sql(user_id)}")
    user = cur.fetchone()
    player_name = user['first_name'] if user else 'Игрок'

    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_players (room_id, user_id, seat, chips, love_invested)
        VALUES ({escape_sql(room['id'])}, {escape_sql(user_id)}, {escape_sql(next_seat)}, {escape_sql(room['start_chips'])}, {escape_sql(buy_in)})
    """)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
        VALUES ({escape_sql(room['id'])}, {escape_sql(player_name + ' присоединился (buy-in: ' + str(buy_in) + ' LOVE)')}, TRUE)
    """)
    conn.commit()
    conn.close()
    return json_response(200, {'id': room['id']})

def handle_room(event, qs):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    room_id = qs.get('room_id')
    if not room_id:
        return json_response(400, {'error': 'room_id required'})

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"""
        SELECT r.*, u.first_name || ' ' || COALESCE(u.last_name, '') AS host_name
        FROM {SCHEMA}.poker_rooms r
        JOIN {SCHEMA}.users u ON u.id = r.host_id
        WHERE r.id = {escape_sql(room_id)}
    """)
    room = cur.fetchone()
    if not room:
        conn.close()
        return json_response(404, {'error': 'Комната не найдена'})

    cur.execute(f"""
        SELECT pp.*, u.first_name, u.last_name, u.avatar_url, u.nickname
        FROM {SCHEMA}.poker_players pp
        JOIN {SCHEMA}.users u ON u.id = pp.user_id
        WHERE pp.room_id = {escape_sql(room_id)}
        ORDER BY pp.seat
    """)
    players = cur.fetchall()

    my_player = None
    for p in players:
        if str(p['user_id']) == str(user_id):
            my_player = dict(p)

    players_out = []
    for p in players:
        pd = dict(p)
        if str(p['user_id']) != str(user_id):
            pd['hole_cards'] = None
        players_out.append(pd)

    game = None
    cur.execute(f"""
        SELECT * FROM {SCHEMA}.poker_games
        WHERE room_id = {escape_sql(room_id)}
        ORDER BY id DESC LIMIT 1
    """)
    game_row = cur.fetchone()
    if game_row:
        game = dict(game_row)

    cur.execute(f"""
        SELECT pm.*, u.first_name AS author_name, u.avatar_url AS author_avatar
        FROM {SCHEMA}.poker_messages pm
        LEFT JOIN {SCHEMA}.users u ON u.id = pm.user_id
        WHERE pm.room_id = {escape_sql(room_id)}
        ORDER BY pm.id DESC LIMIT 100
    """)
    messages = list(reversed(cur.fetchall()))

    conn.close()
    return json_response(200, {
        'room': room,
        'players': players_out,
        'my_player': my_player,
        'game': game,
        'messages': messages,
    })

def handle_ready(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    body = json.loads(event.get('body', '{}') or '{}')
    room_id = body.get('room_id')

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"""
        UPDATE {SCHEMA}.poker_players
        SET is_ready = NOT is_ready
        WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
    """)
    conn.commit()
    conn.close()
    return json_response(200, {'ok': True})

def handle_start(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    body = json.loads(event.get('body', '{}') or '{}')
    room_id = body.get('room_id')

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM {SCHEMA}.poker_rooms WHERE id = {escape_sql(room_id)}")
    room = cur.fetchone()
    if not room or str(room['host_id']) != str(user_id):
        conn.close()
        return json_response(403, {'error': 'Только хост может начать'})
    if room['status'] != 'waiting':
        conn.close()
        return json_response(400, {'error': 'Игра уже начата'})

    cur.execute(f"SELECT * FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room_id)} AND is_active = TRUE ORDER BY seat")
    players = cur.fetchall()
    if len(players) < 2:
        conn.close()
        return json_response(400, {'error': 'Нужно минимум 2 игрока'})

    cur.execute(f"UPDATE {SCHEMA}.poker_rooms SET status = 'playing' WHERE id = {escape_sql(room_id)}")
    start_new_hand(cur, room_id, room, players)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
        VALUES ({escape_sql(room_id)}, 'Игра началась! Раздаём карты...', TRUE)
    """)
    conn.commit()
    conn.close()
    return json_response(200, {'ok': True})

def start_new_hand(cur, room_id, room, players):
    deck = make_deck()
    active_players = [p for p in players if p['is_active'] and p['chips'] > 0]
    if len(active_players) < 2:
        cur.execute(f"UPDATE {SCHEMA}.poker_rooms SET status = 'finished' WHERE id = {escape_sql(room_id)}")
        winner = active_players[0] if active_players else None
        if winner:
            cur.execute(f"SELECT first_name FROM {SCHEMA}.users WHERE id = {escape_sql(winner['user_id'])}")
            w = cur.fetchone()
            cashout_amount = winner['chips']
            credit_love(cur, winner['user_id'], cashout_amount)
            cur.execute(f"""
                INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
                VALUES ({escape_sql(room_id)}, {escape_sql((w['first_name'] if w else 'Игрок') + ' победил в турнире! Выигрыш: ' + str(int(cashout_amount)) + ' LOVE')}, TRUE)
            """)
        for p in players:
            if p['is_active'] and p != winner and p['chips'] > 0:
                credit_love(cur, p['user_id'], p['chips'])
        return

    cur.execute(f"""
        SELECT COALESCE(MAX(dealer_seat), -1) AS ds FROM {SCHEMA}.poker_games WHERE room_id = {escape_sql(room_id)}
    """)
    last_dealer = cur.fetchone()['ds']
    seats = sorted([p['seat'] for p in active_players])
    dealer_idx = 0
    for i, s in enumerate(seats):
        if s > last_dealer:
            dealer_idx = i
            break

    dealer_seat = seats[dealer_idx]
    sb_seat = seats[(dealer_idx + 1) % len(seats)]
    bb_seat = seats[(dealer_idx + 2) % len(seats)]

    sb = room['small_blind']
    bb = room['big_blind']

    for p in active_players:
        cards = deck.pop() + ',' + deck.pop()
        bet = 0
        if p['seat'] == sb_seat:
            bet = min(sb, p['chips'])
        elif p['seat'] == bb_seat:
            bet = min(bb, p['chips'])
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_players
            SET hole_cards = {escape_sql(cards)}, is_folded = FALSE, current_bet = {escape_sql(bet)},
                chips = chips - {escape_sql(bet)}
            WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(p['user_id'])}
        """)

    pot = 0
    for p in active_players:
        if p['seat'] == sb_seat:
            pot += min(sb, p['chips'])
        elif p['seat'] == bb_seat:
            pot += min(bb, p['chips'])

    first_turn_idx = (dealer_idx + 3) % len(seats)
    first_turn = seats[first_turn_idx]

    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_games (room_id, dealer_seat, current_turn_seat, phase, community_cards, pot, current_bet, deck, turn_end_at)
        VALUES ({escape_sql(room_id)}, {escape_sql(dealer_seat)}, {escape_sql(first_turn)}, 'preflop',
                '', {escape_sql(pot)}, {escape_sql(bb)}, {escape_sql(cards_to_str(deck))},
                NOW() + INTERVAL '30 seconds')
    """)

def handle_action(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    body = json.loads(event.get('body', '{}') or '{}')
    room_id = body.get('room_id')
    action_type = body.get('action_type', '')
    amount = int(body.get('amount', 0))

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM {SCHEMA}.poker_rooms WHERE id = {escape_sql(room_id)} AND status = 'playing'")
    room = cur.fetchone()
    if not room:
        conn.close()
        return json_response(400, {'error': 'Комната не в игре'})

    cur.execute(f"""
        SELECT * FROM {SCHEMA}.poker_games WHERE room_id = {escape_sql(room_id)} ORDER BY id DESC LIMIT 1
    """)
    game = cur.fetchone()
    if not game:
        conn.close()
        return json_response(400, {'error': 'Нет активной раздачи'})

    cur.execute(f"""
        SELECT * FROM {SCHEMA}.poker_players
        WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
    """)
    player = cur.fetchone()
    if not player:
        conn.close()
        return json_response(400, {'error': 'Вы не в игре'})

    if player['seat'] != game['current_turn_seat']:
        conn.close()
        return json_response(400, {'error': 'Не ваш ход'})

    if player['is_folded']:
        conn.close()
        return json_response(400, {'error': 'Вы сбросили карты'})

    cur.execute(f"SELECT first_name FROM {SCHEMA}.users WHERE id = {escape_sql(user_id)}")
    user_row = cur.fetchone()
    player_name = user_row['first_name'] if user_row else 'Игрок'

    cur.execute(f"""
        SELECT * FROM {SCHEMA}.poker_players
        WHERE room_id = {escape_sql(room_id)} AND is_active = TRUE AND is_folded = FALSE
        ORDER BY seat
    """)
    active_players = cur.fetchall()
    active_seats = [p['seat'] for p in active_players]

    if action_type == 'fold':
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_players SET is_folded = TRUE
            WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
        """)
        cur.execute(f"""
            INSERT INTO {SCHEMA}.poker_messages (room_id, user_id, message, is_system)
            VALUES ({escape_sql(room_id)}, {escape_sql(user_id)}, {escape_sql(player_name + ' сбросил карты')}, TRUE)
        """)
        remaining = [s for s in active_seats if s != player['seat']]
        if len(remaining) == 1:
            winner_seat = remaining[0]
            winner_player = next(p for p in active_players if p['seat'] == winner_seat)
            cur.execute(f"""
                UPDATE {SCHEMA}.poker_players SET chips = chips + {escape_sql(game['pot'])}
                WHERE room_id = {escape_sql(room_id)} AND seat = {escape_sql(winner_seat)}
            """)
            cur.execute(f"SELECT first_name FROM {SCHEMA}.users WHERE id = {escape_sql(winner_player['user_id'])}")
            wn = cur.fetchone()
            cur.execute(f"""
                UPDATE {SCHEMA}.poker_games SET finished_at = NOW(), winner_id = {escape_sql(winner_player['user_id'])}
                WHERE id = {escape_sql(game['id'])}
            """)
            cur.execute(f"""
                INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
                VALUES ({escape_sql(room_id)}, {escape_sql((wn['first_name'] if wn else 'Игрок') + ' забирает банк ' + str(game['pot']) + ' фишек!')}, TRUE)
            """)
            cur.execute(f"SELECT * FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room_id)} AND is_active = TRUE ORDER BY seat")
            all_p = cur.fetchall()
            start_new_hand(cur, room_id, room, all_p)
            conn.commit()
            conn.close()
            return json_response(200, {'ok': True})
        else:
            advance_turn(cur, room_id, game, player['seat'], active_seats)

    elif action_type == 'call':
        call_amount = game['current_bet'] - player['current_bet']
        call_amount = min(call_amount, player['chips'])
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_players
            SET chips = chips - {escape_sql(call_amount)}, current_bet = current_bet + {escape_sql(call_amount)}
            WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
        """)
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_games SET pot = pot + {escape_sql(call_amount)} WHERE id = {escape_sql(game['id'])}
        """)
        cur.execute(f"""
            INSERT INTO {SCHEMA}.poker_messages (room_id, user_id, message, is_system)
            VALUES ({escape_sql(room_id)}, {escape_sql(user_id)}, {escape_sql(player_name + ' уравнял ' + str(call_amount))}, TRUE)
        """)
        advance_turn(cur, room_id, game, player['seat'], active_seats)

    elif action_type == 'check':
        if player['current_bet'] < game['current_bet']:
            conn.close()
            return json_response(400, {'error': 'Нельзя чекнуть, нужно уравнять'})
        cur.execute(f"""
            INSERT INTO {SCHEMA}.poker_messages (room_id, user_id, message, is_system)
            VALUES ({escape_sql(room_id)}, {escape_sql(user_id)}, {escape_sql(player_name + ' чек')}, TRUE)
        """)
        advance_turn(cur, room_id, game, player['seat'], active_seats)

    elif action_type == 'raise':
        min_raise = game['current_bet'] * 2
        raise_to = max(amount, min_raise)
        raise_cost = raise_to - player['current_bet']
        raise_cost = min(raise_cost, player['chips'])
        actual_bet = player['current_bet'] + raise_cost
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_players
            SET chips = chips - {escape_sql(raise_cost)}, current_bet = {escape_sql(actual_bet)}
            WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
        """)
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_games SET pot = pot + {escape_sql(raise_cost)}, current_bet = {escape_sql(actual_bet)}
            WHERE id = {escape_sql(game['id'])}
        """)
        cur.execute(f"""
            INSERT INTO {SCHEMA}.poker_messages (room_id, user_id, message, is_system)
            VALUES ({escape_sql(room_id)}, {escape_sql(user_id)}, {escape_sql(player_name + ' повысил до ' + str(actual_bet))}, TRUE)
        """)
        advance_turn(cur, room_id, game, player['seat'], active_seats, raised=True)

    elif action_type == 'allin':
        allin_amount = player['chips']
        new_bet = player['current_bet'] + allin_amount
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_players
            SET chips = 0, current_bet = {escape_sql(new_bet)}
            WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
        """)
        if new_bet > game['current_bet']:
            cur.execute(f"""
                UPDATE {SCHEMA}.poker_games SET pot = pot + {escape_sql(allin_amount)}, current_bet = {escape_sql(new_bet)}
                WHERE id = {escape_sql(game['id'])}
            """)
        else:
            cur.execute(f"""
                UPDATE {SCHEMA}.poker_games SET pot = pot + {escape_sql(allin_amount)}
                WHERE id = {escape_sql(game['id'])}
            """)
        cur.execute(f"""
            INSERT INTO {SCHEMA}.poker_messages (room_id, user_id, message, is_system)
            VALUES ({escape_sql(room_id)}, {escape_sql(user_id)}, {escape_sql(player_name + ' ва-банк! ' + str(allin_amount))}, TRUE)
        """)
        advance_turn(cur, room_id, game, player['seat'], active_seats, raised=(new_bet > game['current_bet']))
    else:
        conn.close()
        return json_response(400, {'error': 'Неизвестное действие'})

    conn.commit()
    conn.close()
    return json_response(200, {'ok': True})

def advance_turn(cur, room_id, game, current_seat, active_seats, raised=False):
    cur.execute(f"""
        SELECT * FROM {SCHEMA}.poker_players
        WHERE room_id = {escape_sql(room_id)} AND is_active = TRUE AND is_folded = FALSE
        ORDER BY seat
    """)
    remaining = cur.fetchall()
    remaining_seats = [p['seat'] for p in remaining]

    if len(remaining_seats) <= 1:
        return

    cur.execute(f"SELECT * FROM {SCHEMA}.poker_games WHERE room_id = {escape_sql(room_id)} ORDER BY id DESC LIMIT 1")
    game = cur.fetchone()

    idx = remaining_seats.index(current_seat) if current_seat in remaining_seats else 0
    next_idx = (idx + 1) % len(remaining_seats)
    next_seat = remaining_seats[next_idx]

    all_equal = all(p['current_bet'] == game['current_bet'] or p['chips'] == 0 for p in remaining)
    round_complete = all_equal and not raised

    if round_complete and next_seat == remaining_seats[0]:
        advance_phase(cur, room_id, game, remaining)
    elif round_complete:
        check_all = True
        for p in remaining:
            if p['current_bet'] != game['current_bet'] and p['chips'] > 0:
                check_all = False
                break
        if check_all:
            advance_phase(cur, room_id, game, remaining)
        else:
            cur.execute(f"""
                UPDATE {SCHEMA}.poker_games SET current_turn_seat = {escape_sql(next_seat)},
                turn_end_at = NOW() + INTERVAL '30 seconds'
                WHERE id = {escape_sql(game['id'])}
            """)
    else:
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_games SET current_turn_seat = {escape_sql(next_seat)},
            turn_end_at = NOW() + INTERVAL '30 seconds'
            WHERE id = {escape_sql(game['id'])}
        """)

def advance_phase(cur, room_id, game, remaining):
    cur.execute(f"""
        UPDATE {SCHEMA}.poker_players SET current_bet = 0
        WHERE room_id = {escape_sql(room_id)}
    """)

    deck = parse_cards(game['deck'])
    community = parse_cards(game['community_cards'])
    phase = game['phase']

    if phase == 'preflop':
        if len(deck) >= 3:
            community.extend([deck.pop(0), deck.pop(0), deck.pop(0)])
        new_phase = 'flop'
    elif phase == 'flop':
        if deck:
            community.append(deck.pop(0))
        new_phase = 'turn'
    elif phase == 'turn':
        if deck:
            community.append(deck.pop(0))
        new_phase = 'river'
    else:
        showdown(cur, room_id, game, remaining, community)
        return

    remaining_seats = [p['seat'] for p in remaining]
    first_seat = remaining_seats[0]

    cur.execute(f"""
        UPDATE {SCHEMA}.poker_games
        SET phase = {escape_sql(new_phase)}, community_cards = {escape_sql(cards_to_str(community))},
            deck = {escape_sql(cards_to_str(deck))}, current_bet = 0, current_turn_seat = {escape_sql(first_seat)},
            turn_end_at = NOW() + INTERVAL '30 seconds'
        WHERE id = {escape_sql(game['id'])}
    """)

    can_act = [p for p in remaining if p['chips'] > 0]
    if len(can_act) <= 1:
        while new_phase != 'river':
            if new_phase == 'flop' and len(deck) >= 1:
                community.append(deck.pop(0))
                new_phase = 'turn'
            elif new_phase == 'turn' and len(deck) >= 1:
                community.append(deck.pop(0))
                new_phase = 'river'
            else:
                break
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_games
            SET phase = 'river', community_cards = {escape_sql(cards_to_str(community))},
                deck = {escape_sql(cards_to_str(deck))}
            WHERE id = {escape_sql(game['id'])}
        """)
        showdown(cur, room_id, game, remaining, community)

def showdown(cur, room_id, game, remaining, community):
    cur.execute(f"SELECT * FROM {SCHEMA}.poker_rooms WHERE id = {escape_sql(room_id)}")
    room = cur.fetchone()

    cur.execute(f"SELECT * FROM {SCHEMA}.poker_games WHERE id = {escape_sql(game['id'])}")
    game = cur.fetchone()

    best_hand = None
    winner = None
    for p in remaining:
        hole = parse_cards(p['hole_cards']) if p['hole_cards'] else []
        all_cards = hole + community
        hand_name, score = evaluate_hand(all_cards)
        if best_hand is None or score > best_hand:
            best_hand = score
            winner = p
            winner_hand_name = hand_name

    if winner:
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_players SET chips = chips + {escape_sql(game['pot'])}
            WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(winner['user_id'])}
        """)
        cur.execute(f"SELECT first_name FROM {SCHEMA}.users WHERE id = {escape_sql(winner['user_id'])}")
        wn = cur.fetchone()

        cards_shown = []
        for p in remaining:
            cur.execute(f"SELECT first_name FROM {SCHEMA}.users WHERE id = {escape_sql(p['user_id'])}")
            pn = cur.fetchone()
            cards_shown.append(f"{pn['first_name'] if pn else '?'}: {p['hole_cards']}")

        cur.execute(f"""
            INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
            VALUES ({escape_sql(room_id)}, {escape_sql('Вскрытие: ' + ' | '.join(cards_shown))}, TRUE)
        """)
        cur.execute(f"""
            INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
            VALUES ({escape_sql(room_id)}, {escape_sql((wn['first_name'] if wn else 'Игрок') + ' выиграл ' + str(game['pot']) + ' фишек! (' + winner_hand_name + ')')}, TRUE)
        """)
        cur.execute(f"""
            UPDATE {SCHEMA}.poker_games SET finished_at = NOW(), winner_id = {escape_sql(winner['user_id'])},
            winner_hand = {escape_sql(winner_hand_name)}
            WHERE id = {escape_sql(game['id'])}
        """)

    cur.execute(f"""
        UPDATE {SCHEMA}.poker_players SET is_active = FALSE
        WHERE room_id = {escape_sql(room_id)} AND chips <= 0
    """)

    cur.execute(f"SELECT * FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room_id)} AND is_active = TRUE ORDER BY seat")
    all_p = cur.fetchall()
    start_new_hand(cur, room_id, room, all_p)

def handle_chat(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    body = json.loads(event.get('body', '{}') or '{}')
    room_id = body.get('room_id')
    message = body.get('message', '').strip()[:500]
    if not message:
        return json_response(400, {'error': 'Пустое сообщение'})

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_messages (room_id, user_id, message)
        VALUES ({escape_sql(room_id)}, {escape_sql(user_id)}, {escape_sql(message)})
    """)
    conn.commit()
    conn.close()
    return json_response(200, {'ok': True})

def handle_leave(event):
    auth = get_auth(event)
    if not auth:
        return json_response(401, {'error': 'Требуется авторизация'})
    user_id = get_user_id(auth)
    body = json.loads(event.get('body', '{}') or '{}')
    room_id = body.get('room_id')

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"SELECT chips FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}")
    player = cur.fetchone()
    if player and player['chips'] > 0:
        credit_love(cur, user_id, player['chips'])

    cur.execute(f"""
        UPDATE {SCHEMA}.poker_players SET is_active = FALSE, is_folded = TRUE, chips = 0
        WHERE room_id = {escape_sql(room_id)} AND user_id = {escape_sql(user_id)}
    """)
    cur.execute(f"SELECT first_name FROM {SCHEMA}.users WHERE id = {escape_sql(user_id)}")
    user = cur.fetchone()
    cashout_msg = ''
    if player and player['chips'] > 0:
        cashout_msg = f" (вывел {int(player['chips'])} LOVE)"
    cur.execute(f"""
        INSERT INTO {SCHEMA}.poker_messages (room_id, message, is_system)
        VALUES ({escape_sql(room_id)}, {escape_sql((user['first_name'] if user else 'Игрок') + ' покинул стол' + cashout_msg)}, TRUE)
    """)
    cur.execute(f"SELECT COUNT(*) AS cnt FROM {SCHEMA}.poker_players WHERE room_id = {escape_sql(room_id)} AND is_active = TRUE")
    remaining = cur.fetchone()['cnt']
    if remaining == 0:
        cur.execute(f"UPDATE {SCHEMA}.poker_rooms SET status = 'finished' WHERE id = {escape_sql(room_id)}")

    conn.commit()
    conn.close()
    return json_response(200, {'ok': True})
