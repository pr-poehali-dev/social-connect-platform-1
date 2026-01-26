import json
import os
import random
import psycopg2
from datetime import datetime, timedelta
import requests

def handler(event: dict, context) -> dict:
    """API для подтверждения номера телефона через SMS.ru"""
    method = event.get('httpMethod', 'GET')
    
    # Получаем origin из заголовков для CORS
    origin = event.get('headers', {}).get('origin', 'https://loveis.city')
    
    cors_headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Получаем токен из заголовков
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    token = auth_header.replace('Bearer ', '')
    
    # Декодируем JWT токен
    try:
        import jwt as pyjwt
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Server configuration error'}),
                'isBase64Encoded': False
            }
        payload = pyjwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except pyjwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Токен истёк'}),
            'isBase64Encoded': False
        }
    except pyjwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    # Парсим body
    body = json.loads(event.get('body', '{}'))
    action = body.get('action')  # 'send' или 'verify'
    phone = body.get('phone', '').strip()
    code = body.get('code', '').strip()
    
    # Подключение к БД
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p19021063_social_connect_platf')
    
    try:
        
        if action == 'send':
            # Используем бесплатную проверку через звонок callcheck
            api_key = os.environ.get('SMS_RU_API_KEY')
            call_url = f"https://sms.ru/callcheck/add?api_id={api_key}&phone={phone}&json=1"
            
            response = requests.get(call_url)
            call_result = response.json()
            
            if call_result.get('status') == 'OK':
                # Получаем код из ответа
                verification_code = call_result.get('code', '')
                expires_at = datetime.now() + timedelta(minutes=5)
                
                # Сохраняем код в БД
                cur.execute(f"""
                    INSERT INTO {schema}.phone_verifications (user_id, phone, code, expires_at)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (user_id) 
                    DO UPDATE SET phone = EXCLUDED.phone, code = EXCLUDED.code, 
                                 expires_at = EXCLUDED.expires_at, verified = false
                """, (user_id, phone, verification_code, expires_at))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'Сейчас вам позвонят, запомните последние 4 цифры номера'}),
                    'isBase64Encoded': False
                }
            else:
                error_msg = call_result.get('status_text', 'Не удалось отправить код')
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': error_msg}),
                    'isBase64Encoded': False
                }
        
        elif action == 'verify':
            # Проверяем код
            cur.execute(f"""
                SELECT code, expires_at FROM {schema}.phone_verifications
                WHERE user_id = %s AND phone = %s AND verified = false
            """, (user_id, phone))
            verification = cur.fetchone()
            
            if not verification:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Код не найден'}),
                    'isBase64Encoded': False
                }
            
            saved_code, expires_at = verification
            
            if datetime.now() > expires_at:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Код истёк'}),
                    'isBase64Encoded': False
                }
            
            if saved_code != code:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Неверный код'}),
                    'isBase64Encoded': False
                }
            
            # Помечаем телефон как подтверждённый
            cur.execute(f"""
                UPDATE {schema}.phone_verifications
                SET verified = true
                WHERE user_id = %s AND phone = %s
            """, (user_id, phone))
            
            # Обновляем телефон в профиле и отмечаем как подтверждённый
            cur.execute(f"""
                UPDATE {schema}.dating_profiles
                SET phone = %s, phone_verified = true
                WHERE user_id = %s
            """, (phone, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'success': True, 'message': 'Телефон подтверждён'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()