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
    profile_id = params.get('id', '')
    action = params.get('action', '')
    
    # Поиск пользователей по имени
    if action == 'search':
        search_query = params.get('query', '').strip()
        if not search_query:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Search query is required'}),
                'isBase64Encoded': False
            }
        
        # Ищем по first_name, last_name, nickname
        escaped_query = search_query.replace("'", "''")
        cursor.execute(f"""
            SELECT id, first_name, last_name, nickname, avatar_url
            FROM t_p19021063_social_connect_platf.users
            WHERE 
                LOWER(first_name) LIKE LOWER('%{escaped_query}%')
                OR LOWER(last_name) LIKE LOWER('%{escaped_query}%')
                OR LOWER(nickname) LIKE LOWER('%{escaped_query}%')
            LIMIT 20
        """)
        
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'users': [dict(u) for u in users]}, default=str),
            'isBase64Encoded': False
        }
    
    if profile_id:
        cursor.execute(
            "SELECT id, name, nickname, gender, age_from as age, city, district, interests, bio, avatar_url, height, body_type, marital_status, children, profession, financial_status, has_car, has_housing, dating_goal, status_text, created_at, last_login_at, CASE WHEN last_login_at > NOW() - INTERVAL '5 minutes' THEN true ELSE false END as is_online FROM t_p19021063_social_connect_platf.users WHERE id = %s",
            (profile_id,)
        )
        profile = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not profile:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Profile not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'profile': {
                    'id': profile['id'],
                    'user_id': profile['id'],
                    'name': profile['name'] or profile['nickname'],
                    'nickname': profile['nickname'],
                    'age': profile['age'],
                    'city': profile['city'],
                    'district': profile['district'],
                    'gender': profile['gender'],
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
                    'status_text': profile['status_text'],
                    'isTopAd': False,
                    'lastLoginAt': profile['last_login_at'].isoformat() if profile.get('last_login_at') else None,
                    'isOnline': profile['is_online'],
                    'is_favorite': False,
                    'friend_request_sent': False,
                    'is_friend': False
                }
            }),
            'isBase64Encoded': False
        }
    
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
    with_photo = params.get('withPhoto', '')
    
    query = "SELECT id, name, nickname, gender, age_from as age, city, district, interests, bio, avatar_url, height, body_type, marital_status, children, profession, financial_status, has_car, has_housing, dating_goal, status_text, created_at, last_login_at, CASE WHEN last_login_at > NOW() - INTERVAL '5 minutes' THEN true ELSE false END as is_online FROM t_p19021063_social_connect_platf.users WHERE nickname IS NOT NULL"
    
    if with_photo:
        query += " AND avatar_url IS NOT NULL AND avatar_url != ''"
    
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
            'user_id': profile['id'],
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
            'status_text': profile['status_text'],
            'isTopAd': False,
            'lastLoginAt': profile['last_login_at'].isoformat() if profile.get('last_login_at') else None,
            'isOnline': profile['is_online']
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