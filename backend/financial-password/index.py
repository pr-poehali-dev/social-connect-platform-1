"""API для управления финансовым паролем"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    """Хеширование пароля с использованием SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Установка и проверка финансового пароля"""
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
            # Проверка наличия финансового пароля
            cur.execute("""
                SELECT financial_password IS NOT NULL as has_password
                FROM t_p19021063_social_connect_platf.users 
                WHERE id = %s
            """, (user_id,))
            
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
                'body': json.dumps({'has_password': result['has_password']}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_raw = event.get('body', '{}')
            if isinstance(body_raw, str):
                body = json.loads(body_raw) if body_raw else {}
            else:
                body = body_raw if body_raw else {}
            
            action = body.get('action')
            
            if action == 'set':
                # Установка нового финансового пароля
                password = body.get('password', '').strip()
                
                if not password or len(password) < 4:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пароль должен содержать минимум 4 символа'}),
                        'isBase64Encoded': False
                    }
                
                hashed_password = hash_password(password)
                
                cur.execute("""
                    UPDATE t_p19021063_social_connect_platf.users 
                    SET financial_password = %s
                    WHERE id = %s
                """, (hashed_password, user_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Финансовый пароль установлен'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'verify':
                # Проверка финансового пароля
                password = body.get('password', '').strip()
                
                if not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пароль не указан'}),
                        'isBase64Encoded': False
                    }
                
                hashed_password = hash_password(password)
                
                cur.execute("""
                    SELECT financial_password
                    FROM t_p19021063_social_connect_platf.users 
                    WHERE id = %s
                """, (user_id,))
                
                result = cur.fetchone()
                
                if not result or not result['financial_password']:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Финансовый пароль не установлен'}),
                        'isBase64Encoded': False
                    }
                
                is_valid = result['financial_password'] == hashed_password
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'valid': is_valid}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
