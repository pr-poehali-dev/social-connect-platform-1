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
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'}),
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
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    
    try:
        # Проверяем токен и получаем user_id
        cur.execute(f"""
            SELECT user_id FROM {schema}.sessions 
            WHERE access_token = %s AND expires_at > NOW()
        """, (token,))
        session = cur.fetchone()
        
        if not session:
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid token'}),
                'isBase64Encoded': False
            }
        
        user_id = session[0]
        
        if action == 'send':
            # Генерируем 4-значный код
            verification_code = str(random.randint(1000, 9999))
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
            
            # Отправляем SMS через sms.ru
            api_key = os.environ.get('SMS_RU_API_KEY')
            sms_url = f"https://sms.ru/sms/send?api_id={api_key}&to={phone}&msg=Ваш код подтверждения: {verification_code}&json=1"
            
            response = requests.get(sms_url)
            sms_result = response.json()
            
            if sms_result.get('status') == 'OK':
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'Код отправлен на телефон'}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Не удалось отправить SMS'}),
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