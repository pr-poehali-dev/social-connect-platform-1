import json
import os
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    action = event.get('queryStringParameters', {}).get('action', 'login')
    
    if method == 'POST':
        if action == 'register':
            return handle_register(event)
        elif action == 'login':
            return handle_login(event)
    
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid request'}),
        'isBase64Encoded': False
    }

def handle_register(event: dict) -> dict:
    '''Регистрация нового пользователя'''
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '')
    referral_code = data.get('referral_code', '').strip().upper()
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email и пароль обязательны'})
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    schema = 't_p19021063_social_connect_platf'
    
    # Check if user exists
    cur.execute(f"SELECT id FROM {schema}.users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
            'isBase64Encoded': False
        }
    
    # Validate referral code if provided
    referrer_id = None
    if referral_code:
        cur.execute(f"SELECT id FROM {schema}.users WHERE referral_code = %s", (referral_code,))
        referrer = cur.fetchone()
        if referrer:
            referrer_id = referrer[0]
    
    # Hash password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user with referral
    cur.execute(
        f"INSERT INTO {schema}.users (email, password_hash, name, email_verified, referred_by) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (email, password_hash, name, True, referrer_id)
    )
    user_id = cur.fetchone()[0]
    
    # Generate unique referral code for new user (6 символов: буквы + цифры)
    import secrets
    import string
    
    # Генерируем уникальный 6-символьный код
    max_attempts = 10
    new_referral_code = None
    for _ in range(max_attempts):
        chars = string.ascii_uppercase + string.digits
        code = ''.join(secrets.choice(chars) for _ in range(6))
        
        # Проверяем уникальность
        cur.execute(f"SELECT COUNT(*) FROM {schema}.users WHERE referral_code = %s", (code,))
        if cur.fetchone()[0] == 0:
            new_referral_code = code
            break
    
    # Если не удалось за 10 попыток, используем timestamp
    if not new_referral_code:
        timestamp = str(int(secrets.randbits(20)))[-6:]
        new_referral_code = timestamp.zfill(6)
    
    cur.execute(
        f"UPDATE {schema}.users SET referral_code = %s WHERE id = %s",
        (new_referral_code, user_id)
    )
    
    conn.commit()
    
    # Generate tokens
    access_token = generate_access_token(user_id, email)
    refresh_token = generate_refresh_token()
    
    # Store refresh token
    cur.execute(
        f"INSERT INTO {schema}.refresh_tokens (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
        (user_id, refresh_token, datetime.utcnow() + timedelta(days=30))
    )
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {'id': user_id, 'email': email, 'name': name}
        }),
        'isBase64Encoded': False
    }

def handle_login(event: dict) -> dict:
    '''Вход пользователя'''
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    schema = 't_p19021063_social_connect_platf'
    
    # Get user
    cur.execute(f"SELECT id, email, password_hash, name FROM {schema}.users WHERE email = %s", (email,))
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный email или пароль'}),
            'isBase64Encoded': False
        }
    
    user_id, user_email, password_hash, name = user
    
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный email или пароль'}),
            'isBase64Encoded': False
        }
    
    # Update last login
    cur.execute(f"UPDATE {schema}.users SET last_login_at = NOW() WHERE id = %s", (user_id,))
    conn.commit()
    
    # Generate tokens
    access_token = generate_access_token(user_id, user_email)
    refresh_token = generate_refresh_token()
    
    # Store refresh token
    cur.execute(
        f"INSERT INTO {schema}.refresh_tokens (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
        (user_id, refresh_token, datetime.utcnow() + timedelta(days=30))
    )
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {'id': user_id, 'email': user_email, 'name': name}
        }),
        'isBase64Encoded': False
    }

def generate_access_token(user_id: int, email: str) -> str:
    '''Генерация JWT access token'''
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=3650)
    }
    jwt_secret = os.environ.get('JWT_SECRET')
    if not jwt_secret:
        raise ValueError('JWT_SECRET environment variable is required')
    return jwt.encode(payload, jwt_secret, algorithm='HS256')

def generate_refresh_token() -> str:
    '''Генерация refresh token'''
    import secrets
    return secrets.token_urlsafe(32)