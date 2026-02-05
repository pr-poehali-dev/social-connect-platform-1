"""API для обработки пополнений баланса с автоматическим начислением бонусов наставнику"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Обработка пополнения баланса с начислением 30% наставнику"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
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
    
    try:
        body_raw = event.get('body', '{}')
        
        if isinstance(body_raw, str):
            body = json.loads(body_raw) if body_raw else {}
        else:
            body = body_raw if body_raw else {}
        
        amount_value = body.get('amount', 0) if isinstance(body, dict) else 0
        amount = Decimal(str(amount_value))
        
        if amount <= 0:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сумма должна быть больше 0'}),
                'isBase64Encoded': False
            }
        
    except (ValueError, KeyError, TypeError) as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Неверный формат данных: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("BEGIN")
        
        # Увеличиваем баланс пользователя
        cur.execute("""
            UPDATE t_p19021063_social_connect_platf.users 
            SET balance = balance + %s
            WHERE id = %s
        """, (amount, user_id))
        
        # Создаем транзакцию пополнения для пользователя
        cur.execute("""
            INSERT INTO t_p19021063_social_connect_platf.transactions 
            (user_id, amount, type, status, description)
            VALUES (%s, %s, 'deposit', 'completed', 'Пополнение баланса')
            RETURNING id
        """, (user_id, amount))
        
        transaction_id = cur.fetchone()['id']
        
        # Проверяем, есть ли у пользователя наставник
        cur.execute("""
            SELECT referred_by 
            FROM t_p19021063_social_connect_platf.users 
            WHERE id = %s AND referred_by IS NOT NULL
        """, (user_id,))
        
        result = cur.fetchone()
        
        if result and result['referred_by']:
            referrer_id = result['referred_by']
            bonus_amount = amount * Decimal('0.30')
            
            # Начисляем 30% наставнику на бонусный баланс
            cur.execute("""
                UPDATE t_p19021063_social_connect_platf.users 
                SET bonus_balance = bonus_balance + %s
                WHERE id = %s
            """, (bonus_amount, referrer_id))
            
            # Создаем транзакцию бонуса для наставника
            cur.execute("""
                INSERT INTO t_p19021063_social_connect_platf.transactions 
                (user_id, amount, type, status, description, referrer_id)
                VALUES (%s, %s, 'bonus', 'completed', 'Бонус от реферала', %s)
            """, (referrer_id, bonus_amount, user_id))
        
        cur.execute("COMMIT")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'transaction_id': transaction_id,
                'amount': float(amount),
                'bonus_credited': bool(result and result['referred_by'])
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        cur.execute("ROLLBACK")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обработки платежа: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()