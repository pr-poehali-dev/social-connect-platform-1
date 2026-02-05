import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';

interface PriceSettings {
  premium_month: number;
  premium_3months: number;
  premium_6months: number;
  premium_year: number;
  profile_boost_1day: number;
  profile_boost_3days: number;
  profile_boost_week: number;
  gift_rose: number;
  gift_heart: number;
  gift_kiss: number;
  gift_teddy: number;
  gift_champagne: number;
  gift_diamond: number;
}

const AdminPrices = () => {
  const [prices, setPrices] = useState<PriceSettings>({
    premium_month: 299,
    premium_3months: 699,
    premium_6months: 1199,
    premium_year: 1999,
    profile_boost_1day: 49,
    profile_boost_3days: 99,
    profile_boost_week: 199,
    gift_rose: 29,
    gift_heart: 49,
    gift_kiss: 79,
    gift_teddy: 149,
    gift_champagne: 249,
    gift_diamond: 499
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadPrices();
  }, [navigate]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${ADMIN_API}?action=get_prices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const pricesData = data.prices;
        
        const newPrices: PriceSettings = {
          premium_month: pricesData.premium_month?.price || 299,
          premium_3months: pricesData.premium_3months?.price || 699,
          premium_6months: pricesData.premium_6months?.price || 1199,
          premium_year: pricesData.premium_year?.price || 1999,
          profile_boost_1day: pricesData.profile_boost_1day?.price || 49,
          profile_boost_3days: pricesData.profile_boost_3days?.price || 99,
          profile_boost_week: pricesData.profile_boost_week?.price || 199,
          gift_rose: pricesData.gift_rose?.price || 29,
          gift_heart: pricesData.gift_heart?.price || 49,
          gift_kiss: pricesData.gift_kiss?.price || 79,
          gift_teddy: pricesData.gift_teddy?.price || 149,
          gift_champagne: pricesData.gift_champagne?.price || 249,
          gift_diamond: pricesData.gift_diamond?.price || 499
        };
        
        setPrices(newPrices);
      }
    } catch (error) {
      console.error('Failed to load prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PriceSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    setPrices(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${ADMIN_API}?action=update_prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prices })
      });

      if (response.ok) {
        toast({
          title: 'Цены сохранены',
          description: 'Новые цены успешно применены',
        });
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить цены',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Icon name="ArrowLeft" size={24} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Управление ценами</h1>
              <p className="text-muted-foreground">Настройка цен на все услуги платформы</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="gap-2 rounded-xl"
          >
            <Icon name="Save" size={18} />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Crown" size={24} className="text-yellow-500" />
                Premium подписка
              </CardTitle>
              <CardDescription>
                Цены на Premium-статус для пользователей
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="premium_month">1 месяц (₽)</Label>
                <Input
                  id="premium_month"
                  type="number"
                  value={prices.premium_month}
                  onChange={(e) => handleChange('premium_month', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium_3months">3 месяца (₽)</Label>
                <Input
                  id="premium_3months"
                  type="number"
                  value={prices.premium_3months}
                  onChange={(e) => handleChange('premium_3months', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium_6months">6 месяцев (₽)</Label>
                <Input
                  id="premium_6months"
                  type="number"
                  value={prices.premium_6months}
                  onChange={(e) => handleChange('premium_6months', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium_year">1 год (₽)</Label>
                <Input
                  id="premium_year"
                  type="number"
                  value={prices.premium_year}
                  onChange={(e) => handleChange('premium_year', e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" size={24} className="text-blue-500" />
                Поднятие анкеты
              </CardTitle>
              <CardDescription>
                Цены на продвижение профиля в знакомствах
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile_boost_1day">1 день (₽)</Label>
                <Input
                  id="profile_boost_1day"
                  type="number"
                  value={prices.profile_boost_1day}
                  onChange={(e) => handleChange('profile_boost_1day', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_boost_3days">3 дня (₽)</Label>
                <Input
                  id="profile_boost_3days"
                  type="number"
                  value={prices.profile_boost_3days}
                  onChange={(e) => handleChange('profile_boost_3days', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_boost_week">7 дней (₽)</Label>
                <Input
                  id="profile_boost_week"
                  type="number"
                  value={prices.profile_boost_week}
                  onChange={(e) => handleChange('profile_boost_week', e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Gift" size={24} className="text-pink-500" />
                Подарки
              </CardTitle>
              <CardDescription>
                Цены на виртуальные подарки для пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="gift_rose">🌹 Роза (₽)</Label>
                  <Input
                    id="gift_rose"
                    type="number"
                    value={prices.gift_rose}
                    onChange={(e) => handleChange('gift_rose', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift_heart">❤️ Сердце (₽)</Label>
                  <Input
                    id="gift_heart"
                    type="number"
                    value={prices.gift_heart}
                    onChange={(e) => handleChange('gift_heart', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift_kiss">💋 Поцелуй (₽)</Label>
                  <Input
                    id="gift_kiss"
                    type="number"
                    value={prices.gift_kiss}
                    onChange={(e) => handleChange('gift_kiss', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift_teddy">🧸 Мишка (₽)</Label>
                  <Input
                    id="gift_teddy"
                    type="number"
                    value={prices.gift_teddy}
                    onChange={(e) => handleChange('gift_teddy', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift_champagne">🍾 Шампанское (₽)</Label>
                  <Input
                    id="gift_champagne"
                    type="number"
                    value={prices.gift_champagne}
                    onChange={(e) => handleChange('gift_champagne', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gift_diamond">💎 Бриллиант (₽)</Label>
                  <Input
                    id="gift_diamond"
                    type="number"
                    value={prices.gift_diamond}
                    onChange={(e) => handleChange('gift_diamond', e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-3xl border-2 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={24} className="text-blue-500" />
              Информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Все цены указываются в рублях (₽)</p>
            <p>• Изменения вступают в силу сразу после сохранения</p>
            <p>• Старые подписки и услуги сохраняют свою цену покупки</p>
            <p>• Рекомендуется устанавливать цены с учётом комиссии платёжных систем</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPrices;