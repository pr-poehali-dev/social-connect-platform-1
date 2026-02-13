"""Генерация естественного женского голоса через Microsoft Neural TTS (edge-tts) с пресетами настроения."""

import json
import os
import asyncio
import hashlib
import edge_tts
import boto3


VOICE = 'ru-RU-SvetlanaNeural'

MOOD_PRESETS = {
    'whisper': {
        'rate': '-15%',
        'pitch': '+5Hz',
        'volume': '-20%',
    },
    'tender': {
        'rate': '-10%',
        'pitch': '+4Hz',
        'volume': '-5%',
    },
    'playful': {
        'rate': '+5%',
        'pitch': '+6Hz',
        'volume': '+5%',
    },
    'passionate': {
        'rate': '-8%',
        'pitch': '+2Hz',
        'volume': '+10%',
    },
    'default': {
        'rate': '-5%',
        'pitch': '+3Hz',
        'volume': '+0%',
    },
}


async def generate_audio(text: str, mood: str = 'default') -> bytes:
    preset = MOOD_PRESETS.get(mood, MOOD_PRESETS['default'])
    communicate = edge_tts.Communicate(
        text,
        VOICE,
        rate=preset['rate'],
        pitch=preset['pitch'],
        volume=preset['volume'],
    )
    audio_data = b''
    async for chunk in communicate.stream():
        if chunk['type'] == 'audio':
            audio_data += chunk['data']
    return audio_data


def upload_to_s3(audio_bytes: bytes, filename: str) -> str:
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    key = f'voice/{filename}'
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=audio_bytes,
        ContentType='audio/mpeg',
    )
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context) -> dict:
    """Генерирует аудио из текста нежным женским голосом Олеси с поддержкой настроений"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    body = json.loads(event.get('body') or '{}')
    text = (body.get('text') or '').strip()
    mood = (body.get('mood') or 'default').strip().lower()

    if mood not in MOOD_PRESETS:
        mood = 'default'

    if not text or len(text) < 2:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Text is required (min 2 chars)'}),
        }

    if len(text) > 500:
        text = text[:497] + '...'

    text_hash = hashlib.md5(f'{mood}:{text}'.encode()).hexdigest()[:12]
    filename = f'olesya_{mood}_{text_hash}.mp3'

    audio_bytes = asyncio.get_event_loop().run_until_complete(generate_audio(text, mood))

    if not audio_bytes:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Failed to generate audio'}),
        }

    audio_url = upload_to_s3(audio_bytes, filename)

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'audioUrl': audio_url,
            'duration': round(len(audio_bytes) / 16000, 1),
            'mood': mood,
        }, ensure_ascii=False),
    }
