import json
import os
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import psycopg2
import bcrypt
import jwt
import secrets
import string
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
        elif action == 'forgot-password':
            return handle_forgot_password(event)
        elif action == 'reset-password':
            return handle_reset_password(event)
    
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
    cur.execute(f"SELECT id, password_hash FROM {schema}.users WHERE email = %s", (email,))
    existing = cur.fetchone()
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    if existing:
        existing_id, existing_pw = existing
        if existing_pw and existing_pw.strip():
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                'isBase64Encoded': False
            }
        
        name_parts = name.split(' ', 1) if name else ['', '']
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        cur.execute(
            f"""UPDATE {schema}.users SET password_hash = %s,
                first_name = COALESCE(NULLIF(first_name, ''), %s),
                last_name = COALESCE(NULLIF(last_name, ''), %s),
                updated_at = NOW(), last_login_at = NOW()
                WHERE id = %s""",
            (password_hash, first_name, last_name, existing_id)
        )
        user_id = existing_id
    else:
        referrer_id = None
        if referral_code:
            cur.execute(f"SELECT id FROM {schema}.users WHERE referral_code = %s", (referral_code,))
            referrer = cur.fetchone()
            if referrer:
                referrer_id = referrer[0]
        
        name_parts = name.split(' ', 1) if name else ['', '']
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        username = email.split('@')[0].lower()
        username = ''.join(c for c in username if c.isalnum() or c == '_')[:20]
        if not username:
            username = 'user'
        
        nickname = username
        counter = 1
        while True:
            cur.execute(f"SELECT id FROM {schema}.users WHERE nickname = %s", (nickname,))
            if not cur.fetchone():
                break
            if counter == 1:
                nickname = f"{username}_{secrets.randbelow(10000):04d}"
            else:
                nickname = f"{username}_{secrets.randbelow(100000):05d}"
            counter += 1
            if counter > 10:
                nickname = f"user_{secrets.randbelow(1000000):06d}"
                break
        
        cur.execute(
            f"INSERT INTO {schema}.users (email, password_hash, first_name, last_name, nickname, email_verified, referred_by) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (email, password_hash, first_name, last_name, nickname, True, referrer_id)
        )
        user_id = cur.fetchone()[0]
    
    if not existing:
        max_attempts = 10
        new_referral_code = None
        for _ in range(max_attempts):
            chars = string.ascii_uppercase + string.digits
            code = ''.join(secrets.choice(chars) for _ in range(6))
            cur.execute(f"SELECT COUNT(*) FROM {schema}.users WHERE referral_code = %s", (code,))
            if cur.fetchone()[0] == 0:
                new_referral_code = code
                break
        
        if not new_referral_code:
            timestamp = str(int(secrets.randbits(20)))[-6:]
            new_referral_code = timestamp.zfill(6)
        
        cur.execute(
            f"UPDATE {schema}.users SET referral_code = %s WHERE id = %s",
            (new_referral_code, user_id)
        )
        
        if referrer_id:
            cur.execute(
                f"UPDATE {schema}.users SET referral_bonus_available = true WHERE id = %s",
                (user_id,)
            )
            
            cur.execute(
                f"SELECT vip_expires_at FROM {schema}.users WHERE id = %s",
                (referrer_id,)
            )
            vip_result = cur.fetchone()
            
            if vip_result and vip_result[0]:
                new_vip_until = vip_result[0] + timedelta(days=1)
            else:
                new_vip_until = datetime.utcnow() + timedelta(days=1)
            
            cur.execute(
                f"UPDATE {schema}.users SET is_vip = true, vip_expires_at = %s WHERE id = %s",
                (new_vip_until, referrer_id)
            )
            
            cur.execute(
                f"""INSERT INTO {schema}.transactions 
                    (user_id, referrer_id, type, amount, description) 
                    VALUES (%s, %s, %s, %s, %s)""",
                (referrer_id, user_id, 'referral_bonus', 1, 'Бонус: +1 день Premium за приглашение пользователя')
            )
    
    # Авто-создание анкеты знакомств если её нет
    cur.execute(
        f"SELECT id FROM {schema}.dating_profiles WHERE user_id = %s",
        (user_id,)
    )
    if not cur.fetchone():
        display_name = f"{first_name} {last_name}".strip() or nickname or 'Пользователь'
        cur.execute(
            f"""INSERT INTO {schema}.dating_profiles (user_id, name, age, is_top_ad)
                VALUES (%s, %s, 0, FALSE)
                ON CONFLICT (user_id) DO NOTHING""",
            (user_id, display_name)
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
    cur.execute(f"SELECT id, email, password_hash, first_name, last_name FROM {schema}.users WHERE email = %s", (email,))
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
    
    user_id, user_email, password_hash, first_name, last_name = user
    name = f"{first_name or ''} {last_name or ''}".strip()
    
    if not password_hash or not password_hash.strip():
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Этот аккаунт создан через соцсеть. Войдите через VK, Яндекс или Google, либо зарегистрируйтесь чтобы задать пароль'}),
            'isBase64Encoded': False
        }
    
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
    return secrets.token_urlsafe(32)


def send_reset_email(to_email: str, reset_link: str) -> None:
    '''Отправка письма для сброса пароля'''
    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    smtp_from = os.environ.get('SMTP_FROM', smtp_user)

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Сброс пароля — LOVE IS'
    msg['From'] = smtp_from
    msg['To'] = to_email

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #333;">Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Нажмите кнопку ниже, чтобы задать новый пароль:</p>
        <a href="{reset_link}" style="display: inline-block; background: #e11d48; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Сбросить пароль
        </a>
        <p style="color: #888; font-size: 13px;">Ссылка действительна 1 час. Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>
    </div>
    """

    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())


def handle_forgot_password(event: dict) -> dict:
    '''Запрос на сброс пароля — отправка email'''
    cors = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    data = json.loads(event.get('body', '{}'))
    email = data.get('email', '').strip().lower()

    if not email:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Email обязателен'})}

    schema = 't_p19021063_social_connect_platf'
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(f"SELECT id FROM {schema}.users WHERE email = %s", (email,))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'message': 'Если аккаунт существует, письмо отправлено'})}

    user_id = user[0]
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=1)

    cur.execute(
        f"UPDATE {schema}.password_reset_tokens SET used = TRUE WHERE user_id = %s AND used = FALSE",
        (user_id,)
    )

    cur.execute(
        f"INSERT INTO {schema}.password_reset_tokens (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
        (user_id, token_hash, expires_at)
    )
    conn.commit()

    origin = event.get('headers', {}).get('origin', event.get('headers', {}).get('Origin', 'https://loveis.city'))
    reset_link = f"{origin}/reset-password?token={token}"

    try:
        send_reset_email(email, reset_link)
    except Exception:
        cur.close()
        conn.close()
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': 'Не удалось отправить письмо'})}

    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'message': 'Если аккаунт существует, письмо отправлено'})}


def handle_reset_password(event: dict) -> dict:
    '''Сброс пароля по токену'''
    cors = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    data = json.loads(event.get('body', '{}'))
    token = data.get('token', '')
    password = data.get('password', '')

    if not token or not password:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Токен и пароль обязательны'})}

    if len(password) < 6:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})}

    token_hash = hashlib.sha256(token.encode()).hexdigest()
    schema = 't_p19021063_social_connect_platf'
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        now = datetime.utcnow().isoformat()
        cur.execute(
            f"SELECT id, user_id FROM {schema}.password_reset_tokens WHERE token_hash = %s AND used = FALSE AND expires_at > %s",
            (token_hash, now)
        )
        row = cur.fetchone()

        if not row:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Ссылка недействительна или истекла'})}

        reset_id, user_id = row
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cur.execute(f"UPDATE {schema}.users SET password_hash = %s, updated_at = NOW() WHERE id = %s", (password_hash, user_id))
        cur.execute(f"UPDATE {schema}.password_reset_tokens SET used = TRUE WHERE id = %s", (reset_id,))
        conn.commit()

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'message': 'Пароль успешно изменён'})}
    except Exception:
        conn.rollback()
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Ссылка недействительна или истекла'})}
    finally:
        cur.close()
        conn.close()