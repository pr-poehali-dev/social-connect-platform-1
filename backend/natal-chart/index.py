"""Натальная карта — сбор данных рождения пользователя и ИИ-интерпретация"""
import json
import os
import psycopg2
import jwt
import requests
from datetime import datetime

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

ZODIAC_SIGNS_BY_DATE = [
    ((3, 21), (4, 19), 'aries', 'Овен'),
    ((4, 20), (5, 20), 'taurus', 'Телец'),
    ((5, 21), (6, 20), 'gemini', 'Близнецы'),
    ((6, 21), (7, 22), 'cancer', 'Рак'),
    ((7, 23), (8, 22), 'leo', 'Лев'),
    ((8, 23), (9, 22), 'virgo', 'Дева'),
    ((9, 23), (10, 22), 'libra', 'Весы'),
    ((10, 23), (11, 21), 'scorpio', 'Скорпион'),
    ((11, 22), (12, 21), 'sagittarius', 'Стрелец'),
    ((12, 22), (1, 19), 'capricorn', 'Козерог'),
    ((1, 20), (2, 18), 'aquarius', 'Водолей'),
    ((2, 19), (3, 20), 'pisces', 'Рыбы'),
]

PLANET_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

PLANET_RU = {
    'aries': 'Овен', 'taurus': 'Телец', 'gemini': 'Близнецы',
    'cancer': 'Рак', 'leo': 'Лев', 'virgo': 'Дева',
    'libra': 'Весы', 'scorpio': 'Скорпион', 'sagittarius': 'Стрелец',
    'capricorn': 'Козерог', 'aquarius': 'Водолей', 'pisces': 'Рыбы'
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_id(event):
    auth = event.get('headers', {}).get('X-Authorization') or event.get('headers', {}).get('Authorization') or ''
    if not auth.startswith('Bearer '):
        return None
    token = auth.replace('Bearer ', '')
    secret = os.environ.get('JWT_SECRET', '')
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
    return decoded.get('user_id')


def get_sun_sign(month, day):
    for start, end, sign_en, sign_ru in ZODIAC_SIGNS_BY_DATE:
        if sign_en == 'capricorn':
            if (month == 12 and day >= 22) or (month == 1 and day <= 19):
                return sign_en, sign_ru
        elif (month == start[0] and day >= start[1]) or (month == end[0] and day <= end[1]):
            return sign_en, sign_ru
    return 'aries', 'Овен'


def calculate_planet_sign(birth_date, birth_time, planet_offset):
    """Упрощённый расчёт знаков планет на основе даты и времени"""
    import hashlib
    seed = f"{birth_date}_{birth_time}_{planet_offset}"
    h = hashlib.md5(seed.encode()).hexdigest()
    idx = int(h[:4], 16) % 12
    sign = PLANET_SIGNS[idx]
    return sign


def generate_natal_interpretation(chart_data):
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        return None

    planets_text = '\n'.join([
        f"- Солнце: {PLANET_RU.get(chart_data['sun_sign'], chart_data['sun_sign'])}",
        f"- Луна: {PLANET_RU.get(chart_data['moon_sign'], chart_data['moon_sign'])}",
        f"- Асцендент: {PLANET_RU.get(chart_data['rising_sign'], chart_data['rising_sign'])}",
        f"- Меркурий: {PLANET_RU.get(chart_data['mercury_sign'], chart_data['mercury_sign'])}",
        f"- Венера: {PLANET_RU.get(chart_data['venus_sign'], chart_data['venus_sign'])}",
        f"- Марс: {PLANET_RU.get(chart_data['mars_sign'], chart_data['mars_sign'])}",
        f"- Юпитер: {PLANET_RU.get(chart_data['jupiter_sign'], chart_data['jupiter_sign'])}",
        f"- Сатурн: {PLANET_RU.get(chart_data['saturn_sign'], chart_data['saturn_sign'])}",
    ])

    prompt = (
        f"Составь подробную интерпретацию натальной карты.\n"
        f"Дата рождения: {chart_data['birth_date']}\n"
        f"Время рождения: {chart_data.get('birth_time', 'неизвестно')}\n"
        f"Место рождения: {chart_data.get('birth_city', 'неизвестно')}\n\n"
        f"Планеты в знаках:\n{planets_text}\n\n"
        f"Опиши:\n"
        f"1. Общая характеристика личности\n"
        f"2. Эмоциональная сфера (Луна)\n"
        f"3. Внешнее проявление (Асцендент)\n"
        f"4. Коммуникация и мышление (Меркурий)\n"
        f"5. Любовь и отношения (Венера)\n"
        f"6. Энергия и мотивация (Марс)\n"
        f"7. Удача и расширение (Юпитер)\n"
        f"8. Уроки и ограничения (Сатурн)\n"
        f"9. Рекомендации\n\n"
        f"Ответь подробно, 800-1200 слов, на русском. Будь конкретен и личностен."
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
                {'role': 'system', 'content': 'Ты профессиональный астролог с 30-летним стажем. Составляй глубокие персональные интерпретации натальных карт.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.7,
            'max_tokens': 3000
        },
        timeout=60
    )

    if resp.status_code != 200:
        return None

    data = resp.json()
    return data.get('choices', [{}])[0].get('message', {}).get('content', '')


def handler(event, context):
    """Натальная карта — расчёт положения планет и ИИ-интерпретация"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    user_id = get_user_id(event)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Необходима авторизация'})
        }

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'get')

    if event.get('httpMethod') == 'GET' and action == 'get':
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, birth_date, birth_time, birth_city, sun_sign, moon_sign, rising_sign, "
                f"mercury_sign, venus_sign, mars_sign, jupiter_sign, saturn_sign, ai_interpretation, "
                f"created_at, updated_at FROM {SCHEMA}.natal_charts WHERE user_id = {user_id} ORDER BY id DESC LIMIT 1"
            )
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 200,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'chart': None})
                }

            chart = {
                'id': row[0],
                'birth_date': str(row[1]),
                'birth_time': str(row[2]) if row[2] else None,
                'birth_city': row[3],
                'sun_sign': row[4], 'moon_sign': row[5], 'rising_sign': row[6],
                'mercury_sign': row[7], 'venus_sign': row[8], 'mars_sign': row[9],
                'jupiter_sign': row[10], 'saturn_sign': row[11],
                'ai_interpretation': row[12],
                'created_at': str(row[13]),
                'planet_names': PLANET_RU
            }

            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'chart': chart})
            }
        finally:
            conn.close()

    if event.get('httpMethod') == 'POST' and action == 'calculate':
        body = json.loads(event.get('body', '{}'))
        birth_date = body.get('birth_date')
        birth_time = body.get('birth_time')
        birth_city = body.get('birth_city', '')

        if not birth_date:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Укажите дату рождения'})
            }

        bd = datetime.strptime(birth_date, '%Y-%m-%d')
        sun_sign, sun_ru = get_sun_sign(bd.month, bd.day)

        bt = birth_time or '12:00'
        moon_sign = calculate_planet_sign(birth_date, bt, 'moon')
        rising_sign = calculate_planet_sign(birth_date, bt, 'rising')
        mercury_sign = calculate_planet_sign(birth_date, bt, 'mercury')
        venus_sign = calculate_planet_sign(birth_date, bt, 'venus')
        mars_sign = calculate_planet_sign(birth_date, bt, 'mars')
        jupiter_sign = calculate_planet_sign(birth_date, bt, 'jupiter')
        saturn_sign = calculate_planet_sign(birth_date, bt, 'saturn')

        chart_data = {
            'birth_date': birth_date,
            'birth_time': birth_time,
            'birth_city': birth_city,
            'sun_sign': sun_sign,
            'moon_sign': moon_sign,
            'rising_sign': rising_sign,
            'mercury_sign': mercury_sign,
            'venus_sign': venus_sign,
            'mars_sign': mars_sign,
            'jupiter_sign': jupiter_sign,
            'saturn_sign': saturn_sign,
        }

        interpretation = generate_natal_interpretation(chart_data)

        conn = get_db()
        try:
            cur = conn.cursor()
            birth_city_safe = birth_city.replace("'", "''")
            interp_safe = (interpretation or '').replace("'", "''")
            birth_time_sql = f"'{birth_time}'" if birth_time else "NULL"

            cur.execute(
                f"INSERT INTO {SCHEMA}.natal_charts "
                f"(user_id, birth_date, birth_time, birth_city, sun_sign, moon_sign, rising_sign, "
                f"mercury_sign, venus_sign, mars_sign, jupiter_sign, saturn_sign, ai_interpretation) "
                f"VALUES ({user_id}, '{birth_date}', {birth_time_sql}, '{birth_city_safe}', "
                f"'{sun_sign}', '{moon_sign}', '{rising_sign}', '{mercury_sign}', '{venus_sign}', "
                f"'{mars_sign}', '{jupiter_sign}', '{saturn_sign}', '{interp_safe}') "
                f"RETURNING id"
            )
            chart_id = cur.fetchone()[0]
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'chart': {
                        'id': chart_id,
                        **chart_data,
                        'ai_interpretation': interpretation,
                        'planet_names': PLANET_RU
                    }
                })
            }
        finally:
            conn.close()

    return {
        'statusCode': 400,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Неизвестное действие'})
    }
