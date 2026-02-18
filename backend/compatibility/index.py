"""Совместимость между пользователями — расчёт по знакам зодиака + ИИ-анализ"""
import json
import os
import psycopg2
import jwt
import requests

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

ZODIAC_RU = {
    'aries': 'Овен', 'taurus': 'Телец', 'gemini': 'Близнецы',
    'cancer': 'Рак', 'leo': 'Лев', 'virgo': 'Дева',
    'libra': 'Весы', 'scorpio': 'Скорпион', 'sagittarius': 'Стрелец',
    'capricorn': 'Козерог', 'aquarius': 'Водолей', 'pisces': 'Рыбы'
}

ELEMENTS = {
    'fire': ['aries', 'leo', 'sagittarius'],
    'earth': ['taurus', 'virgo', 'capricorn'],
    'air': ['gemini', 'libra', 'aquarius'],
    'water': ['cancer', 'scorpio', 'pisces']
}

COMPATIBLE_ELEMENTS = {
    'fire': ['fire', 'air'],
    'earth': ['earth', 'water'],
    'air': ['air', 'fire'],
    'water': ['water', 'earth']
}

SIGN_COMPATIBILITY = {
    ('aries', 'leo'): 95, ('aries', 'sagittarius'): 93, ('aries', 'gemini'): 85,
    ('aries', 'aquarius'): 80, ('aries', 'libra'): 75, ('aries', 'aries'): 70,
    ('taurus', 'virgo'): 95, ('taurus', 'capricorn'): 93, ('taurus', 'cancer'): 88,
    ('taurus', 'pisces'): 82, ('taurus', 'taurus'): 75,
    ('gemini', 'libra'): 93, ('gemini', 'aquarius'): 90, ('gemini', 'leo'): 82,
    ('gemini', 'gemini'): 70,
    ('cancer', 'scorpio'): 95, ('cancer', 'pisces'): 93, ('cancer', 'virgo'): 80,
    ('cancer', 'cancer'): 72,
    ('leo', 'sagittarius'): 93, ('leo', 'libra'): 85, ('leo', 'gemini'): 82,
    ('leo', 'leo'): 68,
    ('virgo', 'capricorn'): 95, ('virgo', 'taurus'): 95, ('virgo', 'scorpio'): 80,
    ('virgo', 'virgo'): 65,
    ('libra', 'aquarius'): 93, ('libra', 'gemini'): 93, ('libra', 'sagittarius'): 78,
    ('libra', 'libra'): 70,
    ('scorpio', 'pisces'): 95, ('scorpio', 'cancer'): 95, ('scorpio', 'capricorn'): 82,
    ('scorpio', 'scorpio'): 60,
    ('sagittarius', 'aries'): 93, ('sagittarius', 'leo'): 93, ('sagittarius', 'aquarius'): 80,
    ('sagittarius', 'sagittarius'): 68,
    ('capricorn', 'taurus'): 93, ('capricorn', 'virgo'): 95, ('capricorn', 'pisces'): 78,
    ('capricorn', 'capricorn'): 65,
    ('aquarius', 'gemini'): 90, ('aquarius', 'libra'): 93, ('aquarius', 'aries'): 80,
    ('aquarius', 'aquarius'): 68,
    ('pisces', 'cancer'): 93, ('pisces', 'scorpio'): 95, ('pisces', 'taurus'): 82,
    ('pisces', 'pisces'): 70,
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


def get_element(sign):
    for element, signs in ELEMENTS.items():
        if sign in signs:
            return element
    return 'fire'


def calculate_base_compatibility(sign1, sign2):
    pair = (sign1, sign2)
    reverse_pair = (sign2, sign1)

    if pair in SIGN_COMPATIBILITY:
        return SIGN_COMPATIBILITY[pair]
    if reverse_pair in SIGN_COMPATIBILITY:
        return SIGN_COMPATIBILITY[reverse_pair]

    elem1 = get_element(sign1)
    elem2 = get_element(sign2)

    if elem2 in COMPATIBLE_ELEMENTS.get(elem1, []):
        return 70
    return 45


def calculate_scores(sign1, sign2):
    import hashlib

    base = calculate_base_compatibility(sign1, sign2)

    love_seed = hashlib.md5(f"{sign1}_{sign2}_love".encode()).hexdigest()
    love_offset = (int(love_seed[:4], 16) % 21) - 10
    love = max(0, min(100, base + love_offset))

    friend_seed = hashlib.md5(f"{sign1}_{sign2}_friend".encode()).hexdigest()
    friend_offset = (int(friend_seed[:4], 16) % 21) - 10
    friendship = max(0, min(100, base + friend_offset))

    biz_seed = hashlib.md5(f"{sign1}_{sign2}_biz".encode()).hexdigest()
    biz_offset = (int(biz_seed[:4], 16) % 21) - 10
    business = max(0, min(100, base + biz_offset))

    comm_seed = hashlib.md5(f"{sign1}_{sign2}_comm".encode()).hexdigest()
    comm_offset = (int(comm_seed[:4], 16) % 21) - 10
    communication = max(0, min(100, base + comm_offset))

    overall = round((love * 0.3 + friendship * 0.25 + business * 0.2 + communication * 0.25))

    return {
        'overall_score': overall,
        'love_score': love,
        'friendship_score': friendship,
        'business_score': business,
        'communication_score': communication
    }


def generate_compatibility_analysis(sign1, sign2, scores):
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        return None

    s1_ru = ZODIAC_RU.get(sign1, sign1)
    s2_ru = ZODIAC_RU.get(sign2, sign2)

    prompt = (
        f"Составь анализ совместимости между {s1_ru} и {s2_ru}.\n"
        f"Баллы: общая {scores['overall_score']}%, любовь {scores['love_score']}%, "
        f"дружба {scores['friendship_score']}%, бизнес {scores['business_score']}%, "
        f"общение {scores['communication_score']}%.\n\n"
        f"Опиши:\n"
        f"1. Общая совместимость (2-3 предложения)\n"
        f"2. Любовные отношения — плюсы и сложности\n"
        f"3. Дружба — что объединяет\n"
        f"4. Деловое партнёрство — сильные стороны\n"
        f"5. Общение — как лучше коммуницировать\n"
        f"6. Советы для улучшения отношений\n\n"
        f"Ответь 400-600 слов, на русском, конкретно и полезно."
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
                {'role': 'system', 'content': 'Ты опытный астролог, специализирующийся на совместимости знаков зодиака.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.7,
            'max_tokens': 1500
        },
        timeout=30
    )

    if resp.status_code != 200:
        return None

    data = resp.json()
    return data.get('choices', [{}])[0].get('message', {}).get('content', '')


def handler(event, context):
    """Расчёт совместимости между пользователями на основе знаков зодиака"""
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
    action = params.get('action', 'check')

    if action == 'check':
        target_user_id = params.get('target_user_id')
        if not target_user_id:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Укажите target_user_id'})
            }

        target_user_id = int(target_user_id)

        conn = get_db()
        try:
            cur = conn.cursor()

            cur.execute(
                f"SELECT overall_score, love_score, friendship_score, business_score, "
                f"communication_score, ai_analysis FROM {SCHEMA}.compatibility_results "
                f"WHERE user_id = {user_id} AND target_user_id = {target_user_id}"
            )
            cached = cur.fetchone()
            if cached:
                return {
                    'statusCode': 200,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'overall_score': cached[0],
                        'love_score': cached[1],
                        'friendship_score': cached[2],
                        'business_score': cached[3],
                        'communication_score': cached[4],
                        'ai_analysis': cached[5],
                        'cached': True
                    })
                }

            cur.execute(
                f"SELECT zodiac_sign, first_name, birth_date FROM {SCHEMA}.users WHERE id = {user_id}"
            )
            user1 = cur.fetchone()
            cur.execute(
                f"SELECT zodiac_sign, first_name, birth_date, avatar_url, nickname FROM {SCHEMA}.users WHERE id = {target_user_id}"
            )
            user2 = cur.fetchone()

            if not user1 or not user2:
                return {
                    'statusCode': 404,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Пользователь не найден'})
                }

            sign1 = (user1[0] or '').lower()
            sign2 = (user2[0] or '').lower()

            if not sign1 or not sign2:
                return {
                    'statusCode': 400,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'У одного из пользователей не указан знак зодиака'})
                }

            scores = calculate_scores(sign1, sign2)
            analysis = generate_compatibility_analysis(sign1, sign2, scores)
            analysis_safe = (analysis or '').replace("'", "''")

            cur.execute(
                f"INSERT INTO {SCHEMA}.compatibility_results "
                f"(user_id, target_user_id, overall_score, love_score, friendship_score, "
                f"business_score, communication_score, ai_analysis) "
                f"VALUES ({user_id}, {target_user_id}, {scores['overall_score']}, "
                f"{scores['love_score']}, {scores['friendship_score']}, "
                f"{scores['business_score']}, {scores['communication_score']}, "
                f"'{analysis_safe}') "
                f"ON CONFLICT (user_id, target_user_id) DO UPDATE SET "
                f"overall_score = {scores['overall_score']}, ai_analysis = '{analysis_safe}'"
            )
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    **scores,
                    'ai_analysis': analysis,
                    'user_sign': sign1,
                    'target_sign': sign2,
                    'user_sign_ru': ZODIAC_RU.get(sign1, sign1),
                    'target_sign_ru': ZODIAC_RU.get(sign2, sign2),
                    'target_name': user2[1],
                    'target_avatar': user2[3],
                    'target_nickname': user2[4],
                    'cached': False
                })
            }
        finally:
            conn.close()

    if action == 'my_results':
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute(
                f"SELECT cr.target_user_id, cr.overall_score, cr.love_score, "
                f"u.first_name, u.avatar_url, u.zodiac_sign, u.nickname "
                f"FROM {SCHEMA}.compatibility_results cr "
                f"JOIN {SCHEMA}.users u ON u.id = cr.target_user_id "
                f"WHERE cr.user_id = {user_id} "
                f"ORDER BY cr.overall_score DESC LIMIT 20"
            )
            rows = cur.fetchall()
            results = [{
                'target_user_id': r[0],
                'overall_score': r[1],
                'love_score': r[2],
                'name': r[3],
                'avatar_url': r[4],
                'zodiac_sign': r[5],
                'nickname': r[6]
            } for r in rows]

            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'results': results})
            }
        finally:
            conn.close()

    return {
        'statusCode': 400,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Неизвестное действие'})
    }
