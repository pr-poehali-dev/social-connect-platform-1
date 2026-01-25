import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления телефонной книгой: получение, добавление, редактирование и удаление контактов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }
    
    user_id = event.get('headers', {}).get('X-User-Id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'GET':
            # Получить все контакты пользователя
            cur.execute('''
                SELECT id, name, phone, instagram, telegram, avatar, notes, created_at, updated_at
                FROM contacts
                WHERE user_id = %s
                ORDER BY name
            ''', (user_id,))
            
            contacts = []
            for row in cur.fetchall():
                contacts.append({
                    'id': row[0],
                    'name': row[1],
                    'phone': row[2],
                    'instagram': row[3],
                    'telegram': row[4],
                    'avatar': row[5],
                    'notes': row[6],
                    'createdAt': row[7].isoformat() if row[7] else None,
                    'updatedAt': row[8].isoformat() if row[8] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'contacts': contacts})
            }
        
        elif method == 'POST':
            # Добавить новый контакт
            data = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO contacts (user_id, name, phone, instagram, telegram, avatar, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                user_id,
                data.get('name'),
                data.get('phone'),
                data.get('instagram'),
                data.get('telegram'),
                data.get('avatar'),
                data.get('notes')
            ))
            
            contact_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': contact_id, 'message': 'Контакт добавлен'})
            }
        
        elif method == 'PUT':
            # Обновить контакт
            data = json.loads(event.get('body', '{}'))
            contact_id = data.get('id')
            
            cur.execute('''
                UPDATE contacts
                SET name = %s, phone = %s, instagram = %s, telegram = %s, 
                    avatar = %s, notes = %s, updated_at = %s
                WHERE id = %s AND user_id = %s
            ''', (
                data.get('name'),
                data.get('phone'),
                data.get('instagram'),
                data.get('telegram'),
                data.get('avatar'),
                data.get('notes'),
                datetime.now(),
                contact_id,
                user_id
            ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Контакт обновлен'})
            }
        
        elif method == 'DELETE':
            # Удалить контакт
            contact_id = event.get('queryStringParameters', {}).get('id')
            
            cur.execute('''
                DELETE FROM contacts
                WHERE id = %s AND user_id = %s
            ''', (contact_id, user_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Контакт удален'})
            }
        
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
