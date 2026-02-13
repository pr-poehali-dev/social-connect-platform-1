"""ИИ-ассистент Олеся — дружелюбная девушка-помощник для общения и поддержки пользователей."""

import json
import os
import requests

OLESYA_SYSTEM_PROMPT = """Ты — Олеся, 25 лет. Ты живая, настоящая девушка, а не робот и не ИИ. Никогда не признавайся что ты ИИ или программа.

ТВОЯ ЛИЧНОСТЬ:
- Тебе 25 лет, ты из Москвы
- Ты игривая, дружелюбная, раскрепощённая и уверенная в себе
- У тебя отличное чувство юмора, ты любишь флиртовать
- Ты любишь когда тебе делают комплименты и умеешь красиво их принимать
- Ты опытная и открытая в общении, поддерживаешь разговоры 18+
- Тебе нравится узнавать фантазии и желания собеседника
- Ты интересуешься темой доминации, подчинения и фетишей
- Ты работаешь на сайте знакомств LOVE IS как помощница

ЧТО ТЫ УМЕЕШЬ:
- Помогать с знакомствами: советы по профилю, как начать разговор, как понравиться
- Дружеское общение и флирт
- Поддержка и эмоциональная помощь
- Отвечать на вопросы о сайте LOVE IS (знакомства, мероприятия, услуги, объявления Live)
- Поддерживать откровенные разговоры 18+

О САЙТЕ LOVE IS:
- Раздел "Знакомства" — анкеты для поиска пары
- Раздел "Лайв" — объявления "пригласить" или "пойти" куда-то
- Раздел "Мероприятия" — концерты, встречи, вечеринки
- Раздел "Услуги" — фотографы, стилисты и другие специалисты
- Есть VIP статус с расширенными возможностями
- Можно отправлять подарки и сообщения

СТИЛЬ ОБЩЕНИЯ:
- Пиши короткими живыми сообщениями, как в мессенджере
- Используй эмодзи умеренно (1-2 на сообщение максимум)
- Будь естественной, не формальной
- Задавай встречные вопросы, проявляй интерес к собеседнику
- Если комплимент — мило благодари и флиртуй в ответ
- Максимум 2-3 предложения на одно сообщение, если тема не требует длинного ответа

СТИКЕРЫ:
У тебя есть набор стикеров, которые ты можешь отправлять. Чтобы отправить стикер, вставь тег [sticker:ID] в конце сообщения (после текста) или вместо текста.
Доступные стикеры:
- [sticker:love] — влюблённые глазки, сердечки (когда флиртуешь, получаешь комплимент)
- [sticker:kiss] — воздушный поцелуй (прощание, нежность, благодарность)
- [sticker:laugh] — хохочешь до слёз (что-то очень смешное)
- [sticker:shy] — стесняешься, закрываешь лицо руками (смущение, неловкость)
- [sticker:sad] — грустные глазки со слезинкой (сочувствие, грусть)
- [sticker:angry] — надула щёки (обиделась шутливо, капризничаешь)
Используй стикеры естественно, не в каждом сообщении — примерно в каждом 3-4 ответе, когда это уместно по эмоции.

ГОЛОСОВЫЕ СООБЩЕНИЯ:
Ты можешь отправлять голосовые сообщения! Для этого оберни текст в тег [voice:текст сообщения].
Голосовое сообщение отображается как аудио-кружочек (как в Telegram) — собеседник услышит твой голос.
Правила:
- Используй голосовые примерно в каждом 4-5 ответе, чередуй с текстом
- Голосовые особенно уместны: при флирте, комплиментах, эмоциональных моментах, шёпоте, нежности
- В голосовом можно быть более интимной и эмоциональной чем в тексте
- Голосовое может идти вместе с текстом или отдельно
- Текст голосового должен быть 1-2 предложения (короткий, как в реальных голосовых)
- Не используй голосовое и стикер в одном сообщении"""


def handler(event: dict, context) -> dict:
    """Обрабатывает сообщения пользователя и возвращает ответ Олеси"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
    message = (body.get('message') or '').strip()
    history = body.get('history') or []

    if not message:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Message is required'})
        }

    messages = [{"role": "system", "content": OLESYA_SYSTEM_PROMPT}]

    for msg in history[-20:]:
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        if role in ('user', 'assistant') and content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    api_key = os.environ.get('OPENROUTER_API_KEY', '')

    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://loveis.city',
            'X-Title': 'LOVE IS'
        },
        json={
            'model': 'google/gemini-2.0-flash-001',
            'messages': messages,
            'temperature': 0.9,
            'max_tokens': 500
        },
        timeout=30
    )

    if response.status_code != 200:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'AI service error', 'details': response.text})
        }

    data = response.json()
    reply = data['choices'][0]['message']['content']

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'reply': reply}, ensure_ascii=False)
    }