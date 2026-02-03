import json
import os
import psycopg2
import bcrypt

def handler(event: dict, context) -> dict:
    '''Служебная функция для обновления пароля главного администратора из секретов'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        admin_login = os.environ.get('ADMIN_LOGIN')
        admin_password = os.environ.get('ADMIN_PASSWORD')
        database_url = os.environ.get('DATABASE_URL')
        
        if not admin_login or not admin_password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ADMIN_LOGIN и ADMIN_PASSWORD не настроены в секретах'}),
                'isBase64Encoded': False
            }
        
        # Генерируем bcrypt хеш пароля
        password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Подключаемся к БД и обновляем данные администратора
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Обновляем email и пароль главного администратора
        cur.execute("""
            UPDATE t_p19021063_social_connect_platf.admins 
            SET 
                email = %s,
                password_hash = %s,
                name = 'Главный администратор',
                role = 'superadmin',
                is_active = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
            RETURNING id, email, name, role
        """, (admin_login, password_hash))
        
        admin = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        if admin:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Главный администратор успешно обновлён',
                    'admin': {
                        'id': admin[0],
                        'email': admin[1],
                        'name': admin[2],
                        'role': admin[3]
                    }
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Администратор с ID=1 не найден'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
