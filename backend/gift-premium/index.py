import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from decimal import Decimal

def handler(event: dict, context) -> dict:
    """API для подарков Premium подписки"""
    
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
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'gift-premium')
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        body = json.loads(event.get('body', '{}'))
        
        # Специальное предложение для новых пользователей (7 дней за 1 руб)
        if action == 'activate-trial':
            # Проверяем, доступен ли бонус
            cursor.execute(f"""
                SELECT referral_bonus_available, vip_until
                FROM {schema}.users
                WHERE id = %s
            """, (user_id,))
            user = cursor.fetchone()
            
            if not user or not user['referral_bonus_available']:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Специальное предложение недоступно'}),
                    'isBase64Encoded': False
                }
            
            # Активируем пробный период (7 дней)
            now = datetime.now()
            new_vip_until = now + timedelta(days=7)
            
            cursor.execute(f"""
                UPDATE {schema}.users
                SET is_vip = true, 
                    vip_until = %s,
                    referral_bonus_available = false
                WHERE id = %s
            """, (new_vip_until, user_id))
            
            # Записываем транзакцию
            cursor.execute(f"""
                INSERT INTO {schema}.transactions 
                (user_id, amount, type, status, description)
                VALUES (%s, %s, 'trial_premium', 'completed', %s)
            """, (user_id, -1, 'Активация пробного Premium (7 дней за 1₽)'))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'vip_until': new_vip_until.isoformat(),
                    'message': 'Premium активирован на 7 дней!'
                }),
                'isBase64Encoded': False
            }
        
        recipient_id = body.get('recipient_id')
        months = body.get('months', 1)
        price = Decimal(str(body.get('price', 0)))
        
        if not recipient_id or price <= 0:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверные параметры'}),
                'isBase64Encoded': False
            }
        
        # Проверяем баланс покупателя
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
        
        # Проверяем получателя и его текущую подписку
        cursor.execute(f"""
            SELECT first_name, last_name, premium_until
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
        
        # Рассчитываем новую дату окончания премиума
        now = datetime.now()
        current_premium = recipient['premium_until']
        
        if current_premium and current_premium > now:
            new_premium_until = current_premium + timedelta(days=30 * months)
        else:
            new_premium_until = now + timedelta(days=30 * months)
        
        # Обновляем премиум получателя
        cursor.execute(f"""
            UPDATE {schema}.users
            SET premium_until = %s
            WHERE id = %s
        """, (new_premium_until, recipient_id))
        
        # Записываем транзакции
        sender_name = f"{sender['first_name'] or ''} {sender['last_name'] or ''}".strip() or 'Пользователь'
        recipient_name = f"{recipient['first_name'] or ''} {recipient['last_name'] or ''}".strip() or 'Пользователь'
        
        cursor.execute(f"""
            INSERT INTO {schema}.transactions 
            (user_id, amount, type, status, description)
            VALUES (%s, %s, 'gift_premium', 'completed', %s)
        """, (user_id, -price, f'Подарок Premium ({months} мес.) для {recipient_name}'))
        
        cursor.execute(f"""
            INSERT INTO {schema}.transactions 
            (user_id, amount, type, status, description)
            VALUES (%s, %s, 'receive_premium', 'completed', %s)
        """, (recipient_id, 0, f'Premium ({months} мес.) от {sender_name}'))
        
        # Уведомление получателю
        cursor.execute(f"""
            INSERT INTO {schema}.notifications 
            (user_id, type, title, content, related_user_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            recipient_id,
            'premium_gift',
            '🎁 Вам подарили Premium!',
            f'{sender_name} подарил вам Premium на {months} {"месяц" if months == 1 else "месяца" if months < 5 else "месяцев"}',
            user_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'premium_until': new_premium_until.isoformat()
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }