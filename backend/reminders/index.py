import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления напоминаниями в ежедневнике'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("SELECT id FROM users WHERE access_token = %s", (token,))
        user_row = cur.fetchone()
        if not user_row:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен'})
            }
        
        user_id = user_row[0]
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            action = query_params.get('action', 'list')
            
            if action == 'list':
                month = query_params.get('month')
                year = query_params.get('year')
                
                if month and year:
                    cur.execute('''
                        SELECT id, title, description, reminder_date, reminder_time, is_completed
                        FROM reminders
                        WHERE user_id = %s 
                        AND EXTRACT(MONTH FROM reminder_date) = %s
                        AND EXTRACT(YEAR FROM reminder_date) = %s
                        ORDER BY reminder_date, reminder_time
                    ''', (user_id, int(month), int(year)))
                else:
                    cur.execute('''
                        SELECT id, title, description, reminder_date, reminder_time, is_completed
                        FROM reminders
                        WHERE user_id = %s
                        ORDER BY reminder_date, reminder_time
                    ''', (user_id,))
                
                reminders = []
                for row in cur.fetchall():
                    reminders.append({
                        'id': row[0],
                        'title': row[1],
                        'description': row[2],
                        'date': row[3].isoformat(),
                        'time': row[4].isoformat() if row[4] else None,
                        'completed': row[5]
                    })
                
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'reminders': reminders})
                }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            title = data.get('title')
            description = data.get('description', '')
            reminder_date = data.get('date')
            reminder_time = data.get('time')
            
            if not title or not reminder_date:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется название и дата'})
                }
            
            cur.execute('''
                INSERT INTO reminders (user_id, title, description, reminder_date, reminder_time)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            ''', (user_id, title, description, reminder_date, reminder_time))
            
            reminder_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': reminder_id, 'message': 'Напоминание создано'})
            }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            reminder_id = data.get('id')
            
            if not reminder_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется ID напоминания'})
                }
            
            update_fields = []
            params = []
            
            if 'title' in data:
                update_fields.append('title = %s')
                params.append(data['title'])
            if 'description' in data:
                update_fields.append('description = %s')
                params.append(data['description'])
            if 'date' in data:
                update_fields.append('reminder_date = %s')
                params.append(data['date'])
            if 'time' in data:
                update_fields.append('reminder_time = %s')
                params.append(data['time'])
            if 'completed' in data:
                update_fields.append('is_completed = %s')
                params.append(data['completed'])
            
            if not update_fields:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нет полей для обновления'})
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.extend([user_id, reminder_id])
            
            cur.execute(f'''
                UPDATE reminders
                SET {', '.join(update_fields)}
                WHERE user_id = %s AND id = %s
            ''', params)
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Напоминание обновлено'})
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            reminder_id = query_params.get('id')
            
            if not reminder_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется ID напоминания'})
                }
            
            cur.execute('DELETE FROM reminders WHERE user_id = %s AND id = %s', (user_id, int(reminder_id)))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Напоминание удалено'})
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }