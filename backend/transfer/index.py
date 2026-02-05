"""API для переводов средств между пользователями"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal
import hashlib

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Перевод средств между пользователями"""
    method = event.get('httpMethod', 'POST')
    
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
        
        recipient_id = body.get('recipient_id')
        amount_value = body.get('amount', 0)
        financial_password = body.get('financial_password', '').strip()
        
        if not recipient_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Укажите получателя'}),
                'isBase64Encoded': False
            }
        
        if str(recipient_id) == str(user_id):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Нельзя переводить самому себе'}),
                'isBase64Encoded': False
            }
        
        amount = Decimal(str(amount_value))
        
        if amount <= 0:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сумма должна быть больше 0'}),
                'isBase64Encoded': False
            }
        
        if not financial_password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Введите финансовый пароль'}),
                'isBase64Encoded': False
            }
        
    except (ValueError, TypeError) as e:
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
        
        # Проверяем финансовый пароль отправителя
        cur.execute("""
            SELECT financial_password, balance, first_name, last_name
            FROM t_p19021063_social_connect_platf.users 
            WHERE id = %s
        """, (user_id,))
        
        sender = cur.fetchone()
        
        if not sender:
            cur.execute("ROLLBACK")
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Отправитель не найден'}),
                'isBase64Encoded': False
            }
        
        if not sender['financial_password']:
            cur.execute("ROLLBACK")
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сначала установите финансовый пароль'}),
                'isBase64Encoded': False
            }
        
        hashed_password = hash_password(financial_password)
        if sender['financial_password'] != hashed_password:
            cur.execute("ROLLBACK")
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный финансовый пароль'}),
                'isBase64Encoded': False
            }
        
        # Проверяем баланс
        if Decimal(sender['balance']) < amount:
            cur.execute("ROLLBACK")
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно средств'}),
                'isBase64Encoded': False
            }
        
        # Проверяем существование получателя
        cur.execute("""
            SELECT id, first_name, last_name
            FROM t_p19021063_social_connect_platf.users 
            WHERE id = %s
        """, (recipient_id,))
        
        recipient = cur.fetchone()
        
        if not recipient:
            cur.execute("ROLLBACK")
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Получатель не найден'}),
                'isBase64Encoded': False
            }
        
        # Списываем у отправителя
        cur.execute("""
            UPDATE t_p19021063_social_connect_platf.users 
            SET balance = balance - %s
            WHERE id = %s
        """, (amount, user_id))
        
        # Зачисляем получателю
        cur.execute("""
            UPDATE t_p19021063_social_connect_platf.users 
            SET balance = balance + %s
            WHERE id = %s
        """, (amount, recipient_id))
        
        # Создаем транзакции
        sender_name = f"{sender['first_name'] or ''} {sender['last_name'] or ''}".strip() or f"ID{user_id}"
        recipient_name = f"{recipient['first_name'] or ''} {recipient['last_name'] or ''}".strip() or f"ID{recipient_id}"
        
        cur.execute("""
            INSERT INTO t_p19021063_social_connect_platf.transactions 
            (user_id, amount, type, status, description)
            VALUES (%s, %s, 'withdrawal', 'completed', %s)
        """, (user_id, amount, f"Перевод для {recipient_name}"))
        
        cur.execute("""
            INSERT INTO t_p19021063_social_connect_platf.transactions 
            (user_id, amount, type, status, description)
            VALUES (%s, %s, 'deposit', 'completed', %s)
        """, (recipient_id, amount, f"Перевод от {sender_name}"))
        
        cur.execute("COMMIT")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'amount': float(amount),
                'recipient': recipient_name
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        cur.execute("ROLLBACK")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка перевода: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
