import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''Получение списка профилей знакомств с фильтрацией'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    params = event.get('queryStringParameters') or {}
    gender = params.get('gender', '')
    age_from = params.get('ageFrom', '')
    age_to = params.get('ageTo', '')
    city = params.get('city', '')
    district = params.get('district', '')
    
    query = "SELECT * FROM t_p19021063_social_connect_platf.dating_profiles WHERE 1=1"
    
    if gender:
        query += f" AND gender = '{gender}'"
    if age_from:
        query += f" AND age >= {age_from}"
    if age_to:
        query += f" AND age <= {age_to}"
    if city:
        query += f" AND city ILIKE '%{city}%'"
    if district:
        query += f" AND district ILIKE '%{district}%'"
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query)
    profiles = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    profiles_list = []
    for profile in profiles:
        profiles_list.append({
            'id': profile['id'],
            'name': profile['name'],
            'age': profile['age'],
            'city': profile['city'],
            'district': profile['district'],
            'interests': profile['interests'] or [],
            'bio': profile['bio'],
            'image': profile['avatar_url'],
            'height': profile['height'],
            'bodyType': profile['body_type'],
            'maritalStatus': profile['marital_status'],
            'hasChildren': profile['has_children'],
            'education': profile['education'],
            'work': profile['work'],
            'financialStatus': profile['financial_status'],
            'hasCar': profile['has_car'],
            'hasHousing': profile['has_housing'],
            'datingGoal': profile['dating_goal'],
            'isTopAd': profile.get('is_top_ad', False)
        })
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'profiles': profiles_list}),
        'isBase64Encoded': False
    }
