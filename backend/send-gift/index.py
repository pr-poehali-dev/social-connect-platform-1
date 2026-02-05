import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from decimal import Decimal

def handler(event: dict, context) -> dict:
    """API для отправки виртуальных подарков"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
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
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    token = auth_header.replace('Bearer ', '')
    try:
        import jwt as pyjwt
        jwt_secret = os.environ.get('JWT_SECRET', '')
        if not jwt_secret:
            raise Exception('JWT_SECRET not configured')
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except Exception:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p19021063_social_connect_platf')
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        body = json.loads(event.get('body', '{}'))
        recipient_id = body.get('recipient_id')
        gift_id = body.get('gift_id')
        gift_name = body.get('gift_name', 'Подарок')
        gift_emoji = body.get('gift_emoji', '🎁')
        price = Decimal(str(body.get('price', 0)))
        is_anonymous = body.get('is_anonymous', False)
        
        if not recipient_id or price <= 0:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверные параметры'}),
                'isBase64Encoded': False
            }
        
        # Проверяем баланс отправителя
        cursor.execute(f"""
            SELECT balance, bonus_balance, first_name, last_name
            FROM {schema}.users
            WHERE id = %s
        """, (user_id,))
        sender = cursor.fetchone()
        
        if not sender:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пользователь не найден'}),
                'isBase64Encoded': False
            }
        
        total_balance = Decimal(str(sender['balance'])) + Decimal(str(sender['bonus_balance']))
        
        if total_balance < price:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно средств'}),
                'isBase64Encoded': False
            }
        
        # Списываем средства (сначала бонусный, потом основной)
        bonus_to_use = min(Decimal(str(sender['bonus_balance'])), price)
        main_to_use = price - bonus_to_use
        
        cursor.execute(f"""
            UPDATE {schema}.users
            SET bonus_balance = bonus_balance - %s,
                balance = balance - %s
            WHERE id = %s
        """, (bonus_to_use, main_to_use, user_id))
        
        # Проверяем получателя
        cursor.execute(f"""
            SELECT first_name, last_name
            FROM {schema}.users
            WHERE id = %s
        """, (recipient_id,))
        recipient = cursor.fetchone()
        
        if not recipient:
            conn.rollback()
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Получатель не найден'}),
                'isBase64Encoded': False
            }
        
        # Создаём таблицу подарков если не существует
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {schema}.gifts (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER NOT NULL REFERENCES {schema}.users(id),
                recipient_id INTEGER NOT NULL REFERENCES {schema}.users(id),
                gift_id INTEGER NOT NULL,
                gift_name VARCHAR(255) NOT NULL,
                gift_emoji VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                is_public BOOLEAN DEFAULT TRUE,
                is_anonymous BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Добавляем колонку is_anonymous если её нет
        cursor.execute(f"""
            ALTER TABLE {schema}.gifts 
            ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE
        """)
        
        # Сохраняем подарок
        cursor.execute(f"""
            INSERT INTO {schema}.gifts 
            (sender_id, recipient_id, gift_id, gift_name, gift_emoji, price, is_anonymous)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, recipient_id, gift_id, gift_name, gift_emoji, price, is_anonymous))
        
        gift_record_id = cursor.fetchone()['id']
        
        # Записываем транзакции
        sender_name = f"{sender['first_name'] or ''} {sender['last_name'] or ''}".strip() or 'Пользователь'
        recipient_name = f"{recipient['first_name'] or ''} {recipient['last_name'] or ''}".strip() or 'Пользователь'
        
        cursor.execute(f"""
            INSERT INTO {schema}.transactions 
            (user_id, amount, type, status, description)
            VALUES (%s, %s, 'send_gift', 'completed', %s)
        """, (user_id, -price, f'Подарок "{gift_name}" для {recipient_name}'))
        
        # Уведомление получателю
        notification_content = f'Анонимный отправитель подарил вам {gift_name}' if is_anonymous else f'{sender_name} отправил вам {gift_name}'
        notification_related_user = None if is_anonymous else user_id
        
        cursor.execute(f"""
            INSERT INTO {schema}.notifications 
            (user_id, type, title, content, related_user_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            recipient_id,
            'gift_received',
            f'{gift_emoji} Вам подарок!',
            notification_content,
            notification_related_user
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'gift_id': gift_record_id
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error sending gift: {str(e)}")
        print(f"Traceback: {error_details}")
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e), 'details': error_details}),
            'isBase64Encoded': False
        }