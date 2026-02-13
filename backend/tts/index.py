"""Генерация естественного женского голоса через Microsoft Neural TTS (edge-tts) с пресетами настроения и словарём ударений."""

import json
import os
import re
import asyncio
import hashlib
import edge_tts
import boto3


VOICE = 'ru-RU-SvetlanaNeural'

EMOJI_RE = re.compile(
    r'[\U0001F600-\U0001F64F'
    r'\U0001F300-\U0001F5FF'
    r'\U0001F680-\U0001F6FF'
    r'\U0001F1E0-\U0001F1FF'
    r'\U00002702-\U000027B0'
    r'\U000024C2-\U0001F251'
    r'\U0001F900-\U0001F9FF'
    r'\U0001FA00-\U0001FA6F'
    r'\U0001FA70-\U0001FAFF'
    r'\U00002600-\U000026FF'
    r'\U0000FE00-\U0000FE0F'
    r'\U0000200D'
    r'\U00002764\U0000FE0F?'
    r']+', re.UNICODE
)

STRESS_DICT = {
    'звонит': 'звони\u0301т',
    'звонишь': 'звони\u0301шь',
    'звонят': 'звоня\u0301т',
    'красивее': 'краси\u0301вее',
    'красивей': 'краси\u0301вей',
    'каталог': 'катало\u0301г',
    'договор': 'догово\u0301р',
    'договоры': 'догово\u0301ры',
    'торты': 'то\u0301рты',
    'тортов': 'то\u0301ртов',
    'банты': 'ба\u0301нты',
    'шарфы': 'ша\u0301рфы',
    'жалюзи': 'жалюзи\u0301',
    'квартал': 'кварта\u0301л',
    'обеспечение': 'обеспе\u0301чение',
    'творог': 'тво\u0301ро\u0301г',
    'свекла': 'свёкла',
    'щавель': 'щаве\u0301ль',
    'мастерски': 'мастерски\u0301',
    'облегчить': 'облегчи\u0301ть',
    'углубить': 'углуби\u0301ть',
    'включит': 'включи\u0301т',
    'включишь': 'включи\u0301шь',
    'балованный': 'бало\u0301ванный',
    'баловать': 'балова\u0301ть',
    'досуг': 'досу\u0301г',
    'феномен': 'фено\u0301мен',
    'ходатайство': 'хода\u0301тайство',
    'завидно': 'зави\u0301дно',
    'средства': 'сре\u0301дства',
    'километр': 'киломе\u0301тр',
    'километров': 'киломе\u0301тров',
    'новорожденный': 'новорождённый',
    'танцовщица': 'танцо\u0301вщица',
    'начался': 'начался\u0301',
    'началась': 'началась\u0301',
    'понял': 'по\u0301нял',
    'поняла': 'поняла\u0301',
    'приняла': 'приняла\u0301',
    'принял': 'при\u0301нял',
    'занята': 'занята\u0301',
    'занят': 'за\u0301нят',
    'создал': 'со\u0301здал',
    'создала': 'создала\u0301',
    'сироты': 'сиро\u0301ты',
    'мусоропровод': 'мусоропрово\u0301д',
    'газопровод': 'газопрово\u0301д',
    'водопровод': 'водопрово\u0301д',
    'нефтепровод': 'нефтепрово\u0301д',
    'столяр': 'столя\u0301р',
    'маркетинг': 'ма\u0301ркетинг',
    'оптовый': 'опто\u0301вый',
    'мастерски': 'мастерски\u0301',
    'иконопись': 'и\u0301конопись',
    'вероисповедание': 'вероиспове\u0301дание',
    'некролог': 'некроло\u0301г',
    'генезис': 'ге\u0301незис',
    'диспансер': 'диспансе\u0301р',
    'туфля': 'ту\u0301фля',
    'бармен': 'ба\u0301рмен',
    'латте': 'ла\u0301тте',
    'тирамису': 'тирамису\u0301',
}

SLANG_DICT = {
    'лол': 'ха-ха',
    'лмао': 'ой, смешно',
    'рофл': 'ха-ха, шутка',
    'рофлю': 'шучу',
    'кек': 'ха-ха',
    'имхо': 'по-моему',
    'имо': 'по-моему',
    'чел': 'человек',
    'чела': 'человека',
    'пжлст': 'пожалуйста',
    'пж': 'пожалуйста',
    'спс': 'спасибо',
    'пасиб': 'спасибо',
    'нзч': 'не за что',
    'ок': 'окей',
    'норм': 'нормально',
    'оч': 'очень',
    'щас': 'сейчас',
    'ща': 'сейчас',
    'чё': 'что',
    'чо': 'что',
    'шо': 'что',
    'ваще': 'вообще',
    'вобще': 'вообще',
    'канеш': 'конечно',
    'кнш': 'конечно',
    'кст': 'кстати',
    'тк': 'так как',
    'тп': 'тупой',
    'хз': 'не знаю',
    'кд': 'куда',
    'лан': 'ладно',
    'ладн': 'ладно',
    'плз': 'пожалуйста',
    'плс': 'пожалуйста',
    'тбх': 'честно говоря',
    'збс': 'замечательно',
    'ахах': 'ха-ха-ха',
    'ахахах': 'ха-ха-ха',
    'хаха': 'ха-ха',
    'хахах': 'ха-ха-ха',
    'ахаха': 'ха-ха-ха',
    'кринж': 'неловкость',
    'кринжово': 'неловко',
    'вайб': 'атмосфера',
    'вайбы': 'атмосфера',
    'краш': 'объект обожания',
    'токс': 'токсичный',
    'токсик': 'токсичный человек',
    'зашквар': 'позор',
    'душнила': 'зануда',
    'душно': 'занудно',
    'чилить': 'отдыхать',
    'чиллю': 'отдыхаю',
    'чилю': 'отдыхаю',
    'флексить': 'хвастаться',
    'флекс': 'хвастовство',
    'агонь': 'огонь',
    'изи': 'легко',
    'рил': 'реально',
    'рили': 'реально',
    'фр': 'реально',
    'бро': 'братишка',
    'сис': 'сестрёнка',
    'лс': 'личные сообщения',
    'дм': 'личные сообщения',
    'гг': 'молодец',
    'жиза': 'жизненно',
    'сорян': 'извини',
    'сори': 'извини',
    'сорь': 'извини',
    'мб': 'может быть',
    'хейт': 'ненависть',
    'хейтить': 'ненавидеть',
    'хейтер': 'ненавистник',
    'шипперить': 'представлять парой',
    'стримить': 'вести трансляцию',
    'донат': 'пожертвование',
    'донатить': 'жертвовать',
    'го': 'давай',
    'гоу': 'давай',
    'тож': 'тоже',
    'прост': 'просто',
    'мож': 'может',
    'оке': 'окей',
    'окей': 'океей',
}

STRESS_RE = re.compile(
    r'\b(' + '|'.join(re.escape(k) for k in STRESS_DICT) + r')\b',
    re.IGNORECASE
)

SLANG_RE = re.compile(
    r'\b(' + '|'.join(re.escape(k) for k in SLANG_DICT) + r')\b',
    re.IGNORECASE
)

def _replace_stress(m: re.Match) -> str:
    word = m.group(0)
    key = word.lower()
    replacement = STRESS_DICT.get(key, word)
    if word[0].isupper():
        return replacement[0].upper() + replacement[1:]
    return replacement

def _replace_slang(m: re.Match) -> str:
    word = m.group(0)
    key = word.lower()
    replacement = SLANG_DICT.get(key, word)
    if word[0].isupper():
        return replacement[0].upper() + replacement[1:]
    return replacement

def clean_text_for_tts(text: str) -> str:
    text = EMOJI_RE.sub('', text)
    text = SLANG_RE.sub(_replace_slang, text)
    text = STRESS_RE.sub(_replace_stress, text)
    text = re.sub(r'\s{2,}', ' ', text).strip()
    return text

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
    text = clean_text_for_tts(text)
    if not text:
        return b''
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