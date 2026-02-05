import json
import os

def handler(event: dict, context) -> dict:
    '''Автоматическая проверка и снятие истекших банов'''
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Ленивый импорт psycopg2
        import psycopg2
        
        dsn = os.environ.get('DATABASE_URL')
        schema = 't_p19021063_social_connect_platf'
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Находим все активные баны, которые истекли
        cur.execute(f'''
            SELECT user_id, id, reason, banned_until
            FROM {schema}.user_bans
            WHERE is_active = true 
            AND banned_until <= NOW()
        ''')
        
        expired_bans = cur.fetchall()
        unbanned_count = 0
        
        for user_id, ban_id, reason, banned_until in expired_bans:
            # Деактивируем бан
            cur.execute(f'''
                UPDATE {schema}.user_bans
                SET is_active = false
                WHERE id = %s
            ''', (ban_id,))
            
            # Проверяем, есть ли другие активные баны у пользователя
            cur.execute(f'''
                SELECT COUNT(*) 
                FROM {schema}.user_bans
                WHERE user_id = %s AND is_active = true
            ''', (user_id,))
            
            active_bans_count = cur.fetchone()[0]
            
            # Если других активных банов нет - снимаем статус is_banned
            if active_bans_count == 0:
                cur.execute(f'''
                    UPDATE {schema}.users
                    SET is_banned = false
                    WHERE id = %s
                ''', (user_id,))
            
            unbanned_count += 1
            print(f"[INFO] Снят бан с пользователя {user_id}, причина была: {reason}")
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'unbanned_count': unbanned_count,
                'message': f'Снято банов: {unbanned_count}'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Failed to check expired bans: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
