"""
Универсальный голосовой помощник для поиска на сайте.
Обрабатывает голосовые запросы и ищет людей, мероприятия, услуги и объявления.
"""

import json
import os
import base64
from openai import OpenAI
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime


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
        
        # Используем GPT для понимания запроса и определения типа поиска
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Ты помощник для универсального поиска на сайте знакомств и мероприятий.
Определи что ищет пользователь и сформируй SQL запрос.

ДОСТУПНЫЕ ТИПЫ ПОИСКА:

1. ЛЮДИ (dating_profiles):
Поля: name, age, city, district, gender ('male'/'female'), interests (массив), bio, education, work, marital_status
Примеры: "найди девушек из Москвы", "парни 25-30 лет", "кто интересуется спортом"

2. МЕРОПРИЯТИЯ (events):
Поля: title, description, city, category, event_date, event_time, price, location, author_name
Примеры: "концерты в Москве", "мероприятия на выходных", "бесплатные события"

3. УСЛУГИ (services):
Поля: title, name, description, city, district, service_type, price, rating, is_online
Примеры: "фотограф в Москве", "онлайн услуги", "массажист"

4. ОБЪЯВЛЕНИЯ LIVE (ads + users):
ads.action: 'invite' (пригласить) или 'go' (пойти)
ads.schedule: текст описания (например "в кино", "на свидание", "на концерт", "на ужин", "в тур")
users: name, age, city, avatar_url, bio
Примеры: "кто хочет пойти в кино", "кто приглашает на свидание", "пойти на концерт", "совместный тур"

Для объявлений LIVE используй JOIN:
SELECT ads.id, ads.action, ads.schedule, users.name, users.age, users.city, users.avatar_url, users.id as user_id
FROM t_p19021063_social_connect_platf.ads
JOIN t_p19021063_social_connect_platf.users ON ads.user_id = users.id
WHERE ads.status = 'active' AND ...

Верни JSON:
{
  "type": "people|events|services|ads",
  "sql": "SELECT ... FROM t_p19021063_social_connect_platf.TABLE WHERE ... LIMIT 20",
  "explanation": "краткое объяснение"
}

ВАЖНО: всегда используй полное имя схемы и LIMIT 20"""
                },
                {"role": "user", "content": user_query}
            ],
            temperature=0.3
        )
        
        ai_response = json.loads(response.choices[0].message.content)
        search_type = ai_response['type']
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
        items = []
        for row in results:
            item = dict(row)
            # Конвертируем datetime объекты
            for key, value in item.items():
                if isinstance(value, datetime):
                    item[key] = value.isoformat()
                elif hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
            items.append(item)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'type': search_type,
                'query': user_query,
                'explanation': explanation,
                'results': items,
                'count': len(items)
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
