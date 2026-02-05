"""API для управления реферальной системой"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import secrets
import hashlib

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_referral_code(user_id: int) -> str:
    """Генерирует уникальный реферальный код для пользователя"""
    random_part = secrets.token_hex(4).upper()
    user_part = str(user_id).zfill(6)
    return f"REF{user_part}{random_part}"

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
                    SELECT referral_code, bonus_balance,
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
                        'bonus_balance': float(result['bonus_balance'])
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
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()