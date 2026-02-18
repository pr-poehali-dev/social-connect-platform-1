const ZODIAC_RANGES: [number, number, string][] = [
  [120, 218, 'aquarius'],
  [219, 320, 'pisces'],
  [321, 419, 'aries'],
  [420, 520, 'taurus'],
  [521, 620, 'gemini'],
  [621, 722, 'cancer'],
  [723, 822, 'leo'],
  [823, 922, 'virgo'],
  [923, 1022, 'libra'],
  [1023, 1121, 'scorpio'],
  [1122, 1221, 'sagittarius'],
  [1222, 1231, 'capricorn'],
  [101, 119, 'capricorn'],
];

export const getZodiacSign = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const month = d.getMonth() + 1;
  const day = d.getDate();
  const key = month * 100 + day;

  for (const [start, end, sign] of ZODIAC_RANGES) {
    if (key >= start && key <= end) return sign;
  }
  return null;
};

export const ZODIAC_RU: Record<string, string> = {
  aries: 'Овен', taurus: 'Телец', gemini: 'Близнецы', cancer: 'Рак',
  leo: 'Лев', virgo: 'Дева', libra: 'Весы', scorpio: 'Скорпион',
  sagittarius: 'Стрелец', capricorn: 'Козерог', aquarius: 'Водолей', pisces: 'Рыбы',
};

const COMPAT_MAP: Record<string, number> = {
  'aries-leo': 95, 'aries-sagittarius': 93, 'aries-gemini': 85, 'aries-aquarius': 80,
  'aries-libra': 75, 'aries-aries': 70,
  'taurus-virgo': 95, 'taurus-capricorn': 93, 'taurus-cancer': 88, 'taurus-pisces': 82,
  'taurus-taurus': 75,
  'gemini-libra': 93, 'gemini-aquarius': 90, 'gemini-leo': 82, 'gemini-gemini': 70,
  'cancer-scorpio': 95, 'cancer-pisces': 93, 'cancer-virgo': 80, 'cancer-cancer': 72,
  'leo-sagittarius': 93, 'leo-libra': 85, 'leo-gemini': 82, 'leo-leo': 68,
  'virgo-capricorn': 95, 'virgo-taurus': 95, 'virgo-scorpio': 80, 'virgo-virgo': 65,
  'libra-aquarius': 93, 'libra-gemini': 93, 'libra-sagittarius': 78, 'libra-libra': 70,
  'scorpio-pisces': 95, 'scorpio-cancer': 95, 'scorpio-capricorn': 82, 'scorpio-scorpio': 60,
  'sagittarius-aries': 93, 'sagittarius-leo': 93, 'sagittarius-aquarius': 80, 'sagittarius-sagittarius': 68,
  'capricorn-taurus': 93, 'capricorn-virgo': 95, 'capricorn-pisces': 78, 'capricorn-capricorn': 65,
  'aquarius-gemini': 90, 'aquarius-libra': 93, 'aquarius-aries': 80, 'aquarius-aquarius': 68,
  'pisces-cancer': 93, 'pisces-scorpio': 95, 'pisces-taurus': 82, 'pisces-pisces': 70,
};

const ELEMENTS: Record<string, string[]> = {
  fire: ['aries', 'leo', 'sagittarius'],
  earth: ['taurus', 'virgo', 'capricorn'],
  air: ['gemini', 'libra', 'aquarius'],
  water: ['cancer', 'scorpio', 'pisces'],
};

const COMPAT_ELEMENTS: Record<string, string[]> = {
  fire: ['fire', 'air'], earth: ['earth', 'water'],
  air: ['air', 'fire'], water: ['water', 'earth'],
};

export const getQuickCompatibility = (sign1: string, sign2: string): number | null => {
  if (!sign1 || !sign2) return null;
  const s1 = sign1.toLowerCase();
  const s2 = sign2.toLowerCase();
  if (!ZODIAC_RU[s1] || !ZODIAC_RU[s2]) return null;

  const direct = COMPAT_MAP[`${s1}-${s2}`] ?? COMPAT_MAP[`${s2}-${s1}`];
  if (direct !== undefined) return direct;

  let el1 = '', el2 = '';
  for (const [el, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(s1)) el1 = el;
    if (signs.includes(s2)) el2 = el;
  }
  if (el1 && el2 && COMPAT_ELEMENTS[el1]?.includes(el2)) return 70;
  return 45;
};

export default getZodiacSign;