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
            'body': ''
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
        'body': json.dumps({'error': 'Invalid request'})
    }

def handle_register(event: dict) -> dict:
    '''Регистрация нового пользователя'''
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '')
    
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
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    
    # Check if user exists
    cur.execute(f"SELECT id FROM {schema}.users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
        }
    
    # Hash password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user
    cur.execute(
        f"INSERT INTO {schema}.users (email, password_hash, name, email_verified) VALUES (%s, %s, %s, %s) RETURNING id",
        (email, password_hash, name, True)
    )
    user_id = cur.fetchone()[0]
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
        })
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
            'body': json.dumps({'error': 'Email и пароль обязательны'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    
    # Get user
    cur.execute(f"SELECT id, email, password_hash, name FROM {schema}.users WHERE email = %s", (email,))
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный email или пароль'})
        }
    
    user_id, user_email, password_hash, name = user
    
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный email или пароль'})
        }
    
    # Update last login
    cur.execute(f"UPDATE {schema}.users SET last_login_at = %s WHERE id = %s", (datetime.utcnow(), user_id))
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
        })
    }

def generate_access_token(user_id: int, email: str) -> str:
    '''Генерация JWT access token'''
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, os.environ.get('JWT_SECRET', 'secret'), algorithm='HS256')

def generate_refresh_token() -> str:
    '''Генерация refresh token'''
    import secrets
    return secrets.token_urlsafe(32)