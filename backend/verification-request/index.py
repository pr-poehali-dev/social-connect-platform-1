import json
import os
import base64
import boto3
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для отправки заявок на верификацию профиля с загрузкой 2 фото'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    token = headers.get('X-Authorization') or headers.get('x-authorization') or headers.get('Authorization') or headers.get('authorization') or ''
    token = token.replace('Bearer ', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        schema = 't_p19021063_social_connect_platf'
        
        cur.execute(f"""
            SELECT rt.user_id FROM {schema}.refresh_tokens rt
            WHERE rt.token = %s AND rt.expires_at > NOW()
        """, (token,))
        
        token_data = cur.fetchone()
        if not token_data:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid token'})
            }
        
        user_id = token_data['user_id']
        
        if method == 'GET':
            cur.execute(f"""
                SELECT id, status, created_at, admin_comment, reviewed_at
                FROM {schema}.verification_requests
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 1
            """, (user_id,))
            
            request = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(request) if request else None, default=str)
            }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            
            selfie_base64 = data.get('selfie_photo')
            document_base64 = data.get('document_photo')
            comment = data.get('comment', '')
            
            if not selfie_base64 or not document_base64:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Both photos are required'})
                }
            
            cur.execute(f"""
                SELECT id FROM {schema}.verification_requests
                WHERE user_id = %s AND status = 'pending'
            """, (user_id,))
            
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'You already have a pending verification request'})
                }
            
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            selfie_data = base64.b64decode(selfie_base64.split(',')[1] if ',' in selfie_base64 else selfie_base64)
            selfie_key = f'verification/user_{user_id}_selfie_{timestamp}.jpg'
            s3.put_object(Bucket='files', Key=selfie_key, Body=selfie_data, ContentType='image/jpeg')
            selfie_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{selfie_key}"
            
            document_data = base64.b64decode(document_base64.split(',')[1] if ',' in document_base64 else document_base64)
            document_key = f'verification/user_{user_id}_document_{timestamp}.jpg'
            s3.put_object(Bucket='files', Key=document_key, Body=document_data, ContentType='image/jpeg')
            document_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{document_key}"
            
            cur.execute(f"""
                INSERT INTO {schema}.verification_requests 
                (user_id, selfie_photo_url, document_photo_url, comment, status)
                VALUES (%s, %s, %s, %s, 'pending')
                RETURNING id, created_at
            """, (user_id, selfie_url, document_url, comment))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': result['id'],
                    'created_at': str(result['created_at']),
                    'message': 'Verification request submitted successfully'
                })
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    finally:
        cur.close()
        conn.close()