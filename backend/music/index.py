import json
import os
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    '''API для работы с музыкой Jamendo: поиск треков, получение плейлистов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
    
    client_id = os.environ.get('JAMENDO_CLIENT_ID')
    if not client_id:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Jamendo API not configured'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'search')
    
    if action == 'search':
        query = params.get('query', 'popular')
        limit = params.get('limit', '20')
        
        url = f'https://api.jamendo.com/v3.0/tracks/?client_id={client_id}&format=json&limit={limit}&search={urllib.parse.quote(query)}&include=musicinfo&audiodownload=mp32'
        
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                
                tracks = []
                for track in data.get('results', []):
                    audio_url = track.get('audiodownload_allowed') and track.get('audiodownload') or track.get('audio')
                    tracks.append({
                        'id': track.get('id'),
                        'name': track.get('name'),
                        'artist': track.get('artist_name'),
                        'album': track.get('album_name'),
                        'duration': track.get('duration'),
                        'image': track.get('album_image'),
                        'audio': audio_url
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'tracks': tracks}),
                    'isBase64Encoded': False
                }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    if action == 'popular':
        limit = params.get('limit', '20')
        
        url = f'https://api.jamendo.com/v3.0/tracks/?client_id={client_id}&format=json&limit={limit}&order=popularity_total&include=musicinfo&audiodownload=mp32'
        
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                
                tracks = []
                for track in data.get('results', []):
                    audio_url = track.get('audiodownload_allowed') and track.get('audiodownload') or track.get('audio')
                    tracks.append({
                        'id': track.get('id'),
                        'name': track.get('name'),
                        'artist': track.get('artist_name'),
                        'album': track.get('album_name'),
                        'duration': track.get('duration'),
                        'image': track.get('album_image'),
                        'audio': audio_url
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'tracks': tracks}),
                    'isBase64Encoded': False
                }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }