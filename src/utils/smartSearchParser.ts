export interface ParsedSearch {
  gender: string;
  ageFrom: string;
  ageTo: string;
  city: string;
  textQuery: string;
}

const GENDER_FEMALE = [
  'девушк', 'девочк', 'женщин', 'девчон', 'подруг', 'жен',
];

const GENDER_MALE = [
  'парн', 'мужчин', 'мужик', 'муж', 'ребят', 'пацан', 'друг',
];

const RUSSIAN_CITIES: Record<string, string> = {
  'москв': 'Москва',
  'питер': 'Санкт-Петербург',
  'санкт-петербург': 'Санкт-Петербург',
  'спб': 'Санкт-Петербург',
  'мск': 'Москва',
  'екатеринбург': 'Екатеринбург',
  'екб': 'Екатеринбург',
  'новосибирск': 'Новосибирск',
  'нск': 'Новосибирск',
  'казан': 'Казань',
  'нижн': 'Нижний Новгород',
  'челябинск': 'Челябинск',
  'самар': 'Самара',
  'омск': 'Омск',
  'ростов': 'Ростов-на-Дону',
  'уф': 'Уфа',
  'красноярск': 'Красноярск',
  'воронеж': 'Воронеж',
  'перм': 'Пермь',
  'волгоград': 'Волгоград',
  'краснодар': 'Краснодар',
  'саратов': 'Саратов',
  'тюмен': 'Тюмень',
  'тольятти': 'Тольятти',
  'ижевск': 'Ижевск',
  'барнаул': 'Барнаул',
  'ульяновск': 'Ульяновск',
  'иркутск': 'Иркутск',
  'хабаровск': 'Хабаровск',
  'ярославл': 'Ярославль',
  'владивосток': 'Владивосток',
  'махачкал': 'Махачкала',
  'томск': 'Томск',
  'оренбург': 'Оренбург',
  'кемеров': 'Кемерово',
  'новокузнецк': 'Новокузнецк',
  'рязан': 'Рязань',
  'астрахан': 'Астрахань',
  'пенз': 'Пенза',
  'киров': 'Киров',
  'липецк': 'Липецк',
  'балаших': 'Балашиха',
  'чебоксар': 'Чебоксары',
  'калининград': 'Калининград',
  'тул': 'Тула',
  'курск': 'Курск',
  'сочи': 'Сочи',
  'ставропол': 'Ставрополь',
  'улан-удэ': 'Улан-Удэ',
  'тверь': 'Тверь',
  'магнитогорск': 'Магнитогорск',
  'сургут': 'Сургут',
  'брянск': 'Брянск',
  'иванов': 'Иваново',
  'белгород': 'Белгород',
  'владимир': 'Владимир',
  'архангельск': 'Архангельск',
  'калуг': 'Калуга',
  'смоленск': 'Смоленск',
  'мурманск': 'Мурманск',
  'орёл': 'Орёл',
  'орел': 'Орёл',
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е').trim();
}

function extractGender(text: string): { gender: string; cleaned: string } {
  const normalized = normalizeText(text);

  for (const stem of GENDER_FEMALE) {
    const regex = new RegExp(`\\b\\S*${stem}\\S*\\b`, 'gi');
    if (regex.test(normalized)) {
      return { gender: 'female', cleaned: text.replace(regex, '').trim() };
    }
  }

  for (const stem of GENDER_MALE) {
    const regex = new RegExp(`\\b\\S*${stem}\\S*\\b`, 'gi');
    if (regex.test(normalized)) {
      return { gender: 'male', cleaned: text.replace(regex, '').trim() };
    }
  }

  return { gender: '', cleaned: text };
}

function extractCity(text: string): { city: string; cleaned: string } {
  const normalized = normalizeText(text);

  const fromCityMatch = normalized.match(/(?:из|в|город[аеу]?)\s+([а-яё-]+(?:\s+[а-яё-]+)?)/i);
  if (fromCityMatch) {
    const cityPart = fromCityMatch[1].toLowerCase();
    for (const [stem, cityName] of Object.entries(RUSSIAN_CITIES)) {
      if (cityPart.startsWith(stem) || stem.startsWith(cityPart.slice(0, 4))) {
        const fullMatch = fromCityMatch[0];
        return { city: cityName, cleaned: text.replace(new RegExp(escapeRegExp(fullMatch), 'i'), '').trim() };
      }
    }
    const capitalized = fromCityMatch[1].charAt(0).toUpperCase() + fromCityMatch[1].slice(1);
    return { city: capitalized, cleaned: text.replace(new RegExp(escapeRegExp(fromCityMatch[0]), 'i'), '').trim() };
  }

  for (const [stem, cityName] of Object.entries(RUSSIAN_CITIES)) {
    const regex = new RegExp(`\\b\\S*${escapeRegExp(stem)}\\S*\\b`, 'gi');
    if (regex.test(normalized)) {
      return { city: cityName, cleaned: text.replace(regex, '').trim() };
    }
  }

  return { city: '', cleaned: text };
}

function extractAge(text: string): { ageFrom: string; ageTo: string; cleaned: string } {
  let ageFrom = '';
  let ageTo = '';
  let cleaned = text;

  const rangeMatch = cleaned.match(/от\s*(\d{1,3})\s*(?:до|[-–—])\s*(\d{1,3})\s*(?:лет|год[а-я]*)?/i);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1]);
    const b = parseInt(rangeMatch[2]);
    if (a >= 14 && a <= 100 && b >= 14 && b <= 100) {
      ageFrom = String(Math.min(a, b));
      ageTo = String(Math.max(a, b));
      cleaned = cleaned.replace(rangeMatch[0], '').trim();
      return { ageFrom, ageTo, cleaned };
    }
  }

  const dashRange = cleaned.match(/(\d{1,3})\s*[-–—]\s*(\d{1,3})\s*(?:лет|год[а-я]*)/i);
  if (dashRange) {
    const a = parseInt(dashRange[1]);
    const b = parseInt(dashRange[2]);
    if (a >= 14 && a <= 100 && b >= 14 && b <= 100) {
      ageFrom = String(Math.min(a, b));
      ageTo = String(Math.max(a, b));
      cleaned = cleaned.replace(dashRange[0], '').trim();
      return { ageFrom, ageTo, cleaned };
    }
  }

  const olderMatch = cleaned.match(/(?:от|старше|после)\s*(\d{1,3})\s*(?:лет|год[а-я]*)?/i);
  if (olderMatch) {
    const a = parseInt(olderMatch[1]);
    if (a >= 14 && a <= 100) {
      ageFrom = String(a);
      cleaned = cleaned.replace(olderMatch[0], '').trim();
    }
  }

  const youngerMatch = cleaned.match(/(?:до|младше|моложе)\s*(\d{1,3})\s*(?:лет|год[а-я]*)?/i);
  if (youngerMatch) {
    const a = parseInt(youngerMatch[1]);
    if (a >= 14 && a <= 100) {
      ageTo = String(a);
      cleaned = cleaned.replace(youngerMatch[0], '').trim();
    }
  }

  if (!ageFrom && !ageTo) {
    const singleAge = cleaned.match(/(\d{1,3})\s*(?:лет|год[а-я]*)/i);
    if (singleAge) {
      const a = parseInt(singleAge[1]);
      if (a >= 14 && a <= 100) {
        ageFrom = String(Math.max(14, a - 3));
        ageTo = String(Math.min(100, a + 3));
        cleaned = cleaned.replace(singleAge[0], '').trim();
      }
    }
  }

  return { ageFrom, ageTo, cleaned };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseSmartSearch(query: string): ParsedSearch {
  if (!query || query.trim().length < 2) {
    return { gender: '', ageFrom: '', ageTo: '', city: '', textQuery: query };
  }

  let text = query.trim();

  const { gender, cleaned: afterGender } = extractGender(text);
  text = afterGender;

  const { city, cleaned: afterCity } = extractCity(text);
  text = afterCity;

  const { ageFrom, ageTo, cleaned: afterAge } = extractAge(text);
  text = afterAge;

  const textQuery = text.replace(/\s+/g, ' ').replace(/^[,.\s]+|[,.\s]+$/g, '').trim();

  return { gender, ageFrom, ageTo, city, textQuery };
}

export function hasSmartFilters(parsed: ParsedSearch): boolean {
  return !!(parsed.gender || parsed.ageFrom || parsed.ageTo || parsed.city);
}

export function formatSmartFilters(parsed: ParsedSearch): string[] {
  const tags: string[] = [];

  if (parsed.gender) {
    tags.push(parsed.gender === 'female' ? 'Женский пол' : 'Мужской пол');
  }

  if (parsed.city) {
    tags.push(parsed.city);
  }

  if (parsed.ageFrom && parsed.ageTo) {
    tags.push(`${parsed.ageFrom}–${parsed.ageTo} лет`);
  } else if (parsed.ageFrom) {
    tags.push(`от ${parsed.ageFrom} лет`);
  } else if (parsed.ageTo) {
    tags.push(`до ${parsed.ageTo} лет`);
  }

  return tags;
}

export default parseSmartSearch;
