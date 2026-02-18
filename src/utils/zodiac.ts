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

export default getZodiacSign;
