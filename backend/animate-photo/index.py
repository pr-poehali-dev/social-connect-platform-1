import json
import os
import requests
import time

def handler(event: dict, context) -> dict:
    '''API для оживления фотографий с помощью D-ID'''
    
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
        
        api_key = os.environ.get('DID_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'DID_API_KEY not configured'})
            }
        
        # Создаем анимацию через D-ID API
        create_response = requests.post(
            'https://api.d-id.com/animations',
            headers={
                'Authorization': api_key,
                'Content-Type': 'application/json'
            },
            json={
                'source_url': image_url,
                'driver_url': 'bank://lively',
                'config': {
                    'stitch': True,
                    'result_format': 'mp4'
                }
            },
            timeout=30
        )
        
        if create_response.status_code != 201:
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
        
        animation_data = create_response.json()
        animation_id = animation_data.get('id')
        
        # Ждем завершения обработки (максимум 30 секунд)
        max_attempts = 30
        for attempt in range(max_attempts):
            check_response = requests.get(
                f'https://api.d-id.com/animations/{animation_id}',
                headers={'Authorization': api_key},
                timeout=10
            )
            
            if check_response.status_code == 200:
                result_data = check_response.json()
                status = result_data.get('status')
                
                if status == 'done':
                    video_url = result_data.get('result_url')
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'videoUrl': video_url,
                            'animationId': animation_id
                        })
                    }
                elif status == 'error':
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
