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
        
        payload = {
            'source_url': image_url,
            'script': {
                'type': 'text',
                'input': 'Hello',
                'provider': {
                    'type': 'microsoft',
                    'voice_id': 'en-US-JennyNeural'
                }
            },
            'config': {
                'stitch': True,
                'result_format': 'mp4'
            }
        }
        
        print(f'Sending request to D-ID API with payload: {json.dumps(payload)}')
        
        create_response = requests.post(
            'https://api.d-id.com/talks',
            headers={
                'Authorization': f'Basic {api_key}',
                'Content-Type': 'application/json'
            },
            json=payload,
            timeout=30
        )
        
        if create_response.status_code != 201:
            error_details = create_response.text
            print(f'D-ID API Error: Status {create_response.status_code}, Response: {error_details}')
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to create animation',
                    'status_code': create_response.status_code,
                    'details': error_details
                })
            }
        
        result = create_response.json()
        talk_id = result.get('id')
        
        if not talk_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No talk ID in response'})
            }
        
        max_attempts = 60
        for attempt in range(max_attempts):
            check_response = requests.get(
                f'https://api.d-id.com/talks/{talk_id}',
                headers={'Authorization': f'Basic {api_key}'},
                timeout=10
            )
            
            if check_response.status_code == 200:
                status_data = check_response.json()
                status = status_data.get('status')
                
                if status == 'done':
                    video_url = status_data.get('result_url')
                    if video_url:
                        return {
                            'statusCode': 200,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({
                                'videoUrl': video_url,
                                'talkId': talk_id
                            })
                        }
                elif status == 'error':
                    error_msg = status_data.get('error', {}).get('description', 'Unknown error')
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