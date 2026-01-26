import json
import os
import psycopg2
import jwt

def handler(event: dict, context) -> dict:
    '''API для получения списка приглашений на объявление'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Получаем токен
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
        user_id = payload.get('user_id')
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'})
        }
    
    # Получаем параметры
    params = event.get('queryStringParameters') or {}
    ad_id = params.get('ad_id')
    
    if not ad_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указан ID объявления'})
        }
    
    # Подключаемся к БД
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        # Проверяем, что объявление принадлежит пользователю
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
        
        if result[0] != user_id:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Доступ запрещен'})
            }
        
        # Получаем список приглашений
        cur.execute('''
            SELECT 
                ai.id,
                ai.ad_id,
                ai.inviter_id,
                u.name as inviter_name,
                u.avatar_url as inviter_avatar,
                ai.message,
                ai.status,
                ai.created_at,
                a.action as ad_title
            FROM t_p19021063_social_connect_platf.ad_invitations ai
            JOIN t_p19021063_social_connect_platf.users u ON ai.inviter_id = u.id
            JOIN t_p19021063_social_connect_platf.ads a ON ai.ad_id = a.id
            WHERE ai.ad_id = %s
            ORDER BY ai.created_at DESC
        ''', (ad_id,))
        
        rows = cur.fetchall()
        applications = []
        
        for row in rows:
            applications.append({
                'id': row[0],
                'ad_id': row[1],
                'inviter_id': row[2],
                'inviter_name': row[3],
                'inviter_avatar': row[4] or '',
                'message': row[5] or '',
                'status': row[6],
                'created_at': row[7].isoformat() if row[7] else '',
                'ad_title': row[8]
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(applications)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
    finally:
        cur.close()
        conn.close()
