"""API для управления реферальной системой"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import secrets
import hashlib

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_referral_code(conn) -> str:
    """Генерирует уникальный 6-значный реферальный код (буквы + цифры)"""
    import string
    
    # Пытаемся сгенерировать уникальный код
    max_attempts = 10
    for _ in range(max_attempts):
        # Генерируем случайный код из букв и цифр (6 символов)
        chars = string.ascii_uppercase + string.digits
        code = ''.join(secrets.choice(chars) for _ in range(6))
        
        # Проверяем уникальность
        cur = conn.cursor()
        cur.execute(
            "SELECT COUNT(*) FROM t_p19021063_social_connect_platf.users WHERE referral_code = %s",
            (code,)
        )
        count = cur.fetchone()[0]
        cur.close()
        
        if count == 0:
            return code
    
    # Если не удалось за 10 попыток - генерируем с timestamp
    timestamp = str(int(secrets.randbits(20)))[-6:]
    return timestamp.zfill(6)

def handler(event: dict, context) -> dict:
    """API для работы с реферальной системой"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            path = event.get('queryStringParameters', {}).get('action', 'info')
            
            if path == 'info':
                # Получение информации о реферальном коде текущего пользователя
                cur.execute("""
                    SELECT referral_code, bonus_balance, referral_bonus_available,
                           (SELECT COUNT(*) FROM t_p19021063_social_connect_platf.users WHERE referred_by = %s) as referrals_count
                    FROM t_p19021063_social_connect_platf.users 
                    WHERE id = %s
                """, (user_id, user_id))
                
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'referral_code': result['referral_code'],
                        'referrals_count': result['referrals_count'],
                        'bonus_balance': float(result['bonus_balance']),
                        'referral_bonus_available': result['referral_bonus_available'] or False
                    }),
                    'isBase64Encoded': False
                }
            
            elif path == 'referrals':
                # Получение списка приглашенных пользователей
                cur.execute("""
                    SELECT id, first_name, last_name, email, created_at, avatar_url
                    FROM t_p19021063_social_connect_platf.users 
                    WHERE referred_by = %s
                    ORDER BY created_at DESC
                """, (user_id,))
                
                referrals = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'referrals': [dict(r) for r in referrals]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            elif path == 'bonuses':
                # Получение истории начислений бонусов
                cur.execute("""
                    SELECT t.id, t.amount, t.description, t.created_at, 
                           u.first_name, u.last_name, u.email
                    FROM t_p19021063_social_connect_platf.transactions t
                    LEFT JOIN t_p19021063_social_connect_platf.users u ON t.referrer_id = u.id
                    WHERE t.user_id = %s AND t.type = 'bonus'
                    ORDER BY t.created_at DESC
                    LIMIT 50
                """, (user_id,))
                
                bonuses = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'bonuses': [dict(b) for b in bonuses]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            elif path == 'mentor':
                # Получение информации о наставнике
                cur.execute("""
                    SELECT u2.id, u2.first_name, u2.last_name, u2.email, u2.avatar_url
                    FROM t_p19021063_social_connect_platf.users u1
                    LEFT JOIN t_p19021063_social_connect_platf.users u2 ON u1.referred_by = u2.id
                    WHERE u1.id = %s
                """, (user_id,))
                
                mentor = cur.fetchone()
                
                if mentor and mentor['id']:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'mentor': dict(mentor)}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'mentor': None}),
                        'isBase64Encoded': False
                    }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'validate':
                # Проверка валидности реферального кода
                referral_code = body.get('referral_code', '').strip().upper()
                
                if not referral_code:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Реферальный код не указан'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT id, first_name, last_name 
                    FROM t_p19021063_social_connect_platf.users 
                    WHERE referral_code = %s
                """, (referral_code,))
                
                referrer = cur.fetchone()
                
                if referrer:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'valid': True,
                            'referrer': dict(referrer)
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'valid': False}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'set_referrer':
                # Установка пригласителя для текущего пользователя
                referral_code = body.get('referral_code', '').strip().upper()
                
                if not referral_code:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Реферальный код не указан'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем, что пользователь ещё не указал пригласителя
                cur.execute("""
                    SELECT referred_by 
                    FROM t_p19021063_social_connect_platf.users 
                    WHERE id = %s
                """, (user_id,))
                
                current_user = cur.fetchone()
                
                if current_user and current_user['referred_by']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пригласитель уже установлен'}),
                        'isBase64Encoded': False
                    }
                
                # Находим пригласителя по коду
                cur.execute("""
                    SELECT id, first_name, last_name 
                    FROM t_p19021063_social_connect_platf.users 
                    WHERE referral_code = %s
                """, (referral_code,))
                
                referrer = cur.fetchone()
                
                if not referrer:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный код'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем, что пользователь не указывает сам себя
                if referrer['id'] == int(user_id):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Нельзя указать свой собственный код'}),
                        'isBase64Encoded': False
                    }
                
                # Устанавливаем пригласителя
                cur.execute("""
                    UPDATE t_p19021063_social_connect_platf.users 
                    SET referred_by = %s 
                    WHERE id = %s
                """, (referrer['id'], user_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'referrer': dict(referrer)
                    }),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()