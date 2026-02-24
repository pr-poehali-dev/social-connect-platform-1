import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для отправки заявки на участие в объявлении'''
    
    method = event.get('httpMethod', 'POST')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Authorization'
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
    
    # Получаем данные из запроса
    body = json.loads(event.get('body', '{}'))
    ad_id = body.get('ad_id')
    sender_id = body.get('sender_id')
    message = body.get('message', '')
    
    if not ad_id or not sender_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ad_id and sender_id are required'}),
            'isBase64Encoded': False
        }
    
    # Подключаемся к БД
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        # Получаем информацию об объявлении и его владельце
        cur.execute('''
            SELECT user_id FROM t_p19021063_social_connect_platf.ads WHERE id = %s
        ''', (ad_id,))
        
        result = cur.fetchone()
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Ad not found'}),
                'isBase64Encoded': False
            }
        
        receiver_id = result[0]
        
        # Создаем или находим существующий диалог
        cur.execute('''
            SELECT c.id FROM t_p19021063_social_connect_platf.conversations c
            JOIN t_p19021063_social_connect_platf.conversation_participants p1 
                ON c.id = p1.conversation_id AND p1.user_id = %s
            JOIN t_p19021063_social_connect_platf.conversation_participants p2 
                ON c.id = p2.conversation_id AND p2.user_id = %s
            WHERE c.type IN ('deal', 'live') AND c.deal_ad_id = %s
            LIMIT 1
        ''', (sender_id, receiver_id, ad_id))
        
        conversation = cur.fetchone()
        
        if conversation:
            conversation_id = conversation[0]
        else:
            # Создаем новый диалог
            cur.execute('''
                INSERT INTO t_p19021063_social_connect_platf.conversations 
                (type, deal_ad_id, deal_status, created_by)
                VALUES ('deal', %s, 'pending', %s)
                RETURNING id
            ''', (ad_id, sender_id))
            conversation_id = cur.fetchone()[0]
            
            # Добавляем участников
            cur.execute('''
                INSERT INTO t_p19021063_social_connect_platf.conversation_participants 
                (conversation_id, user_id)
                VALUES (%s, %s), (%s, %s)
            ''', (conversation_id, sender_id, conversation_id, receiver_id))
        
        # Добавляем сообщение
        cur.execute('''
            INSERT INTO t_p19021063_social_connect_platf.messages 
            (conversation_id, sender_id, content)
            VALUES (%s, %s, %s)
            RETURNING id
        ''', (conversation_id, sender_id, message))
        
        message_id = cur.fetchone()[0]
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'conversation_id': conversation_id,
                'message_id': message_id
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()