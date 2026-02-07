import json
import os
import requests
import time

def handler(event: dict, context) -> dict:
    '''API для оживления фотографий с помощью HeyGen Avatar IV'''
    
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
        
        # Шаг 1: Загружаем фото и получаем talking_photo_id
        upload_response = requests.post(
            'https://api.heygen.com/v1/talking_photo',
            headers={
                'X-Api-Key': api_key,
                'Content-Type': 'application/json'
            },
            json={
                'url': image_url
            },
            timeout=30
        )
        
        if upload_response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to upload photo',
                    'details': upload_response.text
                })
            }
        
        upload_result = upload_response.json()
        if upload_result.get('code') != 100:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to upload photo',
                    'details': upload_result.get('message', 'Unknown error')
                })
            }
        
        talking_photo_id = upload_result.get('data', {}).get('id')
        if not talking_photo_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No talking_photo_id in response'})
            }
        
        # Шаг 2: Создаем видео с Avatar IV
        create_response = requests.post(
            'https://api.heygen.com/v2/video/generate',
            headers={
                'X-Api-Key': api_key,
                'Content-Type': 'application/json'
            },
            json={
                'video_inputs': [{
                    'character': {
                        'type': 'talking_photo',
                        'talking_photo_id': talking_photo_id,
                        'talking_style': 'natural'
                    },
                    'voice': {
                        'type': 'text',
                        'input_text': ' ',
                        'voice_id': 'e3827ec5b0e5433c9435e4309a4cdfd5'
                    }
                }],
                'dimension': {
                    'width': 512,
                    'height': 512
                },
                'aspect_ratio': '1:1'
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
        
        video_id = result.get('data', {}).get('video_id')
        
        if not video_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No video_id in response'})
            }
        
        # Ждем завершения обработки (максимум 60 секунд)
        max_attempts = 60
        for attempt in range(max_attempts):
            check_response = requests.get(
                f'https://api.heygen.com/v1/video_status.get?video_id={video_id}',
                headers={'X-Api-Key': api_key},
                timeout=10
            )
            
            if check_response.status_code == 200:
                status_data = check_response.json()
                
                if status_data.get('code') == 100:
                    data = status_data.get('data', {})
                    status = data.get('status')
                    
                    if status == 'completed':
                        video_url = data.get('video_url')
                        if video_url:
                            return {
                                'statusCode': 200,
                                'headers': {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                'body': json.dumps({
                                    'videoUrl': video_url,
                                    'videoId': video_id
                                })
                            }
                    elif status == 'failed':
                        error_msg = data.get('error', 'Unknown error')
                        return {
                            'statusCode': 500,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({
                                'error': 'Animation processing failed',
                                'details': error_msg
                            })
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