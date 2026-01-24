import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления анкетами знакомств'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            profile_id = query_params.get('id')
            
            if profile_id:
                cursor.execute('SELECT * FROM dating_profiles WHERE id = %s', (profile_id,))
                profile = cursor.fetchone()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(profile) if profile else {}),
                    'isBase64Encoded': False
                }
            
            city = query_params.get('city', '')
            gender = query_params.get('gender', '')
            age_from = query_params.get('age_from', '')
            age_to = query_params.get('age_to', '')
            is_top_ad = query_params.get('is_top_ad', 'false') == 'true'
            
            query = 'SELECT * FROM dating_profiles WHERE 1=1'
            params = []
            
            if city:
                query += ' AND city = %s'
                params.append(city)
            if gender:
                query += ' AND body_type = %s'
                params.append(gender)
            if age_from:
                query += ' AND age >= %s'
                params.append(int(age_from))
            if age_to:
                query += ' AND age <= %s'
                params.append(int(age_to))
            if is_top_ad:
                query += ' AND is_top_ad = TRUE'
            
            query += ' ORDER BY created_at DESC LIMIT 100'
            
            cursor.execute(query, params)
            profiles = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(p) for p in profiles], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO dating_profiles 
                (user_id, name, age, city, district, interests, bio, avatar_url, height, 
                 body_type, marital_status, has_children, education, work, financial_status, 
                 has_car, has_housing, dating_goal, is_top_ad)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('user_id'), body.get('name'), body.get('age'), 
                body.get('city'), body.get('district'), body.get('interests', []),
                body.get('bio'), body.get('avatar_url'), body.get('height'),
                body.get('body_type'), body.get('marital_status'), body.get('has_children'),
                body.get('education'), body.get('work'), body.get('financial_status'),
                body.get('has_car'), body.get('has_housing'), body.get('dating_goal'),
                body.get('is_top_ad', False)
            ))
            
            profile_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': profile_id, 'status': 'created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            query_params = event.get('queryStringParameters', {}) or {}
            profile_id = query_params.get('id')
            body = json.loads(event.get('body', '{}'))
            
            if not profile_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Profile ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE dating_profiles SET
                    name = %s, age = %s, city = %s, district = %s, interests = %s,
                    bio = %s, avatar_url = %s, height = %s, body_type = %s,
                    marital_status = %s, has_children = %s, education = %s, work = %s,
                    financial_status = %s, has_car = %s, has_housing = %s, dating_goal = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body.get('name'), body.get('age'), body.get('city'), body.get('district'),
                body.get('interests', []), body.get('bio'), body.get('avatar_url'),
                body.get('height'), body.get('body_type'), body.get('marital_status'),
                body.get('has_children'), body.get('education'), body.get('work'),
                body.get('financial_status'), body.get('has_car'), body.get('has_housing'),
                body.get('dating_goal'), profile_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'updated'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()