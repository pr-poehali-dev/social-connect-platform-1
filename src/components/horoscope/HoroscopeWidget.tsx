import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import ZodiacIcon, { ZODIAC_SYMBOLS } from './ZodiacIcon';

const HOROSCOPE_URL = 'https://functions.poehali.dev/b970a32c-c62f-4434-a7dd-c02379773d6e';

const ZODIAC_RU: Record<string, string> = {
  aries: 'Овен', taurus: 'Телец', gemini: 'Близнецы', cancer: 'Рак',
  leo: 'Лев', virgo: 'Дева', libra: 'Весы', scorpio: 'Скорпион',
  sagittarius: 'Стрелец', capricorn: 'Козерог', aquarius: 'Водолей', pisces: 'Рыбы',
};

const HoroscopeWidget = () => {
  const [horoscope, setHoroscope] = useState<{ content: string; rating: number; lucky_number: number; lucky_color: string } | null>(null);
  const [sign, setSign] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userSign = (user.zodiac_sign || '').toLowerCase();
    if (userSign && ZODIAC_RU[userSign]) {
      setSign(userSign);
      loadHoroscope(userSign);
    } else {
      setLoading(false);
    }
  }, []);

  const loadHoroscope = async (zodiacSign: string) => {
    try {
      const res = await apiFetch(`${HOROSCOPE_URL}?action=get&sign=${zodiacSign}&type=general`);
      if (res.ok) {
        const data = await res.json();
        setHoroscope(data);
      }
    } catch (e) {
      console.error('Widget horoscope error', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-3xl border-2 animate-pulse">
        <CardContent className="p-4 h-28" />
      </Card>
    );
  }

  if (!sign) {
    return (
      <Card className="rounded-3xl border-2 overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl">
              ✨
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Астрология</h4>
              <p className="text-xs text-muted-foreground">Укажите знак зодиака в профиле</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs"
              onClick={() => {
                const editBtn = document.querySelector('[data-profile-edit]') as HTMLButtonElement;
                if (editBtn) editBtn.click();
              }}
            >
              Указать
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const signName = ZODIAC_RU[sign] || sign;
  const symbol = ZODIAC_SYMBOLS[sign] || '✨';

  return (
    <Card className="rounded-3xl border-2 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ZodiacIcon sign={sign} size="sm" />
            <div>
              <h4 className="text-white font-semibold text-sm">{signName} — гороскоп на сегодня</h4>
              {horoscope && (
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className={`text-xs ${i < horoscope.rating ? 'text-yellow-300' : 'text-white/30'}`}>★</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl h-8 px-2 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Свернуть' : 'Посмотреть'}
            <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
          </Button>
        </div>
      </div>
      {expanded && horoscope && (
        <CardContent className="p-4">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{horoscope.content}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-base">{symbol}</span>
                Число: <strong className="text-primary">{horoscope.lucky_number}</strong>
              </span>
              <span>
                Цвет: <strong className="text-primary">{horoscope.lucky_color}</strong>
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default HoroscopeWidget;
