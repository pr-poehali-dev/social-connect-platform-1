import json
import os
import requests
import time

def handler(event: dict, context) -> dict:
    '''API для оживления фотографий с помощью HeyGen'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        image_url = body.get('imageUrl')
        
        if not image_url:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'imageUrl is required'})
            }
        
        api_key = os.environ.get('HEYGEN_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'HEYGEN_API_KEY not configured'})
            }
        
        # Создаем анимированный аватар через HeyGen API
        create_response = requests.post(
            'https://api.heygen.com/v1/photo_avatar.generate',
            headers={
                'X-Api-Key': api_key,
                'Content-Type': 'application/json'
            },
            json={
                'image_url': image_url
            },
            timeout=30
        )
        
        if create_response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to create animation',
                    'details': create_response.text
                })
            }
        
        result = create_response.json()
        
        if result.get('code') != 100:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to create animation',
                    'details': result.get('message', 'Unknown error')
                })
            }
        
        avatar_id = result.get('data', {}).get('avatar_id')
        
        if not avatar_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No avatar_id in response'})
            }
        
        # Ждем завершения обработки (максимум 60 секунд)
        max_attempts = 60
        for attempt in range(max_attempts):
            check_response = requests.get(
                f'https://api.heygen.com/v1/photo_avatar.get?avatar_id={avatar_id}',
                headers={'X-Api-Key': api_key},
                timeout=10
            )
            
            if check_response.status_code == 200:
                status_data = check_response.json()
                
                if status_data.get('code') == 100:
                    data = status_data.get('data', {})
                    status = data.get('status')
                    
                    if status == 'completed':
                        preview_video_url = data.get('preview_video_url')
                        if preview_video_url:
                            return {
                                'statusCode': 200,
                                'headers': {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                'body': json.dumps({
                                    'videoUrl': preview_video_url,
                                    'avatarId': avatar_id
                                })
                            }
                    elif status == 'failed':
                        return {
                            'statusCode': 500,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({'error': 'Animation processing failed'})
                        }
            
            time.sleep(1)
        
        return {
            'statusCode': 408,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Animation processing timeout'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
