"""Ежедневные гороскопы — генерация через ИИ и кэширование в БД"""
import json
import os
import psycopg2
from datetime import date, datetime
import requests

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
}

ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

ZODIAC_RU = {
    'aries': 'Овен', 'taurus': 'Телец', 'gemini': 'Близнецы',
    'cancer': 'Рак', 'leo': 'Лев', 'virgo': 'Дева',
    'libra': 'Весы', 'scorpio': 'Скорпион', 'sagittarius': 'Стрелец',
    'capricorn': 'Козерог', 'aquarius': 'Водолей', 'pisces': 'Рыбы'
}

HOROSCOPE_TYPES = {
    'general': 'общий',
    'love': 'любовный',
    'business': 'деловой',
    'health': 'здоровье',
    'finance': 'финансовый'
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_cached_horoscope(sign, htype, target_date):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT content, rating, lucky_number, lucky_color FROM {SCHEMA}.daily_horoscopes "
            f"WHERE zodiac_sign = '{sign}' AND horoscope_type = '{htype}' AND horoscope_date = '{target_date}'"
        )
        row = cur.fetchone()
        if row:
            return {
                'content': row[0],
                'rating': row[1],
                'lucky_number': row[2],
                'lucky_color': row[3]
            }
        return None
    finally:
        conn.close()


def save_horoscope(sign, htype, target_date, content, rating, lucky_number, lucky_color):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.daily_horoscopes (zodiac_sign, horoscope_type, horoscope_date, content, rating, lucky_number, lucky_color) "
            f"VALUES ('{sign}', '{htype}', '{target_date}', $${content}$$, {rating}, {lucky_number}, '{lucky_color}') "
            f"ON CONFLICT (zodiac_sign, horoscope_type, horoscope_date) DO UPDATE SET content = $${content}$$, rating = {rating}"
        )
        conn.commit()
    finally:
        conn.close()


def generate_horoscope_ai(sign, htype, target_date):
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        return None

    sign_ru = ZODIAC_RU.get(sign, sign)
    type_ru = HOROSCOPE_TYPES.get(htype, htype)
    date_str = target_date.strftime('%d.%m.%Y')

    prompt = (
        f"Составь {type_ru} гороскоп для знака зодиака {sign_ru} на {date_str}. "
        f"Ответ в формате JSON: "
        f'{{"content": "текст гороскопа 3-5 предложений", "rating": число от 1 до 10, '
        f'"lucky_number": число от 1 до 99, "lucky_color": "цвет на русском"}}'
        f" Только JSON, без markdown."
    )

    resp = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'google/gemini-2.0-flash-001',
            'messages': [
                {'role': 'system', 'content': 'Ты профессиональный астролог. Отвечай только валидным JSON.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.8,
            'max_tokens': 500
        },
        timeout=30
    )

    if resp.status_code != 200:
        return None

    data = resp.json()
    text = data.get('choices', [{}])[0].get('message', {}).get('content', '')
    text = text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[-1].rsplit('```', 1)[0].strip()

    result = json.loads(text)
    return result


def handler(event, context):
    """Получение ежедневного гороскопа по знаку зодиака и типу"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'get')

    if action == 'signs':
        signs_list = [{'id': s, 'name': ZODIAC_RU[s]} for s in ZODIAC_SIGNS]
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'signs': signs_list, 'types': HOROSCOPE_TYPES})
        }

    if action == 'get':
        sign = params.get('sign', '').lower()
        htype = params.get('type', 'general').lower()
        target_date_str = params.get('date')

        if sign not in ZODIAC_SIGNS:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Неверный знак зодиака'})
            }

        if htype not in HOROSCOPE_TYPES:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Неверный тип гороскопа'})
            }

        if target_date_str:
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        else:
            target_date = date.today()

        cached = get_cached_horoscope(sign, htype, target_date)
        if cached:
            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'sign': sign,
                    'sign_ru': ZODIAC_RU[sign],
                    'type': htype,
                    'type_ru': HOROSCOPE_TYPES[htype],
                    'date': str(target_date),
                    **cached
                })
            }

        generated = generate_horoscope_ai(sign, htype, target_date)
        if not generated:
            return {
                'statusCode': 500,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не удалось сгенерировать гороскоп'})
            }

        save_horoscope(
            sign, htype, target_date,
            generated['content'],
            generated.get('rating', 5),
            generated.get('lucky_number', 7),
            generated.get('lucky_color', 'синий')
        )

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'sign': sign,
                'sign_ru': ZODIAC_RU[sign],
                'type': htype,
                'type_ru': HOROSCOPE_TYPES[htype],
                'date': str(target_date),
                'content': generated['content'],
                'rating': generated.get('rating', 5),
                'lucky_number': generated.get('lucky_number', 7),
                'lucky_color': generated.get('lucky_color', 'синий')
            })
        }

    if action == 'all':
        sign = params.get('sign', '').lower()
        if sign not in ZODIAC_SIGNS:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Неверный знак зодиака'})
            }

        target_date = date.today()
        results = {}

        for htype in HOROSCOPE_TYPES:
            cached = get_cached_horoscope(sign, htype, target_date)
            if cached:
                results[htype] = {
                    'type_ru': HOROSCOPE_TYPES[htype],
                    **cached
                }
            else:
                generated = generate_horoscope_ai(sign, htype, target_date)
                if generated:
                    save_horoscope(
                        sign, htype, target_date,
                        generated['content'],
                        generated.get('rating', 5),
                        generated.get('lucky_number', 7),
                        generated.get('lucky_color', 'синий')
                    )
                    results[htype] = {
                        'type_ru': HOROSCOPE_TYPES[htype],
                        'content': generated['content'],
                        'rating': generated.get('rating', 5),
                        'lucky_number': generated.get('lucky_number', 7),
                        'lucky_color': generated.get('lucky_color', 'синий')
                    }

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'sign': sign,
                'sign_ru': ZODIAC_RU[sign],
                'date': str(target_date),
                'horoscopes': results
            })
        }

    return {
        'statusCode': 400,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Неизвестное действие'})
    }
