import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import ZodiacIcon from './ZodiacIcon';

const HOROSCOPE_URL = 'https://functions.poehali.dev/b970a32c-c62f-4434-a7dd-c02379773d6e';

interface HoroscopeData {
  content: string;
  rating: number;
  lucky_number: number;
  lucky_color: string;
  sign_ru: string;
  type_ru: string;
}

const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Овен' }, { id: 'taurus', name: 'Телец' },
  { id: 'gemini', name: 'Близнецы' }, { id: 'cancer', name: 'Рак' },
  { id: 'leo', name: 'Лев' }, { id: 'virgo', name: 'Дева' },
  { id: 'libra', name: 'Весы' }, { id: 'scorpio', name: 'Скорпион' },
  { id: 'sagittarius', name: 'Стрелец' }, { id: 'capricorn', name: 'Козерог' },
  { id: 'aquarius', name: 'Водолей' }, { id: 'pisces', name: 'Рыбы' },
];

const HOROSCOPE_TYPES = [
  { id: 'general', name: 'Общий', icon: 'Star' },
  { id: 'love', name: 'Любовный', icon: 'Heart' },
  { id: 'business', name: 'Деловой', icon: 'Briefcase' },
  { id: 'health', name: 'Здоровье', icon: 'Activity' },
  { id: 'finance', name: 'Финансы', icon: 'DollarSign' },
];

const DailyHoroscope = () => {
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [selectedType, setSelectedType] = useState('general');
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.zodiac_sign) {
      setSelectedSign(user.zodiac_sign.toLowerCase());
    }
  }, []);

  useEffect(() => {
    if (selectedSign) {
      loadHoroscope();
    }
  }, [selectedSign, selectedType]);

  const loadHoroscope = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `${HOROSCOPE_URL}?action=get&sign=${selectedSign}&type=${selectedType}`
      );
      if (res.ok) {
        const data = await res.json();
        setHoroscope(data);
      }
    } catch (e) {
      console.error('Failed to load horoscope', e);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 justify-items-center">
        {ZODIAC_SIGNS.map((sign) => (
          <ZodiacIcon
            key={sign.id}
            sign={sign.id}
            size="sm"
            selected={selectedSign === sign.id}
            onClick={() => setSelectedSign(sign.id)}
            label={sign.name}
          />
        ))}
      </div>

      {selectedSign && (
        <div className="flex flex-wrap gap-2 justify-center">
          {HOROSCOPE_TYPES.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? 'default' : 'outline'}
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => setSelectedType(type.id)}
            >
              <Icon name={type.icon} size={14} />
              {type.name}
            </Button>
          ))}
        </div>
      )}

      {loading && (
        <Card className="rounded-3xl border-2 animate-pulse">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Icon name="Loader2" size={20} className="animate-spin" />
              <span>Звёзды составляют прогноз...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && horoscope && (
        <Card className="rounded-3xl border-2 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ZodiacIcon sign={selectedSign} size="md" />
                <div>
                  <h3 className="text-lg font-bold">{horoscope.sign_ru}</h3>
                  <p className="text-white/80 text-sm">{horoscope.type_ru} гороскоп на сегодня</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <p className="text-base leading-relaxed">{horoscope.content}</p>

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">Рейтинг дня:</span>
              {renderStars(horoscope.rating)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-2xl p-3 text-center">
                <div className="text-2xl font-bold text-primary">{horoscope.lucky_number}</div>
                <div className="text-xs text-muted-foreground">Счастливое число</div>
              </div>
              <div className="bg-muted/50 rounded-2xl p-3 text-center">
                <div className="text-lg font-semibold text-primary">{horoscope.lucky_color}</div>
                <div className="text-xs text-muted-foreground">Счастливый цвет</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !horoscope && selectedSign && (
        <Card className="rounded-3xl border-2">
          <CardContent className="p-8 text-center">
            <Icon name="Stars" size={48} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Не удалось загрузить гороскоп. Попробуйте позже.</p>
          </CardContent>
        </Card>
      )}

      {!selectedSign && (
        <Card className="rounded-3xl border-2">
          <CardContent className="p-8 text-center">
            <Icon name="Sparkles" size={48} className="mx-auto text-primary/40 mb-3" />
            <p className="text-muted-foreground">Выберите свой знак зодиака, чтобы увидеть гороскоп</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyHoroscope;
