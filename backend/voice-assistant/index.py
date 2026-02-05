"""
Голосовой помощник для поиска людей на сайте.
Обрабатывает голосовые запросы и выполняет поиск в базе данных.
"""

import json
import os
import base64
from openai import OpenAI
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: dict, context) -> dict:
    """
    Обрабатывает голосовые запросы пользователя и возвращает результаты поиска
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        audio_base64 = body.get('audio')
        
        if not audio_base64:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Audio data required'})
            }
        
        # Распознаем речь через OpenAI Whisper
        client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
        audio_bytes = base64.b64decode(audio_base64)
        
        # Сохраняем аудио во временный файл
        temp_path = '/tmp/audio.webm'
        with open(temp_path, 'wb') as f:
            f.write(audio_bytes)
        
        # Распознаем речь
        with open(temp_path, 'rb') as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ru"
            )
        
        user_query = transcription.text
        
        # Используем GPT для понимания запроса и формирования SQL
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Ты помощник для поиска людей на сайте знакомств.
Пользователь дает голосовой запрос, твоя задача - сформировать SQL запрос для поиска в базе данных.

Таблица: t_p19021063_social_connect_platf.dating_profiles
Поля:
- name (имя)
- age (возраст)
- city (город)
- district (район)
- gender (пол: 'male' или 'female')
- interests (массив интересов)
- bio (описание)
- education (образование)
- work (работа)
- marital_status (семейное положение)
- dating_goal (цель знакомства)

Верни JSON в формате:
{
  "sql": "SELECT * FROM t_p19021063_social_connect_platf.dating_profiles WHERE ...",
  "explanation": "краткое объяснение что найдено"
}

Примеры:
- "найди девушек из Москвы" -> WHERE city = 'Москва' AND gender = 'female'
- "покажи парней 25-30 лет" -> WHERE gender = 'male' AND age BETWEEN 25 AND 30
- "кто интересуется спортом" -> WHERE 'спорт' = ANY(interests)

ВАЖНО: всегда добавляй LIMIT 20"""
                },
                {"role": "user", "content": user_query}
            ],
            temperature=0.3
        )
        
        ai_response = json.loads(response.choices[0].message.content)
        sql_query = ai_response['sql']
        explanation = ai_response['explanation']
        
        # Выполняем SQL запрос
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(sql_query)
        results = cur.fetchall()
        cur.close()
        conn.close()
        
        # Преобразуем результаты в JSON-совместимый формат
        profiles = []
        for row in results:
            profile = dict(row)
            if profile.get('created_at'):
                profile['created_at'] = profile['created_at'].isoformat()
            if profile.get('updated_at'):
                profile['updated_at'] = profile['updated_at'].isoformat()
            profiles.append(profile)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'query': user_query,
                'explanation': explanation,
                'results': profiles,
                'count': len(profiles)
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
