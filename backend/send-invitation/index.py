import json
import os
import psycopg2
import jwt

def handler(event: dict, context) -> dict:
    '''API для отправки приглашений исполнителям'''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Получаем токен из заголовка
    auth_header = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    # Проверяем токен
    try:
        secret = os.environ.get('JWT_SECRET', 'your-secret-key')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        inviter_id = payload.get('user_id')
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'})
        }
    
    # Получаем данные из запроса
    try:
        body = json.loads(event.get('body', '{}'))
        ad_id = body.get('ad_id')
        message = body.get('message', '')
    except:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат данных'})
        }
    
    if not ad_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указано объявление'})
        }
    
    # Подключаемся к БД
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        # Получаем информацию об объявлении и его владельце
        cur.execute('''
            SELECT user_id FROM t_p19021063_social_connect_platf.ads 
            WHERE id = %s
        ''', (ad_id,))
        
        result = cur.fetchone()
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Объявление не найдено'})
            }
        
        ad_owner_id = result[0]
        
        # Проверяем, не пытается ли пользователь пригласить сам себя
        if inviter_id == ad_owner_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Нельзя пригласить самого себя'})
            }
        
        # Проверяем, не было ли уже приглашения
        cur.execute('''
            SELECT id FROM t_p19021063_social_connect_platf.ad_invitations 
            WHERE ad_id = %s AND inviter_id = %s
        ''', (ad_id, inviter_id))
        
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Приглашение уже отправлено'})
            }
        
        # Создаем приглашение
        cur.execute('''
            INSERT INTO t_p19021063_social_connect_platf.ad_invitations 
            (ad_id, inviter_id, ad_owner_id, message, status)
            VALUES (%s, %s, %s, %s, 'pending')
            RETURNING id
        ''', (ad_id, inviter_id, ad_owner_id, message))
        
        invitation_id = cur.fetchone()[0]
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'invitation_id': invitation_id,
                'message': 'Приглашение отправлено'
            })
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
    finally:
        cur.close()
        conn.close()
