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
    height_from = params.get('heightFrom', '')
    height_to = params.get('heightTo', '')
    body_type = params.get('bodyType', '')
    marital_status = params.get('maritalStatus', '')
    has_children = params.get('hasChildren', '')
    financial_status = params.get('financialStatus', '')
    has_car = params.get('hasCar', '')
    has_housing = params.get('hasHousing', '')
    dating_goal = params.get('datingGoal', '')
    
    query = "SELECT id, name, nickname, gender, age_from as age, city, district, interests, bio, avatar_url, height, body_type, marital_status, children, profession, financial_status, has_car, has_housing, dating_goal, created_at FROM t_p19021063_social_connect_platf.users WHERE nickname IS NOT NULL"
    
    if gender:
        query += f" AND gender = '{gender}'"
    if age_from:
        query += f" AND age_from >= {age_from}"
    if age_to:
        query += f" AND age_from <= {age_to}"
    if city:
        query += f" AND city ILIKE '%{city}%'"
    if district:
        query += f" AND district ILIKE '%{district}%'"
    if height_from:
        query += f" AND height >= {height_from}"
    if height_to:
        query += f" AND height <= {height_to}"
    if body_type:
        query += f" AND body_type = '{body_type}'"
    if marital_status:
        query += f" AND marital_status = '{marital_status}'"
    if has_children:
        query += f" AND children = '{has_children}'"
    if financial_status:
        query += f" AND financial_status = '{financial_status}'"
    if has_car:
        query += f" AND has_car = '{has_car}'"
    if has_housing:
        query += f" AND has_housing = '{has_housing}'"
    if dating_goal:
        query += f" AND dating_goal = '{dating_goal}'"
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query)
    profiles = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    profiles_list = []
    for profile in profiles:
        profiles_list.append({
            'id': profile['id'],
            'name': profile['name'] or profile['nickname'],
            'nickname': profile['nickname'],
            'age': profile['age'],
            'city': profile['city'],
            'district': profile['district'],
            'interests': profile['interests'] or [],
            'bio': profile['bio'],
            'image': profile['avatar_url'],
            'height': profile['height'],
            'bodyType': profile['body_type'],
            'maritalStatus': profile['marital_status'],
            'hasChildren': profile['children'],
            'profession': profile['profession'],
            'financialStatus': profile['financial_status'],
            'hasCar': profile['has_car'],
            'hasHousing': profile['has_housing'],
            'datingGoal': profile['dating_goal'],
            'isTopAd': False
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