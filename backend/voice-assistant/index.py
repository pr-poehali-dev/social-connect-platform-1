"""Умный текстовый поиск по сайту: люди, мероприятия, услуги, объявления."""

import json
import os
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p19021063_social_connect_platf')

PEOPLE_KEYWORDS = [
    'девуш', 'парн', 'мужчин', 'женщин', 'людей', 'люди', 'человек',
    'найди', 'знаком', 'профил', 'анкет', 'подруг', 'друз', 'друг',
    'лет', 'возраст', 'молод', 'взросл'
]
EVENTS_KEYWORDS = [
    'концерт', 'мероприят', 'событи', 'вечеринк', 'выставк', 'фестивал',
    'спектакл', 'шоу', 'встреч', 'тусовк', 'выходн', 'праздник', 'вечер'
]
SERVICES_KEYWORDS = [
    'услуг', 'фотограф', 'массаж', 'репетитор', 'тренер', 'стилист',
    'визажист', 'мастер', 'специалист', 'курс', 'занят', 'обучен',
    'психолог', 'юрист', 'дизайнер', 'программист'
]
ADS_KEYWORDS = [
    'пойти', 'пойд', 'приглаш', 'кино', 'кафе', 'ресторан', 'свидан',
    'прогул', 'погуля', 'компани', 'вместе', 'совместн', 'объявлен',
    'лайв', 'live', 'тур', 'путешеств', 'ужин'
]

GENDER_MAP = {
    'девуш': 'female', 'женщин': 'female', 'подруг': 'female',
    'парн': 'male', 'мужчин': 'male', 'друз': 'male', 'друг': 'male'
}


def detect_type(text):
    """Определяет тип поиска по ключевым словам"""
    lower = text.lower()
    scores = {'people': 0, 'events': 0, 'services': 0, 'ads': 0}

    for kw in PEOPLE_KEYWORDS:
        if kw in lower:
            scores['people'] += 1
    for kw in EVENTS_KEYWORDS:
        if kw in lower:
            scores['events'] += 1
    for kw in SERVICES_KEYWORDS:
        if kw in lower:
            scores['services'] += 1
    for kw in ADS_KEYWORDS:
        if kw in lower:
            scores['ads'] += 1

    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return 'people'
    return best


def extract_city(text):
    """Извлекает город из запроса"""
    lower = text.lower()
    patterns = [
        r'(?:из|в|город[еа]?)\s+([А-ЯЁа-яё-]+(?:\s[А-ЯЁа-яё-]+)?)',
    ]
    for p in patterns:
        m = re.search(p, lower)
        if m:
            city = m.group(1).strip()
            if city not in ('кино', 'кафе', 'ресторан', 'тур', 'клуб'):
                return city.title()
    return None


def extract_gender(text):
    """Определяет пол из запроса"""
    lower = text.lower()
    for kw, gender in GENDER_MAP.items():
        if kw in lower:
            return gender
    return None


def extract_age_range(text):
    """Извлекает диапазон возраста"""
    m = re.search(r'(\d{2})\s*[-–]\s*(\d{2})\s*лет', text)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.search(r'от\s*(\d{2})\s*до\s*(\d{2})', text)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.search(r'(\d{2})\s*лет', text)
    if m:
        age = int(m.group(1))
        return max(18, age - 3), age + 3
    return None, None


def search_people(text, cur):
    """Поиск людей"""
    conditions = []
    params = []

    gender = extract_gender(text)
    if gender:
        conditions.append("dp.gender = %s")
        params.append(gender)

    city = extract_city(text)
    if city:
        conditions.append("LOWER(dp.city) LIKE %s")
        params.append(f'%{city.lower()}%')

    age_from, age_to = extract_age_range(text)
    if age_from is not None:
        conditions.append("dp.age >= %s")
        params.append(age_from)
    if age_to is not None:
        conditions.append("dp.age <= %s")
        params.append(age_to)

    where = " AND ".join(conditions) if conditions else "1=1"

    cur.execute(f"""
        SELECT dp.id, dp.user_id, dp.name, dp.age, dp.city, dp.gender,
               dp.avatar_url, dp.bio, dp.interests
        FROM {SCHEMA}.dating_profiles dp
        WHERE {where}
        ORDER BY dp.created_at DESC
        LIMIT 20
    """, params)

    return cur.fetchall()


def search_events(text, cur):
    """Поиск мероприятий"""
    conditions = ["e.is_active = true"]
    params = []

    city = extract_city(text)
    if city:
        conditions.append("LOWER(e.city) LIKE %s")
        params.append(f'%{city.lower()}%')

    lower = text.lower()
    if 'бесплатн' in lower:
        conditions.append("(e.price = 0 OR e.price IS NULL)")

    if 'выходн' in lower:
        conditions.append("EXTRACT(DOW FROM e.event_date) IN (0, 6)")

    keywords_for_search = []
    for word in text.split():
        w = word.lower().strip('.,!?')
        if len(w) > 3 and w not in ('найди', 'найти', 'покажи', 'хочу', 'город', 'ближайш'):
            keywords_for_search.append(w)

    if keywords_for_search:
        search_term = ' | '.join(keywords_for_search[:3])
        conditions.append(f"(LOWER(e.title) LIKE %s OR LOWER(e.description) LIKE %s OR LOWER(e.category) LIKE %s)")
        like_term = f'%{keywords_for_search[0]}%'
        params.extend([like_term, like_term, like_term])

    where = " AND ".join(conditions)

    cur.execute(f"""
        SELECT e.id, e.title, e.description, e.city, e.category,
               e.event_date::text, e.event_time::text, e.price,
               e.location, e.author_name, e.image_url, e.participants
        FROM {SCHEMA}.events e
        WHERE {where}
        ORDER BY e.event_date ASC
        LIMIT 20
    """, params)

    return cur.fetchall()


def search_services(text, cur):
    """Поиск услуг"""
    conditions = ["s.is_active = true"]
    params = []

    city = extract_city(text)
    if city:
        conditions.append("LOWER(s.city) LIKE %s")
        params.append(f'%{city.lower()}%')

    lower = text.lower()
    if 'онлайн' in lower:
        conditions.append("s.is_online = true")

    keywords_for_search = []
    for word in text.split():
        w = word.lower().strip('.,!?')
        if len(w) > 3 and w not in ('найди', 'найти', 'покажи', 'хочу', 'услуг', 'город'):
            keywords_for_search.append(w)

    if keywords_for_search:
        conditions.append("(LOWER(s.title) LIKE %s OR LOWER(s.description) LIKE %s OR LOWER(s.service_type) LIKE %s OR LOWER(s.name) LIKE %s)")
        like_term = f'%{keywords_for_search[0]}%'
        params.extend([like_term, like_term, like_term, like_term])

    where = " AND ".join(conditions)

    cur.execute(f"""
        SELECT s.id, s.title, s.name, s.city, s.service_type,
               s.description, s.price, s.rating, s.is_online, s.avatar_url
        FROM {SCHEMA}.services s
        WHERE {where}
        ORDER BY s.rating DESC NULLS LAST
        LIMIT 20
    """, params)

    return cur.fetchall()


def search_ads(text, cur):
    """Поиск объявлений LIVE"""
    conditions = ["a.status = 'active'"]
    params = []

    lower = text.lower()
    if 'приглаш' in lower:
        conditions.append("a.action = 'invite'")
    elif any(kw in lower for kw in ['пойти', 'пойд', 'хочу']):
        conditions.append("a.action = 'go'")

    city = extract_city(text)
    if city:
        conditions.append("LOWER(u.city) LIKE %s")
        params.append(f'%{city.lower()}%')

    keywords_for_search = []
    for word in text.split():
        w = word.lower().strip('.,!?')
        if len(w) > 3 and w not in ('найди', 'найти', 'покажи', 'хочу', 'пойти', 'город', 'приглаш', 'объявлен'):
            keywords_for_search.append(w)

    if keywords_for_search:
        conditions.append("LOWER(a.schedule) LIKE %s")
        params.append(f'%{keywords_for_search[0]}%')

    where = " AND ".join(conditions)

    cur.execute(f"""
        SELECT a.id, a.action, a.schedule,
               u.name, u.city,
               EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.birth_date))::int as age,
               u.avatar_url, u.id as user_id
        FROM {SCHEMA}.ads a
        JOIN {SCHEMA}.users u ON a.user_id = u.id
        WHERE {where}
        ORDER BY a.created_at DESC
        LIMIT 20
    """, params)

    return cur.fetchall()


def handler(event: dict, context) -> dict:
    """Обрабатывает текстовые поисковые запросы и возвращает результаты"""
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    body = json.loads(event.get('body') or '{}')
    text = (body.get('text') or '').strip()

    if not text:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Text query required'})
        }

    search_type = detect_type(text)

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    search_fn = {
        'people': search_people,
        'events': search_events,
        'services': search_services,
        'ads': search_ads,
    }

    results = search_fn[search_type](text, cur)
    cur.close()
    conn.close()

    items = []
    for row in results:
        item = dict(row)
        for key, value in item.items():
            if isinstance(value, datetime):
                item[key] = value.isoformat()
            elif hasattr(value, 'isoformat'):
                item[key] = value.isoformat()
            elif isinstance(value, list):
                item[key] = value
        items.append(item)

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'type': search_type,
            'query': text,
            'results': items,
            'count': len(items)
        }, ensure_ascii=False, default=str)
    }
