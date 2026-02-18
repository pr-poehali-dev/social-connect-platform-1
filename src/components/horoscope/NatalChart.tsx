import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import ZodiacIcon from './ZodiacIcon';

const NATAL_URL = 'https://functions.poehali.dev/5e39412a-49e4-426d-9602-8399dbce57e9';

const PLANET_LABELS: Record<string, string> = {
  sun_sign: 'Солнце',
  moon_sign: 'Луна',
  rising_sign: 'Асцендент',
  mercury_sign: 'Меркурий',
  venus_sign: 'Венера',
  mars_sign: 'Марс',
  jupiter_sign: 'Юпитер',
  saturn_sign: 'Сатурн',
};

const PLANET_ICONS: Record<string, string> = {
  sun_sign: '☉',
  moon_sign: '☽',
  rising_sign: 'ASC',
  mercury_sign: '☿',
  venus_sign: '♀',
  mars_sign: '♂',
  jupiter_sign: '♃',
  saturn_sign: '♄',
};

interface ChartData {
  id: number;
  birth_date: string;
  birth_time: string | null;
  birth_city: string | null;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  mercury_sign: string;
  venus_sign: string;
  mars_sign: string;
  jupiter_sign: string;
  saturn_sign: string;
  ai_interpretation: string | null;
  planet_names: Record<string, string>;
}

const NatalChart = () => {
  const { toast } = useToast();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthCity, setBirthCity] = useState('');

  useEffect(() => {
    loadChart();
  }, []);

  const loadChart = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${NATAL_URL}?action=get`);
      if (res.ok) {
        const data = await res.json();
        if (data.chart) {
          setChart(data.chart);
        } else {
          setShowForm(true);
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.birth_date) setBirthDate(user.birth_date);
          if (user.city) setBirthCity(user.city);
        }
      }
    } catch (e) {
      console.error('Failed to load natal chart', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!birthDate) {
      toast({ title: 'Укажите дату рождения', variant: 'destructive' });
      return;
    }

    setCalculating(true);
    try {
      const res = await apiFetch(`${NATAL_URL}?action=calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_date: birthDate,
          birth_time: birthTime || null,
          birth_city: birthCity || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChart(data.chart);
        setShowForm(false);
        toast({ title: 'Натальная карта составлена!' });
      } else {
        const err = await res.json();
        toast({ title: 'Ошибка', description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось рассчитать карту', variant: 'destructive' });
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-3xl border-2 animate-pulse">
        <CardContent className="p-8 text-center">
          <Icon name="Loader2" size={24} className="mx-auto animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  if (showForm || !chart) {
    return (
      <Card className="rounded-3xl border-2 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-5 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icon name="Compass" size={22} />
            Составить натальную карту
          </h3>
          <p className="text-white/80 text-sm mt-1">
            Заполните данные о вашем рождении для персонального анализа
          </p>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Дата рождения *</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Время рождения</Label>
            <Input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="rounded-xl"
              placeholder="Если известно"
            />
            <p className="text-xs text-muted-foreground">
              Точное время помогает рассчитать Асцендент и положение Луны
            </p>
          </div>

          <div className="space-y-2">
            <Label>Город рождения</Label>
            <Input
              type="text"
              value={birthCity}
              onChange={(e) => setBirthCity(e.target.value)}
              className="rounded-xl"
              placeholder="Например: Москва"
            />
          </div>

          <Button
            onClick={handleCalculate}
            disabled={calculating || !birthDate}
            className="w-full rounded-xl h-12 text-base gap-2"
          >
            {calculating ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                ИИ анализирует звёзды...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={18} />
                Составить натальную карту
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const planets = ['sun_sign', 'moon_sign', 'rising_sign', 'mercury_sign', 'venus_sign', 'mars_sign', 'jupiter_sign', 'saturn_sign'];

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-2 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Ваша натальная карта</h3>
              <p className="text-white/80 text-sm">
                {chart.birth_date} {chart.birth_time ? `• ${chart.birth_time}` : ''} {chart.birth_city ? `• ${chart.birth_city}` : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-xl"
              onClick={() => { setShowForm(true); setChart(null); }}
            >
              <Icon name="RefreshCw" size={16} />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {planets.map((key) => {
              const signValue = chart[key as keyof ChartData] as string;
              const signRu = chart.planet_names?.[signValue] || signValue;
              return (
                <div key={key} className="bg-muted/50 rounded-2xl p-3 text-center">
                  <div className="text-2xl mb-1">{PLANET_ICONS[key]}</div>
                  <div className="text-xs text-muted-foreground mb-1">{PLANET_LABELS[key]}</div>
                  <div className="flex items-center justify-center gap-1">
                    <ZodiacIcon sign={signValue} size="sm" />
                  </div>
                  <div className="text-sm font-medium mt-1">{signRu}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {chart.ai_interpretation && (
        <Card className="rounded-3xl border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Icon name="Brain" size={16} className="text-white" />
              </div>
              <h4 className="font-semibold">Интерпретация от ИИ-астролога</h4>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {chart.ai_interpretation.split('\n').map((paragraph, i) => (
                paragraph.trim() ? <p key={i} className="mb-3 leading-relaxed text-sm">{paragraph}</p> : null
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NatalChart;
