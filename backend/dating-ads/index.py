import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления топ объявлениями знакомств'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            gender = query_params.get('gender', '')
            
            query = 'SELECT * FROM dating_ads WHERE is_active = TRUE'
            params = []
            
            if gender and gender != 'all':
                query += ' AND gender = %s'
                params.append(gender)
            
            query += ' ORDER BY created_at DESC LIMIT 100'
            
            cursor.execute(query, params)
            ads = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(ad) for ad in ads], default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO dating_ads 
                (user_id, title, description, gender, age, location, city, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('user_id'), body.get('title'), body.get('description'),
                body.get('gender'), body.get('age'), body.get('location'),
                body.get('city'), body.get('image_url')
            ))
            
            ad_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': ad_id, 'status': 'created'})
            }
        
        elif method == 'PUT':
            query_params = event.get('queryStringParameters', {}) or {}
            ad_id = query_params.get('id')
            body = json.loads(event.get('body', '{}'))
            
            if not ad_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Ad ID required'})
                }
            
            cursor.execute('''
                UPDATE dating_ads SET
                    title = %s, description = %s, gender = %s, age = %s,
                    location = %s, city = %s, image_url = %s, is_active = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body.get('title'), body.get('description'), body.get('gender'),
                body.get('age'), body.get('location'), body.get('city'),
                body.get('image_url'), body.get('is_active', True), ad_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
